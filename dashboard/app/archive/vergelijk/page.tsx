"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { platformColor } from "@/lib/platformColors";
import { Scenario } from "@/components/ScenarioPicker";
import { scenarioLabel } from "@/lib/scenarioLabel";

const PLATFORM_OPTIONS = [
  ["gaslicht", "Gaslicht"],
  ["energiekiezer", "Energiekiezer"],
  ["energievergelijk", "Energievergelijk"],
  ["independer", "Independer"],
  ["overstappen", "Overstappen"],
  ["pricewise", "Pricewise"],
] as const;

const DAY_OPTIONS = [7, 30, 90, 365];

// Line colors for competitors; emerald is reserved for the own brand.
const LINE_PALETTE = [
  "#6366f1", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7", "#f43f5e",
  "#84cc16", "#06b6d4", "#d946ef", "#f97316", "#14b8a6", "#eab308",
  "#ec4899", "#8b5cf6", "#10b981", "#64748b",
];

const scenarioName = (s: Scenario) => scenarioLabel(s);

type RunDetail = { contract: string; cost: number; type: string; overallRank: number; typeRank: number };
type TrendData = {
  suppliers: { name: string; isMyCompany: boolean }[];
  points: Record<string, string | number | null>[];
  details: Record<string, RunDetail>[];
};

const TYPE_OPTIONS = ["vast", "variabel", "dynamisch"] as const;

// Tooltip for the rank chart. Hovering a specific line shows that supplier's
// contract + price; otherwise a compact ranked list (capped — with all
// suppliers visible the full list would not fit on screen).
function RankTip({
  active,
  label,
  payload,
  hover,
  detailByDate,
}: {
  active?: boolean;
  label?: string | number;
  payload?: { dataKey?: string | number; value?: number | string; color?: string; stroke?: string }[];
  hover: string | null;
  detailByDate: Map<string, Record<string, RunDetail>>;
}) {
  if (!active || !payload?.length) return null;
  const dateStr = new Date(String(label)).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" });
  const det = detailByDate.get(String(label)) ?? {};
  const hovered = hover ? payload.find((p) => p.dataKey === hover && typeof p.value === "number") : undefined;
  if (hovered && hover) {
    const d = det[hover];
    return (
      <div className="max-w-72 rounded-md bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-200">
        <div className="text-[10px] text-slate-400">{dateStr}</div>
        <div className="font-semibold text-slate-900">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ background: String(hovered.color ?? hovered.stroke ?? "#64748b") }}
          />
          {hover} · #{hovered.value}
        </div>
        {d && (
          <>
            <div className="truncate text-slate-500" title={d.contract}>{d.contract}</div>
            <div className="mt-0.5 text-slate-600">€{d.cost}/jaar · {d.type}</div>
            {d.overallRank !== Number(hovered.value) && (
              <div className="mt-0.5 text-[10px] text-slate-400">#{d.overallRank} in de volledige lijst</div>
            )}
          </>
        )}
      </div>
    );
  }
  const rows = [...payload]
    .filter((p) => typeof p.value === "number")
    .sort((a, b) => Number(a.value) - Number(b.value));
  const shown = rows.slice(0, 12);
  return (
    <div className="rounded-md bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-200">
      <div className="mb-1 text-[10px] text-slate-400">{dateStr} · wijs een lijn aan voor contract &amp; prijs</div>
      {shown.map((p) => {
        const d = det[String(p.dataKey)];
        return (
          <div key={String(p.dataKey)} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: String(p.color ?? p.stroke ?? "#64748b") }}
            />
            <span className="w-8 tabular-nums text-slate-500">#{p.value}</span>
            <span className="text-slate-800">{p.dataKey}</span>
            {d && <span className="ml-auto pl-3 tabular-nums text-slate-500">€{d.cost}</span>}
          </div>
        );
      })}
      {rows.length > shown.length && (
        <div className="mt-1 text-[10px] text-slate-400">+{rows.length - shown.length} meer…</div>
      )}
    </div>
  );
}

type OverviewPoint = {
  t: number;
  cheapest: number;
  avg: number;
  count: number;
  maxCashback: number;
  myRank: number | null;
  myDelta: number | null;
  avgElec: number | null;
  avgGas: number | null;
  avgRating: number | null;
  vast: number;
  variabel: number;
  dynamisch: number;
};
type OverviewSeries = { platform: string; label: string; points: OverviewPoint[] };

// Metrics for the cross-platform chart. `rank` inverts the y-axis (#1 on top);
// nullable metrics show gaps where a run had no data for them (own brand
// absent, platform without tariffs/ratings).
const METRICS = [
  { key: "cheapest", label: "Laagste jaarprijs", kind: "eur" },
  { key: "avg", label: "Gem. jaarprijs", kind: "eur" },
  { key: "myRank", label: "Eigen rank", kind: "rank" },
  { key: "myDelta", label: "Eigen merk vs. goedkoopste", kind: "eur" },
  { key: "maxCashback", label: "Max. cashback", kind: "eur" },
  { key: "count", label: "Aantal contracten", kind: "num" },
  { key: "avgElec", label: "Gem. stroomtarief", kind: "eur4" },
  { key: "avgGas", label: "Gem. gastarief", kind: "eur4" },
  { key: "avgRating", label: "Gem. beoordeling", kind: "score" },
] as const;
type MetricKey = (typeof METRICS)[number]["key"];

const fmtDay = (t: number) => new Date(t).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit" });

// One chart, six platform-colored lines, pill-switchable metric. Each line has
// its own data array because the six platforms are scraped at slightly
// different moments — the x-axis is numeric time.
function CrossPlatformChart({ series }: { series: OverviewSeries[] }) {
  const [metric, setMetric] = useState<MetricKey>("cheapest");
  const m = METRICS.find((x) => x.key === metric)!;
  const fmt = (v: number) =>
    m.kind === "eur" ? `€${v}`
    : m.kind === "eur4" ? `€${v.toFixed(4)}`
    : m.kind === "rank" ? `#${v}`
    : m.kind === "score" ? v.toFixed(2)
    : String(v);
  const hasData = series.some((s) => s.points.length > 0);
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Meting</span>
        {METRICS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setMetric(opt.key)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              metric === opt.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {!hasData ? (
        <div className="py-16 text-center text-sm text-slate-400">Geen data voor deze periode</div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={fmtDay}
            />
            <YAxis
              reversed={m.kind === "rank"}
              domain={m.kind === "rank" ? [1, "auto"] : ["auto", "auto"]}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(v: number) => fmt(v)}
            />
            <Tooltip
              labelFormatter={(t) => new Date(Number(t)).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
              formatter={(value) => [fmt(Number(value)), undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) => (
              <Line
                key={s.platform}
                data={s.points.map((p) => ({ t: p.t, [s.label]: p[metric] }))}
                type="monotone"
                dataKey={s.label}
                name={s.label.split(".")[0]}
                stroke={platformColor(s.platform).hex}
                strokeWidth={2}
                dot={{ r: 2.5 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
      {metric === "myDelta" && (
        <p className="mt-1 text-[11px] text-slate-400">
          €0 = eigen merk is de goedkoopste op die vergelijker; gaten = eigen merk stond er niet in.
        </p>
      )}
      {(metric === "avgElec" || metric === "avgGas") && (
        <p className="mt-1 text-[11px] text-slate-400">
          All-in tarieven (incl. btw en energiebelasting); Pricewise toont alleen leveringstarieven en ontbreekt daarom.
        </p>
      )}
    </div>
  );
}

const MIX_COLORS = { vast: "#0ea5e9", variabel: "#94a3b8", dynamisch: "#a855f7" } as const;

// Stacked area of the contract-type mix over time for one platform: shows when
// a comparator starts pushing fixed contracts (or drops dynamic ones).
function TypeMixChart({ series }: { series: OverviewSeries }) {
  if (series.points.length < 2)
    return (
      <div className="rounded-xl bg-white p-4 py-16 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
        Te weinig scans voor een verloop
      </div>
    );
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={series.points} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickFormatter={fmtDay}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
          <Tooltip
            labelFormatter={(t) => new Date(Number(t)).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="vast" stackId="m" stroke={MIX_COLORS.vast} fill={MIX_COLORS.vast} fillOpacity={0.55} name="vast" />
          <Area type="monotone" dataKey="variabel" stackId="m" stroke={MIX_COLORS.variabel} fill={MIX_COLORS.variabel} fillOpacity={0.55} name="variabel" />
          <Area type="monotone" dataKey="dynamisch" stackId="m" stroke={MIX_COLORS.dynamisch} fill={MIX_COLORS.dynamisch} fillOpacity={0.55} name="dynamisch" />
        </AreaChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-slate-400">
        Aantal contracten per type in elke scan (dynamisch incl. combinatie).
      </p>
    </div>
  );
}

// Rank movement per supplier on the selected platform, derived from the same
// data as the rank chart: current rank, delta vs the previous scan and vs the
// start of the window, best/worst, and how often the supplier appeared.
function MoversTable({ data }: { data: TrendData }) {
  const rows = useMemo(() => {
    const pts = data.points;
    return data.suppliers
      .map((s) => {
        const series = pts.map((p) => (typeof p[s.name] === "number" ? (p[s.name] as number) : null));
        const seen = series.filter((v): v is number => v != null);
        return {
          name: s.name,
          isMyCompany: s.isMyCompany,
          latest: series.length ? series[series.length - 1] : null,
          prev: series.length > 1 ? series[series.length - 2] : null,
          first: seen.length ? seen[0] : null,
          best: seen.length ? Math.min(...seen) : null,
          worst: seen.length ? Math.max(...seen) : null,
          seen: seen.length,
        };
      })
      .sort((a, b) => (a.latest ?? 9999) - (b.latest ?? 9999) || a.name.localeCompare(b.name));
  }, [data]);

  const delta = (from: number | null, to: number | null) => {
    if (from == null || to == null) return <span className="text-slate-300">—</span>;
    const d = from - to; // rank down = improvement
    if (d > 0) return <span className="font-medium text-emerald-600">▲ {d}</span>;
    if (d < 0) return <span className="font-medium text-rose-600">▼ {-d}</span>;
    return <span className="text-slate-400">=</span>;
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2 text-left">Leverancier</th>
            <th className="px-3 py-2 text-right">Rank nu</th>
            <th className="px-3 py-2 text-right">Δ vorige scan</th>
            <th className="px-3 py-2 text-right">Δ hele periode</th>
            <th className="px-3 py-2 text-right">Beste</th>
            <th className="px-3 py-2 text-right">Slechtste</th>
            <th className="px-3 py-2 text-right">Scans</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className={r.isMyCompany ? "border-b border-emerald-100 bg-emerald-50/70 font-medium" : "border-b border-slate-50 hover:bg-slate-50/60"}
            >
              <td className="px-3 py-1.5 text-slate-800">
                {r.name}
                {r.isMyCompany && <span className="ml-1.5 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">WIJ</span>}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums font-medium text-slate-900">
                {r.latest != null ? `#${r.latest}` : <span className="font-normal text-slate-300" title="Niet in de laatste scan">weg</span>}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums">{delta(r.prev, r.latest)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{delta(r.first, r.latest)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-slate-500">{r.best != null ? `#${r.best}` : "—"}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-slate-500">{r.worst != null ? `#${r.worst}` : "—"}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-slate-500">
                {r.seen}/{data.points.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-slate-100 p-2 text-[11px] text-slate-400">
        ▲ = gestegen in de ranking (lager ranknummer) · &quot;weg&quot; = stond eerder in de periode wel in de lijst, maar niet in de laatste scan
      </div>
    </div>
  );
}

function VergelijkInner() {
  const scenarioId = Number(useSearchParams().get("scenarioId"));
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [platform, setPlatform] = useState<string>("gaslicht");
  const [days, setDays] = useState(90);
  const [data, setData] = useState<TrendData | null>(null);
  const [overview, setOverview] = useState<OverviewSeries[] | null>(null);
  // Hidden (not visible) set, so newly appearing suppliers default to shown.
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [typeSel, setTypeSel] = useState<Set<string>>(new Set(["vast"]));
  const [hoverLine, setHoverLine] = useState<string | null>(null);
  const typesKey = [...typeSel].sort().join(",");

  useEffect(() => {
    if (!scenarioId) return;
    fetch("/api/scenarios")
      .then((x) => x.json())
      .then((r) => setScenario((r.scenarios ?? []).find((s: Scenario) => s.id === scenarioId) ?? null));
  }, [scenarioId]);

  useEffect(() => {
    if (!scenarioId) return;
    let stale = false;
    fetch(
      `/api/trends?scenarioId=${scenarioId}&platform=${platform}&days=${days}&all=1${typesKey ? `&types=${typesKey}` : ""}`
    )
      .then((x) => x.json())
      .then((d) => {
        if (!stale) setData(d);
      });
    return () => {
      stale = true;
    };
  }, [scenarioId, platform, days, typesKey]);

  useEffect(() => {
    if (!scenarioId) return;
    let stale = false;
    fetch(`/api/trends/overview?scenarioId=${scenarioId}&days=${days}${typesKey ? `&types=${typesKey}` : ""}`)
      .then((x) => x.json())
      .then((r) => {
        if (!stale) setOverview(r.series ?? []);
      });
    return () => {
      stale = true;
    };
  }, [scenarioId, days, typesKey]);

  const detailByDate = useMemo(
    () => new Map((data?.points ?? []).map((p, i) => [String(p.date), data?.details?.[i] ?? {}])),
    [data]
  );

  const lineColor = useMemo(() => {
    const m = new Map<string, string>();
    let i = 0;
    for (const s of data?.suppliers ?? []) m.set(s.name, s.isMyCompany ? "#059669" : LINE_PALETTE[i++ % LINE_PALETTE.length]);
    return m;
  }, [data]);

  const visible = (data?.suppliers ?? []).filter((s) => !hidden.has(s.name));

  const maxRank = data?.points.length
    ? Math.max(10, ...data.points.flatMap((p) => Object.values(p).filter((v): v is number => typeof v === "number")))
    : 10;

  if (!scenarioId) return <div className="py-24 text-center text-rose-500">scenarioId ontbreekt in de URL.</div>;

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rankverloop — {scenario ? scenarioName(scenario) : "…"}
          </h1>
          <p className="text-sm text-slate-500">
            Alle leveranciers over tijd, per vergelijker
            {scenario && (
              <>
                {" · "}
                {scenario.electricityNormal + scenario.electricityLow} kWh
                {scenario.gas > 0 ? ` · ${scenario.gas} m³ gas` : " · alleen stroom"}
                {scenario.solarFeedIn > 0 ? ` · ${scenario.solarFeedIn} kWh teruglevering` : ""}
              </>
            )}
          </p>
        </div>
        <Link href="/archive" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Archief
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Vergelijker</span>
        {PLATFORM_OPTIONS.map(([v, l]) => {
          const c = platformColor(v);
          const active = platform === v;
          return (
            <button
              key={v}
              onClick={() => setPlatform(v)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? "text-slate-900" : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
              style={active ? { background: `${c.hex}2e`, boxShadow: `inset 0 0 0 2px ${c.hex}` } : undefined}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: c.hex }} />
              {l}
            </button>
          );
        })}
        <span className="ml-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Periode</span>
        {DAY_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              days === d ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {d}d
          </button>
        ))}
        <span className="basis-full" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Contracttype</span>
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() =>
              setTypeSel((prev) => {
                const next = new Set(prev);
                if (next.has(t)) next.delete(t);
                else next.add(t);
                return next;
              })
            }
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              typeSel.has(t) ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Filtert alle grafieken en tabellen op deze pagina (geen selectie = alle types)"
          >
            {t}
          </button>
        ))}
        <span className="text-[10px] text-slate-400">
          {typesKey
            ? `rank = positie binnen ${typesKey.split(",").join(" + ")} (niet in de volledige lijst)`
            : "rank = positie in de volledige lijst"}
        </span>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        {!data ? (
          <div className="py-24 text-center text-sm text-slate-400">Laden…</div>
        ) : data.points.length === 0 ? (
          <div className="py-24 text-center text-sm text-slate-400">Geen trenddata voor deze selectie</div>
        ) : (
          <ResponsiveContainer width="100%" height={480}>
            <LineChart
              data={data.points}
              margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
              onMouseLeave={() => setHoverLine(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v: string) => new Date(v).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit" })}
              />
              {/* inverted: rank #1 at the top */}
              <YAxis
                reversed
                domain={[1, maxRank]}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                label={{ value: "Rank", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }}
              />
              <Tooltip content={<RankTip hover={hoverLine} detailByDate={detailByDate} />} />
              {visible.map((s) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={lineColor.get(s.name)}
                  strokeWidth={hoverLine === s.name ? 3.5 : s.isMyCompany ? 3.5 : 1.5}
                  strokeOpacity={hoverLine && hoverLine !== s.name ? 0.2 : 1}
                  dot={false}
                  connectNulls
                  onMouseEnter={() => setHoverLine(s.name)}
                  onMouseLeave={() => setHoverLine(null)}
                  activeDot={{
                    r: hoverLine === s.name ? 5 : 3,
                    onMouseOver: () => setHoverLine(s.name),
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {data && data.suppliers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Leveranciers</span>
          <button onClick={() => setHidden(new Set())} className="text-[11px] font-medium text-emerald-700 hover:underline">
            alles
          </button>
          <button
            onClick={() => setHidden(new Set(data.suppliers.filter((s) => !s.isMyCompany).map((s) => s.name)))}
            className="text-[11px] font-medium text-emerald-700 hover:underline"
          >
            alleen eigen merk
          </button>
          <button
            onClick={() => setHidden(new Set(data.suppliers.map((s) => s.name)))}
            className="mr-1 text-[11px] font-medium text-rose-600 hover:underline"
          >
            wis alles
          </button>
          {data.suppliers.map((s) => {
            const hex = lineColor.get(s.name)!;
            const on = !hidden.has(s.name);
            return (
              <button
                key={s.name}
                onClick={() => toggle(s.name)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  on ? "text-slate-900" : "text-slate-400 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
                style={on ? { background: `${hex}24`, boxShadow: `inset 0 0 0 1.5px ${hex}` } : undefined}
                title={on ? "Klik om deze lijn te verbergen" : "Klik om deze lijn te tonen"}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: on ? hex : "#cbd5e1" }} />
                {s.name}
                {s.isMyCompany && <span className="rounded bg-emerald-600 px-1 text-[9px] font-bold text-white">WIJ</span>}
              </button>
            );
          })}
        </div>
      )}

      {data && data.points.length > 1 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Beweging per leverancier — {PLATFORM_OPTIONS.find(([v]) => v === platform)?.[1] ?? platform}
          </h2>
          <MoversTable data={data} />
        </section>
      )}

      {overview && overview.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Vergelijkers naast elkaar over tijd
          </h2>
          <CrossPlatformChart series={overview} />
        </section>
      )}

      {(() => {
        const s = overview?.find((x) => x.platform === platform);
        return s ? (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Contracttype-mix over tijd — {PLATFORM_OPTIONS.find(([v]) => v === platform)?.[1] ?? platform}
            </h2>
            <TypeMixChart series={s} />
          </section>
        ) : null;
      })()}
    </div>
  );
}

export default function VergelijkPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Laden…</div>}>
          <VergelijkInner />
        </Suspense>
      </div>
    </main>
  );
}
