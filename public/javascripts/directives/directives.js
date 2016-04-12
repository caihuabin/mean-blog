'use strict';

var directives = angular.module('mean.directives', []);
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
/*directives.directive('butterbar', ['$rootScope',
    function($rootScope) {
  return {
    link: function(scope, element, attrs) {
      element.addClass('hide');

      $rootScope.$on('$routeChangeStart', function() {
        element.removeClass('hide');
      });

      $rootScope.$on('$routeChangeSuccess', function() {
        element.addClass('hide');
      });
    }
  };
}]);

directives.directive('focus',
    function() {
  return {
    link: function(scope, element, attrs) {
      element[0].focus();
    }
  };
});*/
