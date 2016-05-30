angular.module('myApp').service('categoryService', ['$rootScope', '$modal', '$filter', '$http', 'confirmModalService', 'myConfig', function ($rootScope, $modal, $filter, $http, confirmModalService, myConfig) {
    this.get = function(category){
        if(category){
            if(category._id){
                return $http.get(myConfig.apiUrl+'/category/'+category._id);    
            } else {
                return $http.get(myConfig.apiUrl+'/categories/', {params: category});
            }
        } else {
            return $http.get(myConfig.apiUrl + '/categories');
        }
    }

    this.post = function(category){
        return $http.post(myConfig.apiUrl + '/category', category);
    };
  
    this.put = function(category){
        return $http.put(myConfig.apiUrl+'/category/'+category._id, category);
    }

    this.delete = function(category){
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Excluir categoria',
            actionButtonKind: 'btn-danger',
            headerText: 'Excluir a categoria ' + category.name + "?",
            bodyText: 'Deseja realmente excluir a categoria ' + category.name + "?"
        };
        return confirmModalService.showModal({}, modalOptions)
        .then(function (confirmed) {
            if(confirmed){
                return $http.delete(myConfig.apiUrl+'/category/'+category._id, category);
            } else {
                return {
                    then: function(){},
                    finally: function(cbk){cbk()}
                };
            }
        });
    }
}]);