'use strict';

var suppliers = angular.module('myApp.suppliers', ['ngRoute']);

suppliers.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/fornecedores', {
        templateUrl: '/partials/suppliers/suppliers.html',
        controller: 'AdminSuppliersCtrl'
    })
    .when('/fornecedor/:id', {
        templateUrl: '/partials/suppliers/supplier.html',
        controller: 'AdminSupplierCtrl'
    })
    .when('/fornecedor', {
        templateUrl: '/partials/suppliers/supplier.html',
        controller: 'AdminSupplierCtrl'
    });
}]);

suppliers.controller('AdminSuppliersCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Fornecedores');

    $scope.suppliers = [];
    $scope.supplierFormModalObject = {};
    $scope.selectedOrder = 'name';
    
    $http.get(myConfig.apiUrl+'/suppliers').then(function(res) {
    
        $scope.suppliers = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });

    $scope.dropSupplier = function(supplier) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir fornecedor',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir o fornecedor ' + supplier.name + "?",
            bodyText: 'Deseja realmente excluir o fornecedor ' + supplier.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/suppliers/' + supplier._id)
                .success(function(res) {
                
                    var productIndex = $scope.suppliers.indexOf(supplier);
                    
                    $scope.suppliers.splice(productIndex, 1);
                
                })
                .error(function (resp) {
                
                    var error_list = [];
                    
                    angular.forEach(resp.errors, function(error, path) {
                        this.push(error.message);
                    }, error_list);
                    
                    $scope.$emit('alert', {
                        kind: 'danger',
                        msg: error_list,
                        title: "Não foi possível remover a fornecedor. Verifique o motivo abaixo:"
                    });
                
                });
            
            }
        
        });
    
    };
    
}]);

suppliers.controller('AdminSupplierCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', '$filter', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService, $filter) {
  
    $scope.supplier = {};
    $scope.suppliersQuery = "";
    $scope.processingSupplierUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/supplier/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.supplier = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.supplierFormSubmit = function () {
    
        $scope.processingSupplierUpdate = true;
        
        if($scope.supplier._id){
          
            $scope.supplierPut($scope.product);
          
        } else {
        
            $scope.supplierPost($scope.product); 
        
        }
    
    }
  
    $scope.supplierPost = function() {
    
        $http.post(myConfig.apiUrl + '/supplier', $scope.supplier)
        .success(function(resp) {
          
            $location.path("/fornecedor/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a supplierm. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingSupplierUpdate = false;
        });
    
    };
  
    $scope.supplierPut = function(){

        $http.put(myConfig.apiUrl+'/supplier/'+$scope.supplier._id, $scope.supplier)
        .success(function(res) {
            
        
            $scope.$storage.supplier = res;
    
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

            $scope.processingSupplierUpdate = false;

        });
        
    }

    $scope.getProducts = function(name){
        return $http.get(myConfig.apiUrl+'/products', {
            params: {
                name: name
            }
        }).then(function(res) {
        
            return res.data;
        
        });
    }
    
    $scope.selectProduct = function (item, model, label) {
    
        var product = ($filter('filter')($scope.supplier.products, {_id: item._id}, false))[0];
    
        if (!product) {
        
            $scope.supplier.products.push(item);
        
        }
        
        $scope.selectedProduct = '';
    
    };
    
    $scope.dropProductFromSupplier = function(product){

        var productIndex = $scope.supplier.products.indexOf(product);
        if (productIndex >= 0) {
            $scope.supplier.products.splice(productIndex, 1);
        }
        
    };
  
}]);