
const MAX_PLY = 100;

//{{{  utils

function assert(a,b,s) {
  if (a != b)
    console.log(a,b,'*******',s);
}

//}}}
//{{{  piece representation

const WHITE = 0;
const BLACK = 8;

function colourToggle (colour) {
  return colour & 8;                     // WHITE (0) or BLACK (8)
}

function colourIndex (colour) {
  return colour >>> 3                    // 0 or 1
}

function colourMultiplier (colour) {
  return (-colour >> 31) | 1;            // 1 or -1.
}

const PAWN   = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK   = 4;
const QUEEN  = 5;
const KING   = 6;

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
//{{{  board representation

const SLIDE = {
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

const gBoard = Array(128).fill(0);

//{{{  init gBoard

gBoard[SQUARE.a1] = WHITE | ROOK;
gBoard[SQUARE.b1] = WHITE | KNIGHT;
gBoard[SQUARE.c1] = WHITE | BISHOP;
gBoard[SQUARE.d1] = WHITE | QUEEN;
gBoard[SQUARE.e1] = WHITE | KING;
gBoard[SQUARE.f1] = WHITE | BISHOP;
gBoard[SQUARE.g1] = WHITE | KNIGHT;
gBoard[SQUARE.h1] = WHITE | ROOK;

gBoard[SQUARE.a2] = WHITE | PAWN;
gBoard[SQUARE.b2] = WHITE | PAWN;
gBoard[SQUARE.c2] = WHITE | PAWN;
gBoard[SQUARE.d2] = WHITE | PAWN;
gBoard[SQUARE.e2] = WHITE | PAWN;
gBoard[SQUARE.f2] = WHITE | PAWN;
gBoard[SQUARE.g2] = WHITE | PAWN;
gBoard[SQUARE.h2] = WHITE | PAWN;

gBoard[SQUARE.a8] = BLACK | ROOK;
gBoard[SQUARE.b8] = BLACK | KNIGHT;
gBoard[SQUARE.c8] = BLACK | BISHOP;
gBoard[SQUARE.d8] = BLACK | QUEEN;
gBoard[SQUARE.e8] = BLACK | KING;
gBoard[SQUARE.f8] = BLACK | BISHOP;
gBoard[SQUARE.g8] = BLACK | KNIGHT;
gBoard[SQUARE.h8] = BLACK | ROOK;

gBoard[SQUARE.a7] = BLACK | PAWN;
gBoard[SQUARE.b7] = BLACK | PAWN;
gBoard[SQUARE.c7] = BLACK | PAWN;
gBoard[SQUARE.d7] = BLACK | PAWN;
gBoard[SQUARE.e7] = BLACK | PAWN;
gBoard[SQUARE.f7] = BLACK | PAWN;
gBoard[SQUARE.g7] = BLACK | PAWN;
gBoard[SQUARE.h7] = BLACK | PAWN;

//}}}

let gTurn           = WHITE;
let gTurnIndex      = colourIndex(WHITE);
let gTurnMultiplier = colourMultiplier(WHITE);
let gRights         = 0;                            // hack init
let gEnPass         = 0;

function sq88(r, f) {
  return 16 * r + f;
}

function offboard (sq) {
  return sq & 0x88;
}

function printBoard() {
  for (let r=7; r>=0; r--) {
    process.stdout.write((r+1) + ' ');
    for (let f=0; f<8; f++) {
      sq = sq88(r,f);
      process.stdout.write(pieceChar(gBoard[sq]) + ' ');
    }
    process.stdout.write('\r\n');
  }
  console.log('  a b c d e f g h');
}

//}}}
//{{{  piece list representation

let gWhitePieces = Array(17);

gWhitePieces[0]  = 16;
gWhitePieces[1]  = SQUARE.e1;
gWhitePieces[2]  = SQUARE.a1;
gWhitePieces[3]  = SQUARE.b1;
gWhitePieces[4]  = SQUARE.c1;
gWhitePieces[5]  = SQUARE.d1;
gWhitePieces[6]  = SQUARE.f1;
gWhitePieces[7]  = SQUARE.g1;
gWhitePieces[8]  = SQUARE.h1;
gWhitePieces[9]  = SQUARE.a2;
gWhitePieces[10] = SQUARE.b2;
gWhitePieces[11] = SQUARE.c2;
gWhitePieces[12] = SQUARE.d2;
gWhitePieces[13] = SQUARE.e2;
gWhitePieces[14] = SQUARE.f2;
gWhitePieces[15] = SQUARE.g2;
gWhitePieces[16] = SQUARE.h2;

let gBlackPieces = Array(17);

gBlackPieces[0]  = 16;
gBlackPieces[1]  = SQUARE.e8;
gBlackPieces[2]  = SQUARE.a8;
gBlackPieces[3]  = SQUARE.b8;
gBlackPieces[4]  = SQUARE.c8;
gBlackPieces[5]  = SQUARE.d8;
gBlackPieces[6]  = SQUARE.f8;
gBlackPieces[7]  = SQUARE.g8;
gBlackPieces[8]  = SQUARE.h8;
gBlackPieces[9]  = SQUARE.a7;
gBlackPieces[10] = SQUARE.b7;
gBlackPieces[11] = SQUARE.c7;
gBlackPieces[12] = SQUARE.d7;
gBlackPieces[13] = SQUARE.e7;
gBlackPieces[14] = SQUARE.f7;
gBlackPieces[15] = SQUARE.g7;
gBlackPieces[16] = SQUARE.h7;

const gPieceLists = [gWhitePieces, gBlackPieces];

function printPieceLists() {

  console.log(gWhitePieces[0], gBlackPieces[0]);

  for (let i=1; i<gWhitePieces.length; i++)
    process.stdout.write(gWhitePieces[i].toString(16).padStart(2,'0') + ' ');

  process.stdout.write('\r\n');

  for (let i=1; i<gBlackPieces.length; i++)
    process.stdout.write(gBlackPieces[i].toString(16).padStart(2,'0') + ' ');

  process.stdout.write('\r\n');
}

//}}}
//{{{  move representation

const MAX_MOVES = 260;

const gMoveList      = Array(MAX_PLY * MAX_MOVES);
let   gNextMoveIndex = 0;

//{{{  move primitives

function addMove(move) {
  gMoveList[gNextMoveIndex++] = move;
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

  const pieceList = gPieceLists[gTurnIndex];

  let numMoves  = gNextMoveIndex;
  let numPieces = pieceList[0];
  let index     = 1

  generateKingMoves(pieceList[index]);

  numPieces--;
  index++;

  while (numPieces) {
    let sq = pieceList[index];
    if (sq < 0) {
      index++;
      continue;
    }
    let piece = gBoard[sq];
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

  return(gNextMoveIndex - numMoves);
}

//}}}
//{{{  generateKingMoves

function generateKingMoves(sq) {

  generateKingMove(sq, sq + SLIDE.orth1);
  generateKingMove(sq, sq + SLIDE.orth2);
  generateKingMove(sq, sq + SLIDE.orth3);
  generateKingMove(sq, sq + SLIDE.orth4);
  generateKingMove(sq, sq + SLIDE.diag1);
  generateKingMove(sq, sq + SLIDE.diag2);
  generateKingMove(sq, sq + SLIDE.diag3);
  generateKingMove(sq, sq + SLIDE.diag4);
}

function generateKingMove(from,to) {

  if (offboard(to))
    return 0;

  let piece   = gBoard[to];
  let flavour = pieceFlavour(piece);
  let colour  = pieceColour(piece);

  if (piece && (colour == gTurn || flavour == KING))
    return 0;

  addMove(assembleMove(from, to, KING|gTurn, piece));

  return 1;
}

//}}}
//{{{  generateKnightMoves

function generateKnightMoves(sq) {

  generateKnightMove(sq, sq + SLIDE.hop1);
  generateKnightMove(sq, sq + SLIDE.hop2);
  generateKnightMove(sq, sq + SLIDE.hop3);
  generateKnightMove(sq, sq + SLIDE.hop4);
  generateKnightMove(sq, sq + SLIDE.hop5);
  generateKnightMove(sq, sq + SLIDE.hop6);
  generateKnightMove(sq, sq + SLIDE.hop7);
  generateKnightMove(sq, sq + SLIDE.hop8);
}

function generateKnightMove(from, to) {

  if (offboard(to))
    return 0;

  let piece   = gBoard[to];
  let flavour = pieceFlavour(piece);
  let colour  = pieceColour(piece);

  if (piece && (colour == gTurn || flavour == KING))
    return 0;

  addMove(assembleMove(from, to, KNIGHT|gTurn, piece));

  return 1;
}

//}}}
//{{{  generateBishopMoves

function generateBishopMoves(sq) {

  let to = 0;

  to = sq + SLIDE.diag1;
  while (generateBishopMove(sq, to)) {
    to += SLIDE.diag1
  }
}

function generateBishopMove(from, to) {

  if (offboard(to))
    return 0;

  let piece   = gBoard[to];
  let flavour = pieceFlavour(piece);
  let colour  = pieceColour(piece);

  if (piece && (colour == gTurn || flavour == KING))
    return 0;

  addMove(assembleMove(from, to, BISHOP|gTurn, piece));

  return 1;
}

//}}}
//{{{  generatePawnMoves

function generatePawnMoves(sq) {

  if (generatePawnSlide(sq, sq + SLIDE.pawn1)) {
    generatePawnSlide(sq, sq + SLIDE.pawn2);
  }

  generatePawnCapture(sq, sq + SLIDE.pawn3);
  generatePawnCapture(sq, sq + SLIDE.pawn4);
}

function generatePawnSlide(from, to) {

  if (offboard(to))
    return 0;

  let piece = gBoard[to];

  if (piece)
    return 0;

  addMove(assembleMove(from, to, PAWN|gTurn, 0));

  return 1;
}

function generatePawnCapture(from, to) {

  if (offboard(to))
    return 0;

  let piece   = gBoard[to];
  let flavour = pieceFlavour(piece);
  let colour  = pieceColour(piece);

  if (!piece || (piece && (colour == gTurn || flavour == KING)))
    return 0;

  addMove(assembleMove(from, to, PAWN|gTurn, piece));

  return 1;
}

//}}}

//}}}
//{{{  uci protocol

//{{{  uciServer

function uciServer(data) {

  data = data.replace(/(\r)/gm,"");
  data = data.replace(/\s+/g,' ');
  data = data.trim();
  data = data.toLowerCase();

  let commands = data.split('\n');

  if (!commands.length)
    return;

  for (let i=0; i < commands.length; i++ ) {

    let command = commands[i].trim();

    if (!command)
      continue;

    let tokens = command.split(' ');

    if (!tokens.length)
      continue;

    let c = tokens[0].trim();

    if (!c)
      continue;

    uciExec(tokens);
  }
}

//}}}
//{{{  uciExec

function uciExec (tokens) {

  let c = tokens[0];

  switch (c) {

    case 'quit':
    case 'q':
      process.exit();
      break;

    case 'b':
      printBoard();
      printPieceLists();
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

//}}}

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

console.log(generateMoves());

