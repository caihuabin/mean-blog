var db = require('./db'),
    mongoose = db.mongoose;

var commentSchema = new mongoose.Schema({
    //内容
    content: String,
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'post'},
    //user
    user: {type: Object},
    voteCount: {type: Number, default: 0},
    voteList: {type: Array, default: []},
    //是否软删除
    softDelete: {type: Boolean, default: false},
    //创建时间
    createdTime: {type: Date, default: Date.now()},
    //修改时间
    updatedTime: {type: Date, default: Date.now()}
});

exports.commentModel = mongoose.model('comment', commentSchema, 'comment');