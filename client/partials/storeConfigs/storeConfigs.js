'use strict';

var storeConfig = angular.module('myApp.storeConfigs', ['ngRoute']);

storeConfig.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/storeConfigs', {
        templateUrl: '/partials/storeConfigs/storeConfigs.html',
        controller: 'StoreConfigsCtrl'
    });
}]);

storeConfig.controller('StoreConfigsCtrl', ['$scope','$http', 'myConfig', 'HtmlMetaTagService', function($scope, $http, myConfig, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Configurações da loja');

    $scope.storeConfigs = {};
    
    $scope.processingStatusUpdate = false;

    $http.get(myConfig.apiUrl+'/storeConfigs').then(function(res) {
    
        $scope.storeConfigs = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.saveStoreConfigs = function(){
        
        $scope.processingStatusUpdate = false;

        $http.put(myConfig.apiUrl+'/storeConfigs', {storeConfigs: $scope.storeConfigs}).then(function(res) {
            
            alert('Configurações salvas!');
            
        }, function(res) {
            
            var error_list = [];
      
            angular.forEach(res.data.errors, function(error, path) {
              this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "As configurações estão incorretas. Verifique os motivos abaixo:",
                duration: 0
            });
        
        }).finally(function(){

            $scope.processingStatusUpdate = false;

        });

    };
    
}]);