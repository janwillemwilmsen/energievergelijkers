"use client";

import { useState } from "react";

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

export default function ScenarioPicker({
  scenarios,
  activeId,
  onSelect,
  onCreateCustom,
}: {
  scenarios: Scenario[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onCreateCustom: (p: { electricityNormal: number; electricityLow: number; gas: number; solarFeedIn: number }) => void;
}) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [normal, setNormal] = useState(2500);
  const [low, setLow] = useState(0);
  const [gas, setGas] = useState(1000);
  const [mono, setMono] = useState(false);
  const [solar, setSolar] = useState(0);

  const presets = scenarios.filter((s) => s.isPreset);
  const customs = scenarios.filter((s) => !s.isPreset);

  const btn = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "bg-slate-900 text-white shadow"
        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
    }`;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-3">
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
        <button
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50"
          onClick={() => setShowBuilder((v) => !v)}
        >
          {showBuilder ? "Sluit" : "+ Eigen scenario"}
        </button>
      </div>

      {showBuilder && (
        <form
          className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            onCreateCustom({
              electricityNormal: normal,
              electricityLow: low,
              gas: mono ? 0 : gas,
              solarFeedIn: solar,
            });
            setShowBuilder(false);
          }}
        >
          {[
            { label: "Stroom normaal (kWh/jr)", value: normal, set: setNormal, min: 0 },
            { label: "Stroom dal (kWh/jr, optioneel)", value: low, set: setLow, min: 0 },
          ].map((f) => (
            <label key={f.label} className="text-xs text-slate-500">
              {f.label}
              <input
                type="number"
                min={f.min}
                value={f.value}
                onChange={(e) => f.set(Number(e.target.value))}
                className="mt-1 block w-40 rounded-md border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200"
              />
            </label>
          ))}
          <label className={`text-xs ${mono ? "text-slate-300" : "text-slate-500"}`}>
            Gas (m³/jr)
            <input
              type="number"
              min={0}
              value={gas}
              disabled={mono}
              onChange={(e) => setGas(Number(e.target.value))}
              className="mt-1 block w-32 rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200 disabled:opacity-40"
            />
          </label>
          <label className="flex items-center gap-1.5 pb-2 text-xs text-slate-600">
            <input type="checkbox" checked={mono} onChange={(e) => setMono(e.target.checked)} />
            Alleen stroom (mono)
          </label>
          <label className="text-xs text-slate-500">
            Teruglevering zon (kWh/jr)
            <input
              type="number"
              min={0}
              value={solar}
              onChange={(e) => setSolar(Number(e.target.value))}
              className="mt-1 block w-40 rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Aanmaken
          </button>
          <p className="basis-full text-xs text-slate-400">
            Een nieuw scenario is leeg tot de scrapers ervoor gedraaid hebben (scripts/run-scrapes.mjs of de ingest-API).
          </p>
        </form>
      )}
    </div>
  );
}
