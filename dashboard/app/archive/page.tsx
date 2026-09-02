"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { platformColor } from "@/lib/platformColors";

type Scan = {
  sweepId: string;
  scenario: {
    id: number;
    name: string | null;
    electricityNormal: number;
    electricityLow: number;
    gas: number;
    solarFeedIn: number;
    isPreset: boolean;
  };
  scrapedAt: string;
  platforms: string[];
  contractCount: number;
  myCount: number;
  priceMin: number | null;
  priceMax: number | null;
  cashbackMin: number | null;
  cashbackMax: number | null;
  perType: Record<string, number>;
  perProvider: Record<string, number>;
};

const scenarioLabel = (s: Scan["scenario"]) =>
  s.name
    ? { low: "Laag", medium: "Midden", high: "Hoog", solar: "Zon" }[s.name] ?? s.name
    : `${s.electricityNormal + s.electricityLow} kWh${s.gas > 0 ? ` / ${s.gas} m³` : " / mono"}${s.solarFeedIn ? ` / ☀ ${s.solarFeedIn}` : ""}`;

const eur = (v: number | null, d = 0) => (v == null ? "—" : `€${v.toFixed(d)}`);

function ScanCard({ scan }: { scan: Scan }) {
  const [showAllProviders, setShowAllProviders] = useState(false);
  const providers = Object.entries(scan.perProvider);
  const shown = showAllProviders ? providers : providers.slice(0, 6);
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {new Date(scan.scrapedAt).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
          </span>
          <span className="flex gap-1">
            {scan.platforms.map((p) => {
              const c = platformColor(p.split(".")[0].toLowerCase());
              return (
                <span key={p} className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.chip}`} title={p}>
                  {p.split(".")[0]}
                </span>
              );
            })}
          </span>
        </div>
        <Link
          href={`/archive/scan?sweepId=${encodeURIComponent(scan.sweepId)}`}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
        >
          Bekijk scan →
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 sm:grid-cols-4">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contracten</span>
          <span className="text-base font-bold text-slate-900">{scan.contractCount}</span>
          {scan.myCount > 0 && <span className="ml-1 text-emerald-600">({scan.myCount} eigen)</span>}
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Prijs (jaar)</span>
          <span className="font-medium text-slate-800">{eur(scan.priceMin)} – {eur(scan.priceMax)}</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Cashback</span>
          <span className="font-medium text-emerald-700">{eur(scan.cashbackMin)} – {eur(scan.cashbackMax)}</span>
        </div>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contracttypes</span>
          <span>
            {["vast", "variabel", "dynamisch", "combinatie"]
              .filter((t) => scan.perType[t])
              .map((t) => `${scan.perType[t]} ${t}`)
              .join(" · ") || "—"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Per leverancier</span>
        {shown.map(([name, count]) => (
          <span key={name} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {name} <b>{count}</b>
          </span>
        ))}
        {providers.length > 6 && (
          <button
            onClick={() => setShowAllProviders((v) => !v)}
            className="text-[11px] font-medium text-emerald-700 hover:underline"
          >
            {showAllProviders ? "minder" : `+${providers.length - 6} meer`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ArchivePage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/archive")
      .then((x) => x.json())
      .then((r) => {
        setScans(r.scans ?? []);
        setLoading(false);
      });
  }, []);

  const grouped = useMemo(() => {
    const g = new Map<number, { scenario: Scan["scenario"]; scans: Scan[] }>();
    for (const s of scans) {
      if (!g.has(s.scenario.id)) g.set(s.scenario.id, { scenario: s.scenario, scans: [] });
      g.get(s.scenario.id)!.scans.push(s);
    }
    return [...g.values()];
  }, [scans]);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scan-archief</h1>
            <p className="text-sm text-slate-500">Alle scrapes per scenario, nieuwste eerst</p>
          </div>
          <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
            ← Dashboard
          </Link>
        </header>

        {loading ? (
          <div className="py-24 text-center text-slate-400">Laden…</div>
        ) : grouped.length === 0 ? (
          <div className="py-24 text-center text-slate-400">Nog geen scans — start er één vanaf het dashboard.</div>
        ) : (
          grouped.map(({ scenario, scans: list }) => (
            <section key={scenario.id} className="space-y-3">
              <h2 className="flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {scenarioLabel(scenario)}
                <span className="text-xs font-normal normal-case text-slate-400">
                  {scenario.electricityNormal + scenario.electricityLow} kWh
                  {scenario.gas > 0 ? ` · ${scenario.gas} m³ gas` : " · alleen stroom"}
                  {scenario.solarFeedIn > 0 ? ` · ${scenario.solarFeedIn} kWh teruglevering` : ""}
                  {" · "}
                  {list.length} scan{list.length === 1 ? "" : "s"}
                </span>
              </h2>
              <div className="space-y-3">
                {list.map((s) => (
                  <ScanCard key={s.sweepId} scan={s} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
