# Lozza

A UCI Javascript chess engine. Try her here:-

https://op12no2.github.io/lozza-ui

## Basic use in your web pages

All you need is ```lozza.js``` from repo root.  

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

https://www.chessprogramming.org/Main_Page - Chess programming wiki

https://computerchess.org.uk/ccrl/4040 - CCRL rating list

https://www.wbec-ridderkerk.nl/html/UCIProtocol.html - UCI protocol

https://discord.gg/uM8J3x46 - Engine Programming Discord

https://talkchess.com - Talkchess forums

https://www.chessprogramming.org/Fruit - Fruit 2.1

