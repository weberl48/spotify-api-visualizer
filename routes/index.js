var express = require('express');
var router = express.Router();
// var db = require('monk')(process.env.SPOTIFY_DB);
var db = require('monk')(process.env.MONGOLAB_URI || process.env.SPOTIFY_DB);
var users = db.get('users');
var bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
var validator = require('../lib/validation').validation;
var unirest = require('unirest');
var request = require('request'); // "Request" library
var querystring = require('querystring');

var client_id = '20c87cbdc43b49f6ab898166a0f77bbb'; // Your client id
var client_secret = client_secret; // Your client secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

String.prototype.capitalize = function() {
  return this.toLowerCase().replace(/\b\w/g, function(m) {
    return m.toUpperCase();
  });
};

router.get('/', function(req, res, next) {
  res.redirect('/visualize');
});

router.get('/visualize', function(req, res, next) {
  if (req.session.user) {
    var userCookie = req.session.user;
    var userId = req.session.userId;
    userCookie = userCookie.capitalize();
    users.findOne({
      _id: userId
    }).then(function(user) {
      res.render('show', {
        title: 'Spotifize',
        user: userCookie,
        userId: userId,
        userFavs: user.favSongs
      });
    });
  } else {
    res.render('show', {
      title: 'Spotifize'
    });
  }
});

router.get('/visualize', function(req, res) {
  // db.open();
  var userCookie = req.session.user;
  var userId = req.session.userId;
  console.log(userId);
  userCookie = userCookie.capitalize();
  users.findOne({
    _id: userId
  }).then(function(user) {
    // console.log(user);
    res.render('show', {
      user: userCookie,
      userId: userId
    });
  });
});

// router.get('/visualize/sign-up', function (req, res) {
//   res.render('sign-up');
// });

router.post('/visualize/sign-up', function(req, res) {
  var formData = req.body;
  // delete formData.passwordConfirm;
  console.log(formData);
  users.findOne({
    userName: formData.userName.toUpperCase()
  }).then(function(user) {
    if (user) {
      res.render('show', {
        errors: ['Username already exists']
      });
    } else {
      var errorArray = validator(formData.userName, formData.password, formData.passwordConfirm);
      if (errorArray.length > 0) {
        res.render('show', {
          errors: errorArray,
          userName: formData.userName
        });
      } else {
        bcrypt.hash(formData.password, 8, function(err, hash) {
          users.insert({
            userName: formData.userName.toUpperCase(),
            password: hash,
            favSongs: []
          });
          req.session.user = formData.userName;
          users.findOne({
            userName: formData.userName.toUpperCase()
          }).then(function(user) {
            req.session.userId = user._id
            res.redirect('/');
          });
        });
      }
    }
  });
});

router.post('/visualize/login', function(req, res, next) {
  // var formData = req.body;
  // users.findOne({userName: formData.userName.toUpperCase()}).then(function (user, record) {
  //   if (user) {
  //     if (bcrypt.compareSync(formData.password, user.password)) {
  //       req.session.user = formData.userName;
  //       req.session.userId = user._id;
  //       res.redirect('/');
  //     }
  //     else {
  //       res.render('show', {error: 'Incorrect Password'});
  //     }
  //   }
  //   else {
  //     res.render('show', {error: 'User Does Not Exist'});
  //   }
  // });

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

router.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log("###############");
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }

})

router.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

router.get('/visualize/logout', function(req, res) {
  req.session = null;
  res.redirect('/');
});

router.get('/visualize/liked/:currentAlbumId', function(req, res) {
  unirest.get('https://api.spotify.com/v1/albums/' + req.params.currentAlbumId)
    .end(function(result) {
      var albumObj = JSON.parse(result.raw_body);
      var objToInsert = {
        artistName: albumObj.artists[0].name,
        albumImg: albumObj.images[0].url,
        albumName: albumObj.name,
        previewUrl: albumObj.tracks.items[0].preview_url,
        songName: albumObj.tracks.items[0].name,
        albumId: req.params.currentAlbumId
      };
      users.update({
          userName: req.session.user.toUpperCase()
        }, {
          $push: {
            favSongs: objToInsert
          }
        })
        .then(function() {
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
