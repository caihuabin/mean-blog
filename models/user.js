var db = require('./db'),
    mongoose = db.mongoose;

var userSchema = new mongoose.Schema({
    //唯一键
    /*_id: {type: mongoose.Schema.Types.ObjectId, unique: true},*/
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    password: {type: String},
    isAdmin: {type: Boolean, default: false},
    avatar: {type: String, default: ""},
    timestamp: {type: Date, default: Date.now()}
});

exports.userModel = mongoose.model('user', userSchema, 'user');