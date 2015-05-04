"use strict";

module.exports=function(app, mongoose, moment, config, utils) {

    var Articles = require('./../modules/Articles.js');
    
    var Users = require('./../modules/Users.js');
    
    var Products = require('./../modules/Products.js');
    
    var Images = require('./../modules/Images.js');

    var Prices = require('./../modules/Prices.js');
    
    var Categories = require('./../modules/Categories.js');

    app.get('/v1/playground', function(req, res) {

       res.send('Você não deveria estar aqui!');
        
    });

    app.get('/v1/playground/products/upgrade-images-sctructure', function(req, res) {
            
        Products.find(function(err, products) {

            if (err) {
                    
                res.statusCode = 400;
                res.send(err);

            }
            
            var total = products.length;
            var result = [];

            function saveAll(){
                
                var product = products.pop();

                Images.create({
    
                        title : product.img.split("/").pop(),
    
                        url : product.img
                        
                }, function(err, image) {
    
                    if (err){
                            
                            res.statusCode = 400;
                            
                            res.send(err);
                            
                    } else {
                            
                        product.images = [image._id];
                        
                        Prices.create({
            
                                price : product.price || 0,
            
                                date : moment().subtract(1, 'weeks').format()
                                
                        }, function(err, price) {
            
                            if (err){
                                    
                                    res.statusCode = 400;
                                    
                                    res.send(err);
                                    
                            } else {
                                    
                                product.prices = [price._id];
            
                                Prices.create({
                    
                                        price : product.cost || 0,
                    
                                        date : moment().subtract(1, 'weeks').format()
                                        
                                }, function(err, price) {
                    
                                    if (err){
                                            
                                            res.statusCode = 400;
                                            
                                            res.send(err);
                                            
                                    } else {
                                            
                                        product.costs = [price._id];
                    
                                        Categories.create({
                            
                                                name : product.category
                                                
                                        }, function(err, category) {
                            
                                            if (err){
                                                    
                                                    res.statusCode = 400;
                                                    
                                                    res.send(err);
                                                    
                                            } else {
                                                    
                                                product.categories = [category._id];
                            
                                                product.save(function(err, savedProduct){
                                                  
                                                if (err) {
                                                    
                                                    throw err;//handle error
                                                    
                                                } else {
                                                    
                                                    result.push(savedProduct);
                                                
                                                    if (--total) {
                                                        
                                                        saveAll();
                                                        
                                                    } else {
                                                        
                                                        res.send('Produtos migrados com sucesso!');
                                                        
                                                    }
                                                    
                                                }
                                                
                                                });
                                                                                
                                            }
                            
                                        });
                                                                        
                                    }
                    
                                });
                                                                
                            }
            
                        });
                                                        
                    }
    
    
    
                });
            
            }
            
            if(products[0].images.length){
                
                res.send('Ação não permitida! Migração já foi realizada anteriormente.');
                
            } else {
                
                saveAll();
                
            }
            
            

        });

    });

    app.get('/v1/playground/articles/upgrade-images-sctructure', function(req, res) {
            
        Articles.find(function(err, articles) {

            if (err) {
                    
                res.statusCode = 400;
                res.send(err);

            }
            
            var total = articles.length;
            var result = [];

            function saveAll(){
                
                var article = articles.pop();

                Images.create({
    
                        title : article.img.split("/").pop(),
    
                        url : article.img
                        
                }, function(err, image) {
    
                    if (err){
                            
                            res.statusCode = 400;
                            
                            res.send(err);
                            
                    } else {
                            
                        article.images = [image._id];
    
                        article.save(function(err, savedArticle){
                          
                        if (err) {
                            
                            throw err;//handle error
                            
                        } else {
                            
                            result.push(savedArticle);
                        
                            if (--total) {
                                
                                saveAll();
                                
                            } else {
                                
                                res.send('Artigos migrados com sucesso!');
                                
                            }
                            
                        }
                        
                        });
                                                        
                    }
    
    
    
                });
            
            }
            
            if(articles[0].images.length){
                
                res.send('Ação não permitida! Migração já foi realizada anteriormente.');
                
            } else {
                
                saveAll();
                
            }
            
            

        });

    });
        
}