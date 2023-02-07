@echo off

rem ******** config start

set id=

set tc=20+0.2

set e1=coalface
set e2=candidate

set threads=2

set elo0=0
set elo1=5

set thisver=2.5
set lastver=2.4

set games=20000

rem ******** config end

iff "%id" == "" then
  set id=%@random[1,9999999]
endiff

iff isfile tested\%id.pgn then
  del tested\%id.pgn
endiff

iff "%e1" != "coalface" .and. "%e1" != "candidate" .and. "%e1" != "released" then
  echo no engine e1 = %e1
  quit
endiff

iff "%e2" != "coalface" .and. "%e2" != "candidate" .and. "%e2" != "released" .and. "%e2" != "tt" then
  echo no engine e2 = %e2
  quit
endiff

copy /q ..\..\..\top ..

set a=%@random[1,9999999]

rem *must* still do findstr for v2.4 to work correctly!!!

iff "%1" ne "nocopy" then
  findstr -V ##ifdef ..\lozza.js > coalface.js
  findstr -V ##ifdef ..\history\%thisver\lozza.js > candidate.js
  findstr -V ##ifdef ..\history\%lastver\lozza.js > released.js
endiff

copy /q coalface.js tested\%id-cf.js
copy /q %e1.js      tested\%id-e1.js
copy /q %e2.js      tested\%id-e2.js

fc %e1.js %e2.js

echo.

iff "%1" == "nocopy" then
  echo NOCOPY
  echo.
endiff

set ee1=-engine conf=%e1 tc=0/%tc
set ee2=-engine conf=%e2 tc=0/%tc
set t=-event %id -tournament round-robin -games %games
set r=-resign movecount=3 score=400
set d=-draw movenumber=40 movecount=8 score=10
set o=-repeat -srand %a -openings file=c:\projects\lozza\trunk\testing\data\4moves_noob.epd format=epd order=random plies=16
set s=-sprt elo0=%elo0 elo1=%elo1 alpha=0.05 beta=0.05
set v=-ratinginterval 10
set m=-recover -concurrency %threads
set f=-pgnout tested\%id.pgn min fi

set args=%ee1 %ee2 %t %r %d %o %v %m %s %f

rem add -debug to show all uci comms

set long=%id: %e1.js v %e2.js of %games games or [%elo0,%elo1] at %tc on %threads threads

title %long

echo **********************************************************************************
echo %long
echo **********************************************************************************

echo %long >! tested\%id.log

echo.

echo coalface  ver = %thisver
echo candidate ver = %thisver
echo released  ver = %lastver

echo coalface  ver = %thisver >> tested\%id.log
echo candidate ver = %thisver >> tested\%id.log
echo released  ver = %lastver >> tested\%id.log

echo.

node --version
node -p process.versions.v8

node --version              >> tested\%id.log
node -p process.versions.v8 >> tested\%id.log

echo.

echo cutechess-cli %args

echo cutechess-cli %args >> tested\%id.log

fc %e1.js %e2.js >> tested\%id.log

echo.

"C:\Program Files (x86)\Cute Chess\cutechess-cli" %args

