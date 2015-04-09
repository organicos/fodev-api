"use strict";

module.exports=function(app, mongoose, moment, utils, config, https) {

    var Products = mongoose.model('Products');

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
        },
        pagseguro: {
            checkout: { type: Object, default: {}, required: 'Os dados de checkout do Pagseguro não foram informados!' },
            transactions: { type: Array, default: [] }
        },
        active : { type: Boolean, default: true },
        status : { type: Number, default: 0 },
        invalid : { type: Boolean, default: false },
        updated: { type: Date, default: moment().format("MM/DD/YYYY") }
    });
    
    var payment_status_map = {
        0: 'Pagamento pendente',
        1: 'Pago'
    };

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
                    
                    Products.findOne({_id: product._id, active: true}, function(err, productNow) {
                        
                        if (err) {
                                
                            newBasket.inactive_products.push(product);
                                
                        } else {

                            if(productNow) {
                                
                                product.price = productNow.price;
                                product.dscr = productNow.dscr;
                                product.name = productNow.name;
                                newBasket.products.push(product);
                                newBasket.total += Number(product.price * product.quantity);
                            
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

    app.post('/v1/order_review', function(req, res) {
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


    app.get('/v1/orders', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
            

        utils.getUserKind(req, function(userKind){
            
            var filter = {active: 1};
            
            if(userKind != 'admin') filter['customer._id'] = req.user._id;
                
                Orders.find(filter, null, function(err, products) {
        
                    if (err) {
                            res.send(err);       
                    }
    
                    res.json(products);
        
                });

        });
                
    });
    
    app.get('/v1/order/:product_id', function(req, res) {

            Orders.findOne({_id: req.params.product_id}, function(err, product) {

                    if (err) {
                        
                        res.send(err);
                        
                    } else {
                        
                        res.json(product);
                        
                    }

            });

    });
        
    app.post('/v1/order', utils.getRequestUser, function(req, res) {
        
        if(req.body.basket.total >= 35){
            // verifica se existe produtos na cesta
            if(req.body.basket.products && req.body.basket.products.length > 0){
                
                validateOrder(req.body.basket, function(basket){
                    
                    var invalidCity = req.body.basket.shipping.city == 'Florianópolis' ? false : true;
                    
                    basket.total.toFixed(2);
                    
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
                            total:  basket.total,
                            products:  basket.products,
                            shipping:  basket.shipping,
                            invalid: invalidCity
                            
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
                                                    city: {message: 'Tivemos alguns problemas em gerar sua ordem de pagamento. Nossa equipe irá verificar o motivo e entrar em contato com você em breve. Pedimos desculpas pelo inconveniente.'}
                                                }});
                                                
                                            } else {
                                                
                                                Orders.findOne({ _id: order._id }, function (err, doc){
                                                    
                                                    doc.pagseguro = {checkout:checkout};
                                                    
                                                    doc.save(function(err, updatedOrder) {
            
                                                        if (err) {
                                                                
                                                                res.statusCode = 400;
                        
                                                                return res.send(err);
                        
                                                        } else {
                                                            
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
            shippingAddressCountry: order.country,
            encoding: 'UTF-8'
        };

        var arrayLength = order.products.length;

        for (var i = 0; i < arrayLength; i++) {
            data['itemId'+ (i+1)] = order.products[i]._id;
            data['itemDescription'+ (i+1)] = order.products[i].name;
            data['itemAmount'+ (i+1)] = order.products[i].price.toFixed(2);
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
            headers: {'Content-Type' : 'application/json; charset=utf-8'},
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

    app.delete('/v1/order/:order_id', utils.ensureAuthorized, function(req, res) {

        return Orders.findById(req.params.order_id, function(err, order) {
                
                if (err) {
                        
                        res.statusCode = 400;

                        return res.send(err);
                        
                } else {
                        
                        order.status = 0;
                        
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
            
            if (transactions[i].status[0] == 3) return 1;

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
                        
                        // var finalDate = '2015-04-07T14:55';

                        
                        var initialDate = moment().subtract('days', 30).format("YYYY-MM-DDThh:mm");
                        var finalDate = moment().format("YYYY-MM-DDThh:mm");
                        
                        console.log(initialDate);
                        console.log(finalDate);
                        
                        request.get({
                            url:config.pagseguro.host+'/v2/transactions',
                            qs : {
                                initialDate: initialDate,
                                finalDate: finalDate,
                                page: 1,
                                maxPageResults: 100,
                                email: config.pagseguro.email,
                                token: config.pagseguro.token,
                                reference: reference
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
                                        
                                        var transactions = result.transactionSearchResult.transactions ? result.transactionSearchResult.transactions[0].transaction : null;
                                        
                                        var old_status = order.status;
                                        
                                        order.pagseguro = { checkout: order.pagseguro.checkout };
                                        
                                        if (transactions) {
                                            
                                                order.pagseguro.transactions =  transactions;
                                                
                                                order.status = getOrderStatusFromTransactions(transactions);
                                            
                                        }

                                        order.save(function(err, updatedOrder) {
                                            
                                            if (err) {
                                                    
                                                res.statusCode = 400;
            
                                                return res.send(err);
            
                                            } else {
                                                
                                                if(old_status != 1 && order.status == 1) send_paid_email(updatedOrder);
                                                
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
                                
                                    order.pagseguro.transactions.push(result.transaction);

                                    order.status = getOrderStatusFromTransactions([result.transaction]);

                                    order.save(function(err, updatedOrder) {
                                        
                                        if (err) {
                                                
                                            res.statusCode = 400;
        
                                            return res.send(err);
        
                                        } else {
                                            
                                            if(order.status == 1) send_paid_email(updatedOrder);
                                                
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
        
        var nodemailer = require('nodemailer');
        var path = require('path');
        var templatesDir   = path.join(__dirname, '../templates');
        var emailTemplates = require('email-templates');

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // 465
            secure: true, // true
            debug : true,
            auth: {
                user: 'bruno@tzadi.com',
                pass: 'Dublin2010ireland'
            }
        });

        emailTemplates(templatesDir, function(err, template) {
             
            if (err) {
                console.log(err);
            } else {
              
                template('orders/new', order, function(err, html, text) {
                    
                    if (err) {
                        console.log(err);
                    } else {
                        var mailOptions = {
                            from: 'Feira Orgânica Delivery <info@feiraorganica.com>', //sender address
                            replyTo: "info@feiraorganica.com",
                            to: order.customer.email, // list of receivers
                            cc: 'info@feiraorganica.com', // lredirects to 'bruno@tzadi.com, denisefaccin@gmail.com'
                            subject: 'Pedido ' + order._id,
                            text: text,
                            html: html
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log(error);
                            }else{
                                console.log('Message sent: ' + info.response);
                            }
                        });
                    }
                });
            }
        });
    }
    
    var send_paid_email = function(order){
        
        var nodemailer = require('nodemailer');
        var path = require('path');
        var templatesDir   = path.join(__dirname, '../templates');
        var emailTemplates = require('email-templates');

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // 465
            secure: true, // true
            debug : true,
            auth: {
                user: 'bruno@tzadi.com',
                pass: 'Dublin2010ireland'
            }
        });

        emailTemplates(templatesDir, function(err, template) {
             
            if (err) {
                console.log(err);
            } else {
              
                template('orders/paid', order, function(err, html, text) {
                    
                    if (err) {
                        console.log(err);
                    } else {
                        var mailOptions = {
                            from: 'Feira Orgânica Delivery <info@feiraorganica.com>', //sender address
                            replyTo: "info@feiraorganica.com",
                            to: order.customer.email, // list of receivers
                            cc: 'info@feiraorganica.com', // lredirects to 'bruno@tzadi.com, denisefaccin@gmail.com'
                            subject: 'Pedido ' + order._id,
                            text: text,
                            html: html
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log(error);
                            }else{
                                console.log('Message sent: ' + info.response);
                            }
                        });
                    }
                });
            }
        });
    }
    
}