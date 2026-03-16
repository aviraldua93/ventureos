#!/usr/bin/env bun
// push-live-team.ts — Push REAL aviraldua93 Ventures team to VentureOS server

const API = 'http://localhost:3000';

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

// ── Step 1: Clear demo data ────────────────────────────────────
console.log('🔄 Restarting demo engine (clears event store)...');
await post('/api/demo/restart');
await post('/api/demo/pause');
console.log('⏸️  Demo paused. Store is clean.\n');

// Small delay offset so events have distinct timestamps
let ts = Date.now();
const tick = () => ts++;

// ── Step 2: Register the REAL team ─────────────────────────────
interface Agent {
  agentId: string;
  name: string;
  role: string;
  parentId?: string;
  capabilities?: string[];
}

const team: Agent[] = [
  // Holding company leadership
  { agentId: 'max', name: 'Max', role: 'COO, aviraldua93 Ventures', capabilities: ['operations', 'strategy'] },
  { agentId: 'niko-reyes', name: 'Niko Reyes', role: 'Scout Lead, aviraldua93 Ventures', capabilities: ['scouting', 'deal-flow'] },

  // ArchitectAI
  { agentId: 'priya-sharma', name: 'Priya Sharma', role: 'CEO, ArchitectAI', capabilities: ['leadership', 'architecture'] },

  // VentureOS — Leadership
  { agentId: 'jordan-park', name: 'Jordan Park', role: 'CEO, VentureOS', capabilities: ['leadership', 'product', 'strategy'] },

  // VentureOS — Engineering
  { agentId: 'sana-okafor', name: 'Sana Okafor', role: 'VP Engineering, VentureOS', parentId: 'jordan-park', capabilities: ['engineering', 'architecture', 'management'] },
  { agentId: 'mia-torres', name: 'Mia Torres', role: 'Frontend Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['react', 'typescript', 'css'] },
  { agentId: 'ravi-patel', name: 'Ravi Patel', role: 'Frontend Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['react', 'typescript', 'documentation'] },
  { agentId: 'zoe-chen', name: 'Zoe Chen', role: 'Frontend Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['react', 'typescript', 'vite'] },
  { agentId: 'kai-nakamura', name: 'Kai Nakamura', role: 'Backend Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['bun', 'typescript', 'api'] },
  { agentId: 'marcus-webb', name: 'Marcus Webb', role: 'DevOps Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['devops', 'ci-cd', 'infrastructure'] },

  // VentureOS — Quality
  { agentId: 'lex-morales', name: 'Lex Morales', role: 'VP Quality, VentureOS', parentId: 'jordan-park', capabilities: ['qa', 'testing', 'standards'] },
  { agentId: 'priya-desai', name: 'Priya Desai', role: 'QA Functional, VentureOS', parentId: 'lex-morales', capabilities: ['functional-testing', 'manual-qa'] },
  { agentId: 'sam-torres', name: 'Sam Torres', role: 'QA Integration, VentureOS', parentId: 'lex-morales', capabilities: ['integration-testing', 'e2e'] },

  // VentureOS — AI/LLM
  { agentId: 'noor-abbasi', name: 'Noor Abbasi', role: 'VP AI/LLM, VentureOS', parentId: 'jordan-park', capabilities: ['ai', 'llm', 'ml-ops'] },
  { agentId: 'eli-vance', name: 'Eli Vance', role: 'Agentic Systems, VentureOS', parentId: 'noor-abbasi', capabilities: ['agents', 'llm', 'autonomy'] },

  // VentureOS — Community
  { agentId: 'ava-chen', name: 'Ava Chen', role: 'VP Community, VentureOS', parentId: 'jordan-park', capabilities: ['community', 'growth', 'partnerships'] },
  { agentId: 'jules-rivera', name: 'Jules Rivera', role: 'Technical Writer, VentureOS', parentId: 'ava-chen', capabilities: ['docs', 'writing', 'tutorials'] },
  { agentId: 'ren-kowalski', name: 'Ren Kowalski', role: 'Dev Relations, VentureOS', parentId: 'ava-chen', capabilities: ['devrel', 'demos', 'outreach'] },
];

console.log(`📋 Registering ${team.length} agents...`);
for (const agent of team) {
  await pushEvent({
    type: 'agent/register',
    timestamp: tick(),
    data: agent,
  });
  console.log(`  ✅ ${agent.name} (${agent.role})`);
}
console.log();

// ── Step 3: Push heartbeat/status events ───────────────────────
interface Heartbeat {
  agentId: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  currentTask?: string;
}

const heartbeats: Heartbeat[] = [
  { agentId: 'jordan-park', status: 'active', currentTask: 'Planning Sprint 3' },
  { agentId: 'sana-okafor', status: 'active', currentTask: 'Verifying demo servers' },
  { agentId: 'ravi-patel', status: 'idle', currentTask: 'Finished bulletproofing README' },
  { agentId: 'lex-morales', status: 'idle', currentTask: 'Completed QA sign-off' },
  { agentId: 'kai-nakamura', status: 'idle', currentTask: 'Fixed bun-types bug' },
  { agentId: 'zoe-chen', status: 'idle', currentTask: 'Fixed import.meta.env bug' },
  { agentId: 'mia-torres', status: 'idle', currentTask: 'Fixed CSS module types' },
  // Rest of team online
  { agentId: 'max', status: 'active', currentTask: 'Overseeing portfolio' },
  { agentId: 'niko-reyes', status: 'active', currentTask: 'Evaluating deal flow' },
  { agentId: 'priya-sharma', status: 'active', currentTask: 'ArchitectAI roadmap' },
  { agentId: 'marcus-webb', status: 'active', currentTask: 'Monitoring CI/CD pipeline' },
  { agentId: 'priya-desai', status: 'idle', currentTask: 'Test suite green' },
  { agentId: 'sam-torres', status: 'idle', currentTask: 'Integration tests passing' },
  { agentId: 'noor-abbasi', status: 'active', currentTask: 'LLM agent architecture review' },
  { agentId: 'eli-vance', status: 'active', currentTask: 'Agentic loop experiments' },
  { agentId: 'ava-chen', status: 'active', currentTask: 'Community launch prep' },
  { agentId: 'jules-rivera', status: 'active', currentTask: 'Writing API docs' },
  { agentId: 'ren-kowalski', status: 'active', currentTask: 'Preparing demo video' },
];

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

// ── Step 4: Push real messages ─────────────────────────────────
interface Message {
  from: string;
  content: string;
  messageType: 'chat' | 'task' | 'review' | 'blocker';
  to?: string;
}

const messages: Message[] = [
  {
    from: 'jordan-park',
    content: 'Sprint 3 plan in progress — assembling UX team for legendary dashboard overhaul',
    messageType: 'task',
  },
  {
    from: 'sana-okafor',
    content: 'All servers verified. Backend on 3000, dashboard on 5173. Demo ready.',
    messageType: 'chat',
  },
  {
    from: 'lex-morales',
    content: 'QA sign-off complete. Type-check zero errors. Build clean. 7/7 endpoints passing.',
    messageType: 'review',
  },
  {
    from: 'ravi-patel',
    content: 'README bulletproofed and pushed. Any developer can clone and run in 2 minutes.',
    messageType: 'chat',
  },
  {
    from: 'kai-nakamura',
    content: 'bun-types resolution fixed — all server builds clean now.',
    messageType: 'chat',
  },
  {
    from: 'zoe-chen',
    content: 'import.meta.env types patched in vite-env.d.ts. Dashboard compiles without warnings.',
    messageType: 'chat',
  },
  {
    from: 'mia-torres',
    content: 'CSS module types resolved. Tailwind + module imports working across all components.',
    messageType: 'chat',
  },
];

console.log('💬 Pushing messages...');
for (const msg of messages) {
  await pushEvent({
    type: 'agent/message',
    timestamp: tick(),
    data: msg,
  });
  console.log(`  💬 ${msg.from}: "${msg.content.slice(0, 60)}..."`);
}
console.log();

// ── Step 5: Push some task updates ─────────────────────────────
interface Task {
  taskId: string;
  title: string;
  status: 'backlog' | 'in_progress' | 'review' | 'done';
  assigneeId: string;
  description: string;
}

const tasks: Task[] = [
  { taskId: 'sprint-3-plan', title: 'Sprint 3 Planning', status: 'in_progress', assigneeId: 'jordan-park', description: 'Assemble Sprint 3 scope — dashboard overhaul, agent hierarchy, real-time feeds' },
  { taskId: 'demo-servers', title: 'Verify Demo Servers', status: 'done', assigneeId: 'sana-okafor', description: 'Confirm backend (3000) and dashboard (5173) are running and healthy' },
  { taskId: 'readme-bulletproof', title: 'Bulletproof README', status: 'done', assigneeId: 'ravi-patel', description: 'Ensure any developer can clone, install, and run in under 2 minutes' },
  { taskId: 'qa-signoff', title: 'QA Sign-Off', status: 'done', assigneeId: 'lex-morales', description: 'Type-check, build, and endpoint verification — 7/7 passing' },
  { taskId: 'fix-bun-types', title: 'Fix bun-types Resolution', status: 'done', assigneeId: 'kai-nakamura', description: 'Resolve bun-types package conflict causing server build failures' },
  { taskId: 'fix-import-meta', title: 'Fix import.meta.env Types', status: 'done', assigneeId: 'zoe-chen', description: 'Patch vite-env.d.ts for proper import.meta.env type support' },
  { taskId: 'fix-css-modules', title: 'Fix CSS Module Types', status: 'done', assigneeId: 'mia-torres', description: 'Resolve CSS module + Tailwind type conflicts across components' },
  { taskId: 'live-team-script', title: 'Push Live Team Data', status: 'in_progress', assigneeId: 'sana-okafor', description: 'Create and run scripts/push-live-team.ts to populate real agents' },
  { taskId: 'dashboard-overhaul', title: 'Dashboard Overhaul', status: 'backlog', assigneeId: 'mia-torres', description: 'Redesign dashboard with agent hierarchy, real-time feed, and status cards' },
  { taskId: 'agent-hierarchy-viz', title: 'Agent Hierarchy Visualization', status: 'backlog', assigneeId: 'zoe-chen', description: 'Interactive org chart showing parent-child agent relationships' },
];

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
console.log('\n🚀 LIVE TEAM PUSHED. Dashboard at http://localhost:5173 should show the real aviraldua93 Ventures team.');
