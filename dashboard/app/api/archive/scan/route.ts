import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/archive/scan?sweepId=...[&scenarioId=...]
 * Full detail of one scan: per platform the run, all offers (rank order),
 * per-platform stats, the provider x platform count matrix, and flattened
 * points for the market charts. scenarioId narrows a multi-scenario sweep
 * (the presets button runs 4 scenarios under ONE sweepId) to one scenario.
 */
export async function GET(req: NextRequest) {
  const sweepId = req.nextUrl.searchParams.get("sweepId");
  const scenarioId = Number(req.nextUrl.searchParams.get("scenarioId")) || null;
  if (!sweepId) return NextResponse.json({ error: "sweepId is required" }, { status: 400 });

  // Legacy fallback: "run-<id>" keys refer to a single run without sweepId.
  const legacy = sweepId.match(/^run-(\d+)$/);
  const runs = await prisma.scrapeRun.findMany({
    where: legacy ? { id: Number(legacy[1]) } : { sweepId, ...(scenarioId ? { scenarioId } : {}) },
    include: {
      platform: { select: { name: true, label: true } },
      scenario: true,
      offers: {
        orderBy: { rank: "asc" },
        include: { supplier: { select: { name: true, isMyCompany: true } } },
      },
    },
    orderBy: { platformId: "asc" },
  });
  if (!runs.length) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

  const sc = runs[0].scenario;
  const providerSet = new Set<string>();

  const platforms = runs.map((run) => {
    const offers = run.offers;
    const prices = offers.map((o) => o.annualCost).filter((v) => v > 0);
    const cashbacks = offers.map((o) => o.discount ?? 0).filter((v) => v > 0);
    const perProvider: Record<string, number> = {};
    const perType: Record<string, number> = {};
    for (const o of offers) {
      perProvider[o.supplier.name] = (perProvider[o.supplier.name] ?? 0) + 1;
      perType[o.contractType] = (perType[o.contractType] ?? 0) + 1;
      providerSet.add(o.supplier.name);
    }
    return {
      platform: run.platform.name,
      label: run.platform.label,
      scrapedAt: run.scrapedAt,
      stats: {
        count: offers.length,
        priceMin: prices.length ? Math.round(Math.min(...prices)*100)/100 : null,
        priceMax: prices.length ? Math.round(Math.max(...prices)*100)/100 : null,
        priceAvg: prices.length ? Math.round((prices.reduce((s, v) => s + v, 0) / prices.length)*100)/100 : null,
        cashbackMin: cashbacks.length ? Math.round(Math.min(...cashbacks)*100)/100 : null,
        cashbackMax: cashbacks.length ? Math.round(Math.max(...cashbacks)*100)/100 : null,
        perType,
        perProvider,
      },
      offers: offers.map((o) => {
        // All-in tariffs (incl. btw + energiebelasting) live in the columns.
        // Pricewise only publishes delivery-only tariffs; recover those from the
        // raw scraper record and flag them as not directly comparable.
        let elecNormal = o.tariffElecNormal;
        let elecLow = o.tariffElecLow;
        let gasT = o.tariffGas;
        let deliveryOnly = false;
        if (elecNormal == null && gasT == null) {
          try {
            const raw = JSON.parse(o.rawJson);
            if (raw.tariefStroomNormaalLevering != null || raw.tariefGasLevering != null) {
              elecNormal = raw.tariefStroomNormaalLevering ?? null;
              elecLow = raw.tariefStroomDalLevering ?? null;
              gasT = raw.tariefGasLevering ?? null;
              deliveryOnly = true;
            }
          } catch { /* keep nulls */ }
        }
        return {
          rank: o.rank,
          typeRank: o.typeRank,
          supplier: o.supplier.name,
          isMyCompany: o.supplier.isMyCompany,
          contractName: o.contractName,
          contractType: o.contractType,
          durationMonths: o.durationMonths,
          monthlyCost: o.monthlyCost,
          annualCost: o.annualCost,
          discount: o.discount,
          rating: o.rating,
          tariffElecNormal: elecNormal,
          tariffElecLow: elecLow,
          tariffGas: gasT,
          feedInTariff: o.feedInTariff,
          tariffDeliveryOnly: deliveryOnly,
        };
      }),
    };
  });

  // Provider x platform matrix, ordered by total presence.
  const providers = [...providerSet]
    .map((name) => ({
      name,
      counts: Object.fromEntries(platforms.map((p) => [p.platform, p.stats.perProvider[name] ?? 0])),
      total: platforms.reduce((s, p) => s + (p.stats.perProvider[name] ?? 0), 0),
    }))
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({
    sweepId,
    scenario: {
      id: sc.id,
      name: sc.name,
      label: sc.label,
      electricityNormal: sc.electricityNormal,
      electricityLow: sc.electricityLow,
      gas: sc.gas,
      solarFeedIn: sc.solarFeedIn,
    },
    address: runs[0].postcode ? runs[0].postcode + " " + (runs[0].houseNumber ?? "") : null,
    scrapedAt: runs.reduce((min, r) => (r.scrapedAt < min ? r.scrapedAt : min), runs[0].scrapedAt),
    platforms,
    providers,
  });
}
