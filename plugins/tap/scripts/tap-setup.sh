#!/bin/sh
set -e

# tap:setup — one-shot login-site preparation for Tap.
# Public pages / open APIs need NONE of this (the bundled MCP server already
# works over npx). This is only for logged-in sites, where the Chrome extension
# reaches the engine through the native-messaging bridge.
#
# `tap bridge setup` self-copies the RUNNING binary to a STABLE path
# (~/.tap/bin/tap) and writes the manifest — so running it FROM npx reuses the
# exact engine the MCP server already downloaded (byte-identical, same version)
# with NO second download. curl-install is only a last resort when npx is absent.
#
# Steps: register the NM bridge (materializing a stable binary) -> open the
# Chrome Web Store page (the one manual click = the trust boundary).

CWS="https://chromewebstore.google.com/detail/tap/llcidejeoobdegbkolbjhfoeckphldce"

# 1+2. Register the Chrome bridge, materializing a stable binary in one step.
if command -v tap >/dev/null 2>&1; then
  TAP="$(command -v tap)"                        # already a stable install
elif [ -x "$HOME/.tap/bin/tap" ]; then
  TAP="$HOME/.tap/bin/tap"                        # engine already self-copied here
elif command -v npx >/dev/null 2>&1; then
  # Reuse the engine the Tap MCP server already fetched via npx: `bridge setup`
  # self-copies it to ~/.tap/bin — same bytes, same version, NO second download.
  echo "Registering the Chrome bridge from the engine npx already has (no second download)…"
  TAP="npx -y @taprun/cli"
else
  # No npx on PATH — fall back to the standalone installer (shown before it runs).
  echo "npx not found — installing the Tap CLI from taprun.dev (shown so you see exactly what runs):"
  echo "  curl -fsSL https://taprun.dev/install.sh | sh"
  curl -fsSL https://taprun.dev/install.sh | sh
  TAP="$HOME/.tap/bin/tap"
fi

# Idempotent; the MCP server's startup autoheal also does this — belt-and-braces.
# shellcheck disable=SC2086  # $TAP may be a multi-word `npx -y @taprun/cli`
if $TAP bridge setup >/dev/null 2>&1; then
  echo "✓ Chrome bridge registered (stable binary at ~/.tap/bin/tap)"
else
  echo "⚠ bridge setup skipped — is Chrome installed? Re-run: $TAP bridge setup"
fi

# 3. Open the extension page. Clicking "Add to Chrome" + accepting the
#    permission prompt is the single manual step and cannot be automated —
#    it is the trust boundary that lets Tap use your existing logged-in session.
echo ""
echo "Now click \"Add to Chrome\" and accept the permission prompt:"
echo "  $CWS"
if command -v open >/dev/null 2>&1; then
  open "$CWS" || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$CWS" || true
fi

echo ""
echo "Done. If the Tap MCP tools aren't connected yet, run /reload-plugins."
