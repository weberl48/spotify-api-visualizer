var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.SPOTIFY_DB);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/visualize');
});

router.get('/visualize', function (req, res, next) {
  res.render('show', {title: 'SONGZ YO'});
});

module.exports = router;
