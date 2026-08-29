import { useEffect, useMemo, useState } from "react";
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
import { api } from "../api.js";

const COLORS = ["#1a3a32", "#c47b2b", "#6b2d3c", "#2f5d50", "#8a5a2b", "#3d4f7c", "#5a6b3a"];

function eur(n) {
  if (n == null) return "";
  return Number(n).toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default function TrendsPage() {
  const [raw, setRaw] = useState(null);
  const [profile, setProfile] = useState("midden");
  const [source, setSource] = useState("");
  const [metric, setMetric] = useState("yearly");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .trends({ profile, source, metric })
      .then(setRaw)
      .catch((e) => setError(e.message));
  }, [profile, source, metric]);

  const { series, chart } = useMemo(() => {
    const points = raw?.points || [];
    const key = metric === "monthly" ? "monthly_total" : "yearly_total";
    const names = [...new Set(points.map((p) => `${p.provider} · ${p.source}`))];
    const byTime = new Map();
    for (const p of points) {
      const t = p.t;
      if (!byTime.has(t)) byTime.set(t, { t });
      byTime.get(t)[`${p.provider} · ${p.source}`] = p[key];
    }
    const chartRows = [...byTime.values()].sort((a, b) => a.t.localeCompare(b.t));
    return { series: names, chart: chartRows };
  }, [raw, metric]);

  const highlighted = new Set(raw?.highlighted || []);

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Prijs over tijd</h2>
          <p className="lede">
            Elke succesvolle run is een punt. Uitgelichte leveranciers krijgen een dikkere lijn.
            Twee zaad-snapshots (21 en 28 augustus 2026) zitten erin tot je live ophaalt.
          </p>
        </div>
      </div>

      <div className="filters card">
        <label>
          Profiel
          <select value={profile} onChange={(e) => setProfile(e.target.value)}>
            <option value="laag">Laag</option>
            <option value="midden">Midden</option>
            <option value="hoog">Hoog</option>
            <option value="custom">Aangepast</option>
          </select>
        </label>
        <label>
          Bron
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">Alle bronnen</option>
            {(raw?.sources || []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Bedrag
          <select value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="yearly">per jaar</option>
            <option value="monthly">per maand</option>
          </select>
        </label>
      </div>

      {error && <p className="banner err">{error}</p>}

      <div className="chart-card card">
        {chart.length < 2 ? (
          <p className="empty">Nog te weinig punten voor een lijn. Haal minstens twee runs op.</p>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={chart} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="#e3d6c4" strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tickFormatter={(t) =>
                  new Date(t).toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam", day: "2-digit", month: "short" })
                }
              />
              <YAxis tickFormatter={(v) => eur(v)} width={80} />
              <Tooltip
                labelFormatter={(t) => new Date(t).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" })}
                formatter={(v, name) => [eur(v), name]}
              />
              <Legend />
              {series.map((name, i) => {
                const pin = [...highlighted].some((h) => name.toLowerCase().includes(h));
                return (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={pin ? 3.4 : 1.6}
                    dot={{ r: pin ? 5 : 3 }}
                    connectNulls
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
