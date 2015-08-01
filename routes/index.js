var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.SPOTIFY_DB);
var users = db.get('users');
var bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
var validator = require('../lib/validation').validation;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/visualize');
});

router.get('/visualize', function (req, res, next) {
  if (req.session.user) {
    var userCookie = req.session.user
    res.render('show', {title: 'SONGZ YO', user: userCookie});
  }
  else {
    res.render('show', {title: 'SONGZ YO'});
  }
});

router.get('/visualize/sign-up', function (req, res) {
  res.render('sign-up');
});

router.post('/visualize/sign-up', function (req, res) {
  var formData = req.body;
  // delete formData.passwordConfirm;
  var errorArray = validator(formData.userName, formData.password, formData.passwordConfirm);
  if (errorArray.length > 0) {
    res.render('sign-up', {errors: errorArray, userName: formData.userName})
  }
  else {
    bcrypt.hash(formData.password, 8, function(err, hash) {
      users.insert({userName: formData.userName, password: hash, favSongs: []});
      req.session.user = formData.userName
      res.redirect('/');
    });
  }
});

router.post('/visualize/login', function (req, res, next) {
  var formData = req.body
  users.findOne({userName: formData.userName}).then(function (user) {
    if (bcrypt.compareSync(formData.password, user.password)) {
      req.session.user = formData.userName
      res.redirect('/');
    }
    else {
      res.render('show', {error: 'Passwords Do Not Match'})
    }
  });
});

router.get('/visualize/logout', function (req, res) {
  req.session = null;
  res.redirect('/');
});

module.exports = router;
