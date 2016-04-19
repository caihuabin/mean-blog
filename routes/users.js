var express = require('express');
var router = express.Router();

var userModel = require('../models/user').userModel;
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
                replyCount: user.replyCount,

                voteList: user.voteList,
                replyList: user.replyList,
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
    var _id = req.params.id;
    if (!_id) {
        next(new Error('404'));
    }
    var params = {
        username: req.body.username,
        email: req.body.email,
        updatedTime: Date.now()
    };
    params = tool.deObject(params);

    userModel.findById(_id, function (err, user) {
        if (err) {
            err.status = 404;
            next(err);
        }

        userModel.update({'_id': _id}, params, function (err) {
            if (err) {
                next(err);
            }
            res.json({
                status: 'success',
                data: null
            });
        });
    });
});

module.exports = router;
