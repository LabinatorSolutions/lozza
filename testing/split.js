
if (process.argv[2])
  var epdfile = process.argv[2];
else
  var epdfile = 'eth';

var split   = 1000000;
var o       = '';
var seq     = 0;         // change if needed

var thisPosition = 0;

const fs       = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('data/'+epdfile+'.epd'),
    output: process.stdout,
    crlfDelay: Infinity,
    terminal: false
});

rl.on('line', function (line) {

  thisPosition += 1;

  if (thisPosition % split == 0) {
    fs.writeFileSync('data/'+outfile+seq+'.epd',o);
    console.log('data/'+epdfile+seq+'.epd');
    o = '';
    seq++;
  }

  o += line+'\r\n';
});

rl.on('close', function(){
  if (o) {
    fs.writeFileSync('data/'+outfile+seq+'.epd',o);
    console.log('data/'+epdfile+seq+'.epd');
  }
});

