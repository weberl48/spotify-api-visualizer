var input = document.getElementById('search');
var searchButton = document.getElementById('search-button');
var resultSection = document.getElementsByClassName('results');
var thumbsUp = document.getElementById('thumbs-up');
var currentAlbumId;
searchButton.addEventListener('click', function () {
  console.log(thumbsUp);
  resultSection[0].innerHTML = '';
  // search for artist based off of user input and get artist spotify id for api call
  var searchXhr = new XMLHttpRequest();
  searchXhr.open('GET', 'http://ws.spotify.com/search/1/artist.json?q=' + input.value, false);
  searchXhr.send(null);
  var parsedObj = JSON.parse(searchXhr.responseText);
  var artistId = parsedObj.artists[0].href;
  var artistName = parsedObj.artists[0].name;
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
    albums[i].addEventListener('click', function () {
      currentAlbumId = albumIds[albums.indexOf(this)];
      var trackXhr = new XMLHttpRequest();
      trackXhr.open('GET', 'https://api.spotify.com/v1/albums/' + currentAlbumId, false);
      trackXhr.send(null);
      var parsedTrackObj = JSON.parse(trackXhr.responseText);
      console.log(parsedTrackObj);
    });
  }
  thumbsUp.addEventListener('click', function () {
    alert('yo');
    thumbsUp.classList.toggle("liked");
  });
});



// GET https://api.spotify.com/v1/artists/{id}/albums

// var xhr = new XMLHttpRequest();
// xhr.open('GET', '/filter/' + className , false);
// xhr.send(null);
// var parsedObj = JSON.parse(xhr.responseText);
// var parsedObj = parsedObj.body;
