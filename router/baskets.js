"use strict";

module.exports=function(app, utils) {
    
    var BasketsController = require('./../controllers/BasketsController.js');

    app.get('/v1/baskets', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        BasketsController.database.find(filter, function(err, baskets) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(baskets);
                
            }

        });

    });
    
    app.get('/v1/basket/:basket_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        BasketsController.database.findOne({_id: req.params.basket_id}, function(err, basket) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(basket);
                
            }

        });

    });

    app.post('/v1/basket', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        BasketsController.database.create({

                name : req.body.name

        }, function(err, basket) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(basket); 
                        
                }

        });

    });
    
    app.put('/v1/basket/:basket_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        BasketsController.database.findById(req.params.basket_id, function(err, basket) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                basket.name = req.body.name;

                basket.save(function(err, updatedBasket) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedBasket);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/baskets/:basket_id', utils.ensureAdmin, function(req, res) {

        BasketsController.database.remove({

                _id : req.params.basket_id

        }, function(err, basket) {

                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);
                        
                } else {

                        BasketsController.database.find(function(err, baskets) {

                                if (err) {
                                        res.statusCode = 400;
                                        res.send(err);
                                } else {

                                        res.json(baskets);
                                        
                                }

                        });

                }

        });

    });
    
    app.post('/v1/baskets/validate', utils.ensureAuthorized, function(req, res) {
        
        var basket = req.body.basket;

        BasketsController.validateBasket(basket, function(basket){

            var errors = [];
            var messages = [];

            // verify if is there any product in the basket
            if(!basket.products.length > 0){
                
                errors.push({
                    title: 'Estoque',
                    message: "A sua cesta está vazia."
                });
                
            }

            // verify that the products value respect the minimum 
            if(!basket.total >= 35){
                
                errors.push({
                    title: 'Estoque',
                    message: "O valor mínimo para a compra de produtos é de R$35,00."
                });
                
            }
            
            // verify if some of the products is missing
            if(basket.inactiveProducts.length > 0){
                
                errors.push({
                    title: 'Estoque',
                    message: "Infelizmente alguns produtos da sua cesta não estão mais disponíveis."
                });
                
            }
            
            // verify if there is some error and set the response code to 400
            if(errors.length > 0){
                
                res.statusCode = 400;
                
            }
            
            return res.send({
                errors:errors
                , messages: messages
                , basket: basket
            });
        
        });
        
    });
    
};