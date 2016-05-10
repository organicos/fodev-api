'use strict';

var orderSteps = angular.module('myApp.orderSteps', ['ngRoute']);

orderSteps.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/orderSteps', {
        templateUrl: '/partials/orderSteps/orderSteps.html',
        controller: 'AdminOrderStepsCtrl'
    })
    .when('/orderStep/:id', {
        templateUrl: '/partials/orderSteps/orderStep.html',
        controller: 'AdminOrderStepCtrl'
    })
    .when('/orderStep', {
        templateUrl: '/partials/orderSteps/orderStep.html',
        controller: 'AdminOrderStepCtrl'
    });
}]);

orderSteps.controller('AdminOrderStepsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'OrderSteps');

    $scope.orderSteps = [];
    $scope.orderStepFormModalObject = {};
    $scope.conf = {
        autoSaveFlow: true
    };
    
    $http.get(myConfig.apiUrl+'/orderSteps').then(function(res) {
    
        refreshListSteps(res.data);
        
        $scope.orderSteps = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    var refreshListSteps = function(list){
        angular.forEach(list, function(item, index){
            item.step = index + 1;
        });
    };
    
    $scope.saveOrderStepsFlow = function(){

        $http.put(myConfig.apiUrl+'/orderSteps', $scope.orderSteps).then(function(res) {
        
        }, function(err) {
        
            console.error('ERR', err);
        
        });
        
    };
    
    $scope.barConfig = {
        animation: 150,
        ghostClass: "info",
        handle: ".drag-handle",
        onUpdate: function (evt){
            var orderStepCopy = evt.models[evt.oldIndex];
            evt.models.splice(evt.oldIndex, 1);
            evt.models.splice(evt.newIndex, 0, orderStepCopy);
            $scope.orderSteps = evt.models;
            refreshListSteps($scope.orderSteps);
            if($scope.conf.autoSaveFlow){
                $scope.saveOrderStepsFlow();
            }

        }
    };
    
    $scope.dropOrderStep = function(orderStep) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir orderStep',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a orderStep ' + orderStep.name + "?",
            bodyText: 'Deseja realmente excluir a orderStep ' + orderStep.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/orderSteps/' + orderStep._id)
                .success(function(res) {
                
                    var productIndex = $scope.orderSteps.indexOf(orderStep);
                    
                    $scope.orderSteps.splice(productIndex, 1);
                
                })
                .error(function (resp) {
                
                    var error_list = [];
                    
                    angular.forEach(resp.errors, function(error, path) {
                        this.push(error.message);
                    }, error_list);
                    
                    $scope.$emit('alert', {
                        kind: 'danger',
                        msg: error_list,
                        title: "Não foi possível remover a orderStep. Verifique o motivo abaixo:"
                    });
                
                });
            
            }
        
        });
    
    };

}]);

orderSteps.controller('AdminOrderStepCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.orderStep = {};
    $scope.orderStepsQuery = "";
    $scope.processingOrderStepUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/orderStep/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.orderStep = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.orderStepFormSubmit = function () {
    
        $scope.processingOrderStepUpdate = true;
        
        if($scope.orderStep._id){
          
            $scope.orderStepPut($scope.product);
          
        } else {
        
            $scope.orderStepPost($scope.product); 
        
        }
    
    }
  
    $scope.orderStepPost = function() {
    
        $http.post(myConfig.apiUrl + '/orderStep', $scope.orderStep)
        .success(function(resp) {
          
            $location.path("/orderStep/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a orderStepm. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingOrderStepUpdate = false;
        });
    
    };
  
    $scope.orderStepPut = function(){

        $http.put(myConfig.apiUrl+'/orderStep/'+$scope.orderStep._id, $scope.orderStep)
        .success(function(res) {
            
        
            $scope.$storage.orderStep = res;
    
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

            $scope.processingOrderStepUpdate = false;

        });
        
    }


  
}]);