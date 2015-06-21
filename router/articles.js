"use strict";

module.exports=function(app, mongoose, utils) {
        
        var Articles = require('./../modules/Articles.js');
        
        var Products = require('./../modules/Products.js');
        
        var Visits = require('./../modules/Visits.js');
        
        var ObjectId = mongoose.Types.ObjectId;
        
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

        app.get('/v1/article/:slug_or_id', utils.getRequestUser, function(req, res) {
                
                var filter = {};
                
                if(!req.user || req.user.kind != 'admin') filter.active = 1;
                
                var slug_or_id = req.params.slug_or_id;
                
                filter.$or = [{encoded_url: slug_or_id}];

                if (utils.isObjectId(slug_or_id)) {

                        filter.$or.push({_id: slug_or_id});

                }
                
                Articles
                .findOne(filter, null, {sort: {updated: -1}})
                .deepPopulate(['images', 'products', 'products.images', 'visits'])
                .exec(function(err, article) {
                        
                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);       
                        }
        
                        if(article && (!req.user || req.user.kind != 'admin')){
                                
                                var visit = {};
                                
                                if(req.user) visit.user = req.user._id;
                                
                                Visits.create(visit, function(err, newVisit){
                                        
                                        article.visits.push(newVisit);
                                        
                                        article.save(function(err, updatedArtile){
                                                
                                                Articles.deepPopulate(updatedArtile, ['images', 'products', 'products.images', 'visits'], function(err, updatedArticlePopulated) {
                                                
                                                        if (err) {
                                                                
                                                                res.statusCode = 400;
                                                        
                                                                return res.send(err);
                                                        
                                                        } else {
                                                                
                                                                updatedArticlePopulated = updatedArticlePopulated.toObject();
                                                        
                                                                updatedArticlePopulated.visits = updatedArticlePopulated.visits.length;
                                                            
                                                                res.json(updatedArticlePopulated);
                                                            
                                                        }
                                                
                                                });

                                        });
                                        
                                });
                                
                        } else {
                         
                                res.json(article);
                                
                        }
                        
                });

        });

        app.post('/v1/article', utils.ensureAdmin, function(req, res) {

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

        app.put('/v1/article/:article_id', utils.ensureAdmin, function(req, res){

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

        app.delete('/v1/article/:article_id', utils.ensureAdmin, function(req, res) {

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
        app.get('/blog/:slug_or_id', utils.getRequestUser, function(req, res) {

                var path = require('path');
                
                var isBoot = req.headers['user-agent'].search(/Google|Twitterbot|facebookexternalhit|bot|crawler|baiduspider|80legs|ia_archiver|voyager|curl|wget|yahoo! slurp|mediapartners-google/i) > -1;
                
		if (isBoot) {
		
                        var filter = {};
                        
                        if(!req.user || req.user.kind != 'admin') filter.active = 1;
                        
                        var slug_or_id = req.params.slug_or_id;
                        
                        filter.$or = [{encoded_url: slug_or_id}];
        
                        if (utils.isObjectId(slug_or_id)) {
        
                                filter.$or.push({_id: slug_or_id});
        
                        }
                        
                        Articles
                        .findOne(filter, null, {sort: {updated: -1}})
                        .deepPopulate(['images', 'products'])
                        .exec(function(err, article) {
                                
                                if (err) {
                                        
                                        res.statusCode = 400;
                                        res.send(err);       
                                }
                                
                                res.render('articles/article_meta_tags', {article:article});
                                
                        });
                
		} else {
		        
                        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
                        
                        res.sendFile(file);
		        
		}

        });
        
}
