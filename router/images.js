"use strict";

module.exports=function(app, mongoose, moment, utils) {
        
    var Images = require('./../modules/Images.js');

    app.get('/v1/images', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {};
        
        if(req.query.title) filter.title = new RegExp(req.query.title, "i");

        Images.find(filter, function(err, images) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(images);
                
            }

        });

    });

    app.get('/v1/image/:image_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Images.findOne({_id: req.params.image_id}, function(err, image) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(image);
                
            }

        });

    });

    app.post('/v1/image', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        Images.create({

                title : req.body.title,

                url : req.body.url

        }, function(err, image) {

                if (err) {
                    
                    res.statusCode = 400;

                    res.send(err);
                
                } else {
                    
                    res.json(image); 
                        
                }

        });

    });
    
    app.put('/v1/image/:image_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

            Images.findById(req.params.image_id, function(err, image) {
                    
                if (err) {
                        
                    res.statusCode = 400;

                    res.send(err);
                        
                } else {
                        
                    image.title = req.body.title;
                    image.url = req.body.url;

                    image.save(function(err, updatedImage) {

                        if (err) {
                                
                            res.statusCode = 400;

                            res.send(err);

                        } else {
                                
                            res.send(updatedImage);
                                
                        }

                    });
                        
                }

            });

    });

}
