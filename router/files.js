"use strict";

module.exports = function (app, mongoose, utils) {

    var Files = require('./../modules/Files.js');
    
    var validTypes = {
        images: [
            'image/gif'
            , 'image/jpg'
            , 'image/jpeg'
            , 'image/png'
        ]
        , audios: [
        ]
        , videos: [
        ]
    }

    app.get('/v1/files', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var filter = {
            user: req.user._id
        };
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Files.find(filter, function(err, files) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(files);
                
            }

        });

    });

    app.get('/v1/files/:file_type', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var file_type = req.params.file_type;
        
        var filter = {
            user: req.user._id,
            type: { $in : validTypes[file_type] }
        };
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Files.find(filter, function(err, files) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(files);
                
            }

        });

    });
    
    app.get('/v1/file/:file_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {

        var filter = {
            _id: req.params.file_id
            , user: req.user._id
        }

        Files.findOne(filter, function(err, file) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(file);
                
            }

        });

    });

    app.post('/v1/file', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        
        var file_type = req.body.type;
        
        if(validTypes.images.indexOf(file_type) == -1 && validTypes.videos.indexOf(file_type) == -1 && validTypes.audios.indexOf(file_type) == -1){
            
                    res.statusCode = 400;

                    res.send('Invalid file format');
            
        } else {
            
            Files.create({
    
                    name : req.body.name || req.body.file_name,
                    
                    file_name : req.body.file_name,
                    
                    type : file_type,
                    
                    size: req.body.size,
    
                    url : req.body.url,
                    
                    user: req.user._id
    
            }, function(err, file) {
    
                    if (err) {
                        
                        res.statusCode = 400;
    
                        res.send(err);
                    
                    } else {
                        
                        res.json(file); 
                            
                    }
    
            });   
            
        }

    });
    
    app.put('/v1/file/:file_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res){

        var file_type = req.body.type;
        
        if(validTypes.images.indexOf(file_type) == -1 && validTypes.videos.indexOf(file_type) == -1 && validTypes.audios.indexOf(file_type) == -1){
            
                    res.statusCode = 400;

                    res.send('Invalid file format');
            
        } else {
            
            Files.findById(req.params.file_id, function(err, file) {
                    
                if (err) {
                        
                    res.statusCode = 400;

                    res.send(err);
                        
                } else {
                        
                    file.name = req.body.name || req.body.file_name;
                    
                    file.file_name = req.body.file_name;
                    
                    file.type = req.body.type;
                    
                    file.size = req.body.size;
                    
                    file.url = req.body.url;

                    file.save(function(err, updatedFile) {

                        if (err) {
                                
                            res.statusCode = 400;

                            res.send(err);

                        } else {
                                
                            res.send(updatedFile);
                                
                        }

                    });
                        
                }

            });
            
        }

    });
    
}