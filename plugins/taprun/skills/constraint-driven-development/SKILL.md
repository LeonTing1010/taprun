---
name: constraint-driven-development
description: Constraint-driven development workflow for business logic. Use when adding features, modifying business rules, fixing business bugs, or implementing new domain logic. Enforces RED→GREEN→Why flow.
argument-hint: '[description of the business rule or feature]'
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent
license: MIT
metadata:
  author: LeonTing1010
  version: '3.0.0'
---

# Constraint-Driven Development

When modifying business logic, follow this flow strictly. Do NOT write implementation code before writing the constraint.

**Core insight: tests aren't "verification after the fact" — they ARE the business rules, expressed in executable form.**

## The three say-do-match layers (v3 addition)

Most "done but not really" failures come from three specific gaps. This skill treats them as hard requirements, not suggestions:

1. **RED-adversarial** — the RED test must be written from the perspective of *"what would a half-implementation that still passes this test look like?"*. An affirmative test (*"function exists and returns a value"*) is not a constraint; it's a stub. If you can imagine a shortcut implementation that satisfies the test but breaks real usage, the test is too weak — rewrite it before moving on. (See Phase 1a below.)
2. **SHOW (demo-before-done)** — claiming done requires a user-facing demonstration of the feature, not just green tests. Typecheck + tests passing are necessary but insufficient — *"tests pass"* is a statement about code, *"I demonstrated the feature"* is a statement about behavior. Only the second closes the say-do gap. (See Phase 4b below.)
3. **Post-mortem** — when a real user hits an issue the test suite missed, the fix is not complete until a new RED test has been added that would have caught the issue, AND that test has been traced back to the original gap (*"why did we think we were covered?"*). The fix lands AFTER the test, not before. (See Phase 7 below.)

These three layers close the three say-do failure modes: *claim too soon*, *claim without demo*, *claim without audit*. Skip any one and the discipline collapses — the skill lets an agent declare Done while having done very little.

## Philosophy

```
Business rule → Constraint (test) → Implementation
     ↑                                    |
     └────── never the other way ─────────┘
```

A test name IS the rule declaration. The test body IS the machine verification. If it's not in a test, it's not a rule — it's a wish.

---

## Phase 0: Scope Analysis

Before writing any constraint, understand what exists:

1. **Find existing tests** in the affected module/domain
2. **Check coverage gaps** — is the area you're changing already constrained?
3. **Identify cross-module impact** — does this change span multiple domains?

Based on the gap analysis, decide which NEW constraints to write in Phase 1.

**Skip Phase 0** for single-module changes in well-tested areas.

---

## Phase 1: Constraint Declaration (RED)

Write the constraint FIRST. The test must fail before implementation.

### Structure

```
describe('Rule name (business language)', { classification }, () => {
  // Why: one-line business reason
  it('constraint description (verifiable statement)', () => { ... })
})
```

### Classification

Classify every constraint by **value impact** and **scope**:

**Value impact (what happens when violated):**

| Level | Violated → | Priority | Example |
|-------|-----------|----------|---------|
| **Safety** | Value destroyed (money/data loss) | P0 — blocks release | Pricing error loses revenue |
| **Quality** | Value degraded (UX/experience) | P1 — blocks release | Menu not personalized |
| **Delight** | Extra value missed | P2 — warning only | Can't trace food origin |

**Scope (what it covers):**

| Scope | Meaning | Example |
|-------|---------|---------|
| **what** | Single rule invariant | "price is always positive" |
| **what-x-what** | Cross-domain rule interaction | "refund triggers inventory restore" |
| **audit** | External fact assumption | "tax rate is 9%" |

### How to express classification

Use your test framework's native tagging/categorization:

**Vitest 4 (tags + meta):**
```typescript
describe('Pricing invariants', {
  tags: ['safety', 'what'],
  meta: { priority: 'P0', audit: '2026-Q4' },
}, () => {
  // Why: pricing errors directly lose revenue
  it('∀ ingredient set: totalPrice = sum(components) ± 1 cent', () => { ... })
})
```

**Jest (docblock or custom):**
```typescript
/**
 * @tags safety, what
 * @priority P0
 */
describe('Pricing invariants', () => { ... })
```

**pytest (markers):**
```python
@pytest.mark.safety
@pytest.mark.what
class TestPricingInvariants:
    """Why: pricing errors directly lose revenue"""
    def test_total_price_equals_sum_of_components(self): ...
```

**Go (build tags + test naming):**
```go
//go:build safety
func TestPricing_TotalEqualsSum(t *testing.T) { ... }
```

### Verification ladder — strongest layer first (mandatory)

**Before writing any test, ask: can the type system enforce this?** Tests are weaker than types — they fire at run time, not edit time, and they cover only the inputs the author thought to write. Types fire at every keystroke, on every input, and cannot be bypassed without a deliberate cast.

The ladder, strongest to weakest:

| Layer | Method | Feedback time | Strength | Bypass cost |
|---|---|---|---|---|
| **L1 Type system** | branded types, readonly, discriminated unions, opaque types, never-typed absences | edit time | strongest | requires `as X` cast (visible in diff) |
| **L2 Property test** | `∀ input, property P holds` | save / commit | strong | impossible to satisfy with a wrong impl that handles the random space |
| **L3 Behavioral test** | input → output specific cases | save / commit | medium | half-impl can pass with hardcoded return |
| **L4 Architecture / lint / grep** | structural checks on source text | commit | weak | trivial to obfuscate around |
| **L5 Documentation** | English sentence in CLAUDE.md / ADR | none | weakest | depends on memory |

**Rule 1.** If a stronger layer can express the constraint, the weaker layer is redundant — delete it. Example: "only `materializeRun()` may produce `Run` instances" is L4 (grep for object literals) but is also L1 (`Run` is a branded type; only the helper can forge the brand). Choose L1 and drop the L4 grep.

**Rule 2.** Use type-system idioms idiomatically:
- **Branded / opaque types** for "only this constructor may produce" (e.g. `Run`, `Identifier`, `Validated<T>`)
- **`readonly` fields** for "no mutation outside this module" (replaces grep on `\.field\s*=`)
- **`never`-typed absences** in discriminated unions for "this variant must not have field X" (replaces grep)
- **Phantom type parameters** for "this value carries proof X holds"
- **Const assertions** + `as const` for "this string is one of a finite set"

**Rule 3.** When you DO need L4 (grep), narrow it to the single residual surface the type system can't cover. For branded types this is usually `as <Brand>` casts in non-constructor modules — a 1-line guard, not a "no literals anywhere" guard.

### Test type decision tree (after L1 is exhausted)

```
Type system can encode this? (branded type, readonly, discriminated union)
  → No test needed. Edit-time enforcement.

Can express as "∀ input, property P holds"?
  → Property test (strongest dynamic check — covers infinite inputs)

Describes input → output behavior?
  → Behavioral test (no internal mocking — test the API surface)

"Must call external system"?
  → Mock verification (only verify the call happened, not mock internals)

Otherwise?
  → Probably guaranteed by the type system — no test needed
```

### Forbidden

- **Implementation before constraint** — always RED first
- **Internal mock assertions** — if you need to assert mock parameters to verify behavior, the API design is wrong; fix the API
- **Testing implementation details** — test WHAT the code does, not HOW

Confirm the test **FAILS**, then proceed.

---

## Phase 1a: Adversarial framing (mandatory)

Before you run the test for the first time, stop and write down — in plain prose inside the test file as a comment OR in the PR description — a short paragraph answering:

> *"If an agent half-implemented this feature and still made this test pass, the specific shortcut they could take is ____. This test catches that shortcut because ____."*

If you cannot finish that sentence, **the test is not adversarial enough — rewrite it.**

Common weak-test smells (any one disqualifies the test):

- **Affirmative shape** — *"function exists and returns X"* (type system does that; not a rule)
- **Happy-path only** — uses exactly the input the implementer had in mind; no adversarial variation
- **Mirrored code** — test mimics the implementation's own branching instead of describing externally-observable behavior
- **Self-fulfilling mocks** — the mock returns exactly what the test then asserts
- **Coincidental key match** — test args happen to use the same identifier names as the implementation's local variables (e.g. tap author wrote `examples: [{ id: 'x' }]` and URL `${id}`; test would silently pass even if the substitution engine were broken for the common mismatched case)

The adversarial sentence is a forcing function: writing it out loud exposes when the test is really just "verifying the author's own assumptions."

---

## Phase 2: Minimum Implementation (GREEN)

Implement the minimum code to make the test pass:

1. Write domain/business logic (not glue code, not UI)
2. Use the project's established patterns (error types, validation, state management)
3. Read configuration from config sources (no hardcoding business parameters)
4. Confirm the test **PASSES**

**Resist the urge to refactor or add extras. GREEN means "test passes" — nothing more.**

---

## Phase 3: Why + Audit

Add the business reason as a comment inside the test block:

```
// Why: [business reason] ([source/date if external])
```

If the constraint depends on an external fact (tax rate, regulatory requirement, supplier agreement):
- Add an **audit date** via your framework's metadata (e.g., `meta: { audit: '2026-Q4' }`)
- This marks when the fact should be re-verified against the real world

---

## Phase 4: Verify

Run the project's verification gates (invoke the `verify` skill or run the commands from CLAUDE.md):

```
typecheck    — no type errors introduced
lint         — code style/structure rules
tests        — all existing + new tests pass
architecture — import boundaries, conventions
```

### Phase 4 — Cross-repo verify scope (mandatory when applicable)

**If the change touches any of these published surfaces, Phase 4 MUST also run verify in every repo that consumes them:**

| Touched surface | Cross-repo verify required |
|---|---|
| CLI command added / renamed / **deleted** | every repo that names the command in docs, popups, scripts, or shell-outs |
| Public manifest schema field (browser extension, npm package, etc.) | every repo that reads / writes / validates the field |
| Wire-protocol field name (HTTP API, MCP tool, JSON shape) | every repo that produces or parses it |
| File path or env var that's part of the install contract | every repo that documents or expects the path |
| Build artifact name or location | every consuming pipeline |

**Concrete failure mode this prevents**: a change deletes user-facing CLI verb `foo bar`; the editing repo's tests still pass because they don't grep for the string. A peer repo's popup HTML still cites the deleted verb. Users hit broken instructions. (This exact failure cost a real session 2 silent regressions and 1 Phase-7 cycle.)

**Implementation**: prefer a workspace-level verify script that the editing repo's local gate ALSO invokes — not a CI-only check. Example layout:

```
workspace_root/
├── core/             ← per-repo verify: tests + typecheck
├── public/           ← per-repo verify: tests + typecheck
└── verify.sh         ← invokes both + a cross-repo grep gate for
                       deleted/renamed CLI symbols vs peer-repo references
```

When you can't easily add a workspace gate, fall back to **manual grep at every slice boundary**: `git diff HEAD~1 -- <editing-repo>/<cli-surface-file> | grep -oE '<symbol-pattern>' | uniq | xargs -I{} grep -rn '{}' <peer-repos>/`. Document the grep in the commit message so future contributors know to repeat it.

### Phase 4 — Verify pyramid before declaring done

Run gates strongest-to-weakest. If any earlier gate fails, fix and re-run from the failed gate forward — don't skip ahead.

```
1. typecheck (L1)        — no type errors
2. unit / property tests — local-repo's testsuite, all green
3. architecture tests    — L4 grep gates on the editing repo
4. cross-repo grep       — when applicable per the table above
5. peer-repo testsuite   — when applicable per the table above
6. demo (Phase 4b)       — operational behavior matches the claim
```

A green editing-repo testsuite is NOT sufficient when steps 4 and 5 are applicable. Skipping them is the canonical "claim too soon" failure (Phase 1a category).

---

## Phase 4b: SHOW (demo-before-done, mandatory)

**A green test suite is not a demonstration.** Before claiming the feature is Done, you MUST produce one of the following and include it in the final report:

- **CLI/stdio feature** → a stdin-to-stdout transcript showing the feature exercised end-to-end, with the observable output matching the claim (e.g. before/after counts, new tool appearing in `tools/list`, notification firing)
- **HTTP/API feature** → a `curl` request + the response body (or screenshot of the network tab) showing the advertised behavior
- **UI/frontend feature** → a screenshot or screen recording of the UI in the new state
- **Batch/data pipeline** → a before/after diff of the output artifact (counts, shape, sample rows)

**The report must say: *"I demonstrated X by running Y and observed Z."*** If it only says *"tests pass"*, the demo gate is not cleared and the feature is not Done.

The point is operational: "tests pass" talks about the code; "I ran it and saw the output" talks about the behavior. Only the second closes the say-do gap. This is non-negotiable because without it, CDD degrades into "half-implement, write a weak test, claim done" — the exact failure mode this workflow exists to prevent.

**When the demo surprises you** (output differs from what you predicted) — do NOT silently adjust the claim to match the output. Stop, reopen Phase 1: what invariant did you miss? Add the missing constraint as a RED test BEFORE moving on.

---

## Phase 5: Cross-Domain Impact (when change spans 2+ modules)

If your change touches multiple domains:

1. Check if cross-domain constraints exist for this interaction
2. If not, add a **what-x-what** constraint covering the interaction
3. Verify existing cross-domain tests still pass

Cross-domain interactions are the most dangerous blind spot — a single rule can be correct while two correct rules interacting produce incorrect behavior.

---

## Phase 7: Post-mortem (mandatory when a claimed-done feature breaks in real use)

If a real user or integration catches a bug in a feature that previously passed CDD, **treat the test suite itself as the root cause, not just the code**. The code bug is symptomatic; the deeper bug is that the constraints failed to describe reality.

Required sequence — in this order, no shortcuts:

1. **Reproduce the failure as a failing test** (a new RED) — before touching any implementation code. The test must use the exact input shape from the real-world failure. If you can't reproduce it as a test, you don't understand it yet.
2. **Audit the original test** — *why did it pass when the behavior was broken?* Write the answer into the PR/commit message. Common root causes:
   - The original RED wasn't adversarial (Phase 1a was skipped or weak)
   - The demo was a happy-path demo only (Phase 4b was narrow)
   - A new code path was added later without new constraints (the scope drifted past the original coverage)
3. **Fix the implementation** — only after steps 1 and 2. The new RED must GREEN.
4. **Generalize the test** — does the original constraint need to be strengthened, or is this a new invariant class? If a class, extend the test file to cover adjacent cases likely to break the same way.

**The commit order is: new RED test → audit note → fix → generalization.** Do NOT squash these into one commit — each step should be readable in `git log` as its own learning.

Post-mortem is the layer that makes CDD *evolve*. Without it, the test suite freezes at the level of the author's original imagination, and real-world failure modes accumulate in code review scars instead of executable rules.

---

## Quick Reference

```
Phase 0   scope analysis (skip if single-module, well-tested)
Phase 1   RED     — write failing test
Phase 1a ADVERSARIAL — write the "half-implementation shortcut" sentence
                      reject affirmative / mirrored / self-fulfilling tests
Phase 2   GREEN   — minimum implementation
Phase 3   Why     — business reason + audit date
Phase 4   Verify  — typecheck, lint, tests, architecture
Phase 4b  SHOW    — stdin/stdout, curl, screenshot, or data diff
                    "I ran X and observed Y" > "tests pass"
Phase 5   Cross   — cross-domain interaction check (if 2+ modules)
Phase 7   Post-mortem (triggered when real-world failure bypasses the suite)
          new RED → audit why original missed → fix → generalize
```

The three failure modes CDD v3 rejects by construction:
- *Claim too soon* — blocked by Phase 1a (adversarial sentence)
- *Claim without demo* — blocked by Phase 4b (SHOW)
- *Claim without learning* — blocked by Phase 7 (post-mortem as first-class phase)

---

## Project Contract

For this skill to work well, your project should define in CLAUDE.md:

1. **Where business logic lives** (e.g., `packages/domain/src/`, `src/domain/`, `internal/`)
2. **Test framework and tag system** (Vitest tags, Jest docblocks, pytest markers, etc.)
3. **How to run tests by tag** (e.g., `vitest --tagsFilter safety`, `pytest -m safety`)
4. **Verification commands** (typecheck, lint, tests — used in Phase 4)
