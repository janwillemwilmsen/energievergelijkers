import path from "node:path";
import { existsSync } from "node:fs";

// The six screenshot clients (kept in sync with screenshot-*.mjs at the root).
export const PLATFORMS = [
  "gaslicht",
  "energiekiezer",
  "energievergelijk",
  "independer",
  "overstappen",
  "pricewise",
] as const;
export type Platform = (typeof PLATFORMS)[number];

// Resolve the repo root by walking up from cwd until we find the screenshot
// library. Robust against the Next server's cwd (which may be the dashboard OR
// the repo root depending on how it was launched / workspace-root inference) —
// process.cwd()-relative math was the cause of the image 404s.
export function repoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "screenshot-lib.mjs"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.join(process.cwd(), ".."); // fallback: dashboard -> repo root
}

// Where screenshots live: SHOTS_DIR (e.g. /data/screenshots) or <root>/screenshots.
// Without SHOTS_DIR, production (Coolify) prefers the /data persistent volume —
// the container FS is wiped on every redeploy, which silently lost all shots.
// Keep in sync with saveShot() in <root>/screenshot-lib.mjs.
export function shotsBase(): string {
  if (process.env.SHOTS_DIR) return path.resolve(process.env.SHOTS_DIR);
  if (process.platform === "linux" && existsSync("/data")) return "/data/screenshots";
  return path.join(repoRoot(), "screenshots");
}

// sweepIds contain ':' (illegal in Windows paths) — sanitise for a folder name.
export function safeSweep(sweepId: string): string {
  return sweepId.replace(/[^A-Za-z0-9._-]/g, "-");
}

// One folder per sweep, one deterministic <platform>.png inside it, so a rerun
// overwrites in place and the files can be listed/served without a database.
export function sweepDir(sweepId: string): string {
  return path.join(shotsBase(), safeSweep(sweepId));
}

export const isPlatform = (v: string): v is Platform => (PLATFORMS as readonly string[]).includes(v);
