"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Suppliers = require('./../modules/Suppliers.js');

    app.get('/v1/suppliers', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Suppliers.find(filter, function(err, suppliers) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(suppliers);
                
            }

        });

    });
    
    app.get('/v1/supplier/:supplier_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Suppliers.findOne({_id: req.params.supplier_id}, function(err, supplier) {

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

        Suppliers.findById(req.params.supplier_id, function(err, supplier) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                supplier.name = req.body.name;

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