#!/usr/bin/env node
// Standalone Essent.nl offer client — derived from a recorded HAR (2026-08-25).
// Reproduces the "Bereken mijn termijnbedrag" funnel without a browser.
//
// Usage: node essent-client.mjs <postcode> <housenumber> [--normaal 2500] [--dal 1500] [--gas 800] [--json]

const BASE = "https://www.essent.nl";

// CloudFront blocks non-browser fingerprints; these headers match the recorded session.
const HEADERS = {
  "accept": "application/json",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "referer": "https://www.essent.nl/",
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

// 1. Resolve postcode + house number to a street address.
export async function lookupAddress(postcode, houseNumber) {
  const q = new URLSearchParams({ postcode, house_number: houseNumber });
  const list = await api("GET", `/api/public/contracts-middleware/contracts/addresses/v2?${q}`);
  if (!list?.length) throw new Error(`No address found for ${postcode} ${houseNumber}`);
  return list[0]; // {postcode, house_number, street, city, country}
}

// 2. Start a funnel flow; everything after hangs off the returned flow_id.
export async function initiateFlow(address) {
  const r = await api("PUT", "/api/public/bac/initiate-flow", {
    headers: { Accept: "application/json" },
    params: {
      extend_time_to_live: false,
      house_number: address.house_number,
      postcode: address.postcode,
      city: address.city,
      street: address.street,
      customer_segment: "household",
    },
  });
  return r.meta_data.flow_id;
}

// 3. Grid connections (EANs) registered at the address.
export async function getInstallations(flowId) {
  const r = await api(
    "GET",
    `/api/public/contracting/newcustomer/installationdetails/v2?flow_id=${flowId}`
  );
  return r.payload; // [{energy_type, installations:[{connect_ean,...}]}]
}

// 4. Confirm which EANs the offer applies to.
export async function selectEans(flowId, eans) {
  await api("PUT", "/api/public/contracting/newcustomer/eandetails/v2", {
    meta_data: { flow_id: flowId },
    payload: [{ connect_ean: eans }],
  });
}

// 5. Store the annual consumption the user entered.
export async function setConsumption(flowId, { normaal, dal, gas }) {
  await api("PUT", "/api/public/contracting/newcustomer/consumption/v2", {
    meta_data: { flow_id: flowId },
    payload: [
      {
        energy_type: "electricity",
        standard_annual_usages: [
          { direction_tariff: "supply_low", reading: dal },
          { direction_tariff: "supply_normal", reading: normaal },
          { direction_tariff: "return_supply_low", reading: 0 },
          { direction_tariff: "return_supply_normal", reading: 0 },
        ],
      },
      { energy_type: "gas", standard_annual_usages: [{ direction_tariff: "supply_normal", reading: gas }] },
    ],
  });
}

// 6. The actual offer calculation.
export async function getOffers(flowId, address, { normaal, dal, gas }) {
  const q = new URLSearchParams({
    flow_id: flowId,
    offer_set: "Basis Offerset Essent",
    customer_segment: "household",
    postcode: address.postcode,
    house_number: address.house_number,
    house_number_extension: "",
    electricity: normaal,
    electricity_low: dal,
    electricity_return: 0,
    gas,
    duration_filter: "all_durations",
  });
  return api("GET", `/api/public/cplusactivation/offers/v1?${q}`);
}

export async function calculateOffers(postcode, houseNumber, usage) {
  const address = await lookupAddress(postcode, houseNumber);
  const flowId = await initiateFlow(address);
  const installations = await getInstallations(flowId);
  const eans = installations.flatMap((g) => g.installations.map((i) => i.connect_ean));
  await selectEans(flowId, eans);
  await setConsumption(flowId, usage);
  const offers = await getOffers(flowId, address, usage);
  return { address, flowId, eans, offers };
}

// ---- CLI (only when this file is the process entrypoint) ----
const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
const args = process.argv.slice(2);
if (isMain && args.length >= 2) {
  const flag = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? Number(args[i + 1]) : dflt;
  };
  const usage = { normaal: flag("normaal", 2500), dal: flag("dal", 1500), gas: flag("gas", 800) };
  const asJson = args.includes("--json");

  calculateOffers(args[0], args[1], usage)
    .then(({ address, flowId, offers }) => {
      if (asJson) {
        console.log(JSON.stringify(offers, null, 2));
        return;
      }
      console.log(`Address : ${address.street} ${address.house_number}, ${address.city}`);
      console.log(`Flow    : ${flowId}`);
      console.log(`Usage   : ${usage.normaal} kWh normaal / ${usage.dal} kWh dal / ${usage.gas} m3 gas\n`);
      for (const o of offers.offers ?? []) {
        console.log(`- ${o.productTitle} (${o.durationTitle ?? o.duration})`);
        console.log(`    aanbodprijs   : €${Math.round(o.expectedMonthlyAmount)}/mnd (na korting)`);
        console.log(`    termijnbedrag : €${o.budgetBillAmount}/mnd`);
        console.log(`    jaarkosten    : €${o.expectedYearlyAmount}`);
        if (o.incentiveTitle) console.log(`    actie         : ${o.incentiveTitle}`);
      }
    })
    .catch((e) => {
      console.error("FAILED:", e.message);
      process.exit(1);
    });
} else if (isMain) {
  console.log("Usage: node essent-client.mjs <postcode> <housenumber> [--normaal N] [--dal N] [--gas N] [--json]");
}


//  node essent-client.mjs <postcode> <huisnummer> [--normaal N] [--dal N] [--gas N] [--json] — --json 
// node essent-client.mjs 3511LX 10 --normaal 1800 --dal 1200 --gas 600 --json

