---
name: constraint-driven-development
description: Constraint-driven development workflow for business logic. Use when adding features, modifying business rules, fixing business bugs, or implementing new domain logic. Enforces RED→GREEN→Why flow.
argument-hint: '[description of the business rule or feature]'
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent
license: MIT
metadata:
  author: LeonTing1010
  version: '2.0.0'
---

# Constraint-Driven Development

When modifying business logic, follow this flow strictly. Do NOT write implementation code before writing the constraint.

**Core insight: tests aren't "verification after the fact" — they ARE the business rules, expressed in executable form.**

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

### Test type decision tree

```
Can express as "∀ input, property P holds"?
  → Property test (strongest — covers infinite inputs)

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

---

## Phase 5: Cross-Domain Impact (when change spans 2+ modules)

If your change touches multiple domains:

1. Check if cross-domain constraints exist for this interaction
2. If not, add a **what-x-what** constraint covering the interaction
3. Verify existing cross-domain tests still pass

Cross-domain interactions are the most dangerous blind spot — a single rule can be correct while two correct rules interacting produce incorrect behavior.

---

## Quick Reference

```
RED:    write test (name = rule, body = verification, classification + Why + audit)
        confirm FAILS
GREEN:  minimum implementation
        confirm PASSES
Why:    add // Why: comment + audit date if external fact
Verify: run all gates
Cross:  check cross-domain impact if 2+ modules affected
```

---

## Project Contract

For this skill to work well, your project should define in CLAUDE.md:

1. **Where business logic lives** (e.g., `packages/domain/src/`, `src/domain/`, `internal/`)
2. **Test framework and tag system** (Vitest tags, Jest docblocks, pytest markers, etc.)
3. **How to run tests by tag** (e.g., `vitest --tagsFilter safety`, `pytest -m safety`)
4. **Verification commands** (typecheck, lint, tests — used in Phase 4)
