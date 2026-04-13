---
name: demand-archaeologist
description: 需求挖掘 / 验证产品想法 / find validated SaaS ideas / product-market research / idea validation. Find what's worth building by excavating behavioral evidence — workarounds, failed alternatives, and explicit tool requests — NOT by counting surface likes. Covers two battlefields: (1) Chinese social ecosystem (小红书/微信小程序/知乎) via Tap MCP, (2) English indie maker scene (Reddit/HN/indie hackers) via RDK MCP. Use when users want to: find product ideas, validate an existing idea, discover unmet needs, research a market, find promotion angles for an existing product, or decide what to build next. TRIGGER on: "what should I build", "find me opportunities", "validate this idea", "需求挖掘", "找已验证需求", "这个想法有人要吗", "how do I promote X".
argument-hint: '[platform] [audience] [constraints]'
license: MIT
metadata:
  author: LeonTing1010
  version: '5.0.0'
---

# Demand Archaeologist — 需求考古

Find what's worth building by excavating behavioral evidence, not counting surface signals.

---

## Why This Methodology Exists: The Portfolio Formula

```
100个小程序矩阵 × 已验证需求 × 长尾架构 = 期望收益收敛到稳定正值
```

This formula is portfolio theory applied to product development. Three variables, each solving a different problem:

| Variable | Problem It Solves | Mechanism |
|----------|-------------------|-----------|
| **100个小程序矩阵** | Variance | By LLN, portfolio mean converges to expected value. Individual failure is not catastrophic. |
| **已验证需求** | Sign of E[R] | If E[single unit] < 0, 100 units = larger loss. Validation ensures **E[Rᵢ] > 0** for each. |
| **长尾架构** | Marginal cost | Same infra, same ops for all 100. Marginal cost of unit N → 0. Fixed cost amortized. |

**The most fragile variable is 已验证需求.** The other two are engineering problems. This one is an epistemology problem. If your validation method is biased — mistaking attention for purchase intent — the sign flips and the formula amplifies losses.

This skill exists to get the sign right.

---

## Core Formula

```
Opportunity = Demand Heat × Supply Gap × Platform Fit × Feasibility
```

All four must be present. High demand + no supply gap = red ocean. Supply gap + no demand = no market.

---

## The Validation Hierarchy (Weakest → Strongest)

Not all demand signals are equal. The hierarchy:

```
复购  ← Repeat purchase without prompting  (strongest: they came back)
付费  ← Paid without discount              (strong: real willingness to pay)
行为  ← Completed a core action            (medium: behavioral evidence)
意向  ← Said "this is useful" / saved      (weak: intent ≠ action)
关注度 ← Liked / viewed / shared            (noise: attention ≠ need)
```

**Validated demand = user spontaneously completed the core action you care about, without being pushed.**

For a mini-program:
- Read type → user returns weekly on their own (not from push notification)
- Tool type → user opened it a second time
- Paid type → user paid without a discount code

**Minimum bar for this methodology:** Evidence that users are repeatedly solving this problem with a clumsy workaround. Clumsy workaround exists = real need + tool gap.

---

## False Validation Traps

| Surface Signal | Misread | Reality |
|---------------|---------|---------|
| 小红书笔记高赞 | Demand exists | Content demand, not product demand |
| Friends say "very useful" | Users will use it | Social politeness |
| Competitors exist | Market is validated | Competitors may all be losing money |
| High registration volume | Users want it | Likely just curiosity |
| Topic trending on Weibo | Hot need | Usually content/media opportunity, not tool |
| No competitors in my product category | Blue ocean | May be wrong category — search across ALL form factors solving the same pain |
| My dependency's moat = my moat | Strong defensibility | Moat belongs to upstream, you're a packaging layer |

**The trap pattern:** stopping at attention-layer signals and calling it validation. Every false positive here costs you a unit in the portfolio with negative expected value.

---

## Demand Ladder (Classify Every Candidate)

```
Level 5: 💰 Paying for workarounds    — Spending money on bad solutions (highest signal)
Level 4: 🔧 Suffering with workarounds — Paper, Excel, screenshots, manual counting (strong)
Level 3: 🔍 Actively searching for tools — "有没有XX小程序" comments with likes (good)
Level 2: 👀 Interested in content        — Likes/saves on topic posts (weak)
Level 1: 💬 Aware of topic               — Topic exists in feeds (noise)
```

**Only Level 3+ is worth pursuing.** L1–L2 = content business, not tool opportunity.

---

## Execution Model: Parallel Agent Pipeline

**Maximize throughput by running agents in parallel.**

```
┌─────────────── Phase 2: Parallel Sampling (launch ALL simultaneously) ───────────────┐
│                                                                                       │
│  Agent A: Trend & Policy Scout          Agent B: Platform Miner (小红书)              │
│  ├─ WebSearch: macro trends             ├─ Tap: navigate search pages                 │
│  ├─ WebSearch: platform subsidies       ├─ Tap: extract titles + likes                │
│  └─ WebSearch: developer success cases  ├─ Tap: click into top posts                  │
│                                         └─ Tap: extract top comments (Layer 2)        │
│                                                                                       │
│  Agent C: Platform Miner (知乎/Weibo)   Agent D: Competitive Teardown                 │
│  ├─ Tap: navigate trending feeds        ├─ Tap: search "topic+小程序" on WeChat       │
│  ├─ Tap: extract Q&A signals            ├─ Tap: try top existing mini-programs        │
│  └─ Tap: "有没有工具" question threads   └─ Tap: extract user reviews & complaints    │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                        ↓
                        Phase 3: Synthesis (requires all agent results)
                                        ↓
┌─────────────── Phase 4: Parallel Validation ─────────────────────────────────────────┐
│                                                                                       │
│  Agent E: Deep-dive on Top 3 candidates (comment archaeology, adjacent needs)         │
│  Agent F: Competitive gap validation (actually use existing tools, find weaknesses)    │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

**Rule: Any work that doesn't depend on another agent's output should run in parallel.**

---

## Workflow

### Phase 1: Define Filters (before any research)

Set evaluation criteria BEFORE searching to prevent confirmation bias:

```
1. Frequency × Pain    — How often does the user hit this? How annoying without a tool?
2. Platform advantage  — Why HERE (mini-program) instead of content/website?
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
| **Developer communities** (V2EX, indie hackers) | WebSearch | Validated success/failure cases, actual revenue numbers |
| **Trend reports** | WebSearch | Macro directions, market sizing, platform subsidies |
| **Social platform feeds** (小红书, Weibo, Douyin) | **Tap MCP tools** (nav → screenshot → eval) | Titles + like counts + **top comments** |
| **Platform search results** | **Tap MCP tools** (nav → eval) | What users ACTIVELY SEEK |
| **Q&A platforms** (知乎) | **Tap MCP tools** | "有没有工具" question threads + follower counts |
| **Official policy** | WebSearch | What the platform is subsidizing NOW (timing signal) |

#### How to Mine Social Platforms (小红书 Example)

**Use Tap MCP tools to browse social platforms directly.** Do NOT substitute with WebSearch.

```
Step 1: Navigate to search page
  → mcp__tap__page_nav("https://www.xiaohongshu.com/search_result?keyword=情绪日记")

Step 2: Screenshot to see the page
  → mcp__tap__tap_screenshot()

Step 3: Extract titles + engagement
  → mcp__tap__page_eval("Array.from(document.querySelectorAll('section.note-item')).map(el => {
      const title = el.querySelector('.title span')?.innerText || '';
      const likes = el.querySelector('.like-wrapper .count')?.innerText || '?';
      return title.trim() + ' | 赞:' + likes;
    }).filter(t => t.length > 5).slice(0, 15).join('\\n')")

Step 4: Click into the TOP 3 high-engagement posts
  → mcp__tap__page_click(<top post element>)

Step 5: Extract comments (THE GOLD MINE)
  → mcp__tap__page_eval("Array.from(document.querySelectorAll('.comment-item')).map(el => {
      const text = el.querySelector('.content span')?.innerText || '';
      const likes = el.querySelector('.like-count')?.innerText || '0';
      return text.trim() + ' | 赞:' + likes;
    }).filter(t => t.length > 5).slice(0, 20).join('\\n')")
```

Adapt selectors per platform. See `references/platform-selectors.md` for platform-specific patterns.

#### The Dual Search Test

For each candidate direction, run **2 searches** and compare:

| Search | What it tells you |
|--------|-------------------|
| "情绪日记" (the topic) | Content engagement — are people interested? |
| "情绪记录 小程序" / "情绪日记 工具" (the tool) | Tool demand — are people looking for solutions? |

**The delta is the signal:**
- Topic hot + tool hot → validate further (may be gap or red ocean — need competitive data)
- Topic hot + tool cold → content business, not tool opportunity ❌
- Topic cold + tool cold → no market ❌

#### Comment Archaeology: Signal Taxonomy

When reading comments on high-engagement posts, classify each signal:

| Signal Type | Example Comment | Demand Level |
|-------------|----------------|--------------|
| **Explicit tool request** | "有没有小程序能做这个？" | L3 |
| **Tool request + likes** | "有没有小程序" comment with 20+ likes | L3+ (pre-qualified leads) |
| **Clumsy workaround** | "我都是用纸记的" / "每次手动数格子" | L4 |
| **Failed alternative** | "试过XX但太难用了" / "用了3天就放弃了" | L4 |
| **Willingness to pay** | "收费也愿意用" / "比XX便宜就行" | L5 |
| **Frequency signal** | "每天都要" / "每周做一次" | Recurrence confirmed |
| **Sharing intent** | "想发朋友圈但没有好工具" | Distribution flywheel potential |

**One comment saying "有没有小程序做这个？" with 50 likes > 5.4万 title likes.** It's a pre-qualified lead with a buying signal.

---

### Phase 2.5: Cross-Category Competitive Teardown (run in parallel with Phase 2)

**Don't just check IF competitors exist — go USE them. And search across ALL form factors, not just your own product category.**

The RDK case study: searched "MCP Reddit safety tools" → found zero → declared blue ocean. Meanwhile Reveddit (browser extension, 6K users) was solving the exact same problem in a different form factor. The lane wasn't empty — the search was too narrow.

**Step 1: List ALL form factors that could solve this pain**

```
Example — "check if my Reddit post is shadowbanned":
  Browser extension    (Reveddit, 6K users)
  Web app              (removeddit.com, dead)
  Reddit bot           (various, limited)
  CLI tool             (none)
  MCP tool             (RDK — our idea)
```

Search for solutions in EVERY form factor, not just your own. Your competitor is anyone solving the same pain, regardless of technology.

**Step 2: Try the top 2-3 existing solutions (any form factor)**

```
  → Install/navigate, screenshot, note UX failures
  → Time-to-value: how many seconds from "I want to know" to "I know"
```

**Step 3: Find user reviews/complaints across all form factors**

```
  → Search "XX 不好用" / "XX alternative" / "XX stopped working"
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

---

### Phase 3: Demand Ladder × Supply Gap (The Synthesis Step)

This requires ALL Phase 2 data. Do not synthesize early.

#### Supply Gap Categories (predict durability)

| Gap Type | Description | Durability |
|----------|-------------|------------|
| **介质落差** | Paper → digital (users doing it manually) | **DURABLE** — structural void |
| **可及性落差** | Foreign → local (wrong language/platform/region) | **DURABLE** — localization barrier |
| **质量落差** | Bad tools → good tool (UX failure) | **MODERATE** — others can also improve |
| **认知落差** | Info asymmetry (users don't know solutions exist) | **FRAGILE** — closes fast |

**Prioritize 介质落差 and 可及性落差.** Structural gaps don't disappear next month.

#### Kill Criteria — 否决清单（不是 risk flag，是 hard kill）

在继续之前，对每个候选方向过一遍否决清单。**任一条成立 → 不是独立产品，降级为现有产品的功能/插件/skill。** 否决清单不是风险标注——风险可以管理，否决必须执行。

| Kill Signal | 判断方法 | 案例 |
|---|---|---|
| 核心价值是二级 JTBD | 用户因别的原因来，这个只是"顺便" / "出事后才用" | RDK: account-safety 是留存钩子不是获客钩子 → 撑不起独立产品 |
| 护城河属于上游依赖 | 去掉依赖后，产品还剩什么？如果答案是"prompt 和包装"，护城河不是你的 | RDK: browser bridge 是 Tap 的能力，RDK 只是调用它 |
| 去掉 AI/prompt 后无独立收费理由 | 把所有 prompt/分析框架删掉，剩下的代码值不值钱？ | RDK: 去掉 prompt 后就是 Tap reddit/* skills 的 MCP 包装 |
| 存在 10x 更轻的交付形态 | Phase 2.5 发现更轻形态已有用户 OR 显然可行 | RDK (MCP) vs PostGhost (浏览器扩展)：同一需求，触达成本差 100x |
| 结构性依赖无法独立运行 | 去掉上游后产品不 work 或严重降级 | RDK 无 Tap → 只剩 RSS（score=0，数据残缺） |

**一个产品通过了需求验证但命中否决清单 = 需求是真的，但这个产品不是正确载体。** 把能力归入正确的载体（母项目功能、更轻的独立产品、开源 skill）。

#### Build the Synthesis Table

```markdown
| Direction | Demand Level | Evidence | Existing Supply | Gap Type | Kill? | Verdict |
|-----------|-------------|----------|-----------------|----------|-------|---------|
| 情绪日记 | L4 🔧 | 5.4万 likes + "我用纸记了3个月" | 纸质手帐 | 介质落差 | No | ✅ BUILD |
| 拼豆图案 | L4 🔧 | 3.3万 likes + "手动数格子好累" | 国外网站 | 可及性落差 | No | ✅ BUILD |
| AI教程   | L2 👀 | 52万 likes, 0 tool comments | 教程已覆盖 | 无 | — | ❌ CONTENT TRAP |
| 星座运势 | L1 💬 | 1.3万 topic / 1-80 tool likes | 博主已覆盖 | 无 | — | ❌ NO DEMAND |
| RDK      | L4 🔧 | shadowban 恐惧真实 | Reveddit (ext) | 质量落差 | **YES: 二级JTBD + 护城河属于Tap + 更轻形态存在** | ❌ KILL → 降级为 Tap skill + PostGhost |
```

---

### Phase 3.5: Form Factor Validation — 载体验证

**需求成立不等于产品成立。** 同一个需求可以被 5 种形态满足，你必须证明你选的形态是最优的，而不是最方便你做的。

对每个通过 Phase 3（含 Kill Criteria）的候选方向，列出所有可能的交付形态，按**用户触达成本**从低到高排序：

```
用户触达成本 = 从"我有这个问题"到"问题被解决"的总步骤/时间/前置条件

示例 — "检查我的 Reddit 帖子是否被 shadowban"：
  1. 浏览器扩展（零设置，发帖后自动检测）      ← 最低触达成本
  2. Web app（打开网页，粘贴链接）
  3. Reddit bot（@bot 回复帖子）
  4. CLI 工具（安装，敲命令）
  5. MCP 工具（安装 CLI + 配 MCP + 跑 AI agent） ← 最高触达成本
```

**规则：你选择的形态的触达成本不能比最优形态高 3x 以上。** 如果高了，要么换形态，要么解释为什么你的形态有不可替代的优势（例：批量处理、自动化、与其他工具的集成）。

触达成本高但合理的例外：
- 目标用户已经在使用你的平台（MCP 用户用 MCP 工具 = 零增量成本）
- 需求本身是批量/自动化场景（人工操作不可行）
- 形态本身是护城河（平台锁定、网络效应）

---

### Phase 4: Adjacent Need Mapping (for top candidates only)

For each validated direction: **"What else does this user need?"**

Users cluster into communities with shared workflows. One validated need is a door into an adjacent ecosystem:

```
情绪日记用户 → 睡眠记录、习惯打卡、心理测评、冥想引导
拼豆爱好者  → 配色工具、库存管理、作品展示社区、图案交易
```

How to find adjacent needs:
1. Look at what ELSE the same user posts about (check their profile)
2. Look at what OTHER topics the same community discusses
3. Check "related searches" on the platform

A single tool is a product. A cluster of adjacent needs for the same user is a business — and fits the 矩阵 strategy.

---

### Phase 5: Platform Fit Test

For each surviving candidate, answer three questions:

```
1. Better as mini-program than app?    (scan-to-use, no install, share in chat)
2. Does the output have social currency? (shareable cards, reports, images for 朋友圈/群)
3. Benefits from group/chat context?   (shared with family, friends, interest groups)
```

If all three are NO → not a mini-program opportunity.

**Distribution flywheel check:**
```
Does using the tool naturally produce something shareable?
  → YES: "我的3月情绪报告" gets posted → friends see → scan QR → new user (zero CAC)
  → NO:  Tool output stays private → need to buy traffic (expensive, breaks 矩阵 economics)
```

---

### Phase 6: Rank and Recommend

**Summary table:**

```markdown
| Rank | Direction | Level | Evidence | Gap Type | Virality | Effort | Score |
|------|-----------|-------|----------|----------|----------|--------|-------|
| 1    | ...       | L4 🔧 | 5.4万 + "求工具" ×23 likes | 介质落差 | ✅ | 1-2w | ... |
```

**For each top-3 recommendation, include:**
- **Evidence**: Platform + numbers + key user comments (verbatim)
- **Demand level**: Ladder rung + proof
- **Why now**: Trend, subsidy, cultural moment, or tech enabler
- **MVP scope**: One sentence
- **User's current workaround**: What they do today (= your marketing message)
- **Adjacent opportunities**: Ecosystem potential for the 矩阵
- **Monetization**: How it makes money
- **Risk**: What could make this fail

**For each REJECTED direction:**
- **Why cut**: Data + reason (content trap / red ocean / low demand / no platform fit)
- Rejections prove rigor. A report that says yes to everything is useless.

---

### Phase 7: Promotion Loop (demand mining ≡ cold-start promotion)

**Core insight:** Finding validated demand and promoting an existing product are the **same action**. When you locate a post where someone names the exact pain your product solves, that post is simultaneously:
- Validation (someone is suffering = real need)
- A distribution opportunity (you can respond with value)
- A language sample (their words become your copy)

This phase only runs when the user has an existing product to promote, OR when the methodology is being used in a high-trust outbound community (Reddit, HN, indie hackers, 即刻). **Do NOT run this phase for 小红书/微信生态** — those platforms have different anti-spam semantics (see platform-specific references).

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
| 1    | 求助型    | URL  | "how do you validate" | Run product on OP's domain, paste 3 data points + source links | Low — OP asked |
| 2    | 忏悔型    | URL  | "6 months, nobody came" | Post-mortem using product's data, "here's what the market was actually saying" | Medium — OP may be checked out |
| 3    | 方法分享型| URL  | Author showed manual method | Mention "I automated this, here's the output on your example" | High — author may see as threat |
```

**Classification rules (Reddit-specific):**
- **求助型** (help-seeking): OP's title is a question. **Highest value** — lowest spam risk, because OP asked.
- **忏悔型** (confessional): Post-mortem of a failure. Medium value — OP is emotionally raw, may or may not want tools.
- **方法分享型** (method-share): Someone is manually doing what your product automates. Read their process, note gaps, **don't challenge them publicly**.
- **工具推荐型** (tool-recommendation): List of competing tools. Use as competitive intel; do not engage unless your product is already in the list and misrepresented.

#### The Value-First Reply Template

```
[1-sentence empathy — mirror their pain in their words, not yours]

[2-3 data points from the tool's actual output:
  • Specific Reddit thread / quote / number
  • Direct clickable link to source
  • Observation, not conclusion]

[1-sentence insight: what the pattern suggests]

[Offer, no pitch: "happy to run the same search on [their specific case] if useful"]

[NO product name. NO landing page link. NO CTA.]
```

Rationale: If the reply is useful, OP or another reader asks "how did you find this?" — **that** is when the product gets named, in response to a direct question. This is the only form of product-mention that doesn't trigger Reddit's account-level anti-spam.

#### Anti-spam safety rules (load-bearing)

1. **Never pitch first.** Data-first, product-name-last (or never, until asked).
2. **Never cross-post the same reply.** Each reply must be specific to OP's exact question.
3. **Account karma floor**: on Reddit, don't engage in promo-adjacent replies until account has ≥500 karma and ≥30 days age. Below that, the account will be flagged as spam regardless of content quality.
4. **One promo-adjacent reply per thread, max.** Never follow up with "also check out...".
5. **If an account gets a promo comment removed once, it's on a list.** Treat removal as permanent signal — switch accounts or abandon Reddit outreach from that identity.

#### Success signals (what you're watching for)

- **Direct**: OP replies with questions / thanks
- **Indirect**: Another reader asks "how did you find this data" (= qualified lead)
- **Distribution**: Reply gets upvoted independently of the parent post (= community endorsement)
- **Validation**: Private DMs asking for the tool (= strongest possible signal, compounds over time)

**Failure signals (abort conditions):**
- Reply gets downvoted → positioning wrong, study it
- Comment removed → account flagged, stop immediately
- OP doesn't respond to direct question → wrong thread type, not 求助型

See `references/english-indie-scene.md` for the complete pain-language query library and subreddit-specific source map.

---

## Key Heuristics

1. **"用笨办法反复解决" = minimum validation bar.** Paper, manual Excel, screenshots in chat — users tolerating friction = real need + tool gap. This evidence IS your product spec.

2. **Comments > likes.** One "有小程序做这个吗" with 50 likes outweighs 5万 title likes. Comments reveal the WHY and the WHO.

3. **Topic heat ≠ tool demand.** Do the dual search test every time. The delta tells the story.

4. **Platform subsidies = timing signal.** Free resources for a category = window is open NOW.

5. **Niche > mass for portfolio.** 10K DAU in a specific community > 1M one-time users. Communities have shared workflows = adjacent needs = ecosystem.

6. **Social currency drives distribution.** If the output gets shared naturally, marketing is free. This is what makes the 矩阵 work without ad spend.

7. **Structural gaps > temporary gaps.** 介质落差 and 可及性落差 persist. 认知落差 closes in months.

8. **Failed alternatives = strongest moat signal.** Users tried 3 tools and quit all of them → their complaints are your feature spec AND a reason they'll switch again.

---

## Common Mistakes to Avoid

1. **WebSearch ≠ platform data.** "小红书上很火" is not data. "5.4万 likes, top comment '求工具' has 23 likes" is data. Go to the platform.
2. **Stopping at Layer 1 (likes).** Likes = scale. Comments = depth. Always dig to Layer 2.
3. **Confusing topic heat with tool demand.** AI tutorials: 52万 likes → users want content, not tools.
4. **Proposing without trying competitors.** "健康管理" sounds great → search it → 50 existing mini-programs. Always do the teardown.
5. **Generic categories.** "AI tools" ≠ direction. "AI口语陪练 for 考研英语 students" = direction.
6. **Ignoring adjacent needs.** The 矩阵 strategy requires seeing the ecosystem, not just the single product.
7. **Treating one-time behavior as periodic demand.** A need that occurs once every 5 years doesn't support the portfolio economics. Confirm recurrence.
8. **Validating demand but not delivery.** "Users fear shadowbans" (demand) ≠ "Users need an MCP tool for shadowban checking" (delivery). Always ask: is this product form the 10x best way to deliver the solution? Case study: RDK validated real pain but chose MCP (heaviest form factor); PostGhost solved it with a browser extension (lightest).
9. **Only searching competitors in your own product category.** Your real competitor is anyone solving the same pain, regardless of technology. Reveddit (browser extension) competed with RDK (MCP tool) — same pain, different form. Search across ALL form factors.
10. **Treating risk flags as non-blocking.** "Second-order JTBD" and "moat belongs to dependency" are kill signals, not risks to manage. If the analysis says these words, run the kill criteria checklist immediately.

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
- [ ] **Form factor ranked** — all delivery forms listed, yours justified as ≤3x optimal cost
- [ ] At least one candidate REJECTED with data
- [ ] Platform fit test (3 questions) passed
- [ ] Distribution flywheel checked
- [ ] Adjacent needs mapped (矩阵 potential)
- [ ] Each recommendation names a SPECIFIC niche + SPECIFIC user
- [ ] Recurrence confirmed (weekly/monthly — not one-time)

---

## 7-Step Summary

```
1. 定标准    → Define what counts as validated BEFORE searching (prevent confirmation bias)
2. 多源采样  → 3+ platforms. Tap MCP for social platforms — not web search summaries.
3. 评论考古  → Read comments on top posts. Find: "求工具" / "用纸记" / "太难用" signals.
4. 热度×空白×否决 → Demand L3+ AND supply gap AND pass kill criteria. Otherwise kill/downgrade.
5. 载体验证  → List ALL form factors. Yours must be ≤3x optimal delivery cost. Otherwise wrong vehicle.
6. 平台+飞轮 → Better as mini-program? Output gets shared? → Distribution built in.
7. 推广闭环  → Demand mining = cold-start promotion. Same posts, same pain, same language.
```

The old mistake was stopping at step 2. The NEW mistake (post-RDK) is stopping at step 3 — validating that demand exists without validating that your product is the right vehicle. Step 4-5 is where "real need" becomes "right product" or gets killed.
