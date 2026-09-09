import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/runs
 * ALL scrape runs (including failed/partial, which the archive hides),
 * newest first, for the admin page.
 */
export async function GET() {
  const runs = await prisma.scrapeRun.findMany({
    include: {
      platform: { select: { name: true, label: true } },
      scenario: true,
    },
    orderBy: { scrapedAt: "desc" },
  });

  return NextResponse.json({
    runs: runs.map((r) => ({
      id: r.id,
      sweepId: r.sweepId,
      scrapedAt: r.scrapedAt,
      status: r.status,
      error: r.error,
      offerCount: r.offerCount,
      platform: r.platform.name,
      platformLabel: r.platform.label,
      address: r.postcode ? `${r.postcode} ${r.houseNumber ?? ""}`.trim() : null,
      scenario: {
        id: r.scenario.id,
        name: r.scenario.name,
        label: r.scenario.label,
        electricityNormal: r.scenario.electricityNormal,
        electricityLow: r.scenario.electricityLow,
        gas: r.scenario.gas,
        solarFeedIn: r.scenario.solarFeedIn,
      },
    })),
  });
}

/**
 * DELETE /api/admin/runs
 * Body: { runId: number } — delete one platform run
 *   or: { sweepId: string, scenarioId?: number } — delete every run of a
 *       sweep; with scenarioId only that scenario's runs (a preset sweep
 *       holds several scenarios under one sweepId)
 * Contract offers are removed via the onDelete: Cascade relation.
 */
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  let where;
  if (body.runId != null && Number.isInteger(Number(body.runId))) {
    where = { id: Number(body.runId) };
  } else if (typeof body.sweepId === "string" && body.sweepId.length > 0) {
    const scenarioId = Number(body.scenarioId);
    where = Number.isInteger(scenarioId) && scenarioId > 0 ? { sweepId: body.sweepId, scenarioId } : { sweepId: body.sweepId };
  } else {
    return NextResponse.json({ error: "Provide runId or sweepId" }, { status: 400 });
  }

  const offers = await prisma.contractOffer.count({ where: { scrapeRun: where } });
  const { count } = await prisma.scrapeRun.deleteMany({ where });
  if (count === 0) return NextResponse.json({ error: "Run niet gevonden" }, { status: 404 });

  return NextResponse.json({ deletedRuns: count, deletedOffers: offers });
}
