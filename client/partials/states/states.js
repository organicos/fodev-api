'use strict';

var states = angular.module('myApp.states', ['ngRoute']);

states.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/states', {
        templateUrl: '/partials/states/states.html',
        controller: 'AdminStatesCtrl'
    })
    .when('/state/:id', {
        templateUrl: '/partials/states/state.html',
        controller: 'AdminStateCtrl'
    })
    .when('/state', {
        templateUrl: '/partials/states/state.html',
        controller: 'AdminStateCtrl'
    });
}]);

states.controller('AdminStatesCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Categorias');

    $scope.states = [];
    $scope.stateFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/states').then(function(res) {
    
        $scope.states = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.dropState = function(state) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir estado',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir o estado ' + state.name + "?",
            bodyText: 'Deseja realmente excluir o estado ' + state.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/states/' + state._id)
                .success(function(res) {
                
                    var productIndex = $scope.states.indexOf(state);
                    
                    $scope.states.splice(productIndex, 1);
                
                })
                .error(function (resp) {
                
                    var error_list = [];
                    
                    angular.forEach(resp.errors, function(error, path) {
                        this.push(error.message);
                    }, error_list);
                    
                    $scope.$emit('alert', {
                        kind: 'danger',
                        msg: error_list,
                        title: "Não foi possível remover o estado. Verifique o motivo abaixo:"
                    });
                
                });
            
            }
        
        });
    
    };

}]);

states.controller('AdminStateCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.state = {};
    $scope.statesQuery = "";
    $scope.processingStateUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/state/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.state = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.stateFormSubmit = function () {
    
        $scope.processingStateUpdate = true;
        
        if($scope.state._id){
          
            $scope.statePut($scope.product);
          
        } else {
        
            $scope.statePost($scope.product); 
        
        }
    
    }
  
    $scope.statePost = function() {
    
        $http.post(myConfig.apiUrl + '/state', $scope.state)
        .success(function(resp) {
          
            $location.path("/state/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir o estado. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingStateUpdate = false;
        });
    
    };
  
    $scope.statePut = function(){

        $http.put(myConfig.apiUrl+'/state/'+$scope.state._id, $scope.state)
        .success(function(res) {
            
        
            $scope.$storage.state = res;
    
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

            $scope.processingStateUpdate = false;

        });
        
    }

  $scope.getCountries = function(name){
    return $http.get(myConfig.apiUrl+'/countries', {
      params: {
        name: name
      }
    }).then(function(res) {
      
      return res.data;

    });
  }

  $scope.selectCountry = function (item, model, label) {
    
    $scope.state.country = item;
    
  };
  
}]);