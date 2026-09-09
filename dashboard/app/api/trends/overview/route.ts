import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/trends/overview?scenarioId=1&days=90[&types=vast,variabel]
 * Per-platform aggregate time series over all completed runs in the window,
 * for cross-platform comparison charts. Returns
 * { series: [{ platform, label, points: [{ t, cheapest, avg, count,
 *   maxCashback, myRank, myDelta, avgElec, avgGas, avgRating,
 *   vast, variabel, dynamisch }] }] }
 * where t = epoch ms, myRank = own brand's best rank in that run (null when
 * absent) and myDelta = own brand's best annual cost minus the run's cheapest.
 * With a types filter, myRank is re-ranked within the selected types (offers
 * are in overall rank order, so it is the position in the filtered list).
 * Tariff averages use the all-in columns only (Pricewise's delivery-only
 * tariffs live in rawJson and stay excluded); dynamisch includes combinatie —
 * also in the types filter, which restricts every aggregate to those types.
 */
export async function GET(req: NextRequest) {
  const scenarioId = Number(req.nextUrl.searchParams.get("scenarioId"));
  const days = Number(req.nextUrl.searchParams.get("days") ?? 90);
  const typeSet = new Set(
    (req.nextUrl.searchParams.get("types") ?? "")
      .split(",")
      .filter(Boolean)
      .flatMap((t) => (t === "dynamisch" ? ["dynamisch", "combinatie"] : [t]))
  );
  if (!scenarioId) return NextResponse.json({ error: "scenarioId is required" }, { status: 400 });

  const since = new Date(Date.now() - days * 86400_000);
  const runs = await prisma.scrapeRun.findMany({
    where: { scenarioId, status: "completed", scrapedAt: { gte: since } },
    orderBy: { scrapedAt: "asc" },
    include: {
      platform: { select: { name: true, label: true } },
      offers: {
        orderBy: { rank: "asc" },
        select: {
          rank: true,
          annualCost: true,
          discount: true,
          contractType: true,
          rating: true,
          tariffElecNormal: true,
          tariffGas: true,
          supplier: { select: { isMyCompany: true } },
        },
      },
    },
  });

  type Point = {
    t: number;
    cheapest: number;
    avg: number;
    count: number;
    maxCashback: number;
    myRank: number | null;
    myDelta: number | null;
    avgElec: number | null;
    avgGas: number | null;
    avgRating: number | null;
    vast: number;
    variabel: number;
    dynamisch: number;
  };
  const mean = (vals: number[], decimals: number) =>
    vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10 ** decimals) / 10 ** decimals : null;
  const byPlatform = new Map<string, { platform: string; label: string; points: Point[] }>();
  for (const run of runs) {
    const offers = typeSet.size ? run.offers.filter((o) => typeSet.has(o.contractType)) : run.offers;
    if (!offers.length) continue;
    const costs = offers.map((o) => o.annualCost);
    const cheapest = Math.min(...costs);
    const myIndex = offers.findIndex((o) => o.supplier.isMyCompany);
    const mine = offers.filter((o) => o.supplier.isMyCompany);
    const perType: Record<string, number> = {};
    for (const o of offers) perType[o.contractType] = (perType[o.contractType] ?? 0) + 1;
    const entry = byPlatform.get(run.platform.name) ?? {
      platform: run.platform.name,
      label: run.platform.label,
      points: [],
    };
    entry.points.push({
      t: run.scrapedAt.getTime(),
      cheapest: Math.round(cheapest),
      avg: Math.round(costs.reduce((s, v) => s + v, 0) / costs.length),
      count: offers.length,
      maxCashback: Math.round(Math.max(0, ...offers.map((o) => o.discount ?? 0))),
      myRank: myIndex >= 0 ? myIndex + 1 : null, // position within the (filtered) list
      myDelta: mine.length ? Math.round(Math.min(...mine.map((o) => o.annualCost)) - cheapest) : null,
      avgElec: mean(offers.map((o) => o.tariffElecNormal).filter((v): v is number => v != null), 4),
      avgGas: mean(offers.map((o) => o.tariffGas).filter((v): v is number => v != null), 4),
      avgRating: mean(offers.map((o) => o.rating).filter((v): v is number => v != null), 2),
      vast: perType["vast"] ?? 0,
      variabel: perType["variabel"] ?? 0,
      dynamisch: (perType["dynamisch"] ?? 0) + (perType["combinatie"] ?? 0),
    });
    byPlatform.set(run.platform.name, entry);
  }

  return NextResponse.json({ series: [...byPlatform.values()] });
}
