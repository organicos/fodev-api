"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Addresses = require('./../modules/Addresses.js');

    app.get('/v1/addresses', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {
            user: req.user._id
        };
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Addresses.find(filter, function(err, addresses) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(addresses);
                
            }

        });

    });
    
    app.get('/v1/address/:address_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var filter
        user: req.user._id

        Addresses.findOne(filter, function(err, address) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(address);
                
            }

        });

    });

    app.post('/v1/address', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Addresses.create({

                name : req.body.name

        }, function(err, address) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(address); 
                        
                }

        });

    });
    
    app.put('/v1/address/:address_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Addresses.findById(req.params.address_id, function(err, address) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                address.name = req.body.name;

                address.save(function(err, updatedAddress) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedAddress);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/addresses/:address_id', utils.ensureAdmin, function(req, res) {

            Addresses.remove({

                    _id : req.params.address_id

            }, function(err, address) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Addresses.find(function(err, addresses) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(addresses);
                                            
                                    }
    
                            });

                    }

            });

    });
}