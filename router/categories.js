"use strict";

module.exports=function(app, mongoose, utils) {
        
    var Categories = require('./../models/Categories.js');

    app.get('/v1/categories', utils.getRequestUser, function(req, res) {
        var filter = {
            parent: null
        };
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");
        if(req.query.forUseInBlog) filter.forUseInBlog = req.query.forUseInBlog;
        if(req.query.forUseInProduct) filter.forUseInProduct = req.query.forUseInProduct;

        Categories
        .aggregate([
            {$unwind : "$subcategories"},
            {$match : filter,
            {$project : {
                _id : "$subcategories._id", 
                name : "$subcategories.name"
                     }
            }
        ])
        .exec(function(err, categories) {
            if (err) {
                res.statusCode = 400;
                res.send(err)
            } else {
                for(category in categories){
                    if(category.subcategories.length > 0){
                        category.subcategories = category.subcategories.filter(function(x){return new RegExp(req.query.name, "i").test(x.name)})
                    }
                }

                res.json(categories);
            }
        });
    });

    app.get('/v1/category/:category_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        Categories
        .findOne({_id: req.params.category_id})
        .sort({updated: 1})
        .populate('subcategories')
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
            slug: req.body.slug,
            subcategories: req.body.subcategories,
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
                category.slug = req.body.slug;
                category.subcategories = req.body.subcategories.map(function(subCategory){
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