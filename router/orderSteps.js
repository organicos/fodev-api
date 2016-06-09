"use strict";

module.exports=function(app, mongoose, utils) {
        
    var OrderSteps = require('./../models/OrderSteps.js');

    app.get('/v1/orderSteps', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        OrderSteps
        .find(filter)
        .exec(function(err, orderSteps) {

            if (err) {
                
                res.orderStepCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(orderSteps);
                
            }

        });

    });
    
    app.get('/v1/orderStep/:orderStep_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        OrderSteps
        .findOne({_id: req.params.orderStep_id})
        .exec(function(err, orderStep) {

            if (err) {
                
                res.orderStepCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(orderStep);
                
            }

        });

    });

    app.post('/v1/orderStep', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var newOrderStep = new OrderSteps({
            name : req.body.name
            , mail : req.body.mail
        });

        newOrderStep.save(function(err, orderStep) {

                if (err) {
                    
                    res.orderStepCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(orderStep); 
                        
                }

        });

    });
    
    app.put('/v1/orderStep/:orderStep_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        OrderSteps
        .findById(req.params.orderStep_id)
        .exec(function(err, orderStep) {
                
            if (err) {
                    
                res.orderStepCode = 400;

                res.send(err);
                    
            } else {
                    
                orderStep.name = req.body.name;
                orderStep.mail = req.body.mail;
                orderStep.position = req.body.position;
                
                orderStep.save(function(err, updatedOrderStep) {

                    if (err) {
                            
                        res.orderStepCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedOrderStep);
                            
                    }

                });
                    
            }

        });

    });
    
    app.put('/v1/orderSteps', utils.ensureAuthorized, utils.getRequestUser, function(req, res){
        
        if(validateOrderStepsList(req.body)){

            OrderSteps.remove({}, function(){

                OrderSteps.create(req.body,function(err, address) {
                        
                    if (err) {
                            
                            res.orderStepCode = 400;
                            res.send(err);
                    }
        
                    res.json(address);

                });

            });            

        } else {
            
            res.orderStepCode = 400;

            res.send("A lista de etapas é inválida.");
            
        }


    });
    
    var validateOrderStepsList = function(list){

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
    
    app.delete('/v1/orderSteps/:orderStep_id', utils.ensureAdmin, function(req, res) {

            OrderSteps.remove({

                    _id : req.params.orderStep_id

            }, function(err, orderStep) {

                    if (err) {
                            
                            res.orderStepCode = 400;
                            res.send(err);
                            
                    } else {

                            OrderSteps.find(function(err, orderSteps) {
    
                                    if (err) {
                                            res.orderStepCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(orderSteps);
                                            
                                    }
    
                            });

                    }

            });

    });
}