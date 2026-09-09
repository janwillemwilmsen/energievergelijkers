import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDefaultAddress, getPresets, normalizeSlug, parseUsage, toPresetDto } from "@/lib/presets";

/**
 * GET /api/presets
 * The configurable preset scenarios (ordered) + the default scrape address.
 * Read by the dashboard (/admin/presets) and by scripts/run-scrapes.mjs and
 * scripts/run-screenshots.mjs, which no longer hardcode either.
 */
export async function GET() {
  const [presets, address] = await Promise.all([getPresets(), getDefaultAddress()]);
  return NextResponse.json({ presets, address });
}

/**
 * POST /api/presets — add a preset.
 * Body: { name, label, electricityNormal, electricityLow?, gas?, solarFeedIn? }
 * A custom scenario with the same usage tuple is promoted to a preset (its
 * scans stay attached); an existing preset with that tuple is a conflict.
 */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });

  const name = normalizeSlug(b.name);
  if (!name) return NextResponse.json({ error: "Slug: alleen a-z, 0-9 en '-', max 32 tekens" }, { status: 400 });
  const label = typeof b.label === "string" && b.label.trim() ? b.label.trim().slice(0, 40) : null;
  if (!label) return NextResponse.json({ error: "Label is verplicht" }, { status: 400 });
  const usage = parseUsage(b);
  if (typeof usage === "string") return NextResponse.json({ error: usage }, { status: 400 });

  if (await prisma.scenario.findFirst({ where: { isPreset: true, name } }))
    return NextResponse.json({ error: `Slug "${name}" is al in gebruik` }, { status: 409 });
  const existing = await prisma.scenario.findUnique({
    where: { electricityNormal_electricityLow_gas_solarFeedIn: usage },
  });
  if (existing?.isPreset)
    return NextResponse.json(
      { error: `Preset "${existing.label ?? existing.name}" heeft al dit verbruik` },
      { status: 409 }
    );

  const max = await prisma.scenario.aggregate({ where: { isPreset: true }, _max: { sortOrder: true } });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;
  const preset = await prisma.scenario.upsert({
    where: { electricityNormal_electricityLow_gas_solarFeedIn: usage },
    create: { ...usage, name, label, sortOrder, isPreset: true },
    update: { name, label, sortOrder, isPreset: true },
    include: { _count: { select: { runs: true } } },
  });
  return NextResponse.json({ preset: toPresetDto(preset) }, { status: 201 });
}
