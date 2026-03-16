import { describe, test, expect, beforeEach } from 'bun:test';
import { EventStore } from '../events/store';
import type { VentureEvent } from '@ventureos/shared';

function makeRegisterEvent(agentId: string): VentureEvent {
  return {
    type: 'agent/register',
    timestamp: Date.now(),
    data: { agentId, name: `Agent ${agentId}`, role: 'Engineer' },
  };
}

function makeHeartbeatEvent(agentId: string, status: 'active' | 'idle' = 'active'): VentureEvent {
  return {
    type: 'agent/heartbeat',
    timestamp: Date.now(),
    data: { agentId, status },
  };
}

describe('EventStore', () => {
  let store: EventStore;

  beforeEach(() => {
    store = new EventStore({ persist: false });
  });

  test('starts empty', () => {
    expect(store.count).toBe(0);
    expect(store.getAll()).toEqual([]);
  });

  test('appends events and increments count', async () => {
    await store.append(makeRegisterEvent('a1'));
    expect(store.count).toBe(1);

    await store.append(makeHeartbeatEvent('a1'));
    expect(store.count).toBe(2);
  });

  test('getAll returns copies of events', async () => {
    const event = makeRegisterEvent('a1');
    await store.append(event);

    const all = store.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(event);

    // Verify it's a copy
    all.push(makeRegisterEvent('a2'));
    expect(store.count).toBe(1);
  });

  test('subscribers are notified on append', async () => {
    const received: VentureEvent[] = [];
    store.subscribe((event) => received.push(event));

    const event = makeRegisterEvent('a1');
    await store.append(event);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(event);
  });

  test('multiple subscribers all receive events', async () => {
    const sub1: VentureEvent[] = [];
    const sub2: VentureEvent[] = [];
    store.subscribe((e) => sub1.push(e));
    store.subscribe((e) => sub2.push(e));

    await store.append(makeRegisterEvent('a1'));

    expect(sub1).toHaveLength(1);
    expect(sub2).toHaveLength(1);
  });

  test('unsubscribe stops notifications', async () => {
    const received: VentureEvent[] = [];
    const unsub = store.subscribe((e) => received.push(e));

    await store.append(makeRegisterEvent('a1'));
    expect(received).toHaveLength(1);

    unsub();

    await store.append(makeRegisterEvent('a2'));
    expect(received).toHaveLength(1);
  });

  test('clear resets the store', async () => {
    await store.append(makeRegisterEvent('a1'));
    await store.append(makeRegisterEvent('a2'));
    expect(store.count).toBe(2);

    store.clear();
    expect(store.count).toBe(0);
    expect(store.getAll()).toEqual([]);
  });

  test('handles rapid sequential appends', async () => {
    for (let i = 0; i < 100; i++) {
      await store.append(makeRegisterEvent(`a${i}`));
    }
    expect(store.count).toBe(100);
    expect(store.getAll()).toHaveLength(100);
  });

  test('subscriber receives events in order', async () => {
    const ids: string[] = [];
    store.subscribe((e) => {
      if (e.type === 'agent/register') ids.push(e.data.agentId);
    });

    await store.append(makeRegisterEvent('first'));
    await store.append(makeRegisterEvent('second'));
    await store.append(makeRegisterEvent('third'));

    expect(ids).toEqual(['first', 'second', 'third']);
  });
});
