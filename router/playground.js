"use strict";

module.exports=function(app, mongoose, moment, config, utils) {

    var Articles = require('./../modules/Articles.js');
    
    var Users = require('./../modules/Users.js');
    
    var Products = require('./../modules/Products.js');
    
    var Images = require('./../modules/Images.js');
    
    
    
    

    app.get('/v1/playground', function(req, res) {

       res.send('Você não deveria estar aqui!');
        
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