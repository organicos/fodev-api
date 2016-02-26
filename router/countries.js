"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Countries = require('./../models/Countries.js');

    app.get('/v1/countries', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Countries
        .find(filter)
        .populate(['state', 'country'])
        .sort({name:1})
        .exec(function(err, countries) {
                
            if (err) {
                    
                    res.statusCode = 400;
                    res.send(err);       
            }

            res.json(countries);
                
        });

    });
    
    app.get('/v1/country/:country_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Countries.findOne({_id: req.params.country_id}, function(err, country) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(country);
                
            }

        });

    });

    app.post('/v1/country', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Countries.create({

                name : req.body.name
                
                , code : req.body.code
                
                , active : req.body.active

        }, function(err, country) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(country); 
                        
                }

        });

    });
    
    app.put('/v1/country/:country_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Countries.findById(req.params.country_id, function(err, country) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                country.name = req.body.name;
                
                country.code = req.body.code;
                
                country.active = req.body.active;

                country.save(function(err, updatedCountry) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedCountry);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/countries/:country_id', utils.ensureAdmin, function(req, res) {

            Countries.remove({

                    _id : req.params.country_id

            }, function(err, country) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Countries.find(function(err, countries) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(countries);
                                            
                                    }
    
                            });

                    }

            });

    });
}