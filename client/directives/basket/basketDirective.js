angular.module('myApp')
.directive('fodevBasket', ['basketService', function(basketService){
    return {
        restrict: 'E',
        link: function(scope){
            scope.basket = basketService;
        },
        scope: true,
        templateUrl: '/directives/basket/basketDirective.html'
    };
}]);