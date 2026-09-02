#!/usr/bin/env node
// Pricewise.nl energy comparison client — derived from a recorded HAR (2026-08-27).
// AngularJS app over a session-based JSON API with two quirks:
//  - Request bodies MUST be LZW-compressed (dictionary from code 10176); the WAF
//    answers 403 to plain JSON on the funnel endpoints.
//  - Responses come back as {"ojc_blob": "<same LZW format>"}.
// Flow: start page (cookies + GUID headers from HTML) -> RedirectToConsumptions...
// (registers filter, returns enfid) -> results page (fresh GUIDs) ->
// GetUserFilterAndResults (flowstep 2) -> resultslist.
// Alleen stroom via filter.energytype=1; teruglevering via hassolarpanels +
// electricitypeak/offpeakgeneration + solarpanelsnumber.
// NOTE: pricewise's per-kWh/m3 tariffs are DELIVERY-ONLY (excl. energiebelasting).

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, round } from "./energy-lib.mjs";

const BASE = "https://www.pricewise.nl";
const UA_HEADERS = { "user-agent": UA, "accept-language": "nl-NL,nl;q=0.9" };

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

function makeFilter(input, over = {}) {
  const solar = input.teruglevering > 0;
  return {
    customertype: 2,
    energytype: input.gas > 0 ? 0 : 1, // 0 = stroom+gas, 1 = alleen stroom
    currentsupplierid: 1062, // "Onbekend / Anders"
    isdoublemeter: true, electricityconnectiontype: 1,
    electricitystandardconsumption: 2000,
    electricitypeakconsumption: input.normaal, electricityoffpeakconsumption: input.dal,
    hassolarpanels: solar ? true : null, solarpanelsnumber: solar ? input.panelen : null,
    electricitystandardgeneration: 0,
    electricitypeakgeneration: solar ? input.terugNormaal : 0,
    electricityoffpeakgeneration: solar ? input.terugDal : 0,
    gasconsumption: input.gas, contractduration: 63,
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
    postcode: input.postcode, housenumber: Number(input.huisnr), housenumberaddition: null,
    sessionid: null, ip: null, costper: "Month",
    orderby: "-iscomparerproduct,-isretentionproduct,totalcost,-(supplierinssurveyscore||0)",
    itemposition: null, scrollto: null, expiredfilterid: null, useraccountid: null, filterhash: null,
    ...over,
  };
}

export async function fetchOffers(input) {
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

  const home = await fetch(location, { headers: UA_HEADERS });
  storeCookies(home);
  pageHeaders = grabGuids(await home.text());
  if (!pageHeaders.websitepageid) throw new Error("No page GUIDs found on start page (layout changed?)");

  const redirect = await post("/api/NlEnergyWebsite/RedirectToConsumptionsPageFromStartCompare", {
    filter: makeFilter(input),
    initialfilteridisexpired: false, securitypassed: true, sessionexpired: false,
    flowstep: 1, nextpage: 0, customertype: 2, languageid: 57,
    getmodeldeferred: true, cookieid: "", validatehousenumber: true,
  });
  const enfid = redirect?.filter?.id;
  if (!enfid || enfid === "00000000-0000-0000-0000-000000000000")
    throw new Error("No funnel id returned — check postcode/huisnummer");

  location = `${BASE}/energie/resultaat-v5/?enfid=${enfid}`;
  const resPage = await fetch(location, { headers: { ...UA_HEADERS, cookie: cookieHeader() } });
  storeCookies(resPage);
  pageHeaders = grabGuids(await resPage.text());

  const data = await post("/api/NlEnergyWebsite/GetUserFilterAndResults", {
    filter: makeFilter(input, { id: enfid }),
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

  return list.map((p) => {
    const ed = p.electricitycosts?.deliverycosts;
    const gd = p.gascosts?.deliverycosts;
    const eProd = p.electricityproduct ?? p.gasproduct ?? {};
    return makeRecord("pricewise", input, {
      leverancier: eProd.suppliername ?? `supplier ${p.supplierid}`,
      product: p.computedname,
      contractType: p.isdynamictariff ? "Dynamisch" : p.isfixedpricing ? "Vast" : "Variabel",
      looptijdMaanden: p.isfixedpricing ? p.contractdurationmonths || null : null,
      prijsPerMaand: round(p.totalcost / 12, 2),
      prijsPerJaar: round(p.totalcost, 2),
      prijsPerJaarExclKorting: round(p.totalcost_withoutcashback, 2),
      korting: p.cashbackdisplayed || p.cashback || null,
      // pricewise exposes delivery-only tariffs; all-in columns stay null
      tariefStroomNormaalLevering: ed?.peakvariabledeliverytariff || null,
      tariefStroomDalLevering: ed?.offpeakvariabledeliverytariff || null,
      tariefGasLevering: gd?.variabledeliverytariff || null,
      vasteLeveringskostenStroomPerJaar: round(ed?.fixeddeliverycosts, 2) || null,
      vasteLeveringskostenGasPerJaar: round(gd?.fixeddeliverycosts, 2) || null,
      terugleverVergoedingPerKwh: p.feedintariff || null,
      rating: p.supplierinssurveyscore || null,
      labels: [p.iscomparerproduct && "uitgelicht", p.isretentionproduct && "retentie"].filter(Boolean).join(" | ") || null,
      bronOfferId: String(p.combinationid ?? p.purchaseid ?? ""),
    });
  });
}

const input = parseCli(process.argv, "pricewise-client.mjs");
fetchOffers(input)
  .then((records) => output(sortRecords(filterRecords(records, input)), input))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
