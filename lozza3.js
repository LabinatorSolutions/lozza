
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

//{{{  constants

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

const WHITE_RIGHTS_KING  = 0x00000001;
const WHITE_RIGHTS_QUEEN = 0x00000002;
const BLACK_RIGHTS_KING  = 0x00000004;
const BLACK_RIGHTS_QUEEN = 0x00000008;
const WHITE_RIGHTS       = WHITE_RIGHTS_QUEEN | WHITE_RIGHTS_KING;
const BLACK_RIGHTS       = BLACK_RIGHTS_QUEEN | BLACK_RIGHTS_KING;

/*const MASK_RIGHTS =  [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, ~8, 15, 15, 15, ~12,15, 15, ~4, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, ~2, 15, 15, 15, ~3, 15, 15, ~1, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
                     15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15];
*/

//}}}

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

let gTurn   = WHITE;
let gRights = WHITE_RIGHTS | BLACK_RIGHTS;
let gEnPass = 0;

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

  //{{{  gBoard
  
  for (let r=7; r>=0; r--) {
    process.stdout.write((r+1) + ' ');
    for (let f=0; f<8; f++) {
      const sq = sq88(r,f);
      process.stdout.write(pieceChar(gBoard[sq]) + ' ');
    }
    process.stdout.write('\r\n');
  }
  
  console.log('  a b c d e f g h');
  
  //}}}
  //{{{  gTurn
  
  if (gTurn == WHITE)
    process.stdout.write('w ');
  
  else
    process.stdout.write('b ');
  
  //}}}
  //{{{  gRights
  
  if (!gRights)
    process.stdout.write('- ');
  
  else {
    if (gRights & WHITE_RIGHTS_KING)
      process.stdout.write('K');
  
    if (gRights & WHITE_RIGHTS_QUEEN)
      process.stdout.write('Q');
  
    if (gRights & BLACK_RIGHTS_KING)
      process.stdout.write('k');
  
    if (gRights & BLACK_RIGHTS_QUEEN)
      process.stdout.write('q');
  }
  
  //}}}
  //{{{  gEnPass
  
  process.stdout.write(' -');
  
  process.stdout.write('\r\n');
  
  //}}}
}

//}}}
//{{{  setBoardFromFENParts

function setBoardFromFENParts(b,t,r,e) {

  let nw = 0;
  let nb = 0;

  //{{{  gBoard
  
  gBoard.fill(0);
  
  let rank = 7;
  let file = 0;
  
  for (let i=0; i < b.length; i++) {
  
    const ch = b.charAt(i);
  
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
        gBoard[sq88(rank,file)] = WHITE|PAWN;
        file++;
        nw++;
        break;
      
      case 'N':
        gBoard[sq88(rank,file)] = WHITE|KNIGHT;
        file++;
        nw++;
        break;
      
      case 'B':
        gBoard[sq88(rank,file)] = WHITE|BISHOP;
        file++;
        nw++;
        break;
      
      case 'R':
        gBoard[sq88(rank,file)] = WHITE|ROOK;
        file++;
        nw++;
        break;
      
      case 'Q':
        gBoard[sq88(rank,file)] = WHITE|QUEEN;
        file++;
        nw++;
        break;
      
      case 'K':
        gBoard[sq88(rank,file)] = WHITE|KING;
        nw++;
        file++;
        break;
      
      //}}}
      //{{{  black
      
      case 'p':
        gBoard[sq88(rank,file)] = BLACK|PAWN;
        file++;
        nb++;
        break;
      
      case 'n':
        gBoard[sq88(rank,file)] = BLACK|KNIGHT;
        file++;
        nb++;
        break;
      
      case 'b':
        gBoard[sq88(rank,file)] = BLACK|BISHOP;
        file++;
        nb++;
        break;
      
      case 'r':
        gBoard[sq88(rank,file)] = BLACK|ROOK;
        file++;
        nb++;
        break;
      
      case 'q':
        gBoard[sq88(rank,file)] = BLACK|QUEEN;
        file++;
        nb++;
        break;
      
      case 'k':
        gBoard[sq88(rank,file)] = BLACK|KING;
        file++;
        nb++;
        break;
      
      //}}}
    }
  }
  
  //}}}
  //{{{  gTurn
  
  gTurn = WHITE;
  
  if (t == 'b')
    gTurn = BLACK;
  
  //}}}
  //{{{  gRights
  
  gRights = 0;
  
  for (let i=0; i < r.length; i++) {
  
    const ch = r.charAt(i);
  
    switch (ch) {
  
      case 'K':
        gRights |= WHITE_RIGHTS_KING;
        break;
  
      case 'Q':
        gRights |= WHITE_RIGHTS_QUEEN;
        break;
  
      case 'k':
        gRights |= BLACK_RIGHTS_KING;
        break;
  
      case 'q':
        gRights |= BLACK_RIGHTS_QUEEN;
        break;
    }
  }
  
  //}}}
  //{{{  gEnPass
  
  gEnPass = 0;
  
  //}}}

  setPieceListsFromBoard(nw,nb);
}

//}}}

//}}}
//{{{  piece list representation

let gWhitePieces = Array(17);

//{{{  init white piece list

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

//}}}

let gBlackPieces = Array(17);

//{{{  init black piece list

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

//}}}

const gPieceLists = [gWhitePieces, gBlackPieces];

//{{{  printPieceLists

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
//{{{  setPieceListsFromBoard

function setPieceListsFromBoard(nw,nb) {

  gWhitePieces = Array(nw+1);
  gBlackPieces = Array(nb+1);

  gWhitePieces[0] = nw;
  gBlackPieces[0] = nb;

  let wNext = 2;
  let bNext = 2;

  for (let r=0; r < 8; r++) {
    for (let f=0; f < 8; f++) {

      const sq = sq88(r,f);

      const piece   = gBoard[sq]
      const colour  = pieceColour(piece);
      const flavour = pieceFlavour(piece);

      if (piece) {
        if (colour == WHITE) {
          if (flavour == KING)
            gWhitePieces[1] = sq;
          else
            gWhitePieces[wNext++] = sq;
        }

        else {
          if (flavour == KING)
            gBlackPieces[1] = sq;
          else
            gBlackPieces[bNext++] = sq;
        }
      }
    }
  }
}

//}}}

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

  const ci         = colourIndex(gTurn);
  const pieceList  = gPieceLists[ci];
  const startIndex = gNextMoveIndex;

  let numPieces    = pieceList[0];
  let index        = 1

  generateKingMoves(pieceList[index]);

  numPieces--;
  index++;

  while (numPieces) {
    const sq = pieceList[index];
    if (sq < 0) {
      index++;
      continue;
    }
    const piece = gBoard[sq];
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

  return(gNextMoveIndex - startIndex);
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

  const piece   = gBoard[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

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

  const piece   = gBoard[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

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

  const piece   = gBoard[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

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

  const piece = gBoard[to];

  if (piece)
    return 0;

  addMove(assembleMove(from, to, PAWN|gTurn, 0));

  return 1;
}

function generatePawnCapture(from, to) {

  if (offboard(to))
    return 0;

  const piece   = gBoard[to];
  const flavour = pieceFlavour(piece);
  const colour  = pieceColour(piece);

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

  const commands = data.split('\n');

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

  let c = tokens[0].toLowerCase();

  switch (c) {

    case 'quit':
    case 'q':
      process.exit();
      break;

    case 'b':
      printBoard();
      printPieceLists();
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

