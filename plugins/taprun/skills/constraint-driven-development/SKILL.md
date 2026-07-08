---
name: constraint-driven-development
description: Constraint-driven development workflow for business logic. Use when adding features, modifying business rules, fixing business bugs, or implementing new domain logic. Enforces RED→GREEN→Why flow.
argument-hint: '[description of the business rule or feature]'
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent
license: MIT
metadata:
  author: LeonTing1010
  version: '3.2.0'
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

## The three grounding gaps (v3.2 addition)

The v3 layers close *say-do* gaps (you claimed more than you did). v3.2 closes the deeper *spec-truth* gaps — the ways a **fully green, honestly-demoed** feature is still wrong because the constraint set itself doesn't correspond to the truth. Correctness is not a property of the code; it is a **relation between the code and an intent that lives outside the code**. A test is only ever as good as its grip on that external referent. Three ways the grip fails:

1. **Unformalizable referent** — the thing you're checking *correct against* is a human judgment or an unhappened reality (*"is this the report the user wanted?"*), not a formal fact. A weak test here is not a weak guarantee — it is **false precision**: a green check that disguises a human judgment as a machine fact, which is *worse* than no test. Fix: **triage formalizability before entering the ladder** (Phase 1, pre-step) and route unformalizable referents to an explicit L0 human/reality gate instead of faking a test.
2. **Co-authored spec** — the constraint and the implementation were written by the *same* context, so they can encode the same wrong assumption and agree with each other all the way to production. Phase 1b anchors the *inputs* to reality; v3.2 extends independence to the *constraint author* (Phase 1b, author-independence). If generation is free, a second independent context is cheap — use it.
3. **Missing constraint** — the bug lives in the property you never thought to write. Phase 1a catches *weak tests of known properties* with a mental sentence; it does not catch *unknown properties*. Fix: a **mechanical completeness gate** — mutation testing — that makes a machine, not the author's imagination, hunt for the wrong implementation that survives your whole constraint set (Phase 4, mutation gate).

The through-line: every verification tool checks the artifact against a referent *you supplied*; none can supply it for you. These three gaps are the three ways the supplied referent fails to be complete, independent, and real.

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

### Phase 1 pre-step: Formalizability triage (mandatory)

**Before you reach for the ladder, decide whether a test can mean anything at all.** The ladder below assumes a constraint that *can* climb toward the type system. But some constraints check against a referent that is **not a formal fact** — a human judgment, a taste call, an unhappened reality (*"is this the right report", "does this read naturally", "is this the layout the user wanted"*). Writing an L2/L3 test for such a referent produces **false precision**: a green check that launders a human judgment into a machine fact. That is *worse* than no test, because it *feels* like proof.

Ask: **is the thing this constraint is correct-against a formal object, or a human/real-world judgment?**

- **Formal referent** (money must balance, auth must not leak, state machine must not enter an illegal transition, output must be a permutation of input) → enter the ladder, push toward L1. These are provable-in-principle; under-specifying them is *negligence*.
- **Human / real-world referent** (aesthetic, contextual, "is this what they meant") → **do NOT write a test**. Route to the **L0 gate** below. Trying to formalize the unformalizable is *waste* and produces false precision.

Most real features are **a formalizable core wrapped in an unformalizable shell** (the money must balance / the invoice must *look right*). Draw the boundary explicitly and put each constraint on the correct side. Mis-locating this boundary — unit-testing your way through a taste question, or hand-waving a core you could have proven — is the most common and most expensive CDD failure.

**L0 — Human / reality gate** (the bottom of the ladder; the honest terminal for unformalizable referents):

> Instead of a test, register a **named judge + a re-check cadence + the observable they look at**. Example: `// L0-judgment: <who> reviews <what observable> every <cadence>; last-ok <date>`. The demo in Phase 4b is the *evidence* for this gate, but the *verdict* is a human's, not the agent's — the report must name the human and what they will look at, not assert "looks good".

An L0 constraint is a first-class constraint, not an escape hatch: it is *declared*, *assigned*, and *re-checked* — it just has a human oracle instead of a machine one. What it must never do is masquerade as an L2/L3 test.

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
| **L0 Human / reality gate** | named judge reviews a named observable on a cadence | out-of-band | *off-axis* | referent is not formal — no machine can hold it |

**L0 is not "stronger than L1".** It sits *off* the mechanical strength axis. You reach it by the Phase-1 **triage** (the referent is a human/real-world judgment), not by ranking — it is the honest terminal for constraints no test can hold, never a fallback for constraints you were too lazy to formalize. If a formal referent exists, L0 is the *wrong* choice; if it doesn't, L1–L5 are all false precision.

**Rule 1.** If a stronger layer can express the constraint, the weaker layer is redundant — delete it. Example: "only `materializeRun()` may produce `Run` instances" is L4 (grep for object literals) but is also L1 (`Run` is a branded type; only the helper can forge the brand). Choose L1 and drop the L4 grep.

**Rule 2.** Use type-system idioms idiomatically:
- **Branded / opaque types** for "only this constructor may produce" (e.g. `Run`, `Identifier`, `Validated<T>`)
- **`readonly` fields** for "no mutation outside this module" (replaces grep on `\.field\s*=`)
- **`never`-typed absences** in discriminated unions for "this variant must not have field X" (replaces grep)
- **Phantom type parameters** for "this value carries proof X holds"
- **Const assertions** + `as const` for "this string is one of a finite set"

**Rule 3.** When you DO need L4 (grep), narrow it to the single residual surface the type system can't cover. For branded types this is usually `as <Brand>` casts in non-constructor modules — a 1-line guard, not a "no literals anywhere" guard.

**Rule 4 — weight the choice by churn, don't blindly max strength.** "Strongest layer first" is the default, not an absolute. The strongest encoding (a bespoke L1 type, or a heavy proof-shaped invariant) is also the most **change-fragile**: every rule edit must re-satisfy it. So weight the rung by *value impact × volatility*:
- **Stable + Safety** (an invariant that rarely changes and destroys value when violated — money conservation, auth) → push to L1. The encoding cost amortizes; fragility is a feature (it *should* scream when touched).
- **Volatile + Quality/Delight** (an experimental rule, an A/B pricing tweak, a heuristic still being tuned) → L2/L3 is *correct*, not lazy. Encoding a churning rule into the type system means every experiment fights the compiler; the cheapest-to-move oracle that still catches the violation wins. Over-encoding volatile logic is its own failure mode — it taxes exactly the code that changes most.

The rule of thumb: **encode at the highest rung whose fragility you can afford at this code's churn rate.**

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

## Phase 1b: Ground-truth anchor (independence — mandatory at external boundaries)

Phase 1a makes the test adversarial, but the test's *inputs* are still authored by the same agent that will write the implementation. When the constraint concerns a boundary with something the agent did **not** invent — a real API response shape, a real error string, a real DOM, a real file format, a real wire message — a hand-typed synthetic input only proves the agent's belief is *self-consistent*, never that it *matches reality*. The test and the impl can both encode the same wrong assumption and agree with each other all the way to production.

> **Rule: at an external boundary, the RED must be anchored to a captured real sample (a golden fixture), not a hand-typed synthetic.**

- Capture one real instance (an actual recorded response / trace / DOM / file), freeze it as a fixture checked into the repo, and assert against THAT.
- The fixture's provenance is part of the constraint: note where it came from and when (a real run, a recorded session, a vendor doc) so a later reader can re-capture it.
- This is the *proactive* form of Phase 7's "reproduce with the exact real-world input shape" — do it at authoring time for boundary constraints, not only after a user hits the bug.

**The failure this prevents (the independence hole):** a nav-error classifier's unit test fed an error string the author hand-wrote *already carrying the expected prefix*. Every test was green — but nothing proved the real host actually emits that prefix. Had production reality differed by one byte, the suite would have stayed green and the misclassification shipped. The fix: a golden fixture frozen from a real captured failure, so the assertion anchors to a byte the agent did not invent.

A constraint whose every input was hand-authored by the implementer is below the **independence** line — it is a self-check, not an oracle.

### Phase 1b (continued): author independence — the constraint, not just its inputs

Phase 1b so far anchors the *inputs*. But the **constraint logic itself** is normally written by the same context that will write the implementation — and Phase 1a's adversarial sentence is *self*-adversarial (the same mind imagining its own shortcut). If an agent can hallucinate an implementation, it can hallucinate a *matching* spec: both encode the same wrong assumption and agree with each other all the way to production. Phase 1a narrows this hole; it does not close it.

**When generation is free, a second independent context is cheap — spend it on independence:**

- **Split spec-author from impl-author.** One context reads only the requirement, writes and freezes the RED (plus the Phase-1b fixture), and **never sees the implementation**. A second context is allowed only to make the frozen RED go green. The oracle and the thing-under-test now have different authors.
- **Add a red-team pass (strongest form).** A third context's *only* job: **write an implementation that passes every RED but is wrong in real use.** If it succeeds, it has just handed you a missing constraint for free — turn its wrong-but-passing impl into a new RED (this is the mechanized form of Phase 1a's sentence: an *external* adversary instead of an imagined one).

Escalate by value impact: **Safety / what-x-what constraints should clear at least the split-author bar; a red-team pass is warranted when a violation destroys value irreversibly.** Delight-level constraints don't need it. The point is structural: an oracle authored by the thing it judges is a self-consistency check, not an independent one — and independence is the only thing that turns "the spec and the code agree" into evidence rather than tautology.

---

## Phase 2: Minimum Implementation (GREEN)

Implement the minimum code to make the test pass:

1. Write domain/business logic (not glue code, not UI)
2. Use the project's established patterns (error types, validation, state management)
3. Read configuration from config sources (no hardcoding business parameters)
4. Confirm the test **PASSES**

**Resist the urge to refactor or add extras. GREEN means "test passes" — nothing more.**

### Eyeball the shrunk counterexample (mis-specification catch)

When a property test (L2) fails and your framework **shrinks** to a minimal counterexample, do not reflexively "fix the code to make it pass". **Look at the witness first.** A property and a concrete example have complementary failure modes — the property over-reaches in ways a specific case exposes. Ask: *"is this counterexample actually a bug, or is my property too strong?"*

- Genuine bug → fix the implementation (normal GREEN).
- The counterexample is *acceptable behavior* → your **property is mis-specified** (Phase 1a's mirror image: not a weak test, but an over-strong one). Weaken/correct the property before writing any implementation code. Do NOT special-case the implementation to dodge a witness that was actually fine — that hard-codes your mis-specification into the code.

This is the spec × example triangulation in practice: the property behaves like a spec, the shrunk witness behaves like an eyeball-able example, and their disagreement localizes *which one is wrong*. Skipping the eyeball step silently resolves every disagreement in favor of the (possibly wrong) property.

---

## Phase 3: Why + Audit

Add the business reason as a comment inside the test block:

```
// Why: [business reason] ([source/date if external])
```

If the constraint depends on an external fact (tax rate, regulatory requirement, supplier agreement):
- Add an **audit date** via your framework's metadata (e.g., `meta: { audit: '2026-Q4' }`)
- This marks when the fact should be re-verified against the real world

### Validity envelope (not just an audit date)

An audit date says *"re-check this fact"*. It does **not** catch the more dangerous case: the fact is unchanged but the **assumptions the constraint silently relies on** stop holding because the *system* moved. A constraint is only correct **inside an operating envelope** — an input range, a precondition, a load regime it was written for. When execution moves outside that envelope, a green check is a proof about a world that is no longer this one.

> **The Ariane 5 failure mode:** the guidance spec was reused from Ariane 4 and was *correct* — for Ariane 4's flight envelope. Ariane 5's higher horizontal velocity overflowed a 64→16-bit conversion the spec had *proven safe under the old envelope*. The fact didn't change; the world outgrew the assumption.

For any constraint carrying a non-trivial assumption, record the envelope alongside the Why, and **make leaving the envelope a signal, not a silent pass**:
- Note the assumed range/precondition: `// Envelope: assumes qty ≤ 10_000 and single-currency; outside → constraint is void, not satisfied`.
- Where cheap, encode the envelope as a runtime guard/assertion that **fails loudly** when violated, rather than letting downstream logic run on an out-of-envelope input under a still-green suite.
- A branded/refined type that makes out-of-envelope inputs *unrepresentable* (L1) is the strongest form — it turns "we left the envelope" from a runtime surprise into a compile error.

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
3. mutation gate         — Safety / what-x-what constraints: no surviving mutants (see below)
4. architecture tests    — L4 grep gates on the editing repo
5. cross-repo grep       — when applicable per the table above
6. peer-repo testsuite   — when applicable per the table above
7. demo (Phase 4b)       — operational behavior matches the claim
```

A green editing-repo testsuite is NOT sufficient when steps 5 and 6 are applicable. Skipping them is the canonical "claim too soon" failure (Phase 1a category).

### Phase 4 — Mutation gate (completeness, mechanized)

A green suite proves *your* tests pass their *own* inputs. It says nothing about the constraint you **forgot to write** — and the dominant real-world failure is exactly that missing property (the bug lives where you never looked; the green check is loud about what you specified and silent about what you didn't). Phase 1a hunts the surviving wrong-implementation with a *mental* sentence. The **mutation gate makes a machine hunt it instead.**

> **Mechanize Phase 1a: mutate the implementation (flip a conditional, delete a branch, change a constant, swap a boundary), and check that *some* constraint kills each mutant.** A **surviving mutant** is a wrong implementation your entire constraint set accepts — i.e. a hole in the *constraints*, not in line coverage. Fix it by adding the RED that kills it, not by chasing a coverage number.

- **Tools:** Stryker (TS/JS), mutmut / cosmic-ray (Python), PIT (JVM), `cargo-mutants` (Rust).
- **Scope it — do not run it on everything.** Gate **Safety** and **what-x-what** constraints (where a missing property destroys or corrupts value). Quality/Delight logic rarely earns the runtime cost. Mutation testing is slow; target it, don't carpet it.
- **A surviving mutant on a Safety path blocks release** the same way a failing test does — it is a named, reproducible missing constraint, not a warning.

This is the proactive, mechanical form of Phase 7's post-mortem: instead of waiting for a real user to find the implementation your constraints failed to reject, a mutant *is* that implementation, found in CI.

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

**When the interaction is stateful, ordered, or concurrent** (refund-vs-restock race, retry-vs-idempotency, event ordering, two writers on one aggregate), a single what-x-what *point* test checks one interleaving out of many and passes by luck of ordering. The right tool is a **schedule-exploring check**: make the interaction deterministic (funnel time / randomness / ordering through one seed), then let the runner explore many interleavings against an invariant — the deterministic-simulation form of a property test. Even a lightweight version (a seeded loop that shuffles the operation order and re-asserts the invariant each time, dumping the seed on failure) catches the ordering-dependent bug a fixed-sequence test structurally cannot. Reserve this for stateful interactions where a wrong interleaving destroys value; a pure functional what-x-what does not need it.

---

## Phase 6: Abstraction review (mandatory at every 3rd similar slice)

**CDD's rhythm of "one constraint at a time" suppresses the reflex to refactor when you see the third copy of a pattern.** Apply this trigger as a hard rule:

> **Every time you write a 3rd similar function / file / dispatch case in the same module, stop and run a 5-minute abstraction review.**

Procedure:

1. **Name the structural commonality**. Strip domain terms: what's the shared shape? Often it's a 4-line skeleton like "read input → compute output → resolve path → write iff different".
2. **Search for the existing pattern** (B3 structural isomorphism). Is this the **Service Installer** / **Driver** / **Strategy** / **Visitor** pattern? It almost always is.
3. **Compute the deletion delta**. Drafted-as-3-functions: total LOC X, with ~70% boilerplate. Drafted-as-1-interface-+-3-records: total LOC Y. If Y < 0.7 × X, refactor.
4. **Apply Step ②**: if you refactor, the deletion criterion says you must NOT need to add back ≥10% of what you deleted. Cross-check.

**Worked failure mode this prevents** (real session, 2026-05-13):
- Slice 2a wrote `writeLaunchAgentPlist` (~80 LOC)
- Slice 2b wrote `writeSystemdUserService` (~85 LOC)
- Slice 2c wrote `detectChromeSandbox` (~60 LOC)
- Slice 2d wrote `activateService` (~140 LOC)
- All five share the same skeleton (read opts → compute string → resolve path → write/exec idempotently). 
- The right move was to stop after Slice 2b and extract a `ServiceInstaller` interface + 3 records, saving ~150 LOC and making Windows support a single new record. Instead, by the time Slice 2d landed, deduplicating was a separate refactor that never happened.

**Why this is its own phase, not a Phase 2 sub-step**: GREEN minimum-implementation pushes you to make ONE thing pass. The pattern only becomes visible after the 3rd repetition; embedding the check in Phase 2 would be premature most of the time. Phase 6 fires only when the signal is real.

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
          + cross-repo: list all peer repos that consume the surface you're touching
Phase 1   TRIAGE  — is the referent FORMAL or a HUMAN/reality judgment?
                    human → L0 gate (named judge + cadence), NOT a test (false precision)
          RED     — formal referent: write failing test
                    BEFORE the test, ask: "can the type system enforce this?" (L1 > L2)
                    weight the rung by churn: don't over-encode volatile rules
Phase 1a ADVERSARIAL — write the "half-implementation shortcut" sentence
                      reject affirmative / mirrored / self-fulfilling tests
Phase 1b ANCHOR   — external boundary: RED input = captured real fixture (not synthetic)
          INDEPENDENCE — Safety/what-x-what: spec-author ≠ impl-author;
                         red-team pass when a violation is irreversible
Phase 2   GREEN   — minimum implementation
          eyeball the shrunk counterexample: bug, or over-strong property?
Phase 3   Why     — business reason + audit date + validity envelope (assumed range)
Phase 4   Verify  — typecheck, tests, MUTATION gate (Safety/what-x-what), architecture
                    + cross-repo: peer-repo testsuites + grep gate when applicable
Phase 4b  SHOW    — stdin/stdout, curl, screenshot, or data diff
                    "I ran X and observed Y" > "tests pass"
Phase 5   Cross   — cross-domain interaction check (if 2+ modules)
Phase 6   Abstraction review (triggered at every 3rd similar slice in the same file)
          name shared shape → search known pattern → compute delete delta → maybe refactor
Phase 7   Post-mortem (triggered when real-world failure bypasses the suite)
          new RED → audit why original missed → fix → generalize
```

The failure modes CDD rejects by construction:
- *Claim too soon* — blocked by Phase 1a (adversarial sentence)
- *Claim on imagined inputs* — blocked by Phase 1b (ground-truth anchor at external boundaries)
- *Claim via a co-authored spec* — blocked by Phase 1b (author independence: spec-author ≠ impl-author + red-team)
- *Claim with false precision* — blocked by Phase 1 triage (unformalizable referent → L0 human gate, not a fake test)
- *Claim on an incomplete constraint set* — blocked by Phase 4 mutation gate (a machine hunts the surviving wrong impl)
- *Claim outside the envelope* — blocked by Phase 3 validity envelope (leaving the assumed range signals, not silently passes)
- *Claim without demo* — blocked by Phase 4b (SHOW)
- *Claim without cross-repo verify* — blocked by Phase 4 (peer-repo gate + grep)
- *Claim with hidden duplication* — blocked by Phase 6 (3rd-repetition abstraction review)
- *Claim without learning* — blocked by Phase 7 (post-mortem as first-class phase)

### L1-before-test reflex (Phase 1 strengthening)

Before writing ANY test, ask: **"is there a way for this invariant to be unrepresentable in the type system, generated from a single source, or derived at build time?"**

Concrete examples where L1 beats L2:

| Tempting test | Better answer |
|---|---|
| "Constant X must equal derivation of file Y" | Generate X from Y at build time. Drift is unrepresentable; no test needed. |
| "Field F never appears outside module M" | Brand the type so only M can construct it. `as F` casts become the only escape — grep for those, not for F. |
| "Function returns one of N values" | Make the return type `"a" | "b" | "c"`. Exhaustiveness checking catches missing branches. |
| "Field X requires field Y" | Discriminated union with `Y?: never` on the variant that lacks X. |
| "Modules A and B agree on a shape" | Export the type from one; import in the other. `ReturnType<typeof f>` for derived shapes. |

**Real failure case (2026-05-13)**: a hand-maintained `EXTENSION_ID_PINNED` constant was kept in sync with a separate `manifest.json` `"key"` field via a unit test (L2). The right answer was a 20-line `scripts/gen-extension-id.ts` that read `manifest.json` at build time and emitted the constant. The test would have been deleted; drift would have been unrepresentable.

---

## Project Contract

For this skill to work well, your project should define in CLAUDE.md:

1. **Where business logic lives** (e.g., `packages/domain/src/`, `src/domain/`, `internal/`)
2. **Test framework and tag system** (Vitest tags, Jest docblocks, pytest markers, etc.)
3. **How to run tests by tag** (e.g., `vitest --tagsFilter safety`, `pytest -m safety`)
4. **Verification commands** (typecheck, lint, tests — used in Phase 4)
5. **Mutation-test command + scope** (e.g., `stryker run` / `mutmut run`, restricted to Safety-tagged modules — used in the Phase 4 mutation gate; omit if the project opts out)
