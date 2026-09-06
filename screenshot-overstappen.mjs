#!/usr/bin/env node
// Overstappen.nl screenshot client — walks the funnel UI (postcode ->
// "Jouw gegevens" wizard -> results) via browserless and screenshots the
// full results page. The wizard reveals its fields progressively:
// leverancier -> energietype -> verbruik -> "Toon beste deals".

import { run, clickIfVisible } from "./screenshot-lib.mjs";

const BASE = "https://www.overstappen.nl";

await run("screenshot-overstappen.mjs", "overstappen", async (page, input) => {
  await page.goto(BASE + "/energie/vergelijken/", { waitUntil: "domcontentloaded" });
  const cookieBtn = page.locator("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll");
  await cookieBtn.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
  if (await cookieBtn.isVisible().catch(() => false)) await cookieBtn.click();
  await page.waitForTimeout(800);

  await page.locator("#postcode").fill(input.postcode);
  await page.locator("#housenumber").fill(String(input.huisnr));
  // First click triggers the address lookup, a follow-up click submits;
  // retry until the SPA funnel URL loads.
  const submit = page.locator("form:has(#postcode) button", { hasText: "Energie vergelijken" }).first();
  for (let i = 0; i < 4; i++) {
    await submit.click();
    try {
      await page.waitForURL(/\/energie\/vergelijker\//, { timeout: 8000 });
      break;
    } catch {
      if (i === 3) throw new Error("funnel start kwam niet op gang (adres niet gevonden?)");
    }
  }

  // Stap "Jouw gegevens": progressief onthulde velden.
  await page.locator("#currentprovider").waitFor({ timeout: 20_000 });
  await page.locator("#currentprovider").selectOption({ index: 1 }); // Weet ik niet
  const typeSel = input.gas > 0 ? "energy-type-selection-1" : "energy-type-selection-2";
  await page.locator(`#${typeSel}`).waitFor({ timeout: 10_000 });
  await page.locator(`label[for="${typeSel}"]`).click();
  await page.locator("#usage-knowledge-known").waitFor({ timeout: 10_000 });
  await page.locator('label[for="usage-knowledge-known"]').click();
  await page.locator("#electricityusagehigh-input").waitFor({ timeout: 10_000 });

  // Single meter (dal 0): the site rejects "dal = 0" while the double-meter box
  // is checked, so uncheck it — clicking the visible label text, since the raw
  // #doublemeter input is intercepted by its custom-styled wrapper. That
  // removes the dal field, leaving one stroom field.
  if (input.dal === 0) {
    await page.getByText("Ik heb een dubbele én slimme meter", { exact: false }).click().catch(() => {});
    await page.waitForTimeout(800);
    await page.locator("#electricityusagehigh-input").fill(String(input.normaal));
  } else {
    await page.locator("#electricityusagehigh-input").fill(String(input.normaal));
    await page.locator("#electricityusagelow-input").fill(String(input.dal));
  }
  if (input.gas > 0) await page.locator("#gasusage-input").fill(String(input.gas));

  if (input.teruglevering > 0) {
    // Styled checkbox: click the visible label text, not the intercepted input.
    await page.getByText("Ik heb zonnepanelen", { exact: false }).click().catch(() => {});
    await page.waitForTimeout(1500);
    // best effort: de onthulde teruglever-velden heten als in de API
    const high = page.locator('input[name="electricitysupplyhigh"], #electricitysupplyhigh-input').first();
    const low = page.locator('input[name="electricitysupplylow"], #electricitysupplylow-input').first();
    if (await high.count()) await high.fill(String(input.terugNormaal));
    if ((await low.count()) && input.terugDal > 0) await low.fill(String(input.terugDal));
  }

  await page.locator('button:has-text("Toon beste deals")').click();
  await page.waitForLoadState("networkidle", { timeout: 60_000 }).catch(() => {});
  // resultatenlijst: wacht tot er prijzen staan
  await page.waitForSelector("text=/per maand/i", { timeout: 45_000 });
  await clickIfVisible(page, ['button:has-text("Toon meer")'], { timeout: 2000 });
  await page.waitForTimeout(1500);
});
