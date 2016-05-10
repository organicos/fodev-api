'use strict';

var categories = angular.module('myApp.categories', ['ngRoute']);

categories.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/categories', {
        templateUrl: '/partials/categories/categories.html',
        controller: 'AdminCategoriesCtrl'
    })
    .when('/category/:id', {
        templateUrl: '/partials/categories/category.html',
        controller: 'AdminCategoryCtrl'
    })
    .when('/category', {
        templateUrl: '/partials/categories/category.html',
        controller: 'AdminCategoryCtrl'
    });
}]);

categories.controller('AdminCategoriesCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Categorias');

    $scope.categories = [];
    $scope.categoryFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/categories').then(function(res) {
    
        $scope.categories = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.dropCategory = function(category) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir categoria',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a categoria ' + category.name + "?",
            bodyText: 'Deseja realmente excluir a categoria ' + category.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/categories/' + category._id)
                .success(function(res) {
                
                    var productIndex = $scope.categories.indexOf(category);
                    
                    $scope.categories.splice(productIndex, 1);
                
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

categories.controller('AdminCategoryCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.category = {};
    $scope.categoriesQuery = "";
    $scope.processingCategoryUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/category/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.category = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.categoryFormSubmit = function () {
    
        $scope.processingCategoryUpdate = true;
        
        if($scope.category._id){
          
            $scope.categoryPut($scope.product);
          
        } else {
        
            $scope.categoryPost($scope.product); 
        
        }
    
    }
  
    $scope.categoryPost = function() {
    
        $http.post(myConfig.apiUrl + '/category', $scope.category)
        .success(function(resp) {
          
            $location.path("/category/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a categorym. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingCategoryUpdate = false;
        });
    
    };
  
    $scope.categoryPut = function(){

        $http.put(myConfig.apiUrl+'/category/'+$scope.category._id, $scope.category)
        .success(function(res) {
            
        
            $scope.$storage.category = res;
    
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

            $scope.processingCategoryUpdate = false;

        });
        
    }


  
}]);