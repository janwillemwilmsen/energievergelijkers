import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expandTypes, overviewCards } from "@/lib/overviewCards";

/**
 * GET /api/overview?scenarioId=1[&types=vast,variabel]
 * Per platform: our company's best rank in the latest run, the delta vs. the
 * previous run, the offer count, and who holds rank 1. With `types`, ranks and
 * counts are within those contract types (dynamisch incl. combinatie).
 */
export async function GET(req: NextRequest) {
  const scenarioId = Number(req.nextUrl.searchParams.get("scenarioId"));
  if (!scenarioId) return NextResponse.json({ error: "scenarioId is required" }, { status: 400 });
  const types = (req.nextUrl.searchParams.get("types") ?? "").split(",").filter(Boolean);

  const me = await prisma.supplier.findFirst({ where: { isMyCompany: true } });
  const { cards } = await overviewCards(scenarioId, { cards: expandTypes(types) });
  return NextResponse.json({ myCompany: me?.name ?? null, cards });
}
