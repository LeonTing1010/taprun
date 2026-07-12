// tap-triggers materializer: compiles ~/.tap/triggers/ declarations into
// launchd plists under the dev.taprun.trigger.* label namespace.
//
// The declaration is the source of truth; the plist is a derived artifact
// (systemd service/timer isomorphism: plan = service, trigger = timer).
// The engine stays mechanical and scheduler-free — the OS owns "when",
// this script only owns the deterministic declaration→plist compile.
//
// Envelope: macOS/launchd only; unattended runs reach the extension peer
// only while Chrome is running (launchd fires → tap CLI → host.sock).
// Foreground-gated plans (trusted:true CDP input) are refused at
// materialize time — they cannot succeed unattended (xianyu 2026-07-08).

const NAMESPACE = "dev.taprun.trigger";
const CALENDAR_KEYS = new Set(["Minute", "Hour", "Day", "Weekday", "Month"]);

export interface MaterializeOpts {
  triggersDir: string;
  plansDir: string;
  agentsDir: string;
  logsDir: string;
  tapBin: string;
  prune?: boolean;
}

export interface Entry {
  declaration: string; // path relative to triggersDir
  label: string;
  action: "created" | "updated" | "unchanged" | "refused" | "disabled";
  reason?: string;
  warning?: string;
}

export interface Report {
  ok: boolean; // false iff any entry was refused
  entries: Entry[];
  orphans: string[]; // namespaced plists with no live declaration
  pruned: string[]; // orphans deleted (only with prune:true)
}

// ---------- helpers ----------

function xmlEscape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Recursively find op objects carrying trusted === true (structural check,
 * not text grep — `trusted` inside a description string must not trip it). */
function findTrustedOps(node: unknown): boolean {
  if (Array.isArray(node)) return node.some(findTrustedOps);
  if (node !== null && typeof node === "object") {
    const rec = node as Record<string, unknown>;
    if (typeof rec.op === "string" && rec.trusted === true) return true;
    return Object.values(rec).some(findTrustedOps);
  }
  return false;
}

function calendarDict(cal: Record<string, unknown>, indent: string): string {
  const lines = [`${indent}<dict>`];
  for (const [k, v] of Object.entries(cal)) {
    if (!CALENDAR_KEYS.has(k) || typeof v !== "number") {
      throw new Error(`invalid calendar key/value: ${k}=${v}`);
    }
    lines.push(`${indent}  <key>${k}</key>`);
    lines.push(`${indent}  <integer>${v}</integer>`);
  }
  lines.push(`${indent}</dict>`);
  return lines.join("\n");
}

interface Declaration {
  ref: string;
  args?: Record<string, unknown>;
  when: Record<string, unknown>;
  note?: string;
  disabled?: boolean;
}

function parseRef(ref: string): { site: string; name: string } {
  const bare = ref.replace(/^tap:\/\//, "");
  const m = bare.match(/^([^/]+)\/([^/]+)$/);
  if (!m) throw new Error(`ref must be <site>/<name> or tap:// URI: ${ref}`);
  return { site: m[1], name: m[2] };
}

function renderPlist(
  label: string,
  decl: Declaration,
  site: string,
  name: string,
  opts: MaterializeOpts,
): string {
  const whenKeys = Object.keys(decl.when);
  if (whenKeys.length !== 1) {
    throw new Error(
      `\`when\` must have exactly one of calendar | interval_seconds | watch_path (got: ${
        whenKeys.join(", ") || "none"
      })`,
    );
  }

  let whenXml: string;
  const [kind] = whenKeys;
  const whenVal = decl.when[kind];
  switch (kind) {
    case "calendar": {
      const cals = Array.isArray(whenVal) ? whenVal : [whenVal];
      const body = cals.length === 1
        ? calendarDict(cals[0] as Record<string, unknown>, "  ")
        : [
          "  <array>",
          ...cals.map((c) => calendarDict(c as Record<string, unknown>, "    ")),
          "  </array>",
        ].join("\n");
      whenXml = `  <key>StartCalendarInterval</key>\n${body}`;
      break;
    }
    case "interval_seconds": {
      if (typeof whenVal !== "number" || whenVal < 60) {
        throw new Error(`interval_seconds must be a number >= 60: ${whenVal}`);
      }
      whenXml =
        `  <key>StartInterval</key>\n  <integer>${whenVal}</integer>`;
      break;
    }
    case "watch_path": {
      const paths = (Array.isArray(whenVal) ? whenVal : [whenVal]) as string[];
      whenXml = [
        "  <key>WatchPaths</key>",
        "  <array>",
        ...paths.map((p) =>
          `    <string>${
            xmlEscape(p.replace(/^~/, Deno.env.get("HOME") ?? "~"))
          }</string>`
        ),
        "  </array>",
      ].join("\n");
      break;
    }
    default:
      throw new Error(
        `\`when\` must have exactly one of calendar | interval_seconds | watch_path (got: ${kind})`,
      );
  }

  const argv = [opts.tapBin, `${site}/${name}`];
  if (decl.args !== undefined) {
    argv.push("--args", JSON.stringify(decl.args));
  }
  const binDir = opts.tapBin.slice(0, opts.tapBin.lastIndexOf("/"));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    decl.note ? `<!-- ${xmlEscape(decl.note)} -->` : "<!-- tap trigger -->",
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    "<dict>",
    "  <key>Label</key>",
    `  <string>${label}</string>`,
    "  <key>ProgramArguments</key>",
    "  <array>",
    ...argv.map((a) => `    <string>${xmlEscape(a)}</string>`),
    "  </array>",
    whenXml,
    "  <key>StandardOutPath</key>",
    `  <string>${xmlEscape(`${opts.logsDir}/${label}.log`)}</string>`,
    "  <key>StandardErrorPath</key>",
    `  <string>${xmlEscape(`${opts.logsDir}/${label}.err`)}</string>`,
    "  <key>EnvironmentVariables</key>",
    "  <dict>",
    "    <key>PATH</key>",
    `    <string>${
      xmlEscape(`${binDir}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`)
    }</string>`,
    "  </dict>",
    "</dict>",
    "</plist>",
    "",
  ].join("\n");
}

async function* walkTriggers(dir: string): AsyncGenerator<string> {
  let entries: Deno.DirEntry[];
  try {
    entries = [...Deno.readDirSync(dir)];
  } catch {
    return; // no triggers dir → nothing to materialize
  }
  for (const e of entries) {
    if (e.isDirectory) yield* walkTriggers(`${dir}/${e.name}`);
    else if (e.name.endsWith(".trigger.json")) yield `${dir}/${e.name}`;
  }
}

// ---------- main entry ----------

export async function materialize(opts: MaterializeOpts): Promise<Report> {
  const entries: Entry[] = [];
  const liveLabels = new Set<string>();

  for await (const path of walkTriggers(opts.triggersDir)) {
    const rel = path.slice(opts.triggersDir.length + 1);
    // <site>/<name>[.<slot>].trigger.json → label segments
    const fileBase = rel.slice(0, -".trigger.json".length);
    const label = `${NAMESPACE}.${fileBase.replaceAll("/", ".")}`;

    const refuse = (reason: string) => {
      entries.push({ declaration: rel, label, action: "refused", reason });
    };

    let decl: Declaration;
    try {
      decl = JSON.parse(await Deno.readTextFile(path));
    } catch (e) {
      refuse(`unparseable declaration: ${(e as Error).message}`);
      continue;
    }

    if (decl.disabled === true) {
      entries.push({ declaration: rel, label, action: "disabled" });
      continue; // its plist (if any) is now an orphan
    }

    let site: string, name: string;
    try {
      ({ site, name } = parseRef(decl.ref));
    } catch (e) {
      refuse((e as Error).message);
      continue;
    }

    // Referential integrity: the plan must exist on disk NOW.
    const planPath = `${opts.plansDir}/${site}/${name}.plan.json`;
    let plan: unknown;
    try {
      plan = JSON.parse(await Deno.readTextFile(planPath));
    } catch {
      refuse(
        `dangling ref ${site}/${name}: no plan at ${planPath} — capture it first`,
      );
      continue;
    }

    // Foreground gate (Safety): trusted:true ops need a foreground tab; an
    // unattended launchd run can never provide one.
    if (findTrustedOps(plan)) {
      refuse(
        `plan ${site}/${name} contains a trusted:true op (foreground CDP gesture) — ` +
          `unattended launchd runs cannot satisfy it; re-author below the gesture gate or drop the trigger`,
      );
      continue;
    }

    let warning: string | undefined;
    if ((plan as Record<string, unknown>).act !== undefined) {
      warning =
        `plan ${site}/${name} is a write variant — unattended mutation; ` +
        `confirm its postcondition is non-vacuous and intent_key dedups`;
    }

    let body: string;
    try {
      body = renderPlist(label, decl, site, name, opts);
    } catch (e) {
      refuse((e as Error).message);
      continue;
    }

    liveLabels.add(label);
    const plistPath = `${opts.agentsDir}/${label}.plist`;
    let existing: string | null = null;
    try {
      existing = await Deno.readTextFile(plistPath);
    } catch { /* absent */ }

    if (existing === body) {
      entries.push({ declaration: rel, label, action: "unchanged", warning });
    } else {
      await Deno.writeTextFile(plistPath, body);
      entries.push({
        declaration: rel,
        label,
        action: existing === null ? "created" : "updated",
        warning,
      });
    }
  }

  // Orphan sweep — strictly inside our namespace; foreign plists are
  // structurally unreachable (prefix filter before any file operation).
  const orphans: string[] = [];
  const pruned: string[] = [];
  try {
    for (const f of Deno.readDirSync(opts.agentsDir)) {
      if (!f.name.startsWith(`${NAMESPACE}.`) || !f.name.endsWith(".plist")) {
        continue;
      }
      const label = f.name.slice(0, -".plist".length);
      if (liveLabels.has(label)) continue;
      orphans.push(f.name);
      if (opts.prune) {
        await Deno.remove(`${opts.agentsDir}/${f.name}`);
        pruned.push(f.name);
      }
    }
  } catch { /* agentsDir absent → nothing to sweep */ }

  return {
    ok: entries.every((e) => e.action !== "refused"),
    entries,
    orphans: orphans.sort(),
    pruned: pruned.sort(),
  };
}

// ---------- CLI ----------

if (import.meta.main) {
  const HOME = Deno.env.get("HOME") ?? "";
  const argMap = new Map<string, string>();
  let prune = false;
  const argv = [...Deno.args];
  while (argv.length) {
    const a = argv.shift()!;
    if (a === "--prune") prune = true;
    else if (a.startsWith("--")) argMap.set(a.slice(2), argv.shift() ?? "");
  }
  const opts: MaterializeOpts = {
    triggersDir: argMap.get("triggers-dir") ?? `${HOME}/.tap/triggers`,
    plansDir: argMap.get("plans-dir") ?? `${HOME}/.tap/plans`,
    agentsDir: argMap.get("agents-dir") ?? `${HOME}/Library/LaunchAgents`,
    logsDir: argMap.get("logs-dir") ?? `${HOME}/Library/Logs/taprun`,
    tapBin: argMap.get("tap-bin") ?? `${HOME}/.tap/bin/tap`,
    prune,
  };
  await Deno.mkdir(opts.logsDir, { recursive: true }).catch(() => {});
  const report = await materialize(opts);
  console.log(JSON.stringify(report, null, 1));
  if (!report.ok) Deno.exit(1);
}
