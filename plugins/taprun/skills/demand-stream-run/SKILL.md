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
import { openSession, sweep, classify, flushToLedger, readThread, state } from "./agent-tools.ts";
import { expansionQueries, SWEEP_QUERIES, type Query } from "./search.ts";
import { runSeed } from "./seed.ts";

const s = openSession("2026-W<NN>");
```

| Verb | What it does | When to call |
|---|---|---|
| `sweep(queries, session, round)` | Fetches + dedupes + appends docs, enriches comment docs with parent post context, detects new events | Each round — initial sweep + each expansion |
| `classify(rules, session?)` | Appends to global `classifications.jsonl`, upserts theme assignments in global `themes.json` | After each sweep, for each new `(canonical, pattern_label)` seen |
| `flushToLedger(session)` | Persists newly valid demand events to global `event-ledger.jsonl` for cross-week accumulation | Immediately after every `classify()` call |
| `readThread(session, postId)` | Returns `{ post, comments[], total_comments }` — full conversation tree for a postId | When event's snippet + parent_title + parent_body_head leave the signal ambiguous (corroboration vs rebuttal) |
| `state(session, { lookback_weeks? })` | Returns `{ complete, near, far, abandoned }` clusters; merges prior-week ledger events when `lookback_weeks > 0` | Before deciding what to expand; at end of session |

**The global registries (`themes.json`, `classifications.jsonl`, `event-ledger.jsonl`) carry across weeks.** Prior sessions' judgments auto-apply to matching canonicals — you only classify *new* `(canonical, pattern_label)` pairs. Slow-building themes (< 5 events/week) surface via ledger accumulation across weeks.

---

## The loop

```
Round 0 + 1: runSeed(0) + sweep(SWEEP_QUERIES wrapped as {platform:"sweep", …})
           ↓
Classify new (canonical, pattern_label) pairs — batch one classify() call
flushToLedger(s)                              ← persist valid events to global ledger
           ↓
state(s, { lookback_weeks: 3 })               ← merges up to 3 prior weeks from ledger
→ read {complete, near, far}
           ↓
For each near cluster (up to 3 rounds):
  qs = expansionQueries(cluster)      ← deterministic default
  review qs → override if display is regex debris
  sweep(qs, s, round)
  classify new rules
  flushToLedger(s)
  state(s, { lookback_weeks: 3 })
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

**Three-tier context discipline:**

1. **Default (cheap, from events.jsonl)**: `snippet` + `parent_title` + `parent_body_head` — handles ~80% of classify decisions. For comment events, `parent_title`/`parent_body_head` are auto-filled from the parent post during sweep enrichment.

2. **Thread (medium, on demand)**: `readThread(s, event.postId)` returns the full `{ post, comments[] }` conversation tree. Use when the signal is ambiguous — e.g., an L5_wtp comment in isolation could be rhetorical ("I'd pay but there's nothing") or real ("I'd pay, already tried XX"). Replies resolve which. Per demand-archaeologist skill: "comment trees — THIS IS WHERE THE GOLD IS."

3. **Forbidden**: loading `docs-all.jsonl` wholesale. A session's docs-all.jsonl ≈ 150K tokens.

Rule: default → thread → never full corpus. If you feel the urge to load all docs, you're missing a tool; say so.

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

## Seed maintenance (not a session task — but know these exist)

Two offline CLIs under `~/.tap/demand-archive/stream/`:

- `seed-probe.ts [<venue> | --all]` — single-venue end-to-end smoke test (collect→detect). Use when adding a candidate venue, debugging 0-event sessions, or quarterly.
- `seed-audit.ts` — aggregates `sessions/*/final.json` to produce per-venue `complete_hits` / `weeks_seen` with drop/promote recommendations. Run quarterly once ≥10 weeks of data exist.

Neither needs you (the agent) — they're pure CLI. Mention them to the user if seeds look stale or venues look empty. Do NOT rewrite `seed.ts` without a probe-plus-audit recommendation.

---

## Cross-references

- Authoritative procedure: `~/.tap/demand-archive/stream/PLAYBOOK.md`
- Philosophy behind the refactor: memory `agent_driven_tooling_pattern.md`
- Detector signal taxonomy (7-tier demand ladder + supply signals): `detector.ts` header + skill `demand-archaeologist`
- Gate thresholds: `completeness.ts` (fixed, do not edit mid-session)
