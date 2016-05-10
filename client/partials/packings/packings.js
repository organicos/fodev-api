'use strict';

var packings = angular.module('myApp.packings', ['ngRoute']);

packings.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/packings', {
        templateUrl: '/partials/packings/packings.html',
        controller: 'AdminPackingsCtrl'
    })
    .when('/packing/:id', {
        templateUrl: '/partials/packings/packing.html',
        controller: 'AdminPackingCtrl'
    })
    .when('/packing', {
        templateUrl: '/partials/packings/packing.html',
        controller: 'AdminPackingCtrl'
    });
}]);

packings.controller('AdminPackingsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Categorias');

    $scope.packings = [];
    $scope.packingFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/packings').then(function(res) {
    
        $scope.packings = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.dropPacking = function(packing) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir categoria',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a categoria ' + packing.name + "?",
            bodyText: 'Deseja realmente excluir a categoria ' + packing.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/packings/' + packing._id)
                .success(function(res) {
                
                    var productIndex = $scope.packings.indexOf(packing);
                    
                    $scope.packings.splice(productIndex, 1);
                
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

packings.controller('AdminPackingCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.packing = {};
    $scope.packingsQuery = "";
    $scope.processingPackingUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/packing/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.packing = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.packingFormSubmit = function () {
    
        $scope.processingPackingUpdate = true;
        
        if($scope.packing._id){
          
            $scope.packingPut($scope.product);
          
        } else {
        
            $scope.packingPost($scope.product); 
        
        }
    
    }
  
    $scope.packingPost = function() {
    
        $http.post(myConfig.apiUrl + '/packing', $scope.packing)
        .success(function(resp) {
          
            $location.path("/packing/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a packingm. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingPackingUpdate = false;
        });
    
    };
  
    $scope.packingPut = function(){

        $http.put(myConfig.apiUrl+'/packing/'+$scope.packing._id, $scope.packing)
        .success(function(res) {
            
        
            $scope.$storage.packing = res;
    
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

            $scope.processingPackingUpdate = false;

        });
        
    }


  
}]);