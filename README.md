# taprun

**Local-first authenticated browser automation for Claude Code.** Record a
repeated logged-in browser task once; replay it forever in your own Chrome as a
deterministic program at **zero LLM tokens** — your credentials never leave your
machine.

This repository is a [Claude Code plugin marketplace](https://docs.claude.com/en/docs/claude-code/plugins).
Adding it gives Claude Code the **Tap** MCP server plus the skills that teach the
agent when and how to use it. Homepage: [taprun.dev](https://taprun.dev).

## Why Tap is different

Every other browser approach — Stagehand, Browserbase, Playwright-MCP,
mcp-chrome, Browser MCP — re-runs a live model and re-burns tokens on **every
execution**, and ships the page (with its logged-in session) to a remote browser
pool. Tap compiles the plan **once**, at capture time, then replays it
deterministically:

- **Zero tokens per run.** The AI participates only while recording; replay is
  pure data + dispatch.
- **Credentials never cross a trust boundary.** Replay runs in *your* real
  Chrome, on *your* existing cookies. Nothing is sent to a cloud browser.
- **Effect-verified.** Read plans return an honest `{ outcome, reason }`; write
  plans carry a postcondition, so `ok:true` proving execution is separated from
  the effect actually landing.

## Install

Prerequisite: [Claude Code](https://claude.ai/claude-code).

**From inside Claude Code:**

```
/plugin marketplace add LeonTing1010/taprun
/plugin install tap@taprun
```

**Or from a terminal** (no interactive session needed — good for provisioning /
dotfiles):

```bash
claude plugin marketplace add LeonTing1010/taprun && claude plugin install tap@taprun
```

That's it for **public pages and open APIs** — the MCP server runs over `npx`,
nothing else to install.

> **First connection is a one-time download.** The very first time the Tap MCP
> server starts, `npx` fetches the engine (~50 MB) before it can answer — the
> initial connect can take up to a minute on a slow link. Every run after that
> is instant and fully offline. If the Tap tools aren't connected yet (or the
> first connect timed out), run `/reload-plugins` — the second attempt is fast
> because the engine is already cached.

### Logged-in sites — one extra step

To reuse your authenticated session (bank / internal dashboard / social), the
Chrome extension needs a stable local binary via a native-messaging bridge. Just
tell the agent *"set up tap for this logged-in site"* (the **tap-setup** skill
drives it), or run the command:

```
/tap:setup
```

It installs the CLI, registers the Chrome bridge, and opens the extension page.
Then click **Add to Chrome** and accept the permission prompt — that one click is
the trust boundary that lets Tap reuse your existing login. Tap never asks for or
transmits credentials.

## What's in the `tap` plugin

| Component | What it does |
|---|---|
| **Tap MCP server** | 4 meta verbs — `capture` / `verify` / `mark` / `run` — plus your saved taps exposed as MCP resources (`tap://{site}/{name}`). Runs via `npx @taprun/cli mcp stdio`. |
| **tap-capture-replay** skill | Teaches the agent to reach for Tap when a browser task is *repeated* and *logged-in* — record once, replay at zero tokens. |
| **tap-setup** skill | Adaptive, diagnose-first setup for logged-in sites (`tap embed --verify` → fix only what's missing). |
| **tap-triggers** skill | Declare *when* a saved tap runs unattended — `~/.tap/triggers/*.trigger.json` compiled into launchd jobs, zero tokens per fire. |
| **WebFetch → tap routing hook** | On auth/bot-walled hosts where a cloud fetch can't see logged-in content, redirects the agent to Tap instead of hitting the wall. |
| **/tap:setup** command | The explicit one-shot login-site setup entry. |

## How it works

1. **Check first, don't rebuild.** `resources/list` — a matching saved tap runs
   with `run({ ref, args })`.
2. **Capture once.** `capture { url, intent, site, name }` compiles a plan to
   `~/.tap/plans/<site>/<name>.plan.json`. AI runs only here.
3. **Replay forever.** `run({ ref, args })` — deterministic, zero tokens. Use
   `verify` first to confirm the tap hasn't broken from a site redesign.

Saved taps live under `~/.tap/` on your machine and never sync to any cloud.

## Keeping it updated

Auto-update by adding `"autoUpdate": true` to the marketplace entry Claude Code
wrote in `~/.claude/settings.json`:

```jsonc
"extraKnownMarketplaces": {
  "taprun": {
    "source": { "source": "github", "repo": "LeonTing1010/taprun" },
    "autoUpdate": true
  }
}
```

New commits on `main` are then pulled at session start. Without it, run
`/plugin update tap@taprun`.

**Declarative install** (dotfiles / automation) — write both sections directly
and restart Claude Code:

```jsonc
{
  "extraKnownMarketplaces": {
    "taprun": { "source": { "source": "github", "repo": "LeonTing1010/taprun" }, "autoUpdate": true }
  },
  "enabledPlugins": {
    "tap@taprun": true
  }
}
```

## Directory layout

```
taprun/
├── .claude-plugin/marketplace.json     marketplace manifest
├── plugins/
│   └── tap/                            the product plugin
│       ├── .claude-plugin/plugin.json
│       ├── .mcp.json                   MCP server (npx @taprun/cli mcp stdio)
│       ├── commands/setup.md           /tap:setup
│       ├── hooks/                      WebFetch → tap routing hook
│       ├── scripts/tap-setup.sh
│       └── skills/{tap-capture-replay, tap-setup, tap-triggers}/SKILL.md
├── LICENSE
└── README.md
```

The product engine (`@taprun/cli`, the Chrome extension, the plan format) lives
elsewhere; this repo is only the Claude Code distribution glue.

## License

MIT.
