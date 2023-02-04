//
// Copy dev lozza.js above here.
//

//{{{  lozza globals

fs    = lozza.uci.nodefs;
uci   = lozza.uci;
board = lozza.board;

//}}}
//{{{  functions

function u(x) {
  onmessage({data: x});
}

//}}}
//{{{  get the epds

var data  = fs.readFileSync('data/quiet-labeled.epd', 'utf8');
var lines = data.split('\n');
var epds  = [];

data = '';  //release.

var num = lines.length;

for (var i=0; i < num; i++) {

  if (i % 10000 == 0)
    process.stdout.write(i+'\r');

  var line = lines[i];

  line = line.replace(/(\r\n|\n|\r)/gm,'');
  line = line.replace(/;/g,'');
  line = line.replace(/=/g,' ');
  line = line.trim();

  if (!line)
    continue;

  var parts = line.split(' ');

  epds.push({board:  parts[0],
             turn:   parts[1],
             rights: parts[2],
             ep:     parts[3]});
}

lines = []; // release

console.log('positions =',epds.length);

//}}}

var nodesTotal = 0;
var nodesMean  = 0;
var num        = 1000;
var act        = 0;

for (var i=0; i < num; i++) {

  if (i == 242) continue;
  if (i == 470) continue;

  act++;

  var epd = epds[i];

  var fen = epd.board + ' ' + epd.turn + ' ' + epd.rights + ' ' + epd.ep + ' 0 1';

  console.log();
  console.log('id',i);
  console.log('fen',fen);

  u('ucinewgame');
  u('position fen ' + fen);
  u('id ' + i);
  u('go depth 12');

  console.log('nodes',lozza.stats.nodes);

  nodesTotal += lozza.stats.nodes;
}

nodesMean = nodesTotal / act;

console.log('mean nodes', nodesMean);

process.exit();

