// Constraints for the tap-triggers materializer (CDD RED-first).
//
// Business rule set: ~/.tap/triggers/<site>/<name>[.<slot>].trigger.json
// declarations are the single source of truth for "when does a tap run
// unattended"; launchd plists under the dev.taprun.trigger.* namespace are
// a DERIVED artifact. The materializer compiles declarations → plists
// idempotently, refuses foreground-gated plans, and never touches files
// outside its label namespace.
//
// Phase 1a adversarial framing (per constraint, see each test):
// the half-implementation this suite must kill is "string-template a plist
// per fixture, grep plan text for 'trusted', rm -f *.plist on prune".

import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "jsr:@std/assert@1";
import { materialize } from "./materialize.ts";

// ---------- fixture helpers ----------

async function tmpWorld(): Promise<{
  triggersDir: string;
  plansDir: string;
  agentsDir: string;
  logsDir: string;
}> {
  const root = await Deno.makeTempDir({ prefix: "tap_triggers_test_" });
  const w = {
    triggersDir: `${root}/triggers`,
    plansDir: `${root}/plans`,
    agentsDir: `${root}/agents`,
    logsDir: `${root}/logs`,
  };
  for (const d of Object.values(w)) await Deno.mkdir(d, { recursive: true });
  return w;
}

async function writeJson(path: string, value: unknown) {
  await Deno.mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  await Deno.writeTextFile(path, JSON.stringify(value, null, 1));
}

/** A read plan with no foreground-gated ops. */
function readPlan(site: string, name: string) {
  return {
    id: { site, name },
    description: "fixture read plan",
    args: {
      note_url: { type: "string", required: true },
      note_id: { type: "string", required: true },
    },
    observe: [{
      op: "fetch",
      url: "{{$args.note_url}}",
      format: "text",
      save: "page",
    }],
    return: '{"outcome": dyn("ok"), "reason": dyn("")}',
  };
}

// Ground-truth anchor (Phase 1b): args carry the REAL xsec_token share URL
// captured from the 2026-07-12 logged-out probe — its `&` and `=` bytes are
// exactly what a naive (unescaped) plist writer corrupts.
const REAL_NOTE_URL =
  "https://www.xiaohongshu.com/explore/693ed95c000000001e005a97?xsec_token=AByyuMZBtcM3SxN2K8WHeWVLLbPByFX7w0v7Klrd6dxVA=&xsec_source=pc_search";

function visibilityTrigger() {
  return {
    ref: "xhs/visibility-recheck",
    args: {
      note_url: REAL_NOTE_URL,
      note_id: "693ed95c000000001e005a97",
    },
    when: { calendar: { Hour: 10, Minute: 30 } },
    note: "effect-ladder L3: daily second-vantage visibility recheck",
  };
}

const OPTS = (w: Awaited<ReturnType<typeof tmpWorld>>, extra = {}) => ({
  triggersDir: w.triggersDir,
  plansDir: w.plansDir,
  agentsDir: w.agentsDir,
  logsDir: w.logsDir,
  tapBin: "/Users/leo/.tap/bin/tap",
  ...extra,
});

// ---------- Safety / what: declaration → plist mapping ----------

Deno.test("[safety/what] declaration maps to a valid namespaced plist with XML-escaped args", async () => {
  // Why: the plist IS the runtime behavior — a malformed or mis-labeled
  // plist silently never fires (launchd drops it without error surface).
  // Adversarial: a half-impl that string-concats args unescaped passes any
  // ampersand-free fixture; REAL_NOTE_URL's `&` kills it (plutil -lint is
  // an EXTERNAL oracle, not this suite's own regex).
  const w = await tmpWorld();
  await writeJson(
    `${w.plansDir}/xhs/visibility-recheck.plan.json`,
    readPlan("xhs", "visibility-recheck"),
  );
  await writeJson(
    `${w.triggersDir}/xhs/visibility-recheck.trigger.json`,
    visibilityTrigger(),
  );

  const report = await materialize(OPTS(w));
  assertEquals(report.entries.length, 1);
  assertEquals(report.entries[0].action, "created");
  assertEquals(
    report.entries[0].label,
    "dev.taprun.trigger.xhs.visibility-recheck",
  );

  const plistPath =
    `${w.agentsDir}/dev.taprun.trigger.xhs.visibility-recheck.plist`;
  const body = await Deno.readTextFile(plistPath);
  assertStringIncludes(body, "<key>Label</key>");
  assertStringIncludes(
    body,
    "<string>dev.taprun.trigger.xhs.visibility-recheck</string>",
  );
  assertStringIncludes(body, "<string>xhs/visibility-recheck</string>");
  assertStringIncludes(body, "xsec_token"); // args made it in
  assert(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(body), "raw & must be escaped");
  assertStringIncludes(body, "<key>StartCalendarInterval</key>");
  assertStringIncludes(body, "<integer>10</integer>");

  // External oracle: macOS's own plist parser must accept the artifact.
  const lint = await new Deno.Command("plutil", {
    args: ["-lint", plistPath],
  }).output();
  assertEquals(lint.success, true, new TextDecoder().decode(lint.stderr));
});

Deno.test("[safety/what] materialize is idempotent — unchanged declaration rewrites nothing", async () => {
  // Why: launchd watches LaunchAgents; gratuitous rewrites cause churn and
  // make every sync look like a change (drift detection dies).
  // Adversarial: a half-impl that always writes passes an existence check;
  // asserting action=unchanged + identical bytes kills it.
  const w = await tmpWorld();
  await writeJson(
    `${w.plansDir}/xhs/visibility-recheck.plan.json`,
    readPlan("xhs", "visibility-recheck"),
  );
  await writeJson(
    `${w.triggersDir}/xhs/visibility-recheck.trigger.json`,
    visibilityTrigger(),
  );

  const first = await materialize(OPTS(w));
  assertEquals(first.entries[0].action, "created");
  const plistPath =
    `${w.agentsDir}/dev.taprun.trigger.xhs.visibility-recheck.plist`;
  const bytes1 = await Deno.readTextFile(plistPath);

  const second = await materialize(OPTS(w));
  assertEquals(second.entries[0].action, "unchanged");
  assertEquals(await Deno.readTextFile(plistPath), bytes1);

  // Edited declaration → updated.
  const t = visibilityTrigger();
  t.when = { calendar: { Hour: 11, Minute: 0 } };
  await writeJson(`${w.triggersDir}/xhs/visibility-recheck.trigger.json`, t);
  const third = await materialize(OPTS(w));
  assertEquals(third.entries[0].action, "updated");
  assertStringIncludes(
    await Deno.readTextFile(plistPath),
    "<integer>11</integer>",
  );
});

// ---------- Safety / what: foreground gate ----------

Deno.test("[safety/what] plan containing a trusted:true op is refused — unattended runs cannot satisfy foreground gestures", async () => {
  // Why: trusted:true is CDP-at-coordinates and needs a foreground tab;
  // scheduled at 03:00 it fails silently forever (the 2026-07-08 xianyu
  // lesson: foreground-gated selects "全失败" under CLI batch).
  // Adversarial: half-impl skips the plan read entirely and materializes
  // everything; this test's refusal + exit signal kills it.
  const w = await tmpWorld();
  const plan = readPlan("xianyu", "publish");
  // deno-lint-ignore no-explicit-any
  (plan.observe as any).push({
    op: "input",
    target: { selector: ".submit" },
    kind: "click",
    trusted: true,
  });
  await writeJson(`${w.plansDir}/xianyu/publish.plan.json`, plan);
  await writeJson(`${w.triggersDir}/xianyu/publish.trigger.json`, {
    ref: "xianyu/publish",
    when: { calendar: { Hour: 3, Minute: 0 } },
  });

  const report = await materialize(OPTS(w));
  assertEquals(report.entries[0].action, "refused");
  assertStringIncludes(report.entries[0].reason ?? "", "trusted");
  assertStringIncludes(report.entries[0].reason ?? "", "xianyu/publish");
  assertEquals(report.ok, false);
  // Refusal means NO artifact.
  const files = [...Deno.readDirSync(w.agentsDir)].map((f) => f.name);
  assertEquals(files.length, 0);
});

Deno.test("[safety/what] 'trusted' appearing only in a description STRING does not trip the gate", async () => {
  // Why: the gate must read plan STRUCTURE (op objects with trusted===true),
  // not grep file text — else every plan documenting the trusted mechanism
  // becomes unschedulable.
  // Adversarial: this is the mirror test that kills the grep half-impl the
  // previous test alone would tolerate.
  const w = await tmpWorld();
  const plan = readPlan("xhs", "visibility-recheck");
  plan.description = 'harmless: does NOT use "trusted": true anywhere';
  await writeJson(`${w.plansDir}/xhs/visibility-recheck.plan.json`, plan);
  await writeJson(
    `${w.triggersDir}/xhs/visibility-recheck.trigger.json`,
    visibilityTrigger(),
  );

  const report = await materialize(OPTS(w));
  assertEquals(report.entries[0].action, "created");
});

Deno.test("[quality/what] write-variant plan materializes WITH a warning — unattended mutation deserves eyes", async () => {
  // Why: background-safe writes are legitimate (JS-injection clicks), but an
  // unattended mutating run should be a conscious choice, surfaced per sync.
  const w = await tmpWorld();
  const plan = {
    ...readPlan("xhs", "close-pub"),
    id: { site: "xhs", name: "close-pub" },
    act: [{ op: "input", target: { selector: ".ok" }, kind: "click" }],
    key: '"close-" + args.note_id',
    postcondition: "observe.page.contains(args.note_id)",
  };
  await writeJson(`${w.plansDir}/xhs/close-pub.plan.json`, plan);
  await writeJson(`${w.triggersDir}/xhs/close-pub.trigger.json`, {
    ref: "xhs/close-pub",
    args: { note_id: "x" },
    when: { interval_seconds: 3600 },
  });

  const report = await materialize(OPTS(w));
  assertEquals(report.entries[0].action, "created");
  assertStringIncludes(report.entries[0].warning ?? "", "write");
});

// ---------- Safety / what: referential integrity ----------

Deno.test("[safety/what] dangling ref (no such plan on disk) is refused", async () => {
  // Why: a trigger firing `tap run` against a missing plan burns a launchd
  // slot on a guaranteed tap_not_found forever — declaration-time is the
  // earliest layer that can catch it (accelerate: edit > 03:00 failure log).
  // Adversarial: half-impl trusts `ref` syntax alone; missing-file check
  // kills it.
  const w = await tmpWorld();
  await writeJson(`${w.triggersDir}/ghost/nowhere.trigger.json`, {
    ref: "ghost/nowhere",
    when: { calendar: { Hour: 9, Minute: 0 } },
  });
  const report = await materialize(OPTS(w));
  assertEquals(report.entries[0].action, "refused");
  assertStringIncludes(report.entries[0].reason ?? "", "ghost/nowhere");
  assertEquals(report.ok, false);
});

Deno.test("[safety/what] `when` must have exactly one trigger kind", async () => {
  // Why: calendar+interval together is ambiguous intent; launchd would
  // happily honor both and double-fire.
  const w = await tmpWorld();
  await writeJson(
    `${w.plansDir}/xhs/visibility-recheck.plan.json`,
    readPlan("xhs", "visibility-recheck"),
  );
  const t = visibilityTrigger();
  // deno-lint-ignore no-explicit-any
  (t.when as any).interval_seconds = 60;
  await writeJson(`${w.triggersDir}/xhs/visibility-recheck.trigger.json`, t);
  const report = await materialize(OPTS(w));
  assertEquals(report.entries[0].action, "refused");
  assertStringIncludes(report.entries[0].reason ?? "", "exactly one");
});

// ---------- Safety / what-x-what: namespace containment ----------

Deno.test("[safety/what-x-what] orphan plists are reported inside the namespace and NEVER touched outside it", async () => {
  // Why: agentsDir is shared with every other launchd agent on the machine;
  // blast radius must be structurally capped to dev.taprun.trigger.*.
  // Adversarial: half-impl prunes by glob *.plist — the foreign
  // com.other.backup.plist below turns that into data loss; this test makes
  // it a red bar instead.
  const w = await tmpWorld();
  await Deno.writeTextFile(
    `${w.agentsDir}/dev.taprun.trigger.zzz.gone.plist`,
    "<plist/>",
  );
  await Deno.writeTextFile(
    `${w.agentsDir}/com.other.backup.plist`,
    "<plist/>",
  );

  const report = await materialize(OPTS(w));
  assertEquals(report.orphans, ["dev.taprun.trigger.zzz.gone.plist"]);
  // Without --prune both files survive.
  assert(
    await Deno.stat(`${w.agentsDir}/dev.taprun.trigger.zzz.gone.plist`).then(
      () => true,
    ),
  );

  const pruned = await materialize(OPTS(w, { prune: true }));
  assertEquals(pruned.pruned, ["dev.taprun.trigger.zzz.gone.plist"]);
  const survivors = [...Deno.readDirSync(w.agentsDir)].map((f) => f.name);
  assertEquals(survivors, ["com.other.backup.plist"]);
});

Deno.test("[quality/what] disabled declaration is not materialized; its plist becomes an orphan", async () => {
  // Why: pausing a trigger must not require deleting the declaration (the
  // declaration is the durable record; disabled is a state, not an absence).
  const w = await tmpWorld();
  await writeJson(
    `${w.plansDir}/xhs/visibility-recheck.plan.json`,
    readPlan("xhs", "visibility-recheck"),
  );
  await writeJson(
    `${w.triggersDir}/xhs/visibility-recheck.trigger.json`,
    visibilityTrigger(),
  );
  await materialize(OPTS(w));

  const t = { ...visibilityTrigger(), disabled: true };
  await writeJson(`${w.triggersDir}/xhs/visibility-recheck.trigger.json`, t);
  const report = await materialize(OPTS(w));
  assertEquals(report.entries[0].action, "disabled");
  assertEquals(report.orphans, [
    "dev.taprun.trigger.xhs.visibility-recheck.plist",
  ]);
});

// ---------- Quality / what: slots ----------

Deno.test("[quality/what] slotted declarations give one plan several independent triggers", async () => {
  // Why: one plan may need a 10:00 run and an 18:00 run with different args;
  // slot is the filename's third segment.
  const w = await tmpWorld();
  await writeJson(
    `${w.plansDir}/xhs/visibility-recheck.plan.json`,
    readPlan("xhs", "visibility-recheck"),
  );
  const am = visibilityTrigger();
  const pm = visibilityTrigger();
  pm.when = { calendar: { Hour: 18, Minute: 0 } };
  await writeJson(
    `${w.triggersDir}/xhs/visibility-recheck.am.trigger.json`,
    am,
  );
  await writeJson(
    `${w.triggersDir}/xhs/visibility-recheck.pm.trigger.json`,
    pm,
  );

  const report = await materialize(OPTS(w));
  const labels = report.entries.map((e) => e.label).sort();
  assertEquals(labels, [
    "dev.taprun.trigger.xhs.visibility-recheck.am",
    "dev.taprun.trigger.xhs.visibility-recheck.pm",
  ]);
  assertEquals(report.entries.every((e) => e.action === "created"), true);
});
