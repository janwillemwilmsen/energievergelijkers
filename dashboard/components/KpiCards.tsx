"use client";

export type OverviewCard = {
  platform: string;
  label: string;
  hasData: boolean;
  scrapedAt?: string;
  offerCount?: number;
  myRank?: number | null;
  previousRank?: number | null;
  delta?: number | null; // positive = climbed
  myAnnualCost?: number | null;
  myContract?: string | null;
  leader?: { supplier: string; annualCost: number } | null;
  gapToLeader?: number | null;
};

function DeltaBadge({ delta }: { delta: number | null | undefined }) {
  if (delta == null)
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">nieuw</span>;
  if (delta > 0)
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        ↑ {delta} {delta === 1 ? "plek" : "plekken"}
      </span>
    );
  if (delta < 0)
    return (
      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
        ↓ {-delta} {delta === -1 ? "plek" : "plekken"}
      </span>
    );
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">= gelijk</span>;
}

export default function KpiCards({ cards }: { cards: OverviewCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div key={c.platform} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</span>
            {c.hasData && <DeltaBadge delta={c.delta} />}
          </div>
          {!c.hasData ? (
            <div className="mt-4 text-sm text-slate-400">Geen data voor dit scenario</div>
          ) : (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {c.myRank != null ? `#${c.myRank}` : "—"}
                </span>
                <span className="text-xs text-slate-400">van {c.offerCount}</span>
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                {c.myAnnualCost != null && (
                  <div>
                    Eigen beste: <span className="font-medium text-slate-700">€{c.myAnnualCost.toFixed(0)}/jr</span>
                  </div>
                )}
                {c.leader && (
                  <div>
                    #1: {c.leader.supplier} (€{c.leader.annualCost.toFixed(0)})
                    {c.gapToLeader != null && c.gapToLeader > 0 && (
                      <span className="text-rose-500"> · +€{c.gapToLeader.toFixed(0)}</span>
                    )}
                  </div>
                )}
                {c.scrapedAt && (
                  <div className="text-slate-300">
                    {new Date(c.scrapedAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
