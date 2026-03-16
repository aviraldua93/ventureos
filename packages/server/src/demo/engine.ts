import type { EventStore } from '../events/store';
import type { VentureEvent } from '@ventureos/shared';

export interface DemoEvent {
  delayMs: number;
  event: VentureEvent;
}

export interface DemoProgress {
  current: number;
  total: number;
  pct: number;
}

export interface DemoStatus {
  running: boolean;
  paused: boolean;
  speed: number;
  progress: DemoProgress;
  liveMode: boolean;
}

// ── Sprint Plan Tasks (real work, not gibberish) ────────────────

const SPRINT_TASKS: Array<{ title: string; description: string; team: string[] }> = [
  { title: 'Virtual Office sprite rendering', description: 'Canvas2D agent sprites with status glow and animations', team: ['mia-torres', 'ravi-patel', 'kenji-ohara'] },
  { title: 'Agent pathfinding A*', description: 'Tile-based pathfinding for agent movement between rooms', team: ['zoe-chen', 'mia-chen'] },
  { title: 'WebSocket event streaming', description: 'Real-time event push from server to dashboard clients', team: ['kai-nakamura', 'zoe-chen'] },
  { title: 'Task board redesign', description: 'Kanban board with drag-drop and swimlanes by team', team: ['ravi-patel', 'lena-park'] },
  { title: 'OrgChart component', description: 'Interactive org chart showing team hierarchy', team: ['devon-achebe', 'lena-park'] },
  { title: 'Playwright E2E suite', description: 'End-to-end tests for all dashboard views', team: ['riley-nakamura', 'sam-okonkwo', 'casey-lin'] },
  { title: 'Browser daemon prototype', description: 'Persistent Chromium instance for faster test runs', team: ['alex-petrov'] },
  { title: 'Sprint burndown dashboard', description: 'Real-time sprint progress visualization', team: ['marc-delacroix', 'dana-whitfield'] },
  { title: 'Agent emotion system', description: 'Map operational states to visual emotions in the office', team: ['mia-chen', 'kenji-ohara'] },
  { title: 'Code diff view with Shiki', description: 'Syntax-highlighted code diffs in the dashboard', team: ['kai-nakamura', 'ravi-patel'] },
  { title: 'CI pipeline optimization', description: 'Parallel test runs and caching for faster CI', team: ['marcus-webb'] },
  { title: 'LLM streaming integration', description: 'Stream LLM responses with latency tracking', team: ['noor-abbasi', 'eli-vance'] },
  { title: 'API documentation', description: 'Generate OpenAPI spec for all endpoints', team: ['jules-rivera', 'maya-patel'] },
  { title: 'Community Discord bot', description: 'Bot for auto-posting release notes and updates', team: ['ava-chen', 'ren-kowalski'] },
  { title: 'Phase 2 PRD', description: 'Product requirements for spectator mode and replay', team: ['iris-oduya', 'leo-tanaka'] },
  { title: 'QA regression suite', description: 'Full regression testing before release', team: ['lex-morales', 'priya-desai', 'sam-torres'] },
];

// Messages that reference real work — each tied to an agent who actually does that work
const LIVE_MESSAGES: Array<{ from: string; to?: string; content: string; messageType: 'chat' | 'task' | 'review' | 'blocker' }> = [
  { from: 'mia-torres', content: 'Sprite rendering pass complete — status glows are in.', messageType: 'task' },
  { from: 'zoe-chen', to: 'mia-torres', content: 'A* pathfinding is finding routes across all rooms now.', messageType: 'task' },
  { from: 'kai-nakamura', content: 'WebSocket reconnection with backoff is solid. Tested under load.', messageType: 'task' },
  { from: 'ravi-patel', content: 'Task board drag-drop feels smooth. Swimlanes by team next.', messageType: 'task' },
  { from: 'riley-nakamura', content: 'Playwright suite at 12 tests. Adding Virtual Office coverage.', messageType: 'task' },
  { from: 'sam-okonkwo', to: 'riley-nakamura', content: 'E2E for OrgChart is green. Moving to TaskBoard.', messageType: 'task' },
  { from: 'casey-lin', content: 'CodeDiffView E2E tests captured. Shiki highlighting verified.', messageType: 'task' },
  { from: 'alex-petrov', content: 'Chromium daemon boots in <200ms now. Huge E2E speedup.', messageType: 'task' },
  { from: 'marcus-webb', content: 'CI pipeline green across all packages. Build time down 40%.', messageType: 'task' },
  { from: 'noor-abbasi', content: 'LLM streaming latency down to 80ms p50. Good enough for demo.', messageType: 'task' },
  { from: 'eli-vance', content: 'Agent orchestration handling 50 concurrent sessions.', messageType: 'task' },
  { from: 'jordan-park', content: 'Sprint velocity is 🔥 this week. Ship it.', messageType: 'chat' },
  { from: 'sana-okafor', content: 'All servers verified. Backend 3000, dashboard 5173.', messageType: 'chat' },
  { from: 'dana-whitfield', content: 'Sprint burndown on track. No blockers in standup.', messageType: 'chat' },
  { from: 'marc-delacroix', to: 'sana-okafor', content: 'Can we finalize the design tokens by Thursday?', messageType: 'review' },
  { from: 'iris-oduya', content: 'Phase 2 PRD ready for review. Spectator mode scoped.', messageType: 'review' },
  { from: 'leo-tanaka', content: 'Cross-team dependencies mapped. No conflicts.', messageType: 'chat' },
  { from: 'lex-morales', to: 'priya-desai', content: 'Run the full regression before we tag the release.', messageType: 'task' },
  { from: 'priya-desai', content: 'Found 3 edge cases in event replay. Filing bugs.', messageType: 'blocker' },
  { from: 'sam-torres', content: 'Integration tests all passing. E2E coverage at 94%.', messageType: 'task' },
  { from: 'ava-chen', content: 'Community Discord hit 5K members! 🎉', messageType: 'chat' },
  { from: 'jules-rivera', content: 'API docs generated. Adding interactive examples.', messageType: 'task' },
  { from: 'ren-kowalski', content: 'DevRel demo went great — 200+ live viewers.', messageType: 'chat' },
  { from: 'maya-patel', content: 'Getting started guide updated with orchestration bridge docs.', messageType: 'task' },
  { from: 'max', content: 'Portfolio metrics strong. VentureOS leading velocity.', messageType: 'chat' },
  { from: 'niko-reyes', content: 'Scouted 3 integration partners this week.', messageType: 'task' },
  { from: 'priya-sharma', to: 'kai-nakamura', content: 'Can you review the API changes? Want to ship EOD.', messageType: 'review' },
  { from: 'mia-torres', to: 'ravi-patel', content: 'Your tooltip PR looks great. Approving.', messageType: 'review' },
];

const LIVE_CODE_CHANGES: Array<{ agentId: string; filePath: string; diff: string; description: string }> = [
  { agentId: 'mia-torres', filePath: 'src/core/event-bus.ts', diff: '+  private cache = new WeakMap();\n-  private cache = new Map();', description: 'Fix memory leak in event bus cache' },
  { agentId: 'zoe-chen', filePath: 'src/mcp/transport.ts', diff: '+  async reconnect() {\n+    await this.backoff();\n+    return this.connect();\n+  }', description: 'Add reconnection with exponential backoff' },
  { agentId: 'kai-nakamura', filePath: 'src/api/middleware.ts', diff: '+  const token = req.headers.get("Authorization");\n+  if (!token) return unauthorized();', description: 'Add auth middleware validation' },
  { agentId: 'maya-patel', filePath: 'docs/README.md', diff: '+  ## FAQ\n+  ### How do I reset the demo?\n+  Click the restart button in the control bar.', description: 'Add FAQ section to documentation' },
  { agentId: 'ravi-patel', filePath: 'src/core/projections.ts', diff: '+  private memoized = new Map();\n+  invalidate() { this.memoized.clear(); }', description: 'Add memoization to projections' },
  { agentId: 'zoe-chen', filePath: 'src/mcp/session.ts', diff: '+  correlationId: crypto.randomUUID(),', description: 'Add correlation IDs for SSE tracking' },
  { agentId: 'kai-nakamura', filePath: 'src/api/routes.ts', diff: '+  app.get("/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));', description: 'Enhance health endpoint with uptime' },
  { agentId: 'mia-torres', filePath: 'src/core/store.ts', diff: '+  async batchAppend(events: Event[]) {\n+    for (const e of events) await this.append(e);\n+  }', description: 'Add batch event appending' },
  { agentId: 'ravi-patel', filePath: 'src/components/AgentCard.tsx', diff: '+  const emotionIcon = getEmotionIcon(agent.emotion);\n+  return <span className={css.emotion}>{emotionIcon}</span>;', description: 'Add emotion indicators to agent cards' },
  { agentId: 'mia-torres', filePath: 'src/hooks/useTheme.ts', diff: '+  const [theme, setTheme] = useState<Theme>("dark");\n+  useEffect(() => document.body.dataset.theme = theme, [theme]);', description: 'Implement theme switching hook' },
  { agentId: 'kai-nakamura', filePath: 'src/api/ws-handler.ts', diff: '+  if (msg.type === "spectator:join") {\n+    ws.subscribe("spectator");\n+    ws.send(JSON.stringify(snapshot));\n+  }', description: 'Add spectator mode WebSocket handler' },
  { agentId: 'zoe-chen', filePath: 'src/engine/replay.ts', diff: '+  addBookmark(timestamp: number, label: string) {\n+    this.bookmarks.push({ timestamp, label });\n+  }', description: 'Add bookmark support to replay engine' },
  { agentId: 'marcus-webb', filePath: '.github/workflows/ci.yml', diff: '+  - name: E2E Tests\n+    run: bun run test:e2e\n+    env:\n+      CI: true', description: 'Add E2E tests to CI pipeline' },
  { agentId: 'eli-vance', filePath: 'src/agents/orchestrator.ts', diff: '+  async delegateTask(task: Task, agents: Agent[]) {\n+    const best = this.rankAgents(agents, task);\n+    return best[0].execute(task);\n+  }', description: 'Implement intelligent task delegation' },
  { agentId: 'noor-abbasi', filePath: 'src/llm/streaming.ts', diff: '+  for await (const chunk of stream) {\n+    yield { token: chunk.text, latency: Date.now() - start };\n+  }', description: 'Add streaming response with latency tracking' },
];

const TASK_POOL: Array<{ title: string; description: string }> = [
  { title: 'Implement rate limiting', description: 'Add request rate limiting to API endpoints' },
  { title: 'Add error telemetry', description: 'Integrate error tracking for production monitoring' },
  { title: 'Optimize bundle size', description: 'Tree-shake unused dependencies and lazy-load routes' },
  { title: 'Add keyboard shortcuts', description: 'Implement Cmd+K command palette' },
  { title: 'WebSocket compression', description: 'Enable permessage-deflate for WS traffic' },
  { title: 'Dark mode refinements', description: 'Fix contrast issues in dark theme' },
  // Expanded task pool
  { title: 'Agent emotion system', description: 'Map operational states to visual emotions in the office' },
  { title: 'Spectator mode MVP', description: 'Read-only view with shareable links' },
  { title: 'Replay bookmarks', description: 'Auto-detect key moments and allow manual bookmarks' },
  { title: 'Office theme selector', description: 'Allow users to customize office color palette' },
  { title: 'Agent tooltip enrichment', description: 'Show current task, emotion, and activity in tooltip' },
  { title: 'Performance profiling', description: 'Add flame graph for agent execution timelines' },
  { title: 'Mobile responsive layout', description: 'Ensure dashboard works at 768px breakpoint' },
  { title: 'API documentation', description: 'Generate OpenAPI spec for all endpoints' },
];

// Full team roster matching push-live-team.ts
const AGENTS = [
  'jordan-park', 'sana-okafor', 'mia-torres', 'ravi-patel', 'zoe-chen',
  'kai-nakamura', 'marcus-webb', 'lex-morales', 'priya-desai', 'sam-torres',
  'noor-abbasi', 'eli-vance', 'ava-chen', 'jules-rivera', 'ren-kowalski',
  'maya-patel', 'dana-whitfield', 'marc-delacroix', 'leo-tanaka', 'iris-oduya',
  'sana-matsuda', 'max', 'niko-reyes', 'priya-sharma',
];

const TASK_STATUSES: Array<'backlog' | 'in_progress' | 'review' | 'done'> = ['backlog', 'in_progress', 'review', 'done'];

// Dynamic content generators — only used for active agents
const DYNAMIC_CHAT_TEMPLATES = [
  (_from: string) => `Just pushed a commit to fix the ${pick(['flaky test', 'CSS layout issue', 'type error', 'race condition', 'null pointer'])}.`,
  (_from: string) => `${pick(['Great standup today!', 'Loved the demo.', 'Really clean PR.', 'Nice refactor!', 'This architecture is 🔥'])}`,
  (_from: string) => `Working on ${pick(['the dashboard', 'agent sync', 'event replay', 'the API layer', 'documentation', 'the CLI'])} — ETA ${pick(['30 min', '1 hour', 'end of day', 'tomorrow morning'])}.`,
  (_from: string) => `${pick(['Anyone seen this before?', 'Quick question:', 'FYI:', 'Heads up:', 'Update:'])} ${pick(['the tests are flaky in CI', 'I found a workaround', 'staging is back up', 'the feature flag is live', 'metrics look good'])}`,
  (_from: string) => `${pick(['Reviewing', 'Looking at', 'Debugging', 'Optimizing', 'Refactoring'])} the ${pick(['WebSocket handler', 'event store', 'projection engine', 'task board', 'org chart', 'virtual office'])}`,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickAgent(): string {
  return AGENTS[Math.floor(Math.random() * AGENTS.length)];
}

export class DemoEngine {
  private scenario: DemoEvent[] = [];
  private store: EventStore;
  private currentIndex = 0;
  private speed = 1;
  private running = false;
  private paused = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private liveMode = false;
  private liveTimer: ReturnType<typeof setTimeout> | null = null;
  private liveMsgIdx = 0;
  private liveCodeIdx = 0;
  private liveTaskCounter = 0;
  private eventCounter = 0;
  private sprintTaskIdx = 0;

  // Agent state tracking — the simulation respects real agent states
  private agentStates = new Map<string, 'active' | 'idle' | 'error' | 'offline'>();
  private agentTasks = new Map<string, string>();

  constructor(store: EventStore) {
    this.store = store;

    // Listen for real events pushed via API to track agent states
    store.subscribe((event) => {
      if (event.type === 'agent/heartbeat') {
        this.agentStates.set(event.data.agentId, event.data.status);
        if (event.data.currentTask) {
          this.agentTasks.set(event.data.agentId, event.data.currentTask);
        } else if (event.data.status === 'idle') {
          this.agentTasks.delete(event.data.agentId);
        }
      } else if (event.type === 'agent/register') {
        // New agents start idle unless explicitly activated
        if (!this.agentStates.has(event.data.agentId)) {
          this.agentStates.set(event.data.agentId, 'idle');
        }
      }
    });
  }

  /** Get agents that are currently active (deployed for real work) */
  private getActiveAgents(): string[] {
    const active: string[] = [];
    for (const [id, status] of this.agentStates) {
      if (status === 'active') active.push(id);
    }
    return active;
  }

  /** Get agents that are currently idle */
  private getIdleAgents(): string[] {
    const idle: string[] = [];
    for (const [id, status] of this.agentStates) {
      if (status === 'idle') idle.push(id);
    }
    return idle;
  }

  /** Check if an agent is deployed (active) */
  private isActive(agentId: string): boolean {
    return this.agentStates.get(agentId) === 'active';
  }

  loadScenario(scenario: DemoEvent[]): void {
    this.scenario = scenario;
    this.currentIndex = 0;
  }

  start(speed = 1): void {
    if (this.running) return;
    this.speed = speed;
    this.running = true;
    this.paused = false;
    this.currentIndex = 0;
    this.store.clear();
    this.liveMode = false;
    this.eventCounter = 0;
    this.agentStates.clear();
    this.agentTasks.clear();
    this.stopLive();
    this.scheduleNext();
  }

  pause(): void {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.liveTimer) {
      clearTimeout(this.liveTimer);
      this.liveTimer = null;
    }
  }

  resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    if (this.liveMode) {
      this.scheduleLiveEvent();
    } else {
      this.scheduleNext();
    }
  }

  setSpeed(multiplier: number): void {
    this.speed = multiplier;
    if (this.running && !this.paused) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.liveTimer) {
        clearTimeout(this.liveTimer);
        this.liveTimer = null;
      }
      if (this.liveMode) {
        this.scheduleLiveEvent();
      } else {
        this.scheduleNext();
      }
    }
  }

  restart(): void {
    this.stop();
    this.store.clear();
    this.currentIndex = 0;
    this.liveMode = false;
    this.liveMsgIdx = 0;
    this.liveCodeIdx = 0;
    this.liveTaskCounter = 0;
    this.eventCounter = 0;
    this.sprintTaskIdx = 0;
    this.agentStates.clear();
    this.agentTasks.clear();
    this.running = true;
    this.paused = false;
    this.scheduleNext();
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    this.liveMode = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.stopLive();
  }

  private stopLive(): void {
    if (this.liveTimer) {
      clearTimeout(this.liveTimer);
      this.liveTimer = null;
    }
  }

  getProgress(): DemoProgress {
    const total = this.scenario.length;
    const current = this.currentIndex;
    return {
      current,
      total,
      pct: total === 0 ? 0 : Math.round((current / total) * 100),
    };
  }

  getStatus(): DemoStatus {
    return {
      running: this.running,
      paused: this.paused,
      speed: this.speed,
      progress: this.getProgress(),
      liveMode: this.liveMode,
    };
  }

  private scheduleNext(): void {
    if (!this.running || this.paused) return;
    if (this.currentIndex >= this.scenario.length) {
      this.liveMode = true;
      this.scheduleLiveEvent();
      return;
    }

    const entry = this.scenario[this.currentIndex];
    const delay = entry.delayMs / this.speed;

    this.timer = setTimeout(async () => {
      if (!this.running || this.paused) return;

      const ev = { ...entry.event, timestamp: Date.now() };
      await this.store.append(ev);
      this.currentIndex++;
      this.scheduleNext();
    }, delay);
  }

  /** Generate continuous live events after scenario completes */
  private scheduleLiveEvent(): void {
    if (!this.running || this.paused || !this.liveMode) return;

    const activeAgents = this.getActiveAgents();
    // If agents are deployed, generate events faster for a lively feel
    // If nobody is active, slow down to ambient pace
    const baseDelay = activeAgents.length > 0
      ? (1000 + Math.random() * 3000)
      : (3000 + Math.random() * 5000);
    const delay = baseDelay / this.speed;

    this.liveTimer = setTimeout(async () => {
      if (!this.running || this.paused) return;

      const event = this.generateLiveEvent();
      if (event) {
        await this.store.append(event);
      }
      this.scheduleLiveEvent();
    }, delay);
  }

  private generateLiveEvent(): VentureEvent | null {
    const now = Date.now();
    const roll = Math.random();
    this.eventCounter++;

    const activeAgents = this.getActiveAgents();
    const hasActiveAgents = activeAgents.length > 0;

    if (roll < 0.30) {
      // Heartbeat — only update active agents with task progress
      // Don't randomly flip idle agents to active (that's the orchestration bridge's job)
      if (!hasActiveAgents) {
        // No active agents: skip heartbeat or emit ambient idle heartbeats
        if (Math.random() < 0.3) {
          const allRegistered = Array.from(this.agentStates.keys());
          if (allRegistered.length > 0) {
            const agentId = pick(allRegistered);
            return {
              type: 'agent/heartbeat',
              timestamp: now,
              data: {
                agentId,
                status: this.agentStates.get(agentId) || 'idle',
              },
            };
          }
        }
        return null;
      }

      // Active agents: refresh their status with their real task
      const agentId = pick(activeAgents);
      const currentTask = this.agentTasks.get(agentId);
      return {
        type: 'agent/heartbeat',
        timestamp: now,
        data: {
          agentId,
          status: 'active',
          currentTask: currentTask || pick(TASK_POOL).title,
        },
      };
    } else if (roll < 0.55) {
      // Messages — active agents generate task messages, idle agents can chat
      if (hasActiveAgents && Math.random() < 0.7) {
        // Active agent work message
        const from = pick(activeAgents);
        const task = this.agentTasks.get(from);

        // Find a message from this agent if one exists
        const agentMessages = LIVE_MESSAGES.filter(m => m.from === from);
        if (agentMessages.length > 0) {
          const msg = pick(agentMessages);
          return { type: 'agent/message', timestamp: now, data: { ...msg } };
        }

        // Otherwise generate a dynamic message about their task
        const content = task
          ? `Working on: ${task}`
          : pick(DYNAMIC_CHAT_TEMPLATES)(from);
        return {
          type: 'agent/message',
          timestamp: now,
          data: { from, content, messageType: 'task' as const },
        };
      }

      // Pool message from any registered agent
      const msg = LIVE_MESSAGES[this.liveMsgIdx % LIVE_MESSAGES.length];
      this.liveMsgIdx++;

      // Only send if the sender is registered and not offline
      const senderState = this.agentStates.get(msg.from);
      if (senderState && senderState !== 'offline') {
        return { type: 'agent/message', timestamp: now, data: { ...msg } };
      }

      // Fallback: dynamic message from a random active or idle agent
      const anyAgent = hasActiveAgents ? pick(activeAgents) : pickAgent();
      const template = pick(DYNAMIC_CHAT_TEMPLATES);
      return {
        type: 'agent/message',
        timestamp: now,
        data: { from: anyAgent, content: template(anyAgent), messageType: 'chat' as const },
      };
    } else if (roll < 0.75) {
      // Code change — only from active agents
      if (!hasActiveAgents) {
        // No active agents: use pool but only if the agent is registered
        const change = LIVE_CODE_CHANGES[this.liveCodeIdx % LIVE_CODE_CHANGES.length];
        this.liveCodeIdx++;
        const agentState = this.agentStates.get(change.agentId);
        if (agentState === 'active') {
          return { type: 'agent/code_change', timestamp: now, data: { ...change } };
        }
        return null; // Skip code changes when nobody is working
      }

      // Prefer code changes from active agents
      const activeCodeChanges = LIVE_CODE_CHANGES.filter(c => activeAgents.includes(c.agentId));
      if (activeCodeChanges.length > 0) {
        const change = pick(activeCodeChanges);
        return { type: 'agent/code_change', timestamp: now, data: { ...change } };
      }

      // Fallback to pool
      const change = LIVE_CODE_CHANGES[this.liveCodeIdx % LIVE_CODE_CHANGES.length];
      this.liveCodeIdx++;
      return { type: 'agent/code_change', timestamp: now, data: { ...change } };
    } else {
      // Task update — use real sprint tasks, assign to active agents
      if (hasActiveAgents) {
        // Pick a sprint task that involves an active agent
        const sprintTask = SPRINT_TASKS[this.sprintTaskIdx % SPRINT_TASKS.length];
        this.sprintTaskIdx++;
        const taskId = `sprint-task-${this.liveTaskCounter++}`;

        // Find an active agent from this task's team, or any active agent
        const taskActiveMembers = sprintTask.team.filter(a => activeAgents.includes(a));
        const assignee = taskActiveMembers.length > 0
          ? pick(taskActiveMembers)
          : pick(activeAgents);

        const status = pick(TASK_STATUSES);
        return {
          type: 'agent/task_update',
          timestamp: now,
          data: {
            taskId,
            title: sprintTask.title,
            status,
            assigneeId: assignee,
            description: sprintTask.description,
          },
        };
      }

      // No active agents: only generate backlog items (planning, not execution)
      const taskPool = TASK_POOL[this.liveTaskCounter % TASK_POOL.length];
      const taskId = `live-task-${this.liveTaskCounter}`;
      this.liveTaskCounter++;
      return {
        type: 'agent/task_update',
        timestamp: now,
        data: {
          taskId,
          title: taskPool.title,
          status: 'backlog',
          description: taskPool.description,
        },
      };
    }
  }
}
