"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Suppliers = require('./../models/Suppliers.js');

    app.get('/v1/suppliers', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Suppliers
        .find(filter)
        .sort({name: 1})
        .exec(function(err, suppliers) {
                    
            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(suppliers);
                
            }

        });

    });
    
    app.get('/v1/supplier/:supplier_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var filter = {_id: req.params.supplier_id};
        
        Suppliers
        .findOne(filter)
        .sort({name: 1})
        .deepPopulate(['images', 'products', 'address'])
        .exec(function(err, supplier) {
            
            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(supplier);
                
            }

        });

    });

    app.post('/v1/supplier', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Suppliers.create({

                name : req.body.name
                , desc : req.body.desc
                , email : req.body.email
                , phone : req.body.phone
                , orderRules : req.body.orderRules
                , address : req.body.address
                , images : req.body.images
                , products : req.body.products
                , updated : req.body.updated

        }, function(err, supplier) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(supplier); 
                        
                }

        });

    });
    
    app.put('/v1/supplier/:supplier_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Suppliers
        .findById(req.params.supplier_id)
        .exec(function(err, supplier) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                supplier.name = req.body.name;
                supplier.desc = req.body.desc;
                supplier.email = req.body.email;
                supplier.phone = req.body.phone;
                supplier.orderRules = req.body.orderRules;
                supplier.address = req.body.address;
                supplier.images = req.body.images;
                supplier.products = req.body.products;
                supplier.updated = req.body.updated;

                supplier.save(function(err, updatedSupplier) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedSupplier);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/suppliers/:supplier_id', utils.ensureAdmin, function(req, res) {

            Suppliers.remove({

                    _id : req.params.supplier_id

            }, function(err, supplier) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Suppliers.find(function(err, suppliers) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(suppliers);
                                            
                                    }
    
                            });

                    }

            });

    });
}