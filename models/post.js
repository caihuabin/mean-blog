var db = require('./db'),
    mongoose = db.mongoose;

var postSchema = new mongoose.Schema({
    title: String,
    alias: String,
    summary: String,
    source: String,
    content: String,
    imgList: [],
    labels: [],
    url: String,
    category: {type: Object},
    user: {type: Object},
    /*user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},*/
    commentList: {type: Array, default: []},
    voteList: {type: Array, default: []},
    viewCount: {type: Number, default: 0},
    commentCount: {type: Number, default: 0},
    voteCount: {type: Number, default: 0},
    isDraft: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
    softDelete: {type: Boolean, default: false},
    createdTime: {type: Date, default: Date.now()},
    updatedTime: {type: Date, default: Date.now()}
});

exports.postModel = mongoose.model('post', postSchema, 'post');