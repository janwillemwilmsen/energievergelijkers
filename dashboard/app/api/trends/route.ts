import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/trends?scenarioId=1&platform=gaslicht&days=30
 * Rank time series for our company + the top competitors on one platform.
 * Returns { suppliers: [{name, isMyCompany}], points: [{date, [supplier]: rank}] }.
 */
export async function GET(req: NextRequest) {
  const scenarioId = Number(req.nextUrl.searchParams.get("scenarioId"));
  const platformName = req.nextUrl.searchParams.get("platform") ?? "";
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
  if (!scenarioId || !platformName)
    return NextResponse.json({ error: "scenarioId and platform are required" }, { status: 400 });

  const platform = await prisma.platform.findUnique({ where: { name: platformName } });
  if (!platform) return NextResponse.json({ suppliers: [], points: [] });

  const since = new Date(Date.now() - days * 86400_000);
  const runs = await prisma.scrapeRun.findMany({
    where: { scenarioId, platformId: platform.id, status: "completed", scrapedAt: { gte: since } },
    orderBy: { scrapedAt: "asc" },
    include: {
      offers: {
        select: { rank: true, supplier: { select: { name: true, isMyCompany: true } } },
        orderBy: { rank: "asc" },
      },
    },
  });
  if (!runs.length) return NextResponse.json({ suppliers: [], points: [] });

  // Best rank per supplier per run.
  type RunRanks = Map<string, number>;
  const perRun: { date: string; ranks: RunRanks }[] = runs.map((run) => {
    const ranks: RunRanks = new Map();
    for (const o of run.offers) if (!ranks.has(o.supplier.name)) ranks.set(o.supplier.name, o.rank);
    return { date: run.scrapedAt.toISOString(), ranks };
  });

  // Series: our company + top 5 competitors of the LATEST run.
  const latest = perRun[perRun.length - 1].ranks;
  const myCompany = runs[0].offers.find((o) => o.supplier.isMyCompany)?.supplier.name
    ?? (await prisma.supplier.findFirst({ where: { isMyCompany: true } }))?.name;
  const competitors = [...latest.entries()]
    .filter(([name]) => name !== myCompany)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([name]) => name);
  const names = myCompany ? [myCompany, ...competitors] : competitors;

  const points = perRun.map(({ date, ranks }) => {
    const p: Record<string, string | number | null> = { date };
    for (const n of names) p[n] = ranks.get(n) ?? null;
    return p;
  });

  return NextResponse.json({
    suppliers: names.map((name) => ({ name, isMyCompany: name === myCompany })),
    points,
  });
}
