//
//  Generate FENs for training via filter.js and trainer.js.
//

const fs = require('fs');

SILENT = 1;

const nodesLimit  = 10000;
const gamesLimit  = 100000;

const fileName = 'data/datagen' + Math.trunc(Math.random()*100000000) + '.fen';

let result = '';
let o = '';

fs.writeFileSync(fileName,o);

for (let g=0; g < gamesLimit; g++) {
  //{{{  log
  
  if ((g % 100) == 0)
    console.log(fileName,g);
  
  //}}}
  //{{{  play game
  
  let randLimit   = 10;
  let reportLimit = 16;
  
  if (Math.random() >= 0.5) {
    randLimit--;
    reportLimit--;
  }
  
  docmd('u');
  docmd('p s');
  
  let moves = '';
  let hmc = 0;
  let ply = 0;
  let fens = [];
  let attribs = [];
  
  while (true) {
  
    ply++;
  
    const turn     = lozza.board.turn;
    const nextTurn = colourToggle(turn);
  
    //{{{  get a move
    
    if (ply <= randLimit)
      RANDOMEVAL = 1;
    else
      RANDOMEVAL = 0;
    
    docmd('go nodes ' + nodesLimit);
    
    if (ply <= randLimit)
      docmd('u');
    
    if (lozza.stats.bestMove == 0) {
      result = '0.5';
      break;
    }
    
    //}}}
  
    const move    = lozza.stats.bestMove;
    const frObj   = (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
    const frPiece = frObj & PIECE_MASK;
    const moveStr = lozza.board.formatMove(move,UCI_FMT);
    const inCheck = lozza.board.isKingAttacked(nextTurn);
    const noisy   = moveIsNoisy(move);
    const fen     = lozza.board.fen(lozza.board.turn);
    const score   = (turn == BLACK ? -lozza.stats.bestScore : lozza.stats.bestScore);
    const attrib  = '' + score + (inCheck ? ' c' : ' -') + (noisy ? ' n' : ' -');
  
    if (ply > reportLimit) {
      fens.push(fen);
      attribs.push(attrib);
    }
  
    //{{{  end of game?
    
    let rep = 0;
    for (let i=0; i < fens.length; i++) {
      if (fen == fens[i])
        rep++;
    }
    
    if (rep > 2) {
      result = '0.5';
      break;
    }
    
    if (score >= MINMATE) {
      result = '1.0';
      break;
    }
    else if (score <= -MINMATE) {
      result = '0.0';
      break;
    }
    
    if (!noisy && (frPiece != PAWN))
      hmc++;
    else
      hmc = 0;
    
    if (hmc > 60) {
      result = '0.5';
      break;
    }
    
    
    
    //}}}
  
    moves += ' ' + moveStr;
  
    docmd('position fen ' + 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' + ' moves ' + moves)
  }
  
  //}}}
  //{{{  save it
  
  for (let i=0; i < fens.length; i++) {
    //console.log(fens[i],attribs[i],result);
    o += fens[i] + ' ' + attribs[i] + ' ' + result + '\r\n';
    if (o.length > 100000) {
      fs.appendFileSync(fileName,o);
      o = '';
    }
  }
  
  //}}}
}

if (o.length) {
  fs.appendFileSync(fileName,o);
}

console.log('done');

process.exit();

