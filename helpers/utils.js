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