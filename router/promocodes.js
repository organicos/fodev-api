"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Promocodes = require('./../modules/Promocodes.js');

    app.get('/v1/promocodes', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Promocodes.find(filter, function(err, promocodes) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(promocodes);
                
            }

        });

    });
    
    app.get('/v1/promocode/:promocode_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Promocodes.findOne({_id: req.params.promocode_id}, function(err, promocode) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(promocode);
                
            }

        });

    });

    app.post('/v1/promocode', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Promocodes.create({

            name : req.body.name

            code : req.body.code,

            discount : req.body.discount,

            start_date : req.body.start_date,

            end_date: req.body.end_date,

        }, function(err, promocode) {

            if (err) {
                
                res.statusCode = 400;

                res.send(err);
            
            } else {
                
                res.json(promocode); 
                    
            }

        });

    });
    
    app.put('/v1/promocode/:promocode_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Promocodes.findById(req.params.promocode_id, function(err, promocode) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                promocode.name = req.body.name;
                promocode.code = req.body.code;
                promocode.discount = req.body.discount;
                promocode.start_date = req.body.start_date;
                promocode.end_date = eq.body.end_date;

                promocode.save(function(err, updatedPromocode) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedPromocode);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/promocodes/:promocode_id', utils.ensureAdmin, function(req, res) {

        Promocodes.remove({

            _id : req.params.promocode_id

        }, function(err, promocode) {

            if (err) {

                    res.statusCode = 400;
                    res.send(err);

            } else {

                Promocodes.find(function(err, promocodes) {

                    if (err) {

                            res.statusCode = 400;
                            res.send(err);

                    } else {

                            res.json(promocodes);
                            
                    }

                });

            }

        });

    });
}