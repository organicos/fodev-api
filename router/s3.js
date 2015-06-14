"use strict";

module.exports=function(app, mongoose, utils, config) {
    
    var aws = require('aws-sdk');

    app.get('/v1/s3/sign', utils.ensureAuthorized, utils.getRequestUser, function(req, res){
        
        aws.config.update({accessKeyId: config.s3.accessKeyID, secretAccessKey: config.s3.secretAccessKey});

        // remove special char from file name
        req.query.file_name = utils.makeSlug(req.query.file_name, true); //the scond parameter tells the functions to leave the extensions
        
        var s3 = new aws.S3();
        var s3_params = {
            Bucket: config.s3.bucket,
            Key: 'uploads/' + req.user._id + '/' + req.query.file_name,
            Expires: 60,
            ContentType: req.query.file_type,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', s3_params, function(err, signedUrl){
            if(err){
                console.log(err);
            }
            else{
                var return_data = {
                    signed_request: signedUrl
                    , url: 'https://'+config.s3.bucket+'.s3.amazonaws.com/'+s3_params.Key
                };
                res.write(JSON.stringify(return_data));
                res.end();
            }
        });
    });

}