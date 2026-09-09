import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPresets } from "@/lib/presets";

/** PUT /api/presets/order — Body: { ids: number[] } (every preset id, in the wanted order) */
export async function PUT(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as { ids?: unknown } | null;
  const ids = Array.isArray(b?.ids) ? b.ids.map(Number) : null;
  if (!ids?.length || ids.some((n) => !Number.isInteger(n)))
    return NextResponse.json({ error: "ids[] is verplicht" }, { status: 400 });

  const presets = await prisma.scenario.findMany({ where: { isPreset: true }, select: { id: true } });
  const known = new Set(presets.map((p) => p.id));
  if (ids.length !== known.size || ids.some((id) => !known.has(id)))
    return NextResponse.json({ error: "ids[] moet precies alle presets bevatten" }, { status: 400 });

  await prisma.$transaction(ids.map((id, i) => prisma.scenario.update({ where: { id }, data: { sortOrder: i } })));
  return NextResponse.json({ presets: await getPresets() });
}
