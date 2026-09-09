// Seed: reference data only — platforms, known suppliers, preset scenarios,
// default scrape address. Plain Node (no tsx/TypeScript) so it can run in the
// production container. Constants are duplicated from lib/domain.ts and
// lib/presets.ts on purpose: the runtime image must not depend on the TS
// toolchain. Keep them in sync when editing.
//
// Presets and the default address are editable on /admin/presets, and this
// script runs on EVERY production boot — so it only creates them when none
// exist yet and never overwrites what the user configured.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MY_COMPANY = process.env.MY_COMPANY_NAME ?? "Essent";

const PLATFORMS = [
  { name: "gaslicht", label: "Gaslicht.com", baseUrl: "https://www.gaslicht.com" },
  { name: "energiekiezer", label: "Energiekiezer.nl", baseUrl: "https://www.energiekiezer.nl" },
  { name: "energievergelijk", label: "Energievergelijk.nl", baseUrl: "https://www.energievergelijk.nl" },
  { name: "independer", label: "Independer.nl", baseUrl: "https://www.independer.nl" },
  { name: "overstappen", label: "Overstappen.nl", baseUrl: "https://www.overstappen.nl" },
  { name: "pricewise", label: "Pricewise.nl", baseUrl: "https://www.pricewise.nl" },
];

const PRESET_SCENARIOS = [
  { name: "low", label: "Laag", sortOrder: 0, electricityNormal: 1500, electricityLow: 0, gas: 800, solarFeedIn: 0 },
  { name: "medium", label: "Midden", sortOrder: 1, electricityNormal: 2900, electricityLow: 0, gas: 1200, solarFeedIn: 0 },
  { name: "high", label: "Hoog", sortOrder: 2, electricityNormal: 4500, electricityLow: 0, gas: 2000, solarFeedIn: 0 },
  { name: "solar", label: "Zon", sortOrder: 3, electricityNormal: 3500, electricityLow: 0, gas: 1000, solarFeedIn: 2000 },
];

// Default scrape address (Setting rows; keys mirror lib/presets.ts).
const DEFAULT_SETTINGS = { defaultPostcode: "5216EK", defaultHuisnr: "27" };

const SUPPLIERS = [
  "Essent", "Eneco", "Vattenfall", "Budget Thuis", "Greenchoice", "ENGIE",
  "Oxxio", "UnitedConsumers", "Vandebron", "Coolblue Energie", "Energiedirect",
  "NextEnergy", "Frank Energie", "Mega", "Powerpeers", "Pure Energie",
];

async function main() {
  for (const p of PLATFORMS)
    await prisma.platform.upsert({ where: { name: p.name }, create: p, update: {} });
  for (const name of SUPPLIERS)
    await prisma.supplier.upsert({
      where: { name },
      create: { name, isMyCompany: name === MY_COMPANY },
      update: {},
    });
  const presetCount = await prisma.scenario.count({ where: { isPreset: true } });
  if (presetCount === 0) {
    for (const sc of PRESET_SCENARIOS)
      await prisma.scenario.upsert({
        where: {
          electricityNormal_electricityLow_gas_solarFeedIn: {
            electricityNormal: sc.electricityNormal,
            electricityLow: sc.electricityLow,
            gas: sc.gas,
            solarFeedIn: sc.solarFeedIn,
          },
        },
        create: { ...sc, isPreset: true },
        update: { isPreset: true, name: sc.name, label: sc.label, sortOrder: sc.sortOrder },
      });
  } else {
    // Databases from before the label/sortOrder columns: fill in the display
    // name once, only where it is still empty.
    for (const sc of PRESET_SCENARIOS)
      await prisma.scenario.updateMany({
        where: { isPreset: true, name: sc.name, label: null },
        data: { label: sc.label, sortOrder: sc.sortOrder },
      });
  }
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS))
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  console.log("Seeded platforms, suppliers, preset scenarios and default address (no mock rankings).");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
