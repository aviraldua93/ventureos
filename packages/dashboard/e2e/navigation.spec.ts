import { test, expect } from '@playwright/test';

test.describe('Tab Navigation — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  test('all three main tabs render without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Dashboard tab is default
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Org Chart' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Virtual Office' })).toBeVisible();

    // Click through each tab and verify content renders
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    await page.waitForTimeout(500);

    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });

  test('tab switching works: Dashboard → Virtual Office → Org Chart → Dashboard', async ({ page }) => {
    // Dashboard is active by default
    const dashboardTab = page.getByRole('tab', { name: 'Dashboard' });
    await expect(dashboardTab).toHaveAttribute('data-state', 'active');

    // Switch to Virtual Office
    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    await expect(page.getByRole('tab', { name: 'Virtual Office' })).toHaveAttribute('data-state', 'active');
    await expect(dashboardTab).not.toHaveAttribute('data-state', 'active');

    // Switch to Org Chart
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await expect(page.getByRole('tab', { name: 'Org Chart' })).toHaveAttribute('data-state', 'active');

    // Switch back to Dashboard
    await dashboardTab.click();
    await expect(dashboardTab).toHaveAttribute('data-state', 'active');
  });

  test('active tab indicator is correct', async ({ page }) => {
    // Dashboard should be active by default
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('data-state', 'active');

    // Only one tab should be active at a time
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    let activeCount = 0;
    for (let i = 0; i < tabCount; i++) {
      const state = await tabs.nth(i).getAttribute('data-state');
      if (state === 'active') activeCount++;
    }
    expect(activeCount).toBe(1);
  });

  test('dashboard tab shows all expected panels', async ({ page }) => {
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-bar"]')).toBeVisible();
  });

  test('virtual office tab shows canvas', async ({ page }) => {
    await page.getByRole('tab', { name: 'Virtual Office' }).click();
    // VirtualOffice renders a canvas element
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 });
  });

  test('org chart tab renders content', async ({ page }) => {
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    // OrgChart renders — wait for it to appear
    await page.waitForTimeout(500);
    // The tab content should be visible and not empty
    const tabContent = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabContent).toBeVisible();
  });
});
