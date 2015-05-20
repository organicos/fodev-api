"use strict";

module.exports=function(app, express) {
	
	var path = require('path');

	// these need to go first:
	app.use("/js", express.static(__dirname + "../../../fodev-app/js", { maxAge: 86400000 }));
	app.use("/app.js", express.static(__dirname + "../../../fodev-app/app.js", { maxAge: 86400000 }));
	app.use("/app.min.js", express.static(__dirname + "../../../fodev-app/app.min.js", { maxAge: 86400000 }));
	app.use("/assets", express.static(__dirname + "../../../fodev-app/assets", { maxAge: 86400000 }));
	app.use("/bower_components", express.static(__dirname + "../../../fodev-app/bower_components", { maxAge: 86400000 }));
	app.use("/components", express.static(__dirname + "../../../fodev-app/components", { maxAge: 86400000 }));
	app.use("/partials", express.static(__dirname + "../../../fodev-app/partials", { maxAge: 86400000 }));
	app.use("/template", express.static(__dirname + "../../../fodev-app/template", { maxAge: 86400000 }));
	app.use("/config", express.static(__dirname + "../../../fodev-app/config", { maxAge: 86400000 }));
	app.use("/sitemap.xml", express.static(__dirname + "../../../fodev-app/sitemap.xml", { maxAge: 86400000 }));
	app.use("/robots.txt", express.static(__dirname + "../../../fodev-app/robots.txt", { maxAge: 86400000 }));

	// application -------------------------------------------------------------
	app.all('/*', function(req, res) {

        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
        
        res.sendFile(file);

	});

}
