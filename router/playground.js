"use strict";

module.exports=function(app, mongoose, config, utils) {

    var Articles = require('./../models/Articles.js');
    
    var Users = require('./../models/Users.js');
    
    var Products = require('./../models/Products.js');
    
    var Files = require('./../models/Files.js');

    var Prices = require('./../models/Prices.js');
    
    var Suppliers = require('./../models/Suppliers.js');
    
    var Categories = require('./../models/Categories.js');

    app.get('/v1/playground', function(req, res) {

       res.send('Você não deveria estar aqui!');
        
    });

    app.get('/v1/playground/articles/upgrade-slug', function(req, res) {
            
        Articles.find(function(err, articles) {

            if (err) {
                    
                res.statusCode = 400;
                res.send(err);

            }
            
            var total = articles.length;
            var result = [];

            function saveAll(){
                
                var article = articles.pop();
                var encoded = article.name;
                console.log(encoded);

                article.slug = article.encoded_url || 'encoded' + new Date().toString();

                article.save(function(err, savedArticle){
                  
                    if (err) {
                        
                        throw err;//handle error
                        
                    } else {
                        
                        result.push(savedArticle);
                    
                        if (--total) {
                            
                            saveAll();
                            
                        } else {
                            
                            res.send('Artigos migrados com sucesso!');
                            
                        }
                        
                    }

                });
            
            }
            
            saveAll();
            
        });

    });

    app.get('/v1/playground/products/upgrade-sctructure', function(req, res) {
        
        var imagesRaw = [];
        var categoriesRaw = [];
        var suppliersRaw = [];
        
        Products
        .find()
        .populate(['images', 'prices', 'categories', 'costs'])
        .exec(function(err, products) {

            if (err) {
                    
                res.statusCode = 400;
                res.send(err);

            }
            
            var updateFileStructure = function(product, callback){

                console.log('updateFileStructure');

                var oldFile = {
                    _id: product.images instanceof Array ? (product.images[0] ? product.images[0]._id : false) : false,
                    title: product.images instanceof Array ? (product.images[0] ? product.images[0].title : product.img.split("/").pop().replace(/\.[^/.]+$/, "") ) : product.img.split("/").pop().replace(/\.[^/.]+$/, ""),
                    url: product.images instanceof Array ? (product.images[0] ? product.images[0].url : product.img) : product.img
                }
                
                if(oldFile.url){
                    
                    console.log('======================================================== Produto já tinha imagem: ' + oldFile.url);
                    
                    var inFilesRaw = imagesRaw.filter(function (el) { return el.url == oldFile.url; });
                    
                    if(inFilesRaw.length){
                        
                        console.log('======================================================== A imagem já esta no raw:');
                        
                        product.images = [inFilesRaw[0]._id];
                        
                        Files.remove({_id: oldFile._id}, function(){
                            
                            callback();
                            
                        });
                        
                    } else {
                        
                        console.log('======================================================== A imagem não está no raw');
                        
                        Files.create({
            
                                title : oldFile.title,
            
                                url : oldFile.url
                                
                        }, function(err, newFile) {
            
                            if (err){
                                
                                console.log('======================================================== Tentou criar nova imagem no raw mas houve falha.', err );
                                    
                                    res.statusCode = 400;
                                    
                                    res.send(err);
                                    
                            } else {
                                
                                console.log('======================================================== criou nova imagem');
                                
                                imagesRaw.push(newFile);
                                    
                                product.images = [newFile._id];
                                
                                Files.remove({_id: oldFile._id}, function(){
                                    
                                    callback();
                                    
                                });
                                                                
                            }
            
                        });
                        
                    }
                    
                } else {
                    
                    callback();
                    
                }
                    
            }
            
            var updateCategoryStructure = function(product, callback){
                
                console.log('updateCategoryStructure');

                var oldCategory = {
                    _id: product.categories instanceof Array ? (product.categories[0] ? product.categories[0]._id : false) : false,
                    name: product.categories instanceof Array ? (product.categories[0] ? product.categories[0].name : product.category) :  product.category
                }
                
                if(oldCategory.name){
                    
                    console.log('======================================================== Produto ja tinha categoria: ' + oldCategory.name);
                    
                    var inCategoriesRaw = categoriesRaw.filter(function (el) { return el.name == oldCategory.name; });
                    
                    if(inCategoriesRaw.length){
                        
                        console.log('======================================================== ja tem categoria no raw');
                        
                        product.categories = [inCategoriesRaw[0]._id];
                        
                        Categories.remove({_id: oldCategory._id}, function(){
                            
                            callback();
                            
                        });
                        
                    } else {
                        
                        console.log('======================================================== nao tem categoria no raw');
                        
                        Categories.create({
            
                                name : oldCategory.name
                                
                        }, function(err, newCategory) {
            
                            if (err){
                                
                                console.log('======================================================== nao criou nova categoria');
                                    
                                    res.statusCode = 400;
                                    
                                    res.send(err);
                                    
                            } else {
                                
                                console.log('======================================================== criou nova categoria');
                                
                                categoriesRaw.push(newCategory);
                                    
                                product.categories = [newCategory._id];
                                
                                Categories.remove({_id: oldCategory._id}, function(){
                                    
                                    callback();
                                    
                                });
                                                                
                            }
            
                        });
                        
                    }
                
                } else {
                    
                    console.log('======================================================== Produto não tinha categoria');
                    
                    callback();
                    
                }
                    
            }

            var updateSuppliersStructure = function(product, callback){
                
                console.log('updateSuppliersStructure');

                var oldSupplier = {
                    _id: product.suppliers instanceof Array ? (product.suppliers[0] ? product.suppliers[0]._id : false) : false,
                    name: product.suppliers instanceof Array ? (product.suppliers[0] ? product.suppliers[0].name : product.supplier) : product.supplier
                }
                
                
                if(oldSupplier.name){
                    
                    console.log('======================================================== Produto já tinha fornecedor: '+oldSupplier.name);

                    var inSuppliersRaw = suppliersRaw.filter(function (el) { return el.name == oldSupplier.name; });
                    
                    if(inSuppliersRaw.length){
                        
                        console.log('======================================================== já tinha fornecedor no raw');
                        
                        product.suppliers = [inSuppliersRaw[0]._id];
                        
                        Suppliers.remove({_id: oldSupplier._id}, function(){
                            
                            callback();
                            
                        });
                        
                    } else {
                        
                        console.log('======================================================== não tinha fornecedor no raw');
                        
                        Suppliers.create({
            
                                name : oldSupplier.name
                                
                        }, function(err, newSupplier) {
            
                            if (err){
                                
                                console.log('======================================================== erro ao criar novo fornecedor');
                                    
                                    res.statusCode = 400;
                                    
                                    res.send(err);
                                    
                            } else {
                                
                                console.log('======================================================== novo fornecedor criado');
                                
                                suppliersRaw.push(newSupplier);
                                    
                                product.suppliers = [newSupplier._id];
                                
                                Suppliers.remove({_id: oldSupplier._id}, function(){
                                    
                                    callback();
                                    
                                });
                                                                
                            }
            
                        });
    
                        
                    }
                
                } else {
                    
                    console.log('======================================================== ja tinha fornecedor: '+oldSupplier.name);
                    
                    callback();

                }
                    

            }
            
            var total = products.length;
            var result = [];

            (function saveAll(){
                
                var product = products.pop();
                
                console.log('================================================================================================================');
                console.log('====================================================' + product._id + '============================================================');
                console.log('================================================================================================================');
                
                console.log(product);
                
                updateFileStructure(product, function(){
                    updateCategoryStructure(product, function(){
                        updateSuppliersStructure(product, function(){
                            
                            console.log(product);
                            
                            product.save(function(err, savedProduct){
                              
                                if (err) {
                                    
                                    throw err;//handle error
                                    
                                } else {
                                    
                                    result.push(savedProduct);
                                
                                    if (--total) {
                                        
                                        saveAll();
                                        
                                    } else {
                                        
                                        res.send('Produtos migrados com sucesso!');
                                        
                                    }
                                    
                                }
                            
                            });
                        })

                    })
                });

            })();
            
        });

    });

    app.get('/v1/playground/articles/upgrade-images-sctructure', function(req, res) {
            
        Articles.find(function(err, articles) {

            if (err) {
                    
                res.statusCode = 400;
                res.send(err);

            }
            
            var total = articles.length;
            var result = [];

            function saveAll(){
                
                var article = articles.pop();

                Files.create({
    
                        title : article.img.split("/").pop(),
    
                        url : article.img
                        
                }, function(err, image) {
    
                    if (err){
                            
                            res.statusCode = 400;
                            
                            res.send(err);
                            
                    } else {
                            
                        article.images = [image._id];
    
                        article.save(function(err, savedArticle){
                          
                        if (err) {
                            
                            throw err;//handle error
                            
                        } else {
                            
                            result.push(savedArticle);
                        
                            if (--total) {
                                
                                saveAll();
                                
                            } else {
                                
                                res.send('Artigos migrados com sucesso!');
                                
                            }
                            
                        }
                        
                        });
                                                        
                    }
    
    
    
                });
            
            }
            
            if(articles[0].images.length){
                
                res.send('Ação não permitida! Migração já foi realizada anteriormente.');
                
            } else {
                
                saveAll();
                
            }
            
            

        });

    });
        
}