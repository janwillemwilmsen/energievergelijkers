import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/archive
 * All scans (sweeps) grouped per scenario, newest first, with aggregates:
 * contract count, price range, cashback range, contract-type mix and
 * per-provider counts.
 */
export async function GET() {
  const runs = await prisma.scrapeRun.findMany({
    where: { status: "completed" },
    include: {
      platform: { select: { name: true, label: true } },
      scenario: true,
      offers: {
        select: {
          annualCost: true,
          monthlyCost: true,
          discount: true,
          contractType: true,
          supplier: { select: { name: true, isMyCompany: true } },
        },
      },
    },
    orderBy: { scrapedAt: "desc" },
  });

  // Group runs into sweeps (fall back to run id for legacy runs without sweepId).
  const sweeps = new Map<string, typeof runs>();
  for (const run of runs) {
    const key = `${run.scenarioId}|${run.sweepId ?? `run-${run.id}`}`;
    if (!sweeps.has(key)) sweeps.set(key, []);
    sweeps.get(key)!.push(run);
  }

  const items = [...sweeps.entries()].map(([key, sweepRuns]) => {
    const offers = sweepRuns.flatMap((r) => r.offers);
    const prices = offers.map((o) => o.annualCost).filter((v) => v > 0);
    const cashbacks = offers.map((o) => o.discount ?? 0).filter((v) => v > 0);
    const perProvider: Record<string, number> = {};
    const perType: Record<string, number> = {};
    let myCount = 0;
    for (const o of offers) {
      perProvider[o.supplier.name] = (perProvider[o.supplier.name] ?? 0) + 1;
      perType[o.contractType] = (perType[o.contractType] ?? 0) + 1;
      if (o.supplier.isMyCompany) myCount++;
    }
    const sc = sweepRuns[0].scenario;
    return {
      sweepId: sweepRuns[0].sweepId ?? key.split("|")[1],
      scenario: {
        id: sc.id,
        name: sc.name,
        electricityNormal: sc.electricityNormal,
        electricityLow: sc.electricityLow,
        gas: sc.gas,
        solarFeedIn: sc.solarFeedIn,
        isPreset: sc.isPreset,
      },
      address: sweepRuns[0].postcode ? sweepRuns[0].postcode + " " + (sweepRuns[0].houseNumber ?? "") : null,
      scrapedAt: sweepRuns.reduce((min, r) => (r.scrapedAt < min ? r.scrapedAt : min), sweepRuns[0].scrapedAt),
      platforms: sweepRuns.map((r) => r.platform.label).sort(),
      contractCount: offers.length,
      myCount,
      priceMin: prices.length ? Math.round(Math.min(...prices)*100)/100 : null,
      priceMax: prices.length ? Math.round(Math.max(...prices)*100)/100 : null,
      cashbackMin: cashbacks.length ? Math.round(Math.min(...cashbacks)*100)/100 : null,
      cashbackMax: cashbacks.length ? Math.round(Math.max(...cashbacks)*100)/100 : null,
      perType,
      perProvider: Object.fromEntries(Object.entries(perProvider).sort((a, b) => b[1] - a[1])),
    };
  });

  items.sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime());
  return NextResponse.json({ scans: items });
}
