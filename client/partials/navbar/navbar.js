angular.module('myApp').controller('NavBarCtrl', ['$scope', '$localStorage', '$location', function($scope, $localStorage, $location) {
    
    $scope.isCollapsed = true;
    
    $scope.user = $localStorage.user;
    
    $scope.$on('$routeChangeSuccess', function(){
        $scope.location = $location;
        $scope.isCollapsed = true;
    });
    
    $scope.totalBasketItens = function(){
        var total = 0;
        for(count=0;count<$scope.items.length;count++){
            total += $scope.items[count].Price + $scope.items[count].Price;
        }
        return total;
    };
    
}]);