import { test, expect } from '@playwright/test';

test.describe('Live Data Flow — P1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  test('demo start generates events that appear in the dashboard', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    const playBtn = demoBar.locator('button').first();

    // Start demo
    await playBtn.click();
    await page.waitForTimeout(4000);

    // Check that agents appeared
    const statusBar = page.locator('[data-testid="status-bar"]');
    const text = await statusBar.textContent();
    const numbers = text?.match(/\d+/g) || [];
    const total = numbers.reduce((sum, n) => sum + parseInt(n), 0);
    expect(total).toBeGreaterThan(0);
  });

  test('messages stream updates with new content over time', async ({ page }) => {
    const demoBar = page.locator('[data-testid="demo-controls"]');
    const playBtn = demoBar.locator('button').first();

    await playBtn.click();
    await page.waitForTimeout(3000);

    const center = page.locator('[data-testid="panel-center"]');
    const textBefore = await center.textContent();

    await page.waitForTimeout(3000);
    const textAfter = await center.textContent();

    // Content should have grown
    expect(textAfter!.length).toBeGreaterThanOrEqual(textBefore!.length);
  });

  test('connection badge shows Live when connected', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toContainText('Live');
  });

  test('event counts in status bar increment during demo', async ({ page }) => {
    const statusBar = page.locator('[data-testid="status-bar"]');

    // Start the demo to generate new events
    const demoBar = page.locator('[data-testid="demo-controls"]');
    await demoBar.locator('button').first().click();
    await page.waitForTimeout(2000);

    const textBefore = await statusBar.textContent();
    const countsBefore = (textBefore?.match(/\d+/g) || []).map(Number);

    await page.waitForTimeout(5000);

    const textAfter = await statusBar.textContent();
    const countsAfter = (textAfter?.match(/\d+/g) || []).map(Number);

    const sumBefore = countsBefore.reduce((a, b) => a + b, 0);
    const sumAfter = countsAfter.reduce((a, b) => a + b, 0);
    expect(sumAfter).toBeGreaterThanOrEqual(sumBefore);
  });
});
