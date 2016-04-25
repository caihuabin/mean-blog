var db = require('./db'),
    mongoose = db.mongoose;

var postSchema = new mongoose.Schema({
    //标题
    title: String,
    //文章别名
    alias: String,
    //摘要
    summary: String,
    //来源
    source: String,
    //内容
    content: String,
    //图片
    imgList: [],
    //标签
    labels: [],
    //外链Url
    url: String,
    //分类
    category: {type: Object},
    //user
    user: {type: Object},
    /*user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},*/
    //回复
    commentList: {type: Array, default: []},
    //
    voteList: {type: Array, default: []},
    //浏览次数
    viewCount: {type: Number, default: 0},
    //
    commentCount: {type: Number, default: 0},
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