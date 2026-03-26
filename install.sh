#!/usr/bin/env bash
# Claude Skills — One-line installer
#
#   curl -fsSL https://raw.githubusercontent.com/LeonTing1010/claude-skills/main/install.sh | bash
#
# What it does:
#   1. Clones repo to ~/.claude-skills
#   2. Creates `claude-skills` shell command
#   3. Ready to use in any project

set -euo pipefail

INSTALL_DIR="$HOME/.claude-skills"
REPO="https://github.com/LeonTing1010/claude-skills.git"
BIN_NAME="claude-skills"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${CYAN}→${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
err()   { echo -e "${RED}✗${NC} $1"; }

# --- Pre-flight ---

if ! command -v git &>/dev/null; then
  err "git is required but not installed."
  exit 1
fi

echo ""
echo -e "${BOLD}Claude Skills Installer${NC}"
echo "======================="
echo ""

# --- Install / Update ---

if [ -d "$INSTALL_DIR/.git" ]; then
  info "Updating existing installation..."
  git -C "$INSTALL_DIR" pull --rebase --quiet
  ok "Updated to latest version"
else
  if [ -d "$INSTALL_DIR" ]; then
    warn "$INSTALL_DIR exists but is not a git repo — backing up"
    mv "$INSTALL_DIR" "$INSTALL_DIR.bak.$(date +%s)"
  fi
  info "Cloning to $INSTALL_DIR..."
  git clone --quiet "$REPO" "$INSTALL_DIR"
  ok "Installed to $INSTALL_DIR"
fi

chmod +x "$INSTALL_DIR/init.sh"

# --- Shell integration ---

# Detect shell config file
if [ -n "${ZSH_VERSION:-}" ] || [ "$(basename "$SHELL")" = "zsh" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -n "${BASH_VERSION:-}" ] || [ "$(basename "$SHELL")" = "bash" ]; then
  SHELL_RC="$HOME/.bashrc"
  # macOS uses .bash_profile for login shells
  if [[ "$OSTYPE" == "darwin"* ]] && [ -f "$HOME/.bash_profile" ]; then
    SHELL_RC="$HOME/.bash_profile"
  fi
else
  SHELL_RC=""
fi

# The command: claude-skills [init|update|list|help]
ALIAS_LINE="alias claude-skills='bash $INSTALL_DIR/cli.sh'"

if [ -n "$SHELL_RC" ]; then
  if grep -qF "claude-skills" "$SHELL_RC" 2>/dev/null; then
    ok "Shell command already configured in $(basename "$SHELL_RC")"
  else
    echo "" >> "$SHELL_RC"
    echo "# Claude Skills" >> "$SHELL_RC"
    echo "$ALIAS_LINE" >> "$SHELL_RC"
    ok "Added 'claude-skills' command to $(basename "$SHELL_RC")"
  fi
else
  warn "Could not detect shell config. Add this manually:"
  echo "  $ALIAS_LINE"
fi

# --- Done ---

echo ""
ok "Installation complete!"
echo ""
echo -e "${BOLD}Usage:${NC}"
echo ""
echo "  cd your-project"
echo "  claude-skills init        # Link skills + generate CLAUDE.md template"
echo "  claude-skills init --skills   # Only link skills"
echo "  claude-skills init --template # Only generate CLAUDE.md template"
echo "  claude-skills list        # List available skills"
echo "  claude-skills update      # Update to latest version"
echo ""

if [ -n "$SHELL_RC" ]; then
  info "Run 'source $(basename "$SHELL_RC")' or open a new terminal to start using it."
fi
