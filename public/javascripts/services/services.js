'use strict';

var services = angular.module('mean.services',
    ['ngResource', 'mean.configs']);

services.factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', function ($rootScope, $q, AUTH_EVENTS) {
    return {
        responseError: function (response) {
            $rootScope.$broadcast({
                401: AUTH_EVENTS.notAuthenticated,
                403: AUTH_EVENTS.notAuthorized,
                419: AUTH_EVENTS.sessionTimeout,
                440: AUTH_EVENTS.sessionTimeout
            }[response.status], response);
            return $q.reject(response);
        }
    };
}]);

services.service('Session', function () {
    this.create = function (sessionId, userId, userRole) {
        this.id = sessionId;
        this.userId = userId;
        this.userRole = userRole;
    };
    this.destroy = function () {
        this.id = null;
        this.userId = null;
        this.userRole = null;
    };
    return this;
});

services.factory('AuthService', ['$http', 'Session', function ($http, Session) {
    var authService = {};
    authService.login = function (credentials) {
        return $http.post('/auth/login', credentials).then(function (res) {
            var data = res.data.data;
            Session.create(data.user._id, data.user._id, data.user.role);
            return data;
        });
    };

    authService.isAuthenticated = function () {
        return !!Session.userId;
    };

    authService.isAuthorized = function (authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    };
    return authService;
}]);

services.factory('Post', ['$resource', function($resource) {
        return $resource('/posts/:id', {id: '@_id'}, { update: { method: 'PUT' } });
}]);

services.factory('MultiPostLoader', ['Post', '$q', function(Post, $q) {
    return function(params) {
        var delay = $q.defer();
        Post.query(params, function(posts) {
            delay.resolve(posts);
        }, function() {
            delay.reject('Unable to fetch posts');
        });
        return delay.promise;
    };
}]);

services.factory('PostLoader', ['Post', '$route', '$q', function(Post, $route, $q) {
    return function() {
        var delay = $q.defer();
        Post.get({id: $route.current.params.postId}, function(post) {
            delay.resolve(post);
        }, function() {
            delay.reject('Unable to fetch post '  + $route.current.params.postId);
        });
        return delay.promise;
    };
}]);

services.factory('fileReader', ["$q", function($q){
    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };
    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };
    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        return reader;
    };
    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);         
        reader.readAsDataURL(file);
        return deferred.promise;
    };
    return {
        readAsDataUrl: readAsDataURL
    };
}]);

services.service('fileUpload', ['$http', function ($http) {
    this.uploadToUrl = function(url, data){
        var fd = new FormData();
        angular.forEach(data, function(val, key) {
            fd.append(key, val);
        });
        var args = {
            method: 'POST',
            url: url,
            data: fd,
            headers: {'Content-Type': undefined},
            transformRequest: angular.identity
        };
        return $http(args);
    };
}]);
        