# VentureOS — Claude Code Project

Mission Control for AI Agent Teams. Real-time dashboard to watch AI agents think, talk, code, and ship.

## Quick Start
bun install && bun run dev

## Project Structure
Monorepo with 3 packages:
- @ventureos/shared — Type definitions (THE contract)
- @ventureos/server — Bun HTTP + WebSocket + Event Store
- @ventureos/dashboard — React + Vite dashboard

## Key Commands
| Command | Purpose |
|---------|---------|
| bun run dev | Start server + dashboard (hot reload) |
| bun run build | Production build |
| bun run test | Run all tests |
| bun run type-check | TypeScript check all packages |

## Architecture
Event-sourced: agents push events via MCP tools → server stores in append-only log → WebSocket streams to dashboard → React renders in real-time.

## Part of aviraldua93 Ventures
Sister project: [ArchitectAI](https://github.com/aviraldua93/architect-ai) — AI study tool for Claude Certified Architect exam.
