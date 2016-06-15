"use strict";

// Load dependences
var express  = require('express');
var app = express(); // CREATE OUR APP W/ EXPRESS
var moment  = require('moment');
app.locals.moment = moment;
var https = require('https');
var http = require('http');
var fs = require('fs');
var deepPopulate = require('mongoose-deep-populate'); // DEEPPOPULATE FOR MONGOOSE TO POPULATE MULTIDIMENSIONAL OBJECTS
var mongoose = require('mongoose'); // MONGOOSE FOR MONGODB
mongoose.plugin(deepPopulate);
var morgan = require('morgan'); // LOG REQUESTS TO THE CONSOLE (EXPRESS4)
var bodyParser = require('body-parser'); // PULL INFORMATION FROM HTML POST (EXPRESS4)
var methodOverride = require('method-override'); // SIMULATE DELETE AND PUT (EXPRESS4)
var argv = require('optimist').argv;
var config = require('./config/env_config');
var utils = require('./helpers/utils');
var errorHandler = require('errorhandler');
var compression = require('compression');
var sanitize = require("mongo-sanitize");
var newrelic = false;
if(config.env == 'prod'){
    newrelic = require('newrelic');
}

// COMPRESS THE OUTPUT
app.use(compression());

// ADD HEADERS
app.use(function (req, res, next) {
    // WEBSITE YOU WISH TO ALLOW TO CONNECT
    res.setHeader('Access-Control-Allow-Origin', "*");
    // REQUEST METHODS YOU WISH TO ALLOW
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // REQUEST HEADERS YOU WISH TO ALLOW
    // RES.SETHEADER('ACCESS-CONTROL-ALLOW-HEADERS', 'X-REQUESTED-WITH,CONTENT-TYPE');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control, Authorization");
    // SET TO TRUE IF YOU NEED THE WEBSITE TO INCLUDE COOKIES IN THE REQUESTS SENT
    // TO THE API (E.G. IN CASE YOU USE SESSIONS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // PASS TO NEXT LAYER OF MIDDLEWARE
    next();
});

// DATABASE CONFIGURATION
mongoose.connect('mongodb://' + config.database.host);
// LOG EVERY REQUEST TO THE CONSOLE
app.use(morgan('dev'));
// PARSE APPLICATION/X-WWW-FORM-URLENCODED
app.use(bodyParser.urlencoded({'extended':'true'}));
// PARSE APPLICATION/JSON
app.use(bodyParser.json());
// PARSE APPLICATION/VND.API+JSON AS JSON
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// SIMULATE DELETE AND PUT (EXPRESS4)
app.use(methodOverride());
// DEFINE THE VIEW ENGINE
app.set('view engine', 'jade');

// DEFINE THE DEBUG LEVEL
if(['dev', 'stg'].indexOf(config.env) > -1){
    // DEFINE THE DEBUG LEVEL
    app.use(errorHandler({
        dumpExceptions: true, 
        showStack: true
    }));
}

// LOAD THE ROUTES
require('./router/storeConfigs')(app, utils);
require('./router/addresses')(app, utils);
require('./router/categories')(app, mongoose, utils);
require('./router/articles')(app, mongoose, utils, config, sanitize);
require('./router/baskets')(app, utils);
require('./router/resizimage')(app, mongoose, utils);
require('./router/cities')(app, mongoose, utils);
require('./router/countries')(app, mongoose, utils);
require('./router/discounts')(app, mongoose, utils);
require('./router/orderSteps')(app, mongoose, utils);
require('./router/files')(app, mongoose, utils);
require('./router/groups')(app, mongoose, utils);
require('./router/main')(app, express);
require('./router/newsletters')(app, mongoose, config, utils);
require('./router/orders')(app, moment, utils, config);
require('./router/packings')(app, mongoose, utils);
require('./router/playground')(app, mongoose, config, utils);
require('./router/products')(app, mongoose, utils, config);
require('./router/shippings')(app, moment);
require('./router/s3')(app, mongoose, utils, config);
require('./router/states')(app, mongoose, utils);
require('./router/suppliers')(app, mongoose, utils);
require('./router/tickets')(app, mongoose, config, utils);
require('./router/users')(app, mongoose, utils, config);
require('./router/client')(app, express, config);
// AVOID SERVER STOP
process.on('uncaughtException', function(err) {
    console.log(err);
});

// DEFINE HTTP AND HTTPS PORTS
var httpPort = process.env.PORT || 80;
var httpsPort = parseInt(process.env.PORT) + 1 || 443;

// START HTTP SERVER
http.createServer(app).listen(httpPort, function(){
    console.log('HTTP iniciado na porta: ' + httpPort);
});

// START HTTPS SERVER
https.createServer({
    key: fs.readFileSync('./ssl-data/key.key'),
    cert: fs.readFileSync('./ssl-data/cert.crt'),
    ca: [
        fs.readFileSync('./ssl-data/ca.crt')
        , fs.readFileSync('./ssl-data/b31f05f66f16b2d2.crt')
        , fs.readFileSync('./ssl-data/gd_bundle-g2-g1-1.crt')
        , fs.readFileSync('./ssl-data/gd_bundle-g2-g1-2.crt')
        , fs.readFileSync('./ssl-data/gd_bundle-g2-g1-3.crt')
    ],
    requestCert: true,
    rejectUnauthorized: false
}, app).listen(httpsPort, function() {
    console.log("HTTPS - SSL iniciado na porta: " + httpsPort);
});
