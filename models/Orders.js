var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Baskets = require('./../models/Baskets.js');
var Cities = require('./../models/Cities.js');
var Packings = require('./../models/Packings.js');
var Addresses = require('./../models/Addresses.js');
var OrderSteps = require('./../models/OrderSteps.js');
var Discounts = require('./../models/Discounts.js');
var AppConfig = require('./../config/env_config');

// Constants

var minimumOrderTotal = 35;

// Class Schema
var OrdersSchema = new Schema({
    discounts : [
        { type : Schema.Types.ObjectId, ref: 'Discounts'
            , validate: {
                validator: discountsValidation,
                message: 'Desconto já utilizado!'
            }
        }],
    discountsTotal: Number,
    customer : { type : Schema.Types.ObjectId, ref: 'Users', required: "Não conseguimos identificar o dono desta cesta."},
    basket : { type : Schema.Types.ObjectId, ref: 'Baskets', required: "Não foram adicionados produtos nessa cesta até o momento."},
    refound : { 
        type : { type : String, required: "Informe a forma de reembolso."},
        value : { type : Number },
        discount : { type : Schema.Types.ObjectId, ref: 'Discounts'}
    },
    total : { type : Number, default: 0, min: [minimumOrderTotal, 'O valor total do pedido deve ser maior que R$' + minimumOrderTotal.toFixed(2)], required: "Informe o total do pedido."},
    shipping : {
        packing: { type : Packings.schema, required: 'Informe o tipo de embalagem' },
        date: { type: Date, required: 'Informe a data de entrega!' },
        address : { type : Addresses.schema, required: 'Informe o endereço' },
    },
    pagseguro: { type: {
        checkout: { type: {
            code: { type : String, required: 'Informe o código do checkout' },
            date: { type : String, required: 'Informe a data do checkout' },
        }, required: true},
        transactions: { type: Array, required: false }
    }, required: true},
    payment : { type : Schema.Types.ObjectId, ref: 'Payments'},
    step : { type : Schema.Types.ObjectId, ref: 'OrderSteps', required: "Informe o step do pedido."},
    updated: { type: Date, default: Date.now }
});

// Class Model
var Orders = mongoose.model('Orders', OrdersSchema);

// Public Methods
OrdersSchema.statics._PutOrder = function(order, stepChanged, res) {

    return order.save(function(err, updatedOrder) {

            if (err) {
                    
                res.stepCode = 400;

                return err;

            } else {
                
                if(stepChanged){
                    
                    switch (updatedOrder.step) {
                        case 1: // pago
                            sendNewStatusMail(updatedOrder, 'orders/paid');
                            break;
                        case 2: // entregue
                            sendNewStatusMail(updatedOrder, 'orders/delivered');
                            break;         
                        case 3: // cancelado
                            sendNewStatusMail(updatedOrder, 'orders/canceled');
                            break;                                                 
                        case 4: // aguardando pagamento
                            sendNewStatusMail(updatedOrder, 'orders/awaiting');
                            break;
                    }
                    
                }
                    
                return res.send(updatedOrder);
                    
            }
            
    });
};

// Private Methods
function discountsValidation(discount){
    
    return !discount.used;

}

var calculateTotals = function(order, callback){
    
    calculateDiscountsTotal(order);
    calculateRefoundValue(order);
    calculateOrderTotal(order);
    
    callback(order);
    
};
var calculateDiscountsTotal = function(order){
    
    order.discountsTotal = 0;
    
    var arrayLength = order.discounts ? order.discounts.length : 0;
    
    if(arrayLength){
        
        var getDiscountsValues = function(pointer){
            
            Discounts.findOne({_id:order.discounts[pointer]})
            .exec(function(err, discount){
                
                if(err){
                    
                    console.log('erro ao carregar desconto: ' + order.discounts[pointer].id);
    
                } else {
                    
                    order.discountsTotal += discount.value;
                    
                }
        
                if(arrayLength > pointer){
                    pointer++;
                    getDiscountsValues(pointer);
                }
        
            });
            
        };
        
        getDiscountsValues(0);

    }
        
    return order.discountsTotal;
  
};
var calculateRefoundValue = function(order){

        order.refound.value = 0;

        var arrayLength = order.basket.products.length;

        for (var i = 0; i < arrayLength; i++) {
            
            var product = order.basket.products[i];
            
            if(product.unavaiable){
            
                order.refound.value += product.prices[0].price * product.quantity;
            
            }

        };

        return order.refound.value;

    };
var calculateOrderTotal = function(order){
    
      order.total = 0;

      // products total
      order.total += order.basket.total;
      
      // shiping price
      order.total += order.shipping.address ? order.shipping.address.city.shipping_price : 0;
      
      // packing price
      order.total += order.shipping.packing ? order.shipping.packing.price : 0;
  
      // discunts
      order.total -= order.discountsTotal;
      
      return order.total;

};
var validateOrder = function(order, callback){

    // CHECK STATUS
    checkStatus(order, function(order){
        
        // CALCULATE TOTALS
        calculateTotals(order, function(order){
            
            checkPaymentOptions(order, function(order){

                // RUN THE CALLBACK
                callback(order);
                
            });
            
        });
        
    });

};
var sendNewStatusMail = function(order, template){

    utils.sendMail({
        template: template
        , data: order
        , subject: 'Pedido ' + order._id
        , receivers: order.customer.email
        , copyAdmins: true
    });
    
};
var createPaymentOrder = function(order, callback) {
    order.populate('shipping.address.city', function(err, order){
        order.shipping.address.city.populate('state', function(err, state){
            order.shipping.address.city.state.populate('country', function(err, country){
                var data = {
                    email: AppConfig.pagseguro.email,
                    token: AppConfig.pagseguro.token,
                    currency: 'BRL',
                    reference: order._id.toString(),
                    senderName: order.customer.name ? order.customer.name + ' --' : order.customer.email + ' --',
                    //senderPhone: order.customer.phone,  --- need to separate area code from phone number.
                    senderEmail: order.customer.email,
                    shippingType: 3,
                    shippingAddressStreet: order.shipping.address.street,
                    shippingAddressNumber: order.shipping.address.number,
                    shippingAddressComplement: order.shipping.address.complement,
                    shippingAddressDistrict: order.shipping.address.district,
                    shippingAddressPostalCode: order.shipping.address.cep,
                    shippingAddressCity: order.shipping.address.city.name,
                    shippingAddressState: order.shipping.address.city.state.code,
                    shippingAddressCountry: order.shipping.address.city.state.country.code
                };
                var arrayLength = order.basket.products.length;
                for (var i = 0; i < arrayLength; i++) {
                    var product = order.basket.products[i];
                    data['itemId'+ (i+1)] = product._id.toString();
                    data['itemDescription'+ (i+1)] = product.name;
                    data['itemAmount'+ (i+1)] = product.prices[0].price.toFixed(2);
                    data['itemQuantity'+ (i+1)] = product.quantity;
                    data['itemWeight'+ (i+1)] = product.weight || 1;
                };
                data['itemId'+ (arrayLength+1)] = 'Frete';
                data['itemDescription'+ (arrayLength+1)] = 'Frete: ' + order.shipping.address.city.name;
                data['itemAmount'+ (arrayLength+1)] = isNaN(order.shipping.address.city.shipping_price) ? (0).toFixed(2) : order.shipping.address.city.shipping_price.toFixed(2);
                data['itemQuantity'+ (arrayLength+1)] = 1;
                data['itemWeight'+ (arrayLength+1)] = 1;
                var request = require('request');   
                request.post({
                        url:AppConfig.pagseguro.host+'/v2/checkout',
                        form: data,
                        headers: {
                            'Content-Type': 'application/json; charset=ISO-8859-1'
                        }
                    }, function(err,httpResponse,body){
                        if(err){
                            
                            
                            
                        } else {
                            var xml2js = require('xml2js');
                            var parser = new xml2js.Parser();
                            parser.parseString(body, function (err, result) {
                                order.pagseguro = {
                                    checkout : {
                                        code: result.checkout.code[0]
                                        , date: result.checkout.date[0]
                                    }
                                };
                                callback(order);
                            });
                        }
                    }
                );
            });
        });
    });
    
};
var checkPaymentOptions = function(order, callback){

    if(!order.pagseguro){

        createPaymentOrder(order, callback);
        
    }
    
};
var checkStatus = function(order, callback){
    
    if(order.step){

        callback(order);

    } else {
        
        OrderSteps.findOne()
        .exec(function(err, step){
            if(err){
                
            } else {
                
                order.step = step;
                
                callback(order);
                
            }
    
        });

        

        
    } 
        

};
var markDiscountsAsUsed = function(order){
  
    for (var i = 0, len = order.discounts.length; i < len; i++) {
        
        Discounts.findOne({_id:order.discounts[i]._id})
        .exec(function(err, discount){
            if(err){
                
                console.log('erro ao carregar desconto: ' + order.discounts[i]._id);

            } else {
                
                discount.used = new Date();
                discount.used_by = order._id;
                discount.save();
                
            }
    
        });

    }
  
};
var generateDiscount = function(order){
  
    
    var validFrom = new Date();
    var validTo = (validFrom + 0).setYear(validFrom.getYear()+1);

    var discount = new Discounts();
    discount.customer = order.customer._id;
    discount.order = order._id;
    discount.value = order.refound.value;
    discount.value_kind = 'absolute';
    discount.desc  = 'Reembolso por falta de produto.';
    discount.validFrom = validFrom;
    discount.validTo = validTo;

    discount.save(function(err, discount){

        if(err){
            
            console.log('erro ao gerar desconto para a ordem: ' + order._id);

        } else {

            order.refound.discount = discount;
            
            order.save();
            
        }

    });

};


// Middleware - Runs when functions like save and update are called
// Middleware => Validate - Validates the order before run the save proccess
OrdersSchema.pre("validate", function(next) {
    
    var PostedOrder = this;

    validateOrder(PostedOrder, function(ValidatedOrder){

        var errors = [];
        var messages = [];

        // search the basket for missing products
        if(ValidatedOrder.basket.inactiveProducts && ValidatedOrder.basket.inactiveProducts.length > 0){

            next(new Error('Infelizmente alguns produtos da sua cesta não estão mais disnponíveis. Por favor, verifique novamente seus produtos.'));
            
        } else {
        
            next();
        
        }    

    });
    
});

OrdersSchema.post('save', function() {
    
    var SavedOrder = this;
    
    // after save, we need to check the step 
    switch (SavedOrder.step.step) { 
        case 0: // case the step is 0: NEW and is there any discount, we need to mark the discounts as used
            
            if(SavedOrder.discounts && SavedOrder.discounts.length > 0){
              
                markDiscountsAsUsed(SavedOrder);
              
            }
            
            break;
        
        case 2: // case step is 2: DELIVERED, we need to check if there is any missing product and generate the discount
            
            // if there is any refound to be applied
            if(order.refound.value > 0){
                
                if(order.refound.type == 'discount' && order.refound.discount){

                    generateDiscount(order);

                }
                
            }
            
            break;
    }

});

module.exports = Orders;