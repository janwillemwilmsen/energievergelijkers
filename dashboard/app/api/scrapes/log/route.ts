import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * GET /api/scrapes/log?sweepId=...
 * Tail of the sweep's runner log — the place where scraper stack traces and
 * WAF blocks show up, viewable from the UI without SSH-ing into the server.
 */
export async function GET(req: NextRequest) {
  const sweepId = req.nextUrl.searchParams.get("sweepId") ?? "";
  // sweepIds are generated as ui-<iso>-<hex>; refuse anything else (path safety)
  if (!/^[A-Za-z0-9:.T-]{5,80}$/.test(sweepId))
    return NextResponse.json({ error: "invalid sweepId" }, { status: 400 });

  const file = path.join(process.cwd(), `sweep-${sweepId.replace(/[:]/g, "-")}.log`);
  try {
    const text = await readFile(file, "utf8");
    const lines = text.split("\n");
    return NextResponse.json({ sweepId, log: lines.slice(-120).join("\n") });
  } catch {
    return NextResponse.json({ sweepId, log: null, error: "log not found (yet)" });
  }
}
