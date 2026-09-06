#!/usr/bin/env node
// Pricewise.nl screenshot client — start-compare form -> /energie/resultaat-v5/
// -> screenshot. Mirrors pricewise-client.mjs' funnel.
//
// Pricewise is bot-sensitive: it only advances with the stealth stack in
// screenshot-lib.mjs (playwright stealth plugin + browserless stealth=true).
// Its compare button is also two-phase: the first click validates the address
// (POST .../Address/ValidatePostcode…), and a second click fires the funnel
// redirect (RedirectToConsumptionsPageFromStartCompare) that navigates to the
// results page.

import { run } from "./screenshot-lib.mjs";

const BASE = "https://www.pricewise.nl";

await run("screenshot-pricewise.mjs", "pricewise", async (page, input) => {
  await page.goto(BASE + "/energie-vergelijken/", { waitUntil: "domcontentloaded" });
  await page.locator("#btnCkOk").click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);

  await page.locator("#pc_false").click();
  await page.locator("#pc_false").pressSequentially(input.postcode, { delay: 90 });
  await page.keyboard.press("Tab");
  await page.locator("#hn_false").click();
  await page.locator("#hn_false").pressSequentially(String(input.huisnr), { delay: 90 });
  await page.keyboard.press("Tab");
  await page.waitForTimeout(2500);

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
  await page.waitForTimeout(800);

  // First click validates the address; wait for that, then click again to
  // trigger the funnel redirect to the results page.
  await page.locator("#en_0_btn_cta").click();
  await page.waitForResponse((r) => /Address\/Validate/i.test(r.url()), { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.locator("#en_0_btn_cta").click().catch(() => {});
  await page.waitForURL(/resultaat/i, { timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  await page.waitForTimeout(3000);
});
