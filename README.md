# Lozza

A Javascript chess engine inspired by Fabien Letouzey's Fruit 2.1. 

It's easy to use Lozza in your web projects by firing it up a web worker and then communicating using the UCI protocol.

Lozza code is folded using {{{ and }}} (emacs convention) and most easily read using an editor with a folding capability.

## Basic use

All you need is lozza.js from the root of the repo. 

Note that lozza.js has tuning and debug code marked with ##ifdef, which will _signigicantly affect performance_. It is potentially useful during development, but can be removed like this:-

```
Windows: findstr -V ##ifdef lozza.js > clean.js
Linux:   grep -v \#\#ifdef lozza.js > clean.js
```

Here is a little example to do a 10 ply search:-

```Javascript
var lozza = new Worker('lozza.js');

lozza.onmessage = function (e) {
  $('#dump').append(e.data);             //assuming jquery and a div called #dump
                                         //parse messages from here as required
};

lozza.postMessage('uci');                // get build etc
lozza.postMessage('ucinewgame');         // reset TT
lozza.postMessage('position startpos');
lozza.postMessage('go depth 10');        // 10 ply search
```

Try this example here:-

https://op12no2.github.io/lozza-ui/ex.htm

## More examples

A sister repo has more examples for playing and analysing etc. with Lozza.

https://github.com/op12no2/lozza-ui

You can try them here:-

https://op12no2.github.io/lozza-ui

## Testing and tuning

There are various scripts in the testing directory that can be run with Node.js. There are also some Python scripts that evaluate small networks, but to date integration into Lozza has failed. Lozza is tuned using "Texel tuning", but instead of win-loss-draw labels, the loss function measures ```sigmoid(eval) - sigmoid(50ms search result)```. Training data is currently a subset of Andrew Grant's (Ethereal) "data dump" and Alexandru Moșoi's (Zurichess) ```quiet-labeled.epd```. There is a web-based PERFT script that can be run here:-

https://op12no2.github.io/lozza-ui/perft.htm

## Play Lozza offline in chess user interfaces

https://github.com/op12no2/lozza/releases
  
## Acknowledgements

https://www.chessprogramming.org/Fruit - Fruit

https://www.chessprogramming.org/Main_Page - Chess programming wiki

http://ccrl.chessdom.com/ccrl/4040 - CCRL rating list

https://www.chessprogramming.org/Texel%27s_Tuning_Method - Texel tuning

https://github.com/AndyGrant/Ethereal/blob/master/Tuning.pdf - A nice overview of gradient descent

http://wbec-ridderkerk.nl/html/UCIProtocol.html - UCI protocol

https://github.com/davidbau/seedrandom - Random number generator used for Zobrist hashing

https://cutechess.com - Cute Chess

http://www.talkchess.com/forum3/viewtopic.php?f=7&t=75350 - Andrew Grant's "data dump"

https://bitbucket.org/zurichess/tuner/downloads - Alexandru Moșoi's quiet-labeled.epd

https://nodejs.org - Node.js
