#!/usr/bin/env node
// Pricewise.nl screenshot client — fills the start-compare form (postcode,
// huisnummer, current supplier, manual usage) and submits "Vergelijk je
// deals" to reach /energie/resultaat-v5/, then screenshots it. Mirrors
// pricewise-client.mjs' funnel.
//
// NOTE: Pricewise's compare button submits through its AngularJS + ASP.NET
// funnel entirely client-side. In the browserless datacenter environment the
// submit handler does not always navigate, so this script may stop at the
// start page and write an <bron>-FAILED debug shot. Run it from a residential
// IP if it does not advance.

import { run } from "./screenshot-lib.mjs";

const BASE = "https://www.pricewise.nl";

await run("screenshot-pricewise.mjs", "pricewise", async (page, input) => {
  await page.goto(BASE + "/energie-vergelijken/", { waitUntil: "domcontentloaded" });
  await page.locator("#btnCkOk").click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);

  await page.locator("#pc_false").fill(input.postcode);
  await page.locator("#hn_false").fill(String(input.huisnr));
  await page.waitForTimeout(1500);

  // Current supplier: "Onbekend / Anders" (scraper uses currentsupplierid 1062).
  const sup = page.locator("#suppliers_false");
  const label = await sup
    .evaluate((s) => [...s.options].find((o) => /onbekend|anders/i.test(o.text))?.text)
    .catch(() => null);
  if (label) await sup.selectOption({ label }).catch(() => {});

  if (input.gas === 0) await page.locator("#hasnogas_false").check().catch(() => {});

  // Reveal and fill the manual-usage fields.
  await page.getByRole("button", { name: /Verbruik zelf invullen/i }).click().catch(() => {});
  await page.waitForTimeout(1000);
  await page.locator("#elecPeak_false").fill(String(input.normaal)).catch(() => {});
  await page.locator("#elecOffPeak_false").fill(String(input.dal)).catch(() => {});
  if (input.gas > 0) await page.locator("#gas_false").fill(String(input.gas)).catch(() => {});
  if (input.teruglevering > 0) {
    await page.locator("#elecPeaksp_false").fill(String(input.terugNormaal)).catch(() => {});
    await page.locator("#elecOffPeaksp_false").fill(String(input.terugDal)).catch(() => {});
  }
  await page.waitForTimeout(500);

  await page.locator("#en_0_btn_cta").click();
  // Results load on /energie/resultaat-v5/?enfid=…
  await page.waitForURL(/resultaat/i, { timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  await page.waitForTimeout(2500);
});
