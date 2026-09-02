#!/usr/bin/env node
// Energievergelijk.nl comparison client — derived from a recorded HAR (2026-08-27).
// One unauthenticated JSON POST does the whole comparison:
//   POST https://api.energievergelijk.nl/vergelijker/search
// Alleen stroom via gas:0; teruglevering via solar:<kWh/jaar> (key found in the
// site's own SPA bundle). No cookies, tokens, or session.

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, num, round } from "./energy-lib.mjs";

const API = "https://api.energievergelijk.nl";
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
    origin: "home",
    lang: "NL",
  };
  if (input.teruglevering > 0) body.solar = input.teruglevering;
  const res = await fetch(API + "/vergelijker/search", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST /vergelijker/search -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const list = Object.values(await res.json());
  if (!list.length) throw new Error("No offers returned — check postcode/huisnummer");

  return list.map((p) => {
    const det = p.pricing?.details ?? {};
    const name = p.name ?? "";
    const contractType = /dynamisch/i.test(name) ? "Dynamisch" : /variabel/i.test(name) ? "Variabel" : /vast/i.test(name) ? "Vast" : name;
    const durY = name.match(/(\d+)\s*jaar/i);
    const discount = det.discount?.total_sum || null;
    return makeRecord("energievergelijk", input, {
      leverancier: p.provider?.name,
      product: name,
      contractType,
      looptijdMaanden: contractType === "Vast" && durY ? Number(durY[1]) * 12 : null,
      prijsPerMaand: num(p.pricing?.display_total),
      prijsPerJaar: round(p.pricing?.total, 2),
      prijsPerJaarExclKorting: round(det.bruto?.total_sum, 2),
      korting: discount ? round(discount, 2) : null,
      tariefStroomNormaal: num(det.power?.tariff?.items?.standard),
      tariefStroomDal: num(det.power?.tariff?.items?.low),
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
