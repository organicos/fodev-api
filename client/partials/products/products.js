'use strict';

var products = angular.module('myApp.products', ['ngRoute', 'chart.js']);

products.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/produtos', {
    templateUrl: '/partials/products/products.html',
    controller: 'ProductsCtrl'
  });
  $routeProvider.when('/produto', {
    templateUrl: '/partials/products/product.html',
    controller: 'ProductCtrl'
  });
  $routeProvider.when('/produto/:id', {
    templateUrl: '/partials/products/product.html',
    controller: 'ProductCtrl'
  });
}]);

products.controller('ProductsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
  
  HtmlMetaTagService.tag('title', 'Produtos');

  $scope.products = [];
  $scope.orderByField = 'name';
  $scope.selectedCategory = '';

  $http.get(myConfig.apiUrl+'/products')
  .success(function(res){
    
    $scope.products = res;
    
  }).error(function(err) {
  
      $scope.$emit('alert', {
          kind: 'danger',
          msg: err,
          title: "Não foi possível acessar a lista de produtos. Verifique o motivo abaixo:"
      });
  
  });

  $scope.selectCategory = function (category) {
    
    $scope.selectedCategory = category;

  }
  
  $scope.dropProduct = function(product) {

    var modalOptions = {
        closeButtonText: 'Cancelar',
        actionButtonText: 'Excluir produto',
        actionButtonKind: 'btn-danger',
        headerText: 'Excluir o produto ' + product.name + "?",
        bodyText: 'Deseja realmente excluir o produto ' + product.name + "?"
    };

    confirmModalService.showModal({}, modalOptions)
    .then(function (result) {
      
      if(result){
        
        $http.delete(myConfig.apiUrl + '/product/' + product._id)
        .success(function(res) {
          
          var productIndex = $scope.products.indexOf(product);
          
          $scope.products.splice(productIndex, 1);
          
        })
        .error(function (resp) {
          
          var error_list = [];
    
          angular.forEach(resp.errors, function(error, path) {
            this.push(error.message);
          }, error_list);
          
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
          });
    
        });
        
      }

    });

  };
  
}]);

products.controller('ProductCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', '$location', 'HtmlMetaTagService', 'filesService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, $location, HtmlMetaTagService, filesService) {

  $scope.saving_product = false;
  $scope.filesService = filesService;
  $scope.product = {prices: [], costs: [], suppliers: [], categories: [], images: []};
  $scope.pricesChartData = {
    series : ['Preço'],
    labels : [],
    data : []
  };
  $scope.costsChartData = {
    series : ['Custo'],
    labels : [],
    data : []
  };
    
  if($routeParams.id){
    
    $http.get(myConfig.apiUrl+'/product/'+$routeParams.id)
    .success(function(res) {

      HtmlMetaTagService.tag('title', res.name);
      
      $scope.product = res;
      
      $scope.updateProductCharts();

    }).error(function(err) {
    
        $scope.$emit('alert', {
            kind: 'danger',
            msg: err,
            title: "Não foi possível acessar os dados do produto. Verifique o motivo abaixo:"
        });
    
    });
    
  }
  
  $scope.setProductImages = function(images){
    $scope.product.images = images;
  }
  
  $scope.updateProductCharts = function(){

    $scope.costsChartData.data[0] = [];
    $scope.costsChartData.labels = [];
    angular.forEach($scope.product.costs, function(cost, key) {
      $scope.costsChartData.data[0].unshift(cost.price);
      $scope.costsChartData.labels.unshift("R$");
    });

    $scope.pricesChartData.data[0] = [];
    $scope.pricesChartData.labels = [];
    angular.forEach($scope.product.prices, function(price, key) {
      $scope.pricesChartData.data[0].unshift(price.price);
      $scope.pricesChartData.labels.unshift("R$");
    });
    
  }

  $scope.producFormSubmit = function () {
    
    $scope.saving_product = true;
    
    if($scope.product._id){
      
       $scope.productPut($scope.product);
      
    } else {

      $scope.productPost($scope.product); 

    }

  }
  
  $scope.productPost = function(product) {
    
    $http.post(myConfig.apiUrl + '/product', product)
    .success(function(resp) {
      
        $location.path("/produto/" + resp._id);
        
    })
    .error(function (resp) {
      
      var error_list = [];

      angular.forEach(resp.errors, function(error, path) {
        this.push(error.message);
      }, error_list);
      
      $scope.$emit('alert', {
          kind: 'danger',
          msg: error_list,
          title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
      });
  
    })
    .finally(function () {
      $scope.saving_product = false;
    });
  
  };

  $scope.productPut = function(product) {
    
    $http.put(myConfig.apiUrl + '/product/'+product._id, product)
    .success(function(resp) {
      
      $scope.product = resp;
      
      $scope.updateProductCharts();

      $scope.$emit('alert', {
          kind: 'success',
          msg: '',
          title: "Produto editado com sucesso"
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
          title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
      });
  
    })
    .finally(function () {
      $scope.saving_product = false;
    });
  };
  
  $scope.dropProduct = function(product) {

    var modalOptions = {
        closeButtonText: 'Cancelar',
        actionButtonText: 'Excluir produto',
        actionButtonKind: 'btn-danger',
        headerText: 'Excluir o produto ' + product.name + "?",
        bodyText: 'Deseja realmente excluir o produto ' + product.name + "?"
    };

    confirmModalService.showModal({}, modalOptions)
    .then(function (result) {
      
      if(result){
        
        $http.delete(myConfig.apiUrl + '/product/' + product._id)
        .success(function() {
          $location.path("/produtos");
        })
        .error(function (resp) {
          
          var error_list = [];
    
          angular.forEach(resp.errors, function(error, path) {
            this.push(error.message);
          }, error_list);
          
          $scope.$emit('alert', {
              kind: 'danger',
              msg: error_list,
              title: "Não foi possível inserir o produto. Verifique o motivo abaixo:"
          });
    
        });
        
      }

    });

  };

  $scope.getSuppliers = function(name){
    return $http.get(myConfig.apiUrl+'/suppliers', {
      params: {
        name: name
      }
    }).then(function(res) {
      
      return res.data;

    });
  }

  $scope.selectSupplier = function (item, model, label) {
    
    var supplier = ($filter('filter')($scope.product.suppliers, {_id: item._id}, false))[0];
    
    if (!supplier) {
      
      $scope.selectedSupplier = "";

      $scope.product.suppliers.push(item);
      
    }
    
  };
  
  $scope.dropSupplier = function(supplier){
    var supplierIndex = $scope.product.suppliers.indexOf(supplier);
    if (supplierIndex >= 0) {
        $scope.product.suppliers.splice(supplierIndex, 1);
    }
    var supplierIndex = $scope.product.suppliers.indexOf(supplier._id);
    if (supplierIndex >= 0) {
        $scope.product.suppliers.splice(supplierIndex, 1);
    }
  };

  $scope.getCategories = function(name){
    return $http.get(myConfig.apiUrl+'/categories', {
      params: {
        name: name
      }
    }).then(function(res) {
      
      return res.data;

    });
  }

  $scope.selectCategory = function (item, model, label) {
    
    var category = ($filter('filter')($scope.product.categories, {_id: item._id}, false))[0];
    
    if (!category) {
      
      $scope.selectedCategory = "";

      $scope.product.categories.push(item);
      
    }
    
  };
  
  $scope.dropCategory = function(category){
    var categoryIndex = $scope.product.categories.indexOf(category);
    if (categoryIndex >= 0) {
        $scope.product.categories.splice(categoryIndex, 1);
    }
    var categoryIndex = $scope.product.categories.indexOf(category._id);
    if (categoryIndex >= 0) {
        $scope.product.categories.splice(categoryIndex, 1);
    }
  };
  
  $scope.getImages = function(title){
    return $http.get(myConfig.apiUrl+'/images', {
      params: {
        title: title
      }
    }).then(function(res) {
      
      return res.data;

    });
  }

  $scope.selectImage = function (item, model, label) {
    
    var image = ($filter('filter')($scope.product.images, {_id: item._id}, false))[0];
    
    if (!image) {
      
      $scope.selectedImage = "";

      $scope.product.images.push(item);
      
    }
    
  };
  
  $scope.dropImage = function(image){
    var imageIndex = $scope.product.images.indexOf(image);
    if (imageIndex >= 0) {
        $scope.product.images.splice(imageIndex, 1);
    }
    var imageIndex = $scope.product.images.indexOf(image._id);
    if (imageIndex >= 0) {
        $scope.product.images.splice(imageIndex, 1);
    }
  };
  
}]);

// Optional configuration
products.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      colours: ['#FF5252'],
      responsive: true
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: true
    });
}]);
