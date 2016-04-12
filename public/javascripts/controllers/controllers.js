'use strict';
var app = angular.module('mean', ['ngRoute', 'ngAnimate', 'mean.directives', 'mean.services', 'mean.configs']);
app.config(['$routeProvider', '$locationProvider', 'USER_ROLES', function($routeProvider, $locationProvider, USER_ROLES) {
    $routeProvider.
        when('/auth/login', {
            controller: 'loginCtrl',
            resolve: {
                AuthService: ['AuthService', function(AuthService){
                    return AuthService;
                }],
                AUTH_EVENTS: ['AUTH_EVENTS', function(AUTH_EVENTS){
                    return AUTH_EVENTS;
                }]
            },
            templateUrl:'/auth/login'
        }).when('/auth/register', {
            controller: 'registerCtrl',
            templateUrl:'/auth/register'
        }).when('/auth/restricted',{
            templateUrl:'/auth/restricted',
            data: {
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor, USER_ROLES.guest]
            }
        }).when('/blog', {
            controller: 'BlogListCtrl',
            resolve: {
                posts: ["MultiPostLoader", function(MultiPostLoader) {
                    return function(params){return MultiPostLoader(params);}
                }]
            },
            templateUrl:'/blog/index'
        }).when('/blog/show/:postId', {
            controller: 'BlogShowCtrl',
            resolve: {
                post: ["PostLoader", function(PostLoader) {
                    return PostLoader();
                }]
            },
            templateUrl:'/blog/show'
        }).when('/blog/create', {
            controller: 'BlogCreateCtrl',
            templateUrl:'/blog/create',
            data: {
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            }
        }).when('/blog/edit/:postId', {
            controller: 'BlogEditCtrl',
            resolve: {
                post: ["PostLoader", function(PostLoader) {
                    return PostLoader();
                }]
            },
            templateUrl:'/blog/edit',
            data: {
                authorizedRoles: [USER_ROLES.admin, USER_ROLES.editor]
            }
        }).otherwise({redirectTo:'/blog'});
        /*$locationProvider.html5Mode(true);*/
}]);

app.run(['$rootScope', '$location', 'AuthService', 'AUTH_EVENTS', function($rootScope, $location, AuthService, AUTH_EVENTS) {
    $rootScope.$on('$routeChangeStart', function(evt, next, current) {
        NProgress.start();
        var routeData = !!next.$$route ? next.$$route.data : null;
        if(!!routeData){
            var authorizedRoles = routeData.authorizedRoles;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                event.preventDefault();
                if (AuthService.isAuthenticated()) {
                    // user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    console.log('user is not allowed');
                } else {
                    // user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    $location.path('/auth/login');
                }
            }
        }
    });
    $rootScope.$on('$routeChangeSuccess', function(evt, next, previous) {
        NProgress.done();
    });
    $rootScope.$on('$routeChangeError', function(current, previous, rejection) {
        NProgress.done();
    });
}]);
app.controller('ApplicationController', ['$scope', 'USER_ROLES', 'AuthService', 'Session', '$window', function ($scope, USER_ROLES, AuthService, Session, $window) {
    $scope.currentUser = null;
    $scope.BlogCount = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;
    var currentUser = $window.clientUser;

    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    };
    $scope.setBlogCount = function (count) {
        $scope.BlogCount = count;
    };
    if(currentUser){
        Session.create(currentUser._id, currentUser._id, currentUser.role);
        $scope.setCurrentUser(currentUser);
    }
}]);
app.controller('loginCtrl', ['$scope', '$rootScope', '$location', '$window', 'AuthService', 'AUTH_EVENTS', function($scope, $rootScope, $location, $window, AuthService, AUTH_EVENTS) { 
    $scope.credentials = {username:'', password:''};
    $scope.login = function(credentials){
        AuthService.login(credentials).then(function (data) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, data);
            $scope.setCurrentUser(data.user);
            /*$location.path(data.returnTo).replace();*/
        }, function (error) {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed, error);
            console.log(error);
        });
        /*$scope.$emit('user:logged_in', data.user);*/
        /*$window.location.href = data.data.returnTo;*/
    }
}]);
app.controller('registerCtrl', ['$scope', '$location', '$http', function($scope, $location, $http) {
	var user = {username:'', password:'', password_confirmation:'', email:''};
    $scope.user = user;
    $scope.register = function(){
        $http.post('/auth/register', {
                username: $scope.user.username
                , password: $scope.user.password
                , password_confirmation: $scope.user.password_confirmation
                , email: $scope.user.email
            }).success(function (data) {
                console.log(data);
                $location.path('/auth/login');
            }).error(function (data) {
                console.log(data);
            });
    }
}]);
app.controller('BlogListCtrl', ['$scope', 'posts', function($scope, posts) {
    /*$scope.posts = posts({});*/
    posts({skip: 0, limit: 20}).then(function(result){
        $scope.posts = result[0];
        $scope.setBlogCount(result[1]);
    },function(error){

    });

}]);
app.controller('BlogCreateCtrl', ['$scope', '$location', 'Post', function($scope, $location, Post) {
    $scope.post = new Post();

    $scope.save = function() {
        $scope.post.$save(function(result) {
            var post = result.data;
            $location.path('/blog/show/' + post._id);
        });
    };
}]);
app.controller('BlogShowCtrl', ['$scope', '$location', 'post', function($scope, $location, post) {
    $scope.post = post.data;
    $scope.prev = function() {
        $location.path('/blog/show/' + $scope.post._id);
    };
    $scope.next = function() {
        $location.path('/blog/show/' + $scope.post._id);
    };
}]);

app.controller('BlogEditCtrl', ['$scope', '$location', 'post', function($scope, $location, post) {
    $scope.post = post.data;
    $scope.save = function() {
        $scope.post.$save(function(post) {
            $location.path('/blog/show/' + $scope.post._id);
        });
    };
    $scope.remove = function() {
        delete $scope.post;
        $location.path('/blog');
    };
}]);