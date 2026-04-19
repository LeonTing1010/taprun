---
name: demand-stream-run
description: Run the agent-driven weekly demand mining stream pipeline — sweep/classify/state verbs over persistent themes.json + classifications.jsonl registries. TRIGGER on "跑 demand mining", "mine demand for W<NN>", "需求挖掘第 N 周", "run the stream pipeline", "weekly demand session". NOT for one-off market probes — that's demand-archaeologist. NOT for ad-hoc Reddit searches — that's the Tap reddit taps directly. Use this skill only when the user wants to iterate the stream pipeline at ~/.tap/demand-archive/stream/ for a specific ISO week.
argument-hint: '[week=2026-W<NN>] [budget=searches]'
license: MIT
metadata:
  author: LeonTing1010
  version: '1.0.0'
---

# Demand Stream Run

Weekly demand-mining session over `~/.tap/demand-archive/stream/`. Agent-driven — you (Claude) call three stable verbs and make judgments between them. **You do not write per-round scripts.**

---

## Before you start

1. **Read `~/.tap/demand-archive/stream/PLAYBOOK.md`** — it's authoritative. This SKILL file is orientation only.
2. **Confirm the ISO week** with the user if not specified. Default = current ISO week.
3. **Do NOT re-run a completed week** — check `sessions/<WEEK>/final.json` first. Re-runs waste budget and duplicate data.

---

## The three verbs (from `~/.tap/demand-archive/stream/agent-tools.ts`)

```ts
import { openSession, sweep, classify, state } from "./agent-tools.ts";
import { expansionQueries, SWEEP_QUERIES, type Query } from "./search.ts";
import { runSeed } from "./seed.ts";

const s = openSession("2026-W<NN>");
```

| Verb | What it does | When to call |
|---|---|---|
| `sweep(queries, session, round)` | Fetches + dedupes + appends docs, detects new events, appends to `events.jsonl` via `eventKey` | Each round — initial sweep + each expansion |
| `classify(rules, session?)` | Appends to global `classifications.jsonl` ledger, upserts theme assignments in global `themes.json` | After each sweep, for each new `(canonical, pattern_label)` seen |
| `state(session)` | Returns `{ complete, near, far, abandoned }` clusters with gate results | Before deciding what to expand; at end of session |

**The global registries (`themes.json`, `classifications.jsonl`) carry across weeks.** Prior sessions' judgments auto-apply to matching canonicals — you only classify *new* `(canonical, pattern_label)` pairs.

---

## The loop

```
Round 0 + 1: runSeed(0) + sweep(SWEEP_QUERIES wrapped as {platform:"sweep", …})
           ↓
Classify new (canonical, pattern_label) pairs — batch one classify() call
           ↓
state() → read {complete, near, far}
           ↓
For each near cluster (up to 3 rounds):
  qs = expansionQueries(cluster)      ← deterministic default
  review qs → override if display is regex debris
  sweep(qs, s, round)
  classify new rules
  state()
           ↓
Terminate when near.length === 0, or round ≥ 3, or budget ≥ 200 searches.
```

---

## Decisions you make (and what they look like)

| Decision | You do | You do NOT |
|---|---|---|
| Is this event valid? | `classify([{canonical, pattern_label, valid:true, reason, theme}])` | Edit `events.jsonl` or maintain an inline `VALID_CANON` set |
| Which theme does a canonical belong to? | Pass `theme:` in the classify rule | Edit `themes.json` by hand |
| Expand or skip a near cluster? | Read `c.gate.missing`, call `sweep(expansionQueries(c), s, round)` | Write a `_roundN.ts` with hardcoded `{theme: [qs]}` |
| Default expansion query looks like regex debris? | Override with explicit `Query[]` for *that one cluster* | Re-implement `expansionQueries` each time |
| When to stop? | `state().near.length === 0` OR round ≥ 3 OR budget hit | Loop forever |

---

## Context budget guardrail

**Do not load `docs-all.jsonl` into context during classify.** Events already carry a `snippet` field — a ±8-char window — sufficient for valid/noise judgments. A W-sized docs file is 600 KB ≈ 150K tokens; pulling it into context 5–10×s the session cost.

Classify from `events.jsonl` alone. If a specific event's snippet is genuinely ambiguous, read that one doc by URL (single `Read` call), not the full file.

---

## Forbidden patterns (2026-04-19 lesson)

Before this skill existed, sessions were driven by `_round1.ts / _round2.ts / _round3.ts / _check.ts` one-offs with inline Python heredocs duplicating `THEMES` and `VALID_CANON`. It was replaced because:

- `detector.ts` wiped `events.jsonl` each run → classification lost across rounds
- `THEMES` dict drifted between heredoc copies
- Expansion queries improvised per round → non-reproducible
- Same canonical flipped valid/noise between rounds

**If you find yourself writing `_<anything>.ts` in the stream dir, stop.** You're missing a tool in the stable API. Either use the existing verb or tell the user the verb is missing — do not work around it with a throwaway script.

See memory `agent_driven_tooling_pattern.md` for the full writeup.

---

## Finalize

When the loop terminates:

1. Write `sessions/<WEEK>/final.json` derived from `state()` output (complete + near_abandoned + far_abandoned).
2. Run `analyze-week.ts` to generate the HTML report.
3. Report to user: complete themes count, abandoned count, budget used.

---

## Cross-references

- Authoritative procedure: `~/.tap/demand-archive/stream/PLAYBOOK.md`
- Philosophy behind the refactor: memory `agent_driven_tooling_pattern.md`
- Detector signal taxonomy (7-tier demand ladder + supply signals): `detector.ts` header + skill `demand-archaeologist`
- Gate thresholds: `completeness.ts` (fixed, do not edit mid-session)
