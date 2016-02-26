"use strict"

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Products = require('./../models/Products.js');

var Baskets = new Schema({
    name : { type: String, required: 'Informe o nome da cesta!' },
    total: { type: Number, required: 'Informe o total!' },
    products: { type: Array, required: 'A cesta está vazia!' },
    customer : { type : Schema.Types.ObjectId, ref: 'Users', required: "Não conseguimos identificar o dono desta cesta."},
    updated: { type: Date, default: Date.now },
    created: { type: Date, default: Date.now }
});

Baskets.statics.validateBasket = function(basket, callback){
    
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
            
    }

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
            
    }

    return basket.cost.estimated;
    
};
    
module.exports = mongoose.model('Baskets', Baskets);