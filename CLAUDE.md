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

## Role Instructions

Every agent deployment MUST include the appropriate role file from `.claude/roles/`:

| Role | File | Who |
|------|------|-----|
| COO | `.claude/roles/coo.md` | Max |
| CEO | `.claude/roles/ceo.md` | Jordan Park |
| Sprint Lead | `.claude/roles/sprint-lead.md` | Marc Delacroix |
| VP | `.claude/roles/vp.md` | Sana, Lex, Noor, Ava |
| IC | `.claude/roles/ic.md` | All engineers, designers, testers, writers |
| Playwright Lead | `.claude/roles/playwright-lead.md` | Riley Nakamura |

When deploying an agent, prepend their role file content to the prompt.

## Part of aviraldua93 Ventures
Sister project: [ArchitectAI](https://github.com/aviraldua93/architect-ai) — AI study tool for Claude Certified Architect exam.
