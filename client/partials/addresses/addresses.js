'use strict';

var addresses = angular.module('myApp.addresses', ['ngRoute']);

addresses.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/meus/enderecos', {
        templateUrl: '/partials/addresses/addresses.html',
        controller: 'AdminAddressesCtrl'
    })
    .when('/meu/endereco/:id', {
        templateUrl: '/partials/addresses/address.html',
        controller: 'AdminAddressCtrl'
    })
    .when('/meu/endereco', {
        templateUrl: '/partials/addresses/address.html',
        controller: 'AdminAddressCtrl'
    });
}]);

addresses.controller('AdminAddressesCtrl', ['$scope','$http', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, myConfig, confirmModalService, HtmlMetaTagService) {

    HtmlMetaTagService.tag('title', 'Endereços');

    $scope.addresses = [];
    $scope.addressFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/addresses').then(function(res) {
    
        $scope.addresses = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });
    
    $scope.dropAddress = function(address) {
    
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir categoria',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a categoria ' + address.name + "?",
            bodyText: 'Deseja realmente excluir a categoria ' + address.name + "?"
        };
        
        confirmModalService.showModal({}, modalOptions)
        .then(function (result) {
        
            if(result){
            
                $http.delete(myConfig.apiUrl + '/addresses/' + address._id)
                .success(function(res) {
                
                    var productIndex = $scope.addresses.indexOf(address);
                    
                    $scope.addresses.splice(productIndex, 1);
                
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

addresses.controller('AdminAddressCtrl', ['$scope','$http', 'myConfig', '$location', 'HtmlMetaTagService', '$routeParams', function($scope, $http, myConfig, $location, HtmlMetaTagService, $routeParams) {
  
    HtmlMetaTagService.tag('title', 'Endereço');
    
    $scope.address = {};
    $scope.addressesQuery = "";
    $scope.processingAddressUpdate = false;
    
    $http.get(myConfig.apiUrl + '/cities/active')
    .success(function(res) {

      $scope.cities = res;
      
    })
    .error(function(err) {
    
        console.error('ERR', err);
    
    });
    
    if($routeParams.id){
    
        $http.get(myConfig.apiUrl+'/address/'+$routeParams.id)
        .success(function(res) {
            
            HtmlMetaTagService.tag('title', res.name);
        
            $scope.address = res;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    $scope.addressFormSubmit = function () {
        
        console.log('entrou');    
    
        $scope.processingAddressUpdate = true;
        
        if($scope.address._id){
          
            $scope.addressPut($scope.product);
          
        } else {
        
            $scope.addressPost($scope.product); 
        
        }
    
    }
  
    $scope.addressPost = function() {
    
        $http.post(myConfig.apiUrl + '/address', $scope.address)
        .success(function(resp) {
          
            $location.path("/address/" + resp._id);
            
        })
        .error(function (resp) {
          
            var error_list = [];
            
            angular.forEach(resp.errors, function(error, path) {
                this.push(error.message);
            }, error_list);
            
            $scope.$emit('alert', {
                kind: 'danger',
                msg: error_list,
                title: "Não foi possível inserir a addressm. Verifique o motivo abaixo:"
            });
        
            $scope.processingAddressUpdate = false;
        });
    
    };
  
    $scope.addressPut = function(){

        $http.put(myConfig.apiUrl+'/address/'+$scope.address._id, $scope.address)
        .success(function(res) {
            
        
            $scope.$storage.address = res;
    
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

            $scope.processingAddressUpdate = false;

        });
        
    }


  
}]);