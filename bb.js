
//{{{  colours and pirces

const WHITE  = 0;
const BLACK  = 1;

//}}}
//{{{  squares, files, ranks

const A8=0;  B8=1;  C8=2,  D8=3,  E8=4,  F8=5,  G8=6,  H8=7;
const A7=8;  B7=9;  C7=10, D7=11, E7=12, F7=13, G7=14, H7=15;
const A6=16; B6=17; C6=18, D6=19, E6=20, F6=21, G6=22, H6=23;
const A5=24; B5=25; C5=26, D5=27, E5=28, F5=29, G5=30, H5=31;
const A4=32; B4=33; C4=34, D4=35, E4=36, F4=37, G4=38, H4=39;
const A3=40; B3=41; C3=42, D3=43, E3=44, F3=45, G3=46, H3=47;
const A2=48; B2=49; C2=50, D2=51, E2=52, F2=53, G2=54, H2=55;
const A1=56; B1=57; C1=58, D1=59, E1=60, F1=61, G1=62, H1=63;

const A8n=0n;  B8n=1n;  C8n=2n,  D8n=3n,  E8n=4n,  F8n=5n,  G8n=6n,  H8n=7n;
const A7n=8n;  B7n=9n;  C7n=10n, D7n=11n, E7n=12n, F7n=13n, G7n=14n, H7n=15n;
const A6n=16n; B6n=17n; C6n=18n, D6n=19n, E6n=20n, F6n=21n, G6n=22n, H6n=23n;
const A5n=24n; B5n=25n; C5n=26n, D5n=27n, E5n=28n, F5n=29n, G5n=30n, H5n=31n;
const A4n=32n; B4n=33n; C4n=34n, D4n=35n, E4n=36n, F4n=37n, G4n=38n, H4n=39n;
const A3n=40n; B3n=41n; C3n=42n, D3n=43n, E3n=44n, F3n=45n, G3n=46n, H3n=47n;
const A2n=48n; B2n=49n; C2n=50n, D2n=51n, E2n=52n, F2n=53n, G2n=54n, H2n=55n;
const A1n=56n; B1n=57n; C1n=58n, D1n=59n, E1n=60n, F1n=61n, G1n=62n, H1n=63n;

const MASK_FILE_An = BigInt('0b0000000100000001000000010000000100000001000000010000000100000001');
const MASK_FILE_Bn = BigInt('0b0000001000000010000000100000001000000010000000100000001000000010');
const MASK_FILE_Cn = BigInt('0b0000010000000100000001000000010000000100000001000000010000000100');
const MASK_FILE_Dn = BigInt('0b0000100000001000000010000000100000001000000010000000100000001000');
const MASK_FILE_En = BigInt('0b0001000000010000000100000001000000010000000100000001000000010000');
const MASK_FILE_Fn = BigInt('0b0010000000100000001000000010000000100000001000000010000000100000');
const MASK_FILE_Gn = BigInt('0b0100000001000000010000000100000001000000010000000100000001000000');
const MASK_FILE_Hn = BigInt('0b1000000010000000100000001000000010000000100000001000000010000000');

const MASK_RANK_1n = BigInt('0b1111111100000000000000000000000000000000000000000000000000000000');
const MASK_RANK_2n = BigInt('0b0000000011111111000000000000000000000000000000000000000000000000');
const MASK_RANK_3n = BigInt('0b0000000000000000111111110000000000000000000000000000000000000000');
const MASK_RANK_4n = BigInt('0b0000000000000000000000001111111100000000000000000000000000000000');
const MASK_RANK_5n = BigInt('0b0000000000000000000000000000000011111111000000000000000000000000');
const MASK_RANK_6n = BigInt('0b0000000000000000000000000000000000000000111111110000000000000000');
const MASK_RANK_7n = BigInt('0b0000000000000000000000000000000000000000000000001111111100000000');
const MASK_RANK_8n = BigInt('0b0000000000000000000000000000000000000000000000000000000011111111');

const COORDS = [
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
//{{{  attacks

const PAWN_ATTACKS = Array([new BigUint64Array(64),new BigUint64Array(64)]);

function pawnAttackMask(sq, side) {

  let attacks = 0n;
  let bb      = 0n

  bb = setBit(bb,sq);

  if (!side) {
  }

  else {
  }
}

//}}}
//{{{  bitboard functions

function getBit (bb,sq) {
  return bb & (1n << sq);
}

function setBit (bb,sq) {
  return bb | (1n << sq);
}

function clrBit (bb,sq) {
  return bb & ~(1n << sq);
}

function printBitboard(bb) {
  console.log();
  for (let rank=0; rank<8; rank++) {
    process.stdout.write(' ' + 8-rank + ' ');
    for (let file=0; file<8; file++) {
      let sq  = BigInt(rank*8 + file);
      let lsb = getBit(bb,sq) ? '1 ' : '0 ';
      process.stdout.write(lsb);
    }
    process.stdout.write('\r\n');
  }
  console.log('  a b c d e f g h');
  console.log(bb);
}

//}}}

let bb= 0n;

bb = RANK_1;
printBitboard(bb);

