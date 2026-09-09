#!/usr/bin/env node
// One-off/idempotent: fills ContractOffer.typeRank (rank among offers of the
// same contractType within a run) for offers ingested before the column
// existed. Safe to run on every boot: it only touches runs that still have
// offers with typeRank = 0. Plain Node so it runs in the production image.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const runIds = (
  await prisma.contractOffer.findMany({
    where: { typeRank: 0 },
    select: { scrapeRunId: true },
    distinct: ["scrapeRunId"],
  })
).map((r) => r.scrapeRunId);

let updated = 0;
for (const runId of runIds) {
  const offers = await prisma.contractOffer.findMany({
    where: { scrapeRunId: runId },
    select: { id: true, contractType: true },
    orderBy: { rank: "asc" },
  });
  const counters = new Map();
  await prisma.$transaction(
    offers.map((o) => {
      const n = (counters.get(o.contractType) ?? 0) + 1;
      counters.set(o.contractType, n);
      return prisma.contractOffer.update({ where: { id: o.id }, data: { typeRank: n } });
    })
  );
  updated += offers.length;
}
console.log(`typeRank backfill: ${runIds.length} runs, ${updated} offers updated.`);
await prisma.$disconnect();
