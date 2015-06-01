"use strict";

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

exports.ensureAuthorized = ensureAuthorized;

function ensureAdmin(req, res, next) {
    getUserKind(req, function(userKind) {
       if (userKind == 'admin') {
           next();
       } else {
           res.sendStatus(403);
       }
    });
}

exports.ensureAdmin = ensureAdmin;

var config = require('./../config/env_config');
var jwt = require("jsonwebtoken");

function getUserKind(req, callback){
    
    var bearerHeader = req.headers["authorization"];
    
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        // verify a token symmetric
        jwt.verify( bearer[1], config.APP_PRIVATE_KEY, function(err, decoded) {

            callback(decoded.kind);

        });   

    } else {

        callback('');

    }
    
}

exports.getUserKind = getUserKind;

function getRequestUser(req, res, next){
    
    var bearerHeader = req.headers["authorization"];
    
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        // verify a token symmetric
        jwt.verify( bearer[1], config.APP_PRIVATE_KEY, function(err, decoded) {
            
            req.user = decoded;
            next();

        });   

    } else {

        req.user = null;
        next();

    }
    
}

exports.getRequestUser = getRequestUser;




function sendMail(mailConfig){
    
    var path = require('path');
    var templatesDir   = path.join(__dirname, '../templates/');
    
    var nodemailer =        require('nodemailer');
    var mandrillTransport = require('nodemailer-mandrill-transport');
    var emailTemplates =    require('email-templates');
    var appConfig =         require('./../config/env_config');

    var transporter = nodemailer.createTransport(mandrillTransport({
        auth: {
            apiKey: appConfig.mandrill.apiKey
        }
    }));
    
    // ensure array
    if(typeof mailConfig.receivers == 'string'){
        mailConfig.receivers = [mailConfig.receivers];
    }

    if(mailConfig.copyAdmins){
        
        mailConfig.receivers.push('bruno@tzadi.com', 'denisefaccin@gmail.com');
        
    }

    emailTemplates(templatesDir, function(err, template) {

        if (err) {
            console.log(err);
        } else {
          
            template(mailConfig.template, mailConfig.data, function(err, html, text) {
                
                if (err) {
                    console.log(err);
                } else {

                    transporter.sendMail({
                        from: appConfig.mail.from,
                        replyTo: appConfig.mail.replyTo,
                        to: mailConfig.receivers.toString(),
                        subject: appConfig.envTag + mailConfig.subject,
                        text: text,
                        html: html
                    }, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent');
                            console.log(info);
                        }
                    });
                    
                }

            });

        }

    });

}

exports.sendMail = sendMail;

function isObjectId(a){
    
    return a.match(/^[0-9a-fA-F]{24}$/);
    
}

exports.isObjectId = isObjectId;