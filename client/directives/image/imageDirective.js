"use strict";

angular.module('resizimage', [])
.provider('resizimage', function () {
  var self = this;
  var active = false;
  var host = '';
  var noImageSrc = '';
  var brknImageSrc = '';
  self.config = function(val){
    if(!val){
      return {
        active: active,
        host: host,
        noImageSrc: noImageSrc,
        brknImageSrc: brknImageSrc
      };
    }
    else {
      active = val.active || active;
      host = val.host || host;
      noImageSrc = val.noImageSrc || noImageSrc;
      brknImageSrc = val.brknImageSrc || brknImageSrc;
      return self;
    }
  }  
  self.active = function(val){
    if(!val){
      return active;
    }
    else {
      active = val;
      return self;
    }
  }
  self.host = function(val){
    if(!val){
      return host;
    }
    else {
      host = val;
      return self;
    }
  }
  self.noImageSrc = function(val){
    if(!val){
      return noImageSrc;
    }
    else {
      noImageSrc = val;
      return self;
    }
  }
  self.brknImageSrc = function(val){
    if(!val){
      return brknImageSrc;
    }
    else {
      brknImageSrc = val;
      return self;
    }
  }
  self.$get = function () {
    return this;
  };
})
.directive('resizimage', ['resizimage', function (resizimage) {

  return {
    restrict: 'AEC',
    terminal: true,
    controller: resizimageController,
    link: resizimageLink
  };

  function resizimageController($scope, $element, $attrs){
    if(resizimage.active()){
      $attrs.$observe('src', function(newVal, oldVal){
        if(newVal){
          var isBrokenImage = $attrs.resizimageBrokenImage;
          var isMissingImage = $attrs.resizimageMissingImage;
          var isFixedImage = $attrs.resizimageFixedImage;
          if(!isBrokenImage && !isMissingImage && size){
            var src = getSrc($attrs);
            var size = getSize($attrs);
            if(size){
              if(!srcHasResizimageApplied(size, src)){
                var resizimageUrl = getResizimageUri(size, src);
                $attrs.$set("src", resizimageUrl);
              }    
            }
          }
        }
      });
    }
  }

  function resizimageLink($scope, $element, $attrs) {
    if(resizimage.active()){
      if(!$attrs.src){
        $attrs.$set("src", resizimage.noImageSrc());
        $attrs.$set("resizimage-missing-image", true);
      }
      $element.bind('error', function() {
        if($attrs.resizimageDebug){
          var src = $attrs["src"] + "";
          $attrs.$set("onclick", "window.open('"+src+"');");
        }
        $attrs.$set("src", resizimage.brknImageSrc());
        $attrs.$set("resizimage-broken-image", true);
      });
    }
  }

  function srcHasResizimageApplied(size, src){
    var resizimageUrl = getResizimageUri(size, '');
    if(src.indexOf(resizimageUrl) == 0){
      return true;
    } else {
      return false;
    }
  }

  function getSize($attrs){
    var size = false;
    if(isValidSize($attrs.resizimage)) size = $attrs.resizimage;
    if(isValidSize($attrs.size)) size = $attrs.size;
    return size;
  }

  function getSrc($attrs){
    return $attrs.src || $attrs.ngSrc || resizimage.noImageSrc();
  }

  function isValidSize(size){
    return /^([0-9]+)?x?([0-9]+$)/.test(size); // 200 or 200x200
  }

  function getResizimageUri(size, src){
    return resizimage.host() + size + '/?url=' + src;
  }
}]);