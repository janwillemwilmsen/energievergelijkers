#!/usr/bin/env node
// Overstappen.nl energy comparison client — derived from a recorded HAR (2026-08-27).
// Public REST API (api.overstappen.nl) with a static Basic credential from the
// site's own frontend bundle. Two GETs: /postcode/{pc}/{nr} then
// /energy/comparisons?... Alleen stroom via gasusage=0; teruglevering via
// electricitysupplyhigh/-low + solarPanelAmount (+ smartmeter=1).

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, round } from "./energy-lib.mjs";

const API = "https://api.overstappen.nl";
const HEADERS = {
  // Base64 of "os_nl_cors:<public frontend credential>", recorded from the site.
  authorization: "Basic b3NfbmxfY29yczp6NUB2QWtOZXJQNlpBV2RneDlQRTIyVmY4QlM2YV9JR041QjFfcjUw",
  accept: "application/json",
  origin: "https://www.overstappen.nl",
  referer: "https://www.overstappen.nl/",
  "user-agent": UA,
};

async function get(path) {
  const res = await fetch(API + path, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

// demand[0].total = all-in tariff incl. VAT + energiebelasting; items.*.total = delivery only.
function tariffRow(node) {
  const row = node?.demand?.find((r) => r.isUsed === "true") ?? node?.demand?.[0];
  if (!row) return {};
  return {
    allin: row.total ?? null,
    levering: row.items?.electricityIncVat?.total ?? row.items?.gasIncVat?.total ?? null,
  };
}

const CONTRACT_TYPES = { 1: "Vast", 2: "Variabel", 3: "Dynamisch" };

export async function fetchOffers(input) {
  const addr = await get(`/postcode/${input.postcode}/${input.huisnr}`);
  const address = addr.data?.[0];
  if (!address) throw new Error(`No address found for ${input.postcode} ${input.huisnr}`);

  const q = new URLSearchParams({
    electricityusagehigh: input.normaal,
    electricityusagelow: input.dal,
    gasusage: input.gas,
    postcode: input.postcode,
    housenumber: input.huisnr,
    housenumberaddition: "",
    street: address.street,
    city: address.city,
    currentprovider: "-1", // "Weet ik niet/niet van toepassing"
    electricitysupplyhigh: input.terugNormaal,
    electricitysupplylow: input.terugDal,
    customertype: "consumer",
    tariff: "",
    sustainable: "",
    smartmeter: input.teruglevering > 0 ? 1 : 0,
    supplytype: "supply",
    withsavings: 1,
    pricesexcludingtax: "false",
    hideunavailableproducts: "false",
    electricitycapacity: 325,
    gascapacity: 1,
    limit: 100,
    doublemeter: "true",
    applyEnergyCeiling: 0,
    solarPanelAmount: input.panelen,
  });
  const result = await get(`/energy/comparisons?${q}`);
  const list = result.data;
  if (!Array.isArray(list) || !list.length) throw new Error("No offers returned");

  return list.map((p) => {
    const el = tariffRow(p.price?.breakdown?.tariffs?.electricity?.high ?? p.price?.breakdown?.tariffs?.electricity?.single);
    const elLow = tariffRow(p.price?.breakdown?.tariffs?.electricity?.low);
    const gas = tariffRow(p.price?.breakdown?.tariffs?.gas?.single);
    return makeRecord("overstappen", input, {
      leverancier: p.provider?.name,
      product: p.name,
      contractType: CONTRACT_TYPES[p.contract_type] ?? String(p.contract_type),
      looptijdMaanden: p.contract_type === 1 ? p.filters?.contractDuration || null : null, // already in months
      prijsPerMaand: round(p.price?.month?.total, 2),
      prijsPerJaar: round(p.price?.year?.total, 2),
      prijsPerJaarExclKorting:
        p.price?.year?.total != null ? round(p.price.year.total + (p.price?.year?.discountIncluded || 0), 2) : null,
      korting: p.price?.year?.discountIncluded || null,
      tariefStroomNormaal: el.allin,
      tariefStroomDal: elLow.allin ?? el.allin,
      tariefGas: gas.allin,
      tariefStroomNormaalLevering: el.levering,
      tariefStroomDalLevering: elLow.levering ?? el.levering,
      tariefGasLevering: gas.levering,
      rating: p.rating?.score || null,
      duurzaamheidsScore: p.sustainabilityScore || null,
      labels: (p.featured?.labels ?? []).map((l) => l.label ?? l).join(" | ") || null,
      bronOfferId: String(p.id),
    });
  });
}

const input = parseCli(process.argv, "overstappen-client.mjs");
fetchOffers(input)
  .then((records) => output(sortRecords(filterRecords(records, input)), input))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
