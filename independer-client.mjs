#!/usr/bin/env node
// Standalone Independer.nl energy comparison client — derived from a recorded HAR (2026-08-26).
// Independer is a clean JSON API behind ASP.NET Core antiforgery:
//   1. GET  /energie/intro.aspx                          -> cookies: XSRF-TOKEN (+ SESSION-XSRF-TOKEN, StateID)
//   2. GET  /api/address/getaddressdata                  -> validate/resolve the address
//   3. POST /api/energie/zoekresultaat/getzoekresultaat  -> all offers, JSON in/out
//      (requires header X-XSRF-TOKEN = value of the XSRF-TOKEN cookie)
//   4. GET  /api/energie/zoekresultaat/getmaatschappijen -> maatschappijId -> supplier name
//
// Usage: node independer-client.mjs <postcode> <huisnr> [--normaal 2500] [--dal 750] [--gas 500]
//                                   [--contract Vast|Variabel|Dynamisch] [--json]

const BASE = "https://www.independer.nl";

const UA_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "accept": "application/json, text/plain, */*",
  "accept-language": "nl-NL,nl;q=0.9",
};

const jar = new Map();
function storeCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), decodeURIComponent(pair.slice(eq + 1).trim()));
  }
}
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; ");

async function api(method, path, body) {
  const headers = { ...UA_HEADERS, cookie: cookieHeader(), referer: BASE + "/energie/invoer/wensen" };
  if (jar.has("XSRF-TOKEN")) headers["x-xsrf-token"] = jar.get("XSRF-TOKEN");
  if (body) headers["content-type"] = "application/json";
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  storeCookies(res);
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const CONTRACT_KINDS = ["Vast", "Variabel", "Dynamisch"];

export async function compare(postcode, huisnr, { normaal, dal, gas } = {}, { contract = "Vast" } = {}) {
  if (!CONTRACT_KINDS.includes(contract))
    throw new Error(`Unknown --contract "${contract}" (use: ${CONTRACT_KINDS.join(", ")})`);

  // 1. Antiforgery cookies come with the first page load.
  const page = await fetch(BASE + "/energie/intro.aspx", { headers: UA_HEADERS });
  storeCookies(page);
  if (!jar.has("XSRF-TOKEN")) throw new Error("No XSRF-TOKEN cookie received (flow changed?)");

  // 2. Resolve the address (also validates the postcode/number combination).
  const pc = postcode.replace(/\s+/g, "").toUpperCase();
  const pcSpaced = pc.slice(0, 4) + " " + pc.slice(4);
  const addr = await api(
    "GET",
    `/api/address/getaddressdata?zipcode=${encodeURIComponent(pcSpaced)}&housenumber=${huisnr}`
  );
  if (!addr?.isValidCombination || !addr.addresses?.length)
    throw new Error(`No address found for ${postcode} ${huisnr}`);
  const address = addr.addresses[0];

  // 3. The comparison itself. Body recorded from the "wensen" form submit;
  //    huidigeLeverancier 9999 = "weet ik niet", doelgroep 2 = consument.
  const result = await api("POST", "/api/energie/zoekresultaat/getzoekresultaat", {
    contractWensen: {
      contractSoort: "ElektraEnGas",
      doelgroep: 2,
      extraBiedtDiensten: false,
      extraHelptMetBesparen: false,
      extraHelptMetInzichtInGebruik: false,
      hasSmartMeter: true,
      stroomGroenheid: 1,
      contractKind: contract,
      huidigeLeverancier: 9999,
    },
    adres: { postcode: pcSpaced, huisnummer: Number(huisnr), huisnummertoevoeging: "" },
    verbruik: {
      gasverbruik: gas,
      meterSoort: 2, // dubbele meter
      elektriciteitverbruikDubbelMeter: { verbruikDal: dal, verbruikPiek: normaal },
    },
    creditDiscount: true,
  });

  // 4. Supplier names.
  const mij = await api("GET", "/api/energie/zoekresultaat/getmaatschappijen");
  const names = new Map((mij.maatschappijen ?? []).map((m) => [m.id, m.naam]));

  // Featured labels ("Goedkoopste vaste contract", ...) by productId.
  const labels = new Map();
  for (const fp of result.featuredProducts?.labeledProducts ?? [])
    labels.set(Number(fp.productId), fp.labels?.map((l) => l.shortText) ?? []);

  const offers = (result.products ?? []).map((p) => ({
    id: p.id,
    provider: names.get(p.maatschappijId) ?? `maatschappij ${p.maatschappijId}`,
    product: p.naam,
    looptijd: p.looptijdText,
    contractKind: p.contractKind,
    monthlyInclDiscount: p.contractTermAmounts?.monthlyTermAmounts?.termInclDiscountInclTaxReduction ?? null,
    monthlyExclDiscount: p.contractTermAmounts?.monthlyTermAmounts?.termExclDiscountInclTaxReduction ?? null,
    yearlyInclDiscount: p.contractTermAmounts?.yearlyTermAmounts?.termInclDiscountInclTaxReduction ?? null,
    discount: p.discountAmount || null,
    rating: p.scoreOverview?.hasEnoughReviewsToShow ? p.scoreOverview.averageScore : null,
    reviews: p.scoreOverview?.numberOfReviews || null,
    labels: labels.get(p.id) ?? [],
    tariffs: {
      kwhNormaal: p.prijsdetails?.stroomLeveringstariefHoog ?? null,
      kwhDal: p.prijsdetails?.stroomLeveringstariefLaag ?? null,
      m3Gas: p.prijsdetails?.gasLeveringstarief ?? null,
      vasteLeveringStroomPerMaand: p.prijsdetails?.stroomVasteLeveringskosten ?? null,
      vasteLeveringGasPerMaand: p.prijsdetails?.gasVasteLeveringskosten ?? null,
      terugleverVergoedingPerKwh: p.prijsdetails?.stroomTerugleververgoeding ?? null,
    },
  }));
  offers.sort((a, b) => (a.monthlyInclDiscount ?? 1e9) - (b.monthlyInclDiscount ?? 1e9));
  return { address: { ...address, postcode: pcSpaced }, offers };
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
  const contract = flag("contract", "Vast");

  compare(args[0], args[1], usage, { contract })
    .then(({ address, offers }) => {
      if (args.includes("--json")) {
        console.log(JSON.stringify(offers, null, 2));
        return;
      }
      console.log(`Adres  : ${address.street} ${address.housenumber}, ${address.city}`);
      console.log(`Verbruik: ${usage.normaal}/${usage.dal} kWh, ${usage.gas} m3 gas — contract: ${contract}`);
      console.log(`${offers.length} aanbiedingen (gesorteerd op maandbedrag incl. korting):\n`);
      for (const o of offers) {
        const tag = o.labels.length ? `  [${o.labels.join(", ")}]` : "";
        console.log(`- ${o.provider} — ${o.product} (${o.looptijd})${tag}`);
        console.log(
          `    per maand: €${o.monthlyInclDiscount?.toFixed(2)} incl. korting (€${o.monthlyExclDiscount?.toFixed(2)} excl.)` +
            (o.discount ? `  |  korting: €${o.discount.toFixed(2)}` : "") +
            (o.rating ? `  |  cijfer: ${o.rating} (${o.reviews})` : "")
        );
        const t = o.tariffs;
        console.log(
          `    tarieven : normaal €${t.kwhNormaal?.toFixed(4)}/kWh, dal €${t.kwhDal?.toFixed(4)}/kWh, gas €${t.m3Gas?.toFixed(4)}/m3, vast €${t.vasteLeveringStroomPerMaand?.toFixed(2)}+€${t.vasteLeveringGasPerMaand?.toFixed(2)}/mnd`
        );
      }
    })
    .catch((e) => {
      console.error("FAILED:", e.message);
      process.exit(1);
    });
} else if (isMain) {
  console.log(
    "Usage: node independer-client.mjs <postcode> <huisnr> [--normaal N] [--dal N] [--gas N] [--contract Vast|Variabel|Dynamisch] [--json]"
  );
}
