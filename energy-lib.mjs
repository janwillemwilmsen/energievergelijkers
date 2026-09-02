// Shared library for the energy-comparator clients.
// Guarantees: identical CLI flags, identical filter semantics (applied client-side
// after fetching the maximum the site offers), and one canonical wide record
// shape with a fixed key order — suitable for loading into a database.

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Canonical record: every client maps its offers into exactly these keys, in
// exactly this order. Unknown values are null (never omitted).
// Tariff conventions: tariefStroom*/tariefGas are ALL-IN per kWh/m3 (incl. btw
// and energiebelasting); the *Levering variants are the supplier's delivery
// tariff only. Sites expose one or the other or both.
// ---------------------------------------------------------------------------
const RECORD_KEYS = [
  "bron", "opgehaaldOp", "postcode", "huisnummer",
  "aansluiting", "verbruikNormaalKwh", "verbruikDalKwh", "verbruikGasM3",
  "terugleveringNormaalKwh", "terugleveringDalKwh", "zonnepanelen",
  "leverancier", "product", "contractType", "looptijdMaanden",
  "prijsPerMaand", "prijsPerJaar", "prijsPerJaarExclKorting", "korting",
  "tariefStroomNormaal", "tariefStroomDal", "tariefGas",
  "tariefStroomNormaalLevering", "tariefStroomDalLevering", "tariefGasLevering",
  "vasteLeveringskostenStroomPerJaar", "vasteLeveringskostenGasPerJaar",
  "netbeheerPerJaar", "terugleverVergoedingPerKwh",
  "rating", "aantalReviews", "duurzaamheidsScore",
  "labels", "bronOfferId",
];

export function makeRecord(bron, input, fields) {
  const base = {
    bron,
    opgehaaldOp: new Date().toISOString(),
    postcode: input.postcode,
    huisnummer: input.huisnr,
    aansluiting: input.gas > 0 ? "stroom+gas" : "stroom",
    verbruikNormaalKwh: input.normaal,
    verbruikDalKwh: input.dal,
    verbruikGasM3: input.gas,
    terugleveringNormaalKwh: input.terugNormaal,
    terugleveringDalKwh: input.terugDal,
    zonnepanelen: input.panelen,
  };
  const rec = {};
  for (const k of RECORD_KEYS) rec[k] = base[k] !== undefined ? base[k] : fields[k] !== undefined ? fields[k] : null;
  return rec;
}

// ---------------------------------------------------------------------------
// Uniform CLI
// ---------------------------------------------------------------------------
const USAGE = (name) => `Usage: node ${name} <postcode> <huisnr>
  --normaal N          jaarverbruik stroom normaal/piek in kWh   (default 2500)
  --dal N              jaarverbruik stroom dal in kWh            (default 750)
  --gas N              jaarverbruik gas in m3; 0 = alleen stroom (default 500)
  --geen-gas           alias voor --gas 0
  --teruglevering N    teruglevering zonnepanelen in kWh/jaar    (default 0)
  --panelen N          aantal zonnepanelen (default: teruglevering/350, afgerond)
  --contract T         vast | variabel | dynamisch | combinatie | alle (default alle)
  --looptijd L         1 | 2 | 3 (jaren, alleen vast) | alle     (default alle)
  --json               canonieke records (vaste kolomvolgorde) i.p.v. leesbare output`;

export function parseCli(argv, scriptName) {
  const args = argv.slice(2);
  if (args.length < 2 || args[0].startsWith("--")) {
    console.log(USAGE(scriptName));
    process.exit(args.length ? 1 : 0);
  }
  const flag = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : dflt;
  };
  const normaal = Number(flag("normaal", 2500));
  const dal = Number(flag("dal", 750));
  const gas = args.includes("--geen-gas") ? 0 : Number(flag("gas", 500));
  const teruglevering = Number(flag("teruglevering", 0));
  // split total feed-in over normaal/dal in the same ratio as consumption
  const terugNormaal = teruglevering ? Math.round((teruglevering * normaal) / (normaal + dal || 1)) : 0;
  const terugDal = teruglevering - terugNormaal;
  const panelen = Number(flag("panelen", teruglevering > 0 ? Math.max(1, Math.round(teruglevering / 350)) : 0));
  const contract = flag("contract", "alle");
  const looptijd = String(flag("looptijd", "alle"));
  if (!["vast", "variabel", "dynamisch", "combinatie", "alle"].includes(contract)) {
    console.error(`Onbekende --contract "${contract}" (vast, variabel, dynamisch, combinatie, alle)`);
    process.exit(1);
  }
  if (!["1", "2", "3", "alle"].includes(looptijd)) {
    console.error(`Onbekende --looptijd "${looptijd}" (1, 2, 3, alle)`);
    process.exit(1);
  }
  return {
    postcode: args[0].replace(/\s+/g, "").toUpperCase(),
    huisnr: args[1],
    normaal, dal, gas,
    teruglevering, terugNormaal, terugDal, panelen,
    contract, looptijd,
    json: args.includes("--json"),
  };
}

// ---------------------------------------------------------------------------
// Uniform filtering — always applied AFTER fetching the site's maximum, so the
// same flags mean the same thing on every site.
// ---------------------------------------------------------------------------
export function filterRecords(records, { contract, looptijd }) {
  let out = records;
  if (contract !== "alle") {
    const want = { vast: "Vast", variabel: "Variabel", dynamisch: "Dynamisch", combinatie: "Combinatie" }[contract];
    out = out.filter((r) => r.contractType === want);
  }
  if (looptijd !== "alle") {
    const months = Number(looptijd) * 12;
    out = out.filter((r) => r.contractType !== "Vast" || r.looptijdMaanden === months);
  }
  return out;
}

export function sortRecords(records) {
  return records.sort((a, b) => (a.prijsPerJaar ?? 1e12) - (b.prijsPerJaar ?? 1e12));
}

// ---------------------------------------------------------------------------
// Uniform output
// ---------------------------------------------------------------------------
export function output(records, input) {
  if (input.json) {
    console.log(JSON.stringify(records, null, 2));
    return;
  }
  const i = input;
  const zon = i.teruglevering ? `, teruglevering ${i.teruglevering} kWh (${i.panelen} panelen)` : "";
  console.log(
    `${records[0]?.bron ?? "?"} — ${i.postcode} ${i.huisnr} — ${i.normaal}/${i.dal} kWh` +
      (i.gas > 0 ? `, ${i.gas} m3 gas` : ", alleen stroom") + zon +
      ` — contract: ${i.contract}, looptijd: ${i.looptijd}`
  );
  console.log(`${records.length} aanbiedingen (gesorteerd op jaarkosten incl. korting):\n`);
  const eur = (v, d = 2) => (v == null ? "-" : "€" + Number(v).toFixed(d));
  for (const r of records) {
    const dur = r.contractType === "Vast" ? (r.looptijdMaanden ? `${r.looptijdMaanden} mnd` : "?") : "onbepaald";
    console.log(`- ${r.leverancier} — ${r.product} (${r.contractType}, ${dur})`);
    console.log(
      `    per maand: ${eur(r.prijsPerMaand)}  |  per jaar: ${eur(r.prijsPerJaar)}` +
        (r.korting ? `  |  korting: ${eur(r.korting, 0)}` : "") +
        (r.rating ? `  |  cijfer: ${r.rating}${r.aantalReviews ? ` (${r.aantalReviews})` : ""}` : "")
    );
    const allin = r.tariefStroomNormaal != null;
    const t = allin
      ? `normaal ${eur(r.tariefStroomNormaal, 4)}, dal ${eur(r.tariefStroomDal, 4)}, gas ${eur(r.tariefGas, 4)} (incl. belastingen)`
      : r.tariefStroomNormaalLevering != null
        ? `normaal ${eur(r.tariefStroomNormaalLevering, 4)}, dal ${eur(r.tariefStroomDalLevering, 4)}, gas ${eur(r.tariefGasLevering, 4)} (alleen levering)`
        : null;
    if (t) console.log(`    tarieven : ${t}`);
  }
}

// Helpers shared by several clients
export const num = (s) => (s == null || s === "" ? null : Number(String(s).replace(/\./g, "").replace(",", ".")));
export const round = (v, d = 4) => (v == null ? null : Math.round(v * 10 ** d) / 10 ** d);
