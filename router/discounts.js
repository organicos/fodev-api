"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Discounts = require('./../modules/Discounts.js');

    app.get('/v1/discounts', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Discounts.find(filter, function(err, discounts) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(discounts);
                
            }

        });

    });
    
    app.get('/v1/discount/:discount_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Discounts.findOne({_id: req.params.discount_id}, function(err, discount) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(discount);
                
            }

        });

    });

    app.post('/v1/discount', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Discounts.create({

                customer: req.body.customer,
                
                value: req.body.value,
                
                desc : req.body.desc,
                
                startDate: req.body.startDate,
                
                endDate: req.body.endDate,
            
                updated: req.body.updated

        }, function(err, discount) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(discount); 
                        
                }

        });

    });
    
    app.put('/v1/discount/:discount_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Discounts.findById(req.params.discount_id, function(err, discount) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                discount.customer = req.body.customer;
                
                discount.value = req.body.value;
                
                discount.desc = req.body.desc;
                
                discount.startDate = req.body.startDate;
                
                discount.endDate = req.body.endDate;
            
                discount.updated = req.body.updated;

                discount.save(function(err, updatedDiscount) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedDiscount);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/discounts/:discount_id', utils.ensureAdmin, function(req, res) {

            Discounts.remove({

                    _id : req.params.discount_id

            }, function(err, discount) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Discounts.find(function(err, discounts) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(discounts);
                                            
                                    }
    
                            });

                    }

            });

    });
}