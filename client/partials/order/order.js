'use strict';

var currentTimestamp = new Date().getTime();

var order = angular.module('myApp.order', ['ngRoute']);

order.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/revisar-pedido', {
    templateUrl: '/partials/order/order_review.html' + '?' + currentTimestamp,
    controller: 'OrderReviewCtrl'
  });
  $routeProvider.when('/pedido/:id', {
    templateUrl: '/partials/order/order.html' + '?' + currentTimestamp,
    controller: 'OrderCtrl'
  });
  $routeProvider.when('/order/:id', {
    templateUrl: '/partials/order/order.html' + '?' + currentTimestamp,
    controller: 'OrderCtrl'
  });
  $routeProvider.when('/pedidos', {
    templateUrl: '/partials/order/orders.html',
    controller: 'OrdersCtrl'
  });
  $routeProvider.when('/orders', {
    templateUrl: '/partials/order/orders.html',
    controller: 'OrdersCtrl'
  });
  $routeProvider.when('/meu/pedido/:id', {
    templateUrl: '/partials/users/order.html' + '?' + currentTimestamp,
    controller: 'OrderCtrl'
  });
  $routeProvider.when('/meus/pedidos', {
    templateUrl: '/partials/users/orders.html',
    controller: 'OrdersCtrl'
  });
}]);

var statuses = [
  {id: 0, name: 'Pagamento pendente', desc: 'Aguardando pagamento.'},
  {id: 1, name: 'Pago', desc: 'Aguardando entrega.'},
  {id: 2, name: 'Entregue', desc: 'Cesta entregue ao cliente.'},
  {id: 3, name: 'Cancelado', desc: 'Pedido cancelado por falta de pagamento.'},
  {id: 4, name: 'Problemas', desc: 'Problemas com o Pagseguro.'},
  {id: 5, name: 'Inválido', desc: 'Pedidos que não respeitam a política do negócio.'}
];

order.controller('OrdersCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'HtmlMetaTagService', '$uibModal', function($scope, $http, $filter, $routeParams, myConfig, HtmlMetaTagService, $uibModal) {
  
    HtmlMetaTagService.tag('title', 'Pedidos');
    $scope.checkAllStatus = false;
    $scope.orderByField = 'updated';
    $scope.orders = [];
    $scope.userFormModalObject = {};
    $scope.statuses = statuses;
    $scope.reverseSort = true;
    $http.get(myConfig.apiUrl+'/orders')
    .success(function(res) {
    
        $scope.orders = res;
        
        //$scope.orderFormModalObject = ($filter('filter')($scope.orders, {_id: $routeParams.id}, false))[0];
    
    }).error(function(err) {
    
        console.error('ERR', err);
    
    });

  $scope.dropOrder = function(order){
      
    var confirmed = confirm('Deseja realmente excluir o produto ' + order._id + "?");
      
    if (confirmed) {

      $scope.saving_product = true;
        $http.delete(myConfig.apiUrl + '/order/' + order._id)
        .success(function() {
          $scope.$emit('alert', {
              kind: 'success',
              msg: [],
              title: "Ordem removida com sucesso!"
          });
          var order_index = $scope.orders.indexOf(order);
          $scope.orders.splice(order_index,1);
        })
        .error(function (resp) {
          
          var error_list = [];
    
          angular.forEach(resp.errors, function(error, path) {
            this.push(error.message);
          }, error_list);
          
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
          });
    
      })
      .finally(function () {
        $scope.saving_product = false;
      });
      
    };
    
  };
  
  $scope.checkAllOrders = function(){
    angular.forEach($scope.orders, function(order, orderIndex) {
      $scope.orders[orderIndex].checked = $scope.checkAllStatus;
    });
  };
  
  $scope.showCheckedOrderProductsCondensed = function(){

    var condensedList = [];
    var checkedOrders = ($filter('filter')($scope.orders, {checked: true}, false));
    

    angular.forEach(checkedOrders, function(order, orderIndex) {
      angular.forEach(order.products, function(product, productIndex) {
        var productInCondensedList = ($filter('filter')(condensedList, {_id: product._id}, false))[0];
        if(productInCondensedList){
          var productInCondensedListIndex = condensedList.indexOf(productInCondensedList);
          condensedList[productInCondensedListIndex].quantity += product.quantity;
        }  else {
            condensedList.push(angular.copy(product));
        }
      });
    });


    return $uibModal.open({
      backdrop: true,
      keyboard: true,
      modalFade: true,
      size: 'lg',
      templateUrl: '/partials/order/order_condensed_modal.html',
      controller: function ($scope, $location, $uibModalInstance) {
        $scope.products = condensedList;
        $scope.modalOptions = {
          print: function (result) {
            $location.path('/printCondensedProductsList');
            $uibModalInstance.dismiss('print');
          },
          close: function (result) {
            $uibModalInstance.dismiss('cancel');
          }
        }
      }
    }).result;
  }
}]);

order.controller('OrderCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', '$uibModal', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService, $uibModal) {
  
  $scope.order = {};
  $scope.statuses = statuses;
  $scope.changingStatus = false;
  
  if($routeParams.id){

    $http.get(myConfig.apiUrl+'/order/'+$routeParams.id)
    .success(function(res) {
    
        HtmlMetaTagService.tag('title', 'Pedido ' + res._id);
    
        $scope.order = res;
  
    }).error(function(err, response) {
  
        if(response === 403) {
          
            $scope.$emit('alert', {
                kind: 'danger',
                msg: ['Você precisa se identificar para rever seu pedido!'],
                title: "Não foi possível carregar seu pedido. Verifique o motivo abaixo:"
            });  
          
        }
  
    });
    
  }

  $scope.orderTotal = function(){

    var total = 0;

    angular.forEach($scope.order.products, function(product, index){
      if(!product.active)
        total += product.prices[0].price * product.quantity;
    });

    return total;

  }

  $scope.refreshRefoundValue = function(){

    var total = 0;

    angular.forEach($scope.order.products, function(product, index){
      if(product.unavaiable){
        total += product.prices[0].price * product.quantity;
      }
    });

    if($scope.order.refound){
      $scope.order.refound.value = total;
    }

    return total;

  }

  $scope.changeStatus = function(newStatus, oldStatus){

    var hasRefound = $scope.refreshRefoundValue() > 0 ;
    var refounOptionNotSelected = $scope.order.refound.option.length == 0;

    if(hasRefound && refounOptionNotSelected){

      $scope.$emit('alert', {
        kind: 'danger',
        title: 'Alguns produtos não foram entregues.',
        msg: ['Selecione a forma de reembolso antes de continuar.']
      });

      $scope.order.status = oldStatus;

      return false;

    }

    $scope.changingStatus = true;

    var modalOptions = {
        closeButtonText: 'Cancelar',
        actionButtonText: 'Alterar status do pedido',
        actionButtonKind: 'btn-danger',
        headerText: 'Alterar status do pedido para ' + statuses[$scope.order.status].name + "?",
        bodyText: 'Deseja realmente alterar status do pedido para ' + statuses[$scope.order.status].name + "?"
    };

    confirmModalService.showModal({}, modalOptions)
    .then(function (confirmed) {
      
      if(confirmed){

        $scope.order.status = $scope.order.status;
        
        $http.put(myConfig.apiUrl + '/order/'+$scope.order._id, $scope.order)
        .success(function(res) {
    
          $scope.$emit('alert', {
              kind: 'success',
              msg: '',
              title: "Ordem editada com sucesso"
          });
    
        })
        .error( function(resp) {

          $scope.order.status = oldStatus;
          
          var error_list = [];
    
          angular.forEach(resp.errors, function(error, path) {
            this.push(error.message);
          }, error_list);
          
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Não foi possível editar seu pedido. Verifique o motivo abaixo:"
          });
      
        })
        .finally(function () {
          $scope.changingStatus = false;
        });
        
      } else {
        
        $scope.changingStatus = false;
        
      }

    });
    
  };

  $scope.showDepositInstructionsModal = function(){
    
      return $uibModal.open({
          backdrop: true,
          keyboard: true,
          modalFade: true,
          size: 'md',
          templateUrl: '/partials/order/deposit_instructions.html',
          controller: function ($scope, $location, $uibModalInstance) {
              $scope.modalOptions = {
                  close: function (result) {
                      $uibModalInstance.dismiss('cancel');
                  }
              };
          }
      }).result;
  };
    
  $scope.checkPagseguroPayment = function(order_id){
    $http.get(myConfig.apiUrl+'/check_pagseguro_payment/'+order_id)
    .success(function(res) {
    
        $scope.order = res;
    
    }).error(function(err) {
    
        console.error('ERR', err);
    
    });
  };
  
}]);

order.controller('OrderReviewCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, $location, HtmlMetaTagService) {

    HtmlMetaTagService.tag('title', 'Revisão de pedido');
  
    $scope.order = {
      basket: $scope.basketService.getBasket(),
      shipping: {},
      refound: {
        type: 'discount'
      }
    };
    
    $scope.refoundOptions = [
      {name: 'Trocar por semelhante', type: 'product', desc: 'Um produto semelhante será enviado em seu lugar.'},
      {name: 'Gerar desconto', type: 'discount', desc: 'Um crédito no valor do produto é gerado para ser utilizado na próxima compra.'},
      {name: 'Devolver dinheiro', type: 'cash', desc: 'O seu valor é devolvido em dinheiro no momento da entrega.'}
    ];
    $scope.processingOrder = false;
    $scope.orderReady = false;
    $scope.inactiveProducts = [];
    $scope.shipping = {
      nextDates: []
      , locations: []
    };
    $scope.showFormOptions = {
      refound: false,
      packing: false
    };
    
    
    $http.post(myConfig.apiUrl + '/baskets/validate', {
        basket: $scope.order.basket
    })
    .success(function(res) {
        
        $scope.basket = res.basket;
        
    }).error(function(res, status) {
      
        var basket = res.basket;
        var error_list = [];
        
        if(basket && basket.inactiveProducts){
          
            $scope.basketService.setBasket(basket)
            
            angular.forEach(basket.inactiveProducts, function(error, path) {
             this.push(error.name);
            }, error_list);
          
            $scope.$emit('alert', {
              kind: 'danger',
              title: "Infelizmente, os produtos abaixo não estão mais disponíveis:",
              msg: error_list
            });

        } else {
            
          angular.forEach(res.errors, function(error, path) {
            this.push(error.message);
          }, error_list);
          
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Seu pedido precisa ser revisado. Verifique os motivos abaixo:"
          });            
            
        }
        
    })
    .finally(function(){
      $scope.orderReady = true;
    });
    
    $http.get(myConfig.apiUrl + '/shipping/next')
    .success(function(res) {

      var myDateExists = res.indexOf($scope.order.shipping.date) > -1;

      if(!myDateExists){
        
        $scope.order.shipping.date = "";
        
      }
      
      $scope.shipping.nextDates = res;
      
    })
    .error(function(err) {
    
        console.error('ERR', err);
    
    });
        
    $http.get(myConfig.apiUrl + '/discounts')
    .success(function(res) {

      $scope.order.discounts = res;
      
    })
    .error(function(err) {
    
        console.error('ERR', err);
    
    });
    
    $http.get(myConfig.apiUrl + '/packings')
    .success(function(res) {

      $scope.packings = res;
      $scope.order.shipping.packing = res[res.length - 1];
      
      
    })
    .error(function(err) {
    
        console.error('ERR', err);
    
    });

    $http.get(myConfig.apiUrl + '/address/lastUsed')
    .success(function(res) {
      $scope.order.shipping.address = res;
    })
    .error(function(err) {
    
        console.error('ERR', err);
    
    });

    $scope.orderTotal = function(){
  
      var order = $scope.order;
      order.total = 0;

      // products total
      order.total += order.basket.total;
      
      // shiping price
      order.total += order.shipping.address ? order.shipping.address.city.shipping_price : 0;
      
      // packing price
      order.total += order.shipping.packing ? order.shipping.packing.price : 0;
  
      // discunts
      angular.forEach($scope.order.discounts, function(discount, index){
          if(!discount.used){
            order.total -= discount.value;        
          }
      });
      
      return order.total;
  
    }
    
    $scope.getSelectedRefoundOption = function(){
      return ($filter('filter')($scope.refoundOptions, {type: $scope.order.refound.type || ''}, true))[0];
    }
    
    $scope.processOrder = function(){
      
      $scope.processingOrder = true;
  
      $http.post(myConfig.apiUrl + '/order', {
          order: $scope.order
      })
      .success(function(order) {
          
        $scope.order = order;
        
        var doNotAskFormConfirmation = true;
        
        $scope.basketService.clearBasket(doNotAskFormConfirmation);

        $location.path("/meu/pedido/"+order._id);
  
        $scope.$emit('alert', {
          kind: 'success',
          title: "Pedido processado com sucesso.",
          msg: ['Seu pedido foi processado e já pode ser pago. Ao clicar no botão Pagar, você será direcionado para o site do Pagseguro para realizar uma compra prática e segura.'],
          duration: 0
        });
              
      }).error(function(err) {
  
        var error_list = [];
  
        angular.forEach(err.errors, function(error, path) {
          this.push(error.message);
        }, error_list);
        
        $scope.$emit('alert', {
            kind: 'danger',
            msg: error_list,
            title: "Seu pedido precisa ser revisado. Verifique os motivos abaixo:",
            duration: 0
        });  
      
      }).finally(function(){
        
        $scope.processingOrder = false;
        
      });
      
    };
  
    $scope.setAddressCbk = function(address){

      $scope.order.shipping.address = address;
      
    }
}]);


