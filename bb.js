
//{{{  colours and pirces

const WHITE 0;
const BLACK 1;

//}}}
//{{{  squares

const A8=0n;  B8=1n;  C8=2n,  D8=3n,  E8=4n,  F8=5n,  G8=6n,  H8=7n;
const A7=8n;  B7=9n;  C7=10n, D7=11n, E7=12n, F7=13n, G7=14n, H7=15n;
const A6=16n; B6=17n; C6=18n, D6=19n, E6=20n, F6=21n, G6=22n, H6=23n;
const A5=24n; B5=25n; C5=26n, D5=27n, E5=28n, F5=29n, G5=30n, H5=31n;
const A4=32n; B4=33n; C4=34n, D4=35n, E4=36n, F4=37n, G4=38n, H4=39n;
const A3=40n; B3=41n; C3=42n, D3=43n, E3=44n, F3=45n, G3=46n, H3=47n;
const A2=48n; B2=49n; C2=50n, D2=51n, E2=52n, F2=53n, G2=54n, H2=55n;
const A1=56n; B1=57n; C1=58n, D1=59n, E1=60n, F1=61n, G1=62n, H1=63n;

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

const PAWN_ATTACKS = Array([new BigUInt64Array(64),new BigUInt64Array(64)];

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
  for (let rank=0; rank<8; rank++) {
    process.stdout.write(8-rank + ' ');
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

let bb = 0n;

bb = setBit(bb,E4);
bb = setBit(bb,C3);
bb = setBit(bb,F2);

bb = clrBit(bb,E4);

printBitboard(bb);

