"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Categories = require('./../modules/Categories.js');

    app.get('/v1/categories', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Categories.find(filter, function(err, categories) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(categories);
                
            }

        });

    });
    
    app.get('/v1/category/:category_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Categories.findOne({_id: req.params.category_id}, function(err, category) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(category);
                
            }

        });

    });

    app.post('/v1/category', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Categories.create({

                name : req.body.name

        }, function(err, category) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(category); 
                        
                }

        });

    });
    
    app.put('/v1/category/:category_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        Categories.findById(req.params.category_id, function(err, category) {
                
            if (err) {
                    
                res.statusCode = 400;

                res.send(err);
                    
            } else {
                    
                category.name = req.body.name;

                category.save(function(err, updatedCategory) {

                    if (err) {
                            
                        res.statusCode = 400;

                        res.send(err);

                    } else {
                            
                        res.send(updatedCategory);
                            
                    }

                });
                    
            }

        });

    });
    
    app.delete('/v1/categories/:category_id', utils.ensureAdmin, function(req, res) {

            Categories.remove({

                    _id : req.params.category_id

            }, function(err, category) {

                    if (err) {
                            
                            res.statusCode = 400;
                            res.send(err);
                            
                    } else {

                            Categories.find(function(err, categories) {
    
                                    if (err) {
                                            res.statusCode = 400;
                                            res.send(err);
                                    } else {
    
                                            res.json(categories);
                                            
                                    }
    
                            });

                    }

            });

    });
}