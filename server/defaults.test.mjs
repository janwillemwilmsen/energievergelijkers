import { test } from "node:test";
import assert from "node:assert/strict";
import { cronToDailyTime, dailyTimeToCron, usageForProfile, DEFAULT_SETTINGS } from "./defaults.mjs";

test("daily time converts to cron and back", () => {
  assert.equal(dailyTimeToCron("07:00"), "0 7 * * *");
  assert.equal(dailyTimeToCron("18:30"), "30 18 * * *");
  assert.equal(cronToDailyTime("0 7 * * *"), "07:00");
  assert.equal(cronToDailyTime("15 */2 * * *"), null);
});

test("usageForProfile reads settings", () => {
  const u = usageForProfile(DEFAULT_SETTINGS, "midden");
  assert.equal(u.normaal, 1885);
  assert.equal(u.dal, 1015);
  assert.equal(u.gas, 1200);
});
