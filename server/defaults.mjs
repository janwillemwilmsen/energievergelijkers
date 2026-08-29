/**
 * Default usage presets for Dutch dual-meter households.
 *
 * Electricity split (normaal / dal) follows the dual-meter fields the existing
 * clients already send. The 65/35 peak/off-peak split is a typical Dutch
 * dual-meter pattern (Milieu Centraal / Nibud-style household figures, 2024–2025).
 *
 * Gas is annual m³. Figures combine household size with a matching house type:
 *   laag   — 1–2 personen, appartement
 *   midden — 3 personen, tussenwoning
 *   hoog   — 4+ personen, vrijstaand
 *
 * Sources: Milieu Centraal (gemiddeld stroom- en gasverbruik per huishouden /
 * woningtype). Rounded for a usable UI, fully editable.
 */
export const USAGE_PRESETS = {
  laag: {
    label: "Laag",
    hint: "1–2 personen, appartement",
    normaal: 1170,
    dal: 630,
    gas: 800,
  },
  midden: {
    label: "Midden",
    hint: "3 personen, tussenwoning",
    normaal: 1885,
    dal: 1015,
    gas: 1200,
  },
  hoog: {
    label: "Hoog",
    hint: "4+ personen, vrijstaand",
    normaal: 2600,
    dal: 1400,
    gas: 1800,
  },
  custom: {
    label: "Aangepast",
    hint: "Zelf invullen (client-default 2500/750/500)",
    normaal: 2500,
    dal: 750,
    gas: 500,
  },
};

export const DEFAULT_ADDRESS = {
  postcode: "5216EK",
  huisnummer: "27",
  note: "Voorbeeldadres uit de gaslicht-client (Den Bosch). Vervang door je eigen adres.",
};

export const DEFAULT_SETTINGS = {
  postcode: DEFAULT_ADDRESS.postcode,
  huisnummer: DEFAULT_ADDRESS.huisnummer,
  timezone: "Europe/Amsterdam",
  cronExpression: "0 7 * * *",
  dailyTime: "07:00",
  cronMode: "daily",
  scheduleProfile: "midden",
  enabledSources: [
    "energievergelijk",
    "energiekiezer",
    "overstappen",
    "independer",
    "pricewise",
    "gaslicht",
    "essent",
  ],
  highlightedProviders: ["essent", "vattenfall", "eneco"],
  usage: {
    laag: pickUsage(USAGE_PRESETS.laag),
    midden: pickUsage(USAGE_PRESETS.midden),
    hoog: pickUsage(USAGE_PRESETS.hoog),
    custom: pickUsage(USAGE_PRESETS.custom),
  },
};

export const PROFILE_KEYS = ["laag", "midden", "hoog", "custom"];

function pickUsage({ normaal, dal, gas }) {
  return { normaal, dal, gas };
}

export function usageForProfile(settings, profileKey) {
  const key = PROFILE_KEYS.includes(profileKey) ? profileKey : "midden";
  const usage = settings.usage?.[key] ?? USAGE_PRESETS[key];
  return {
    profile: key,
    normaal: Number(usage.normaal),
    dal: Number(usage.dal),
    gas: Number(usage.gas),
  };
}

export function dailyTimeToCron(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "07:00"));
  const hh = Math.min(23, Math.max(0, Number(m?.[1] ?? 7)));
  const mm = Math.min(59, Math.max(0, Number(m?.[2] ?? 0)));
  return `${mm} ${hh} * * *`;
}

export function cronToDailyTime(expr) {
  const parts = String(expr || "").trim().split(/\s+/);
  if (parts.length === 5 && parts[2] === "*" && parts[3] === "*" && parts[4] === "*") {
    const mm = parts[0];
    const hh = parts[1];
    if (/^\d+$/.test(mm) && /^\d+$/.test(hh)) {
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }
  }
  return null;
}
