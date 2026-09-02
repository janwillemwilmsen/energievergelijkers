import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/overview?scenarioId=1
 * Per platform: our company's best rank in the latest run, the delta vs. the
 * previous run, the offer count, and who holds rank 1.
 */
export async function GET(req: NextRequest) {
  const scenarioId = Number(req.nextUrl.searchParams.get("scenarioId"));
  if (!scenarioId) return NextResponse.json({ error: "scenarioId is required" }, { status: 400 });

  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });
  const me = await prisma.supplier.findFirst({ where: { isMyCompany: true } });

  const cards = [];
  for (const platform of platforms) {
    const runs = await prisma.scrapeRun.findMany({
      where: { scenarioId, platformId: platform.id, status: "completed" },
      orderBy: { scrapedAt: "desc" },
      take: 2,
    });
    if (!runs.length) {
      cards.push({ platform: platform.name, label: platform.label, hasData: false });
      continue;
    }

    const bestRank = async (runId: number) =>
      me
        ? (
            await prisma.contractOffer.findFirst({
              where: { scrapeRunId: runId, supplierId: me.id },
              orderBy: { rank: "asc" },
            })
          )?.rank ?? null
        : null;

    const current = await bestRank(runs[0].id);
    const previous = runs[1] ? await bestRank(runs[1].id) : null;
    const leader = await prisma.contractOffer.findFirst({
      where: { scrapeRunId: runs[0].id, rank: 1 },
      include: { supplier: true },
    });
    const myBest = me
      ? await prisma.contractOffer.findFirst({
          where: { scrapeRunId: runs[0].id, supplierId: me.id },
          orderBy: { rank: "asc" },
        })
      : null;

    cards.push({
      platform: platform.name,
      label: platform.label,
      hasData: true,
      scrapedAt: runs[0].scrapedAt,
      offerCount: runs[0].offerCount,
      myRank: current,
      previousRank: previous,
      delta: current != null && previous != null ? previous - current : null, // positive = moved up
      myAnnualCost: myBest?.annualCost ?? null,
      myContract: myBest?.contractName ?? null,
      leader: leader ? { supplier: leader.supplier.name, annualCost: leader.annualCost } : null,
      gapToLeader: myBest && leader ? Math.round((myBest.annualCost - leader.annualCost) * 100) / 100 : null,
    });
  }

  return NextResponse.json({ myCompany: me?.name ?? null, cards });
}
