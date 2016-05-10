'use strict';

var groups = angular.module('myApp.groups', ['ngRoute']);

groups.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/grupos', {
        templateUrl: '/partials/groups/groups.html',
        controller: 'AdminGroupsCtrl'
    })
    .when('/grupo/:id', {
        templateUrl: '/partials/groups/group.html',
        controller: 'AdminGroupCtrl'
    })
    .when('/grupo', {
        templateUrl: '/partials/groups/group.html',
        controller: 'AdminGroupCtrl'
    });
}]);

groups.controller('AdminGroupsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Categorias');

    $scope.groups = [];
    $scope.groupFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/groups').then(function(res) {
    
        $scope.groups = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.dropGroup = function(group) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir categoria',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a categoria ' + group.name + "?",
            bodyText: 'Deseja realmente excluir a categoria ' + group.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/groups/' + group._id)
                .success(function(res) {
                
                    var productIndex = $scope.groups.indexOf(group);
                    
                    $scope.groups.splice(productIndex, 1);
                
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

groups.controller('AdminGroupCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.group = {};
    $scope.groupQuery = "";
    $scope.processingGroupUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/group/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.group = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.groupFormSubmit = function () {
    
        $scope.processingGroupUpdate = true;
        
        if($scope.group._id){
          
            $scope.groupPut($scope.product);
          
        } else {
        
            $scope.groupPost($scope.product); 
        
        }
    
    }
  
    $scope.groupPost = function() {
    
        $http.post(myConfig.apiUrl + '/group', $scope.group)
        .success(function(resp) {
          
            $location.path("/grupo/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a groupm. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingGroupUpdate = false;
        });
    
    };
  
    $scope.groupPut = function(){

        $http.put(myConfig.apiUrl+'/group/'+$scope.group._id, $scope.group)
        .success(function(res) {
            
        
            $scope.$storage.group = res;
    
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

            $scope.processingGroupUpdate = false;

        });
        
    }


  
}]);