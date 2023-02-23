//{{{  // https://github.com/op12no2/lozza

"use strict"

const BUILD = "3";

//{{{  constants

const MAX_PLY   = 100;
const MAX_MOVES = 250;

const EMPTY = 0;

const WHITE = 0x0;                  // toggle with: ~turn & COLOR_MASK
const BLACK = 0x8;

const I_WHITE = 0;                  // 0/1 colour index, compute with: turn >>> 3
const I_BLACK = 1;

const M_WHITE = 1;
const M_BLACK = -1;                 // +1/-1 colour multiplier, compute with: (-turn >> 31) | 1

const PIECE_MASK = 0x7;
const COLOR_MASK = 0x8;

const MOVE_TO_BITS      = 0;
const MOVE_FR_BITS      = 8;
const MOVE_TOOBJ_BITS   = 16;
const MOVE_FROBJ_BITS   = 20;
const MOVE_PROMAS_BITS  = 29;

const MOVE_TO_MASK       = 0x000000FF;
const MOVE_FR_MASK       = 0x0000FF00;
const MOVE_TOOBJ_MASK    = 0x000F0000;
const MOVE_FROBJ_MASK    = 0x00F00000;
const MOVE_KINGMOVE_MASK = 0x01000000;
const MOVE_EPTAKE_MASK   = 0x02000000;
const MOVE_EPMAKE_MASK   = 0x04000000;
const MOVE_CASTLE_MASK   = 0x08000000;
const MOVE_PROMOTE_MASK  = 0x10000000;
const MOVE_PROMAS_MASK   = 0x60000000;  // NBRQ.
const MOVE_SPARE2_MASK   = 0x80000000;

const MOVE_IKKY_MASK = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | MOVE_PROMOTE_MASK | MOVE_EPTAKE_MASK | MOVE_EPMAKE_MASK;

const PAWN   = 1;
const KNIGHT = 2;
const BISHOP = 3;
const ROOK   = 4;
const QUEEN  = 5;
const KING   = 6;
const EDGE   = 7;

const W_PAWN   = PAWN;
const W_KNIGHT = KNIGHT;
const W_BISHOP = BISHOP;
const W_ROOK   = ROOK;
const W_QUEEN  = QUEEN;
const W_KING   = KING;

const B_PAWN   = PAWN   | BLACK;
const B_KNIGHT = KNIGHT | BLACK;
const B_BISHOP = BISHOP | BLACK;
const B_ROOK   = ROOK   | BLACK;
const B_QUEEN  = QUEEN  | BLACK;
const B_KING   = KING   | BLACK;

//
// E == EMPTY, X = OFF BOARD, - == CANNOT HAPPEN
//
//                 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15
//                 E  W  W  W  W  W  W  X  -  B  B  B  B  B  B  -
//                 E  P  N  B  R  Q  K  X  -  P  N  B  R  Q  K  -
//

const SQ_CHAR   = ['.','P','N','B','R','Q','K','x','y','p','n','b','r','q','k','z'];

const IS_O      = [0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0];
const IS_E      = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_OE     = [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0];

const IS_P      = [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
const IS_N      = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IS_NBRQKE = [1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0]
const IS_RQKE   = [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0]
const IS_QKE    = [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0]
const IS_K      = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0];
const IS_KN     = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];

const IS_W      = [0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WE     = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WP     = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WN     = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WNBRQ  = [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const IS_WB     = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WBQ    = [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WRQ    = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const IS_WQ     = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

const IS_B      = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
const IS_BE     = [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
const IS_BP     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
const IS_BN     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IS_BNBRQ  = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0]
const IS_BB     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
const IS_BBQ    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0];
const IS_BRQ    = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0];
const IS_BQ     = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]

const W_PROMOTE_SQ = [0,26, 27, 28, 29, 30, 31, 32, 33];
const B_PROMOTE_SQ = [0,110,111,112,113,114,115,116,117];

const A1 = 110, B1 = 111, C1 = 112, D1 = 113, E1 = 114, F1 = 115, G1 = 116, H1 = 117;
const A8 = 26,  B8 = 27,  C8 = 28,  D8 = 29,  E8 = 30,  F8 = 31,  G8 = 32,  H8 = 33;

const SQA1 = 110, SQB1 = 111, SQC1 = 112, SQD1 = 113, SQE1 = 114, SQF1 = 115, SQG1 = 116, SQH1 = 117;
const SQA2 = 98,  SQB2 = 99,  SQC2 = 100, SQD2 = 101, SQE2 = 102, SQF2 = 103, SQG2 = 104, SQH2 = 105;
const SQA3 = 86,  SQB3 = 87,  SQC3 = 88,  SQD3 = 89,  SQE3 = 90,  SQF3 = 91,  SQG3 = 92,  SQH3 = 93;
const SQA4 = 74,  SQB4 = 75,  SQC4 = 76,  SQD4 = 77,  SQE4 = 78,  SQF4 = 79,  SQG4 = 80,  SQH4 = 81;
const SQA5 = 62,  SQB5 = 63,  SQC5 = 64,  SQD5 = 65,  SQE5 = 66,  SQF5 = 67,  SQG5 = 68,  SQH5 = 69;
const SQA6 = 50,  SQB6 = 51,  SQC6 = 52,  SQD6 = 53,  SQE6 = 54,  SQF6 = 55,  SQG6 = 56,  SQH6 = 57;
const SQA7 = 38,  SQB7 = 39,  SQC7 = 40,  SQD7 = 41,  SQE7 = 42,  SQF7 = 43,  SQG7 = 44,  SQH7 = 45;
const SQA8 = 26,  SQB8 = 27,  SQC8 = 28,  SQD8 = 29,  SQE8 = 30,  SQF8 = 31,  SQG8 = 32,  SQH8 = 33;

const MOVE_E1G1 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | G1;
const MOVE_E1C1 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (W_KING << MOVE_FROBJ_BITS) | (E1 << MOVE_FR_BITS) | C1;
const MOVE_E8G8 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | G8;
const MOVE_E8C8 = MOVE_KINGMOVE_MASK | MOVE_CASTLE_MASK | (B_KING << MOVE_FROBJ_BITS) | (E8 << MOVE_FR_BITS) | C8;

const QPRO = (QUEEN-2)  << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const RPRO = (ROOK-2)   << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const BPRO = (BISHOP-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;
const NPRO = (KNIGHT-2) << MOVE_PROMAS_BITS | MOVE_PROMOTE_MASK;

const WHITE_RIGHTS_KING  = 0x00000001;
const WHITE_RIGHTS_QUEEN = 0x00000002;
const BLACK_RIGHTS_KING  = 0x00000004;
const BLACK_RIGHTS_QUEEN = 0x00000008;
const WHITE_RIGHTS       = WHITE_RIGHTS_QUEEN | WHITE_RIGHTS_KING;
const BLACK_RIGHTS       = BLACK_RIGHTS_QUEEN | BLACK_RIGHTS_KING;

const MASK_RIGHTS = [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
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

const WP_OFFSET_ORTH  = -12;
const WP_OFFSET_DIAG1 = -13;
const WP_OFFSET_DIAG2 = -11;

const BP_OFFSET_ORTH  = 12;
const BP_OFFSET_DIAG1 = 13;
const BP_OFFSET_DIAG2 = 11;

const KNIGHT_OFFSETS  = [25,-25,23,-23,14,-14,10,-10];
const BISHOP_OFFSETS  = [11,-11,13,-13];
const ROOK_OFFSETS    =               [1,-1,12,-12];
const QUEEN_OFFSETS   = [11,-11,13,-13,1,-1,12,-12];
const KING_OFFSETS    = [11,-11,13,-13,1,-1,12,-12];

const OFFSETS = [0,0,KNIGHT_OFFSETS,BISHOP_OFFSETS,ROOK_OFFSETS,QUEEN_OFFSETS,KING_OFFSETS];
const LIMITS  = [0,1,1,             8,             8,           8,            1];

const B88 = [26, 27, 28, 29, 30, 31, 32, 33,
             38, 39, 40, 41, 42, 43, 44, 45,
             50, 51, 52, 53, 54, 55, 56, 57,
             62, 63, 64, 65, 66, 67, 68, 69,
             74, 75, 76, 77, 78, 79, 80, 81,
             86, 87, 88, 89, 90, 91, 92, 93,
             98, 99, 100,101,102,103,104,105,
             110,111,112,113,114,115,116,117];

const COORDS = ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', 'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8', '??', '??',
                '??', '??', 'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7', '??', '??',
                '??', '??', 'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6', '??', '??',
                '??', '??', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5', '??', '??',
                '??', '??', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4', '??', '??',
                '??', '??', 'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3', '??', '??',
                '??', '??', 'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2', '??', '??',
                '??', '??', 'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
                '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'];

const RANK = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0,
              0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0,
              0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0,
              0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0,
              0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0,
              0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,
              0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0,
              0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const FILE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//}}}

//{{{  primitives

function moveFromSq (move) {
  return (move & MOVE_FR_MASK) >>> MOVE_FR_BITS;
}

function moveToSq (move) {
  return (move & MOVE_TO_MASK) >>> MOVE_TO_BITS;
}

function moveToObj (move) {
  return (move & MOVE_TOOBJ_MASK) >>> MOVE_TOOBJ_BITS;
}

function moveFromObj ( move) {
  return (move & MOVE_FROBJ_MASK) >>> MOVE_FROBJ_BITS;
}

function movePromotePiece (move) {
  return ((move & MOVE_PROMAS_MASK) >>> MOVE_PROMAS_BITS) + 2;
}

function objColour (obj) {
  return obj & COLOR_MASK;
}

function objPiece (obj) {
  return obj & PIECE_MASK;
}

//}}}
//{{{  genMoves

function genMoves (turn) {

  const b = state.board;

  //{{{  colour based stuff
  
  if (turn == WHITE) {
  
    var pOffsetOrth  = WP_OFFSET_ORTH;
    var pOffsetDiag1 = WP_OFFSET_DIAG1;
    var pOffsetDiag2 = WP_OFFSET_DIAG2;
    var pHomeRank    = 2;
    var pPromoteRank = 7;
    var rights       = state.rights & WHITE_RIGHTS;
    var CAPTURE      = IS_B;
    var ME           = IS_W;
  
    if (rights) {
  
      if ((rights & WHITE_RIGHTS_KING)  && b[F1] == 0 && b[G1] == 0                  && !isAttacked(F1,BLACK) && !isAttacked(E1,BLACK))
        addMove(MOVE_E1G1);
  
      if ((rights & WHITE_RIGHTS_QUEEN) && b[B1] == 0 && b[C1] == 0 && b[D1] == 0 && !isAttacked(D1,BLACK) && !isAttacked(E1,BLACK))
        addMove(MOVE_E1C1);
    }
  }
  
  else {
  
    var pOffsetOrth  = BP_OFFSET_ORTH;
    var pOffsetDiag1 = BP_OFFSET_DIAG1;
    var pOffsetDiag2 = BP_OFFSET_DIAG2;
    var pHomeRank    = 7;
    var pPromoteRank = 2;
    var rights       = state.rights & BLACK_RIGHTS;
    var CAPTURE      = IS_W;
    var ME           = IS_B;
  
    if (rights) {
  
      if ((rights & BLACK_RIGHTS_KING)  && b[F8] == 0 && b[G8] == 0 &&                  !isAttacked(F8,WHITE) && !isAttacked(E8,WHITE))
        addMove(MOVE_E8G8);
  
      if ((rights & BLACK_RIGHTS_QUEEN) && b[B8] == 0 && b[C8] == 0 && b[D8] == 0 && !isAttacked(D8,WHITE) && !isAttacked(E8,WHITE))
        addMove(MOVE_E8C8);
    }
  }
  
  //}}}

  let to     = 0;
  let toObj  = 0;
  let frMove = 0;

  for (let count=0; count<64; count++) {

    const fr    = B88[count];
    const frObj = b[fr];

    if (!ME[frObj])
      continue;

    const frPiece = frObj & PIECE_MASK;
    const frRank  = RANK[fr];

    frMove  = (frObj << MOVE_FROBJ_BITS) | (fr << MOVE_FR_BITS);

    if (frPiece == PAWN) {
      //{{{  P
      
      to     = fr + pOffsetOrth;
      toObj  = b[to];
      
      if (!toObj) {
      
        if (frRank == pPromoteRank) {
          addMove(frMove | to | QPRO);
          addMove(frMove | to | RPRO);
          addMove(frMove | to | BPRO);
          addMove(frMove | to | NPRO);
        }
        else {
          addMove(frMove | to);
      
          if (frRank == pHomeRank) {
      
            to += pOffsetOrth;
            if (!b[to])
              addMove(frMove | to | MOVE_EPMAKE_MASK);
          }
        }
      }
      
      to    = fr + pOffsetDiag1;
      toObj = b[to];
      
      if (CAPTURE[toObj]) {
      
        if (frRank == pPromoteRank) {
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | QPRO);
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | RPRO);
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | BPRO);
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | NPRO);
        }
        else
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (!toObj && to == state.ep)
        addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | MOVE_EPTAKE_MASK);
      
      to    = fr + pOffsetDiag2;
      toObj = b[to];
      
      if (CAPTURE[toObj]) {
      
        if (frRank == pPromoteRank) {
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | QPRO);
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | RPRO);
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | BPRO);
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | NPRO);
        }
        else
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      else if (!toObj && to == state.ep)
        addMove(frMove | to | MOVE_EPTAKE_MASK);
      
      //}}}
    }

    else if (frPiece == KNIGHT) {
      //{{{  N
      
      var offsets = OFFSETS[frPiece];
      var dir     = 0;
      
      while (dir < 8) {
      
        to    = fr + offsets[dir++];
        toObj = b[to];
      
        if (!toObj)
          addMove(frMove | to);
        else if (CAPTURE[toObj])
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      //}}}
    }

    else if (frPiece == KING) {
      //{{{  K
      
      var offsets = OFFSETS[frPiece];
      var dir     = 0;
      
      while (dir < 8) {
      
        to    = fr + offsets[dir++];
        toObj = b[to];
      
        if (!toObj)
          addMove(frMove | to | MOVE_KINGMOVE_MASK);
      
        else if (CAPTURE[toObj])
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to | MOVE_KINGMOVE_MASK);
      }
      
      //}}}
    }

    else {
      //{{{  BRQ
      
      var offsets = OFFSETS[frPiece];
      var len     = offsets.length;
      var dir     = 0;
      
      while (dir < len) {
      
        var offset = offsets[dir++];
      
        to    = fr + offset;
        toObj = b[to];
      
        while (!toObj) {
      
          addMove(frMove | to);
      
          to    += offset;
          toObj = b[to];
        }
      
        if (CAPTURE[toObj])
          addMove(frMove | (toObj << MOVE_TOOBJ_BITS) | to);
      }
      
      //}}}
    }
  }
}

//}}}
//{{{  makeMove

function makeMove (move) {

  const s = state;
  const b = s.board;

  s.ply++;

  const fr    = moveFromSq(move);
  const to    = moveToSq(move);
  const frObj = moveFromObj(move);

  b[fr] = 0;
  b[to] = frObj;

  s.rights &= MASK_RIGHTS[fr] & MASK_RIGHTS[to];

  s.ep = 0;

  if (move & MOVE_IKKY_MASK) {
    //{{{  ikky stuff
    
    const frCol = objColour(frObj);
    
    if (frCol == WHITE) {
    
      if (move & MOVE_KINGMOVE_MASK)
        s.wKingSq = to;
    
      if (move & MOVE_EPMAKE_MASK) {
    
        s.ep = to+12;
    
      }
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[to+12] = 0;
    
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        b[to] = movePromotePiece(move) | WHITE;
    
      }
    
      else if (move == MOVE_E1G1) {
    
        b[H1] = 0;
        b[F1] = W_ROOK;
    
      }
    
      else if (move == MOVE_E1C1) {
    
        b[A1] = 0;
        b[D1] = W_ROOK;
    
      }
    }
    
    else {
    
      if (move & MOVE_KINGMOVE_MASK)
        s.bKingSq = to;
    
      if (move & MOVE_EPMAKE_MASK) {
    
        s.ep = to-12;
    
      }
    
      else if (move & MOVE_EPTAKE_MASK) {
    
        b[to-12] = 0;
    
      }
    
      else if (move & MOVE_PROMOTE_MASK) {
    
        b[to] = movePromotePiece(move) | BLACK;
    
      }
    
      else if (move == MOVE_E8G8) {
    
        b[H8] = 0;
        b[F8] = B_ROOK;
    
    }
      else if (move == MOVE_E8C8) {
    
        b[A8] = 0;
        b[D8] = B_ROOK;
    
      }
    }
    
    //}}}
  }
}

//}}}
//{{{  unmakeMove

function unmakeMove (move) {

  const s = state;
  const b = s.board;

  s.ply--;

  const fr    = moveFromSq(move);
  const to    = moveToSq(move);
  const toObj = moveToObj(move);
  const frObj = moveFromObj(move);

  b[fr] = frObj;
  b[to] = toObj;

  if (move & MOVE_IKKY_MASK) {
    //{{{  ikky stuff
    
    const frCol = objColour(frObj);
    
    if (frCol == WHITE) {
    
      if (move & MOVE_KINGMOVE_MASK)
        s.wKingSq = fr;
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[to+12] = B_PAWN;
    
      }
    
      else if (move == MOVE_E1G1) {
    
        b[H1] = W_ROOK;
        b[F1] = 0;
    
      }
    
      else if (move == MOVE_E1C1) {
    
        b[A1] = W_ROOK;
        b[D1] = 0;
    
      }
    }
    
    else {
    
      if (move & MOVE_KINGMOVE_MASK)
        s.bKingSq = fr;
    
      if (move & MOVE_EPTAKE_MASK) {
    
        b[to-12] = W_PAWN;
    
      }
    
      else if (move == MOVE_E8G8) {
    
        b[H8] = B_ROOK;
        b[F8] = 0;
    
      }
    
      else if (move == MOVE_E8C8) {
    
        b[A8] = B_ROOK;
        b[D8] = 0;
    
      }
    }
    
    //}}}
  }
}

//}}}
//{{{  isAttacked

function isAttacked (to, byCol) {

  const b = state.board;
  var fr  = 0;

  //{{{  colour stuff
  
  if (byCol == WHITE) {
  
    if (b[to+13] == W_PAWN || b[to+11] == W_PAWN)
      return 1;
  
    var RQ = IS_WRQ;
    var BQ = IS_WBQ;
  }
  
  else {
  
    if (b[to-13] == B_PAWN || b[to-11] == B_PAWN)
      return 1;
  
    var RQ = IS_BRQ;
    var BQ = IS_BBQ;
  }
  
  const knight = KNIGHT | byCol;
  const king   = KING   | byCol;
  
  //}}}

  //{{{  knights
  
  if (b[to + -10] == knight) return 1;
  if (b[to + -23] == knight) return 1;
  if (b[to + -14] == knight) return 1;
  if (b[to + -25] == knight) return 1;
  if (b[to +  10] == knight) return 1;
  if (b[to +  23] == knight) return 1;
  if (b[to +  14] == knight) return 1;
  if (b[to +  25] == knight) return 1;
  
  //}}}
  //{{{  queen, bishop, rook
  
  fr = to + 1;  while (!b[fr]) fr += 1;  if (RQ[b[fr]]) return 1;
  fr = to - 1;  while (!b[fr]) fr -= 1;  if (RQ[b[fr]]) return 1;
  fr = to + 12; while (!b[fr]) fr += 12; if (RQ[b[fr]]) return 1;
  fr = to - 12; while (!b[fr]) fr -= 12; if (RQ[b[fr]]) return 1;
  fr = to + 11; while (!b[fr]) fr += 11; if (BQ[b[fr]]) return 1;
  fr = to - 11; while (!b[fr]) fr -= 11; if (BQ[b[fr]]) return 1;
  fr = to + 13; while (!b[fr]) fr += 13; if (BQ[b[fr]]) return 1;
  fr = to - 13; while (!b[fr]) fr -= 13; if (BQ[b[fr]]) return 1;
  
  //}}}
  //{{{  kings
  
  if (b[to + -11] == king) return 1;
  if (b[to + -13] == king) return 1;
  if (b[to + -12] == king) return 1;
  if (b[to + -1 ] == king) return 1;
  if (b[to +  11] == king) return 1;
  if (b[to +  13] == king) return 1;
  if (b[to +  12] == king) return 1;
  if (b[to +  1 ] == king) return 1;
  
  //}}}

  return 0;
}


//}}}
//{{{  printBoard

function printBoard () {

  const s = state;
  const b = s.board;

  for (var rank=7; rank >= 0; rank--) {
    process.stdout.write((rank+1)+' ');
    for (var file=0; file <= 7; file++) {
      process.stdout.write(SQ_CHAR[b[B88[(7-rank)*8+file]]] + ' ');
    }
    process.stdout.write('\r\n');
  }

  console.log('  a b c d e f g h');
  if (s.turn == WHITE)
    process.stdout.write('w');
  else
    process.stdout.write('b');
  process.stdout.write(' ');
  console.log();
}

//}}}
//{{{  position

function position () {

  const s = state;
  const b = s.board;

  //{{{  init
  
  b.fill(EDGE);
  
  for (let i=0; i < 64; i++)
    b[B88[i]] = 0;
  
  //}}}

  var spec = uciio;

  //{{{  board board
  
  var sq   = 0;
  var rank = 7;
  var file = 0;
  
  for (let i=0; i < spec.board.length; i++) {
  
    const ch   = spec.board.charAt(i);
    const sq88 = (7-rank) * 8 + file;
    const sq   = B88[sq88];
  
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
        break;
      
      //}}}
      //{{{  /
      
      case '/':
        rank--;
        file = 0;
        break;
      
      //}}}
      //{{{  black
      
      case 'p':
        b[sq] = B_PAWN;
        file++;
        break;
      case 'n':
        b[sq] = B_KNIGHT;
        file++;
        break;
      case 'b':
        b[sq] = B_BISHOP;
        file++;
        break;
      case 'r':
        b[sq] = B_ROOK;
        file++;
        break;
      case 'q':
        b[sq] = B_QUEEN;
        file++;
        break;
      case 'k':
        b[sq] = B_KING;
        s.bKingSq = sq;
        file++;
        break;
      
      //}}}
      //{{{  white
      
      case 'P':
        b[sq] = W_PAWN;
        file++;
        break;
      case 'N':
        b[sq] = W_KNIGHT;
        file++;
        break;
      case 'B':
        b[sq] = W_BISHOP;
        file++;
        break;
      case 'R':
        b[sq] = W_ROOK;
        file++;
        break;
      case 'Q':
        b[sq] = W_QUEEN;
        file++;
        break;
      case 'K':
        b[sq] = W_KING;
        s.wKingSq = sq;
        file++;
        break;
      
      //}}}
      default:
        console.log('unknown board char','|'+ch+'|');
    }
  }
  
  //}}}
  //{{{  board turn
  
  if (spec.turn == 'w')
    s.turn = WHITE;
  
  else if (spec.turn == 'b')
    s.turn = BLACK;
  
  else
    console.log('unknown board colour', spec.turn)
  
  //}}}
  //{{{  board rights
  
  s.rights = 0;
  
  for (let i=0; i < spec.rights.length; i++) {
  
    const ch = spec.rights.charAt(i);
  
    if (ch == 'K') s.rights |= WHITE_RIGHTS_KING;
    if (ch == 'Q') s.rights |= WHITE_RIGHTS_QUEEN;
    if (ch == 'k') s.rights |= BLACK_RIGHTS_KING;
    if (ch == 'q') s.rights |= BLACK_RIGHTS_QUEEN;
  }
  
  //}}}
  //{{{  board ep
  
  if (spec.ep.length == 2)
    s.ep = COORDS.indexOf(spec.ep)
  
  else
    s.ep = 0;
  
  //}}}

}

//}}}
//{{{  initSearch

function initSearch () {

  state.nextMove = 0;
  state.ply      = 0;

}

//}}}
//{{{  cache

function cache() {

  const s   = state;
  const ply = s.ply;

  s.cacheRights[ply]   = s.rights;
  s.cacheEp[ply]       = s.ep;
}

//}}}
//{{{  uncache

function uncache() {

  const s   = state;
  const ply = s.ply;

  s.rights = s.cacheRights[ply];
  s.ep     = s.cacheEp[ply];
}

//}}}
//{{{  getNextMove

function getNextMove (nextMove, lastMove) {

  const moves = state.moves;
  const ranks = state.ranks;

  var maxR = -100000;
  var maxI = 0;

  for (let i=nextMove; i <= lastMove; i++) {
    if (ranks[i] > maxR) {
      maxR = ranks[i];
      maxI = i;
    }
  }

  const maxM = moves[maxI]

  moves[maxI] = moves[nextMove];
  ranks[maxI] = ranks[nextMove];

  return maxM;
}

//}}}
//{{{  addMove

function addMove (move) {

  const s = state;

  s.moves[s.nextMove]   = move;
  s.ranks[s.nextMove++] = (Math.random() * 100) | 0;

}

//}}}
//{{{  perft

function perft (depth, turn) {

  if (depth == 0)
    return 1;

  var   count     = 0;
  var   move      = 0;
  const nextTurn  = ~turn & COLOR_MASK;
  const firstMove = state.nextMove;
  var   nextMove  = firstMove;

  genMoves(turn);

  const lastMove = state.nextMove - 1;

  cache();

  while (nextMove <= lastMove) {

    move = getNextMove(nextMove++, lastMove);

    makeMove(move);

    if (isAttacked((turn == WHITE ? state.wKingSq : state.bKingSq),nextTurn)) {
      unmakeMove(move);
      uncache();
      continue;
    }

    count += perft(depth-1, nextTurn);

    unmakeMove(move);
    uncache();
  }

  state.nextMove = firstMove;

  return count;
}

//}}}
//{{{  uciArgv

function uciArgv() {

  if (process.argv.length > 2) {
    for (let i=2; i < process.argv.length; i++)
      uciExec(process.argv[i]);
  }

}

//}}}
//{{{  uciPost

function uciPost (s) {
  console.log(s);
}

//}}}
//{{{  uciSend

function uciSend () {

  var s = '';

  for (var i = 0; i < arguments.length; i++)
    s += arguments[i] + ' ';

  uciPost(s);
}

//}}}
//{{{  uciExec

//{{{  bench fens

const BENCHFENS = [

"r3k2r/2pb1ppp/2pp1q2/p7/1nP1B3/1P2P3/P2N1PPP/R2QK2R w KQkq a6 0 14",
"4rrk1/2p1b1p1/p1p3q1/4p3/2P2n1p/1P1NR2P/PB3PP1/3R1QK1 b - - 2 24",
"r3qbrk/6p1/2b2pPp/p3pP1Q/PpPpP2P/3P1B2/2PB3K/R5R1 w - - 16 42",
"6k1/1R3p2/6p1/2Bp3p/3P2q1/P7/1P2rQ1K/5R2 b - - 4 44",
"8/8/1p2k1p1/3p3p/1p1P1P1P/1P2PK2/8/8 w - - 3 54",
"7r/2p3k1/1p1p1qp1/1P1Bp3/p1P2r1P/P7/4R3/Q4RK1 w - - 0 36",
"r1bq1rk1/pp2b1pp/n1pp1n2/3P1p2/2P1p3/2N1P2N/PP2BPPP/R1BQ1RK1 b - - 2 10",
"3r3k/2r4p/1p1b3q/p4P2/P2Pp3/1B2P3/3BQ1RP/6K1 w - - 3 87",
"2r4r/1p4k1/1Pnp4/3Qb1pq/8/4BpPp/5P2/2RR1BK1 w - - 0 42",
"4q1bk/6b1/7p/p1p4p/PNPpP2P/KN4P1/3Q4/4R3 b - - 0 37",
"2q3r1/1r2pk2/pp3pp1/2pP3p/P1Pb1BbP/1P4Q1/R3NPP1/4R1K1 w - - 2 34",
"1r2r2k/1b4q1/pp5p/2pPp1p1/P3Pn2/1P1B1Q1P/2R3P1/4BR1K b - - 1 37",
"r3kbbr/pp1n1p1P/3ppnp1/q5N1/1P1pP3/P1N1B3/2P1QP2/R3KB1R b KQkq b3 0 17",
"8/6pk/2b1Rp2/3r4/1R1B2PP/P5K1/8/2r5 b - - 16 42",
"1r4k1/4ppb1/2n1b1qp/pB4p1/1n1BP1P1/7P/2PNQPK1/3RN3 w - - 8 29",
"8/p2B4/PkP5/4p1pK/4Pb1p/5P2/8/8 w - - 29 68",
"3r4/ppq1ppkp/4bnp1/2pN4/2P1P3/1P4P1/PQ3PBP/R4K2 b - - 2 20",
"5rr1/4n2k/4q2P/P1P2n2/3B1p2/4pP2/2N1P3/1RR1K2Q w - - 1 49",
"1r5k/2pq2p1/3p3p/p1pP4/4QP2/PP1R3P/6PK/8 w - - 1 51",
"q5k1/5ppp/1r3bn1/1B6/P1N2P2/BQ2P1P1/5K1P/8 b - - 2 34",
"r1b2k1r/5n2/p4q2/1ppn1Pp1/3pp1p1/NP2P3/P1PPBK2/1RQN2R1 w - - 0 22",
"r1bqk2r/pppp1ppp/5n2/4b3/4P3/P1N5/1PP2PPP/R1BQKB1R w KQkq - 0 5",
"r1bqr1k1/pp1p1ppp/2p5/8/3N1Q2/P2BB3/1PP2PPP/R3K2n b Q - 1 12",
"r1bq2k1/p4r1p/1pp2pp1/3p4/1P1B3Q/P2B1N2/2P3PP/4R1K1 b - - 2 19",
"r4qk1/6r1/1p4p1/2ppBbN1/1p5Q/P7/2P3PP/5RK1 w - - 2 25",
"r7/6k1/1p6/2pp1p2/7Q/8/p1P2K1P/8 w - - 0 32",
"r3k2r/ppp1pp1p/2nqb1pn/3p4/4P3/2PP4/PP1NBPPP/R2QK1NR w KQkq - 1 5",
"3r1rk1/1pp1pn1p/p1n1q1p1/3p4/Q3P3/2P5/PP1NBPPP/4RRK1 w - - 0 12",
"5rk1/1pp1pn1p/p3Brp1/8/1n6/5N2/PP3PPP/2R2RK1 w - - 2 20",
"8/1p2pk1p/p1p1r1p1/3n4/8/5R2/PP3PPP/4R1K1 b - - 3 27",
"8/4pk2/1p1r2p1/p1p4p/Pn5P/3R4/1P3PP1/4RK2 w - - 1 33",
"8/5k2/1pnrp1p1/p1p4p/P6P/4R1PK/1P3P2/4R3 b - - 1 38",
"8/8/1p1kp1p1/p1pr1n1p/P6P/1R4P1/1P3PK1/1R6 b - - 15 45",
"8/8/1p1k2p1/p1prp2p/P2n3P/6P1/1P1R1PK1/4R3 b - - 5 49",
"8/8/1p4p1/p1p2k1p/P2npP1P/4K1P1/1P6/3R4 w - - 6 54",
"8/8/1p4p1/p1p2k1p/P2n1P1P/4K1P1/1P6/6R1 b - - 6 59",
"8/5k2/1p4p1/p1pK3p/P2n1P1P/6P1/1P6/4R3 b - - 14 63",
"8/1R6/1p1K1kp1/p6p/P1p2P1P/6P1/1Pn5/8 w - - 0 67",
"1rb1rn1k/p3q1bp/2p3p1/2p1p3/2P1P2N/PP1RQNP1/1B3P2/4R1K1 b - - 4 23",
"4rrk1/pp1n1pp1/q5p1/P1pP4/2n3P1/7P/1P3PB1/R1BQ1RK1 w - - 3 22",
"r2qr1k1/pb1nbppp/1pn1p3/2ppP3/3P4/2PB1NN1/PP3PPP/R1BQR1K1 w - - 4 12",
"2r2k2/8/4P1R1/1p6/8/P4K1N/7b/2B5 b - - 0 55",
"6k1/5pp1/8/2bKP2P/2P5/p4PNb/B7/8 b - - 1 44",
"2rqr1k1/1p3p1p/p2p2p1/P1nPb3/2B1P3/5P2/1PQ2NPP/R1R4K w - - 3 25",
"r1b2rk1/p1q1ppbp/6p1/2Q5/8/4BP2/PPP3PP/2KR1B1R b - - 2 14",
"6r1/5k2/p1b1r2p/1pB1p1p1/1Pp3PP/2P1R1K1/2P2P2/3R4 w - - 1 36",
"rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
"2rr2k1/1p4bp/p1q1p1p1/4Pp1n/2PB4/1PN3P1/P3Q2P/2RR2K1 w - f6 0 20",
"3br1k1/p1pn3p/1p3n2/5pNq/2P1p3/1PN3PP/P2Q1PB1/4R1K1 w - - 0 23",
"2r2b2/5p2/5k2/p1r1pP2/P2pB3/1P3P2/K1P3R1/7R w - - 23 93"
];

//}}}

function uciExec(e) {

  const uci = uciio;

  var messageList = e.split('\n');

  for (var messageNum=0; messageNum < messageList.length; messageNum++ ) {

    var message = messageList[messageNum].replace(/(\r\n|\n|\r)/gm,"");

    message = message.trim();
    message = message.replace(/\s+/g,' ');

    var tokens  = message.split(' ');
    var command = tokens[0];

    if (!command)
      continue;

    switch (command) {

      case 'position':
      case 'p':
        //{{{  position
        
        switch (tokens[1]) {
        
          case 'startpos':
          case 's':
        
            uci.board  = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
            uci.turn   = 'w';
            uci.rights = 'KQkq';
            uci.ep     = '-';
        
            position();
            break;
        
          case 'fen':
          case 'f':
        
            uci.board  = tokens[2];
            uci.turn   = tokens[3];
            uci.rights = tokens[4];
            uci.ep     = tokens[5];
        
            position();
            break;
        
          default:
        
            console.log(command, tokens[1], 'not implemented');
            break;
        }
        
        break;
        
        //}}}

      case 'board':
      case 'b':
        //{{{  board
        
        printBoard();
        
        break;
        
        //}}}

      case 'quit':
      case 'q':
        //{{{  quit
        
        process.exit();
        
        break;
        
        //}}}

      case 'perft':
      case 'r':
        //{{{  perft
        
        const depth = parseInt(tokens[1]);
        
        initSearch();
        
        uci.moves = perft(depth, state.turn);
        
        break;
        
        //}}}

      default:
        //{{{  ?
        
        uciSend(command, 'not implemented');
        
        break;
        
        //}}}
    }
  }
}

//}}}

//{{{  global state

const state = {

  board:  Array(144),
  turn:   0,
  rights: 0,
  ep:     0,

  ply: 0,

  wKingSq: 0,
  bKingSq: 0,

  nextMove: 0,
  moves:    Array(MAX_PLY * MAX_MOVES),
  ranks:    Array(MAX_PLY * MAX_MOVES),

  cacheRights: Array(MAX_PLY),
  cacheEp:     Array(MAX_PLY),

}

const uciio = {}

//}}}

uciExec('position startpos\nboard');
uciArgv();

//{{{  connect to stdio

var fs = require('fs');

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  process.stdin.resume();
  if (chunk !== null) {
    uciExec(chunk);
  }
});

process.stdin.on('end', function() {
  process.exit();
});

//}}}

//}}}
//
// Copy lozza.js above here.
//

//{{{  fens

// ccc-n from http://www.talkchess.com/forum/viewtopic.php?t=47318

var qp = [
  ['fen 4k3/8/8/8/8/8/R7/R3K2R                                  w Q    - 0 1', 3, 4729,      'castling-2'],
  ['fen 4k3/8/8/8/8/8/R7/R3K2R                                  w K    - 0 1', 3, 4686,      'castling-3'],
  ['fen 4k3/8/8/8/8/8/R7/R3K2R                                  w -    - 0 1', 3, 4522,      'castling-4'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b kq   - 0 1', 3, 4893,      'castling-5'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b q    - 0 1', 3, 4729,      'castling-6'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b k    - 0 1', 3, 4686,      'castling-7'],
  ['fen r3k2r/r7/8/8/8/8/8/4K3                                  b -    - 0 1', 3, 4522,      'castling-8'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq - 0 1', 0, 1,         'cpw-pos1-0'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq - 0 1', 1, 20,        'cpw-pos1-1'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq - 0 1', 2, 400,       'cpw-pos1-2'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq - 0 1', 3, 8902,      'cpw-pos1-3'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq - 0 1', 4, 197281,    'cpw-pos1-4'],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq - 0 1', 5, 4865609,   'cpw-pos1-5'],
  ['fen rnbqkb1r/pp1p1ppp/2p5/4P3/2B5/8/PPP1NnPP/RNBQK2R        w KQkq - 0 1', 1, 42,        'cpw-pos5-1'],
  ['fen rnbqkb1r/pp1p1ppp/2p5/4P3/2B5/8/PPP1NnPP/RNBQK2R        w KQkq - 0 1', 2, 1352,      'cpw-pos5-2'],
  ['fen rnbqkb1r/pp1p1ppp/2p5/4P3/2B5/8/PPP1NnPP/RNBQK2R        w KQkq - 0 1', 3, 53392,     'cpw-pos5-3'],
  ['fen r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', 1, 48,        'cpw-pos2-1'],
  ['fen r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', 2, 2039,      'cpw-pos2-2'],
  ['fen r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', 3, 97862,     'cpw-pos2-3'],
  ['fen 8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8                         w -    - 0 1', 5, 674624,    'cpw-pos3-5'],
  ['fen n1n5/PPPk4/8/8/8/8/4Kppp/5N1N                           b -    - 0 1', 1, 24,        'prom-1    '],
  ['fen 8/5bk1/8/2Pp4/8/1K6/8/8                                 w -   d6 0 1', 6, 824064,    'ccc-1     '],
  ['fen 8/8/1k6/8/2pP4/8/5BK1/8                                 b -   d3 0 1', 6, 824064,    'ccc-2     '],
  ['fen 8/8/1k6/2b5/2pP4/8/5K2/8                                b -   d3 0 1', 6, 1440467,   'ccc-3     '],
  ['fen 8/5k2/8/2Pp4/2B5/1K6/8/8                                w -   d6 0 1', 6, 1440467,   'ccc-4     '],
  ['fen 5k2/8/8/8/8/8/8/4K2R                                    w K    - 0 1', 6, 661072,    'ccc-5     '],
  ['fen 4k2r/8/8/8/8/8/8/5K2                                    b k    - 0 1', 6, 661072,    'ccc-6     '],
  ['fen 3k4/8/8/8/8/8/8/R3K3                                    w Q    - 0 1', 6, 803711,    'ccc-7     '],
  ['fen r3k3/8/8/8/8/8/8/3K4                                    b q    - 0 1', 6, 803711,    'ccc-8     '],
  ['fen r3k2r/1b4bq/8/8/8/8/7B/R3K2R                            w KQkq - 0 1', 4, 1274206,   'ccc-9     '],
  ['fen r3k2r/7b/8/8/8/8/1B4BQ/R3K2R                            b KQkq - 0 1', 4, 1274206,   'ccc-10    '],
  ['fen r3k2r/8/3Q4/8/8/5q2/8/R3K2R                             b KQkq - 0 1', 4, 1720476,   'ccc-11    '],
  ['fen r3k2r/8/5Q2/8/8/3q4/8/R3K2R                             w KQkq - 0 1', 4, 1720476,   'ccc-12    '],
  ['fen 2K2r2/4P3/8/8/8/8/8/3k4                                 w -    - 0 1', 6, 3821001,   'ccc-13    '],
  ['fen 3K4/8/8/8/8/8/4p3/2k2R2                                 b -    - 0 1', 6, 3821001,   'ccc-14    '],
  ['fen 8/8/1P2K3/8/2n5/1q6/8/5k2                               b -    - 0 1', 5, 1004658,   'ccc-15    '],
  ['fen 5K2/8/1Q6/2N5/8/1p2k3/8/8                               w -    - 0 1', 5, 1004658,   'ccc-16    '],
  ['fen 4k3/1P6/8/8/8/8/K7/8                                    w -    - 0 1', 6, 217342,    'ccc-17    '],
  ['fen 8/k7/8/8/8/8/1p6/4K3                                    b -    - 0 1', 6, 217342,    'ccc-18    '],
  ['fen 8/P1k5/K7/8/8/8/8/8                                     w -    - 0 1', 6, 92683,     'ccc-19    '],
  ['fen 8/8/8/8/8/k7/p1K5/8                                     b -    - 0 1', 6, 92683,     'ccc-20    '],
  ['fen K1k5/8/P7/8/8/8/8/8                                     w -    - 0 1', 6, 2217,      'ccc-21    '],
  ['fen 8/8/8/8/8/p7/8/k1K5                                     b -    - 0 1', 6, 2217,      'ccc-22    '],
  ['fen 8/k1P5/8/1K6/8/8/8/8                                    w -    - 0 1', 7, 567584,    'ccc-23    '],
  ['fen 8/8/8/8/1k6/8/K1p5/8                                    b -    - 0 1', 7, 567584,    'ccc-24    '],
  ['fen 8/8/2k5/5q2/5n2/8/5K2/8                                 b -    - 0 1', 4, 23527,     'ccc-25    '],
  ['fen 8/5k2/8/5N2/5Q2/2K5/8/8                                 w -    - 0 1', 4, 23527,     'ccc-26    '],
  ['fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR             w KQkq - 0 1', 6, 119060324, 'cpw-pos1-6'],
  ['fen 8/2pkp3/8/RP3P1Q/6B1/8/2PPP3/rb1K1n1r                   w -    - 0 1', 6, 181153194, 'ob1       '],
  ['fen 8/2ppp3/8/RP1k1P1Q/8/8/2PPP3/rb1K1n1r                   w -    - 0 1', 6, 205552081, 'ob2       '],
  ['fen 8/8/3q4/4r3/1b3n2/8/3PPP2/2k1K2R                        w K    - 0 1', 6, 207139531, 'ob3       '],
  ['fen 4r2r/RP1kP1P1/3P1P2/8/8/3ppp2/1p4p1/4K2R                b K    - 0 1', 6, 314516438, 'ob4       '],
  ['fen r6r/1P4P1/2kPPP2/8/8/3ppp2/1p4p1/R3K2R                  w KQ   - 0 1', 6, 975944981, 'ob5       ']
];

//}}}

var t1 = Date.now();

var n    = 0;
var errs = 0;

for (var i=0; i < qp.length-5; i++) {

  var p = qp[i];

  var fen   = p[0];
  var depth = p[1];
  var moves = p[2];
  var id    = p[3];

  uciExec('position ' + p[0]);
  uciExec('perft '    + p[1]);

  var err = moves - uciio.moves;

  errs += err;

  console.log(id,fen,depth,moves,uciio.moves,err);
}

var t2 = Date.now();

var sec = Math.round((t2-t1)/100)/10;

console.log(sec, 'sec');
console.log(errs,'errors');

process.exit();

