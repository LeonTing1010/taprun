#!/usr/bin/env bash
# claude-skills/init.sh — 在当前项目中安装通用 Claude Skills
#
# Usage:
#   bash ~/Documents/claude-skills/init.sh           # 安装全部 + 生成 CLAUDE.md 模板
#   bash ~/Documents/claude-skills/init.sh --skills   # 仅安装 skills（不动 CLAUDE.md）
#   bash ~/Documents/claude-skills/init.sh --template # 仅生成 CLAUDE.md 模板
#   bash ~/Documents/claude-skills/init.sh --list     # 列出可用 skills

set -euo pipefail

SKILLS_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(pwd)"
SKILLS=(verify constraint-driven-development writing-plans run-task)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}→${NC} $1"; }
ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }

# --- Functions ---

list_skills() {
  echo ""
  echo "Available skills:"
  echo ""
  for skill in "${SKILLS[@]}"; do
    desc=$(head -5 "$SKILLS_DIR/$skill/SKILL.md" | grep "^description:" | sed 's/^description: //')
    printf "  %-35s %s\n" "$skill" "$desc"
  done
  echo ""
}

install_skills() {
  mkdir -p "$PROJECT_DIR/.claude/skills"

  for skill in "${SKILLS[@]}"; do
    target="$PROJECT_DIR/.claude/skills/$skill"
    if [ -L "$target" ]; then
      ok "$skill (already linked)"
    elif [ -d "$target" ]; then
      warn "$skill (directory exists, skipping — remove to re-link)"
    else
      ln -s "$SKILLS_DIR/$skill" "$target"
      ok "$skill → linked"
    fi
  done

  # .gitignore: skills symlinks should not be committed (they're machine-local)
  gitignore="$PROJECT_DIR/.claude/.gitignore"
  if [ -f "$gitignore" ]; then
    if ! grep -q "skills/" "$gitignore" 2>/dev/null; then
      echo "skills/" >> "$gitignore"
      ok ".claude/.gitignore updated"
    fi
  else
    echo "skills/" > "$gitignore"
    ok ".claude/.gitignore created"
  fi
}

generate_template() {
  template="$PROJECT_DIR/CLAUDE.md"

  if [ -f "$template" ]; then
    warn "CLAUDE.md already exists — writing template to CLAUDE.template.md instead"
    template="$PROJECT_DIR/CLAUDE.template.md"
  fi

  cat > "$template" << 'TEMPLATE'
# Project Name — Claude Code Instructions

---

## Commands

```bash
# Development
npm run dev              # Start dev server

# Verification (used by verify skill)
npm run typecheck        # Gate 1: Type checking
npm run lint             # Gate 2: Linting
npm run test             # Gate 4: Tests
```

---

## Business Rules Source (used by constraint-driven-development skill)

> **Business rules live in tests, not in docs.**
> Test name = rule declaration. Test body = machine verification.

| Domain | Constraint Location | Description |
|--------|---------------------|-------------|
| Auth | `src/domain/auth/__tests__/auth.test.ts` | Authentication rules |
| ... | ... | ... |

---

## Project Structure

```
src/
├── domain/          # Business logic (constraint-driven-development scope)
│   ├── auth/
│   └── ...
├── api/             # HTTP handlers
├── ui/              # Frontend
└── ...
```

---

## Skill Router

| User Intent | Skill | Trigger |
|---|---|---|
| "check it" / after code changes | verify | Auto |
| "new feature" / "business bug" | constraint-driven-development | Auto |
| "write a plan" / complex task | writing-plans | Auto |
| task.yaml provided | run-task | Auto |
TEMPLATE

  ok "Template written to $(basename "$template")"
  info "Edit it to match your project's actual commands and structure"
}

# --- Main ---

echo ""
echo "Claude Skills Installer"
echo "======================="
echo "Project: $PROJECT_DIR"
echo ""

case "${1:-all}" in
  --list)
    list_skills
    ;;
  --skills)
    install_skills
    echo ""
    ok "Done. Skills linked to .claude/skills/"
    ;;
  --template)
    generate_template
    ;;
  all)
    install_skills
    echo ""
    generate_template
    echo ""
    ok "Done. Next steps:"
    info "1. Edit CLAUDE.md (or CLAUDE.template.md) to match your project"
    info "2. Start Claude Code — skills will auto-load"
    ;;
  *)
    echo "Usage: bash init.sh [--skills | --template | --list]"
    echo ""
    echo "  (no args)   Install skills + generate CLAUDE.md template"
    echo "  --skills    Only install skill symlinks"
    echo "  --template  Only generate CLAUDE.md template"
    echo "  --list      List available skills"
    exit 1
    ;;
esac
