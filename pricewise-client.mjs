#!/usr/bin/env node
// Standalone Pricewise.nl energy comparison client — derived from a recorded HAR (2026-08-27).
//
// Pricewise is an AngularJS app over a session-based JSON API with two quirks:
//  - Request bodies MUST be LZW-compressed (comma-separated codes, dictionary starts
//    at 10176); the WAF answers 403 to plain JSON on the funnel endpoints.
//  - Responses come back as {"ojc_blob": "<same LZW format>"} and need decoding.
//
// Flow:
//   1. GET  /energie-vergelijken/                       -> session cookies + GUID headers
//      (pagesetupid / websiteelementid / websitepageid, read from the page HTML)
//   2. POST /api/NlEnergyWebsite/RedirectToConsumptionsPageFromStartCompare
//      -> registers the filter server-side, returns filter.id (the "enfid")
//   3. GET  /energie/resultaat-v5/?enfid=...            -> fresh GUIDs for the results page
//   4. POST /api/NlEnergyWebsite/GetUserFilterAndResults (flowstep 2)
//      -> comparisonresultaggregate.resultslist with all offers + full cost breakdowns
//
// Usage: node pricewise-client.mjs <postcode> <huisnr> [--normaal 2500] [--dal 750] [--gas 500]
//                                  [--contract vast|variabel|dynamisch|alle] [--json]

const BASE = "https://www.pricewise.nl";

const UA_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  "accept-language": "nl-NL,nl;q=0.9",
};

// --- the site's request/response codec: LZW with dictionary codes from 10176 ---
const DICT_START = 10176;
function lzwEncode(s) {
  const dict = new Map();
  let next = DICT_START;
  const out = [];
  let w = "";
  for (const c of s) {
    const wc = w + c;
    if (wc.length === 1 || dict.has(wc)) { w = wc; continue; }
    out.push(w.length === 1 ? w.charCodeAt(0) : dict.get(w));
    dict.set(wc, next++);
    w = c;
  }
  if (w) out.push(w.length === 1 ? w.charCodeAt(0) : dict.get(w));
  return out.join(",");
}
function lzwDecode(text) {
  const codes = text.split(",").map(Number);
  const dict = new Map();
  let next = DICT_START;
  const str = (c) => (c < DICT_START ? String.fromCharCode(c) : dict.get(c));
  let prev = str(codes[0]), out = prev;
  for (let i = 1; i < codes.length; i++) {
    const c = codes[i];
    let cur;
    if (c < DICT_START || dict.has(c)) cur = str(c);
    else if (c === next) cur = prev + prev[0];
    else throw new Error("LZW decode failed at code " + c);
    out += cur;
    dict.set(next++, prev + cur[0]);
    prev = cur;
  }
  return out;
}

const jar = new Map();
function storeCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

const grabGuids = (html) => ({
  pagesetupid: html.match(/pagesetupid="([0-9a-f-]{36})"/)?.[1],
  websiteelementid: html.match(/websiteelementid="([0-9a-f-]{36})"/)?.[1],
  websitepageid: html.match(/websitepageid="([0-9a-f-]{36})"/)?.[1],
});

function makeFilter(postcode, housenumber, { normaal, dal, gas }, over = {}) {
  return {
    customertype: 2, energytype: 0,
    currentsupplierid: 1062, // "Onbekend / Anders"
    isdoublemeter: true, electricityconnectiontype: 1,
    electricitystandardconsumption: 2000,
    electricitypeakconsumption: normaal, electricityoffpeakconsumption: dal,
    hassolarpanels: null, solarpanelsnumber: null,
    electricitystandardgeneration: 0, electricitypeakgeneration: 0, electricityoffpeakgeneration: 0,
    gasconsumption: gas,
    contractduration: 63, // bitmask: all durations
    showhidesuppliers: null, supplierslist: null, showhideproducts: null, productslist: null,
    sustainabilityscore: null, tarifftype: 0, displayonlybuyable: true, dynamictariffvalue: null,
    energysourcetype: 2, energysourceelectricitygreen: false, energysourceelectricitygreennl: false,
    energysourcegasgreen: false, energysourcegaspartlygreen: false, energysourcegasco2compensated: false,
    selectedsupplier: null, selectedforcompare: null, saving: null, isjohndoe: false,
    wizardselectedquestions: null, useedsn: null, edsnerror: null, edsnlastuseddate: null,
    useraffectededsnconsumtions: false, visitortype: 2, showpricewithoutcashback: false,
    showvatexclusiveprices: false, shownextyearprices: false, usenextyearvat: false,
    isconsumptionknown: null, consumptionwizardhouseholdsid: 2, consumptionwizardtypeofconstructsid: null,
    consumptionwizardsquaremetersid: null, consumptionwizardyearofconstructsid: null,
    connectiontypechecked: null, ismoversflow: null, showdelayedproducts: null, cookiefilterid: null,
    edsncodeverifier: null, email: null, channeltypeid: null, flowstartedasjohndoe: null,
    consumptionsareinstartcompare: true, id: "00000000-0000-0000-0000-000000000000",
    createdate: "0001-01-01T00:00:00", lastupdatedate: null,
    partnerid: 105, websiteid: "2ff8845c-0ba2-4705-bb84-2587f96b9c83", parentfilterid: null,
    startcompareurl: BASE + "/energie-vergelijken/",
    postcode, housenumber, housenumberaddition: null,
    sessionid: null, ip: null, costper: "Month",
    orderby: "-iscomparerproduct,-isretentionproduct,totalcost,-(supplierinssurveyscore||0)",
    itemposition: null, scrollto: null, expiredfilterid: null, useraccountid: null, filterhash: null,
    ...over,
  };
}

const CONTRACT_FILTERS = {
  vast: (o) => o.isfixedpricing,
  variabel: (o) => !o.isfixedpricing && !o.isdynamictariff,
  dynamisch: (o) => o.isdynamictariff,
  alle: () => true,
};

export async function compare(postcode, huisnr, usage, { contract = "alle" } = {}) {
  if (!CONTRACT_FILTERS[contract])
    throw new Error(`Unknown --contract "${contract}" (use: ${Object.keys(CONTRACT_FILTERS).join(", ")})`);
  const pc = postcode.replace(/\s+/g, "").toUpperCase();

  let location = BASE + "/energie-vergelijken/";
  let pageHeaders = {};

  async function post(path, body) {
    const res = await fetch(BASE + path, {
      method: "POST",
      headers: {
        ...UA_HEADERS,
        accept: "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8",
        cookie: cookieHeader(),
        referer: location,
        locationhref: location,
        RequestedClassMethod: path.replace(/^\/(api|apimvc|apiNoSession|apiReadOnlySession)\//, ""),
        ...pageHeaders,
      },
      body: lzwEncode(JSON.stringify(body)),
    });
    storeCookies(res);
    if (!res.ok) throw new Error(`POST ${path} -> ${res.status}`);
    const j = JSON.parse(await res.text());
    return j?.ojc_blob ? JSON.parse(lzwDecode(j.ojc_blob)) : j;
  }

  // 1. Start page: cookies + GUID headers.
  const home = await fetch(location, { headers: UA_HEADERS });
  storeCookies(home);
  pageHeaders = grabGuids(await home.text());
  if (!pageHeaders.websitepageid) throw new Error("No page GUIDs found on start page (layout changed?)");

  // 2. Register the filter; the returned filter.id is the funnel id (enfid).
  const redirect = await post("/api/NlEnergyWebsite/RedirectToConsumptionsPageFromStartCompare", {
    filter: makeFilter(pc, Number(huisnr), usage),
    initialfilteridisexpired: false, securitypassed: true, sessionexpired: false,
    flowstep: 1, nextpage: 0, customertype: 2, languageid: 57,
    getmodeldeferred: true, cookieid: "", validatehousenumber: true,
  });
  const enfid = redirect?.filter?.id;
  if (!enfid || enfid === "00000000-0000-0000-0000-000000000000")
    throw new Error("No funnel id returned — check postcode/huisnummer");

  // 3. Results page for its GUID headers.
  location = `${BASE}/energie/resultaat-v5/?enfid=${enfid}`;
  const resPage = await fetch(location, { headers: { ...UA_HEADERS, cookie: cookieHeader() } });
  storeCookies(resPage);
  pageHeaders = grabGuids(await resPage.text());

  // 4. The offers (flowstep 2 = results page).
  const data = await post("/api/NlEnergyWebsite/GetUserFilterAndResults", {
    filter: makeFilter(pc, Number(huisnr), usage, { id: enfid }),
    initialfilteridisexpired: false, securitypassed: true, flowstep: 2, nextpage: 0,
    appmode: false, languageid: 57, isiframe: false, customertype: 0,
    consumptionsfromdefault: true, getmodeldeferred: true, productslist: "",
    istop5: false, extendedfieldscomputed: false, responsetoskip: 0, surveyid: 2193,
    havecomparerproduct: false, suppliersocialproof: [], isindebug: false,
    compareproductids: "", requestid: "00000000-0000-0000-0000-000000000000",
    productnotavailable: false, nextyeartaxesavailable: false, canusejohndoe: false,
  });
  const list = data?.comparisonresultaggregate?.resultslist;
  if (!Array.isArray(list) || !list.length) throw new Error("No results returned");

  const offers = list.map((p) => ({
    provider: p.electricityproduct?.suppliername ?? p.gasproduct?.suppliername ?? `supplier ${p.supplierid}`,
    product: p.computedname,
    contractType: p.isdynamictariff ? "Dynamisch" : p.isfixedpricing ? "Vast" : "Variabel",
    durationMonths: p.contractdurationmonths || null,
    monthlyTotal: p.totalcost / 12,
    yearlyTotal: p.totalcost,
    yearlyExclCashback: p.totalcost_withoutcashback,
    cashback: p.cashbackdisplayed || p.cashback || null,
    rating: p.supplierinssurveyscore || null,
    isfixedpricing: p.isfixedpricing,
    isdynamictariff: p.isdynamictariff,
    // Delivery tariffs only — energy tax and grid costs are separate line items here.
    tariffs: {
      kwhNormaalLevering: p.electricitycosts?.deliverycosts?.peakvariabledeliverytariff || null,
      kwhDalLevering: p.electricitycosts?.deliverycosts?.offpeakvariabledeliverytariff || null,
      m3GasLevering: p.gascosts?.deliverycosts?.variabledeliverytariff || null,
      vasteLeveringStroomPerJaar: p.electricitycosts?.deliverycosts?.fixeddeliverycosts || null,
      vasteLeveringGasPerJaar: p.gascosts?.deliverycosts?.fixeddeliverycosts || null,
    },
  }));
  const filtered = offers.filter(CONTRACT_FILTERS[contract]);
  filtered.sort((a, b) => a.yearlyTotal - b.yearlyTotal);
  return { enfid, offers: filtered };
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
    .then(({ offers }) => {
      if (args.includes("--json")) {
        console.log(JSON.stringify(offers, null, 2));
        return;
      }
      console.log(`Vergelijking: ${args[0]} ${args[1]} — ${usage.normaal}/${usage.dal} kWh, ${usage.gas} m3 gas — contract: ${contract}`);
      console.log(`${offers.length} aanbiedingen (gesorteerd op jaarkosten incl. cashback):\n`);
      for (const o of offers) {
        const dur = o.durationMonths ? `${o.durationMonths} mnd` : "onbepaald";
        console.log(`- ${o.provider} — ${o.product} (${o.contractType}, ${dur})`);
        console.log(
          `    per maand: €${o.monthlyTotal.toFixed(2)}  |  per jaar: €${o.yearlyTotal.toFixed(2)}` +
            (o.cashback ? `  |  cashback: €${Math.round(o.cashback)}` : "") +
            (o.rating ? `  |  cijfer: ${o.rating}` : "")
        );
        const t = o.tariffs;
        if (t.kwhNormaalLevering)
          console.log(
            `    levering : normaal €${t.kwhNormaalLevering.toFixed(4)}/kWh, dal €${t.kwhDalLevering?.toFixed(4)}/kWh` +
              (t.m3GasLevering ? `, gas €${t.m3GasLevering.toFixed(4)}/m3` : "") +
              ` (excl. belastingen/netbeheer)`
          );
      }
    })
    .catch((e) => {
      console.error("FAILED:", e.message);
      process.exit(1);
    });
} else if (isMain) {
  console.log(
    "Usage: node pricewise-client.mjs <postcode> <huisnr> [--normaal N] [--dal N] [--gas N] [--contract vast|variabel|dynamisch|alle] [--json]"
  );
}
