# 🚀 VentureOS

**Mission Control for AI Agent Teams**

> Watch your AI agents think, talk, code, and ship — in real time.

VentureOS is an open-source, real-time dashboard for observing AI agent teams. Connect your agents, and watch them collaborate through a live org chart, message stream, code diff viewer, and task board.

> **📦 Current status:** VentureOS ships with a built-in demo scenario — 98 events simulating a team of 5 AI agents building [ArchitectAI](https://github.com/aviraldua93/architect-ai). It's the fastest way to see what the platform does. In the future, real agents will connect via the MCP server and WebSocket. The API is already live — you can POST your own events to `/api/events` right now.

---

## 🚀 Quick Start

Get VentureOS running on your machine in under 2 minutes.

### Prerequisites

- [Bun](https://bun.sh) v1.0+ (our runtime & package manager)
- Node.js v18+ (for Vite dev server)

### Install & Run

```bash
git clone https://github.com/aviraldua93/ventureos.git
cd ventureos
bun install
bun run dev
```

That's it. `bun run dev` starts both the backend server and the dashboard in one terminal (with hot reload).

> **Backend:** You should see `VentureOS v0.1.0 running on http://localhost:3000`
> **Dashboard:** You should see `VITE v6.x.x  ready in Xms` → `Local: http://localhost:5173`

### Open Your Browser

👉 **http://localhost:5173**

Click **"Start Demo"** to launch the demo. This replays a pre-recorded scenario of 5 AI agents building ArchitectAI — you'll see them appear on the org chart, chat in the message stream, pick up tasks, and ship code changes. It runs ~98 events over about 30 seconds at default speed.

<details>
<summary><strong>🔧 Manual Setup (two terminals)</strong></summary>

If you prefer running the server and dashboard separately (useful for debugging or tailing logs independently):

```bash
# Terminal 1 — Backend server (with hot reload)
cd packages/server
bun run dev
```

> You should see: `VentureOS v0.1.0 running on http://localhost:3000`

```bash
# Terminal 2 — Dashboard
cd packages/dashboard
bun run dev
```

> You should see: `VITE v6.x.x  ready in Xms` → `Local: http://localhost:5173`

</details>

---

## 👀 What You'll See

VentureOS gives you a live war-room view of AI agents working together. Hit "Start Demo" and you'll watch a simulated team of AI agents design, plan, and code a real product — all unfolding in front of you:

- 🏢 **Org Chart** — A visual hierarchy of agents that pulses with activity. See who's thinking, who's coding, and who's reviewing — right now.
- 💬 **Message Stream** — Eavesdrop on agents talking to each other in real-time. Watch a CTO delegate to engineers, designers push back, and consensus emerge.
- 📋 **Task Board** — An auto-updating kanban board. Tasks move from "To Do" → "In Progress" → "Done" as agents complete their work.
- 📝 **Code Diffs** — Watch code being written line-by-line in a Monaco-powered diff viewer. It's like pair-programming with a machine.
- 🔍 **Agent Detail** — Click on any agent to deep-dive into their reasoning, current task, and conversation history.
- ⏯️ **Playback Controls** — Pause, resume, speed up, or restart the demo. Watch the whole thing at 10x speed, or slow it down to study the decision-making.

---

## 🔌 API Reference

VentureOS exposes a simple REST + WebSocket API. The backend runs on **port 3000**.

### Health & State

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns server status |
| `GET` | `/api/state` | Current projection snapshot (all agents, tasks, messages) |

### Demo Controls

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/demo/start` | `{"speed": N}` *(optional)* | Start the demo simulation |
| `POST` | `/api/demo/restart` | — | Restart from the beginning |
| `POST` | `/api/demo/pause` | — | Pause the simulation |
| `POST` | `/api/demo/resume` | — | Resume a paused simulation |
| `POST` | `/api/demo/speed` | `{"speed": N}` | Change playback speed (1 = normal, 10 = fast) |
| `GET` | `/api/demo/status` | — | Current demo engine status |

### WebSocket

```
ws://localhost:3000/ws
```

Connect to receive real-time events as they happen — agent messages, task updates, code changes, and more. The dashboard uses this under the hood.

---

## ⚙️ Configuration

VentureOS reads its org structure from **`ventureos.config.json`** at the repo root. This is how you define your company, teams, and agents — no code changes needed.

### Quick Setup

```bash
# Copy the example config
cp ventureos.config.example.json ventureos.config.json

# Edit with your org structure
# Then restart the servers
```

### Config Schema

```jsonc
{
  "company": {
    "name": "Acme Corp",                    // Your company name
    "tagline": "Building the Future",        // Shown in header
    "branding": {
      "primaryColor": "#2563eb",             // Primary brand color
      "secondaryColor": "#7c3aed",           // Secondary color
      "accentColor": "#16a34a"               // Accent color
    }
  },
  "teams": [
    {
      "name": "engineering",                 // Team slug (used as ID)
      "displayName": "Engineering",          // Human-readable name
      "color": "#3b82f6",                    // Team color
      "icon": "code",                        // Icon identifier
      "roomType": "open_office"              // Office room type
    }
  ],
  "agents": [
    {
      "id": "alice",                         // Unique agent ID
      "name": "Alice Zhang",                // Display name
      "role": "CEO",                         // Role title
      "team": "leadership",                  // Team slug
      "parentId": null,                      // Reports to (agent ID)
      "capabilities": ["strategy"],          // Skills/capabilities
      "isLead": true                         // Team lead flag
    }
  ],
  "rooms": []                                // Auto-generated from teams if empty
}
```

### Room Types

| Type | Use Case |
|------|----------|
| `corner_office` | Leadership / small teams |
| `open_office` | Engineering / large teams |
| `meeting_room` | Meetings / collaboration |
| `server_room` | AI / infrastructure teams |
| `break_room` | Break room (auto-created) |
| `lobby` | Lobby (auto-created) |

Rooms are auto-generated proportional to team size when the `rooms` array is empty.

### Pushing Live Data

After configuring, push your team to the running server:

```bash
bun run scripts/push-live-team.ts
```

### Orchestration Bridge

Deploy and manage teams from the CLI:

```bash
bun run scripts/orchestration-bridge.ts deploy-team engineering --task "Sprint work"
bun run scripts/orchestration-bridge.ts deploy-agent alice --task "API redesign"
bun run scripts/orchestration-bridge.ts complete-team engineering
```

---

## 🏗️ Architecture

Event-sourced MCP server → WebSocket → React dashboard.

```
packages/
├── server/       # Bun backend — event store, projections, WebSocket broadcaster
├── dashboard/    # React + Vite frontend — the live dashboard UI
└── shared/       # Shared TypeScript types & contracts
```

---

## 🧰 Development

```bash
# Run both server & dashboard in dev mode (hot reload)
bun run dev

# Type-check everything
bun run type-check

# Run tests
bun run test

# Production build
bun run build
```

---

## ❓ Troubleshooting

**Port already in use (3000 or 5173)**

```bash
# PowerShell (Windows)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force

# Mac / Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**`bun install` fails**

esbuild's postinstall script can break on Windows. Try:

```bash
bun install --ignore-scripts
bun install
```

**Dashboard shows a blank page**

The dashboard proxies API calls to port 3000. Make sure the backend is running first — if it's not, the frontend has nothing to render.

**Demo not starting**

Test the API directly to rule out frontend issues:

```bash
curl -X POST http://localhost:3000/api/demo/start
```

**Type errors during build**

Run the full type-check to see specific errors:

```bash
bun run type-check
```

---

## Part of aviraldua93 Ventures

| Project | What It Does |
|---------|-------------|
| [ArchitectAI](https://github.com/aviraldua93/architect-ai) | Learn agentic AI theory |
| **VentureOS** (this repo) | Build agentic AI infrastructure |

## License

MIT
