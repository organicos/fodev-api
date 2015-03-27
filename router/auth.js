"use strict";

module.exports = function(app, moment, request) {

    var jwt = require("jwt-simple");

    var Users = require('./../modules/Users');

    var configSatellizer = require('./../config/config_satellizer.js');

    /*
    |--------------------------------------------------------------------------
    | Generate JSON Web Token
    |--------------------------------------------------------------------------
    */
    function createToken(user) {
        var payload = {
            sub: user._id,
            iat: moment().unix(),
            exp: moment().add(14, 'days').unix()
        };
        return jwt.encode(payload, configSatellizer.TOKEN_SECRET);
    }

  /*
   |--------------------------------------------------------------------------
   | Login with Google
   |--------------------------------------------------------------------------
   */
   
  app.post('/v1/auth/google', function(req, res) {
    
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: configSatellizer.GOOGLE_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };
  
    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
      
      var accessToken = token.access_token;
      var headers = { Authorization: 'Bearer ' + accessToken };
      
      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
        
        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          Users.findOne({ google: profile.sub }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, configSatellizer.TOKEN_SECRET);
            Users.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'Users not found' });
              }
              user.google = profile.sub;
              user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          Users.findOne({ google: profile.sub }, function(err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              res.header("Authorization", 'Bearer ' + token);
              res.redirect('https://organicos-github-io-vinagreti.c9.io/#/me');
              res.send();
            } else {
              var user = new Users();
              user.google = profile.sub;
              user.gender = profile.gender;
              user.email = profile.email;
              user.locale = profile.locale;
              user.picture = profile.picture.replace('sz=50', 'sz=200');
              user.name = profile.name;
              user.save(function(err) {
                var token = createToken(user);
                res.send({ token: token });
              }); 
            }
          });
        }
      });
    });
  });
  

  app.get('/v1/auth/google', function(req, res) {
    
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: req.query.code,
      client_id: configSatellizer.GOOGLE_ID,
      client_secret: configSatellizer.GOOGLE_SECRET,
      redirect_uri: configSatellizer.REDIRECT_URI,
      grant_type: 'authorization_code'
    };
  
    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
      
      var accessToken = token.access_token;
      var headers = { Authorization: 'Bearer ' + accessToken };
      
      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
        
        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          Users.findOne({ google: profile.sub }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, configSatellizer.TOKEN_SECRET);
            Users.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'Users not found' });
              }
              user.google = profile.sub;
              user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = createToken(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          Users.findOne({ google: profile.sub }, function(err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              res.header("Authorization", 'Bearer ' + token);
              res.redirect('https://organicos-github-io-vinagreti.c9.io/#/me');
              res.send();
            } else {
              var user = new Users();
              user.google = profile.sub;
              user.gender = profile.gender;
              user.email = profile.email;
              user.locale = profile.locale;
              user.picture = profile.picture.replace('sz=50', 'sz=200');
              user.name = profile.name;
              user.save(function(err) {
                var token = createToken(user);
                res.send({ token: token });
              }); 
            }
          });
        }
      });
    });
  });


};
