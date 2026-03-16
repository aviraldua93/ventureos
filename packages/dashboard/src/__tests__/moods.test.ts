import { describe, test, expect, beforeEach } from 'bun:test';
import {
  computeMood,
  computeTeamHappiness,
  notifyTaskCompleted,
  MOOD_COLORS,
  MOOD_EMOJI,
  MOOD_LABEL,
  type CreatureMood,
} from '../components/Thronglet/engine/moods';
import type { Agent, Task } from '@ventureos/shared';

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: 'a1',
    name: 'Alice',
    role: 'Engineer',
    status: 'active',
    lastHeartbeat: Date.now(),
    capabilities: [],
    ...overrides,
  };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Task',
    status: 'in_progress',
    assigneeId: 'a1',
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('Mood System', () => {
  describe('computeMood', () => {
    test('offline agent is sleeping', () => {
      const agent = makeAgent({ status: 'offline' });
      const mood = computeMood(agent, []);
      expect(mood.mood).toBe('sleeping');
      expect(mood.intensity).toBe(1);
    });

    test('active agent with tasks is happy', () => {
      const agent = makeAgent({ status: 'active' });
      const tasks = [makeTask({ assigneeId: 'a1', status: 'in_progress' })];
      const mood = computeMood(agent, tasks);
      expect(mood.mood).toBe('happy');
    });

    test('agent with 3+ tasks is overwhelmed', () => {
      const agent = makeAgent({ status: 'active' });
      const tasks = [
        makeTask({ id: 't1', assigneeId: 'a1', status: 'in_progress' }),
        makeTask({ id: 't2', assigneeId: 'a1', status: 'in_progress' }),
        makeTask({ id: 't3', assigneeId: 'a1', status: 'in_progress' }),
      ];
      const mood = computeMood(agent, tasks);
      expect(mood.mood).toBe('overwhelmed');
    });

    test('agent with error status is overwhelmed', () => {
      const agent = makeAgent({ status: 'error' });
      const mood = computeMood(agent, []);
      expect(mood.mood).toBe('overwhelmed');
    });

    test('idle agent with no tasks is hungry', () => {
      const agent = makeAgent({ status: 'idle' });
      const mood = computeMood(agent, []);
      expect(mood.mood).toBe('hungry');
      expect(mood.intensity).toBe(1);
    });

    test('done tasks are not counted', () => {
      const agent = makeAgent({ status: 'active' });
      const tasks = [makeTask({ assigneeId: 'a1', status: 'done' })];
      const mood = computeMood(agent, tasks);
      // No active tasks -> hungry (active status but no non-done tasks)
      expect(mood.mood).toBe('hungry');
    });

    test('tasks for other agents are ignored', () => {
      const agent = makeAgent({ id: 'a1', status: 'active' });
      const tasks = [makeTask({ assigneeId: 'a2', status: 'in_progress' })];
      const mood = computeMood(agent, tasks);
      expect(mood.mood).toBe('hungry');
    });

    test('celebrating after task completion', () => {
      const agent = makeAgent({ id: 'celebrate-agent' });
      notifyTaskCompleted('celebrate-agent');
      const mood = computeMood(agent, []);
      expect(mood.mood).toBe('celebrating');
      expect(mood.intensity).toBeGreaterThan(0);
    });

    test('overwhelmed intensity scales with task count', () => {
      const agent = makeAgent({ status: 'active' });
      const tasks3 = Array.from({ length: 3 }, (_, i) =>
        makeTask({ id: `t${i}`, assigneeId: 'a1', status: 'in_progress' })
      );
      const tasks5 = Array.from({ length: 5 }, (_, i) =>
        makeTask({ id: `t${i}`, assigneeId: 'a1', status: 'in_progress' })
      );

      const mood3 = computeMood(agent, tasks3);
      const mood5 = computeMood(agent, tasks5);
      expect(mood5.intensity).toBeGreaterThanOrEqual(mood3.intensity);
    });
  });

  describe('computeTeamHappiness', () => {
    test('returns 100 for empty team', () => {
      expect(computeTeamHappiness([], [])).toBe(100);
    });

    test('happy team scores high', () => {
      const agents = [makeAgent({ id: 'a1', status: 'active' })];
      const tasks = [makeTask({ assigneeId: 'a1' })];
      const score = computeTeamHappiness(agents, tasks);
      expect(score).toBe(100);
    });

    test('hungry team scores lower', () => {
      const agents = [makeAgent({ id: 'a1', status: 'idle' })];
      const score = computeTeamHappiness(agents, []);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });

    test('mixed team averages mood scores', () => {
      const agents = [
        makeAgent({ id: 'a1', status: 'active' }),
        makeAgent({ id: 'a2', status: 'idle' }),
      ];
      const tasks = [makeTask({ assigneeId: 'a1' })];
      const score = computeTeamHappiness(agents, tasks);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('MOOD constants', () => {
    test('all moods have colors', () => {
      const moods: CreatureMood[] = ['happy', 'hungry', 'overwhelmed', 'sleeping', 'celebrating'];
      for (const m of moods) {
        expect(MOOD_COLORS[m]).toBeDefined();
        expect(MOOD_COLORS[m].primary).toBeTruthy();
        expect(MOOD_COLORS[m].glow).toBeTruthy();
        expect(MOOD_COLORS[m].bg).toBeTruthy();
      }
    });

    test('all moods have emojis', () => {
      expect(Object.keys(MOOD_EMOJI)).toHaveLength(5);
    });

    test('all moods have labels', () => {
      expect(Object.keys(MOOD_LABEL)).toHaveLength(5);
    });
  });
});
