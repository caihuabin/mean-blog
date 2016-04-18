var express = require('express');
var router = express.Router();

var userModel = require('../models/user').userModel;
var hash = require('../utility/hash').hash;
var validator = require('../utility/validator').validator;
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
            if (hash == user.password){
                return fn(null, user);
            }
            else{
                return fn(new Error('invalid password'));
            }
            
        });
    });    
}
function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.send('Wahoo! Access denied!, Please to <a href="javascript:;",  ng-click="authDialog()"> Login </a>');
    }
}
router.get('/restricted', restrict, function(req, res){
    res.send('Wahoo! restricted area, click to <a href="/auth/logout">logout</a>');
});
router.get('/register', function (req, res, next) {
    res.render('auth/register');
});
router.post('/register', function(req, res, next){
    var rules = {
        username: ['required'],
        password: ['required'],
        password_confirmation: ['required', 'confirmed:password'],
        email: ['required', 'email']
    };
    var data = {
        username: req.body.username,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
        email: req.body.email
    };
    validator(rules, data, function(err){
        if(err){
            next(err);
        }
        else{
            hash(data.password, config.salt, function(err, hash){
                if (err) {
                    next(err);
                }
                else{
                    var entity = new userModel({
                        username: data.username,
                        email: data.email,
                        password: hash,
                        role: 'admin',
                        avatar: '/images/avatar.png'
                    });
                    entity.save(function (err) {
                        if (err) {
                            next(err);
                        }
                        else{
                            res.json({
                                status: 'success',
                                data: null
                            });
                        }
                        
                    });
                }
            });
        }
    });
    
});
router.get('/login', function (req, res, next) {
    res.render('auth/login');
});

router.post('/login', function (req, res, next) {
	var rules = {
        username: ['required'],
        password: ['required']
    };
    var data = {
        username: req.body.username,
        password: req.body.password
    };
    validator(rules, data, function(err){
    	if(err){
            next(err);
    	}
    	else{
    		authenticate(req.body.username, req.body.password, function(err, user){
		        if (user){
		            req.session.regenerate(function(){
		                req.session.user = {
                            _id : user._id,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                            avatar: user.avatar,
                            createdTime: user.createdTime
                        };
		                req.session.success = 'Authenticated as ' + user.username
		                    + ' click to <a href="/auth/logout">logout</a>. '
		                    + ' You may now access <a href="/auth/restricted">/restricted</a>.';
                        res.json({
                            status: 'success',
                            data: {user: req.session.user}
                        });
		            });
		        }
                else{
		            req.session.error = 'Authentication failed, please check your username and password.';
		            err.message = req.session.error;
                    next(err);
		        }
		    });
    	}
    });
    
});
router.post('/check', function (req, res, next) {
    if (req.session.user) {
        res.json({
            isCheck: true,
            user: req.session.user
        });
    } else {
        res.json({
            isCheck: false,
            user: null
        });
    }
});
router.get('/logout', function (req, res) {
    req.session.destroy(function(){
        /*res.json({
            status: 'success',
            data: null
        });*/
        res.redirect('/');
    });
});

module.exports = router;