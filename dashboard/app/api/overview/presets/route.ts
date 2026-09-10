import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expandTypes, overviewCards } from "@/lib/overviewCards";
import { SCENARIO_ORDER } from "@/lib/presets";

export const CONTRACT_TYPE_VARIANTS = ["vast", "variabel", "dynamisch"] as const;

/**
 * GET /api/overview/presets
 * The homepage matrix: for EVERY preset scenario, the per-platform cards of
 * /api/overview split per contract type (vast / variabel / dynamisch, the
 * latter incl. combinatie). Ranks are positions within that type.
 * { myCompany, types: ["vast", ...], presets: [{ id, name, label, usage,
 *   lastRunAt, cards: { vast: OverviewCard[], variabel: [...], dynamisch: [...] } }] }
 */
export async function GET() {
  const [me, presets] = await Promise.all([
    prisma.supplier.findFirst({ where: { isMyCompany: true } }),
    prisma.scenario.findMany({
      where: { isPreset: true },
      orderBy: SCENARIO_ORDER,
      include: {
        runs: { where: { status: "completed" }, orderBy: { scrapedAt: "desc" }, take: 1, select: { scrapedAt: true } },
      },
    }),
  ]);
  const typeSets = Object.fromEntries(CONTRACT_TYPE_VARIANTS.map((t) => [t, expandTypes([t])]));

  const out = [];
  for (const s of presets) {
    out.push({
      id: s.id,
      name: s.name,
      label: s.label,
      electricityNormal: s.electricityNormal,
      electricityLow: s.electricityLow,
      gas: s.gas,
      solarFeedIn: s.solarFeedIn,
      lastRunAt: s.runs[0]?.scrapedAt ?? null,
      cards: await overviewCards(s.id, typeSets),
    });
  }
  return NextResponse.json({ myCompany: me?.name ?? null, types: CONTRACT_TYPE_VARIANTS, presets: out });
}
