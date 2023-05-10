# Lozza

Lozza was a project with two goals:-

1. To provide a relatively strong Javascript chess engine that could be easily included in web pages (examples below).

2. To see how well a traditional mailbox (no NNUE, no bitboards) Javascript chess engine running under ```Node.js``` could do in the CCRL chess engine rating list (there were none at the time). Lozza's algorithms are based on the Chess Programming Wiki and it's evaluation function was inspired by Fabien Letouzey's Fruit 2.1. Lozza acheived a rating of ~2700.   

I don't plan to do any further work on Lozza, but there are lots of things that could be improved should somebody be willing to take it on: SEE pruning and move-ordering. More pruning techniques in search. Singular extensions etc. Search parameter tuning. Staged move generation - including trying the TT move before any moves are generated - or at least seperate lists for captures and slides which improves sort times. Optimisations so that calls to ```isKingInCheck``` are minimised. More use of ```const``` and ```let```. Better mobility taking into account unsafe squares - attacked by a P - or PN for RQ. Additional our king and their king based PSTs (1). Better TT - it's a very simple always-replace scheme. Better move generation code - it's a mess. Simplified Qsearch - it's also a bit of a mess. Change to a 0x88 board - I used 12x12 and wrote the move generation code before I had looked at the wiki.  More eval terms (2).

(1) I did a quick experiment with this on top of existing PSTs and got +30 at LTC training on a small data set. Lots of potential here using a bigger data set.
(2) Adding terms to eval always seems to help, even if they are computationally expensive on a mailbox board.

## Basic use in web pages

All you need is ```lozza.js``` from the root of the repo.  

Here is a little example to do a 10 ply search:-

```Javascript
var lozza = new Worker('lozza.js');

lozza.onmessage = function (e) {
  $('#dump').append(e.data);             //assuming jquery and a div called #dump
                                         //parse messages from here as required
};

lozza.postMessage('uci');                // lozza uses the uci communication protocol
lozza.postMessage('ucinewgame');         // reset tt
lozza.postMessage('position startpos');
lozza.postMessage('go depth 10');        // 10 ply search
```

Try this example here:-

https://op12no2.github.io/lozza-ui/ex.htm

Please note that Lozza's code is folded using ```{{{``` and ```}}}``` (emacs convention) and most easily read using an editor with a folding capability.

## More examples

A sister repo has more examples for playing and analysing etc. with Lozza.

https://github.com/op12no2/lozza-ui

You can try them here:-

https://op12no2.github.io/lozza-ui

## Play Lozza offline in chess user interfaces

As a UCI engine Lozza can be used in popular chesss user interfaces like Banksia, Winboard, Arena and CuteChess. Download the latest release and then follow the instructions in the ```readme.txt``` file.  Any platform that supports ```Node.js``` can be targetted. 

https://github.com/op12no2/lozza/releases

## Acknowledgements

https://www.chessprogramming.org/Fruit - Fruit

https://www.chessprogramming.org/Main_Page - Chess programming wiki

http://ccrl.chessdom.com/ccrl/4040 - CCRL rating list
