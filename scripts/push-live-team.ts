#!/usr/bin/env bun
// push-live-team.ts — Push team from ventureos.config.json to VentureOS server
//
// Reads all agents, teams, and company info from config instead of hardcoded data.

import { loadConfig, getTeamMembers, type AgentConfig } from './load-config';

const API = process.env.VENTUREOS_API || 'http://localhost:3000';

async function post(path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

async function pushEvent(event: Record<string, unknown>) {
  return post('/api/events', event);
}

const config = loadConfig();

// ── Step 1: Clear demo data ────────────────────────────────────
console.log('🔄 Restarting demo engine (clears event store)...');
await post('/api/demo/restart');
await post('/api/demo/pause');
console.log('⏸️  Demo paused. Store is clean.\n');

// Small delay offset so events have distinct timestamps
let ts = Date.now();
const tick = () => ts++;

// ── Step 2: Register agents from config ────────────────────────
console.log(`📋 Registering ${config.agents.length} agents from ventureos.config.json...`);
for (const agent of config.agents) {
  await pushEvent({
    type: 'agent/register',
    timestamp: tick(),
    data: {
      agentId: agent.id,
      name: agent.name,
      role: `${agent.role}, ${config.company.name}`,
      ...(agent.parentId && { parentId: agent.parentId }),
      ...(agent.capabilities && { capabilities: agent.capabilities }),
    },
  });
  console.log(`  ✅ ${agent.name} (${agent.role})`);
}
console.log();

// ── Step 3: Generate heartbeat/status events from config ───────
// Auto-generate a task description from each agent's role and capabilities
function generateTask(agent: AgentConfig): string {
  const capStr = agent.capabilities?.slice(0, 2).join(' & ') || agent.role.toLowerCase();
  return `Working on ${capStr}`;
}

interface Heartbeat {
  agentId: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  currentTask?: string;
}

const heartbeats: Heartbeat[] = config.agents.map(agent => ({
  agentId: agent.id,
  status: 'active' as const,
  currentTask: generateTask(agent),
}));

console.log('💓 Pushing heartbeat/status events...');
for (const hb of heartbeats) {
  await pushEvent({
    type: 'agent/heartbeat',
    timestamp: tick(),
    data: hb,
  });
  console.log(`  💓 ${hb.agentId}: ${hb.status} — ${hb.currentTask}`);
}
console.log();

// ── Step 4: Push DYNAMIC messages (template-based from config) ──
interface Message {
  from: string;
  content: string;
  messageType: 'chat' | 'task' | 'review' | 'blocker';
  to?: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generic message templates that work for any org — uses agent role/capabilities
const messageTemplates: Array<{ template: (agent: AgentConfig) => string; messageType: Message['messageType'] }> = [
  { template: (a) => `Working on ${a.capabilities?.[0] || a.role.toLowerCase()}. Will have an update by EOD.`, messageType: 'chat' },
  { template: (_) => 'PR is up for review — feedback welcome.', messageType: 'review' },
  { template: (_) => 'Just pushed a fix for that edge case. Tests passing.', messageType: 'chat' },
  { template: (_) => 'Design review done. Looks clean, shipping it.', messageType: 'review' },
  { template: (_) => 'Tests green after the refactor. Moving on to the next component.', messageType: 'chat' },
  { template: (_) => 'Documentation updated for the new API endpoints.', messageType: 'chat' },
  { template: (_) => 'Performance profiling shows we are under budget. Good to go.', messageType: 'review' },
  { template: (_) => 'Found a subtle bug in the event ordering. Fixing now.', messageType: 'chat' },
  { template: (_) => 'Build time is down after the config tweak. 🚀', messageType: 'chat' },
  { template: (_) => 'Accessibility audit — all critical ARIA labels in place.', messageType: 'review' },
  { template: (_) => 'Syncing with the team on test coverage gaps.', messageType: 'chat' },
  { template: (_) => 'Prototype deployed to preview branch. Take a look when you get a chance.', messageType: 'chat' },
  { template: (_) => 'Error boundary saved us from a crash in production sim. 🛡️', messageType: 'chat' },
  { template: (_) => 'Responsive layout verified on tablet and mobile breakpoints.', messageType: 'chat' },
  { template: (_) => 'Dark mode consistency pass complete. All tokens aligned.', messageType: 'chat' },
  { template: (_) => 'Merged the feature branch. Resolving conflicts now.', messageType: 'chat' },
  { template: (a) => `${a.role} update: On track. No blockers.`, messageType: 'task' },
  { template: (_) => 'Standup in 15. I want blockers, not status reports.', messageType: 'chat' },
  { template: (_) => 'Shipping velocity is 🔥 this week. Keep it up, team.', messageType: 'chat' },
  { template: (_) => 'CI pipeline green across all packages. Zero warnings.', messageType: 'review' },
  { template: (_) => 'Regression suite passed. All assertions green.', messageType: 'review' },
  { template: (_) => 'Blocked on an upstream change. Investigating.', messageType: 'blocker' },
  { template: (_) => 'Sprint velocity is tracking above baseline.', messageType: 'chat' },
  { template: (_) => 'Dependency audit complete. Will share in standup.', messageType: 'task' },
];

// Generate messages from all agents using templates
const messages: Message[] = [];
for (const agent of config.agents) {
  const count = 1 + Math.floor(Math.random() * 2);
  const shuffled = [...messageTemplates].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const tmpl = shuffled[i];
    messages.push({ from: agent.id, content: tmpl.template(agent), messageType: tmpl.messageType });
  }
}
messages.sort(() => Math.random() - 0.5);

console.log(`💬 Pushing ${messages.length} dynamic messages...`);
for (const msg of messages) {
  await pushEvent({
    type: 'agent/message',
    timestamp: tick(),
    data: msg,
  });
  console.log(`  💬 ${msg.from}: "${msg.content.slice(0, 60)}..."`);
}
console.log();

// ── Step 5: Generate task updates from config ──────────────────
interface Task {
  taskId: string;
  title: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  assigneeId: string;
  description: string;
}

// Generic task templates that work for any org
const taskTemplates: Array<{ title: (a: AgentConfig) => string; description: (a: AgentConfig) => string; status: Task['status'] }> = [
  { title: (a) => `${a.role}: Sprint work`, status: 'in_progress', description: (a) => `${a.name} working on ${a.capabilities?.join(', ') || a.role.toLowerCase()} deliverables` },
  { title: (_) => 'Code review & QA', status: 'review', description: (_) => 'Review pending PRs and sign off on quality' },
  { title: (_) => 'Documentation update', status: 'in_progress', description: (_) => 'Update docs for recent changes' },
  { title: (_) => 'Test coverage expansion', status: 'in_progress', description: (_) => 'Expand test coverage for new features' },
];

const tasks: Task[] = config.agents.map((agent, i) => {
  const tmpl = taskTemplates[i % taskTemplates.length];
  return {
    taskId: `task-${agent.id}-${i}`,
    title: tmpl.title(agent),
    status: tmpl.status,
    assigneeId: agent.id,
    description: tmpl.description(agent),
  };
});

console.log('📋 Pushing task updates...');
for (const task of tasks) {
  await pushEvent({
    type: 'agent/task_update',
    timestamp: tick(),
    data: task,
  });
  console.log(`  📋 [${task.status}] ${task.title} → ${task.assigneeId}`);
}
console.log();

// ── Verify ─────────────────────────────────────────────────────
console.log('🔍 Verifying state...');
const state = await (await fetch(`${API}/api/state`)).json() as {
  agents: unknown[];
  messages: unknown[];
  tasks: unknown[];
  codeChanges: unknown[];
};
console.log(`  Agents:       ${state.agents.length}`);
console.log(`  Messages:     ${state.messages.length}`);
console.log(`  Tasks:        ${state.tasks.length}`);
console.log(`  Code Changes: ${state.codeChanges.length}`);
console.log(`\n🚀 LIVE TEAM PUSHED. Dashboard at http://localhost:5173 should show the ${config.company.name} team.`);
