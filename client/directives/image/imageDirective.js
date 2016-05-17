"use strict";

angular.module('myApp')
.directive('resizimage', ['$location', function ($location) {
  var resizimageConfig = {
    resizeOnTheFlyHost: $location.$$absUrl + 'resizimage/',
    noImageSrc: $location.$$absUrl + 'assets/img/global/no_image.jpeg'
  };
  return {
    restrict: 'AEC',
    terminal: true,
    controller: function($scope, $element, $attrs){
      var options = getOptions($attrs);
      if(options.size){
        var src = $attrs.src ? $attrs.src : $attrs.ngSrc;
        src = resizimageConfig.resizeOnTheFlyHost + options.size + '/?url=' + src;
        $attrs.$set('src', src);
      }
    },
    link: function postLink($scope, $element, $attrs) {
      $element.bind('error', function() {
        var options = getOptions($attrs);
        var src = resizimageConfig.noImageSrc;
        if(options.size){
          src = resizimageConfig.resizeOnTheFlyHost + options.size + '/?url=' + src;
        }
        $attrs.$set("src", src);
      });
    }
  }
}]);

function getOptions(attrs){
  var options = {};
  if(isValidSize(attrs.resizimage)) options.size = attrs.resizimage;
  if(isValidSize(attrs.size)) options.size = attrs.size;
  return options;
}

function isValidSize(size){
  return /^([0-9]+)?x?([0-9]+$)/.test(size); // 200 or 200x200
}