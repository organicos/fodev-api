"use strict";

module.exports=function(app, utils) {
        
    var Refounds = require('./../models/Refounds.js');

    app.get('/v1/refounds', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Refounds
        .find(filter)
        .exec(function(err, refounds) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(refounds);
                
            }

        });

    });
    
    app.get('/v1/refound/:refound_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Refounds.findOne({_id: req.params.refound_id})
        .exec(function(err, refound) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(refound);
                
            }

        });

    });

    app.post('/v1/refound', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Refounds.create({

                name : req.body.name

        }, function(err, refound) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(refound); 
                        
                }

        });

    });
    
    app.put('/v1/refound/:refound_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Refounds
        .findById(req.params.refound_id)
        .exec(function(err, refound) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                refound.name = req.body.name;

                refound.save(function(err, updatedRefound) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedRefound);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/refounds/:refound_id', utils.ensureAdmin, function(req, res) {

            Refounds.remove({

                    _id : req.params.refound_id

            }, function(err, refound) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Refounds.find(function(err, refounds) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(refounds);
                                            
                                    }
    
                            });

                    }

            });

    });
}