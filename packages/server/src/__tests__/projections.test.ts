import { describe, test, expect, beforeEach } from 'bun:test';
import { EventStore } from '../events/store';
import { Projections } from '../events/projections';
import type { VentureEvent } from '@ventureos/shared';

describe('Projections', () => {
  let store: EventStore;
  let proj: Projections;

  beforeEach(() => {
    store = new EventStore({ persist: false });
    proj = new Projections(store);
  });

  describe('getAgents', () => {
    test('returns empty array when no events', () => {
      expect(proj.getAgents()).toEqual([]);
    });

    test('registers an agent from register event', async () => {
      await store.append({
        type: 'agent/register',
        timestamp: 1000,
        data: { agentId: 'a1', name: 'Alice', role: 'Engineer', capabilities: ['ts', 'react'] },
      });

      const agents = proj.getAgents();
      expect(agents).toHaveLength(1);
      expect(agents[0]).toEqual({
        id: 'a1',
        name: 'Alice',
        role: 'Engineer',
        parentId: undefined,
        status: 'idle',
        lastHeartbeat: 1000,
        capabilities: ['ts', 'react'],
      });
    });

    test('updates agent on heartbeat', async () => {
      await store.append({
        type: 'agent/register',
        timestamp: 1000,
        data: { agentId: 'a1', name: 'Alice', role: 'Engineer' },
      });
      await store.append({
        type: 'agent/heartbeat',
        timestamp: 2000,
        data: { agentId: 'a1', status: 'active', currentTask: 'Coding' },
      });

      const agents = proj.getAgents();
      expect(agents[0].status).toBe('active');
      expect(agents[0].currentTask).toBe('Coding');
      expect(agents[0].lastHeartbeat).toBe(2000);
    });

    test('handles multiple agents', async () => {
      await store.append({
        type: 'agent/register',
        timestamp: 1000,
        data: { agentId: 'a1', name: 'Alice', role: 'CEO' },
      });
      await store.append({
        type: 'agent/register',
        timestamp: 1100,
        data: { agentId: 'a2', name: 'Bob', role: 'CTO', parentId: 'a1' },
      });

      const agents = proj.getAgents();
      expect(agents).toHaveLength(2);
      expect(agents[1].parentId).toBe('a1');
    });

    test('handles missing capabilities gracefully', async () => {
      await store.append({
        type: 'agent/register',
        timestamp: 1000,
        data: { agentId: 'a1', name: 'Alice', role: 'CEO' },
      });

      const agents = proj.getAgents();
      expect(agents[0].capabilities).toEqual([]);
    });

    test('heartbeat for unregistered agent is ignored', async () => {
      await store.append({
        type: 'agent/heartbeat',
        timestamp: 1000,
        data: { agentId: 'ghost', status: 'active' },
      });

      expect(proj.getAgents()).toEqual([]);
    });
  });

  describe('getTasks', () => {
    test('returns empty array when no task events', () => {
      expect(proj.getTasks()).toEqual([]);
    });

    test('creates task from task_update event', async () => {
      await store.append({
        type: 'agent/task_update',
        timestamp: 1000,
        data: { taskId: 't1', title: 'Build API', status: 'in_progress', assigneeId: 'a1', description: 'REST API' },
      });

      const tasks = proj.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual({
        id: 't1',
        title: 'Build API',
        status: 'in_progress',
        assigneeId: 'a1',
        description: 'REST API',
        updatedAt: 1000,
      });
    });

    test('updates task status on subsequent events', async () => {
      await store.append({
        type: 'agent/task_update',
        timestamp: 1000,
        data: { taskId: 't1', title: 'Build API', status: 'in_progress' },
      });
      await store.append({
        type: 'agent/task_update',
        timestamp: 2000,
        data: { taskId: 't1', title: 'Build API', status: 'done', assigneeId: 'a1' },
      });

      const tasks = proj.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe('done');
      expect(tasks[0].updatedAt).toBe(2000);
    });
  });

  describe('getMessages', () => {
    test('returns empty array when no message events', () => {
      expect(proj.getMessages()).toEqual([]);
    });

    test('collects messages in order', async () => {
      await store.append({
        type: 'agent/message',
        timestamp: 1000,
        data: { from: 'a1', content: 'Hello', messageType: 'chat' },
      });
      await store.append({
        type: 'agent/message',
        timestamp: 2000,
        data: { from: 'a2', to: 'a1', content: 'Hi back', messageType: 'task' },
      });

      const msgs = proj.getMessages();
      expect(msgs).toHaveLength(2);
      expect(msgs[0].id).toBe('msg-0');
      expect(msgs[0].from).toBe('a1');
      expect(msgs[1].id).toBe('msg-1');
      expect(msgs[1].to).toBe('a1');
    });
  });

  describe('getCodeChanges', () => {
    test('returns empty array when no code_change events', () => {
      expect(proj.getCodeChanges()).toEqual([]);
    });

    test('collects code changes', async () => {
      await store.append({
        type: 'agent/code_change',
        timestamp: 1000,
        data: { agentId: 'a1', filePath: 'src/index.ts', diff: '+console.log("hi")', description: 'Add log' },
      });

      const changes = proj.getCodeChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].filePath).toBe('src/index.ts');
    });
  });

  describe('getSnapshot', () => {
    test('returns full snapshot combining all projections', async () => {
      await store.append({
        type: 'agent/register',
        timestamp: 1000,
        data: { agentId: 'a1', name: 'Alice', role: 'CEO' },
      });
      await store.append({
        type: 'agent/task_update',
        timestamp: 1100,
        data: { taskId: 't1', title: 'Task 1', status: 'backlog' },
      });
      await store.append({
        type: 'agent/message',
        timestamp: 1200,
        data: { from: 'a1', content: 'Hello', messageType: 'chat' },
      });
      await store.append({
        type: 'agent/code_change',
        timestamp: 1300,
        data: { agentId: 'a1', filePath: 'f.ts', diff: '+line', description: 'Add line' },
      });

      const snapshot = proj.getSnapshot();
      expect(snapshot.agents).toHaveLength(1);
      expect(snapshot.tasks).toHaveLength(1);
      expect(snapshot.messages).toHaveLength(1);
      expect(snapshot.codeChanges).toHaveLength(1);
    });

    test('snapshot ignores non-matching event types', async () => {
      await store.append({
        type: 'agent/register',
        timestamp: 1000,
        data: { agentId: 'a1', name: 'Alice', role: 'CEO' },
      });

      const snapshot = proj.getSnapshot();
      expect(snapshot.agents).toHaveLength(1);
      expect(snapshot.tasks).toHaveLength(0);
      expect(snapshot.messages).toHaveLength(0);
      expect(snapshot.codeChanges).toHaveLength(0);
    });
  });
});
