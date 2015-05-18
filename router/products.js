"use strict";

module.exports=function(app, mongoose, moment, utils) {
        
        var Products = require('./../modules/Products.js');
        
        var Prices = require('./../modules/Prices.js');
        
        var Visits = require('./../modules/Visits.js');
        
        var adminFields = '-costs';
        
        app.get('/v1/products', utils.getRequestUser, function(req, res) {
                
                var filter = {};
                
                var hiddenFields = null;
                
                var populate = ['images', 'prices', 'categories', 'suppliers']
                
                if(!req.user || req.user.kind != 'admin'){
                        hiddenFields = adminFields;
                        filter.active = 1;       
                } else {
                        populate.push('costs', 'visits');
                }

                if(req.query.highlight) filter.highlight = 1;
                
                if(req.query.name) filter.name = new RegExp(req.query.name, "i");
                
                Products
                .find(filter, hiddenFields, {sort: {name: 1}})
                .populate(populate)
                .exec(function(err, products) {
                        
                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);       
                        }
        
                        res.json(products);
                        
                });

        });

        app.get('/v1/product/:encoded_url', utils.getRequestUser, function(req, res) {

                var filter = {};
                
                var hiddenFields = null;
                
                var populate = ['images', 'prices', 'categories', 'suppliers', 'visits'];
                
                if(!req.user || req.user.kind != 'admin'){
                        hiddenFields = adminFields;
                        filter.active = 1;       
                } else {
                       populate.push('costs');
                }
                
                var product_id_url = req.params.encoded_url;
                
                var isObjectId = mongoose.Types.ObjectId.isValid(product_id_url);
                
                if(isObjectId){
                        
                        filter._id = product_id_url;
                        
                } else {
                        
                        filter.encoded_url = product_id_url;

                }
                
                Products
                .findOne(filter, hiddenFields, {sort: {updated: -1}})
                .populate(populate)
                .exec(function(err, product) {
                        
                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);       
                        }
                        
                        if(product && (!req.user || req.user.kind != 'admin')){
                                
                                var visit = {};
                                
                                if(req.user) visit.user = req.user._id;
                                
                                Visits.create(visit, function(err, newVisit){
                                        
                                        product.visits.push(newVisit);
                                        
                                        product.save(function(err, updatedProduct){
                                                
                                                product = updatedProduct.toObject();
                                        
                                                product.visits = product.visits.length;
                                                
                                                res.json(product);
                                                
                                        });
                                        
                                });
                                
                        } else {
                         
                                res.json(product);
                                
                        }
                        
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
        
        app.post('/v1/product', utils.ensureAdmin, function(req, res) {

                var createProduct = function (){
                
                        Products.create({
        
                                name : req.body.name,
                                
                                encoded_url: req.body.encoded_url,
        
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
                                
                                categories : req.body.categories,
        
                                supplier: req.body.supplier,
                                
                                suppliers: req.body.suppliers,
                                
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

        app.put('/v1/product/:product_id', utils.ensureAdmin, function(req, res){

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
                                        
                                        product.encoded_url = req.body.encoded_url;
                                        
                                        product.price = req.body.price;
                                        
                                        product.prices = req.body.prices;
                                        
                                        product.cost = req.body.cost;
                                        
                                        product.costs = req.body.costs;
                                        
                                        product.category = req.body.category;
                                        
                                        product.categories = req.body.categories;
                                        
                                        product.dscr = req.body.dscr;
                                        
                                        product.img = req.body.img;
                                        
                                        product.images = req.body.images;
                                        
                                        product.highlight = req.body.highlight;
                                        
                                        product.active = req.body.active;
                
                                        product.supplier = req.body.supplier;
                                        
                                        product.suppliers = req.body.suppliers;
                                        
                                        product.season = req.body.season;
                                        
                                        product.updated = Date.now();
                                        
                                        product.save(function(err, updatedProduct) {
                
                                                if (err) {
                                                        
                                                        res.statusCode = 400;
                
                                                        res.send(err);
                
                                                } else {
                                                        
                                                        Products.deepPopulate(updatedProduct, ['images', 'prices', 'costs', 'suppliers', 'categories'], function(err, updatedProductPopulated) {
                                                        
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

        app.delete('/v1/product/:product_id', utils.ensureAdmin, function(req, res) {

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
        
                                                res.json({
                                                        type: true,
                                                        msg: 'Product deleted!'
                                                });
                                                
                                        }
        
                                });

                        }

                });

        });

}
