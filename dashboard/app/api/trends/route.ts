import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/trends?scenarioId=1&platform=gaslicht&days=30[&all=1][&types=vast,variabel]
 * Rank time series for our company + the top competitors on one platform;
 * with all=1, every supplier seen in the window (sorted by latest rank).
 * types limits the offers considered to those contract types ("dynamisch"
 * includes "combinatie"); ranks stay the position in the FULL list, so a
 * supplier's best vast contract at overall #7 shows as 7.
 * Returns { suppliers: [{name, isMyCompany}], points: [{date, [supplier]: rank}],
 * details: [{ [supplier]: {contract, cost, type} }] } (details aligned with points).
 */
export async function GET(req: NextRequest) {
  const scenarioId = Number(req.nextUrl.searchParams.get("scenarioId"));
  const platformName = req.nextUrl.searchParams.get("platform") ?? "";
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
  const all = req.nextUrl.searchParams.get("all") === "1";
  const typeSet = new Set(
    (req.nextUrl.searchParams.get("types") ?? "")
      .split(",")
      .filter(Boolean)
      .flatMap((t) => (t === "dynamisch" ? ["dynamisch", "combinatie"] : [t]))
  );
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
        select: {
          rank: true,
          contractName: true,
          contractType: true,
          annualCost: true,
          supplier: { select: { name: true, isMyCompany: true } },
        },
        orderBy: { rank: "asc" },
      },
    },
  });
  if (!runs.length) return NextResponse.json({ suppliers: [], points: [], details: [] });

  // Best rank per supplier per run (within the requested contract types),
  // plus the contract behind that rank for tooltips.
  type RunInfo = { contract: string; cost: number; type: string };
  const perRun = runs
    .map((run) => {
      const ranks = new Map<string, number>();
      const info = new Map<string, RunInfo>();
      for (const o of run.offers) {
        if (typeSet.size && !typeSet.has(o.contractType)) continue;
        if (ranks.has(o.supplier.name)) continue;
        ranks.set(o.supplier.name, o.rank);
        info.set(o.supplier.name, { contract: o.contractName, cost: Math.round(o.annualCost), type: o.contractType });
      }
      return { date: run.scrapedAt.toISOString(), ranks, info };
    })
    .filter((r) => r.ranks.size > 0);
  if (!perRun.length) return NextResponse.json({ suppliers: [], points: [], details: [] });

  // Series: our company + competitors — top 5 of the LATEST run by default,
  // or (all=1) every supplier seen in the window, sorted by latest rank.
  const latest = perRun[perRun.length - 1].ranks;
  const myCompany = runs[0].offers.find((o) => o.supplier.isMyCompany)?.supplier.name
    ?? (await prisma.supplier.findFirst({ where: { isMyCompany: true } }))?.name;
  const competitors = all
    ? [...new Set(perRun.flatMap(({ ranks }) => [...ranks.keys()]))]
        .filter((name) => name !== myCompany)
        .sort((a, b) => (latest.get(a) ?? Infinity) - (latest.get(b) ?? Infinity) || a.localeCompare(b))
    : [...latest.entries()]
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
  const details = perRun.map(({ info }) => {
    const d: Record<string, RunInfo> = {};
    for (const n of names) {
      const i = info.get(n);
      if (i) d[n] = i;
    }
    return d;
  });

  return NextResponse.json({
    suppliers: names.map((name) => ({ name, isMyCompany: name === myCompany })),
    points,
    details,
  });
}
