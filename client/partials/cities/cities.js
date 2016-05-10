'use strict';

var cities = angular.module('myApp.cities', ['ngRoute']);

cities.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/cities', {
        templateUrl: '/partials/cities/cities.html',
        controller: 'AdminCitiesCtrl'
    })
    .when('/city/:id', {
        templateUrl: '/partials/cities/city.html',
        controller: 'AdminCityCtrl'
    })
    .when('/city', {
        templateUrl: '/partials/cities/city.html',
        controller: 'AdminCityCtrl'
    });
}]);

cities.controller('AdminCitiesCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Categorias');

    $scope.cities = [];
    $scope.cityFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/cities').then(function(res) {
    
        $scope.cities = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.dropCity = function(city) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir cidade',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a cidade ' + city.name + "?",
            bodyText: 'Deseja realmente excluir a cidade ' + city.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/cities/' + city._id)
                .success(function(res) {
                
                    var productIndex = $scope.cities.indexOf(city);
                    
                    $scope.cities.splice(productIndex, 1);
                
                })
                .error(function (resp) {
                
                    var error_list = [];
                    
                    angular.forEach(resp.errors, function(error, path) {
                        this.push(error.message);
                    }, error_list);
                    
                    $scope.$emit('alert', {
                        kind: 'danger',
                        msg: error_list,
                        title: "Não foi possível remover a cidade. Verifique o motivo abaixo:"
                    });
                
                });
            
            }
        
        });
    
    };

}]);

cities.controller('AdminCityCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.city = {};
    $scope.citiesQuery = "";
    $scope.processingCityUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/city/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.city = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.cityFormSubmit = function () {
    
        $scope.processingCityUpdate = true;
        
        if($scope.city._id){
          
            $scope.cityPut($scope.product);
          
        } else {
        
            $scope.cityPost($scope.product); 
        
        }
    
    }
  
    $scope.cityPost = function() {
    
        $http.post(myConfig.apiUrl + '/city', $scope.city)
        .success(function(resp) {
          
            $location.path("/city/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a cidade. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingCityUpdate = false;
        });
    
    };
  
    $scope.cityPut = function(){

        $http.put(myConfig.apiUrl+'/city/'+$scope.city._id, $scope.city)
        .success(function(res) {
            
        
            $scope.$storage.city = res;
    
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

            $scope.processingCityUpdate = false;

        });
        
    }

  $scope.getStates = function(name){
    return $http.get(myConfig.apiUrl+'/states', {
      params: {
        name: name
      }
    }).then(function(res) {
      
      return res.data;

    });
  }

  $scope.selectState = function (item, model, label) {
    
    $scope.city.state = item;
    
  };
  
}]);