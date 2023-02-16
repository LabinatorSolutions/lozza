//
// this is about 10 times slower than native bit ops, so abort.
// BitInts are even worse.
//

//{{{  utils

String.prototype.setch = function(i, r) {
  return this.substring(0,i) + r + this.substring(i + r.length);
}

function mask (n) {
  return 1 << n;
}

//}}}
//{{{  bitboard class

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

const g_files = {a:  0, b:  1, c:  2, d:  3, e:  4, f:  5, g:  6, h:  7};
const g_ranks = {r0: 0, r1: 1, r2: 2, r3: 3, r4: 4, r5: 5, r6: 6, r7: 7};

const g_rank = [
  7,7,7,7,7,7,7,7,
  6,6,6,6,6,6,6,6,
  5,5,5,5,5,5,5,5,
  4,4,4,4,4,4,4,4,
  3,3,3,3,3,3,3,3,
  2,2,2,2,2,2,2,2,
  1,1,1,1,1,1,1,1,
  0,0,0,0,0,0,0,0
];

const g_file = [
  0,1,2,3,4,5,6,7,
  0,1,2,3,4,5,6,7,
  0,1,2,3,4,5,6,7,
  0,1,2,3,4,5,6,7,
  0,1,2,3,4,5,6,7,
  0,1,2,3,4,5,6,7,
  0,1,2,3,4,5,6,7,
  0,1,2,3,4,5,6,7
];

function bitboard (hi=0,lo=0) {
  this.b = new Uint32Array(2);
  this.b[0] = lo;
  this.b[1] = hi;
  return this;
}

bitboard.prototype.mask = function(sq) {
  if (sq < 32)
    this.b[0] = 1 << sq;
  else
    this.b[1] = 1 << (32-sq);
}

bitboard.prototype.set = function(sq) {
  if (sq < 32)
    this.b[0] |= 1 << sq;
  else
    this.b[1] |= 1 << (32-sq);
}

bitboard.prototype.get = function(sq) {
  if (sq < 32)
    return this.b[0] & (1 << sq);
  else
    return this.b[1] & (1 << (32-sq));
}

bitboard.prototype.print = function() {
  for (let sq=0; sq<64; sq++) {
    let s = this.get(sq) ? '1 ' : '. ';
    if (((sq) % 8) == 0)
      process.stdout.write(g_rank[sq]+1 + ' ');
    process.stdout.write(s);
    if (((sq+1) % 8) == 0)
      process.stdout.write('\r\n');
  }
  console.log('  a b c d e f g h');
  console.log(this.b[1],this.b[0]);
}

//}}}
//{{{  attacks

//{{{  util masks

const g_sq_masks   = Array(64)
const g_rank_masks = Array(8)
const g_file_masks = Array(8)

function gen_utility_masks() {

  for (let r=0; r<8; r++) {
    g_rank_masks[r] = new bitboard();
  }
  for (let sq=0; sq<64; sq++) {
    g_rank_masks[g_rank[sq]].set(sq);
  }

  for (let f=0; f<8; f++) {
    g_file_masks[f] = new bitboard();
  }
  for (let sq=0; sq<64; sq++) {
    g_file_masks[g_file[sq]].set(sq);
  }

  for (let sq=0; sq<64; sq++) {
    g_sq_masks[sq] = new bitboard();
    g_sq_masks[sq].set(sq);
  }
}

gen_utility_masks();

//}}}
//{{{  pawn attacks

const g_white_pawn_attacks = new Array(64);

function gen_white_pawn_attacks() {

  for (let sq=0; sq<64; sq++) {
    g_white_pawn_attacks[sq] = new bitboard();
    if (g_file[sq] != g_files.a)
      g_white_pawn_attacks[sq].set(sq-9);
    if (g_file[sq] != g_files.h)
      g_white_pawn_attacks[sq].set(sq-7);
  }
}

gen_white_pawn_attacks();

const g_black_pawn_attacks = new Array(64);

function gen_black_pawn_attacks() {

  for (let sq=0; sq<64; sq++) {
    g_black_pawn_attacks[sq] = new bitboard();
    if (g_file[sq] != g_files.a)
      g_black_pawn_attacks[sq].set(sq+7);
    if (g_file[sq] != g_files.h)
      g_black_pawn_attacks[sq].set(sq+9);
  }
}

gen_black_pawn_attacks();

//}}}

//}}}

g_black_pawn_attacks[g_sq.a7].print();
g_black_pawn_attacks[g_sq.e7].print();
g_black_pawn_attacks[g_sq.h7].print();

var t = Date.now();
for (var x=0; x < 500000; x++)
  gen_white_pawn_attacks();
console.log(Date.now()-t);

