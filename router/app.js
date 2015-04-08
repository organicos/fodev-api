"use strict";

module.exports=function(app, express) {
	
	var path = require('path');
	
	// these need to go first:
	app.use("/app.js", express.static(__dirname + "../../../fodev-app/app.js"));
	app.use("/assets", express.static(__dirname + "../../../fodev-app/assets"));
	app.use("/bower_components", express.static(__dirname + "../../../fodev-app/bower_components"));
	app.use("/components", express.static(__dirname + "../../../fodev-app/components"));
	app.use("/partials", express.static(__dirname + "../../../fodev-app/partials"));
	app.use("/template", express.static(__dirname + "../../../fodev-app/template"));

	// application -------------------------------------------------------------
	app.all('/*', function(req, res) {

        var file = path.resolve(__dirname+'../../../fodev-app/index.html');
        
        res.sendFile(file);

	});

}
