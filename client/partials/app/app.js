'use strict'; //avoid bad practice as global var declaration

var $scope, $location;

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ng-sortable',
  'ngAnimate',
  'ngFileUpload',
  'ngRoute',
  'ngStorage',
  'ngSanitize',
  'angular.filter',
  'ui.bootstrap',
  'chart.js',
  'myApp.home',
  'myApp.fair',
  'myApp.tickets',
  'myApp.security',
  'myApp.contact',
  'myApp.admin',
  'myApp.users',
  'myApp.order',
  'myApp.products',
  'myApp.config',
  'myApp.certification',
  'myApp.susteinable',
  'myApp.about',
  'myApp.addresses',
  'myApp.groups',
  'myApp.articles',
  'myApp.suppliers',
  'myApp.blog',
  'myApp.newsletters',
  'myApp.categories',
  'myApp.cities',
  'myApp.states',
  'myApp.countries',
  'myApp.packings',
  'myApp.shipping',
  'myApp.custom-filters',
  'myApp.discounts',
  'myApp.orderSteps',
  'myApp.storeConfigs',
  'resizimage'
]);

app.config(['$routeProvider', '$httpProvider', '$locationProvider', 'resizimageProvider', function($routeProvider, $httpProvider, $locationProvider, resizimageProvider) {

  // Setup resizimage directive 
  resizimageProvider.config({
    active: true,
    host: '/resizimage/',
    noImageSrc: '/assets/img/global/no_image.jpeg',
    brknImageSrc: '/assets/img/global/broken_image.jpeg'
  });

  // define default route
  $routeProvider.otherwise({redirectTo: '/'});

  // Append the Authenticated hash to the header
  $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
      
      return {
          'request': function (config) {
              
              config.headers = config.headers || {};
              if ($localStorage.user && $localStorage.user.token) {
                config.headers.Authorization = 'Organic ' + $localStorage.user.token;
              }
              return config;
          },
          'responseError': function(response) {
              var login_path = '/entrar'+$location.path();
              
              if(response.status === 401 || response.status === 403) {
                $location.path(login_path);
              }
              return $q.reject(response);
          }
      };
  }]);
  
  // add cross-domain to the header
  $httpProvider.defaults.useXDomain = true;

  // remove some http header to use CORS
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  
  // enable html5 mode
  $locationProvider.html5Mode(true).hashPrefix('!');
        
}]);

// close modal on back button
app.run(['$rootScope', '$modalStack', function ($rootScope, $modalStack) {
   $rootScope.$on('$locationChangeStart', function (event) {
       var anyModalOpen = !!$modalStack.getTop();
       if(anyModalOpen){
            event.preventDefault();
            var top = $modalStack.getTop();
            if (top) {
                $modalStack.dismiss(top.key);
            }
            
       }
    })
}]);

app.controller('myAppCtrl' , ['$scope', '$location', '$localStorage', 'basketService', 'addressService', 'HtmlMetaTagService', '$http', 'myConfig', '$rootScope' , function($scope, $location, $localStorage, basketService, addressService, HtmlMetaTagService, $http, myConfig, $rootScope) {
    
    // VARIABLES

    // Basket 
    $scope.basketService = basketService;
    
    // Addresses
    $scope.addressService = addressService;

    // alerts array
    $scope.alerts = [];
    
    // signup to news data model
    $scope.signupToNewsletter = {mail: ""};
    
    
    // CONSTRUCTOR

    // Parametrize Local Storage
    parametrizeLocalStorage($scope, $localStorage);

    // protect private routes from unauthorized users
    protectPrivateRoutes($scope, $location);
    
    // METHODS
    $scope.ping = function(callback) {
        callback();
    }

    // return to the previous page
    $scope.$back = function() {
        window.history.back();
    };

    $scope.addAlert = function(alertObj) {
        
        $scope.alerts.unshift(alertObj);
        
        if(alertObj.duration == undefined || alertObj.duration > 0){

            setTimeout(function(){
                
                $scope.$apply(function(){
                    var index = $scope.alerts.indexOf(alertObj);
                    $scope.alerts.splice(index, 1);            
                });
                
            },
            alertObj.duration || 5000)
        }
        

    };
    
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);    
    }
        
    $rootScope.$on('alert', function(event, alertObj) {
        $scope.addAlert(alertObj);
    });
    
    $scope.signupToNewsletter = function(){
        
        var email = $scope.signupToNewsletter.mail;
        
        if(email.length == 0) {
            
            $scope.addAlert({
                kind: 'danger',
                title: 'Ocorreu um problema ao assinar nossa newsletter. Veja abaixo o motivo:',
                msg: ['Favor informar o um e-mail válido na assinatura da newsletter.']
            });
            
        } else {
            
            $http.post(myConfig.apiUrl + '/newsletter/signup', {email: email})
            .success(function(res) {
              
                $scope.addAlert({
                    kind: 'success',
                    title: 'Assinatura feita com sucesso.',
                    msg: ['A partir de agora, você receberá nossa lista semanal de preços e promoções.']
                });
                
                $scope.signupToNewsletter.mail = "";
              
            })
            .error(function(err) {
            
                angular.forEach(err.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                
                $scope.addAlert({
                    kind: 'danger',
                    title: 'Ocorreu um problema ao assinar nossa newsletter. Veja abaixo o motivo:',
                    msg: error_list
                });
            
            });
            
        }
        
    }
    
}]);

function getBaseUrl($location){
  return $location.$$protocol + '://' + $location.$$host;
}

var parametrizeLocalStorage = function($scope, $localStorage){
    
    $scope.$storage = $localStorage.$default({
        user: {kind: ''}
    });
        
};

var protectPrivateRoutes = function($scope, $location){
    
    $scope.$watch(function() { return $location.path(); }, function(newValue, oldValue){
        
        var privateRoutes = [
            '/eu'
            , '/revisar-ordem'
            , '/administracao'
            , '/usuarios'
            , '/produtos'
            , '/pedidos'
            , '/pedido'
            , '/meus/pedidos'
            , '/meu/pedido'
            , '/artigos'
            , '/categories'
            , '/suppliers'
            , '/images'
        ];

        if(privateRoutes.indexOf(newValue) > -1){

            if ($scope.$storage.user.token){
                
                $scope.ping(function (err, res) {

                    if(err) { // is not logged anymore. invalid token
                    
                        $location.path('/entrar'+newValue);
                        
                    }

                });
                
            } else {
                
                $location.path('/entrar'+newValue);
                    
            } 
        
        }
 
    });
    
}