---
name: verify
description: Programmable verification gates — multi-layer deterministic checks (typecheck, architecture, lint, tests) replacing AI self-assessment. Use after code changes or as part of any implementation workflow.
argument-hint: '[--gate <name>] [--fix]'
license: MIT
metadata:
  author: LeonTing1010
  version: '2.0.0'
---

# Verify — Programmable Verification Gates

Replace AI self-assessment with deterministic, multi-layer verification.

**Core principle: "I'm done" means nothing. All gates passing means something.**

## How It Works

### Dual Role

verify is both a standalone skill and a built-in step in all implementation workflows:

```
Standalone:  user says "check it" → run all gates
Built-in:    agent writes code → verify → fail → fix → verify → pass → continue
```

### Verification Ladder

← Formalization level determines verification power (stronger layers catch more)

```
Level 1: Type system     — compile-time, cannot bypass    (strongest)
Level 2: Unit tests      — runtime behavioral correctness
Level 3: Lint / AST      — structural pattern enforcement
Level 4: Architecture    — dependency & convention checks
Level 5: String matching — last resort, prevents deletion  (weakest)
```

**If a stronger layer already covers an invariant, delete the weaker check (reduce sync artifacts).**

### Verification Loop Protocol

```
Write code
  ↓
Run verify
  ↓
All pass → done, proceed to next step
  ↓
Failure → analyze root cause → fix → re-run verify
  ↓
Same gate fails 3 times in a row → STOP, escalate to human
  Reason: the verification rule itself may need updating, or the task needs re-scoping
```

**Never skip a failing gate. Never work around a gate.**

### When to Run

- After any code modification (auto-trigger)
- During subagent task execution (built into work loop)
- Before creating a PR (final confirmation)
- When user says "check it" / "verify" (standalone invocation)

---

## Gate Catalog

Six standard gates, ordered by verification strength. Each project configures the specific commands in CLAUDE.md.

| Gate | Name | Layer | What It Checks |
|------|------|-------|----------------|
| 1 | **typecheck** | Types | Compiler reports zero errors |
| 2 | **lint** | AST/Style | Linter rules pass (ESLint, Clippy, golint, etc.) |
| 3 | **architecture** | Structure | Dependency rules, import boundaries, conventions |
| 4 | **tests** | Behavior | Unit/integration tests pass |
| 5 | **diff-size** | Metric | Lines added + files changed within limits |
| 6 | **security** | Pattern | No hardcoded secrets, no sensitive files staged |

### How to Run

Read the project's CLAUDE.md to find the specific commands for each gate. A well-configured project will have a section like:

```markdown
## 常用命令 / Common Commands
pnpm typecheck          # Gate 1: typecheck
pnpm lint               # Gate 2: lint
pnpm check:arch         # Gate 3: architecture
pnpm test               # Gate 4: tests
```

If the project has a unified verify script (e.g., `scripts/verify.sh`), use that. Otherwise, run gates individually in order.

**If CLAUDE.md doesn't define a gate's command, skip that gate — don't guess.**

### Execution Strategy

```
# Parallel where possible:
Gate 1 (typecheck) ─┐
Gate 2 (lint)       ├─ can run in parallel (independent)
Gate 6 (security)   ┘
         ↓ all pass
Gate 3 (architecture) ─── may depend on compiled output
         ↓ pass
Gate 4 (tests) ─────────── may depend on lint/type fixes
         ↓ pass
Gate 5 (diff-size) ──────── run last (informational)
```

### Failure Handling

| Failure Type | Action |
|---|---|
| typecheck fails | Fix type errors — these block everything |
| lint fails | Fix lint issues — often auto-fixable |
| architecture fails | Read the rule, adjust code structure |
| tests fail | Fix implementation first; update test only if the spec changed |
| diff-size exceeds limit | Split the change — were unnecessary modifications made? |
| security alert | Remove hardcoded secrets, unstage sensitive files |
| Same gate fails 3× | Stop. The rule itself may be wrong, or the task needs re-scoping |

---

## Temporal Audit (When Rules Themselves Go Stale)

Gates check "does the code satisfy the rules?" But rules themselves can expire — the world changed and the system doesn't know.

| Signal | Possible Staleness | Action |
|---|---|---|
| Metrics suddenly anomalous | External conditions changed but config wasn't updated | Review config parameters |
| All gates green but user complaints rise | Rules no longer reflect business intent | Question the rules themselves |
| A gate keeps triggering on valid code | Rule may no longer apply | Challenge the rule, not just the code |

**All gates green ≠ system correct. Gates only guarantee known rules aren't broken — they don't guarantee the rules are still right.**

---

## Project Contract

For this skill to work, your project's CLAUDE.md should define:

```markdown
## Verification Commands

| Gate | Command | Notes |
|------|---------|-------|
| typecheck | `pnpm typecheck` | TypeScript compiler |
| lint | `pnpm lint` | ESLint |
| architecture | `bash scripts/check-arch.sh` | Import boundaries |
| tests | `pnpm test` | Vitest / Jest / pytest |
| diff-size | (built-in, no command) | Default: 500 lines, 20 files |
| security | (built-in, no command) | Scans for secrets/env files |
```

If your project has a single verify script, just define:

```markdown
## Verification
`bash scripts/verify.sh`            # runs all gates
`bash scripts/verify.sh --gate X`   # runs single gate
```
