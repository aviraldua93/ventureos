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

// ── Template-based event generation (works with any org) ────────

// Generic task templates — no hardcoded agent names
const TASK_TEMPLATES: Array<{ title: string; description: string }> = [
  { title: 'Dashboard component update', description: 'Refactor and polish dashboard components' },
  { title: 'API endpoint optimization', description: 'Optimize response times for API endpoints' },
  { title: 'Test coverage expansion', description: 'Add tests for uncovered code paths' },
  { title: 'WebSocket event streaming', description: 'Real-time event push to dashboard clients' },
  { title: 'Code review & QA', description: 'Review pending PRs and quality checks' },
  { title: 'Documentation update', description: 'Update docs for recent changes' },
  { title: 'Performance profiling', description: 'Profile and optimize hot paths' },
  { title: 'Bug fix sprint', description: 'Fix reported issues and edge cases' },
  { title: 'CI pipeline maintenance', description: 'Update CI config and fix flaky tests' },
  { title: 'Design system refinement', description: 'Refine tokens, components, and patterns' },
  { title: 'Agent pathfinding', description: 'Tile-based pathfinding for agent movement' },
  { title: 'Sprite rendering pass', description: 'Canvas2D agent sprites with animations' },
  { title: 'Keyboard shortcuts', description: 'Implement Cmd+K command palette' },
  { title: 'Mobile responsive layout', description: 'Ensure dashboard works at 768px breakpoint' },
  { title: 'Error telemetry', description: 'Integrate error tracking for monitoring' },
  { title: 'Bundle size optimization', description: 'Tree-shake unused deps and lazy-load routes' },
];

// Dynamic message templates — use only agent ID, no names
const DYNAMIC_CHAT_TEMPLATES = [
  () => `Just pushed a commit to fix the ${pick(['flaky test', 'CSS layout issue', 'type error', 'race condition', 'null pointer'])}.`,
  () => `${pick(['Great standup today!', 'Loved the demo.', 'Really clean PR.', 'Nice refactor!', 'This architecture is 🔥'])}`,
  () => `Working on ${pick(['the dashboard', 'agent sync', 'event replay', 'the API layer', 'documentation', 'the CLI'])} — ETA ${pick(['30 min', '1 hour', 'end of day', 'tomorrow morning'])}.`,
  () => `${pick(['Anyone seen this before?', 'Quick question:', 'FYI:', 'Heads up:', 'Update:'])} ${pick(['the tests are flaky in CI', 'I found a workaround', 'staging is back up', 'the feature flag is live', 'metrics look good'])}`,
  () => `${pick(['Reviewing', 'Looking at', 'Debugging', 'Optimizing', 'Refactoring'])} the ${pick(['WebSocket handler', 'event store', 'projection engine', 'task board', 'org chart', 'virtual office'])}`,
  () => 'PR is up for review — feedback welcome.',
  () => 'Tests green after the refactor. Moving on.',
  () => 'CI pipeline green. Zero warnings.',
  () => 'Deployed latest to staging. Smoke test passing.',
  () => 'Sprint velocity is on track. No blockers.',
];

// Generic code change templates
const CODE_CHANGE_TEMPLATES: Array<{ filePath: string; diff: string; description: string }> = [
  { filePath: 'src/core/event-bus.ts', diff: '+  private cache = new WeakMap();\n-  private cache = new Map();', description: 'Fix memory leak in event bus cache' },
  { filePath: 'src/api/middleware.ts', diff: '+  const token = req.headers.get("Authorization");\n+  if (!token) return unauthorized();', description: 'Add auth middleware validation' },
  { filePath: 'src/core/projections.ts', diff: '+  private memoized = new Map();\n+  invalidate() { this.memoized.clear(); }', description: 'Add memoization to projections' },
  { filePath: 'src/api/routes.ts', diff: '+  app.get("/health", (req, res) => res.json({ ok: true, uptime: process.uptime() }));', description: 'Enhance health endpoint with uptime' },
  { filePath: 'src/core/store.ts', diff: '+  async batchAppend(events: Event[]) {\n+    for (const e of events) await this.append(e);\n+  }', description: 'Add batch event appending' },
  { filePath: 'src/hooks/useTheme.ts', diff: '+  const [theme, setTheme] = useState<Theme>("dark");\n+  useEffect(() => document.body.dataset.theme = theme, [theme]);', description: 'Implement theme switching hook' },
  { filePath: 'src/engine/replay.ts', diff: '+  addBookmark(timestamp: number, label: string) {\n+    this.bookmarks.push({ timestamp, label });\n+  }', description: 'Add bookmark support to replay engine' },
  { filePath: '.github/workflows/ci.yml', diff: '+  - name: E2E Tests\n+    run: bun run test:e2e\n+    env:\n+      CI: true', description: 'Add E2E tests to CI pipeline' },
];

const TASK_STATUSES: Array<'backlog' | 'in_progress' | 'review' | 'done'> = ['backlog', 'in_progress', 'review', 'done'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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
      if (!hasActiveAgents) {
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

      const agentId = pick(activeAgents);
      const currentTask = this.agentTasks.get(agentId);
      return {
        type: 'agent/heartbeat',
        timestamp: now,
        data: {
          agentId,
          status: 'active',
          currentTask: currentTask || pick(TASK_TEMPLATES).title,
        },
      };
    } else if (roll < 0.55) {
      // Messages — generate from templates
      if (hasActiveAgents && Math.random() < 0.7) {
        const from = pick(activeAgents);
        const task = this.agentTasks.get(from);
        const content = task
          ? `Working on: ${task}`
          : pick(DYNAMIC_CHAT_TEMPLATES)();
        return {
          type: 'agent/message',
          timestamp: now,
          data: { from, content, messageType: 'task' as const },
        };
      }

      // Random message from any registered agent
      const allRegistered = Array.from(this.agentStates.keys());
      if (allRegistered.length === 0) return null;
      const anyAgent = hasActiveAgents ? pick(activeAgents) : pick(allRegistered);
      const content = pick(DYNAMIC_CHAT_TEMPLATES)();
      return {
        type: 'agent/message',
        timestamp: now,
        data: { from: anyAgent, content, messageType: 'chat' as const },
      };
    } else if (roll < 0.75) {
      // Code change — only from active agents using templates
      if (!hasActiveAgents) return null;

      const agentId = pick(activeAgents);
      const change = pick(CODE_CHANGE_TEMPLATES);
      return {
        type: 'agent/code_change',
        timestamp: now,
        data: { agentId, ...change },
      };
    } else {
      // Task update
      if (hasActiveAgents) {
        const task = TASK_TEMPLATES[this.sprintTaskIdx % TASK_TEMPLATES.length];
        this.sprintTaskIdx++;
        const taskId = `sprint-task-${this.liveTaskCounter++}`;
        const assignee = pick(activeAgents);
        const status = pick(TASK_STATUSES);
        return {
          type: 'agent/task_update',
          timestamp: now,
          data: {
            taskId,
            title: task.title,
            status,
            assigneeId: assignee,
            description: task.description,
          },
        };
      }

      // No active agents: only generate backlog items
      const taskPool = TASK_TEMPLATES[this.liveTaskCounter % TASK_TEMPLATES.length];
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
