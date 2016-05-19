"use strict";

angular.module('myApp')
.directive('resizimage', ['$location', function ($location) {
  var conf = getConf($location);
  return {
    restrict: 'AEC',
    terminal: true,
    controller: function($scope, $element, $attrs){
      $attrs.$observe('src', function(newVal, oldVal){
         if(newVal){
             setImageSrc($attrs, conf);
         }
      });
    },
    link: function postLink($scope, $element, $attrs) {
      if(!$attrs.src){
        setImageSrc($attrs, conf, conf.noImageSrc);
      }
      $element.bind('error', function() {
        setImageSrc($attrs, conf, conf.brokenImageSrc);
      });
    }
  };
}]);

function setImageSrc($attrs, conf, src){
  var options = getOptions($attrs, conf, src);
  if(!srcHasResizimageApplied(conf, options)){
    if(options.size){
      var imageSrc = src || options.src;
      var resizimageUrl = getResizimageUri(conf, options.size, imageSrc);
      $attrs.$set("src", resizimageUrl);
    }    
  }
}

function srcHasResizimageApplied(conf, options){
  var resizimageUrl = getResizimageUri(conf, options.size, '');
  if(options.src.indexOf(resizimageUrl) == 0){
    return true;
  } else {
    return false;
  }
}

function getOptions($attrs, conf, source){
  var options = {};
  if(isValidSize($attrs.resizimage)) options.size = $attrs.resizimage;
  if(isValidSize($attrs.size)) options.size = $attrs.size;
  options.src = source || $attrs.src || $attrs.ngSrc || conf.noImageSrc;
  return options;
}

function getConf($location){
  var baseUrl = getBaseUrl($location); // used to achieve local paths
  return {
    resizeOnTheFlyHost: baseUrl + '/resizimage/',
    noImageSrc: baseUrl + '/assets/img/global/no_image.jpeg',
    brokenImageSrc: baseUrl + '/assets/img/global/broken_image.jpeg',
    uriUrlSegment: '/?url='
  };
}

function isValidSize(size){
  return /^([0-9]+)?x?([0-9]+$)/.test(size); // 200 or 200x200
}

function getResizimageUri(conf, size, src){
  return conf.resizeOnTheFlyHost + size + conf.uriUrlSegment + src;
}

function getBaseUrl($location){
  var pathIndex = $location.$$absUrl.indexOf($location.$$path);
  return $location.$$absUrl.substring(0, pathIndex);
}