#!/usr/bin/env node
// EnergieKiezer.nl screenshot client — homepage widget -> "mijn-wensen" step
// -> results. Mirrors energiekiezer-client.mjs' address flow.
//
// EnergieKiezer is bot-sensitive: it only advances with the stealth stack in
// screenshot-lib.mjs (playwright stealth plugin + browserless stealth=true).
// The homepage submit is also timing-sensitive — enter postcode/huisnummer as
// real keystrokes, Tab out of each field, wait for the address lookup, pause,
// then click once (rapid re-clicks make it no-op).

import { run } from "./screenshot-lib.mjs";

const BASE = "https://www.energiekiezer.nl";

await run("screenshot-energiekiezer.mjs", "energiekiezer", async (page, input) => {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const cookie = page.locator("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll");
  await cookie.waitFor({ state: "visible", timeout: 12_000 }).catch(() => {});
  if (await cookie.isVisible().catch(() => false)) {
    await cookie.click();
    await page.waitForTimeout(1200);
  }

  const pcSpaced = input.postcode.slice(0, 4) + " " + input.postcode.slice(4);
  await page.locator("#postalcode").click();
  await page.locator("#postalcode").pressSequentially(pcSpaced, { delay: 90 });
  await page.keyboard.press("Tab");
  await page.locator("#housenumber").click();
  await page.locator("#housenumber").pressSequentially(String(input.huisnr), { delay: 90 });
  await page.keyboard.press("Tab");
  await page.waitForResponse((r) => /\/address/i.test(r.url()), { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(6000);
  // The submit no-ops when the address lookup isn't settled yet; re-click with
  // spacing (rapid re-clicks also no-op) instead of failing on one 30s wait.
  const submit = page.getByRole("button", { name: "Vergelijk en bespaar" }).first();
  let advanced = false;
  for (let attempt = 0; attempt < 3 && !advanced; attempt++) {
    if (attempt > 0) await page.waitForTimeout(4000);
    await submit.click().catch(() => {});
    advanced = await page.waitForURL(/mijn-wensen/i, { timeout: 15_000 }).then(() => true, () => false);
  }
  if (!advanced) throw new Error(`homepage-submit bleef hangen op ${page.url()} — geen /mijn-wensen (captcha/botdetectie?)`);
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // "Mijn wensen": exact usage, meter, solar, then results.
  await page.getByText("Ja", { exact: true }).first().isVisible().catch(() => {}); // ensure step rendered
  if (input.teruglevering > 0) await page.getByText("Ja", { exact: true }).first().click().catch(() => {});

  await page.getByRole("button", { name: /Ik weet mijn exacte verbruik/i }).click().catch(() => {});
  await page.waitForSelector("#consumptionElectricity", { timeout: 10_000 });
  if (input.dal === 0) {
    const sm = page.locator("#hasSingleMeter");
    if (!(await sm.isChecked().catch(() => false))) await page.getByText("Ik heb een enkele meter", { exact: false }).click().catch(() => {});
  }
  await page.locator("#consumptionElectricity").fill(String(input.normaal));
  if (input.dal > 0) await page.locator("#consumptionElectricityOffPeak").fill(String(input.dal));
  if (input.gas > 0) await page.locator("#usageGas").fill(String(input.gas));
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: /Bekijk je resultaten/i }).first().click();
  // Results render on a client-side route with prices.
  await page.waitForFunction(
    () => /mijn-wensen/.test(location.pathname) === false && /€\s?\d|per maand|per jaar/i.test(document.body.innerText),
    { timeout: 30_000 }
  ).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2500);
});
