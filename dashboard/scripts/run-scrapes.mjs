#!/usr/bin/env node
// Runs the 6 real scraper CLIs (in the parent directory) for a scenario and
// POSTs each result to the dashboard's ingest API.
//
// Usage:
//   node scripts/run-scrapes.mjs --scenario medium [--postcode 5216EK --huisnr 27]
//   node scripts/run-scrapes.mjs --scenario all
//   node scripts/run-scrapes.mjs --normaal 2900 --dal 0 --gas 1200 --teruglevering 0
//
// Presets (by slug, or "all") and the default address are NOT hardcoded here:
// they are configured on /admin/presets and fetched from GET /api/presets of
// the dashboard (DASHBOARD_URL), which must therefore be running.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const SCRAPER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const API = process.env.DASHBOARD_URL ?? "http://localhost:3000";
const PLATFORMS = ["gaslicht", "energiekiezer", "energievergelijk", "independer", "overstappen", "pricewise"];

const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : d;
};
const scenarioArg = flag("scenario", "");
const config = scenarioArg || !flag("postcode") || !flag("huisnr") ? await loadPresetConfig(API) : null;
const scenarios = scenarioArg ? presetScenarios(config, scenarioArg) : [
  {
    name: null,
    normaal: Number(flag("normaal", 2500)),
    dal: Number(flag("dal", 0)),
    gas: Number(flag("gas", 1000)),
    teruglevering: Number(flag("teruglevering", 0)),
  },
];
const postcode = flag("postcode", config?.address.postcode);
const huisnr = flag("huisnr", config?.address.huisnr);
const sweepId = flag("sweep-id", `${new Date().toISOString()}-${randomUUID().slice(0, 8)}`);

for (const scenario of scenarios) await runSweep(scenario);
console.log("Done.");

/** Presets + default address as configured on /admin/presets. Exits on failure:
 *  guessing an address or usage would silently produce wrong rankings. */
async function loadPresetConfig(api) {
  try {
    const res = await fetch(`${api}/api/presets`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`Kan presets/standaardadres niet ophalen van ${api}/api/presets (${e.message}) — draait het dashboard?`);
    process.exit(1);
  }
}

function presetScenarios(config, slug) {
  const presets = config.presets.map((p) => ({
    name: p.name,
    normaal: p.electricityNormal,
    dal: p.electricityLow,
    gas: p.gas,
    teruglevering: p.solarFeedIn,
  }));
  if (slug === "all") {
    if (!presets.length) {
      console.error("Geen presets geconfigureerd (zie /admin/presets).");
      process.exit(1);
    }
    return presets;
  }
  const found = presets.find((p) => p.name === slug);
  if (!found) {
    console.error(`Onbekende preset "${slug}" (beschikbaar: ${presets.map((p) => p.name).join(", ") || "geen"}).`);
    process.exit(1);
  }
  return [found];
}

async function runSweep(scenario) {
  console.log(
    `Sweep ${sweepId} — scenario ${scenario.name ?? "custom"} (${scenario.normaal}/${scenario.dal} kWh, ${scenario.gas} m3, terug ${scenario.teruglevering})`
  );
  const scenarioBody = {
    name: scenario.name ?? undefined,
    electricityNormal: scenario.normaal,
    electricityLow: scenario.dal,
    gas: scenario.gas,
    solarFeedIn: scenario.teruglevering,
  };

  // Every outcome — success OR failure — is reported to the ingest API so the
  // dashboard can show per-platform sweep status instead of hanging at 0/N.
  const report = async (platform, payload) => {
    try {
      const res = await fetch(`${API}/api/scrapes/ingest`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform, sweepId, scenario: scenarioBody, postcode, huisnr, ...payload }),
      });
      let detail = "?";
      try {
        const b = await res.json();
        detail = b.runId ?? b.error ?? "?";
      } catch {
        detail = "unparseable response";
      }
      return `ingest ${res.status} (run ${detail})`;
    } catch (e) {
      return `ingest unreachable: ${String(e.message).slice(0, 120)}`;
    }
  };

  for (const platform of PLATFORMS) {
    const cliArgs = [
      path.join(SCRAPER_DIR, `${platform}-client.mjs`),
      postcode, huisnr,
      "--normaal", String(scenario.normaal),
      "--dal", String(scenario.dal),
      "--gas", String(scenario.gas),
      "--json",
    ];
    if (scenario.teruglevering > 0) cliArgs.push("--teruglevering", String(scenario.teruglevering));

    let records = [];
    let scrapeError = null;
    try {
      const { stdout } = await exec("node", cliArgs, { cwd: SCRAPER_DIR, maxBuffer: 64 * 1024 * 1024, timeout: 300_000, windowsHide: true });
      records = JSON.parse(stdout);
      if (!records.length) scrapeError = "scraper returned 0 offers";
    } catch (e) {
      // execFile puts the CLI's stderr on e.stderr — that's where the real error is.
      scrapeError = (e.stderr?.trim() || e.message || "unknown error").slice(0, 500);
    }

    if (scrapeError) {
      const out = await report(platform, { status: "failed", error: scrapeError, records: [] });
      console.error(`  ${platform}: FAILED — ${scrapeError.slice(0, 150)} -> ${out}`);
    } else {
      const out = await report(platform, { records });
      console.log(`  ${platform}: ${records.length} offers -> ${out}`);
    }
  }
}
