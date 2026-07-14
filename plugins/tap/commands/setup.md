---
description: "Prepare Tap for logged-in sites: install the CLI, register the Chrome bridge, and open the extension page"
allowed-tools: ["Bash(${CLAUDE_PLUGIN_ROOT}/scripts/tap-setup.sh:*)"]
---

# tap:setup

Public pages and open APIs need none of this — the Tap MCP server already works
after `/plugin install`. Run this **only for logged-in sites** (bank, internal
dashboards, social), which need your real browser session.

```!
"${CLAUDE_PLUGIN_ROOT}/scripts/tap-setup.sh"
```

The script installs a stable Tap CLI, registers the Chrome native-messaging
bridge, and opens the extension page. Then, in Chrome, click **Add to Chrome**
and accept the permission prompt — that grant is the one manual step and can't be
automated: it's the trust boundary that lets Tap reuse your existing logged-in
session. Tap never asks for or transmits credentials.

When it finishes, run `/reload-plugins` if the Tap MCP tools aren't connected yet.

> Prefer adaptive setup? Just tell the agent "set up tap for this logged-in
> site" — the **tap-setup** skill diagnoses the prerequisite ladder with
> `tap embed --verify` and fixes only what's missing, instead of running the
> full script blind. This command stays as the explicit one-shot entry.
