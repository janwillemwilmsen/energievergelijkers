#!/usr/bin/env node
// One-off: energiekiezer-client.mjs and energievergelijk-client.mjs used to
// store the cashback of multi-year fixed contracts as the per-year share
// (the value those APIs return: Engie 3 jaar 575 -> 191.66) instead of the
// total the sites display. Fixed in the clients on 2026-09-14; this scales
// the already stored ContractOffer.discount of those two platforms back up.
//
// Idempotent: an offer is only touched while its discount still equals the
// per-year share, i.e. annualCostExDiscount - annualCost (within 5 cents).
// After scaling that no longer holds, so a second run changes nothing.
//
//   cd dashboard && node scripts/backfill-discount-total.mjs [--dry-run]
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

const platforms = await prisma.platform.findMany({ where: { name: { in: ["energiekiezer", "energievergelijk"] } } });
const offers = await prisma.contractOffer.findMany({
  where: {
    platformId: { in: platforms.map((p) => p.id) },
    contractType: "vast",
    durationMonths: { gt: 12 },
    discount: { not: null },
    annualCostExDiscount: { not: null },
  },
  select: { id: true, platformId: true, durationMonths: true, discount: true, annualCost: true, annualCostExDiscount: true },
});

const snap = (v) => (Math.abs(v - Math.round(v)) <= 0.05 ? Math.round(v) : Math.round(v * 100) / 100);
const updates = [];
for (const o of offers) {
  const yearlyShare = o.annualCostExDiscount - o.annualCost;
  if (Math.abs(yearlyShare - o.discount) > 0.05) continue; // already a total
  updates.push({ id: o.id, discount: snap(o.discount * (o.durationMonths / 12)) });
}

console.log(`${offers.length} multi-year fixed offers on energiekiezer/energievergelijk, ${updates.length} still hold the per-year share.`);
if (!dryRun && updates.length) {
  await prisma.$transaction(updates.map((u) => prisma.contractOffer.update({ where: { id: u.id }, data: { discount: u.discount } })));
  console.log(`discount backfill: ${updates.length} offers updated.`);
} else if (dryRun) {
  console.log(updates.slice(0, 5).map((u) => `  #${u.id} -> ${u.discount}`).join("\n"));
}
await prisma.$disconnect();
