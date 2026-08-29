import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { DEFAULT_SETTINGS } from "./defaults.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_DIR = process.env.DATA_DIR || join(ROOT, "data");
export const SNAPSHOT_DIR = join(DATA_DIR, "snapshots");
export const DB_PATH = process.env.DB_PATH || join(DATA_DIR, "energie.db");

mkdirSync(SNAPSHOT_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  trigger TEXT NOT NULL,
  profile_key TEXT NOT NULL,
  normaal INTEGER NOT NULL,
  dal INTEGER NOT NULL,
  gas INTEGER NOT NULL,
  postcode TEXT NOT NULL,
  huisnummer TEXT NOT NULL,
  status TEXT NOT NULL,
  markdown_path TEXT
);

CREATE TABLE IF NOT EXISTS source_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  offer_count INTEGER DEFAULT 0,
  duration_ms INTEGER,
  raw_json TEXT,
  markdown TEXT,
  markdown_path TEXT
);

CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  source_result_id INTEGER NOT NULL REFERENCES source_results(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  provider TEXT,
  provider_key TEXT,
  product TEXT,
  contract_type TEXT,
  duration_months INTEGER,
  monthly_total REAL,
  yearly_total REAL,
  discount REAL,
  rating REAL,
  reviews INTEGER,
  kwh_normaal REAL,
  kwh_dal REAL,
  m3_gas REAL,
  raw_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_offers_run ON offers(run_id);
CREATE INDEX IF NOT EXISTS idx_offers_provider ON offers(provider_key, yearly_total);
CREATE INDEX IF NOT EXISTS idx_offers_source ON offers(source, provider_key);
CREATE INDEX IF NOT EXISTS idx_runs_profile ON runs(profile_key, started_at);
CREATE INDEX IF NOT EXISTS idx_source_results_run ON source_results(run_id);
`);

const getSetting = db.prepare("SELECT value FROM settings WHERE key = ?");
const setSetting = db.prepare("INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");

function parseSetting(key, raw) {
  if (raw == null) return structuredClone(DEFAULT_SETTINGS[key]);
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function loadSettings() {
  const out = structuredClone(DEFAULT_SETTINGS);
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const row = getSetting.get(key);
    if (row) out[key] = parseSetting(key, row.value);
  }
  return out;
}

export function saveSettings(partial) {
  const current = loadSettings();
  const next = { ...current, ...partial };
  if (partial.usage) next.usage = { ...current.usage, ...partial.usage };
  for (const [key, value] of Object.entries(next)) {
    setSetting.run(key, JSON.stringify(value));
  }
  return next;
}

export function ensureDefaultSettings() {
  const existing = db.prepare("SELECT COUNT(*) AS n FROM settings").get();
  if (existing.n === 0) saveSettings(DEFAULT_SETTINGS);
  return loadSettings();
}

export function insertRun(row) {
  const r = db
    .prepare(
      `INSERT INTO runs (started_at, trigger, profile_key, normaal, dal, gas, postcode, huisnummer, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      row.started_at,
      row.trigger,
      row.profile_key,
      row.normaal,
      row.dal,
      row.gas,
      row.postcode,
      row.huisnummer,
      row.status
    );
  return Number(r.lastInsertRowid);
}

export function finishRun(id, { status, finished_at, markdown_path }) {
  db.prepare("UPDATE runs SET status = ?, finished_at = ?, markdown_path = ? WHERE id = ?").run(
    status,
    finished_at,
    markdown_path ?? null,
    id
  );
}

export function insertSourceResult(row) {
  const r = db
    .prepare(
      `INSERT INTO source_results (run_id, source, status, error, offer_count, duration_ms, raw_json, markdown, markdown_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      row.run_id,
      row.source,
      row.status,
      row.error ?? null,
      row.offer_count ?? 0,
      row.duration_ms ?? null,
      row.raw_json ?? null,
      row.markdown ?? null,
      row.markdown_path ?? null
    );
  return Number(r.lastInsertRowid);
}

export function insertOffer(row) {
  db.prepare(
    `INSERT INTO offers (
      run_id, source_result_id, source, provider, provider_key, product, contract_type,
      duration_months, monthly_total, yearly_total, discount, rating, reviews,
      kwh_normaal, kwh_dal, m3_gas, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    row.run_id,
    row.source_result_id,
    row.source,
    row.provider,
    row.provider_key,
    row.product,
    row.contract_type,
    row.duration_months,
    row.monthly_total,
    row.yearly_total,
    row.discount,
    row.rating,
    row.reviews,
    row.kwh_normaal,
    row.kwh_dal,
    row.m3_gas,
    row.raw_json
  );
}

export function getRun(id) {
  return db.prepare("SELECT * FROM runs WHERE id = ?").get(id);
}

export function listRuns({ profile, limit = 50 } = {}) {
  if (profile) {
    return db
      .prepare("SELECT * FROM runs WHERE profile_key = ? ORDER BY started_at DESC LIMIT ?")
      .all(profile, limit);
  }
  return db.prepare("SELECT * FROM runs ORDER BY started_at DESC LIMIT ?").all(limit);
}

export function latestRunForProfile(profile) {
  return db
    .prepare(
      "SELECT * FROM runs WHERE profile_key = ? AND status IN ('success', 'partial') ORDER BY started_at DESC LIMIT 1"
    )
    .get(profile);
}

export function sourceResultsForRun(runId) {
  return db.prepare("SELECT * FROM source_results WHERE run_id = ? ORDER BY source").all(runId);
}

export function offersForRun(runId) {
  return db
    .prepare("SELECT * FROM offers WHERE run_id = ? ORDER BY yearly_total IS NULL, yearly_total ASC")
    .all(runId);
}

export function countRuns() {
  return db.prepare("SELECT COUNT(*) AS n FROM runs").get().n;
}

export function listSnapshots() {
  return db
    .prepare(
      `SELECT sr.id, sr.run_id, sr.source, sr.status, sr.offer_count, sr.markdown_path, sr.error,
              r.started_at, r.profile_key, r.normaal, r.dal, r.gas, r.trigger, r.markdown_path AS run_markdown_path
       FROM source_results sr
       JOIN runs r ON r.id = sr.run_id
       ORDER BY r.started_at DESC, sr.source`
    )
    .all();
}

export function getSourceResult(id) {
  return db
    .prepare(
      `SELECT sr.*, r.started_at, r.profile_key, r.normaal, r.dal, r.gas, r.postcode, r.huisnummer
       FROM source_results sr JOIN runs r ON r.id = sr.run_id WHERE sr.id = ?`
    )
    .get(id);
}

export function trendPoints({ providerKey, source, profile, metric = "yearly_total" } = {}) {
  const col = metric === "monthly" ? "o.monthly_total" : "o.yearly_total";
  const where = ["r.status IN ('success', 'partial')", `${col} IS NOT NULL`];
  const params = [];
  if (providerKey) {
    where.push("o.provider_key = ?");
    params.push(providerKey);
  }
  if (source) {
    where.push("o.source = ?");
    params.push(source);
  }
  if (profile) {
    where.push("r.profile_key = ?");
    params.push(profile);
  }
  return db
    .prepare(
      `SELECT r.started_at AS t, o.provider, o.provider_key, o.product, o.source,
              r.profile_key, o.monthly_total, o.yearly_total
       FROM offers o JOIN runs r ON r.id = o.run_id
       WHERE ${where.join(" AND ")}
       ORDER BY r.started_at ASC`
    )
    .all(...params);
}

export function distinctProviders() {
  return db
    .prepare(
      `SELECT provider_key, provider, COUNT(*) AS n
       FROM offers WHERE provider_key IS NOT NULL AND provider_key != ''
       GROUP BY provider_key ORDER BY n DESC, provider`
    )
    .all();
}

export function distinctSources() {
  return db.prepare("SELECT DISTINCT source FROM source_results ORDER BY source").all().map((r) => r.source);
}
