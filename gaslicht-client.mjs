#!/usr/bin/env node
// Standalone Gaslicht.com comparison client — derived from a recorded HAR (2026-08-26).
// Unlike Essent, Gaslicht has no JSON API: it is an ASP.NET form flow.
//   1. GET  /                              -> session cookies + __RequestVerificationToken (CSRF)
//   2. POST /energievergelijker/start      -> stores the comparison in the session (302)
//   3. GET  /energievergelijken/resultaten -> server-rendered HTML, scraped here
//   4. GET  <card>/price-details           -> per-offer tariff fragment (needs X-Requested-With)
//
// Offer metadata (product name, yearly price, korting, rating) comes from the GTM
// ecommerce JSON embedded in each card; tariffs come from the price-details fragment.
//
// Usage: node gaslicht-client.mjs <postcode> <huisnr> [--normaal 2500] [--dal 750] [--gas 500]
//                                 [--no-details] [--json]

// node gaslicht-client.mjs 5216EK 27 --normaal 2500 --dal 750 --gas 500 
// node gaslicht-client.mjs 5216EK 27 --looptijd 2+          # 2 jaar of meer
// node gaslicht-client.mjs 5216EK 27 --looptijd 1           # 1 jaar (default)
// node gaslicht-client.mjs 5216EK 27 --looptijd alle        # 1 jaar + 2 jaar of meer
// node gaslicht-client.mjs 5216EK 27 --looptijd 2+ --json   # combineable with all other flags



const BASE = "https://www.gaslicht.com";

const UA_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "nl-NL,nl;q=0.9",
};

// fetch() has no cookie jar, and the flow is session-based — keep one by hand.
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
  if (xhr) headers["x-requested-with"] = "XMLHttpRequest"; // fragment endpoints return the full page without it
  const res = await fetch(BASE + path, { headers, redirect: "manual" });
  storeCookies(res);
  if (res.status >= 300 && res.status < 400) return get(res.headers.get("location"), { xhr });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.text();
}

// "1.683,17" -> 1683.17, "0,2821" -> 0.2821
const num = (s) => Number(String(s).replace(/\./g, "").replace(",", "."));

// "140<span class="c-spec__decimals">,26</span>" -> 140.26
const parseSpec = (m) => (m ? Number(m[1].replace(/\./g, "") + "." + (m[2] ?? "00")) : null);

// Tariff rows in the price-details fragment. The trailing [\s"] keeps
// row-electricity from matching row-electricity-low / -standing.
function parsePriceDetails(frag) {
  const cell = (row) =>
    frag.match(
      new RegExp(`c-tariff-block__col-tariff c-tariff-block__row-${row}[\\s"][^]*?c-spec zeta">\\s*€\\s*([\\d.,]+)`)
    )?.[1];
  const grab = (re) => frag.match(re)?.[1];
  const opt = (v) => (v == null ? null : num(v));
  return {
    kwhNormaal: opt(cell("electricity")),
    kwhDal: opt(cell("electricity-low")),
    m3Gas: opt(cell("gas")),
    vasteLeveringStroomPerMaand: opt(cell("electricity-standing")),
    vasteLeveringGasPerMaand: opt(cell("gas-standing")),
    stroomPerJaar: opt(grab(/Stroom\s*<\/div>\s*<div[^>]*>€\s*([\d.,]+)/)),
    gasPerJaar: opt(grab(/Gas<\/div>\s*<div[^>]*>€\s*([\d.,]+)/)),
    indicatieTermijnbedrag: opt(grab(/Indicatie maandelijks termijnbedrag:\s*€\s*([\d.,]+)/)),
  };
}

// Contract-duration filter -> ContractType values, as sent by the results page's
// filter form (recorded: GET /energievergelijken/resultaten?partial=true&ContractType=...).
const LOOPTIJD = {
  "1": "Vast,Vast1Jaar", // default on the site ("meest gekozen")
  "2+": "Vast,Vast2JaarOfMeer", // "2 jaar of meer"
  "alle": "All,Vast,Vast1Jaar,Vast2JaarOfMeer",
};

export async function compare(postcode, houseNr, { normaal, dal, gas } = {}, { details = true, looptijd = "1" } = {}) {
  if (!LOOPTIJD[looptijd]) throw new Error(`Unknown --looptijd "${looptijd}" (use: ${Object.keys(LOOPTIJD).join(", ")})`);
  // 1. Homepage: cookies + CSRF token from the comparison form.
  const home = await get("/");
  const token = home.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/)?.[1];
  if (!token) throw new Error("No __RequestVerificationToken found on homepage (layout changed?)");

  // 2. Submit the comparison form. Field names taken verbatim from the HAR.
  const pc = postcode.replace(/\s+/g, "").toUpperCase();
  const body = new URLSearchParams({
    __RequestVerificationToken: token,
    postal: pc.slice(0, 4) + " " + pc.slice(4),
    houseNr: String(houseNr),
    housenrAdditional: "",
    huidigeLeverancier: "", // "Weet ik niet / staat er niet bij / n.v.t."
    inputhelp: "custom",
    typemeter: "double",
    stroomhoogverbruik: String(normaal),
    stroomlaagverbruik: String(dal),
    terugstroomhoog: "",
    terugstroomlaag: "",
    gasverbruik: String(gas),
    "solar-panels": "",
    targetGroup: "Consumer",
    calculateDateTime: "",
    contractEndDate: "",
  });
  const post = await fetch(BASE + "/energievergelijker/start", {
    method: "POST",
    headers: {
      ...UA_HEADERS,
      cookie: cookieHeader(),
      "content-type": "application/x-www-form-urlencoded",
      origin: BASE,
      referer: BASE + "/",
    },
    body,
    redirect: "manual",
  });
  storeCookies(post);
  if (post.status >= 400) throw new Error(`POST /energievergelijker/start -> ${post.status}`);

  // 3. Results page (the POST 302s here; fetch it with the same session).
  // The partial endpoint applies the duration filter and returns just the card list.
  await get("/energievergelijken/resultaten"); // establish the comparison in the session first
  const q = new URLSearchParams({ partial: "true", ContractType: LOOPTIJD[looptijd], skip: "0", take: "50" });
  const html = await get(`/energievergelijken/resultaten?${q}`, { xhr: true });

  // 4. Scrape the offer cards.
  const offers = [];
  const seen = new Set();
  for (const block of html.split('class="js-comparison-list-product').slice(1)) {
    // Structured metadata lives in the GTM ecommerce JSON on each card.
    const gtmRaw = block.match(/data-js-gtminfo="([^"]+)"/)?.[1];
    if (!gtmRaw) continue;
    const gtm = JSON.parse(gtmRaw.replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
    const p = (gtm.Ecommerce?.Click ?? gtm.Ecommerce?.Detail)?.Products?.[0];
    if (!p) continue;
    if (seen.has(p.Id)) continue; // highlighted deals repeat in the regular list
    seen.add(p.Id);

    const monthly = parseSpec(
      block.match(/Totaal per maand<\/h6>\s*<div[^>]*>\s*([\d.]+)<span[^>]*>,(\d+)<\/span>/)
    );
    // Build the fragment URL from the card's own product link. The tab's data-url
    // attribute can't be trusted here: highlighted cards repeat in the list without
    // tabs, shifting data-urls onto the wrong card.
    const link = block.match(/href="\/energie-vergelijken\/([^/"]+)\/([a-z0-9-]+-\d+)\?/);
    offers.push({
      id: p.Id,
      provider: p.Brand,
      product: p.Name,
      monthlyTotal: monthly,
      yearlyTotal: p.Price,
      discount: p.Dimension10 || null, // korting/loyaliteitsbonus in €, verified against the card's "Korting €X" tag
      durationMonths: p.Dimension11 ?? null,
      rating: p.Dimension13 ? Math.round(p.Dimension13 * 10) / 10 : null,
      priceDetailsUrl: link ? `/energievergelijker/energie/${link[1]}/${link[2]}/price-details` : null,
    });
  }
  if (!offers.length) throw new Error("No offer cards found — page layout may have changed");

  // 5. Tariff details per offer (extra request each, same session).
  if (details) {
    for (const o of offers) {
      if (!o.priceDetailsUrl) continue;
      try {
        o.tariffs = parsePriceDetails(await get(o.priceDetailsUrl, { xhr: true }));
      } catch (e) {
        o.tariffs = null;
      }
    }
  }
  return offers;
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
  const usage = { normaal: flag("normaal", 2500), dal: flag("dal", 750), gas: flag("gas", 500) };
  const details = !args.includes("--no-details");
  const li = args.indexOf("--looptijd");
  const looptijd = li >= 0 ? args[li + 1] : "1";

  compare(args[0], args[1], usage, { details, looptijd })
    .then((offers) => {
      if (args.includes("--json")) {
        console.log(JSON.stringify(offers, null, 2));
        return;
      }
      console.log(
        `Vergelijking: ${args[0]} ${args[1]} — ${usage.normaal}/${usage.dal} kWh, ${usage.gas} m3 gas — looptijd: ${looptijd === "2+" ? "2 jaar of meer" : looptijd === "alle" ? "alle vaste contracten" : "1 jaar"}`
      );
      console.log(`${offers.length} aanbiedingen:\n`);
      for (const o of offers) {
        console.log(`- ${o.provider} — ${o.product}`);
        console.log(
          `    per maand: €${o.monthlyTotal?.toFixed(2)}  |  per jaar: €${o.yearlyTotal?.toFixed(2)}` +
            (o.discount ? `  |  korting: €${o.discount.toFixed(2)}` : "") +
            (o.rating ? `  |  cijfer: ${o.rating}` : "")
        );
        const t = o.tariffs;
        if (t) {
          console.log(
            `    tarieven : normaal €${t.kwhNormaal?.toFixed(4)}/kWh, dal €${t.kwhDal?.toFixed(4)}/kWh, gas €${t.m3Gas?.toFixed(4)}/m3`
          );
          console.log(
            `               vaste leveringskosten: stroom €${t.vasteLeveringStroomPerMaand?.toFixed(2)}/mnd, gas €${t.vasteLeveringGasPerMaand?.toFixed(2)}/mnd` +
              (t.indicatieTermijnbedrag ? `  |  indicatie termijnbedrag: €${t.indicatieTermijnbedrag}` : "")
          );
        }
      }
    })
    .catch((e) => {
      console.error("FAILED:", e.message);
      process.exit(1);
    });
} else if (isMain) {
  console.log(
    "Usage: node gaslicht-client.mjs <postcode> <huisnr> [--normaal N] [--dal N] [--gas N] [--looptijd 1|2+|alle] [--no-details] [--json]"
  );
}
