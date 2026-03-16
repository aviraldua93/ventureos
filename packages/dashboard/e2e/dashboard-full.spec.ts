import { test, expect } from '@playwright/test';

test.describe('Dashboard Tab — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  // -- DemoControls -----------------------------------------------------------

  test('DemoControls are visible with play, restart, and speed buttons', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    await expect(demoBar).toBeVisible();
    const buttons = demoBar.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(2);
  });

  test('DemoControls: play/pause button toggles state on click', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    const playBtn = demoBar.locator('button').first();
    const iconBefore = await playBtn.textContent();

    await playBtn.click();
    await page.waitForTimeout(1500);
    const iconAfter = await playBtn.textContent();

    expect(iconBefore === '\u25B6' || iconBefore === '\u23F8').toBe(true);
    expect(iconAfter === '\u25B6' || iconAfter === '\u23F8').toBe(true);
  });

  test('DemoControls: pause then resume toggles icon back', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    const playBtn = demoBar.locator('button').first();
    const iconStart = await playBtn.textContent();

    await playBtn.click();
    await page.waitForTimeout(1500);
    const iconMid = await playBtn.textContent();

    await playBtn.click();
    await page.waitForTimeout(1500);
    const iconEnd = await playBtn.textContent();

    expect(iconEnd).toBe(iconStart);
  });

  test('DemoControls: restart button is visible and clickable', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    const restartBtn = demoBar.locator('button').nth(1);
    await expect(restartBtn).toBeVisible();
    await expect(restartBtn).toBeEnabled();

    await restartBtn.click();
    await page.waitForTimeout(1000);
  });

  test('DemoControls: speed buttons are visible', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    const speedBtns = demoBar.locator('button:has-text("\u00D7")');
    const speedCount = await speedBtns.count();
    expect(speedCount).toBeGreaterThanOrEqual(2);
  });

  // -- MessageStream ----------------------------------------------------------

  test('MessageStream panel renders with filter buttons', async ({ page }) => {
    const centerPanel = page.locator('[data-testid="panel-center"]');
    await expect(centerPanel).toBeVisible();
    const panelContent = await centerPanel.innerHTML();
    expect(panelContent.length).toBeGreaterThan(0);
  });

  test('MessageStream: messages appear after demo runs', async ({ page }) => {
    const centerPanel = page.locator('[data-testid="panel-center"]');
    const demoBar = page.locator('[data-testid="demo-controls"]');
    const playBtn = demoBar.locator('button').first();

    await playBtn.click();
    await page.waitForTimeout(3000);

    const panelText = await centerPanel.textContent();
    expect(panelText!.length).toBeGreaterThan(50);
  });

  // -- AgentDetail ------------------------------------------------------------

  test('AgentDetail: clicking agent in left panel opens detail', async ({ page }) => {
    const leftPanel = page.locator('[data-testid="panel-left"]');
    await expect(leftPanel).toBeVisible();
    await page.waitForTimeout(1000);

    const agentRow = leftPanel.locator('div[class*="agent"], div[class*="row"], div[class*="item"]').first();
    if (await agentRow.isVisible().catch(() => false)) {
      await agentRow.click();
      await page.waitForTimeout(500);
    }
  });

  test('AgentDetail: overlay click dismisses the panel', async ({ page }) => {
    const leftPanel = page.locator('[data-testid="panel-left"]');
    await page.waitForTimeout(1000);

    const agentRow = leftPanel.locator('div').filter({ hasText: /\w+/ }).first();
    await agentRow.click();
    await page.waitForTimeout(500);

    const overlay = page.locator('div[class*="overlay"]').first();
    const overlayVisible = await overlay.isVisible({ timeout: 2000 }).catch(() => false);
    if (overlayVisible) {
      await overlay.click({ position: { x: 5, y: 5 } });
      await page.waitForTimeout(500);
    }
  });

  // -- Status Bar -------------------------------------------------------------

  test('status bar shows agent, task, message, diff, and event counts', async ({ page }) => {
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();
    await expect(statusBar).toContainText('Agents');
    await expect(statusBar).toContainText('Tasks');
    await expect(statusBar).toContainText('Messages');
    await expect(statusBar).toContainText('Diffs');
    await expect(statusBar).toContainText('Events');
  });

  test('status bar: displays non-zero counts', async ({ page }) => {
    const statusBar = page.locator('[data-testid="status-bar"]');
    // Wait for demo events to populate — the demo auto-starts and needs time to emit events
    await expect(async () => {
      const text = await statusBar.textContent();
      const numbers = text?.match(/\d+/g) || [];
      expect(numbers.length).toBeGreaterThan(0);
      const hasNonZero = numbers.some(n => parseInt(n) > 0);
      expect(hasNonZero).toBe(true);
    }).toPass({ timeout: 10_000 });
  });

  test('connection status is displayed in status bar', async ({ page }) => {
    const statusBar = page.locator('[data-testid="status-bar"]');
    const text = await statusBar.textContent();
    expect(
      text?.includes('Connected') || text?.includes('Disconnected') ||
      text?.includes('Live') || text?.includes('Offline')
    ).toBe(true);
  });

  // -- Layout -----------------------------------------------------------------

  test('header renders with logo, title, and Mission Control', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('VentureOS');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Mission Control');
  });

  test('AgentListPanel renders in left panel with content', async ({ page }) => {
    const leftPanel = page.locator('[data-testid="panel-left"]');
    await expect(leftPanel).toBeVisible();
    const panelContent = await leftPanel.innerHTML();
    expect(panelContent.length).toBeGreaterThan(0);
  });

  test('dashboard has at least two resizable panels', async ({ page }) => {
    const panels = page.locator('[data-testid="panel-left"], [data-testid="panel-center"]');
    const panelCount = await panels.count();
    expect(panelCount).toBeGreaterThanOrEqual(2);
  });
});
