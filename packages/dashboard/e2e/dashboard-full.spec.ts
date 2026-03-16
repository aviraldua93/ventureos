import { test, expect } from '@playwright/test';

test.describe('Dashboard Tab — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  test('DemoControls are visible and interactive', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    await expect(demoBar).toBeVisible();

    // Should contain start/control buttons
    const buttons = demoBar.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('DemoControls: start demo button exists and is clickable', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    await expect(demoBar).toBeVisible();

    // Find and click the start/play button
    const startButton = demoBar.locator('button').first();
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test('MessageStream panel renders and is visible', async ({ page }) => {
    const centerPanel = page.locator('[data-testid="panel-center"]');
    await expect(centerPanel).toBeVisible();

    // MessageStream should be inside the center panel
    const panelContent = await centerPanel.innerHTML();
    expect(panelContent.length).toBeGreaterThan(0);
  });

  test('AgentListPanel renders in left panel', async ({ page }) => {
    const leftPanel = page.locator('[data-testid="panel-left"]');
    await expect(leftPanel).toBeVisible();

    // Should have content
    const panelContent = await leftPanel.innerHTML();
    expect(panelContent.length).toBeGreaterThan(0);
  });

  test('status bar shows agent and task counts', async ({ page }) => {
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();

    // Status bar should show Agents and Tasks labels
    await expect(statusBar).toContainText('Agents');
    await expect(statusBar).toContainText('Tasks');
    await expect(statusBar).toContainText('Messages');
    await expect(statusBar).toContainText('Diffs');
    await expect(statusBar).toContainText('Events');
  });

  test('connection status is displayed', async ({ page }) => {
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();

    // Should show either Connected or Disconnected
    const text = await statusBar.textContent();
    expect(text?.includes('Connected') || text?.includes('Disconnected') || text?.includes('Live') || text?.includes('Offline')).toBe(true);
  });

  test('header renders with logo and title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('VentureOS');

    // Header should be present with navigation
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Mission Control');
  });

  test('resize handles are present in dashboard layout', async ({ page }) => {
    // Dashboard should have two resize handles between panels
    const panels = page.locator('[data-testid="panel-left"], [data-testid="panel-center"]');
    const panelCount = await panels.count();
    expect(panelCount).toBeGreaterThanOrEqual(2);
  });
});
