"use client";

import { useState } from "react";
import Link from "next/link";
import { PLATFORMS } from "@/lib/domain";
import { SweepApi, SweepRun } from "./useSweep";

function PlatformChip({ name, label, run, busy }: { name: string; label: string; run?: SweepRun; busy: boolean }) {
  const short = label.split(".")[0];
  if (!run) {
    return (
      <span
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
          busy ? "bg-slate-50 text-slate-400 ring-slate-200" : "bg-slate-50 text-slate-300 ring-slate-100"
        }`}
        title={busy ? `${label}: bezig of in wachtrij` : label}
      >
        {busy && <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-300" />}
        {short}
      </span>
    );
  }
  if (run.status === "completed") {
    return (
      <span
        className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
        title={`${label}: ${run.offers} contracten opgehaald`}
      >
        ✓ {short} <span className="font-normal text-emerald-500">{run.offers}</span>
      </span>
    );
  }
  return (
    <span
      className="flex cursor-help items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200"
      title={`${label} mislukt: ${run.error ?? "onbekende fout"}`}
    >
      ✗ {short}
    </span>
  );
}

// Progress + result of the running/last sweep (the start buttons live in
// ScenarioPicker). Renders nothing until a sweep has been started or failed
// to start.
export default function ScrapeControls({ sweep }: { sweep: SweepApi }) {
  const { busy, status, error, label, sweepId, resultsHref } = sweep;
  const [log, setLog] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  const runsByPlatform = new Map((status?.runs ?? []).map((r) => [r.platform, r]));
  const firstFailure = status?.runs.find((r) => r.status === "failed");

  const toggleLog = async () => {
    if (!showLog && sweepId) {
      const r = await fetch(`/api/scrapes/log?sweepId=${encodeURIComponent(sweepId)}`).then((x) => x.json());
      setLog(r.log ?? r.error ?? "geen log");
    }
    setShowLog((v) => !v);
  };

  if (!label && !error) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {label && status && (
          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
              !status.done
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : status.failed === 0
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-rose-200"
            }`}
          >
            {!status.done && (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            )}
            {!status.done
              ? `Bezig met ${label}… ${status.completed}/${status.expected}`
              : status.failed === 0
                ? `Klaar — ${label}: ${status.runs.reduce((s, r) => s + r.offers, 0)} contracten`
                : `Klaar — ${label}: ${status.succeeded} gelukt, ${status.failed} mislukt`}
          </span>
        )}
        {resultsHref && (status?.completed ?? 0) > 0 && (
          <Link
            href={resultsHref}
            className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
            title={status?.done ? "Open de resultaten van deze scan" : "Open de resultaten tot nu toe (scan loopt nog)"}
          >
            Bekijk resultaten →
          </Link>
        )}
        {sweepId && (
          <button onClick={toggleLog} className="text-xs font-medium text-slate-500 underline hover:text-slate-700">
            {showLog ? "Verberg log" : "Bekijk log"}
          </button>
        )}
        {error && (
          <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">{error}</span>
        )}
      </div>

      {label && status && (
        <div className="flex flex-wrap items-center gap-1.5">
          {PLATFORMS.map((p) => (
            <PlatformChip
              key={p.name}
              name={p.name}
              label={p.label}
              run={runsByPlatform.get(p.name)}
              busy={busy}
            />
          ))}
          {firstFailure && (
            <span className="ml-1 max-w-xl truncate text-[11px] text-rose-500" title={firstFailure.error ?? ""}>
              eerste fout: {(firstFailure.error ?? "").slice(0, 120)}
            </span>
          )}
        </div>
      )}

      {showLog && (
        <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-200">
          {log ?? "laden…"}
        </pre>
      )}
    </div>
  );
}
