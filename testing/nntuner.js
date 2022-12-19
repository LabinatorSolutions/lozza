
//{{{  fold clue

//}}}

const SAMPLES = 725000;
const LR      = 0.001;
const ILAYER  = 768;

var csvFile = 'data/quiet-labeled0r.csv';

var pos     = 0;
var samples = new Array(SAMPLES);
var evals   = new Int16Array(SAMPLES);
var x       = null;
var epoch   = 1;

const fs       = require('fs');
const readline = require('readline');

//{{{  funcs

var wMat = Array(ILAYER);

//{{{  init

function init (w) {

  for (var i=0; i < w.length; i++)
    w[i] = (Math.random()-0.5) * 2;
}

//}}}
//{{{  forward

function forward (w,x) {

  var sum = 0;

  for (var i=0; i < w.length; i++)
    sum += w[i] * x[i];

  return sum;
}

//}}}
//{{{  backward

function backward (w,x,e) {

  for (var i=0; i < w.length; i++)
    w[i] -= x[i] * e * LR;
}

//}}}
//{{{  tuner

function tuner() {

  init(wMat);

  while (epoch) {

    for (var s=0; s<SAMPLES; s++) {
      var x = samples[s];
      var y = evals[s];
      var o = forward(wMat,x);
      backward(wMat,x,o-y);
    }

    if (epoch % 10 == 0) {
      var los = loss();
      console.log(epoch,los);
      if (epoch > 0) {
        for (var i=0; i < 0; i++) {
          var s = (Math.random() * SAMPLES) | 0;
          console.log(epoch,s,eval[s],forward(inp[s]));
        }
      }
    }
    else
      process.stdout.write(epoch+'\r');

    epoch += 1;
  }
}

//}}}
//{{{  loss

function loss () {

  var los = 0;

  for (var s=0; s<SAMPLES; s++) {
    var x = samples[s];
    var y = evals[s];
    var o = forward(wMat,x);
    var e = o - y;
    los += e * e;
  }

  return los / SAMPLES;
}

//}}}

//}}}

const rl = readline.createInterface({
    input: fs.createReadStream(csvFile),
    output: process.stdout,
    crlfDelay: Infinity,
    terminal: false
});

rl.on('line', function (line) {

  if (pos % 100000 == 0)
    process.stdout.write(pos+'\r');

  line = line.replace(/(\r\n|\n|\r)/gm,'');

  const parts = line.split(',');

  if (!parts.length)
    return;

  if (parts.length != ILAYER+1)
    console.log('line format?',line);

  x = new Uint8Array(ILAYER);
  for (var i=0; i<ILAYER; i++) {
    x[i] = parseInt(parts[i+1]);
    if (x[i] != 1 && x[i] != 0)
      console.log('decoded format?',pos,i,x[i]);
  }
  samples[pos] = x;
  evals[pos]   = parseInt(parts[0]);

  pos += 1;
});

rl.on('close', function(){
  console.log('samples =',SAMPLES,pos,evals.length,samples.length);
  tuner();
});

