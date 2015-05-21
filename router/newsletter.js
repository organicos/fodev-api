"use strict";

module.exports=function(app, mongoose, config, utils) {
    
    var Schema = mongoose.Schema;
    
    var Users = require('./../modules/Users.js');
    var Products = require('./../modules/Products.js');
    var Articles = require('./../modules/Articles.js');
    
    var crypto = require('crypto');
    
    var Newsletters = mongoose.model('Newsletters', {
        title: { type : String, required: "informe o título da newsletter" }
        , top: { type : String, required: "informe a introdução da newsletter" }
        , bottom: { type : String }
        , sections: { type: [{
            title: { type : String, required: "informe o título da seção" }
            , top: { type : String, required: "informe a introdução da seção" }
            , bottom: { type : String }
            , products: []
            , articles: []
        }]}
        , receivers : []
        , status: {type: Number, required: "Informe o status da newsletter", default: 0}
        , updated: { type: Date, default: Date.now }
    });
    
    app.get('/v1/newsletters', utils.getRequestUser, function(req, res) {

        var filter = {};
        
        if(!req.user || req.user.kind != 'admin') {
            filter.status = 1;
        }
        
        Newsletters
        .find(filter, null, {sort: {updated: -1}})
        .deepPopulate(['sections'])
        .exec(function(err, newsletters) {
                
                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);       
                } else {
                 
                        res.json(newsletters);
                        
                }
                
        });
                        
    });

    app.get('/news/:id', utils.getRequestUser, function(req, res) {
        
        console.log(req.user);
        
        var filter = {_id: req.params.id};
        
        Newsletters
        .findOne(filter)
        .deepPopulate(['sections'])
        .exec(function(err, newsletter) {
                
                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);       
                } else {
                    
                    var helper = {
                        groupIntoRows : function(input, count){
                            var rows = [];
                            for (var i = 0; i < input.length; i++) {
                                if ( i % count == 0) rows.push([]);
                                    rows[rows.length-1].push(input[i]);
                            }
                            return rows;
                        }
                    };
                    
                    res.render('../templates/newsletter/news/html.jade', {newsletter:newsletter, helper: helper});
                 
                }
                
        });

    });

    app.post('/v1/newsletter/:id/send', utils.ensureAdmin, function(req, res) {
        
        var filter = {_id: req.body._id};
        
        Newsletters
        .findOne(filter)
        .deepPopulate(['sections'])
        .exec(function(err, newsletter) {
                
                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);

                } else {
                    
                    if(!newsletter){
                        
                        res.statusCode = 400;
                        res.send({errors: {
                            city: {message: 'Newsletter não encontrada.'}
                        }});

                    } else {
                        
                        if(newsletter.status == 1){
                            
                            res.statusCode = 400;
                            res.send({errors: {
                                city: {message: 'Newsletter já foi enviada.'}
                            }});
                            
                        } else {
                            
                            var helper = {
                                groupIntoRows : function(input, count){
                                    var rows = [];
                                    for (var i = 0; i < input.length; i++) {
                                        if ( i % count == 0) rows.push([]);
                                            rows[rows.length-1].push(input[i]);
                                    }
                                    return rows;
                                }
                            };
                            
                            Users.find({newsletter: 1}, function(err, users){
                                
                                if(err){
                                    
                                } else {
                                    
                                    if(config.env == 'dev'){
                                        
                                        newsletter.receivers = ['brunohamp@hotmail.com', 'ise_faccin@yahoo.com.br'];
                                        
                                        send_newsletter({newsletter:newsletter, helper: helper});
                        
                                        newsletter.status = 1;
                                        
                                        newsletter.save(function(err, updatedNewsletter){
                                            
                                            res.json(updatedNewsletter);
                                            
                                        });
                                        
                                    } else {
                                        
                                        for (var i in users) {

                                            var email = users[i].email;
                                            
                                            newsletter.receivers.push(email);
                                            
                                            if(i == (users.length - 1)){
                                                
                                                send_newsletter({newsletter:newsletter, helper: helper});
                                
                                                newsletter.status = 1;
                                                
                                                newsletter.save(function(err, updatedNewsletter){
                                                    
                                                    res.json(updatedNewsletter);
                                                    
                                                });
                                                
                                            }
                                                
                                        }
                                        
                                    }
                                    
                                }
                                
                                
                            });
                            
                        }                        
                        
                    }
                    
                }
                
        });

    });

    app.get('/v1/newsletter/:id', utils.getRequestUser, function(req, res) {
        
        var filter = {_id: req.params.id};
        


        Newsletters
        .findOne(filter)
        .deepPopulate(['sections'])
        .exec(function(err, newsletter) {
                
                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);       
                } else {
                 
                        res.json(newsletter);
                        
                        
                }
                
        });

    });
    
    app.post('/v1/newsletter', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Newsletters.create({

            title: req.body.title
            , top: req.body.top
            , bottom: req.body.bottom
            , sections: req.body.sections
            , status: 0

        }, function(err, newsletter) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(newsletter); 
                        
                }

        });

    });
    
    app.put('/v1/newsletter/:id', utils.ensureAdmin, function(req, res){

            return Newsletters.findById(req.params.id, function(err, newsletter) {
                    
                    if (err) {
                            
                            res.statusCode = 400;

                            return res.send(err);
                            
                    } else {
                            
                            newsletter.title = req.body.title;
                            newsletter.top = req.body.top;
                            newsletter.bottom = req.body.bottom;
                            newsletter.sections = req.body.sections;
                            newsletter.status = req.body.status;

                            return newsletter.save(function(err, updatedNewsletter) {
    
                                    if (err) {
                                            
                                            res.statusCode = 400;
    
                                            return res.send(err);
    
                                    } else {
                                            
                                            return res.send(updatedNewsletter);
                                            
                                    }
    
                            });
                            
                    }

            });

    });
    
    
    // IMPORTANTE!
    //
    //
    // O GMAIL TEM LIMITE DE 2000 ENDEREÇOS POR EMAIL. LOGO, DEVE HAVER UM TRATAMENTO NA HORA DE ENVIAR OS E-MAILS PARA QUE NÃO EXCEDA ESTE LIMITE!!!
    //
    //    
    var send_newsletter = function(mailData){
        
        utils.sendMail({
            template: 'newsletter/news'
            , data: mailData
            , subject: config.envTag + 'Produtos e artigos da semana.'
            , receivers: mailData.newsletter.receivers
        })

    }
    
}