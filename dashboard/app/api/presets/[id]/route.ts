import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeSlug, parseUsage, toPresetDto } from "@/lib/presets";

const withCount = { _count: { select: { runs: true } } } as const;

/**
 * PATCH /api/presets/:id — edit a preset.
 * Body: any of { name, label, electricityNormal, electricityLow, gas, solarFeedIn }
 *
 * Label/slug edits happen in place. A usage edit moves the preset to the
 * scenario row with the new tuple (find-or-create) and demotes the old row
 * to a custom scenario, so historic scans keep the usage they were made
 * with. An old row without scans is deleted.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const cur = await prisma.scenario.findUnique({ where: { id }, include: withCount });
  if (!cur?.isPreset) return NextResponse.json({ error: "Preset niet gevonden" }, { status: 404 });

  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b) return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });

  const name = b.name === undefined ? cur.name : normalizeSlug(b.name);
  if (!name) return NextResponse.json({ error: "Slug: alleen a-z, 0-9 en '-', max 32 tekens" }, { status: 400 });
  const label =
    b.label === undefined
      ? cur.label
      : typeof b.label === "string" && b.label.trim()
        ? b.label.trim().slice(0, 40)
        : null;
  if (!label) return NextResponse.json({ error: "Label is verplicht" }, { status: 400 });
  const usage = parseUsage(b, cur);
  if (typeof usage === "string") return NextResponse.json({ error: usage }, { status: 400 });

  if (name !== cur.name && (await prisma.scenario.findFirst({ where: { isPreset: true, name, NOT: { id } } })))
    return NextResponse.json({ error: `Slug "${name}" is al in gebruik` }, { status: 409 });

  const sameUsage =
    usage.electricityNormal === cur.electricityNormal &&
    usage.electricityLow === cur.electricityLow &&
    usage.gas === cur.gas &&
    usage.solarFeedIn === cur.solarFeedIn;

  if (sameUsage) {
    const preset = await prisma.scenario.update({ where: { id }, data: { name, label }, include: withCount });
    return NextResponse.json({ preset: toPresetDto(preset), movedFrom: null });
  }

  const target = await prisma.scenario.findUnique({
    where: { electricityNormal_electricityLow_gas_solarFeedIn: usage },
  });
  if (target?.isPreset)
    return NextResponse.json(
      { error: `Preset "${target.label ?? target.name}" heeft al dit verbruik` },
      { status: 409 }
    );

  const preset = await prisma.$transaction(async (tx) => {
    if (cur._count.runs === 0) await tx.scenario.delete({ where: { id } });
    else await tx.scenario.update({ where: { id }, data: { isPreset: false, name: null, label: null, sortOrder: 0 } });
    return tx.scenario.upsert({
      where: { electricityNormal_electricityLow_gas_solarFeedIn: usage },
      create: { ...usage, name, label, sortOrder: cur.sortOrder, isPreset: true },
      update: { name, label, sortOrder: cur.sortOrder, isPreset: true },
      include: withCount,
    });
  });
  return NextResponse.json({ preset: toPresetDto(preset), movedFrom: id });
}

/**
 * DELETE /api/presets/:id — remove a preset. The scenario row survives as a
 * custom scenario when it has scans (they stay browsable in the archive).
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const cur = await prisma.scenario.findUnique({ where: { id }, include: withCount });
  if (!cur?.isPreset) return NextResponse.json({ error: "Preset niet gevonden" }, { status: 404 });
  if ((await prisma.scenario.count({ where: { isPreset: true } })) <= 1)
    return NextResponse.json({ error: "De laatste preset kan niet verwijderd worden" }, { status: 400 });

  if (cur._count.runs === 0) {
    await prisma.scenario.delete({ where: { id } });
    return NextResponse.json({ ok: true, deleted: true });
  }
  await prisma.scenario.update({ where: { id }, data: { isPreset: false, name: null, label: null, sortOrder: 0 } });
  return NextResponse.json({ ok: true, deleted: false, keptRuns: cur._count.runs });
}
