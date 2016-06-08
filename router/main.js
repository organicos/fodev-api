"use strict";

module.exports = function (app, express) {

    app.use(function(req, res, next) {
        
        var host =  req.get('Host');
        
        var hostname = ( host.match(/:/g) ) ? host.slice( 0, host.indexOf(":") ) : host;
        
        ensureSecure();

        // Removes www
        function getNaked(){
            return hostname.replace('www.','');
        }

        // Ensure HTTPS
        function ensureSecure(){
            if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
                
                res.redirect(301, 'https://' + hostname + req.url);

            } else if (host.match(/^www/) !== null ) {
                
                res.redirect(301, 'https://' + getNaked() + req.url);
                
            } else {
             
                next();
                
            }
        }
    });

}