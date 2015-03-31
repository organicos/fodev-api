"use strict";

module.exports=function(app, mongoose) {

    var Tickets = mongoose.model('Tickets', {
        kind : String,
        email: String,
        name: String,
        phone: String,
        msg: String,
        updated: { type: Date, default: Date.now }
    });

    Tickets.schema.path('kind').validate(function (value) {
        return /contact|support|improvment/i.test(value);
    }, 'Invalid kind.');

    Tickets.schema.path('email').validate(function (value) {
        var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(value);
    }, 'Invalid email.');

    Tickets.schema.path('msg').validate(function (value) {
        return value.length > 20;
    }, 'Invalid message. Messages must have at least 20 characters.');

    app.get('/api/tickets', function(req, res) {
        Tickets.find(function(err, tickets) {
            if (err){
                res.statusCode = 400;
                res.send(err);
            } else {
                res.json(tickets);
            }
        });
    });
    
    app.post('/api/tickets', function(req, res) {
        
        Tickets.create({

            kind : req.body.kind,

            email: req.body.email,
            
            name: req.body.name,
            
            phone: req.body.phone,
            
            msg: req.body.msg

        }, function(err, ticket) {

            if (err) {
                    res.statusCode = 400;
                    res.send(err);
            } else {
                
                Tickets.find(function(err, tickets) {

                    if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);
                        
                    } else {

                        send_ticket_email(ticket);

                        res.json(tickets);
                        
                    }

                });   
                
            }

        });
    });
        
    var send_ticket_email = function(ticket){
        
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
              
                template('tickets/' + ticket.kind, ticket, function(err, html, text) {
                    if (err) {
                        console.log(err);
                    } else {
                        var mailOptions = {
                            from: 'Feira Orgânica Delivery <info@feiraorganica.com>', //sender address
                            replyTo: "info@feiraorganica.com",
                            to: ticket.email, // list of receivers
                            cc: 'info@feiraorganica.com', // list of BCC receivers 'bruno@tzadi.com, denisefaccin@gmail.com'
                            subject: 'Contato recebido',
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