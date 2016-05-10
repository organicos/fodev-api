'use strict';

var certification = angular.module('myApp.certification', ['ngRoute']);

certification.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/certificacao', {
    templateUrl: '/partials/certification/certification.html',
    controller: 'CertificationCtrl'
  });
}]);

certification.controller('CertificationCtrl', ['$scope', 'HtmlMetaTagService', function($scope, HtmlMetaTagService) {
  
  HtmlMetaTagService.tag('title', 'Certificação');

}]);