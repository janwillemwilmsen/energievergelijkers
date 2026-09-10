import type { NextRequest } from "next/server";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { isPlatform, sweepDir } from "@/lib/shots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/archive/scan/screenshot/image?sweepId=...&platform=gaslicht[&debug=1]
 * Streams the sweep's <platform>.png. With `debug=1` it serves the newest
 * <platform>-FAILED-<stamp>.png instead — the debug shot saveShot() writes when
 * a client throws — so a failure can be inspected from the dashboard (on
 * production the shots live on the /data volume, out of easy reach).
 * sweepId is sanitised into a folder name and platform is checked against the
 * allowlist, so no path traversal is possible.
 */
export async function GET(req: NextRequest) {
  const sweepId = req.nextUrl.searchParams.get("sweepId");
  const platform = req.nextUrl.searchParams.get("platform") ?? "";
  const debug = req.nextUrl.searchParams.get("debug") === "1";
  if (!sweepId || !isPlatform(platform)) return new Response("bad request", { status: 400 });
  try {
    const dir = sweepDir(sweepId);
    let file = `${platform}.png`;
    if (debug) {
      // Timestamps are ISO-ish (lexically sortable), so the last one is newest.
      const failed = (await readdir(dir)).filter((f) => f.startsWith(`${platform}-FAILED-`) && f.endsWith(".png")).sort();
      if (!failed.length) return new Response("not found", { status: 404 });
      file = failed[failed.length - 1];
    }
    const buf = await readFile(path.join(dir, file));
    return new Response(new Uint8Array(buf), {
      headers: { "content-type": "image/png", "cache-control": "no-store" },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
