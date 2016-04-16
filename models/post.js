var db = require('./db'),
    mongoose = db.mongoose;

var postSchema = new mongoose.Schema({
    //标题
    title: {type: String},
    //文章别名
    alias: {type: String},
    //摘要
    summary: {type: String},
    //来源
    source: {type: String},
    //内容
    content: {type: String},
    //图片
    imgList: {type: Array, default: []},
    //标签
    labels: {type: Array, default: []},
    //外链Url
    url: {type: String},
    //分类
    category: {type: Object},
    //user
    user: {type: Object},
    //回复
    replyList: {type: Array, default: []},
    //
    voteList: {type: Array, default: []},
    //浏览次数
    viewCount: {type: Number, default: 0},
    //
    replyCount: {type: Number, default: 0},
    //
    voteCount: {type: Number, default: 0},
    //是否草稿
    isDraft: {type: Boolean, default: false},
    //是否有效
    isActive: {type: Boolean, default: true},
    //是否软删除
    softDelete: {type: Boolean, default: false},
    //创建时间
    createdTime: {type: Date, default: Date.now()},
    //修改时间
    updatedTime: {type: Date, default: Date.now()}
});

exports.postModel = mongoose.model('post', postSchema, 'post');