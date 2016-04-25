var express = require('express');
var router = express.Router();
var path = require('path');
var postProxy = require('../proxy/post');
var userModel = require('../models/user').userModel;
var postModel = require('../models/post').postModel;
var eventproxy = require('eventproxy');
var redisClient = require('../utility/redisClient');
var tool = require('../utility/tool');
var upload = tool.upload;
var validator = require('../utility/validator').validator;
var restrict = require('../utility/restrict');

upload.configure({
    uploadDir: path.join(__dirname, '../public/uploads/images/'),
    uploadUrl: '/uploads/images/'
});

router.get('/', function (req, res, next) {
    var ep = new eventproxy(),
        filter,
        params = {
            skip: req.query.skip,
            limit: req.query.limit,
            sortName: req.query.sortName,
            sortOrder: req.query.sortOrder,
            searchText: req.query.searchText,
            filterType: req.query.filterType
        };
    if (req.query.filter) {
        filter = JSON.parse(req.query.filter);
        params.cateId = filter.cateId;
        params.userId = filter.userId;
    }
    params = tool.deObject(params);
    ep.all('posts', 'count', function (posts, count) {
        var post,
            result = [];
        posts.forEach(function (item) {
            post = {
                _id: item._id,
                title: item.title,
                alias: item.alias,
                summary: item.summary,
                imgList: item.imgList,
                labels: item.labels,
                url: item.url,
                user: item.user,
                category: item.category,
                viewCount: item.viewCount,
                voteCount: item.voteCount,
                commentCount: item.commentCount,
                createdTime: item.createdTime,
                updatedTime: item.updatedTime,
            };
            result.push(post);
        });
        res.json(result);
    });

    postProxy.getPosts(params, function (err, posts) {
        if (err) {
            next(err);
        } else {
            ep.emit('posts', posts);
        }
    });

    postProxy.getPostsCount(params, function (err, count) {
        if (err) {
            next(err);
        } else {
            ep.emit('count', count);
        }
    });
});


//保存文章
router.post('/', restrict.isAuthenticated, restrict.isAuthorized, function (req, res, next) {
    var rules = {
        title: ['required'],
        alias: ['required'],
        content: ['required']
    };
    var params = {
        title: req.body.title,
        alias: req.body.alias,
        summary: req.body.summary,
        source: req.body.source,
        content: req.body.content,
        imgList: req.body.imgList,
        labels: req.body.labels,
        url: req.body.url,
        user: req.session.user || req.body.user,
        category: req.body.category,
        isDraft: req.body.isDraft == true
    };
    params = tool.deObject(params);
    validator(rules, params, function(err){
        if(err){
            next(err);
        }
        else{
            postModel.create(params, function (err, post) {
                if (err) next(err);
                else{
                    var postParams = {
                        _id: post._id, 
                        alias: post.alias, 
                        title: post.title,
                        createdTime: post.createdTime
                    };
                    userModel.findByIdAndUpdate(params.user._id, {$pushAll: {postList:[postParams]}},  {new :true}, function (err, user) {
                        if(err){
                            next(err);
                        }
                        else if(!user){
                            next(new Error('user can not be found'));
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

router.put('/:id', restrict.isAuthenticated, restrict.isAuthorized, function (req, res, next) {
    var params = {
        title: req.body.title,
        alias: req.body.alias,
        summary: req.body.summary,
        source: req.body.source,
        content: req.body.content,
        imgList: req.body.imgList,
        category: req.body.category,
        labels: req.body.labels,
        url: req.body.url,
        isDraft: req.body.isDraft == true,
        isActive: req.body.isActive == true,
        updatedTime: Date.now()
    };
    params = tool.deObject(params);
    postModel.findByIdAndUpdate(req.params.id, params, function(err){
        if (err){
            next(err);
        } 
        else {
            userModel.findById(req.body.user._id, function(err, user){
                if(err){
                    next(err);
                }
                else{
                    var postList = user.postList;
                    var len = postList.length;
                    for(var i = 0; i < len; i++){
                        if(postList[i]['_id'] == params._id){
                            postList[i]['title'] = params.title;
                            postList[i]['alias'] = params.alias;
                            break;
                        }
                    }
                    user.save(function(err){
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
        }
    });
});
//
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        res.redirect('/admin/articlemanage');
    }

    postModel.findByIdAndUpdate(id, {"$inc": {"viewCount": 1}}, {new :true}, function (err, post) {
        if (err) {
            next(err);
        } else if (!post) {
            next(new Error('404'));
        } else {
            var result = {
                _id: post._id,
                title: post.title,
                alias: post.alias,
                summary: post.summary,
                source: post.source,
                content: post.content,
                imgList: post.imgList,
                labels: post.labels,
                url: post.url,
                user: post.user,
                category: post.category,
                viewCount: post.viewCount,
                voteCount: post.voteCount,
                commentCount: post.commentCount,
                voteList: post.voteList,
                commentList: post.commentList,
                isDraft: post.isDraft,
                isActive: post.isActive,
                createdTime: post.createdTime,
                updatedTime: post.updatedTime
            };
            res.json({
                status: 'success',
                data: result
            });
        }
    })
});

//删除文章
router.delete('/:id', restrict.isAuthenticated, restrict.isAuthorized, function (req, res, next) {
    postModel.findByIdAndUpdate(req.params.id, {'softDelete': true}, function (err) {
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
router.put('/vote/:id', restrict.isAuthenticated, function (req, res, next) {
    var params = {
        voteCount: req.body.voteCount,
        voteList: req.body.voteList
    };
    params = tool.deObject(params);
    postModel.findByIdAndUpdate(req.params.id, params, function (err) {
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
//还原文章
router.post('/undo/:id', restrict.isAuthenticated, restrict.isAdmin, function (req, res, next) {
    postModel.findByIdAndUpdate(req.params.id, {'softDelete': false}, function (err) {
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

router.post('/upload', restrict.isAuthenticated, function (req, res, next) {
    upload.fileHandler()(req, res, next);
});

module.exports = router;