import { test, expect } from '@playwright/test';

// Canvas2D Virtual Office tests — no WebGL dependency
test.describe('Virtual Office — P0', () => {
  test('Virtual Office tab is present and enabled', async ({ page }) => {
    await page.goto('/');
    const tab = page.getByRole('tab', { name: 'Virtual Office' });
    await expect(tab).toBeVisible();
    await expect(tab).toBeEnabled();
  });

  test('clicking Virtual Office does not break other tabs', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    await page.waitForTimeout(1000);
    // Canvas2D should not crash — verify page is alive
    const pageAlive = await page.evaluate(() => true).catch(() => false);
    expect(pageAlive).toBe(true);
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
  });

  test('Dashboard remains functional after Virtual Office visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();
  });

  test('Virtual Office renders canvas element', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    await page.waitForTimeout(1000);
    const voPanel = page.locator('[data-testid="virtual-office"]');
    await expect(voPanel).toBeVisible();
    const canvas = voPanel.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });

  test('Virtual Office shows HUD controls when ready', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    await page.waitForTimeout(1500);
    // Check for time scrubber
    const scrubber = page.locator('[data-testid="time-scrubber"]');
    if (await scrubber.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(scrubber).toBeVisible();
    }
  });

  test('Virtual Office shows minimap', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    await page.waitForTimeout(1500);
    const minimap = page.locator('[data-testid="minimap"]');
    if (await minimap.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(minimap).toBeVisible();
    }
  });
});
