#!/usr/bin/env node
// Gaslicht.com comparison client — derived from a recorded HAR (2026-08-26).
// ASP.NET form flow + HTML scraping (no JSON API):
//   GET /  -> cookies + __RequestVerificationToken; POST /energievergelijker/start;
//   GET /energievergelijken/resultaten?partial=true&ContractType=...&take=100 (XHR)
//   GET <product>/price-details (XHR fragment) for the tariffs per offer.
// Fetches ALL contract types (Vast 1/2+ jaar, Dynamisch, Combinatie, Variabel);
// filtering happens uniformly in energy-lib. Supports teruglevering
// (terugstroomhoog/-laag + solar-panels) and alleen stroom (isNoGas).

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, num, round } from "./energy-lib.mjs";

const BASE = "https://www.gaslicht.com";
const UA_HEADERS = {
  "user-agent": UA,
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "nl-NL,nl;q=0.9",
};
// All ContractType values from the results-page filter form = the site's maximum.
const ALL_CONTRACT_TYPES = "All,Vast,Vast1Jaar,Vast2JaarOfMeer,Dynamic,DynamicCombination,Variabel";

const jar = new Map();
function storeCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

async function get(path, { xhr = false } = {}) {
  const headers = { ...UA_HEADERS, cookie: cookieHeader() };
  if (xhr) headers["x-requested-with"] = "XMLHttpRequest";
  const res = await fetch(BASE + path, { headers, redirect: "manual" });
  storeCookies(res);
  if (res.status >= 300 && res.status < 400) return get(res.headers.get("location"), { xhr });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.text();
}

function parsePriceDetails(frag) {
  const cell = (row) =>
    frag.match(
      new RegExp(`c-tariff-block__col-tariff c-tariff-block__row-${row}[\\s"][^]*?c-spec zeta">\\s*€\\s*([\\d.,]+)`)
    )?.[1];
  return {
    kwhNormaal: num(cell("electricity")),
    kwhDal: num(cell("electricity-low")),
    m3Gas: num(cell("gas")),
    vastStroomMnd: num(cell("electricity-standing")),
    vastGasMnd: num(cell("gas-standing")),
  };
}

export async function fetchOffers(input) {
  const home = await get("/");
  const token = home.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/)?.[1];
  if (!token) throw new Error("No __RequestVerificationToken found on homepage (layout changed?)");

  const pc = input.postcode;
  const form = new URLSearchParams({
    __RequestVerificationToken: token,
    postal: pc.slice(0, 4) + " " + pc.slice(4),
    houseNr: String(input.huisnr),
    housenrAdditional: "",
    huidigeLeverancier: "", // "Weet ik niet / staat er niet bij / n.v.t."
    inputhelp: "custom",
    typemeter: "double",
    stroomhoogverbruik: String(input.normaal),
    stroomlaagverbruik: String(input.dal),
    terugstroomhoog: input.terugNormaal ? String(input.terugNormaal) : "",
    terugstroomlaag: input.terugDal ? String(input.terugDal) : "",
    gasverbruik: input.gas > 0 ? String(input.gas) : "",
    "solar-panels": input.panelen ? String(input.panelen) : "",
    targetGroup: "Consumer",
    calculateDateTime: "",
    contractEndDate: "",
  });
  if (input.gas === 0) form.set("isNoGas", "true");
  const post = await fetch(BASE + "/energievergelijker/start", {
    method: "POST",
    headers: {
      ...UA_HEADERS,
      cookie: cookieHeader(),
      "content-type": "application/x-www-form-urlencoded",
      origin: BASE,
      referer: BASE + "/",
    },
    body: form,
    redirect: "manual",
  });
  storeCookies(post);
  if (post.status >= 400) throw new Error(`POST /energievergelijker/start -> ${post.status}`);

  await get("/energievergelijken/resultaten"); // establish comparison in session
  const q = new URLSearchParams({ partial: "true", ContractType: ALL_CONTRACT_TYPES, skip: "0", take: "100" });
  const html = await get(`/energievergelijken/resultaten?${q}`, { xhr: true });

  const records = [];
  const seen = new Set();
  for (const block of html.split('class="js-comparison-list-product').slice(1)) {
    const gtmRaw = block.match(/data-js-gtminfo="([^"]+)"/)?.[1];
    if (!gtmRaw) continue;
    const gtm = JSON.parse(gtmRaw.replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
    const p = (gtm.Ecommerce?.Click ?? gtm.Ecommerce?.Detail)?.Products?.[0];
    if (!p || seen.has(p.Id)) continue;
    seen.add(p.Id);

    const monthly = block.match(/Totaal per maand<\/h6>\s*<div[^>]*>\s*([\d.]+)<span[^>]*>,(\d+)<\/span>/);
    // GTM Category is unreliable (dynamic products are filed under "variabel"),
    // so classify on the product name; category only decides vast vs variabel.
    const name = p.Name ?? "";
    const cat = (p.Category ?? "").split("/").pop() ?? "";
    const contractType =
      /dynamisch/i.test(name) && /gas vast|vast gas/i.test(name) ? "Combinatie"
      : /dynamisch/i.test(name) ? "Dynamisch"
      : /variabel/i.test(cat) || /variabel/i.test(name) ? "Variabel"
      : "Vast";

    // Tariff fragment via the card's own product link (tab data-urls misalign).
    const link = block.match(/href="\/energie-vergelijken\/([^/"]+)\/([a-z0-9-]+-\d+)\?/);
    let t = {};
    if (link) {
      try {
        t = parsePriceDetails(await get(`/energievergelijker/energie/${link[1]}/${link[2]}/price-details`, { xhr: true }));
      } catch { /* tariffs stay null */ }
    }

    const provider = block.match(/alt="([^"]+)"[^>]*class="c-comparison-list__provider-logo/)?.[1] ?? p.Brand;
    records.push(
      makeRecord("gaslicht", input, {
        leverancier: p.Brand ?? provider,
        product: p.Name,
        contractType,
        looptijdMaanden: contractType === "Vast" ? p.Dimension11 || null : null,
        prijsPerMaand: monthly ? Number(monthly[1].replace(/\./g, "") + "." + monthly[2]) : round(p.Price / 12, 2),
        prijsPerJaar: round(p.Price, 2),
        prijsPerJaarExclKorting: p.Dimension10 ? round(p.Price + p.Dimension10, 2) : round(p.Price, 2),
        korting: p.Dimension10 || null,
        tariefStroomNormaal: t.kwhNormaal ?? null,
        tariefStroomDal: t.kwhDal ?? null,
        tariefGas: t.m3Gas ?? null,
        vasteLeveringskostenStroomPerJaar: t.vastStroomMnd != null ? round(t.vastStroomMnd * 12, 2) : null,
        vasteLeveringskostenGasPerJaar: t.vastGasMnd != null ? round(t.vastGasMnd * 12, 2) : null,
        rating: p.Dimension13 ? Math.round(p.Dimension13 * 10) / 10 : null,
        labels: p.Dimension15 === "ja" ? "actie" : null,
        bronOfferId: String(p.Id),
      })
    );
  }
  if (!records.length) throw new Error("No offer cards found — page layout may have changed");
  return records;
}

const input = parseCli(process.argv, "gaslicht-client.mjs");
fetchOffers(input)
  .then((records) => output(sortRecords(filterRecords(records, input)), input))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
