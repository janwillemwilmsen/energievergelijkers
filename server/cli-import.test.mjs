import { test } from "node:test";
import assert from "node:assert/strict";
import { compare as gaslicht } from "../gaslicht-client.mjs";
import { compare as ev } from "../energievergelijk-client.mjs";
import { calculateOffers } from "../essent-client.mjs";

test("clients export compare functions without throwing on import", () => {
  assert.equal(typeof gaslicht, "function");
  assert.equal(typeof ev, "function");
  assert.equal(typeof calculateOffers, "function");
});
