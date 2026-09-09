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
  lastRunAt: string | null; // latest completed run
};

const fmtRun = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null;

/** Next moment a preset may run again, or null when it may run now. */
export const nextAllowed = (s: Pick<Scenario, "isPreset" | "lastRunAt">, cooldownHours: number) => {
  if (!s.isPreset || !s.lastRunAt) return null;
  const next = new Date(new Date(s.lastRunAt).getTime() + cooldownHours * 3600_000);
  return next > new Date() ? next : null;
};

// Preset chips (configured on /admin/presets) + the scrape buttons for the
// selected preset / all presets. Custom scenarios from the "Eigen scrape"
// form are deliberately NOT listed here: their results are reached through
// the link in the sweep status and via the archive.
// Presets are rate-limited (see PRESET_COOLDOWN_HOURS): the buttons show the
// cooldown and the API refuses early runs, so the two can't drift apart.
export default function ScenarioPicker({
  scenarios,
  activeId,
  onSelect,
  cooldownHours,
  busy,
  onScrapeScenario,
  onScrapeAllPresets,
}: {
  scenarios: Scenario[];
  activeId: number | null;
  onSelect: (id: number) => void;
  cooldownHours: number;
  busy: boolean;
  onScrapeScenario: (scenario: Scenario) => void;
  onScrapeAllPresets: () => void;
}) {
  const presets = scenarios.filter((s) => s.isPreset);
  const active = presets.find((s) => s.id === activeId) ?? null;

  const activeNext = active ? nextAllowed(active, cooldownHours) : null;
  // "All presets" waits for the most recently scanned preset.
  const latestPreset = presets.reduce<Scenario | null>(
    (best, s) => (s.lastRunAt && (!best?.lastRunAt || s.lastRunAt > best.lastRunAt) ? s : best),
    null
  );
  const allNext = latestPreset ? nextAllowed(latestPreset, cooldownHours) : null;
  const fmtNext = (d: Date) => d.toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const btn = (isActive: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-slate-900 text-white shadow"
        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
    }`;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Scenario</span>
        {presets.map((s) => {
          const last = fmtRun(s.lastRunAt);
          const isActive = s.id === activeId;
          return (
            <button key={s.id} className={`${btn(isActive)} text-left`} onClick={() => onSelect(s.id)}>
              <span className="block leading-tight">
                {scenarioLabel(s)} · {usageLabel(s)}
              </span>
              <span className={`block text-[10px] font-normal leading-tight ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                {last ? `laatste scan ${last}` : "nog niet gescand"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <button
          disabled={busy || !active || activeNext != null}
          onClick={() => active && onScrapeScenario(active)}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          title={
            activeNext
              ? `Deze preset is ${fmtRun(active!.lastRunAt)} gescand; opnieuw kan vanaf ${fmtNext(activeNext)}`
              : "Draait de 6 scrapers voor het geselecteerde scenario (standaardadres)"
          }
        >
          ▶ Scrape dit scenario
        </button>
        <button
          disabled={busy || presets.length === 0 || allNext != null}
          onClick={onScrapeAllPresets}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          title={
            allNext
              ? `Laatste preset-scan ${fmtRun(latestPreset!.lastRunAt)}; alle presets opnieuw kan vanaf ${fmtNext(allNext)}`
              : `Draait de 6 scrapers voor alle ${presets.length} presets (duurt langer)`
          }
        >
          ⟳ Ververs alle presets
        </button>
        <span className="text-xs text-slate-600">
          {activeNext
            ? `"${active ? scenarioLabel(active) : ""}" is ${fmtRun(active!.lastRunAt)} gescand — opnieuw kan vanaf ${fmtNext(activeNext)}`
            : allNext
              ? `Alle presets opnieuw kan vanaf ${fmtNext(allNext)} (laatste preset-scan ${fmtRun(latestPreset!.lastRunAt)})`
              : `Presets worden hooguit eens per ${cooldownHours} uur gescand; eigen scenario's met een eigen adres altijd.`}
        </span>
      </div>
    </div>
  );
}
