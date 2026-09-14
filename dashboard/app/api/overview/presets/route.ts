import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expandTypes, fixedTermFilter, overviewCards, typeFilter, type OfferFilter } from "@/lib/overviewCards";
import { SIBLING_BRANDS } from "@/lib/domain";
import { SCENARIO_ORDER } from "@/lib/presets";

/** Rows of the homepage matrix, in display order. */
export const MATRIX_ROWS: { key: string; label: string; filter: OfferFilter }[] = [
  { key: "alle", label: "Alle type contracten", filter: null },
  { key: "vast12", label: "Vast 1 jaar", filter: fixedTermFilter(12) },
  { key: "vast24", label: "Vast 2 jaar", filter: fixedTermFilter(24) },
  { key: "vast36", label: "Vast 3 jaar", filter: fixedTermFilter(36) },
  { key: "variabel", label: "Variabel", filter: typeFilter(expandTypes(["variabel"])) },
  { key: "dynamisch", label: "Dynamisch", filter: typeFilter(expandTypes(["dynamisch"])) },
];

/**
 * GET /api/overview/presets[?brand=Energiedirect]
 * The homepage matrix: for EVERY preset scenario, the per-platform cards of
 * /api/overview split per row (all contracts, vast per looptijd, variabel,
 * dynamisch incl. combinatie). Ranks are positions within that row.
 * `brand` switches which supplier counts as "ours" (default: own company;
 * must be one of `brands`).
 * { myCompany, brand, brands, types: [{ key, label }], presets: [{ id, name,
 *   label, usage, lastRunAt, cards: { alle: OverviewCard[], vast12: [...], ... } }] }
 */
export async function GET(req: NextRequest) {
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
  const brands = [me?.name, ...SIBLING_BRANDS].filter((b): b is string => !!b);
  const requested = req.nextUrl.searchParams.get("brand");
  const brand = requested && brands.includes(requested) ? requested : brands[0] ?? null;
  const filters = Object.fromEntries(MATRIX_ROWS.map((r) => [r.key, r.filter]));

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
      cards: await overviewCards(s.id, filters, brand),
    });
  }
  return NextResponse.json({
    myCompany: me?.name ?? null,
    brand,
    brands,
    types: MATRIX_ROWS.map(({ key, label }) => ({ key, label })),
    presets: out,
  });
}
