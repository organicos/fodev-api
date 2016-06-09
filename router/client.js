"use strict";

module.exports=function(app, express, config) {
	var path = require('path');
	var day = 86400000;
	var week = 7 * day;
	var month = 30 * day;
	var year = 365 * day;
	var fodevAppPath = config.clientPath;
	var fileConfig = { maxAge: day };
	var mainJsFile = (config.env == 'dev') ? "app.concat.js" : "app.min.js";

	// STATIC ROUTES
	app.use("/app.min.css", express.static(fodevAppPath + "app.min.css", fileConfig));
	app.use("/app.min.js", express.static(fodevAppPath + mainJsFile, fileConfig));
	app.use("/assets", express.static(fodevAppPath + "assets", fileConfig));
	app.use("/node_modules", express.static(fodevAppPath + "node_modules", fileConfig));
	app.use("/components", express.static(fodevAppPath + "components", fileConfig));
	app.use("/partials", express.static(fodevAppPath + "partials", fileConfig));
	app.use("/services", express.static(fodevAppPath + "services", fileConfig));
	app.use("/directives", express.static(fodevAppPath + "directives", fileConfig));
	app.use("/template", express.static(fodevAppPath + "template", fileConfig));
	app.use("/config", express.static(fodevAppPath + "config", fileConfig));
	app.use("/sitemap.xml", express.static(fodevAppPath + "sitemap.xml", fileConfig));
	app.use("/robots.txt", express.static(fodevAppPath + "robots.txt", fileConfig));

	// DEFAULT ROUTE
	app.all('/*', function(req, res) {
        var file = path.resolve(fodevAppPath + "index.html");
        res.sendFile(file);
	});
}
