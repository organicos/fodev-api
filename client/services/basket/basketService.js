angular.module('myApp').service('basketService', ['$uibModal', '$localStorage', '$filter', 'confirmModalService', function ($uibModal, $localStorage, $filter, confirmModalService) {
    
    var self = this;
    
    $localStorage.basket = $localStorage.basket ? $localStorage.basket : {};
    
    var basket = $localStorage.basket;

    self.getProducts = function(){
        return basket.products;
    };
    
    self.setProducts = function(products){
        basket.products = products;
    };
    
    self.productsAmount = function(){
        var amount = 0;
        angular.forEach(basket.products, function(product, index){
            amount += product.quantity;
        });
        return amount;
    };

    (self.ensureBasket = function() {
    	if(!basket){
    	    basket = {
                name : 'Nova cesta',
                total : 0,
            	products : []
    	    };
    	} else {
            if(!basket.name) basket.name = 'Nova cesta';            
            if(!basket.total || basket.total < 0) basket.total = 0;
        	if(!basket.products) basket.products = [];
    	}
    })();

    (self.refreshTotal = function () {
        basket.total = 0;
        var validProducts = [];
        angular.forEach(basket.products, function(product) {
            if(product.quantity >= 1){
                basket.total += product.prices[0].price * product.quantity;
                validProducts.push(product);
            }
        });
        basket.products = validProducts;;
    })();
    
    self.getTotal = function(){
        self.refreshTotal();
        return basket.total;
    }
    
    self.addToBasket = function (product) {
        var basketProduct = ($filter('filter')(basket.products, {_id: product._id}, false))[0];
        if(basketProduct){
            basketProduct.quantity = basketProduct.quantity >= 0 ? basketProduct.quantity : 1;
            basketProduct.quantity ++;
        }  else {
            product.quantity = 1;
            basket.products.push(product);
        }
        self.refreshTotal();
    };
    
    self.dropFromBasket = function (product, decreasingAmount) {
        var productIndex = basket.products.indexOf(product);
        var product = basket.products[productIndex];
        if (productIndex >= 0) {
            if (decreasingAmount > 0 & product.quantity > decreasingAmount) {
                product.quantity -= decreasingAmount;
            } else {
                basket.products.splice(productIndex, 1);   
            }
        }
        self.refreshTotal();
    };
    
    self.clearBasket = function(doNotAskFormConfirmation){
        if(doNotAskFormConfirmation != true){

            var modalOptions = {
                closeButtonText: 'Cancelar',
                actionButtonText: 'Esvaziar cesta',
                actionButtonKind: 'btn-danger',
                headerText: 'Cornfirme',
                bodyText: 'Deseja realmente esvaziar sua cesta?'
            };
        
            confirmModalService.showModal({}, modalOptions)
            .then(function (result) {
              
              if(result){
                
                basket.products = [];
                
              }
        
            });
            
        } else {
            
            basket.products = [];
            
        }

    };
    
    self.openBasket = function(){
        var currentTimestamp = new Date().getTime();
        return $uibModal.open({
            backdrop: true,
            keyboard: true,
            modalFade: true,
            size: 'lg',
            templateUrl: '/services/basket/basket_modal.html?' + currentTimestamp,
            controller: function ($scope, $location, $uibModalInstance) {
                $scope.basket = basket;
                $scope.getTotal = self.getTotal;
                $scope.addToBasket = self.addToBasket;
                $scope.dropFromBasket = self.dropFromBasket;
                $scope.modalOptions = {
                    ok: function (result) {
                        $location.path('/revisar-pedido');
                        $uibModalInstance.dismiss('order_review');
                    },
                    close: function (result) {
                        $uibModalInstance.dismiss('cancel');
                    },
                    goTo: function(location){
                        $location.path(location);
                        $uibModalInstance.dismiss(location);
                    },
                    clearBasket: self.clearBasket
                };
            }
        }).result;
    };
    
    self.setBasket = function(newBasket){
        basket = newBasket;
        $localStorage.basket = newBasket;
    };
    
    self.getBasket = function(){
        return basket;
    };
    
}]);