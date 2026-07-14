---
name: thesis-monitor
description: Encode your analytical framework as composite Tap plans (sensors × thresholds × framework-doc anchors) and let launchd run them deterministically with zero LLM tokens per scan. For framework-driven thinkers (macro analysts / quant retail / Obsidian PKM power-users / indie founders tracking KPIs against thesis) who want their beliefs machine-auditable without sending watchlists to a cloud SaaS. TRIGGER when user wants to "monitor my thesis", "track invariants", "alert when threshold breached", "personal observability", "framework as code", "thesis as code", "encode my criteria", "make my thesis machine-auditable", or describes manually copy-pasting sensor data into a spreadsheet/Obsidian to check against rules.
license: MIT
metadata:
  author: LeonTing1010
  version: '0.2.0'
---

# thesis-monitor

> Your framework is a graph of beliefs over observable sensors. Make the graph executable. Local. Zero-token. Forever.

This skill teaches a 3-layer pattern that composes **existing Tap sensor plans** + **JSONata-expressed thresholds** + **OS-managed scheduling** into a thesis-as-code observability loop. It ships zero runtime code — the runtime is `tap run` + a 30-line bash notify wrapper + launchd/systemd.

## When to use

- You maintain an analytical framework (investment thesis, risk model, oncall invariants, personal-life KPIs) with **named thresholds** documented somewhere
- You catch yourself **copy-pasting** sensor values from APIs/web/dashboards into a spreadsheet to check "did anything breach?"
- You want a **local-first** alternative to Koyfin/Datadog-personal/Sentry — credentials never cross your machine
- You want the framework doc and the runtime evaluator to **not drift apart** (i.e. fix R2 copy-drift on threshold definitions)

## When NOT to use

- You don't have a documented framework yet — write the doc first ([[writing-adrs]] / [[writing-plans]])
- You want pretty dashboards as primary output — this skill emits alerts on breach, not charts (use Grafana for that)
- You want shared/team visibility — this is single-user local; no multi-tenant story
- Your sensors require browser-authenticated session — possible (use `op:tap` to a saved authenticated tap), but verify the credential plumbing first

## The architecture (3 layers, ~200 lines total)

```
L0 ── Sensor taps (existing or forge-new; one URL × intent each)
       ~/.tap/plans/fred/series.plan.json
       ~/.tap/plans/eia/brent_daily.plan.json
       ~/.tap/plans/binance/spot.plan.json
       ~/.tap/plans/<your-source>/<your-intent>.plan.json

L1 ── User-owned composite scan plans (this is your thesis-as-code)
       ~/.tap/plans/<area>/scan-<lane>.plan.json
         observe: [ op:tap calling each L0 sensor + save: <name> ]
         return:  JSONata expression computing { ts, sensors, breaches[] }
                  where each breach carries: sev / sensor / val / doc / msg
                  doc field = framework-doc anchor [[R_X#section]]

L2 ── Generic notify wrapper (one, ~30 lines)
       ~/.local/bin/tap-kb-notify.sh
         tap run <plan> → jq parse → osascript per breach + digest log

L3 ── OS scheduler (launchd / systemd)
       Calendar-driven; one plist per (lane × time slot)
```

**No new file formats.** `.plan.json` *is* your declarative thesis config — JSONata-native, MCP-discoverable, `tap verify` audits drift, `tap run` is the runner.

## The discipline (read before authoring)

### Framework-doc anchor convention

Every breach in L1's `return` MUST carry a `doc` field linking to the source belief:

```jsonata
{ "sev": "RED",
  "sensor": "debt_gdp",
  "val": $debt,
  "doc": "[[R_2-USDC#fiscal-layer]]",
  "msg": "Debt/GDP > 130% Scenario F P↑↑" }
```

The `[[R_X#section]]` wikilink is Obsidian/Logseq syntax pointing to where the threshold is *defined* in your framework doc. **This is how you fix R2 (copy-drift)**: when you raise/lower a threshold in the framework doc, the corresponding plan rule's `doc:` anchor still points at the right location, and a future `/thesis-monitor verify` lint can check that every anchor resolves to a real heading.

If you find yourself writing a breach with `doc: ""` — STOP. Either:
- The belief isn't actually in your framework doc yet → write it there first
- You're inventing a threshold during scan authoring → that's a framework change disguised as code, and per [[lu_rhythm_sop]] / sit-period discipline, framework changes are reflective decisions, not coding spikes

### Authoring order

1. Belief exists in framework doc with a stable anchor (`R_2-USDC.md#fiscal-layer`)
2. Sensor exists as L0 saved tap (`fred/series` for FRED, etc) — `tap capture` to forge if missing
3. Compose L1 scan plan that fetches sensors + computes breaches + references anchors
4. Schedule via launchd
5. **Never** invert this order — never let a threshold first appear in a `.plan.json`. The `.plan.json` *reifies* the framework, never *invents* it.

### Sensor integrity — fail loud, never silent-green (mandatory)

A monitoring loop is an oracle: sensors × thresholds → breach. Its integrity property is the one that actually bites in production: **a broken or stale sensor must raise an alarm, not silently report "no breach."** The default behavior does the opposite — and that is the single most dangerous failure mode of thesis-as-code.

**The silent-green trap.** If a sensor failed to fetch, `$observe.dgs10.latest_value` is `null`. Then `$lu_neg < -8` evaluates to **false** — no breach — and the digest reports "all clear." You now have a green light wired to a dead sensor, and you will trust it *precisely because it never alarms*. This is the generalized form of the 2026-06-03 FRED 504 incident: a daily-CSV timeout made `scan-redflag` return a bad reading and misfire `reconnect_extension` ([[feedback_fred_daily_csv_504_needs_cosd_2026-06-03]]).

**Three guards every scan plan MUST carry:**

1. **Presence guard** — every sensor binding is checked for null/absent BEFORE any threshold compares it. A missing value is itself a breach (`sev: 'STALE'`), never a silent false.
2. **Freshness guard** — if the sensor carries a timestamp, assert it falls inside an expected window (a daily series older than N days = a frozen/dead feed = alarm). A value that stopped moving is indistinguishable from a healthy one unless you check its age.
3. **Shape guard** — `$number(...)`-coerce and verify the field exists at the path you expect; a feed that changed shape (renamed field, wrapped envelope) must alarm, not read as null. This is the consumer-side static-drift failure from [[feedback_daily_report_weibo_parser_drift_2026-05-31]].

JSONata pattern — make absence loud:

```jsonata
($dgs10 := $observe.dgs10.latest_value;
 $stale := ($exists($dgs10) and $number($dgs10) = $dgs10) ? [] :
   [{ 'sev': 'STALE', 'sensor': 'dgs10', 'val': null,
      'doc': '[[R_4#sensor-liveness]]',
      'msg': 'dgs10 null/non-numeric — scan is BLIND, not clear' }];
 /* threshold rules below only meaningful when $stale = [] */
 { 'ts': $now(), 'sensors': { 'dgs10': $dgs10 },
   'breaches': $append($stale, $threshold_breaches) })
```

**The rule: "no breaches" is only trustworthy when paired with "all sensors live."** A scan that cannot tell *"nothing breached"* apart from *"I couldn't read anything"* is below the integrity line — it is not an oracle, it is a green light wired to nothing.

### Cohort fit

You will likely be in the "DIY-forever / free + local" cohort that doesn't pay for SaaS observability ([[demand_archaeology_graveyard]] 2026-05-13 verdict). This skill is FOR that cohort: it's free, ships no servers, requires no signup. If you find yourself wanting cloud sync / team dashboards / paid features — you're a different cohort and this skill is the wrong vehicle.

## Authoring a scan plan (walkthrough)

Start from `references/scan-plan-template.json`. Three editable regions:

**Region 1 — sensors (`observe[]`)**: list `op:tap` calls to existing L0 sensors. Each gets a `save` key naming the result for the return expression.

```json
"observe": [
  { "op": "tap", "site": "fred", "name": "series",
    "args": { "series_id": "DGS10", "n_recent": 1 }, "save": "dgs10" },
  { "op": "tap", "site": "fred", "name": "series",
    "args": { "series_id": "GFDEGDQ188S", "n_recent": 1 }, "save": "debt_gdp" }
]
```

For non-saved-tap sources (raw JSON API), use `op:fetch` directly:

```json
{ "op": "fetch",
  "url": "https://api.coingecko.com/api/v3/global",
  "method": "GET", "format": "json", "save": "cg" }
```

**Sequential, not parallel**: `op:parallel` flattens `save` keys into an array — use sequential ops for named-scope access. Acceptable cost: ~1s per sensor; 6 sensors = ~5s, fine for daily scans.

**Region 2 — derived metrics + breach rules (`return` JSONata)**: bind sensors to local vars, compute derivatives, then generate breach arrays per rule.

```jsonata
($dgs10 := $observe.dgs10.latest_value;
 $debt := $observe.debt_gdp.latest_value;
 $lu_neg := $dgs10 - 8;

 $b_lu := $lu_neg < -8
   ? [{ 'sev': 'RED', 'sensor': 'lu_neg_real', 'val': $lu_neg,
        'doc': '[[R_4#T1-trigger]]', 'msg': 'real rate < -8% — R_4 T1 True' }]
   : ($lu_neg < -5
       ? [{ 'sev': 'YELLOW', 'sensor': 'lu_neg_real', 'val': $lu_neg,
            'doc': '[[R_4#T1-watch]]', 'msg': 'real rate < -5% — approaching' }]
       : []);

 $b_debt := $debt > 130
   ? [{ 'sev': 'RED', 'sensor': 'debt_gdp', 'val': $debt,
        'doc': '[[R_2#fiscal-layer]]', 'msg': 'Debt/GDP > 130%' }]
   : [];

 { 'ts': $now(),
   'sensors': { 'dgs10': $dgs10, 'debt_gdp': $debt, 'lu_neg_real': $lu_neg },
   'breaches': $append($b_lu, $b_debt) })
```

**Region 3 — `id`, `description`, `source_intent`**: standard plan metadata.

### JSONata gotchas

- `$now()` returns ISO string; `$millis()` returns ms epoch
- Array slice: `arr[[0..2]]` (note double brackets for slice range)
- Stringy numbers from APIs: wrap with `$number(...)` before arithmetic
- Conditional: `cond ? a : b`; nest with parens
- Array concat: `$append($a, $b)`; for >2 use repeated `$append`
- **Sequence with `;`** then **single expression at end** — the last expr is the return value

### Migration note (load-bearing)

JSONata is the runtime today; CEL is the migration target per `core/CLAUDE.md:113` (the swap is atomic and includes auto-migration of `~/.tap/plans/**/*.plan.json`). Keep your `return` expressions short and readable — atomic migration will work, but post-migration hand-review of complex expressions is wise. **Don't try to use CEL syntax now — runtime imports `jsonata`, not `cel-js`**.

## Notify wrapper (canonical, 30 lines)

See `references/notify-wrapper.sh`. Copy verbatim. Edit only:
- `LOG_DIR` if you want logs somewhere other than `~/Library/Logs/tap-kb/`
- The osascript title if you want platform-different notifier (e.g. terminal-notifier on macOS, notify-send on Linux)

**The wrapper does NOT contain thresholds.** Thresholds live in the L1 scan plan. The wrapper is generic — same wrapper handles every scan plan you author.

## Scheduling

See `references/launchd-template.plist` (macOS) / `references/systemd-template.timer` (Linux planned). One file per (scan × time slot). The pattern:

```xml
<key>ProgramArguments</key>
<array>
  <string>/Users/you/.local/bin/tap-kb-notify.sh</string>
  <string>area/scan-lane</string>   <!-- plan ref, e.g. kb/scan-redflag -->
</array>
<key>StartCalendarInterval</key>
<dict>
  <key>Hour</key><integer>9</integer>
  <key>Minute</key><integer>3</integer>
</dict>
```

`launchctl bootstrap gui/$(id -u) <plist>` to load. `launchctl kickstart -k gui/$(id -u)/<label>` to fire NOW for testing.

## Verify the loop

```bash
# 1. Plan parses + composes:
tap run kb/scan-redflag | jq '.return'

# 2. Breach simulation: temporarily lower a threshold in the plan, re-run, watch notification fire

# 3. Launchd-context test (catches PATH / TCC issues):
launchctl kickstart -k "gui/$(id -u)/com.you.tap-kb.scan-redflag-am"
sleep 5
cat ~/Library/Logs/tap-kb/scan-redflag.log  # should show fresh digest

# 4. Liveness test (catches silent-green): break a sensor on purpose
#    (bad series_id, or pull the network), re-run, and confirm a STALE
#    breach FIRES — not "all clear". If it reports clear, your presence
#    guard is missing and the loop is blind.
```

## Anti-patterns

| Don't | Because |
|---|---|
| Put thresholds in bash wrapper instead of plan `return` | Defeats the whole "plan IS the config" elegance; bash isn't MCP-discoverable + not auditable by `tap verify` |
| Write thresholds without `doc:` anchor | R2 copy-drift returns; framework belief and scan rule must cross-reference |
| Let a null / failed / stale sensor read as "no breach" | Silent-green: a dead feed reports all-clear and you trust it *because* it never alarms (the FRED 504 class). Add presence + freshness + shape guards; a missing sensor is itself a breach |
| Use `op:parallel` for the sensor list | `save` keys flatten into array — breaks named JSONata access. Sequential is fine for daily cadence |
| Assume notification must live in the bash wrapper | `op:notify` is already in the closed 16-op union (ADR 2026-07-08) — you can notify from the plan directly; the wrapper below is one valid alternative for custom digests, not a requirement |
| Write to `~/Documents/Obsidian/...` from launchd-spawned scripts | macOS TCC blocks it silently. Use `~/Library/Logs/` + `~/.tap/` (both TCC-free). Render Obsidian-visible content only from terminal-launched (FDA inherited) contexts |
| Try to monetize this as a product | See [[demand_archaeology_graveyard]] 2026-05-13 — n=50+ engaged commenters across 4 thread types, 0 WTP. Audience is DIY-forever. Build for self + share free. |

## Cross-references

- [[engineering-philosophy]] — Lens B architecture decision flow; structural isomorphism to alertmanager pattern
- [[demand-archaeologist]] — used to validate the product question (kill T4/T5 paid, keep T1 self / T2 free skill)
- [[constraint-driven-development]] — TDD-style for business rules; complements this skill's thresholds-as-data discipline
- [[writing-adrs]] / [[writing-plans]] — use to document the framework BEFORE encoding it here
- `core/CLAUDE.md:113` — JSONata → CEL migration status (load-bearing for plan authors)

## Slash commands (planned)

- `/thesis-monitor verify <plan>` — runs `tap verify <plan>` + lints `doc:` anchors against Obsidian vault headings
- `/thesis-monitor scaffold <area> <lane> <schedule>` — generates a plan template + plist from skeleton
- `/thesis-monitor audit` — checks for: orphan plan files, drifted anchors, unscheduled lanes, dead launchd jobs

(Slash commands not implemented in v0.1.0 — manual authoring only. PRs welcome.)
