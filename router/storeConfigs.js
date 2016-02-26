"use strict";

var StoreConfigs = require('./../models/StoreConfigs.js');

module.exports=function(app, utils) {
    
    app.get('/v1/configs', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
            
        var filter = {};
        
        StoreConfigs
        .first(filter)
        .exec(function(err, orders) {
                
            if (err) {
                    res.send(err);    
            }

            res.json(orders);

        });

    });
    
    app.put('/v1/configs', utils.ensureAdmin, function(req, res){
        
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