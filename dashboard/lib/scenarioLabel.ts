// Display helpers for scenarios, shared by every page that shows one.
// Presets carry a user-editable `label` (see /admin/presets); scenarios that
// predate that column fall back to the legacy slug translation.

export type ScenarioLike = {
  name: string | null;
  label?: string | null;
  electricityNormal: number;
  electricityLow: number;
  gas: number;
  solarFeedIn: number;
};

const LEGACY_LABELS: Record<string, string> = { low: "Laag", medium: "Midden", high: "Hoog", solar: "Zon" };

const nf = new Intl.NumberFormat("nl-NL");

/** "2.900 kWh / 1.200 m³", "1.500 kWh / mono", "3.500 kWh + 2.000 terug / 1.000 m³" */
export const usageLabel = (s: ScenarioLike, compact = false) =>
  `${nf.format(s.electricityNormal + s.electricityLow)} kWh` +
  (s.solarFeedIn > 0 ? (compact ? ` / ☀ ${nf.format(s.solarFeedIn)}` : ` + ${nf.format(s.solarFeedIn)} terug`) : "") +
  (s.gas > 0 ? ` / ${nf.format(s.gas)} m³` : " / mono");

/** Preset label ("Midden") or, for custom scenarios, the usage description. */
export const scenarioLabel = (s: ScenarioLike) =>
  s.label ?? (s.name ? (LEGACY_LABELS[s.name] ?? s.name) : usageLabel(s, true));
