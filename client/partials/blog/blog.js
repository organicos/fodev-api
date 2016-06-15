'use strict';

var blog = angular.module('myApp.blog', ['ngRoute']);

blog.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/blog', {
    templateUrl: '/partials/blog/blog.html',
    controller: 'BlogArticlesCtrl'
  });
  $routeProvider.when('/blog/categoria/:id', {
    templateUrl: '/partials/blog/blog.html',
    controller: 'BlogArticlesCtrl'
  });
  $routeProvider.when('/blog/:id', {
    templateUrl: '/partials/blog/article.html',
    controller: 'BlogArticleCtrl'
  });
}]);

blog.controller('BlogArticlesCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'HtmlMetaTagService', 'categoryService', function($scope, $http, $filter, $routeParams, myConfig, HtmlMetaTagService, categoryService) {
  
  HtmlMetaTagService.tag('title', 'Blog');

  var resourceUrl = $routeParams.id ? myConfig.apiUrl+'/articles/category/'+$routeParams.id : myConfig.apiUrl+'/articles';
    
  $http.get(resourceUrl)
  .then(function(res){
    
    $scope.articles = res.data;
    
  }, function(res) {
  
      $scope.$emit('alert', {
          kind: 'danger',
          msg: res.data,
          title: "Não foi possível acessar a lista de artigos. Verifique o motivo abaixo:"
      });
  
  }).finally(function(res){
    
    $scope.loadingArticles = false;
    
  });
    
  $scope.articles = [];
  $scope.selectedFilter = '';
  $scope.selectedOrder = 'updated';
  $scope.loadingArticles = true;
  $scope.categories = [];

  categoryService.get({forUseInBlog: true}).then(function(res){
    $scope.categories = res.data;
  })



  $scope.selectFilter = function (value) {
    
    $scope.selectedFilter = value;
    
  };
  
  $scope.selectOrder = function (order) {
    
    $scope.selectedOrder = order;
    
  };
  
}]);

blog.controller('BlogArticleCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, HtmlMetaTagService) {

  $scope.saving_article = false;
  $scope.article = {};
  $http.get(myConfig.apiUrl+'/article/'+$routeParams.id)
  .then(function(res) {
    
    HtmlMetaTagService.tag('title', res.title);

    $scope.article = res.data;
    
  }, function(res) {
  
      $scope.$emit('alert', {
          kind: 'danger',
          msg: res.data,
          title: "Não foi possível acessar os dados do artigo. Verifique o motivo abaixo:"
      });
  
  });

}]);