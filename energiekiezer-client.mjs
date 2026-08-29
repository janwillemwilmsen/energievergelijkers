#!/usr/bin/env node
// Standalone EnergieKiezer.nl comparison client — derived from a recorded HAR (2026-08-27).
//
// EnergieKiezer (from the ZorgKiezer makers) has a clean, unauthenticated JSON API:
//   GET  https://api.energiekiezer.nl/api/v1/address?postalCode=..&houseNumber=..   -> address check
//   POST https://api.energiekiezer.nl/api/v1/search                                 -> offers
// No cookies, tokens, or session. Filters are arrays in the POST body
// (contractType: fixed/variable/dynamic, contractDuration: months12/24/36).
//
// Usage: node energiekiezer-client.mjs <postcode> <huisnr> [--normaal 2500] [--dal 750] [--gas 500]
//                                      [--contract vast|variabel|dynamisch|alle] [--looptijd 1|2|3|alle] [--meter single|double|smart] [--json]

const API = "https://api.energiekiezer.nl/api/v1";

const HEADERS = {
  "content-type": "application/json",
  "accept": "application/json",
  "origin": "https://www.energiekiezer.nl",
  "referer": "https://www.energiekiezer.nl/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
};

const CONTRACT_MAP = { vast: ["fixed"], variabel: ["variable"], dynamisch: ["dynamic"], alle: [] };
const LOOPTIJD_MAP = { "1": ["months12"], "2": ["months24"], "3": ["months36"], alle: [] };
const TYPE_NL = { fixed: "Vast", variable: "Variabel", dynamic: "Dynamisch" };

export async function compare(postcode, huisnr, { normaal, dal, gas } = {}, { contract = "alle", looptijd = "alle", meter = "smart" } = {}) {
  if (!CONTRACT_MAP[contract])
    throw new Error(`Unknown --contract "${contract}" (use: ${Object.keys(CONTRACT_MAP).join(", ")})`);
  if (!LOOPTIJD_MAP[looptijd])
    throw new Error(`Unknown --looptijd "${looptijd}" (use: ${Object.keys(LOOPTIJD_MAP).join(", ")})`);
  if (!["single", "double", "smart"].includes(meter))
    throw new Error(`Unknown --meter "${meter}" (use: single, double, smart)`);
  const pc = postcode.replace(/\s+/g, "").toUpperCase();
  const pcSpaced = pc.slice(0, 4) + " " + pc.slice(4);

  // 1. Address validation.
  const aRes = await fetch(
    `${API}/address?postalCode=${encodeURIComponent(pcSpaced)}&houseNumber=${huisnr}&withPossibleAdditions=true`,
    { headers: HEADERS }
  );
  if (!aRes.ok) throw new Error(`address lookup -> ${aRes.status}`);
  const addr = await aRes.json();
  if (!addr || (Array.isArray(addr) && !addr.length) || addr.length === 0)
    throw new Error(`No address found for ${postcode} ${huisnr}`);

  // 2. The comparison. meterType "smart" is required for dynamic contracts to
  //    appear (valid values per the API: single, double, smart); the normaal/dal
  //    split via consumptionOffPeak is honored (verified against echoed volumes).
  const body = {
    postalCode: pcSpaced,
    houseNumber: String(huisnr),
    meterType: meter,
    consumption: dal > 0 ? { electricity: normaal, electricityOffPeak: dal, gas } : { electricity: normaal, gas },
    production: { electricity: 0, electricityOffPeak: 0 },
    electricityType: [],
    gasType: [],
    costInterval: "month",
    contractType: CONTRACT_MAP[contract],
    contractDuration: LOOPTIJD_MAP[looptijd],
    providers: [],
    pagination: { page: 1, pageSize: 100, sort: "priceQuality" },
    mustBeLogged: true,
    useElectricity: true,
    useGas: true,
    onlyAvailableForSignup: false,
    currentContract: { selection: "notSelected" },
  };
  const res = await fetch(`${API}/search`, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`POST /search -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  if (!data.results?.length) throw new Error("No offers returned");

  const offers = data.results.map((p) => ({
    rank: p.rank,
    provider: p.provider?.name,
    contractType: TYPE_NL[p.product?.contractType] ?? p.product?.contractType,
    durationMonths: p.product?.monthsFixed || null,
    monthlyTotal: p.costs?.amount ?? null,
    yearlyTotal: p.costOverview?.year?.total ?? null,
    discount: p.costOverview?.year?.discount ? -p.costOverview.year.discount : null,
    rating: p.provider?.reviews?.average ?? null,
    reviews: p.provider?.reviews?.count ?? null,
    priceQuality: p.priceQuality ? Math.round(p.priceQuality * 10) / 10 : null,
    sustainability: { electricity: p.product?.sustainabilityElectricity, gas: p.product?.sustainabilityGas },
    tariffs: {
      kwhNormaal: p.rates?.electricity?.ratePeak ?? p.rates?.electricity?.rateSingle ?? null,
      kwhDal: p.rates?.electricity?.rateOffPeak ?? null,
      m3Gas: p.rates?.gas?.rate ?? null,
      vasteLeveringStroomPerMaand: p.rates?.electricity?.delivery ?? null,
      vasteLeveringGasPerMaand: p.rates?.gas?.delivery ?? null,
      terugleverPerKwh: p.rates?.electricity?.rateProductionSingle1 ?? null,
    },
    volumes: p.volumes,
  }));
  offers.sort((a, b) => (a.yearlyTotal ?? 1e9) - (b.yearlyTotal ?? 1e9));
  return { meta: data.meta, offers };
}

// ---- CLI ----
const args = process.argv.slice(2);
if (args.length >= 2) {
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
  const looptijd = flag("looptijd", "alle");
  const meter = flag("meter", "smart");

  compare(args[0], args[1], usage, { contract, looptijd, meter })
    .then(({ meta, offers }) => {
      if (args.includes("--json")) {
        console.log(JSON.stringify(offers, null, 2));
        return;
      }
      console.log(
        `Vergelijking: ${args[0]} ${args[1]} — ${usage.normaal}/${usage.dal} kWh, ${usage.gas} m3 gas — contract: ${contract}, looptijd: ${looptijd}`
      );
      console.log(`${offers.length} van ${meta.results} aanbiedingen (gesorteerd op jaarkosten incl. korting):\n`);
      for (const o of offers) {
        const dur = o.durationMonths ? `${o.durationMonths} mnd` : "onbepaald";
        console.log(`- ${o.provider} (${o.contractType}, ${dur})`);
        console.log(
          `    per maand: €${o.monthlyTotal?.toFixed(2)}  |  per jaar: €${o.yearlyTotal?.toFixed(2)}` +
            (o.discount ? `  |  korting: €${o.discount}` : "") +
            (o.rating ? `  |  cijfer: ${o.rating} (${o.reviews})` : "")
        );
        const t = o.tariffs;
        if (t.kwhNormaal)
          console.log(
            `    tarieven : normaal €${t.kwhNormaal.toFixed(4)}/kWh` +
              (t.kwhDal ? `, dal €${t.kwhDal.toFixed(4)}/kWh` : "") +
              (t.m3Gas ? `, gas €${t.m3Gas.toFixed(4)}/m3` : "") +
              `, vast €${t.vasteLeveringStroomPerMaand?.toFixed(2)}+€${t.vasteLeveringGasPerMaand?.toFixed(2)}/mnd`
          );
      }
    })
    .catch((e) => {
      console.error("FAILED:", e.message);
      process.exit(1);
    });
} else {
  console.log(
    "Usage: node energiekiezer-client.mjs <postcode> <huisnr> [--normaal N] [--dal N] [--gas N] [--contract vast|variabel|dynamisch|alle] [--looptijd 1|2|3|alle] [--json]"
  );
}
