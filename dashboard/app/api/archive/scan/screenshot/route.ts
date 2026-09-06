import type { NextRequest } from "next/server";
import { spawn } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { PLATFORMS, isPlatform, repoRoot, sweepDir } from "@/lib/shots";

// Spawns child processes and streams progress, so it must run on the Node
// runtime and never be cached/prerendered.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_PLATFORM_TIMEOUT = 180_000;

/**
 * GET /api/archive/scan/screenshot?sweepId=...
 * Lists the screenshots already on disk for this sweep (so the page can show
 * them on load without re-running). Returns { shots: { <platform>: mtimeMs|null } }.
 */
export async function GET(req: NextRequest) {
  const sweepId = req.nextUrl.searchParams.get("sweepId");
  if (!sweepId) return Response.json({ error: "sweepId is required" }, { status: 400 });
  const dir = sweepDir(sweepId);
  const shots: Record<string, number | null> = {};
  await Promise.all(
    PLATFORMS.map(async (p) => {
      try {
        shots[p] = (await stat(path.join(dir, `${p}.png`))).mtimeMs;
      } catch {
        shots[p] = null;
      }
    })
  );
  return Response.json({ sweepId, shots });
}

/**
 * POST /api/archive/scan/screenshot   body: { sweepId, platforms? }
 * Runs each screenshot client for the scan's own address + usage, saving to a
 * per-sweep folder (deterministic <platform>.png), and streams newline-delimited
 * JSON progress events. `platforms` limits the run to a subset (e.g. a retry of
 * one failed platform); omitted = all.
 *   {type:"meta", platforms, postcode, huisnr, normaal, dal, gas, terug}
 *   {type:"start", platform}
 *   {type:"done", platform, mtime}    // mtime = cache-buster for the <img>
 *   {type:"error", platform, error}
 *   {type:"complete", ok, total}
 */
export async function POST(req: NextRequest) {
  const { sweepId, platforms } = await req.json().catch(() => ({}));
  if (!sweepId) return Response.json({ error: "sweepId is required" }, { status: 400 });
  const targets = Array.isArray(platforms) ? platforms.filter(isPlatform) : [...PLATFORMS];
  if (targets.length === 0) return Response.json({ error: "geen geldige platforms" }, { status: 400 });

  const legacy = String(sweepId).match(/^run-(\d+)$/);
  const run = await prisma.scrapeRun.findFirst({
    where: legacy ? { id: Number(legacy[1]) } : { sweepId: String(sweepId) },
    include: { scenario: true },
    orderBy: { platformId: "asc" },
  });
  if (!run) return Response.json({ error: "Scan niet gevonden" }, { status: 404 });
  if (!run.postcode || !run.houseNumber) {
    return Response.json(
      { error: "Deze scan heeft geen postcode/huisnummer — screenshots vereisen een adres." },
      { status: 400 }
    );
  }

  const sc = run.scenario;
  const params = {
    postcode: run.postcode,
    huisnr: run.houseNumber,
    normaal: sc.electricityNormal,
    dal: sc.electricityLow,
    gas: sc.gas,
    terug: sc.solarFeedIn,
  };
  const root = repoRoot();
  const outDir = sweepDir(String(sweepId));
  await mkdir(outDir, { recursive: true });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      send({ type: "meta", platforms: targets, ...params });

      let ok = 0;
      // Sequential — the clients share one remote browserless instance.
      for (const platform of targets) {
        send({ type: "start", platform });
        try {
          const mtime = await runOne(platform, params, root, outDir);
          ok++;
          send({ type: "done", platform, mtime });
        } catch (e) {
          send({ type: "error", platform, error: String((e as Error).message || e).slice(0, 300) });
        }
      }
      send({ type: "complete", ok, total: targets.length });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}

type Params = { postcode: string; huisnr: string; normaal: number; dal: number; gas: number; terug: number };

function runOne(platform: string, p: Params, root: string, outDir: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const args = [
      path.join(root, `screenshot-${platform}.mjs`),
      p.postcode, String(p.huisnr),
      "--normaal", String(p.normaal),
      "--dal", String(p.dal),
      "--gas", String(p.gas),
    ];
    if (p.terug > 0) args.push("--teruglevering", String(p.terug));

    // SHOTS_DIR + SHOT_NAME make the client save exactly to outDir/<platform>.png,
    // so this route and the image route always agree on the location.
    const env = { ...process.env, SHOTS_DIR: outDir, SHOT_NAME: platform };
    const child = spawn(process.execPath, args, { cwd: root, windowsHide: true, env });
    let err = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("timeout"));
    }, PER_PLATFORM_TIMEOUT);

    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", async (code) => {
      clearTimeout(timer);
      if (code === 0) {
        try {
          resolve((await stat(path.join(outDir, `${platform}.png`))).mtimeMs);
        } catch {
          reject(new Error("screenshot niet gevonden na afloop"));
        }
      } else {
        const line = err.trim().split("\n").find((l) => /FAILED/.test(l)) || err.trim() || `exit ${code}`;
        reject(new Error(line.replace(/^FAILED\s+\w+:\s*/, "").slice(0, 300)));
      }
    });
  });
}
