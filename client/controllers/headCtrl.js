angular.module('myApp').controller('headCtrl' , ['$scope', 'HtmlMetaTagService' , function($scope, HtmlMetaTagService) {

    $scope.HtmlMetaTagService = HtmlMetaTagService;
    
}]);
