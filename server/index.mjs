import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import {
  distinctProviders,
  distinctSources,
  ensureDefaultSettings,
  getRun,
  getSourceResult,
  latestRunForProfile,
  listRuns,
  listSnapshots,
  loadSettings,
  saveSettings,
  SNAPSHOT_DIR,
  trendPoints,
} from "./db.mjs";
import { PROFILE_KEYS, USAGE_PRESETS, cronToDailyTime, dailyTimeToCron } from "./defaults.mjs";
import { executeCompare, getInFlight, hydrateRun, sourceCatalog } from "./compare.mjs";
import { applySchedule, cronFromSettings, schedulerStatus } from "./scheduler.mjs";
import { seedIfEmpty } from "./seed.mjs";
import { providerKey } from "./providers.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIST = join(ROOT, "web", "dist");
const PORT = Number(process.env.PORT || 3000);

ensureDefaultSettings();
const seedResult = seedIfEmpty();
if (seedResult.seeded) console.log(`[seed] ${seedResult.runs} voorbeeld-runs geladen`);
applySchedule();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, seed: seedResult, scheduler: schedulerStatus() });
});

app.get("/api/meta", (_req, res) => {
  res.json({
    presets: USAGE_PRESETS,
    sources: sourceCatalog(),
    profiles: PROFILE_KEYS,
    timezone: "Europe/Amsterdam",
  });
});

app.get("/api/settings", (_req, res) => {
  res.json({ settings: loadSettings(), scheduler: schedulerStatus() });
});

app.put("/api/settings", (req, res) => {
  const body = req.body || {};
  const current = loadSettings();
  const next = { ...current };

  if (body.postcode != null) next.postcode = String(body.postcode).replace(/\s+/g, "").toUpperCase();
  if (body.huisnummer != null) next.huisnummer = String(body.huisnummer);
  if (body.timezone) next.timezone = body.timezone;
  if (body.scheduleProfile && PROFILE_KEYS.includes(body.scheduleProfile)) {
    next.scheduleProfile = body.scheduleProfile;
  }
  if (Array.isArray(body.enabledSources)) next.enabledSources = body.enabledSources;
  if (Array.isArray(body.highlightedProviders)) {
    next.highlightedProviders = body.highlightedProviders.map((p) => providerKey(p) || p);
  }
  if (body.usage && typeof body.usage === "object") {
    next.usage = { ...current.usage };
    for (const key of PROFILE_KEYS) {
      if (body.usage[key]) {
        next.usage[key] = {
          normaal: Number(body.usage[key].normaal),
          dal: Number(body.usage[key].dal),
          gas: Number(body.usage[key].gas),
        };
      }
    }
  }
  if (body.cronMode === "advanced" || body.cronMode === "daily") next.cronMode = body.cronMode;
  if (body.dailyTime) {
    next.dailyTime = body.dailyTime;
    if (next.cronMode !== "advanced") next.cronExpression = dailyTimeToCron(body.dailyTime);
  }
  if (body.cronExpression) {
    next.cronExpression = body.cronExpression;
    const asDaily = cronToDailyTime(body.cronExpression);
    if (asDaily) next.dailyTime = asDaily;
  }

  const saved = saveSettings(next);
  const schedule = applySchedule(saved);
  res.json({ settings: saved, scheduler: schedulerStatus(), schedule });
});

app.get("/api/runs", (req, res) => {
  res.json({ runs: listRuns({ profile: req.query.profile, limit: Number(req.query.limit) || 50 }) });
});

app.get("/api/runs/:id", (req, res) => {
  const run = hydrateRun(Number(req.params.id));
  if (!run) return res.status(404).json({ error: "Run niet gevonden" });
  const settings = loadSettings();
  res.json({
    run,
    highlighted: settings.highlightedProviders,
  });
});

app.get("/api/results/latest", (req, res) => {
  const settings = loadSettings();
  const profiles = {};
  for (const key of PROFILE_KEYS) {
    const runRow = latestRunForProfile(key);
    profiles[key] = runRow ? hydrateRun(runRow.id) : null;
  }
  res.json({
    profiles,
    highlighted: settings.highlightedProviders,
    settings: {
      postcode: settings.postcode,
      huisnummer: settings.huisnummer,
      usage: settings.usage,
    },
  });
});

app.get("/api/trends", (req, res) => {
  const points = trendPoints({
    providerKey: req.query.provider || undefined,
    source: req.query.source || undefined,
    profile: req.query.profile || undefined,
    metric: req.query.metric,
  });
  res.json({
    points,
    providers: distinctProviders(),
    sources: distinctSources(),
    highlighted: loadSettings().highlightedProviders,
  });
});

app.get("/api/providers", (_req, res) => {
  res.json({ providers: distinctProviders() });
});

app.get("/api/snapshots", (_req, res) => {
  const settings = loadSettings();
  const runs = listRuns({ limit: 100 });
  const sources = listSnapshots();
  res.json({
    runs: runs.map((r) => ({
      id: r.id,
      started_at: r.started_at,
      profile_key: r.profile_key,
      trigger: r.trigger,
      status: r.status,
      markdown_path: r.markdown_path,
      normaal: r.normaal,
      dal: r.dal,
      gas: r.gas,
    })),
    sources,
    snapshotDir: SNAPSHOT_DIR,
    highlighted: settings.highlightedProviders,
  });
});

app.get("/api/snapshots/:kind/:id", (req, res) => {
  const { kind, id } = req.params;
  if (kind === "run") {
    const run = getRun(Number(id));
    if (!run?.markdown_path || !existsSync(run.markdown_path)) {
      return res.status(404).json({ error: "Snapshot niet gevonden" });
    }
    const markdown = readFileSync(run.markdown_path, "utf8");
    if (req.query.download) {
      res.setHeader("content-disposition", `attachment; filename="run-${run.id}.md"`);
    }
    res.type("text/markdown").send(markdown);
    return;
  }
  if (kind === "source") {
    const row = getSourceResult(Number(id));
    if (!row) return res.status(404).json({ error: "Snapshot niet gevonden" });
    const markdown = row.markdown_path && existsSync(row.markdown_path) ? readFileSync(row.markdown_path, "utf8") : row.markdown;
    if (!markdown) return res.status(404).json({ error: "Geen markdown" });
    if (req.query.download) {
      res.setHeader("content-disposition", `attachment; filename="${row.source}-run-${row.run_id}.md"`);
    }
    res.type("text/markdown").send(markdown);
    return;
  }
  res.status(400).json({ error: "Onbekend type" });
});

app.post("/api/compare", async (req, res) => {
  const body = req.body || {};
  try {
    const { runId, promise } = await executeCompare({
      trigger: body.trigger || "manual",
      profile: body.profile,
      usage: body.usage,
      postcode: body.postcode,
      huisnummer: body.huisnummer,
      sources: body.sources,
    });
    if (body.wait) {
      const result = await promise;
      return res.json({ runId, run: result });
    }
    promise.catch((err) => console.error("[compare]", err));
    res.status(202).json({ runId, status: "running" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/compare/status/:id", (req, res) => {
  const id = Number(req.params.id);
  const flying = getInFlight(id);
  const run = hydrateRun(id);
  if (!run && !flying) return res.status(404).json({ error: "Run niet gevonden" });
  res.json({ inFlight: Boolean(flying), run });
});

if (existsSync(WEB_DIST)) {
  app.use(express.static(WEB_DIST));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(join(WEB_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Energievergelijker op http://localhost:${PORT}`);
  console.log(`Highlights: ${loadSettings().highlightedProviders.join(", ")}`);
});
