import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load the config file to verify dashboard matches it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = resolve(__dirname, '..', '..', '..', 'ventureos.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf-8'));
const configAgents: Array<{ id: string; name: string; role: string; team: string }> = config.agents;
const configTeams: Array<{ name: string; displayName: string }> = config.teams;

test.describe('Config-Driven Data Verification — P0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VentureOS');
  });

  test('API /api/state returns agents matching config after live push', async ({ request }) => {
    // First push the live team data
    const pushRes = await request.post('http://localhost:3000/api/demo/restart');
    expect(pushRes.ok()).toBeTruthy();

    // Push agents from config via events
    for (const agent of configAgents) {
      await request.post('http://localhost:3000/api/events', {
        data: {
          type: 'agent/register',
          timestamp: Date.now(),
          data: {
            agentId: agent.id,
            name: agent.name,
            role: agent.role,
          },
        },
      });
    }

    // Give the server a moment to process
    await new Promise(r => setTimeout(r, 500));

    // Verify state
    const stateRes = await request.get('http://localhost:3000/api/state');
    expect(stateRes.ok()).toBeTruthy();
    const state = await stateRes.json();

    // All config agents should be registered
    const stateAgentIds = state.agents.map((a: { id: string }) => a.id);
    for (const agent of configAgents) {
      expect(stateAgentIds).toContain(agent.id);
    }
  });

  test('agent count in config matches expected total', async () => {
    expect(configAgents.length).toBe(35);
  });

  test('all teams in config have at least one agent', async () => {
    for (const team of configTeams) {
      const teamAgents = configAgents.filter(a => a.team === team.name);
      expect(teamAgents.length).toBeGreaterThan(0);
    }
  });

  test('config has valid parent references', async () => {
    const allIds = new Set(configAgents.map(a => a.id));
    for (const agent of configAgents) {
      if ((agent as Record<string, unknown>).parentId) {
        expect(allIds.has((agent as Record<string, unknown>).parentId as string)).toBeTruthy();
      }
    }
  });

  test('header shows company name from config', async ({ page }) => {
    const header = page.locator('h1');
    await expect(header).toContainText(config.company.name);
  });

  test('org chart shows agents from config after live push', async ({ page, request }) => {
    // Push live team
    await request.post('http://localhost:3000/api/demo/restart');
    await request.post('http://localhost:3000/api/demo/pause');

    for (const agent of configAgents) {
      await request.post('http://localhost:3000/api/events', {
        data: {
          type: 'agent/register',
          timestamp: Date.now(),
          data: {
            agentId: agent.id,
            name: agent.name,
            role: agent.role,
            parentId: (agent as Record<string, unknown>).parentId,
          },
        },
      });
    }

    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForTimeout(1000);

    // Switch to Org Chart
    await page.getByRole('tab', { name: 'Org Chart' }).click();
    await page.waitForTimeout(1000);

    const orgPanel = page.locator('[role="tabpanel"][data-state="active"]');
    const text = await orgPanel.textContent();

    // Spot-check a few agents from config are visible
    const sampleAgents = configAgents.slice(0, 5);
    let foundCount = 0;
    for (const agent of sampleAgents) {
      if (text?.includes(agent.name)) foundCount++;
    }
    expect(foundCount).toBeGreaterThan(0);
  });
});
