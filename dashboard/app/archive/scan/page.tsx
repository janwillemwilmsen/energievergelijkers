"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { platformColor } from "@/lib/platformColors";

type Offer = {
  rank: number;
  supplier: string;
  isMyCompany: boolean;
  contractName: string;
  contractType: string;
  durationMonths: number | null;
  monthlyCost: number;
  annualCost: number;
  discount: number | null;
  rating: number | null;
  tariffElecNormal: number | null;
  tariffElecLow: number | null;
  tariffGas: number | null;
  feedInTariff: number | null;
  tariffDeliveryOnly: boolean;
};
type PlatformBlock = {
  platform: string;
  label: string;
  scrapedAt: string;
  stats: {
    count: number;
    priceMin: number | null;
    priceMax: number | null;
    priceAvg: number | null;
    cashbackMin: number | null;
    cashbackMax: number | null;
    perType: Record<string, number>;
    perProvider: Record<string, number>;
  };
  offers: Offer[];
};
type ScanDetail = {
  sweepId: string;
  scenario: { name: string | null; electricityNormal: number; electricityLow: number; gas: number; solarFeedIn: number };
  scrapedAt: string;
  platforms: PlatformBlock[];
  providers: { name: string; counts: Record<string, number>; total: number }[];
};

const eur = (v: number | null | undefined, d = 0) => (v == null ? "—" : `€${v.toFixed(d)}`);
const TYPE_ABBR: Record<string, string> = { vast: "V", variabel: "Var", dynamisch: "Dyn", combinatie: "C" };

// Custom tooltip for the positioning scatter: identifies the exact contract.
function ScatterTip({ active, payload }: { active?: boolean; payload?: { payload?: Record<string, unknown> }[] }) {
  const d = active && payload?.length ? (payload[0].payload as {
    supplier: string; contract: string; platformLabel: string; type: string;
    x: number; y: number; monthly: number; my: boolean;
  }) : null;
  if (!d) return null;
  return (
    <div className="max-w-64 rounded-md bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-200">
      <div className="font-semibold text-slate-900">
        {d.supplier}
        {d.my && <span className="ml-1.5 rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold text-white">WIJ</span>}
      </div>
      <div className="truncate text-slate-500" title={d.contract}>{d.contract}</div>
      <div className="mt-1 text-slate-600">
        {eur(d.x)}/jaar · {eur(d.monthly, 2)}/mnd
        <span className={d.y > 0 ? "text-emerald-700" : "text-slate-400"}>
          {" "}· cashback {d.y > 0 ? eur(d.y) : "geen"}
        </span>
      </div>
      <div className="mt-0.5 text-[10px] text-slate-400">{d.platformLabel} · {d.type}</div>
    </div>
  );
}

function StatsTable({ platforms }: { platforms: PlatformBlock[] }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2">Vergelijker</th>
            <th className="px-3 py-2 text-right"># Contracten</th>
            <th className="px-3 py-2 text-right">Laagste prijs</th>
            <th className="px-3 py-2 text-right">Hoogste prijs</th>
            <th className="px-3 py-2 text-right">Gem. prijs</th>
            <th className="px-3 py-2 text-right">Cashback min</th>
            <th className="px-3 py-2 text-right">Cashback max</th>
            <th className="px-3 py-2 text-right">Vast</th>
            <th className="px-3 py-2 text-right">Variabel</th>
            <th className="px-3 py-2 text-right">Dynamisch</th>
          </tr>
        </thead>
        <tbody>
          {platforms.map((p) => {
            const c = platformColor(p.platform);
            return (
              <tr key={p.platform} className="border-b border-slate-50">
                <td className={`px-3 py-2 font-semibold ${c.text}`}>
                  <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ background: c.hex }} />
                  {p.label}
                </td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums">{p.stats.count}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-emerald-700">{eur(p.stats.priceMin)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-rose-600">{eur(p.stats.priceMax)}</td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums">{eur(p.stats.priceAvg)}</td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums">{eur(p.stats.cashbackMin)}</td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums">{eur(p.stats.cashbackMax)}</td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums">{p.stats.perType["vast"] ?? 0}</td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums">{p.stats.perType["variabel"] ?? 0}</td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums">
                  {(p.stats.perType["dynamisch"] ?? 0) + (p.stats.perType["combinatie"] ?? 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Contract-type + provider filters shown above the ranking columns. Both are
// multi-select; combinations apply as AND across the two dimensions.
function RankingFilters({
  types,
  providers,
  typeFilter,
  providerFilter,
  onTypes,
  onProviders,
}: {
  types: string[];
  providers: { name: string; total: number }[];
  typeFilter: Set<string>;
  providerFilter: Set<string>;
  onTypes: (s: Set<string>) => void;
  onProviders: (s: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (set: Set<string>, v: string, cb: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    cb(next);
  };
  const active = typeFilter.size > 0 || providerFilter.size > 0;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contracttype</span>
      {types.map((t) => (
        <button
          key={t}
          onClick={() => toggle(typeFilter, t, onTypes)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            typeFilter.has(t)
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t}
        </button>
      ))}

      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Leverancier</span>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200"
        >
          Kies leveranciers
          {providerFilter.size > 0 && (
            <span className="ml-1 rounded-full bg-slate-900 px-1.5 text-[10px] text-white">{providerFilter.size}</span>
          )}
        </button>
        {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
        {open && (
          <div className="absolute z-20 mt-1 max-h-72 w-64 overflow-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-slate-200">
            {providers.map((p) => (
              <label key={p.name} className="flex items-center gap-2 rounded px-1 py-0.5 text-xs text-slate-700 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={providerFilter.has(p.name)}
                  onChange={() => toggle(providerFilter, p.name, onProviders)}
                />
                {p.name} <span className="text-slate-400">({p.total})</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {[...providerFilter].map((name) => (
        <button
          key={name}
          onClick={() => toggle(providerFilter, name, onProviders)}
          className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 hover:bg-emerald-200"
          title="Klik om te verwijderen"
        >
          {name} ✕
        </button>
      ))}
      {active && (
        <button
          onClick={() => {
            onTypes(new Set());
            onProviders(new Set());
          }}
          className="ml-auto text-xs font-medium text-rose-600 hover:underline"
        >
          Wis filters
        </button>
      )}
    </div>
  );
}

function PlatformColumns({
  platforms,
  typeFilter,
  providerFilter,
}: {
  platforms: PlatformBlock[];
  typeFilter: Set<string>;
  providerFilter: Set<string>;
}) {
  const match = (o: Offer) =>
    (typeFilter.size === 0 || typeFilter.has(o.contractType)) &&
    (providerFilter.size === 0 || providerFilter.has(o.supplier));
  const filtering = typeFilter.size > 0 || providerFilter.size > 0;
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[1080px] gap-3">
        {platforms.map((p) => {
          const c = platformColor(p.platform);
          const visible = p.offers.filter(match);
          const cheapest = visible.length ? Math.min(...visible.map((o) => o.annualCost)) : null;
          return (
            <div key={p.platform} className={`w-0 flex-1 rounded-xl border-t-4 ${c.border} bg-white shadow-sm ring-1 ring-slate-200`}>
              <div className={`rounded-t-lg px-3 py-2 ${c.bg}`}>
                <div className={`text-sm font-bold ${c.text}`}>{p.label}</div>
                <div className="text-[11px] text-slate-500">
                  {filtering ? `${visible.length} van ${p.stats.count}` : `${p.stats.count}`} contracten
                  {cheapest != null && <> · v.a. {eur(cheapest)}</>}
                </div>
              </div>
              <ol className="max-h-[520px] divide-y divide-slate-50 overflow-y-auto">
                {visible.length === 0 && (
                  <li className="px-3 py-6 text-center text-[11px] text-slate-400">Geen contracten binnen filter</li>
                )}
                {visible.map((o) => (
                  <li
                    key={o.rank}
                    className={`px-3 py-1.5 text-xs ${o.isMyCompany ? "bg-emerald-50 font-semibold" : ""}`}
                    title={o.contractName}
                  >
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="truncate text-slate-800">
                        <span className="mr-1 tabular-nums text-slate-400">{o.rank}.</span>
                        {o.supplier}
                        {o.isMyCompany && <span className="ml-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">WIJ</span>}
                      </span>
                      <span className="shrink-0 tabular-nums font-medium text-slate-900">{eur(o.monthlyCost, 2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        {TYPE_ABBR[o.contractType] ?? o.contractType}
                        {o.durationMonths ? ` ${o.durationMonths / 12}jr` : ""}
                      </span>
                      {o.discount ? <span className="text-emerald-600">cb {eur(o.discount)}</span> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProviderMatrix({ detail }: { detail: ScanDetail }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2 text-left">Leverancier</th>
            {detail.platforms.map((p) => {
              const c = platformColor(p.platform);
              return (
                <th key={p.platform} className={`px-3 py-2 text-right ${c.text}`}>
                  {p.label.split(".")[0]}
                </th>
              );
            })}
            <th className="px-3 py-2 text-right">Totaal</th>
          </tr>
        </thead>
        <tbody>
          {detail.providers.map((pr) => (
            <tr key={pr.name} className="border-b border-slate-50">
              <td className="px-3 py-1.5 text-slate-700">{pr.name}</td>
              {detail.platforms.map((p) => {
                const n = pr.counts[p.platform] ?? 0;
                return (
                  <td key={p.platform} className={`px-3 py-1.5 text-right tabular-nums ${n === 0 ? "text-slate-300" : "text-slate-700"}`}>
                    {n === 0 ? "·" : n}
                  </td>
                );
              })}
              <td className="text-gray-700 px-3 py-1.5 text-right tabular-nums font-semibold">{pr.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Charts({ detail }: { detail: ScanDetail }) {
  // 1. Price range per platform (floating min-max bar, avg via tooltip)
  const rangeData = detail.platforms.map((p) => ({
    name: p.label.split(".")[0],
    platform: p.platform,
    base: p.stats.priceMin ?? 0,
    range: (p.stats.priceMax ?? 0) - (p.stats.priceMin ?? 0),
    min: p.stats.priceMin,
    max: p.stats.priceMax,
    avg: p.stats.priceAvg,
  }));

  // 2. Scatter: cashback vs annual price, per platform color; own brand ringed.
  // Offers without cashback sit on the y=0 line by design ("duur zonder actie").
  const scatterByPlatform = detail.platforms.map((p) => ({
    platform: p.platform,
    label: p.label.split(".")[0],
    data: p.offers.map((o) => ({
      x: o.annualCost,
      y: o.discount ?? 0,
      my: o.isMyCompany,
      supplier: o.supplier,
      contract: o.contractName,
      platformLabel: p.label,
      type: o.contractType + (o.durationMonths ? ` ${o.durationMonths / 12}jr` : ""),
      monthly: o.monthlyCost,
    })),
  }));

  // 3. Contract type mix per platform (stacked)
  const mixData = detail.platforms.map((p) => ({
    name: p.label.split(".")[0],
    vast: p.stats.perType["vast"] ?? 0,
    variabel: p.stats.perType["variabel"] ?? 0,
    dynamisch: (p.stats.perType["dynamisch"] ?? 0) + (p.stats.perType["combinatie"] ?? 0),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Prijsspreiding per vergelijker (jaarkosten, min–max)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rangeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
            <Tooltip
              formatter={(_v, key, item) =>
                key === "range"
                  ? [`${eur(item.payload.min)} – ${eur(item.payload.max)} (gem. ${eur(item.payload.avg)})`, "spreiding"]
                  : []
              }
            />
            <Bar dataKey="base" stackId="r" fill="transparent" />
            <Bar dataKey="range" stackId="r" radius={[4, 4, 4, 4]}>
              {rangeData.map((d) => (
                <Cell key={d.platform} fill={platformColor(d.platform).hex} fillOpacity={0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-[11px] text-slate-400">
          Een smalle balk = homogeen aanbod; een lage onderkant = scherpe instapprijs op die site.
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Marktpositionering: cashback vs. jaarprijs</h3>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" dataKey="x" name="jaarprijs" domain={["auto", "auto"]} tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
            <YAxis type="number" dataKey="y" name="cashback" tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
            <ZAxis range={[28, 28]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {scatterByPlatform.map((s) => (
              <Scatter key={s.platform} name={s.label} data={s.data} fill={platformColor(s.platform).hex} fillOpacity={0.6}>
                {s.data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={platformColor(s.platform).hex}
                    fillOpacity={d.my ? 0.95 : 0.55}
                    stroke={d.my ? "#065f46" : undefined}
                    strokeWidth={d.my ? 2.5 : 0}
                  />
                ))}
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <p className="mt-1 text-[11px] text-slate-400">
          Linksboven = agressief geprijsd mét hoge cashback (de vecht-hoek); de stippen óp de onderlijn zijn
          contracten zonder cashback (€0) — meestal dynamische/variabele producten. Eigen merk heeft een donkere ring.
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Contracttype-mix per vergelijker</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mixData} layout="vertical" margin={{ top: 4, right: 8, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="vast" stackId="m" fill="#0ea5e9" name="vast" />
            <Bar dataKey="variabel" stackId="m" fill="#94a3b8" name="variabel" />
            <Bar dataKey="dynamisch" stackId="m" fill="#a855f7" name="dynamisch" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarieven per contract: sortable table + scatter of the commodity prices
// (€/kWh, €/m³) that the scrapers capture per contract.
// ---------------------------------------------------------------------------
type TariffRow = Offer & { platform: string; platformLabel: string };
type TariffSortKey = "platformLabel" | "supplier" | "tariffElecNormal" | "tariffElecLow" | "tariffGas" | "feedInTariff" | "annualCost";

function TariffTip({ active, payload }: { active?: boolean; payload?: { payload?: Record<string, unknown> }[] }) {
  const d = active && payload?.length ? (payload[0].payload as TariffRow & { x: number; y: number }) : null;
  if (!d) return null;
  return (
    <div className="max-w-64 rounded-md bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-200">
      <div className="font-semibold text-slate-900">
        {d.supplier}
        {d.isMyCompany && <span className="ml-1.5 rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold text-white">WIJ</span>}
      </div>
      <div className="truncate text-slate-500" title={d.contractName}>{d.contractName}</div>
      <div className="mt-1 text-slate-600">
        stroom €{d.x.toFixed(4)}/kWh · gas €{d.y.toFixed(4)}/m³
      </div>
      <div className="mt-0.5 text-[10px] text-slate-400">{d.platformLabel} · {d.contractType}</div>
    </div>
  );
}

function TariffSection({ detail }: { detail: ScanDetail }) {
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [providerFilter, setProviderFilter] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<TariffSortKey>("tariffElecNormal");
  const [sortAsc, setSortAsc] = useState(true);

  const allTypes = useMemo(
    () => [...new Set(detail.platforms.flatMap((p) => p.offers.map((o) => o.contractType)))].sort(),
    [detail]
  );
  const rows = useMemo<TariffRow[]>(
    () =>
      detail.platforms.flatMap((p) =>
        p.offers.map((o) => ({ ...o, platform: p.platform, platformLabel: p.label }))
      ),
    [detail]
  );

  const filtered = useMemo(() => {
    let r = rows.filter((o) => o.tariffElecNormal != null || o.tariffGas != null);
    if (typeFilter.size) r = r.filter((o) => typeFilter.has(o.contractType));
    if (providerFilter.size) r = r.filter((o) => providerFilter.has(o.supplier));
    const dir = sortAsc ? 1 : -1;
    const tariffSort = ["tariffElecNormal", "tariffElecLow", "tariffGas", "feedInTariff"].includes(sortKey);
    return [...r].sort((a, b) => {
      // When sorting on a tariff column, keep delivery-only rows (excl.
      // belastingen — structurally lower) below the comparable all-in rows.
      if (tariffSort && a.tariffDeliveryOnly !== b.tariffDeliveryOnly) return a.tariffDeliveryOnly ? 1 : -1;
      const va = a[sortKey], vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // nulls last regardless of direction
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [rows, typeFilter, providerFilter, sortKey, sortAsc]);

  // Scatter: only all-in tariffs with both commodities; delivery-only rows
  // (Pricewise, excl. belastingen) would distort the comparison.
  const scatterByPlatform = useMemo(
    () =>
      detail.platforms.map((p) => ({
        platform: p.platform,
        label: p.label.split(".")[0],
        data: filtered
          .filter((o) => o.platform === p.platform && !o.tariffDeliveryOnly && o.tariffElecNormal != null && o.tariffGas != null && !o.isMyCompany)
          .map((o) => ({ ...o, x: o.tariffElecNormal as number, y: o.tariffGas as number })),
      })),
    [detail, filtered]
  );
  const myPoints = useMemo(
    () =>
      filtered
        .filter((o) => o.isMyCompany && !o.tariffDeliveryOnly && o.tariffElecNormal != null && o.tariffGas != null)
        .map((o) => ({ ...o, x: o.tariffElecNormal as number, y: o.tariffGas as number })),
    [filtered]
  );

  const th = (key: TariffSortKey, label: string, right = true) => (
    <th
      className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 ${right ? "text-right" : "text-left"}`}
      onClick={() => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else {
          setSortKey(key);
          setSortAsc(true);
        }
      }}
    >
      {label}
      {sortKey === key && <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>}
    </th>
  );
  const t4 = (v: number | null) => (v == null ? "—" : `€${v.toFixed(4)}`);
  const hasDeliveryOnly = filtered.some((o) => o.tariffDeliveryOnly);

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Tarieven per contract (€/kWh · €/m³)
      </h2>
      <RankingFilters
        types={allTypes}
        providers={detail.providers}
        typeFilter={typeFilter}
        providerFilter={providerFilter}
        onTypes={setTypeFilter}
        onProviders={setProviderFilter}
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 xl:col-span-3">
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="sticky top-0 z-[5] bg-white shadow-[0_1px_0_#f1f5f9]">
                <tr>
                  {th("platformLabel", "Vergelijker", false)}
                  {th("supplier", "Leverancier", false)}
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Type</th>
                  {th("tariffElecNormal", "Stroom normaal")}
                  {th("tariffElecLow", "Stroom dal")}
                  {th("tariffGas", "Gas")}
                  {th("feedInTariff", "Teruglever")}
                  {th("annualCost", "€/jaar")}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => {
                  const c = platformColor(o.platform);
                  return (
                    <tr
                      key={`${o.platform}-${o.rank}-${i}`}
                      className={o.isMyCompany ? "border-b border-emerald-100 bg-emerald-50/70 font-medium" : "border-b border-slate-50 hover:bg-slate-50/60"}
                    >
                      <td className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold ${c.text}`}>
                        {o.platformLabel.split(".")[0]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-xs text-slate-800" title={o.contractName}>
                        {o.supplier}
                        {o.isMyCompany && <span className="ml-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">WIJ</span>}
                        {o.tariffDeliveryOnly && <span className="ml-1 text-slate-400" title="Alleen leveringstarief, excl. belastingen — niet vergelijkbaar met de overige rijen">†</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-[11px] text-slate-500">
                        {TYPE_ABBR[o.contractType] ?? o.contractType}
                        {o.durationMonths ? ` ${o.durationMonths / 12}jr` : ""}
                      </td>
                      <td className="px-3 py-1.5 text-right text-xs tabular-nums text-slate-700">{t4(o.tariffElecNormal)}</td>
                      <td className="px-3 py-1.5 text-right text-xs tabular-nums text-slate-700">{t4(o.tariffElecLow)}</td>
                      <td className="px-3 py-1.5 text-right text-xs tabular-nums text-slate-700">{t4(o.tariffGas)}</td>
                      <td className="px-3 py-1.5 text-right text-xs tabular-nums text-slate-500">{t4(o.feedInTariff)}</td>
                      <td className="px-3 py-1.5 text-right text-xs tabular-nums font-medium text-slate-900">{eur(o.annualCost)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 p-2 text-[11px] text-slate-400">
            {filtered.length} contracten · tarieven incl. btw en energiebelasting
            {hasDeliveryOnly && <> · † Pricewise toont alleen leveringstarieven (excl. belastingen)</>}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Stroomtarief vs. gastarief</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="x" name="stroom" domain={["auto", "auto"]} tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
              <YAxis type="number" dataKey="y" name="gas" domain={["auto", "auto"]} tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
              <ZAxis range={[30, 30]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<TariffTip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {scatterByPlatform
                .filter((s) => s.data.length)
                .map((s) => (
                  <Scatter key={s.platform} name={s.label} data={s.data} fill={platformColor(s.platform).hex} fillOpacity={0.55} />
                ))}
              {myPoints.length > 0 && (
                <Scatter name="Eigen merk" data={myPoints} fill="#059669" stroke="#065f46" strokeWidth={2} />
              )}
            </ScatterChart>
          </ResponsiveContainer>
          <p className="mt-1 text-[11px] text-slate-400">
            Elke stip = één contract (all-in tarieven; Pricewise uitgesloten). Linksonder is op beide
            commodities de scherpste prijs; de verticale spreiding bij gelijk stroomtarief laat zien wie marge
            op gas pakt.
          </p>
        </div>
      </div>
    </section>
  );
}

function ScanDetailInner() {
  const sweepId = useSearchParams().get("sweepId");
  const [detail, setDetail] = useState<ScanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [providerFilter, setProviderFilter] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sweepId) return;
    fetch(`/api/archive/scan?sweepId=${encodeURIComponent(sweepId)}`)
      .then((x) => x.json())
      .then((r) => (r.error ? setError(r.error) : setDetail(r)));
  }, [sweepId]);

  if (error) return <div className="py-24 text-center text-rose-500">{error}</div>;
  if (!detail) return <div className="py-24 text-center text-slate-400">Laden…</div>;

  const allTypes = [...new Set(detail.platforms.flatMap((p) => p.offers.map((o) => o.contractType)))].sort();

  const sc = detail.scenario;
  const total = detail.platforms.reduce((s, p) => s + p.stats.count, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Scan {new Date(detail.scrapedAt).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
          </h1>
          <p className="text-sm text-slate-500">
            {sc.electricityNormal + sc.electricityLow} kWh
            {sc.gas > 0 ? ` · ${sc.gas} m³ gas` : " · alleen stroom"}
            {sc.solarFeedIn > 0 ? ` · ${sc.solarFeedIn} kWh teruglevering` : ""} — {total} contracten over{" "}
            {detail.platforms.length} vergelijkers
          </p>
        </div>
        <Link href="/archive" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Archief
        </Link>
      </header>

      <StatsTable platforms={detail.platforms} />
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Rankings naast elkaar</h2>
        <RankingFilters
          types={allTypes}
          providers={detail.providers}
          typeFilter={typeFilter}
          providerFilter={providerFilter}
          onTypes={setTypeFilter}
          onProviders={setProviderFilter}
        />
        <PlatformColumns platforms={detail.platforms} typeFilter={typeFilter} providerFilter={providerFilter} />
      </section>
      <Charts detail={detail} />
      <TariffSection detail={detail} />
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Contracten per leverancier per vergelijker
        </h2>
        <ProviderMatrix detail={detail} />
      </section>
    </div>
  );
}

export default function ScanDetailPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Laden…</div>}>
          <ScanDetailInner />
        </Suspense>
      </div>
    </main>
  );
}
