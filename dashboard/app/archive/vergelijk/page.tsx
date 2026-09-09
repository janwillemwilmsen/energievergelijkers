"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
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
        <div className="text-[10px] text-slate-600">{dateStr}</div>
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
              <div className="mt-0.5 text-[10px] text-slate-600">#{d.overallRank} in de volledige lijst</div>
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
      <div className="mb-1 text-[10px] text-slate-600">{dateStr} · wijs een lijn aan voor contract &amp; prijs</div>
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
  minElec: number | null;
  maxElec: number | null;
  avgGas: number | null;
  minGas: number | null;
  maxGas: number | null;
  avgRating: number | null;
  vast: number;
  variabel: number;
  dynamisch: number;
};
type OverviewSeries = { platform: string; label: string; points: OverviewPoint[] };

// Metrics for the cross-platform chart. `rank` inverts the y-axis (#1 on top);
// nullable metrics show gaps where a run had no data for them (own brand
// absent, platform without tariffs/ratings). `decimals` drives the y-axis:
// tariffs (€0,28–€0,31) and ratings (7,5–8,9) need decimal ticks, otherwise
// recharts collapses the axis onto a single integer.
const TARIFF_NOTE =
  "All-in tarief (incl. btw en energiebelasting) zoals de vergelijker het toont. Pricewise toont alleen leveringstarieven en ontbreekt daarom.";
const METRICS = [
  { key: "cheapest", label: "Goedkoopste contract", unit: "€/jaar", kind: "eur", decimals: 0, lowerIsBetter: null,
    help: "Verwachte jaarkosten (incl. eenmalige korting) van het goedkoopste contract dat de vergelijker toont voor dit scenario. Laat zien hoe scherp de markt op elke vergelijker is en of de bodemprijs stijgt of daalt." },
  { key: "avg", label: "Gemiddelde jaarprijs", unit: "€/jaar", kind: "eur", decimals: 0, lowerIsBetter: null,
    help: "Gemiddelde verwachte jaarkosten (incl. korting) over alle getoonde contracten. Verschil met het goedkoopste contract = hoe breed de prijsspreiding is." },
  { key: "myRank", label: "Rank eigen merk", unit: "positie", kind: "rank", decimals: 0, lowerIsBetter: true,
    help: "Positie van het beste eigen contract in de prijsgesorteerde lijst (#1 = goedkoopste). Bij een contracttype-filter wordt geteld binnen die types. Gaten in de lijn = eigen merk stond niet in de lijst." },
  { key: "myDelta", label: "Eigen merk t.o.v. goedkoopste", unit: "€/jaar", kind: "eur", decimals: 0, lowerIsBetter: true,
    help: "Jaarkosten van het beste eigen contract minus die van het goedkoopste contract in de lijst. €0 = wij zijn de goedkoopste; €150 = een klant betaalt bij ons €150/jaar meer dan bij de koploper." },
  { key: "maxCashback", label: "Hoogste cashback", unit: "€", kind: "eur", decimals: 0, lowerIsBetter: null,
    help: "Grootste eenmalige welkomstkorting/cashback die een contract in de lijst biedt. Stijgt dit, dan wordt er harder met kortingen gevochten." },
  { key: "count", label: "Aantal contracten", unit: "stuks", kind: "num", decimals: 0, lowerIsBetter: null,
    help: "Hoeveel contracten de vergelijker toont voor dit scenario (binnen het contracttype-filter). Een sprong betekent meestal dat er leveranciers of producten bij zijn gekomen of zijn verdwenen." },
  { key: "avgElec", label: "Gemiddeld stroomtarief", unit: "€/kWh", kind: "eur", decimals: 4, lowerIsBetter: null,
    help: "Gemiddeld stroomtarief (normaal) over alle contracten in de lijst. " + TARIFF_NOTE },
  { key: "minElec", label: "Laagste stroomtarief", unit: "€/kWh", kind: "eur", decimals: 4, lowerIsBetter: null,
    help: "Laagste stroomtarief (normaal) dat een contract in de lijst rekent. " + TARIFF_NOTE },
  { key: "maxElec", label: "Hoogste stroomtarief", unit: "€/kWh", kind: "eur", decimals: 4, lowerIsBetter: null,
    help: "Hoogste stroomtarief (normaal) dat een contract in de lijst rekent. " + TARIFF_NOTE },
  { key: "avgGas", label: "Gemiddeld gastarief", unit: "€/m³", kind: "eur", decimals: 4, lowerIsBetter: null,
    help: "Gemiddeld gastarief over alle contracten in de lijst (alleen contracten met gas). " + TARIFF_NOTE },
  { key: "minGas", label: "Laagste gastarief", unit: "€/m³", kind: "eur", decimals: 4, lowerIsBetter: null,
    help: "Laagste gastarief dat een contract in de lijst rekent. " + TARIFF_NOTE },
  { key: "maxGas", label: "Hoogste gastarief", unit: "€/m³", kind: "eur", decimals: 4, lowerIsBetter: null,
    help: "Hoogste gastarief dat een contract in de lijst rekent. " + TARIFF_NOTE },
  { key: "avgRating", label: "Gemiddelde beoordeling", unit: "cijfer", kind: "score", decimals: 2, lowerIsBetter: false,
    help: "Gemiddelde klantbeoordeling (1–10) van de contracten in de lijst, zoals de vergelijker die toont. Niet elke vergelijker toont een cijfer." },
] as const;
type MetricKey = (typeof METRICS)[number]["key"];

const fmtDay = (t: number) => new Date(t).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit" });

type Metric = (typeof METRICS)[number];

const eur0 = (v: number | null) => (v == null ? "—" : `€${Math.round(v)}`);
const eur4 = (v: number | null) => (v == null ? "—" : `€${v.toFixed(4)}`);
const range4 = (lo: number | null, avg: number | null, hi: number | null) =>
  lo == null || hi == null ? "—" : `${eur4(lo)} – ${eur4(hi)} · gem. ${eur4(avg)}`;

// Hover panel for the cross-platform chart. Every line has its own data
// array with its own scrape times, so recharts' axis tooltip snaps to the
// first line's timestamps and always reports that platform, and it has no
// per-item tooltips for lines. So the dots are Scatter symbols with their own
// mouse handlers, and this panel is positioned by the chart itself. It shows
// the hovered scan in full: every metric, the type mix and the change vs the
// previous scan of the same platform.
type HoverDot = { platform: string; t: number; x: number; y: number };

function CrossTip({
  hover,
  series,
  m,
  fmt,
}: {
  hover: HoverDot;
  series: OverviewSeries[];
  m: Metric;
  fmt: (v: number) => string;
}) {
  const s = series.find((x) => x.platform === hover.platform);
  const idx = s ? s.points.findIndex((pt) => pt.t === hover.t) : -1;
  if (!s || idx < 0) return null;
  const entries = [{ s, t: hover.t, point: s.points[idx], prev: idx > 0 ? s.points[idx - 1] : null }];
  const t = hover.t;

  const row = (k: string, v: string) => (
    <div key={k} className="flex justify-between gap-6">
      <span className="whitespace-nowrap text-slate-600">{k}</span>
      <span className="whitespace-nowrap text-right tabular-nums text-slate-900">{v}</span>
    </div>
  );

  return (
    <div className="rounded-md bg-white p-3 text-xs shadow-lg ring-1 ring-slate-200">
      <div className="mb-1 font-medium text-slate-700">
        {new Date(t).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
      </div>
      {entries.map(({ s, point, prev }, i) => {
        const cur = point[m.key];
        const before = prev ? prev[m.key] : null;
        const delta =
          typeof cur === "number" && typeof before === "number"
            ? Math.round((cur - before) * 10 ** m.decimals) / 10 ** m.decimals
            : null;
        const mix = `${point.vast} vast · ${point.variabel} variabel · ${point.dynamisch} dynamisch`;
        return (
          <div key={s.platform} className={i > 0 ? "mt-2 border-t border-slate-200 pt-2" : ""}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-slate-900">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: platformColor(s.platform).hex }} />
                {s.label}
              </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {m.label}: {typeof cur === "number" ? fmt(cur) : "—"}
                {delta != null && delta !== 0 && (
                  <span className="ml-1 font-normal text-slate-700">
                    ({delta > 0 ? "▲" : "▼"} {m.kind === "rank" ? Math.abs(delta) : fmt(Math.abs(delta))} t.o.v. vorige scan)
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 grid gap-y-0.5">
              {row("Contracten", String(point.count))}
              {row("Verdeling", mix)}
              {row("Goedkoopste", `${eur0(point.cheapest)}/jr`)}
              {row("Gemiddeld", `${eur0(point.avg)}/jr`)}
              {row("Hoogste cashback", eur0(point.maxCashback))}
              {row("Eigen rank", point.myRank != null ? `#${point.myRank} van ${point.count}` : "niet in lijst")}
              {row("Eigen merk vs. goedkoopste", point.myDelta != null ? `+${eur0(point.myDelta)}/jr` : "—")}
              {row("Stroomtarief", range4(point.minElec, point.avgElec, point.maxElec))}
              {row("Gastarief", range4(point.minGas, point.avgGas, point.maxGas))}
              {row("Beoordeling", point.avgRating != null ? point.avgRating.toFixed(2) : "—")}
            </div>
          </div>
        );
      })}
    </div>
  );
}



// Numbers behind the cross-platform chart for the selected metric: per
// platform the latest value, the change vs the previous scan and vs the start
// of the window, and the low/high over the window.
function MetricSummaryTable({
  series,
  m,
  fmt,
}: {
  series: OverviewSeries[];
  m: Metric;
  fmt: (v: number) => string;
}) {
  const rows = series
    .map((s) => {
      const vals = s.points.map((p) => p[m.key]).filter((v): v is number => typeof v === "number");
      const latestPoint = [...s.points].reverse().find((p) => typeof p[m.key] === "number");
      return {
        platform: s.platform,
        label: s.label,
        latest: vals.length ? vals[vals.length - 1] : null,
        latestAt: latestPoint?.t ?? null,
        prev: vals.length > 1 ? vals[vals.length - 2] : null,
        first: vals.length ? vals[0] : null,
        min: vals.length ? Math.min(...vals) : null,
        max: vals.length ? Math.max(...vals) : null,
        scans: vals.length,
        total: s.points.length,
      };
    })
    .sort((a, b) => (a.latest ?? Infinity) - (b.latest ?? Infinity) || a.label.localeCompare(b.label));

  const delta = (from: number | null, to: number | null) => {
    if (from == null || to == null) return <span className="text-slate-500">—</span>;
    const d = Math.round((to - from) * 10 ** m.decimals) / 10 ** m.decimals;
    if (d === 0) return <span className="text-slate-600">=</span>;
    const good = m.lowerIsBetter == null ? null : m.lowerIsBetter ? d < 0 : d > 0;
    const color = good == null ? "text-slate-700" : good ? "text-emerald-600" : "text-rose-600";
    const abs = m.kind === "rank" ? String(Math.abs(d)) : fmt(Math.abs(d));
    return (
      <span className={`font-medium ${color}`}>
        {d > 0 ? "▲" : "▼"} {abs}
      </span>
    );
  };
  const cell = (v: number | null) => (v == null ? <span className="text-slate-500">—</span> : fmt(v));

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[640px] text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            <th className="px-2 py-1.5 text-left">Vergelijker</th>
            <th className="px-2 py-1.5 text-right">Laatste scan</th>
            <th className="px-2 py-1.5 text-right">Δ vorige scan</th>
            <th className="px-2 py-1.5 text-right">Δ begin periode</th>
            <th className="px-2 py-1.5 text-right">Laagste</th>
            <th className="px-2 py-1.5 text-right">Hoogste</th>
            <th className="px-2 py-1.5 text-right">Scans</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.platform} className="border-b border-slate-50">
              <td className="px-2 py-1.5 font-medium" style={{ color: platformColor(r.platform).hex }}>
                {r.label.split(".")[0]}
                {r.latestAt != null && (
                  <span className="ml-1.5 font-normal text-slate-600">{fmtDay(r.latestAt)}</span>
                )}
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-slate-900">{cell(r.latest)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{delta(r.prev, r.latest)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">{delta(r.first, r.latest)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-slate-500">{cell(r.min)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-slate-500">{cell(r.max)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-slate-500">
                {r.scans}/{r.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-[10px] text-slate-600">
        Gesorteerd op laatste waarde · Δ = verandering (▲ hoger, ▼ lager)
        {m.lowerIsBetter != null && "; groen = gunstig voor het eigen merk"} · laagste/hoogste = over de hele periode
      </p>
    </div>
  );
}

// One chart, six platform-colored lines, pill-switchable metric. Each line has
// its own data array because the six platforms are scraped at slightly
// different moments — the x-axis is numeric time. The chart has its own
// contract-type filter (starts as the page filter, see `key` at the call site)
// and fetches its own data, so e.g. "vast" up top and "dynamisch" here can be
// compared side by side.
function CrossPlatformChart({
  scenarioId,
  days,
  initialTypes,
}: {
  scenarioId: number;
  days: number;
  initialTypes: Set<string>;
}) {
  const [metric, setMetric] = useState<MetricKey>("cheapest");
  const [types, setTypes] = useState<Set<string>>(initialTypes);
  const [series, setSeries] = useState<OverviewSeries[] | null>(null);
  const [hover, setHover] = useState<HoverDot | null>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const typesKey = [...types].sort().join(",");

  useEffect(() => {
    let stale = false;
    fetch(`/api/trends/overview?scenarioId=${scenarioId}&days=${days}${typesKey ? `&types=${typesKey}` : ""}`)
      .then((x) => x.json())
      .then((r) => {
        if (!stale) setSeries(r.series ?? []);
      });
    return () => {
      stale = true;
    };
  }, [scenarioId, days, typesKey]);

  const m = METRICS.find((x) => x.key === metric)!;
  const fmt = (v: number, decimals: number = m.decimals) =>
    m.kind === "eur" ? `€${v.toFixed(decimals)}`
    : m.kind === "rank" ? `#${v}`
    : m.kind === "score" ? v.toFixed(decimals)
    : String(v);
  const hasData = (series ?? []).some((s) => s.points.length > 0);
  const scope = typesKey ? typesKey.split(",").join(" + ") : "alle contracttypes";

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Meting</span>
        {METRICS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setMetric(opt.key)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              metric === opt.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title={opt.help}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Contracttype</span>
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() =>
              setTypes((prev) => {
                const next = new Set(prev);
                if (next.has(t)) next.delete(t);
                else next.add(t);
                return next;
              })
            }
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              types.has(t) ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            title="Filtert alleen deze grafiek (geen selectie = alle types)"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-slate-800">
          {m.label} <span className="font-normal text-slate-600">({m.unit})</span>
          <span className="ml-2 text-xs font-normal text-slate-500">— per vergelijker, {scope}</span>
        </div>
      </div>
      <p className="mb-2 text-[11px] text-slate-500">{m.help}</p>

      {series == null ? (
        <div className="py-16 text-center text-sm text-slate-600">Laden…</div>
      ) : !hasData ? (
        <div className="py-16 text-center text-sm text-slate-600">Geen data voor deze periode / dit contracttype</div>
      ) : (
        <div className="relative">
        <ResponsiveContainer width="100%" height={340} onResize={(w) => setChartWidth(w)}>
          <ComposedChart margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="t"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 11, fill: "#475569" }}
              tickFormatter={fmtDay}
            />
            <YAxis
              reversed={m.kind === "rank"}
              domain={m.kind === "rank" ? [1, "auto"] : ["auto", "auto"]}
              allowDecimals={m.decimals > 0}
              width={m.decimals >= 4 ? 72 : 56}
              tick={{ fontSize: 11, fill: "#475569" }}
              tickFormatter={(v: number) => fmt(v, Math.min(m.decimals, 3))}
              label={{ value: m.unit, angle: -90, position: "insideLeft", fontSize: 10, fill: "#475569" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) => (
              <Line
                key={s.platform}
                data={s.points.map((p) => ({ t: p.t, v: p[metric] }))}
                type="monotone"
                dataKey="v"
                name={s.label.split(".")[0]}
                stroke={platformColor(s.platform).hex}
                strokeWidth={2}
                dot={false}
                activeDot={false}
                connectNulls={false}
              />
            ))}
            {series.map((s) => (
              <Scatter
                key={`${s.platform}-dots`}
                data={s.points.filter((p) => typeof p[metric] === "number").map((p) => ({ t: p.t, v: p[metric], platform: s.platform }))}
                dataKey="v"
                name={s.label.split(".")[0]}
                fill={platformColor(s.platform).hex}
                legendType="none"
                shape={(props: { cx?: number; cy?: number; payload?: { t?: number } }) => {
                  const on = hover?.platform === s.platform && hover.t === props.payload?.t;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={on ? 6.5 : 4}
                      fill={platformColor(s.platform).hex}
                      stroke="#fff"
                      strokeWidth={1.5}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() =>
                        typeof props.payload?.t === "number" &&
                        setHover({ platform: s.platform, t: props.payload.t, x: props.cx ?? 0, y: props.cy ?? 0 })
                      }
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                }}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
        {hover && (
          <div
            className="pointer-events-none absolute z-10"
            style={{
              // right of the dot, or left of it in the right part of the chart;
              // below the dot in the upper half, above it in the lower half
              ...(chartWidth && hover.x > chartWidth * 0.55 ? { right: chartWidth - hover.x + 12 } : { left: hover.x + 12 }),
              ...(hover.y > 170 ? { bottom: 340 - hover.y + 12 } : { top: Math.max(0, hover.y - 12) }),
            }}
          >
            <CrossTip hover={hover} series={series} m={m} fmt={(v) => fmt(v)} />
          </div>
        )}
        </div>
      )}
      {series != null && hasData && <MetricSummaryTable series={series} m={m} fmt={(v) => fmt(v)} />}
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
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Vergelijkers naast elkaar over tijd
          </h2>
          <p className="mb-2 text-xs text-slate-600">
            Eén meting, één lijn per vergelijker, over de gekozen periode ({days} dagen). Deze grafiek heeft een eigen
            contracttype-filter (start gelijk aan het filter bovenaan).
          </p>
          {/* key: a change of the page-level type filter resets the chart's own filter to it */}
          <CrossPlatformChart key={typesKey} scenarioId={scenarioId} days={days} initialTypes={typeSel} />
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
