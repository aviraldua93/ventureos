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

// Expanded live messages — realistic ongoing team chatter with variety
const LIVE_MESSAGES: Array<{ from: string; to?: string; content: string; messageType: 'chat' | 'task' | 'review' | 'blocker' }> = [
  { from: 'priya-sharma', to: 'kai-nakamura', content: 'Can you review the latest API changes? I want to ship by EOD.', messageType: 'review' },
  { from: 'kai-nakamura', content: 'Refactoring the authentication middleware — found a cleaner pattern.', messageType: 'task' },
  { from: 'mia-torres', content: 'TypeScript strict mode is catching some edge cases we missed.', messageType: 'chat' },
  { from: 'zoe-chen', to: 'mia-torres', content: 'Need help with the WebSocket reconnection logic.', messageType: 'blocker' },
  { from: 'maya-patel', content: 'Documentation updated for the new CLI commands.', messageType: 'task' },
  { from: 'jordan-park', content: 'Sprint velocity looking great — we\'re ahead of schedule.', messageType: 'chat' },
  { from: 'kai-nakamura', to: 'zoe-chen', content: 'Your MCP transport implementation is solid. Approved with minor comments.', messageType: 'review' },
  { from: 'ravi-patel', content: 'Optimized the event store queries — 3x faster now.', messageType: 'task' },
  { from: 'zoe-chen', content: 'SSE correlation fix is working. Running integration tests.', messageType: 'task' },
  { from: 'maya-patel', to: 'jordan-park', content: 'Should we add a FAQ section to the README?', messageType: 'chat' },
  { from: 'jordan-park', content: 'All hands: great progress today. Let\'s keep this momentum.', messageType: 'chat' },
  { from: 'kai-nakamura', content: 'Deployed canary build to staging. Monitoring metrics.', messageType: 'task' },
  { from: 'mia-torres', to: 'kai-nakamura', content: 'Found a potential memory leak in the projection cache.', messageType: 'blocker' },
  { from: 'zoe-chen', content: 'All transport tests passing. Moving to integration phase.', messageType: 'task' },
  { from: 'maya-patel', content: 'Blog post draft ready for review: "Building with AI Agents"', messageType: 'review' },
  { from: 'kai-nakamura', to: 'mia-torres', content: 'Good catch on the memory leak — can you file a task?', messageType: 'chat' },
  { from: 'jordan-park', to: 'maya-patel', content: 'Yes, FAQ would be great. Add common setup issues.', messageType: 'chat' },
  { from: 'mia-torres', content: 'Implemented connection pooling for better throughput.', messageType: 'task' },
  { from: 'zoe-chen', to: 'kai-nakamura', content: 'Merging the MCP branch now. Tests are green.', messageType: 'task' },
  { from: 'maya-patel', content: 'Added interactive examples to the getting started guide.', messageType: 'task' },
  // New expanded messages for more variety
  { from: 'sana-okafor', content: 'Architecture review scheduled for 3pm. All leads please join.', messageType: 'chat' },
  { from: 'marcus-webb', content: 'CI pipeline green across all branches. Deploying to staging.', messageType: 'task' },
  { from: 'lex-morales', to: 'priya-desai', content: 'Run the full regression suite before we tag the release.', messageType: 'task' },
  { from: 'noor-abbasi', content: 'LLM latency down 40% after switching to streaming responses.', messageType: 'task' },
  { from: 'eli-vance', content: 'Agent orchestration layer handling 50 concurrent sessions now.', messageType: 'task' },
  { from: 'jules-rivera', content: 'Tutorial video scripts are done. Recording tomorrow.', messageType: 'task' },
  { from: 'ren-kowalski', content: 'DevRel demo went great — 200+ live viewers!', messageType: 'chat' },
  { from: 'dana-whitfield', content: 'Sprint burndown on track. No blockers in standup.', messageType: 'chat' },
  { from: 'marc-delacroix', to: 'sana-okafor', content: 'Can we get the design tokens finalized by Thursday?', messageType: 'review' },
  { from: 'iris-oduya', content: 'PRD for Phase 2 features is ready for review.', messageType: 'review' },
  { from: 'sana-matsuda', content: 'New component library patterns pushed to Figma.', messageType: 'task' },
  { from: 'priya-desai', content: 'Found 3 edge cases in the event replay. Filing bugs.', messageType: 'blocker' },
  { from: 'sam-torres', content: 'Integration tests all passing. E2E coverage at 94%.', messageType: 'task' },
  { from: 'leo-tanaka', content: 'Cross-team sync: ArchitectAI integration on schedule.', messageType: 'chat' },
  { from: 'ava-chen', content: 'Community Discord hit 5K members! 🎉', messageType: 'chat' },
  { from: 'max', content: 'Portfolio metrics look strong. VentureOS leading velocity.', messageType: 'chat' },
  { from: 'niko-reyes', content: 'Scouted 3 new potential integrations this week.', messageType: 'task' },
  { from: 'mia-torres', to: 'ravi-patel', content: 'Your PR for the new tooltip component looks great. Approving.', messageType: 'review' },
  { from: 'ravi-patel', content: 'Refactored the entire form validation layer. Much cleaner now.', messageType: 'task' },
  { from: 'zoe-chen', content: 'Hot module reload is now sub-100ms. DX win.', messageType: 'task' },
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
  // New expanded code changes
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

const STATUSES: Array<'active' | 'idle' | 'error'> = ['active', 'active', 'active', 'idle', 'idle', 'error'];
const TASK_STATUSES: Array<'backlog' | 'in_progress' | 'review' | 'done'> = ['backlog', 'in_progress', 'review', 'done'];

// Dynamic content generators for truly varied events
const DYNAMIC_CHAT_TEMPLATES = [
  (from: string) => `Just pushed a commit to fix the ${pick(['flaky test', 'CSS layout issue', 'type error', 'race condition', 'null pointer'])}.`,
  (from: string) => `${pick(['Great standup today!', 'Loved the demo.', 'Really clean PR.', 'Nice refactor!', 'This architecture is 🔥'])}`,
  (from: string) => `Working on ${pick(['the dashboard', 'agent sync', 'event replay', 'the API layer', 'documentation', 'the CLI'])} — ETA ${pick(['30 min', '1 hour', 'end of day', 'tomorrow morning'])}.`,
  (from: string) => `${pick(['Anyone seen this before?', 'Quick question:', 'FYI:', 'Heads up:', 'Update:'])} ${pick(['the tests are flaky in CI', 'I found a workaround', 'staging is back up', 'the feature flag is live', 'metrics look good'])}`,
  (from: string) => `${pick(['Reviewing', 'Looking at', 'Debugging', 'Optimizing', 'Refactoring'])} the ${pick(['WebSocket handler', 'event store', 'projection engine', 'task board', 'org chart', 'virtual office'])}`,
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

  constructor(store: EventStore) {
    this.store = store;
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

    // Varied delay: 1-5 seconds for more lively feel, scaled by speed
    const delay = (1000 + Math.random() * 4000) / this.speed;

    this.liveTimer = setTimeout(async () => {
      if (!this.running || this.paused) return;

      const event = this.generateLiveEvent();
      if (event) {
        await this.store.append(event);
      }
      this.scheduleLiveEvent();
    }, delay);
  }

  private generateLiveEvent(): VentureEvent {
    const now = Date.now();
    const roll = Math.random();
    this.eventCounter++;

    if (roll < 0.30) {
      // Heartbeat — agents change status dynamically
      const agentId = pickAgent();
      const status = pick(STATUSES);
      return {
        type: 'agent/heartbeat',
        timestamp: now,
        data: {
          agentId,
          status,
          currentTask: status === 'active' ? pick(TASK_POOL).title : undefined,
        },
      };
    } else if (roll < 0.55) {
      // Message — mix of pool and dynamic templates
      if (Math.random() < 0.4) {
        // Dynamic generated message
        const from = pickAgent();
        const template = pick(DYNAMIC_CHAT_TEMPLATES);
        const content = template(from);
        const hasRecipient = Math.random() < 0.3;
        let to: string | undefined;
        if (hasRecipient) {
          to = pickAgent();
          if (to === from) to = undefined;
        }
        const messageType = pick(['chat', 'chat', 'task', 'review'] as const);
        return {
          type: 'agent/message',
          timestamp: now,
          data: { from, to, content, messageType },
        };
      }
      // Pool message
      const msg = LIVE_MESSAGES[this.liveMsgIdx % LIVE_MESSAGES.length];
      this.liveMsgIdx++;
      return {
        type: 'agent/message',
        timestamp: now,
        data: { ...msg },
      };
    } else if (roll < 0.75) {
      // Code change
      const change = LIVE_CODE_CHANGES[this.liveCodeIdx % LIVE_CODE_CHANGES.length];
      this.liveCodeIdx++;
      return {
        type: 'agent/code_change',
        timestamp: now,
        data: { ...change },
      };
    } else {
      // Task update — realistic task lifecycle
      const taskPool = TASK_POOL[this.liveTaskCounter % TASK_POOL.length];
      const taskId = `live-task-${this.liveTaskCounter}`;
      const status = pick(TASK_STATUSES);
      const assignee = pickAgent();
      this.liveTaskCounter++;
      return {
        type: 'agent/task_update',
        timestamp: now,
        data: {
          taskId,
          title: taskPool.title,
          status,
          assigneeId: assignee,
          description: taskPool.description,
        },
      };
    }
  }
}
