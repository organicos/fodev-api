'use strict';

var shipping = angular.module('myApp.shipping', ['ngRoute']);

shipping.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when('/shipping/options', {
        templateUrl: '/partials/shipping/options.html',
        controller: 'AdminShippingOptionsCtrl'
    });
}]);

shipping.controller('AdminShippingOptionsCtrl', ['$scope','$http', '$filter', '$routeParams', 'myConfig', 'confirmModalService', 'HtmlMetaTagService', function($scope, $http, $filter, $routeParams, myConfig, confirmModalService, HtmlMetaTagService) {
    
    HtmlMetaTagService.tag('title', 'Configurações de frete');
    
    $scope.deliveryWeekDays = [
        false, // sunday
        false, // monday
        false, // tuesday
        false, // wednsday
        false, // thrusday
        false, // friday
        true // saturday
    ];
    
    $scope.offDays = [];
    
    $scope.shipping = {
        cities: []
    };

    $scope.city = {
        name: ""
        , price: ""
    };

    $scope.addShippingCity = function(city){
        $scope.shipping.cities.push(city);
    };

    $scope.addOffDay = function(offDay){
        var newOffDay = {
                date: offDay.date,
                desc: offDay.desc
            };
        var offDayIndex = $scope.offDays.indexOf(newOffDay);
        if(offDayIndex == -1){
            $scope.offDays.push(newOffDay);
        }
    };
    
    $scope.getWeekDay = function(day){
        
        var curr = new Date; // get current date
        var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        var weekDay;
        if(day == 0){
            weekDay = new Date(curr.setDate(first));
        } else if ([1,2,3,4,5,6].indexOf(day) > -1){
            weekDay = new Date(curr.setDate(first + day))
        }
        return weekDay;  
    };
    
}]);