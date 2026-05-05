import { expect, test } from '@playwright/test';

const clickCell = async (page, row, col) => {
  const clicked = await page.evaluate(({ r, c }) => {
    const overlays = [...document.querySelectorAll('#board svg rect[data-row][data-col]')];
    const target = overlays.find((el) =>
      Number(el.dataset.row) === r && Number(el.dataset.col) === c
    );
    if (!target || target.style.cursor !== 'pointer') return false;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, { r: row, c: col });

  if (!clicked) throw new Error(`Cell ${row},${col} is not clickable`);
};

const waitForHumanTurn = (page) =>
  page.waitForFunction(() => {
    const overlays = [...document.querySelectorAll('#board svg rect[data-row][data-col]')];
    return overlays.some((el) => el.style.cursor === 'pointer');
  }, { timeout: 10_000 });

const pieceAt = (page, row, col) =>
  page.evaluate(({ r, c }) => {
    const circle = document.querySelector(`#board svg circle[data-row="${r}"][data-col="${c}"]`);
    return circle ? circle.getAttribute('fill') : null;
  }, { r: row, c: col });

const installWorkerMessageSpy = async (page) => {
  // Keep this helper scoped to sync-payload tests only; behavior tests should
  // prefer observable UI state instead of relying on Worker instrumentation.
  await page.addInitScript(() => {
    window.__engineRequests = [];
    const OriginalWorker = window.Worker;
    window.Worker = function WorkerProxy(...args) {
      const worker = new OriginalWorker(...args);
      const originalPostMessage = worker.postMessage.bind(worker);
      worker.postMessage = (message, ...rest) => {
        window.__engineRequests.push(message);
        return originalPostMessage(message, ...rest);
      };
      return worker;
    };
    window.Worker.prototype = OriginalWorker.prototype;
  });
};

const evaluateActions = (page, boardLiteral) =>
  page.evaluate(async (board) => {
    const boardModule = await import('/js/board.js');
    return boardModule.getActions(board);
  }, boardLiteral);

test.describe('Page load', () => {
  test('title is correct', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Buff and Green/i);
  });

  test('game view and board are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#view-game')).toBeVisible();
    await expect(page.locator('#board svg')).toBeVisible();
    await expect(page.locator('#app-header-title')).toHaveText('Buff and Green');
  });
});

test.describe('Navigation and options', () => {
  test('rules, options and about views open', async ({ page }) => {
    await page.goto('/');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-rules').click();
    await expect(page.locator('#view-rules')).toBeVisible();

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await expect(page.locator('#view-options')).toBeVisible();

    await page.locator('#btn-menu').click();
    await page.locator('#nav-about').click();
    await expect(page.locator('#view-about')).toBeVisible();
  });

  test('options update badge with player types', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();

    await page.locator('input[name="firstplayer"][value="AI"]').check();
    await page.locator('input[name="secondplayer"][value="Human"]').check();
    await page.locator('input[name="difficultysouth"][value="Hard"]').check();
    await page.locator('#btn-options-ok').click();

    await expect(page.locator('#app-header-badge')).toContainText('R Hard');
    await expect(page.locator('#app-header-badge')).toContainText('W human');
  });

  test('rule options are synced to engine settings', async ({ page }) => {
    await installWorkerMessageSpy(page);
    await page.goto('/');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();

    await page.locator('input[name="allowbackwardcapture"]').uncheck();
    await page.locator('input[name="allowlongkingjumps"]').uncheck();
    await page.locator('#btn-options-ok').click();

    const latestSync = await page.evaluate(() => {
      const requests = (window.__engineRequests || [])
        .filter((m) => m && m.request === 'sync');
      return requests.length > 0 ? requests[requests.length - 1] : null;
    });

    expect(latestSync).not.toBeNull();
    expect(latestSync.settings.allowbackwardcapture).toBe(false);
    expect(latestSync.settings.allowlongkingjumps).toBe(false);
  });

  test('backward capture option changes legal capture behavior', async ({ page }) => {
    await page.goto('/');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="allowbackwardcapture"]').check();
    await page.locator('#btn-options-ok').click();

    const withBackwardCapture = await evaluateActions(page, {
      active: 0,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
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

    expect(withBackwardCapture).toHaveLength(1);
    expect(withBackwardCapture[0].capture).toEqual({ row: 5, col: 4 });

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="allowbackwardcapture"]').uncheck();
    await page.locator('#btn-options-ok').click();

    const withoutBackwardCapture = await evaluateActions(page, {
      active: 0,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      winner: null,
      isDraw: false,
      latestMove: null,
      winningLine: null,
      pendingCaptureFrom: null,
      pendingPromotionFromCapture: false,
      halfMoveClock: 0,
      allowBackwardCapture: false,
      allowLongKingJumps: true,
    });

    expect(withoutBackwardCapture.every((a) => a.isCapture === false)).toBe(true);
  });

  test('king long jump option changes king movement behavior', async ({ page }) => {
    await page.goto('/');

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="allowlongkingjumps"]').check();
    await page.locator('#btn-options-ok').click();

    const withLongJumps = await evaluateActions(page, {
      active: 0,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
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

    expect(withLongJumps.some((a) => a.to.row === 0 && a.to.col === 7)).toBe(true);

    await page.locator('#btn-menu').click();
    await page.locator('#nav-options').click();
    await page.locator('input[name="allowlongkingjumps"]').uncheck();
    await page.locator('#btn-options-ok').click();

    const withoutLongJumps = await evaluateActions(page, {
      active: 0,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      winner: null,
      isDraw: false,
      latestMove: null,
      winningLine: null,
      pendingCaptureFrom: null,
      pendingPromotionFromCapture: false,
      halfMoveClock: 0,
      allowBackwardCapture: true,
      allowLongKingJumps: false,
    });

    expect(withoutLongJumps).toHaveLength(4);
    expect(withoutLongJumps.some((a) => a.to.row === 0 && a.to.col === 7)).toBe(false);
  });
});

test.describe('Board interaction', () => {
  test('human can select and move opening piece', async ({ page }) => {
    await page.goto('/');
    await waitForHumanTurn(page);

    await clickCell(page, 5, 0);
    await clickCell(page, 4, 1);

    await expect.poll(async () => pieceAt(page, 5, 0)).toBeNull();
    await expect.poll(async () => pieceAt(page, 4, 1)).toBe('#ef4444');
  });

  test('new game resets opening position', async ({ page }) => {
    await page.goto('/');
    await waitForHumanTurn(page);

    await clickCell(page, 5, 0);
    await clickCell(page, 4, 1);

    await page.locator('#btn-menu').click();
    await page.locator('#nav-new').click();
    await waitForHumanTurn(page);

    await expect.poll(async () => pieceAt(page, 5, 0)).toBe('#ef4444');
    await expect.poll(async () => pieceAt(page, 4, 1)).toBeNull();
  });
});

test.describe('Accessibility', () => {
  test('board svg has checkers aria label', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#board svg')).toHaveAttribute('aria-label', /Buff and Green/i);
  });
});
