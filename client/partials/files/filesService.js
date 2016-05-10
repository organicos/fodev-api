angular.module('myApp').service('filesService', ['$modal', function ($modal) {
    
    var self = this;
    var multiple = false;
    var typeTab = 'images';
    var appMode = true;
    var selectedItems = [];
    
    var setMultiple = function(mtpl){
        multiple = mtpl || false;
    }
    
    var getMultiple = function(){
        return multiple;
    }
    
    var callback = function(res){
        return res || '';
    };
    
    var uploadCallback = function(cbk){
        if(angular.isFunction(cbk)) callback = cbk;
    }
    
    var setTypeTab = function(ttb){
        if(typeTab != ttb){
            
            typeTab = ttb;   
        }  
    }

    var getTypeTab = function(){
        return typeTab || 'images';  
    }
    
    var setAppMode = function(status){
        appMode = status;
    }
    
    var getAppMode = function(){
        return appMode;
    }
     
    var setSelectedItems = function(file){
        selectedItems = file || [];
    }
    
    var getSelectedItems = function(){
        selectedItems = selectedItems || [];
        return selectedItems;
    }
    
    var createModal = function(template){
        return $modal.open({
            backdrop: true,
            keyboard: true,
            modalFade: true,
            size: 'lg',
            templateUrl: '/partials/files/'+template,
            controller: selectFilesModalCtrl
        }).result;
    }

    self.selectUserFile = function(cbk, multiple, files){
        
        setAppMode(false);
        
        setSelectedItems(files);

        setMultiple(multiple);

        uploadCallback(cbk);
        
        return createModal('files_modal_user.html');
        
    };

    var selectFile = function(cbk, multiple, files){
        
        setSelectedItems(files);

        setMultiple(multiple);

        uploadCallback(cbk);
        
        return createModal('files_modal_select.html');
        
    }
    
    self.selectAppFile = function(cbk, multiple, files){
        
        setAppMode(true);
        
        return selectFile(cbk, multiple, files);
        
    };

    self.selectUserFile = function(cbk, multiple, files){
        
        setAppMode(false);
        
        return selectFile(cbk, multiple, files);
        
    };

    var manageFiles = function(typeTab){
        
        setMultiple(true);
        
        setTypeTab(typeTab);

        return createModal('files_modal_manage.html');

    }
    
    self.manageUserFiles = function(typeTab){
        
        setAppMode(false);
        
        return manageFiles(typeTab);

    };
    
    self.manageAppFiles = function(typeTab){
        
        setAppMode(true);
        
        return manageFiles(typeTab);
    };
    
    var selectFilesModalCtrl = function (Upload, $scope, $http, $modalInstance, myConfig, $filter) {
        $scope.progress = 4;
        $scope.uploading = false;
        $scope.typeTab = getTypeTab();
        $scope.audios = [];
        $scope.videos = [];
        $scope.images = [];
        $scope.file = {};
        $scope.selectedItems = getSelectedItems();
        $scope.privacy;
        
        $scope.setPrivacy = function(privacy){
            $scope.privacy = privacy;
        }
        
        $scope.getPrivacy = function(){
            return $scope.privacy;
        }

        $scope.prepareModalContent = function(fileType){
            
            if(['images', 'videos', 'audios'].indexOf(fileType) > -1){
                
                $scope.selectedItems = [];
                
                if($scope[fileType].length == 0){
                    
                    var url = myConfig.apiUrl;
                    
                    if(getAppMode()){
                        url += '/app/files/'+fileType;
                    } else {
                        url += '/user/files/'+fileType;
                    }
                    
                    $http.get(url)
                    .success(function(res) {
                        
                        $scope[fileType] = res;
                        
                    }).error(function(err) {
                    
                        console.error('ERR', err);
                    
                    });
                    
                }
                
            }
            
        }

        $scope.modalOptions = {
            select: function (result) {
                var items = getMultiple() ? $scope.selectedItems : $scope.selectedItems[0];
                callback(items);
                $scope.selectedItems
                $modalInstance.dismiss('files_selected');
            },
            open: function () {
                
            },
            
            drop: function () {
                
            },
            
            private: function () {
                
            },
            
            public: function () {
                
            },
            close: function (result) {
                $modalInstance.dismiss('cancel');
            }
        };
        
        $scope.selectFile = function(file, finishSelection){
            
            var selectedItems = getSelectedItems();
            
            var elementPos = selectedItems.map(function(x) {return x._id; }).indexOf(file._id);
            
            if(elementPos > -1){
                selectedItems.splice(elementPos, 1);
            } else {
                if(getMultiple()){
                    selectedItems.push(file);
                } else {
                    selectedItems = [file];
                    if(finishSelection){
                        $scope.modalOptions.ok();
                    }
                }
            }
            
            setSelectedItems(selectedItems);
            $scope.selectedItems = selectedItems;

        }
        
        $scope.isSelectedFile = function(file){
            var selectedItems = getSelectedItems();
            
            var elementPos = selectedItems.map(function(x) {return x._id; }).indexOf(file._id);
            
            return elementPos > -1 ? true : false;
        }
        
        $scope.upload = function (files) {
            
            if (files && files.length) {
                
                for (var i = 0; i < files.length; i++) {
    
                    var file = files[i];
                    
                    $http.get(myConfig.apiUrl+'/s3/sign/', { params: {
                        file_name: file.name
                        , file_type: file.type
                    }})
                    .success(function(s3SignRes) {
                        
                        uploadToS3(s3SignRes, file);
                        
                    }).error(function(err) {
                    
                        console.error('ERR', err);
                    
                    });
                    
    
                }
            }
        };
        
        var uploadToS3 = function(s3SignRes, file){
            
            $scope.uploading = true;
            
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", s3SignRes.signed_request);
            xhr.setRequestHeader('x-amz-acl', 'public-read');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    $scope.uploading = false;
                    $scope.$apply();
                    postFile(s3SignRes, file);
                }
            };
            xhr.upload.onprogress = function(evt){
                $scope.progress = ((100 / evt.total) * evt.loaded).toFixed(0);
                $scope.$apply();
            };
    
            xhr.onerror = function() {
                $scope.uploading = false;
                alert("Could not upload file.");
            };
            xhr.send(file);
            
        }
        
        var postFile = function(s3SignRes, file){
            
            var url = myConfig.apiUrl;
            
            if(getAppMode()){
                url += '/app/file/';
            } else {
                url += '/user/file/';
            }
            
            var privacy = $scope.privacy;
            
            console.log(privacy);
            
            $http.post(url, {
                privacy: privacy
                , file_name: file.name
                , type: file.type
                , size: file.size
                , url: s3SignRes.url
            })
            .success(function(res) {
                
                $modalInstance.dismiss('files_selected');
                
                callback(res);
                
            }).error(function(err) {
            
                console.error('ERR', err);
            
            });
            
        }
    
    }
    
}]);