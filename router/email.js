"use strict";

module.exports=function(app, mongoose, utils, config) {
       
    app.post('/v1/email', function(req, res) {
        
        console.log(req.body);
        
        res.send(true);

    });

}