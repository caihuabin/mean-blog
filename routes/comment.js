var express = require('express');
var router = express.Router();

var userModel = require('../models/comment').commentModel;
var postModel = require('../models/post').postModel;

var validator = require('../utility/validator').validator;
var restrict = require('../utility/restrict');
var tool = require('../utility/tool');

router.post('/', restrict.isAuthenticated, restrict.isAuthorized, function (req, res, next) {
    var rules = {
        content: ['required'],
        post: ['required'],
        user: ['required']
    };
    var params = {
        content: req.body.content,
        post: req.body.post,
        user: req.session.user || req.body.user
    };
    params = tool.deObject(params);
    validator(rules, params, function(err){
        if(err){
            next(err);
        }
        else{
            commentModel.create(params, function (err, comment) {
                if (err) next(err);
                else{
                    var commentParams = {
                        content: comment.content,
                        user: comment.user,
                        voteCount: comment.voteCount,
                        createdTime: comment.createdTime
                    };
                    postModel.findByIdAndUpdate(comment.post._id, {'$inc': {'commentCount': 1}, $pushAll: {commentList:[commentParams]}}, {new: true}, function(err, post){
                        if(err){
                            next(err);
                        }
                        else{
                            res.json({
                                status: 'success',
                                data: post
                            });
                        }
                    });
                }
            });
        }
    });
});

router.put('/vote/:id', restrict.isAuthenticated, function (req, res, next) {
    var params = {
        voteCount: req.body.voteCount,
        voteList: req.body.voteList
    };
    params = tool.deObject(params);
    commentModel.findByIdAndUpdate(req.params.id, params, function (err) {
        if (err) {
            next(err);
        } else {
            res.json({
                status: 'success',
                data: null
            });
        }
    });
});

module.exports = router;