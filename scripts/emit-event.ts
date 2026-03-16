#!/usr/bin/env bun
// emit-event.ts — CLI tool for pushing events to VentureOS
//
// Supports both raw event types AND high-level orchestration shortcuts:
//
// Raw events:
//   bun run scripts/emit-event.ts agent/register --agent-id "new-hire" --name "Alex Kim" --role "UX Designer"
//   bun run scripts/emit-event.ts agent/heartbeat --agent-id "jordan-park" --status "active" --task "Sprint 3 planning"
//   bun run scripts/emit-event.ts agent/message --agent-id "jordan-park" --content "Sprint 3 kickoff!"
//   bun run scripts/emit-event.ts agent/task_update --task-id "sprint-3" --title "Sprint 3" --status "in_progress"
//   bun run scripts/emit-event.ts agent/code_change --agent-id "kai" --file "src/index.ts" --diff "+added" --desc "Fixed bug"
//
// Orchestration shortcuts (push multiple coordinated events at once):
//   bun run scripts/emit-event.ts deploy --agent-id "riley-nakamura" --task "Playwright demo recording"
//   bun run scripts/emit-event.ts complete --agent-id "riley-nakamura" --task "Playwright demo recording"
//   bun run scripts/emit-event.ts status --agent-id "riley-nakamura" --status "active" --task "Recording tests"
//   bun run scripts/emit-event.ts say --agent-id "riley-nakamura" --content "Starting Playwright demo"

const API = process.env.VENTUREOS_API || 'http://localhost:3000';

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
      result[key] = value;
    }
  }
  return result;
}

async function pushEvent(event: Record<string, unknown>): Promise<number> {
  const res = await fetch(`${API}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned ${res.status}: ${text}`);
  }
  const result = await res.json() as { ok: boolean; count: number };
  return result.count;
}

function usage() {
  console.log(`
emit-event.ts — Push events to VentureOS server

Usage:
  bun run scripts/emit-event.ts <command> [options]

━━━ Orchestration Shortcuts ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  deploy
    --agent-id <id>    Agent to deploy (required)
    --task <desc>      Task description (required)
    --task-id <id>     Task ID (auto-generated if omitted)
    Pushes: heartbeat(active) + task_update(in_progress) + message

  complete
    --agent-id <id>    Agent that completed (required)
    --task <desc>      Task description (required)
    --task-id <id>     Task ID (auto-generated if omitted)
    Pushes: task_update(done) + message + heartbeat(idle)

  status
    --agent-id <id>    Agent identifier (required)
    --status <s>       active | idle | error | offline (required)
    --task <desc>      Current task description
    Pushes: heartbeat + message (if task provided)

  say
    --agent-id <id>    Sender agent ID (required)
    --content <msg>    Message content (required)
    --to <id>          Recipient agent ID
    --msg-type <t>     chat | task | review | blocker (default: chat)
    Pushes: message event

━━━ Raw Event Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  agent/register
    --agent-id <id>    Agent identifier (required)
    --name <name>      Display name (required)
    --role <role>      Role description (required)
    --parent <id>      Parent agent ID
    --caps <a,b,c>     Comma-separated capabilities

  agent/heartbeat
    --agent-id <id>    Agent identifier (required)
    --status <s>       active | idle | error | offline (required)
    --task <desc>      Current task description

  agent/message
    --agent-id <id>    Sender agent ID (required, mapped to 'from')
    --content <msg>    Message content (required)
    --to <id>          Recipient agent ID
    --msg-type <t>     chat | task | review | blocker (default: chat)

  agent/task_update
    --task-id <id>     Task identifier (required)
    --title <title>    Task title (required)
    --status <s>       backlog | in_progress | review | done (required)
    --assignee <id>    Assignee agent ID
    --desc <text>      Task description

  agent/code_change
    --agent-id <id>    Agent identifier (required)
    --file <path>      File path (required)
    --diff <diff>      Diff content (required)
    --desc <text>      Description (required)

Examples:
  # Deploy Riley's team to record Playwright demos
  bun run scripts/emit-event.ts deploy --agent-id "riley-nakamura" --task "Playwright demo recording"

  # Riley says something in the office
  bun run scripts/emit-event.ts say --agent-id "riley-nakamura" --content "Starting E2E test suite"

  # Mark Riley's task complete
  bun run scripts/emit-event.ts complete --agent-id "riley-nakamura" --task "Playwright demo recording"

  # Raw events still work
  bun run scripts/emit-event.ts agent/register --agent-id "alex-kim" --name "Alex Kim" --role "UX Designer"
  bun run scripts/emit-event.ts agent/heartbeat --agent-id "sana-okafor" --status "active" --task "Deploying v2"
`);
}

const [eventType, ...rest] = process.argv.slice(2);

if (!eventType || eventType === '--help' || eventType === '-h') {
  usage();
  process.exit(0);
}

const opts = parseArgs(rest);

// ── Orchestration Shortcuts ─────────────────────────────────────

async function handleDeploy() {
  if (!opts['agent-id'] || !opts.task) {
    console.error('❌ deploy requires --agent-id, --task');
    process.exit(1);
  }
  const agentId = opts['agent-id'];
  const task = opts.task;
  const taskId = opts['task-id'] || `task-${agentId}-${Date.now()}`;
  let count = 0;

  // 1. Set agent status to active
  count = await pushEvent({
    type: 'agent/heartbeat',
    timestamp: Date.now(),
    data: { agentId, status: 'active', currentTask: task },
  });
  console.log(`  ✅ ${agentId} → active`);

  // 2. Create/update the task as in_progress
  count = await pushEvent({
    type: 'agent/task_update',
    timestamp: Date.now(),
    data: { taskId, title: task, status: 'in_progress', assigneeId: agentId, description: task },
  });
  console.log(`  ✅ Task "${task}" → in_progress`);

  // 3. Announce deployment via message
  count = await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: { from: agentId, content: `🚀 Starting: ${task}`, messageType: 'task' },
  });
  console.log(`  ✅ Message sent`);

  console.log(`\n🚀 Deployed ${agentId} on "${task}" (store: ${count} events)`);
}

async function handleComplete() {
  if (!opts['agent-id'] || !opts.task) {
    console.error('❌ complete requires --agent-id, --task');
    process.exit(1);
  }
  const agentId = opts['agent-id'];
  const task = opts.task;
  const taskId = opts['task-id'] || `task-${agentId}-${Date.now()}`;
  let count = 0;

  // 1. Mark task done
  count = await pushEvent({
    type: 'agent/task_update',
    timestamp: Date.now(),
    data: { taskId, title: task, status: 'done', assigneeId: agentId, description: task },
  });
  console.log(`  ✅ Task "${task}" → done`);

  // 2. Announce completion
  count = await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: { from: agentId, content: `✅ Completed: ${task}`, messageType: 'task' },
  });
  console.log(`  ✅ Completion message sent`);

  // 3. Set agent back to idle
  count = await pushEvent({
    type: 'agent/heartbeat',
    timestamp: Date.now(),
    data: { agentId, status: 'idle' },
  });
  console.log(`  ✅ ${agentId} → idle`);

  console.log(`\n🎉 ${agentId} completed "${task}" (store: ${count} events)`);
}

async function handleStatus() {
  if (!opts['agent-id'] || !opts.status) {
    console.error('❌ status requires --agent-id, --status');
    process.exit(1);
  }
  const agentId = opts['agent-id'];
  let count = 0;

  count = await pushEvent({
    type: 'agent/heartbeat',
    timestamp: Date.now(),
    data: {
      agentId,
      status: opts.status,
      ...(opts.task && { currentTask: opts.task }),
    },
  });
  console.log(`  ✅ ${agentId} → ${opts.status}`);

  if (opts.task) {
    count = await pushEvent({
      type: 'agent/message',
      timestamp: Date.now(),
      data: { from: agentId, content: opts.task, messageType: 'task' },
    });
    console.log(`  ✅ Task message sent`);
  }

  console.log(`\n📡 ${agentId} status: ${opts.status} (store: ${count} events)`);
}

async function handleSay() {
  if (!opts['agent-id'] || !opts.content) {
    console.error('❌ say requires --agent-id, --content');
    process.exit(1);
  }

  const count = await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: {
      from: opts['agent-id'],
      content: opts.content,
      messageType: (opts['msg-type'] || 'chat') as string,
      ...(opts.to && { to: opts.to }),
    },
  });
  console.log(`💬 ${opts['agent-id']}: "${opts.content}" (store: ${count} events)`);
}

// ── Route to handler ────────────────────────────────────────────

try {
  switch (eventType) {
    // Orchestration shortcuts
    case 'deploy':
      await handleDeploy();
      break;
    case 'complete':
      await handleComplete();
      break;
    case 'status':
      await handleStatus();
      break;
    case 'say':
      await handleSay();
      break;

    // Raw event types (backward compatible)
    case 'agent/register': {
      if (!opts['agent-id'] || !opts.name || !opts.role) {
        console.error('❌ agent/register requires --agent-id, --name, --role');
        process.exit(1);
      }
      const count = await pushEvent({
        type: 'agent/register',
        timestamp: Date.now(),
        data: {
          agentId: opts['agent-id'],
          name: opts.name,
          role: opts.role,
          ...(opts.parent && { parentId: opts.parent }),
          ...(opts.caps && { capabilities: opts.caps.split(',') }),
        },
      });
      console.log(`✅ Event pushed: agent/register (store count: ${count})`);
      break;
    }

    case 'agent/heartbeat': {
      if (!opts['agent-id'] || !opts.status) {
        console.error('❌ agent/heartbeat requires --agent-id, --status');
        process.exit(1);
      }
      const count = await pushEvent({
        type: 'agent/heartbeat',
        timestamp: Date.now(),
        data: {
          agentId: opts['agent-id'],
          status: opts.status,
          ...(opts.task && { currentTask: opts.task }),
        },
      });
      console.log(`✅ Event pushed: agent/heartbeat (store count: ${count})`);
      break;
    }

    case 'agent/message': {
      if (!opts['agent-id'] || !opts.content) {
        console.error('❌ agent/message requires --agent-id, --content');
        process.exit(1);
      }
      const count = await pushEvent({
        type: 'agent/message',
        timestamp: Date.now(),
        data: {
          from: opts['agent-id'],
          content: opts.content,
          messageType: opts['msg-type'] || 'chat',
          ...(opts.to && { to: opts.to }),
        },
      });
      console.log(`✅ Event pushed: agent/message (store count: ${count})`);
      break;
    }

    case 'agent/task_update': {
      if (!opts['task-id'] || !opts.title || !opts.status) {
        console.error('❌ agent/task_update requires --task-id, --title, --status');
        process.exit(1);
      }
      const count = await pushEvent({
        type: 'agent/task_update',
        timestamp: Date.now(),
        data: {
          taskId: opts['task-id'],
          title: opts.title,
          status: opts.status,
          ...(opts.assignee && { assigneeId: opts.assignee }),
          ...(opts.desc && { description: opts.desc }),
        },
      });
      console.log(`✅ Event pushed: agent/task_update (store count: ${count})`);
      break;
    }

    case 'agent/code_change': {
      if (!opts['agent-id'] || !opts.file || !opts.diff || !opts.desc) {
        console.error('❌ agent/code_change requires --agent-id, --file, --diff, --desc');
        process.exit(1);
      }
      const count = await pushEvent({
        type: 'agent/code_change',
        timestamp: Date.now(),
        data: {
          agentId: opts['agent-id'],
          filePath: opts.file,
          diff: opts.diff,
          description: opts.desc,
        },
      });
      console.log(`✅ Event pushed: agent/code_change (store count: ${count})`);
      break;
    }

    default:
      console.error(`❌ Unknown command: ${eventType}`);
      usage();
      process.exit(1);
  }
} catch (err) {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
