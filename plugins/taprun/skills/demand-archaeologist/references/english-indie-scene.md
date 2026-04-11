# English Indie Maker Scene — Source Map & Playbook

Reference for running demand-archaeologist on the **English-speaking indie developer ecosystem**. Different battlefield from 小红书/微信小程序 — different tools, different signals, different traps.

---

## Primary Source Map (ranked by signal density)

| Subreddit | Signal Type | What to Look For |
|---|---|---|
| **r/SideProject** | Confession + confusion | "spent N months building, nobody used it", "how do you validate" |
| **r/indiehackers** | Monetization failure | "built X, got 0 customers", "my first 10 paying users" |
| **r/SaaS** | B2B pain | "looking for tool to X", "current tools suck at Y" |
| **r/microsaas** | Solo founder tactics | Honest revenue numbers, channel breakdowns |
| **r/Solopreneur** | Going-alone pain | Distribution struggles, 孤独 signals |
| **r/Entrepreneur** | Broader patterns | Industry-level plays (less indie-specific) |
| **r/buildinpublic** | Build-log confessions | Real-time validation attempts |
| **Hacker News** (Ask HN, Show HN) | High-signal Q&A | Comments on Show HN are brutal truth-tellers |

**Ignore**: r/startups (low signal, mostly theory), r/business (off-topic for dev tools).

---

## Pain-Language Query Library

**Rule: Search the pain, not the category.** Category queries return competitors; pain queries return users.

### Ideation / Validation pain
- `"how do you validate"`
- `"nobody uses my"`
- `"spent months building"`
- `"wasted months"`
- `"built what I thought people wanted"`
- `"watching what people complain about"`
- `"ideas in a vacuum"`

### Distribution / Promotion pain
- `"no one is finding"`
- `"zero traction"`
- `"tried cold email"` + `"no replies"`
- `"how do I get my first users"`
- `"reddit banned my account"` (anti-spam pain — hello)

### Tooling / Workaround pain
- `"manually tracking"` + [domain]
- `"spreadsheet for"` + [task]
- `"is there a tool for"`
- `"wish there was"`

### Willingness-to-pay signals
- `"would pay for"`
- `"take my money"`
- `"happy to pay"`

---

## MCP Toolchain (RDK)

Unlike the 小红书/微信 flow (which uses Tap browser automation), the English indie scene runs on **RDK's Reddit MCP tools**:

| Tool | Purpose |
|---|---|
| `mcp__rdk__reddit_discover` | Find where a target audience clusters (discover subreddits by topic) |
| `mcp__rdk__reddit_search` | Pain-language queries across specific subreddits |
| `mcp__rdk__reddit_subreddit` | Survey a community's recent posts to gauge current discussion |
| `mcp__rdk__reddit_post` | Comment archaeology — fetch full thread + comments |

### Critical: The RSS Free-Tier Trap

RDK Free tier uses Reddit RSS feeds. **All `score` and `comment_count` values are 0.** You cannot rank by engagement.

**Workarounds:**
- Use **post count per query** as a density signal (10 matching posts/month on one subreddit = hot)
- Use **language repetition** — same phrases appearing across multiple authors = validated frustration vocabulary
- Use **cross-posting** — the same post repeated in r/SaaS + r/microsaas + r/Solopreneur = author is running content marketing (= probable competitor)
- For real scores, the RDK Pro tier uses Tap bridge on port 9334 (falls back gracefully)

### HN supplement

For Hacker News, use WebFetch on specific URLs:
- `https://hn.algolia.com/?q=<query>` — HN search with real scores
- `https://news.ycombinator.com/item?id=<id>` — specific thread

---

## Signal Classification (Reddit-specific)

Every matching post falls into one of four categories. Treat each differently:

| Type | Example Title | What to Do |
|---|---|---|
| **求助型** | "How do you validate an idea before building?" | **Outreach target** — OP is literally asking. Reply with data. |
| **忏悔型** | "I spent 6 months building a SaaS nobody used" | **Copy language** — their exact words become your landing page headline |
| **方法分享型** | "I built a tool that scrapes Reddit for validated SaaS ideas" | **Competitor intel** — read carefully, often reveals the author's growth playbook |
| **工具推荐型** | "Top 5 tools for finding startup ideas" | **Direct competitor list** — extract every tool mentioned, map positioning |

---

## Confession Archaeology: The Gold Mine

The highest-signal posts on r/SideProject are **post-mortem confessions** — "I spent N months building X and nobody came." These posts are 3 things at once:

1. **Validation that the pain exists** (the author paid with their time)
2. **Language library** (their vocabulary = your copy)
3. **Outreach targets** (the author is receptive to help NOW)

**Response template for confession posts** (to use RDK value-first, not pitch):

```
[Empathy: 1 sentence]
[Specific data from RDK: 2-3 bullet points about THEIR topic area, with links]
[Insight: what the data suggests]
[Offer, zero pitch: "happy to run more searches if helpful"]
[NO product mention. Let them ask "how did you find this".]
```

---

## Competitive Teardown Checklist (English scene)

Before concluding "blue ocean", run these checks:

- [ ] Search `site:reddit.com "validated saas ideas" tool` — find competitor mentions in context
- [ ] Check indie hackers' "products" directory for same-space tools
- [ ] Check Product Hunt search for last 6 months of launches in the category
- [ ] Use `reddit_search` with known competitor names as `must_contain` → see how users talk about them
- [ ] Sign up for top 2 competitors, actually use them, note UX/data-quality gaps

**Common pattern in this niche**: a founder hits $4–10k MRR → writes "how I got here" posts → cross-posts to r/SaaS + r/Entrepreneur + r/microsaas + r/Solopreneur + r/buildinpublic. If you see the same post in 4+ subs by the same author, that's your competitor running the playbook.

---

## Distribution-as-Demand-Research Loop

The English indie scene has a unique property: **promotion and demand mining are the same action.**

```
   ┌─────────────────────────────────────────────┐
   │  1. RDK scan for pain language in sub       │
   │  2. Classify as 求助型/忏悔型/方法分享型    │
   │  3. Reply to 求助型 with data + links       │
   │  4. The reply itself IS market research:    │
   │     - Does OP engage? → signal               │
   │     - Do others upvote your data? → signal  │
   │     - Does someone ask "how'd you find this"│
   │       → qualified lead                       │
   │  5. Feed results back into next query       │
   └─────────────────────────────────────────────┘
```

This loop is why the English scene behaves differently from 小红书: you can't "market" your way in — the community detects promo instantly. But you CAN insert yourself into conversations where pain is already named, and **the insertion itself validates the positioning**.

See SKILL.md Phase 6 for how to produce an Outreach Target List as part of the standard deliverable.

---

## Key Traps (English scene specific)

1. **Reading scores as truth.** Free tier RSS = all zeros. Don't mistake "low score" for "no interest".
2. **Mistaking content marketers for users.** Someone posting "I built a tool that does X" 3 times a week is a competitor, not a signal.
3. **Posting promo too early.** Reddit anti-spam is **account-level**. One flagged promo comment can permanently cap your account's reach. Always reply with data-first, product-name-last (or never).
4. **Ignoring HN.** HN comments are lower-volume but higher-signal than Reddit. Skipping HN for Reddit-only research misses the B2B buyer tier.
5. **Treating "validated SaaS ideas" as blue ocean.** As of 2026, there are at least 2 known competitors at $4k–$9k MRR in this exact niche. Always run competitive teardown first.
