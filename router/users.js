"use strict";

module.exports=function(app, mongoose, utils, config) {
        
        var jwt = require("jsonwebtoken");
        
        var Users = require('./../modules/Users.js');

        app.get('/v1/users', utils.ensureAdmin, function(req, res) {

                Users.find(function(err, users) {

                        if (err) {
                            
                            res.statusCode = 400;
                            
                            res.send(err)
                            
                        } else {
                            
                            res.json(users);
                            
                        }

                });

        });

        app.get('/v1/users/:user_id', utils.ensureAdmin, function(req, res) {

                Users.find({_id: req.params.user_id}, function(err, user) {

                        if (err) {
                            
                            res.statusCode = 400;
                            
                            res.send(err)
                            
                        } else {
                            
                            res.json(user);
                            
                        }

                });

        });

        app.post('/v1/signin', function(req, res) {
                Users.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
                        if (err) {
                            
                            res.statusCode = 400;
                            
                            res.json({
                                type: false,
                                data: "Erro: " + err
                            });
                        } else {

                            if (user) {
                                
                                user.token = '';
                                    
                                user.token = jwt.sign(user, config.APP_PRIVATE_KEY);
                                
                                user.save(function(err, updated_user) {
                                
                                        if(err) {
                                            
                                            res.statusCode = 400;

                                            res.send(err);

                                        } else {

                                                updated_user = updated_user.toObject(); // swap for a plain javascript object instance

                                                res.json({
                                                        type: true,
                                                        data: updated_user,
                                                        token: updated_user.token
                                                });       

                                        }
                                
                                });
                                    
                            } else {
                                
                                res.statusCode = 400;
                                
                                res.json({
                                    type: false,
                                    data: "E-mail e senha não combinam! Tente novamente."
                                });

                            }

                        }

                });

        });

        app.post('/v1/signup', function(req, res) {

                Users.findOne({email: req.body.email, password: req.body.password}, function(err, user) {

                        if (err) {
                            
                            res.statusCode = 400;
                                
                            res.json({
                                type: false,
                                data: "Erro: " + err
                            });
                            
                        } else {
                                
                            if (user) {
                                
                                res.statusCode = 400;
                                    
                                res.json({
                                    type: false,
                                    data: "E-mail já foi cadastrado. Tente <a href='#/reset_password'>recuperar sua senha</a>!"
                                });
                                
                            } else {
                                    
                                Users.create({
                
                                        name : req.body.name,
                
                                        email : req.body.email,
                                        
                                        password : req.body.password
                
                                }, function(err, user) {
                
                                        if (err) {
                                            
                                            res.statusCode = 400;
                
                                            res.send(err);
                                        
                                        } else {
                                            
                                            user.token = '';
                                                
                                            user.token = jwt.sign(user, config.APP_PRIVATE_KEY);
                                        
                                            user.save(function(err, new_user) {
                                                    
                                                    if(err) {
                                                        
                                                        res.statusCode = 400;
                                                        
                                                        res.send(err);
                                                        
                                                    } else {
                                                        new_user = new_user.toObject(); // swap for a plain javascript object instance
                                                        send_user_email(new_user);
                                                        delete new_user["_id"];
                                                        delete new_user["password"];
                                                        res.json({
                                                            type: true,
                                                            data: new_user,
                                                            token: new_user.token
                                                        });       
                                                    }

                                            });
                                                
                                        }
                
                                });

                            }
                        }
                });
        });
        
        app.get('/v1/me', utils.ensureAuthorized, function(req, res) {
                Users.findOne({token: req.token}, function(err, user) {
                        if (err) {
                            
                            res.statusCode = 400;
                            
                            res.json({
                                type: false,
                                data: "Error occured: " + err
                            });
                        } else {
                                user = user.toObject(); // swap for a plain javascript object instance
                                delete user["_id"];
                                delete user["password"];
                                res.json({
                                        type: true,
                                        data: user
                                });
                        }
                });
        });

    var send_user_email = function(user){
        
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
              
                template('users/signup', user, function(err, html, text) {
                    
                    if (err) {
                        console.log(err);
                    } else {
                        var mailOptions = {
                            from: 'Feira Orgânica Delivery <info@feiraorganica.com>', //sender address
                            replyTo: "info@feiraorganica.com",
                            to: user.email, // list of receivers
                            cc: 'info@feiraorganica.com', // lredirects to 'bruno@tzadi.com, denisefaccin@gmail.com'
                            subject: 'Bem vindo a Feira Orgânica Delivery',
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
