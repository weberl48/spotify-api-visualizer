
var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

var drawVisual; // requestAnimationFrame

var randomColor = function () {
	return 'rgb(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ')';
};

var blackAndWhite = function () {
  var randomValue = Math.round(Math.random() * 255);
	return 'rgb(' + randomValue + ', ' + randomValue + ', ' + randomValue + ')';
};


// navigator.webkitGetUserMedia (
//   {
//     audio: true
//   },
//
//   // Success callback
//   function(stream) {
//     var AudioContext = window.AudioContext || window.webkitAudioContext;
//     var audioCtx = new AudioContext();
//     var analyser = audioCtx.createAnalyser();
//     var gainNode = audioCtx.createGain();
//     source = audioCtx.createMediaStreamSource(stream);
//     source.connect(analyser);
//     gainNode.connect(audioCtx.destination); // connecting the different audio graph nodes together
//     visualizeMic(stream);
//
//   },
//
//   // Error callback
//   function(err) {
//     console.log('The following gUM error occured: ' + err);
//   }
// );
//
// function visualizeMic(stream) {
//   WIDTH = canvas.width;
//   HEIGHT = canvas.height;
//
//
//   analyser.fftSize = 1024;
//     var bufferLength = analyser.frequencyBinCount;
//     console.log(bufferLength);
//     var dataArray = new Uint8Array(bufferLength);
//
//     ctx.clearRect(0, 0, WIDTH, HEIGHT);
//
//     function draw() {
//       drawVisual = requestAnimationFrame(draw);
//
//       analyser.getByteFrequencyData(dataArray);
//       console.log(dataArray);
//
//       ctx.fillStyle = 'rgb(0, 0, 0)';
//       ctx.fillRect(0, 0, WIDTH, HEIGHT);
//
//       var barWidth = (WIDTH / bufferLength) * 2.5;
//       var barHeight;
//       var x = 0;
//
//       for(var i = 0; i < bufferLength; i++) {
//         barHeight = dataArray[i];
//         // shades of green:
//         // ctx.fillStyle = 'rgb(50,' + (barHeight+100) + ',50)';
//         //shades of grey:
//         // ctx.fillStyle = blackAndWhite();
//         //crazebow:
//         ctx.fillStyle = randomColor();
//         ctx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
//
//         x += barWidth + 1;
//       }
//     }
//
//     draw();
// }


  function bufferSound() {
    // var audio = new Audio();
    var audio = document.getElementById('player');
    audio.src = '../sample.mp3';
    var context = new webkitAudioContext();
    var analyser = context.createAnalyser();
    var source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);

    function visualizeSong() {
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

    visualizeSong();
  }

bufferSound();
