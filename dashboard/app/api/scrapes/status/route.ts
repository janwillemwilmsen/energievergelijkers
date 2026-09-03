import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/scrapes/status?sweepId=...&expected=6
 * Per-platform progress of a sweep, including failures. A sweep is "done"
 * once every expected platform has reported — success or failure.
 */
export async function GET(req: NextRequest) {
  const sweepId = req.nextUrl.searchParams.get("sweepId");
  const expected = Number(req.nextUrl.searchParams.get("expected") ?? 6);
  if (!sweepId) return NextResponse.json({ error: "sweepId is required" }, { status: 400 });

  const runs = await prisma.scrapeRun.findMany({
    where: { sweepId },
    include: { platform: { select: { name: true, label: true } } },
    orderBy: { scrapedAt: "asc" },
  });
  const succeeded = runs.filter((r) => r.status === "completed").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  return NextResponse.json({
    sweepId,
    completed: runs.length,
    succeeded,
    failed,
    expected,
    done: runs.length >= expected,
    runs: runs.map((r) => ({
      platform: r.platform.name,
      label: r.platform.label,
      offers: r.offerCount,
      status: r.status,
      error: r.error,
      scrapedAt: r.scrapedAt,
    })),
  });
}
