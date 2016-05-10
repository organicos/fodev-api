'use strict';

var countries = angular.module('myApp.countries', ['ngRoute']);

countries.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/countries', {
        templateUrl: '/partials/countries/countries.html',
        controller: 'AdminCountriesCtrl'
    })
    .when('/country/:id', {
        templateUrl: '/partials/countries/country.html',
        controller: 'AdminCountryCtrl'
    })
    .when('/country', {
        templateUrl: '/partials/countries/country.html',
        controller: 'AdminCountryCtrl'
    });
}]);

countries.controller('AdminCountriesCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Categorias');

    $scope.countries = [];
    $scope.countryFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/countries').then(function(res) {
    
        $scope.countries = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.dropCountry = function(country) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir cidade',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir o país ' + country.name + "?",
            bodyText: 'Deseja realmente excluir o país ' + country.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/countries/' + country._id)
                .success(function(res) {
                
                    var productIndex = $scope.countries.indexOf(country);
                    
                    $scope.countries.splice(productIndex, 1);
                
                })
                .error(function (resp) {
                
                    var error_list = [];
                    
                    angular.forEach(resp.errors, function(error, path) {
                        this.push(error.message);
                    }, error_list);
                    
                    $scope.$emit('alert', {
                        kind: 'danger',
                        msg: error_list,
                        title: "Não foi possível remover o país. Verifique o motivo abaixo:"
                    });
                
                });
            
            }
        
        });
    
    };

}]);

countries.controller('AdminCountryCtrl', ['$scope','$http', '$routeParams', 'myConfig', '$location', 'HtmlMetaTagService', function($scope, $http, $routeParams, myConfig, $location, HtmlMetaTagService) {
  
    $scope.country = {};
    $scope.countriesQuery = "";
    $scope.processingCountryUpdate = false;
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/country/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.country = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.countryFormSubmit = function () {
    
        $scope.processingCountryUpdate = true;
        
        if($scope.country._id){
          
            $scope.countryPut($scope.product);
          
        } else {
        
            $scope.countryPost($scope.product); 
        
        }
    
    }
  
    $scope.countryPost = function() {
    
        $http.post(myConfig.apiUrl + '/country', $scope.country)
        .success(function(resp) {
          
            $location.path("/country/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir o país. Verifique o motivo abaixo:"
            });
        
        })
        .finally(function () {
            $scope.processingCountryUpdate = false;
        });
    
    };
  
    $scope.countryPut = function(){

        $http.put(myConfig.apiUrl+'/country/'+$scope.country._id, $scope.country)
        .success(function(res) {
            
        
            $scope.$storage.country = res;
    
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

            $scope.processingCountryUpdate = false;

        });
        
    }


  
}]);