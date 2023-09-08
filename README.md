# Lozza

Lozza was a project with two goals:-

1. To provide a UCI based Javascript chess engine that could easily be included in web pages (examples below).

2. To see how well a traditional mailbox (single thread, no NNUE, no bitboards) Javascript chess engine could do in the CCRL chess engine rating list (there were no Javascript engines listed at the time). Lozza's search is based on the Chess Programming Wiki and it's evaluation function was inspired by Fabien Letouzey's Fruit 2.1.   

I don't plan to do any further work on Lozza, but there are lots of things that could be improved should somebody decide to pick it up: SEE pruning and move-ordering. More pruning techniques in search - e.g. history pruning. Singular extensions, countermove etc. Search parameter tuning. Staged move generation - including trying the TT move before any moves are generated - or at least seperate lists for captures and slides which improves sort times. Optimisations so that calls to ```isKingInCheck``` are minimised. More use of ```const``` and ```let```. Better mobility taking into account unsafe squares - attacked by a P - or PN for RQ. Additional our king and their king based PSTs (1). Better TT - it's currently a very simple always-replace scheme. Better move generation code - it's a mess. Simplified Qsearch - it's also a bit of a mess. Root move sorting. Change to a 0x88 board - I used 12x12 and wrote the move generation code before I had looked at the wiki.  More eval terms (2).

(1) I did a quick experiment with this on top of existing PSTs and got +30 ELO at LTC training on a small data set. Lots of potential here using a bigger data set.

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

A sister repo has more web-based examples for playing and analysing etc. with Lozza.

https://github.com/op12no2/lozza-ui

You can try them here:-

https://op12no2.github.io/lozza-ui

## Play Lozza offline in chess user interfaces

As a UCI engine Lozza can be used in popular chesss user interfaces like Banksia, Winboard, Arena and CuteChess. Download the latest release and then follow the instructions in the ```readme.txt``` file.  Any platform that supports ```Node.js``` can be targetted. 

https://github.com/op12no2/lozza/releases

## Fire up Lozza from the command line

Lozza accesses stdio via ```Node.js``` and will run on any platfrom that supports ```Node.js```.  To type UCI commands into Lozza, start ```Node.js``` with ```lozza.js``` or ```lozza``` as the parameter and then enter UCI commands.  Look at the ```lozUCI``` class in ```lozza.js``` for the subset of UCI implemented and some command extensions.  For example:-

```
> node lozza
ucinewgame
bench
position startpos
eval
go depth 10
quit
```
Commands can also be given on invocation, for example:-

```
> node lozza ucinewgame bench "position startpos" board "go movetime 100" quit
```

NB: ```bench``` does a cumulative node count while searching a list of FENs, displaying the total and the time it took. It's particularly useful when checking that changes that should not affect searching have in fact not affected searching.  

## Acknowledgements

https://www.chessprogramming.org/Fruit - Fruit

https://www.chessprogramming.org/Main_Page - Chess programming wiki

http://ccrl.chessdom.com/ccrl/4040 - CCRL rating list

https://www.wbec-ridderkerk.nl/html/UCIProtocol.html - UCI protocol
