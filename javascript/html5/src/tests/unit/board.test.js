import { describe, expect, it } from 'vitest';
import { Board, createBoard, doAction, getActions, getResult } from '../../js/board.js';
import { EMPTY, NORTH, NORTH_KING, SOUTH, SOUTH_KING } from '../../js/common.js';

const action = (fromRow, fromCol, toRow, toCol) => ({
  from: { row: fromRow, col: fromCol },
  to: { row: toRow, col: toCol },
});

const applyMove = (state, fromRow, fromCol, toRow, toCol) =>
  doAction(state, action(fromRow, fromCol, toRow, toCol));

describe('createBoard', () => {
  it('creates an initial 8x8 checkers position', () => {
    const board = createBoard();
    expect(board.grid).toHaveLength(8);
    board.grid.forEach((row) => expect(row).toHaveLength(8));

    const southCount = board.grid.flat().filter((piece) => piece === SOUTH).length;
    const northCount = board.grid.flat().filter((piece) => piece === NORTH).length;

    expect(southCount).toBe(12);
    expect(northCount).toBe(12);
    expect(board.active).toBe(0);
    expect(board.winner).toBeNull();
    expect(board.isDraw).toBe(false);
  });
});

describe('getActions', () => {
  it('returns legal opening moves for south', () => {
    const actions = getActions(createBoard());
    expect(actions.length).toBe(7);
    expect(actions.every((a) => a.isCapture === false)).toBe(true);
  });

  it('enforces mandatory captures', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[5][0] = SOUTH;
    board.grid[4][1] = NORTH;
    board.grid[6][3] = SOUTH;

    const actions = getActions(board);
    expect(actions).toHaveLength(1);
    expect(actions[0].from).toEqual({ row: 5, col: 0 });
    expect(actions[0].to).toEqual({ row: 3, col: 2 });
    expect(actions[0].isCapture).toBe(true);
  });

  it('allows backward captures for unpromoted pieces by default', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[4][3] = SOUTH;
    board.grid[5][4] = NORTH;

    const actions = getActions(board);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      from: { row: 4, col: 3 },
      to: { row: 6, col: 5 },
      capture: { row: 5, col: 4 },
      isCapture: true,
    });
  });

  it('disables backward captures for unpromoted pieces when configured', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
      allowBackwardCapture: false,
    };
    board.grid[4][3] = SOUTH;
    board.grid[5][4] = NORTH;

    const actions = getActions(board);
    expect(actions).toEqual(expect.arrayContaining([
      expect.objectContaining(action(4, 3, 3, 2)),
      expect.objectContaining(action(4, 3, 3, 4)),
    ]));
    expect(actions.every((candidate) => candidate.isCapture === false)).toBe(true);
  });

  it('allows kings to move any distance by default', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[4][3] = SOUTH_KING;

    const actions = getActions(board);
    expect(actions).toEqual(expect.arrayContaining([
      expect.objectContaining(action(4, 3, 3, 2)),
      expect.objectContaining(action(4, 3, 2, 1)),
      expect.objectContaining(action(4, 3, 1, 0)),
      expect.objectContaining(action(4, 3, 3, 4)),
      expect.objectContaining(action(4, 3, 2, 5)),
      expect.objectContaining(action(4, 3, 1, 6)),
      expect.objectContaining(action(4, 3, 0, 7)),
      expect.objectContaining(action(4, 3, 5, 2)),
      expect.objectContaining(action(4, 3, 6, 1)),
      expect.objectContaining(action(4, 3, 7, 0)),
      expect.objectContaining(action(4, 3, 5, 4)),
      expect.objectContaining(action(4, 3, 6, 5)),
      expect.objectContaining(action(4, 3, 7, 6)),
    ]));
  });

  it('limits kings to adjacent moves when long jumps are disabled', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
      allowLongKingJumps: false,
    };
    board.grid[4][3] = SOUTH_KING;

    const actions = getActions(board);
    expect(actions).toEqual(expect.arrayContaining([
      expect.objectContaining(action(4, 3, 3, 2)),
      expect.objectContaining(action(4, 3, 3, 4)),
      expect.objectContaining(action(4, 3, 5, 2)),
      expect.objectContaining(action(4, 3, 5, 4)),
    ]));
    expect(actions).toHaveLength(4);
  });

  it('allows kings to capture after sliding to the opponent by default', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[6][1] = SOUTH_KING;
    board.grid[3][4] = NORTH;

    const actions = getActions(board);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      from: { row: 6, col: 1 },
      to: { row: 2, col: 5 },
      capture: { row: 3, col: 4 },
      isCapture: true,
    });
  });

  it('limits kings to adjacent captures when long jumps are disabled', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
      allowLongKingJumps: false,
    };
    board.grid[4][3] = SOUTH_KING;
    board.grid[3][4] = NORTH;
    board.grid[1][6] = NORTH_KING;

    const actions = getActions(board);
    expect(actions).toHaveLength(1);
    expect(actions[0]).toMatchObject({
      from: { row: 4, col: 3 },
      to: { row: 2, col: 5 },
      capture: { row: 3, col: 4 },
      isCapture: true,
    });
  });

  it('resets the draw clock on promotion', () => {
    const board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
      halfMoveClock: 79,
    };
    board.grid[1][2] = SOUTH;
    board.grid[7][0] = NORTH;

    const next = applyMove(board, 1, 2, 0, 1);
    expect(next.grid[0][1]).toBe(SOUTH_KING);
    expect(next.halfMoveClock).toBe(0);
    expect(next.isDraw).toBe(false);
  });
});

describe('doAction', () => {
  it('moves a piece diagonally and switches active player', () => {
    const next = applyMove(createBoard(), 5, 0, 4, 1);
    expect(next.grid[5][0]).toBe(EMPTY);
    expect(next.grid[4][1]).toBe(SOUTH);
    expect(next.active).toBe(1);
  });

  it('captures opponent and removes jumped piece', () => {
    let board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[5][0] = SOUTH;
    board.grid[4][1] = NORTH;
    board.grid[2][3] = NORTH;

    board = applyMove(board, 5, 0, 3, 2);

    expect(board.grid[5][0]).toBe(EMPTY);
    expect(board.grid[4][1]).toBe(EMPTY);
    expect(board.grid[3][2]).toBe(SOUTH);
    expect(board.pendingCaptureFrom).toEqual({ row: 3, col: 2 });
    expect(board.active).toBe(0);
  });

  it('supports forced multi-capture in the same turn', () => {
    let board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[5][0] = SOUTH;
    board.grid[4][1] = NORTH;
    board.grid[2][3] = NORTH;

    board = applyMove(board, 5, 0, 3, 2);
    board = applyMove(board, 3, 2, 1, 4);

    expect(board.grid[2][3]).toBe(EMPTY);
    expect(board.grid[1][4]).toBe(SOUTH);
    expect(board.pendingCaptureFrom).toBeNull();
    expect(board.active).toBe(1);
  });

  it('does not allow jumping the same captured piece twice in a capture sequence', () => {
    let board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[5][2] = SOUTH;
    board.grid[4][3] = NORTH;
    board.grid[2][5] = NORTH;

    board = applyMove(board, 5, 2, 3, 4);

    // The first captured piece must be removed immediately.
    expect(board.grid[4][3]).toBe(EMPTY);
    expect(board.pendingCaptureFrom).toEqual({ row: 3, col: 4 });
    expect(board.active).toBe(0);

    const followUpCaptures = getActions(board);
    expect(followUpCaptures).toHaveLength(1);
    expect(followUpCaptures[0]).toMatchObject({
      from: { row: 3, col: 4 },
      to: { row: 1, col: 6 },
      capture: { row: 2, col: 5 },
      isCapture: true,
    });

    // A loop over the already removed piece at (4,3) must not be possible.
    expect(followUpCaptures.some((a) => (
      a.capture && a.capture.row === 4 && a.capture.col === 3
    ))).toBe(false);
  });

  it('promotes a man to king on reaching back rank', () => {
    let board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[1][2] = SOUTH;

    board = applyMove(board, 1, 2, 0, 3);
    expect(board.grid[0][3]).toBe(SOUTH_KING);
  });

  it('promotes immediately when a capture reaches back rank and no further capture exists', () => {
    let board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[2][1] = SOUTH;
    board.grid[1][2] = NORTH;

    board = applyMove(board, 2, 1, 0, 3);

    expect(board.grid[0][3]).toBe(SOUTH_KING);
    expect(board.pendingCaptureFrom).toBeNull();
    expect(board.active).toBe(1);
  });

  it('defers promotion during forced capture sequence and promotes after the sequence ends', () => {
    let board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[2][1] = SOUTH;
    board.grid[1][2] = NORTH;
    board.grid[1][4] = NORTH;

    board = applyMove(board, 2, 1, 0, 3);
    expect(board.grid[0][3]).toBe(SOUTH);
    expect(board.pendingCaptureFrom).toEqual({ row: 0, col: 3 });
    expect(board.active).toBe(0);

    board = applyMove(board, 0, 3, 2, 5);
    expect(board.grid[2][5]).toBe(SOUTH_KING);
    expect(board.pendingCaptureFrom).toBeNull();
    expect(board.active).toBe(1);
  });

  it('declares win when opponent has no legal move', () => {
    let board = {
      ...createBoard(),
      grid: Array.from({ length: 8 }, () => Array(8).fill(EMPTY)),
      active: 0,
    };
    board.grid[5][2] = SOUTH;

    board = applyMove(board, 5, 2, 4, 3);
    expect(board.winner).toBe(0);
    expect(board.isDraw).toBe(false);
  });
});

describe('getResult', () => {
  it('returns reward for player 0 win', () => {
    expect(getResult({ ...createBoard(), winner: 0 })).toEqual([1, 0]);
  });

  it('returns draw reward', () => {
    expect(getResult({ ...createBoard(), isDraw: true })).toEqual([0.5, 0.5]);
  });

  it('returns small undecided value for non-terminal state', () => {
    expect(getResult(createBoard())).toEqual([0.01, 0.01]);
  });
});

describe('Board adapter', () => {
  it('supports copy and simulation without mutating original', () => {
    const board = new Board();
    const copy = board.copy();
    const a = copy.getActions()[0];
    copy.doAction(a);

    expect(board.getState().grid).not.toEqual(copy.getState().grid);
  });
});
