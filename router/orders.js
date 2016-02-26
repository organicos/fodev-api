"use strict";

var Orders = require('./../models/Orders.js');
var Baskets = require('./../models/Baskets.js');

var payment_status_map = {
    0: 'Pagamento pendente',
    1: 'Pago',
    2: 'Entregue',
    3: 'Cancelado',
    4: 'Problemas com o pagamento.',
    5: 'Inválido.'
};

module.exports=function(app, mongoose, moment, utils, config, https) {
    
    app.get('/v1/orders', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
            
        var filter = {};
        
        if(req.user.kind != 'admin') filter['customer._id'] = req.user._id;

        Orders
        .find(filter)
        .sort({updated: 1})
        .populate('customer')
        .exec(function(err, orders) {
                
            if (err) {
                    res.send(err);       
            }

            res.json(orders);

        });

    });
    
    app.get('/v1/order/:order_id', utils.ensureAuthorized, function(req, res) {

            Orders
            .findOne({_id: req.params.order_id})
            .populate('discounts')
            .populate('basket')
            .populate('status')
            .populate('customer')
            .populate('shipping.address.city')
            .exec(function(err, order) {

                    if (err) {
                        
                        res.send(err);
                        
                    } else {
                        
                        order.shipping.address.city.populate('state', function(err, state){
                           
                           if(err){
                               
                               res.send(err);
                               
                           } else {
                               
                               order.shipping.address.city.state.populate('country', function(err, country){
                                  
                                  if(err){
                                      
                                      res.send(err);
                                      
                                  } else {
                                      
                                      res.json(order);
                                      
                                  }
                                   
                               });
                               
                           }
                            
                        });
                        
                    }

            });

    });

    app.post('/v1/order', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var responseData = {
            errors:[]
            , data: {}
        };
        
        // instantiate the basket object
        var newBasket = new Baskets(req.body.order.basket);
        
        // define the basket customer
        newBasket.customer = req.user;
        
        // save the basket object
        newBasket.save(function(err, basket){
           
            if (err){
                res.statusCode = 400;
                responseData.errors = err;
                res.send(responseData);
            } else {

                req.body.order.basket = basket;
                
                var PostedOrder = new Orders(req.body.order);
                
                // define the order customer
                PostedOrder.customer = req.user;

                // save the new order
                PostedOrder.save(function(err, order){
        
                    if (err){
                        res.statusCode = 400;
                        responseData = err;
                    } else {
                        responseData = order;
                    }
        
                    return res.send(responseData);
                    
                });

            }

        });

    });
    
    app.put('/v1/order/:order_id', utils.ensureAdmin, function(req, res){

        return Orders.findById(req.params.order_id, function(err, order) {
                
            if (err) {
                    
                res.statusCode = 400;

                return res.send(err);
                    
            } else {
                
                var statusChanged = order.status != req.body.status;
                    
                order.discounts = req.body.discounts;
                order.customer = req.body.customer;
                order.basket = req.body.basket;
                order.address = req.body.address;
                order.refound = req.body.refound;
                order.shipping = req.body.shipping;
                order.payment = req.body.payment;
                order.status = req.body.status;
                order.updated = req.body.updated;
                
                
                // check if the order status is going to be updated to 2: DELIVERED
                if(order.status == 2){

                    if(order.refound.option == 'discount'){

                        if(!order.refound.discount){

                            order.refound.value = calculateRefoundValue(order);

                            order.refound.discount = createNewDiscount(order, function(newDiscount){

                                order.refound.discount = newDiscount;

                                return _PutOrder(order, statusChanged, res);

                            });

                        }
                    }


                } else {

                    return _PutOrder(order, statusChanged, res);

                }
                    
            }

        });

    });

    app.delete('/v1/order/:order_id', utils.ensureAdmin, function(req, res) {

        return Orders.findById(req.params.order_id, function(err, order) {
                
                if (err) {
                        
                        res.statusCode = 400;

                        return res.send(err);
                        
                } else {
                        
                        order.active = false;
                        
                        return order.save(function(err, updatedProduct) {

                                if (err) {
                                        
                                        res.statusCode = 400;

                                        return res.send(err);

                                } else {
                                        
                                        return res.send(updatedProduct);
                                        
                                }

                        });
                        
                }

        });

    });
    
    app.get('/v1/check_pagseguro_payment/:reference', function(req, res) {
       
       var reference = req.params.reference;
       
       if(reference){
           
             Orders.findOne({ _id: reference }, function (err, order){
                 
                if (err) {
                        
                    res.statusCode = 400;

                    return res.send(err);
                        
                } else {
                    
                    if(order){
                        
                        var request = require('request');

                        var initialDate = moment(order.updated).subtract(5, 'minutes').format("YYYY-MM-DDTHH:mm"); // 2015-04-07T14:55
                        var finalDate = moment(order.updated).add(30, 'days') > moment() ? moment().subtract(5, 'minutes').format("YYYY-MM-DDTHH:mm") : moment(order.updated).add(30, 'days').format("YYYY-MM-DDTHH:mm"); // 2015-04-07T14:55
                        
                        var params = {
                            initialDate: initialDate,
                            finalDate: finalDate,
                            page: 1,
                            maxPageResults: 100,
                            email: config.pagseguro.email,
                            token: config.pagseguro.token,
                            reference: reference
                        };
                        
                        request.get({
                            url:config.pagseguro.host+'/v3/transactions',
                            qs : params,
                            headers: {'Content-Type' : 'application/json; charset=utf-8'}
                        }, function(err,httpResponse,body){

                            if(err){
                                
                                res.statusCode = 400;
            
                                return res.send(err);
            
                            } else {

                                var xml2js = require('xml2js');
                                var parser = new xml2js.Parser();
                                parser.parseString(body, function (err, result) {
                                    
                                    if (err) {
                                            
                                        res.statusCode = 400;
    
                                        return res.send(err);
    
                                    } else {
                                        
                                        var transactions = result.transactionSearchResult.transactions ? result.transactionSearchResult.transactions[0].transaction : null;
                                        
                                        var oldStatus = order.status;
                                        
                                        var newStatus = oldStatus;
                                        
                                        order.pagseguro = { checkout: order.pagseguro.checkout };
                                        
                                        if (transactions) {
                                            
                                            order.pagseguro.transactions = transactions;
                                            
                                            newStatus = getOrderStatusFromTransactions(transactions);
                                            
                                            order.status = newStatus;
                                            
                                            if(newStatus == 1 && oldStatus != 1 && oldStatus != 2){
                                                
                                                order.payment_date = Date.now();
                                                
                                            }
                                            
                                        }

                                        order.save(function(err, updatedOrder) {

                                            if (err) {

                                                res.statusCode = 400;

                                                return res.send(err);

                                            } else {
                                                
                                                if(order.status == 1 && oldStatus != 1 && oldStatus != 2) send_paid_email(updatedOrder);

                                                updatedOrder.total = updatedOrder.total.toFixed(2);

                                                updatedOrder.shipping.price = updatedOrder.shipping.price.toFixed(2);

                                                res.json(updatedOrder);

                                            }
                
                                        });
                                            
                                    }
                                        
                                });
                                
                            }
                            
                        });
                        
                    } else {
                        
                        res.statusCode = 400;
                       
                        res.send({errors: {
                            city: {message: 'Pedido não encontrado.'}
                        }});
                        
                    }
                        
                }

            });

       } else {
       
            res.statusCode = 400;
           
            res.send({errors: {
                city: {message: 'Informe o código do pedido.'}
            }});
           
       }
       
        
    });
    
    app.post('/v1/notificacao_pagseguro', function(req, res) {

        var request = require('request');   
        
        request.get({
            url:config.pagseguro.host+'/v2/transactions/notifications/'+req.body.notificationCode,
            qs : {
                email: config.pagseguro.email,
                token: config.pagseguro.token
            },
            headers: {'Content-Type' : 'application/json; charset=utf-8'}
            }, function(err,httpResponse,body){
                
                if(err){
                    
                    res.statusCode = 400;

                    return res.send(err);

                } else {
                    
                    var xml2js = require('xml2js');
                    var parser = new xml2js.Parser();
                    parser.parseString(body, function (err, result) {
                        
                        if (err) {
                                
                            res.statusCode = 400;

                            return res.send(err);

                        } else {
                                        
                            var reference = result.transaction.reference[0];
                            
                            Orders.findOne({ _id: reference }, function (err, order){
                                
                                if (err) {
                                        
                                    res.statusCode = 400;
        
                                    return res.send(err);
        
                                } else {
                                    
                                    var oldStatus = order.status;
                                    
                                    var newStatus = getOrderStatusFromTransactions([result.transaction]); 
                                    
                                    order.pagseguro.transactions.push(result.transaction);
                                    
                                    if( oldStatus != newStatus && oldStatus != 1 && oldStatus != 2 ){
                                        
                                        order.status = newStatus;
                                        
                                    }
                                    
                                    if(order.status == 1){
                                        
                                        order.payment_date = Date.now();
                                        
                                    }
                                    
                                    order.save(function(err, updatedOrder) {
                                        
                                        if (err) {
                                                
                                            res.statusCode = 400;
               
                                        } else {
                                            
                                            if(updatedOrder.status == 1 && oldStatus != 1 && oldStatus != 2){
                                                send_paid_email(updatedOrder);
                                            }
                                                
                                            res.json(true);
                                                
                                        }
            
                                    });
                                    
                                }
                                
                            });
                            
                        }

                    });
                    
                }
                
            }
            
        );
    });

};