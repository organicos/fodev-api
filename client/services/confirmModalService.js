angular.module('myApp').service('confirmModalService', ['$uibModal', function ($uibModal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: '/partials/modals/confirm.html'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        actionButtonKind: 'btn-primary',
        headerText: 'Continuar?',
        bodyText: 'Realizar esta ação?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
        var customModalDefaults = customModalDefaults ? customModalDefaults : {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $uibModalInstance.close(true);
                };
                $scope.modalOptions.close = function (result) {
                    $uibModalInstance.close(false);
                };
            }]
        }

        return $uibModal.open(tempModalDefaults).result;
    };

}]);