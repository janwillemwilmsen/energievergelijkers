#!/usr/bin/env node
// Energievergelijk.nl comparison client — derived from a recorded HAR (2026-08-27).
// One unauthenticated JSON POST does the whole comparison:
//   POST https://compare.energievergelijk.nl/api/search
// (Moved 2026-09-09: api.energievergelijk.nl now CNAMEs to the WordPress host and
//  the old /vergelijker/search path is gone; the SPA bundle names the new endpoint.)
// Alleen stroom via gas:0; teruglevering via solar:<kWh/jaar> (key found in the
// site's own SPA bundle). filters ["2:5"] = "Alle contracten" (the SPA's
// Type-contract radio; 2:17 = Beste deals, 2:4 = Variabel). No cookies,
// tokens, or session.

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, num, round } from "./energy-lib.mjs";

const API = "https://compare.energievergelijk.nl";
const HEADERS = {
  "content-type": "application/json",
  accept: "application/json",
  origin: "https://www.energievergelijk.nl",
  referer: "https://www.energievergelijk.nl/",
  "user-agent": UA,
};

export async function fetchOffers(input) {
  const body = {
    gas: input.gas,
    power: input.normaal,
    power_low: input.dal,
    zipcode: input.postcode,
    housenumber: String(input.huisnr),
    price_rate: "m",
    // Contract-type filter as the SPA sends it: "2:5" = "Alle contracten".
    // Without it the API answers with the site's "Beste deals" subset (34 of
    // 56 offers for a mid-size household, observed 2026-09-14), which hides
    // most dynamic and variable contracts.
    filters: ["2:5"],
    origin: "home",
    lang: "NL",
  };
  if (input.teruglevering > 0) body.solar = input.teruglevering;
  const res = await fetch(API + "/api/search", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST /api/search -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const list = Object.values(await res.json());
  if (!list.length) throw new Error("No offers returned — check postcode/huisnummer");

  return list.map((p) => {
    const det = p.pricing?.details ?? {};
    const name = p.name ?? "";
    const contractType = /dynamisch/i.test(name) ? "Dynamisch" : /variabel/i.test(name) ? "Variabel" : /vast/i.test(name) ? "Vast" : name;
    const durY = name.match(/(\d+)\s*jaar/i);
    // discount.total_sum is the cashback spread per contract year (Engie
    // 3 jaar: 535 -> 178.33); the site shows the full "€ 535 korting". The
    // canonical korting is the total, so scale multi-year fixed contracts up
    // (snapping to whole euros when the API truncated the division).
    const years = contractType === "Vast" && durY ? Number(durY[1]) : 1;
    let discount = det.discount?.total_sum || null;
    if (discount && years > 1) {
      const total = discount * years;
      discount = Math.abs(total - Math.round(total)) <= 0.05 ? Math.round(total) : total;
    }
    return makeRecord("energievergelijk", input, {
      leverancier: p.provider?.name,
      product: name,
      contractType,
      looptijdMaanden: contractType === "Vast" && durY ? Number(durY[1]) * 12 : null,
      prijsPerMaand: num(p.pricing?.display_total),
      prijsPerJaar: round(p.pricing?.total, 2),
      prijsPerJaarExclKorting: round(det.bruto?.total_sum, 2),
      korting: discount ? round(discount, 2) : null,
      // Single meter (dal 0): the API returns one "single" item instead of standard/low.
      tariefStroomNormaal: num(det.power?.tariff?.items?.standard ?? det.power?.tariff?.items?.single),
      tariefStroomDal: num(det.power?.tariff?.items?.low ?? det.power?.tariff?.items?.single),
      tariefGas: num(det.gas?.tariff?.items?.single),
      vasteLeveringskostenStroomPerJaar: det.fixed_cost?.power != null ? round(det.fixed_cost.power, 2) : null,
      vasteLeveringskostenGasPerJaar: det.fixed_cost?.gas != null ? round(det.fixed_cost.gas, 2) : null,
      netbeheerPerJaar: det.operator?.total_sum != null ? round(det.operator.total_sum, 2) : null,
      terugleverVergoedingPerKwh: num(det.feed_in?.tariff),
      rating: num(p.reviews?.summary?.general?.number),
      aantalReviews: p.reviews?.summary?.total || null,
      labels:
        (p.summary ?? [])
          .filter((s) => s.type !== "standard")
          .map((s) => s.description)
          .join(" | ") || null,
      bronOfferId: String(p.id),
    });
  });
}

const input = parseCli(process.argv, "energievergelijk-client.mjs");
fetchOffers(input)
  .then((records) => output(sortRecords(filterRecords(records, input)), input))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
