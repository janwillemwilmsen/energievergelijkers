#!/usr/bin/env node
// Independer.nl energy comparison client — derived from a recorded HAR (2026-08-26).
// JSON API with ASP.NET Core antiforgery (XSRF-TOKEN cookie echoed as header).
// The API returns one contractKind per call, so "alle" fetches Vast + Variabel +
// Dynamisch and merges. Alleen stroom via contractSoort "Elektra"; teruglevering
// via elektriciteitverbruikDubbelMeter.opwekkingPiek/-Dal (recorded 2026-08-31).

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, round } from "./energy-lib.mjs";

const BASE = "https://www.independer.nl";
const UA_HEADERS = {
  "user-agent": UA,
  accept: "application/json, text/plain, */*",
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

export async function fetchOffers(input) {
  const page = await fetch(BASE + "/energie/intro.aspx", { headers: UA_HEADERS });
  storeCookies(page);
  if (!jar.has("XSRF-TOKEN")) throw new Error("No XSRF-TOKEN cookie received (flow changed?)");

  const pcSpaced = input.postcode.slice(0, 4) + " " + input.postcode.slice(4);
  const addr = await api(
    "GET",
    `/api/address/getaddressdata?zipcode=${encodeURIComponent(pcSpaced)}&housenumber=${input.huisnr}`
  );
  if (!addr?.isValidCombination || !addr.addresses?.length)
    throw new Error(`No address found for ${input.postcode} ${input.huisnr}`);

  // dal = 0 must use single-meter mode: the API returns HTTP 500 on
  // elektriciteitverbruikDubbelMeter with verbruikDal 0 (observed 2026-09-02).
  const enkeleMeter = input.dal === 0;
  const verbruikElektra = enkeleMeter
    ? { verbruik: input.normaal }
    : { verbruikDal: input.dal, verbruikPiek: input.normaal };
  if (input.teruglevering > 0) {
    if (enkeleMeter) verbruikElektra.opwekking = input.teruglevering;
    else {
      verbruikElektra.opwekkingDal = input.terugDal;
      verbruikElektra.opwekkingPiek = input.terugNormaal;
    }
  }
  const mkBody = (contractKind) => ({
    contractWensen: {
      contractSoort: input.gas > 0 ? "ElektraEnGas" : "Elektra",
      doelgroep: 2,
      extraBiedtDiensten: false,
      extraHelptMetBesparen: false,
      extraHelptMetInzichtInGebruik: false,
      hasSmartMeter: true,
      stroomGroenheid: 1,
      contractKind,
      huidigeLeverancier: 9999, // "weet ik niet"
    },
    adres: { postcode: pcSpaced, huisnummer: Number(input.huisnr), huisnummertoevoeging: "" },
    verbruik: {
      gasverbruik: input.gas,
      meterSoort: enkeleMeter ? 1 : 2,
      ...(enkeleMeter
        ? { elektriciteitverbruikEnkelMeter: verbruikElektra }
        : { elektriciteitverbruikDubbelMeter: verbruikElektra }),
    },
    creditDiscount: true,
  });

  // One call per contract kind; "alle" needs all three to reach the maximum.
  const kinds =
    input.contract === "vast" ? ["Vast"]
    : input.contract === "variabel" ? ["Variabel"]
    : input.contract === "dynamisch" ? ["Dynamisch"]
    : ["Vast", "Variabel", "Dynamisch"];

  const mij = await api("GET", "/api/energie/zoekresultaat/getmaatschappijen");
  const names = new Map((mij.maatschappijen ?? []).map((m) => [m.id, m.naam]));

  const records = [];
  for (const kind of kinds) {
    let result;
    try {
      result = await api("POST", "/api/energie/zoekresultaat/getzoekresultaat", mkBody(kind));
    } catch { continue; }
    const labels = new Map();
    for (const fp of result.featuredProducts?.labeledProducts ?? [])
      labels.set(Number(fp.productId), (fp.labels ?? []).map((l) => l.shortText).join(" | "));
    for (const p of result.products ?? []) {
      const m = p.contractTermAmounts?.monthlyTermAmounts;
      const y = p.contractTermAmounts?.yearlyTermAmounts;
      records.push(
        makeRecord("independer", input, {
          leverancier: names.get(p.maatschappijId) ?? `maatschappij ${p.maatschappijId}`,
          product: p.naam,
          contractType: kind,
          looptijdMaanden: kind === "Vast" ? p.contractDurationMonths || null : null,
          prijsPerMaand: round(m?.termInclDiscountInclTaxReduction, 2),
          prijsPerJaar: round(y?.termInclDiscountInclTaxReduction, 2),
          prijsPerJaarExclKorting: round(y?.termExclDiscountInclTaxReduction, 2),
          korting: p.discountAmount || null,
          tariefStroomNormaal: p.prijsdetails?.stroomLeveringstariefHoog || p.prijsdetails?.stroomLeveringstarief || null,
          tariefStroomDal: p.prijsdetails?.stroomLeveringstariefLaag || null,
          tariefGas: p.prijsdetails?.gasLeveringstarief || null,
          vasteLeveringskostenStroomPerJaar: p.prijsdetails?.stroomVasteLeveringskosten
            ? round(p.prijsdetails.stroomVasteLeveringskosten * 12, 2)
            : null,
          vasteLeveringskostenGasPerJaar: p.prijsdetails?.gasVasteLeveringskosten
            ? round(p.prijsdetails.gasVasteLeveringskosten * 12, 2)
            : null,
          terugleverVergoedingPerKwh: p.prijsdetails?.stroomTerugleververgoeding || null,
          rating: p.scoreOverview?.hasEnoughReviewsToShow ? p.scoreOverview.averageScore : null,
          aantalReviews: p.scoreOverview?.numberOfReviews || null,
          duurzaamheidsScore: null,
          labels: labels.get(p.id) || null,
          bronOfferId: String(p.id),
        })
      );
    }
  }
  if (!records.length) throw new Error("No offers returned");
  return records;
}

const input = parseCli(process.argv, "independer-client.mjs");
fetchOffers(input)
  .then((records) => output(sortRecords(filterRecords(records, input)), input))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
