# Buff and Green

[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=000)](https://developer.mozilla.org/docs/Web/JavaScript)
[![UI: HTML5](https://img.shields.io/badge/UI-HTML5-E34F26?logo=html5&logoColor=fff)](https://developer.mozilla.org/docs/Web/HTML)
[![Style: CSS3](https://img.shields.io/badge/Style-CSS3-1572B6?logo=css3&logoColor=fff)](https://developer.mozilla.org/docs/Web/CSS)
[![Concurrency: Web Worker](https://img.shields.io/badge/Concurrency-Web%20Worker-0A66C2)](https://developer.mozilla.org/docs/Web/API/Web_Workers_API)
[![Tests: Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=fff)](https://vitest.dev)
[![E2E: Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=fff)](https://playwright.dev)
[![AI: MCTS/UCT](https://img.shields.io/badge/AI-MCTS%2FUCT-5B4B8A)](javascript/html5/src/doc/engine_mcts_ucb.md)
[![Coverage: >90%](https://img.shields.io/badge/Coverage-%3E90%25-brightgreen)](javascript/html5/src/README.md#testing)

## Abstract

_Buff and Green_ is an implementation of a game also known as Checkers,
Draughts, Dama, Damas, Dame. These other names besides _Buff and Green_
are used here to refer to the game in more general scope. Like when discussing
specific rule variants or if the whole family of Checkers games is meant.
The _family of Checkers games_ is played on rectangular game boards
and game pieces called _checkers_. These are placed and moved on squares
representing the game board. Checkers claims to be a successor of
[Alquerque](https://github.com/OMerkel/Alquerque).

Alquerque is a medieval Spanish board game. Both, Checkers and Alquerque,
are 2-player, abstract, strategic, perfect information,
traditional board games.

## Rules in Buff and Green

### Objective of the game

Objective of the game is to be the last player performing a valid move
according to the rules. Meaning the player being not able to move will
lose the game. This may occur when either all own checkers have been
captured by the opponent or all remaining own checkers have no valid
moves left.

Draw situations might occur.

The draw clock reaches a draw after 80 half-moves (or 40 full moves)
without a capture and without a promotion. A _half-move_ is called a
_ply_, too.

This is defined by the `DRAW_HALF_MOVES` constant in `board.js`:

```javascript
const DRAW_HALF_MOVES = 80;
```

### Game Mechanics

Players' turns alternate between players. The player controlling
red checkers (dark checkers) moves first in Buff and Green. A player either

* must capture opponent’s pieces if possible or
* must perform a normal non-capturing move otherwise.

Passing a turn is not allowed.

### Non-capturing Move

A Checker's non-capturing move is performed by moving the checker in
diagonally forward direction onto a free adjacent board position.
A non-capturing move of a Checker is not allowed in diagonally
backwards direction.

Per default Kings move by performing long jumps. A King moves in any diagonally
forward and diagonally backward direction in a straight line across any
amount of free board positions. A King's move ends on one of those free
board positions. If the option is switched off, Kings move only to an
adjacent free square in any diagonal direction.

### Promotion

A checker reaching the base row of the opponent on the far side
of the game board is promoted to King status.

If a checker is reaching this far side of the game board by performing
a capture and is still able to consecutively capture as a checker
it must perform the capture without being promoted to king.

### Capturing

Capturing is mandatory. A checker of your color captures an
opponent's game piece being adjacent to your checker by jumping
directly behind it onto a free adjacent board position in straight
line diagonally.

Per default, normal unpromoted Checkers may capture in any valid diagonally
forward and diagonally backward direction. If the backward-capture option is
switched off, normal unpromoted Checkers may capture only in diagonally
forward direction.

Only a single opponent's game piece can be captured at a time. Meaning you
can't jump over two or more adjacent opponent's game pieces to capture these
at once.

The captured opponent's checker or king is removed immediately while the capture
takes place. Thus in multi-jumps such a checker of king is not available to be
jumped more than once. It's already removed.

If the capturing game piece is able to consecutively perform further
capturing from it's target board position the player must continue
to capture with this game piece.

Per default Kings perform long jump captures. A King may travel across empty
diagonal squares until reaching the first opponent piece on that line and, if
the square directly behind it is free, captures by landing on that adjacent
square. If the option is switched off, Kings capture only by jumping an
adjacent opponent piece to the adjacent free square behind it.

On availability of multiple consecutive capturing paths on a player's
turn it is not necessary to capture on the longest capturing path. The player
can freely choose among given capturing paths but still has to continue capturing
until no further capture is available on a path.

## Play online

* [Play Buff and Green online](https://omerkel.github.io/Buff-and-Green/javascript/html5/src/)

## PWA - Progressive Web App

Buff and Green is a Progressive Web App (PWA), which means you can install it on your device for a native app-like experience. The PWA includes offline support, allowing you to continue playing even without an internet connection.

### Features

* **Installable**: Install the app on your home screen or application menu
* **Offline Play**: Play games offline after the app is first loaded
* **Fast Loading**: Cached assets load quickly on repeat visits
* **Native Look and Feel**: Runs in standalone mode without browser UI
* **Works Across Platforms**: Install on desktop, tablet, or mobile devices

### Installation Instructions

#### Windows, macOS, Linux (Chrome, Edge, Brave, or Opera)

1. Visit [Play Buff and Green online](https://omerkel.github.io/Buff-and-Green/javascript/html5/src/)
2. Look for the install prompt in the address bar (if available) or click the menu icon ⋯
3. Select **"Install app"** or **"Install Buff and Green"**
4. Confirm the installation
5. The app will appear on your desktop or in your applications menu

Alternatively, open the browser menu and navigate to **Settings** → **Apps** → **Install this site as an app**.

#### Android (Chrome, Edge, Firefox, or Samsung Internet)

1. Visit [Play Buff and Green online](https://omerkel.github.io/Buff-and-Green/javascript/html5/src/)
2. Tap the browser menu (⋯ or ⋮)
3. Select **"Install app"** or **"Add to Home Screen"**
4. Confirm by tapping **"Install"** or **"Add"**
5. The app icon will appear on your home screen

#### iOS (Safari)

1. Visit [Play Buff and Green online](https://omerkel.github.io/Buff-and-Green/javascript/html5/src/) in Safari
2. Tap the Share button (box with arrow ⬆)
3. Scroll down and select **"Add to Home Screen"**
4. Enter a name for the app (or use the default "Buff and Green")
5. Tap **"Add"** in the top-right corner
6. The app icon will appear on your home screen

### Using Offline

Once installed and loaded at least once, Buff and Green works offline:

* All game assets (board, pieces, UI) are cached
* You can start new games without an internet connection
* Your game progress is preserved locally
* The app will sync any changes when you reconnect

### Technical Details

The PWA is built with:

* **Service Worker** (`sw.js`): Handles offline caching and network requests
* **Web App Manifest** (`manifest.json`): Defines app metadata, icons, and display settings
* **PWA Meta Tags**: Ensures cross-platform compatibility and proper app installation

## Testing

### Running Tests

The automated tests live in the HTML5 project under `javascript/html5/src`.
Quick path: install dependencies, run unit tests, then run E2E tests.
From the repository root, run tests using npm's `--prefix` option:

```sh
npm --prefix javascript/html5/src test
```

Run Vitest in watch mode during development:

```sh
npm --prefix javascript/html5/src run test:watch
```

Generate unit-test coverage output:

```sh
npm --prefix javascript/html5/src run test:coverage
```

Run the end-to-end browser tests with Playwright:

```sh
npm --prefix javascript/html5/src run test:e2e
```

Run the full test suite in one command:

```sh
npm --prefix javascript/html5/src run test:all
```

Playwright starts the local test server automatically on `http://localhost:4173`.

Unit tests are located in `tests/unit/*.test.js` and end-to-end tests are
located in `tests/e2e/*.spec.js`.

## Links

* [Association for the Advancement of Artificial Intelligence](http://www.aaai.org)
* [HTML Living Standard, Web Workers](https://html.spec.whatwg.org)
* [Portable Draughts Notation (PDN) 3.0 standard 1.0 documentation](http://pdn.fmjd.org)

### Rules

Mind that official tournament rules of the listed organizations differ from each other.
Buff and Green is independent development from any work of these organizations.

* [Official FMJD tournament rules of International Draughts](https://fmjd.org/?p=annex)
* [Official FMJD Section 64 IDF tournament rules of Draughts-64](https://fmjd64.org/rules-of-the-game)
* [Official Confederação Brasileira de Jogo de Damas tournament rules of Brazilian Draughts](http://www.codexdamas.com.br/english_rules.html)
* [FMJD published rules of Turkish Dama](http://www.fmjd.org/downloads/td/TD_eng.pdf)
* [Official WCDF tournament rules of Draughts-64](http://www.wcdf.net/rules/rules_of_checkers_english.pdf)
* [Official APCA tournament rules of American Pool](http://www.americanpoolcheckers.us/americanpoolcheckers/index.php/history/apca-tournament-rules-of-play)

### Organizations

Mind that official tournament rules of the listed organizations differ from each other.
Buff and Green is independent development from any work of these organizations.

* [Fédération Mondiale du Jeu de Dames (FMJD)](http://www.fmjd.org), founded in 1947
  * [Variants listed at FMJD](http://fmjd.org/variant.php): 100 International, 64 Brazilian, 64 Checkers, 64 Czech, 64 Italian, 64 Pool, 64 Russian, 64 Spanish, 144 squares, [Turkish Dama](http://www.fmjd.org/downloads/td/TD_eng.pdf)
* [World Draughts Federation (Federation Mondiale Du Jeu De Dames) FMJD Section 64](https://fmjd64.org), accepted section in FMJD since 1984
* [The International Draughts Federation (IDF)](https://fmjd64.org/idf), founded in 2012 / 2013
* [Confederação Brasileira de Jogo de Damas (CBD)](http://www.codexdamas.com.br)
* [World Checkers Draughts Federation (WCDF)](http://www.wcdf.net)
* [American Pool Checkers Association (APCA)](http://americanpoolcheckers.us)

## Contributors / Authors

* Oliver Merkel

_All logos, brands and trademarks mentioned belong to their respective owners._
