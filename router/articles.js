"use strict";

module.exports=function(app, mongoose, moment, utils) {
        
        var Articles = require('./../modules/Articles.js');
        
        var Products = require('./../modules/Products.js');
        
        app.get('/v1/articles', utils.getRequestUser, function(req, res) {

                var filter = {};
                
                if(!req.user || req.user.kind != 'admin') filter.active = 1;
                        
                Articles
                .find(filter, null, {sort: {updated: -1}})
                .populate(['images'])
                .exec(function(err, articles) {
                        
                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);       
                        }
        
                        res.json(articles);
                        
                });
        
        });

        app.get('/v1/article/:encoded_url', utils.getRequestUser, function(req, res) {
                
                var article_id_url = req.params.encoded_url;
                
                var isObjectId = mongoose.Types.ObjectId.isValid(article_id_url);
                
                var filter = {};
                
                if(!req.user || req.user.kind != 'admin') filter.active = 1;
                
                if(isObjectId){
                        
                        filter._id = article_id_url;
                        
                        Articles
                        .findOne(filter, null, {sort: {updated: -1}})
                        .populate(['images', 'products'])
                        .exec(function(err, articles) {
                                
                                if (err) {
                                        
                                        res.statusCode = 400;
                                        res.send(err);       
                                }
                
                                res.json(articles);
                                
                        });
                        
                } else {
                        
                        filter.encoded_url = article_id_url;
                        
                        Articles
                        .findOne(filter, null, {sort: {updated: -1}})
                        .populate(['images', 'products'])
                        .exec(function(err, articles) {
                                
                                if (err) {
                                        
                                        res.statusCode = 400;
                                        res.send(err);       
                                }
                
                                res.json(articles);
                                
                        });
                        
                }

        });

        app.post('/v1/articles', utils.ensureAdmin, function(req, res) {

                Articles.create({

                        title : req.body.title,

                        content : req.body.content,
                        
                        img : 'http://images.elasticbeanstalk.com/300/https://s3-sa-east-1.amazonaws.com/fodev/img/global/logo.png',
                        
                        encoded_url : req.body.encoded_url,
                        
                        highlight : req.body.highlight,
                        
                        products : req.body.products,
                        
                        active : req.body.active

                }, function(err, article) {

                        if (err){
                                
                                res.statusCode = 400;
                                
                                res.send(err);
                                
                        } else {
                                
                                res.json(article);
                                
                        }

                });

        });

        app.post('/v1/article/:article_id/product', utils.ensureAdmin, function(req, res) {

                Articles.create({

                        title : req.body.title,

                        content : req.body.content,
                        
                        img : req.body.img,
                        
                        images : req.body.images,
                        
                        encoded_url : req.body.encoded_url,
                        
                        highlight : req.body.highlight,
                        
                        products : req.body.products,
                        
                        active : req.body.active

                }, function(err, article) {

                        if (err){
                                
                                res.statusCode = 400;
                                
                                res.send(err);
                                
                        } else {
                                
                                res.json(article);
                                
                        }

                });

        });

        app.put('/v1/articles/:article_id', utils.ensureAdmin, function(req, res){

                return Articles.findById(req.params.article_id, function(err, article) {
                        
                        if (err) {
                                
                                res.statusCode = 400;

                                return res.send(err);
                                
                        } else {
                                
                                article.title = req.body.title;
                                
                                article.content = req.body.content;
                                
                                article.img = req.body.img;
                                
                                article.images = req.body.images;
                                
                                article.encoded_url = req.body.encoded_url;
                                
                                article.highlight = req.body.highlight;
                                
                                article.products = req.body.products;
                                
                                article.active = req.body.active;

                                return article.save(function(err, updatedArticle) {
        
                                        if (err) {
                                                
                                                res.statusCode = 400;
        
                                                return res.send(err);
        
                                        } else {
                                                
                                                return res.send(updatedArticle);
                                                
                                        }
        
                                });
                                
                        }

                });

        });

        app.delete('/v1/articles/:article_id', utils.ensureAdmin, function(req, res) {

                Articles.remove({

                        _id : req.params.article_id

                }, function(err, article) {

                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);
                                
                        } else {

                                Articles.find(function(err, articles) {
        
                                        if (err) {
                                                res.statusCode = 400;
                                                res.send(err);
                                        } else {
        
                                                res.json(articles);
                                                
                                        }
        
                                });

                        }

                });

        });

        // for boots
        app.get('/blog/:encoded_url', utils.getRequestUser, function(req, res) {

                var path = require('path');
                
                var isBoot = req.headers['user-agent'].search(/Google|Twitterbot|facebookexternalhit|bot|crawler|baiduspider|80legs|ia_archiver|voyager|curl|wget|yahoo! slurp|mediapartners-google/i) > -1;
                
		if (isBoot) {
		
                        var article_id_url = req.params.encoded_url;
                        
                        var isObjectId = mongoose.Types.ObjectId.isValid(article_id_url);
                        
                        var filter = {};
                        
                        if(!req.user || req.user.kind != 'admin') filter.active = 1;
                        
                        if(isObjectId){
                                
                                filter._id = article_id_url;
                                
                                Articles
                                .findOne(filter, null, {sort: {updated: -1}})
                                .populate(['images', 'products'])
                                .exec(function(err, article) {
                                        
                                        if (err) {
                                                
                                                res.statusCode = 400;
                                                res.send(err);       
                                        }
                                        
                                        res.render('articles/article_meta_tags', {article:article});
                                        
                                });
                                
                        } else {
                                
                                filter.encoded_url = article_id_url;
                                
                                Articles
                                .findOne(filter, null, {sort: {updated: -1}})
                                .populate(['images', 'products'])
                                .exec(function(err, article) {
                                        
                                        if (err) {
                                                
                                                res.statusCode = 400;
                                                res.send(err);       
                                        }
                                        
                                        res.render('articles/article_meta_tags', {article:article});
                                        
                                });
                                
                        }
                
		} else {
		        
                        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
                        
                        res.sendFile(file);
		        
		}

        });
        
}
