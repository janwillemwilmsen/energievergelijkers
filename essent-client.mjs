#!/usr/bin/env node
// Essent.nl offer client — derived from a recorded HAR (2026-08-25).
// JSON funnel API under /api/public/. Supports stroom+gas and alleen-stroom
// (only the electricity EAN is selected) and teruglevering (zonnepanelen).
// Uses energy-lib.mjs for the uniform CLI, filters, and canonical records.

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, round } from "./energy-lib.mjs";

const BASE = "https://www.essent.nl";
const HEADERS = {
  accept: "application/json",
  "user-agent": UA,
  referer: "https://www.essent.nl/",
  "x-request-origin": "client",
  "x-client-version": "4.452.0",
  "accept-language": "nl-NL,nl;q=0.9",
};

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { ...HEADERS, "content-type": "application/json" } : HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

// Pull tariffs out of an offer's offerOverviews (per energy type: all-in
// consumption prices, delivery-only unit prices, vaste leveringskosten).
function parseOverview(offer, energyType) {
  const ov = (offer.offerOverviews ?? []).find((o) => o.energyType === energyType);
  if (!ov) return {};
  const cons = ov.consumptionPrices ?? [];
  const allinNormaal = cons.find((c) => /Normaaltarief|Totaal gas|Totaal elektriciteit \(/i.test(c.description))?.amount ?? cons[0]?.amount ?? null;
  const allinDal = cons.find((c) => /Daltarief/i.test(c.description))?.amount ?? null;
  const prices = (ov.priceGroups ?? []).flatMap((g) => g.prices ?? []);
  const lev = (re) => prices.find((p) => re.test(p.description))?.unitPrice ?? null;
  const vastJaar = prices
    .filter((p) => /^Vaste leveringskosten/i.test(p.description))
    .reduce((s, p) => s + (p.expectedPeriodAmount || 0), 0) || null;
  const netbeheer = (ov.priceGroups ?? [])
    .filter((g) => /netbeheer/i.test(g.description))
    .flatMap((g) => g.prices ?? [])
    .reduce((s, p) => s + (p.expectedPeriodAmount || 0), 0) || null;
  const teruglever = prices.find((p) => /Terugleververgoeding/i.test(p.description))?.unitPrice ?? null;
  return {
    allinNormaal, allinDal,
    levNormaal: lev(/Variabele leveringskosten Normaaltarief|Variabele leveringskosten$/i),
    levDal: lev(/Variabele leveringskosten Daltarief/i),
    vastJaar, netbeheer,
    teruglever: teruglever != null ? Math.abs(teruglever) : null,
  };
}

export async function fetchOffers(input) {
  const list = await api(
    "GET",
    `/api/public/contracts-middleware/contracts/addresses/v2?postcode=${input.postcode}&house_number=${input.huisnr}`
  );
  if (!list?.length) throw new Error(`No address found for ${input.postcode} ${input.huisnr}`);
  const address = list[0];

  const flow = (
    await api("PUT", "/api/public/bac/initiate-flow", {
      headers: { Accept: "application/json" },
      params: {
        extend_time_to_live: false,
        house_number: address.house_number,
        postcode: address.postcode,
        city: address.city,
        street: address.street,
        customer_segment: "household",
      },
    })
  ).meta_data.flow_id;

  const inst = (await api("GET", `/api/public/contracting/newcustomer/installationdetails/v2?flow_id=${flow}`)).payload;
  const eans = inst
    .filter((g) => input.gas > 0 || g.energy_type === "electricity")
    .flatMap((g) => g.installations.map((i) => i.connect_ean));
  await api("PUT", "/api/public/contracting/newcustomer/eandetails/v2", {
    meta_data: { flow_id: flow },
    payload: [{ connect_ean: eans }],
  });

  const consumption = [
    {
      energy_type: "electricity",
      standard_annual_usages: [
        { direction_tariff: "supply_low", reading: input.dal },
        { direction_tariff: "supply_normal", reading: input.normaal },
        { direction_tariff: "return_supply_low", reading: input.terugDal },
        { direction_tariff: "return_supply_normal", reading: input.terugNormaal },
      ],
    },
  ];
  if (input.gas > 0)
    consumption.push({ energy_type: "gas", standard_annual_usages: [{ direction_tariff: "supply_normal", reading: input.gas }] });
  await api("PUT", "/api/public/contracting/newcustomer/consumption/v2", {
    meta_data: { flow_id: flow },
    payload: consumption,
  });

  const q = new URLSearchParams({
    flow_id: flow,
    offer_set: "Basis Offerset Essent",
    customer_segment: "household",
    postcode: input.postcode,
    house_number: input.huisnr,
    house_number_extension: "",
    electricity: input.normaal,
    electricity_low: input.dal,
    electricity_return: input.teruglevering,
    duration_filter: "all_durations",
  });
  if (input.gas > 0) q.set("gas", input.gas);
  const data = await api("GET", `/api/public/cplusactivation/offers/v1?${q}`);

  return (data.offers ?? []).map((o) => {
    const el = parseOverview(o, "electricity");
    const ga = input.gas > 0 ? parseOverview(o, "gas") : {};
    const title = o.productTitle ?? "";
    const contractType = /dynamisch/i.test(title) ? "Dynamisch" : /variabel/i.test(title) ? "Variabel" : "Vast";
    const durM = title.match(/(\d)\s*jaar/i);
    return makeRecord("essent", input, {
      leverancier: "Essent",
      product: title,
      contractType,
      looptijdMaanden: contractType === "Vast" && durM ? Number(durM[1]) * 12 : null,
      prijsPerMaand: round(o.expectedMonthlyAmount, 2),
      prijsPerJaar: round(o.expectedYearlyAmount, 2),
      prijsPerJaarExclKorting: round(o.beforeDiscountExpectedYearlyAmount, 2),
      korting: o.incentiveValue || null,
      tariefStroomNormaal: el.allinNormaal,
      tariefStroomDal: el.allinDal,
      tariefGas: ga.allinNormaal ?? null,
      tariefStroomNormaalLevering: el.levNormaal,
      tariefStroomDalLevering: el.levDal,
      tariefGasLevering: ga.levNormaal ?? null,
      vasteLeveringskostenStroomPerJaar: round(el.vastJaar, 2),
      vasteLeveringskostenGasPerJaar: round(ga.vastJaar, 2),
      netbeheerPerJaar: round((el.netbeheer || 0) + (ga.netbeheer || 0), 2) || null,
      terugleverVergoedingPerKwh: el.teruglever,
      rating: null,
      aantalReviews: null,
      duurzaamheidsScore: null,
      labels: [o.incentiveTitle, o.isHighlightedLabel].filter(Boolean).join(" | ") || null,
      bronOfferId: String(o.offerId ?? o.campaignId ?? ""),
    });
  });
}

const input = parseCli(process.argv, "essent-client.mjs");
fetchOffers(input)
  .then((records) => output(sortRecords(filterRecords(records, input)), input))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
