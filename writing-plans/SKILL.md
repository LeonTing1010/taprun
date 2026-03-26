---
name: writing-plans
description: Write implementation plans — intent-verification pairs as core unit, tasks split by change isolation. Use before complex implementations to align on approach and define success criteria.
license: MIT
metadata:
  author: LeonTing1010
  version: '2.0.0'
---

# Writing Plans

Write executable implementation plans for complex tasks.

## Core Shift

```
Old: split tasks by module/layer → assign to specialist agents
New: split tasks by intent → define verification per task → agent freely crosses layers
```

The unit of work is an **intent-verification pair**, not a file or module.

---

## Plan Structure

```markdown
# Plan: [Feature / Fix Name]

## Context

Why is this needed? What problem does it solve?

## Goal

What does the world look like when this is done? (One paragraph max)

## Verification Conditions (Global)

Invariants that must hold when ALL tasks are complete (ordered by verification strength):

- [ ] Type layer: [return types / parameter types that must exist — compiler enforced]
- [ ] Test layer: [behaviors that must have tests — runtime correctness]
- [ ] Gate layer: typecheck + lint + tests pass
- [ ] Structure layer: [grep/AST checks if needed — last resort]

## Approach

Which approach was chosen and why? (Brief — this isn't a design doc)

## Tasks

### Task 1: [Intent description, NOT file description]

- Intent: one sentence — what business goal does this task achieve?
- Verification:
  - Test: `xxx.test.ts` verifies [expected behavior]
  - typecheck passes
  - [other gates]
- TDD loop:
  1. RED: write test — verify [expected behavior]
  2. Confirm test fails
  3. GREEN: minimum implementation (agent decides which files/layers to change)
  4. Confirm test passes
  5. REFACTOR: clean up
- Parallelizable: yes/no (which tasks don't conflict)

### Task 2: [Intent description]

- Intent: ...
- Verification: ...
- Depends on: Task 1 (if any)
- Parallelizable: yes (no file conflicts with Task 3)

## Risks

- ...

## Final Verification

Run all project verification gates — every gate must pass.
```

---

## Principles

1. **Split by intent, not by layer.** One task can change domain + API + frontend, as long as it serves a single, testable intent.

2. **Every task must have verification conditions.** Verification IS the task definition, not an afterthought. Prefer type constraints (compiler enforced) > tests (behavioral correctness) > grep (prevent deletion).

3. **Don't assign agent types.** Give the agent full context and let it decide what to change. Don't constrain it to "only touch the domain layer."

4. **Parallelize by file conflict, not by architecture.** Two tasks modifying different files → parallel. Same file → sequential. The question is "will changes conflict?" not "are they in different layers?"

5. **Control granularity.** Each task should be ≤200 lines of change. Larger → split further.

6. **TDD first for business logic.** Tasks with business logic MUST include a TDD loop. Pure UI/config tasks are exempt.

7. **Include key code samples.** Give the agent concrete code snippets to reference — don't make it guess the patterns.

---

## Parallelization Decision

```
✅ Parallel: Task A changes src/billing/, Task B changes src/auth/
✅ Parallel: Task A changes domain logic, Task B changes UI (no shared files)
❌ Sequential: Task A changes a service, Task B changes the API route calling it
❌ Sequential: Task A changes DB schema, Task B depends on new schema types
```

The key is **file conflict**, not **architectural layer**.

---

## Model Selection Strategy

| Task Characteristics | Recommended Model | Examples |
|---|---|---|
| Mechanical, isolated, clear spec | `sonnet` / fast model | Single config change, format function |
| Multi-file coordination, cross-layer | Default (don't specify) | Service + route + test integration |
| Architecture decisions, complex refactors | `opus` / strongest model | Cross-module refactor, design review |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Do This Instead |
|---|---|---|
| "Task 1: Update database schema" | File-oriented, not intent-oriented | "Task 1: Enable users to have multiple addresses" |
| Task with no verification | Can't tell when it's done | Every task gets at least one testable condition |
| "Domain agent does X, API agent does Y" | Artificial boundary, coordination overhead | One agent, one intent, crosses layers freely |
| 500-line task | Too big to verify atomically | Split into 2-3 tasks with independent verification |
| Plan with 15 tasks | Over-planning, most will change anyway | 3-7 tasks is the sweet spot |

---

## Project Contract

For this skill to work well, your project's CLAUDE.md should define:

1. **Verification commands** (typecheck, lint, test commands — used in "Final Verification")
2. **Key constraints to check** (e.g., "schema changes require migration," "new error codes need i18n," "config changes need admin UI")
3. **Project structure** (where domain logic, tests, API routes, and UI live)
