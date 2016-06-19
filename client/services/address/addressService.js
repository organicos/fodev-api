angular.module('myApp').service('addressService', ['$rootScope', '$uibModal', '$filter', '$http', 'confirmModalService', 'myConfig', function ($rootScope, $uibModal, $filter, $http, confirmModalService, myConfig) {
    
    var self = this;

    var addresses = [];
    
    var cities = [];
    
    var config = {
        selectable : false,
        selectedAddress: false
    };
    
    var loadCities = function(){
        
        $http.get(myConfig.apiUrl + '/cities')
        .success(function(res) {
          cities = res;
        })
        .error(function(err) {
        
            console.error('ERR', err);
        
        });
        
    }
    
    this.openAddressesList = function(selectable, selectedAddress, selectCallback){
        var currentTimestamp = new Date().getTime();
        loadCities();
        config.selectable = selectable ? selectable : false;
        config.selectedAddress = selectedAddress ? selectedAddress : false;
        config.selectCallback = selectCallback ? selectCallback : function(){};
        
        // load the user addresses
        $http.get(myConfig.apiUrl + '/addresses')
        .success(function(res) {

            addresses = res;

            return $uibModal.open({
                backdrop: true,
                keyboard: true,
                modalFade: true,
                size: 'lg',
                templateUrl: '/services/address/address_modal.html?' + currentTimestamp,
                controller: addressServiceModalController
            }).result;

        })
        .error(function(err) {

            console.error('ERR', err);

        });
        
    };
    
    var addressServiceModalController = function($scope, $location, $uibModalInstance){

        $scope.selectable = config.selectable;
        $scope.selectedAddress = config.selectedAddress;
        $scope.addresses = addresses;
        $scope.showDetailsOf = {_id : false};
        $scope.processingAddressUpdate = false;
        $scope.cities = cities;
        
        $scope.searchCEP = function(address){
            
            if(address.cep.length > 0){
                
              $http.jsonp('//api.postmon.com.br/v1/cep/'+address.cep+'?callback=JSON_CALLBACK')
              .success(function(res) {
                
                address.street = res.logradouro || '';
                address.district = res.bairro || '';
      
              })
              .error(function(err) {
              
                  console.error('ERR', err);
              
              });
              
            }
          
        };
        
        $scope.addNew = function(){
            var newAddress = {_id:''};
            $scope.showDetailsOf._id = newAddress._id;
            $scope.addresses.unshift(newAddress);
        };

        $scope.addressFormSubmit = function (address) {
            
            $scope.processingAddressUpdate = true;

            
            if(address._id && address._id != ''){
              
                addressPut(address);
              
            } else {
            
                address._id;
                
                addressPost(address); 
            
            }
        
        };
        
        var addressPost = function(address) {
            
            $http.post(myConfig.apiUrl + '/address', address)
            .then(function(res) {
                
                $rootScope.$emit('alert', {
                    kind: 'success',
                    msg: ['Dados salvos!'],
                    title: "Sucesso"
                });
                
            },function(err) {
                
                var error_list = [];
                
                angular.forEach(err.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                
                $rootScope.$emit('alert', {
                  kind: 'danger',
                  msg: error_list,
                  title: "Não fo possível inserir o endereço. Verifique os motivos abaixo:"
                });  
            
            }).finally(function(){
    
                $scope.processingAddressUpdate = false;
    
            });
        
        };
      
        var addressPut = function(address){
            
            $http.put(myConfig.apiUrl+'/address/'+address._id, address)
            .success(function(res) {

                $rootScope.$emit('alert', {
                    kind: 'success',
                    msg: ['Dados salvos!'],
                    title: "Sucesso"
                });
              
            }).error(function(err) {
                
                var error_list = [];
                
                angular.forEach(err.errors, function(error, path) {
                    this.push(error.message);
                }, error_list);
                
                $rootScope.$emit('alert', {
                  kind: 'danger',
                  msg: error_list,
                  title: "Sua alteração precisa ser revisada. Verifique os motivos abaixo:"
                });  
            
            }).finally(function(){
    
                $scope.processingAddressUpdate = false;
    
            });
            
        };
    
        $scope.dropAddress = function($event, address) {
        
            $event.stopPropagation();
            
            var modalOptions = {
                closeButtonText: 'Cancelar',
                actionButtonText: 'Excluir endereço',
                actionButtonKind: 'btn-danger',
                headerText: 'Cornfirme',
                bodyText: 'Deseja realmente excluir o endereço: ' + address.name + '?'
            };
        
            confirmModalService.showModal({}, modalOptions)
            .then(function (result) {
              
              if(result){
                
                $http.delete(myConfig.apiUrl + '/addresses/' +  address._id)
                .success(function(res) {
                    
                    var addressIndex = $scope.addresses.indexOf(address);
                    
                    if(addressIndex >= 0) $scope.addresses.splice(addressIndex, 1);
                  
                    $rootScope.$emit('alert', {
                      kind: 'success',
                      msg: "Sucesso!",
                      title: "Endereço removido."
                    });  
                    
                }).error(function(err) {
                    
                    var error_list = [];
                    
                    angular.forEach(err.errors, function(error, path) {
                        this.push(error.message);
                    }, error_list);
                    
                    $rootScope.$emit('alert', {
                      kind: 'danger',
                      msg: error_list,
                      title: "Não fo possível remover o endereço. Verifique os motivos abaixo:"
                    });  
                
                }).finally(function(){
        
                    $scope.processingAddressUpdate = false;
        
                });
                
              }
        
            });
        
        };
    
        // define the modal options
        $scope.modalOptions = {
            
            select: function ($event, address) {
        
                $event.stopPropagation();
                
                config.selectCallback(address);

                $uibModalInstance.dismiss('selected');

            },
            cancel: function () {
                $uibModalInstance.dismiss('cancel');
            }
        };
        
    };
    
}]);