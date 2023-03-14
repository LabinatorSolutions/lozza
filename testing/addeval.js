
const epdin  = 'data/pedantic.epd';
const epdout = 'data/pedantic-sf.epd';

const firstLine = 1;
const epdStart  = 3;

const { spawn } = require("child_process");

var fs      = require('fs');
var next    = -1;
var child   = 0;
var out     = '';

//{{{  functions

function getEval(s) {

  var r = s.match(/Final evaluation(.*)\(white/);

  if (r.length != 2) {
    console.log('cannot get eval from',s);
    process.exit();
  }

  var e1 = r[1].trim();
  var e2 = parseFloat(e1);
  var e3 = Math.round(e2 * 100) | 0;

  return e3;
}

function kick () {

  next++;
  if (next >= epds.length)
    process.exit();

  var epd = epds[next];
  var fen = epd.board + ' ' + epd.turn + ' ' + epd.rights + ' ' + epd.ep;

  child.stdin.write('position fen ' + fen + '\r\n');
  child.stdin.write('eval\r\n');
}

//}}}

fs.writeFileSync(epdout, '');

process.stdin.setEncoding('utf8');

//{{{  get the epds

var data  = fs.readFileSync(epdin, 'utf8');
var lines = data.split('\n');
var epds  = [];

data = '';  //release.

for (var i=firstLine; i < lines.length; i++) {

  var line = lines[i];

  line = line.replace(/(\,)/gm,' ');
  line = line.replace(/(\r\n|\n|\r)/gm,'');
  line = line.trim();

  if (!line)
    continue;

  var parts = line.split(' ');

  if (parts.length < 4)
    continue;

  //console.log(line);

  epds.push({board:   parts[epdStart+0],
             turn:    parts[epdStart+0],
             rights:  parts[epdStart+0],
             ep:      parts[epdStart+0]});
}

lines = ''; // release

//}}}

console.log('positions =', epds.length);

child = spawn('c:\\projects\\lozza\\trunk\\testing\\engines\\sf.exe');

child.stdout.on('data', function (data) {
  var sfdata = data.toString();
  if (!sfdata.includes("Final evaluation ")) {
    if (sfdata.includes("in check")) {
      kick();
    }
  }
  else {
    var epd  = epds[next];
    var fen  = epd.board + ' ' + epd.turn + ' ' + epd.rights + ' ' + epd.ep;
    var eval = getEval(sfdata);
    out = out + fen + ' ' + eval + '\r\n';
    if (out.length > 1000000 || next == epds.length-1) {
      fs.appendFileSync(epdout,out);
      out = '';
    }
    kick();
  }
});

kick();

