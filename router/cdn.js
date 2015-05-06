"use strict";

module.exports=function(app, mongoose, moment, utils) {
        
    app.get('/cdn/image', utils.getRequestUser, function(req, res) {
        
        res.send('Image resizing.');

    });
    
    app.get('/cdn/image/:size', utils.getRequestUser, function(req, res) {
        
        var size = req.params.size;

        var url = req.query.url;
        
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
                
                res.send(resizeImage(res, sizes, url));
                
            }

        } else {
            
            res.send(resizeImage(res, size, url));

        }
        
        

    });
    
    var resizeImage = function(res, sizes, url){
        
        var gm = require('gm').subClass({imageMagick: true});
        
        var newImage;
        
        if(url){
            
            newImage = gm(url);
            
        } else {
            
            newImage = createImage();
        }
        
        newImage.font("arial", 20)
        newImage.stroke("#fff", 2)
        newImage.fill("#888")
        newImage.drawText(10, 22, 'test')
        newImage.stream(function streamOut (err, stdout, stderr) {
            if (err) return next(err);
            stdout.pipe(res); //pipe to response

            stdout.on('end', function(){res.writeHead(200, { 'Content-Type': 'ima    ge/jpeg' });}); 

            stdout.on('error', next);
        });

    }

    var createImage = function() {
        return gm(70, 30, '#000')
            .font("arial", 20)
            .stroke("#fff", 2)
            .fill("#888")
            .drawText(10, 22, 'Some text');
    }
    
}