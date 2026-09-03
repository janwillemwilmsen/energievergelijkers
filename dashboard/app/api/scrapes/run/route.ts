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
 * Body: { scenarioId: number, postcode?: string, huisnr?: string }
 *   -> sweep for that scenario, optionally for a specific address
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

  const pc =
    typeof body.postcode === "string" && /^\d{4}[A-Za-z]{2}$/.test(body.postcode.replace(/\s+/g, ""))
      ? body.postcode.replace(/\s+/g, "").toUpperCase()
      : null;
  const nr = body.huisnr != null && /^\d+$/.test(String(body.huisnr)) ? String(body.huisnr) : null;
  if (pc && nr) args.push("--postcode", pc, "--huisnr", nr);

  const log = openSync(path.join(process.cwd(), `sweep-${sweepId.replace(/[:]/g, "-")}.log`), "a");
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(),
    // detached: the sweep keeps running even if the request ends or the web
    // server restarts. windowsHide: without it, a detached console process on
    // Windows opens its own terminal window (no-op on Linux/macOS hosting).
    detached: true,
    windowsHide: true,
    stdio: ["ignore", log, log],
    // The runner posts results back to THIS server. Use localhost, not the
    // public origin: inside a container behind a proxy (Coolify/Traefik) the
    // public URL may not be reachable from the container itself.
    env: { ...process.env, DASHBOARD_URL: `http://127.0.0.1:${process.env.PORT ?? 3000}` },
  });
  child.unref();

  return NextResponse.json({ sweepId, expectedRuns, pid: child.pid });
}
