// Per-platform "where do we stand" cards for one scenario, optionally
// restricted to a set of contract types. Shared by /api/overview (selected
// scenario, all types) and /api/overview/presets (every preset × type).
import { prisma } from "./db";

export type OverviewCard = {
  platform: string;
  label: string;
  hasData: boolean;
  scrapedAt?: Date;
  offerCount?: number;
  myRank?: number | null;
  previousRank?: number | null;
  delta?: number | null; // positive = climbed
  myAnnualCost?: number | null;
  myContract?: string | null;
  leader?: { supplier: string; annualCost: number } | null;
  gapToLeader?: number | null;
};

/** "dynamisch" also covers "combinatie" (dynamic power + fixed gas). */
export const expandTypes = (types: string[]) =>
  new Set(types.flatMap((t) => (t === "dynamisch" ? ["dynamisch", "combinatie"] : [t])));

type RunWithOffers = {
  id: number;
  scrapedAt: Date;
  offers: {
    rank: number;
    contractType: string;
    contractName: string;
    annualCost: number;
    supplier: { name: string; isMyCompany: boolean };
  }[];
};

/**
 * Position of our best contract within the (filtered) list of one run.
 * Offers are stored in overall rank order, so the position within a type
 * selection is simply the index in the filtered list.
 */
function standings(run: RunWithOffers, typeSet: Set<string>) {
  const offers = typeSet.size ? run.offers.filter((o) => typeSet.has(o.contractType)) : run.offers;
  const myIndex = offers.findIndex((o) => o.supplier.isMyCompany);
  return {
    count: offers.length,
    myRank: myIndex >= 0 ? myIndex + 1 : null,
    mine: myIndex >= 0 ? offers[myIndex] : null,
    leader: offers[0] ?? null,
  };
}

const runQuery = (scenarioId: number, platformId: number) =>
  prisma.scrapeRun.findMany({
    where: { scenarioId, platformId, status: "completed" },
    orderBy: { scrapedAt: "desc" },
    take: 2,
    select: {
      id: true,
      scrapedAt: true,
      offers: {
        orderBy: { rank: "asc" },
        select: {
          rank: true,
          contractType: true,
          contractName: true,
          annualCost: true,
          supplier: { select: { name: true, isMyCompany: true } },
        },
      },
    },
  });

/**
 * Cards for one scenario. `typeSets` lets the caller get several type
 * variants from the same two runs per platform (one DB round-trip each).
 */
export async function overviewCards(
  scenarioId: number,
  typeSets: Record<string, Set<string>>
): Promise<Record<string, OverviewCard[]>> {
  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });
  const out: Record<string, OverviewCard[]> = Object.fromEntries(Object.keys(typeSets).map((k) => [k, []]));

  for (const platform of platforms) {
    const runs = await runQuery(scenarioId, platform.id);
    for (const [key, typeSet] of Object.entries(typeSets)) {
      if (!runs.length) {
        out[key].push({ platform: platform.name, label: platform.label, hasData: false });
        continue;
      }
      const cur = standings(runs[0], typeSet);
      const prev = runs[1] ? standings(runs[1], typeSet) : null;
      out[key].push({
        platform: platform.name,
        label: platform.label,
        hasData: true,
        scrapedAt: runs[0].scrapedAt,
        offerCount: cur.count,
        myRank: cur.myRank,
        previousRank: prev?.myRank ?? null,
        delta: cur.myRank != null && prev?.myRank != null ? prev.myRank - cur.myRank : null,
        myAnnualCost: cur.mine?.annualCost ?? null,
        myContract: cur.mine?.contractName ?? null,
        leader: cur.leader ? { supplier: cur.leader.supplier.name, annualCost: cur.leader.annualCost } : null,
        gapToLeader:
          cur.mine && cur.leader ? Math.round((cur.mine.annualCost - cur.leader.annualCost) * 100) / 100 : null,
      });
    }
  }
  return out;
}
