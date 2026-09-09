"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { platformColor } from "@/lib/platformColors";
import { scenarioLabel } from "@/lib/scenarioLabel";

type AdminRun = {
  id: number;
  sweepId: string | null;
  scrapedAt: string;
  status: string; // completed | failed | partial
  error: string | null;
  offerCount: number;
  platform: string;
  platformLabel: string;
  address: string | null;
  scenario: {
    id: number;
    name: string | null;
    label: string | null;
    electricityNormal: number;
    electricityLow: number;
    gas: number;
    solarFeedIn: number;
  };
};


const STATUS_CHIP: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
};

function SweepCard({
  runs,
  onDeleted,
}: {
  runs: AdminRun[];
  onDeleted: (removedIds: number[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = runs[0];
  const totalOffers = runs.reduce((s, r) => s + r.offerCount, 0);
  const realSweep = first.sweepId != null;

  const del = async (
    payload: { runId?: number; sweepId?: string; scenarioId?: number },
    removedIds: number[],
    confirmMsg: string
  ) => {
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/runs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      setError(data?.error ?? "Verwijderen mislukt");
      return;
    }
    onDeleted(removedIds);
  };

  return (
    <div className={`rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 ${busy ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {new Date(first.scrapedAt).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            {scenarioLabel(first.scenario)}
          </span>
          {first.address && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">📍 {first.address}</span>
          )}
          <span className="text-[11px] text-slate-400">
            {runs.length} run{runs.length === 1 ? "" : "s"} · {totalOffers} contracten
          </span>
        </div>
        <div className="flex items-center gap-2">
          {realSweep && (
            <Link
              href={`/archive/scan?sweepId=${encodeURIComponent(first.sweepId!)}&scenarioId=${first.scenario.id}`}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              Bekijk →
            </Link>
          )}
          <button
            disabled={busy}
            onClick={() =>
              realSweep
                ? del(
                    { sweepId: first.sweepId!, scenarioId: first.scenario.id },
                    runs.map((r) => r.id),
                    `Scan "${scenarioLabel(first.scenario)}" van ${new Date(first.scrapedAt).toLocaleString("nl-NL")} verwijderen?\n${runs.length} runs en ${totalOffers} contracten worden definitief verwijderd.`
                  )
                : del(
                    { runId: first.id },
                    [first.id],
                    `Deze run (${first.platformLabel}, ${first.offerCount} contracten) definitief verwijderen?`
                  )
            }
            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed"
          >
            Verwijder scan
          </button>
        </div>
      </div>

      <ul className="mt-3 divide-y divide-slate-50 border-t border-slate-100">
        {runs.map((r) => {
          const c = platformColor(r.platform);
          return (
            <li key={r.id} className="flex flex-wrap items-center gap-2 py-1.5 text-xs">
              <span className={`w-32 font-semibold ${c.text}`}>
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: c.hex }} />
                {r.platformLabel}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_CHIP[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                {r.status}
              </span>
              <span className="tabular-nums text-slate-500">{r.offerCount} contracten</span>
              {r.error && (
                <span className="max-w-md truncate text-rose-500" title={r.error}>
                  {r.error}
                </span>
              )}
              <span className="ml-auto flex items-center gap-2">
                <span className="text-[10px] text-slate-400">#{r.id}</span>
                {runs.length > 1 && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      del(
                        { runId: r.id },
                        [r.id],
                        `Run ${r.platformLabel} (${r.offerCount} contracten) definitief verwijderen?`
                      )
                    }
                    className="rounded px-1.5 py-0.5 font-medium text-rose-600 hover:bg-rose-50"
                    title="Alleen deze platform-run verwijderen"
                  >
                    ✕
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {error && <div className="mt-2 text-xs text-rose-600">{error}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [runs, setRuns] = useState<AdminRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/runs")
      .then((x) => x.json())
      .then((r) => {
        setRuns(r.runs ?? []);
        setLoading(false);
      });
  }, []);

  // Group per sweep AND scenario (same as the archive): "Ververs alle presets"
  // runs every preset under ONE sweepId, which must show as one scan per
  // scenario. Legacy runs without sweepId become single-run groups.
  const sweeps = useMemo(() => {
    const g = new Map<string, AdminRun[]>();
    for (const r of runs) {
      const key = `${r.scenario.id}|${r.sweepId ?? `run-${r.id}`}`;
      if (!g.has(key)) g.set(key, []);
      g.get(key)!.push(r);
    }
    return [...g.entries()].sort(
      (a, b) => new Date(b[1][0].scrapedAt).getTime() - new Date(a[1][0].scrapedAt).getTime()
    );
  }, [runs]);

  const failedCount = runs.filter((r) => r.status !== "completed").length;

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Beheer</h1>
            <p className="text-sm text-slate-500">
              {runs.length} runs in {sweeps.length} scans
              {failedCount > 0 && <span className="text-rose-500"> · {failedCount} niet compleet</span>}
              {" — "}verwijderen is definitief (inclusief alle contracten)
            </p>
          </div>
          <nav className="flex gap-4">
            <Link href="/admin/presets" className="text-sm font-medium text-emerald-700 hover:underline">
              Presets &amp; adres
            </Link>
            <Link href="/archive" className="text-sm font-medium text-emerald-700 hover:underline">
              Archief
            </Link>
            <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
              ← Dashboard
            </Link>
          </nav>
        </header>

        {loading ? (
          <div className="py-24 text-center text-slate-400">Laden…</div>
        ) : sweeps.length === 0 ? (
          <div className="py-24 text-center text-slate-400">Geen runs in de database.</div>
        ) : (
          sweeps.map(([key, list]) => (
            <SweepCard
              key={key}
              runs={list}
              onDeleted={(ids) => setRuns((prev) => prev.filter((r) => !ids.includes(r.id)))}
            />
          ))
        )}
      </div>
    </main>
  );
}
