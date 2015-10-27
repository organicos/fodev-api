"use strict";

module.exports=function(app, mongoose, moment, utils, config, https) {

    var Products = require('./../modules/Products.js');
    
    var Orders = require('./../modules/Orders.js');

    var Discounts = require('./../modules/Discounts.js');

    var payment_status_map = {
        0: 'Pagamento pendente',
        1: 'Pago',
        2: 'Entregue',
        3: 'Cancelado',
        4: 'Problemas com o pagamento.',
        5: 'Inválido.'
    };
    
    var validCities = [
        'Florianópolis',
        'Palhoça',
        'São José'
    ];

    app.get('/v1/orders', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
            
        var filter = {active: 1};
        
        if(req.user.kind != 'admin') filter['customer._id'] = req.user._id;
            
        Orders.find(filter, null, {sort: {updated: 1}}, function(err, products) {

            if (err) {
                    res.send(err);       
            }

            res.json(products);

        });

    });
    
    var validateOrder = function(basket, validationCallback){
        
        var newBasket = {
            name: basket.name || 'Nova cesta',
            total: 0,
            products: [],
            shipping: basket.shipping,
            inactive_products: []
        };

        if(newBasket.shipping) {
            newBasket.shipping.country = 'Brasil';
        } else {
            newBasket.shipping = {
                country: 'Brasil'
            }
        }

        var iterateElements = function (elements, index, callback) 
        {
            if (index == elements.length) {

                return callback(newBasket);
                
            } else {

                var product = elements[index];

                if(product._id){
                    
                    Products
                    .findOne({_id: product._id, active: true})
                    .populate(['prices'])
                    .exec(function(err, productNow) {
                        
                        if (err) {
                                
                            newBasket.inactive_products.push(product);
                                
                        } else {

                            if(productNow) {
                                
                                product.prices[0].price = productNow.prices[0].price;
                                product.dscr = productNow.dscr;
                                product.name = productNow.name;
                                newBasket.products.push(product);
                                newBasket.total += Number(product.prices[0].price * product.quantity);
                                
                            } else {
                                
                                newBasket.inactive_products.push(product);
                                
                            }

                        }
                        
                        iterateElements(elements, index+1, callback);
                        
                    });
                    
                }

            }

        }
        
        iterateElements(basket.products, 0, function(newBasket) {

            validationCallback(newBasket);

        });
        
        return this;
    }

    app.post('/v1/order_review', utils.ensureAuthorized, function(req, res) {
        // verifica se existe produtos na cesta
        if(req.body.basket.products && req.body.basket.products.length > 0){
            
            validateOrder(req.body.basket, function(basket){
                
                basket.total.toFixed(2);

                if(basket.inactive_products.length > 0){
                    
                    res.statusCode = 400;
                    res.send(basket);
                    
                } else {
                    
                    res.send(basket);
                    
                }
            });
 
            // atualiza o preço dos produtos
            
        } else {
            res.statusCode = 400;
            res.send({errors: {
                'Products' : {
                    message: "A cesta está vazia."
                }
            }});
        }
        
    });


    app.get('/v1/order/:order_id', utils.ensureAuthorized, function(req, res) {

            Orders
            .findOne({_id: req.params.order_id})
            .populate(['refound.discount'])
            .exec(function(err, order) {

                    if (err) {
                        
                        res.send(err);
                        
                    } else {
                        
                        res.json(order);
                        
                    }

            });

    });
        
    app.post('/v1/order', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        if(req.body.basket.total >= 35){
            // verifica se existe produtos na cesta
            if(req.body.basket.products && req.body.basket.products.length > 0){
                
                validateOrder(req.body.basket, function(basket){
                    
                    var invalidCity = (validCities.indexOf(req.body.basket.shipping.city) == -1);
                    
                    if(basket.inactive_products.length > 0){
                        
                        res.statusCode = 400;
                        res.send(basket);
                        
                    } else {
                        
                        var customer = {
                            __v: req.user.__v, //utils.getRequestUser
                            _id: req.user._id, // utils.getRequestUser
                            email: req.user.email, // utils.getRequestUser
                            name: req.user.name // utils.getRequestUser
                        }
                        
                        var order = {
        
                            name : basket.name,
                            customer: customer,
                            total:  basket.total.toFixed(2),
                            products:  basket.products,
                            shipping:  basket.shipping,
                            status: invalidCity ? 5 : 0
                            
                        };
                        
                        Orders.create(order, function(err, order) {
        
                                if (err){
                                        
                                        res.statusCode = 400;
                                        
                                        res.send(err);
                                        
                                } else {
                                    
                                    if(invalidCity){
                        
                                        res.statusCode = 400;
                                        
                                        res.send({errors: {
                                            city: {message: 'Atualmente entregamos apenas no município de Florianópolis. Seu interesse foi registrado e assim que nosso atendimento chegar em sua cidade entraremos em contato. Se você puder receber sua cesta em Florianópolis, basta alterar os dados de entrega e finalizar o pedido novamente.'}
                                        }});
                        
                                    } else {
                                        
                                        createPaymentOrder(order, function(err, checkout){
                                            
                                            if(err){
                                                
                                                res.statusCode = 400;
                                                
                                                res.send({errors: {
                                                    city: {message: 'Tivemos alguns problemas em gerar sua ordem de pagamento. Nossa equipe irá verificar o motivo e entrará em contato com você em breve. Pedimos desculpas pelo inconveniente.'}
                                                }});
                                                
                                            } else {
                                                
                                                Orders.findOne({ _id: order._id }, function (err, doc){
                                                    
                                                    doc.pagseguro = {checkout:checkout};
                                                    
                                                    doc.save(function(err, updatedOrder) {
            
                                                        if (err) {
                                                                
                                                                res.statusCode = 400;
                        
                                                                return res.send(err);
                        
                                                        } else {

                                                            updatedOrder.shipping.price = updatedOrder.shipping.price.toFixed(2);
                                                            
                                                            send_new_order_email(updatedOrder);
                                                                
                                                            res.json(updatedOrder);
                                                                
                                                        }
                            
                                                    });
                                                    
                                                });
    
                                            }
                                            
                                        });
    
                                    }
                                        
                                }
        
                        });
                        
                    }
                });    
                
            } else {
                res.statusCode = 400;
                res.send({errors: {
                    'Products' : {
                        message: "A cesta está vazia."
                    }
                }});
            }
        } else {
            res.statusCode = 400;
            res.send({errors: {
                'Total' : {
                    message: "O valor mínimo para a compra de produtos é de R$35,00."
                }
            }});
        }
    });
    
    var _PutOrder = function(order, statusChanged, res) {

        return order.save(function(err, updatedOrder) {

                if (err) {
                        
                    res.statusCode = 400;

                    return res.send(err);

                } else {
                    
                    if(statusChanged){
                        
                        switch (updatedOrder.status) {
                            case 1: // pago
                                send_paid_email(updatedOrder);
                                break;
                            case 2: // entregue
                                send_delivered_email(updatedOrder);
                                break;         
                            case 3: // cancelado
                                send_canceled_email(updatedOrder);
                                break;                                                 
                            case 4: // aguardando pagamento
                                send_awaiting_email(updatedOrder);
                                break;
                        }
                        
                    }
                        
                    return res.send(updatedOrder);
                        
                }

        });
    }

    app.put('/v1/order/:order_id', utils.ensureAdmin, function(req, res){

        return Orders.findById(req.params.order_id, function(err, order) {
                
            if (err) {
                    
                res.statusCode = 400;

                return res.send(err);
                    
            } else {
                
                var statusChanged = order.status != req.body.status;
                    
                order.name = req.body.name;
                order.total = req.body.total;
                order.products = req.body.products;
                order.customer = req.body.customer;
                order.active = req.body.active;
                order.garbage_free = req.body.garbage_free;
                order.status = req.body.status;
                order.payment_date = req.body.payment_date;
                order.shipping.cep = req.body.shipping.cep;
                order.shipping.street = req.body.shipping.street;
                order.shipping.number = req.body.shipping.number;
                order.shipping.complement = req.body.shipping.complement;
                order.shipping.district = req.body.shipping.district;
                order.shipping.city = req.body.shipping.city;
                order.shipping.state = req.body.shipping.state;
                order.shipping.country = req.body.shipping.country;
                order.shipping.address_ref = req.body.shipping.address_ref;
                order.shipping.deliveryOption = req.body.shipping.deliveryOption;
                order.shipping.date = req.body.shipping.date;
                order.shipping.phone = req.body.shipping.phone;
                order.refound.option = req.body.refound.option;
                order.refound.products = req.body.refound.products;

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

    var calculateRefoundValue = function(order){

        var total = 0;

        var arrayLength = order.products.length;

        for (var i = 0; i < arrayLength; i++) {
            var product = order.products[i];
            if(product.unavaiable){
                total += product.prices[0].price * product.quantity;
            }

        };

        return total;

    }

    var createNewDiscount = function(order, callback){

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

    var createPaymentOrder = function(order, callback) {
        
        var data = {
            email: config.pagseguro.email,
            token: config.pagseguro.token,
            currency: 'BRL',
            reference: order._id.toString(),
            senderName: order.customer.name ? order.customer.name + ' --' : order.customer.email + ' --',
            senderPhone: order.customer.phone,
            senderEmail: order.customer.email,
            shippingType: 3,
            shippingAddressStreet: order.street,
            shippingAddressNumber: order.number,
            shippingAddressComplement: order.complement,
            shippingAddressDistrict: order.district,
            shippingAddressPostalCode: order.cep,
            shippingAddressCity: order.city,
            shippingAddressState: order.state,
            shippingAddressCountry: order.country
        };

        var arrayLength = order.products.length;

        for (var i = 0; i < arrayLength; i++) {

            var product = order.products[i];

            data['itemId'+ (i+1)] = product._id;
            data['itemDescription'+ (i+1)] = product.name;
            data['itemAmount'+ (i+1)] = product.prices[0].price.toFixed(2);
            data['itemQuantity'+ (i+1)] = product.quantity;
            data['itemWeight'+ (i+1)] = product.weight || 1;
        };

        data['itemId'+ (arrayLength+1)] = 'Frete';
        data['itemDescription'+ (arrayLength+1)] = 'Frete';
        data['itemAmount'+ (arrayLength+1)] = order.shipping.price > 0 ? order.shipping.price.toFixed(2) : 0;
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

                callback(err, null);

            } else {
                
                var xml2js = require('xml2js');
                var parser = new xml2js.Parser();
                parser.parseString(body, function (err, result) {
                    
                    var checkout = {
                        code: result.checkout.code[0]
                        , date: result.checkout.date[0]
                    };
                    
                    callback(null, checkout);

                });
                
            }
            
        }
            
        );
        
    };

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
    
    var getOrderStatusFromTransactions = function(transactions){

        var arrayLength = transactions.length;

        for (var i = 0; i < arrayLength; i++) {
            
            var transactionStatus = transactions[i].status[0];
            
            var paidStatusesRefer = ['3', '4'];
            
            if (paidStatusesRefer.indexOf(transactionStatus) > -1) return 1;

        };

        return 0;
        
    }

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
        
                                            return res.send(err);
        
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
    
    var send_new_order_email = function(order){
        
        utils.sendMail({
            template: 'orders/new'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });
        
    }

    var send_paid_email = function(order){
        
        utils.sendMail({
            template: 'orders/paid'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });
        
    }

    var send_delivered_email = function(order){
        
        utils.sendMail({
            template: 'orders/delivered'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });

    }

    var send_awaiting_email = function(order){
        
        utils.sendMail({
            template: 'orders/awaiting'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });

    }
    
    var send_canceled_email = function(order){
        
        utils.sendMail({
            template: 'orders/canceled'
            , data: order
            , subject: 'Pedido ' + order._id
            , receivers: order.customer.email
            , copyAdmins: true
        });

    }
}