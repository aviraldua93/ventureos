# 🚀 VentureOS

**Mission Control for AI Agent Teams**

> Watch your AI agents think, talk, code, and ship — in real time.

[screenshot placeholder — coming Sprint 3]

## What is VentureOS?

VentureOS is an open-source, real-time dashboard for observing AI agent teams. Connect your agents, and watch them collaborate through a live org chart, message stream, code diff viewer, and task board.

## Quick Start

```bash
git clone https://github.com/aviraldua93/ventureos.git
cd ventureos
bun install
bun run dev
```

Open http://localhost:5173 — the dashboard launches with a built-in demo.

## Features (Sprint 2+)

- 🏢 **Agent Org Chart** — Visual team hierarchy with live status
- 💬 **Message Stream** — Real-time inter-agent communication
- 📝 **Code Diff View** — Watch code being written, Monaco-powered
- 📋 **Task Board** — Auto-updating kanban board
- 🔍 **Agent Detail** — Deep-dive into any agent's reasoning
- 🎬 **Demo Mode** — Watch a simulated team build software

## Architecture

Event-sourced MCP server → WebSocket → React dashboard. See [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Part of aviraldua93 Ventures

| Project | What It Does |
|---------|-------------|
| [ArchitectAI](https://github.com/aviraldua93/architect-ai) | Learn agentic AI theory |
| **VentureOS** (this repo) | Build agentic AI infrastructure |

## License

MIT
