var customFilters = angular.module('myApp.custom-filters', ['ngRoute']);

customFilters.filter('groupIntoRowsBy', function($cacheFactory) {

  var cache = $cacheFactory('partition');

  return function(list, colLimit) {

    var cacheId, cached, groups, i, index, _i, _ref;

    if (!list || list.length < 1) {

      return;

    } else {
        
        groups = [];
        
        index = 0;
        
        for (i = _i = 0, _ref = Math.ceil(list.length / colLimit) - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {

          groups.push(list.slice(index, +(index + (colLimit - 1)) + 1 || 9e9));

          index += colLimit;

        }
        
        cacheId = JSON.stringify(list) + colLimit;
        
        cached = cache.get(cacheId);
        
        if (JSON.stringify(groups) === JSON.stringify(cached)) {
        
          return cached;
        
        }

        cache.put(cacheId, groups);

        return groups;        
        
    }
    
  };

});

// https://gist.github.com/gugiserman/94bb936210c7b2abfe58