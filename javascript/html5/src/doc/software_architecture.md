# Software Architecture – Buff and Green

> Copyright (c) 2016, 2026 Oliver Merkel. MIT License.

## 1. Overview

This project is a browser-only single-page application implementing the Buff and Green (American Checkers) game with optional AI players and configurable local rule variations.
It uses modern ES modules, a Web Worker for game/AI control, and no runtime framework.

Core characteristics:

- ES module architecture with a single entry point.
- Pure board state transitions for deterministic testing.
- Worker-owned authoritative game state.
- MCTS/UCT AI engine reused across rule implementations.
- SVG renderer in the main thread.
- Vitest unit tests and Playwright E2E tests.

For detailed UCT/MCTS internals and budget tuning, see [engine_mcts_ucb.md](engine_mcts_ucb.md).

## 2. High-Level Architecture

```mermaid
flowchart TB
  subgraph MAIN[Main Thread]
    IDX[index.html]
    HMI[js/hmi.js]
    STORE[js/store.js]
    RENDERER[js/renderer.js]
    BOARD[js/board.js]

    IDX --> HMI
    HMI --> STORE
    HMI --> RENDERER
    HMI --> BOARD
  end

  subgraph WORKER[Web Worker]
    CTRL[js/controller.js]
    BOARDW[js/board.js Board adapter]
    UCT[js/uct/uct.js]
    UCTNODE[js/uct/uctnode.js]

    CTRL --> BOARDW
    CTRL --> UCT
    UCT --> UCTNODE
  end

  HMI <--> |postMessage| CTRL
```

## 3. Runtime Data Flow

1. UI sends `start`, `restart`, `move`, `action_by_ai`, or `sync` requests to the worker.
2. Worker updates board state and posts `redraw`, `human_to_move`, or `ai_to_move` messages.
3. HMI maps worker messages to store actions.
4. Store updates state and triggers renderer updates.

Main move loop:

- Human picks a selectable column.
- Worker validates and applies `doAction`.
- If game is terminal, worker stops handoff.
- Otherwise worker posts `human_to_move` or `ai_to_move`.

UI status loop:

- Store updates trigger board re-render in `renderer.render(boardState, selectableActions)`.  
- Header title changes by active view (or to `AI thinking...` during AI turns).  
- Header badge reflects side-specific strengths and profile (for example `R Easy | W Hard | Desktop`).

## 4. Module Responsibilities

### `js/common.js`

Shared constants:

- `COLUMNS = 8`, `ROWS = 8`
- `EMPTY = 0`, `SOUTH = 1`, `NORTH = 2`, `SOUTH_KING = 3`, `NORTH_KING = 4`
- `PLAYERS = { HUMAN, AI }`

UI terminology uses Red and White for the two players. Internal state and settings
still refer to those same two sides as South and North.

### `js/board.js`

Pure American Checkers state logic plus mutable adapter class for UCT.

State shape:

```js
{
  active: 0 | 1,
  grid: number[8][8],
  winner: 0 | 1 | null,
  isDraw: boolean,
  latestMove: { from, to, isCapture, player } | null,
  winningLine: null,
  pendingCaptureFrom: { row, col } | null,
  halfMoveClock: number,
  allowBackwardCapture: boolean,
  allowLongKingJumps: boolean
}
```

Key exports:

- `createBoard()`
- `getActions(board)` -> legal checkers actions
- `doAction(board, action)` -> apply a move or capture, evaluate terminal state
- `getResult(board)` -> reward vector for UCT
- `Board` mutable adapter (`getActions`, `doAction`, `copy`, `getResult`, `active`)

Rule toggles stored in board state:

- `allowBackwardCapture`: when `true`, unpromoted pieces may capture both forward and backward; when `false`, they capture forward only.
- `allowLongKingJumps`: when `true`, kings move any distance diagonally across empty squares and capture after sliding to the first opponent piece with a free landing square directly behind it; when `false`, kings use adjacent-step movement and adjacent captures.

### `js/renderer.js`

SVG board renderer for an 8x8 checkers board.

- `createRenderer(container, onCellClick)`
- `render(boardState, selectableActions, selectedCell)`
- Highlights selectable origins, destinations, the latest source square, and the latest moved piece.
- Uses board status text for win/draw states.

### `js/store.js`

Reactive state container and reducer.

Main UI state fields:

- `view`
- `board`
- `selectableActions`
- `phase`
- `settings: { playerSouth, playerNorth, difficultySouth, difficultyNorth, deviceProfile, resolvedDeviceProfile, allowBackwardCapture, allowLongKingJumps }`

Actions:

- `NAVIGATE`
- `ENGINE_BOARD_UPDATE`
- `HUMAN_TURN_READY`
- `AI_THINKING`
- `SETTINGS_CHANGE`
- `NEW_GAME`

### `js/controller.js`

Worker-side orchestration.

- Owns board state (`Board` instance).
- Applies settings from UI, including independent Red/White difficulty, resolved device profile, and rule toggles for backward checker captures and king long jumps.
- Uses profile-specific MCTS budget tables (Desktop/Mobile).
- Chooses the budget by active side each AI turn:
  - player 0 (Red/South) uses `difficultySouth`
  - player 1 (White/North) uses `difficultyNorth`
- Delegates AI move selection to `Uct.getActionInfo(...)`.

Algorithm details, UCB equation, and parameter interaction are documented in
[engine_mcts_ucb.md](engine_mcts_ucb.md).

### `js/hmi.js`

Main-thread composition module.

- Creates store, renderer, and worker.
- Wires menu/navigation/options events.
- Reads options and sends settings to worker, including the rule toggles.
- Dispatches worker events into store.
- Maintains header side-specific difficulty badge from store settings.

### `index.html`

Main document shell and static view content.

- Defines the game, rules, options, and about sections.
- Documents rule clarifications in the Rules view so the in-app wording matches the engine behavior.
- Exposes options for backward checker capture and king long jumps alongside player and AI settings.

### Worker events and store actions

Worker messages consumed in HMI:

- `redraw` -> `ENGINE_BOARD_UPDATE`
- `human_to_move` -> `HUMAN_TURN_READY`
- `ai_to_move` -> `AI_THINKING` then request `action_by_ai`

Reducer actions in `js/store.js`:

- `NAVIGATE`
- `ENGINE_BOARD_UPDATE`
- `HUMAN_TURN_READY`
- `AI_THINKING`
- `SETTINGS_CHANGE`
- `NEW_GAME`

## 5. Threading Model

- Main thread: rendering, UI events, navigation state.
- Worker thread: rules, turn progression, AI compute.

Worker is the single writer for board state.
Main thread consumes snapshots broadcast by worker.

## 6. Testing

- Unit tests: `tests/unit/*.test.js`
  - Board rule behavior
  - UCT behavior and adapter integration
- E2E tests: `tests/e2e/game.spec.js`
  - Navigation and options
  - Difficulty badge updates
  - Interactive move flow
  - Accessibility smoke checks

## 7. Folder Structure

```text
src/
├── index.html
├── css/index.css
├── doc/software_architecture.md
├── js/
│   ├── common.js
│   ├── board.js
│   ├── controller.js
│   ├── hmi.js
│   ├── renderer.js
│   ├── store.js
│   └── uct/
│       ├── uct.js
│       └── uctnode.js
└── tests/
    ├── e2e/game.spec.js
    └── unit/*.test.js
```
