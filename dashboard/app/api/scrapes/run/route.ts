import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { openSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";

/**
 * POST /api/scrapes/run
 * Kicks off a real scrape sweep as a detached background process
 * (scripts/run-scrapes.mjs, which runs the 6 scraper CLIs and posts each
 * result back to /api/scrapes/ingest).
 *
 * Body: { scenarioId: number }   -> sweep for that one scenario (custom or preset)
 *   or: { presets: true }        -> re-run all four preset scenarios
 *
 * Returns { sweepId, expectedRuns } for progress polling via /api/scrapes/status.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sweepId = `ui-${new Date().toISOString().slice(0, 19)}-${randomUUID().slice(0, 8)}`;

  const script = path.join(process.cwd(), "scripts", "run-scrapes.mjs");
  let args: string[];
  let expectedRuns: number;

  if (body.presets) {
    args = [script, "--scenario", "all", "--sweep-id", sweepId];
    expectedRuns = 4 * 6;
  } else if (body.scenarioId) {
    const sc = await prisma.scenario.findUnique({ where: { id: Number(body.scenarioId) } });
    if (!sc) return NextResponse.json({ error: "Unknown scenarioId" }, { status: 404 });
    args = sc.isPreset && sc.name
      ? [script, "--scenario", sc.name, "--sweep-id", sweepId]
      : [
          script,
          "--normaal", String(sc.electricityNormal),
          "--dal", String(sc.electricityLow),
          "--gas", String(sc.gas),
          "--teruglevering", String(sc.solarFeedIn),
          "--sweep-id", sweepId,
        ];
    expectedRuns = 6;
  } else {
    return NextResponse.json({ error: "Provide scenarioId or presets:true" }, { status: 400 });
  }

  const log = openSync(path.join(process.cwd(), `sweep-${sweepId.replace(/[:]/g, "-")}.log`), "a");
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    detached: true,
    stdio: ["ignore", log, log],
    env: { ...process.env, DASHBOARD_URL: req.nextUrl.origin },
  });
  child.unref();

  return NextResponse.json({ sweepId, expectedRuns, pid: child.pid });
}
