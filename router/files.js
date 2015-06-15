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

    app.get('/v1/app/files', utils.ensureAdmin, utils.getRequestUser, function(req, res) {
    
        var filter = {
            appFile: true
        };
        getFiles(filter);
        
    });
    
    app.get('/v1/user/files', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
    
        var filter = {
            appFile: {'$ne': true }
            , user: req.user._id
        }
        getFiles(filter);
        
    });
    
    var getFiles = function(filter){
        
        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Files.find(filter, function(err, files) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(files);
                
            }

        });

    }

    app.get('/v1/app/files/:file_type', utils.ensureAdmin, utils.getRequestUser, function(req, res) {
    
        var file_type = req.params.file_type;
        var filter = {
            appFile: true
            , type: { $in : validTypes[file_type] }
        };
        getFilesByType(req, res, filter);
        
    });
    
    app.get('/v1/user/files/:file_type', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
    
        var file_type = req.params.file_type;
        var filter = {
            appFile: {'$ne': true }
            , user: req.user._id
            , type: { $in : validTypes[file_type] }
        }
        getFilesByType(req, res, filter);
        
    });
    
    var getFilesByType = function(req, res, filter){

        if(req.query.name) filter.name = new RegExp(req.query.name, "i");

        Files.find(filter, function(err, files) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(files);
                
            }

        });

    }
    
    app.get('/v1/app/file/:file_id', utils.ensureAdmin, utils.getRequestUser, function(req, res) {
        
        var filter = {
            appFile: true
            ,_id: req.params.file_id
        }
        getFile(req, res, filter);
        
    });
    
    app.get('/v1/user/file/:file_id', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        var filter = {
            appFile: {'$ne': true }
            , _id: req.params.file_id
            , user: req.user._id
        }
        getFile(req, res, filter);
    });
    
    var getFile = function(req, res, filter){

        Files.findOne(filter, function(err, file) {

            if (err) {
                
                res.statusCode = 400;
                
                res.send(err)
                
            } else {
                
                res.json(file);
                
            }

        });

    }

    app.post('/v1/app/file', utils.ensureAdmin, utils.getRequestUser, function(req, res) {
        
        var file = {
            appFile: true
        }
        postFile(req, res, file);
        
    });
    
    app.post('/v1/user/file', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        var file = {
            appFile: false
        }
        postFile(req, res, file);
    });
    
    var postFile = function(req, res, file){
        
        file.privacy = req.body.privacy == 'public' ? 'public' : 'private';
        file.name = req.body.name || req.body.file_name;
        file.file_name = req.body.file_name;
        file.type = req.body.type;
        file.size = req.body.size;
        file.url = req.body.url;
        file.user = req.user._id;

        if(validTypes.images.indexOf(file.type) == -1 && validTypes.videos.indexOf(file.type) == -1 && validTypes.audios.indexOf(file.type) == -1){
            
                    res.statusCode = 400;

                    res.send('Invalid file format');
            
        } else {
            
            Files.create(file, function(err, file) {
    
                    if (err) {
                        
                        res.statusCode = 400;
    
                        res.send(err);
                    
                    } else {
                        
                        res.json(file); 
                            
                    }
    
            });   
            
        }

    }

    app.put('/v1/app/file', utils.ensureAdmin, utils.getRequestUser, function(req, res) {
        var file = {};
        putFile(req, res, file);
        
    });

    app.put('/v1/user/file', utils.ensureAuthorized, utils.getRequestUser, function(req, res) {
        var file = {};
        putFile(req, res, file);
    });

    var putFile = function(req, res, file){
        
        file.privacy = req.body.privacy == 'public' ? 'public' : 'private';
        file.name = req.body.name || req.body.file_name;
        file.file_name = req.body.file_name;
        file.type = req.body.type;
        file.size = req.body.size;
        file.url = req.body.url;
        file.user = req.user._id;

        if(validTypes.images.indexOf(file.type) == -1 && validTypes.videos.indexOf(file.type) == -1 && validTypes.audios.indexOf(file.type) == -1){
            
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
                    
                    // its best to do not change the url. It is the remote path.
                    // file.url = req.body.url;

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

    }
    
}