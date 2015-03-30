"use strict";

module.exports=function(app, mongoose, moment) {
    
    var Products = mongoose.model('Products');

    var Order = mongoose.model('Order', {

            name : { type: String, required: 'Informe o nome da cesta!' },

            total: Number,
            
            products: { type: Array, required: 'A cesta está vazia!' },
            
            updated: { type: Date, default: moment().format("MM/DD/YYYY") }

    });

    var validateOrder = function(basket, validationCallback){

        var newBasket = {
            name: basket.name || 'Nova cesta',
            total: 0,
            products: [],
            inactive_products: []
        };

        var iterateElements = function (elements, index, callback) 
        {
            if (index == elements.length) {

                return callback(newBasket);
                
            } else {

                // do database call with element
                var product = elements[index];

                if(product._id){
                    
                    Products.findOne({_id: product._id, active: true}, function(err, productNow) {
                        
                        console.log(productNow);

                        if (err) {
                                
                            newBasket.inactive_products.push(product);
                                
                        } else {

                            if(productNow) {
                                
                                product.price = productNow.price;
                                product.dscr = productNow.dscr;
                                product.name = productNow.name;
                                console.log(product);
                                newBasket.products.push(product);
                                newBasket.total += Number(product.price * product.quantity);
                            
                            } else {
                                
                                newBasket.inactive_products.push(product);
                                
                            }

                        }
                        
                        iterateElements(elements, index+1, callback);
                        
                    });
                    
                }

            }

        }
        
        iterateElements(basket.products, 0, function(newBasket) {

            validationCallback(newBasket);

        });
        
        return this;
    }

    app.post('/v1/order_review', function(req, res) {
        // verifica se existe produtos na cesta
        if(req.body.basket.products && req.body.basket.products.length > 0){
            
            validateOrder(req.body.basket, function(basket){
                
                basket.total.toFixed(2);
                
                if(basket.inactive_products.length > 0){
                    
                    res.statusCode = 400;
                    res.send(basket);
                    
                } else {
                    
                    res.send(basket);
                    
                }
            });
 
            // atualiza o preço dos produtos
            
        } else {
            res.statusCode = 400;
            res.send({errors: {
                'Products' : {
                    message: "A cesta está vazia."
                }
            }});
        }
        
    });

}