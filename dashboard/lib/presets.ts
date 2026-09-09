// Server-side helpers for the configurable presets + default scrape address
// (edited on /admin/presets, read by the runner scripts via GET /api/presets).
import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export const SETTING_POSTCODE = "defaultPostcode";
// Preset scans (default address) may run at most once per this many hours;
// enforced by POST /api/scrapes/run and mirrored in the dashboard UI.
export const PRESET_COOLDOWN_HOURS = 12;

/** Whether a preset that last completed at `lastRunAt` may run again now. */
export function presetCooldown(lastRunAt: Date | null, now = new Date()) {
  if (!lastRunAt) return { blocked: false, nextAllowedAt: null as Date | null };
  const nextAllowedAt = new Date(lastRunAt.getTime() + PRESET_COOLDOWN_HOURS * 3600_000);
  return { blocked: nextAllowedAt > now, nextAllowedAt };
}
export const SETTING_HUISNR = "defaultHuisnr";
// Used until an address is saved (also seeded by prisma/seed.mjs).
export const DEFAULT_ADDRESS = { postcode: "5216EK", huisnr: "27" };

export const SCENARIO_ORDER: Prisma.ScenarioOrderByWithRelationInput[] = [
  { isPreset: "desc" },
  { sortOrder: "asc" },
  { id: "asc" },
];

export function normalizePostcode(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const pc = v.replace(/\s+/g, "").toUpperCase();
  return /^\d{4}[A-Z]{2}$/.test(pc) ? pc : null;
}

export function normalizeHuisnr(v: unknown): string | null {
  const nr = String(v ?? "").trim();
  return /^\d+$/.test(nr) ? nr : null;
}

/** Preset slug: short, url/CLI-safe ("low", "medium", "zon-groot"). */
export function normalizeSlug(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const slug = v.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,31}$/.test(slug) ? slug : null;
}

export type Usage = { electricityNormal: number; electricityLow: number; gas: number; solarFeedIn: number };

/** Validates the usage tuple of a preset. Returns an error message or the tuple. */
export function parseUsage(b: Record<string, unknown>, base?: Usage): Usage | string {
  const pick = (k: keyof Usage, min: number) => {
    const raw = b[k] ?? base?.[k];
    const n = Number(raw);
    if (raw == null || !Number.isFinite(n) || !Number.isInteger(n) || n < min) return `${k} moet een geheel getal ≥ ${min} zijn`;
    return n;
  };
  const electricityNormal = pick("electricityNormal", 1);
  const electricityLow = pick("electricityLow", 0);
  const gas = pick("gas", 0);
  const solarFeedIn = pick("solarFeedIn", 0);
  for (const v of [electricityNormal, electricityLow, gas, solarFeedIn]) if (typeof v === "string") return v;
  return {
    electricityNormal: electricityNormal as number,
    electricityLow: electricityLow as number,
    gas: gas as number,
    solarFeedIn: solarFeedIn as number,
  };
}

export async function getDefaultAddress() {
  const rows = await prisma.setting.findMany({ where: { key: { in: [SETTING_POSTCODE, SETTING_HUISNR] } } });
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  return {
    postcode: normalizePostcode(get(SETTING_POSTCODE)) ?? DEFAULT_ADDRESS.postcode,
    huisnr: normalizeHuisnr(get(SETTING_HUISNR)) ?? DEFAULT_ADDRESS.huisnr,
  };
}

export type PresetDto = Usage & {
  id: number;
  name: string;
  label: string;
  sortOrder: number;
  runCount: number;
};

type ScenarioWithCount = Prisma.ScenarioGetPayload<{ include: { _count: { select: { runs: true } } } }>;

export function toPresetDto(s: ScenarioWithCount): PresetDto {
  return {
    id: s.id,
    name: s.name ?? String(s.id),
    label: s.label ?? s.name ?? String(s.id),
    electricityNormal: s.electricityNormal,
    electricityLow: s.electricityLow,
    gas: s.gas,
    solarFeedIn: s.solarFeedIn,
    sortOrder: s.sortOrder,
    runCount: s._count.runs,
  };
}

export async function getPresets(): Promise<PresetDto[]> {
  const rows = await prisma.scenario.findMany({
    where: { isPreset: true },
    orderBy: SCENARIO_ORDER,
    include: { _count: { select: { runs: true } } },
  });
  return rows.map(toPresetDto);
}
