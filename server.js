"use strict";

var express  = require('express');

var moment  = require('moment');

var https = require('https');

var http = require('http');

var fs = require('fs');

var app      = express();                                                               // create our app w/ express

var mongoose = require('mongoose');                                     // mongoose for mongodb

var morgan = require('morgan');                         // log requests to the console (express4)

var bodyParser = require('body-parser');        // pull information from HTML POST (express4)

var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

var argv = require('optimist').argv;

var config = require('./config/env_config');

var utils = require('./helpers/utils');


// Add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', "*");
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, If-Modified-Since, X-File-Name, Cache-Control, Authorization");
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// configuration =================

mongoose.connect('mongodb://' + config.database.host);

app.use('/js', express.static(__dirname + '/js'));

app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(morgan('dev'));                                                                                 // log every request to the console

app.use(bodyParser.urlencoded({'extended':'true'}));                    // parse application/x-www-form-urlencoded

app.use(bodyParser.json());                                                                     // parse application/json

app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(methodOverride());

// load the routes

require('./router/main')(app);

require('./router/products')(app, mongoose, moment, utils);

require('./router/payments')(app, mongoose, moment, config);

require('./router/tickets')(app, mongoose);

require('./router/articles')(app, mongoose, moment, utils);

require('./router/order')(app, mongoose, moment, utils, config, https);

require('./router/users')(app, mongoose, utils, config);

// avoid server stop =====================================
process.on('uncaughtException', function(err) {
    console.log(err);
});

// listen (start app with node server.js) ======================================

http.createServer(app).listen(process.env.PORT || 3000, function(){

        console.log('HTTP iniciado');

});

https.createServer({

    key: fs.readFileSync('./ssl-data/server.key'),

    cert: fs.readFileSync('./ssl-data/server.crt'),

    ca: fs.readFileSync('./ssl-data/ca.crt'),

    requestCert: true,

    rejectUnauthorized: false

}, app).listen(process.env.PORT + 1 || 3001, function() {

    console.log("HTTPS - SSL iniciado");

});
