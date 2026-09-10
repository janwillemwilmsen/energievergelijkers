"use client";

import Link from "next/link";
import { platformColor } from "@/lib/platformColors";
import { scenarioLabel, usageLabel, type ScenarioLike } from "@/lib/scenarioLabel";
import type { OverviewCard } from "./KpiCards";

export type PresetMatrixData = {
  myCompany: string | null;
  types: readonly string[];
  presets: (ScenarioLike & {
    id: number;
    lastRunAt: string | null;
    cards: Record<string, OverviewCard[]>;
  })[];
};

const TYPE_LABEL: Record<string, string> = { vast: "Vast", variabel: "Variabel", dynamisch: "Dynamisch" };
const eur = (v: number) => `€${v.toFixed(0)}`;

function Delta({ delta }: { delta: number | null | undefined }) {
  if (delta == null) return <span className="text-[10px] font-medium text-slate-500">nieuw</span>;
  if (delta > 0) return <span className="text-[11px] font-semibold text-emerald-700">↑{delta}</span>;
  if (delta < 0) return <span className="text-[11px] font-semibold text-rose-700">↓{-delta}</span>;
  return <span className="text-[11px] font-medium text-slate-500">=</span>;
}

// One compact cell: our rank within the contract type on that platform, the
// move vs the previous scan, our price and the gap to the type's cheapest.
function Cell({ c }: { c: OverviewCard }) {
  if (!c.hasData) return <div className="py-2 text-center text-xs text-slate-400">geen scan</div>;
  const title = [
    c.myContract ? `Eigen beste: ${c.myContract} (${eur(c.myAnnualCost!)}/jr)` : "Eigen merk niet in deze lijst",
    c.leader ? `#1: ${c.leader.supplier} (${eur(c.leader.annualCost)}/jr)` : null,
    c.previousRank != null ? `Vorige scan: #${c.previousRank}` : null,
    c.scrapedAt ? new Date(c.scrapedAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" }) : null,
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <div className="py-1.5 text-center" title={title}>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-lg font-bold leading-none text-slate-900">{c.myRank != null ? `#${c.myRank}` : "—"}</span>
        <span className="text-[11px] text-slate-500">/{c.offerCount}</span>
        {c.myRank != null && <Delta delta={c.delta} />}
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-slate-600">
        {c.myAnnualCost != null ? (
          <>
            {eur(c.myAnnualCost)}
            {c.gapToLeader != null && c.gapToLeader > 0 && <span className="text-rose-600"> +{eur(c.gapToLeader)}</span>}
            {c.gapToLeader === 0 && <span className="text-emerald-700"> goedkoopste</span>}
          </>
        ) : (
          <span className="text-slate-500">niet in lijst</span>
        )}
      </div>
    </div>
  );
}

// Homepage matrix: per preset a block with one row per contract type and one
// column per platform. Ranks are within the row's contract type (so #3 in the
// "vast" row = 3rd cheapest fixed contract), unlike the cards above which
// rank across all types for the selected scenario.
export default function PresetMatrix({ data }: { data: PresetMatrixData }) {
  const platforms = data.presets[0]?.cards[data.types[0]]?.map((c) => ({ platform: c.platform, label: c.label })) ?? [];
  if (!data.presets.length || !platforms.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Alle presets per contracttype
        </h2>
        <span className="text-xs text-slate-600">
          Rank van {data.myCompany ?? "eigen merk"} binnen het contracttype, laatste scan per preset · ↑↓ t.o.v. vorige scan ·
          prijs = eigen beste per jaar, rood = duurder dan de goedkoopste van dat type
        </span>
      </div>
      {data.presets.map((p) => (
        <div key={p.id} className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
            <div>
              <span className="text-sm font-semibold text-slate-900">{scenarioLabel(p)}</span>
              <span className="ml-2 text-xs text-slate-600">{usageLabel(p)}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              {p.lastRunAt
                ? `laatste scan ${new Date(p.lastRunAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}`
                : "nog niet gescand"}
              <Link href={`/archive/vergelijk?scenarioId=${p.id}`} className="font-medium text-emerald-700 hover:underline">
                Rankverloop →
              </Link>
            </div>
          </div>
          <table className="w-full min-w-[820px] table-fixed text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide">
                <th className="w-24 px-3 py-1.5 text-left text-slate-500">Type</th>
                {platforms.map((pl) => (
                  <th key={pl.platform} className={`px-2 py-1.5 text-center ${platformColor(pl.platform).text}`}>
                    {pl.label.split(".")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.types.map((t) => (
                <tr key={t} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-xs font-semibold text-slate-700">{TYPE_LABEL[t] ?? t}</td>
                  {(p.cards[t] ?? []).map((c) => (
                    <td key={c.platform} className="px-1 align-middle">
                      <Cell c={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
