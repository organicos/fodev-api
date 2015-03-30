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
        res.send(403);
    }
}

exports.ensureAuthorized = ensureAuthorized;

function ensureAdmin(req, res, next) {
    getUserKind(req, function(userKind) {
       if (userKind == 'admin') {
           next();
       } else {
           res.send(403);
       }
    });
}

exports.ensureAdmin = ensureAdmin;

var config = require('./../config/development/config');
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