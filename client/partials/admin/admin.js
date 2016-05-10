'use strict';

var admin = angular.module('myApp.admin', ['ngRoute']);

admin.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/administracao', {
    templateUrl: '/partials/admin/admin_panel.html',
    controller: 'AdminPanelCtrl'
  });
}]);

admin.controller('AdminPanelCtrl', ['$scope', 'HtmlMetaTagService', 'filesService', function ($scope, HtmlMetaTagService, filesService) {
  
    HtmlMetaTagService.tag('title', 'Cantinho da Amora');
    
    $scope.usuarios = {};
    
    $scope.filesService = filesService;

}]);