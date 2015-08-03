var input = document.getElementById('search');
var searchButton = document.getElementById('search-button');
var resultSection = document.getElementsByClassName('results');
var thumbsUp = document.getElementById('thumbs-up');
var audioPlayer = document.getElementById('player');
var currentAlbumId;
var canvas, ctx, source, context, analyser, fbc_array, bars, bar_x, bar_width, bar_height;
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
            var trackXhr = new XMLHttpRequest();
            // trackXhr.open('GET', 'https://api.spotify.com/v1/albums/' + albumId[i], false);
            trackXhr.open('GET', 'https://api.spotify.com/v1/tracks/3SWZ9fHtWMxwkFok5qhhpO', false);
            // trackXhr.setRequestHeader('Access-Control-Allow-Origin','https://api.spotify.com');
            trackXhr.send(null);
            var parsedTrackObj = JSON.parse(trackXhr.responseText);
            // var audio = new Audio();
            // audio.controls = true;
            // audio.loop = true;
            // audio.autoplay = false;
            // audio.crossorigin="anonymous";
            player.src = parsedTrackObj.preview_url;
            initMp3Player(player);
        });
    }
    thumbsUp.addEventListener('click', function () {
      var albumXhr = new XMLHttpRequest();
      albumXhr.open('GET', '/visualize/liked/' + currentAlbumId, true);
      albumXhr.send(null);
      // console.log(albumXhr.responseText)
      thumbsUp.classList.toggle("liked");
    });


    function initMp3Player() {
        // console.log('*************');
        // document.getElementById('audio_box').appendChild(audio);
        context = new webkitAudioContext(); // AudioContext object instance
        analyser = context.createAnalyser(); // AnalyserNode method
        canvas = document.getElementById('analyser_render');
        ctx = canvas.getContext('2d');
        // Re-route audio playback into the processing graph of the AudioContext
        source = context.createMediaElementSource(player);
        source.connect(analyser);
        analyser.connect(context.destination);
        frameLooper();
    }

    function frameLooper() {
        // console.log("****************");
        window.requestAnimationFrame(frameLooper);
        fbc_array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(fbc_array);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        ctx.fillStyle = getRandomColor() // Color of the bars '#00CCFF';
        bars = 100;
        for (var i = 0; i < bars; i++) {
            bar_x = i * 3;
            bar_width = 2;
            // bar_height = -(fbc_array[i] / 2);
            //  fillRect( x, y, width, height ) // Explanation of the parameters below
            // ctx.fillRect(bar_x, canvas.height, bar_width, bar_height);
            for (var i = 0; i < analyser.frequencyBinCount; i++) {
                bar_height = fbc_array[i];
                // ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)'; //different shades of red
                ctx.fillStyle = getRandomColor();
                ctx.fillRect(bar_x, canvas.height - bar_height / 2, bar_width, bar_height / 2);

                bar_x += bar_width + 1;
            }
        }
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
    })


  var getRandomColor =function () {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  // console.log(color);
  return color;
};
