"use client";

import { useMemo, useState } from "react";

export type OfferRow = {
  id: number;
  platform: string;
  platformLabel: string;
  supplier: string;
  isMyCompany: boolean;
  contractName: string;
  contractType: string;
  durationMonths: number | null;
  rank: number;
  annualCost: number;
  monthlyCost: number;
  discount: number | null;
  rating: number | null;
};

type SortKey = "rank" | "supplier" | "contractName" | "annualCost" | "monthlyCost" | "platform";
const PAGE_SIZE = 25;

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-md bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
      >
        {label}
        {selected.size > 0 && (
          <span className="ml-1 rounded-full bg-slate-900 px-1.5 text-[10px] text-white">{selected.size}</span>
        )}
      </button>
      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-56 overflow-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-slate-200">
          <button
            className="mb-1 text-[11px] text-emerald-700 hover:underline"
            onClick={() => onChange(new Set())}
          >
            Alles wissen
          </button>
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 rounded px-1 py-0.5 text-xs text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selected.has(o)}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(o);
                  else next.delete(o);
                  onChange(next);
                }}
              />
              {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OffersTable({ offers }: { offers: OfferRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<Set<string>>(new Set());
  const [supplierFilter, setSupplierFilter] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set());
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(0);

  const platforms = useMemo(() => [...new Set(offers.map((o) => o.platformLabel))].sort(), [offers]);
  const suppliers = useMemo(() => [...new Set(offers.map((o) => o.supplier))].sort(), [offers]);
  const types = useMemo(() => [...new Set(offers.map((o) => o.contractType))].sort(), [offers]);

  const filtered = useMemo(() => {
    let rows = offers;
    if (platformFilter.size) rows = rows.filter((o) => platformFilter.has(o.platformLabel));
    if (supplierFilter.size) rows = rows.filter((o) => supplierFilter.has(o.supplier));
    if (typeFilter.size) rows = rows.filter((o) => typeFilter.has(o.contractType));
    if (onlyMine) rows = rows.filter((o) => o.isMyCompany);
    const dir = sortAsc ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [offers, platformFilter, supplierFilter, typeFilter, onlyMine, sortKey, sortAsc]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  if (page >= pages && page !== 0) setPage(0);

  const header = (key: SortKey, label: string, right = false) => (
    <th
      className={`cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 ${right ? "text-right" : "text-left"}`}
      onClick={() => {
        if (sortKey === key) setSortAsc(!sortAsc);
        else {
          setSortKey(key);
          setSortAsc(true);
        }
        setPage(0);
      }}
    >
      {label}
      {sortKey === key && <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>}
    </th>
  );

  const typeBadge = (t: string, months: number | null) => {
    const style =
      t === "vast" ? "bg-sky-50 text-sky-700 ring-sky-200"
      : t === "dynamisch" ? "bg-violet-50 text-violet-700 ring-violet-200"
      : t === "combinatie" ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-slate-50 text-slate-600 ring-slate-200";
    return (
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${style}`}>
        {t}
        {months ? ` ${months / 12}jr` : ""}
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
        <h2 className="mr-2 text-sm font-semibold text-slate-700">
          Alle contracten <span className="font-normal text-slate-400">({filtered.length})</span>
        </h2>
        <MultiSelect label="Platform" options={platforms} selected={platformFilter} onChange={(s) => { setPlatformFilter(s); setPage(0); }} />
        <MultiSelect label="Leverancier" options={suppliers} selected={supplierFilter} onChange={(s) => { setSupplierFilter(s); setPage(0); }} />
        <MultiSelect label="Contracttype" options={types} selected={typeFilter} onChange={(s) => { setTypeFilter(s); setPage(0); }} />
        <label className="flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={onlyMine} onChange={(e) => { setOnlyMine(e.target.checked); setPage(0); }} />
          Alleen eigen merk
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-slate-100">
            <tr>
              {header("rank", "Rank")}
              {header("platform", "Platform")}
              {header("supplier", "Leverancier")}
              {header("contractName", "Contract")}
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Type</th>
              {header("monthlyCost", "€/mnd", true)}
              {header("annualCost", "€/jaar", true)}
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">Korting</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => (
              <tr
                key={o.id}
                className={
                  o.isMyCompany
                    ? "border-b border-emerald-100 bg-emerald-50/70 font-medium"
                    : "border-b border-slate-50 hover:bg-slate-50/60"
                }
              >
                <td className="px-3 py-2 tabular-nums text-slate-500">#{o.rank}</td>
                <td className="px-3 py-2 text-slate-500">{o.platformLabel}</td>
                <td className="px-3 py-2 text-slate-800">
                  {o.supplier}
                  {o.isMyCompany && (
                    <span className="ml-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">WIJ</span>
                  )}
                </td>
                <td className="max-w-72 truncate px-3 py-2 text-slate-600" title={o.contractName}>
                  {o.contractName}
                </td>
                <td className="px-3 py-2">{typeBadge(o.contractType, o.durationMonths)}</td>
                <td className="text-gray-700 px-3 py-2 text-right tabular-nums text-slate-700">€{o.monthlyCost.toFixed(2)}</td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-900">€{o.annualCost.toFixed(0)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-emerald-700">
                  {o.discount ? `€${o.discount.toFixed(0)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-3 text-xs text-slate-500">
        <span>
          {filtered.length === 0 ? "0" : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} van{" "}
          {filtered.length}
        </span>
        <div className="flex gap-1.5">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-md bg-slate-100 px-2.5 py-1 disabled:opacity-40"
          >
            ← Vorige
          </button>
          <span className="px-1 py-1">
            {page + 1}/{pages}
          </span>
          <button
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
            className="rounded-md bg-slate-100 px-2.5 py-1 disabled:opacity-40"
          >
            Volgende →
          </button>
        </div>
      </div>
    </div>
  );
}
