---
name: engineering-philosophy
description: First-principles framework for architecture decisions and product tradeoffs / 架构决策 / 产品取舍 / 技术选型 / 该不该做这个功能 / refactor or rewrite / should we adopt X. Apply when the user asks to evaluate an architectural choice, judge whether a feature is worth building, decide between competing designs, analyze why something keeps breaking, or reason from fundamentals instead of pattern-matching a known solution. Derives answers from 12 technology-independent facts (domain, executors, representation, time) using two eternal principles and The Algorithm (Question → Delete → Simplify → Accelerate → Automate).
---

# Engineering Philosophy — Index Card

A first-principles lens for reasoning about architecture decisions and product tradeoffs in the LLM era. Use it to **derive** answers, not pattern-match to best practices.

## Core levers (always in context)

**Two eternal principles** — never negotiable:
1. Correctness must not depend on any single entity → cross-verify
2. Correctness has a shelf life → external audit

**Two decision standards** — apply when introducing any practice, tool, or abstraction:
1. Make violations difficult, don't rely on memory
2. Reduce artifacts that need syncing, don't add more

**The Algorithm** — run in order, never skip ahead:

```
① Question   — Does this need to exist at all?
② Delete     — Remove compensation mechanisms no longer needed.
               Test: if you don't need to add back ≥10% of what you deleted,
               you didn't delete enough.
③ Simplify   — Polish what survives deletion.
④ Accelerate — Push feedback to the earliest possible layer
               (edit > save > commit > CI).
⑤ Automate   — Only after ①-④. Automating something that shouldn't exist
               only amplifies the error.
```

> **The most dangerous error: optimizing something that shouldn't exist.**
> Always run ①② before proposing to add.

---

## Two lenses

The user's decisions generally fall into one of two classes. Identify which lens applies, then work through its passes in order.

### Lens A — Product tradeoffs
*"Should we build X?" / "Keep or kill?" / "是不是需要这个功能" / "值不值得做"*

**A1. Value delta (§9)** — is there a concrete user state change?

> **Value = the change in user state from "has problem" to "problem solved."**

If no delta, it's waste regardless of execution quality. Trigger Step ② Delete.

**A2. Evidence class (§10 Value Discovery)** — where does the signal come from?

| Signal | Source | Value |
|---|---|---|
| **Near-miss failure** | Boundary probe — system almost succeeds | **Highest** — thin layer away from big win |
| **3+ repetition** | Pattern extraction | High — extract only after 3, never at 2 |
| **Real pain + existing solution** | Dependency probe | Glue code, not new dependency |
| Speculation / "might be useful" | None | **Delete the impulse** — accidental complexity |

**Rule: the pain point is always real; the proposed solution is often wrong.** Separate discovering the need from evaluating the fix.

**A3. Constraint layer (§9)** — Safety / Quality / Delight

| Layer | Violated → | Verification |
|---|---|---|
| **Safety** | Value destroyed (pricing error, expired data) | Property test (strongest) |
| **Quality** | Value degraded (not personalized, slow) | Behavioral test |
| **Delight** | Extra value missed | Behavioral test (optional) |

Build order is **logical dependency**, not priority: Safety → Quality → Delight. If Safety fails, Quality and Delight are meaningless.

---

### Lens B — Architecture decisions
*"Should we adopt approach X?" / "Is this the right design?" / "Refactor or rewrite?" / "Why does this keep breaking?"*

**B1. Name the fact(s) (§2)** — which of the 12 technology-independent facts drives the problem?

| Dimension | Facts |
|---|---|
| **Domain** (D1-D3) | rules interact combinatorially / not all rules are known / rules evolve |
| **Executors** (A1-A3) | human memory limited (~7 items) / LLM probabilistic / machine checks only what it's told |
| **Representation** (R1-R3) | every conversion loses info / copies drift / formal is precise but inexpressive |
| **Time** (T1-T3) | world changes externally / correctness has a shelf life / system can't detect its own staleness |

**Naming the fact is half the answer.** "We keep forgetting to update the tax rate" → T2+T3+A1 → fix is **temporal audit**, not more docs.

**B2. Verification ladder (§3.5)** — which layer enforces the invariant?

| Level | Method | Feedback time | Strength |
|---|---|---|---|
| 1 | Type system | Edit-time | Strongest — cannot bypass |
| 2 | Unit / property tests | Save/commit | Strong |
| 3 | AST / static analysis | Commit | Medium |
| 4 | grep / string match | Commit | Weak — prevents deletion only |
| 5 | Documentation | N/A | Weakest — depends on memory |

- **Rule 1:** If a stronger layer covers an invariant, the weaker layer is redundant — delete it (Standard 2).
- **Rule 2:** grep scripts are technical debt IOUs. Before writing one, ask whether the **compiler / linter / ORM / test framework** has a native way (§3.6 Toolchain Completeness). The answer is almost always yes.

**B3. Structural isomorphism (§4)** — has this structural problem been solved in another domain?

```
① Abstract    — strip domain terms, extract pure structure
                (e.g. "M × N fully-connected coupling")
② Search      — is there a known solution elsewhere?
                (e.g. LSP for editor × language)
③ Transplant  — re-express in the current domain
④ Verify      — bidirectional mapping? premises hold?
                any new constraints invalidate it?
```

**Step ④ is critical.** False analogies give false confidence in wrong solutions. Check: is the mapping bidirectional? Do the premises hold in the new domain? Are there new constraints (e.g. CAP theorem for distributed ACID)?

---

## When to go deeper

Read `philosophy.md` in this directory for:

- **§3** Derivations — three complexity types, four core needs, knowledge lifecycle (①Tacit → ②Explicit → ③Constraint → ④Machine-guarded → ⑤Expired → back to ②)
- **§6** Domain complexity governance — LLM's role in cross-domain rule discovery, dark-matter probing
- **§7** Temporal complexity governance — invariant priority (P0 financial / P1 state / P2 data), temporal audit mechanisms
- **§8** Full Algorithm — all five steps, Core Warning, automation rules
- **§9** Value-driven decomposition — five dimensions of business logic (What / What×What / Why / When / How), Safety/Quality/Delight taxonomy, completeness limits
- **§10** Value Discovery — full tables for boundary probing, pattern extraction, dependency probe, discovery triggers
- **§11** What the framework can / cannot guarantee (completeness is unreachable but approachable)

---

## Output shape when applying this skill

Structure analysis as:

1. **Lens** — product tradeoff (A) or architecture decision (B)?
2. **For A:** value delta? evidence class? constraint layer?
   **For B:** which fact(s) (D/A/R/T codes)? which verification layer? structural analogy?
3. **Algorithm check** — is there something to question or delete before adding?
4. **Proposed action** — expressed at the strongest verification layer available
5. **Residual risk** — what this analysis cannot guarantee (§11 limits)

**Don't pattern-match to best practices. Derive.** The framework exists so that answers are traceable back to the 12 facts and two eternal principles — not recalled from memory.
