# English Indie Maker Scene — Source Map & Playbook

Reference for running demand-archaeologist on the **English-speaking indie developer ecosystem**. Different battlefield from Chinese social platforms — different tools, different signals, different traps.

---

## Primary Source Map (ranked by signal density)

| Subreddit | Signal Type | What to Look For |
|---|---|---|
| **r/SideProject** | Confession + confusion | "spent N months building, nobody used it", "how do you validate" |
| **r/indiehackers** | Monetization failure | "built X, got 0 customers", "my first 10 paying users" |
| **r/SaaS** | B2B pain | "looking for tool to X", "current tools suck at Y" |
| **r/microsaas** | Solo founder tactics | Honest revenue numbers, channel breakdowns |
| **r/Solopreneur** | Going-alone pain | Distribution struggles, isolation signals |
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
- `"reddit banned my account"` (anti-spam pain)

### Tooling / Workaround pain
- `"manually tracking"` + [domain]
- `"spreadsheet for"` + [task]
- `"is there a tool for"`
- `"wish there was"`

### Willingness-to-pay signals
- `"would pay for"`
- `"take my money"`
- `"happy to pay"`

### Account safety / shadowban pain (PostGhost-relevant)
- `"am I shadowbanned"`
- `"post not showing up"`
- `"removed without notification"`
- `"can anyone see this"`
- `"reddit removed my post"`
- `"shadowban check"`

---

## MCP Toolchain (RDK)

The English indie scene runs on **RDK's Reddit MCP tools**:

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
- Use **cross-posting** — the same post repeated in r/SaaS + r/microsaas + r/Solopreneur + r/buildinpublic = author is running content marketing (= probable competitor)
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
| **Help-seeking** | "How do you validate an idea before building?" | **Outreach target** — OP is literally asking. Reply with data. |
| **Confessional** | "I spent 6 months building a SaaS nobody used" | **Copy language** — their exact words become your landing page headline |
| **Method-share** | "I built a tool that scrapes Reddit for validated SaaS ideas" | **Competitor intel** — read carefully, often reveals the author's growth playbook |
| **Tool-recommendation** | "Top 5 tools for finding startup ideas" | **Direct competitor list** — extract every tool mentioned, map positioning |

---

## Confession Archaeology: The Gold Mine

The highest-signal posts on r/SideProject are **post-mortem confessions** — "I spent N months building X and nobody came." These posts are 3 things at once:

1. **Validation that the pain exists** (the author paid with their time)
2. **Language library** (their vocabulary = your copy)
3. **Outreach targets** (the author is receptive to help NOW)

### Case study: PostGhost's demand language

Before building PostGhost, confession archaeology on r/NewToReddit and r/ShadowBan surfaced exact user language:

- "I keep posting and nothing shows up — am I talking to a wall?"
- "Reveddit used to tell me but it's broken now"
- "I just open incognito and check if my post appears — there has to be a better way"

Each quote became: (1) evidence of L4 demand (suffering with workarounds), (2) landing page copy candidates, (3) Reddit threads where a value-first reply could demonstrate PostGhost's output.

**Response template for confession posts (value-first, not pitch):**

```
[Empathy: 1 sentence]
[Specific data from your tool: 2-3 bullet points about THEIR topic area, with links]
[Insight: what the data suggests]
[Offer, zero pitch: "happy to run this check on your account if helpful"]
[NO product mention. Let them ask "how did you find this".]
```

---

## Competitive Teardown Checklist (English scene)

Before concluding "blue ocean", run these checks:

- [ ] Search `site:reddit.com "[your category] tool"` — find competitor mentions in context
- [ ] Check indie hackers' "products" directory for same-space tools
- [ ] Check Product Hunt search for last 6 months of launches in the category
- [ ] Use `reddit_search` with known competitor names as `must_contain` → see how users talk about them
- [ ] Sign up for top 2 competitors, actually use them, note UX/data-quality gaps
- [ ] **Search ALL form factors** — your competitor is anyone solving the same pain, not just your product category

**Common pattern in this niche**: a founder hits $4-10k MRR → writes "how I got here" posts → cross-posts to r/SaaS + r/Entrepreneur + r/microsaas + r/Solopreneur + r/buildinpublic. If you see the same post in 4+ subs by the same author, that's your competitor running the playbook.

### Case study: The post-GummySearch landscape

GummySearch (the dominant Reddit demand tool, 140K users, $29-59/mo) died in Nov 2025 when Reddit revoked its commercial API access. The orphaned demand fragmented across 18+ new entrants: Reddinbox, SnoopSignal, RedShip, Redreach, GapSnaps, PainOnSocial, Subreddit Signals, etc. All clustered in the discovery/intent/reply lane. Price floor anchored at $19/mo (Redreach). This is a textbook red ocean — validated demand, but zero structural differentiation available. RDK correctly identified account-safety as the uncontested lane adjacent to this brawl, but then made the form-factor mistake (MCP instead of browser extension).

---

## Distribution-as-Demand-Research Loop

The English indie scene has a unique property: **promotion and demand mining are the same action.**

```
   +---------------------------------------------+
   |  1. RDK scan for pain language in subreddit  |
   |  2. Classify: help-seeking / confessional /  |
   |     method-share / tool-recommendation       |
   |  3. Reply to help-seeking posts with data    |
   |  4. The reply itself IS market research:     |
   |     - Does OP engage? → signal               |
   |     - Do others upvote your data? → signal   |
   |     - Does someone ask "how'd you find this" |
   |       → qualified lead                       |
   |  5. Feed results back into next query        |
   +---------------------------------------------+
```

This loop is why the English scene behaves differently from Chinese social platforms: you can't "market" your way in — the community detects promo instantly. But you CAN insert yourself into conversations where pain is already named, and **the insertion itself validates the positioning**.

See SKILL.md Phase 7 for how to produce an Outreach Target List as part of the standard deliverable.

---

## Key Traps (English scene specific)

1. **Reading scores as truth.** Free tier RSS = all zeros. Don't mistake "low score" for "no interest."
2. **Mistaking content marketers for users.** Someone posting "I built a tool that does X" 3 times a week is a competitor, not a signal.
3. **Posting promo too early.** Reddit anti-spam is **account-level**. One flagged promo comment can permanently cap your account's reach. Always reply with data-first, product-name-last (or never).
4. **Ignoring HN.** HN comments are lower-volume but higher-signal than Reddit. Skipping HN for Reddit-only research misses the B2B buyer tier.
5. **Treating "validated SaaS ideas" as blue ocean.** As of 2026, there are 18+ competitors in the Reddit demand discovery niche post-GummySearch. Always run competitive teardown first.
6. **Searching only your own form factor.** RDK searched "MCP Reddit safety tools" and found zero — but Reveddit (browser extension, 6K users) was solving the same pain. Search ALL form factors.
