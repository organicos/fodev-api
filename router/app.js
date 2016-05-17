"use strict";

module.exports=function(app, express, config) {
	
	var path = require('path');
	var day = 86400000;
	var week = 7 * day;
	var month = 30 * day;
	var year = 365 * day;
	
	var fodevAppPath = config.clientPath;
	var fileConfig = { maxAge: week };

	// these need to go first:
	app.use("/app.min.css", express.static(fodevAppPath + "/app.min.css", fileConfig));
	
	// define when to use minified app.js. It should not be used only on development env.
	if(config.env == 'dev'){
		app.use("/app.min.js", express.static(fodevAppPath + "/app.concat.js", fileConfig));		
	} else {
		app.use("/app.min.js", express.static(fodevAppPath + "/app.min.js", fileConfig));
	}

	// define the static routes
	app.use("/assets", express.static(fodevAppPath + "/assets", fileConfig));
	app.use("/bower_components", express.static(fodevAppPath + "/bower_components", fileConfig));
	app.use("/components", express.static(fodevAppPath + "/components", fileConfig));
	app.use("/partials", express.static(fodevAppPath + "/partials", fileConfig));
	app.use("/services", express.static(fodevAppPath + "/services", fileConfig));
	app.use("/directives", express.static(fodevAppPath + "/directives", fileConfig));
	app.use("/template", express.static(fodevAppPath + "/template", fileConfig));
	app.use("/config", express.static(fodevAppPath + "/config", fileConfig));
	app.use("/sitemap.xml", express.static(fodevAppPath + "/sitemap.xml", fileConfig));
	app.use("/robots.txt", express.static(fodevAppPath + "/robots.txt", fileConfig));

	// application -------------------------------------------------------------
	app.all('/*', function(req, res) {

        var file = path.resolve(fodevAppPath + "/index.html");
        
        res.sendFile(file);

	});

}
