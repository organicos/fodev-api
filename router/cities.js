"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Cities = require('./../models/Cities.js');

    app.get('/v1/cities', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {active:1};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Cities
        .find(filter)
        .populate(['state', 'country'])
        .sort({name:1})
        .exec(function(err, cities) {
                
            if (err) {
                    
                    res.statusCode = 400;
                    res.send(err);       
            }

            res.json(cities);
                
        });
        
    });
    
    app.get('/v1/city/:city_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Cities
        .findOne({_id: req.params.city_id}, null, {sort: {updated: -1}})
        .populate(['state', 'country'])
        .exec(function(err, cities) {
                
            if (err) {
                    
                    res.statusCode = 400;
                    res.send(err);       
            }

            res.json(cities);
                
        });

    });

    app.post('/v1/city', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Cities.create({

                name : req.body.name
                
                , shipping_price : req.body.shipping_price
                
                , active : req.body.active
                
                , state : req.body.state
                
        }, function(err, city) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(city); 
                        
                }

        });

    });
    
    app.put('/v1/city/:city_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Cities.findById(req.params.city_id, function(err, city) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                city.name = req.body.name;
                
                city.shipping_price = req.body.shipping_price;
                
                city.active = req.body.active;
                
                city.state = req.body.state;

                city.save(function(err, updatedCity) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedCity);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/cities/:city_id', utils.ensureAdmin, function(req, res) {

            Cities.remove({

                    _id : req.params.city_id

            }, function(err, city) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Cities.find(function(err, cities) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(cities);
                                            
                                    }
    
                            });

                    }

            });

    });
}