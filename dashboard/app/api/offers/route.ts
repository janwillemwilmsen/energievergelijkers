import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/offers?scenarioId=1
 * All offers from the LATEST completed run per platform for the scenario
 * (~450 rows). Sorting/filtering/pagination happen client-side at this size.
 */
export async function GET(req: NextRequest) {
  const scenarioId = Number(req.nextUrl.searchParams.get("scenarioId"));
  if (!scenarioId) return NextResponse.json({ error: "scenarioId is required" }, { status: 400 });

  const platforms = await prisma.platform.findMany();
  const latestRunIds: number[] = [];
  for (const p of platforms) {
    const run = await prisma.scrapeRun.findFirst({
      where: { scenarioId, platformId: p.id, status: "completed" },
      orderBy: { scrapedAt: "desc" },
      select: { id: true },
    });
    if (run) latestRunIds.push(run.id);
  }
  if (!latestRunIds.length) return NextResponse.json({ offers: [] });

  const offers = await prisma.contractOffer.findMany({
    where: { scrapeRunId: { in: latestRunIds } },
    include: {
      supplier: { select: { name: true, isMyCompany: true } },
      platform: { select: { name: true, label: true } },
    },
    orderBy: [{ platformId: "asc" }, { rank: "asc" }],
  });

  return NextResponse.json({
    offers: offers.map((o) => ({
      id: o.id,
      platform: o.platform.name,
      platformLabel: o.platform.label,
      supplier: o.supplier.name,
      isMyCompany: o.supplier.isMyCompany,
      contractName: o.contractName,
      contractType: o.contractType,
      durationMonths: o.durationMonths,
      rank: o.rank,
      annualCost: o.annualCost,
      monthlyCost: o.monthlyCost,
      discount: o.discount,
      feedInTariff: o.feedInTariff,
      rating: o.rating,
    })),
  });
}
