@echo off

set e1=lozza4
set e2=lozza3
set threads=1
set tc=60+1
set elo0=0
set elo1=5

set games=20000
set a=%@random[1,9999999]
set pout=c:\projects\data\%a.pgn
set epd=c:\projects\data\4moves_noob.epd

set ee1=-engine conf=%e1 tc=0/%tc
set ee2=-engine conf=%e2 tc=0/%tc
set t=-event test -tournament round-robin -games %games
set r=-resign movecount=3 score=400
set d=-draw movenumber=40 movecount=8 score=10
set o=-repeat -srand %a -openings file=%epd format=epd order=random plies=16
set s=-sprt elo0=%elo0 elo1=%elo1 alpha=0.05 beta=0.05
set v=-ratinginterval 10
set m=-recover -concurrency %threads
set f=-pgnout %pout min fi

set b=-debug
set b=

fc %e1.js %e2.js

set args=%ee1 %ee2 %t %r %d %o %v %m %s %f %b

echo %args

"C:\Program Files (x86)\Cute Chess\cutechess-cli" %args

