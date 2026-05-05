// Copyright (c) 2016,2026 Oliver Merkel. All rights reserved.
// SPDX-License-Identifier: MIT

import { COLUMNS, EMPTY, NORTH, NORTH_KING, ROWS, SOUTH, SOUTH_KING } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VB_W = 800;
const VB_H = 860;
const CELL = 90;
const OFFSET_X = 40;
const OFFSET_Y = 90;
const PIECE_R = 31;

const colors = {
  light: '#f2e8cf',
  dark: '#2f6f3e',
  border: '#1f2937',
  selected: '#93c5fd',
  origin: '#60a5fa',
  destination: '#bfdbfe',
  latest: '#60a5fa',
  latestSourceOutline: '#60a5fa',
  south: '#ef4444',
  north: '#ffffff',
  crownSouth: '#ffffff',
  crownNorth: '#166534',
};

const svgEl = (tag, attrs = {}) => {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  return el;
};

const cellCenter = (row, col) => ({
  x: OFFSET_X + col * CELL + CELL / 2,
  y: OFFSET_Y + row * CELL + CELL / 2,
});

const keyOf = (row, col) => `${row}:${col}`;
const samePos = (a, b) => !!a && !!b && a.row === b.row && a.col === b.col;

const pieceFill = (piece) => {
  if (piece === SOUTH || piece === SOUTH_KING) return colors.south;
  if (piece === NORTH || piece === NORTH_KING) return colors.north;
  return null;
};

const isKing = (piece) => piece === SOUTH_KING || piece === NORTH_KING;

export const createRenderer = (container, onCellClick) => {
  const svg = svgEl('svg', {
    viewBox: `0 0 ${VB_W} ${VB_H}`,
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
    'aria-label': 'Buff and Green board',
  });
  svg.style.cssText = 'display:block;width:100%;height:100%;';

  svg.appendChild(svgEl('rect', {
    x: 0,
    y: 0,
    width: VB_W,
    height: VB_H,
    fill: '#0f172a',
    rx: 16,
    ry: 16,
  }));

  svg.appendChild(svgEl('rect', {
    x: OFFSET_X - 10,
    y: OFFSET_Y - 10,
    width: COLUMNS * CELL + 20,
    height: ROWS * CELL + 20,
    fill: '#f2e8cf',
    stroke: '#166534',
    'stroke-width': 4,
    rx: 8,
    ry: 8,
  }));

  const statusText = svgEl('text', {
    x: VB_W / 2,
    y: 50,
    'text-anchor': 'middle',
    style: 'font:700 32px/1 system-ui,sans-serif;fill:#e2e8f0;',
  });
  svg.appendChild(statusText);

  const cellRects = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLUMNS }, (_, col) => {
      const rect = svgEl('rect', {
        x: OFFSET_X + col * CELL,
        y: OFFSET_Y + row * CELL,
        width: CELL,
        height: CELL,
        fill: (row + col) % 2 === 0 ? colors.light : colors.dark,
      });
      svg.appendChild(rect);
      return rect;
    })
  );

  const pieceLayer = svgEl('g', { 'aria-hidden': 'true' });
  svg.appendChild(pieceLayer);

  const overlays = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLUMNS }, (_, col) => {
      const rect = svgEl('rect', {
        x: OFFSET_X + col * CELL,
        y: OFFSET_Y + row * CELL,
        width: CELL,
        height: CELL,
        fill: '#ffffff',
        opacity: 0,
      });
      rect.dataset.row = String(row);
      rect.dataset.col = String(col);
      rect.style.cursor = 'default';
      svg.appendChild(rect);
      return rect;
    })
  );

  container.appendChild(svg);

  const handlers = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));

  const clearHandlers = () => {
    overlays.forEach((row, r) => {
      row.forEach((overlay, c) => {
        if (handlers[r][c]) overlay.removeEventListener('click', handlers[r][c]);
        handlers[r][c] = null;
        overlay.style.cursor = 'default';
        overlay.setAttribute('opacity', '0');
      });
    });
  };

  const renderPieces = (grid, latestMove) => {
    while (pieceLayer.firstChild) pieceLayer.removeChild(pieceLayer.firstChild);

    grid.forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        if (piece === EMPTY) return;

        const center = cellCenter(rowIndex, colIndex);
        const isLatestTarget = latestMove && latestMove.to.row === rowIndex && latestMove.to.col === colIndex;

        const pieceCircle = svgEl('circle', {
          cx: center.x,
          cy: center.y,
          r: PIECE_R,
          fill: pieceFill(piece),
          stroke: isLatestTarget ? colors.latest : '#14532d',
          'stroke-width': isLatestTarget ? 5 : 3,
        });
        pieceCircle.dataset.row = String(rowIndex);
        pieceCircle.dataset.col = String(colIndex);
        pieceCircle.dataset.piece = String(piece);
        pieceLayer.appendChild(pieceCircle);

        if (isKing(piece)) {
          const crown = svgEl('text', {
            x: center.x,
            y: center.y + 10,
            'text-anchor': 'middle',
            style: `font:900 34px/1 system-ui,sans-serif;fill:${piece === SOUTH_KING ? colors.crownSouth : colors.crownNorth};`,
          });
          crown.textContent = 'K';
          pieceLayer.appendChild(crown);
        }
      });
    });
  };

  const render = (boardState, selectableActions = [], selectedCell = null) => {
    const origins = new Set(selectableActions.map((a) => keyOf(a.from.row, a.from.col)));
    const selectedActions = selectedCell
      ? selectableActions.filter((a) => samePos(a.from, selectedCell))
      : [];
    const destinations = new Set(selectedActions.map((a) => keyOf(a.to.row, a.to.col)));
    const latestSourceKey = boardState.latestMove
      ? keyOf(boardState.latestMove.from.row, boardState.latestMove.from.col)
      : null;

    cellRects.forEach((row, r) => {
      row.forEach((cell, c) => {
        const base = (r + c) % 2 === 0 ? colors.light : colors.dark;
        const key = keyOf(r, c);
        const fill = samePos(selectedCell, { row: r, col: c })
          ? colors.selected
          : (destinations.has(key)
            ? colors.destination
            : (origins.has(key) ? colors.origin : base));
        cell.setAttribute('fill', fill);

        if (key === latestSourceKey) {
          cell.setAttribute('stroke', colors.latestSourceOutline);
          cell.setAttribute('stroke-width', '5');
        } else {
          cell.setAttribute('stroke', 'none');
          cell.setAttribute('stroke-width', '0');
        }
      });
    });

    renderPieces(boardState.grid, boardState.latestMove);

    if (boardState.winner === 0) statusText.textContent = 'Red wins';
    else if (boardState.winner === 1) statusText.textContent = 'White wins';
    else if (boardState.isDraw) statusText.textContent = 'Draw';
    else statusText.textContent = boardState.active === 0 ? 'Red to move' : 'White to move';

    clearHandlers();
    const clickable = new Set([
      ...origins,
      ...destinations,
    ]);

    clickable.forEach((key) => {
      const [row, col] = key.split(':').map(Number);
      const click = () => onCellClick({ row, col });
      handlers[row][col] = click;
      overlays[row][col].addEventListener('click', click);
      overlays[row][col].style.cursor = 'pointer';
      overlays[row][col].setAttribute('opacity', '0.12');
    });
  };

  const flashSowing = () => {};
  const resize = () => {};

  return { render, flashSowing, resize };
};
