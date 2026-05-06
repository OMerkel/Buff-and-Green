# Buff and Green

[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E?logo=javascript&logoColor=000)](https://developer.mozilla.org/docs/Web/JavaScript)
[![UI: HTML5](https://img.shields.io/badge/UI-HTML5-E34F26?logo=html5&logoColor=fff)](https://developer.mozilla.org/docs/Web/HTML)
[![Style: CSS3](https://img.shields.io/badge/Style-CSS3-1572B6?logo=css3&logoColor=fff)](https://developer.mozilla.org/docs/Web/CSS)
[![Concurrency: Web Worker](https://img.shields.io/badge/Concurrency-Web%20Worker-0A66C2)](https://developer.mozilla.org/docs/Web/API/Web_Workers_API)
[![Tests: Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=fff)](https://vitest.dev)
[![E2E: Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=fff)](https://playwright.dev)
[![AI: MCTS/UCT](https://img.shields.io/badge/AI-MCTS%2FUCT-5B4B8A)](doc/engine_mcts_ucb.md)
[![Coverage: >90%](https://img.shields.io/badge/Coverage-%3E90%25-brightgreen)](#testing)

Modern HTML5 implementation of Buff and Green – American Checkers – with a built-in AI based on UCT / MCTS (UCB1).

This project is fully browser-based, uses modern ES modules, and has no runtime UI framework dependency.

---

## Features

- Play Buff and Green (American Checkers) on an 8x8 board.
- Configure players independently: Human vs Human, Human vs AI, AI vs AI.
- Configure AI difficulty independently for Red and White: Easy, Medium, Hard.
- Difficulty badge in the header shows both sides and profile (for example `R Easy | W Hard | Desktop`).
- Reactive UI state store with explicit worker message flow.
- AI move selection via Monte Carlo Tree Search (UCT/UCB1).
- Responsive SVG board rendering.
- Full test suite:
  - Unit tests (Vitest) for board logic and UCT engine.
  - End-to-end tests (Playwright) for gameplay and UI flows.
- PWA - Progressive Web App support for local cached App install

---

## Tech Stack

- Language: JavaScript (ES modules)
- UI: HTML5 + CSS + SVG DOM API
- Concurrency: Web Worker (`js/controller.js`)
- AI: UCT / MCTS (`js/uct/`)
- Unit tests: Vitest
- E2E tests: Playwright

---

## Project Structure

```text
src/
├── index.html
├── README.md
├── package.json
├── vitest.config.js
├── playwright.config.js
├── css/
│   └── index.css
├── doc/
│   ├── engine_mcts_ucb.md
│   └── software_architecture.md
├── js/
│   ├── common.js
│   ├── board.js
│   ├── store.js
│   ├── renderer.js
│   ├── hmi.js
│   ├── controller.js
│   └── uct/
│       ├── uct.js
│       └── uctnode.js
├── tests/
│   ├── server.js
│   ├── unit/
│   │   ├── board.test.js
│   │   └── uct.test.js
│   └── e2e/
│       └── game.spec.js
└── img/
```

---

## Getting Started

### Prerequisites

- Node.js and npm installed.
- A modern browser (Chrome, Firefox, Edge, Safari).

### Install dependencies

```sh
npm install
```

### Run in browser

Because this app uses a module Web Worker, load it through HTTP (not `file://`).

For local manual testing:

```sh
node tests/server.js
```

Then open [http://localhost:4173](http://localhost:4173).

Playwright also starts its own test server automatically for E2E runs.

---

## Usage

1. Open the app.
2. Use the menu button (top-left) to:
   - Start a New Game
   - Open Rules
   - Change Options
   - View About
3. In game mode, click a highlighted piece to select it, then click a highlighted destination square.
4. For AI turns, the worker computes and applies the move automatically.

### Options

- Red player: Human or AI
- White player: Human or AI
- Red AI difficulty: Easy, Medium, Hard
- White AI difficulty: Easy, Medium, Hard
- Normal checker capture: backward captures allowed by default; switch off to limit unpromoted checkers to forward captures only
- King movement: long diagonal moves and long-approach captures enabled by default; switch off to limit kings to adjacent diagonal moves and adjacent captures
- AI device profile: Auto, Desktop, Mobile

In the UI, players are presented as Red and White. In the code and worker settings,
these two sides are stored as `playerSouth` and `playerNorth`.

---

## Buff and Green Rules (Summary)

- The board has 8 columns and 8 rows with buff and green squares.
- Red moves first; pieces move diagonally forward on green (dark) squares.
- Normal unpromoted pieces capture forward and backward by default; the option can restrict them to forward captures only.
- Kings move diagonally in both directions and use long moves by default; the option can restrict them to adjacent diagonal moves only.
- Captures are mandatory; multi-jump sequences continue in the same turn and players may choose any available capture path.
- King captures use the same option as king movement: by default a king may slide across empty diagonal squares to the first opponent piece and lands on the adjacent free square behind it.
- A piece reaching the opponent’s back rank is promoted to king, except during a capture sequence where it must finish any remaining checker captures before promotion.
- Win by capturing all opposing pieces or leaving the opponent with no legal move.
- A draw is declared after 80 half-moves without a capture or a promotion.

---

## Testing

### Run unit tests

```sh
npm test
```

### Watch unit tests

```sh
npm run test:watch
```

### Unit test coverage

```sh
npm run test:coverage
```

Coverage reports are generated locally in `coverage/` and are intentionally git-ignored.

### Run E2E tests

```sh
npm run test:e2e
```

### Run all tests

```sh
npm run test:all
```

### Coverage summary

- Unit tests (`tests/unit`)
  - Buff and Green board creation and legal actions
  - Move application, captures, promotion, and win detection
  - UCT node behaviour and UCT-board integration
- E2E tests (`tests/e2e`)
  - Page load and navigation
  - Options defaults and difficulty updates
  - Header difficulty badge behavior
  - Board interaction and new-game reset
  - Accessibility smoke checks

---

## Architecture Documentation

Detailed architecture is documented in:

- [doc/software_architecture.md](doc/software_architecture.md)
- [doc/engine_mcts_ucb.md](doc/engine_mcts_ucb.md) (UCT/MCTS engine behavior, UCB formula, and budget wiring)

---

## Troubleshooting

### `node` command opens Microsoft HPC help instead of Node.js

On some Windows environments, `node` may resolve to Microsoft HPC's command tool.
The project scripts are shell-agnostic and work across Windows, Linux, and FreeBSD,
but this local command resolution issue can still affect manual terminal commands.

If needed, call npm explicitly:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run test
```

---

## License

- Source code: MIT License
- Image assets: see in-app About section and repository license files.

---

## Credits

Original game implementation and AI foundations by Oliver Merkel.
