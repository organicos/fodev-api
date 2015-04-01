"use strict";

module.exports=function(app, mongoose, moment, utils) {

        var Articles = mongoose.model('Articles', {

                title : { type: String, required: 'Informe o nome do artigo!' },

                content: { type: String, required: 'Informe conteúdo do artigo!' },
                
                encoded_url: { type: String, required: 'Informe a url codificada!' },
                
                img: { type: String },
                
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
                
                var article_id_url = req.params.encoded_url;
                
                var isObjectId = mongoose.Types.ObjectId.isValid(article_id_url);
                
                if(isObjectId){
                        
                        Articles.findOne({_id: req.params.encoded_url}, function(err, article) {
        
                                if (err){
                                        res.statusCode = 400;
                                        res.send(err);
                                } else {
                                        
                                        res.json(article);
                                        
                                }
        
                        });
                        
                } else {
                        
                        Articles.findOne({encoded_url: req.params.encoded_url}, function(err, article) {
        
                                if (err){
                                        res.statusCode = 400;
                                        res.send(err);
                                } else {
                                        
                                        res.json(article);
                                        
                                }
        
                        });
                        
                }

        });

        app.post('/v1/articles', utils.ensureAuthorized, function(req, res) {

                Articles.create({

                        title : req.body.title,

                        content : req.body.content,
                        
                        img : req.body.img,
                        
                        encoded_url : req.body.encoded_url

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
