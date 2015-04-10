"use strict";

module.exports=function(app, mongoose, moment, utils) {

        var Articles = mongoose.model('Articles', {

                title : { type: String, required: 'Informe o nome do artigo!' },

                content: { type: String, required: 'Informe conteúdo do artigo!' },
                
                encoded_url: { type: String, required: 'Informe a url codificada!' },
                
                img: { type: String },
                
                highlight : { type: Boolean, default: false },
                
                active : { type: Boolean, default: true },
                
                updated: { type: Date, default: moment().format("MM/DD/YYYY") }

        });

        app.get('/v1/articles', function(req, res) {
                
                utils.getUserKind(req, function(userKind){
                        
                        var filter = {};
                        
                        if(userKind != 'admin') filter.active = 1;
                        
                        Articles.find(filter, null, {sort: {title: 1}}, function(err, articles) {

                                if (err) {
                                        
                                        res.statusCode = 400;
                                        res.send(err);       
                                }
        
                                res.json(articles);
        
                        });

                });

        });

        app.get('/v1/article/:encoded_url', function(req, res) {
                
                utils.getUserKind(req, function(userKind){
                        
                        var article_id_url = req.params.encoded_url;
                        
                        var isObjectId = mongoose.Types.ObjectId.isValid(article_id_url);
                        
                        var filter = {};
                        
                        if(userKind != 'admin') filter.active = 1;
                        
                        if(isObjectId){
                                
                                filter._id = article_id_url;
                                
                                Articles.findOne(filter, null, function(err, article) {
                
                                        if (err){
                                                res.statusCode = 400;
                                                res.send(err);
                                        } else {
                                                
                                                res.json(article);
                                                
                                        }
                
                                });
                                
                        } else {
                                
                                filter.encoded_url = article_id_url;
                                
                                Articles.findOne(filter, null, function(err, article) {
                
                                        if (err){
                                                res.statusCode = 400;
                                                res.send(err);
                                        } else {
                                                
                                                res.json(article);
                                                
                                        }
                
                                });
                                
                        }

                });
                


        });

        app.get('/blog/:encoded_url', function(req, res) {

                var path = require('path');
                
                var isBoot = req.headers['user-agent'].search(/Google|Twitterbot|facebookexternalhit|bot|crawler|baiduspider|80legs|ia_archiver|voyager|curl|wget|yahoo! slurp|mediapartners-google/i) > -1;
                
		if (isBoot) {
		
                        utils.getUserKind(req, function(userKind){
                                
                                var article_id_url = req.params.encoded_url;
                                
                                var isObjectId = mongoose.Types.ObjectId.isValid(article_id_url);
                                
                                var filter = {};
                                
                                if(userKind != 'admin') filter.active = 1;
                                
                                if(isObjectId){
                                        
                                        filter._id = article_id_url;
                                        
                                        Articles.findOne(filter, null, function(err, article) {
                        
                                                if (err){
                                                        res.statusCode = 400;
                                                        res.send(err);
                                                } else {
                                                        
                                                        res.render('articles/article_meta_tags', {article:article});
                                                        
                                                }
                        
                                        });
                                        
                                } else {
                                        
                                        filter.encoded_url = article_id_url;
                                        
                                        Articles.findOne(filter, null, function(err, article) {
                        
                                                if (err){
                                                        res.statusCode = 400;
                                                        res.send(err);
                                                } else {
                                                        
                                                        res.render('articles/article_meta_tags', {article:article});
                                                        
                                                }
                        
                                        });
                                        
                                }
        
                        });
                
		} else {
		        
                        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
                        
                        res.sendFile(file);
		        
		}

        });
        
        app.get('/fair/product/:product_id', function(req, res) {
                
                var path = require('path');
                
                var isBoot = req.headers['user-agent'].search(/Google|Twitterbot|facebookexternalhit|bot|crawler|baiduspider|80legs|ia_archiver|voyager|curl|wget|yahoo! slurp|mediapartners-google/i) > -1;
                
		if (isBoot) {
		
                        utils.getUserKind(req, function(userKind){
                                
                                var filter = {_id: req.params.product_id, active: 1};

                                Products.findOne(filter, null, function(err, product) {
                
                                        if (err){
                                                res.statusCode = 400;
                                                res.send(err);
                                        } else {
                                                
                                                res.render('products/product_meta_tags', {product:product});
                                                
                                        }
                
                                });
        
                        });

		} else {
		        
                        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
                        
                        res.sendFile(file);
		        
		}

        });

        app.post('/v1/articles', utils.ensureAuthorized, function(req, res) {

                Articles.create({

                        title : req.body.title,

                        content : req.body.content,
                        
                        img : req.body.img,
                        
                        encoded_url : req.body.encoded_url,
                        
                        highlight : req.body.highlight,
                        
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

        app.put('/v1/articles/:article_id', utils.ensureAuthorized, function(req, res){

                return Articles.findById(req.params.article_id, function(err, article) {
                        
                        if (err) {
                                
                                res.statusCode = 400;

                                return res.send(err);
                                
                        } else {
                                
                                article.title = req.body.title;
                                
                                article.content = req.body.content;
                                
                                article.img = req.body.img;
                                
                                article.encoded_url = req.body.encoded_url;
                                
                                article.highlight = req.body.highlight;
                                
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

        app.delete('/v1/articles/:article_id', utils.ensureAuthorized, function(req, res) {

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

}
