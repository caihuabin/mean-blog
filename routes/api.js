var express = require('express');
var router = express.Router();

var userModel = require('../models/user').userModel;
var postModel = require('../models/post').postModel;
var util = require('util');

var mongodbModels = {
    'user': userModel,
    'post': postModel
};
function checkUnique(model, field, data, uniqueId, callback){
    if(!callback){
        callback = uniqueId;
        uniqueId = null;
    }
    if(mongodbModels[model]){
        mongodbModels[model].findOne(data, function (err, result) {
            if (err) {
                return callback(new Error('invalid data'));
            }
            else if (!result) {
                return callback(null, null);
            }
            else{
                if(result._id == uniqueId){
                    return callback(null, null);
                }
                return callback(null, result);
            }
        });  
    }
    else{
        return callback(new Error('invalid model'));
    }
}
router.post('/checkUnique', function (req, res, next) {
    var model = /*'user' || */req.body.model;
    var field = /*'username' || */req.body.field;
    var uniqueId = req.body.value._id || null;
    var data = {};
    data[field] = req.body.value[field];
    checkUnique(model, field, data, uniqueId, function(err, user){
        if(err){
            next(err);
        }
        else if(!user){
            res.json({
                isUnique: true,
                status: 'success'
            });
        }
        else{
            res.json({
                isUnique: false,
                status: 'success'
            });
        }
    });
    
});

module.exports = router;