#!/usr/bin/env node
// Standalone Energievergelijk.nl comparison client — derived from a recorded HAR (2026-08-27).
//
// The simplest site so far: one unauthenticated JSON POST does the whole comparison.
//   POST https://api.energievergelijk.nl/vergelijker/search
//   body: {"gas":500,"power":2500,"power_low":750,"zipcode":"5216EK","housenumber":"27",
//          "price_rate":"m","origin":"home","lang":"NL"}
// No cookies, no session, no tokens. The response is a map of ~35 offers with full
// price breakdowns (tariffs, vaste kosten, netbeheer, korting, reviews).
//
// Usage: node energievergelijk-client.mjs <postcode> <huisnr> [--normaal 2500] [--dal 750] [--gas 500]
//                                         [--contract vast|variabel|dynamisch|alle] [--json]

const API = "https://api.energievergelijk.nl";

const HEADERS = {
  "content-type": "application/json",
  "accept": "application/json",
  "origin": "https://www.energievergelijk.nl",
  "referer": "https://www.energievergelijk.nl/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
};

const num = (s) => (s == null ? null : Number(String(s).replace(/\./g, "").replace(",", ".")));

const CONTRACT_FILTERS = {
  vast: (o) => o.contractType === "Vast",
  variabel: (o) => o.contractType === "Variabel",
  dynamisch: (o) => o.contractType === "Dynamisch",
  alle: () => true,
};

export async function compare(postcode, huisnr, { normaal, dal, gas } = {}, { contract = "alle" } = {}) {
  if (!CONTRACT_FILTERS[contract])
    throw new Error(`Unknown --contract "${contract}" (use: ${Object.keys(CONTRACT_FILTERS).join(", ")})`);
  const pc = postcode.replace(/\s+/g, "").toUpperCase();

  const res = await fetch(API + "/vergelijker/search", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      gas,
      power: normaal,
      power_low: dal,
      zipcode: pc,
      housenumber: String(huisnr),
      price_rate: "m",
      origin: "home",
      lang: "NL",
    }),
  });
  if (!res.ok) throw new Error(`POST /vergelijker/search -> ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const list = Object.values(data);
  if (!list.length) throw new Error("No offers returned — check postcode/huisnummer");

  const offers = list.map((p) => {
    const det = p.pricing?.details ?? {};
    const name = p.name ?? "";
    const contractType = /dynamisch/i.test(name) ? "Dynamisch" : /variabel/i.test(name) ? "Variabel" : /vast/i.test(name) ? "Vast" : name;
    const durMatch = name.match(/(\d+)\s*jaar/i);
    return {
      id: p.id,
      provider: p.provider?.name,
      product: name,
      contractType,
      durationYears: durMatch ? Number(durMatch[1]) : null,
      monthlyTotal: num(p.pricing?.display_total),
      yearlyTotal: p.pricing?.total ?? null,
      discount: det.discount?.total_sum || null,
      rating: num(p.reviews?.summary?.general?.number),
      reviews: p.reviews?.summary?.total || null,
      tariffs: {
        kwhNormaal: num(det.power?.tariff?.items?.standard),
        kwhDal: num(det.power?.tariff?.items?.low),
        m3Gas: num(det.gas?.tariff?.items?.single),
        vasteLeveringPerJaar: det.fixed_cost?.total_sum ?? null,
        netbeheerPerJaar: det.operator?.total_sum ?? null,
        terugleverPerKwh: num(det.feed_in?.tariff),
      },
    };
  });
  const filtered = offers.filter(CONTRACT_FILTERS[contract]);
  filtered.sort((a, b) => (a.yearlyTotal ?? 1e9) - (b.yearlyTotal ?? 1e9));
  return filtered;
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

  compare(args[0], args[1], usage, { contract })
    .then((offers) => {
      if (args.includes("--json")) {
        console.log(JSON.stringify(offers, null, 2));
        return;
      }
      console.log(`Vergelijking: ${args[0]} ${args[1]} — ${usage.normaal}/${usage.dal} kWh, ${usage.gas} m3 gas — contract: ${contract}`);
      console.log(`${offers.length} aanbiedingen (gesorteerd op jaarkosten incl. korting):\n`);
      for (const o of offers) {
        console.log(`- ${o.provider} — ${o.product}`);
        console.log(
          `    per maand: €${o.monthlyTotal?.toFixed(2)}  |  per jaar: €${o.yearlyTotal?.toFixed(2)}` +
            (o.discount ? `  |  korting: €${Math.round(o.discount * 100) / 100}` : "") +
            (o.rating ? `  |  cijfer: ${o.rating} (${o.reviews})` : "")
        );
        const t = o.tariffs;
        if (t.kwhNormaal)
          console.log(
            `    tarieven : normaal €${t.kwhNormaal.toFixed(3)}/kWh` +
              (t.kwhDal ? `, dal €${t.kwhDal.toFixed(3)}/kWh` : "") +
              (t.m3Gas ? `, gas €${t.m3Gas.toFixed(3)}/m3` : "") +
              (t.vasteLeveringPerJaar ? `, vast €${t.vasteLeveringPerJaar.toFixed(0)}/jr` : "")
          );
      }
    })
    .catch((e) => {
      console.error("FAILED:", e.message);
      process.exit(1);
    });
} else {
  console.log(
    "Usage: node energievergelijk-client.mjs <postcode> <huisnr> [--normaal N] [--dal N] [--gas N] [--contract vast|variabel|dynamisch|alle] [--json]"
  );
}
