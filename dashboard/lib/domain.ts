// Domain constants + normalization shared by ingestion and seeding.

export const PLATFORMS = [
  { name: "gaslicht", label: "Gaslicht.com", baseUrl: "https://www.gaslicht.com" },
  { name: "energiekiezer", label: "Energiekiezer.nl", baseUrl: "https://www.energiekiezer.nl" },
  { name: "energievergelijk", label: "Energievergelijk.nl", baseUrl: "https://www.energievergelijk.nl" },
  { name: "independer", label: "Independer.nl", baseUrl: "https://www.independer.nl" },
  { name: "overstappen", label: "Overstappen.nl", baseUrl: "https://www.overstappen.nl" },
  { name: "pricewise", label: "Pricewise.nl", baseUrl: "https://www.pricewise.nl" },
] as const;

// Initial presets (seeded once by prisma/seed.mjs). The live set is stored in
// the Scenario table (isPreset = true) and edited on /admin/presets.
export const PRESET_SCENARIOS = [
  { name: "low", label: "Laag", electricityNormal: 1500, electricityLow: 0, gas: 800, solarFeedIn: 0 },
  { name: "medium", label: "Midden", electricityNormal: 2900, electricityLow: 0, gas: 1200, solarFeedIn: 0 },
  { name: "high", label: "Hoog", electricityNormal: 4500, electricityLow: 0, gas: 2000, solarFeedIn: 0 },
  { name: "solar", label: "Zon", electricityNormal: 3500, electricityLow: 0, gas: 1000, solarFeedIn: 2000 },
] as const;

// Our brand — configurable so the dashboard is reusable.
export const MY_COMPANY = process.env.MY_COMPANY_NAME ?? "Essent";

// Suppliers appear under slightly different names per platform
// ("OXXIO Nederland B.V.", "Oxxio", "OXXIO"). Normalize to one canonical name.
const SUPPLIER_ALIASES: Record<string, string> = {
  oxxio: "Oxxio",
  "oxxio nederland": "Oxxio",
  engie: "ENGIE",
  "engie nederland retail": "ENGIE",
  essent: "Essent",
  "essent retail energie": "Essent",
  coolblue: "Coolblue Energie",
  delta: "DELTA Energie",
  "frank energie dynamisch": "Frank Energie",
  "greenchoice dynamisch": "Greenchoice",
  "noord energie": "NoordEnergie",
  noordenergie: "NoordEnergie",
  om: "OM Nieuwe Energie",
  "om nieuwe energie": "OM Nieuwe Energie",
  "om | nieuwe energie": "OM Nieuwe Energie",
  "om nieuwe energie (samen om)": "OM Nieuwe Energie",
  "vattenfall sales nederland": "Vattenfall",
  eneco: "Eneco",
  "eneco consumenten": "Eneco",
  "budget thuis": "Budget Thuis",
  budgetenergie: "Budget Thuis",
  "budget energie": "Budget Thuis",
  unitedconsumers: "UnitedConsumers",
  "united consumers": "UnitedConsumers",
  "unitedconsumers energie": "UnitedConsumers",
  greenchoice: "Greenchoice",
  vandebron: "Vandebron",
  "vandebron energie": "Vandebron",
  vattenfall: "Vattenfall",
  "coolblue energie": "Coolblue Energie",
  energiedirect: "Energiedirect",
  "energiedirect.nl": "Energiedirect",
  mega: "Mega",
  "mega energie": "Mega",
  nextenergy: "NextEnergy",
  "next energy": "NextEnergy",
  powerpeers: "Powerpeers",
  "pure energie": "Pure Energie",
  "frank energie": "Frank Energie",
  "delta energie": "DELTA Energie",
  "innova energie": "Innova Energie",
  "zonopnaam energie": "Zonopnaam",
  zonopnaam: "Zonopnaam",
  "energie vanons": "Energie VanOns",
  "energie van ons": "Energie VanOns",
  tibber: "Tibber",
  zonneplan: "Zonneplan",
  "zonneplan energie": "Zonneplan",
  easyenergy: "easyEnergy",
  energiek: "Energiek",
  energyzero: "EnergyZero",
  "gewoon energie": "Gewoon Energie",
  "clean energy": "Clean Energy",
};

export function normalizeSupplier(raw: string): string {
  const cleaned = raw
    .replace(/\s+[BN]\.?V\.?\s*$/i, "") // strip trailing B.V. / N.V.
    .replace(/\s+/g, " ")
    .trim();
  return SUPPLIER_ALIASES[cleaned.toLowerCase()] ?? cleaned;
}

export function normalizeContractType(raw: string): string {
  const t = (raw ?? "").toLowerCase();
  if (t.startsWith("vast") || t === "fixed") return "vast";
  if (t.startsWith("dynamisch") || t === "dynamic") return "dynamisch";
  if (t.startsWith("combinatie") || t.includes("combin")) return "combinatie";
  if (t.startsWith("variabel") || t === "variable") return "variabel";
  return t || "onbekend";
}

// The canonical record emitted by the scraper CLIs (energy-lib.mjs).
export type ScraperRecord = {
  bron: string;
  opgehaaldOp: string;
  postcode: string;
  huisnummer: string | number;
  verbruikNormaalKwh: number;
  verbruikDalKwh: number;
  verbruikGasM3: number;
  terugleveringNormaalKwh: number;
  terugleveringDalKwh: number;
  leverancier: string;
  product: string;
  contractType: string;
  looptijdMaanden: number | null;
  prijsPerMaand: number | null;
  prijsPerJaar: number | null;
  prijsPerJaarExclKorting: number | null;
  korting: number | null;
  tariefStroomNormaal: number | null;
  tariefStroomDal: number | null;
  tariefGas: number | null;
  terugleverVergoedingPerKwh: number | null;
  rating: number | null;
  aantalReviews: number | null;
  [key: string]: unknown;
};
