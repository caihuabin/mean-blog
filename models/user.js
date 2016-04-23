var db = require('./db'),
    mongoose = db.mongoose;

var userSchema = new mongoose.Schema({
    /*_id: {type: mongoose.Schema.Types.ObjectId, unique: true},*/
    username: {
        type: String, 
        unique: true,
        required: true,
    },
    email: {
        type: String, 
        unique: true,
        required: true,
        validate: {
          validator: function(v) {
            return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(v);
          },
          message: '{VALUE} is not a valid email!'
        }
    },
    password: {
        type: String,
        required: true
    },
    role: {type: String, default: 'admin'},
    avatar: {type: String, default: "/images/avatar.png"},
    isActive: {type: Boolean, default: true},
    /*postList: [{type: mongoose.Schema.Types.ObjectId, ref: 'post'}],*/
    postList: [],
    //创建时间
    createdTime: {type: Date, default: Date.now()},
    //修改时间
    updatedTime: {type: Date, default: Date.now()}
});

exports.userModel = mongoose.model('user', userSchema, 'user');