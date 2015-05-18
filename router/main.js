"use strict";

module.exports = function (app, express) {

    // Ensure HTTPS
    app.use(function(req, res, next) {
        
        if((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
            
            var host =  req.get('Host');
            
            var hostname = ( host.match(/:/g) ) ? host.slice( 0, host.indexOf(":") ) : host;
            
            res.redirect(301, 'https://' + hostname + req.url);
            
        } else {
         
            next();
            
        }
        
    });
    
}