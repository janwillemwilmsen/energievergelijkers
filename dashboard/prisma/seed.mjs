// Seed: reference data only — platforms, known suppliers, preset scenarios.
// Plain Node (no tsx/TypeScript) so it can run in the production container.
// Constants are duplicated from lib/domain.ts on purpose: the runtime image
// must not depend on the TS toolchain. Keep the two in sync when editing.
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
  { name: "low", electricityNormal: 1500, electricityLow: 0, gas: 800, solarFeedIn: 0 },
  { name: "medium", electricityNormal: 2900, electricityLow: 0, gas: 1200, solarFeedIn: 0 },
  { name: "high", electricityNormal: 4500, electricityLow: 0, gas: 2000, solarFeedIn: 0 },
  { name: "solar", electricityNormal: 3500, electricityLow: 0, gas: 1000, solarFeedIn: 2000 },
];

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
      update: { isPreset: true, name: sc.name },
    });
  console.log("Seeded platforms, suppliers and preset scenarios (no mock rankings).");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
