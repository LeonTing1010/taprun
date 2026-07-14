---
name: probe-first
description: Run a specific product idea through a cost-ascending gate sequence — cheapest kill first, "build" always last — and terminate in a designed costly probe (pre-sale / fake-door / concierge) the user can send this week. This is the ACTION-ORDERED companion to demand-archaeologist: that skill excavates and weighs evidence to decide what's worth building; THIS skill takes one idea you already have and forces the cheapest-first validation sequence, refusing to advance past any gate on free signals, stopping at the first FAIL. Use when the user has an idea and wants to test it fast/cheap, asks "该不该做这个 / 怎么最省地验证 / 快速试错 / 验证我这个想法 / is this worth building". Delegates deep signal-sampling to demand-archaeologist at the gates that need it. TRIGGER on "快速试错", "最省怎么验证", "该不该做X", "帮我验证这个想法", "test this idea before I build".
argument-hint: '[the idea in one sentence]'
license: MIT
metadata:
  author: LeonTing1010
  version: '1.0.0'
---

# Probe First

> One law underneath everything here: **the cheapest real validation is making one real person pay a cost for something that does not exist yet.** Everything else is ordering — run the cheap kills before the expensive ones, and put "build" last.

The failure this skill prevents is not "not validating." It's **running the sequence in reverse** — building first (the most expensive act), then leaving the cheapest validation for last or never. "Fast trial-and-error" done right = **strict cost-ascending order; stop at the first gate that fails; write code only after Gate 4.**

## How to run

Take the user's idea (one sentence — ask for it if absent). Run the gates **in order**. At each gate, demand real evidence; **do not advance on free signals**. Announce PASS/FAIL per gate with the evidence. **Stop at the first FAIL** and report what killed it — a fast kill is a win, not a loss. Only an idea that clears all four earns a line of code.

Before Gate 0, scan the **KILL list** below — if the idea matches a pattern there, say so and stop; no gate-running needed.

---

### Gate 0 · Disprove (10 minutes, pure search) — kill before you fall in love

- **Danger signal, not opportunity signal**: "I could build this in 20 minutes" / "feels like open field" / huge traffic → **high value ≈ saturated**. The easier and more obviously useful, the earlier it was taken.
- **Do**: search `X alternatives / X pricing / X API coverage / X open source`. Use WebSearch/WebFetch; if the user has Tap, drive their logged-in browser for gated sources.
- **Aggregator-wall check (desk research)**: is the underlying data high-volume + standardized? Then an API/aggregator already owns it (Plaid/ATTOM/Supermetrics-class) → if coverage is broad, **KILL, move to a longer tail**.
- **Data-source stability check**: does it depend on a hostile platform's rotating/private API? Fire a 2-minute probe at the endpoint — a dead endpoint kills the whole category before any spend.
- **PASS** only if you cannot find disproving material. Finding it → KILL (you just saved everything downstream).

### Gate 1 · Two gates before building (written, zero cost)

Force the user to answer two sentences in writing. Either blank → STOP.
1. **Before building, how did I MEASURE the demand?** (blank = demand unmeasured; it's just your own itch)
2. **Week one, where do the first 50 right people come from?** (blank = no distribution)

The "I scratched my own itch / had a flash of insight" narrative is exactly the comfortable version with these two hard parts deleted. Do the math out loud: to reach $10k you need ~500 orders — with no channel, one order/day = two years.

### Gate 2 · Order check (zero cost)

- **Signal**: are you reverse-engineering demand from "the product I can build" (a tool/extension/CLI)? → direction already reversed = distribution-vacuum.
- **Native-distribution axis**: does using it expose it to the next user by itself? No native loop → destined to be carried by a content/persona flywheel = the most exhausting path.
- **Do**: turn around. **Lock a buyer who already has budget + emotion, and an existing distribution loop, THEN build.** If "fast trial-and-error" is still testing "does my product have takers," the direction is wrong.

### Gate 3 · One costly probe (hours-to-days; may collect money on the spot)

The only validation that counts = **a real person pays a cost for something that doesn't exist yet.** Design and draft it now:
- fake-door landing page (real click/lead) · concierge (you hand-deliver, playing the product) · **pre-sale collecting a deposit** · lock a dated commitment.
- **Readout**: 0 payers = FAIL (don't build); ≥1 = pass; ≥3 = strong → productize.
- **The deliverable spec gets built only after someone pays.**
- Pre-sale script to draft for the user: *"This round is capped at 3 seats → pay a deposit to lock a seat → I send a scenario questionnaire → delivered within a week. If this isn't worth ¥X to you, it isn't painful enough yet — we both save time."*
- **When weighting whether a signal here is real vs noise, invoke `demand-archaeologist`** (costly-signaling + discrimination cascade) rather than re-deriving it.

### Gate 4 · Three-fit before a line of code

- **User × Need × Scenario** all fill in with specifics ("in-house legal at a mid-size firm," not "SMBs").
- **AND** "can the business model that satisfies this need even survive?" — dodge the value trap (real demand + a model that can't live = the next tombstone; e.g. subscription-betrayal → honest lifetime-buyout = low LTV + free-updates-forever).
- A prototype is not evidence. Small is a feature.

---

## The currency rule (runs through every gate — how to tell real from noise)

| Real signal (expensive to FAKE) | Noise (free — anyone can emit) |
|---|---|
| pre-payment, deposit, repurchase | clicks, sign-ups, "I'd use it" |
| a paid + time-costly negative review (= a feature spec) | likes, saved posts, poll ticks |
| a dated commitment with high breach cost | stated WTP (1.2–3× inflated) |
| the clumsy workaround a user already pays for (screenshots/Excel/an assistant) | **AI role-play / Monte-Carlo "87% would buy"** (LLM-judge Kappa 0.29–0.58 = a confirmation-bias amplifier) |

**Demand can only be measured, never simulated. The currency of measurement is behavior that is expensive to fake. Never let AI "prove" the idea.** The operative quantity is always **cost-to-fake**, never cost-to-emit (a post that says "I spent hours on this" but was cheap to fake is still noise).

## KILL list (looks like this → cut it, skip the gates)

- Pitch is "mine is more accurate / faster / more deterministic" → moat ≠ engine; copyable; treat as a commodity.
- Real demand but **the business model can't feed itself** (subscription-betrayal → honest buyout = tombstone).
- Selling to the pickiest, least-willing-to-pay peers (developers / AI enthusiasts) = L1 red-ocean trap.
- A **self-use** tool/CLI/extension with **no native distribution loop** → destined to be carried by a persona flywheel alone.

## Output

End with a one-screen verdict:
- **Gate reached / where it died** (and the evidence).
- If it survived to Gate 3: **the exact probe, drafted and ready to send** (landing copy or pre-sale DM), plus the pass/fail number to watch.
- If it died: which gate, why, and the cheapest adjacent idea that might clear it.

## Relationship to other skills

- `demand-archaeologist` — the discovery + signal-weighting engine. Call it *inside* Gate 0 (weigh disproof evidence) and Gate 3 (is this costly signal real?). Use it when the task is "find/compare ideas"; use **probe-first** when the task is "I have one idea — test it cheapest-first and send a probe."
- `first-principle-audit` / `engineering-philosophy` — for the "should this even exist" cut when Gate 4's model-survival question gets deep.
