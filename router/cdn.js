"use strict";
module.exports=function(app, mongoose, utils) {
    app.get('/resizimage', utils.getRequestUser, function(req, res) {
        res.send('File resizing.');
    });
    app.get('/resizimage/:size', function(req, res, next){
        var gm = require('gm').subClass({imageMagick: true});
        var url = req.query.url ? encodeURI(req.query.url) : null;
        var size = req.params.size;
        var image;
        if(url){
            image = gm(url);
        } else {
            image = gm(50, 50, '#DADAE3')
                .font("arial", 20)
                .stroke("#fff", 2)
                .fill("#888")
                .drawText(10, 22, 'not found');
        }
        if(isNaN(size)){
            var sizes = size.split("x");
            var width = sizes.shift();
            var height = sizes.shift();
            if(isNaN(width)){
                res.statusCode = 400;
                res.send('A largura é inválida. Favor informar um número inteiro e positivo!');
            } else if (isNaN(height)){
                res.statusCode = 400;
                res.send('A altura é inválida. Favor informar um número inteiro e positivo!');
            } else {
                image.resize(width,height, "!");
            }
        } else {
            image.resize(size,size);
        }
        // COMPRESS
        image.compress('Zip');
        image.stream(function streamOut (err, stdout, stderr) {
            if (err){
                return next(err);
            } else {
                res.setHeader('Pragma', "public");
                res.setHeader('Connection', "keep-alive");
                res.setHeader('Cache-Control', "public, max-age=86400");
                res.setHeader('Date', new Date(Date.now()).toUTCString());
                res.setHeader('Expires', new Date(Date.now() + (30*86400000)).toUTCString());
                res.setHeader('Content-Encoding', 'zip');
                stdout.pipe(res); //pipe to response
                stdout.on('error', next);
            }
        });
    });
}