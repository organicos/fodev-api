"use strict";

module.exports=function(app, mongoose, utils) {
        
    var States = require('./../models/States.js');

    app.get('/v1/states', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        States
        .find(filter, null, {name:1})
        .populate(['country'])
        .exec(function(err, state) {
                
            if (err) {
                    
                    res.statusCode = 400;
                    res.send(err);       
            }

            res.json(state);
                
        });

    });

    
    app.get('/v1/state/:state_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        States
        .findOne({_id: req.params.state_id}, null, {sort: {updated: -1}})
        .populate(['country'])
        .exec(function(err, state) {
                
            if (err) {
                    
                    res.statusCode = 400;
                    res.send(err);       
            }

            res.json(state);
                
        });

    });

    app.post('/v1/state', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        States.create({

            name : req.body.name
            
            , code : req.body.code
            
            , country : req.body.country
                
        }, function(err, state) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(state); 
                        
                }

        });

    });
    
    app.put('/v1/state/:state_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        States.findById(req.params.state_id, function(err, state) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                state.name = req.body.name;
                
                state.code = req.body.code;
                
                state.country = req.body.country;
                
                state.save(function(err, updatedState) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedState);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/states/:state_id', utils.ensureAdmin, function(req, res) {

            States.remove({

                    _id : req.params.state_id

            }, function(err, state) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            States.find(function(err, states) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(states);
                                            
                                    }
    
                            });

                    }

            });

    });
}