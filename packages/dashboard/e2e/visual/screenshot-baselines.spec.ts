import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests — Screenshot baselines for all 4 tabs.
 *
 * These tests capture full-page screenshots of each major tab and compare
 * them against stored baselines using Playwright's built-in pixel comparison.
 *
 * To update baselines: npx playwright test visual/ --update-snapshots
 */

test.describe('Visual Regression — Tab Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial data load and WebSocket connection
    await page.waitForSelector('[data-testid="status-bar"], header', { timeout: 15000 });
    // Allow demo engine to populate data
    await page.waitForTimeout(3000);
  });

  test('Dashboard tab baseline', async ({ page }) => {
    // Ensure we're on Dashboard tab
    const dashTab = page.getByRole('tab', { name: /dashboard/i });
    if (await dashTab.isVisible()) {
      await dashTab.click();
    }
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('dashboard-tab.png', {
      maxDiffPixelRatio: 0.05,
      threshold: 0.3,
      animations: 'disabled',
    });
  });

  test('Org Chart tab baseline', async ({ page }) => {
    const orgTab = page.getByRole('tab', { name: /org\s*chart/i });
    await orgTab.click();
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('org-chart-tab.png', {
      maxDiffPixelRatio: 0.05,
      threshold: 0.3,
      animations: 'disabled',
    });
  });

  test('Virtual Office tab baseline', async ({ page }) => {
    const officeTab = page.getByRole('tab', { name: /virtual\s*office/i });
    await officeTab.click();
    // Canvas rendering needs extra time
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('virtual-office-tab.png', {
      maxDiffPixelRatio: 0.08,
      threshold: 0.3,
      animations: 'disabled',
    });
  });

  test('Thronglet tab baseline', async ({ page }) => {
    const throngletTab = page.getByRole('tab', { name: /thronglet/i });
    await throngletTab.click();
    // Canvas + creature rendering needs extra time
    await page.waitForTimeout(3000);

    await expect(page).toHaveScreenshot('thronglet-tab.png', {
      maxDiffPixelRatio: 0.08,
      threshold: 0.3,
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression — Component Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="status-bar"], header', { timeout: 15000 });
    await page.waitForTimeout(3000);
  });

  test('Header navigation baseline', async ({ page }) => {
    const header = page.locator('header').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('header-nav.png', {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: 'disabled',
      });
    }
  });

  test('Dashboard — Agent list panel baseline', async ({ page }) => {
    const dashTab = page.getByRole('tab', { name: /dashboard/i });
    if (await dashTab.isVisible()) {
      await dashTab.click();
    }
    await page.waitForTimeout(1500);

    // Try to find the agent list panel
    const agentPanel = page.locator('[data-testid="agent-list-panel"], [class*="agent"]').first();
    if (await agentPanel.isVisible()) {
      await expect(agentPanel).toHaveScreenshot('agent-list-panel.png', {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: 'disabled',
      });
    }
  });

  test('Org Chart — hierarchy nodes baseline', async ({ page }) => {
    const orgTab = page.getByRole('tab', { name: /org\s*chart/i });
    await orgTab.click();
    await page.waitForTimeout(1500);

    const orgContainer = page.locator('[data-testid="org-chart"], [class*="org"]').first();
    if (await orgContainer.isVisible()) {
      await expect(orgContainer).toHaveScreenshot('org-chart-nodes.png', {
        maxDiffPixelRatio: 0.05,
        threshold: 0.3,
        animations: 'disabled',
      });
    }
  });

  test('Virtual Office — canvas render baseline', async ({ page }) => {
    const officeTab = page.getByRole('tab', { name: /virtual\s*office/i });
    await officeTab.click();
    await page.waitForTimeout(3000);

    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      await expect(canvas).toHaveScreenshot('virtual-office-canvas.png', {
        maxDiffPixelRatio: 0.10,
        threshold: 0.3,
        animations: 'disabled',
      });
    }
  });

  test('Thronglet — canvas render baseline', async ({ page }) => {
    const throngletTab = page.getByRole('tab', { name: /thronglet/i });
    await throngletTab.click();
    await page.waitForTimeout(3000);

    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible()) {
      await expect(canvas).toHaveScreenshot('thronglet-canvas.png', {
        maxDiffPixelRatio: 0.10,
        threshold: 0.3,
        animations: 'disabled',
      });
    }
  });
});

test.describe('Visual Regression — Theme Variants', () => {
  test('Dark theme baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="status-bar"], header', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('theme-dark.png', {
      maxDiffPixelRatio: 0.05,
      threshold: 0.3,
      animations: 'disabled',
    });
  });

  test('Spectator mode baseline', async ({ page }) => {
    await page.goto('/?spectator=1');
    await page.waitForSelector('[data-testid="status-bar"], header', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('spectator-mode.png', {
      maxDiffPixelRatio: 0.05,
      threshold: 0.3,
      animations: 'disabled',
    });
  });
});
