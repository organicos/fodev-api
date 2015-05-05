"use strict";

module.exports=function(app, mongoose, config, utils) {
    
    var Schema = mongoose.Schema;
    
    var Users = require('./../modules/Users.js');
    var Products = require('./../modules/Products.js');
    var Articles = require('./../modules/Articles.js');
    
    var crypto = require('crypto');

    var Newsletters = mongoose.model('Newsletters', {
        title: { type : String, required: "informe o título da newsletter" }
        , intro: { type : String, required: "informe a introdução da newsletter" }
        , footer: { type : String, required: "informe o rodapé da newsletter" }
        , products: [{ type : Schema.Types.ObjectId, ref: 'Products' }]
        , articles: [{ type : Schema.Types.ObjectId, ref: 'Articles' }]
        , status: {type: Number, required: "Informe o status da newsletter", default: 0}
        , updated: { type: Date, default: Date.now }
    });
    
    app.get('/v1/newsletters', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Newsletters.find(function(err, users) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(users);
                
            }

        });

    });
    
    
    
    
    
    
    
    
    
    
    // IMPORTANTE!
    //
    //
    // O GMAIL TEM LIMITE DE 2000 ENDEREÇOS POR EMAIL. LOGO, DEVE HAVER UM TRATAMENTO NA HORA DE ENVIAR OS E-MAILS PARA QUE NÃO EXCEDA ESTE LIMITE!!!
    //
    //
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    app.post('/v1/newsletter/signup', function(req, res) {
        
        Users.findOne({email: req.body.email}, function(err, user) {

            if (err) {
                
                res.statusCode = 400;
                    
                res.json({
                    type: false,
                    data: "Erro: " + err
                });
                
            } else {
                    
                if (user) {
                    
                    user.newsletter = true;
                    
                    user.save(function(err, new_user) {
                            
                        if(err) {
                            
                            res.statusCode = 400;
                            
                            res.send(err);
                            
                        } else {

                            res.json({
                                type: true,
                                data: "Cadastrado realizado com sucesso!"
                            });

                        }

                    });
                        
                } else {
                    
                    Users.create({
    
                            name : req.body.email,
    
                            email : req.body.email,
                            
                            newsletter : true,
                            
                            kind : 'newsletter',
                            
                            password : crypto.createHash('md5').update(req.body.email).digest('hex')
    
                    }, function(err, user) {
    
                            if (err) {
                                
                                res.statusCode = 400;
    
                                res.send(err);
                            
                            } else {
                                
                                user.password = req.body.email;
                                
                                send_newsletter_signup_email(user);
                                
                                res.json({
                                    type: true,
                                    data: "Cadastrado realizado com sucesso!"
                                });
                                    
                            }
    
                    });

                }
            }
        });
    });
        
    var send_newsletter_signup_email = function(user){
        
        var nodemailer = require('nodemailer');
        var path = require('path');
        var templatesDir   = path.join(__dirname, '../templates');
        var emailTemplates = require('email-templates');

        var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // 465
            secure: true, // true
            debug : true,
            auth: {
                user: 'bruno@tzadi.com',
                pass: 'Dublin2010ireland'
            }
        });

        emailTemplates(templatesDir, function(err, template) {
             
            if (err) {
                console.log(err);
            } else {
              
                template('newsletter/signup', user, function(err, html, text) {
                    if (err) {
                        console.log(err);
                    } else {
                        var mailOptions = {
                            from: 'Feira Orgânica Delivery <info@feiraorganica.com>', //sender address
                            replyTo: "info@feiraorganica.com",
                            to: user.email, // list of receivers
                            cc: 'info@feiraorganica.com', // list of BCC receivers 'bruno@tzadi.com, denisefaccin@gmail.com'
                            subject: config.envTag + 'Assinatura de newsletter',
                            text: text,
                            html: html
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                console.log(error);
                            }else{
                                console.log('Message sent: ' + info.response);
                            }
                        });
                    }
                });
            }
        });
    }
}