'use strict';

var fair = angular.module('myApp.fair', ['ngRoute', 'chart.js']);

fair.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/feira', {
    templateUrl: '/partials/fair/fair.html',
    reloadOnSearch: false,
    controller: 'FairCtrl'
  });
  $routeProvider.when('/fair', {
    templateUrl: '/partials/fair/fair.html',
    reloadOnSearch: false,
    controller: 'FairCtrl'
  });
  $routeProvider.when('/feira/:id', {
    templateUrl: '/partials/fair/product.html',
    controller: 'FairProductCtrl'
  });
  $routeProvider.when('/fair/:id', {
    templateUrl: '/partials/fair/product.html',
    controller: 'FairProductCtrl'
  });
}]);

fair.controller('FairCtrl', ['$scope','$http', '$filter', '$location', 'myConfig', 'HtmlMetaTagService', function($scope, $http, $filter, $location, myConfig, HtmlMetaTagService) {

  // define the site title
  HtmlMetaTagService.tag('title', 'Feira');
  
  // control the number of times that the same ajax call is make to try more then once.
  var ajaxTries = {};
  
	$scope.products = [];
	$scope.selectedCategory = $location.search().categoria;
	$scope.selectedOrder = "name";
	$scope.loadingProducts = true;
	$scope.showFilter = {def:false};

  $http.get(myConfig.apiUrl + '/products')
  .success(function(resp) {
    
      $scope.products = resp;

  }).error(function(err) {
    
      console.error('ERR', err);

  }).finally(function(res){
    
    $scope.loadingProducts = false;
    
  });

  var loadCategories = function(){
    $http.get(myConfig.apiUrl + '/categories/')
    .success(function(res) {
        $scope.categories = res;
    }).error(function(err) {
      ajaxTries.loadCategories = ajaxTries.loadCategories >= 0 ? ajaxTries.loadCategories++ : 1;
      if(ajaxTries.loadCategories < 4){
        loadCategories();
      }
    });
  }();
  
  $scope.selectCategory = function (category) {
    
    console.log('asdasd');  
    
    $location.search('categoria', category || null);
    
  };
  
  $scope.$on('$routeUpdate', function(){
    $scope.selectedCategory = $location.search().categoria;
  });

}]);

fair.controller('FairProductCtrl', ['$scope','$http', '$routeParams', '$filter', '$location', 'myConfig', 'HtmlMetaTagService', function($scope, $http, $routeParams, $filter, $location, myConfig, HtmlMetaTagService) {

	$scope.product = [];
	$scope.sameCategoryProducts = [];
	$scope.saving_product = false;
	$scope.loadingProduct = true;

  $http.get(myConfig.apiUrl + '/product/' + $routeParams.id)
  .success(function(resp) {
      HtmlMetaTagService.tag('title', resp.name);
      $scope.product = resp;
      $scope.loadingProduct = false;
      $scope.loadSameCategoryProducts(resp.categories);
  }).error(function(err) {
    $scope.loadingProduct = false;
    console.error('ERR', err);
  });
  
  $scope.loadSameCategoryProducts = function() {
    $http.get(myConfig.apiUrl + '/products', {params: {category: $scope.product.categories[0].name}})
    .success(function(res) {
        console.log(res);
        $scope.sameCategoryProducts = res;
    }).error(function(err) {
        console.error('ERR', err);
    });    
  }

}]);