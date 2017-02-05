var db = require('./db'),
    mongoose = db.mongoose;

var commentSchema = new mongoose.Schema({
    content: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'post' },
    user: { type: Object },
    voteCount: { type: Number, default: 0 },
    voteList: { type: Array, default: [] },
    softDelete: { type: Boolean, default: false },
    createdTime: { type: Date, default: Date.now() },
    updatedTime: { type: Date, default: Date.now() }
});

exports.commentModel = mongoose.model('comment', commentSchema, 'comment');
