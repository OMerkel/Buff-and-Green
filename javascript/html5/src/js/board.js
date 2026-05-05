// Copyright (c) 2016,2026 Oliver Merkel. All rights reserved.
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
// SPDX-License-Identifier: MIT

import {
  COLUMNS,
  EMPTY,
  NORTH,
  NORTH_KING,
  ROWS,
  SOUTH,
  SOUTH_KING,
} from './common.js';

const MEN_BY_PLAYER = [SOUTH, NORTH];
const KINGS_BY_PLAYER = [SOUTH_KING, NORTH_KING];
const FORWARD_BY_PLAYER = [-1, 1];
const DRAW_HALF_MOVES = 80;

const inBounds = (row, col) => row >= 0 && row < ROWS && col >= 0 && col < COLUMNS;
const isDark = (row, col) => (row + col) % 2 === 1;

const pieceOwner = (piece) => {
  if (piece === SOUTH || piece === SOUTH_KING) return 0;
  if (piece === NORTH || piece === NORTH_KING) return 1;
  return null;
};

const isKing = (piece) => piece === SOUTH_KING || piece === NORTH_KING;
const isOwnPiece = (piece, player) => piece !== EMPTY && pieceOwner(piece) === player;
const isOpponentPiece = (piece, player) => piece !== EMPTY && pieceOwner(piece) === 1 - player;

const pieceDirections = (piece, player) => {
  if (isKing(piece)) return [-1, 1];
  return [FORWARD_BY_PLAYER[player]];
};

const pieceCaptureDirections = (piece, player, allowBackwardCapture = true) => {
  if (isKing(piece)) return [-1, 1];
  if (allowBackwardCapture) return [-1, 1];
  return [FORWARD_BY_PLAYER[player]];
};

const createInitialGrid = () =>
  Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLUMNS }, (_, col) => {
      if (!isDark(row, col)) return EMPTY;
      if (row <= 2) return NORTH;
      if (row >= ROWS - 3) return SOUTH;
      return EMPTY;
    })
  );

const cloneGrid = (grid) => grid.map((row) => [...row]);

const shouldPromote = (piece, row) =>
  piece === SOUTH ? row === 0 : (piece === NORTH ? row === ROWS - 1 : false);

const promote = (piece) => {
  if (piece === SOUTH) return SOUTH_KING;
  if (piece === NORTH) return NORTH_KING;
  return piece;
};

const makeMoveAction = (fromRow, fromCol, toRow, toCol) => ({
  from: { row: fromRow, col: fromCol },
  to: { row: toRow, col: toCol },
  capture: null,
  isCapture: false,
});

const makeCaptureAction = (fromRow, fromCol, overRow, overCol, toRow, toCol) => ({
  from: { row: fromRow, col: fromCol },
  to: { row: toRow, col: toCol },
  capture: { row: overRow, col: overCol },
  isCapture: true,
});

const kingMovesAt = (grid, row, col) =>
  [-1, 1]
    .flatMap((dr) => [-1, 1].map((dc) => ({ dr, dc })))
    .flatMap(({ dr, dc }) => {
      const moves = [];
      let toRow = row + dr;
      let toCol = col + dc;

      while (inBounds(toRow, toCol) && grid[toRow][toCol] === EMPTY) {
        moves.push(makeMoveAction(row, col, toRow, toCol));
        toRow += dr;
        toCol += dc;
      }

      return moves;
    });

const kingCapturesAt = (grid, row, col, player) =>
  [-1, 1]
    .flatMap((dr) => [-1, 1].map((dc) => ({ dr, dc })))
    .flatMap(({ dr, dc }) => {
      let overRow = row + dr;
      let overCol = col + dc;

      while (inBounds(overRow, overCol) && grid[overRow][overCol] === EMPTY) {
        overRow += dr;
        overCol += dc;
      }

      if (!inBounds(overRow, overCol) || !isOpponentPiece(grid[overRow][overCol], player)) {
        return [];
      }

      const toRow = overRow + dr;
      const toCol = overCol + dc;
      if (!inBounds(toRow, toCol) || grid[toRow][toCol] !== EMPTY) {
        return [];
      }

      return [makeCaptureAction(row, col, overRow, overCol, toRow, toCol)];
    });

const pieceMovesAt = (grid, row, col, piece, player, allowLongKingJumps = true) => {
  if (isKing(piece) && allowLongKingJumps) {
    return kingMovesAt(grid, row, col);
  }

  return pieceDirections(piece, player)
    .flatMap((dr) => [-1, 1].map((dc) => ({ dr, dc })))
    .map(({ dr, dc }) => ({ toRow: row + dr, toCol: col + dc }))
    .filter(({ toRow, toCol }) => inBounds(toRow, toCol) && grid[toRow][toCol] === EMPTY)
    .map(({ toRow, toCol }) => makeMoveAction(row, col, toRow, toCol));
};

const pieceCapturesAt = (
  grid,
  row,
  col,
  piece,
  player,
  allowBackwardCapture = true,
  allowLongKingJumps = true,
) => {
  if (isKing(piece) && allowLongKingJumps) {
    return kingCapturesAt(grid, row, col, player);
  }

  return pieceCaptureDirections(piece, player, allowBackwardCapture)
    .flatMap((dr) => [-1, 1].map((dc) => ({ dr, dc })))
    .map(({ dr, dc }) => {
      const overRow = row + dr;
      const overCol = col + dc;
      const toRow = row + 2 * dr;
      const toCol = col + 2 * dc;
      return { overRow, overCol, toRow, toCol };
    })
    .filter(({ overRow, overCol, toRow, toCol }) => (
      inBounds(overRow, overCol) &&
      inBounds(toRow, toCol) &&
      isOpponentPiece(grid[overRow][overCol], player) &&
      grid[toRow][toCol] === EMPTY
    ))
    .map(({ overRow, overCol, toRow, toCol }) =>
      makeCaptureAction(row, col, overRow, overCol, toRow, toCol)
    );
};

const scanGridRecursive = (grid, row, col, visit, acc = []) => {
  if (row >= ROWS) return acc;
  if (col >= COLUMNS) return scanGridRecursive(grid, row + 1, 0, visit, acc);
  const nextAcc = visit(acc, grid[row][col], row, col);
  return scanGridRecursive(grid, row, col + 1, visit, nextAcc);
};

const allPiecesForPlayer = (grid, player) =>
  scanGridRecursive(
    grid,
    0,
    0,
    (acc, piece, row, col) => (isOwnPiece(piece, player) ? [...acc, { row, col, piece }] : acc),
    []
  );

const hasAnyPieces = (grid, player) =>
  scanGridRecursive(
    grid,
    0,
    0,
    (found, piece) => (found || isOwnPiece(piece, player)),
    false
  );

const concatMapRecursive = (items, mapper, index = 0, acc = []) => {
  if (index >= items.length) return acc;
  const mapped = mapper(items[index], index);
  return concatMapRecursive(items, mapper, index + 1, [...acc, ...mapped]);
};

const actionsForPlayer = (state, player = state.active) => {
  if (state.winner !== null || state.isDraw) return [];

  const pending = state.pendingCaptureFrom;
  const pieces = pending
    ? [{
      row: pending.row,
      col: pending.col,
      piece: state.grid[pending.row][pending.col],
    }]
    : allPiecesForPlayer(state.grid, player);

  const captures = concatMapRecursive(
    pieces,
    ({ row, col, piece }) => pieceCapturesAt(
      state.grid,
      row,
      col,
      piece,
      player,
      state.allowBackwardCapture,
      state.allowLongKingJumps,
    )
  );
  if (captures.length > 0) return captures;
  if (pending) return [];

  return concatMapRecursive(
    pieces,
    ({ row, col, piece }) => pieceMovesAt(state.grid, row, col, piece, player, state.allowLongKingJumps)
  );
};

const samePos = (a, b) => !!a && !!b && a.row === b.row && a.col === b.col;
const sameAction = (a, b) => (
  samePos(a.from, b.from) &&
  samePos(a.to, b.to) &&
  (!b.capture || !!a.capture) &&
  (!b.capture || samePos(a.capture, b.capture))
);

const applyAction = (state, action) => {
  const piece = state.grid[action.from.row][action.from.col];
  const reachedBackRank = shouldPromote(piece, action.to.row);
  const nextGrid = cloneGrid(state.grid);

  nextGrid[action.from.row][action.from.col] = EMPTY;
  if (action.capture) {
    nextGrid[action.capture.row][action.capture.col] = EMPTY;
  }

  let movedPiece = piece;
  nextGrid[action.to.row][action.to.col] = movedPiece;

  const canContinueCapture = action.isCapture
    ? pieceCapturesAt(
      nextGrid,
      action.to.row,
      action.to.col,
      movedPiece,
      state.active,
      state.allowBackwardCapture,
      state.allowLongKingJumps,
    )
    : [];

  const samePlayerContinues = canContinueCapture.length > 0;
  const pendingPromotionFromCapture =
    (action.isCapture && reachedBackRank && samePlayerContinues) ||
    (!!state.pendingPromotionFromCapture && samePlayerContinues);
  const promoteNow =
    (!action.isCapture && reachedBackRank) ||
    (action.isCapture && reachedBackRank && !samePlayerContinues) ||
    (!!state.pendingPromotionFromCapture && !samePlayerContinues);

  if (promoteNow) {
    movedPiece = promote(movedPiece);
    nextGrid[action.to.row][action.to.col] = movedPiece;
  }

  const promotedNow = movedPiece !== piece;
  const nextActive = samePlayerContinues ? state.active : 1 - state.active;
  const nextStateBase = {
    ...state,
    grid: nextGrid,
    active: nextActive,
    pendingCaptureFrom: samePlayerContinues ? { row: action.to.row, col: action.to.col } : null,
    pendingPromotionFromCapture,
    latestMove: {
      from: { ...action.from },
      to: { ...action.to },
      isCapture: action.isCapture,
      player: state.active,
    },
    winner: null,
    isDraw: false,
    winningLine: null,
    halfMoveClock: action.isCapture || promotedNow ? 0 : state.halfMoveClock + 1,
  };

  if (samePlayerContinues) return nextStateBase;

  const opponent = nextStateBase.active;
  const opponentActions = actionsForPlayer(nextStateBase, opponent);
  const moverWon = !hasAnyPieces(nextGrid, opponent) || opponentActions.length === 0;
  const draw = !moverWon && nextStateBase.halfMoveClock >= DRAW_HALF_MOVES;

  return {
    ...nextStateBase,
    winner: moverWon ? state.active : null,
    isDraw: draw,
  };
};

export const createBoard = () => ({
  active: 0,
  grid: createInitialGrid(),
  winner: null,
  isDraw: false,
  latestMove: null,
  winningLine: null,
  pendingCaptureFrom: null,
  pendingPromotionFromCapture: false,
  halfMoveClock: 0,
  allowBackwardCapture: true,
  allowLongKingJumps: true,
});

export const getActions = (board) => actionsForPlayer(board, board.active);

export const doAction = (board, action) => {
  if (!action || typeof action !== 'object' || !action.from || !action.to) return board;
  const legal = getActions(board);
  const selected = legal.find((candidate) => sameAction(candidate, action));
  if (!selected) return board;
  return applyAction(board, selected);
};

export const getResult = (board) => {
  if (board.winner === 0) return [1, 0];
  if (board.winner === 1) return [0, 1];
  if (board.isDraw) return [0.5, 0.5];
  return [0.01, 0.01];
};

export class Board {
  constructor(state) {
    this._state = state ?? createBoard();
  }

  get active() { return this._state.active; }

  getActions() { return getActions(this._state); }
  getResult() { return getResult(this._state); }

  doAction(action) { this._state = doAction(this._state, action); }

  copy() {
    return new Board({
      ...this._state,
      grid: this._state.grid.map(row => [...row]),
      latestMove: this._state.latestMove ? { ...this._state.latestMove } : null,
      winningLine: this._state.winningLine
        ? this._state.winningLine.map((cell) => ({ ...cell }))
        : null,
      pendingCaptureFrom: this._state.pendingCaptureFrom ? { ...this._state.pendingCaptureFrom } : null,
      pendingPromotionFromCapture: !!this._state.pendingPromotionFromCapture,
      allowBackwardCapture: this._state.allowBackwardCapture,
      allowLongKingJumps: this._state.allowLongKingJumps,
    });
  }

  getState() { return this._state; }
  setState(state) { this._state = state; }
}
