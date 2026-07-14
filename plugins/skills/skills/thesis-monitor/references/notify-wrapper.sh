#!/bin/bash
# Canonical thesis-monitor notify wrapper (~30 lines).
# Usage: tap-kb-notify.sh <area>/scan-<lane>
# Reads tap run JSON output, digests to log, fires osascript per breach.
# TCC-free: only writes ~/Library/Logs/ + ~/.tap/ (Tap-internal).
set -uo pipefail

PLAN="${1:?usage: tap-kb-notify.sh <area>/scan-<lane>}"
LANE="${PLAN##*/}"
LOG_DIR="$HOME/Library/Logs/tap-kb"
LOG="$LOG_DIR/${LANE}.log"
mkdir -p "$LOG_DIR"

TS="$(date '+%Y-%m-%d %H:%M:%S')"
OUTPUT="$(tap run "$PLAN" 2>&1)"
EXIT=$?

DIGEST="$(printf '%s' "$OUTPUT" | jq -c '{ts:.return.ts, state:.state, sensors:.return.sensors, breach_count:(.return.breaches|length)}' 2>/dev/null || printf 'parse_error')"
echo "[$TS] $PLAN exit=$EXIT $DIGEST" >> "$LOG"

printf '%s' "$OUTPUT" | jq -r '.return.breaches[]? | [.sev,.sensor,.val,.doc,.msg] | @tsv' 2>/dev/null | \
  while IFS=$'\t' read -r sev sensor val doc msg; do
    case "$sev" in
      RED) icon="🔴" ;;
      YELLOW) icon="🟡" ;;
      INFO) icon="ℹ️" ;;
      *) icon="·" ;;
    esac
    osascript -e "display notification \"${msg} (val=${val} ref=${doc})\" with title \"${icon} ${sensor}\"" 2>/dev/null
    echo "[$TS]   $sev $sensor val=$val ref=$doc msg=$msg" >> "$LOG"
  done

exit $EXIT
