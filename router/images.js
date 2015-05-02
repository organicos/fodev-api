"use strict";

module.exports=function(app, mongoose, moment, utils) {
        
    var Images = require('./../modules/Images.js');

    app.get('/v1/images', utils.ensureAdmin, function(req, res) {
        
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

    app.get('/v1/image/:image_id', utils.ensureAuthorized, function(req, res) {

        Images.findOne({_id: req.params.image_id}, function(err, image) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(image);
                
            }

        });

    });

}
