---
name: demand-archaeologist
description: Find validated, friction-heavy, recurring demand by digging through behavioral evidence — workarounds, failed alternatives, and explicit tool requests. Use when users want to find product ideas, validate demand, discover unmet needs, or analyze what's worth building — especially for WeChat mini-programs, indie apps, or side projects. TRIGGER when user asks "what should I build", "find me opportunities", "what's trending", "找已验证需求", or wants market research for a specific platform or audience.
argument-hint: '[platform] [audience] [constraints]'
license: MIT
metadata:
  author: LeonTing1010
  version: '4.0.0'
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

### Phase 2.5: Competitive Teardown (run in parallel with Phase 2)

**Don't just check IF competitors exist — go USE them and find their weaknesses.**

```
Step 1: Search for existing solutions
  → mcp__tap__page_nav("https://weixin.sogou.com/weixin?type=1&query=情绪日记+小程序")

Step 2: Try the top 2-3 existing mini-programs
  → Navigate, screenshot, note UX failures

Step 3: Find user reviews/complaints
  → Search "XX小程序 不好用" on 小红书
  → Extract specific complaints
```

**Competitive teardown decision matrix:**

| Finding | Implication |
|---------|------------|
| No competitors found | Blue ocean OR no market — check demand data to distinguish |
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

#### Build the Synthesis Table

```markdown
| Direction | Demand Level | Evidence | Existing Supply | Gap Type | Verdict |
|-----------|-------------|----------|-----------------|----------|---------|
| 情绪日记 | L4 🔧 | 5.4万 likes + "我用纸记了3个月" | 纸质手帐 | 介质落差 | ✅ BUILD |
| 拼豆图案 | L4 🔧 | 3.3万 likes + "手动数格子好累" | 国外网站 | 可及性落差 | ✅ BUILD |
| AI教程   | L2 👀 | 52万 likes, 0 tool comments | 教程已覆盖 | 无 | ❌ CONTENT TRAP |
| 星座运势 | L1 💬 | 1.3万 topic / 1-80 tool likes | 博主已覆盖 | 无 | ❌ NO DEMAND |
```

---

### Phase 3.5: Adjacent Need Mapping (for top candidates only)

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

### Phase 4: Platform Fit Test

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

### Phase 5: Rank and Recommend

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

---

## Output Checklist

Before presenting final recommendations:

- [ ] At least 3 source types consulted (WebSearch AND platform browsing via Tap MCP)
- [ ] Every candidate has real platform engagement data (not summaries)
- [ ] Every candidate has comment-level evidence (Layer 2 minimum)
- [ ] Demand ladder level assigned with proof
- [ ] Dual search test done (topic vs. tool search comparison)
- [ ] Competitive teardown done (tools tried, not just searched)
- [ ] Supply gap type identified for each recommendation
- [ ] At least one candidate REJECTED with data
- [ ] Platform fit test (3 questions) passed
- [ ] Distribution flywheel checked
- [ ] Adjacent needs mapped (矩阵 potential)
- [ ] Each recommendation names a SPECIFIC niche + SPECIFIC user
- [ ] Recurrence confirmed (weekly/monthly — not one-time)

---

## 5-Step Summary

```
1. 定标准    → Define what counts as validated BEFORE searching (prevent confirmation bias)
2. 多源采样  → 3+ platforms. Tap MCP for social platforms — not web search summaries.
3. 评论考古  → Read comments on top posts. Find: "求工具" / "用纸记" / "太难用" signals.
4. 热度×空白 → Demand L3+ AND supply gap = opportunity. Otherwise pass.
5. 平台+飞轮 → Better as mini-program? Output gets shared? → Distribution built in.
```

The mistake is stopping at step 2. Step 3 is where users tell you their real life, not just their scrolling behavior. Step 3 is where the portfolio sign flips from negative to positive.
