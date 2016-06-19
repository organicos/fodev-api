"use strict";

module.exports=function(app, mongoose, utils, config, sanitize) {

        var Articles = require('./../models/Articles.js');
        var Products = require('./../models/Products.js');
        var Visits = require('./../models/Visits.js');
        var ObjectId = mongoose.Types.ObjectId;
        


        app.get('/v1/articles', utils.getRequestUser, function(req, res) {
                var filter = {};
                if(!req.user || req.user.kind != 'admin') filter.active = 1;
                Articles
                .find(filter)
                .sort({updated: -1})
                .populate(['images', 'author'])
                .exec(function(err, articles) {
                        if (err) {
                                res.statusCode = 400;
                                res.send(err);       
                        }
                        res.json(articles);
                });
        });

        app.get('/v1/articles/category/:slug_or_id', utils.getRequestUser, function(req, res) {
                var slug_or_id = req.params.slug_or_id;
                var filter = {
                        'categories.slug': slug_or_id
                };
                if(!req.user || req.user.kind != 'admin') filter.active = 1;
                Articles
                .find(filter)
                .sort({updated: -1})
                .populate(['images', 'author'])
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
                filter.$or = [{slug: slug_or_id}];
                if (utils.isObjectId(slug_or_id)) {
                        filter.$or.push({_id: slug_or_id});
                }
                Articles
                .findOne(filter)
                .sort({updated: -1})
                .deepPopulate(['author', 'author.profile_img', 'images', 'products', 'products.images', 'products.prices'])
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
                                                Articles.deepPopulate(updatedArtile, ['images', 'author', 'author.profile_img', 'products', 'products.images', 'products.prices', 'visits'], function(err, updatedArticlePopulated) {
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

        app.post('/v1/article', utils.cleanBody, utils.ensureAdmin, function(req, res) {
                Articles.create({
                        title : req.body.title,
                        author : req.body.author,
                        content : req.body.content,
                        categories : req.body.categories,
                        img : 'https://s3-sa-east-1.amazonaws.com/fodev/img/global/logo.png',
                        slug : req.body.slug,
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

        app.put('/v1/article/:article_id', utils.cleanBody, utils.ensureAdmin, function(req, res){
                return Articles
                .findById(req.params.article_id)
                .exec(function(err, article) {
                        if (err) {
                                res.statusCode = 400;
                                return res.send(err);
                        } else {
                                req.body.categories = req.body.categories.map(function(category){
                                        category.subcategories = [];
                                        return category;
                                });
                                req.body.subcategories = [];
                                console.log(req.body.categories);
                                article.title = req.body.title;
                                article.author = req.body.author;
                                article.content = req.body.content;
                                article.categories = req.body.categories;
                                article.images = req.body.images;
                                article.slug = req.body.slug;
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
                        filter.$or = [{slug: slug_or_id}];
                        if (utils.isObjectId(slug_or_id)) {
                                filter.$or.push({_id: slug_or_id});
                        }
                        Articles
                        .findOne(filter)
                        .sort({updated: -1})
                        .deepPopulate(['images', 'products'])
                        .exec(function(err, article) {
                                if (err) {
                                        res.statusCode = 400;
                                        res.send(err);       
                                }
                                res.render('articles/article_meta_tags', {article:article});
                        });
                } else {
                        var file = path.resolve(config.clientPath+'/index.html');
                        res.sendFile(file);
                }
        });
}
