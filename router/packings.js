"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Packings = require('./../models/Packings.js');

    app.get('/v1/packings', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Packings
        .find(filter)
        .sort({name:1})
        .exec(function(err, packings) {
                
            if (err) {
                    
                    res.statusCode = 400;
                    res.send(err);       
            }

            res.json(packings);
                
        });
        
    });
    
    app.get('/v1/packing/:packing_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Packings
        .findOne({_id: req.params.packing_id})
        .exec(function(err, packing) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(packing);
                
            }

        });

    });

    app.post('/v1/packing', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Packings.create({

                name : req.body.name
                
                , price : req.body.price
                
                , active : req.body.active
                
                , desc : req.body.desc

        }, function(err, packing) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(packing); 
                        
                }

        });

    });
    
    app.put('/v1/packing/:packing_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Packings
        .findById(req.params.packing_id)
        .exec(function(err, packing) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                packing.name = req.body.name;
                
                packing.price = req.body.price;
                
                packing.active = req.body.active;
                
                packing.desc = req.body.desc;

                packing.save(function(err, updatedPacking) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedPacking);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/packings/:packing_id', utils.ensureAdmin, function(req, res) {

            Packings.remove({

                    _id : req.params.packing_id

            }, function(err, packing) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Packings.find(function(err, packings) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(packings);
                                            
                                    }
    
                            });

                    }

            });

    });
}