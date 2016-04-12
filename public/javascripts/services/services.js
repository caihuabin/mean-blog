'use strict';

var services = angular.module('mean.services',
    ['ngResource']);
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
        return $resource('/posts/:id', {id: '@id'});
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
