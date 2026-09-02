#!/usr/bin/env node
// EnergieKiezer.nl comparison client — derived from a recorded HAR (2026-08-27).
// Clean unauthenticated JSON API (api.energiekiezer.nl/api/v1):
//   GET /address?postalCode=..&houseNumber=..  then  POST /search
// meterType "smart" is required for dynamic contracts to appear (valid values
// per the API: single, double, smart). Alleen stroom via useGas:false;
// teruglevering via production{electricity, electricityOffPeak}.

import { UA, parseCli, makeRecord, filterRecords, sortRecords, output, round } from "./energy-lib.mjs";

const API = "https://api.energiekiezer.nl/api/v1";
const HEADERS = {
  "content-type": "application/json",
  accept: "application/json",
  origin: "https://www.energiekiezer.nl",
  referer: "https://www.energiekiezer.nl/",
  "user-agent": UA,
};

const TYPE_NL = { fixed: "Vast", variable: "Variabel", dynamic: "Dynamisch", "dynamic-fixed": "Combinatie" };

export async function fetchOffers(input) {
  const pcSpaced = input.postcode.slice(0, 4) + " " + input.postcode.slice(4);
  const aRes = await fetch(
    `${API}/address?postalCode=${encodeURIComponent(pcSpaced)}&houseNumber=${input.huisnr}&withPossibleAdditions=true`,
    { headers: HEADERS }
  );
  if (!aRes.ok) throw new Error(`address lookup -> ${aRes.status}`);

  const consumption = { electricity: input.normaal, electricityOffPeak: input.dal };
  if (input.gas > 0) consumption.gas = input.gas;
  const body = {
    postalCode: pcSpaced,
    houseNumber: String(input.huisnr),
    meterType: "smart",
    consumption,
    production: { electricity: input.terugNormaal, electricityOffPeak: input.terugDal },
    electricityType: [],
    gasType: [],
    costInterval: "month",
    contractType: [], // empty = everything; uniform filtering happens in energy-lib
    contractDuration: [],
    providers: [],
    pagination: { page: 1, pageSize: 100, sort: "priceQuality" },
    mustBeLogged: true,
    useElectricity: true,
    useGas: input.gas > 0,
    onlyAvailableForSignup: false,
    currentContract: { selection: "notSelected" },
  };
  const res = await fetch(`${API}/search`, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`POST /search -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  if (!data.results?.length) throw new Error("No offers returned");

  return data.results.map((p) => {
    const er = p.rates?.electricity ?? {};
    const gr = p.rates?.gas ?? {};
    const ct = TYPE_NL[p.product?.contractType] ?? p.product?.contractType;
    return makeRecord("energiekiezer", input, {
      leverancier: p.provider?.name,
      product:
        p.product?.content?.usp ||
        `${p.provider?.name} ${ct}${ct === "Vast" && p.product?.monthsFixed >= 12 ? ` ${Math.round(p.product.monthsFixed / 12)} jaar` : ""}`,
      contractType: ct,
      looptijdMaanden: ct === "Vast" ? p.product?.monthsFixed || null : null,
      prijsPerMaand: round(p.costs?.amount, 2),
      prijsPerJaar: round(p.costOverview?.year?.total, 2),
      prijsPerJaarExclKorting: round(p.costOverview?.year?.subtotal, 2),
      korting: p.costOverview?.year?.discount ? -p.costOverview.year.discount : null,
      tariefStroomNormaal: er.ratePeak ?? er.rateSingle ?? null,
      tariefStroomDal: er.rateOffPeak ?? null,
      tariefGas: gr.rate ?? null,
      tariefStroomNormaalLevering: er.ratePeakNoTax ?? er.rateSingleNoTax ?? null,
      tariefStroomDalLevering: er.rateOffPeakNoTax ?? null,
      tariefGasLevering: gr.rateNoTax ?? null,
      vasteLeveringskostenStroomPerJaar: er.delivery != null ? round(er.delivery * 12, 2) : null,
      vasteLeveringskostenGasPerJaar: gr.delivery != null ? round(gr.delivery * 12, 2) : null,
      terugleverVergoedingPerKwh: er.rateProductionSingle1 || null,
      rating: p.provider?.reviews?.average ?? null,
      aantalReviews: p.provider?.reviews?.count ?? null,
      duurzaamheidsScore: p.sustainabilityScore ?? null,
      labels:
        [p.product?.sustainabilityElectricity, p.product?.sustainabilityGas].filter(Boolean).join(" | ") || null,
      bronOfferId: String(p.product?.id ?? ""),
    });
  });
}

const input = parseCli(process.argv, "energiekiezer-client.mjs");
fetchOffers(input)
  .then((records) => output(sortRecords(filterRecords(records, input)), input))
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exit(1);
  });
