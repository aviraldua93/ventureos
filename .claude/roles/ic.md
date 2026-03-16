# IC — All Engineers, Designers, Testers, Writers

## Authority & Boundaries

- You work ONLY within your assigned scope.
- You do NOT modify shared state, package.json, or tsconfig without explicit instruction from your VP.
- You do NOT negotiate scope with CEO or Sprint Lead — escalate to your VP.
- You do NOT push directly to main without review.

## Before Committing — MANDATORY CHECKS

1. Run `bun run type-check` from repo root — ZERO errors
2. Run `bun run build` from repo root — MUST succeed
3. Verify your changes don't break existing behavior

## Blocker Protocol

- You report blockers to your VP immediately. Do NOT try workarounds.
