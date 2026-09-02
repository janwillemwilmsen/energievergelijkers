"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PLATFORM_OPTIONS = [
  ["gaslicht", "Gaslicht"],
  ["energiekiezer", "Energiekiezer"],
  ["energievergelijk", "Energievergelijk"],
  ["independer", "Independer"],
  ["overstappen", "Overstappen"],
  ["pricewise", "Pricewise"],
] as const;

const COLORS = ["#059669", "#6366f1", "#f59e0b", "#ef4444", "#0ea5e9", "#a855f7"];

type TrendData = {
  suppliers: { name: string; isMyCompany: boolean }[];
  points: Record<string, string | number | null>[];
};

export default function TrendChart({ scenarioId }: { scenarioId: number }) {
  const [platform, setPlatform] = useState<string>("gaslicht");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<TrendData | null>(null);

  useEffect(() => {
    fetch(`/api/trends?scenarioId=${scenarioId}&platform=${platform}&days=${days}`)
      .then((x) => x.json())
      .then(setData);
  }, [scenarioId, platform, days]);

  const maxRank = data?.points.length
    ? Math.max(
        10,
        ...data.points.flatMap((p) =>
          Object.values(p).filter((v): v is number => typeof v === "number")
        )
      )
    : 10;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-700">Rankverloop — eigen merk vs. top-concurrenten</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-md bg-slate-50 px-2 py-1 text-sm text-slate-700 ring-1 ring-slate-200"
          >
            {PLATFORM_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          {[7, 30, 90].map((d) => (
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
        </div>
      </div>

      {!data || data.points.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">Geen trenddata voor deze selectie</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data.points} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(v: string) => new Date(v).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit" })}
            />
            {/* inverted: rank #1 at the top */}
            <YAxis
              reversed
              domain={[1, Math.min(maxRank, 40)]}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              label={{ value: "Rank", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }}
            />
            <Tooltip
              labelFormatter={(v) => new Date(String(v)).toLocaleString("nl-NL", { dateStyle: "medium" })}
              formatter={(value) => [`#${value}`, undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {data.suppliers.map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={s.isMyCompany ? "#059669" : COLORS[(i % (COLORS.length - 1)) + 1]}
                strokeWidth={s.isMyCompany ? 3.5 : 1.5}
                dot={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
