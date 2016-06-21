"use strict";
var sanitize            = require("mongo-sanitize");
var nodemailer          = require('nodemailer');
var mandrillTransport   = require('nodemailer-mandrill-transport');
var emailTemplates      = require('email-templates');
var jwt                 = require("jsonwebtoken");
var path                = require('path');
var moment              = require('moment');
var config              = require('./../config/env_config');

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        console.log('Not authorized!', req);
        res.sendStatus(403);
    }
}

exports.ensureAuthorized = ensureAuthorized;

function ensureAdmin(req, res, next) {
    getUserKind(req, function(userKind) {
       if (userKind == 'admin') {
           next();
       } else {
            console.log('Not admin!', userKind, req);
            res.sendStatus(403);
       }
    });
}

exports.ensureAdmin = ensureAdmin;

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
    
    mailConfig.data.moment = moment;
    
    var templatesDir   = path.join(__dirname, '../templates/');
    
    var transporter = nodemailer.createTransport(mandrillTransport({
        auth: {
            apiKey: config.mandrill.apiKey
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
                        from: config.mail.from,
                        replyTo: config.mail.replyTo,
                        to: mailConfig.receivers.toString(),
                        subject: config.envTag + mailConfig.subject,
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

function makeSlug(str, leaveExtension){

    var extension = '';
    
    if(leaveExtension){
        extension = '.' + str.split('.').pop();
        str = str.substr(0, str.lastIndexOf('.'));
    }

    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    
    // remove accents, swap ñ for n, etc
    var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeeiiiiooooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
    
    return str + extension;
};

exports.makeSlug = makeSlug;

function cleanBody(req, res, next) {
  req.body = sanitize(req.body);
  next();
}

exports.cleanBody = cleanBody;