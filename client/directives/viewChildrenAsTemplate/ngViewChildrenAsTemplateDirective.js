angular.module('myApp')
.directive('ngViewChildrenAsTemplate', ['$templateCache', function($templateCache){
    return {
        restrict: 'A',
        compile:  function (element)
        {
            $templateCache.put('ngViewChildrenAsTemplateDirective.html', element.html());
        }
    };
}]);