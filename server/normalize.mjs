import { displayProvider, providerKey } from "./providers.mjs";

function num(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "object") {
    if (v.totaalInclBelasting != null) return num(v.totaalInclBelasting);
    if (v.levering != null) return num(v.levering);
    return null;
  }
  const n = Number(String(v).replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function monthsFromDuration(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return value === 0 ? null : value;
  const s = String(value);
  const year = s.match(/(\d+)\s*jaar/i);
  if (year) return Number(year[1]) * 12;
  const month = s.match(/(\d+)\s*mnd/i) || s.match(/(\d+)\s*maand/i);
  if (month) return Number(month[1]);
  const bare = Number(s);
  return Number.isFinite(bare) && bare > 0 ? bare : null;
}

function tariffNumber(tariffs, ...keys) {
  if (!tariffs) return null;
  for (const k of keys) {
    const v = num(tariffs[k]);
    if (v != null) return v;
  }
  return null;
}

export function normalizeOffer(raw, source) {
  const providerName =
    raw.provider ||
    raw.supplier ||
    raw.productTitle?.split(" ")[0] ||
    (source === "essent" ? "Essent" : null);

  const product =
    raw.product ||
    raw.productTitle ||
    raw.computedname ||
    raw.naam ||
    null;

  const monthly =
    num(raw.monthlyTotal) ??
    num(raw.monthlyInclDiscount) ??
    num(raw.expectedMonthlyAmount) ??
    (num(raw.yearlyTotal) != null ? num(raw.yearlyTotal) / 12 : null) ??
    (num(raw.expectedYearlyAmount) != null ? num(raw.expectedYearlyAmount) / 12 : null);

  const yearly =
    num(raw.yearlyTotal) ??
    num(raw.yearlyInclDiscount) ??
    num(raw.expectedYearlyAmount) ??
    num(raw.totalcost) ??
    (monthly != null ? monthly * 12 : null);

  const discountRaw =
    num(raw.discount) ??
    num(raw.cashback) ??
    num(raw.cashbackdisplayed) ??
    null;
  const discount = discountRaw == null ? null : Math.abs(discountRaw);

  const durationMonths =
    monthsFromDuration(raw.durationMonths) ??
    monthsFromDuration(raw.durationYears != null ? raw.durationYears * 12 : null) ??
    monthsFromDuration(raw.looptijd) ??
    monthsFromDuration(raw.durationTitle) ??
    monthsFromDuration(raw.duration);

  const contractType =
    raw.contractType ||
    raw.contractKind ||
    raw.contract_type ||
    null;

  const t = raw.tariffs || {};
  return {
    source,
    provider: displayProvider(providerName),
    providerKey: providerKey(providerName),
    product,
    contractType: typeof contractType === "number" ? String(contractType) : contractType,
    durationMonths,
    monthlyTotal: monthly != null ? Math.round(monthly * 100) / 100 : null,
    yearlyTotal: yearly != null ? Math.round(yearly * 100) / 100 : null,
    discount: discount != null ? Math.round(discount * 100) / 100 : null,
    rating: num(raw.rating),
    reviews: num(raw.reviews),
    tariffs: {
      kwhNormaal: tariffNumber(t, "kwhNormaal", "kwhNormaalLevering"),
      kwhDal: tariffNumber(t, "kwhDal", "kwhDalLevering"),
      m3Gas: tariffNumber(t, "m3Gas", "m3GasLevering"),
      vasteLeveringStroomPerMaand: tariffNumber(t, "vasteLeveringStroomPerMaand"),
      vasteLeveringGasPerMaand: tariffNumber(t, "vasteLeveringGasPerMaand"),
    },
    raw,
  };
}

export function unwrapClientResult(result, source) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.offers)) return result.offers;
  if (source === "essent") {
    const inner = result.offers?.offers ?? result.offers;
    if (Array.isArray(inner)) return inner;
    if (Array.isArray(result.payload)) return result.payload;
  }
  return [];
}

export function normalizeOffers(result, source) {
  return unwrapClientResult(result, source).map((o) => normalizeOffer(o, source));
}
