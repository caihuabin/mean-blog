var db = require('./db'),
    mongoose = db.mongoose;

var voteSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    target: {id: mongoose.Schema.Types.ObjectId, model: String},
    //创建时间
    createdTime: {type: Date, default: Date.now()},
    //修改时间
    updatedTime: {type: Date, default: Date.now()}
});

exports.postModel = mongoose.model('vote', voteSchema, 'vote');