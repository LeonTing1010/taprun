---
name: demand-archaeologist
description: Evidence-based demand discovery and product-idea validation. Find what's worth building by excavating behavioral evidence — workarounds, failed alternatives, explicit tool requests, and WTP signals — NOT by counting surface likes. Covers two battlefields: (1) English indie maker scene (Reddit/HN/indie hackers) via Tap MCP Reddit taps (dig/posts/search), (2) Chinese social ecosystem (小红书/微信小程序/知乎) via Tap MCP browser tools. Use when users want to: find product ideas, validate an existing idea, discover unmet needs, research a market, find promotion angles for an existing product, or decide what to build next. TRIGGER on: "what should I build", "find me opportunities", "validate this idea", "需求挖掘", "找已验证需求", "这个想法有人要吗", "how do I promote X".
argument-hint: '[platform] [audience] [constraints]'
license: MIT
metadata:
  author: LeonTing1010
  version: '7.0.0'
---

# Demand Archaeologist

Find what's worth building by excavating behavioral evidence, not counting surface signals.

---

## Why This Methodology Exists: The Portfolio Formula

```
100-product portfolio × validated demand × long-tail architecture = expected returns converge to stable positive
```

This formula is portfolio theory applied to product development. Three variables, each solving a different problem:

| Variable | Problem It Solves | Mechanism |
|----------|-------------------|-----------|
| **100-product portfolio** | Variance | By the Law of Large Numbers, portfolio mean converges to expected value. Individual failure is not catastrophic. |
| **Validated demand** | Sign of E[R] | If E[single unit] < 0, 100 units = larger loss. Validation ensures **E[Ri] > 0** for each. |
| **Long-tail architecture** | Marginal cost | Same infra, same ops for all 100. Marginal cost of unit N approaches 0. Fixed cost amortized. |

**The most fragile variable is validated demand.** The other two are engineering problems. This one is an epistemology problem. If your validation method is biased — mistaking attention for purchase intent — the sign flips and the formula amplifies losses.

This skill exists to get the sign right.

---

## Core Formula

```
Opportunity = Demand Heat × Supply Gap × WTP × TAM × Platform Fit × Feasibility
```

All six must be present. Missing any one = no-go:

| Missing | What happens |
|---------|-------------|
| Demand Heat | No market |
| Supply Gap | Red ocean |
| **WTP** | Pain exists but nobody pays — **the #1 false positive from Reddit excavation** |
| **TAM** | Real pain in a tiny niche — can't sustain a business |
| Platform Fit | Wrong medium for the audience |
| Feasibility | Can't build it |

---

## The Validation Hierarchy (Weakest to Strongest)

Not all demand signals are equal. The hierarchy:

```
Repeat purchase   ← Came back without prompting           (strongest: they returned)
Paid              ← Paid without discount                  (strong: real willingness to pay)
Behavioral        ← Completed a core action                (medium: behavioral evidence)
Intent            ← Said "this is useful" / saved          (weak: intent ≠ action)
Attention         ← Liked / viewed / shared                (noise: attention ≠ need)
```

**Validated demand = user spontaneously completed the core action you care about, without being pushed.**

Examples by product type:
- Content product: user returns weekly on their own (not from push notification)
- Tool product: user opened it a second time
- Paid product: user paid without a discount code

**Minimum bar for this methodology:** Evidence that users are repeatedly solving this problem with a clumsy workaround. Clumsy workaround exists = real need + tool gap.

---

## False Validation Traps

| Surface Signal | Misread | Reality |
|---------------|---------|---------|
| High-engagement social post | Demand exists | Content demand, not product demand |
| Friends say "very useful" | Users will use it | Social politeness |
| Competitors exist | Market is validated | Competitors may all be losing money |
| High registration volume | Users want it | Likely just curiosity |
| Topic trending on social media | Hot need | Usually content/media opportunity, not tool |
| No competitors in my product category | Blue ocean | May be wrong category — search across ALL form factors solving the same pain |
| My dependency's moat = my moat | Strong defensibility | Moat belongs to upstream, you're a packaging layer |

**The trap pattern:** stopping at attention-layer signals and calling it validation. Every false positive here costs you a unit in the portfolio with negative expected value.

### Case study: RDK's false validation

RDK (Reddit Demand Kit) searched "MCP Reddit safety tools" and found zero competitors. Blue ocean? No — Reveddit Real-Time (a browser extension with 6,000 users) was solving the exact same problem in a different form factor. The search was too narrow, not the market too empty. Meanwhile, the 18+ post-GummySearch competitors (Reddinbox, SnoopSignal, RedShip, Redreach, etc.) all clustered in the discovery lane — validating Reddit tooling demand but also proving the discovery niche was a red ocean.

---

## Demand Ladder (Classify Every Candidate)

```
Level 5: Paying for workarounds       — Spending money on bad solutions (highest signal)
Level 4: Suffering with workarounds   — Manual processes, screenshots, copy-paste, browser tricks (strong)
Level 3: Actively searching for tools — "is there a tool for X" comments with likes (good)
Level 2: Interested in content        — Likes/saves on topic posts (weak)
Level 1: Aware of topic               — Topic exists in feeds (noise)
```

**Only Level 3+ is worth pursuing.** L1-L2 = content business, not tool opportunity.

### Demand × WTP Matrix — Pain Does NOT Equal Purchase Intent

Pain and willingness-to-pay are **two separate dimensions**. The most dangerous false positive: L4 pain in a developer community.

```
             WTP High (will pay)        WTP Low (prefers free/DIY)
        +----------------------------+-----------------------------+
L5 Pay  | BEST — paying for bad      | Rare (locked into bad tool) |
        | solutions already           |                             |
        +----------------------------+-----------------------------+
L4 Work-| GOOD — suffering, would    | TRAP — real pain but        |
around  | pay for relief              | audience builds own tools   |
        +----------------------------+-----------------------------+
L3 Search| Promising — searching     | Window shoppers             |
        | and willing to pay          |                             |
        +----------------------------+-----------------------------+
L2/L1   | Content demand only        | No market                   |
        +----------------------------+-----------------------------+
```

**The L4 + Low WTP trap (battle-tested)**: In a 2026-04 Reddit excavation, r/webscraping showed textbook L4 pain for scraper monitoring (45 comments, OP asked the same unsolved question 4 times). But 118 total comments across 3 related threads had **zero WTP verbalization**. The audience preferred Prometheus + self-built scripts. The pain was real; the product was not.

**How to assess WTP on Reddit:**
- Someone says "I'd pay for this" or asks about pricing → WTP confirmed
- Someone describes paying for a bad alternative → L5
- 100+ comments discussing workarounds, nobody mentions paying → **WTP = LOW**
- Audience is developers/engineers → default WTP = LOW unless proven otherwise
- Audience is non-technical end users → default WTP = HIGHER (they can't DIY)

### Case study: Reddit shadowban fear

Reddit shadowban anxiety is Level 4. Users suffering with workarounds: manually checking old.reddit.com/user/X, opening incognito windows to see if their posts appear, literally posting "can anyone see this?" in test subreddits. Mods on r/NewToReddit describe the current workaround as "trial and error at each karma chunk (25/50/100/200/300) and each age milestone (3/7/20/30 days)." Users tolerating this friction = real need + tool gap.

---

## Execution Model: Parallel Agent Pipeline

**Maximize throughput by running agents in parallel.**

```
+--- Phase 2: Parallel Sampling (launch ALL simultaneously) ----------------+
|                                                                            |
|  Agent A: Trend & Policy Scout       Agent B: Platform Miner (social)     |
|  +- WebSearch: macro trends          +- Tap: navigate search pages    |
|  +- WebSearch: platform subsidies    +- Tap: extract titles + scores  |
|  +- WebSearch: success/failure cases +- Tap: click into top posts     |
|                                      +- Tap: extract top comments     |
|                                                                            |
|  Agent C: Cross-Platform Miner       Agent D: Competitive Teardown        |
|  +- Tap: secondary platforms     +- Search ALL form factors           |
|  +- Tap: extract Q&A signals     +- Try top existing solutions        |
|  +- Tap: tool-request threads    +- Extract user reviews/complaints   |
|                                                                            |
+----------------------------------------------------------------------------+
                                    |
                    Phase 3: Synthesis (requires all agent results)
                                    |
+--- Phase 4: Parallel Validation -------------------------------------------+
|                                                                            |
|  Agent E: Deep-dive on Top 3 candidates (comment archaeology, adjacents)  |
|  Agent F: Competitive gap validation (actually use existing tools)         |
|                                                                            |
+----------------------------------------------------------------------------+
```

**Rule: Any work that doesn't depend on another agent's output should run in parallel.**

---

## Workflow

### Phase 0: Existing Product Check (before any research)

**Before looking for new products to build:**

```
Does the user already have a product (or products)?
  → YES → Could the validated pain be solved by DISTRIBUTING the existing product better?
    → YES → Opportunity is DISTRIBUTION, not creation. Skip to Phase 7 (Promotion Loop).
    → NO  → Continue to Phase 1.
  → NO → Continue to Phase 1.
```

This prevents the most expensive mistake: building product #N+1 when the answer is marketing product #N.

**Battle-tested case (2026-04)**: A 4-round Reddit excavation (TapWatch → SiteWatch → TicketWatch → CompeteWatch) killed all 4 new product ideas. The strongest Reddit signals (102-score "AI automation is glorified scripts", 45-score "AI agents are 80% hype") pointed directly at the user's existing product (Tap). The answer was always distribution, not creation — but Phase 0 didn't exist, so 4 rounds were wasted discovering this.

---

### Phase 1: Define Filters (before any research)

Set evaluation criteria BEFORE searching to prevent confirmation bias:

```
1. Frequency × Pain    — How often does the user hit this? How annoying without a tool?
2. Platform advantage  — Why THIS form factor instead of alternatives?
3. Existing friction   — How do people solve it today? What's the clumsy workaround?
4. Scope               — Can one person build MVP in 1-2 weeks?
5. Verifiability       — Can you measure success quickly? (share rate, retention, paid conversion)
```

Ask the user to confirm or customize these filters. Skip if user already provided constraints.

---

### Phase 2: Multi-Source Demand Sampling

Gather signals from **at least 3 different source types.** Single-source signals are unreliable.

Launch **parallel agents** — one per source type:

| Source | Tool | What to Extract |
|--------|------|-----------------|
| **Developer communities** (Reddit, HN, indie hackers, V2EX) | Tap MCP (reddit taps) / WebSearch | Validated success/failure cases, actual revenue numbers |
| **Trend reports** | WebSearch | Macro directions, market sizing, platform subsidies |
| **Social platform feeds** (Reddit, Xiaohongshu, Weibo) | **Tap MCP (reddit taps / browser tools)** | Titles + engagement + **top comments** |
| **Platform search results** | **Tap MCP (reddit taps / browser tools)** | What users ACTIVELY SEEK |
| **Q&A platforms** (Zhihu, StackOverflow) | **Tap MCP / WebSearch** | "Is there a tool for X" question threads + follower counts |
| **Official policy** | WebSearch | What the platform is subsidizing NOW (timing signal) |

#### How to Mine Platforms

**Use MCP tools to browse platforms directly.** Do NOT substitute with WebSearch.

For **Reddit** (English indie scene) — use Tap MCP Reddit taps:
```
Step 1: Cross-subreddit discovery (parallel)
  → tap.run("reddit", "dig", { keyword: "browser automation broken", 
      subreddits: "webdev,automation,ClaudeAI,webscraping", min_comments: 10 })
  → Returns posts with body text, sorted by engagement

Step 2: Batch comment tree extraction
  → tap.run("reddit", "posts", { urls: "url1,url2,url3", depth: 10, max_comments: 50 })
  → Returns full threaded comment trees — THIS IS WHERE THE GOLD IS

Step 3: Single post deep dive (when you need max depth on one thread)
  → tap.run("reddit", "post", { url: "...", depth: 10, max_comments: 100 })

Step 4: Targeted search (keyword + subreddit + comment search)
  → tap.run("reddit", "search", { keyword: "...", subreddit: "webscraping", type: "comment" })
```

**The two-step workflow that replaced 6+ ad-hoc calls:**
```
dig(keyword, subreddits)  →  find high-engagement posts with body text
posts(urls from dig)      →  batch extract full comment trees
```

Other useful Reddit taps:
- `reddit/relevant` — find outreach targets in specific subreddits (includes excerpt)
- `reddit/mine` — surface demand signals with pain/demand classification
- `reddit/audience` — discover subreddits where target audience gathers

For **Chinese social platforms** (Xiaohongshu, Zhihu, etc.):
```
Step 1: Navigate to search page
  → mcp__tap__page_nav("https://www.xiaohongshu.com/search_result?keyword=KEYWORD")

Step 2: Screenshot to see the page
  → mcp__tap__tap_screenshot()

Step 3: Extract titles + engagement via page_eval
  → See references/platform-selectors.md for platform-specific JavaScript patterns

Step 4: Click into the TOP 3 high-engagement posts
  → mcp__tap__page_click(<top post element>)

Step 5: Extract comments
  → See references/platform-selectors.md
```

Adapt selectors per platform. See `references/platform-selectors.md` for reusable extraction patterns.

#### The Dual Search Test

For each candidate direction, run **2 searches** and compare:

| Search | What it tells you |
|--------|-------------------|
| The topic (e.g., "Reddit shadowban") | Content engagement — are people interested? |
| The tool (e.g., "shadowban checker tool") | Tool demand — are people looking for solutions? |

**The delta is the signal:**
- Topic hot + tool hot → validate further (may be gap or red ocean — need competitive data)
- Topic hot + tool cold → content business, not tool opportunity
- Topic cold + tool cold → no market

#### Comment Archaeology: Signal Taxonomy

When reading comments on high-engagement posts, classify each signal:

| Signal Type | Example Comment | Demand Level |
|-------------|----------------|--------------|
| **Explicit tool request** | "Is there a tool that does this?" | L3 |
| **Tool request + likes** | "Is there a tool for this" with 20+ upvotes | L3+ (pre-qualified leads) |
| **Clumsy workaround** | "I just open an incognito window and check manually" | L4 |
| **Failed alternative** | "Tried Reveddit but it stopped working after Pushshift died" | L4 |
| **Willingness to pay** | "I'd pay for this" / "cheaper than X and I'm in" | L5 |
| **Frequency signal** | "Every time I post" / "I check this daily" | Recurrence confirmed |
| **Sharing intent** | "I wish I could share this report with my team" | Distribution flywheel potential |

**One comment saying "is there a tool for this?" with 50 upvotes outweighs 50K post likes.** It's a pre-qualified lead with a buying signal.

---

### Phase 2.5: Cross-Category Competitive Teardown (run in parallel with Phase 2)

**Don't just check IF competitors exist — go USE them. And search across ALL form factors, not just your own product category.**

#### Case study: RDK's narrow search

RDK searched "MCP Reddit safety tools" → found zero → declared blue ocean. Meanwhile Reveddit Real-Time (a browser extension with 6K users) was solving the exact same problem in a different form factor. The lane wasn't empty — the search was too narrow.

**Step 1: List ALL form factors that could solve this pain**

```
Example — "check if my Reddit post is shadowbanned":
  Browser extension    (Reveddit Real-Time, 6K users, 3.7/5 stars)
  Web app              (removeddit.com — dead; unddit.com — partial)
  Reddit bot           (various, limited, depend on Pushshift)
  CLI tool             (none found)
  MCP tool             (RDK — our original idea)
```

Search for solutions in EVERY form factor, not just your own. Your competitor is anyone solving the same pain, regardless of technology.

**Step 2: Try the top 2-3 existing solutions (any form factor)**

```
  → Install/navigate, screenshot, note UX failures
  → Time-to-value: how many seconds from "I want to know" to "I know"
```

**Step 3: Find user reviews/complaints across all form factors**

```
  → Search "Reveddit alternative" / "Reveddit stopped working" / "X sucks"
  → Extract specific complaints — these are your feature spec
```

**Competitive teardown decision matrix:**

| Finding | Implication |
|---------|------------|
| No competitors in ANY form factor | Blue ocean OR no market — check demand data to distinguish |
| No competitors in MY form factor, but exist in lighter ones | **Wrong form factor** — users already have a simpler path |
| Competitors + terrible reviews | Quality gap — build better |
| Competitors + users love them | Red ocean — move on |
| Competitors miss a key use case | Niche gap — build for underserved segment |
| Competitor was popular then abandoned | Investigate WHY — timing or monetization failure |

#### Case study: Reveddit teardown revealed the real opportunity

Reveddit Real-Time had 6K users but depended on Pushshift (which Reddit killed). Reviews showed 3.7/5 stars — users valued it but it was dying. This revealed: (1) demand is real, (2) the dominant solution is structurally fragile, (3) there's a timing window. The correct response wasn't to build a better MCP tool — it was to build a browser extension (PostGhost) that uses the author's own Reddit credentials to fetch `removed_by_category` directly, eliminating the Pushshift dependency entirely.

---

### Phase 3: Demand Ladder x Supply Gap (The Synthesis Step)

This requires ALL Phase 2 data. Do not synthesize early.

#### Supply Gap Categories (predict durability)

| Gap Type | Description | Durability |
|----------|-------------|------------|
| **Medium gap** ("介质落差") | Paper/manual → digital (users doing it by hand) | **DURABLE** — structural void |
| **Accessibility gap** ("可及性落差") | Foreign → local, wrong platform/region/language | **DURABLE** — localization barrier |
| **Quality gap** ("质量落差") | Bad tools → good tool (UX/data failure) | **MODERATE** — others can also improve |
| **Awareness gap** ("认知落差") | Users don't know solutions exist | **FRAGILE** — closes fast once anyone markets |

**Prioritize medium gaps and accessibility gaps.** Structural gaps don't disappear next month.

#### Kill Criteria Checklist — Hard Kills, Not Risk Flags

Before continuing, run every candidate through the kill checklist. **Any single criterion met → not a standalone product.** Kill criteria are not risk flags — risks can be managed, kills must be executed.

**Structural kills** (wrong vehicle):

| Kill Signal | How to Detect | Case Study |
|---|---|---|
| Core value is a second-order JTBD | Users come for something else; this is "just in case" / "after things go wrong" | RDK: account-safety is a retention hook, not an acquisition hook |
| Moat belongs to upstream dependency | Remove the dependency — what's left? If the answer is "prompts and packaging," the moat isn't yours | RDK: browser bridge is Tap's capability; RDK just calls it |
| No standalone billing justification without AI/prompts | Delete all prompts — is the remaining code worth paying for? | RDK: strip the prompts → MCP wrapper around Tap's reddit skills |
| A 10x lighter delivery form factor exists | Phase 2.5 found lighter form factors with existing users | RDK (MCP) vs PostGhost (extension): same need, 100x reach cost difference |
| Structural dependency — can't run independently | Remove upstream and the product doesn't work | RDK without Tap → only RSS data left (crippled) |

**Market kills** (wrong economics — added from 2026-04 Reddit excavation):

| Kill Signal | How to Detect | Case Study |
|---|---|---|
| **Zero WTP in 100+ comments** | Deep comment trees show pain but nobody says "I'd pay" or describes paying for alternatives | TapWatch: 118 comments across 3 scraper-monitoring threads, zero WTP verbalization. Developers prefer Prometheus + self-built scripts |
| **TAM < $250K/year** | Addressable audience × price × realistic conversion < $250K | TapWatch: 6,500 professional scraper operators × $29/mo × 10% = $226K/year |
| **Free alternatives cover 80%+** | Existing free tools (open source, built-in platform features, DIY) solve most of the use case | SiteWatch: Visualping (free tier) + changedetection.io (open source) + Distill.io cover 90% of web change monitoring |
| **Recurrence < monthly** | Pain is real but happens too infrequently to sustain a subscription | CompeteWatch: PMs do competitive pricing analysis quarterly, not daily |
| **Existing product already covers it** | User's own product already solves this pain → opportunity is distribution, not creation | TapWatch: tap.doctor already does scraper health checks; a standalone monitoring product would compete with the user's own tool |

**A product that passes demand validation but hits a kill criterion = the demand is real, but this product is the wrong vehicle.** Fold the capability into the right vehicle (parent project feature, lighter standalone product, open-source skill). **Expect to kill 80% of candidates.**

#### Build the Synthesis Table

```markdown
| Direction | Demand Level | Evidence | Existing Supply | Gap Type | Kill? | Verdict |
|-----------|-------------|----------|-----------------|----------|-------|---------|
| Reddit shadowban checker (as MCP tool) | L4 | "trial and error at each karma chunk" — r/NewToReddit mod; Reveddit 6K users dying | Reveddit (ext, dying), removeddit (dead) | Quality gap | **YES: 2nd-order JTBD + moat is Tap's + lighter form exists** | KILL as standalone → fold into Tap skill + pivot to PostGhost |
| Reddit shadowban checker (as browser extension) | L4 | Same demand evidence; Reveddit validates form factor (6K users) | Reveddit (dying, Pushshift-dependent) | Quality gap (durable: competitor's data source is dead) | No | BUILD as PostGhost |
| Reddit demand discovery (MCP) | L3 | 18+ post-GummySearch tools, $19/mo price anchor | Redreach, SnoopSignal, RedShip, +15 others | None (red ocean) | — | SKIP — saturated lane |
| [your candidate] | L? | [platform data + comment evidence] | [competitors in ALL form factors] | [gap type] | [kill check result] | [verdict] |
```

---

### Phase 3.5: Form Factor Validation

**Validated demand does not equal validated product.** The same need can be served by 5 form factors. You must prove your chosen form factor is optimal — not just the one most convenient for you to build.

For each candidate that passes Phase 3 (including kill criteria), list all possible delivery form factors, ranked by **user reach cost** from lowest to highest:

```
User reach cost = total steps/time/prerequisites from "I have this problem" to "problem solved"

Example — "check if my Reddit post was shadowbanned":
  1. Browser extension (zero setup, auto-detects after posting)   ← lowest reach cost
  2. Web app (open page, paste link)
  3. Reddit bot (@bot reply on post)
  4. CLI tool (install, run command)
  5. MCP tool (install CLI + configure MCP + run AI agent)        ← highest reach cost
```

**Rule: Your chosen form factor's reach cost cannot exceed 3x the optimal form factor's cost.** If it does, either switch form factors or explain why yours has an irreplaceable advantage (e.g., batch processing, automation, integration with existing toolchain).

Legitimate exceptions to high reach cost:
- Target users are already on your platform (MCP users using an MCP tool = zero incremental cost)
- The need is inherently batch/automated (manual operation isn't viable)
- The form factor itself is a moat (platform lock-in, network effects)

#### Case study: RDK → PostGhost pivot

RDK chose MCP (highest reach cost) for a need best served by a browser extension (lowest reach cost). The same `removed_by_category` check that required installing a CLI, configuring MCP, and running an AI agent could be done with a one-click Chrome extension that reads the author's own cookies. PostGhost (the browser extension) reaches the same users at 1/100th the distribution cost. The demand was real — the vehicle was wrong.

---

### Phase 4: Adjacent Need Mapping (for top candidates only)

For each validated direction: **"What else does this user need?"**

Users cluster into communities with shared workflows. One validated need is a door into an adjacent ecosystem:

```
Reddit power poster  → shadowban check, karma tracking, subreddit rule lookup, post timing optimizer
Indie SaaS founder   → demand validation, competitor monitoring, outreach automation, churn analysis
```

How to find adjacent needs:
1. Look at what ELSE the same user posts about (check their profile)
2. Look at what OTHER topics the same community discusses
3. Check "related searches" on the platform

A single tool is a product. A cluster of adjacent needs for the same user is a business — and fits the portfolio strategy.

---

### Phase 5: Platform Fit Test

For each surviving candidate, answer three questions:

```
1. Better in this form factor than alternatives?  (Why here, not a web app / extension / bot?)
2. Does the output have social currency?           (Shareable reports, badges, screenshots)
3. Benefits from network/community context?        (Shared with team, group, community)
```

If all three are NO → wrong platform for this opportunity.

**Distribution flywheel check:**
```
Does using the tool naturally produce something shareable?
  → YES: "My account health report" gets shared → peers see → install → new user (zero CAC)
  → NO:  Tool output stays private → need to buy traffic (expensive, breaks portfolio economics)
```

#### Case study: PostGhost's distribution flywheel

PostGhost injects a green/red badge directly into the Reddit UI. When users screenshot their posts (which Redditors do constantly for complaints, celebrations, sharing), the badge is visible. Every screenshot becomes organic distribution. The output has social currency because it answers a question every poster wonders: "Can anyone actually see this?"

---

### Phase 6: Rank and Recommend

**Summary table:**

```markdown
| Rank | Direction | Level | Evidence | Gap Type | Virality | Effort | Score |
|------|-----------|-------|----------|----------|----------|--------|-------|
| 1    | ...       | L4    | [platform data + key quote] | [gap type] | [yes/no] | [timeframe] | ... |
```

**For each top-3 recommendation, include:**
- **Evidence**: Platform + numbers + key user comments (verbatim)
- **Demand level**: Ladder rung + proof
- **Why now**: Trend, platform change, competitor death, or tech enabler
- **MVP scope**: One sentence
- **User's current workaround**: What they do today (= your marketing message)
- **Adjacent opportunities**: Ecosystem potential for the portfolio
- **Monetization**: How it makes money
- **Risk**: What could make this fail

**For each REJECTED direction:**
- **Why cut**: Data + reason (content trap / red ocean / low demand / no platform fit / killed by checklist)
- Rejections prove rigor. A report that says yes to everything is useless.

---

### Phase 7: Promotion Loop (demand mining = cold-start promotion)

**Core insight:** Finding validated demand and promoting an existing product are the **same action**. When you locate a post where someone names the exact pain your product solves, that post is simultaneously:
- Validation (someone is suffering = real need)
- A distribution opportunity (you can respond with value)
- A language sample (their words become your copy)

This phase runs when the user has an existing product to promote, OR when the methodology is applied in a high-trust outbound community (Reddit, HN, indie hackers). **Do NOT run this phase for platforms with anti-spam semantics that punish direct engagement** (e.g., Xiaohongshu, WeChat ecosystem) — those require different distribution playbooks.

#### When to trigger Phase 7

Run this phase if ANY of these is true:
- User has an existing product and asked "how do I promote X"
- The candidate direction found in Phase 3 overlaps with an existing product the user already ships
- User explicitly asks for outreach targets or cold-start strategy

#### The Outreach Target List

Produce a table ranking posts by outreach value, NOT by upvotes:

```markdown
| Rank | Post Type | Link | OP's Actual Question | Reply Strategy | Risk |
|------|-----------|------|----------------------|----------------|------|
| 1    | Help-seeking | URL | "how do I check if my post is shadowbanned" | Run the check on OP's account, show result + explain what it means | Low — OP asked |
| 2    | Confessional | URL | "my posts keep getting removed and I don't know why" | Share specific data: "Reddit returns removed_by_category — here's what yours says" | Medium — OP may be checked out |
| 3    | Method-share | URL | Author showed manual incognito-window checking | Mention "I automated this — here's the output on your example" | High — author may see as threat |
```

**Post type classification:**
- **Help-seeking** ("求助型"): OP's title is a question. **Highest value** — lowest spam risk, because OP asked.
- **Confessional** ("忏悔型"): Post-mortem of a failure. Medium value — OP is emotionally raw, may or may not want tools.
- **Method-share** ("方法分享型"): Someone is manually doing what your product automates. Read their process, note gaps, **don't challenge them publicly**.
- **Tool-recommendation** ("工具推荐型"): List of competing tools. Use as competitive intel; do not engage unless your product is already listed and misrepresented.

#### The Value-First Reply Template

```
[1-sentence empathy — mirror their pain in their words, not yours]

[2-3 data points from the tool's actual output:
  - Specific finding or metric
  - Direct link to source
  - Observation, not conclusion]

[1-sentence insight: what the pattern suggests]

[Offer, no pitch: "happy to run the same check on your account if useful"]

[NO product name. NO landing page link. NO CTA.]
```

Rationale: If the reply is useful, OP or another reader asks "how did you find this?" — **that** is when the product gets named, in response to a direct question. This is the only form of product-mention that doesn't trigger Reddit's account-level anti-spam.

#### Anti-spam safety rules (load-bearing)

1. **Never pitch first.** Data-first, product-name-last (or never, until asked).
2. **Never cross-post the same reply.** Each reply must be specific to OP's exact question.
3. **Account karma floor**: on Reddit, don't engage in promo-adjacent replies until account has >=500 karma and >=30 days age. Below that, the account will be flagged as spam regardless of content quality.
4. **One promo-adjacent reply per thread, max.** Never follow up with "also check out..."
5. **If an account gets a promo comment removed once, it's on a list.** Treat removal as permanent signal — switch accounts or abandon Reddit outreach from that identity.

#### Success signals (what you're watching for)

- **Direct**: OP replies with questions / thanks
- **Indirect**: Another reader asks "how did you find this data" (= qualified lead)
- **Distribution**: Reply gets upvoted independently of the parent post (= community endorsement)
- **Validation**: Private DMs asking for the tool (= strongest possible signal, compounds over time)

**Failure signals (abort conditions):**
- Reply gets downvoted → positioning wrong, study it
- Comment removed → account flagged, stop immediately
- OP doesn't respond to direct question → wrong thread type, not help-seeking

See `references/english-indie-scene.md` for the complete pain-language query library and subreddit-specific source map.

---

## Key Heuristics

1. **"Repeatedly solving it the hard way" = minimum validation bar.** Manual processes, browser workarounds, copy-paste routines — users tolerating friction = real need + tool gap. This evidence IS your product spec.

2. **Comments > likes.** One "is there a tool for this?" with 50 upvotes outweighs 50K post likes. Comments reveal the WHY and the WHO.

3. **Topic heat ≠ tool demand.** Do the dual search test every time. The delta tells the story.

4. **Platform changes = timing signal.** When a platform kills an API (Reddit vs Pushshift), subsidizes a category, or changes rules — the window is open NOW. Reveddit dying = PostGhost's timing window.

5. **Niche > mass for portfolio.** 10K DAU in a specific community > 1M one-time users. Communities have shared workflows = adjacent needs = ecosystem.

6. **Social currency drives distribution.** If the output gets shared naturally, marketing is free. This is what makes the portfolio work without ad spend.

7. **Structural gaps > temporary gaps.** Medium gaps ("介质落差") and accessibility gaps ("可及性落差") persist. Awareness gaps ("认知落差") close in months.

8. **Failed alternatives = strongest moat signal.** Users tried 3 tools and quit all of them → their complaints are your feature spec AND a reason they'll switch again. Reveddit's death gave PostGhost both its feature spec (real-time, no Pushshift) and its marketing angle ("the Reveddit alternative that actually works").

---

## Common Mistakes to Avoid

1. **WebSearch ≠ platform data.** "Lots of Reddit posts about shadowbans" is not data. "r/NewToReddit mod describes workaround as 'trial and error at each karma chunk'" is data. Go to the platform.

2. **Stopping at Layer 1 (likes/upvotes).** Likes = scale. Comments = depth. Always dig to Layer 2.

3. **Confusing topic heat with tool demand.** "Reddit shadowbans" trending → users want information (content). "Shadowban checker tool" searches → users want a solution (tool). These are different markets.

4. **Proposing without trying competitors.** "Reddit safety tool" sounds great → install Reveddit → discover it has 6K users and solves 80% of the problem. Always do the teardown.

5. **Generic categories.** "Reddit tools" ≠ direction. "Post-visibility checker for Reddit authors who suspect shadowbans" = direction.

6. **Ignoring adjacent needs.** The portfolio strategy requires seeing the ecosystem, not just the single product.

7. **Treating one-time behavior as periodic demand.** A need that occurs once every 5 years doesn't support portfolio economics. Confirm recurrence. (Shadowban checking recurs: users check after every post in a new subreddit.)

8. **Validating demand but not delivery.** "Users fear shadowbans" (demand) ≠ "Users need an MCP tool for shadowban checking" (delivery). Always ask: is this product form the best way to deliver the solution? RDK validated real pain but chose MCP (heaviest form factor); PostGhost solved it with a browser extension (lightest).

9. **Only searching competitors in your own product category.** Your real competitor is anyone solving the same pain, regardless of technology. Reveddit (browser extension) competed with RDK (MCP tool) — same pain, different form. Search across ALL form factors.

10. **Treating risk flags as non-blocking.** "Second-order JTBD" and "moat belongs to dependency" are kill signals, not risks to manage. If the analysis produces these words, run the kill criteria checklist immediately.

---

## Output Checklist

Before presenting final recommendations:

- [ ] At least 3 source types consulted (WebSearch AND platform browsing via Tap MCP)
- [ ] Every candidate has real platform engagement data (not summaries)
- [ ] Every candidate has comment-level evidence (Layer 2 minimum)
- [ ] Demand ladder level assigned with proof
- [ ] Dual search test done (topic vs. tool search comparison)
- [ ] Competitive teardown done **across all form factors** (not just your product category)
- [ ] Supply gap type identified for each recommendation
- [ ] **Kill criteria checklist applied** — every candidate tested against 5 kill signals
- [ ] **Form factor ranked** — all delivery forms listed, yours justified as <=3x optimal cost
- [ ] At least one candidate REJECTED with data
- [ ] Platform fit test (3 questions) passed
- [ ] Distribution flywheel checked
- [ ] Adjacent needs mapped (portfolio potential)
- [ ] Each recommendation names a SPECIFIC niche + SPECIFIC user
- [ ] Recurrence confirmed (weekly/monthly — not one-time)

---

## 8-Step Summary

```
0. Existing product check → Do you already have something that solves this? → distribution, not creation.
1. Define criteria  → Set what counts as validated BEFORE searching (prevent confirmation bias)
2. Multi-source     → 3+ platforms. Tap MCP Reddit taps (dig → posts) for Reddit. Tap browser tools for social platforms.
3. Comment archaeology → Read comments on top posts. Find: "is there a tool" / "I do it manually" / "tried X, it broke" / "I'd pay for this".
4. Heat × Gap × WTP × TAM × Kill → ALL must pass. Pain without WTP = trap. Small TAM = no business. Apply kill checklist.
5. Form factor      → List ALL delivery forms. Yours must be <=3x optimal reach cost.
6. Platform + flywheel → Right platform? Output gets shared? → Distribution built in.
7. Promotion loop   → Demand mining = cold-start promotion. Same posts, same pain, same language.
```

**Three failure modes, learned the hard way:**
- Stopping at step 2 → topic heat ≠ tool demand (the original mistake)
- Stopping at step 3 → demand exists but wrong vehicle (the RDK→PostGhost lesson)
- Stopping at step 3 → demand exists but zero WTP in the target audience (the 2026-04 Reddit excavation lesson: TapWatch/SiteWatch/TicketWatch/CompeteWatch all killed)

**Reality is iterative, not linear.** Expect: search → kill → pivot → search → kill → realize answer was in Phase 0. The skill prescribes phases in order, but execution loops back to earlier phases when a direction dies. Pivoting is not failure — it's the methodology working.
