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

categories.controller('AdminCategoriesCtrl', ['$scope', 'categoryService', 'HtmlMetaTagService', function($scope, categoryService, HtmlMetaTagService) {
    HtmlMetaTagService.tag('title', 'Categorias');
    $scope.categories = [];
    $scope.categoryFormModalObject = {};
    categoryService.get().then(function(res) {
        $scope.categories = res.data;
    }, function(err) {
        console.error('ERR', err);
    });
    $scope.dropCategory = function(category) {
        categoryService.delete(category).then(
            function(res) {
                var productIndex = $scope.categories.indexOf(category);
                $scope.categories.splice(productIndex, 1);
            }, 
            function (res) {
                var error_list = [];
                angular.forEach(res.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                $scope.$emit('alert', {
                    kind: 'danger',
                    msg: error_list,
                    title: "Não foi possível remover esta categoria. Verifique o motivo abaixo:"
                });
            }
        ).finally(function () {
            $scope.processingCategoryUpdate = false;
        });


    };
}]);

categories.controller('AdminCategoryCtrl', ['$scope', '$routeParams', '$location', 'HtmlMetaTagService', 'categoryService', function($scope, $routeParams, $location, HtmlMetaTagService, categoryService) {
    HtmlMetaTagService.tag('title', 'Edição de categoria');
    $scope.category = {};
    $scope.categoriesQuery = "";
    $scope.processingCategoryUpdate = false;
    
    if($routeParams.id){
        categoryService.get({_id: $routeParams.id}).then(
            function(res) {
                HtmlMetaTagService.tag('title', res.data.name);
                $scope.category = res.data;
            }
        )
    }
    
    $scope.removeSubCategory = function(subCategory){
        var subCategoryIndex = $scope.category.subCategories.indexOf(subCategory);
        if(subCategoryIndex >= 0){
            $scope.category.subCategories.splice(subCategoryIndex, 1);
        }
    }

    $scope.deleteSubCategory = function(subCategory){
        categoryService.delete(subCategory).then(
            function(res) {
                $scope.removeSubCategory(subCategory);
            }
            , function (res) {
                var error_list = [];
                angular.forEach(res.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                $scope.$emit('alert', {
                    kind: 'danger',
                    msg: error_list,
                    title: "Não foi possível excluir esta subcategoria. Verifique o motivo abaixo:"
                });
            }
        );
    }

    $scope.addSubCategory = function(){
        var newSubCategorie = {name: 'Nova sub-categoria'};
        if($scope.category.subCategories){
            $scope.category.subCategories.push(newSubCategorie);
        } else {
            $scope.category.subCategories = [newSubCategorie];
        }
    }

    $scope.categoryFormSubmit = function () {
        $scope.processingCategoryUpdate = true;
        if($scope.category._id){
            categoryPut();
        } else {
            categoryPost(); 
        }
    }
  
    $scope.dropCategory = function() {
        categoryService.delete($scope.category).then(
            function(res) {
                $location.path("/categories");
            }
            , function (res) {
                var error_list = [];
                angular.forEach(res.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                $scope.$emit('alert', {
                    kind: 'danger',
                    msg: error_list,
                    title: "Não foi possível excluir esta categoria. Verifique o motivo abaixo:"
                });
            }
        ).finally(function () {
            $scope.processingCategoryUpdate = false;
        });
    };

    function categoryPost() {
        categoryService.post($scope.category).then(
            function(res) {
                $location.path("/category/" + res.data._id);
            }
            , function (res) {
                var error_list = [];
                angular.forEach(res.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                $scope.$emit('alert', {
                    kind: 'danger',
                    msg: error_list,
                    title: "Não foi possível inserir a categoria. Verifique o motivo abaixo:"
                });
            }
        ).finally(function () {
            $scope.processingCategoryUpdate = false;
        });
    };
  
    function categoryPut(){
        categoryService.put($scope.category).then(
            function(res) {
                $scope.category = res.data;
                $scope.$emit('alert', {
                    kind: 'success',
                    msg: ['Dados salvos!'],
                    title: "Sucesso"
                });  
            }
            , function(res) {
                $scope.processingChangePassword = false;
                var error_list = [];
                angular.forEach(res.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                $scope.$emit('alert', {
                  kind: 'danger',
                  msg: error_list,
                  title: "Sua alteração precisa ser revisada. Verifique os motivos abaixo:"
                });  
            }
        ).finally(function(){
            $scope.processingCategoryUpdate = false;
        });
    }
}]);