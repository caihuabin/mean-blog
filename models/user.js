var db = require('./db'),
    mongoose = db.mongoose;

var userSchema = new mongoose.Schema({
    /*_id: {type: mongoose.Schema.Types.ObjectId, unique: true},*/
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    password: {type: String},
    role: {type: String, default: 'admin'},
    avatar: {type: String, default: "/images/avatar.png"},
    isActive: {type: Boolean, default: true},
    //创建时间
    createdTime: {type: Date, default: Date.now()},
    //修改时间
    updatedTime: {type: Date, default: Date.now()}
});

exports.userModel = mongoose.model('user', userSchema, 'user');