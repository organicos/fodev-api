"use strict";

module.exports=function(app) {

	app.get('/', function(req, res) {

		res.send({name: 'bruno', idade: 18}); // load the single view file (angular will handle the page changes on the front-end)

	});

}
