var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Baskets = require('./../models/Baskets.js');
var Cities = require('./../models/Cities.js');
var Packings = require('./../models/Packings.js');
var Addresses = require('./../models/Addresses.js');
var Statuses = require('./../models/Statuses.js');
var Discounts = require('./../models/Discounts.js');
var AppConfig = require('./../config/env_config');

// Constants
var payment_status_map = {
    0: 'Pagamento pendente',
    1: 'Pago',
    2: 'Entregue',
    3: 'Cancelado',
    4: 'Problemas com o pagamento.',
    5: 'Inválido.'
};
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
    customer : { type : Schema.Types.ObjectId, ref: 'Users', required: "Não conseguimos identificar o dono desta cesta."},
    basket : { type : Schema.Types.ObjectId, ref: 'Baskets', required: "Não foram adicionados produtos nessa cesta até o momento."},
    refound_type : { type : String, default: "discount"},
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
    status : { type : Schema.Types.ObjectId, ref: 'Statuses', required: "Informe o status do pedido."},
    updated: { type: Date, default: Date.now }
});

// Class Model
var Orders = mongoose.model('Orders', OrdersSchema);

// Public Methods
OrdersSchema.statics._PutOrder = function(order, statusChanged, res) {

    return order.save(function(err, updatedOrder) {

            if (err) {
                    
                res.statusCode = 400;

                return res.send(err);

            } else {
                
                if(statusChanged){
                    
                    switch (updatedOrder.status) {
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
OrdersSchema.statics.createNewDiscount = function(order, callback){

    var discount = {
        customer: order.customer,
        value: order.refound.value,
        desc: 'Reembolso por falta de produto',
        order: order,
        startDate: moment(),
        endDate: moment().add(1, 'year')

    };

    Discounts.create(discount, function(err, newDiscount) {

        callback(newDiscount);

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
    
    if(order.discounts && order.discounts.length){
        
        var arrayLength = order.discounts.length;
        
        for (var i = 0; i < arrayLength; i++) {

            var discount = order.discounts[i];

            order.discountsTotal += discount.value;

        };
        
    }
        
    return order.discountsTotal;    
        
      var paidStatusesRefer = ['3', '4'];
        
        order.discountsTotal = 0;
        
        if(order.discounts && order.discounts.length){
            
            var arrayLength = order.discounts.length;
            
            for (var i = 0; i < arrayLength; i++) {
    
                var discount = order.discounts[i];
    
                order.discountsTotal += discount.value;

            };
            
        }
            
        return order.discountsTotal;
  
};
var calculateRefoundValue = function(order){

        order.refoundValue = 0;

        var arrayLength = order.basket.products.length;

        for (var i = 0; i < arrayLength; i++) {
            
            var product = order.basket.products[i];
            
            if(product.unavaiable){
            
                order.refoundValue += product.prices[0].price * product.quantity;
            
            }

        };

        return order.refoundValue;

    };
var calculateOrderTotal = function(order){
    
    order.total = 0;
    order.total += order.basket.total;
    order.total += order.shipping.address ? order.shipping.address.city.shipping_price : 0;
    order.total += order.shipping.packing ? order.shipping.packing.price : 0;
    order.total -= order.discountsTotal;
    order.total -= order.refoundValue;

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
    
    if(order.status){

        callback(order);

    } else {
        
        Statuses.findOne()
        .exec(function(err, status){
            if(err){
                
            } else {
                
                order.status = status;
                
                callback(order);
                
            }
    
        });

        

        
    } 
        

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

            res.statusCode = 400;
            
            next(new Error('Infelizmente alguns produtos da sua cesta não estão mais disnponíveis. Por favor, verifique novamente seus produtos.'));
            
        } else {
        
            next();
        
        }    

    });
    
});

module.exports = Orders;