'use strict';

var security = angular.module('myApp.security', ['ngRoute']);

security.config(['$routeProvider', function ($routeProvider) {
 
    $routeProvider.
        when('/entrar', {
            templateUrl: '/partials/security/signin.html'
        }).
        when('/entrar/:return_url*', {
            templateUrl: '/partials/security/signin.html'
        }).
        when('/recuperar-senha', {
            templateUrl: '/partials/security/retrieve_password.html',
            controller: 'RetrievePasswordCtrl'
        }).
        when('/sair', {
            templateUrl: '/partials/security/signin.html',
            controller: 'LogoutCtrl'
        });
        
}]);

security.controller('LogoutCtrl', ['$scope', '$location', function ($scope, $location) {

    $scope.$storage.user = {kind: ''};
    $location.path("/");

}]);

security.controller('SigninCtrl', ['$scope', '$location', '$routeParams','$http', 'myConfig', 'HtmlMetaTagService', function ($scope, $location, $routeParams, $http, myConfig, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Entrar');
    
    $scope.processingSignInUp = false;
    
    $scope.signin = function() {
        
        $scope.processingSignInUp = true;
        
        var formData = {
            email: $scope.email,
            password: $scope.password
        };

        $http.post(myConfig.apiUrl+'/signin', formData)
        .success(function (res) {
            $scope.$storage.user = res.data;
            $location.path($routeParams.return_url || "#/me");
        })
        .error(function (err) {

            $scope.$emit('alert', {
                kind: 'danger',
                msg: [err.data],
                title: "Falha:"
            });
        })
        .finally(function(){
            
            $scope.processingSignInUp = false;
            
        });
    };
    
}]);

security.controller('SignupCtrl', ['$scope', '$http', '$location', '$routeParams', 'myConfig', 'HtmlMetaTagService', function ($scope, $http, $location, $routeParams, myConfig, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Cadastro');
    
    $scope.processingSignInUp = false;
    $scope.newsletter = true;

    $scope.signup = function() {
        
        $scope.processingSignInUp = true;
        
        var formData = {
            name: $scope.name,
            email: $scope.email,
            password: $scope.password,
            password_hint: $scope.password_hint,
            newsletter: $scope.newsletter
        };
        
        if($scope.name && $scope.email && $scope.password && $scope.password_hint){
            
            if($scope.password == $scope.password_hint){

                $http.post(myConfig.apiUrl+'/signup', formData)
                .success(function (res) {
                    $scope.$storage.user = res.data;
                    $location.path($routeParams.return_url || "#/me");
                })
                .error(function (err) {
                    
                    if(err.code == 11000) err.message = "Este e-mail já foi cadastrado. Caso seja seu, tente recuperar a senha";
                    
                    $scope.$emit('alert', {
                        kind: 'danger',
                        msg: [err.message],
                        title: "Falha:"
                    });
                })
                .finally(function(){

                    $scope.processingSignInUp = false;

                });
                
            } else {
                
                $scope.processingSignInUp = false;
                
                $scope.$emit('alert', {
                      kind: 'danger',
                      msg: ['A senha e a confirmação da senha devem ser idênticas.'],
                      title: "Falha:"
                });
                
            }
            
        } else {
            
            $scope.processingSignInUp = false;
            
            $scope.$emit('alert', {
                  kind: 'danger',
                  msg: ['Preencha todos os campos para criar sua conta.'],
                  title: "Falha:"
            });
            
        }

    };
    
}]);

security.controller('RetrievePasswordCtrl', ['$scope', '$http', 'myConfig', 'HtmlMetaTagService', function($scope, $http, myConfig, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Recuperar senha');
    
    $scope.email = "";
    
    $scope.processingRetrievePassword = false;
    
    $scope.submitRetrievePassword = function() {

        if($scope.email.length){
            
            $scope.processingRetrievePassword = true;
            
            $http.post(myConfig.apiUrl+'/retrievePassword', {email: $scope.email})
            .success(function (res) {
                $scope.$emit('alert', {
                    kind: 'success',
                    msg: ['Uma nova senha foi enviada para o seu endereço de e-mail. Busque em sua caixa postal por e-mails recebidos de info@feiraorganica.com e descubra sua nova senha.'],
                    title: "Senha enviada!",
                    duration: 0
                });
            })
            .error(function (err) {
                $scope.processingRetrievePassword = false;

                $scope.$emit('alert', {
                    kind: 'danger',
                    msg: [err.message],
                    title: "Falha:"
                });
            });
            
        } else {
            
            $scope.$emit('alert', {
                  kind: 'danger',
                  msg: ['Informe um e-mail válido!'],
                  title: "Dados incorretos:"
            });
            
        }
    };
    
}]);