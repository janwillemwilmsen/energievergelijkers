import { compare as compareEnergiekiezer } from "../energiekiezer-client.mjs";
import { compare as compareEnergievergelijk } from "../energievergelijk-client.mjs";
import { calculateOffers as compareEssent } from "../essent-client.mjs";
import { compare as compareGaslicht } from "../gaslicht-client.mjs";
import { compare as compareIndepender } from "../independer-client.mjs";
import { compare as compareOverstappen } from "../overstappen-client.mjs";
import { compare as comparePricewise } from "../pricewise-client.mjs";

export const SOURCES = [
  {
    id: "energievergelijk",
    label: "Energievergelijk.nl",
    site: "https://www.energievergelijk.nl",
    compare: (postcode, huisnummer, usage) =>
      compareEnergievergelijk(postcode, huisnummer, usage, { contract: "alle" }),
  },
  {
    id: "energiekiezer",
    label: "EnergieKiezer.nl",
    site: "https://www.energiekiezer.nl",
    compare: (postcode, huisnummer, usage) =>
      compareEnergiekiezer(postcode, huisnummer, usage, { contract: "alle", looptijd: "alle", meter: "smart" }),
  },
  {
    id: "overstappen",
    label: "Overstappen.nl",
    site: "https://www.overstappen.nl",
    compare: (postcode, huisnummer, usage) =>
      compareOverstappen(postcode, huisnummer, usage, { contract: "alle" }),
  },
  {
    id: "independer",
    label: "Independer.nl",
    compare: (postcode, huisnummer, usage) =>
      compareIndepender(postcode, huisnummer, usage, { contract: "Vast" }),
    site: "https://www.independer.nl",
  },
  {
    id: "pricewise",
    label: "Pricewise.nl",
    site: "https://www.pricewise.nl",
    compare: (postcode, huisnummer, usage) =>
      comparePricewise(postcode, huisnummer, usage, { contract: "alle" }),
  },
  {
    id: "gaslicht",
    label: "Gaslicht.com",
    site: "https://www.gaslicht.com",
    compare: (postcode, huisnummer, usage) =>
      compareGaslicht(postcode, huisnummer, usage, { details: true, looptijd: "1" }),
  },
  {
    id: "essent",
    label: "Essent.nl",
    site: "https://www.essent.nl",
    compare: (postcode, huisnummer, usage) => compareEssent(postcode, huisnummer, usage),
  },
];

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map((s) => [s.id, s]));

const locks = new Map();

function withSourceLock(id, fn) {
  const prev = locks.get(id) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(
    id,
    next.then(
      () => undefined,
      () => undefined
    )
  );
  return next;
}

export function runSource(source, postcode, huisnummer, usage) {
  return withSourceLock(source.id, () => source.compare(postcode, huisnummer, usage));
}
