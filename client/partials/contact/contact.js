'use strict';

var contact = angular.module('myApp.contact', ['ngRoute']);

contact.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contato', {
    templateUrl: '/partials/contact/contact.html',
    controller: 'ContactCtrl'
  });
}]);

contact.controller('ContactCtrl', ['$scope','$http', 'myConfig', 'HtmlMetaTagService', function($scope, $http, myConfig, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Contato');

    $scope.submitingContact = false;
    $scope.submitContact = function() {
        $scope.submitingContact = true;
        if ($scope.email && $scope.msg) {
            $http.post(myConfig.apiUrl+'/ticket',{
                email: $scope.email
                , name: $scope.name
                , phone: $scope.phone
                , msg: $scope.msg
                , kind: 'contact'
            })
            .success(function(res){
                
                $scope.email = "";
                $scope.name = "";
                $scope.phone = "";
                $scope.msg = "";
                
                $scope.$emit('alert', {
                    kind: 'success',
                    title: 'Mensagem enviada com sucesso!',
                    msg: ['Em breve retornaremos seu contato.']
                });
            })
            .error(function(err){
                var error_list = [];
    
                angular.forEach(err.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                $scope.$emit('alert', {
                    kind: 'danger',
                    title: 'Não foi possível enviar o contato. Verifique o motivo abaixo:',
                    msg: error_list
                });
            })
            .finally(function(){
                $scope.submitingContact = false;
            });
        } else {
            
            $scope.submitingContact = false;

            $scope.$emit('alert', {
                kind: 'danger',
                title: 'Não foi possível enviar o contato. Verifique o motivo abaixo:',
                msg: ['Por favor, preencha ao menos o seu e-mail e sua mesagem.']
            });
        }
        return false; 
    };

}]);