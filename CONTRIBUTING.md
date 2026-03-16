# Contributing to VentureOS

Thank you for your interest in contributing to VentureOS! 🚀

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/ventureos.git`
3. **Install dependencies**: `bun install`
4. **Start dev servers**: `bun run dev`

## Development Workflow

```bash
# Run both server & dashboard in dev mode (hot reload)
bun run dev

# Type-check everything
bun run type-check

# Run unit tests
bun run test

# Run end-to-end tests
bun run test:e2e

# Production build
bun run build
```

## Making Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes with clear, atomic commits
3. Ensure all checks pass:
   ```bash
   bun run type-check && bun run test && bun run build
   ```
4. Push and open a Pull Request against `main`

## Pull Request Guidelines

- **Keep PRs focused** — one feature or fix per PR
- **Write descriptive titles** — e.g., `feat: add agent filtering to org chart`
- **Include context** — explain *why* the change is needed, not just *what*
- **Add tests** — if you add a feature, add tests for it
- **Update docs** — if your change affects the README or config schema, update them

## Commit Convention

We use conventional commits:

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code refactor (no feature/fix) |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, CI, dependencies |

## Project Structure

```
packages/
├── server/       # Bun backend — event store, projections, WebSocket
├── dashboard/    # React + Vite frontend — the live dashboard UI
└── shared/       # Shared TypeScript types & contracts
```

## Configuration

VentureOS is fully config-driven. See `ventureos.config.example.json` for the schema. Never hardcode org-specific data — everything flows from the config file.

## Reporting Issues

- Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template for bugs
- Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template for ideas
- Search existing issues before creating a new one

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
