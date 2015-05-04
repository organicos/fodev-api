"use strict";

module.exports=function(app, mongoose, moment, utils) {
        
        var Products = require('./../modules/Products.js');
        
        var Prices = require('./../modules/Prices.js');
        
        app.get('/v1/products', utils.getRequestUser, function(req, res) {
                
                var filter = {};
                
                var populate = ['images', 'prices', 'categories']
                
                if(!req.user || req.user.kind != 'admin'){
                        filter.active = 1;       
                } else {
                        populate.push('costs');
                }
                
                if(req.query.highlight) filter.highlight = 1;
                
                if(req.query.name) filter.name = new RegExp(req.query.name, "i");
                
                Products
                .find(filter, null, {sort: {updated: -1}})
                .populate(populate)
                .exec(function(err, products) {
                        
                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);       
                        }
        
                        res.json(products);
                        
                });

        });

        app.get('/v1/product/:product_id', utils.getRequestUser, function(req, res) {

                var filter = {_id: req.params.product_id};
                
                var populate = ['images', 'prices', 'categories'];
                
                if(!req.user || req.user.kind != 'admin'){
                        filter.active = 1;       
                } else {
                       populate.push('costs');
                       console.log(populate);
                }
                
                Products
                .findOne(filter, null, {sort: {updated: -1}})
                .populate(populate)
                .exec(function(err, products) {
                        
                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);       
                        }
        
                        res.json(products);
                        
                });
                
        });
        
        app.get([
                '/feira/:product_id'
                , '/feira/produto/:product_id'
                , '/fair/:product_id'
                , '/fair/product/:product_id'
        ], function(req, res) {
                
                var path = require('path');
                
                var isBoot = req.headers['user-agent'].search(/Google|Twitterbot|facebookexternalhit|bot|crawler|baiduspider|80legs|ia_archiver|voyager|curl|wget|yahoo! slurp|mediapartners-google/i) > -1;
                
		if (isBoot) {
		
                        var filter = {_id: req.params.product_id, active: 1};
                        
                        Products
                        .findOne(filter)
                        .populate(['prices'])
                        .exec(function(err, product) {
        
                                if (err){
                                        res.statusCode = 400;
                                        res.send(err);
                                } else {
                                        
                                        res.render('products/product_meta_tags', {product:product});
                                        
                                }
        
                        });
        
		} else {
		        
                        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
                        
                        res.sendFile(file);
		        
		}

        });
        
        app.post('/v1/products', utils.ensureAdmin, function(req, res) {

                var createProduct = function (){
                
                        Products.create({
        
                                name : req.body.name,
        
                                price : req.body.price,
                                
                                prices : req.body.prices,
                                
                                cost : req.body.cost,
                                
                                costs : req.body.costs,
                                
                                dscr : req.body.dscr,
                                
                                img : req.body.img || 'http://images.elasticbeanstalk.com/200',
                                
                                images : req.body.images,
                                
                                highlight : req.body.highlight,
                                
                                active : req.body.active,
                                
                                category : req.body.category,
        
                                supplier: req.body.supplier,
                                
                                season: req.body.season
                                
                        }, function(err, product) {
        
                                if (err){
                                        
                                        res.statusCode = 400;
                                        
                                        res.send(err);
                                        
                                } else {
                                        
                                        res.json(product);
                                        
                                }
        
                        });
                        
                }
                
                var createPrice = function(callback){
                        
                        var newPrice = req.body.prices[0].price;

                        Prices.create({
                                price: newPrice
                        }, function(err, price){
                                
                                if(err) {
                                        
                                        res.statusCode = 400;
        
                                        return res.send(err);
                                        
                                } else {
                                        
                                         req.body.prices = [price._id];
                                         
                                         callback();
                                        
                                }
                                
                        });
                                
                };
                
                var createCost = function(callback){
                        
                        var newCost = req.body.costs[0].price;

                        Prices.create({
                                price: newCost
                        }, function(err, price){
                                
                                if(err) {
                                        
                                        res.statusCode = 400;
        
                                        return res.send(err);
                                        
                                } else {
                                        
                                         req.body.costs = [price._id];
                                         
                                         callback();
                                        
                                }
                                
                        });

                }
                
                createCost(function(){
                        createPrice(function(){
                                createProduct();
                        });
                });



        });

        app.put('/v1/products/:product_id', utils.ensureAdmin, function(req, res){

                Products
                .findById(req.params.product_id)
                .populate(['prices', 'costs'])
                .exec(function(err, product) {

                        if (err) {
                                
                                res.statusCode = 400;

                                return res.send(err);
                                
                        } else {
                                
                                var saveProduct = function (){
                                
                                        product.name = req.body.name;
                                        
                                        product.price = req.body.price;
                                        
                                        product.prices = req.body.prices;
                                        
                                        product.cost = req.body.cost;
                                        
                                        product.costs = req.body.costs;
                                        
                                        product.dscr = req.body.dscr;
                                        
                                        product.img = req.body.img;
                                        
                                        product.images = req.body.images;
                                        
                                        product.highlight = req.body.highlight;
                                        
                                        product.active = req.body.active;
                
                                        product.category = req.body.category;
                
                                        product.supplier = req.body.supplier;
                                        
                                        product.season = req.body.season;
                                        
                                        product.updated = Date.now();
                                        
                                        product.save(function(err, updatedProduct) {
                
                                                if (err) {
                                                        
                                                        res.statusCode = 400;
                
                                                        res.send(err);
                
                                                } else {
                                                        
                                                        Products.deepPopulate(updatedProduct, ['images', 'prices', 'costs'], function(err, updatedProductPopulated) {
                                                        
                                                                if (err) {
                                                                        
                                                                        res.statusCode = 400;
                                                                
                                                                        return res.send(err);
                                                                
                                                                } else {
                                                                    
                                                                    res.json(updatedProductPopulated);
                                                                    
                                                                }
                                                        
                                                        });
                                                        
                                                }
                
                                        });
                                        
                                }
                                
                                var updatePrice = function(callback){
                                        
                                        var currentPrice = product.prices[0].price;
                                        
                                        var newPrice = req.body.prices[0].price;
        
                                        if(currentPrice != newPrice){
                                                
                                                Prices.create({
                                                        price: newPrice
                                                }, function(err, price){
                                                        
                                                        if(err) {
                                                                
                                                                res.statusCode = 400;
                                
                                                                return res.send(err);
                                                                
                                                        } else {
                                                                
                                                                 req.body.prices.unshift(price._id);
                                                                 
                                                                 callback();
                                                                
                                                        }
                                                        
                                                });
                                                
                                        } else {
                                                
                                                callback();
                                                
                                        }
                                        
                                };
                                
                                var updateCost = function(callback){
                                        
                                        var newCost = req.body.costs[0].price;
                                        
                                        var currentCost = product.costs[0].price;
                                        
                                        if(currentCost != newCost){
                                                
                                                Prices.create({
                                                        price: newCost
                                                }, function(err, price){
                                                        
                                                        if(err) {
                                                                
                                                                res.statusCode = 400;
                                
                                                                return res.send(err);
                                                                
                                                        } else {
                                                                
                                                                 req.body.costs.unshift(price._id);
                                                                 
                                                                 callback();
                                                                
                                                        }
                                                        
                                                });
                                        
                                                
                                        } else {
                                                
                                                callback();
                                                
                                        }
                                        
                                }
                                
                                updateCost(function(){
                                        updatePrice(function(){
                                                saveProduct();
                                        })
                                });
                                
                        }

                });

        });

        app.delete('/v1/products/:product_id', utils.ensureAdmin, function(req, res) {

                Products.remove({

                        _id : req.params.product_id

                }, function(err, product) {

                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);
                                
                        } else {

                                Products.find(function(err, products) {
        
                                        if (err) {
                                                res.statusCode = 400;
                                                res.send(err);
                                        } else {
        
                                                res.json(products);
                                                
                                        }
        
                                });

                        }

                });

        });

}
