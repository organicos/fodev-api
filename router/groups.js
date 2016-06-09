"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Groups = require('./../models/Groups.js');

    app.get('/v1/groups', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Groups
        .find(filter)
        .exec(function(err, groups) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(groups);
                
            }

        });

    });
    
    app.get('/v1/group/:group_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Groups
        .findOne({_id: req.params.group_id})
        .exec(function(err, group) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(group);
                
            }

        });

    });

    app.post('/v1/group', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Groups.create({

                name : req.body.name

        }, function(err, group) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(group); 
                        
                }

        });

    });
    
    app.put('/v1/group/:group_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Groups
        .findById(req.params.group_id)
        .exec(function(err, group) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                group.name = req.body.name;

                group.save(function(err, updatedGroup) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedGroup);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/groups/:group_id', utils.ensureAdmin, function(req, res) {

            Groups.remove({

                    _id : req.params.group_id

            }, function(err, group) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Groups.find(function(err, groups) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(groups);
                                            
                                    }
    
                            });

                    }

            });

    });
}