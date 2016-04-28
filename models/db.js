var dbPath = require('../config').DbPath;
var mongoose = require('mongoose');

mongoose.connect(dbPath);
var db = mongoose.connection;
db.on('error', function (err) {
    console.error('MongoDB连接错误: ' + err);
    process.exit(1);
});
exports.mongoose = mongoose;

var base = new mongoose.Schema({
    /*_id: {type: String, unique: true},*/
    createdTime: {type: Date, default: Date.now()},
    updatedTime: {type: Date, default: Date.now()}
});
exports.base = base;