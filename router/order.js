"use strict";

module.exports=function(app, mongoose, moment, utils, config, https) {

    var Products = require('./../modules/Products.js');

    var Orders = mongoose.model('Orders', {
        name : { type: String, required: 'Informe o nome da cesta!' },
        total: { type: Number, required: 'Informe o total!' },
        products: { type: Array, required: 'A cesta está vazia!' },
        customer: { type: Object, required: 'Identifique o cliente!' },
        shipping: {
            price: { type: Number, required: 'Informe o preço do frete!' },
            cep: { type: String, required: 'Informe o cep!' },
            street: { type: String, required: 'Informe o endereço!' },
            number: { type: String, required: 'Informe o numero da casa!' },
            complement: String,
            district: { type: String, required: 'Informe o bairro!' },
            city: { type: String, required: 'Informe a cidade!' },
            state: { type: String, required: 'Informe o estado!' },
            country: { type: String, default: 'Brasil', required: 'Informe o país!' },
            address_ref: { type: String, required: 'Informe alguma referência!' },
            deliveryOption: { type: String, required: 'Informe a data de entrega!' },
            phone: { type: String, required: 'Informe um telefone para contato!' }
        },
        pagseguro: {
            checkout: { type: Object, default: {}, required: 'Os dados de checkout do Pagseguro não foram informados!' },
            transactions: { type: Array, default: [] }
        },
        active : { type: Boolean, default: true },
        status : { type: Number, default: 0 }, // payment_status_map
        payment_date: { type: Date },
        updated: { type: Date, default: Date.now }
    });
    
    var payment_status_map = {
        0: 'Pagamento pendente',
        1: 'Pago',
        2: 'Entregue',
        3: 'Cancelado',
        4: 'Problemas com o pagamento.',
        5: 'Inválido.'
    };

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
            newBasket.shipping.price = 6;
            newBasket.shipping.country = 'Brasil';
        } else {
            newBasket.shipping = {
                price: 6,
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

            Orders.findOne({_id: req.params.order_id}, function(err, product) {

                    if (err) {
                        
                        res.send(err);
                        
                    } else {
                        
                        res.json(product);
                        
                    }

            });

    });
        
    app.post('/v1/order', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        if(req.body.basket.total >= 35){
            // verifica se existe produtos na cesta
            if(req.body.basket.products && req.body.basket.products.length > 0){
                
                validateOrder(req.body.basket, function(basket){
                    
                    var invalidCity = req.body.basket.shipping.city == 'Florianópolis' ? false : true;
                    
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
    
    app.put('/v1/order/:order_id', utils.ensureAdmin, function(req, res){

        return Orders.findById(req.params.order_id, function(err, order) {
                
            if (err) {
                    
                res.statusCode = 400;

                return res.send(err);
                    
            } else {
                
                var statusChanged = order.status != req.body.status;
                
                order.shipping.phone = order.shipping.phone || "9";
                    
                order.status = req.body.status;
                
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

        });

    });

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
            data['itemId'+ (i+1)] = order.products[i]._id;
            data['itemDescription'+ (i+1)] = order.products[i].name;
            data['itemAmount'+ (i+1)] = order.products[i].prices[0].price.toFixed(2);
            data['itemQuantity'+ (i+1)] = order.products[i].quantity;
            data['itemWeight'+ (i+1)] = order.products[i].weight || 1;
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
                                        
                                        console.log(params, result);
                                        
                                        var transactions = result.transactionSearchResult.transactions ? result.transactionSearchResult.transactions[0].transaction : null;
                                        
                                        var oldStatus = order.status;
                                        
                                        var newStatus = oldStatus;
                                        
                                        order.pagseguro = { checkout: order.pagseguro.checkout };
                                        
                                        if (transactions) {
                                            
                                            order.pagseguro.transactions = transactions;
                                            
                                            newStatus = getOrderStatusFromTransactions(transactions);
                                            
                                            order.status = newStatus;
                                            
                                            if(oldStatus != 1 && newStatus == 1){
                                                
                                                order.payment_date = Date.now();
                                                
                                            }
                                            
                                        }

                                        order.save(function(err, updatedOrder) {

                                            if (err) {

                                                res.statusCode = 400;

                                                return res.send(err);

                                            } else {
                                                
                                                if(oldStatus != 1 && order.status == 1) send_paid_email(updatedOrder);

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
                                    
                                    if( (oldStatus != 1) && (oldStatus != newStatus) ){
                                        
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
                                            
                                            if(oldStatus != 1 && updatedOrder.status == 1){
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
        
        console.log(order);
        
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