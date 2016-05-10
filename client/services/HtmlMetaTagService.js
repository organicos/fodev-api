angular.module('myApp').service('HtmlMetaTagService', ['$location', function($location) {
    
    var HtmlMetaTagService = this;
    var metaData = {
        title: 'Feira Orgânica Delivery - Produtos organicos entregues em sua porta.'
    };
    var posposition = ' - Feira orgânica Delivery';

    return {
        resetData: function() {
            metaData = {
                title: 'Feira Orgânica Delivery - Produtos orgânicos entregues em sua porta.'
            };
            return HtmlMetaTagService;
        },
        tag: function (tag, value) {
            if (!tag && !value) {
                return metaData;
            } else if (!value) {
                return metaData[tag];
            } else {
                metaData[tag] = value + posposition;
                return HtmlMetaTagService;
            }
        }
   }
  
}]);