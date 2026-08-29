#!/usr/bin/env node
// Standalone Overstappen.nl energy comparison client — derived from a recorded HAR (2026-08-27).
//
// Simplest of the bunch: the funnel SPA calls a public REST API (api.overstappen.nl)
// authenticated with a static HTTP Basic credential that ships in the frontend bundle
// ("os_nl_cors"). No cookies, no session, no CSRF — two GETs and done:
//   1. GET /postcode/{postcode}/{huisnr}   -> street + city (required params for step 2)
//   2. GET /energy/comparisons?...         -> all offers with full price breakdowns
//
// Usage: node overstappen-client.mjs <postcode> <huisnr> [--normaal 2500] [--dal 750] [--gas 500]
//                                    [--contract vast|variabel|dynamisch|alle] [--json]

const API = "https://api.overstappen.nl";

// Base64 of "os_nl_cors:z5@vAkNerP6ZAWdgx9PE22Vf8BS6a_IGN5B1_r50" — the public
// frontend credential, recorded from the site's own requests.
const HEADERS = {
  "authorization": "Basic b3NfbmxfY29yczp6NUB2QWtOZXJQNlpBV2RneDlQRTIyVmY4QlM2YV9JR041QjFfcjUw",
  "accept": "application/json",
  "origin": "https://www.overstappen.nl",
  "referer": "https://www.overstappen.nl/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
};

async function get(path) {
  const res = await fetch(API + path, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const CONTRACT_TYPES = { 1: "Vast", 2: "Variabel", 3: "Dynamisch" };
const CONTRACT_FILTERS = {
  vast: (o) => o.contract_type === 1,
  variabel: (o) => o.contract_type === 2,
  dynamisch: (o) => o.contract_type === 3,
  alle: () => true,
};

// demand[0].total = all-in tariff incl. VAT + energy tax; items.*.total = delivery only.
function tariffRow(node) {
  const row = node?.demand?.find((r) => r.isUsed === "true") ?? node?.demand?.[0];
  if (!row) return null;
  const levering = row.items?.electricityIncVat?.total ?? row.items?.gasIncVat?.total ?? null;
  return { totaalInclBelasting: row.total ?? null, levering, periode: row.period || null };
}

export async function compare(postcode, huisnr, { normaal, dal, gas } = {}, { contract = "alle" } = {}) {
  if (!CONTRACT_FILTERS[contract])
    throw new Error(`Unknown --contract "${contract}" (use: ${Object.keys(CONTRACT_FILTERS).join(", ")})`);
  const pc = postcode.replace(/\s+/g, "").toUpperCase();

  // 1. Address (street + city are required inputs for the comparison call).
  const addr = await get(`/postcode/${pc}/${huisnr}`);
  const address = addr.data?.[0];
  if (!address) throw new Error(`No address found for ${postcode} ${huisnr}`);

  // 2. The comparison. Parameters recorded from the funnel.
  const q = new URLSearchParams({
    electricityusagehigh: normaal,
    electricityusagelow: dal,
    gasusage: gas,
    postcode: pc,
    housenumber: huisnr,
    housenumberaddition: "",
    street: address.street,
    city: address.city,
    currentprovider: "-1", // "Weet ik niet/niet van toepassing"
    electricitysupplyhigh: 0,
    electricitysupplylow: 0,
    customertype: "consumer",
    tariff: "",
    sustainable: "",
    smartmeter: 0,
    supplytype: "supply",
    withsavings: 1,
    pricesexcludingtax: "false",
    hideunavailableproducts: "false",
    electricitycapacity: 325,
    gascapacity: 1,
    limit: 100,
    doublemeter: "true",
    applyEnergyCeiling: 0,
    solarPanelAmount: 0,
  });
  const result = await get(`/energy/comparisons?${q}`);
  const list = result.data;
  if (!Array.isArray(list) || !list.length) throw new Error("No offers returned");

  const offers = list.map((p) => ({
    id: p.id,
    provider: p.provider?.name,
    product: p.name,
    contractType: CONTRACT_TYPES[p.contract_type] ?? String(p.contract_type),
    contract_type: p.contract_type,
    durationMonths: p.filters?.contractDuration || null, // 0 = onbepaalde tijd
    monthlyTotal: p.price?.month?.total ?? null,
    yearlyTotal: p.price?.year?.total ?? null,
    discount: p.price?.year?.discountIncluded || null,
    rating: p.rating?.score || null,
    sustainabilityScore: p.sustainabilityScore || null,
    tariffs: {
      kwhNormaal: tariffRow(p.price?.breakdown?.tariffs?.electricity?.high ?? p.price?.breakdown?.tariffs?.electricity?.single),
      kwhDal: tariffRow(p.price?.breakdown?.tariffs?.electricity?.low),
      m3Gas: tariffRow(p.price?.breakdown?.tariffs?.gas?.single),
    },
  }));
  const filtered = offers.filter(CONTRACT_FILTERS[contract]);
  filtered.sort((a, b) => (a.yearlyTotal ?? 1e9) - (b.yearlyTotal ?? 1e9));
  return { address, offers: filtered };
}

// ---- CLI (only when this file is the process entrypoint) ----
const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop());
const args = process.argv.slice(2);
if (isMain && args.length >= 2) {
  const flag = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const usage = {
    normaal: Number(flag("normaal", 2500)),
    dal: Number(flag("dal", 750)),
    gas: Number(flag("gas", 500)),
  };
  const contract = flag("contract", "alle");

  compare(args[0], args[1], usage, { contract })
    .then(({ address, offers }) => {
      if (args.includes("--json")) {
        console.log(JSON.stringify(offers, null, 2));
        return;
      }
      console.log(`Adres   : ${address.street} ${address.streetnumber}, ${address.city}`);
      console.log(`Verbruik: ${usage.normaal}/${usage.dal} kWh, ${usage.gas} m3 gas — contract: ${contract}`);
      console.log(`${offers.length} aanbiedingen (gesorteerd op jaarkosten):\n`);
      for (const o of offers) {
        const dur = o.durationMonths ? `${o.durationMonths} mnd` : "onbepaald";
        console.log(`- ${o.provider} — ${o.product} (${o.contractType}, ${dur})`);
        console.log(
          `    per maand: €${o.monthlyTotal?.toFixed(2)}  |  per jaar: €${o.yearlyTotal?.toFixed(2)}` +
            (o.discount ? `  |  korting: €${o.discount}` : "") +
            (o.rating ? `  |  cijfer: ${o.rating}` : "")
        );
        const t = o.tariffs;
        if (t.kwhNormaal?.totaalInclBelasting)
          console.log(
            `    tarieven : normaal €${t.kwhNormaal.totaalInclBelasting.toFixed(4)}/kWh` +
              (t.kwhDal?.totaalInclBelasting ? `, dal €${t.kwhDal.totaalInclBelasting.toFixed(4)}/kWh` : "") +
              (t.m3Gas?.totaalInclBelasting ? `, gas €${t.m3Gas.totaalInclBelasting.toFixed(4)}/m3` : "") +
              ` (incl. btw en belastingen)`
          );
      }
    })
    .catch((e) => {
      console.error("FAILED:", e.message);
      process.exit(1);
    });
} else if (isMain) {
  console.log(
    "Usage: node overstappen-client.mjs <postcode> <huisnr> [--normaal N] [--dal N] [--gas N] [--contract vast|variabel|dynamisch|alle] [--json]"
  );
}
