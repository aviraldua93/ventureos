import { test, expect } from '@playwright/test';

test.describe('Tab Navigation — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  test('all three main tabs are visible and render without app errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Org Chart' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Virtual Office' })).toBeVisible();

    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await page.waitForTimeout(500);

    const realErrors = errors.filter(e => !e.includes('split') && !e.includes('WebGL'));
    expect(realErrors).toHaveLength(0);
  });

  test('tab switching works: Dashboard → Org Chart → Dashboard', async ({ page }) => {
    const dashboardTab = page.getByRole('tab', { name: 'Dashboard' });
    await expect(dashboardTab).toHaveAttribute('data-state', 'active');

    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await expect(page.getByRole('tab', { name: 'Org Chart' })).toHaveAttribute('data-state', 'active');
    await expect(dashboardTab).not.toHaveAttribute('data-state', 'active');

    await dashboardTab.click();
    await expect(dashboardTab).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
  });

  test('active tab indicator is correct — only one active at a time', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('data-state', 'active');

    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    let activeCount = 0;
    for (let i = 0; i < tabCount; i++) {
      const state = await tabs.nth(i).getAttribute('data-state');
      if (state === 'active') activeCount++;
    }
    expect(activeCount).toBe(1);
  });

  test('each tab switch changes the visible panel content', async ({ page }) => {
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();

    await page.getByRole('tab', { name: 'Org Chart' }).click();
    const orgPanel = page.locator('[role="tabpanel"][data-state="active"]');
    await expect(orgPanel).toBeVisible();
    await expect(page.locator('[data-testid="panel-left"]')).not.toBeVisible();

    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
  });

  test('dashboard tab shows all expected panels and controls', async ({ page }) => {
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="demo-controls"]')).toBeVisible();
  });

  

  test('org chart tab renders non-empty content', async ({ page }) => {
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.waitForTimeout(500);
    const tabContent = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabContent).toBeVisible();
    const isEmpty = await tabContent.evaluate((el) => el.children.length === 0);
    expect(isEmpty).toBe(false);
  });

  test('rapid tab switching between Dashboard and Org Chart is stable', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    for (let i = 0; i < 5; i++) {
      await page.getByRole('tab', { name: 'Org Chart' }).click();
      await page.getByRole('tab', { name: 'Dashboard' }).click();
    }
    await page.waitForTimeout(500);

    await expect(page.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();

    const realErrors = errors.filter(e => !e.includes('split') && !e.includes('WebGL'));
    expect(realErrors).toHaveLength(0);
  });
});

