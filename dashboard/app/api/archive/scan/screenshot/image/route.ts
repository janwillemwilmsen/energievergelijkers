import type { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isPlatform, sweepDir } from "@/lib/shots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/archive/scan/screenshot/image?sweepId=...&platform=gaslicht
 * Streams the sweep's <platform>.png. sweepId is sanitised into a folder name
 * and platform is checked against the allowlist, so no path traversal is possible.
 */
export async function GET(req: NextRequest) {
  const sweepId = req.nextUrl.searchParams.get("sweepId");
  const platform = req.nextUrl.searchParams.get("platform") ?? "";
  if (!sweepId || !isPlatform(platform)) return new Response("bad request", { status: 400 });
  try {
    const buf = await readFile(path.join(sweepDir(sweepId), `${platform}.png`));
    return new Response(new Uint8Array(buf), {
      headers: { "content-type": "image/png", "cache-control": "no-store" },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
