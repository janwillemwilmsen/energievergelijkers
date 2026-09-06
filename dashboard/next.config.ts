import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo has two package-lock.json files (root: screenshot clients;
  // dashboard: this app). Pin Turbopack's root to the dashboard so it doesn't
  // ambiguously infer the repo root as the workspace root.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
