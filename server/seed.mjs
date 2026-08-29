import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  db,
  countRuns,
  ensureDefaultSettings,
  insertOffer,
  insertRun,
  insertSourceResult,
  finishRun,
} from "./db.mjs";
import { normalizeOffers } from "./normalize.mjs";
import { offersToMarkdown, writeSnapshotFiles } from "./markdown.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadFixture() {
  return JSON.parse(readFileSync(join(ROOT, "fixtures", "seed-runs.json"), "utf8"));
}

function insertSeedRun(spec) {
  const runId = insertRun({
    started_at: spec.startedAt,
    trigger: spec.trigger || "seed",
    profile_key: spec.profile,
    normaal: spec.usage.normaal,
    dal: spec.usage.dal,
    gas: spec.usage.gas,
    postcode: spec.postcode,
    huisnummer: spec.huisnummer,
    status: "running",
  });

  const meta = {
    startedAt: spec.startedAtLabel || spec.startedAt,
    postcode: spec.postcode,
    huisnummer: spec.huisnummer,
    normaal: spec.usage.normaal,
    dal: spec.usage.dal,
    gas: spec.usage.gas,
    profile: spec.profile,
    trigger: spec.trigger || "seed",
  };

  const allOffers = [];
  const sourceStatus = [];
  const perSource = {};

  for (const src of spec.sources) {
    const offers = normalizeOffers(src.offers, src.id);
    const markdown = offersToMarkdown({
      title: `${src.id} — ${spec.profile}`,
      meta,
      offers,
      sourceStatus: [{ source: src.id, status: src.status || "success", offer_count: offers.length, error: src.error }],
    });
    perSource[src.id] = markdown;
    const sourceResultId = insertSourceResult({
      run_id: runId,
      source: src.id,
      status: src.status || "success",
      error: src.error || null,
      offer_count: offers.length,
      duration_ms: src.duration_ms || 1200,
      raw_json: JSON.stringify(src.offers),
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
      source: src.id,
      status: src.status || "success",
      offer_count: offers.length,
      error: src.error || null,
    });
  }

  allOffers.sort((a, b) => (a.yearlyTotal ?? 1e9) - (b.yearlyTotal ?? 1e9));
  const combined = offersToMarkdown({
    title: `Energievergelijking — ${spec.profile}`,
    meta,
    offers: allOffers,
    sourceStatus,
  });
  const files = writeSnapshotFiles({
    runId,
    startedAt: spec.startedAt,
    combined,
    perSource,
  });
  for (const s of files.sources) {
    db.prepare("UPDATE source_results SET markdown_path = ? WHERE run_id = ? AND source = ?").run(
      s.path,
      runId,
      s.source
    );
  }
  const ok = sourceStatus.filter((s) => s.status === "success").length;
  const status = ok === 0 ? "error" : ok === sourceStatus.length ? "success" : "partial";
  finishRun(runId, {
    status,
    finished_at: spec.finishedAt || spec.startedAt,
    markdown_path: files.combinedPath,
  });
  return runId;
}

export function seedIfEmpty() {
  ensureDefaultSettings();
  if (countRuns() > 0) return { seeded: false, runs: countRuns() };
  const fixture = loadFixture();
  const ids = fixture.runs.map((spec) => insertSeedRun(spec));
  return { seeded: true, runs: ids.length, ids };
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
if (isMain) {
  console.log(seedIfEmpty());
}
