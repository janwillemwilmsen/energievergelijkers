"use client";

import { scenarioLabel, usageLabel } from "@/lib/scenarioLabel";

export type Scenario = {
  id: number;
  name: string | null;
  label: string | null;
  electricityNormal: number;
  electricityLow: number;
  gas: number;
  solarFeedIn: number;
  isPreset: boolean;
  runCount: number;
};

// Presets (label + usage) are configured on /admin/presets.
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
            {scenarioLabel(s)} · {usageLabel(s)}
            {s.runCount === 0 && <span className="ml-1 text-xs opacity-60">(geen data)</span>}
          </button>
        ))}
        {customs.map((s) => (
          <button key={s.id} className={btn(s.id === activeId)} onClick={() => onSelect(s.id)}>
            {usageLabel(s, true)}
          </button>
        ))}
      </div>
    </div>
  );
}
