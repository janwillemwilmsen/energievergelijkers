#!/usr/bin/env node
// One-off: until 2026-09-15 pricewise-client.mjs exported only the delivery
// tariffs (incl. btw), so Pricewise offers have no all-in tariffs
// (tariffElecNormal/Low/Gas = null) and were excluded from the tariff charts.
// The all-in tariff is delivery + energiebelasting (both incl. btw); the tax
// is a flat national rate per year, so it can be added afterwards. Dynamic
// products stayed at delivery 0 in the old export and cannot be repaired.
//
// Idempotent: only offers with tariffElecNormal = null and a delivery tariff
// in rawJson are touched, and only scans from 2026 (the rates below).
//
//   cd dashboard && node scripts/backfill-pricewise-allin.mjs [--dry-run]
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

// Energiebelasting 2026 incl. 21% btw, as Pricewise's API reports it for the
// first tax band (governmentchargestax_1_10000 / _fullrange).
const TAX = { 2026: { elec: 0.1108481, gas: 0.7267986 } };

const platform = await prisma.platform.findUnique({ where: { name: "pricewise" } });
if (!platform) { console.log("no pricewise platform"); process.exit(0); }
const offers = await prisma.contractOffer.findMany({
  where: { platformId: platform.id, tariffElecNormal: null },
  select: { id: true, rawJson: true, scrapeRun: { select: { scrapedAt: true } } },
});

const r4 = (v) => Math.round(v * 1e4) / 1e4;
const updates = [];
let skipped = 0;
for (const o of offers) {
  const tax = TAX[o.scrapeRun.scrapedAt.getFullYear()];
  let raw;
  try { raw = JSON.parse(o.rawJson); } catch { raw = null; }
  const n = raw?.tariefStroomNormaalLevering, d = raw?.tariefStroomDalLevering, g = raw?.tariefGasLevering;
  if (!tax || !(n > 0)) { skipped++; continue; }
  updates.push({
    id: o.id,
    data: {
      tariffElecNormal: r4(n + tax.elec),
      tariffElecLow: d > 0 ? r4(d + tax.elec) : r4(n + tax.elec),
      tariffGas: g > 0 ? r4(g + tax.gas) : null,
    },
  });
}
console.log(`${offers.length} Pricewise offers without all-in tariffs: ${updates.length} repairable, ${skipped} skipped (dynamic/no delivery tariff or unknown year).`);
if (!dryRun && updates.length) {
  for (let i = 0; i < updates.length; i += 200) {
    await prisma.$transaction(updates.slice(i, i + 200).map((u) => prisma.contractOffer.update({ where: { id: u.id }, data: u.data })));
  }
  console.log(`pricewise all-in backfill: ${updates.length} offers updated.`);
} else if (dryRun) {
  console.log(updates.slice(0, 3).map((u) => `  #${u.id} -> ${JSON.stringify(u.data)}`).join("\n"));
}
await prisma.$disconnect();
