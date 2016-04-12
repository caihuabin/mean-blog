var express = require('express');
var router = express.Router();

router.get('/index', function (req, res, next) {
    res.render('blog/index', {
        title: ' - 全部文章'
    });
});

router.get('/show', function (req, res, next) {
    res.render('blog/show', {
        title: ' - 文章内容'
    });
});

router.get('/create', function (req, res, next) {
    res.render('blog/create', {
        title: ' - 新的文章'
    });
});

router.get('/edit', function (req, res, next) {
    res.render('blog/edit', {
        title: ' - 编辑文章'
    });
});

module.exports = router;