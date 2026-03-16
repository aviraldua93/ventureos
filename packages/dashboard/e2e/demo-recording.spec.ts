import { test, expect, Page } from '@playwright/test';

/**
 * VentureOS Dashboard — Live Demo Recording
 *
 * This spec drives the full dashboard experience while Playwright records
 * a video.  Run with the "demo" project so video capture is enabled:
 *
 *   npx playwright test e2e/demo-recording.spec.ts --project=demo
 *
 * The resulting .webm will be saved under ./test-results/
 */

/** Dismiss the AgentDetail overlay if visible. */
async function dismissOverlay(page: Page) {
  const overlay = page.locator('div[class*="overlay"]').first();
  if (await overlay.isVisible({ timeout: 500 }).catch(() => false)) {
    await overlay.click({ position: { x: 5, y: 5 }, force: true });
    await page.waitForTimeout(600);
  }
  // Double-check: if still there, click body at top-left corner
  if (await overlay.isVisible({ timeout: 300 }).catch(() => false)) {
    await page.mouse.click(1, 1);
    await page.waitForTimeout(600);
  }
}

test.describe('VentureOS Live Demo Recording', () => {
  // Single long-running test so the entire flow is one continuous video
  test('full dashboard walkthrough', async ({ page }) => {
    test.setTimeout(180_000);

    // ── 1. Open the dashboard ───────────────────────────────────────────
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');

    // Let the viewer absorb the initial Dashboard state
    await page.waitForTimeout(3000);

    // ── 2. Dashboard tab — show live data flowing ───────────────────────
    const statusBar = page.locator('[data-testid="status-bar"]');
    await expect(statusBar).toBeVisible();

    const centerPanel = page.locator('[data-testid="panel-center"]');
    await expect(centerPanel).toBeVisible();

    const leftPanel = page.locator('[data-testid="panel-left"]');
    await expect(leftPanel).toBeVisible();

    // Pause so the viewer sees agents, tasks, messages counters
    await page.waitForTimeout(2000);

    // ── 3. Demo controls — start the simulation ─────────────────────────
    const demoBar = page.locator('[data-testid="demo-controls"]');
    await expect(demoBar).toBeVisible();

    const playBtn = demoBar.locator('button').first();
    await playBtn.click();
    // Let events flow in for a few seconds
    await page.waitForTimeout(5000);

    // Bump speed to 2× if available
    const speed2x = demoBar.locator('button:has-text("2×")');
    if (await speed2x.isVisible({ timeout: 1000 }).catch(() => false)) {
      await speed2x.click();
      await page.waitForTimeout(3000);
    }

    // Pause the demo so the dashboard is stable for the next scenes
    await playBtn.click();
    await page.waitForTimeout(1000);

    // ── 4. Org Chart tab ────────────────────────────────────────────────
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.waitForTimeout(2500);

    const orgPanel = page.locator('[data-state="active"][role="tabpanel"]');
    await expect(orgPanel).toBeVisible();

    // Interact with department / agent nodes in the org chart
    const orgButtons = orgPanel.locator('button');
    const btnCount = await orgButtons.count();
    if (btnCount >= 1) {
      // Click the first node to show agent details
      await orgButtons.first().click();
      await page.waitForTimeout(2500);
      await dismissOverlay(page);

      // Click a second node if available
      if (btnCount >= 3) {
        await orgButtons.nth(2).click({ force: true });
        await page.waitForTimeout(2500);
        await dismissOverlay(page);
      }
    }

    // Search / filter if available
    const searchInput = page.locator(
      'input[placeholder*="Filter"], input[placeholder*="Search"], input[placeholder*="filter"]',
    );
    if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await searchInput.fill('engineer');
      await page.waitForTimeout(1500);
      await searchInput.fill('');
      await page.waitForTimeout(1000);
    }

    await page.waitForTimeout(1000);

    // ── 5. Virtual Office tab ───────────────────────────────────────────
    await page.getByRole('tab', { name: 'Virtual Office' }).click({ force: true });
    await page.waitForTimeout(2500);

    const voPanel = page.locator('[data-testid="virtual-office"]');
    if (await voPanel.isVisible({ timeout: 3000 }).catch(() => false)) {
      const canvas = voPanel.locator('canvas').first();
      if (await canvas.isVisible({ timeout: 2000 }).catch(() => false)) {
        const box = await canvas.boundingBox();
        if (box) {
          // Hover over a few spots to trigger agent tooltips
          await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4);
          await page.waitForTimeout(1500);
          await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5);
          await page.waitForTimeout(1500);
          await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.3);
          await page.waitForTimeout(1500);
        }
      }
    }

    // Let the animation play
    await page.waitForTimeout(2000);

    // ── 6. Back to Dashboard — full experience ──────────────────────────
    await page.getByRole('tab', { name: 'Dashboard' }).click({ force: true });
    await page.waitForTimeout(1500);

    // Restart demo playback so the viewer sees the live data stream
    await expect(demoBar).toBeVisible();
    await playBtn.click();
    await page.waitForTimeout(5000);

    // Final pause on the dashboard
    await playBtn.click();
    await page.waitForTimeout(2000);

    // Done — Playwright will finalize the video file automatically
  });
});
