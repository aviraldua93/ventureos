import { test, expect } from '@playwright/test';

test.describe('VentureOS Dashboard — Smoke Tests', () => {
  test('homepage loads and shows title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VentureOS/);
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  test('api health returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
  });

  test('demo controls are visible', async ({ page }) => {
    await page.goto('/');
    // DemoControls renders a bottom bar with play/pause/reset
    const demoBar = page.locator('[data-testid="demo-controls"]');
    await expect(demoBar).toBeVisible();
  });

  test('org chart panel renders', async ({ page }) => {
    await page.goto('/');
    const orgPanel = page.locator('[data-testid="panel-left"]');
    await expect(orgPanel).toBeVisible();
  });

  test('message stream panel renders', async ({ page }) => {
    await page.goto('/');
    const messageStream = page.locator('[data-testid="panel-center"]');
    await expect(messageStream).toBeVisible();
  });

  test('status bar shows agent count', async ({ page }) => {
    await page.goto('/');
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toContainText('Agents:');
    await expect(statusBar).toContainText('Tasks:');
  });
});
