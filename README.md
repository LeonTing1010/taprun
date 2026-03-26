# Claude Skills

Universal, project-agnostic skills for [Claude Code](https://claude.ai/claude-code). Each skill encodes a reusable development methodology — not project-specific commands.

## Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [verify](verify/SKILL.md) | Multi-layer deterministic verification gates | After code changes, before PR |
| [constraint-driven-development](constraint-driven-development/SKILL.md) | RED→GREEN→Why workflow for business logic | Adding features, fixing business bugs |
| [writing-plans](writing-plans/SKILL.md) | Intent-verification task decomposition | Before complex implementations |
| [run-task](run-task/SKILL.md) | Semi-autonomous task execution from YAML | Delegating tasks to agents |

## Installation

### Option 1: Symlink into your project

```bash
# From your project root
ln -s ~/path/to/claude-skills/verify .claude/skills/verify
ln -s ~/path/to/claude-skills/writing-plans .claude/skills/writing-plans
# ... etc
```

### Option 2: Copy into your project

```bash
cp -r ~/path/to/claude-skills/verify .claude/skills/
cp -r ~/path/to/claude-skills/writing-plans .claude/skills/
# ... etc
```

### Option 3: Global skills (all projects)

```bash
# Symlink into user-level Claude config
mkdir -p ~/.claude/skills
ln -s ~/path/to/claude-skills/verify ~/.claude/skills/verify
# ... etc
```

## How It Works

Each skill is a **methodology** that adapts to your project through a **project contract** — a set of conventions your `CLAUDE.md` should define.

```
┌─────────────────────────────┐
│  Skill (methodology)        │  ← Universal, lives here
│  "Run verification gates"   │
└──────────┬──────────────────┘
           │ reads
┌──────────▼──────────────────┐
│  CLAUDE.md (project config) │  ← Per-project, lives in your repo
│  "pnpm typecheck"           │
│  "pnpm test"                │
└─────────────────────────────┘
```

Skills define **what to do** (the process). CLAUDE.md defines **how to do it** (the commands).

## Project Contract

For skills to work with your project, your `CLAUDE.md` should include:

### Minimum (for verify + writing-plans)

```markdown
## Commands
pnpm typecheck     # Type checking
pnpm lint          # Linting
pnpm test          # Run tests
```

### Recommended (for constraint-driven-development)

```markdown
## Business Logic
- Domain code: `src/domain/`
- Test framework: Vitest with tags
- Run safety tests: `vitest --tagsFilter safety`

## Business Rules Source
Tests are the single source of truth for business rules.
Key constraint locations:
| Domain | Test File |
|--------|-----------|
| Pricing | `src/domain/pricing/__tests__/pricing.test.ts` |
| Auth | `src/domain/auth/__tests__/auth.test.ts` |
```

### Full (for run-task)

```markdown
## Verification
`bash scripts/verify.sh`              # All gates
`bash scripts/verify.sh --gate X`     # Single gate
```

## Intent Router

Configure automatic skill invocation by adding a router to your Claude Code settings or CLAUDE.md:

```markdown
## Skill Router

| User Intent | Skill | Trigger |
|---|---|---|
| "check it" / after code changes | verify | Auto |
| "new feature" / "business bug" | constraint-driven-development | Auto |
| "write a plan" / complex task | writing-plans | Auto |
| task.yaml provided | run-task | Auto |
```

## Design Philosophy

These skills are derived from first-principles engineering philosophy:

1. **Correctness must not depend on any single entity** → Cross-verification (verify skill)
2. **Correctness has a shelf life** → Temporal audit (constraint-driven-development audit dates)
3. **Make violations difficult, don't rely on memory** → Machine-enforced gates (verify)
4. **Reduce artifacts that need syncing** → Test = spec = documentation (constraint-driven-development)
5. **Split by intent, not by layer** → Intent-verification pairs (writing-plans)

## License

MIT
