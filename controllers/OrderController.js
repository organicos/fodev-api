"use strict"

var Baskets = require('./../models/Baskets.js');

var BasketController = function() {

    var self = this;
    
    self.validateOrder = function(order, callback){

        // REMOVE UNNECESSARY FIELDS
        self.checkFields(order, function(order){
            
            // VALIDATE THE BASKET
            Baskets.validateBasket(order.basket, function(basket){
                
                // UPDATE THE ORDER BASKET WITH THE VALIDATED BASKET
                order.basket = basket;
                
                // UPDATE THE ORDER SHIPPING CITY WITH ITS LAST VERSION
                self.updateCity(order, function(order) {
        
                    // UPDATE THE PACKING WITH ITS LAST VERSION
                    self.updatePacking(order, function(order) {
            
                        // UPDATE THE DISCOUNTS WITH ITS LAST VERSION
                        self.updateDiscounts(order, function(order) {
                            
                            // REMOVE INACTIVE PRODUCTS
                            self.removeUsedDiscounts(order, function(order){
                                
                                // CALCULATE TOTALS
                                self.calculateTotals(order, function(order){
                                    
                                    // RUN THE CALLBACK
                                    callback(order);                                        
                                    
                                });
                                
                            });

                        });
            
                    });
        
                });                    
                
            });
            
        });

    };
    self.checkFields = function(order, callback){
        
        var validOrder = {};
        
        // data 
        validOrder.discounts = order.discounts || [];
        validOrder.basket = order.basket;
        validOrder.refound = order.refound;
        validOrder.shipping = order.shipping;
        validOrder.payment = order.payment;
        validOrder.status = order.status;
        validOrder.updated = order.updated;
        
        callback(validOrder);
        
    };
    self.removeUsedDiscounts = function(order, callback){
        
        var numberOfDiscounts = order.discounts.length;
        var unusedDiscounts = [];
        var usedDiscounts = [];
            
        for (var i = 0; i < numberOfDiscounts; i++) {

            var discount = order.discounts[i];

            if(discount.used) {
    
                usedDiscounts.push(discount);
                
            } else {
                
                unusedDiscounts.push(discount);
                
            }
        
        }
        
        order.discounts = unusedDiscounts;
        
        order.used_discounts = usedDiscounts;
        
        callback(order);
        
    };
    self.updateDiscounts = function (order, callback) {

        var validDiscounts = [];
        
        var numberOfDiscounts = order.discounts.length;
        
        var iterateOverDiscounts = function(index){
            
            if (index == numberOfDiscounts) {
                
                order.discounts = validDiscounts;
    
                callback(order);
                
            } else {
                
                var discount = order.discounts[index];
    
                if(discount._id){
                    
                    Discounts
                    .findOne({_id: discount._id})
                    .exec(function(err, validDiscount) {
                        
                        if (!err && validDiscount._id) {

                            validDiscounts.push(validDiscount);
                                    
                        }
                        
                        iterateOverDiscounts(index+1);
                        
                    });
                    
                }                
                
            }
            
        };
        
        iterateOverDiscounts(0);


    };
    self.updateCity = function (order, callback) {

        if(order.shipping.address.city){
            
            if(order.shipping.address.city._id){

                Cities
                .findOne({_id: order.shipping.address.city._id})
                .populate(['state', 'country'])
                .exec(function(err, validCity) {
                    
                    if (!err && validCity._id) {
    
                        order.shipping.address.city = validCity;
    
                    } else {
                        
                        delete order.shipping.address.city;
                        
                    }
                
                    callback(order);
                        
                });
                
            } else {
                
                delete order.shipping.address.city;
                
                callback(order);
                
            }
            
        } else {
            
            callback(order);
            
        }

    };
    self.updatePacking = function (order, callback) {

        var packing = order.shipping.packing;

        if(packing){
            
            if(packing._id){

                Packings
                .findOne({_id: packing._id})
                .exec(function(err, validPacking) {
                    
                    if (!err && validPacking._id) {
    
                        order.shipping.packing = validPacking;
    
                    } else {
                        
                        delete order.shipping.packing;
                        
                    }
                
                    callback(order);
                        
                });
                
            } else {
                
                delete order.shipping.packing;
                
                callback(order);
                
            }
            
        } else {
            
            callback(order);
            
        }

    };
    self.calculateTotals = function(order, callback){
        
        self.calculateDiscountsTotal(order);
        self.calculateRefoundValue(order);
        self.calculateOrderTotal(order);
        
        callback(order);
        
    };
    self.calculateOrderTotal = function(order){
        
        order.total = 0;
        order.total += order.basket.productsPrice;
        order.total += order.shipping.address.city ? order.shipping.address.city.shipping_price : 0;
        order.total += order.shipping.packing ? order.shipping.packing.price : 0;
        order.total -= order.discountsTotal;
        order.total -= order.refoundValue;

    };
    self.calculateDiscountsTotal = function(order){
        
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
    self.calculateRefoundValue = function(order){

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
    self._PutOrder = function(order, statusChanged, res) {

        return order.save(function(err, updatedOrder) {

                if (err) {
                        
                    res.statusCode = 400;

                    return res.send(err);

                } else {
                    
                    if(statusChanged){
                        
                        switch (updatedOrder.status) {
                            case 1: // pago
                                self.send_paid_email(updatedOrder);
                                break;
                            case 2: // entregue
                                self.send_delivered_email(updatedOrder);
                                break;         
                            case 3: // cancelado
                                self.send_canceled_email(updatedOrder);
                                break;                                                 
                            case 4: // aguardando pagamento
                                self.send_awaiting_email(updatedOrder);
                                break;
                        }
                        
                    }
                        
                    return res.send(updatedOrder);
                        
                }

        });
    };
    self.createNewDiscount = function(order, callback){

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
    self.createPaymentOrder = function(order, callback) {
        
        var data = {
            email: config.pagseguro.email,
            token: config.pagseguro.token,
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
            shippingAddressCountry: order.shipping.address.city.state.country.name
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
                url:config.pagseguro.host+'/v2/checkout',
                form: data,
                headers: {
                    'Content-Type': 'application/json; charset=ISO-8859-1'
                }
            }, function(err,httpResponse,body){
    
                if(err){
    
                    callback(err);
    
                } else {
                    
                    var xml2js = require('xml2js');
                    var parser = new xml2js.Parser();
                    parser.parseString(body, function (err, result) {
                        
                        var checkout = {
                            code: result.checkout.code[0]
                            , date: result.checkout.date[0]
                        };
                        
                        order.pagseguroCheckout = checkout;
                        
                        callback(null);
    
                    });
                    
                }
                
            }
            
        );
        
    };
    self.getOrderStatusFromTransactions = function(transactions){

        var arrayLength = transactions.length;

        for (var i = 0; i < arrayLength; i++) {
            
            var transactionStatus = transactions[i].status[0];
            
            var paidStatusesRefer = ['3', '4'];
            
            if (paidStatusesRefer.indexOf(transactionStatus) > -1) return 1;

        };

        return 0;
        
    };
    self.send_new_order_email = function(order){
        
        utils.sendMail({
            template: 'orders/new'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });
        
    };
    self.send_paid_email = function(order){
        
        utils.sendMail({
            template: 'orders/paid'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });
        
    };
    self.send_delivered_email = function(order){
        
        utils.sendMail({
            template: 'orders/delivered'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });

    };
    self.send_awaiting_email = function(order){
        
        utils.sendMail({
            template: 'orders/awaiting'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });

    };
    self.send_canceled_email = function(order){
        
        utils.sendMail({
            template: 'orders/canceled'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });

    };
    
};

module.exports = new BasketController();