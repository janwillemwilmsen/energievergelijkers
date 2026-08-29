import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOffer, unwrapClientResult } from "./normalize.mjs";

test("unwraps { offers } wrappers", () => {
  assert.equal(unwrapClientResult({ offers: [{ provider: "A" }] }, "x").length, 1);
});

test("unwraps essent nested offers", () => {
  const raw = { offers: { offers: [{ productTitle: "Zekerheid 1 jaar", expectedYearlyAmount: 1800, expectedMonthlyAmount: 150 }] } };
  assert.equal(unwrapClientResult(raw, "essent").length, 1);
});

test("normalizes independer field names", () => {
  const o = normalizeOffer(
    {
      provider: "Nuon",
      product: "Vast",
      looptijd: "1 jaar",
      monthlyInclDiscount: 149.1,
      yearlyInclDiscount: 1789.2,
      discount: 200,
      rating: 7.5,
    },
    "independer"
  );
  assert.equal(o.providerKey, "vattenfall");
  assert.equal(o.provider, "Vattenfall");
  assert.equal(o.yearlyTotal, 1789.2);
  assert.equal(o.durationMonths, 12);
});

test("stores korting as a positive amount", () => {
  const o = normalizeOffer({ provider: "X", yearlyTotal: 100, discount: -200 }, "energiekiezer");
  assert.equal(o.discount, 200);
});

test("normalizes overstappen tariff objects", () => {
  const o = normalizeOffer(
    {
      provider: "Eneco",
      product: "Vast",
      monthlyTotal: 200,
      yearlyTotal: 2400,
      tariffs: { kwhNormaal: { totaalInclBelasting: 0.29 }, m3Gas: { totaalInclBelasting: 1.3 } },
    },
    "overstappen"
  );
  assert.equal(o.tariffs.kwhNormaal, 0.29);
  assert.equal(o.tariffs.m3Gas, 1.3);
});
