---
name: writing-adrs
description: ADR writing discipline — 6 principles + pre-commit checklist. Language-agnostic; works in any project and stack. Use before writing any Architecture Decision Record.
license: MIT
metadata:
  author: LeonTing1010
  version: '1.0.0'
---

# Writing ADRs

**An ADR is a constraint, not a description.** Descriptions age. Constraints either hold or fail.

Every implementation drift in large codebases comes from ADRs that *described* what should exist instead of *making it impossible to deviate*. The goal of this skill is to close that gap.

---

## This skill is a soft gate — install hard gates

> **A skill fires when an agent remembers to invoke it. A hard gate fires whether anyone remembers or not.**

After writing an ADR, promote the mechanical checks to hard gates in your project. The skill handles judgment calls. Hard gates handle binary checks.

**Recommended hard gate: git pre-commit hook**

```bash
# Install at: .git/hooks/pre-commit  (or via lefthook / husky / pre-commit.ci)
# Adapt the glob pattern to your ADR path convention.

for f in $(git diff --cached --name-only | grep -E 'docs/adr/.*\.md$|decisions/.*\.md$'); do
  lines=$(wc -l < "$f")
  [ "$lines" -gt 200 ] && \
    echo "ADR $f exceeds 200 lines ($lines) — P6 violation" && exit 1

  grep -qiE "^Status: (Proposal|Drafting|Accepted|Superseded)" "$f" || \
    { echo "ADR $f: missing or invalid Status field"; exit 1; }

  grep -qiE "^## TL;DR" "$f" && \
    { echo "ADR $f: remove TL;DR section — apply P6"; exit 1; }
done
exit 0
```

**Stronger options (use the strongest your project supports):**

| Check | Hard gate form |
|---|---|
| Status enum | git hook grep |
| Line count | git hook `wc -l` |
| No TL;DR | git hook grep |
| Every number is cited | CI regex on ADR files |
| Every `must/shall` has a locus | CI regex on ADR files |
| Cross-ADR references exist on disk | CI `find` check |

The skill handles what grep can't: dissolution test, locus quality, cross-ADR coherence.

---

## Phase 1 — Before writing: Dissolution Test

Answer these before opening a new file:

1. **Can we delete this decision instead of recording it?** Reversible in < 1 hour → no ADR needed.
2. **Have we tried to dissolve the abstraction we're recording?** If two prior attempts felt inelegant, try removing the thing rather than designing it again.
3. **Is there a parent ADR we're amending?** Name it before writing. Amendments to a parent are often smaller than a new ADR.

Record the iteration count if non-trivial: `Iterations: 3 (v1 driver-pattern, v2 modalities — both dissolved; v3 this ADR)`.

---

## Phase 2 — Six Principles

### P1 — Constraint not description

Every "must / shall / requires" sentence must name the machine that fails when violated:

- type system error (TypeScript, mypy, Rust compiler, Java generics)
- test assertion (jest, pytest, go test, deno test, xUnit, rspec)
- lint rule (eslint, flake8, golangci-lint, clippy, rubocop)
- CI gate (GitHub Actions step, shell script in pipeline, Makefile target)
- git hook (pre-commit, husky, lefthook, pre-commit.ci)

**If you write "X must be Y" without naming the machine — delete the sentence.**

Sub-rule (P1.1 — structural not lexical): `grep -rn "SYMBOL"` catches comments and strings, not code access. Tighten to access patterns (`SYMBOL[`, `SYMBOL.`, `get(SYMBOL)`). The invariant being guarded is "no code accesses X outside Y," not "the word X never appears outside Y."

### P2 — Schema fields require named consumers

An ADR introducing a schema field must name the consumer (function call site, lint rule, runtime check) in the same document. Fields without consumers are either marked `// FUTURE — gated on ADR <file>` or are not introduced.

### P3 — Numerical claims require primary-source citation

Two kinds, different evidence standards:

- **Retrospective** (counts of existing things) → cite the command: `(find . -name "*.ts" | wc -l)`, `(ls -1 | wc -l)`, `(git log --oneline | wc -l)`
- **Prospective estimates** (future work) → prefix with `~` and break down: `(~3 days = A ~1d + B ~0.5d + C ~1.5d)`

Uncited retrospective claims are refused. Prospective estimates are accepted with `~` but should decompose non-trivial estimates.

### P4 — Coexistence retirement requires compensating ADR

If ADR-A introduces legacy + new running side by side, any commit that retires one side must reference the compensating ADR-B that handles the gap. No "drop X entirely" without naming what now provides what X provided.

### P5 — Dissolution test before addition

Before proposing any abstraction (interface, layer, registry, type), §1 of the ADR must answer: "what if this doesn't need to exist?" Three rejected design iterations without a dissolution attempt is a structural smell. Record it: `Iterations: 4 (v1-v3 rejected — see §X for dissolution attempt)`.

### P6 — Length is signal

> 150 lines means ≥ 50% is defensive narrative. No TL;DR sections — if you need one, the ADR is too long.

Tight ADRs concentrate on what cannot be derived from: code, the parent ADR, and obvious reasoning.

---

## Phase 3 — Pre-Commit Checklist

Run this before committing the ADR file. Failed items block commit.

```
[ ] P1: every "must / shall / requires" sentence cites a static-check locus
[ ] P2: every new schema/type field names its consumer OR has // FUTURE annotation
[ ] P3: every number has parenthetical citation from a verifying command
[ ] P4: if amending coexistence/retirement, name the compensating ADR
[ ] P5: §1 answers "did we try delete?" for any new abstraction
[ ] P6: line count ≤ 150; no TL;DR section
[ ] grep for self-contradictions (section X says one thing, another says the opposite)
[ ] cross-ADR references exist on disk (find . -name "<referenced-file>.md")
[ ] status field is one of: Proposal | Drafting | Accepted | Superseded(by:<file>)
```

**Run the mechanical checks now** (adapt paths to your project):

```bash
ADR="<path-to-adr-file>"

echo "=== Mechanical checks ==="
echo "Lines: $(wc -l < "$ADR")"
grep -iE "^Status:" "$ADR" || echo "MISSING Status field"
grep -qiE "^## TL;DR" "$ADR" && echo "FAIL: remove TL;DR (P6)" || echo "OK: no TL;DR"
echo "Must/shall/requires count: $(grep -ciE "\bmust\b|\bshall\b|\brequires\b" "$ADR")"
echo "(verify each one has a locus in the same paragraph)"
```

---

## Template

```markdown
# ADR <YYYY-MM-DD> — <one-clause title>

Status: Proposal | Drafting | Accepted | Superseded(by: <file>).

Relates to: <parent ADR + sibling ADRs that share scope>.
Iterations: <count if non-trivial; reference rejected versions>.

## §1 Insight (one paragraph max)

The single thing that, once you understand it, makes the rest obvious.

## §2 Decision (code or table, not prose)

Concrete artifact: function signature, type definition, lint rule, deletion list.

## §3 Static guards (P1 enforcement)

| Rule | Locus |
|---|---|
| <what must hold> | <test file:line, lint rule name, CI step name, git hook> |

## §4 What this deletes / adds

delete   ...
add      ...
amend    ...

## §5 Connection to parent ADR

One paragraph connecting this decision to the parent's load-bearing claim.

## §6 References

- Parent ADRs (one line each)
- Related decisions (one line each)
- Code citations (file:line where relevant)
```

---

## Anti-Patterns

| Anti-Pattern | Principle | Fix |
|---|---|---|
| "X must be Y" with no locus | P1 | Name the test file, lint rule, or CI step in the same sentence |
| New field with no consumer | P2 | Name the call site, or mark `// FUTURE — ADR <file>` |
| "5 plugins" (uncited count) | P3 | Add `(find . -name "*.plugin.ts" \| wc -l)` |
| "~2 weeks" with no breakdown | P3 | Decompose: `~2w = Phase A ~3d + Phase B ~4d + Phase C ~3d` |
| No compensating ADR on retirement | P4 | Add `Compensates: <file>` field before committing |
| Abstraction introduced with no dissolution attempt | P5 | Add dissolution paragraph to §1 |
| > 150 lines | P6 | Delete defensive narrative; keep only what can't be derived from code |
| TL;DR section present | P6 | ADR is too long — apply P6 and remove it |

---

## Project Contract

For this skill to catch real problems, your project should:

1. **Define ADR path** — a consistent directory (`docs/adr/`, `decisions/`, `architecture/`) so the git hook glob matches
2. **Install the hard gate** — copy the pre-commit hook above, adapt the glob, make it executable (`chmod +x .git/hooks/pre-commit`)
3. **Document verification commands** in CLAUDE.md — so P1 locus claims are verifiable during ADR review
4. **Link parent ADRs** — every new ADR references at least one prior decision or the rationale for starting fresh
