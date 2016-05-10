"use strict";

var StoreConfigs = require('./../models/StoreConfigs.js');

module.exports=function(app, utils) {
    
    app.get('/v1/storeConfigs', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
            
        var filter = {};
        
        StoreConfigs
        .findOne(filter)
        .exec(function(err, storeConfigs) {
                
            if (err) {
                    res.send(err);    
            }

            res.json(storeConfigs);

        });

    });
    
    app.put('/v1/storeConfigs', utils.ensureAdmin, function(req, res){
        
        var filter = {};
        
        StoreConfigs
        .findOne(filter)
        .exec(function(err, storeConfigs) {
                
            if (err) {

                    res.send(err);

            } else {
                
                if(storeConfigs){
                    
                    storeConfigs = req.params.storeConfigs;
                    
                } else {
                    
                    storeConfigs = new StoreConfigs(req.params.storeConfigs);
                    
                }
                
                storeConfigs.save(function(err, storeConfigs){
                   
                    if (err) {
        
                            res.send(err);
        
                    } else {
                
                        res.json(storeConfigs);
                        
                    }
                    
                });
                
            }

        });
        
        var config = new StoreConfigs();
        
        return config.save(function(err, updatedConfig) {

            if (err) {

                res.statusCode = 400;

                return res.send(err);
                    
            } else {
                
                var statusChanged = order.status != req.body.status;
                    
                order.discounts = req.body.discounts;
                order.customer = req.body.customer;
                order.basket = req.body.basket;
                order.address = req.body.address;
                order.refound = req.body.refound;
                order.shipping = req.body.shipping;
                order.payment = req.body.payment;
                order.status = req.body.status;
                order.updated = req.body.updated;
                
                
                // check if the order status is going to be updated to 2: DELIVERED
                if(order.status == 2){

                    if(order.refound.option == 'discount'){

                        if(!order.refound.discount){

                            order.refound.value = calculateRefoundValue(order);

                            order.refound.discount = createNewDiscount(order, function(newDiscount){

                                order.refound.discount = newDiscount;

                                return _PutOrder(order, statusChanged, res);

                            });

                        }
                    }


                } else {

                    return _PutOrder(order, statusChanged, res);

                }
                    
            }

        });

    });

};