import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { EventStore } from '../events/store';
import { DemoEngine } from '../demo/engine';
import type { VentureEvent } from '@ventureos/shared';

function makeDemoScenario() {
  return [
    {
      delayMs: 10,
      event: {
        type: 'agent/register' as const,
        timestamp: 0,
        data: { agentId: 'a1', name: 'Alice', role: 'CEO' },
      },
    },
    {
      delayMs: 10,
      event: {
        type: 'agent/heartbeat' as const,
        timestamp: 0,
        data: { agentId: 'a1', status: 'active' as const, currentTask: 'Leading' },
      },
    },
    {
      delayMs: 10,
      event: {
        type: 'agent/message' as const,
        timestamp: 0,
        data: { from: 'a1', content: 'Hello team', messageType: 'chat' as const },
      },
    },
  ];
}

describe('DemoEngine', () => {
  let store: EventStore;
  let engine: DemoEngine;

  beforeEach(() => {
    store = new EventStore({ persist: false });
    engine = new DemoEngine(store);
  });

  afterEach(() => {
    engine.stop();
  });

  test('loadScenario sets scenario', () => {
    engine.loadScenario(makeDemoScenario());
    const status = engine.getStatus();
    expect(status.progress.total).toBe(3);
    expect(status.progress.current).toBe(0);
  });

  test('getStatus returns correct initial state', () => {
    const status = engine.getStatus();
    expect(status.running).toBe(false);
    expect(status.paused).toBe(false);
    expect(status.speed).toBe(1);
    expect(status.liveMode).toBe(false);
  });

  test('start clears store and begins playback', async () => {
    await store.append({
      type: 'agent/register',
      timestamp: 1000,
      data: { agentId: 'old', name: 'Old Agent', role: 'Legacy' },
    });
    expect(store.count).toBe(1);

    engine.loadScenario(makeDemoScenario());
    engine.start(100); // fast speed

    // Store should be cleared on start
    expect(store.count).toBe(0);

    const status = engine.getStatus();
    expect(status.running).toBe(true);
    expect(status.paused).toBe(false);
  });

  test('pause and resume work', () => {
    engine.loadScenario(makeDemoScenario());
    engine.start(1);

    engine.pause();
    expect(engine.getStatus().paused).toBe(true);

    engine.resume();
    expect(engine.getStatus().paused).toBe(false);
  });

  test('setSpeed changes playback speed', () => {
    engine.loadScenario(makeDemoScenario());
    engine.start(1);

    engine.setSpeed(5);
    expect(engine.getStatus().speed).toBe(5);

    engine.setSpeed(10);
    expect(engine.getStatus().speed).toBe(10);
  });

  test('stop halts the engine', () => {
    engine.loadScenario(makeDemoScenario());
    engine.start(1);
    expect(engine.getStatus().running).toBe(true);

    engine.stop();
    expect(engine.getStatus().running).toBe(false);
  });

  test('restart resets progress', () => {
    engine.loadScenario(makeDemoScenario());
    engine.start(100);

    engine.restart();
    const status = engine.getStatus();
    expect(status.running).toBe(true);
    expect(status.progress.current).toBe(0);
  });

  test('getProgress returns correct percentage', () => {
    engine.loadScenario(makeDemoScenario());
    const progress = engine.getProgress();
    expect(progress.total).toBe(3);
    expect(progress.current).toBe(0);
    expect(progress.pct).toBe(0);
  });

  test('getProgress with empty scenario returns zero pct', () => {
    engine.loadScenario([]);
    const progress = engine.getProgress();
    expect(progress.pct).toBe(0);
  });

  test('scenario events are appended to store over time', async () => {
    engine.loadScenario(makeDemoScenario());
    engine.start(1000); // 1000x speed = very fast

    // Wait for events to be processed
    await new Promise(resolve => setTimeout(resolve, 200));

    expect(store.count).toBeGreaterThanOrEqual(1);
  });
});
