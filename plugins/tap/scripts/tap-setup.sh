#!/bin/sh
set -e

# tap:setup — one-shot login-site preparation for Tap.
# Public pages / open APIs need NONE of this (the bundled MCP server already
# works over npx). This is only for logged-in sites, where the Chrome
# extension must reach a STABLE local binary via the native-messaging bridge
# (the bridge manifest is a no-op under an ephemeral npx path, so a real
# install is required here).
#
# Steps: ensure a stable `tap` binary -> register the NM bridge -> open the
# Chrome Web Store page (the one manual click = the trust boundary).

CWS="https://chromewebstore.google.com/detail/tap/llcidejeoobdegbkolbjhfoeckphldce"

# 1. Ensure a stable tap binary.
if command -v tap >/dev/null 2>&1; then
  TAP="$(command -v tap)"
elif [ -x "$HOME/.tap/bin/tap" ]; then
  TAP="$HOME/.tap/bin/tap"
else
  echo "Installing the Tap CLI so the Chrome extension can reach a stable local binary."
  echo "Running the official installer from taprun.dev — shown so you see exactly what runs:"
  echo "  curl -fsSL https://taprun.dev/install.sh | sh"
  curl -fsSL https://taprun.dev/install.sh | sh
  if command -v tap >/dev/null 2>&1; then
    TAP="$(command -v tap)"
  else
    TAP="$HOME/.tap/bin/tap"
  fi
fi

# 2. Register the Chrome native-messaging bridge (idempotent; install.sh and
#    the MCP server's autoheal also do this — running it here is belt-and-braces).
if [ -x "$TAP" ] && "$TAP" bridge setup >/dev/null 2>&1; then
  echo "✓ Chrome bridge registered ($TAP)"
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
