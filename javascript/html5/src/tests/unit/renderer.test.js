import { describe, expect, it } from 'vitest';
import { createRenderer } from '../../js/renderer.js';
import { EMPTY, NORTH_KING, SOUTH } from '../../js/common.js';

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.dataset = {};
    this.style = {};
    this.textContent = '';
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    child.parentNode = null;
    return child;
  }

  get firstChild() {
    return this.children[0] ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  addEventListener() {}

  removeEventListener() {}
}

const collectByTag = (node, tagName, acc = []) => {
  if (node.tagName === tagName) acc.push(node);
  node.children.forEach((child) => collectByTag(child, tagName, acc));
  return acc;
};

describe('renderer', () => {
  it('adds stable row/col/piece data attributes to rendered piece circles', () => {
    const originalDocument = globalThis.document;
    globalThis.document = {
      createElementNS: (_ns, tagName) => new FakeElement(tagName),
    };

    try {
      const container = new FakeElement('div');
      const renderer = createRenderer(container, () => {});

      const grid = Array.from({ length: 8 }, () => Array(8).fill(EMPTY));
      grid[5][0] = SOUTH;
      grid[2][3] = NORTH_KING;

      renderer.render({
        grid,
        active: 0,
        winner: null,
        isDraw: false,
        latestMove: null,
      });

      const circles = collectByTag(container, 'circle');
      const southPiece = circles.find((el) =>
        el.dataset.row === '5' && el.dataset.col === '0' && el.dataset.piece === String(SOUTH)
      );
      const northKing = circles.find((el) =>
        el.dataset.row === '2' && el.dataset.col === '3' && el.dataset.piece === String(NORTH_KING)
      );

      expect(southPiece).toBeDefined();
      expect(northKing).toBeDefined();
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
