import { test } from "node:test";
import assert from "node:assert/strict";
import { isHighlighted, providerKey, providersMatch } from "./providers.mjs";

test("matches Nuon to Vattenfall", () => {
  assert.equal(providerKey("Nuon"), "vattenfall");
  assert.equal(providersMatch("Nuon", "Vattenfall Energie"), true);
});

test("matches BudgetEnergie variants", () => {
  assert.equal(providerKey("Budget Energie"), providerKey("BudgetEnergie"));
  assert.equal(providerKey("BudgetEnergie B.V."), "budgetenergie");
});

test("matches essent energie suffix", () => {
  assert.equal(providerKey("essent energie"), "essent");
  assert.equal(providersMatch("Essent", "essent energie"), true);
});

test("highlighted list uses keys", () => {
  assert.equal(isHighlighted("Nuon", ["vattenfall", "eneco"]), true);
  assert.equal(isHighlighted("Frank Energie", ["vattenfall"]), false);
});
