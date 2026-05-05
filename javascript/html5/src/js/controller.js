// Copyright (c) 2016,2026 Oliver Merkel. All rights reserved.
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
// SPDX-License-Identifier: MIT

import { Board, doAction, getActions } from './board.js';
import { Uct } from './uct/uct.js';

// ---------------------------------------------------------------------------
// Mutable controller state (single worker, no shared state)
// ---------------------------------------------------------------------------

const uct = new Uct();
let board = new Board();
let settings = {
  playerSouth: 'Human',
  playerNorth: 'Human',
  difficultySouth: 'Medium',
  difficultyNorth: 'Medium',
  deviceProfile: 'Auto',
  resolvedDeviceProfile: 'Desktop',
  allowBackwardCapture: true,
  allowLongKingJumps: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const applySettings = (s) => {
  settings = {
    playerSouth: s?.playersouth ?? settings.playerSouth,
    playerNorth: s?.playernorth ?? settings.playerNorth,
    difficultySouth: s?.difficultysouth ?? settings.difficultySouth,
    difficultyNorth: s?.difficultynorth ?? settings.difficultyNorth,
    deviceProfile: s?.deviceprofile ?? settings.deviceProfile,
    resolvedDeviceProfile: s?.resolveddeviceprofile ?? settings.resolvedDeviceProfile,
    allowBackwardCapture: s?.allowbackwardcapture ?? settings.allowBackwardCapture,
    allowLongKingJumps: s?.allowlongkingjumps ?? settings.allowLongKingJumps,
  };
  const boardState = board.getState();
  board.setState({
    ...boardState,
    allowBackwardCapture: settings.allowBackwardCapture,
    allowLongKingJumps: settings.allowLongKingJumps,
  });
};

const getBudget = (difficultySouth, difficultyNorth, activePlayer, deviceProfile, phase) => {
  const sideDifficulty = activePlayer === 0 ? difficultySouth : difficultyNorth;
  const normalizedDifficulty = (sideDifficulty || 'Medium').toLowerCase();
  const normalizedProfile = (deviceProfile || 'Desktop').toLowerCase();

  const byProfile = {
    desktop: {
      easy: {
        start: [8000, 650, 24, 36],
        turn: [30000, 1000, 34, 50],
      },
      medium: {
        start: [40000, 1800, 44, 66],
        turn: [150000, 3000, 56, 80],
      },
      hard: {
        start: [120000, 3200, 66, 96],
        turn: [420000, 6500, 78, 112],
      },
    },
    mobile: {
      easy: {
        start: [4000, 350, 18, 28],
        turn: [12000, 550, 24, 36],
      },
      medium: {
        start: [18000, 900, 32, 48],
        turn: [70000, 1700, 42, 62],
      },
      hard: {
        start: [50000, 1800, 48, 72],
        turn: [180000, 3200, 58, 84],
      },
    },
  };

  const profileTable = byProfile[normalizedProfile] ?? byProfile.desktop;
  const selected = profileTable[normalizedDifficulty] ?? profileTable.medium;
  return selected[phase];
};

const post = (request, extra = {}) =>
  self.postMessage({ class: 'request', request, board: board.getState(), ...extra });

const isAiTurn = () =>
  (board.active === 0 && settings.playerSouth === 'AI') ||
  (board.active === 1 && settings.playerNorth === 'AI');

// ---------------------------------------------------------------------------
// Execute a player move (human or AI)
// ---------------------------------------------------------------------------

const move = (action) => {
  const legal = getActions(board.getState());
  const valid = legal.some((candidate) =>
    candidate.from.row === action?.from?.row &&
    candidate.from.col === action?.from?.col &&
    candidate.to.row === action?.to?.row &&
    candidate.to.col === action?.to?.col
  );
  if (valid) {
    board.setState(doAction(board.getState(), action));
    post('redraw');
    if (board.getState().winner !== null || board.getState().isDraw) return;
    if (isAiTurn()) {
      post('ai_to_move');
    } else {
      post('human_to_move');
    }
  } else {
    post('redraw');
  }
};

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.addEventListener('message', ({ data }) => {
  switch (data.request) {
    case 'start':
    case 'restart': {
      board = new Board();
      applySettings(data.settings);
      post('redraw');
      if (isAiTurn()) {
        const [maxIterations, maxTime, maxDepthSimulation, maxLookAhead] =
          getBudget(
            settings.difficultySouth,
            settings.difficultyNorth,
            board.active,
            settings.resolvedDeviceProfile,
            'start'
          );
        const { action } = uct.getActionInfo(board, maxIterations, maxTime, maxDepthSimulation, maxLookAhead);
        if (action !== null) move(action);
      } else {
        post('human_to_move');
      }
      break;
    }

    case 'action_by_ai': {
      applySettings(data.settings);
      const [maxIterations, maxTime, maxDepthSimulation, maxLookAhead] =
        getBudget(
          settings.difficultySouth,
          settings.difficultyNorth,
          board.active,
          settings.resolvedDeviceProfile,
          'turn'
        );
      const { action } = uct.getActionInfo(board, maxIterations, maxTime, maxDepthSimulation, maxLookAhead);
      if (action !== null) move(action);
      break;
    }

    case 'move': {
      applySettings(data.settings);
      move(data.action);
      break;
    }

    case 'sync': {
      applySettings(data.settings);
      post('redraw');
      break;
    }

    default:
      break;
  }
});
