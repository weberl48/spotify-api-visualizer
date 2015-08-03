var input = document.getElementById('search');
var searchButton = document.getElementById('search-button');
var resultSection = document.getElementsByClassName('results');
var thumbsUp = document.getElementById('thumbs-up');
var audioPlayer = document.getElementById('player');
var currentAlbumId;
var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;

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

var blackAndWhite = function () {
  var randomValue = Math.round(Math.random() * 255);
	return 'rgb(' + randomValue + ', ' + randomValue + ', ' + randomValue + ')';
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
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);
      console.log(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        // shades of green:
        ctx.fillStyle = 'rgb(50,' + (barHeight+100) + ',50)';
        //shades of grey:
        // ctx.fillStyle = blackAndWhite();
        //crazebow:
        // ctx.fillStyle = randomColor();
        ctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    }

    draw();
}



searchButton.addEventListener('click', function() {
    resultSection[0].innerHTML = '';
    // search for artist based off of user input and get artist spotify id for api call
    var searchXhr = new XMLHttpRequest();
    searchXhr.open('GET', 'http://ws.spotify.com/search/1/artist.json?q=' + input.value, false);
    searchXhr.send(null);
    var parsedObj = JSON.parse(searchXhr.responseText);
    var artistId = parsedObj.artists[0].href;
    var artistName = parsedObj.artists[0].name;
    // console.log(parsedObj);
    // console.log(artistId);
    // console.log(artistName);
    var artistIdParam = artistId.split(':')[2];
    //api call with artists information
    var apiXhr = new XMLHttpRequest();
    apiXhr.open('GET', 'https://api.spotify.com/v1/artists/' + artistIdParam + '/albums?album_type=album', false);
    apiXhr.send(null);
    var parsedApiObj = JSON.parse(apiXhr.responseText);
    // console.log(parsedApiObj);
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

    thumbsUp.addEventListener('click', function () {
      var albumXhr = new XMLHttpRequest();
      albumXhr.open('GET', '/visualize/liked/' + currentAlbumId, true);
      albumXhr.send(null);
      console.log(albumXhr.responseText);
      // thumbsUp.classList.toggle("liked");
      thumbsUp.className = 'liked';
    });

    var fetchTracks = function (albumId) {
        $.ajax({
            url: 'https://api.spotify.com/v1/albums/' + albumId,
            success: function (response) {
              // player.src = 'http://www.stephaniequinn.com/Music/Canon.mp3';
              player.src = response.tracks.items[0].preview_url;
              player.play();
              console.log(response);
              console.log(player.src);
              // initMp3Player(player);
            }
        });
    };

    //click listener for albums
    //this section is borken needs to be fixed!!!!!!!!!!!!!!!
    var albumImages = document.getElementsByClassName('album');
    var albums = [];
    [].forEach.call(albumImages, function (album) {
      albums.push(album);
    });
    for (var i = 0; i < albums.length; i++) {
        albums[i].addEventListener('click', function() {
          currentAlbumId = albumId[albums.indexOf(this)];
          fetchTracks(currentAlbumId);
            // var url = album.tracks.items[0].preview_url + '/jsonp?callback=?';
            // $.getJSON(url, function(jsonp){
            //   $("#jsonp-response").html(JSON.stringify(jsonp, null, 2));
            // });

                // audioObject = new Audio(url);
                // audioObject = new Audio(album.tracks.items[0].preview_url);
                // audioObject.play();

                // initMp3Player(player);
                // target.classList.add(playingCssClass);
                // audioObject.addEventListener('ended', function () {
                //     target.classList.remove(playingCssClass);
                // });
                // audioObject.addEventListener('pause', function () {
                //     target.classList.remove(playingCssClass);
                // });

        });
    }





    var getRandomColor = function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        return color;
    };


      bar_x += bar_width + 1;
    });


  var getRandomColor =function () {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  // console.log(color);
  return color;
};
