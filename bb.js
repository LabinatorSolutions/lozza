
//{{{  utils

String.prototype.setch = function(i, r) {
  return this.substring(0,i) + r + this.substring(i + r.length);
}

//}}}
//{{{  bitboards

const g_white = 0;
const g_black = 1;

//{{{  g_sq

const g_sq = {
  a8: 0,  b8: 1,  c8: 2,  d8: 3,  e8: 4,  f8: 5,  g8: 6,  h8: 7,
  a7: 8,  b7: 9,  c7: 10, d7: 11, e7: 12, f7: 13, g7: 14, h7: 15,
  a6: 16, b6: 17, c6: 18, d6: 19, e6: 20, f6: 21, g6: 22, h6: 23,
  a5: 24, b5: 25, c5: 26, d5: 27, e5: 28, f5: 29, g5: 30, h5: 31,
  a4: 32, b4: 33, c4: 34, d4: 35, e4: 36, f4: 37, g4: 38, h4: 39,
  a3: 40, b3: 41, c3: 42, d3: 43, e3: 44, f3: 45, g3: 46, h3: 47,
  a2: 48, b2: 49, c2: 50, d2: 51, e2: 52, f2: 53, g2: 54, h2: 55,
  a1: 56, b1: 57, c1: 58, d1: 59, e1: 60, f1: 61, g1: 62, h1: 63
}

//}}}
//{{{  g_file_masks

const g_file_masks = {
 a: BigInt('0b0000000100000001000000010000000100000001000000010000000100000001'),
 b: BigInt('0b0000001000000010000000100000001000000010000000100000001000000010'),
 c: BigInt('0b0000010000000100000001000000010000000100000001000000010000000100'),
 d: BigInt('0b0000100000001000000010000000100000001000000010000000100000001000'),
 e: BigInt('0b0001000000010000000100000001000000010000000100000001000000010000'),
 f: BigInt('0b0010000000100000001000000010000000100000001000000010000000100000'),
 g: BigInt('0b0100000001000000010000000100000001000000010000000100000001000000'),
 h: BigInt('0b1000000010000000100000001000000010000000100000001000000010000000')
}

//            hgfedcbahgfedcbahgfedcbahgfedcbahgfedcbahgfedcbahgfedcbahgfedcba
//            1111111122222222333333334444444455555555666666667777777788888888

//}}}
//{{{  g_rank_masks

const g_rank_masks = {
  r1: BigInt('0xFF00000000000000'),
  r2: BigInt('0x00FF000000000000'),
  r3: BigInt('0x0000FF0000000000'),
  r4: BigInt('0x000000FF00000000'),
  r5: BigInt('0x00000000FF000000'),
  r6: BigInt('0x0000000000FF0000'),
  r7: BigInt('0x000000000000FF00'),
  r7: BigInt('0x00000000000000FF'),
}

//}}}

function mask(sq) {
  return 1n << BigInt(sq);
}

function serialise_bb(bb, one='1', zero='0') {
  let s = '';
  for (let sq=0; sq<64; sq++) {
    s += mask(sq) & bb ? one : zero;
  }
  return s;
}

function print_bb(bb, title='', sq=-1, ch='x') {
  console.log(title);
  let s = serialise_bb(bb,'1','.');
  if (sq >= 0)
    s = s.setch(sq,ch);
  for (let r=0; r<8; r++)
    console.log(8-r,s.substr(r*8,8).split('').join(' '));
  console.log('  a b c d e f g h');
  console.log(bb);
}

//}}}
//{{{  attacks

const g_white_pawn_attacks = new BigUint64Array(64);
const g_black_pawn_attacks = new BigUint64Array(64);

function gen_white_pawn_attacks() {

  for (let sq=0; sq<64; sq++) {
    let sq_bb = mask(sq);
    let att_bb = 0n;
    if (!(sq_bb & g_file_masks.a))
      att_bb |= (sq_bb >> 9n);
    if (!(sq_bb & g_file_masks.h))
      att_bb |= (sq_bb >> 7n);
    g_white_pawn_attacks[sq] = att_bb;
  }
}

function gen_black_pawn_attacks() {

  for (let sq=0; sq<64; sq++) {
    let sq_bb = mask(sq);
    let att_bb = 0n;
    if (!(sq_bb & g_file_masks.a))
      att_bb |= (sq_bb << 7n);
    if (!(sq_bb & g_file_masks.h))
      att_bb |= (sq_bb << 9n);
    g_black_pawn_attacks[sq] = att_bb;
  }
}


//}}}
//{{{  io

const g_coords = [
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
];

//}}}

gen_white_pawn_attacks();
gen_black_pawn_attacks();

print_bb(g_white_pawn_attacks[g_sq.a2]);

