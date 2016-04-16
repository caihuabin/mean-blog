var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MEAN', clientUser: req.session.user });
});
router.get('/about', function(req, res, next) {
  res.render('about/index');
});
router.get('/contact', function(req, res, next) {
  res.render('about/contact');
});
module.exports = router;
