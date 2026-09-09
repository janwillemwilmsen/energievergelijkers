import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SCENARIO_ORDER } from "@/lib/presets";

/** GET /api/scenarios — presets first, then customs; each with run info. */
export async function GET() {
  const scenarios = await prisma.scenario.findMany({
    orderBy: SCENARIO_ORDER,
    include: { _count: { select: { runs: true } } },
  });
  return NextResponse.json({
    scenarios: scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      label: s.label,
      electricityNormal: s.electricityNormal,
      electricityLow: s.electricityLow,
      gas: s.gas,
      solarFeedIn: s.solarFeedIn,
      isPreset: s.isPreset,
      runCount: s._count.runs,
    })),
  });
}

/**
 * POST /api/scenarios — find-or-create a custom scenario from the builder.
 * Body: { electricityNormal, electricityLow?, gas?, solarFeedIn?, name? }
 * (gas: 0 = electricity-only / mono)
 */
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b || !Number.isFinite(Number(b.electricityNormal)))
    return NextResponse.json({ error: "electricityNormal is required" }, { status: 400 });
  const key = {
    electricityNormal: Number(b.electricityNormal),
    electricityLow: Number(b.electricityLow ?? 0),
    gas: Number(b.gas ?? 0),
    solarFeedIn: Number(b.solarFeedIn ?? 0),
  };
  const scenario = await prisma.scenario.upsert({
    where: { electricityNormal_electricityLow_gas_solarFeedIn: key },
    create: { ...key, name: b.name ?? null },
    update: {},
  });
  return NextResponse.json({ scenario });
}
