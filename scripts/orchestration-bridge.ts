#!/usr/bin/env bun
// orchestration-bridge.ts — Bridge between Max's agent orchestration and the Virtual Office
//
// When Max deploys agents (e.g., Riley's Playwright team), this script pushes
// coordinated events so the VO dashboard reflects REAL activity — agents light up,
// move to their rooms, show active status, and display what they're working on.
//
// Usage:
//   bun run scripts/orchestration-bridge.ts deploy-agent <agent-id> --task "description"
//   bun run scripts/orchestration-bridge.ts complete-agent <agent-id> --task "description"
//   bun run scripts/orchestration-bridge.ts deploy-team <team-name> --task "description"
//   bun run scripts/orchestration-bridge.ts complete-team <team-name>
//   bun run scripts/orchestration-bridge.ts announce <agent-id> --content "message" [--to <agent-id>]
//
// Teams:
//   playwright  — Riley Nakamura + Sam Okonkwo, Casey Lin, Alex Petrov
//   engineering — Sana Okafor + Mia Torres, Ravi Patel, Zoe Chen, Kai Nakamura, Marcus Webb
//   qa          — Lex Morales + Priya Desai, Sam Torres
//   ai          — Noor Abbasi + Eli Vance
//   community   — Ava Chen + Jules Rivera, Ren Kowalski, Maya Patel
//   product     — Dana Whitfield + Marc Delacroix, Leo Tanaka, Iris Oduya
//   leadership  — Jordan Park, Sana Okafor, Lex Morales, Noor Abbasi, Ava Chen, Dana Whitfield

const API = process.env.VENTUREOS_API || 'http://localhost:3000';

// ── Team Definitions ────────────────────────────────────────────

interface TeamMember {
  agentId: string;
  name: string;
  defaultTask?: string;
}

const TEAMS: Record<string, { lead: string; members: TeamMember[] }> = {
  playwright: {
    lead: 'riley-nakamura',
    members: [
      { agentId: 'riley-nakamura', name: 'Riley Nakamura', defaultTask: 'Leading Playwright test expansion' },
      { agentId: 'sam-okonkwo', name: 'Sam Okonkwo', defaultTask: 'E2E test automation' },
      { agentId: 'casey-lin', name: 'Casey Lin', defaultTask: 'E2E test automation' },
      { agentId: 'alex-petrov', name: 'Alex Petrov', defaultTask: 'Browser infra setup' },
    ],
  },
  engineering: {
    lead: 'sana-okafor',
    members: [
      { agentId: 'sana-okafor', name: 'Sana Okafor', defaultTask: 'Engineering oversight' },
      { agentId: 'mia-torres', name: 'Mia Torres', defaultTask: 'Frontend development' },
      { agentId: 'ravi-patel', name: 'Ravi Patel', defaultTask: 'Frontend development' },
      { agentId: 'zoe-chen', name: 'Zoe Chen', defaultTask: 'Frontend development' },
      { agentId: 'kai-nakamura', name: 'Kai Nakamura', defaultTask: 'Backend development' },
      { agentId: 'marcus-webb', name: 'Marcus Webb', defaultTask: 'DevOps & CI/CD' },
    ],
  },
  qa: {
    lead: 'lex-morales',
    members: [
      { agentId: 'lex-morales', name: 'Lex Morales', defaultTask: 'QA oversight' },
      { agentId: 'priya-desai', name: 'Priya Desai', defaultTask: 'Functional testing' },
      { agentId: 'sam-torres', name: 'Sam Torres', defaultTask: 'Integration testing' },
    ],
  },
  ai: {
    lead: 'noor-abbasi',
    members: [
      { agentId: 'noor-abbasi', name: 'Noor Abbasi', defaultTask: 'AI/LLM architecture' },
      { agentId: 'eli-vance', name: 'Eli Vance', defaultTask: 'Agentic systems' },
    ],
  },
  community: {
    lead: 'ava-chen',
    members: [
      { agentId: 'ava-chen', name: 'Ava Chen', defaultTask: 'Community management' },
      { agentId: 'jules-rivera', name: 'Jules Rivera', defaultTask: 'Technical writing' },
      { agentId: 'ren-kowalski', name: 'Ren Kowalski', defaultTask: 'Developer relations' },
      { agentId: 'maya-patel', name: 'Maya Patel', defaultTask: 'Content engineering' },
    ],
  },
  product: {
    lead: 'dana-whitfield',
    members: [
      { agentId: 'dana-whitfield', name: 'Dana Whitfield', defaultTask: 'Product delivery' },
      { agentId: 'marc-delacroix', name: 'Marc Delacroix', defaultTask: 'Sprint planning' },
      { agentId: 'leo-tanaka', name: 'Leo Tanaka', defaultTask: 'Program management' },
      { agentId: 'iris-oduya', name: 'Iris Oduya', defaultTask: 'Technical PM' },
    ],
  },
  leadership: {
    lead: 'jordan-park',
    members: [
      { agentId: 'jordan-park', name: 'Jordan Park', defaultTask: 'Company leadership' },
      { agentId: 'sana-okafor', name: 'Sana Okafor', defaultTask: 'Engineering VP' },
      { agentId: 'lex-morales', name: 'Lex Morales', defaultTask: 'Quality VP' },
      { agentId: 'noor-abbasi', name: 'Noor Abbasi', defaultTask: 'AI VP' },
      { agentId: 'ava-chen', name: 'Ava Chen', defaultTask: 'Community VP' },
      { agentId: 'dana-whitfield', name: 'Dana Whitfield', defaultTask: 'Product VP' },
    ],
  },
};

// ── API Helpers ──────────────────────────────────────────────────

async function pushEvent(event: Record<string, unknown>): Promise<number> {
  const res = await fetch(`${API}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    throw new Error(`POST /api/events → ${res.status}: ${await res.text()}`);
  }
  const result = await res.json() as { ok: boolean; count: number };
  return result.count;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Deploy Agent ────────────────────────────────────────────────

async function deployAgent(agentId: string, task: string): Promise<void> {
  const taskId = `task-${agentId}-${Date.now()}`;

  // 1. Status → active with task
  await pushEvent({
    type: 'agent/heartbeat',
    timestamp: Date.now(),
    data: { agentId, status: 'active', currentTask: task },
  });

  // 2. Task → in_progress
  await pushEvent({
    type: 'agent/task_update',
    timestamp: Date.now(),
    data: { taskId, title: task, status: 'in_progress', assigneeId: agentId, description: task },
  });

  // 3. Announce to office
  await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: { from: agentId, content: `🚀 Starting: ${task}`, messageType: 'task' },
  });
}

// ── Complete Agent ──────────────────────────────────────────────

async function completeAgent(agentId: string, task: string): Promise<void> {
  const taskId = `task-${agentId}-${Date.now()}`;

  // 1. Task → done
  await pushEvent({
    type: 'agent/task_update',
    timestamp: Date.now(),
    data: { taskId, title: task, status: 'done', assigneeId: agentId, description: task },
  });

  // 2. Announce completion
  await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: { from: agentId, content: `✅ Completed: ${task}`, messageType: 'task' },
  });

  // 3. Status → idle
  await pushEvent({
    type: 'agent/heartbeat',
    timestamp: Date.now(),
    data: { agentId, status: 'idle' },
  });
}

// ── Deploy Team ─────────────────────────────────────────────────

async function deployTeam(teamName: string, task: string): Promise<void> {
  const team = TEAMS[teamName];
  if (!team) {
    console.error(`❌ Unknown team: ${teamName}`);
    console.error(`   Available teams: ${Object.keys(TEAMS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n🏢 Deploying team: ${teamName} (${team.members.length} agents)`);
  console.log(`📋 Task: ${task}\n`);

  // Lead announces the mission first
  const lead = team.members.find(m => m.agentId === team.lead)!;
  await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: {
      from: lead.agentId,
      content: `📢 Team ${teamName} deploying: ${task}`,
      messageType: 'task',
    },
  });
  console.log(`  📢 ${lead.name} announced team deployment`);
  await sleep(200);

  // Deploy each member with staggered timing for visual effect
  for (const member of team.members) {
    const memberTask = task || member.defaultTask || 'Working';
    await deployAgent(member.agentId, memberTask);
    console.log(`  🚀 ${member.name} → active: "${memberTask}"`);
    await sleep(300); // Stagger for visual effect in VO
  }

  console.log(`\n✅ Team ${teamName} fully deployed (${team.members.length} agents active)`);
}

// ── Complete Team ───────────────────────────────────────────────

async function completeTeam(teamName: string): Promise<void> {
  const team = TEAMS[teamName];
  if (!team) {
    console.error(`❌ Unknown team: ${teamName}`);
    process.exit(1);
  }

  console.log(`\n🎉 Completing team: ${teamName}`);

  for (const member of team.members) {
    const task = member.defaultTask || 'Task completed';
    await completeAgent(member.agentId, task);
    console.log(`  ✅ ${member.name} → idle`);
    await sleep(200);
  }

  // Lead wraps up
  const lead = team.members.find(m => m.agentId === team.lead)!;
  await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: {
      from: lead.agentId,
      content: `🎉 Team ${teamName} work complete. All agents standing down.`,
      messageType: 'task',
    },
  });

  console.log(`\n🎉 Team ${teamName} fully stood down`);
}

// ── Announce ────────────────────────────────────────────────────

async function announce(agentId: string, content: string, to?: string): Promise<void> {
  await pushEvent({
    type: 'agent/message',
    timestamp: Date.now(),
    data: {
      from: agentId,
      content,
      messageType: 'chat',
      ...(to && { to }),
    },
  });
  console.log(`💬 ${agentId}: "${content}"${to ? ` → ${to}` : ''}`);
}

// ── CLI ─────────────────────────────────────────────────────────

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
orchestration-bridge.ts — Bridge agent orchestration to VentureOS Virtual Office

When Max deploys agents, this pushes coordinated events so the VO dashboard
reflects REAL activity — agents light up, move to rooms, show active status.

Usage:
  bun run scripts/orchestration-bridge.ts <command> <target> [options]

Commands:

  deploy-agent <agent-id>
    --task <desc>      What the agent is working on (required)
    Activates agent, creates task, announces to office.

  complete-agent <agent-id>
    --task <desc>      What was completed (required)
    Marks task done, announces completion, sets agent idle.

  deploy-team <team-name>
    --task <desc>      Team mission (required)
    Deploys all team members with staggered activation.

  complete-team <team-name>
    Completes all team members and stands down the team.

  announce <agent-id>
    --content <msg>    Message to say (required)
    --to <agent-id>    Direct message recipient

Teams:
  playwright   — Riley + Sam Okonkwo, Casey Lin, Alex Petrov
  engineering  — Sana + Mia, Ravi, Zoe, Kai, Marcus
  qa           — Lex + Priya Desai, Sam Torres
  ai           — Noor + Eli
  community    — Ava + Jules, Ren, Maya
  product      — Dana + Marc, Leo, Iris
  leadership   — Jordan, Sana, Lex, Noor, Ava, Dana

Examples:
  # Deploy Riley's Playwright team to record demos
  bun run scripts/orchestration-bridge.ts deploy-team playwright --task "Playwright demo recording"

  # Deploy a single agent
  bun run scripts/orchestration-bridge.ts deploy-agent riley-nakamura --task "Recording E2E test suite"

  # Agent says something
  bun run scripts/orchestration-bridge.ts announce riley-nakamura --content "Tests passing, recording demo"

  # Complete the team's work
  bun run scripts/orchestration-bridge.ts complete-team playwright
`);
}

const [command, target, ...rest] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  usage();
  process.exit(0);
}

const opts = parseArgs(rest);

try {
  switch (command) {
    case 'deploy-agent': {
      if (!target || !opts.task) {
        console.error('❌ deploy-agent requires <agent-id> --task "description"');
        process.exit(1);
      }
      await deployAgent(target, opts.task);
      console.log(`🚀 ${target} deployed on "${opts.task}"`);
      break;
    }

    case 'complete-agent': {
      if (!target || !opts.task) {
        console.error('❌ complete-agent requires <agent-id> --task "description"');
        process.exit(1);
      }
      await completeAgent(target, opts.task);
      console.log(`🎉 ${target} completed "${opts.task}"`);
      break;
    }

    case 'deploy-team': {
      if (!target || !opts.task) {
        console.error('❌ deploy-team requires <team-name> --task "description"');
        process.exit(1);
      }
      await deployTeam(target, opts.task);
      break;
    }

    case 'complete-team': {
      if (!target) {
        console.error('❌ complete-team requires <team-name>');
        process.exit(1);
      }
      await completeTeam(target);
      break;
    }

    case 'announce': {
      if (!target || !opts.content) {
        console.error('❌ announce requires <agent-id> --content "message"');
        process.exit(1);
      }
      await announce(target, opts.content, opts.to);
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
} catch (err) {
  console.error(`❌ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
