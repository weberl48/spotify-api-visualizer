var input = document.getElementById('search');
var searchButton = document.getElementById('search-button');
var resultSection = document.getElementsByClassName('results');
var colorMode = document.getElementsByClassName('color-mode');
var thumbsUp = document.getElementById('thumbs-up');
var pause = document.getElementById('pause');
var playButton = document.getElementById('play');
var audioPlayer = document.getElementById('player');
var loginButton = document.getElementById('show-login');
var signupButton = document.getElementById('show-signup');
var anchor = document.getElementById('anchor');
var loginBox = document.getElementById('hidden-login');
var signupBox = document.getElementById('hidden-signup');
var showLinks = document.getElementById('show-links');
var loginCancelButton = document.getElementById('login-cancel');
var signupCancelButton = document.getElementById('signup-cancel');
var songName = document.getElementById('song-name');
var artistInfo = document.getElementById('artist-info');
var usersSaved = document.getElementsByClassName('userSaved');
var normalMode = document.getElementById('normal');
var stealthMode = document.getElementById('stealth');
var crazebowMode = document.getElementById('crazebow');
var currentAlbumId;
var colorChoice;
var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;

normalMode.addEventListener('click', function () {
  stealthMode.src = 'images/incognito.png';
  crazebowMode.src = 'images/rainbow.png';
  normalMode.src = 'images/equalizer-selected.png';
  colorChoice = 'yoyoyo';
});
stealthMode.addEventListener('click', function () {
  normalMode.src = 'images/equalizer.png';
  crazebowMode.src = 'images/rainbow.png';
  stealthMode.src = 'images/incognito-selected.png';
  colorChoice = 'stealth';
});
crazebowMode.addEventListener('click', function () {
  normalMode.src = 'images/equalizer.png';
  stealthMode.src = 'images/incognito.png';
  crazebowMode.src = 'images/rainbow-selected.png';
  colorChoice = 'crazebow';
});

if (loginButton) {
  loginButton.addEventListener('click',function () {
    loginBox.style.display = 'inline-block';
    showLinks.style.display = 'none';
  });
}

if (signupButton) {
  signupButton.addEventListener('click',function () {
    signupBox.style.display = 'inline-block';
    showLinks.style.display = 'none';
  });
}

loginCancelButton.addEventListener('click', function () {
  loginBox.style.display = 'none';
  showLinks.style.display = 'inline-block';
});

signupCancelButton.addEventListener('click', function () {
  signupBox.style.display = 'none';
  showLinks.style.display = 'inline-block';
});

//trying to get the enter key to run the search
input.addEventListener('keypress', function (e) {
  var key= e.which || e.keyCode;
  if (key === 13) {
    console.log('yo y yo');
  }
});

input.addEventListener('click', function () {
  input.placeholder = '';
});


// function initMp3Player(audioObject) {
//     context = new AudioContext(); // AudioContext object instance
//     analyser = context.createAnalyser(); // AnalyserNode method
//     canvas = document.getElementById('analyser_render');
//     ctx = canvas.getContext('2d');
//     // Re-route audio playback into the processing graph of the AudioContext
//     source = context.createMediaElementSource(player);
//     source.connect(analyser);
//     analyser.connect(context.destination);
//
// function frameLooper() {
// WIDTH = canvas.width;
// HEIGHT = canvas.height;
//
//
// analyser.fftSize = 1024;
//   var bufferLength = analyser.frequencyBinCount;
//   var dataArray = new Uint8Array(bufferLength);
//
//   ctx.clearRect(0, 0, WIDTH, HEIGHT);
//
//   function draw() {
//     drawVisual = requestAnimationFrame(draw);
//
//     analyser.getByteFrequencyData(dataArray);
//     // console.log(dataArray);
//
//     ctx.fillStyle = 'rgb(0, 0, 0)';
//     ctx.fillRect(0, 0, WIDTH, HEIGHT);
//
//     var barWidth = (WIDTH / bufferLength) * 2.5;
//     var barHeight;
//     var x = 0;
//
//     for(var i = 0; i < bufferLength; i++) {
//       barHeight = dataArray[i];
//       // shades of green:
//       ctx.fillStyle = 'rgb(50,' + (barHeight+100) + ',50)';
//       //shades of grey:
//       // ctx.fillStyle = blackAndWhite();
//       //crazebow:
//       // ctx.fillStyle = randomColor();
//       ctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
//
//       x += barWidth + 1;
//     }
//   }
//
//   draw();
// }
//
//     frameLooper();
// }

// initMp3Player(player);

var canvas = document.getElementById('analyser_render');
var ctx = canvas.getContext('2d');


var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();
var gainNode = audioCtx.createGain();

var drawVisual; // requestAnimationFrame

var randomColor = function () {
	return 'rgb(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ')';
};

var blackAndWhite = function (barHeight) {
  // var randomValue = Math.round(Math.random() * 255);
	return 'rgb(' + (barHeight/2) + ', ' + (barHeight/2) + ', ' + (barHeight/2) + ')';
};

var greenColor = function (barHeight) {
  return 'rgb(50,' + (barHeight+100) + ',50)';
};



navigator.webkitGetUserMedia (
  {
    audio: true
  },
  // Success callback
  function(stream) {
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    gainNode.connect(audioCtx.destination); // connecting the different audio graph nodes together
    visualizeMic(stream);
  },
  // Error callback
  function(err) {
    console.log('The following gUM error occured: ' + err);
  }
);

function visualizeMic(stream) {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  analyser.fftSize = 1024;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;

      var x = 5;


      for(var i = 0; i < bufferLength; i++) {

        barHeight = dataArray[i];

        // shades of green:
        if (colorChoice === 'stealth') {
          ctx.fillStyle = blackAndWhite(barHeight);
        } else if (colorChoice === 'crazebow') {
          ctx.fillStyle = randomColor();
        } else {
          ctx.fillStyle = greenColor(barHeight);
        }
        ctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
        x += barWidth + 1;
      }
    }
    draw();
}

var fetchTracks = function (albumId, favPreview) {
      $.ajax({
          url: 'https://api.spotify.com/v1/albums/' + albumId,
          success: function (response) {
            artistInfo.style.display = 'inline-block';
            songName.innerHTML = response.artists[0].name + ' - ' + response.tracks.items[0].name;
            player.src = response.tracks.items[0].preview_url;
            player.play();
          }
      });
};

searchButton.addEventListener('click', function() {
    resultSection[0].style.display = 'inline-block';
    resultSection[0].innerHTML = '';
    colorMode[0].style.display = 'inline-block';
    // search for artist based off of user input and get artist spotify id for api call
    var searchXhr = new XMLHttpRequest();
    searchXhr.open('GET', 'http://ws.spotify.com/search/1/artist.json?q=' + input.value, false);
    searchXhr.send(null);
    var parsedObj = JSON.parse(searchXhr.responseText);
    var artistId = parsedObj.artists[0].href;
    var artistName = parsedObj.artists[0].name;
    var artistIdParam = artistId.split(':')[2];
    //api call with artists information
    var apiXhr = new XMLHttpRequest();
    apiXhr.open('GET', 'https://api.spotify.com/v1/artists/' + artistIdParam + '/albums?album_type=album', false);
    apiXhr.send(null);
    var parsedApiObj = JSON.parse(apiXhr.responseText);
    var coverArtArray = [];
    var albumId = [];
    for (var i = 0; i < parsedApiObj.items.length; i++) {
        coverArtArray.push(parsedApiObj.items[i].images[1].url);
        albumId.push(parsedApiObj.items[i].id);
    }
    for (var i = 0; i < coverArtArray.length; i++) {
        var img = document.createElement('img');
        img.className = 'album';
        resultSection[0].appendChild(img);
        img.src = coverArtArray[i];
    }
    window.location = '#search-button';
    if (thumbsUp) {
      thumbsUp.addEventListener('click', function () {
        var albumXhr = new XMLHttpRequest();
        albumXhr.open('GET', '/visualize/liked/' + currentAlbumId, false);
        albumXhr.send(null);
        thumbsUp.classList.toggle("liked");
        thumbsUp.src = 'images/thumbs-up-green.png';
        var parsedFavObj = JSON.parse(albumXhr.responseText);
        var img = document.createElement("img")
        img.className = "dash-album"
        img.src = parsedFavObj.albumImg;
        usersSaved[0].appendChild(img)
        usersSaved[0].reverse();
      });
    }
    if (pause) {
      pause.addEventListener('click', function () {
        player.pause();
        pause.style.display = 'none';
        playButton.style.display = 'inline-block';
      })
    }
    if (playButton) {
      playButton.addEventListener('click', function () {
        playButton.style.display = 'none';
        pause.style.display = 'inline-block';
        player.play();
      });
    }

    var albumImages = document.getElementsByClassName('album');
    var albums = [];
    [].forEach.call(albumImages, function (album) {
      albums.push(album);
    });

    for (var i = 0; i < albums.length; i++) {
        albums[i].addEventListener('click', function() {
          currentAlbumId = albumId[albums.indexOf(this)];
          fetchTracks(currentAlbumId);
          thumbsUp.src='images/thumbs-up.png';
          playButton.style.display = 'none';
          pause.style.display = 'inline-block';
				});
			}
});

for (var i = 0; i < usersSaved[0].childNodes.length; i++) {
    usersSaved[0].childNodes[i].addEventListener('click', function() {
      console.log(usersSaved[0].childNodes[i]);
      fetchTracks(this.alt);
      playButton.style.display = 'none';
      pause.style.display = 'inline-block';
    });
  }
