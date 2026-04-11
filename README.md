# taprun

Private Claude Code plugin marketplace for Leo's engineering methodology skills.

This repository is a [Claude Code plugin marketplace](https://docs.claude.com/en/docs/claude-code/plugins) containing a single plugin (`taprun`) with skills derived from first principles. All skills are namespaced under `/taprun:` in Claude Code sessions.

## Skills

| Skill | Purpose |
|---|---|
| `verify` | Multi-layer deterministic verification gates (typecheck, architecture, lint, tests) — replaces AI self-assessment |
| `constraint-driven-development` | RED → GREEN → Why workflow for business logic |
| `writing-plans` | Intent–verification task decomposition for complex implementations |
| `run-task` | Semi-autonomous task execution from `task.yaml` — worktree isolation, verification gates, auto PR |
| `demand-archaeologist` | Evidence-based demand discovery across CN (小红书/微信/知乎) and EN (Reddit/HN/indie) scenes |
| `engineering-philosophy` | First-principles framework (12 facts + two eternal principles + The Algorithm) for **architecture decisions and product tradeoffs** |
| `first-principle-audit` | Logical audit — assumption list, probability intervals, stakeholder analysis, rebuild path |
| `jimeng-generator` | Generate images via 即梦AI through `opencli` |

## Install on a new machine

Prerequisite: [Claude Code](https://claude.ai/claude-code) installed.

Add to `~/.claude/settings.json`:

```jsonc
{
  "extraKnownMarketplaces": {
    "taprun": {
      "source": {
        "source": "github",
        "repo": "LeonTing1010/taprun"
      }
    }
  },
  "enabledPlugins": {
    "taprun@taprun": true
  }
}
```

Start Claude Code. It automatically:

1. Clones this repo to `~/.claude/plugins/marketplaces/taprun/`
2. Installs the `taprun` plugin to `~/.claude/plugins/cache/taprun/taprun/`
3. Exposes all skills under the `/taprun:` namespace

Verify with `/skills` — you should see `taprun:verify`, `taprun:engineering-philosophy`, etc.

## Update

When new commits land on `main`:

```
/plugin update taprun
```

Or restart Claude Code.

## Edit & publish new skills

Clone once for local development:

```bash
git clone https://github.com/LeonTing1010/taprun.git ~/Documents/taprun
```

Edit skills under `plugins/taprun/skills/<name>/SKILL.md`, commit, push.

New skills: just create a new directory with a `SKILL.md` — no manifest changes required.

## Recommended local setup: auto-commit hook

Pre-rewrite, this repo once accumulated 336 lines of uncommitted edits (full §10 of `engineering-philosophy` + demand-archaeologist Phase 6) because it was nested inside another project's gitignored directory — silently invisible to `git status`. To prevent recurrence on any machine you edit from, install a Claude Code Stop hook that auto-commits the working tree at session end.

Save as `~/.claude/auto-commit-taprun.sh` (chmod +x):

```bash
#!/bin/bash
set +e
cd "$HOME/Documents/taprun" 2>/dev/null || exit 0
[ -d .git ] || exit 0
[ -n "$(git status --porcelain 2>/dev/null)" ] || exit 0
git add -A >/dev/null 2>&1
git commit -m "wip: skill edits $(date '+%Y-%m-%d %H:%M')" >/dev/null 2>&1
exit 0
```

Then add to `hooks.Stop[].hooks[]` in `~/.claude/settings.json`:

```json
{
  "type": "command",
  "command": "bash /Users/<you>/.claude/auto-commit-taprun.sh"
}
```

Every session that touches a skill now ends with a `wip: …` commit. Amend, squash, or push at your leisure. Push is still manual — the hook does not broadcast.

## Directory layout

```
taprun/
├── .claude-plugin/
│   └── marketplace.json            marketplace manifest (required)
├── plugins/
│   └── taprun/
│       ├── .claude-plugin/
│       │   └── plugin.json          plugin manifest (required)
│       └── skills/
│           ├── verify/SKILL.md
│           ├── constraint-driven-development/SKILL.md
│           ├── writing-plans/SKILL.md
│           ├── run-task/SKILL.md
│           ├── demand-archaeologist/{SKILL.md, references/*}
│           ├── engineering-philosophy/{SKILL.md, philosophy.md}
│           ├── first-principle-audit/SKILL.md
│           └── jimeng-generator/SKILL.md
└── README.md                         ← you are here
```

## Why plugin marketplace (rationale)

Before the 2026-04 restructure, skills lived as a flat `~/.claude/skills/claude-skills/<name>/SKILL.md` clone. Two failure modes surfaced:

1. **Discovery failure.** Claude Code only scans **direct children** of `~/.claude/skills/` (i.e. `~/.claude/skills/<name>/SKILL.md`). Nested repos like `~/.claude/skills/claude-skills/verify/` were silently invisible — Claude never saw them.
2. **Uncommitted work loss.** The working copy was nested inside another project's gitignored directory, so running `git status` in the parent project hid all skill edits.

The plugin marketplace mechanism is Claude Code's **native** solution for "one git repo containing multiple skills":

- This repo is the marketplace (analogous to a Homebrew tap)
- It contains one plugin (`plugins/taprun/`)
- The plugin contains the skill library
- Claude Code fetches, installs, caches, and namespaces everything automatically

Result: **two JSON lines in `settings.json` → full skill library on any machine, no path juggling.**

## License

Private. All rights reserved.
