"use client";

import { useEffect, useRef, useState } from "react";

type Sweep = { sweepId: string; expected: number; label: string };
type Status = {
  completed: number;
  expected: number;
  done: boolean;
  runs: { platform: string; offers: number; status: string }[];
};

export default function ScrapeControls({
  scenarioId,
  scenarioLabel,
  onDataChanged,
}: {
  scenarioId: number | null;
  scenarioLabel: string;
  onDataChanged: () => void;
}) {
  const [sweep, setSweep] = useState<Sweep | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);

  const start = async (body: { scenarioId?: number; presets?: boolean }, label: string) => {
    setError(null);
    const res = await fetch("/api/scrapes/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error ?? "Starten mislukt");
      return;
    }
    startedAt.current = Date.now();
    setSweep({ sweepId: j.sweepId, expected: j.expectedRuns, label });
    setStatus({ completed: 0, expected: j.expectedRuns, done: false, runs: [] });
  };

  useEffect(() => {
    if (!sweep) return;
    timer.current = setInterval(async () => {
      const s: Status = await fetch(
        `/api/scrapes/status?sweepId=${encodeURIComponent(sweep.sweepId)}&expected=${sweep.expected}`
      ).then((x) => x.json());
      setStatus((prev) => {
        if (s.completed !== (prev?.completed ?? 0)) onDataChanged(); // refresh as results land
        return s;
      });
      // stop when done, or after 20 min as a safety net
      if (s.done || Date.now() - startedAt.current > 20 * 60_000) {
        if (timer.current) clearInterval(timer.current);
        setTimeout(() => setSweep(null), s.done ? 4000 : 0);
        if (!s.done) setError(`Sweep gestopt: ${s.completed}/${s.expected} platforms geland (zie sweep-log)`);
        onDataChanged();
      }
    }, 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sweep?.sweepId]);

  const busy = sweep != null && !(status?.done ?? false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={busy || scenarioId == null}
        onClick={() => scenarioId != null && start({ scenarioId }, scenarioLabel)}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
        title="Draait de 6 scrapers voor het geselecteerde scenario"
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

      {sweep && status && (
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
            ? `Klaar — ${sweep.label}: ${status.runs.reduce((s, r) => s + r.offers, 0)} contracten`
            : `Bezig met ${sweep.label}… ${status.completed}/${status.expected} platforms`}
          {status.runs.length > 0 && !status.done && (
            <span className="text-amber-500">({status.runs.map((r) => r.platform.split(".")[0]).join(", ")})</span>
          )}
        </span>
      )}
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
