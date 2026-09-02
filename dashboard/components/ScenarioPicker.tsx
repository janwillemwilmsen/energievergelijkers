"use client";

export type Scenario = {
  id: number;
  name: string | null;
  electricityNormal: number;
  electricityLow: number;
  gas: number;
  solarFeedIn: number;
  isPreset: boolean;
  runCount: number;
};

const PRESET_LABELS: Record<string, string> = {
  low: "Laag · 1.500 kWh / 800 m³",
  medium: "Midden · 2.900 kWh / 1.200 m³",
  high: "Hoog · 4.500 kWh / 2.000 m³",
  solar: "Zon · 3.500 kWh + 2.000 terug / 1.000 m³",
};

// Scenario chips only — creating a new custom scenario (incl. address + scrape)
// happens in the ScrapeForm below the picker.
export default function ScenarioPicker({
  scenarios,
  activeId,
  onSelect,
}: {
  scenarios: Scenario[];
  activeId: number | null;
  onSelect: (id: number) => void;
}) {
  const presets = scenarios.filter((s) => s.isPreset);
  const customs = scenarios.filter((s) => !s.isPreset);

  const btn = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-slate-900 text-white shadow"
        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
    }`;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Scenario</span>
        {presets.map((s) => (
          <button key={s.id} className={btn(s.id === activeId)} onClick={() => onSelect(s.id)}>
            {PRESET_LABELS[s.name ?? ""] ?? s.name}
            {s.runCount === 0 && <span className="ml-1 text-xs opacity-60">(geen data)</span>}
          </button>
        ))}
        {customs.map((s) => (
          <button key={s.id} className={btn(s.id === activeId)} onClick={() => onSelect(s.id)}>
            {s.electricityNormal + s.electricityLow} kWh
            {s.gas > 0 ? ` / ${s.gas} m³` : " / mono"}
            {s.solarFeedIn > 0 ? ` / ☀ ${s.solarFeedIn}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
