# 🚀 VentureOS

**Mission Control for AI Agent Teams**

> Watch your AI agents think, talk, code, and ship — in real time.

VentureOS is an open-source, real-time dashboard for observing AI agent teams. Connect your agents, and watch them collaborate through a live org chart, message stream, code diff viewer, and task board.

---

## 🚀 Quick Start

Get VentureOS running on your machine in under 2 minutes.

### Prerequisites

- [Bun](https://bun.sh) v1.0+ (our runtime & package manager)
- Node.js v18+ (for Vite dev server)

### Install & Run (3 commands)

```bash
git clone https://github.com/aviraldua93/ventureos.git
cd ventureos
bun install
```

### Start VentureOS

You'll need **two terminal windows**:

```bash
# Terminal 1 — Backend server
cd packages/server
bun run build && bun run dist/index.js
```

```bash
# Terminal 2 — Dashboard
cd packages/dashboard
bun run dev
```

> **💡 Shortcut:** From the project root, `bun run dev` starts both the server and dashboard at once.

### Open Your Browser

👉 **http://localhost:5173**

Click **"Start Demo"** to watch an AI agent team build ArchitectAI in real-time.

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

## Part of aviraldua93 Ventures

| Project | What It Does |
|---------|-------------|
| [ArchitectAI](https://github.com/aviraldua93/architect-ai) | Learn agentic AI theory |
| **VentureOS** (this repo) | Build agentic AI infrastructure |

## License

MIT
