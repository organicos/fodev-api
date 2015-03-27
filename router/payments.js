"use strict";

module.exports=function(app, mongoose, moment, config) {

        var Payments = mongoose.model('Payments', {

                name : { type: String, required: 'Informe o nome do produto!' },

                price: Number,
                
                dscr : String,

                img: {
                        type: String,
                        trim: true,
                        unique: true,
                        required: 'Forneça a url de imagem do produto.',
                        match: [/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/, 'Forneça uma url válida da imagem do produto.']
                },
    
                category : String,
                
                highlight : Boolean,
                
                active : Boolean,
                
                supplier: String,
                
                season: String,
                
                recipes: String,
                
                updated: { type: Date, default: moment().format("MM/DD/YYYY") }

        });

        app.get('/v1/payments', function(req, res) {

            var request = require('request');
            var parseString = require('xml2js').parseString;
            var payments = {
                abandoneds: [],
                transactions: []
            }
            
            var abandoneds_url = config.pagseguro.host + '/transactions/abandoned/';
            abandoneds_url += '?email=' + config.pagseguro.email;
            abandoneds_url += '&token=' + config.pagseguro.token;
            abandoneds_url += '&initialDate=2015-03-03T00:00';
            
            request.get(abandoneds_url, function (err, response, body) {
                
                if (!err && response.statusCode == 200) {

                    parseString(body, function (err, result) {
                        
                        if(err){
                            
                            res.send(err);
                            
                        } else {
                                
                            payments.abandoneds = result.transactionSearchResult.transactions ? result.transactionSearchResult.transactions[0].transaction : [];
                            
                            var transactions_url = config.pagseguro.host + '/transactions/';
                            transactions_url += '?email=' + config.pagseguro.email;
                            transactions_url += '&token=' + config.pagseguro.token;
                            transactions_url += '&initialDate=2015-03-03T00:00';
                            
                            request.get(transactions_url, function (err, response2, body) {
                                
                                if (!err && response2.statusCode == 200) {
                
                                    parseString(body, function (err, result2) {
                                        
                                        if(err){
                                            
                                            res.send(err);
                                            
                                        } else {
                                                
                                            payments.transactions = result2.transactionSearchResult.transactions ? result2.transactionSearchResult.transactions[0].transaction : [];
                                            
                                            res.json(payments);
                                            
                                        }
                                    });
                
                                } else {
                                
                                    res.send(err);
                                
                                }
                              
                            });
                            
                        }
                    });

                } else {
                
                    res.send(err);
                
                }
              
            });

            // Payments.find(function(err, payments) {

            //         if (err)

            //                 res.send(err);

            //         res.json(payments);

            // });

        });

        app.get('/v1/payment/:payment_id', function(req, res) {

                Payments.find({_id: req.params.payment_id}, function(err, payment) {

                        if (err)

                                res.send(err);

                        res.json(payment);

                });

        });

        app.post('/v1/payments', function(req, res) {

                Payments.create({

                        name : req.body.name,

                        price : req.body.price,
                        
                        dscr : req.body.dscr,
                        
                        img : req.body.img,
                        
                        highlight : req.body.highlight,
                        
                        active : req.body.active,
                        
                        category : req.body.category,

                        supplier: req.body.supplier,
                        
                        season: req.body.season,
                        
                        recipes: req.body.recipes,
                
                }, function(err, payment) {

                        if (err){
                                
                                res.statusCode = 400;
                                
                                res.send(err);
                                
                        } else {
                                
                                res.json(payment);
                                
                        }

                });

        });

        app.put('/v1/payments/:payment_id', function(req, res){

                return Payments.findById(req.params.payment_id, function(err, payment) {
                        
                        if (err) {
                                
                                res.statusCode = 400;

                                return res.send(err);
                                
                        } else {
                                
                                payment.name = req.body.name;
                                
                                payment.price = req.body.price;
                                
                                payment.dscr = req.body.dscr;
                                
                                payment.img = req.body.img;
                                
                                payment.highlight = req.body.highlight;
                                
                                payment.active = req.body.active;
        
                                payment.category = req.body.category;
        
                                payment.supplier = req.body.supplier;
                                
                                payment.season = req.body.season;
                                
                                payment.recipes = req.body.recipes;
                                
                                payment.updated = Date.now();
                                
                                console.log(payment);
        
                                return payment.save(function(err, updatedProduct) {
        
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

        app.delete('/v1/payments/:payment_id', function(req, res) {

                Payments.remove({

                        _id : req.params.payment_id

                }, function(err, payment) {

                        if (err)

                                res.send(err);

                        Payments.find(function(err, payments) {

                                if (err)

                                        res.send(err);

                                res.json(payments);

                        });

                });

        });

}
