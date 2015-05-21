"use strict";

module.exports = function (app, express) {

    app.use(function(req, res, next) {
        
        var host =  req.get('Host');
        
        var hostname = ( host.match(/:/g) ) ? host.slice( 0, host.indexOf(":") ) : host;
        
        var nonWwwHost = hostname.replace('www.','');
        
        console.log(host);
        console.log(nonWwwHost);
        
        // Ensure HTTPS
        if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https')) {
            
            res.redirect(301, 'https://' + hostname + req.url);

        } else if (host.match(/^www/) !== null ) {
            
            res.redirect(301, 'https://' + nonWwwHost + req.url);
            
        } else {
         
            next();
            
        }
        
    });
    
}