var express = require('express');
var router = express.Router();
/*var path = require('path');*/
/*var upload = require('jquery-file-upload-middleware');*/
var postProxy = require('../proxy/post');
var eventproxy = require('eventproxy');
var redisClient = require('../utility/redisClient');
var tool = require('../utility/tool');
var validator = require('../utility/validator').validator;

/*upload.configure({
    uploadDir: path.join(__dirname, '../public/images/'),
    uploadUrl: '/images'
});*/

router.get('/', function (req, res, next) {
    var ep = new eventproxy(),
        filter,
        params = {
            pageIndex: req.body.pageNumber,
            pageSize: req.body.pageSize,
            sortName: req.body.sortName,
            sortOrder: req.body.sortOrder,
            searchText: req.body.searchText,
            filterType: req.body.filterType
        };
    if (req.body.filter) {
        filter = JSON.parse(req.body.filter);
        params.cateId = filter.cateName;
        params.title = filter.title;
    }
    params = tool.deObject(params);
    ep.all('posts', 'count', function (posts, count) {
        var post,
            result = [];
        posts.forEach(function (item) {
            post = {
                _id: item._id,
                alias: item.alias,
                title: item.title,
                createdTime: item.createdTime,
                updatedTime: item.updatedTime,
                summary: item.summary,
                viewCount: item.viewCount,
                imgList: item.imgList,
                url: item.url,
                user: item.user,
                category: item.category,
                isDraft: item.isDraft,
                isActive: item.isActive
            };
            result.push(post);
        });

        res.json([posts, count]);
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
router.post('/', function (req, res, next) {
    var rules = {
        title: ['required'],
        alias: ['required'],
        content: ['required']
    };
    var data = {
        title: req.body.title,
        alias: req.body.alias,
        summary: req.body.summary || null,
        source: req.body.source || null,
        content: req.body.content,
        imgList: req.body.imgList || null,
        labels: req.body.labels || null,
        url: req.body.url || null,
        user: req.body.user || null,
        category: req.body.category || null,
        isDraft: req.body.isDraft || false
    };
    validator(rules, data, function(err){
        if(err){
            next(err);
        }
        else{
            postProxy.save(data, function (err, post) {
                if (err) {
                    next(err);
                } else {
                    res.json({
                        status: 'success',
                        data: post
                    });
                }
            });
        }
    });
});

router.put('/:id', function (req, res, next) {
    var params = {
        _id: req.params.id,
        title: req.body.title,
        alias: req.body.alias,
        summary: req.body.summary,
        source: req.body.source,
        content: req.body.content,
        imgList: req.body.imgList,
        category: req.body.category,
        user: req.session.user,
        labels: req.body.labels,
        url: req.body.url,
        isDraft: req.body.isDraft,
        softDelete: req.body.softDelete
    };
    postProxy.update(params, function (err) {
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
//
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    if (!id) {
        res.redirect('/admin/articlemanage');
    }

    postProxy.getById(id, function (err, post) {
        if (err) {
            next(err);
        } else if (!post) {
            next(new Error('404'));
        } else {
            var result = {
                _id: post._id,
                alias: post.alias,
                title: post.title,
                createdTime: post.createdTime,
                updatedTime: post.updatedTime,
                summary: post.summary,
                viewCount: post.viewCount,
                source: post.source,
                content: post.content,
                imgList: post.imgList,
                url: post.url,
                user: post.user,
                category: post.category,
                isDraft: post.isDraft,
                isActive: post.isActive
            };
            res.json({
                status: 'success',
                data: result
            });
        }
    })
});

//删除文章
router.delete('/:id', function (req, res, next) {
    postProxy.delete([req.params.id], function (err) {
        if (err) {
            next(err);
        } else {
            res.json({
                status: 'success',
                data: null
            });
        }
    })
});

//还原文章
router.post('/undo/:id', function (req, res, next) {
    postProxy.undo(req.params.id, function (err) {
        if (err) {
            next(err);
        } else {
            res.json({
                status: 'success',
                data: null
            });
        }
    })
});

router.post('/uploadimg', function (req, res, next) {
    /*upload.fileHandler()(req, res, next);*/
});

module.exports = router;