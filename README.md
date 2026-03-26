# Claude Skills

Universal, project-agnostic skills for [Claude Code](https://claude.ai/claude-code).

## Install

```bash
git clone https://github.com/LeonTing1010/claude-skills.git .claude/skills
```

Done. Start Claude Code — skills auto-load.

## Update

```bash
git -C .claude/skills pull
```

## Skills

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| [verify](verify/SKILL.md) | Multi-layer deterministic verification gates | After code changes, before PR |
| [constraint-driven-development](constraint-driven-development/SKILL.md) | RED→GREEN→Why workflow for business logic | Adding features, fixing business bugs |
| [writing-plans](writing-plans/SKILL.md) | Intent-verification task decomposition | Before complex implementations |
| [run-task](run-task/SKILL.md) | Semi-autonomous task execution from YAML | Delegating tasks to agents |

## CLAUDE.md Configuration

Skills read your project's `CLAUDE.md` to know how to run commands. Add the sections each skill needs:

### Verification Commands (all skills depend on this)

```markdown
## Verification Commands

| Gate | Command |
|------|---------|
| typecheck | `pnpm typecheck` |
| lint | `pnpm lint` |
| test | `pnpm test` |
| architecture | `bash scripts/check-arch.sh` |
```

### Project Structure (used by constraint-driven-development, writing-plans)

```markdown
## Project Structure

| Directory | Purpose |
|-----------|---------|
| `src/domain/` | Business logic |
| `src/domain/__tests__/` | Business rule tests |
| `src/api/` | HTTP handlers |
| `src/ui/` | Frontend |
```

### Test Framework (used by constraint-driven-development)

```markdown
## Test Framework

- Framework: vitest
- Run by tag: `vitest --tagsFilter <tag>`
- Tags: safety, billing, auth, ...
```

### Key Constraints (used by writing-plans)

```markdown
## Key Constraints

- Schema changes require migration
- New error codes need i18n
- Config changes need admin UI
```

## How It Works

```
┌─────────────────────────────┐
│  Skill (methodology)        │  ← .claude/skills/<name>/SKILL.md
│  "Run verification gates"   │
└──────────┬──────────────────┘
           │ reads
┌──────────▼──────────────────┐
│  CLAUDE.md (project config) │  ← Your project config
│  "pnpm typecheck"           │
└─────────────────────────────┘
```

## Intent Router

Add to your `CLAUDE.md`:

```markdown
## Skill Router

| User Intent | Skill | Trigger |
|---|---|---|
| "check it" / after code changes | verify | Auto |
| "new feature" / "business bug" | constraint-driven-development | Auto |
| "write a plan" / complex task | writing-plans | Auto |
| task.yaml provided | run-task | Auto |
```

## License

MIT
