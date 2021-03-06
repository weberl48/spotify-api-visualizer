var express = require('express');
var router = express.Router();
// var db = require('monk')(process.env.SPOTIFY_DB);
var db = require('monk')(process.env.MONGOLAB_URI || process.env.SPOTIFY_DB);
var users = db.get('users');
var bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
var validator = require('../lib/validation').validation;
var unirest = require('unirest');

String.prototype.capitalize = function(){
    return this.toLowerCase().replace( /\b\w/g, function (m) {
        return m.toUpperCase();
    });
};

router.get('/', function(req, res, next) {
  res.redirect('/visualize');
});

router.get('/visualize', function (req, res, next) {
  if (req.session.user) {
    var userCookie = req.session.user;
    var userId = req.session.userId;
    userCookie = userCookie.capitalize();
    users.findOne({_id:userId}).then(function (user) {
      res.render('show', {title: 'Spotifize', user: userCookie, userId: userId, userFavs: user.favSongs});
    });
  }
  else {
    res.render('show', {title: 'Spotifize'});
  }
});

router.get('/visualize', function (req, res) {
  // db.open();
  var userCookie = req.session.user;
  var userId = req.session.userId;
  console.log(userId);
  userCookie = userCookie.capitalize();
  users.findOne({_id: userId}).then(function (user) {
    // console.log(user);
    res.render('show', {user: userCookie, userId: userId});
  });
});

// router.get('/visualize/sign-up', function (req, res) {
//   res.render('sign-up');
// });

router.post('/visualize/sign-up', function (req, res) {
  var formData = req.body;
  // delete formData.passwordConfirm;
  console.log(formData);
  users.findOne({userName :formData.userName.toUpperCase()}).then(function (user) {
    if (user) {
      res.render('show', {errors: ['Username already exists']});
    }
    else {
      var errorArray = validator(formData.userName, formData.password, formData.passwordConfirm);
      if (errorArray.length > 0) {
        res.render('show', {errors: errorArray, userName: formData.userName});
      }
      else {
        bcrypt.hash(formData.password, 8, function(err, hash) {
          users.insert({userName: formData.userName.toUpperCase(), password: hash, favSongs: []});
          req.session.user = formData.userName;
          users.findOne({userName: formData.userName.toUpperCase()}).then(function (user) {
            req.session.userId = user._id
            res.redirect('/');
          });
        });
      }
    }
  });
});

router.post('/visualize/login', function (req, res, next) {
  var formData = req.body;
  users.findOne({userName: formData.userName.toUpperCase()}).then(function (user, record) {
    if (user) {
      if (bcrypt.compareSync(formData.password, user.password)) {
        req.session.user = formData.userName;
        req.session.userId = user._id;
        res.redirect('/');
      }
      else {
        res.render('show', {error: 'Incorrect Password'});
      }
    }
    else {
      res.render('show', {error: 'User Does Not Exist'});
    }
  });
});

router.get('/visualize/logout', function (req, res) {
  req.session = null;
  res.redirect('/');
});

router.get('/visualize/liked/:currentAlbumId', function (req, res) {
  unirest.get('https://api.spotify.com/v1/albums/' + req.params.currentAlbumId)
  .end(function (result) {
    var albumObj = JSON.parse(result.raw_body);
    var objToInsert = {
      artistName: albumObj.artists[0].name,
      albumImg: albumObj.images[0].url,
      albumName: albumObj.name,
      previewUrl: albumObj.tracks.items[0].preview_url,
      songName: albumObj.tracks.items[0].name,
      albumId: req.params.currentAlbumId
    };
    users.update({userName: req.session.user.toUpperCase()}, { $push: { favSongs: objToInsert} })
    .then(function () {
      res.json(objToInsert);
    })
    //from old commit
    // users.update({userName: req.session.user.toUpperCase()}, { $push: { favSongs: objToInsert} });
  });
//   router.post("/visualize/liked" ,function(req,res,next){
//     // var albumObj = JSON.parse(result.raw_body);
// console.log("hello");
  // })
});

module.exports = router;
