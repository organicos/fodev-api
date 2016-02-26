"use strict"

var BasketController = function() {

    var self = this;
    
    var Baskets = require('./../models/Baskets.js');
    
    var Products = require('./../models/Products.js');
    
    self.Schema = Baskets;
    
    self.validateBasket = function(basket, callback){
        
        // REMOVE UNNECESSARY FIELDS
        checkFields(basket, function(basket){

            // UPDATE THE BASKET PRODUCTS WITH ITS LAST VERSION
            updateProducts(basket, function(basket) {

                // REMOVE INACTIVE PRODUCTS
                removeInactiveProducts(basket, function(basket){

                    // CALCULATE TOTALS
                    calculateTotals(basket, function(basket){

                        // RUN THE CALLBACK
                        callback(basket);
                        
                    });
                                    
                });
            
            });
            
        });

    };
    
    var checkFields = function(basket, callback){
        
        basket.name = basket.name || 'Nova cesta';
        basket.products = basket.products || [];
        
        callback(basket);
        
    };
    
    var updateProducts = function (basket, callback) {

        var validProducts = [];
        
        var numberOfProducts = basket.products.length;
        
        var iterateOverProducts = function(index){
            
            if (index == numberOfProducts) {
                
                basket.products = validProducts;
    
                callback(basket);
                
            } else {
                
                var product = basket.products[index];
    
                if(product._id){
                    
                    Products
                    .findOne({_id: product._id})
                    .lean()
                    .populate(['prices', 'costs'])
                    .exec(function(err, validProduct) {
                        
                        if (!err && validProduct._id) {
                            
                            validProduct.quantity = product.quantity;
                    
                            validProducts.push(validProduct);
                                    
                        }
                        
                        iterateOverProducts(index+1);
                        
                    });
                    
                }                
                
            }
            
        };
        
        iterateOverProducts(0);

    };
    
    var removeInactiveProducts = function(basket, callback){
        
        var activeProducts = [];
        var inactiveProducts = [];
            
        for (var i = 0; i < basket.products.length; i++) {

            var product = basket.products[i];

            if(product.active) {
    
                activeProducts.push(product);
                
            } else {
                
                inactiveProducts.push(product);
                
            }
        
        }
        
        basket.products = activeProducts;
        
        basket.inactiveProducts = inactiveProducts;
        
        callback(basket);
        
    };
    
    var calculateTotals = function(basket, callback){
        
        calculateTotal(basket);
        calculateEstimatedCost(basket);

        callback(basket);
        
    };
    
    var calculateTotal = function(basket){
        
        basket.total = 0;

        var arrayLength = basket.products.length;
        
        for (var i = 0; i < arrayLength; i++) {

            var product = basket.products[i];

            basket.total += product.prices[0].price * product.quantity;
                
        };

        return basket.total;
        
        
    };
            
    var calculateEstimatedCost = function(basket){
        
        if(basket.cost){
            
            basket.cost.estimated = 0;
            
        } else {
            
            basket.cost = { estimated : 0 };
            
        }

        var arrayLength = basket.products.length;
        
        for (var i = 0; i < arrayLength; i++) {

            var product = basket.products[i];

            basket.cost.estimated += product.costs[0].price * product.quantity;
                
        };

        return basket.cost.estimated;
        
    };
    
};

module.exports = new BasketController();