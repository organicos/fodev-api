'use strict';

var about = angular.module('myApp.about', ['ngRoute']);

about.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/sobre', {
    templateUrl: '/partials/about/about.html',
    controller: 'AboutCtrl'
  });
}]);

about.controller('AboutCtrl', ['$scope', 'HtmlMetaTagService', function($scope, HtmlMetaTagService) {
  HtmlMetaTagService.tag('title', 'Sobre');
}]);