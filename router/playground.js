"use strict";

module.exports=function(app, mongoose, moment, config, utils) {

    var Articles = require('./../modules/Articles.js');
    
    var Users = require('./../modules/Users.js');
    
    var Products = require('./../modules/Products.js');
    
    var Images = require('./../modules/Images.js');

    var Prices = require('./../modules/Prices.js');
    
    var Suppliers = require('./../modules/Suppliers.js');
    
    var Categories = require('./../modules/Categories.js');

    app.get('/v1/playground', function(req, res) {

       res.send('Você não deveria estar aqui!');
        
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
            
            var updateImageStructure = function(product, callback){

                console.log('updateImageStructure');

                var oldImage = {
                    _id: product.images[0] ? product.images[0]._id : false,
                    title: product.images[0]? product.images[0].title : product.img.split("/").pop().replace(/\.[^/.]+$/, ""),
                    url: product.images[0] ? product.images[0].url : product.img
                }
                
                if(oldImage.url){
                    
                    console.log('======================================================== Produto já tinha imagem: ' + oldImage.url);
                    
                    var inImagesRaw = imagesRaw.filter(function (el) { return el.url == oldImage.url; });
                    
                    if(inImagesRaw.length){
                        
                        console.log('======================================================== A imagem já esta no raw:');
                        
                        product.images = [inImagesRaw[0]._id];
                        
                        Images.remove({_id: oldImage._id}, function(){
                            
                            callback();
                            
                        });
                        
                    } else {
                        
                        console.log('======================================================== A imagem não está no raw');
                        
                        Images.create({
            
                                title : oldImage.title,
            
                                url : oldImage.url
                                
                        }, function(err, newImage) {
            
                            if (err){
                                
                                console.log('======================================================== Tentou criar nova imagem no raw mas houve falha.', err );
                                    
                                    res.statusCode = 400;
                                    
                                    res.send(err);
                                    
                            } else {
                                
                                console.log('======================================================== criou nova imagem');
                                
                                imagesRaw.push(newImage);
                                    
                                product.images = [newImage._id];
                                
                                Images.remove({_id: oldImage._id}, function(){
                                    
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
                    _id: product.categories[0] ? product.categories[0]._id : false,
                    name: product.categories[0] ? product.categories[0].name : product.category
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
                    _id: product.suppliers[0] ? product.suppliers[0]._id : false,
                    name: product.suppliers[0] ? product.suppliers[0].name : product.supplier
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
                
                updateImageStructure(product, function(){
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

                Images.create({
    
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