"use strict";

module.exports=function(app, mongoose, moment, utils) {
        
        var Products = require('./../modules/Products.js');

        app.get('/v1/products', function(req, res) {
                
                utils.getUserKind(req, function(userKind){
                        
                        var filter = {};
                        
                        if(userKind != 'admin') filter.active = 1;
                        
                        if(req.query.highlight) filter.highlight = 1;
                        
                        if(req.query.name) filter.name = new RegExp(req.query.name, "i");
                        
                        Products.find(filter, null, {sort: {name: 1}}, function(err, products) {

                                if (err) {
                                        
                                        res.statusCode = 400;
                                        res.send(err);
                                }
        
                                res.json(products);
        
                        });

                });

        });

        app.get('/v1/product/:product_id', function(req, res) {

                utils.getUserKind(req, function(userKind){
                        
                        var filter = {_id: req.params.product_id};
                        
                        if(userKind != 'admin') filter.active = 1;
                        
                        Products.findOne(filter, null, function(err, product) {
        
                                if (err){
                                        res.statusCode = 400;
                                        res.send(err);
                                } else {
        
                                        res.json(product);
                                        
                                }
        
                        });

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

                        Products.findOne(filter, null, function(err, product) {
        
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

                Products.create({

                        name : req.body.name,

                        price : req.body.price,
                        
                        cost : req.body.cost,
                        
                        dscr : req.body.dscr,
                        
                        img : req.body.img,
                        
                        images : req.body.images,
                        
                        highlight : req.body.highlight,
                        
                        active : req.body.active,
                        
                        category : req.body.category,

                        supplier: req.body.supplier,
                        
                        season: req.body.season,
                        
                        recipes: req.body.recipes
                
                }, function(err, product) {

                        if (err){
                                
                                res.statusCode = 400;
                                
                                res.send(err);
                                
                        } else {
                                
                                res.json(product);
                                
                        }

                });

        });

        app.put('/v1/products/:product_id', utils.ensureAdmin, function(req, res){

                return Products.findById(req.params.product_id, function(err, product) {
                        
                        if (err) {
                                
                                res.statusCode = 400;

                                return res.send(err);
                                
                        } else {
                                
                                // save de history price when the price change
                                if(product.price != req.body.price){
                                        
                                        product.price_history.unshift({
                                                price: product.price
                                                , date: Date.now
                                        });
                                        
                                }
                                
                                product.name = req.body.name;
                                
                                product.price = req.body.price;
                                
                                product.cost = req.body.cost;
                                
                                product.dscr = req.body.dscr;
                                
                                product.img = req.body.img;
                                
                                product.images = req.body.images;
                                
                                product.highlight = req.body.highlight;
                                
                                product.active = req.body.active;
        
                                product.category = req.body.category;
        
                                product.supplier = req.body.supplier;
                                
                                product.season = req.body.season;
                                
                                product.recipes = req.body.recipes;
                                
                                product.updated = Date.now();
                                
                                return product.save(function(err, updatedProduct) {
        
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
