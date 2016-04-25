var express = require('express');
var router = express.Router();

var userModel = require('../models/user').userModel;
var postModel = require('../models/post').postModel;
var restrict = require('../utility/restrict');
var tool = require('../utility/tool');

/* GET users listing. */
router.get('/', function(req, res, next) {
  	res.send('respond with a resource');
});

router.get('/index', function (req, res, next) {
    res.render('user/index', {
        title: ' - 全部用户'
    });
});

router.get('/show', function (req, res, next) {
    res.render('user/show', {
        title: ' - 用户主页'
    });
});

//
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        next(new Error('404'));
    }
    userModel.findById(id, function (err, user) {
        if (err) {
            next(err);
        } else if (!user) {
            next(new Error('404'));
        } else {
            var result = {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,

                voteCount: user.voteCount,
                commentCount: user.commentCount,

                voteList: user.voteList,
                commentList: user.commentList,
                postList: user.postList,

                createdTime: user.createdTime,
                updatedTime: user.updatedTime
            };
            res.json({
                status: 'success',
                data: result
            });
        }
    })
});

router.put('/:id', restrict.isAuthenticated, restrict.isAuthorized, function (req, res, next) {
    if (!req.params.id) {
        next(new Error('404'));
    }
    var params = {
        username: req.body.username,
        email: req.body.email,
        avatar: req.body.avatar,
        updatedTime: Date.now()
    };
    params = tool.deObject(params);
    //new:true to return the modified document rather than the original.
    userModel.findByIdAndUpdate(req.params.id, { $set: params}, {new :true}, function(err, user){
        if(err){
            next(err);
        }
        else if(!user){
            next(new Error('user is invalided'));
        }
        else{
            var userParams = {
                'user.username': user.username,
                'user.email': user.email,
                'user.avatar': user.avatar,
            };
            var ids = user.postList.map(function(post, index){
                return post._id;
            });
            
            postModel.update({_id: {$in: ids}}, { $set: userParams}, { multi: true }, function(err){
                if(err){
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
});

module.exports = router;
