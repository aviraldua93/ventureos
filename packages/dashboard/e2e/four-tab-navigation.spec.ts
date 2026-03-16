import { test, expect } from '@playwright/test';

test.describe('Four-Tab Navigation — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  test('all four main tabs are visible', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Org Chart' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Virtual Office' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Throng/i })).toBeVisible();
  });

  test('Dashboard tab is active by default', async ({ page }) => {
    const dashTab = page.getByRole('tab', { name: 'Dashboard' });
    await expect(dashTab).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();
  });

  test('navigate to Org Chart and back', async ({ page }) => {
    const orgTab = page.getByRole('tab', { name: 'Org Chart' });
    await orgTab.click();
    await expect(orgTab).toHaveAttribute('data-state', 'active');

    const orgPanel = page.locator('[role="tabpanel"][data-state="active"]');
    await expect(orgPanel).toBeVisible();
    // Dashboard panels should be hidden
    await expect(page.locator('[data-testid="panel-left"]')).not.toBeVisible();

    // Go back
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
  });

  test('navigate to Virtual Office and back', async ({ page }) => {
    const officeTab = page.getByRole('tab', { name: 'Virtual Office' });
    await officeTab.click();
    await expect(officeTab).toHaveAttribute('data-state', 'active');
    // Virtual office has its own container
    const officeContainer = page.locator('[data-testid="virtual-office"]');
    await expect(officeContainer).toBeVisible({ timeout: 10_000 });

    // Go back
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
  });

  test('navigate to Thronglet and back', async ({ page }) => {
    const throngTab = page.getByRole('tab', { name: /Throng/i });
    await throngTab.click();
    await expect(throngTab).toHaveAttribute('data-state', 'active');
    const throngContainer = page.locator('[data-testid="thronglet-office"]');
    await expect(throngContainer).toBeVisible({ timeout: 10_000 });

    // Go back
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
  });

  test('cycle through all 4 tabs sequentially', async ({ page }) => {
    const tabs = [
      { name: 'Dashboard', check: () => page.locator('[data-testid="panel-left"]') },
      { name: 'Org Chart', check: () => page.locator('[role="tabpanel"][data-state="active"]') },
      { name: 'Virtual Office', check: () => page.locator('[data-testid="virtual-office"]') },
    ];

    for (const tab of tabs) {
      const tabEl = page.getByRole('tab', { name: tab.name });
      await tabEl.click();
      await expect(tabEl).toHaveAttribute('data-state', 'active');
      await expect(tab.check()).toBeVisible({ timeout: 10_000 });
    }

    // Thronglet uses regex match
    const throngTab = page.getByRole('tab', { name: /Throng/i });
    await throngTab.click();
    await expect(throngTab).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-testid="thronglet-office"]')).toBeVisible({ timeout: 10_000 });

    // Return to Dashboard to verify no corruption
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();
  });

  test('only one tab is active at a time across all 4 tabs', async ({ page }) => {
    const tabNames = ['Dashboard', 'Org Chart', 'Virtual Office'];

    for (const name of tabNames) {
      await page.getByRole('tab', { name }).click();
      await page.waitForTimeout(300);

      const allTabs = page.getByRole('tab');
      const count = await allTabs.count();
      let activeCount = 0;
      for (let i = 0; i < count; i++) {
        const state = await allTabs.nth(i).getAttribute('data-state');
        if (state === 'active') activeCount++;
      }
      expect(activeCount).toBe(1);
    }

    // Also check Thronglet
    await page.getByRole('tab', { name: /Throng/i }).click();
    await page.waitForTimeout(300);
    const allTabs = page.getByRole('tab');
    const count = await allTabs.count();
    let activeCount = 0;
    for (let i = 0; i < count; i++) {
      const state = await allTabs.nth(i).getAttribute('data-state');
      if (state === 'active') activeCount++;
    }
    expect(activeCount).toBe(1);
  });

  test('rapid cycling all 4 tabs is stable (no errors)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (let i = 0; i < 3; i++) {
      await page.getByRole('tab', { name: 'Dashboard' }).click();
      await page.getByRole('tab', { name: 'Org Chart' }).click();
      await page.getByRole('tab', { name: 'Virtual Office' }).click();
      await page.getByRole('tab', { name: /Throng/i }).click();
    }

    await page.waitForTimeout(500);

    // Back to dashboard to verify stability
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();

    const realErrors = errors.filter(e => !e.includes('split') && !e.includes('WebGL'));
    expect(realErrors).toHaveLength(0);
  });

  test('status bar persists across all tab switches', async ({ page }) => {
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();

    const tabSelectors = ['Org Chart', 'Virtual Office'];
    for (const name of tabSelectors) {
      await page.getByRole('tab', { name }).click();
      await expect(statusBar).toBeVisible();
    }

    await page.getByRole('tab', { name: /Throng/i }).click();
    await expect(statusBar).toBeVisible();

    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(statusBar).toBeVisible();
  });
});
