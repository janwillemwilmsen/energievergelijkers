import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  SETTING_HUISNR,
  SETTING_POSTCODE,
  getDefaultAddress,
  normalizeHuisnr,
  normalizePostcode,
} from "@/lib/presets";

/** GET /api/presets/address — the default address used by preset sweeps. */
export async function GET() {
  return NextResponse.json({ address: await getDefaultAddress() });
}

/** PUT /api/presets/address — Body: { postcode, huisnr } */
export async function PUT(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const postcode = normalizePostcode(b?.postcode);
  const huisnr = normalizeHuisnr(b?.huisnr);
  if (!postcode) return NextResponse.json({ error: "Postcode moet 4 cijfers + 2 letters zijn" }, { status: 400 });
  if (!huisnr) return NextResponse.json({ error: "Huisnummer moet een getal zijn" }, { status: 400 });

  await prisma.$transaction([
    prisma.setting.upsert({
      where: { key: SETTING_POSTCODE },
      create: { key: SETTING_POSTCODE, value: postcode },
      update: { value: postcode },
    }),
    prisma.setting.upsert({
      where: { key: SETTING_HUISNR },
      create: { key: SETTING_HUISNR, value: huisnr },
      update: { value: huisnr },
    }),
  ]);
  return NextResponse.json({ address: { postcode, huisnr } });
}
