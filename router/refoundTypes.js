"use strict";

module.exports=function(app, utils) {
        
    var RefoundTypes = require('./../models/RefoundTypes.js');

    app.get('/v1/refoundTypes', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        RefoundTypes
        .find(filter)
        .exec(function(err, refoundTypes) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(refoundTypes);
                
            }

        });

    });
    
    app.get('/v1/refoundType/:refoundType_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        RefoundTypes
        .findOne({_id: req.params.refoundType_id})
        .exec(function(err, refoundType) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(refoundType);
                
            }

        });

    });

    app.post('/v1/refoundType', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        RefoundTypes.create({

                name : req.body.name

        }, function(err, refoundType) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(refoundType); 
                        
                }

        });

    });
    
    app.put('/v1/refoundType/:refoundType_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        RefoundTypes
        .findById(req.params.refoundType_id)
        .exec(function(err, refoundType) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                refoundType.name = req.body.name;

                refoundType.save(function(err, updatedRefoundType) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedRefoundType);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/refoundTypes/:refoundType_id', utils.ensureAdmin, function(req, res) {

            RefoundTypes.remove({

                    _id : req.params.refoundType_id

            }, function(err, refoundType) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            RefoundTypes.find(function(err, refoundTypes) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(refoundTypes);
                                            
                                    }
    
                            });

                    }

            });

    });
}