'use strict';

var discounts = angular.module('myApp.discounts', ['ngRoute']);

discounts.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/discounts', {
        templateUrl: '/partials/discounts/discounts.html',
        controller: 'AdminDiscountsCtrl'
    })
    .when('/discount/:id', {
        templateUrl: '/partials/discounts/discount.html',
        controller: 'AdminDiscountCtrl'
    })
    .when('/meus/descontos', {
        templateUrl: '/partials/users/discounts.html',
        controller: 'AdminDiscountsCtrl'
    })
    .when('/meu/desconto/:id', {
        templateUrl: '/partials/users/discount.html',
        controller: 'AdminDiscountCtrl'
    })
    .when('/discount', {
        templateUrl: '/partials/discounts/discount.html',
        controller: 'AdminDiscountCtrl'
    });
}]);

discounts.controller('AdminDiscountsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Categorias');

    $scope.discounts = [];
    $scope.discountFormModalObject = {};
    $scope.loadingDiscounts = true;
    $scope.showSearchForm = false;

    $http.get(myConfig.apiUrl+'/discounts').then(function(res) {
        
        $scope.discounts = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    }).finally(function(res){
        
        $scope.loadingDiscounts = false;
        
    });
    
    $scope.dropDiscount = function(discount) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir categoria',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a categoria ' + discount.name + "?",
            bodyText: 'Deseja realmente excluir a categoria ' + discount.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/discounts/' + discount._id)
                .success(function(res) {
                
                    var productIndex = $scope.discounts.indexOf(discount);
                    
                    $scope.discounts.splice(productIndex, 1);
                
                })
                .error(function (resp) {
                
                    var error_list = [];
                    
                    angular.forEach(resp.errors, function(error, path) {
                        this.push(error.message);
                    }, error_list);
                    
                    $scope.$emit('alert', {
                        kind: 'danger',
                        msg: error_list,
                        title: "Não foi possível remover a categoria. Verifique o motivo abaixo:"
                    });
                
                });
            
            }
        
        });
    
    };

}]);

discounts.controller('AdminDiscountCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.discount = {};
    $scope.discountsQuery = "";
    $scope.processingDiscountUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/discount/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.discount = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.discountFormSubmit = function () {
    
        $scope.processingDiscountUpdate = true;
        
        if($scope.discount._id){
          
            $scope.discountPut($scope.product);
          
        } else {
        
            $scope.discountPost($scope.product); 
        
        }
    
    }
  
    $scope.discountPost = function() {
    
        $http.post(myConfig.apiUrl + '/discount', $scope.discount)
        .success(function(resp) {
          
            $location.path("/discount/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a discountm. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingDiscountUpdate = false;
        });
    
    };
  
    $scope.discountPut = function(){

        $http.put(myConfig.apiUrl+'/discount/'+$scope.discount._id, $scope.discount)
        .success(function(res) {
            
        
            $scope.$storage.discount = res;
    
            $scope.$emit('alert', {
                kind: 'success',
                msg: ['Dados salvos!'],
                title: "Sucesso"
            });  
          
        }).error(function(err) {
            
            $scope.processingChangePassword = false;
        
            var error_list = [];
            
            angular.forEach(err.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Sua alteração precisa ser revisada. Verifique os motivos abaixo:"
            });  
        
        }).finally(function(){

            $scope.processingDiscountUpdate = false;

        });
        
    }


  
}]);