import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SNAPSHOT_DIR } from "./db.mjs";

function eur(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `€${Number(n).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDuration(months) {
  if (months == null) return "onbepaald";
  if (months % 12 === 0) return `${months / 12} jaar`;
  return `${months} mnd`;
}

export function offersToMarkdown({ title, meta, offers, sourceStatus }) {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`- **Tijdstip:** ${meta.startedAt}`);
  lines.push(`- **Adres:** ${meta.postcode} ${meta.huisnummer}`);
  lines.push(`- **Verbruik:** ${meta.normaal} kWh normaal + ${meta.dal} kWh dal, ${meta.gas} m³ gas`);
  lines.push(`- **Profiel:** ${meta.profile}`);
  if (meta.trigger) lines.push(`- **Trigger:** ${meta.trigger}`);
  lines.push("");

  if (sourceStatus?.length) {
    lines.push("## Bronnen");
    lines.push("");
    for (const s of sourceStatus) {
      const mark = s.status === "success" ? "ok" : "fout";
      lines.push(
        `- ${s.source}: ${mark}${s.offer_count != null ? ` (${s.offer_count} aanbiedingen)` : ""}${s.error ? ` — ${s.error}` : ""}`
      );
    }
    lines.push("");
  }

  lines.push("## Aanbiedingen");
  lines.push("");
  lines.push("| Bron | Leverancier | Product | Per maand | Per jaar | Korting | Looptijd | Cijfer |");
  lines.push("| --- | --- | --- | ---: | ---: | ---: | --- | ---: |");
  for (const o of offers) {
    const product = String(o.product ?? "").replace(/\|/g, "/");
    lines.push(
      `| ${o.source} | ${o.provider ?? ""} | ${product} | ${eur(o.monthlyTotal ?? o.monthly_total)} | ${eur(o.yearlyTotal ?? o.yearly_total)} | ${eur(o.discount)} | ${fmtDuration(o.durationMonths ?? o.duration_months)} | ${o.rating ?? "—"} |`
    );
  }
  if (!offers.length) {
    lines.push("| — | — | geen aanbiedingen | — | — | — | — | — |");
  }
  lines.push("");
  return lines.join("\n");
}

function stamp(iso) {
  return iso.replace(/[:.]/g, "-").replace("T", "_").replace("Z", "Z");
}

export function writeSnapshotFiles({ runId, startedAt, combined, perSource }) {
  mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const base = `${stamp(startedAt)}_run-${runId}`;
  const combinedName = `${base}_all.md`;
  const combinedPath = join(SNAPSHOT_DIR, combinedName);
  writeFileSync(combinedPath, combined, "utf8");

  const sources = [];
  for (const [source, markdown] of Object.entries(perSource)) {
    const name = `${base}_${source}.md`;
    const path = join(SNAPSHOT_DIR, name);
    writeFileSync(path, markdown, "utf8");
    sources.push({ source, filename: name, path });
  }
  return { combinedPath, combinedName, sources };
}
