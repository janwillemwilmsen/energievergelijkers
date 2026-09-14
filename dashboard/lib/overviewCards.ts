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

export type Offer = {
  rank: number;
  contractType: string;
  contractName: string;
  durationMonths: number | null;
  annualCost: number;
  supplier: { name: string; isMyCompany: boolean };
};

/** Which offers of a run make up one row/card; `null` = every offer. */
export type OfferFilter = ((o: Offer) => boolean) | null;

/** Filter for a contract-type selection; an empty selection keeps all offers. */
export const typeFilter = (types: Set<string>): OfferFilter =>
  types.size ? (o) => types.has(o.contractType) : null;

/** Filter for fixed contracts of one duration (12 / 24 / 36 months). */
export const fixedTermFilter =
  (months: number): OfferFilter =>
  (o) =>
    o.contractType === "vast" && o.durationMonths === months;

type RunWithOffers = { id: number; scrapedAt: Date; offers: Offer[] };

/**
 * Position of our best contract within the (filtered) list of one run.
 * Offers are stored in overall rank order, so the position within a
 * selection is simply the index in the filtered list. `brand` picks which
 * supplier counts as "ours" (default: the isMyCompany flag).
 */
function standings(run: RunWithOffers, filter: OfferFilter, brand: string | null) {
  const offers = filter ? run.offers.filter(filter) : run.offers;
  const isMine = brand ? (o: Offer) => o.supplier.name === brand : (o: Offer) => o.supplier.isMyCompany;
  const myIndex = offers.findIndex(isMine);
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
          durationMonths: true,
          annualCost: true,
          supplier: { select: { name: true, isMyCompany: true } },
        },
      },
    },
  });

/**
 * Cards for one scenario. `filters` lets the caller get several variants
 * (per contract type, per fixed term, unfiltered) from the same two runs per
 * platform (one DB round-trip each). `brand` overrides which supplier is
 * treated as our own (e.g. a sister brand); null = the isMyCompany flag.
 */
export async function overviewCards(
  scenarioId: number,
  filters: Record<string, OfferFilter>,
  brand: string | null = null
): Promise<Record<string, OverviewCard[]>> {
  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });
  const out: Record<string, OverviewCard[]> = Object.fromEntries(Object.keys(filters).map((k) => [k, []]));

  for (const platform of platforms) {
    const runs = await runQuery(scenarioId, platform.id);
    for (const [key, filter] of Object.entries(filters)) {
      if (!runs.length) {
        out[key].push({ platform: platform.name, label: platform.label, hasData: false });
        continue;
      }
      const cur = standings(runs[0], filter, brand);
      const prev = runs[1] ? standings(runs[1], filter, brand) : null;
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
