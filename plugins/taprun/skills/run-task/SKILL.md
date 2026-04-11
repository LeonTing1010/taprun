---
name: run-task
description: Execute task.yaml semi-autonomous tasks — worktree isolation, agent execution, verification gates, auto PR. Use when given a task definition file.
argument-hint: '<task-file.yaml> [--dry-run] [--max-retries=3]'
license: MIT
metadata:
  author: LeonTing1010
  version: '2.0.0'
---

# Run Task — Semi-Autonomous Task Execution

Execute a task defined in YAML: isolate → implement → verify → PR.

## Usage

```
/run-task tasks/my-task.yaml              # execute
/run-task tasks/my-task.yaml --dry-run    # preview only
/run-task tasks/my-task.yaml --max-retries=5
```

---

## Task File Format

```yaml
task: 'One-line description of what to achieve'
branch: feat/xxx
base_branch: main          # default: main
priority: P1               # P0/P1/P2
max_retries: 3             # default: 3

context: |
  Background information the agent needs to understand the task.
  Include links to relevant files, business context, and constraints.

constraints: |
  Rules the implementation must follow.
  - Must not break existing tests
  - Must use established patterns
  - Specific technical constraints...

assertions:
  - file_changed: 'path/to/file'           # this file MUST be modified
  - file_unchanged: 'path/to/other'         # this file MUST NOT be modified
  - grep: 'pattern to find'                 # this pattern MUST exist
    in: 'path/or/glob'                      # search scope
  - grep_absent: 'pattern that must not exist'
    in: 'path/or/glob'
  - command: 'pnpm test'                    # this command MUST exit 0
    exit_code: 0
  - max_files_changed: 10                   # change scope limit
  - max_lines_added: 200                    # change size limit
```

## Creating Tasks

Copy from template or write from scratch:

```yaml
# Minimal task
task: 'Add input validation to user registration endpoint'
branch: feat/registration-validation
assertions:
  - command: 'pnpm test'
    exit_code: 0
  - grep: 'validateRegistration'
    in: 'src/auth/'
  - max_files_changed: 5
```

---

## Execution Flow

```
1. Parse task.yaml → validate required fields
2. Create Git worktree on task branch (isolated from main)
3. Launch agent with task context + constraints
4. Agent implements the task
5. Run verification:
   a. Project verification gates (invoke verify skill / project commands)
   b. Task-specific assertions from the YAML
6. On failure:
   - Feed error output back to agent
   - Agent analyzes and fixes
   - Re-run verification
   - Repeat up to max_retries
7. All pass → commit → create PR
8. Clean up worktree
```

### Worktree Isolation

Each task runs in a git worktree — an isolated copy of the repo on a separate branch. This means:
- Task changes don't affect your working directory
- Multiple tasks can run in parallel on different branches
- Failed tasks can be discarded cleanly

### Verification = Project Gates + Task Assertions

Verification is two layers:

1. **Project gates** — the project's standard verification (typecheck, lint, tests, etc.) as defined in CLAUDE.md or the verify skill
2. **Task assertions** — the task-specific checks from the YAML file

Both must pass. Project gates run first (foundational correctness), then task assertions (task-specific requirements).

---

## Writing Good Assertions

**Verify results, not process:**
```yaml
# ✅ Good — verifies the outcome
- grep: 'export function validateEmail'
  in: 'src/utils/validation.ts'

# ❌ Bad — verifies the process
- grep: 'import.*zod'
  in: 'src/utils/validation.ts'
```

**Be specific:**
```yaml
# ✅ Good — narrow pattern, clear location
- grep: 'addressId.*limitPerAddress'
  in: 'src/delivery/'

# ❌ Bad — too broad, matches anything
- grep: 'address'
  in: 'src/'
```

**Limit scope:**
```yaml
# Prevent accidental changes to unrelated code
- file_unchanged: 'src/auth/auth.service.ts'
- max_files_changed: 5
- max_lines_added: 200
```

**Include test verification:**
```yaml
- command: 'pnpm test'
  exit_code: 0
```

**3–8 assertions is the sweet spot.** Too few = can't tell if the task is done. Too many = over-constraining the agent's approach.

---

## Failure Protocol

| Situation | Action |
|---|---|
| Verification fails, retries remaining | Feed error to agent → fix → re-verify |
| Same assertion fails 3× consecutively | Stop — the assertion may be wrong, or the task needs re-scoping |
| Max retries exhausted | Stop — report what passed and what didn't |
| Agent asks a question | Pause execution, surface question to user |
| Worktree has conflicts | Stop — base branch may have diverged |

---

## Project Contract

For this skill to work, the project needs:

1. **Verification commands in CLAUDE.md** — so the verify step knows what to run
2. **Git repository** — worktree isolation requires git
3. **Task directory convention** (optional) — e.g., `tasks/` with a `_template.yaml`
