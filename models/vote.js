var db = require('./db'),
    mongoose = db.mongoose;

var voteSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    target: {id: mongoose.Schema.Types.ObjectId, model: String},
    createdTime: {type: Date, default: Date.now()},
    updatedTime: {type: Date, default: Date.now()}
});

exports.postModel = mongoose.model('vote', voteSchema, 'vote');