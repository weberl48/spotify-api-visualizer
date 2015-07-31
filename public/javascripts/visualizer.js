var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var drawVisual; // requestAnimationFrame

var analyser = audioCtx.createAnalyser();
var gainNode = audioCtx.createGain();


navigator.webkitGetUserMedia (
  {
    audio: true
  },

  // Success callback
  function(stream) {
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    gainNode.connect(audioCtx.destination); // connecting the different audio graph nodes together
    visualize(stream);

  },

  // Error callback
  function(err) {
    console.log('The following gUM error occured: ' + err);
  }
);

function visualize(stream) {
  WIDTH = canvas.width;
  HEIGHT = canvas.height;


  analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        ctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    }

    draw();
}
