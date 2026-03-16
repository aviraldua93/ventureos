import type { Agent, Task } from '@ventureos/shared';

export type CreatureMood = 'happy' | 'hungry' | 'overwhelmed' | 'sleeping' | 'celebrating';

export interface MoodState {
  mood: CreatureMood;
  intensity: number; // 0-1
  since: number;
}

const CELEBRATION_DURATION_MS = 5000;

export interface MoodColors {
  primary: string;
  glow: string;
  bg: string;
}

export const MOOD_COLORS: Record<CreatureMood, MoodColors> = {
  happy:        { primary: '#3ddc84', glow: 'rgba(61,220,132,0.3)',  bg: '#1a3d2a' },
  hungry:       { primary: '#ffc940', glow: 'rgba(255,201,64,0.3)',  bg: '#3d3520' },
  overwhelmed:  { primary: '#ff5c5c', glow: 'rgba(255,92,92,0.3)',   bg: '#3d1a1a' },
  sleeping:     { primary: '#8b8ba8', glow: 'rgba(139,139,168,0.2)', bg: '#1e1e2e' },
  celebrating:  { primary: '#e879f9', glow: 'rgba(232,121,249,0.4)', bg: '#2e1a3d' },
};

export const MOOD_EMOJI: Record<CreatureMood, string> = {
  happy: '😊',
  hungry: '🍽️',
  overwhelmed: '😰',
  sleeping: '💤',
  celebrating: '🎉',
};

export const MOOD_LABEL: Record<CreatureMood, string> = {
  happy: 'Happy',
  hungry: 'Hungry for Work',
  overwhelmed: 'Overwhelmed',
  sleeping: 'Sleeping',
  celebrating: 'Celebrating!',
};

/** Track recently-completed tasks for celebration detection */
const recentCompletions = new Map<string, number>();

export function notifyTaskCompleted(agentId: string): void {
  recentCompletions.set(agentId, Date.now());
}

export function computeMood(agent: Agent, tasks: Task[]): MoodState {
  const now = Date.now();

  // Check for recent celebration
  const completedAt = recentCompletions.get(agent.id);
  if (completedAt && now - completedAt < CELEBRATION_DURATION_MS) {
    return { mood: 'celebrating', intensity: 1 - (now - completedAt) / CELEBRATION_DURATION_MS, since: completedAt };
  }
  if (completedAt && now - completedAt >= CELEBRATION_DURATION_MS) {
    recentCompletions.delete(agent.id);
  }

  // Sleeping = offline
  if (agent.status === 'offline') {
    return { mood: 'sleeping', intensity: 1, since: agent.lastHeartbeat };
  }

  // Count assigned tasks
  const agentTasks = tasks.filter(t => t.assigneeId === agent.id && t.status !== 'done');
  const activeCount = agentTasks.length;

  // Overwhelmed = 3+ active tasks or error status
  if (agent.status === 'error' || activeCount >= 3) {
    return { mood: 'overwhelmed', intensity: Math.min(1, activeCount / 5), since: now };
  }

  // Happy = has tasks and is working
  if (agent.status === 'active' && activeCount > 0) {
    return { mood: 'happy', intensity: Math.min(1, activeCount / 2), since: now };
  }

  // Hungry = idle or no tasks
  return { mood: 'hungry', intensity: activeCount === 0 ? 1 : 0.5, since: now };
}

export function computeTeamHappiness(agents: Agent[], tasks: Task[]): number {
  if (agents.length === 0) return 100;
  let score = 0;
  for (const agent of agents) {
    const m = computeMood(agent, tasks);
    switch (m.mood) {
      case 'happy': score += 100; break;
      case 'celebrating': score += 120; break;
      case 'hungry': score += 40; break;
      case 'overwhelmed': score += 20; break;
      case 'sleeping': score += 60; break;
    }
  }
  return Math.round(Math.min(100, score / agents.length));
}
