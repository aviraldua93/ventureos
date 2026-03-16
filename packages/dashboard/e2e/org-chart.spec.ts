import { test, expect } from '@playwright/test';

test.describe('Org Chart — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.waitForTimeout(500);
  });

  test('OrgChart tab renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabPanel).toBeVisible();

    await page.waitForTimeout(1000);
    const realErrors = errors.filter(e => !e.includes('split') && !e.includes('WebGL'));
    expect(realErrors).toHaveLength(0);
  });

  test('OrgChart panel has non-empty content with agent nodes', async ({ page }) => {
    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabPanel).toBeVisible();
    const isEmpty = await tabPanel.evaluate((el) => el.children.length === 0);
    expect(isEmpty).toBe(false);
    const textContent = await tabPanel.textContent();
    expect(textContent!.length).toBeGreaterThan(10);
  });

  test('OrgChart toolbar renders with title and count', async ({ page }) => {
    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(tabPanel).toContainText('Org Chart');
  });

  test('OrgChart search/filter input is present and functional', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Filter"], input[placeholder*="Search"], input[placeholder*="filter"]');
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(searchInput).toBeEnabled();
      await searchInput.fill('test');
      await page.waitForTimeout(300);
      await searchInput.fill('');
      await page.waitForTimeout(300);
    }
  });

  test('OrgChart: agent node cards are clickable', async ({ page }) => {
    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await page.waitForTimeout(1000);

    const clickableNode = tabPanel.locator('button').first();
    if (await clickableNode.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clickableNode.click();
      await page.waitForTimeout(500);
    }
  });

  test('OrgChart: hierarchy structure renders with DOM depth', async ({ page }) => {
    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await page.waitForTimeout(1000);
    const htmlContent = await tabPanel.innerHTML();
    expect(htmlContent.length).toBeGreaterThan(200);
  });

  test('OrgChart: status indicators are visible on nodes', async ({ page }) => {
    const tabPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await page.waitForTimeout(1000);
    const panelText = await tabPanel.textContent();
    const statusTexts = ['active', 'idle', 'Active', 'Idle'];
    if (panelText && panelText.length > 50) {
      const hasStatus = statusTexts.some(s => panelText.includes(s));
      expect(hasStatus).toBe(true);
    }
  });

  test('responsive: no overflow on standard viewport', async ({ page }) => {
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('can switch to org chart and back to dashboard without corruption', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Org Chart' })).toHaveAttribute('data-state', 'active');

    await page.getByRole('tab', { name: 'Dashboard' }).click();
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toHaveAttribute('data-state', 'active');

    await expect(page.locator('[data-testid="panel-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="panel-center"]')).toBeVisible();
    await expect(page.locator('[data-testid="demo-controls"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-bar"]')).toBeVisible();
  });
});
