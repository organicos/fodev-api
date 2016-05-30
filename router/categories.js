"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Categories = require('./../models/Categories.js');

    app.get('/v1/categories', utils.getRequestUser, function(req, res) {
        
        var filter = {
            
        };
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Categories
        .find(filter)
        .sort({updated: 1})
        .exec(function(err, categories) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(categories);
                
            }

        });

    });
    
    app.get('/v1/category/:category_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Categories
        .findOne({_id: req.params.category_id})
        .sort({updated: 1})
        .populate('subCategories')
        .exec(function(err, category) {

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

                name: req.body.name,

                subCategories: req.body.subCategories,

                forUseInBlog: req.body.forUseInBlog,
            
                forUseInProduct: req.body.forUseInProduct

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

                category.subCategories = req.body.subCategories.map(function(subCategory){
                    var category = new Categories(subCategory);
                    category.isNew = subCategory._id ? false : true;
                    return category;
                });

                category.forUseInBlog = req.body.forUseInBlog;
            
                category.forUseInProduct = req.body.forUseInProduct;

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
    
    app.delete('/v1/category/:category_id', utils.ensureAdmin, function(req, res) {

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