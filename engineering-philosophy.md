# Engineering Philosophy

A first-principles framework for software engineering in the LLM era.

Every layer is a necessary conclusion of the layer above it.

---

## 1. First Principle

> **Software separates decisions from their makers, executing autonomously across time and space.**

This is irreducible:

- It explains **why** software exists — humans need decisions to execute at scale, speed, and consistency beyond personal capacity.
- It explains **why** there's a crisis — the decision-maker isn't present to catch errors, sense changes, or fill gaps.
- It distinguishes software from other cognitive externalization — law needs judges to interpret, medicine needs doctors to apply. Software runs **with no one present**.

**Every software engineering practice exists to compensate for "the decision-maker is not present."**

### Quick Reference

```
Two eternal principles:
  ① Correctness must not depend on any single entity → cross-verify
  ② Correctness has a shelf life → external audit

Two decision standards:
  ① Make violations difficult, don't rely on memory
  ② Reduce sync artifacts, don't add more

The Algorithm: Question → Delete → Simplify → Accelerate → Automate
```

---

## 2. Fundamental Facts (12)

The separation of decisions from their makers produces risks across four dimensions. These 12 facts are technology-independent and era-independent.

### About the domain — the decision-maker's understanding is inherently limited

| ID     | Fact                                         | Implication                                                                                      |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **D1** | Business rules interact combinatorially      | Complexity comes from rules themselves, not from poor engineering (Brooks: essential complexity) |
| **D2** | Not all rules are known at any point in time | Hidden rules surface only when bugs occur                                                        |
| **D3** | Rules evolve continuously with the business  | "Done" doesn't exist in software                                                                 |

### About the executors — substitutes for the decision-maker are imperfect

| ID     | Fact                                                                    | Implication                                                  |
| ------ | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| **A1** | Human working memory is limited (~7 items)                              | Cannot hold entire system in mind; must decompose            |
| **A2** | LLMs are probabilistic                                                  | Capable but non-deterministic; hallucinate, omit, contradict |
| **A3** | Machine verification is deterministic but can only check what it's told | Precise but incomplete — doesn't know what it doesn't know   |

### About representation — encoding decisions into a medium is lossy

| ID     | Fact                                                                             | Implication                                                                                                             |
| ------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **R1** | Every representation conversion loses information                                | Natural language → design → code → runtime: loss at each step                                                           |
| **R2** | Multiple copies of the same information drift                                    | Maintaining N copies = N-1 drift sources                                                                                |
| **R3** | More formal representations enable stronger verification but are less expressive | Type systems are precise but can't express every business rule; natural language is flexible but can't be auto-verified |

### About time — the world keeps changing after the decision-maker leaves

| ID     | Fact                                                            | Implication                                                                                              |
| ------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **T1** | The external world changes independently of the system          | Laws, markets, suppliers, user behavior change without the system's permission                           |
| **T2** | Correctness is relative to a point in time                      | "Tax rate is 9%" is correct in 2025, possibly wrong in 2026. Invariants have expiration dates            |
| **T3** | Systems have no inherent mechanism to sense their own staleness | Code doesn't know it's wrong. A hardcoded 9% will run forever until an external force triggers an update |

**T1/T2/T3 vs D3:** D3 says "someone decided to change the rules" (internally driven). T1/T2/T3 says "no one decided to change anything — the world moved" (externally driven). The system was correct at time T, incorrect at T+1, not because anyone touched the code, but because reality shifted.

---

## 3. Derivations

### 3.1 Three Types of Complexity

| Type             | Source            | Essence                                                                       | Relation to "not present"                                                                                        |
| ---------------- | ----------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Domain**       | D1 + D2 + D3      | Rules intertwine, are incomplete, keep changing                               | When present, the decision-maker handles edge cases by intuition. When absent, every case must be pre-enumerated |
| **Coordination** | A1 + R1 + R2      | Brain limited → need multiple people → information loss → drift               | One brain can't hold the system → must split → splitting introduces loss                                         |
| **Temporal**     | T1 + T2 + T3 + A1 | World changes, correctness expires, system doesn't self-detect, humans forget | The moment of departure was correct, but the world doesn't wait                                                  |

### 3.2 Four Core Needs

| Need                         | Source       | Why                                                                                                                                          |
| ---------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Continuous discovery**     | D2 + D3      | Rules are incomplete and changing; must keep finding what's missing                                                                          |
| **Independent verification** | A2 + A3 + R1 | Translators (human/LLM) are unreliable, translation is lossy; need checks independent of the translation process                             |
| **Layered defense**          | A3 + R3      | Each verification method has blind spots (A3); different formalization levels have different verification capabilities (R3); must layer them |
| **Temporal audit**           | T1 + T2 + T3 | The world changes externally (T1), invariants expire (T2), the system won't alert you (T3); must proactively audit                           |

### 3.3 Two Decision Standards

Apply these when introducing any new practice, tool, or pattern:

**Standard 1: Make violations difficult, don't rely on memory.**

← A1 (humans forget) + A2 (LLMs omit)

```
❌ Written in docs → depends on memory → drifts
✅ Written in type system / check scripts → machine blocks → impossible to violate
```

**Standard 2: Reduce artifacts that need syncing, don't add more.**

← R2 (multiple copies drift)

```
❌ Same information in code, docs, and declaration files → 3 copies to sync
✅ One artifact serves multiple purposes → zero sync cost
```

### 3.4 Knowledge Lifecycle (Circular)

← D2 + R3 + R1 + T2

```
① Tacit (in someone's head)        — most fragile; person leaves, knowledge goes
     ↓ Discovery (LLM cross-domain scan, anomaly probing, production data feedback)
② Explicit (in natural language)    — drifts, but at least can be discussed
     ↓ Formalization (express as checkable condition)
③ Constraint (type/test/grep check) — can be bypassed, but machine-verifiable
     ↓ Automation (continuous run, CI blocking)
④ Machine-guarded                   — most robust; violations auto-blocked
     ↓ Time passes (T1 + T2)
⑤ Expired (constraint itself no longer correct) — needs temporal audit
     → back to ②
```

**Knowledge lifecycle is circular, not linear.** Stage ④ is not the end — T2 tells us constraints expire. There must be a mechanism to pull ⑤ back to ② for re-examination.

> Accumulated knowledge that isn't audited transforms from asset to liability — stale documentation is more dangerous than no documentation, because it gives false confidence.

### 3.5 Verification Strength Ladder

← R3 (formalization degree determines verification capability)

| Level | Method                     | What it checks                              | Strength                                         |
| ----- | -------------------------- | ------------------------------------------- | ------------------------------------------------ |
| 1     | **Type system**            | Signatures, constraints, return types       | Strongest — compile-time blocking, cannot bypass |
| 2     | **Unit tests**             | Behavioral correctness (input X → output Y) | Strong — runtime verification                    |
| 3     | **AST/static analysis**    | Code structure patterns                     | Medium — more precise than string matching       |
| 4     | **String matching (grep)** | Identifier presence                         | Weak — only prevents deletion                    |
| 5     | **Documentation**          | No auto-verification                        | Weakest — depends on reading and memory          |

**The same invariant should be verified at multiple layers, each catching different failure modes.**

**Principle: If a stronger layer already covers an invariant, the weaker layer is redundant and should be deleted (Standard 2).**

### 3.6 Toolchain Completeness Principle

← A3 (machines can only check rules they're told) + R2 (copies drift) + Standard 2 (reduce sync artifacts)

> **Mature tech stacks are already complete. Don't invent verification tools — use existing tools to their limit.**

Software engineering has evolved for decades. The designers of each mature tool have already thought through all problems within that tool's domain. When you find yourself writing a script to check a rule, first ask: **can this rule be expressed using an existing native capability of the toolchain?**

Toolchain-native capabilities are stronger than grep because the toolchain's designers have already "told" the machine more rules (A3) — the TypeScript compiler understands type structure, ESLint understands AST, ORMs understand data models. grep only understands strings.

```
Errors fall into three categories, each with a corresponding toolchain layer:

① Structural errors → Compiler/type system     (types, module boundaries, interface contracts)
② Behavioral errors → Tests                    (unit tests, property tests, E2E)
③ Runtime errors    → Post-deploy verification (smoke tests, health checks)
```

**grep scripts don't correspond to any category.** They are symptoms of "the rule hasn't entered the toolchain yet." Each grep is a technical debt IOU.

**Principle: if you're writing bash grep to check code, stop and ask whether the compiler, linter, ORM, or test framework already has a native way to solve this. The answer is almost always "yes."**

---

## 4. Structural Isomorphism

Section 3 derived "what you need" (independent verification, layered defense, temporal audit). This section provides a general method for **finding concrete solutions**.

### Core Observation

← D1 (combinatorial rule interactions produce structural problems) + empirical fact: the same class of structural problems recurs across domains

The underlying structure of engineering problems is cross-domain. Two superficially different problems may share the same structure. If one has a time-tested solution, the other can transplant it.

**Why it works:** Structural problems are mathematical in nature, independent of domain. "M entities × N entities fully connected" has the same solution whether it appears in editors×languages, editors×agents, or frontends×backends: "introduce an intermediate protocol, turning M×N into M+N."

### Method: Four Steps

```
① Abstract    — Strip domain terminology, extract pure structure
② Search      — Does this structure have a time-tested solution in another domain?
③ Transplant  — Bring the solution's structure over, re-express in the new domain's language
④ Verify      — Does the transplanted solution actually solve the original problem?
```

**Step ④ is critical.** Analogy is powerful but dangerous — a false analogy gives false confidence in a wrong solution.

### Verification Criteria (Preventing False Analogies)

Before transplanting a solution, check three conditions:

1. **Is the mapping bidirectional?** Elements of the new problem map to the known problem, AND elements of the known problem map back. One-way mapping is surface similarity, not structural isomorphism.
2. **Do the premises hold?** The known solution's preconditions must also hold in the new domain.
3. **Are there new constraints?** The new domain may have constraints absent in the known domain that invalidate the isomorphic solution. Example: database transactions are structurally isomorphic to distributed systems, but network partitions (CAP theorem) are a new constraint that makes directly transplanting ACID infeasible.

### Examples

| Problem                              | Abstract Structure                             | Known Solution (Source Domain)                       | Transplanted Result                             |
| ------------------------------------ | ---------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| M editors × N agents                 | Full mesh coupling                             | LSP: intermediate protocol (IDE domain)              | Agent communication protocol                    |
| Multiple agents may all err          | Single entity unreliable                       | Redundancy + independent verification (aviation)     | Verification ladder (types > tests > analysis)  |
| Business rules scattered across code | Same information, multiple copies              | Database normalization: single source of truth       | Configuration service backed by database        |
| Concurrent writers modify same row   | Race condition                                 | CAS instruction (CPU architecture)                   | Conditional update: `WHERE status = EXPECTED`   |
| Agent tool results are uncertain     | Probabilistic output needs deterministic check | Scientific method: hypothesis → experiment → falsify | Action contracts (precondition + postcondition) |
| Rules in docs get forgotten          | Declaration-execution separation               | Executable specifications (formal methods)           | Automated rule checking (rules as code)         |

### Relationship to First Principles

First principles and the 12 facts answer **why** a mechanism is needed. Structural isomorphism answers **how** to design that mechanism.

```
First Principle → "Need independent verification" (because A2 + A3)
                        ↓
Structural Isomorphism → "How to do independent verification?"
                        ↓
               Aviation redundancy: multiple independent sensors cross-verify
                        ↓ Transplant
               Software: type system + tests + static analysis = multi-layer cross-verification
                        ↓ Verify
               Bidirectional ✓  Premises hold ✓  No new constraints invalidate ✓
```

### When to Use

- **Designing new mechanisms**: Abstract problem structure, search known patterns, then implement. Avoid inventing from scratch.
- **Evaluating existing solutions**: Find the source-domain archetype, check if the transplant is complete. Incomplete transplants are often bug sources.
- **Migrating tech stacks**: Implicit guarantees provided by old frameworks must be explicitly rebuilt in new ones. Structural isomorphism helps systematically discover these implicit guarantees.

### Limitations

Structural isomorphism depends on the searcher's breadth of knowledge (A1). Someone unfamiliar with aviation redundancy systems won't think to use it as an analogy for verification ladders. LLM has unique value here — its training data spans all domains, wider than any individual's knowledge.

**Practice:** When facing a design decision, ask LLM for cross-domain analogy search: "Does this problem's structure have known solutions in other domains?" Then verify the analogy using the four-step method.

---

## 5. LLM Positioning

LLM is not "a faster programmer." It has precise roles derived directly from the executor facts:

### LLM compensates for A1 (human brain limited)

Humans cannot simultaneously understand all domain modules and their interactions. LLM's large context window can.

→ **LLM does global reasoning**: cross-domain impact analysis, hidden knowledge discovery, anomaly scenario probing.

This is LLM's greatest value for domain complexity — not writing code, but discovering rule interactions invisible to human cognition.

### LLM is constrained by A2 (probabilistic)

LLM output is non-deterministic. Same question, different answers. It hallucinates, omits, contradicts.

→ **LLM output must be independently verified.** Verification by machine (type system, tests, invariant checks), not by LLM self-assessment.

### LLM cannot replace A3 (machine verification completeness limit)

Machines can only check rules they're told about. LLM can help discover rules, but cannot guarantee all rules have been found.

→ **Invariant completeness is the ceiling of the entire system.** No mechanism can prove "all rules have been discovered." Periodic cross-domain scanning is a compensating measure, not a solution.

### LLM changes collaboration dynamics

← A1 (brain limited → need many people → coordination cost)

LLM can understand the entire system simultaneously, making "one agent completes a cross-layer change" possible. The bottleneck shifts from alignment to verification:

```
Old allocation: Alignment 60% / Implementation 30% / Verification 10%
New allocation: Alignment 10% / Implementation 10% / Verification 80%
```

This effectively compresses the three complexities (§3.1) into two primary dimensions: **domain** and **temporal**. Coordination complexity doesn't disappear but degrades into a subset of verification cost — the bottleneck is no longer "getting everyone aligned" but "verifying the output is correct."

### LLM and the time dimension

LLM's help with temporal complexity is **limited**:

- Can re-understand old code (partially compensates A1 forgetting)
- Can audit "are these config parameters still reasonable?" (partially compensates T3)
- **Cannot** know what happened in the external world (T1 requires external information sources)

→ **Time is the dimension where LLM helps least.** Must rely on external signal input + human periodic audit.

---

## 6. Domain Complexity Governance

Domain complexity (D1+D2+D3) cannot be eliminated, only governed. LLM enables five new governance approaches:

### 6.1 Global reasoning, replacing divide-and-conquer

← A1 (humans must decompose to understand) → but LLM doesn't need to

Humans use bounded contexts to split large domains; the cost is blind spots at the seams. LLM can hold all domain knowledge simultaneously and reason about cross-domain interactions.

### 6.2 Natural language as domain model

← R1 (translation is lossy) + R3 (natural language is expressive but can't be auto-verified) → LLM makes natural language machine-consumable

Domain knowledge can be expressed directly in natural language. LLM understands it and generates implementations. Machine verification checks invariants.

### 6.3 Domain evolution: from manual tracing to declaration propagation

← D3 (rules change) + A1 (humans can't track all impacts) → LLM does global propagation

```
Change invariant declaration → LLM global impact analysis → LLM modifies affected code → machine verifies
```

### 6.4 Making tacit knowledge explicit

← D2 (rules incomplete) + A1 (knowledge in individual heads) → LLM cross-domain scanning discovers hidden rules

Once discovered, name it, formalize it as an invariant, push it into lifecycle stages ③-④.

### 6.5 Proactively probing domain "dark matter"

← D2 (unknown rules) + D1 (combinatorial interactions produce unforeseen paths)

```
"What if supplier X suddenly can't deliver — which parts of the pipeline don't handle this?"
"What if the user initiates both a refund and an order modification at the exact same moment?"
```

---

## 7. Temporal Complexity Governance

← T1 + T2 + T3 — Domain and coordination complexity are spatial (rules interacting now, entities conflicting now). Temporal complexity is the independent third dimension.

### Core insight

Domain complexity asks: "How do rules interact?"
Coordination complexity asks: "How do multiple entities not conflict?"
Temporal complexity asks: **"How does the system know it's already wrong?"**

Answer: it doesn't (T3). External force must tell it.

### 7.1 Invariant timeliness and priority

← T2 (correctness has a shelf life)

Not all invariants are eternal:

| Type                       | Lifespan                    | Example                                               |
| -------------------------- | --------------------------- | ----------------------------------------------------- |
| **Structural**             | Near-permanent              | "Apps must not import database directly"              |
| **Business parameters**    | Changes with business       | "Subscription is $9.99/month", "Commission rate 15%"  |
| **External dependencies**  | Changes with external world | "Sales tax rate 9%", "Vendor X API is available"      |
| **Behavioral assumptions** | Drifts with user behavior   | "Average cart size is 3 items", "Churn rate < 10%"    |

Lower rows expire faster and need more frequent auditing.

**Cross-domain invariants** — rules spanning multiple domain boundaries — are particularly dangerous because they're invisible to any single domain owner (A1). They should be classified by blast radius:

| Priority         | Meaning                        | Example                                                  |
| ---------------- | ------------------------------ | -------------------------------------------------------- |
| **P0 Financial** | Error directly loses money     | Price calculation after discounts, refund triggering     |
| **P1 State**     | Error blocks business flow     | Payment-status linkage, inventory reconciliation         |
| **P2 Data**      | Error degrades user experience | Preference profile availability, behavioral signal capture |

Lower priority doesn't mean less important — it means the blast radius is more contained. All cross-domain invariants need verification at the strongest possible layer (§3.5).

### 7.2 Temporal audit mechanisms

← T3 (systems don't self-detect staleness) → must have external audit

**Periodic audit (LLM-assisted):**

- Review each configuration parameter: when was it last updated?
- Are pricing assumptions consistent with current market conditions?
- Are there long-inactive integrations or features?
- Which invariants depend on external conditions? Are those conditions still true?

**Operational metric anomaly detection (data-driven):**

- Sudden profit margin drop → cost structure may have changed but config wasn't updated
- Sudden refund rate increase → quality standards may have shifted externally
- Customer satisfaction decline → user preferences may be drifting

Metric anomalies don't directly mean "system is wrong," but they're compensating signals for T3.

**External signal intake:**

T1 governance ultimately depends on external information sources. Systems should have mechanisms to receive:

- Regulatory change notifications (tax rates, compliance requirements)
- Supply chain events (vendor status changes, API deprecations)
- Market signals (competitor pricing, user behavior trends)

Currently mostly human-relayed; can be automated via APIs or agents in the future.

### 7.3 Knowledge circulation, not knowledge accumulation

← T2 (constraints expire) → knowledge lifecycle is circular

Traditional view: the more knowledge accumulated, the better.
Temporal correction: **accumulated knowledge that isn't audited transforms from asset to liability.**

```
✅ Knowledge circulation: discover → formalize → machine-guard → audit for staleness → re-discover → ...
❌ Knowledge accumulation: write it down → leave it there → no one looks → quietly expires
```

---

## 8. Continuous Refinement Framework (The Algorithm)

The derivation system answers "why these mechanisms exist." This section answers "how to continuously refine them."

Five steps must be executed strictly in order — automating a process that shouldn't exist only amplifies the error.

### Step 1: Question — Does this separation need to exist?

The first principle says "decisions separate from decision-makers." But LLM is shortening this separation. **For each decision, ask: must it be encoded as software? Or can LLM let the decision-maker be "present" at execution time?**

If LLM can make the decision-maker "present," the entire compensation mechanism around that decision may not need to exist.

**Also question each existing practice:**

- Does this architecture rule solve a real problem or is it historical baggage?
- Is this invariant check already guaranteed by the type system?
- Does this process definition still reflect current business reality?

### Step 2: Delete — Remove compensation mechanisms that are no longer needed

After questioning, aggressively delete non-essential parts.

**Test: if you don't need to add back at least 10% of what you deleted, you didn't delete enough.**

### Step 3: Simplify — Refine what remains

After deletion, polish the core that's left.

- If a type constraint covers an invariant, delete the corresponding grep check
- If one linter rule replaces a bash script, delete the script
- If editor real-time feedback catches an error, don't wait for CI

### Step 4: Accelerate — Push feedback to the earliest possible point

```
Slowest: CI discovers (minutes after push)
Slow:    Pre-commit discovers (seconds at commit time)
Fast:    Save discovers (test watch mode)
Fastest: Edit discovers (type system + linter, ~0 seconds)
```

**The verification strength ladder (§3.5) is also a speed ladder:**

| Method       | Feedback time         | Strength          |
| ------------ | --------------------- | ----------------- |
| Type system  | Edit-time (realtime)  | Strongest         |
| Linter       | Save-time (seconds)   | Strong            |
| Unit tests   | Save/commit (seconds) | Strong            |
| grep scripts | Commit-time (seconds) | Weak              |
| CI pipeline  | Post-push (minutes)   | Complete but slow |

**Push as many checks leftward as possible.**

### Step 5: Automate — Let machines do what humans are still doing

Only after steps 1-4 are complete should you automate the refined, validated process.

| Currently human-driven         | Automation direction                                                       |
| ------------------------------ | -------------------------------------------------------------------------- |
| Discovering cross-domain rules | LLM periodic scanning, auto-generating candidate invariants, human review  |
| Temporal audit                 | Monitor operational metrics, auto-trigger "are these configs still valid?" |
| Upgrading grep to types/tests  | LLM analyzes existing grep checks, suggests equivalent type constraints    |
| Updating documentation         | LLM auto-checks whether docs need syncing after code changes               |
| Anomaly scenario probing       | Periodically auto-run "what if X happens, how does the system respond?"    |

### Core Warning

> **The most dangerous error: optimizing something that shouldn't exist.**

Before adding any new check, rule, or process, run Steps 1 and 2 first. Often the right answer isn't "add a new rule" but "delete the old design that causes the problem."

---

## 9. Value-Driven Decomposition

Sections 1–8 answer "how to build software correctly." This section answers "how to build the **right** software" — connecting engineering to value creation.

### First principle of value creation

> **Value = the change in user state from "has problem" to "problem solved."**

A product exists to create this delta. Every constraint, every line of code must trace back to this delta. If it doesn't contribute, it shouldn't exist (Step 1: Question).

This is orthogonal to §1's first principle. §1 says "software separates decisions from decision-makers" (engineering concern). This section says "those decisions must serve a user state change" (product concern). **Correct software that creates no value is the most dangerous waste — it looks like progress.**

### From value to code: the derivation chain

```
① Value Delta         — User Before → User After (one sentence)
② Value Constraints   — What must be true for the delta to exist?
③ Executable Specs    — What / What×What / Why / When
④ Minimum Code        — Satisfies all constraints, nothing more
⑤ Production Proof    — Constraints hold in the real world
```

Traditional feature-driven development skips ①② and starts from a feature list. This is why teams can ship all features and still create no value — features don't guarantee the value delta exists.

### Constraint taxonomy: Safety → Quality → Delight

← D1 (combinatorial rule interactions) + T1 (external world changes)

Not all constraints are equal. They form a hierarchy tied to value impact:

| Layer       | Violated →         | Example                                                | Verification                     |
| ----------- | ------------------ | ------------------------------------------------------ | -------------------------------- |
| **Safety**  | Value destroyed    | Pricing error loses money; expired data served         | Property test (strongest)        |
| **Quality** | Value degraded     | Results not personalized; response time too slow       | Behavioral test                  |
| **Delight** | Extra value missed | User can't track order history; no community features  | Behavioral test (lower priority) |

**Build order: Safety first → Quality → Delight.** This is not prioritization — it's logical dependency. If Safety constraints fail, Quality and Delight are meaningless.

### The five dimensions of business logic

Each constraint is described across five dimensions:

| Dimension     | What it captures           | Strongest representation        |
| ------------- | -------------------------- | ------------------------------- |
| **What**      | Single rule invariant      | Property test                   |
| **What×What** | Rule interaction invariant | Cross-domain property test      |
| **Why**       | Business rationale         | Comment attached to constraint  |
| **When**      | Validity period            | Audit date on constraint        |
| **How**       | Implementation             | Not described — code IS the how |

**What×What** is the most dangerous blind spot (← D1: rules interact combinatorially). A single rule can be correct while the interaction of two correct rules produces incorrect behavior. High-risk interactions (P0: financial, P1: state consistency) must have explicit cross-domain property tests.

### Completeness is unreachable, but approachable

← A3 (machines check only what they're told) + D2 (not all rules are known)

No framework can guarantee "all constraints have been identified." But three mechanisms tighten the approximation:

1. **Known rules → What** (property test covers infinite inputs for known invariants)
2. **Known interactions → What×What** (cross-domain property test covers rule combinations)
3. **Unknown interactions → LLM probing** (§6.5: "what if X and Y happen simultaneously?" — discovers constraints you didn't know existed)

The gap between "constraints we've defined" and "constraints that actually exist" is the system's residual risk. It can never reach zero, but it shrinks with each discovery cycle.

### Constraint specification as native toolchain capability

← R2 (copies drift) + §3.6 (don't invent verification tools — use existing tools to their limit)

The five dimensions (What, What×What, Why, When, How) are not an abstract framework — they map directly to a single test framework construct:

```
Constraint = describe(name, { tags, meta }, fn)
  name  → What (business rule declaration)
  tags  → Classification (safety/quality/delight × what/what-x-what/audit)
  meta  → When (audit date, priority — machine-readable)
  fn    → Executable verification
  // Why → Comment inside describe block (human-readable)
  // How → Does not exist (code IS the how)
```

**This is not "adding tags to tests." The test framework IS the constraint specification system.** Specification, classification, metadata, verification, filtering, inheritance, and reporting all live in one tool. Zero separate artifacts (R2 satisfied completely).

### Relationship to The Algorithm (§8)

The Algorithm's Step 1 ("Question — does this need to exist?") gains precision when connected to value:

```
Old: "Does this feature need to exist?" → Hard to answer without context
New: "Does this constraint serve the value delta?" → Binary answer
     If yes → keep, express as executable spec
     If no  → delete, it's waste regardless of how well-built it is
```

---

## 10. System Boundaries

### What this framework can guarantee

- Known rules are not broken (verification system coverage)
- Rules are continuously discovered (LLM cross-domain scanning as compensation)
- Verification strength continuously improves (upgrading from grep toward types/tests)

### What this framework cannot guarantee

- **Invariant completeness** ← A3's fundamental limit. No mechanism can prove "all rules have been discovered."
- **LLM discovery correctness** ← A2's fundamental limit. LLM may discover nonexistent rules (hallucination) or miss real ones.
- **Domain complexity elimination** ← D1's fundamental limit (Brooks: no silver bullet).
- **Invariants won't expire** ← T2's fundamental limit. Even at machine-guarded stage (④), rules may become incorrect due to external world changes.
- **System self-awareness of staleness** ← T3's fundamental limit. Staleness detection always depends on external signals.

### What will never become obsolete

Two principles that hold across all eras:

> **1. System correctness must not depend on any single entity's (human or AI) reliability.**

← A1 + A2 + A3 → no single entity is sufficient → must cross-verify.

> **2. Any declared correctness has a shelf life; there must be a mechanism to audit whether it still holds.**

← T1 + T2 + T3 → the world changes, correctness expires, systems don't self-detect → must have external audit.

### What will become obsolete

Specific practices in any project (grep checks, instruction files, worktree isolation, etc.) are optimal solutions for the current tooling and LLM capability level, not end states.

**Signal that an update is needed: when a principle starts creating friction instead of reducing it, it should be re-examined.**
