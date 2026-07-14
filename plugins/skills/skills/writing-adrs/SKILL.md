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
[ ] P7: §3 split into §3a Constraints (problem) + §3b Tests (solution; TBD allowed)
[ ] P8: if multi-repo, §6 names the workspace verify gate (or marks "adding it is slice 1")
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

## §3a Constraints (what must hold — problem space)

Closed enumeration of invariants the implementation MUST satisfy.
Stable across the implementation; rarely changes once accepted.
Stated in terms of system behavior, NOT test names.

| Constraint | Why it matters |
|---|---|
| <invariant as a problem statement> | <one line: what failure mode breaks if violated> |

## §3b Tests (emergent — solution space)

Initial list of tests that enforce §3a. **MUST be allowed to grow during
implementation** — every slice may discover invariants that weren't
visible at ADR-write time (D3: rules evolve). The post-hoc final test
list, not this draft, is the source of truth.

| Test | Constraint it covers | Verification layer |
|---|---|---|
| <test file:line OR "emergent / TBD"> | <ref to §3a row> | L1 / L2 / L3 / L4 |

**Mark cells `emergent / TBD` when the test shape isn't yet obvious.**
Prefer leaving them blank over inventing a test name that may not survive
implementation. Reviewers should not block on §3b being complete.

## §4 What this deletes / adds

delete   ...
add      ...
amend    ...

## §5 Connection to parent ADR

One paragraph connecting this decision to the parent's load-bearing claim.

## §6 Cross-repo coordination (when applicable)

Required iff the implementation touches more than one repository.

- **ADR keeper**: which repo holds this ADR file. Default: the one whose
  source code is most heavily touched.
- **Peer repos**: list every other repo whose code, docs, or test suite
  changes as part of this ADR.
- **Workspace verify gate**: name the script / CI job that runs all
  peers' tests AND a cross-repo grep for any symbol being deleted /
  renamed. If none exists, **adding one is the first slice** — without
  it the implementation will silently desync across repos.

## §7 References

- Parent ADRs (one line each)
- Related decisions (one line each)
- Code citations (file:line where relevant)
```

---

### P7 — Constraints over Tests (separation of concerns)

§3a (Constraints, problem space) names invariants in plain language —
"the daemon's liveness must not depend on user memory". §3b (Tests,
solution space) names verification mechanisms — `cli_surface_test.ts:I1`.
**Do NOT fix the test names in §3b at ADR-write time** beyond what's
already self-evident. New invariants will surface during implementation
(D3: rules evolve), and inventing test names for them upfront forces
those discoveries to either be retro-fitted into a name that no longer
matches, or ignored ("not in the ADR").

The healthy pattern, observed mid-flight in a real ADR:

```
§3a Constraint: daemon liveness is OS-supervised, not user-managed
§3b Test (at ADR-write time): I7 — popup gates `#dc-host-exited` to lazy mode
                              (suggests an installMode signal must exist)
[mid-implementation discovery: lazy-spawn becomes universal, so
 installMode is no longer a meaningful distinction]
§3b Test (revised): "I7 retired — universal lazy-spawn obsoletes the
                    sandbox-vs-native split"
```

If the ADR couldn't accommodate that revision because I7 was treated as
load-bearing, the implementation would either ship a useless gate or
the ADR would be wrong on file. P7 says: §3a is the contract, §3b is
the best current guess at how to check it.

### P8 — Cross-repo verify scope (when applicable)

Any ADR whose implementation spans 2+ repos must declare a
**workspace-level verify gate** in §6: the script / CI step that runs
every affected repo's testsuite AND a grep for renamed/deleted symbols
across peer repos.

A real failure case this prevents:

> Slice 1 deleted user-facing CLI verb `tap bridge start` in repo `core/`.
> `core/`'s test suite stayed green. A peer repo `public/`'s
> `popup.html` still cited the deleted verb; `public/`'s test caught it
> in CI but not in the editing repo's local verify. Two ADR slices later,
> a separate consumer (`auto-fork.ts`) was also discovered to depend on
> the deleted verb — silent for 6 commits.

The fix: §6 names the script, and the script is invoked as part of
EVERY slice's verify phase, not just the final one.

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
| Test names pinned in §3 with locus pre-specified | P7 | Move to §3b; mark emergent ones `TBD`; let names follow implementation |
| Mixing "must hold" (problem) with "we test this with" (solution) | P7 | Split §3 → §3a Constraints + §3b Tests |
| Cross-repo ADR with no workspace verify story | P8 | §6 names the gate; if none exists, adding one is the FIRST slice |

---

## Project Contract

For this skill to catch real problems, your project should:

1. **Define ADR path** — a consistent directory (`docs/adr/`, `decisions/`, `architecture/`) so the git hook glob matches
2. **Install the hard gate** — copy the pre-commit hook above, adapt the glob, make it executable (`chmod +x .git/hooks/pre-commit`)
3. **Document verification commands** in CLAUDE.md — so P1 locus claims are verifiable during ADR review
4. **Link parent ADRs** — every new ADR references at least one prior decision or the rationale for starting fresh
