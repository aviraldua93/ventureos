#!/usr/bin/env bun
// emit-event.ts — CLI tool for pushing individual events to VentureOS
//
// Usage:
//   bun run scripts/emit-event.ts agent/register --agent-id "new-hire" --name "Alex Kim" --role "UX Designer"
//   bun run scripts/emit-event.ts agent/heartbeat --agent-id "jordan-park" --status "active" --task "Sprint 3 planning"
//   bun run scripts/emit-event.ts agent/message --agent-id "jordan-park" --content "Sprint 3 kickoff!" [--to "sana-okafor"] [--msg-type chat]
//   bun run scripts/emit-event.ts agent/task_update --task-id "sprint-3" --title "Sprint 3" --status "in_progress" [--assignee "jordan-park"] [--desc "..."]
//   bun run scripts/emit-event.ts agent/code_change --agent-id "kai" --file "src/index.ts" --diff "+added line" --desc "Fixed bug"

const API = 'http://localhost:3000';

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

function usage() {
  console.log(`
emit-event.ts — Push events to VentureOS server

Usage:
  bun run scripts/emit-event.ts <event-type> [options]

Event types & options:

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
  bun run scripts/emit-event.ts agent/register --agent-id "alex-kim" --name "Alex Kim" --role "UX Designer"
  bun run scripts/emit-event.ts agent/message --agent-id "jordan-park" --content "Sprint 3 kickoff!"
  bun run scripts/emit-event.ts agent/heartbeat --agent-id "sana-okafor" --status "active" --task "Deploying v2"
`);
}

const [eventType, ...rest] = process.argv.slice(2);

if (!eventType || eventType === '--help' || eventType === '-h') {
  usage();
  process.exit(0);
}

const opts = parseArgs(rest);
let event: Record<string, unknown>;

switch (eventType) {
  case 'agent/register': {
    if (!opts['agent-id'] || !opts.name || !opts.role) {
      console.error('❌ agent/register requires --agent-id, --name, --role');
      process.exit(1);
    }
    event = {
      type: 'agent/register',
      timestamp: Date.now(),
      data: {
        agentId: opts['agent-id'],
        name: opts.name,
        role: opts.role,
        ...(opts.parent && { parentId: opts.parent }),
        ...(opts.caps && { capabilities: opts.caps.split(',') }),
      },
    };
    break;
  }

  case 'agent/heartbeat': {
    if (!opts['agent-id'] || !opts.status) {
      console.error('❌ agent/heartbeat requires --agent-id, --status');
      process.exit(1);
    }
    event = {
      type: 'agent/heartbeat',
      timestamp: Date.now(),
      data: {
        agentId: opts['agent-id'],
        status: opts.status,
        ...(opts.task && { currentTask: opts.task }),
      },
    };
    break;
  }

  case 'agent/message': {
    if (!opts['agent-id'] || !opts.content) {
      console.error('❌ agent/message requires --agent-id, --content');
      process.exit(1);
    }
    event = {
      type: 'agent/message',
      timestamp: Date.now(),
      data: {
        from: opts['agent-id'],
        content: opts.content,
        messageType: opts['msg-type'] || 'chat',
        ...(opts.to && { to: opts.to }),
      },
    };
    break;
  }

  case 'agent/task_update': {
    if (!opts['task-id'] || !opts.title || !opts.status) {
      console.error('❌ agent/task_update requires --task-id, --title, --status');
      process.exit(1);
    }
    event = {
      type: 'agent/task_update',
      timestamp: Date.now(),
      data: {
        taskId: opts['task-id'],
        title: opts.title,
        status: opts.status,
        ...(opts.assignee && { assigneeId: opts.assignee }),
        ...(opts.desc && { description: opts.desc }),
      },
    };
    break;
  }

  case 'agent/code_change': {
    if (!opts['agent-id'] || !opts.file || !opts.diff || !opts.desc) {
      console.error('❌ agent/code_change requires --agent-id, --file, --diff, --desc');
      process.exit(1);
    }
    event = {
      type: 'agent/code_change',
      timestamp: Date.now(),
      data: {
        agentId: opts['agent-id'],
        filePath: opts.file,
        diff: opts.diff,
        description: opts.desc,
      },
    };
    break;
  }

  default:
    console.error(`❌ Unknown event type: ${eventType}`);
    usage();
    process.exit(1);
}

// Push it
const res = await fetch(`${API}/api/events`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(event),
});

if (!res.ok) {
  console.error(`❌ Server returned ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const result = await res.json() as { ok: boolean; count: number };
console.log(`✅ Event pushed: ${eventType} (store count: ${result.count})`);
