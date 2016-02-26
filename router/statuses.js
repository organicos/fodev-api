"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Statuses = require('./../models/Statuses.js');

    app.get('/v1/statuses', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Statuses.find(filter, function(err, statuses) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(statuses);
                
            }

        });

    });
    
    app.get('/v1/status/:status_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Statuses.findOne({_id: req.params.status_id}, function(err, status) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(status);
                
            }

        });

    });

    app.post('/v1/status', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var newStatus = new Statuses({
            name : req.body.name
            , mail : req.body.mail
        });

        newStatus.save(function(err, status) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(status); 
                        
                }

        });

    });
    
    app.put('/v1/status/:status_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Statuses.findById(req.params.status_id, function(err, status) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                status.name = req.body.name;
                status.mail = req.body.mail;
                status.position = req.body.position;
                
                status.save(function(err, updatedStatus) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedStatus);
                            
                    }

                });
                    
            }

        });

    });
    
    app.put('/v1/statuses', utils.ensureAuthorized, utils.getRequestUser, function(req, res){
        
        if(validateStatusesList(req.body)){

            Statuses.remove({}, function(){

                Statuses.create(req.body,function(err, address) {
                        
                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                    }
        
                    res.json(address);

                });

            });            

        } else {
            
            res.statusCode = 400;

            res.send("A lista de etapas é inválida.");
            
        }


    });
    
    var validateStatusesList = function(list){

        if(list instanceof Array){
            
            for (var i = 0, len = list.length; i < len; i++) {

              var item = list[i];
              
              if(!item.name || !item.step){
                  
                  return false;
                  
              }

            }
            
            return true;

        } else {

            return false;

        }

    };
    
    app.delete('/v1/statuses/:status_id', utils.ensureAdmin, function(req, res) {

            Statuses.remove({

                    _id : req.params.status_id

            }, function(err, status) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Statuses.find(function(err, statuses) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(statuses);
                                            
                                    }
    
                            });

                    }

            });

    });
}