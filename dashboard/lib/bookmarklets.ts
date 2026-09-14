// Server-side builder for the Rank Radar bookmarklets (see /bookmarklets).
// Glues bookmarklets/lib.js + bookmarklets/<site>.js into one `javascript:`
// URL per site, optionally with a preset's arguments baked in so the bookmark
// runs without asking. The sources are read from disk at request time (the
// deployment runs `next start` inside the repo, so the files are present).
// Only ever imported from server components (fs + prisma).
import { readFileSync } from "node:fs";
import path from "node:path";
import { usageLabel, type ScenarioLike } from "./scenarioLabel";

export type BookmarkletSite = { id: string; label: string; note: string };

export const BOOKMARKLET_SITES: BookmarkletSite[] = [
  { id: "gaslicht", label: "Gaslicht.com", note: "formulier posten → resultaten met alle contracttypes (= CLI)" },
  { id: "energievergelijk", label: "Energievergelijk.nl", note: "deeplink met 'Alle contracten', hele lijst uitgeklapt (= CLI, blijft in frame)" },
  { id: "energiekiezer", label: "EnergieKiezer.nl", note: "wizard-state zetten → resultaten, Goedkoopste (= CLI)" },
  { id: "overstappen", label: "Overstappen.nl", note: "adres → jouw gegevens → deals, alle contractsoorten aangevinkt (= CLI, blijft in frame)" },
  { id: "independer", label: "Independer.nl", note: "intro → je wensen → resultaten van ÉÉN contracttype (Vast), Goedkoopste; CLI haalt alle drie (blijft in frame)" },
  { id: "pricewise", label: "Pricewise.nl", note: "start-formulier → resultaten, alle tarieftypes aangevinkt en uitgeklapt (≈ CLI, blijft in frame)" },
];

const DIR = path.join(process.cwd(), "bookmarklets");

// Conservative minification: drop full-line // comments and blank lines, trim
// indentation. Never touches string contents or URLs.
const strip = (src: string) =>
  src
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"))
    .join("\n");

const cache = new Map<string, string>();
function source(name: string): string {
  // Re-read on every request in development so edits show up without a restart.
  const key = name;
  if (process.env.NODE_ENV === "production" && cache.has(key)) return cache.get(key)!;
  const src = strip(readFileSync(path.join(DIR, `${name}.js`), "utf8"));
  cache.set(key, src);
  return src;
}

/** CLI-style arguments for a preset at the given address ("5216EK 27 --normaal 2900 --dal 0 --gas 1200"). */
export function presetArgs(usage: ScenarioLike, address: { postcode: string; huisnr: string }): string {
  const parts = [address.postcode, address.huisnr, "--normaal", String(usage.electricityNormal), "--dal", String(usage.electricityLow)];
  parts.push(usage.gas > 0 ? `--gas ${usage.gas}` : "--geen-gas");
  if (usage.solarFeedIn > 0) parts.push("--teruglevering", String(usage.solarFeedIn));
  return parts.join(" ");
}

/** Bookmark title: "Gaslicht · Midden 2.900 kWh / 1.200 m³" (the usage is part of the name on purpose). */
export function bookmarkName(site: BookmarkletSite, preset: (ScenarioLike & { label?: string | null }) | null): string {
  const short = site.label.replace(/\.(com|nl)$/i, "");
  if (!preset) return `${short} · zelf invullen`;
  return `${short} · ${preset.label ?? preset.name ?? ""} ${usageLabel(preset)}`.replace(/\s+/g, " ").trim();
}

/** The complete bookmark URL for one site, with `args` baked in when given. */
export function buildBookmarklet(siteId: string, args: string | null): string {
  if (!BOOKMARKLET_SITES.some((s) => s.id === siteId)) throw new Error(`unknown bookmarklet site: ${siteId}`);
  const preset = args ? `var RR_PRESET_ARGS = ${JSON.stringify(args)};\n` : "";
  const code = `(function(){\n${preset}${source("lib")}\n${source(siteId)}\n})();`;
  return "javascript:" + encodeURIComponent(code);
}
