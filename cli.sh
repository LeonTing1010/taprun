#!/usr/bin/env bash
# claude-skills CLI — entry point for the `claude-skills` command
#
# Usage:
#   claude-skills init [--skills|--template]   Set up skills in current project
#   claude-skills list                         List available skills
#   claude-skills update                       Pull latest from git
#   claude-skills help                         Show help

set -euo pipefail

SKILLS_DIR="$HOME/.claude-skills"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${CYAN}→${NC} $1"; }

show_help() {
  echo ""
  echo -e "${BOLD}claude-skills${NC} — Universal skills for Claude Code"
  echo ""
  echo "Commands:"
  echo "  init [flags]    Set up skills in the current project"
  echo "                    (no flags)    Link skills + generate CLAUDE.md template"
  echo "                    --skills      Only link skills"
  echo "                    --template    Only generate CLAUDE.md template"
  echo "  list            List available skills"
  echo "  update          Update skills to latest version"
  echo "  help            Show this help"
  echo ""
  echo "Quick start:"
  echo "  cd your-project"
  echo "  claude-skills init"
  echo ""
}

cmd_update() {
  if [ -d "$SKILLS_DIR/.git" ]; then
    info "Updating..."
    git -C "$SKILLS_DIR" pull --rebase --quiet
    ok "Updated to latest version"
  else
    echo "Not a git install. Re-run the install script to update."
    exit 1
  fi
}

cmd_list() {
  bash "$SKILLS_DIR/init.sh" --list
}

cmd_init() {
  bash "$SKILLS_DIR/init.sh" "$@"
}

# --- Main ---

case "${1:-help}" in
  init)
    shift
    cmd_init "$@"
    ;;
  list)
    cmd_list
    ;;
  update)
    cmd_update
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    echo "Unknown command: $1"
    echo "Run 'claude-skills help' for usage."
    exit 1
    ;;
esac
