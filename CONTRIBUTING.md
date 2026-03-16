# Contributing to VentureOS

Thank you for your interest in contributing to VentureOS! 🚀

> **Mission Control for AI Agent Teams** — Real-time dashboard to watch AI agents think, talk, code, and ship.

![VentureOS Demo](https://img.shields.io/badge/demo-live-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Bun](https://img.shields.io/badge/runtime-Bun-black)

## 🚀 Getting Started

### Prerequisites
- **[Bun](https://bun.sh/)** v1.0+ (primary runtime & package manager)
- **Node.js** v18+ (needed for Playwright E2E tests)
- **Git**

### Setup
```bash
# Clone the repo
git clone https://github.com/aviraldua93/ventureos.git
cd ventureos

# Install all dependencies (monorepo workspace)
bun install

# Start dev servers (backend + frontend with hot reload)
bun run dev
```

The dashboard opens at [http://localhost:5173](http://localhost:5173) and the API server runs on [http://localhost:3000](http://localhost:3000).

### Verify everything works
```bash
bun run type-check   # TypeScript strict checks across all packages
bun run build        # Production build
bun run test         # Unit tests (bun:test)
bun run test:e2e     # E2E tests (Playwright, chromium)
```

## 📁 Project Structure

```
ventureos/
├── packages/
│   ├── shared/              # Type definitions — THE contract between server & dashboard
│   │   └── src/
│   │       ├── events.ts    # 5 event types: register, heartbeat, task, message, code_change
│   │       ├── types.ts     # Derived state: Agent, Task, Message, CodeChange
│   │       └── protocol.ts  # WebSocket protocol: WSMessage, Snapshot
│   ├── server/              # Bun HTTP + WebSocket + Event Store
│   │   └── src/
│   │       ├── events/      # EventStore (append-only log) + Projections (event → state)
│   │       ├── ws/          # WebSocket handlers (broadcast, keepalive)
│   │       ├── http/        # REST API routes (/api/health, /api/state, /api/demo/*)
│   │       ├── demo/        # Demo engine (scenario playback + live event generation)
│   │       └── logger.ts    # Pino structured logger
│   └── dashboard/           # React 19 + Vite dashboard
│       ├── src/
│       │   ├── components/
│       │   │   ├── VirtualOffice/   # Canvas2D tile-based office engine with pathfinding
│       │   │   └── Thronglet/       # Pixel-art creature nursery with mood system
│       │   ├── store/               # Zustand global state
│       │   └── hooks/               # React hooks (WebSocket, etc.)
│       └── e2e/                     # Playwright E2E + visual regression tests
├── scripts/                 # CLI tools: event emission, config loading, orchestration
├── ventureos.config.json    # Your org configuration (company, teams, agents)
└── ventureos.config.example.json  # Example config — start here!
```

## 🏗 Architecture

VentureOS is **event-sourced**:

1. **Agents push events** via `POST /api/events` (register, heartbeat, task, message, code_change)
2. **EventStore** persists events in an append-only in-memory log
3. **Projections** derive current state (agents, tasks, messages, code changes) from the event log
4. **WebSocket** broadcasts events in real-time to all connected dashboard clients
5. **React dashboard** renders live state with **Zustand** store

### The 4 Tabs
| Tab | Description | Engine |
|-----|-------------|--------|
| **Dashboard** | 3-panel layout: agent list, messages/tasks, code diffs | React + Zustand |
| **Org Chart** | Hierarchical org visualization with filtering | React |
| **Virtual Office** | Tile-based 2D office with walking agents & A* pathfinding | Canvas2D + Pixi.js |
| **🐾 Thronglet** | Pixel-art creature nursery — creatures reflect agent mood states | Canvas2D |

## 🎨 Code Style

### TypeScript
- **Strict mode** everywhere — all packages use `strict: true`
- **Explicit types** for function parameters and return types in public APIs
- **Prefer `interface` over `type`** for object shapes
- **No `any`** — use `unknown` if the type is truly unknown

### React
- **Functional components only** — no class components
- **Zustand** for global state — no Redux, no Context API for shared state
- **Radix UI** for accessible primitives (tabs, dialogs, tooltips)
- **Framer Motion** for animations

### Naming
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase files | `AgentListPanel.tsx` |
| Utilities | camelCase files | `useWebSocket.ts` |
| Variables/Functions | camelCase | `getTeamMembers()` |
| Types/Interfaces | PascalCase | `VentureEvent` |
| Constants | UPPER_SNAKE_CASE | `MOOD_COLORS` |

### Logging
- Server uses **pino** for structured logging — import from `src/logger.ts`
- **Never** use `console.log` in server code
- Dashboard `console` statements are acceptable for development debugging only

## 🧪 Testing

### Unit Tests (bun:test)
```bash
bun run test                              # All unit tests across workspace
cd packages/server && bun test            # Server tests only
cd packages/dashboard && bun test         # Dashboard tests only
cd scripts && bun test                    # Script tests only
```

Unit tests live in `__tests__/` directories. Key test suites:
- **EventStore** — append, subscribe, clear, ordering
- **Projections** — agent registration, heartbeat updates, tasks, messages, snapshots
- **DemoEngine** — scenario playback, pause/resume, speed control
- **HTTP Routes** — health, state, demo endpoints
- **Config Loader** — team members, leads, team map, validation
- **Mood System** — all 5 moods, celebrations, team happiness scoring
- **Creatures** — role-to-species mapping, species metadata
- **Habitat** — tier selection, bounds scaling
- **Office Layout** — tile generation, room placement, furniture, desk assignment

### E2E Tests (Playwright)
```bash
bun run test:e2e                                           # All E2E tests
cd packages/dashboard && bunx playwright test              # Direct Playwright
bunx playwright test --project=demo                        # Record demo video
```

### Visual Regression Tests
```bash
cd packages/dashboard && bunx playwright test e2e/visual/
# To update baselines after intentional UI changes:
bunx playwright test e2e/visual/ --update-snapshots
```

## 🔧 Configuration

VentureOS is fully **config-driven**. To set up your own org:

```bash
cp ventureos.config.example.json ventureos.config.json
# Edit ventureos.config.json with your company, teams, and agents
bun run dev
```

The config controls:
- **Company** — name, tagline, branding colors
- **Teams** — name, display name, color, icon, room type
- **Agents** — id, name, role, team, reporting hierarchy, capabilities
- **Rooms** — auto-generated from teams (or specify custom layouts)

## 📝 Pull Request Process

1. **Fork & branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes** following the code style above.

3. **Test everything**:
   ```bash
   bun run type-check && bun run build && bun run test
   ```

4. **Commit** with [conventional commits](https://www.conventionalcommits.org/):

   | Prefix | Purpose |
   |--------|---------|
   | `feat:` | New feature |
   | `fix:` | Bug fix |
   | `docs:` | Documentation only |
   | `test:` | Adding or updating tests |
   | `refactor:` | Code refactor (no feature/fix) |
   | `chore:` | Tooling, CI, dependencies |

5. **Open PR** targeting `main`. Include:
   - Clear description of what changed and why
   - Screenshots/GIFs for any UI changes
   - Link to related issues

6. **Review** — address feedback, keep commits clean.

## 🐛 Reporting Issues

Found a bug? Please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS version
- Console errors (if any)
- Screenshot or recording

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) or [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) templates.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Happy shipping! 🚀
