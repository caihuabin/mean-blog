'use strict';

var directives = angular.module('mean.directives', ['mean.configs']);
// 密码验证directive
directives.directive('pwCheck', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.pwCheck];  
  
            ctrl.$parsers.push(function(value) {  
                ctrl.$setValidity("pwconfirm", value === otherInput.$viewValue);  
                return value;
            });  
  
            otherInput.$parsers.push(function(value) {
                ctrl.$setValidity("pwconfirm", value === ctrl.$viewValue);  
                return value;  
            }); 
            
        }
    }
}]);
//用户名唯一directive
directives.directive('ensureUnique',function($http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            scope.$watch(attrs.ngModel, function() {
                var data = {};
                var field = attrs.ensureUnique;
                var index = field.indexOf('.');
                var value = {};
                if( index > -1 ){
                    data['model'] = field.substring(0, index);
                    data['field'] = field.substring(index+1);
                }
                else{
                    data['model'] = 'user';
                    data['field'] = field;
                }
                value[data['field']] = eval('scope.' + attrs.ngModel);
                data['value'] = value;

                $http({
                    method: 'POST',
                    url: '/api/checkUnique',
                    data: data
                }).success(function(data,status,headers,cfg) {
                    ctrl.$setValidity('unique', data.isUnique);
                }).error(function(data,status,headers,cfg) {
                    ctrl.$setValidity('unique', false);
                });
            });
        }
    };
});
directives.directive('authDialog', ['AUTH_EVENTS', function (AUTH_EVENTS) {
    return {
        restrict: 'A',
        //若直接写在文档会有闪现问题
        template:   '<div class="overlay slide-down" ng-if="visible">' +
                        '<article ng-include="\'/auth/login\'" ng-show="toggle" class="flip-in" ng-controller="LoginCtrl"></article>'+
                        '<article ng-include="\'/auth/register\'" ng-show="!toggle" class="flip-in" ng-controller="RegisterCtrl"></article>'+
                        '<nav class="slideshow"><a ng-click="closeDialog()" class="nav-close"><span class="icon-cancel"></span></a>'+
                        '<a ng-click="toggle=!toggle" class="nav-login"><span class="icon-login"></span></a></nav></div>',
        link: function (scope) {
            scope.visible = false;
            scope.toggle = true;
            var showDialog = function (args, toggle) {
                scope.visible = true;
                (toggle === 'login') ? (scope.toggle = true) : (scope.toggle = false);
            };
            var closeDialog = function(){
                scope.visible = false;
            };
            scope.closeDialog = closeDialog;
            scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
            scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
            scope.$on(AUTH_EVENTS.loginSuccess, closeDialog);
        }
    };
}]);
directives.directive('blogDialog', ['CUSTOM_EVENTS', '$sce', function (CUSTOM_EVENTS, $sce) {
    return {
        restrict: 'A',
        template: '<div class="overlay slide-right blog-preview-dialog" ng-show="visible">' + 
                    '<section class="container" ng-bind-html="previewContent"></section>' + 
                    '<nav class="slideshow">' + 
                        '<a ng-click="closeDialog()" class="nav-close">' + 
                            '<span class="icon-eye-off"></span></a></nav></div>',
        link: function (scope) {
            scope.visible = false;
            var showDialog = function (args, toggle) {
                scope.visible = true;
                if(scope.post.content){
                    scope.previewContent = $sce.trustAsHtml(markdown.toHTML(scope.post.content));
                }
                
            };
            var closeDialog = function(){
                scope.visible = false;
            };
            scope.closeDialog = closeDialog;
            scope.$on(CUSTOM_EVENTS.blogPreviewOpen, showDialog);
            scope.$on(CUSTOM_EVENTS.blogPreviewClose, closeDialog);
        }
    };
}]);

directives.directive('markDown', ['$sce', function($sce){
    return {
        restrict: 'A',
        link: function(scope){
            if(scope.post.content){
                scope.previewContent = $sce.trustAsHtml(markdown.toHTML(scope.post.content));
            }
        }
    }
}]);

directives.directive('menuLink', ['$window', 'DOM_EVENTS', function($window, DOM_EVENTS) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var elem = element[0];

            elem[DOM_EVENTS.onclick] = function(e){
                var active = 'active';
                e.preventDefault();
                $window.document.getElementById('layout').classList.toggle(active);
                $window.document.getElementById('menu').classList.toggle(active);
                this.classList.toggle(active);
            };
            
        }
    };
}]);
directives.directive('whenScrolled', ['DOM_EVENTS', 'CUSTOM_EVENTS', '$window', function(DOM_EVENTS, CUSTOM_EVENTS, $window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var elem = element[0];
            var documentElement = $window.document.documentElement;
            var body = $window.document.body;
            var bindScroll = function(){
                IsScrollToBottom() && scope.$broadcast(CUSTOM_EVENTS.loadMore);
            };
            elem[DOM_EVENTS.onscroll] = bindScroll;
            scope.$on(CUSTOM_EVENTS.loading, function(){
                elem[DOM_EVENTS.scroll] = null;
            });
            scope.$on(CUSTOM_EVENTS.loaded, function(){
                elem[DOM_EVENTS.scroll] = bindScroll;
            });

            function IsScrollToBottom() {
                var scrollTop = 0;  
                var clientHeight = 0;
                var scrollHeight = Math.max(body.scrollHeight, documentElement.scrollHeight) || 0;  
                if (documentElement && documentElement.scrollTop) { 
                    scrollTop = documentElement.scrollTop; 
                } else if (body) {
                    scrollTop = body.scrollTop;
                }  
                if (body.clientHeight && documentElement.clientHeight) {  
                    clientHeight = (body.clientHeight < documentElement.clientHeight) ? body.clientHeight: documentElement.clientHeight;  
                } else {  
                    clientHeight = (body.clientHeight > documentElement.clientHeight) ? body.clientHeight: documentElement.clientHeight;  
                }
                return scrollTop + clientHeight >= scrollHeight ? true : false;
            }
        }
    };
}]);
directives.directive('scrollTo', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var documentElement = $window.document.documentElement;
            var body = $window.document.body;
            
            scope.scrollTo = function(pos){
                if(pos === 0){
                    body.scrollTop = 0;
                }
                else if(pos === -1){
                    var scrollHeight = Math.max(body.scrollHeight, documentElement.scrollHeight) || 0;
                    var clientHeight = 0;
                    if (body.clientHeight && documentElement.clientHeight) {
                        clientHeight = (body.clientHeight < documentElement.clientHeight) ? body.clientHeight: documentElement.clientHeight;  
                    } else {  
                        clientHeight = (body.clientHeight > documentElement.clientHeight) ? body.clientHeight: documentElement.clientHeight;  
                    }
                    body.scrollTop = scrollHeight - clientHeight;
                }
            }
        }
    }
}]);
directives.directive('fileModel', ['$parse', 'DOM_EVENTS', function ($parse, DOM_EVENTS) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var optionsObj = {};
            /*if (scope.success) {
                optionsObj.success = function() {
                    scope.$apply(function() {
                        scope.success({e: e, data: data});
                    });
                };
            }
            if (scope.error) {
                optionsObj.error = function() {
                    scope.$apply(function() {
                        scope.error({e: e, data: data});
                    });
                };
            }
            if (scope.progress) {
                optionsObj.progress = function(e, data) {
                    scope.$apply(function() {
                        scope.progress({e: e, data: data});
                    });
                }
            }*/
            var value = attrs.fileModel;
            var model = $parse('files');
            var modelSetter = model.assign;
            element[0][DOM_EVENTS.onchange] = function(e){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files);
                });
                /*scope.files = (e.srcElement || e.target).files[0];*/
                //show images
                if(value == 'readAndUpload'){
                    scope.readFiles(optionsObj);
                }
                scope.uploadFiles(optionsObj);
            }

        }
    };
}]);

directives.directive('focus', function() {
    return {
        link: function(scope, element, attrs) {
            element[0].focus();
        }
    };
});