"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { platformColor } from "@/lib/platformColors";

// Subset of /api/archive/scan we need for the diff.
type ScanOffer = {
  rank: number;
  supplier: string;
  isMyCompany: boolean;
  contractName: string;
  contractType: string;
  durationMonths: number | null;
  annualCost: number;
  discount: number | null;
};
type ScanDetail = {
  sweepId: string;
  scrapedAt: string;
  platforms: { platform: string; label: string; offers: ScanOffer[] }[];
};
type ScanMeta = { sweepId: string; scrapedAt: string; scenario: { id: number }; contractCount: number };

type DiffRow = {
  key: string;
  platform: string;
  platformLabel: string;
  supplier: string;
  isMyCompany: boolean;
  contractName: string;
  contractType: string;
  durationMonths: number | null;
  rankA: number | null;
  rankB: number | null;
  costA: number | null;
  costB: number | null;
};

const FILTERS = [
  ["alle", "Alle"],
  ["nieuw", "Nieuw"],
  ["weg", "Verdwenen"],
  ["gestegen", "Gestegen"],
  ["gedaald", "Gedaald"],
] as const;
type FilterKey = (typeof FILTERS)[number][0];

const eur = (v: number | null) => (v == null ? "—" : `€${v.toFixed(0)}`);
const fmtScan = (iso: string) => new Date(iso).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" });
const TYPE_ABBR: Record<string, string> = { vast: "V", variabel: "Var", dynamisch: "Dyn", combinatie: "C" };

// A contract is "the same" across two sweeps when supplier, name, type and
// duration all match on the same platform.
const offerKey = (platform: string, o: ScanOffer) =>
  `${platform}|${o.supplier}|${o.contractName}|${o.contractType}|${o.durationMonths ?? ""}`;

function buildRows(a: ScanDetail, b: ScanDetail): DiffRow[] {
  const rows = new Map<string, DiffRow>();
  const add = (scan: ScanDetail, side: "A" | "B") => {
    for (const p of scan.platforms) {
      for (const o of p.offers) {
        const key = offerKey(p.platform, o);
        const row = rows.get(key) ?? {
          key,
          platform: p.platform,
          platformLabel: p.label,
          supplier: o.supplier,
          isMyCompany: o.isMyCompany,
          contractName: o.contractName,
          contractType: o.contractType,
          durationMonths: o.durationMonths,
          rankA: null,
          rankB: null,
          costA: null,
          costB: null,
        };
        // Duplicate contract names within one run: keep the best (first) rank.
        if (side === "A" && row.rankA == null) {
          row.rankA = o.rank;
          row.costA = o.annualCost;
        }
        if (side === "B" && row.rankB == null) {
          row.rankB = o.rank;
          row.costB = o.annualCost;
        }
        rows.set(key, row);
      }
    }
  };
  add(a, "A");
  add(b, "B");
  return [...rows.values()];
}

function RankDelta({ a, b }: { a: number | null; b: number | null }) {
  if (a == null || b == null) return null;
  const d = a - b; // rank down = climbed
  if (d === 0) return <span className="ml-1 text-slate-400">=</span>;
  return d > 0 ? (
    <span className="ml-1 font-medium text-emerald-600">▲{d}</span>
  ) : (
    <span className="ml-1 font-medium text-rose-600">▼{-d}</span>
  );
}

function CostDelta({ a, b }: { a: number | null; b: number | null }) {
  if (a == null || b == null) return null;
  const d = Math.round(b - a);
  if (d === 0) return <span className="ml-1 text-slate-400">=</span>;
  return (
    <span className={`ml-1 font-medium ${d < 0 ? "text-emerald-600" : "text-rose-600"}`}>
      {d < 0 ? "−" : "+"}€{Math.abs(d)}
    </span>
  );
}

function DiffInner() {
  const params = useSearchParams();
  const scenarioId = Number(params.get("scenarioId"));
  const [scans, setScans] = useState<ScanMeta[]>([]);
  const [aId, setAId] = useState(params.get("a") ?? "");
  const [bId, setBId] = useState(params.get("b") ?? "");
  const [a, setA] = useState<ScanDetail | null>(null);
  const [b, setB] = useState<ScanDetail | null>(null);
  const [filter, setFilter] = useState<FilterKey>("alle");
  const [error, setError] = useState<string | null>(null);

  // Scans of this scenario, newest first; default to the two most recent.
  useEffect(() => {
    if (!scenarioId) return;
    fetch("/api/archive")
      .then((x) => x.json())
      .then((r) => {
        const list: ScanMeta[] = (r.scans ?? []).filter((s: ScanMeta) => s.scenario.id === scenarioId);
        setScans(list);
        if (list.length === 0) setError("Geen scans voor dit scenario.");
        setBId((prev) => prev || (list[0]?.sweepId ?? ""));
        setAId((prev) => prev || ((list[1] ?? list[0])?.sweepId ?? ""));
      });
  }, [scenarioId]);

  useEffect(() => {
    if (!aId) return;
    let stale = false;
    fetch(`/api/archive/scan?sweepId=${encodeURIComponent(aId)}&scenarioId=${scenarioId}`)
      .then((x) => x.json())
      .then((r) => {
        if (stale) return;
        if (r.error) setError(r.error);
        else setA(r);
      });
    return () => {
      stale = true;
    };
  }, [aId, scenarioId]);

  useEffect(() => {
    if (!bId) return;
    let stale = false;
    fetch(`/api/archive/scan?sweepId=${encodeURIComponent(bId)}&scenarioId=${scenarioId}`)
      .then((x) => x.json())
      .then((r) => {
        if (stale) return;
        if (r.error) setError(r.error);
        else setB(r);
      });
    return () => {
      stale = true;
    };
  }, [bId, scenarioId]);

  const rows = useMemo(() => (a && b ? buildRows(a, b) : []), [a, b]);

  const summary = useMemo(() => {
    if (!a || !b) return [];
    const platforms = new Map<string, { platform: string; label: string }>();
    for (const p of [...a.platforms, ...b.platforms]) platforms.set(p.platform, { platform: p.platform, label: p.label });
    return [...platforms.values()].map(({ platform, label }) => {
      const mine = rows.filter((r) => r.platform === platform);
      const inA = mine.filter((r) => r.rankA != null);
      const inB = mine.filter((r) => r.rankB != null);
      const costsA = inA.map((r) => r.costA as number);
      const costsB = inB.map((r) => r.costB as number);
      return {
        platform,
        label,
        countA: inA.length,
        countB: inB.length,
        nieuw: mine.filter((r) => r.rankA == null && r.rankB != null).length,
        weg: mine.filter((r) => r.rankA != null && r.rankB == null).length,
        cheapA: costsA.length ? Math.min(...costsA) : null,
        cheapB: costsB.length ? Math.min(...costsB) : null,
      };
    });
  }, [a, b, rows]);

  const filtered = useMemo(() => {
    const match = (r: DiffRow) => {
      switch (filter) {
        case "nieuw": return r.rankA == null && r.rankB != null;
        case "weg": return r.rankA != null && r.rankB == null;
        case "gestegen": return r.rankA != null && r.rankB != null && r.rankB < r.rankA;
        case "gedaald": return r.rankA != null && r.rankB != null && r.rankB > r.rankA;
        default: return true;
      }
    };
    return rows
      .filter(match)
      .sort(
        (x, y) =>
          x.platform.localeCompare(y.platform) ||
          (x.rankB ?? 9999) - (y.rankB ?? 9999) ||
          (x.rankA ?? 9999) - (y.rankA ?? 9999)
      );
  }, [rows, filter]);

  if (!scenarioId) return <div className="py-24 text-center text-rose-500">scenarioId ontbreekt in de URL.</div>;
  if (error && !scans.length) return <div className="py-24 text-center text-rose-500">{error}</div>;

  const pickScan = (value: string, onChange: (v: string) => void, label: string) => (
    <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200"
      >
        {scans.map((s) => (
          <option key={s.sweepId} value={s.sweepId}>
            {fmtScan(s.scrapedAt)} ({s.contractCount})
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scan-diff</h1>
          <p className="text-sm text-slate-500">Wat is er veranderd tussen twee scans van hetzelfde scenario?</p>
        </div>
        <Link href="/archive" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Archief
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        {pickScan(aId, setAId, "Van")}
        <span className="text-slate-400">→</span>
        {pickScan(bId, setBId, "Naar")}
      </div>

      {!a || !b ? (
        <div className="py-24 text-center text-slate-400">Laden…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {summary.map((s) => {
              const c = platformColor(s.platform);
              return (
                <div key={s.platform} className={`rounded-xl border-t-4 ${c.border} bg-white p-3 shadow-sm ring-1 ring-slate-200`}>
                  <div className={`text-xs font-bold ${c.text}`}>{s.label.split(".")[0]}</div>
                  <div className="mt-1 text-sm text-slate-700 tabular-nums">
                    {s.countA} → <b>{s.countB}</b> contracten
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    <span className="text-emerald-600">+{s.nieuw} nieuw</span> · <span className="text-rose-600">−{s.weg} weg</span>
                  </div>
                  <div className="text-[11px] text-slate-500 tabular-nums">
                    v.a. {eur(s.cheapA)} → {eur(s.cheapB)}
                    <CostDelta a={s.cheapA} b={s.cheapB} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Toon</span>
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filtered.length} contracten</span>
          </div>

          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2 text-left">Vergelijker</th>
                  <th className="px-3 py-2 text-left">Leverancier</th>
                  <th className="px-3 py-2 text-left">Contract</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Rank</th>
                  <th className="px-3 py-2 text-right">€/jaar</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const c = platformColor(r.platform);
                  const status =
                    r.rankA == null ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">nieuw</span>
                    ) : r.rankB == null ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">verdwenen</span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    );
                  return (
                    <tr
                      key={r.key}
                      className={r.isMyCompany ? "border-b border-emerald-100 bg-emerald-50/70 font-medium" : "border-b border-slate-50 hover:bg-slate-50/60"}
                    >
                      <td className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold ${c.text}`}>
                        {r.platformLabel.split(".")[0]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-slate-800">
                        {r.supplier}
                        {r.isMyCompany && <span className="ml-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">WIJ</span>}
                      </td>
                      <td className="max-w-72 truncate px-3 py-1.5 text-xs text-slate-600" title={r.contractName}>
                        {r.contractName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-[11px] text-slate-500">
                        {TYPE_ABBR[r.contractType] ?? r.contractType}
                        {r.durationMonths ? ` ${r.durationMonths / 12}jr` : ""}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-slate-700">
                        {r.rankA != null && r.rankB != null
                          ? <>#{r.rankA} → <b>#{r.rankB}</b></>
                          : r.rankB != null
                            ? <b>#{r.rankB}</b>
                            : <span className="text-slate-400">#{r.rankA}</span>}
                        <RankDelta a={r.rankA} b={r.rankB} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-right tabular-nums text-slate-700">
                        {r.costA != null && r.costB != null
                          ? <>{eur(r.costA)} → <b>{eur(r.costB)}</b></>
                          : eur(r.costB ?? r.costA)}
                        <CostDelta a={r.costA} b={r.costB} />
                      </td>
                      <td className="px-3 py-1.5 text-right">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="border-t border-slate-100 p-2 text-[11px] text-slate-400">
              Contracten worden gematcht op leverancier + contractnaam + type + looptijd, per vergelijker. ▲ = gestegen in de
              ranking; groen prijsverschil = goedkoper geworden.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function DiffPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Laden…</div>}>
          <DiffInner />
        </Suspense>
      </div>
    </main>
  );
}
