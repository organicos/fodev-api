"use strict";

module.exports=function(app, express, config) {
	
	var path = require('path');
	var day = 86400000;
	var week = 7 * day;
	var month = 30 * day;
	var year = 365 * day;

	// these need to go first:
	app.use("/app.min.css", express.static(__dirname + "../../../fodev-app/app.min.css", { maxAge: week }));
	
	if(config.env == 'dev'){
		app.use("/app.min.js", express.static(__dirname + "../../../fodev-app/app.concat.js", { maxAge: week }));		
	} else {
		app.use("/app.min.js", express.static(__dirname + "../../../fodev-app/app.min.js", { maxAge: week }));
	}

	app.use("/assets", express.static(__dirname + "../../../fodev-app/assets", { maxAge: week }));
	app.use("/bower_components", express.static(__dirname + "../../../fodev-app/bower_components", { maxAge: week }));
	app.use("/components", express.static(__dirname + "../../../fodev-app/components", { maxAge: week }));
	app.use("/partials", express.static(__dirname + "../../../fodev-app/partials", { maxAge: week }));
	app.use("/template", express.static(__dirname + "../../../fodev-app/template", { maxAge: week }));
	app.use("/config", express.static(__dirname + "../../../fodev-app/config", { maxAge: week }));
	app.use("/sitemap.xml", express.static(__dirname + "../../../fodev-app/sitemap.xml", { maxAge: week }));
	app.use("/robots.txt", express.static(__dirname + "../../../fodev-app/robots.txt", { maxAge: week }));

	// application -------------------------------------------------------------
	app.all('/*', function(req, res) {

        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
        
        res.sendFile(file);

	});

}
