'use strict';

var configs = angular.module('mean.configs', []);
configs.constant('AUTH_EVENTS', {
  	loginSuccess: 'auth-login-success',
  	loginFailed: 'auth-login-failed',
  	logoutSuccess: 'auth-logout-success',
  	sessionTimeout: 'auth-session-timeout',
  	notAuthenticated: 'auth-not-authenticated',
  	notAuthorized: 'auth-not-authorized'
});

configs.constant('USER_ROLES', {
  	all: '*',
  	admin: 'admin',
  	editor: 'editor',
  	guest: 'guest'
});

configs.constant('DOM_EVENTS', {
    onclick: 'onclick',
    onscroll: 'onscroll',
    onchange: 'onchange',
    click: 'click',
    scroll: 'scroll',
    change: 'change'
});

configs.constant('CUSTOM_EVENTS', {
    loadMore: 'load-more',
    loading: 'loading',
    loaded: 'loaded',
    loadOver: 'load-over',
    readFilesSuccess: 'read-files-success',
    uploadFilesSuccess: 'upload-files-success',
    blogPreviewOpen: 'blog-preview-open',
    blogPreviewClose: 'blog-preview-close'
});
