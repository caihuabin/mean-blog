var express = require('express');
var router = express.Router();

var userModel = require('../models/user').userModel;
var hash = require('../utility/pass').hash;
var util = require('util');
var config = require('../config');

/*hash('foobar', function(err, salt, hash){
    if (err) throw err;
    // store the salt & hash in the "db"
    users.tj.salt = salt;
    users.tj.hash = hash;
});*/
function authenticate(username, password, fn) {
    if (!module.parent) console.log('authenticating %s:%s', username, password);
    userModel.findOne({"username": username}, function (err, user) {
        if (err) {
            return fn(err);
        }
        if (!user) return fn(new Error('cannot find user'));
        hash(password, config.salt, function(err, hash){
            if (err) return fn(err);
            if (hash == user.password) return fn(null, user);
            fn(new Error('invalid password'));
        });
    });    
}
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/auth/login');
  }
}
router.get('/restricted', restrict, function(req, res){
    res.send('Wahoo! restricted area, click to <a href="/auth/logout">logout</a>');
});
router.get('/register', function (req, res, next) {
    hash('caicai', config.salt, function(err, hash){
        if (err) {res.redirect('/auth/login');}
        else{
            var entity = new userModel({
                username: 'cai',
                email: 'cai@cai.cai',
                password: hash,
                isAdmin: true,
                avatar: ''
            });
            entity.save(function (err) {
                if (err) {
                    req.session.error = util.inspect(err);
                }
                res.redirect('/auth/login');
            });
        }
    });
});
router.get('/login', function (req, res, next) {
    res.render('auth/login');
});

router.post('/login', function (req, res, next) {
    authenticate(req.body.username, req.body.password, function(err, user){
        if (user) {
            req.session.regenerate(function(){
                req.session.user = user;
                req.session.success = 'Authenticated as ' + user.username
                    + ' click to <a href="/auth/logout">logout</a>. '
                    + ' You may now access <a href="/auth/restricted">/restricted</a>.';
                var returnTo = '/admin';
                if (req.session.returnTo) {
                    returnTo = req.session.returnTo;
                }
                /*res.json({
                    valid: true,
                    returnTo: returnTo
                });*/
                res.redirect('back');
            });
        } else {
            req.session.error = 'Authentication failed, please check your '
                + ' username and password.'
                + ' (use "cai" and "caicai")';
            /*res.json({
                valid: false,
                message: '用户名或密码错误！'
            });*/
            res.redirect('/auth/login');
        }
    });
});

router.get('/logout', function (req, res) {
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.redirect('/auth/login');
    });
});

module.exports = router;