"use client";

import { SweepApi } from "./useSweep";

export default function ScrapeControls({
  scenarioId,
  scenarioLabel,
  sweep,
}: {
  scenarioId: number | null;
  scenarioLabel: string;
  sweep: SweepApi;
}) {
  const { busy, status, error, label, start } = sweep;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={busy || scenarioId == null}
        onClick={() => scenarioId != null && start({ scenarioId }, scenarioLabel)}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
        title="Draait de 6 scrapers voor het geselecteerde scenario (standaardadres)"
      >
        ▶ Scrape dit scenario
      </button>
      <button
        disabled={busy}
        onClick={() => start({ presets: true }, "alle 4 presets")}
        className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 disabled:opacity-40"
        title="Draait de 6 scrapers voor alle 4 preset-scenario's (duurt langer)"
      >
        ⟳ Ververs alle presets
      </button>

      {label && status && (
        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
            status.done
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : "bg-amber-50 text-amber-700 ring-amber-200"
          }`}
        >
          {!status.done && (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          )}
          {status.done
            ? `Klaar — ${label}: ${status.runs.reduce((s, r) => s + r.offers, 0)} contracten`
            : `Bezig met ${label}… ${status.completed}/${status.expected} platforms`}
          {status.runs.length > 0 && !status.done && (
            <span className="text-amber-500">({status.runs.map((r) => r.platform.split(".")[0]).join(", ")})</span>
          )}
        </span>
      )}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
