var AudioContext = window.AudioContext || window.webkitAudioContext; // an audio-processing graph built from audio modules linked together
var audioCtx = new AudioContext(); // an audio-processing graph built from audio modules linked together
var audio = document.getElementById('myAudio');
console.log(audio);
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var drawVisual; // requestAnimationFrame
var analyser = audioCtx.createAnalyser();
  // creates an AnalyserNode, which can be used to expose audio time and -
  // - frequency data and create data visualisations.
var gainNode = audioCtx.createGain();
  // creates a GainNode, which can be used to control the overall volume of the audio graph.

//access mic
// navigator.webkitGetUserMedia (
//   {
//     audio: audio
//   },

  // Success callback
  function getAudio(audio) {
    //used to create a new MediaStreamAudioSourceNode object, given a media stream
    // source = audioCtx.createMediaStreamSource(stream); //convert into useable object
    source = audioCtx.createMediaStreamSource(audio);
    //connect the analyser
    // and the gainNode to the destination, so we can play the
    // music and adjust the volume using the mouse cursor
    source.connect(analyser);
    gainNode.connect(audioCtx.destination); // connecting the different audio graph nodes together
    visualize(audio); //

  }

//   // Error callback
//   function(err) {
//     console.log('The following gUM error occured: ' + err);
//   }
// );

function visualize(audio) {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;

//(Fast Fourier Transform) to be used to determine the frequency domain.
  analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount; //unsigned long value half that of the FFT size :128
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);
    console.log(dataArray);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
}


    function draw() {
      drawVisual = requestAnimationFrame(draw); //tells the browser that you wish to perform an animation
      analyser.getByteFrequencyData(dataArray);//method of the Analyser copies the current frequency data into a Uint8Array (unsigned byte array) passed into it.
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5; // stretches accros length of canvas
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        // ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)'; //different shades of red
        ctx.fillStyle = getRandomColor();
        ctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2); // height verticle positioning

        x += barWidth + 20; //space inbetween bars
      }
    }
    getAudio(audio);
    draw();
}
