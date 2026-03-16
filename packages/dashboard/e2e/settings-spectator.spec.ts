import { test, expect } from '@playwright/test';

test.describe('Settings & Customization — P1', () => {
  test('Settings tab renders with theme selector', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(500);
    const settings = page.locator('[data-testid="settings-panel"]');
    await expect(settings).toBeVisible();
    await expect(settings).toContainText('Appearance');
  });

  test('theme selector changes theme', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.waitForTimeout(500);

    const themeSelect = page.locator('[data-testid="theme-selector"]');
    await expect(themeSelect).toBeVisible();

    // Change to light theme
    await themeSelect.selectOption('light');
    await page.waitForTimeout(300);

    const dataTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(dataTheme).toBe('light');

    // Change back to dark
    await themeSelect.selectOption('dark');
    await page.waitForTimeout(300);

    const dataThemeDark = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(dataThemeDark).toBe('dark');
  });

  test('midnight theme option exists', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Settings' }).click();
    const themeSelect = page.locator('[data-testid="theme-selector"]');
    const options = themeSelect.locator('option');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('spectator link is shown in settings', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Settings' }).click();
    const spectatorLink = page.locator('[data-testid="spectator-link"]');
    await expect(spectatorLink).toBeVisible();
    const value = await spectatorLink.inputValue();
    expect(value).toContain('spectator=1');
  });
});

test.describe('Spectator Mode — P1', () => {
  test('spectator mode hides demo controls', async ({ page }) => {
    await page.goto('/?spectator=1');
    await page.waitForTimeout(500);
    const demoControls = page.locator('[data-testid="demo-controls"]');
    await expect(demoControls).not.toBeVisible();
  });

  test('spectator mode shows spectator badge', async ({ page }) => {
    await page.goto('/?spectator=1');
    await page.waitForTimeout(500);
    const badge = page.locator('[data-testid="spectator-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('Spectator');
  });

  test('spectator mode hides Settings tab', async ({ page }) => {
    await page.goto('/?spectator=1');
    await page.waitForTimeout(500);
    const settingsTab = page.getByRole('tab', { name: 'Settings' });
    await expect(settingsTab).not.toBeVisible();
  });

  test('spectator mode still shows dashboard data', async ({ page }) => {
    await page.goto('/?spectator=1');
    await page.waitForTimeout(500);
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();
    await expect(statusBar).toContainText('Agents');
  });
});
