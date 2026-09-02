// Seed: reference data only — platforms, known suppliers, and the four preset
// scenarios. NO mock rankings: history accumulates from real scrapes via
// POST /api/scrapes/ingest (or the in-app scrape buttons / scripts/run-scrapes.mjs).
import { PrismaClient } from "@prisma/client";
import { PLATFORMS, PRESET_SCENARIOS, MY_COMPANY } from "../lib/domain";

const prisma = new PrismaClient();

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
