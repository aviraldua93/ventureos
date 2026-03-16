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
  { agentId: 'maya-patel', name: 'Maya Patel', role: 'Content Engineer, VentureOS', parentId: 'ava-chen', capabilities: ['content', 'docs', 'writing'] },

  // VentureOS — Sprint 3 UX + Frontend
  { agentId: 'marc-delacroix', name: 'Marc Delacroix', role: 'Sprint Lead, VentureOS', parentId: 'jordan-park', capabilities: ['sprint-planning', 'execution', 'tracking'] },
  { agentId: 'sana-matsuda', name: 'Sana Matsuda', role: 'UX Designer, VentureOS', parentId: 'sana-okafor', capabilities: ['ux', 'design-systems', 'figma'] },
  { agentId: 'elena-volkov', name: 'Elena Volkov', role: 'UX Designer, VentureOS', parentId: 'sana-okafor', capabilities: ['ux', 'layout', 'navigation'] },
  { agentId: 'ravi-krishnamurthy', name: 'Ravi Krishnamurthy', role: 'UX Designer, VentureOS', parentId: 'sana-okafor', capabilities: ['ux', 'interaction-design', 'responsive'] },
  { agentId: 'lena-park', name: 'Lena Park', role: 'Frontend Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['react', 'typescript', 'components'] },
  { agentId: 'devon-achebe', name: 'Devon Achebe', role: 'Frontend Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['react', 'typescript', 'navigation'] },
  { agentId: 'tomas-herrera', name: 'Tomás Herrera', role: 'Frontend Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['react', 'typescript', 'theming'] },
  { agentId: 'kenji-ohara', name: 'Kenji Ohara', role: 'Pixel Art Specialist, VentureOS', parentId: 'sana-okafor', capabilities: ['pixel-art', 'pixi-js', 'sprites'] },
  { agentId: 'mia-chen', name: 'Mia Chen', role: 'Motion Engineer, VentureOS', parentId: 'sana-okafor', capabilities: ['animation', 'pixi-js', 'timeline'] },

  // VentureOS — Playwright Track
  { agentId: 'riley-nakamura', name: 'Riley Nakamura', role: 'Playwright Lead, VentureOS', parentId: 'jordan-park', capabilities: ['playwright', 'e2e', 'test-architecture'] },
  { agentId: 'sam-okonkwo', name: 'Sam Okonkwo', role: 'Automation Engineer, VentureOS', parentId: 'riley-nakamura', capabilities: ['playwright', 'automation', 'e2e'] },
  { agentId: 'casey-lin', name: 'Casey Lin', role: 'Automation Engineer, VentureOS', parentId: 'riley-nakamura', capabilities: ['playwright', 'automation', 'e2e'] },
  { agentId: 'alex-petrov', name: 'Alex Petrov', role: 'Browser Infra Engineer, VentureOS', parentId: 'riley-nakamura', capabilities: ['chromium', 'browser-infra', 'playwright'] },
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
  { agentId: 'ravi-patel', status: 'active', currentTask: 'Redesigning TaskBoard component' },
  { agentId: 'lex-morales', status: 'active', currentTask: 'Writing Sprint 3 QA test plan' },
  { agentId: 'kai-nakamura', status: 'active', currentTask: 'Redesigning CodeDiffView + Shiki integration' },
  { agentId: 'zoe-chen', status: 'active', currentTask: 'Redesigning AgentDetail component' },
  { agentId: 'mia-torres', status: 'active', currentTask: 'Redesigning MessageStream component' },
  // Rest of team online
  { agentId: 'max', status: 'active', currentTask: 'Overseeing portfolio' },
  { agentId: 'niko-reyes', status: 'active', currentTask: 'Evaluating deal flow' },
  { agentId: 'priya-sharma', status: 'active', currentTask: 'ArchitectAI roadmap' },
  { agentId: 'marcus-webb', status: 'active', currentTask: 'Monitoring CI/CD pipeline' },
  { agentId: 'priya-desai', status: 'active', currentTask: 'Writing functional test cases' },
  { agentId: 'sam-torres', status: 'active', currentTask: 'E2E test strategy coordination' },
  { agentId: 'noor-abbasi', status: 'active', currentTask: 'LLM agent architecture review' },
  { agentId: 'eli-vance', status: 'active', currentTask: 'Agentic loop experiments' },
  { agentId: 'ava-chen', status: 'active', currentTask: 'Community launch prep' },
  { agentId: 'jules-rivera', status: 'active', currentTask: 'Writing API docs' },
  { agentId: 'ren-kowalski', status: 'active', currentTask: 'Preparing demo video' },
  // Sprint 3 + Playwright teams
  { agentId: 'maya-patel', status: 'active', currentTask: 'Sprint 3 documentation' },
  { agentId: 'marc-delacroix', status: 'active', currentTask: 'Sprint 3 kickoff' },
  { agentId: 'sana-matsuda', status: 'active', currentTask: 'Design system refinement' },
  { agentId: 'elena-volkov', status: 'active', currentTask: 'Dashboard shell layout' },
  { agentId: 'ravi-krishnamurthy', status: 'active', currentTask: 'Interaction patterns' },
  { agentId: 'lena-park', status: 'active', currentTask: 'OrgChart implementation' },
  { agentId: 'devon-achebe', status: 'active', currentTask: 'Dashboard shell build' },
  { agentId: 'tomas-herrera', status: 'active', currentTask: 'Responsive grid + dark theme' },
  { agentId: 'kenji-ohara', status: 'active', currentTask: 'Pixi.js scene setup' },
  { agentId: 'mia-chen', status: 'active', currentTask: 'Animation system design' },
  { agentId: 'riley-nakamura', status: 'active', currentTask: 'Playwright test expansion' },
  { agentId: 'sam-okonkwo', status: 'active', currentTask: 'E2E tests for OrgChart' },
  { agentId: 'casey-lin', status: 'active', currentTask: 'E2E tests for CodeDiffView' },
  { agentId: 'alex-petrov', status: 'active', currentTask: 'Chromium daemon prototype' },
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
  // Phase 1 deployment acknowledgments
  { from: 'mia-torres', content: 'On it! MessageStream is getting a complete overhaul — real-time grouping, status badges, the works. Gonna make it sing.', messageType: 'chat' },
  { from: 'ravi-patel', content: 'TaskBoard redesign accepted. Thinking Kanban-first with sprint lanes. Will have wireframes by EOD.', messageType: 'chat' },
  { from: 'zoe-chen', content: 'AgentDetail is mine. Adding live heartbeat indicators, task timeline, and hierarchy breadcrumbs. This is going to be clean.', messageType: 'chat' },
  { from: 'kai-nakamura', content: 'CodeDiffView + Shiki — love it. Already spiking the syntax highlighter integration. Should have a working prototype tonight.', messageType: 'chat' },
  { from: 'lex-morales', content: 'QA test plan for Phase 1 is priority one. Every component gets coverage. No shortcuts.', messageType: 'task' },
  { from: 'priya-desai', content: 'Writing functional test cases for each redesigned component now. MessageStream first, then TaskBoard, AgentDetail, CodeDiffView.', messageType: 'chat' },
  { from: 'sam-torres', content: "E2E strategy locked in. I'm bridging Lex's QA plan with Riley's Playwright infrastructure. Full coverage top to bottom.", messageType: 'chat' },
  { from: 'sana-matsuda', content: "Hey team! Excited to be here. Starting with design token audit and the OrgChart mockup — I'll have something to review by tomorrow morning.", messageType: 'chat' },
  { from: 'elena-volkov', content: 'Dashboard shell layout is my focus. Exploring sidebar nav patterns with responsive breakpoints. First draft incoming today.', messageType: 'chat' },
  { from: 'ravi-krishnamurthy', content: "Interaction patterns and responsive specs — I'm on it. Will coordinate with Sana and Elena to make sure everything's cohesive.", messageType: 'chat' },
  { from: 'lena-park', content: "OrgChart implementation — can't wait to build this. Gonna use react-flow under the hood with custom nodes. Let's go!", messageType: 'chat' },
  { from: 'devon-achebe', content: 'Dashboard shell and nav tabs, got it. Setting up the layout scaffold now. Will sync with Elena on the design specs.', messageType: 'chat' },
  { from: 'tomas-herrera', content: "Responsive grid + dark theme toggle. I'll build the CSS grid system first, then layer in the theme switcher with localStorage persistence.", messageType: 'chat' },
  { from: 'kenji-ohara', content: 'Pixel art time! Setting up the Pixi.js canvas and starting on character sprites for the whole team. This is going to look incredible.', messageType: 'chat' },
  { from: 'mia-chen', content: 'Animation system and timeline scrubber — this is exactly my jam. Building the interpolation engine first, then the UI controls.', messageType: 'chat' },
  { from: 'marc-delacroix', content: "Sprint Lead reporting for duty. I've got the Phase 1 tracker set up. Daily standups start tomorrow 9 AM. All leads — send me your estimates today.", messageType: 'task' },
  { from: 'riley-nakamura', content: 'Playwright lead here. Expanding test coverage to all dashboard routes starting now. Sam, Casey, Alex — sync with me in 30 minutes.', messageType: 'task' },
  { from: 'sam-okonkwo', content: 'Roger that, Riley. Writing e2e tests for OrgChart, MessageStream, and TaskBoard. Will have first suite ready by end of day.', messageType: 'chat' },
  { from: 'casey-lin', content: "On it — CodeDiffView, AgentDetail, and DemoControls e2e tests. Syncing with Riley in 30. Let's make this bulletproof.", messageType: 'chat' },
  { from: 'alex-petrov', content: 'Chromium daemon prototype — been wanting to build this. Persistent browser context should cut test execution time by 60%. Starting the architecture now.', messageType: 'chat' },
  { from: 'maya-patel', content: "Hey everyone! Content engineer here, joining Ava's community team. I'll be documenting all Sprint 3 architecture decisions and component APIs as they land.", messageType: 'chat' },
  // Jordan ownership clarifications
  { from: 'jordan-park', content: "Docs ownership: Ava Chen's team (Jules, Maya) owns all documentation going forward. Engineering writes code, Community writes docs.", messageType: 'task' },
  { from: 'jordan-park', content: "E2E ownership: Riley Nakamura's Playwright track owns all e2e tests. Lex's QA team owns manual QA, test plans, and sign-off. Sam Torres bridges both — he reports to Lex but coordinates with Riley.", messageType: 'task' },
  { from: 'jordan-park', content: 'Phase 1 is NOW. Marc is driving. All VPs: deploy your ICs today.', messageType: 'task' },
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
  // Phase 1 + Phase 2 task assignments
  { taskId: 'p1-messagestream', title: 'Phase 1: Redesign MessageStream', status: 'in_progress', assigneeId: 'mia-torres', description: 'Redesign MessageStream with real-time feed, message grouping, and status indicators' },
  { taskId: 'p1-taskboard', title: 'Phase 1: Redesign TaskBoard', status: 'in_progress', assigneeId: 'ravi-patel', description: 'Redesign TaskBoard with Kanban view, drag-drop, and sprint filtering' },
  { taskId: 'p1-agentdetail', title: 'Phase 1: Redesign AgentDetail', status: 'in_progress', assigneeId: 'zoe-chen', description: 'Redesign AgentDetail with live status, task history, and hierarchy breadcrumbs' },
  { taskId: 'p1-codediffview', title: 'Phase 1: Redesign CodeDiffView + Shiki', status: 'in_progress', assigneeId: 'kai-nakamura', description: 'Redesign CodeDiffView with Shiki syntax highlighting, inline comments, and diff navigation' },
  { taskId: 'p1-qa-testplan', title: 'Sprint 3 QA Test Plan', status: 'in_progress', assigneeId: 'lex-morales', description: 'Write comprehensive QA test plan for all Phase 1 deliverables' },
  { taskId: 'p1-functional-tests', title: 'Functional Test Cases for Phase 1', status: 'in_progress', assigneeId: 'priya-desai', description: 'Write functional test cases for each redesigned component' },
  { taskId: 'p1-e2e-strategy', title: 'E2E Test Strategy', status: 'in_progress', assigneeId: 'sam-torres', description: 'Own e2e test strategy, coordinate with Riley Nakamura Playwright team' },
  { taskId: 'p1-design-system', title: 'Design System Refinement + OrgChart Mockup', status: 'in_progress', assigneeId: 'sana-matsuda', description: 'Refine design tokens, component library, and create OrgChart redesign mockup' },
  { taskId: 'p1-dashboard-layout', title: 'Dashboard Shell Layout + Navigation Redesign', status: 'in_progress', assigneeId: 'elena-volkov', description: 'Design dashboard shell layout with sidebar navigation and responsive breakpoints' },
  { taskId: 'p1-interaction-patterns', title: 'Component Interaction Patterns + Responsive Design', status: 'in_progress', assigneeId: 'ravi-krishnamurthy', description: 'Define interaction patterns for all components and responsive design specifications' },
  { taskId: 'p1-orgchart-impl', title: 'Implement OrgChart Redesign', status: 'in_progress', assigneeId: 'lena-park', description: 'Build interactive OrgChart component with hierarchy visualization and agent detail drill-down' },
  { taskId: 'p1-dashboard-shell', title: 'Implement Dashboard Shell + Navigation Tabs', status: 'in_progress', assigneeId: 'devon-achebe', description: 'Build dashboard shell with tab navigation, sidebar, and responsive layout' },
  { taskId: 'p1-responsive-grid', title: 'Implement Responsive Grid + Dark Theme Toggle', status: 'in_progress', assigneeId: 'tomas-herrera', description: 'Build responsive CSS grid system and dark/light theme toggle with persistence' },
  { taskId: 'p2-pixijs-scene', title: 'Time-Travel Office: Pixi.js Scene + Sprites', status: 'in_progress', assigneeId: 'kenji-ohara', description: 'Set up Pixi.js canvas scene, create pixel art character sprites for all agents' },
  { taskId: 'p2-animation-system', title: 'Time-Travel Office: Animation + Timeline Scrubber', status: 'in_progress', assigneeId: 'mia-chen', description: 'Build animation system for agent movements, timeline scrubber for event replay' },
  { taskId: 'sprint3-lead', title: 'Sprint Lead: Phase 1 + Phase 2 Tracking', status: 'in_progress', assigneeId: 'marc-delacroix', description: 'Drive Sprint 3 execution — track Phase 1 deliverables, coordinate Phase 2 kickoff' },
  { taskId: 'pw-dashboard-routes', title: 'Expand Playwright Tests: Dashboard Routes', status: 'in_progress', assigneeId: 'riley-nakamura', description: 'Expand Playwright test coverage to all dashboard routes including new Phase 1 components' },
  { taskId: 'pw-orgchart-msg-task', title: 'E2E Tests: OrgChart, MessageStream, TaskBoard', status: 'in_progress', assigneeId: 'sam-okonkwo', description: 'Write Playwright e2e tests for OrgChart, MessageStream, and TaskBoard components' },
  { taskId: 'pw-codediff-agent-demo', title: 'E2E Tests: CodeDiffView, AgentDetail, DemoControls', status: 'in_progress', assigneeId: 'casey-lin', description: 'Write Playwright e2e tests for CodeDiffView, AgentDetail, and DemoControls' },
  { taskId: 'pw-chromium-daemon', title: 'Build Persistent Chromium Daemon Prototype', status: 'in_progress', assigneeId: 'alex-petrov', description: 'Build persistent Chromium daemon for faster test execution — shared browser context' },
  { taskId: 'maya-sprint3-docs', title: 'Sprint 3 Documentation', status: 'in_progress', assigneeId: 'maya-patel', description: 'Document Sprint 3 architecture decisions, component APIs, and deployment guides' },
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
