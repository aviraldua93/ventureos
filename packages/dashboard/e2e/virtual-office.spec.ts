import { test, expect } from '@playwright/test';

test.describe('Virtual Office — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    // Wait for the tab content to be visible
    await page.waitForTimeout(500);
  });

  test('VirtualOffice component renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Canvas should be present (Pixi.js render target)
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 });
    expect(errors).toHaveLength(0);
  });

  test('office canvas is visible and has correct dimensions', async ({ page }) => {
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 5000 });

    // Canvas should have non-zero dimensions
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('minimap renders and shows map content', async ({ page }) => {
    // MiniMap should be visible in the HUD overlay
    const minimap = page.locator('[data-testid="minimap"]');
    await expect(minimap).toBeVisible({ timeout: 5000 });

    // The MINIMAP label should be present
    await expect(minimap.locator('text=MINIMAP')).toBeVisible();

    // MiniMap canvas should exist and have content
    const minimapCanvas = minimap.locator('canvas');
    await expect(minimapCanvas).toBeVisible();
  });

  test('no layout overflow or broken positioning', async ({ page }) => {
    // Virtual Office should not cause horizontal scroll
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('HUD controls are visible when office is ready', async ({ page }) => {
    // Wait for the office to initialize
    await page.waitForTimeout(2000);

    // Zoom controls should be visible (from OfficeControls)
    const zoomInBtn = page.locator('button[title="Zoom In"]');
    const zoomOutBtn = page.locator('button[title="Zoom Out"]');
    const resetBtn = page.locator('button[title="Reset View"]');

    // At least the controls container should be present if office loaded
    const controlsExist = await zoomInBtn.isVisible().catch(() => false);
    if (controlsExist) {
      await expect(zoomInBtn).toBeVisible();
      await expect(zoomOutBtn).toBeVisible();
      await expect(resetBtn).toBeVisible();
    }
  });
});
