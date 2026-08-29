/**
 * Robust provider matching across comparison sites.
 * Sites disagree on punctuation, "Energie", BV/NV suffixes, and a few aliases
 * (Nuon → Vattenfall, Budget Energie vs BudgetEnergie, …).
 */

const ALIASES = [
  ["vattenfall", ["vattenfall", "nuon", "vattenfall nederland"]],
  ["essent", ["essent", "essent energie"]],
  ["eneco", ["eneco", "eneco energie"]],
  ["oxxio", ["oxxio"]],
  ["budgetenergie", ["budget energie", "budgetenergie", "budget"]],
  ["vandebron", ["vandebron", "van de bron"]],
  ["greenchoice", ["greenchoice", "green choice"]],
  ["unitedconsumers", ["united consumers", "unitedconsumers"]],
  ["coolblue", ["coolblue energie", "coolblue"]],
  ["energiedirect", ["energiedirect", "energie direct", "energiedirect.nl"]],
  ["powerpeers", ["powerpeers", "power peers"]],
  ["innova", ["innova energie", "innova"]],
  ["pureenergie", ["pure energie", "pureenergie"]],
  ["energievanons", ["energie van ons", "energievanons"]],
  ["anwb", ["anwb energie", "anwb"]],
  ["frankenergie", ["frank energie", "frank"]],
  ["nextenergy", ["nextenergy", "next energy"]],
  ["tibber", ["tibber"]],
  ["zonneplan", ["zonneplan"]],
  ["easyenergy", ["easyenergy", "easy energy"]],
  ["energyzero", ["energyzero", "energy zero"]],
  ["nle", ["nle", "nederlandse energie", "nederlandseenergie"]],
  ["shell", ["shell energie", "shell energy", "shell"]],
  ["totalenergies", ["totalenergies", "total energies", "total"]],
  ["mega", ["mega", "mega energie"]],
  ["infumia", ["infumia"]],
  ["pwwr", ["pwwr"]],
  ["cleanenergy", ["clean energy", "cleanenergy"]],
  ["vandebron", ["vandebron"]],
  ["engie", ["engie"]],
  ["delta", ["delta energie", "delta"]],
  ["gewonestroom", ["gewone stroom", "gewonestroom"]],
  ["vandebron", ["vandebron"]],
  ["omnie", ["omnie"]],
  ["newenergy", ["newenergy", "new energy"]],
  ["saman", ["saman", "saman duurzaam"]],
  ["hvc", ["hvc", "hvc energie"]],
];

const aliasIndex = new Map();
for (const [key, names] of ALIASES) {
  for (const name of names) aliasIndex.set(normalizeLoose(name), key);
  aliasIndex.set(key, key);
}

export function normalizeLoose(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " en ")
    .replace(/[.']/g, "")
    .replace(/\b(b\.?v\.?|n\.?v\.?|nederland|nl)\b/g, " ")
    .replace(/\benergie\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function providerKey(name) {
  const loose = normalizeLoose(name);
  if (!loose) return "";
  if (aliasIndex.has(loose)) return aliasIndex.get(loose);
  const compact = loose.replace(/\s+/g, "");
  if (aliasIndex.has(compact)) return aliasIndex.get(compact);
  for (const [alias, key] of aliasIndex) {
    if (!alias) continue;
    if (loose === alias || compact === alias.replace(/\s+/g, "")) return key;
    if (loose.startsWith(alias + " ") || alias.startsWith(loose + " ")) return key;
  }
  return compact || loose;
}

export function providersMatch(a, b) {
  if (!a || !b) return false;
  return providerKey(a) === providerKey(b);
}

export function isHighlighted(name, highlightedKeys = []) {
  const key = providerKey(name);
  return highlightedKeys.some((h) => providerKey(h) === key);
}

export function displayProvider(name) {
  const key = providerKey(name);
  const labels = {
    vattenfall: "Vattenfall",
    essent: "Essent",
    eneco: "Eneco",
    oxxio: "Oxxio",
    budgetenergie: "Budget Energie",
    vandebron: "Vandebron",
    greenchoice: "Greenchoice",
    unitedconsumers: "United Consumers",
    coolblue: "Coolblue Energie",
    energiedirect: "energiedirect.nl",
    frankenergie: "Frank Energie",
    anwb: "ANWB Energie",
    pureenergie: "Pure Energie",
    energievanons: "Energie van Ons",
    nextenergy: "NextEnergy",
    easyenergy: "EasyEnergy",
    energyzero: "EnergyZero",
    nle: "NLE",
    shell: "Shell Energie",
    totalenergies: "TotalEnergies",
  };
  return labels[key] || String(name || "").trim() || "Onbekend";
}
