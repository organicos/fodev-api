"use strict";

module.exports=function(app, utils) {
        
    var Addresses = require('./../models/Addresses.js');

    app.get('/v1/addresses', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {
            user: req.user
        };
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Addresses
        .find(filter, null, {sort: {lastUse: -1}})
        .populate(['city'])
        .exec(function(err, addresses) {
                
                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);       
                }

                res.json(addresses);
                
        });
                
    });
    
    app.get('/v1/address/lastUsed', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {
            user: req.user
        };
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Addresses
        .findOne(filter)
        .populate(['city'])
        .sort({lastUse: -1})
        .exec(function(err, addresses) {
                
                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);       
                }

                res.json(addresses);
                
        });
                
    });
    
    app.get('/v1/address/:address_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var filter = {
            user: req.user
            , _id : req.params.address_id
        };

        Addresses
        .findOne(filter, null, {sort: {lastUse: -1}})
        .populate(['city'])
        .exec(function(err, address) {
                
                if (err) {
                        
                        res.statusCode = 400;
                        res.send(err);       
                }

                res.json(address);
                
        });
        
    });

    app.post('/v1/address', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Addresses.create({

                user: req.user
                , name : req.body.name
                , cep : req.body.cep
                , phone : req.body.phone
                , street : req.body.street
                , number : req.body.number
                , img : req.body.img
                , complement : req.body.complement
                , district : req.body.district
                , city : req.body.city
                , ref : req.body.ref

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
                address.phone = req.body.phone;
                address.cep = req.body.cep;
                address.street = req.body.street;
                address.number = req.body.number;
                address.img = req.body.img;
                address.complement = req.body.complement;
                address.district = req.body.district;
                address.city = req.body.city;
                address.ref = req.body.ref;
                address.updated = new Date();

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
    
    app.delete('/v1/addresses/:address_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

            Addresses.remove({
                
                user: req.user
                , _id : req.params.address_id

            }, function(err, address) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                        res.json(true);

                    }

            });

    });
}
