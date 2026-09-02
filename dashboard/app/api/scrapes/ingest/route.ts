import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  MY_COMPANY,
  PLATFORMS,
  ScraperRecord,
  normalizeContractType,
  normalizeSupplier,
} from "@/lib/domain";

/**
 * POST /api/scrapes/ingest
 *
 * Accepts the output of one scraper run against one platform. The `records`
 * array is the canonical --json output of the scraper CLIs, verbatim.
 *
 * {
 *   "platform": "gaslicht",            // optional; falls back to records[0].bron
 *   "sweepId": "2026-09-02T06:00Z-a1", // optional; groups the 6 platform runs
 *   "scenario": {                      // optional; derived from records[0] if absent
 *     "name": "medium",
 *     "electricityNormal": 2900, "electricityLow": 0,
 *     "gas": 1200, "solarFeedIn": 0
 *   },
 *   "scrapedAt": "2026-09-02T06:01:23Z",   // optional
 *   "status": "completed",                  // optional
 *   "records": [ { ...canonical record... }, ... ]
 * }
 */
export async function POST(req: NextRequest) {
  let body: {
    platform?: string;
    sweepId?: string;
    scenario?: {
      name?: string;
      electricityNormal: number;
      electricityLow?: number;
      gas?: number;
      solarFeedIn?: number;
    };
    scrapedAt?: string;
    status?: string;
    records?: ScraperRecord[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const records = body.records;
  if (!Array.isArray(records) || records.length === 0)
    return NextResponse.json({ error: "records[] is required and must be non-empty" }, { status: 400 });

  const first = records[0];
  const platformName = (body.platform ?? first.bron ?? "").toLowerCase();
  const meta = PLATFORMS.find((p) => p.name === platformName);
  if (!platformName)
    return NextResponse.json({ error: "platform (or records[0].bron) is required" }, { status: 400 });

  // Scenario: explicit > derived from the scraper record's echoed inputs.
  const sc = body.scenario ?? {
    electricityNormal: first.verbruikNormaalKwh,
    electricityLow: first.verbruikDalKwh ?? 0,
    gas: first.verbruikGasM3 ?? 0,
    solarFeedIn: (first.terugleveringNormaalKwh ?? 0) + (first.terugleveringDalKwh ?? 0),
  };
  if (sc.electricityNormal == null || Number.isNaN(Number(sc.electricityNormal)))
    return NextResponse.json({ error: "scenario.electricityNormal could not be determined" }, { status: 400 });
  const scenarioKey = {
    electricityNormal: Number(sc.electricityNormal),
    electricityLow: Number(sc.electricityLow ?? 0),
    gas: Number(sc.gas ?? 0),
    solarFeedIn: Number(sc.solarFeedIn ?? 0),
  };

  const platform = await prisma.platform.upsert({
    where: { name: platformName },
    create: {
      name: platformName,
      label: meta?.label ?? platformName,
      baseUrl: meta?.baseUrl ?? "",
    },
    update: {},
  });

  const scenario = await prisma.scenario.upsert({
    where: { electricityNormal_electricityLow_gas_solarFeedIn: scenarioKey },
    create: { ...scenarioKey, name: body.scenario?.name ?? null },
    update: {},
  });

  // Suppliers: normalize, then upsert the distinct set once.
  const supplierNames = [...new Set(records.map((r) => normalizeSupplier(r.leverancier ?? "Onbekend")))];
  const suppliers = new Map<string, number>();
  for (const name of supplierNames) {
    const s = await prisma.supplier.upsert({
      where: { name },
      create: { name, isMyCompany: name.toLowerCase() === MY_COMPANY.toLowerCase() },
      update: {},
    });
    suppliers.set(name, s.id);
  }

  // Rank: 1-based by annual cost ascending within this run (offers without a
  // price sink to the bottom).
  const sorted = [...records].sort(
    (a, b) => (a.prijsPerJaar ?? Number.MAX_VALUE) - (b.prijsPerJaar ?? Number.MAX_VALUE)
  );

  const run = await prisma.scrapeRun.create({
    data: {
      sweepId: body.sweepId ?? null,
      platformId: platform.id,
      scenarioId: scenario.id,
      scrapedAt: body.scrapedAt ? new Date(body.scrapedAt) : new Date(first.opgehaaldOp ?? Date.now()),
      status: body.status ?? "completed",
      offerCount: records.length,
    },
  });

  await prisma.contractOffer.createMany({
    data: sorted.map((r, i) => ({
      scrapeRunId: run.id,
      platformId: platform.id,
      supplierId: suppliers.get(normalizeSupplier(r.leverancier ?? "Onbekend"))!,
      contractName: r.product ?? "",
      contractType: normalizeContractType(r.contractType),
      durationMonths: r.looptijdMaanden ?? null,
      rank: i + 1,
      annualCost: r.prijsPerJaar ?? 0,
      monthlyCost: r.prijsPerMaand ?? (r.prijsPerJaar ? r.prijsPerJaar / 12 : 0),
      annualCostExDiscount: r.prijsPerJaarExclKorting ?? null,
      discount: r.korting ?? null,
      feedInTariff: r.terugleverVergoedingPerKwh ?? null,
      tariffElecNormal: r.tariefStroomNormaal ?? null,
      tariffElecLow: r.tariefStroomDal ?? null,
      tariffGas: r.tariefGas ?? null,
      rating: r.rating ?? null,
      reviewCount: r.aantalReviews ?? null,
      rawJson: JSON.stringify(r),
    })),
  });

  return NextResponse.json({
    ok: true,
    runId: run.id,
    platform: platform.name,
    scenarioId: scenario.id,
    inserted: records.length,
  });
}
