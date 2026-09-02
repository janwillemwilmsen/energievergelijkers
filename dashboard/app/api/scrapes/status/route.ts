import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/scrapes/status?sweepId=...&expected=6
 * Progress of a sweep: which platform runs have been ingested so far.
 */
export async function GET(req: NextRequest) {
  const sweepId = req.nextUrl.searchParams.get("sweepId");
  const expected = Number(req.nextUrl.searchParams.get("expected") ?? 6);
  if (!sweepId) return NextResponse.json({ error: "sweepId is required" }, { status: 400 });

  const runs = await prisma.scrapeRun.findMany({
    where: { sweepId },
    include: { platform: { select: { label: true } } },
    orderBy: { scrapedAt: "asc" },
  });
  return NextResponse.json({
    sweepId,
    completed: runs.length,
    expected,
    done: runs.length >= expected,
    runs: runs.map((r) => ({ platform: r.platform.label, offers: r.offerCount, status: r.status })),
  });
}
