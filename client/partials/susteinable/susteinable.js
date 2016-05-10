'use strict';

var susteinable = angular.module('myApp.susteinable', ['ngRoute']);

susteinable.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/sustentabilidade', {
    templateUrl: '/partials/susteinable/susteinable.html',
    controller: 'SusteinableCtrl'
  });
}]);

susteinable.controller('SusteinableCtrl', ['$scope', 'HtmlMetaTagService', function($scope, HtmlMetaTagService) {
  HtmlMetaTagService.tag('title', 'Sustentabilidade');
}]);