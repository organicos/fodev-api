"use strict";

module.exports=function(app, mongoose, moment, utils) {

        var Products = mongoose.model('Products', {

                name : { type: String, required: 'Informe o nome do produto!' },

                price: Number,
                
                cost: Number,
                
                dscr : String,

                img: {
                        type: String,
                        trim: true,
                        required: 'Forneça uma url válida no campo imagem.',
                        match: [/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/, 'Forneça uma url válida da imagem do produto.']
                },
    
                category : { type: String, required: 'Informe a categoria!' },
                
                highlight : { type: Boolean, default: false },
                
                active : { type: Boolean, default: true },
                
                supplier: String,
                
                season: String,
                
                recipes: String,
                
                updated: { type: Date, default: moment().format("MM/DD/YYYY") }

        });

        app.get('/v1/products', function(req, res) {
                
                utils.getUserKind(req, function(userKind){
                        
                        var filter = {};
                        
                        if(userKind != 'admin') filter.active = 1;
                        
                        Products.find(filter, null, {sort: {name: 1}}, function(err, products) {

                                if (err) {
                                        
                                        res.statusCode = 400;
                                        res.send(err);       
                                }
        
                                res.json(products);
        
                        });

                });

        });

        app.get('/v1/product/:product_id', function(req, res) {

                utils.getUserKind(req, function(userKind){
                        
                        var filter = {_id: req.params.product_id};
                        
                        if(userKind != 'admin') filter.active = 1;
                        
                        Products.findOne(filter, null, function(err, product) {
        
                                if (err){
                                        res.statusCode = 400;
                                        res.send(err);
                                } else {
        
                                        res.json(product);
                                        
                                }
        
                        });

                });
                


        });

        app.post('/v1/products', utils.ensureAuthorized, function(req, res) {

                Products.create({

                        name : req.body.name,

                        price : req.body.price,
                        
                        cost : req.body.cost,
                        
                        dscr : req.body.dscr,
                        
                        img : req.body.img,
                        
                        highlight : req.body.highlight,
                        
                        active : req.body.active,
                        
                        category : req.body.category,

                        supplier: req.body.supplier,
                        
                        season: req.body.season,
                        
                        recipes: req.body.recipes
                
                }, function(err, product) {

                        if (err){
                                
                                res.statusCode = 400;
                                
                                res.send(err);
                                
                        } else {
                                
                                res.json(product);
                                
                        }

                });

        });

        app.put('/v1/products/:product_id', utils.ensureAuthorized, function(req, res){

                return Products.findById(req.params.product_id, function(err, product) {
                        
                        if (err) {
                                
                                res.statusCode = 400;

                                return res.send(err);
                                
                        } else {
                                
                                product.name = req.body.name;
                                
                                product.price = req.body.price;
                                
                                product.cost = req.body.cost;
                                
                                product.dscr = req.body.dscr;
                                
                                product.img = req.body.img;
                                
                                product.highlight = req.body.highlight;
                                
                                product.active = req.body.active;
        
                                product.category = req.body.category;
        
                                product.supplier = req.body.supplier;
                                
                                product.season = req.body.season;
                                
                                product.recipes = req.body.recipes;
                                
                                product.updated = Date.now();
                                
                                return product.save(function(err, updatedProduct) {
        
                                        if (err) {
                                                
                                                res.statusCode = 400;
        
                                                return res.send(err);
        
                                        } else {
                                                
                                                return res.send(updatedProduct);
                                                
                                        }
        
                                });
                                
                        }

                });

        });

        app.delete('/v1/products/:product_id', utils.ensureAuthorized, function(req, res) {

                Products.remove({

                        _id : req.params.product_id

                }, function(err, product) {

                        if (err) {
                                
                                res.statusCode = 400;
                                res.send(err);
                                
                        } else {

                                Products.find(function(err, products) {
        
                                        if (err) {
                                                res.statusCode = 400;
                                                res.send(err);
                                        } else {
        
                                                res.json(products);
                                                
                                        }
        
                                });

                        }

                });

        });

}
