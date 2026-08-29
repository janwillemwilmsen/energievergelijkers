import {
  db,
  insertOffer,
  insertRun,
  insertSourceResult,
  finishRun,
  getRun,
  offersForRun,
  sourceResultsForRun,
  loadSettings,
} from "./db.mjs";
import { SOURCES, SOURCE_BY_ID, runSource } from "./clients.mjs";
import { normalizeOffers } from "./normalize.mjs";
import { offersToMarkdown, writeSnapshotFiles } from "./markdown.mjs";
import { usageForProfile } from "./defaults.mjs";

const SOURCE_TIMEOUT_MS = Number(process.env.SOURCE_TIMEOUT_MS || 90_000);

const inFlight = new Map();

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout na ${ms / 1000}s`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function amsterdamNow(date = new Date()) {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export function getInFlight(runId) {
  return inFlight.get(runId) ?? null;
}

export async function executeCompare({
  trigger = "manual",
  profile,
  usage: usageOverride,
  postcode: postcodeOverride,
  huisnummer: huisnummerOverride,
  sources: sourceIds,
  startedAt,
} = {}) {
  const settings = loadSettings();
  const usage = usageOverride
    ? {
        profile: profile || "custom",
        normaal: Number(usageOverride.normaal),
        dal: Number(usageOverride.dal),
        gas: Number(usageOverride.gas),
      }
    : usageForProfile(settings, profile || settings.scheduleProfile);
  const postcode = (postcodeOverride || settings.postcode).replace(/\s+/g, "").toUpperCase();
  const huisnummer = String(huisnummerOverride || settings.huisnummer);
  const enabled = new Set(sourceIds || settings.enabledSources || SOURCES.map((s) => s.id));
  const sources = SOURCES.filter((s) => enabled.has(s.id));

  const started = startedAt ? new Date(startedAt) : new Date();
  const startedIso = started.toISOString();

  const runId = insertRun({
    started_at: startedIso,
    trigger,
    profile_key: usage.profile,
    normaal: usage.normaal,
    dal: usage.dal,
    gas: usage.gas,
    postcode,
    huisnummer,
    status: "running",
  });

  const job = runSources({ runId, sources, postcode, huisnummer, usage, startedIso, trigger });
  inFlight.set(runId, { runId, startedAt: startedIso, sources: sources.map((s) => s.id) });
  job.finally(() => inFlight.delete(runId));
  return { runId, promise: job };
}

async function runSources({ runId, sources, postcode, huisnummer, usage, startedIso, trigger }) {
  const meta = {
    startedAt: amsterdamNow(new Date(startedIso)),
    postcode,
    huisnummer,
    normaal: usage.normaal,
    dal: usage.dal,
    gas: usage.gas,
    profile: usage.profile,
    trigger,
  };

  const settled = await Promise.allSettled(
    sources.map(async (source) => {
      const t0 = Date.now();
      try {
        const raw = await withTimeout(
          runSource(source, postcode, huisnummer, usage),
          SOURCE_TIMEOUT_MS,
          source.id
        );
        const offers = normalizeOffers(raw, source.id);
        return { source, raw, offers, duration_ms: Date.now() - t0, error: null };
      } catch (err) {
        return {
          source,
          raw: null,
          offers: [],
          duration_ms: Date.now() - t0,
          error: err?.message || String(err),
        };
      }
    })
  );

  const perSourceMd = {};
  const allOffers = [];
  const sourceStatus = [];

  for (const item of settled) {
    const payload = item.status === "fulfilled" ? item.value : null;
    const source = payload?.source ?? { id: "unknown", label: "unknown" };
    const error = payload?.error || (item.status === "rejected" ? item.reason?.message : null);
    const offers = payload?.offers ?? [];
    const markdown = offersToMarkdown({
      title: `${source.label ?? source.id} — ${meta.profile}`,
      meta,
      offers,
      sourceStatus: [
        {
          source: source.id,
          status: error ? "error" : "success",
          offer_count: offers.length,
          error,
        },
      ],
    });
    perSourceMd[source.id] = markdown;
    const sourceResultId = insertSourceResult({
      run_id: runId,
      source: source.id,
      status: error ? "error" : "success",
      error,
      offer_count: offers.length,
      duration_ms: payload?.duration_ms,
      raw_json: payload?.raw ? JSON.stringify(payload.raw) : null,
      markdown,
    });
    for (const o of offers) {
      insertOffer({
        run_id: runId,
        source_result_id: sourceResultId,
        source: o.source,
        provider: o.provider,
        provider_key: o.providerKey,
        product: o.product,
        contract_type: o.contractType,
        duration_months: o.durationMonths,
        monthly_total: o.monthlyTotal,
        yearly_total: o.yearlyTotal,
        discount: o.discount,
        rating: o.rating,
        reviews: o.reviews,
        kwh_normaal: o.tariffs?.kwhNormaal ?? null,
        kwh_dal: o.tariffs?.kwhDal ?? null,
        m3_gas: o.tariffs?.m3Gas ?? null,
        raw_json: JSON.stringify(o.raw ?? o),
      });
      allOffers.push(o);
    }
    sourceStatus.push({
      source: source.id,
      status: error ? "error" : "success",
      offer_count: offers.length,
      error,
    });
  }

  allOffers.sort((a, b) => (a.yearlyTotal ?? 1e9) - (b.yearlyTotal ?? 1e9));
  const combined = offersToMarkdown({
    title: `Energievergelijking — ${meta.profile}`,
    meta,
    offers: allOffers,
    sourceStatus,
  });

  const files = writeSnapshotFiles({
    runId,
    startedAt: startedIso,
    combined,
    perSource: perSourceMd,
  });

  for (const s of files.sources) {
    dbUpdateSourcePath(runId, s.source, s.path);
  }

  const ok = sourceStatus.filter((s) => s.status === "success").length;
  const status = ok === 0 ? "error" : ok === sourceStatus.length ? "success" : "partial";
  finishRun(runId, { status, finished_at: new Date().toISOString(), markdown_path: files.combinedPath });
  return hydrateRun(runId);
}

function dbUpdateSourcePath(runId, source, path) {
  db.prepare("UPDATE source_results SET markdown_path = ? WHERE run_id = ? AND source = ?").run(path, runId, source);
}

export function hydrateRun(runId) {
  const run = getRun(runId);
  if (!run) return null;
  return {
    ...run,
    sources: sourceResultsForRun(runId).map((s) => ({
      ...s,
      raw_json: undefined,
      markdown: undefined,
    })),
    offers: offersForRun(runId).map((o) => ({
      ...o,
      raw_json: undefined,
    })),
  };
}

export async function executeCompareAndWait(opts) {
  const { runId, promise } = await executeCompare(opts);
  const result = await promise;
  return { runId, result };
}

export function sourceCatalog() {
  return SOURCES.map((s) => ({
    id: s.id,
    label: s.label,
    site: s.site,
    enabledByDefault: true,
  }));
}

export { SOURCE_BY_ID };
