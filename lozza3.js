
//{{{  constants

const MAX_PLY   = 100;
const MAX_MOVES = 260;

const WHITE = 0;
const BLACK = 8;

const PAWN   = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK   = 4;
const QUEEN  = 5;
const KING   = 6;

const WHITE_OFFSETS = {
  pawn1: 16,
  pawn2: 32,
  pawn3: 15,
  pawn4: 17,
  orth1: 16,
  orth2: -16,
  orth3: 1,
  orth4: -1,
  diag1: 15,
  diag2: 17,
  diag3: -15,
  diag4: -17,
  hop1:  31,
  hop2:  33,
  hop3:  14,
  hop4:  18,
  hop5:  -31,
  hop6:  -33,
  hop7:  -14,
  hop8:  -18
};

const BLACK_OFFSETS = {
  pawn1: -16,
  pawn2: -32,
  pawn3: -15,
  pawn4: -17,
  orth1: -16,
  orth2: 16,
  orth3: -1,
  orth4: 1,
  diag1: -15,
  diag2: -17,
  diag3: 15,
  diag4: 17,
  hop1:  -31,
  hop2:  -33,
  hop3:  -14,
  hop4:  -18,
  hop5:  31,
  hop6:  33,
  hop7:  14,
  hop8:  18
};

const SQUARE = {
  a8: 0x70, b8: 0x71, c8: 0x72, d8: 0x73, e8: 0x74, f8: 0x75, g8: 0x76, h8: 0x77,
  a7: 0x60, b7: 0x61, c7: 0x62, d7: 0x63, e7: 0x64, f7: 0x65, g7: 0x66, h7: 0x67,
  a6: 0x50, b6: 0x51, c6: 0x52, d6: 0x53, e6: 0x54, f6: 0x55, g6: 0x56, h6: 0x57,
  a5: 0x40, b5: 0x41, c5: 0x42, d5: 0x43, e5: 0x44, f5: 0x45, g5: 0x46, h5: 0x47,
  a4: 0x30, b4: 0x31, c4: 0x32, d4: 0x33, e4: 0x34, f4: 0x35, g4: 0x36, h4: 0x37,
  a3: 0x20, b3: 0x21, c3: 0x22, d3: 0x23, e3: 0x24, f3: 0x25, g3: 0x26, h3: 0x27,
  a2: 0x10, b2: 0x11, c2: 0x12, d2: 0x13, e2: 0x14, f2: 0x15, g2: 0x16, h2: 0x17,
  a1: 0x00, b1: 0x01, c1: 0x02, d1: 0x03, e1: 0x04, f1: 0x05, g1: 0x06, h1: 0x07
}


//}}}
//{{{  utils

function assert(a,b,s) {
  if (a != b)
    console.log(a,b,'*******',s);
}

//}}}
//{{{  global classes

//{{{  wStruct

function wStruct () {

  this.pieces    = Array(16);
  this.maxPieces = 16;
  this.numPieces = 16;

  this.kRights = false;
  this.wRights = false;

  this.offsets = WHITE_OFFSETS;
}

//}}}
//{{{  bStruct

function bStruct () {

  this.pieces    = Array(16);
  this.maxPieces = 16;
  this.numPieces = 16;

  this.kRights = false;
  this.wRights = false;

  this.offsets = BLACK_OFFSETS;
}

//}}}
//{{{  gStruct

function gStruct () {

  this.board = Array(128).fill(0);
  this.turn  = WHITE;
  this.ep    = 0;

  this.w = new wStruct();
  this.b = new bStruct();

  this.wb = [this.w, this.b];

  this.moves         = Array(MAX_PLY * MAX_MOVES);
  this.nextMoveIndex = 0;

}

//}}}

//}}}
//{{{  colour funcs

function colourToggle (colour) {
  return colour & 8;                     // WHITE (0) or BLACK (8)
}

function colourIndex (colour) {
  return colour >>> 3                    // 0 or 1
}

function colourMultiplier (colour) {
  return (-colour >> 31) | 1;            // 1 or -1.
}

//}}}
//{{{  piece funcs

function pieceFlavour(p) {
  return p & 7;
}

function pieceColour(p) {
  return p & 8;
}

function pieceChar(p) {
  const ch = ['.','P','N','B','R','Q','K','X','X','p','n','b','r','q','k'];
  return ch[p];
}

//}}}
//{{{  board funcs

//{{{  sq88

function sq88(r, f) {
  return 16 * r + f;
}

//}}}
//{{{  offboard

function offboard (sq) {
  return sq & 0x88;
}

//}}}
//{{{  printBoard

function printBoard() {

  //{{{  board
  
  for (let r=7; r>=0; r--) {
    process.stdout.write((r+1) + ' ');
    for (let f=0; f<8; f++) {
      const sq = sq88(r,f);
      process.stdout.write(pieceChar(g.board[sq]) + ' ');
    }
    process.stdout.write('\r\n');
  }
  
  console.log('  a b c d e f g h');
  
  //}}}
  //{{{  turn
  
  if (g.turn == WHITE)
    process.stdout.write('w ');
  
  else
    process.stdout.write('b ');
  
  //}}}
  //{{{  rights
  
  let someRights = false;
  
  if (g.w.kRights) {
    process.stdout.write('K');
    someRights = true;
  }
  
  if (g.w.qRights) {
    process.stdout.write('Q');
    someRights = true;
  }
  
  if (g.b.kRights) {
    process.stdout.write('k');
    someRights = true;
  }
  
  if (g.b.qRights) {
    process.stdout.write('q');
    someRights = true;
  }
  
  if (!someRights)
    process.stdout.write('- ');
  
  
  //}}}
  //{{{  ep
  
  process.stdout.write(' -');
  
  process.stdout.write('\r\n');
  
  //}}}
  //{{{  piece lists
  
  console.log(g.w.numPieces, g.b.numPieces);
  
  for (let i=0; i<16; i++)
    process.stdout.write(g.w.pieces[i].toString(16).padStart(2,'0') + ' ');
  
  process.stdout.write('\r\n');
  
  for (let i=0; i<16; i++)
    process.stdout.write(g.b.pieces[i].toString(16).padStart(2,'0') + ' ');
  
  process.stdout.write('\r\n');
  
  //}}}
}

//}}}
//{{{  setBoardFromFENParts

function setBoardFromFENParts(board,turn,rights,ep) {

  let nw = 0;
  let nb = 0;

  //{{{  board
  
  g.board.fill(0);
  
  let rank = 7;
  let file = 0;
  
  for (let i=0; i < board.length; i++) {
  
    const ch = board.charAt(i);
  
    switch (ch) {
      //{{{  1-8
      
      case '1':
        file += 1;
        break;
      
      case '2':
        file += 2;
        break;
      
      case '3':
        file += 3;
        break;
      
      case '4':
        file += 4;
        break;
      
      case '5':
        file += 5;
        break;
      
      case '6':
        file += 6;
        break;
      
      case '7':
        file += 7;
        break;
      
      case '8':
        file += 8;
        break;
      
      //}}}
      //{{{  /
      
      case '/':
        rank--;
        file = 0;
        break;
      
      //}}}
      //{{{  white
      
      case 'P':
        g.board[sq88(rank,file)] = WHITE|PAWN;
        file++;
        nw++;
        break;
      
      case 'N':
        g.board[sq88(rank,file)] = WHITE|KNIGHT;
        file++;
        nw++;
        break;
      
      case 'B':
        g.board[sq88(rank,file)] = WHITE|BISHOP;
        file++;
        nw++;
        break;
      
      case 'R':
        g.board[sq88(rank,file)] = WHITE|ROOK;
        file++;
        nw++;
        break;
      
      case 'Q':
        g.board[sq88(rank,file)] = WHITE|QUEEN;
        file++;
        nw++;
        break;
      
      case 'K':
        g.board[sq88(rank,file)] = WHITE|KING;
        nw++;
        file++;
        break;
      
      //}}}
      //{{{  black
      
      case 'p':
        g.board[sq88(rank,file)] = BLACK|PAWN;
        file++;
        nb++;
        break;
      
      case 'n':
        g.board[sq88(rank,file)] = BLACK|KNIGHT;
        file++;
        nb++;
        break;
      
      case 'b':
        g.board[sq88(rank,file)] = BLACK|BISHOP;
        file++;
        nb++;
        break;
      
      case 'r':
        g.board[sq88(rank,file)] = BLACK|ROOK;
        file++;
        nb++;
        break;
      
      case 'q':
        g.board[sq88(rank,file)] = BLACK|QUEEN;
        file++;
        nb++;
        break;
      
      case 'k':
        g.board[sq88(rank,file)] = BLACK|KING;
        file++;
        nb++;
        break;
      
      //}}}
    }
  }
  
  //}}}
  //{{{  turn
  
  g.turn = WHITE;
  
  if (turn == 'b')
    g.turn = BLACK;
  
  //}}}
  //{{{  rights
  
  g.w.kRights = false;
  g.w.qRights = false;
  
  g.b.kRights = false;
  g.b.qRights = false;
  
  for (let i=0; i < rights.length; i++) {
  
    const ch = rights.charAt(i);
  
    switch (ch) {
  
      case 'K':
        g.w.kRights = true;
        break;
  
      case 'Q':
        g.w.qRights = true;
        break;
  
      case 'k':
        g.b.kRights = true;
        break;
  
      case 'q':
        g.b.qRights = true;
        break;
    }
  }
  
  //}}}
  //{{{  ep
  
  g.ep = 0;
  
  //}}}
  //{{{  piece lists
  
  g.w.maxPieces = nw;
  g.b.maxPieces = nb;
  
  let wNext = 1;
  let bNext = 1;
  
  for (let r=0; r < 8; r++) {
    for (let f=0; f < 8; f++) {
  
      const sq = sq88(r,f);
  
      const piece   = g.board[sq]
      const colour  = pieceColour(piece);
      const flavour = pieceFlavour(piece);
  
      if (piece) {
        if (colour == WHITE) {
          if (flavour == KING)
            g.w.pieces[0] = sq;
          else
            g.w.pieces[wNext++] = sq;
        }
  
        else {
          if (flavour == KING)
            g.b.pieces[0] = sq;
          else
            g.b.pieces[bNext++] = sq;
        }
      }
    }
  }
  
  //}}}
}

//}}}

//}}}
//{{{  move funcs

//{{{  move primitives

function addMove(move) {
  g.moves[g.nextMoveIndex++] = move;
}

function assembleMove(fromSq, toSq, fromPiece, toPiece, flags) {
  return fromSq          |
         toSq      << 8  |
         fromPiece << 16 |
         toPiece   << 20 |
         flags;
}

function getMoveFromSq(move) {
  return move & 0xFF;
}

function getMoveToSq(move) {
  return (move >> 8) & 0xFF;
}

function getMoveFromPiece(move) {
  return (move >> 16) & 0x0F;
}

function getMoveToPiece(move) {
  return (move >> 20) & 0x0F;
}

//}}}

//{{{  generateMoves

function generateMoves() {

  const wb         = g.wb[colourIndex(g.turn)];
  const startIndex = g.nextMoveIndex;

  let numPieces    = wb.numPieces;
  let index        = 0

  generateKingMoves(wb.pieces[index]);

  numPieces--;
  index++;

  while (numPieces) {
    const sq = wb.pieces[index];
    if (sq < 0) {
      index++;
      continue;
    }
    const piece = g.board[sq];
    switch (pieceFlavour(piece)) {
      case PAWN:
        generatePawnMoves(sq)
        break;
      case KNIGHT:
        generateKnightMoves(sq)
        break;
      case BISHOP:
        generateBishopMoves(sq)
        break;
      case ROOK:
        break;
      case QUEEN:
        break;
    }
    numPieces--;
    index++;
  }

  return(g.nextMoveIndex - startIndex);
}

//}}}
//{{{  generateKingMoves

function generateKingMoves(sq) {

  const offsets = g.wb[colourIndex(g.turn)].offsets;

  generateKingMove(sq, sq + offsets.orth1);
  generateKingMove(sq, sq + offsets.orth2);
  generateKingMove(sq, sq + offsets.orth3);
  generateKingMove(sq, sq + offsets.orth4);
  generateKingMove(sq, sq + offsets.diag1);
  generateKingMove(sq, sq + offsets.diag2);
  generateKingMove(sq, sq + offsets.diag3);
  generateKingMove(sq, sq + offsets.diag4);
}

function generateKingMove(from,to) {

  if (offboard(to))
    return 0;

  const piece   = g.board[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

  if (piece && (colour == g.turn || flavour == KING))
    return 0;

  addMove(assembleMove(from, to, KING|g.turn, piece));

  return 1;
}

//}}}
//{{{  generateKnightMoves

function generateKnightMoves(sq) {

  const offsets = g.wb[colourIndex(g.turn)].offsets;

  generateKnightMove(sq, sq + offsets.hop1);
  generateKnightMove(sq, sq + offsets.hop2);
  generateKnightMove(sq, sq + offsets.hop3);
  generateKnightMove(sq, sq + offsets.hop4);
  generateKnightMove(sq, sq + offsets.hop5);
  generateKnightMove(sq, sq + offsets.hop6);
  generateKnightMove(sq, sq + offsets.hop7);
  generateKnightMove(sq, sq + offsets.hop8);
}

function generateKnightMove(from, to) {

  if (offboard(to))
    return 0;

  const piece   = g.board[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

  if (piece && (colour == g.turn || flavour == KING))
    return 0;

  addMove(assembleMove(from, to, KNIGHT|g.turn, piece));

  return 1;
}

//}}}
//{{{  generateBishopMoves

function generateBishopMoves(sq) {

  const offsets = g.wb[colourIndex(g.turn)].offsets;

  let to = 0;

  to = sq + offsets.diag1;
  while (generateBishopMove(sq, to)) {
    to += SLIDE.diag1
  }
}

function generateBishopMove(from, to) {

  if (offboard(to))
    return 0;

  const piece   = g.board[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

  if (piece && (colour == g.turn || flavour == KING))
    return 0;

  addMove(assembleMove(from, to, BISHOP|g.turn, piece));

  return 1;
}

//}}}
//{{{  generatePawnMoves

function generatePawnMoves(sq) {

  const offsets = g.wb[colourIndex(g.turn)].offsets;

  if (generatePawnSlide(sq, sq + offsets.pawn1)) {
    generatePawnSlide(sq, sq + offsets.pawn2);
  }

  generatePawnCapture(sq, sq + offsets.pawn3);
  generatePawnCapture(sq, sq + offsets.pawn4);
}

function generatePawnSlide(from, to) {

  if (offboard(to))
    return 0;

  const piece = g.board[to];

  if (piece)
    return 0;

  addMove(assembleMove(from, to, PAWN|g.turn, 0));

  return 1;
}

function generatePawnCapture(from, to) {

  if (offboard(to))
    return 0;

  const piece   = g.board[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

  if (!piece || (piece && (colour == g.turn || flavour == KING)))
    return 0;

  addMove(assembleMove(from, to, PAWN|g.turn, piece));

  return 1;
}

//}}}

//}}}
//{{{  uci protocol

//{{{  uciServer

function uciServer(data) {

  data = data.replace(/(\r)/gm,"");
  data = data.trim();

  const commands = data.split('\n');

  if (!commands.length)
    return;

  for (let i=0; i < commands.length; i++) {

    const command = commands[i].trim();

    if (!command)
      continue;

    const tokens = command.split(' ');

    if (!tokens.length)
      continue;

    for (let j=0; j < tokens.length; j++)
      tokens[j] = tokens[j].trim();

    const c = tokens[0];

    if (!c)
      continue;

    uciExec(tokens);
  }
}

//}}}
//{{{  uciExec

function uciExec (tokens) {

  const c = tokens[0].toLowerCase();

  switch (c) {

    case 'quit':
    case 'q':
      process.exit();
      break;

    case 'board':
    case 'b':
      printBoard();
      break;

    case 'moves':
    case 'm':
      console.log(generateMoves());
      break;

    case 'ucinewgame':
    case 'u':
      break;

    case 'position':
    case 'p':
      uciExecPosition(tokens);
      break;

    case 'perft':
      uciExecPerft(tokens);
      break;
  }
}

//}}}
//{{{  uciExecPerft

function uciExecPerft (tokens) {

}

//}}}
//{{{  uciExecPosition

function uciExecPosition (tokens) {

  switch(tokens[1].toLowerCase()) {

    case 'startpos':
    case 's':
      setBoardFromFENParts('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 'w', 'KQkq', '-');
      break;

    default:
      setBoardFromFENParts(tokens[2],tokens[3],tokens[4],tokens[5]);
  }
}

//}}}

//}}}

g = new gStruct();

uciServer('u\np s');

//{{{  connect the uci server to stdio

const ucifs = require('fs');

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  let chunk = process.stdin.read();
  process.stdin.resume();
  if (chunk !== null)
    uciServer(chunk);
});

process.stdin.on('end', function() {
  process.exit();
});

//}}}


