#!/usr/bin/env node
// Runs the screenshot clients (in the parent directory) for a scenario and
// prints the saved screenshot path per platform. Mirrors run-scrapes.mjs so
// the dashboard can trigger screenshots the same way it triggers sweeps.
//
// Usage:
//   node scripts/run-screenshots.mjs --scenario medium [--postcode 5216EK --huisnr 27]
//   node scripts/run-screenshots.mjs --normaal 2900 --dal 0 --gas 1200
//   node scripts/run-screenshots.mjs --only gaslicht --postcode 5216EK --huisnr 27
//
// Presets: low | medium | high | solar (same tuples as run-scrapes.mjs).
// Screenshots land in SHOTS_DIR (default: <repo root>/screenshots).

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const SHOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".."); // repo root
const PLATFORMS = ["gaslicht", "energiekiezer", "energievergelijk", "independer", "overstappen", "pricewise"];

const PRESETS = {
  low: { name: "low", normaal: 1500, dal: 0, gas: 800, teruglevering: 0 },
  medium: { name: "medium", normaal: 2900, dal: 0, gas: 1200, teruglevering: 0 },
  high: { name: "high", normaal: 4500, dal: 0, gas: 2000, teruglevering: 0 },
  solar: { name: "solar", normaal: 3500, dal: 0, gas: 1000, teruglevering: 2000 },
};

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const scenarioArg = flag("scenario", "");
const scenario = PRESETS[scenarioArg] ?? {
  name: null,
  normaal: Number(flag("normaal", 2500)),
  dal: Number(flag("dal", 0)),
  gas: Number(flag("gas", 1000)),
  teruglevering: Number(flag("teruglevering", 0)),
};
const postcode = flag("postcode", "5216EK");
const huisnr = flag("huisnr", "27");
const only = flag("only", "");
const platforms = only ? PLATFORMS.filter((p) => p === only) : PLATFORMS;
if (only && !platforms.length) {
  console.error(`Onbekend platform "${only}" (${PLATFORMS.join(", ")})`);
  process.exit(1);
}

console.log(
  `Screenshots — ${postcode} ${huisnr} — scenario ${scenario.name ?? "custom"} ` +
    `(${scenario.normaal}/${scenario.dal} kWh, ${scenario.gas} m3, terug ${scenario.teruglevering})`
);

const results = [];
// Sequential: the screenshot clients share one remote browserless instance.
for (const platform of platforms) {
  const cliArgs = [
    path.join(SHOT_DIR, `screenshot-${platform}.mjs`),
    postcode, huisnr,
    "--normaal", String(scenario.normaal),
    "--dal", String(scenario.dal),
    "--gas", String(scenario.gas),
  ];
  if (scenario.teruglevering > 0) cliArgs.push("--teruglevering", String(scenario.teruglevering));

  try {
    const { stdout } = await exec("node", cliArgs, {
      cwd: SHOT_DIR,
      maxBuffer: 16 * 1024 * 1024,
      timeout: 300_000,
      windowsHide: true,
    });
    const file = stdout.match(/screenshot:\s*(.+\.png)\s*$/m)?.[1]?.trim() ?? null;
    results.push({ platform, ok: true, file });
    console.log(`  ${platform}: OK${file ? ` -> ${file}` : ""}`);
  } catch (e) {
    const err = (e.stderr?.trim() || e.message || "unknown error").split("\n")[0].slice(0, 200);
    results.push({ platform, ok: false, error: err });
    console.error(`  ${platform}: FAILED — ${err}`);
  }
}

const ok = results.filter((r) => r.ok).length;
console.log(`\nDone. ${ok}/${platforms.length} screenshots.`);
process.exitCode = ok === platforms.length ? 0 : 1;
