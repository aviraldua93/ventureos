import { describe, test, expect, beforeEach } from 'bun:test';
import { EventStore } from '../events/store';
import { Projections } from '../events/projections';
import { createRouter } from '../http/routes';
import { DemoEngine } from '../demo/engine';

describe('HTTP Routes', () => {
  let store: EventStore;
  let proj: Projections;
  let demo: DemoEngine;
  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    store = new EventStore({ persist: false });
    proj = new Projections(store);
    demo = new DemoEngine(store);
    router = createRouter(proj, demo);
  });

  function makeRequest(path: string, method = 'GET', body?: unknown): Request {
    const init: RequestInit = { method };
    if (body) {
      init.body = JSON.stringify(body);
      init.headers = { 'Content-Type': 'application/json' };
    }
    return new Request(`http://localhost:3000${path}`, init);
  }

  test('/api/health returns ok', async () => {
    const res = router(makeRequest('/api/health'));
    expect(res).not.toBeNull();
    const data = await (res as Response).json();
    expect(data).toEqual({ ok: true });
  });

  test('/api/state returns snapshot', async () => {
    await store.append({
      type: 'agent/register',
      timestamp: 1000,
      data: { agentId: 'a1', name: 'Alice', role: 'CEO' },
    });

    const res = router(makeRequest('/api/state'));
    expect(res).not.toBeNull();
    const data = await (res as Response).json();
    expect(data.agents).toHaveLength(1);
    expect(data.agents[0].id).toBe('a1');
  });

  test('/api/demo/status returns demo status', async () => {
    const res = router(makeRequest('/api/demo/status'));
    expect(res).not.toBeNull();
    const data = await (res as Response).json();
    expect(data).toHaveProperty('running');
    expect(data).toHaveProperty('paused');
    expect(data).toHaveProperty('speed');
  });

  test('/api/demo/pause returns ok', async () => {
    const res = router(makeRequest('/api/demo/pause', 'POST'));
    expect(res).not.toBeNull();
    const data = await (res as Response).json();
    expect(data).toEqual({ ok: true });
  });

  test('/api/demo/speed changes speed', async () => {
    const res = router(makeRequest('/api/demo/speed', 'POST', { speed: 5 }));
    expect(res).not.toBeNull();
    const resolved = await Promise.resolve(res as Response | Promise<Response>);
    const json = await (resolved as Response).json();
    expect(json).toEqual({ ok: true });
  });

  test('unknown routes return null', () => {
    const res = router(makeRequest('/api/unknown'));
    expect(res).toBeNull();
  });

  test('router without demo returns null for demo routes', () => {
    const noDemoRouter = createRouter(proj);
    const res = noDemoRouter(makeRequest('/api/demo/status'));
    expect(res).toBeNull();
  });
});
