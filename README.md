# Buff-and-Green

## Abstract

_Buff and Green_ is an implementation of a game also known as Checkers,
Draughts, Dama, Damas, Dame. If the name _Buff and Green_ is used then
this specific implementation is meant. The other names are used here
to refer to the game in more general scope. Like when discussing
specific rule variants or if the whole family of Checkers games is meant.
The _family of Checkers games_ is played on rectangular game boards
and game pieces called _checkers_. These are placed and moved on squares
representing the game board. Checkers claims to be a successor of
[Alquerque](https://github.com/OMerkel/Alquerque).
Alquerque is a medieval Spanish board game. Both, Checkers and Alquerque,
are 2-player, abstract, strategic, perfect information,
traditional board games. Due to the variants and differences in
applied rules in the family of Checkers games the rules for
Buff and Green are discussed and selected from the given variety.

## Rules

### Objective of the game

Objective of the game is to be the last player performing a valid move
according to the rules. Meaning the player being not able to move will
lose the game. This may occur when either all own checkers have been
captured by the opponent or all remaining own checkers have no valid
moves left.

Draw situations might occur.

### Game Mechanics

Players' turns alternate between players. The player controlling
dark checkers moves first in Buff and Green. A player either

* must capture opponent’s pieces if possible or
* must perform a normal non-capturing move otherwise.

Passing a turn is not allowed.

### Non-capturing Move

A Checker's non-capturing move is performed by moving the checker in
diagonally forward direction onto a free adjacent board position.
A non-capturing move of a Checker is not allowed in diagonally
backwards direction.

Kings move by performing long jumps. A King moves in any diagonally
forward and diagonally backward direction in straight line passing any
amount of free board positions. A King's move ends on such a free
board position then.

### Promotion

A checker reaching the base row of the opponent on the far side
of the game board by a non-capturing move it is promoted to king status.

If a checker is reaching this far side of the game board by performing
a capture and is still able to consecutively capture as a checker
it must perform the capture without being promoted to king.

### Capturing

Capturing is mandatory. A checker of your color captures an
opponent's game piece being adjacent to your checker by jumping
directly behind it onto a free adjacent board position in straight
line diagonally.

Capturing is allowed in any valid diagonally forward and diagonally backward
direction. Only a single opponent's game piece can be captured at a time.

The captured opponent's checker or king is removed immediately while the capture
takes place.

If the capturing game piece is able to consecutively perform further
capturing from it's target board position the player must continue
to capture with this game piece.

Kings perform long jump captures. ...

On availability of multiple consecutive capturing paths on a player's
turn it is not necessary to capture on the longest capturing path. The player
can freely choose among given capturing paths but still has to continue capturing
until no further capture is available on a path.

## Testing

### Running Tests

Tests can be started by visiting https://omerkel.github.io/Buff-and-Green/html5/test/test_buffngreen.html

The tests cover behavior of

* the board representing the data model of Buff and Green.
* the move generator finding valid moves for a board situation according to the implemented rules.

## 3rd Party Libraries

* jQuery: MIT licensed, https://github.com/jquery/jquery
* jQuery Mobile: MIT licensed, https://github.com/jquery/jquery-mobile
* QUnit: MIT licensed, https://github.com/qunitjs/qunit

## Links

* Association for the Advancement of Artificial Intelligence, http://www.aaai.org
* HTML Living Standard, Web Workers, https://html.spec.whatwg.org
* Portable Draughts Notation (PDN) 3.0 standard 1.0 documentation, http://pdn.fmjd.org

### Rules

Mind that official tournament rules of the listed organizations differ from each other.
Buff and Green is independent development from any work of these organizations.

* Official FMJD tournament rules of International Draughts, https://fmjd.org/?p=annex
* Official FMJD Section 64 IDF tournament rules of Draughts-64, https://fmjd64.org/rules-of-the-game
* Official Confederação Brasileira de Jogo de Damas tournament rules of Brazilian Draughts, http://www.codexdamas.com.br/english_rules.html
* FMJD published rules of Turkish Dama, http://www.fmjd.org/downloads/td/TD_eng.pdf
* Official WCDF tournament rules of Draughts-64, http://www.wcdf.net/rules/rules_of_checkers_english.pdf
* Official APCA tournament rules of American Pool, http://www.americanpoolcheckers.us/americanpoolcheckers/index.php/history/apca-tournament-rules-of-play

### Organizations

Mind that official tournament rules of the listed organizations differ from each other.
Buff and Green is independent development from any work of these organizations.

*  Fédération Mondiale du Jeu de Dames (FMJD), http://www.fmjd.org , founded in 1947
    * [Variants listed at FMJD](http://fmjd.org/variant.php): 100 International, 64 Brazilian, 64 Checkers, 64 Czech, 64 Italian, 64 Pool, 64 Russian, 64 Spanish, 144 squares, [Turkish Dama](http://www.fmjd.org/downloads/td/TD_eng.pdf)
* World Draughts Federation (Federation Mondiale Du Jeu De Dames) FMJD Section 64, https://fmjd64.org , accepted section in FMJD since 1984
* The International Draughts Federation (IDF), https://fmjd64.org/idf , founded in 2012 / 2013
* Confederação Brasileira de Jogo de Damas (CBD), http://www.codexdamas.com.br
* World Checkers Draughts Federation (WCDF), http://www.wcdf.net
* American Pool Checkers Association (APCA), http://americanpoolcheckers.us

## Contributors / Authors

* Oliver Merkel

_All logos, brands and trademarks mentioned belong to their respective owners._
