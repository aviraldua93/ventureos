import { test, expect } from '@playwright/test';

test.describe('Org Chart — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.waitForTimeout(500);
  });

  test('OrgChart tab renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabPanel).toBeVisible();

    // Give time for any async renders
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('OrgChart panel has visible content', async ({ page }) => {
    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabPanel).toBeVisible();

    // The content should not be empty
    const isEmpty = await tabPanel.evaluate((el) => el.children.length === 0);
    expect(isEmpty).toBe(false);
  });

  test('responsive: no overflow on standard viewport', async ({ page }) => {
    // Check no horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('can switch to org chart and back to dashboard', async ({ page }) => {
    // Verify we're on org chart
    await expect(page.getByRole('tab', { name: 'Org Chart' })).toHaveAttribute('data-state', 'active');

    // Switch back to dashboard
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('data-state', 'active');

    // Dashboard panels should be visible again
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();
  });
});
