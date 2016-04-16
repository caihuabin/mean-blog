var postModel = require('../models/post').postModel;
var redisClient = require('../utility/redisClient');
var tool = require('../utility/tool');

/**
 * 为首页数据查询构建条件对象
 * @param params 查询参数对象
 * @returns {{}}
 */
function getPostsQuery(params) {
    var query = {};
    query.isActive = true;
    query.isDraft = false;

    params.cateId && (query.category._id = params.cateId);
    params.userId && (query.user._id = params.userId);
    if (params.searchText) {
        switch (params.filterType) {
            case '1':
                query.title = {"$regex": params.searchText, "$options": "gi"};
                break;
            case '2':
                query.labels = {"$regex": params.searchText, "$options": "gi"};
                break;
            case '3':
                query.createdTime = {"$regex": params.searchText, "$options": "gi"};
                break;
            default:
                query.$or = [{
                    "title": {
                        "$regex": params.searchText,
                        "$options": "gi"
                    }
                }, {
                    'labels': {
                        "$regex": params.searchText,
                        "$options": "gi"
                    }
                }, {
                    'summary': {
                        "$regex": params.searchText,
                        "$options": "gi"
                    }
                }, {
                    'content': {
                        "$regex": params.searchText,
                        "$options": "gi"
                    }
                }];
        }
    }
    return query;
}

/**
 * 获取首页的文章数据
 * @param params 参数对象
 * @param callback 回调函数
 */
exports.getPosts = function (params, callback) {
    var cache_key = tool.generateKey('posts', params);
    redisClient.getItem(cache_key, function (err, posts) {
        if (err) {
            return callback(err);
        }
        if (posts) {
            return callback(null, posts);
        }
        params.limit = params.limit || 0;
        params.skip = params.skip || 0;

        var options = {};
        options.skip = parseInt(params.skip);
        options.limit = parseInt(params.limit);
        if(params.sortOrder == 'asc'){
            options.sort = params.sortName === 'title' ? 'title -createdTime' : '-createdTime';
        }
        else{
            options.sort = params.sortName === 'title' ? '-title -createdTime' : '-createdTime';
        }
        var query = getPostsQuery(params);
        postModel.find(query, {}, options, function (err, posts) {
            if (err) {
                return callback(err);
            }
            if (posts) {
                redisClient.setItem(cache_key, posts, redisClient.defaultExpired, function (err) {
                    if (err) {
                        return callback(err);
                    }
                })
            }
            return callback(null, posts);
        });
    });
};

/**
 * 获取首页的文章数
 * @param params 参数对象
 * @param callback 回调函数
 */
exports.getPostsCount = function (params, callback) {
    var cache_key = tool.generateKey('posts_count', params);
    redisClient.getItem(cache_key, function (err, count) {
        if (err) {
            return callback(err);
        }
        if (count) {
            return callback(null, count);
        }
        var query = getPostsQuery(params);
        postModel.count(query, function (err, count) {
            if (err) {
                return callback(err);
            }
            redisClient.setItem(cache_key, count, redisClient.defaultExpired, function (err) {
                if (err) {
                    return callback(err);
                }
            });
            return callback(null, count);
        });
    });
};

/**
 * 根据alias获取文章
 * @param alias 文章alias
 * @param callback 回调函数
 */
exports.getPostByAlias = function (alias, callback) {
    var cache_key = 'post_' + alias;
    //此处不需要等待MongoDB的响应，所以不想传一个回调函数，但如果不传回调函数，则必须在调用Query对象上的exec()方法！
    //postModel.update({"Alias": alias}, {"ViewCount": 1}, function () {});
    postModel.update({"alias": alias}, {"$inc": {"viewCount": 1}}).exec();
    redisClient.getItem(cache_key, function (err, post) {
        if (err) {
            return callback(err);
        }
        if (post) {
            return callback(null, post);
        }
        postModel.findOne({"alias": alias}, function (err, post) {
            if (err) {
                return callback(err);
            }
            if (post) {
                redisClient.setItem(cache_key, post, redisClient.defaultExpired, function (err) {
                    if (err) {
                        return callback(err);
                    }
                });
            }
            return callback(null, post);
        })
    });
};

/**
 * 根据id获取文章
 * @param id 文章id
 * @param callback 回调函数
 */
exports.getById = function (id, callback) {
    postModel.findById(id, function (err, post) {
        if (err) {
            return callback(err);
        }
        return callback(null, post);
    });
};

/**
 * 新增文章
 * @param params 参数对象
 * @param callback 回调函数
 */
exports.save = function (params, callback) {
    var entity = new postModel(params);
    //`numAffected` will be 1 when the document was successfully persisted to MongoDB, otherwise 0. Unless you tweak mongoose's internals, you don't need to worry about checking this parameter for errors - checking `err` is sufficient to make sure your document was properly saved.
    entity.save(function (err, post, numAffected) {
        if (err) {
            return callback(err, null);
        }
        return callback(null, post);
    });
};
exports.update = function (params, callback) {
    var _id = params._id, entity = params;
    delete entity._id;

    postModel.findById(_id, function (err, post) {
        if (err) {
            return callback(err);
        }
        postModel.update({'_id': _id}, entity, function (err) {
            if (err) {
                return callback(err);
            }
            return callback(null);
        });
    });
};
/**
 * 软删除文章
 * @param ids 文章id数组
 * @param callback 回调函数
 */
exports.delete = function (ids, callback) {
    var hasErr = false;
    ids.forEach(function (id, index) {
        postModel.update({'_id': id}, {'softDelete': true}, function (err) {
            if (err) {
                hasErr = true;
            }
            if (index === ids.length-1) {
                if (hasErr) {
                    return callback(err);
                }
                return callback(null);
            }
        });
    });
};

/**
 * 恢复删除的文章
 * @param id 文章id
 * @param callback 回调函数
 */
exports.undo = function (id, callback) {
    postModel.update({'_id': id}, {'softDelete': false}, function (err) {
        if (err) {
            return callback(err);
        }
        return callback(null);
    });
};