"use strict";
module.exports=function(app, mongoose, utils) {
    app.get('/resizimage', utils.getRequestUser, function(req, res) {
        res.send('File resizing.');
    });
    app.get('/resizimage/:size', function(req, res, next){
        var gm = require('gm').subClass({imageMagick: true});
        var url = getImageUrl(encodeURI(req.query.url), req.protocol, req.headers.host, req.headers.referer);
        var newSize = req.params.size;
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
        image.size(function (err, size) {
            if (err) {
                res.statusCode = 404;
                res.send('Não foi possível localizar a imagem especificada [' + url + ']');
            } else {
                if(isNaN(newSize)){
                    var newSizes = newSize.split("x");
                    var width = newSizes.shift();
                    var height = newSizes.shift();
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
                    image.resize(newSize,newSize);
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
            }
        });
        
    });
    
    function getImageUrl(url, protocol, host, referer){
        if(url.indexOf("http") != 0){
            if (url.indexOf("//") == 0) {
                url = protocol + ":" + url;
            }
            else if(referer){
                if (url.indexOf("/") == 0) { url = protocol + "://" + host + url; }
                else { url = referer + url; }
            }           
        }
        return url;
    }
}