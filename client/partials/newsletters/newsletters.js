'use strict';

var newsletters = angular.module('myApp.newsletters', ['ngRoute']);

newsletters.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/newsletters', {
        templateUrl: '/partials/newsletters/newsletters.html',
        controller: 'AdminNewslettersCtrl'
    })
    .when('/newsletter/signout', {
        templateUrl: '/partials/newsletters/signout.html',
        controller: 'NewsletterSignoutCtrl'
    })
    .when('/newsletter/:id', {
        templateUrl: '/partials/newsletters/newsletter.html',
        controller: 'AdminNewsletterCtrl'
    })
    .when('/newsletter', {
        templateUrl: '/partials/newsletters/newsletter.html',
        controller: 'AdminNewsletterCtrl'
    });
}]);

newsletters.controller('AdminNewslettersCtrl', ['$scope','$http', 'myConfig', 'HtmlMetaTagService', function($scope, $http, myConfig, HtmlMetaTagService) {
  
  HtmlMetaTagService.tag('title', 'Newsletter');

    $scope.newsletters = [];
    $scope.newsletterFormModalObject = {};
    
    $http.get(myConfig.apiUrl+'/newsletters').then(function(res) {
    
        $scope.newsletters = res.data;
        
    }, function(err) {
    
        console.error('ERR', err);
    
    });

}]);

newsletters.controller('AdminNewsletterCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', '$location', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService, $location) {

    $scope.loadingProducts = false;
    $scope.savingNewsletter = false;
    $scope.newsletterSent = false;
    $scope.newsletter = {
        title: ""
        , top: ""
        , bottom: ""
        , sections: []
    };
    $scope.newsletterLoaded = false;

    if($routeParams.id){

        $http.get(myConfig.apiUrl+'/newsletter/'+$routeParams.id)
        .success(function(res) {
          
          HtmlMetaTagService.tag('title', res.title);
          
          $scope.newsletter = res;
        
          $scope.newsletterLoaded = true;
        
        }).error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    } else {
      
      HtmlMetaTagService.tag('title', 'Nava newsletter');
      
      $scope.newsletterLoaded = true;
      
    }
    
    $scope.addNewSection = function(){
        
        var newSection = {
            title: ""
            , top: ""
            , bottom: ""
            , products: []
            , articles: []
        }
        
        $scope.newsletter.sections.push(newSection);
        
    }
    
  $scope.sendNewsletter = function(){
    
    $scope.savingNewsletter = true;
    
    var modalOptions = {
        closeButtonText: 'Cancelar',
        actionButtonText: 'Enviar newsletter',
        actionButtonKind: 'btn-danger',
        headerText: 'Enviar a newsletter ' + $scope.newsletter._id + "?",
        bodyText: 'Deseja realmente enviar a newsletter ' + $scope.newsletter._id + "? Esta ação pode ser realizada apenas uma única vez e não poderá ser desfeita. Revise a newsletter antes de proceder e garanta que está tudo correto."
    };

    confirmModalService.showModal({}, modalOptions)
    .then(function (result) {
      
      if(result){
        
        $http.post(myConfig.apiUrl + '/newsletter/'+$scope.newsletter._id+'/send', {_id: $scope.newsletter._id})
        .success(function(resp) {
          
          $scope.newsletterSent = true;
          
          $scope.newsletter = resp;
    
          $scope.$emit('alert', {
              kind: 'success',
              msg: [],
              title: "Newsletter enviada com sucesso!"
          });
          
        })
        .error(function (resp) {
          
          var error_list = [];
    
          angular.forEach(resp.errors, function(error, path) {
            this.push(error.message);
          }, error_list);
          
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Não foi possível enviar a newsletter. Verifique o motivo abaixo:"
          });
      
        })
        .finally(function () {
          $scope.savingNewsletter = false;
        });
      
      } else {
      
        $scope.savingNewsletter = false;
        
      }

    });
    
  };
    
  $scope.submitNewsletterForm = function () {
    
    $scope.savingNewsletter = true;
    
    if($scope.newsletter._id){
      
       $scope.newsletterPut($scope.newsletter);
      
    } else {

      $scope.newsletterPost($scope.newsletter); 

    }

  }
  
  $scope.newsletterPost = function(newsletter) {
    
    $http.post(myConfig.apiUrl + '/newsletter', newsletter)
    .success(function(res) {
      
      console.log(res);
      
        $scope.newsletter = res;
        $location.path("/newsletter/" + res._id);
        
    })
    .error(function (resp) {
      
      var error_list = [];

      angular.forEach(resp.errors, function(error, path) {
        this.push(error.message);
      }, error_list);
      
      $scope.$emit('alert', {
          kind: 'danger',
          msg: error_list,
          title: "Não foi possível inserir a newsletter. Verifique o motivo abaixo:"
      });
  
    })
    .finally(function () {
      $scope.savingNewsletter = false;
    });
  
  };

  $scope.newsletterPut = function(newsletter) {
    
    $http.put(myConfig.apiUrl + '/newsletter/'+newsletter._id, newsletter)
    .success(function(res) {
      
      $scope.newsletter = res;

      $scope.$emit('alert', {
          kind: 'success',
          msg: '',
          title: "Newsletter editada com sucesso"
      });

    })
    .error( function(resp) {
      
      var error_list = [];

      angular.forEach(resp.errors, function(error, path) {
        this.push(error.message);
      }, error_list);
      
      $scope.$emit('alert', {
          kind: 'danger',
          msg: error_list,
          title: "Não foi possível editar a newsletter. Verifique o motivo abaixo:"
      });
  
    })
    .finally(function () {
      $scope.savingNewsletter = false;
    });
  };
  
  $scope.dropSection = function(section){
    
    var sectionPos = $scope.newsletter.sections.indexOf(section);
    
    if(sectionPos >= 0){
      $scope.newsletter.sections.splice(sectionPos, 1);
    }
    
  }
  
  $scope.getArticles = function(title){
    return $http.get(myConfig.apiUrl+'/articles', {
      params: {
        title: title
      }
    }).then(function(res) {
      
      return res.data;

    });
  }

  $scope.selectArticle = function (item, model, label, section) {
    
    var article = ($filter('filter')(section.articles, {_id: item._id}, false));
    
    if (!article[0]) {

      section.articles.push(item);
      
    }

  };
  
  $scope.dropArticle = function(article, section){
    var articleIndex = section.articles.indexOf(article);
    if (articleIndex >= 0) {
        section.articles.splice(articleIndex, 1);
    }
    var articleIndex = section.articles.indexOf(article._id);
    if (articleIndex >= 0) {
        section.articles.splice(articleIndex, 1);
    }
  };
    
  $scope.getProducts = function(name){
    return $http.get(myConfig.apiUrl+'/products', {
      params: {
        name: name
      }
    }).then(function(res) {
      
      return res.data;

    });
  }

  $scope.selectProduct = function (item, model, label, section) {
    
    var product = ($filter('filter')(section.products, {_id: item._id}, false));
    
    if (!product[0]) {

      section.products.push(item);
      
    }

  };
  
  $scope.dropProduct = function(product, section){
    var productIndex = section.products.indexOf(product);
    if (productIndex >= 0) {
        section.products.splice(productIndex, 1);
    }
    var productIndex = section.products.indexOf(product._id);
    if (productIndex >= 0) {
        section.products.splice(productIndex, 1);
    }
  };
}]);

newsletters.controller('NewsletterSignoutCtrl', ['$scope','$http', 'myConfig', 'HtmlMetaTagService', function($scope, $http, myConfig, HtmlMetaTagService) {
  
  HtmlMetaTagService.tag('title', 'Cancelamento de assinatura de newsletter');

    $scope.email = "";
    $scope.newsletterCanceled = false;

    $scope.submitNewsletterSignout = function(){
      
      if($scope.email){

        $http.post(myConfig.apiUrl+'/newsletter/signout', {email: $scope.email})
        .success(function(res) {

          $scope.$emit('alert', {
              kind: 'success',
              msg: [],
              title: res.data
          });
          
          $scope.newsletterCanceled = true;

        }).error(function(err) {

          var error_list = [];
    
          angular.forEach(err, function(error, path) {
            this.push(error.message);
          }, error_list);
      
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Informe o e-mail a ser descadastrado."
          });
        
        });
        
      } else {
        
        $scope.$emit('alert', {
            kind: 'danger',
            msg: ["Informe o e-mail a ser descadastrado."],
            title: 'Erro ao cancelar assinatura! Verifique o motivo abaixo:'
        });
        
      }

    };
    
}]);