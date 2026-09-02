import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/address/check?postcode=5216EK&huisnr=27
 * Validates a Dutch postcode + house number and resolves street/city.
 * Proxies EnergieKiezer's open address API server-side (no key required);
 * falls back to Essent's address API if the first is unavailable.
 */
export async function GET(req: NextRequest) {
  const pc = (req.nextUrl.searchParams.get("postcode") ?? "").replace(/\s+/g, "").toUpperCase();
  const nr = (req.nextUrl.searchParams.get("huisnr") ?? "").trim();
  if (!/^\d{4}[A-Z]{2}$/.test(pc) || !/^\d+$/.test(nr))
    return NextResponse.json({ valid: false, reason: "format" });

  const pcSpaced = `${pc.slice(0, 4)} ${pc.slice(4)}`;
  try {
    const r = await fetch(
      `https://api.energiekiezer.nl/api/v1/address?postalCode=${encodeURIComponent(pcSpaced)}&houseNumber=${nr}&withPossibleAdditions=true`,
      { headers: { accept: "application/json", origin: "https://www.energiekiezer.nl" }, signal: AbortSignal.timeout(8000) }
    );
    if (r.ok) {
      const data = await r.json();
      const hit = Array.isArray(data) ? data[0] : data?.address ?? data;
      const street = hit?.street ?? hit?.streetName ?? null;
      const city = hit?.city ?? null;
      if (street || city) return NextResponse.json({ valid: true, postcode: pc, huisnr: nr, street, city });
    }
  } catch { /* try fallback */ }

  try {
    const r = await fetch(
      `https://www.essent.nl/api/public/contracts-middleware/contracts/addresses/v2?postcode=${pc}&house_number=${nr}`,
      {
        headers: {
          accept: "application/json",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
          referer: "https://www.essent.nl/",
          "x-request-origin": "client",
        },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (r.ok) {
      const list = await r.json();
      if (Array.isArray(list) && list.length)
        return NextResponse.json({ valid: true, postcode: pc, huisnr: nr, street: list[0].street, city: list[0].city });
    }
  } catch { /* fall through */ }

  return NextResponse.json({ valid: false, reason: "not_found", postcode: pc, huisnr: nr });
}
