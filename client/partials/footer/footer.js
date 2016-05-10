angular.module('myApp').controller('FooterCtrl', ['$scope', '$http', 'myConfig', function($scope, $http, myConfig) {
    
    // next shipping date
    $scope.followingShippingDate = '';
    
    $http.get(myConfig.apiUrl + '/shipping/following')
    .success(function(res) {
      
      $scope.followingShippingDate = res;
      
    })
    .error(function(err) {
    
        console.error('ERR', err);
    
    });
    
}]);