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

  // The widget is a React (Chakra) *controlled* form. Keystrokes that land
  // before React has hydrated the inputs end up in the DOM but never in React
  // state, so the submit fails validation ("Vul alsjeblieft je postcode in")
  // even though the field visibly shows the postcode. That is what a failed
  // run looks like — not a captcha. So: wait for hydration, then verify the
  // value React holds (its props.value on the element) and retype on mismatch.
  await page
    .waitForFunction(
      () => {
        const el = document.querySelector("#postalcode");
        return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps$"));
      },
      null,
      { timeout: 20_000 }
    )
    .catch(() => {});
  await page.waitForTimeout(500);

  const reactValue = (sel) =>
    page
      .locator(sel)
      .evaluate((el) => {
        const k = Object.keys(el).find((k) => k.startsWith("__reactProps$"));
        return k ? String(el[k]?.value ?? "") : "";
      })
      .catch(() => "");
  const typeField = async (sel, text) => {
    const loc = page.locator(sel);
    await loc.click();
    await loc.fill(""); // dispatches an input event, so React's state resets too
    await loc.pressSequentially(text, { delay: 90 });
    await page.keyboard.press("Tab");
  };
  const pcSpaced = input.postcode.slice(0, 4) + " " + input.postcode.slice(4);
  const huisnr = String(input.huisnr);
  const fillAddress = async () => {
    for (let i = 0; i < 3; i++) {
      const lookup = page.waitForResponse((r) => /\/address/i.test(r.url()), { timeout: 20_000 }).catch(() => null);
      await typeField("#postalcode", pcSpaced);
      await typeField("#housenumber", huisnr);
      await lookup;
      await page.waitForTimeout(1500);
      const pcOk = (await reactValue("#postalcode")).replace(/\s/g, "").toUpperCase() === input.postcode.toUpperCase();
      const nrOk = (await reactValue("#housenumber")).trim() === huisnr;
      if (pcOk && nrOk) return;
      await page.waitForTimeout(1500);
    }
  };
  await fillAddress();
  await page.waitForTimeout(4500);

  // The submit no-ops when the address lookup isn't settled yet; re-click with
  // spacing (rapid re-clicks also no-op) instead of failing on one 30s wait.
  // If the form reports a validation error, the state was lost — retype first.
  const submit = page.getByRole("button", { name: "Vergelijk en bespaar" }).first();
  const validation = page.getByText(/Vul alsjeblieft|ongeldig/i).first();
  let advanced = false;
  for (let attempt = 0; attempt < 3 && !advanced; attempt++) {
    if (attempt > 0) await page.waitForTimeout(4000);
    if (await validation.isVisible().catch(() => false)) await fillAddress();
    await submit.click().catch(() => {});
    advanced = await page.waitForURL(/mijn-wensen/i, { timeout: 15_000 }).then(() => true, () => false);
  }
  if (!advanced) {
    const diag = await page
      .evaluate(() => {
        const txt = document.body.innerText;
        const captcha =
          /captcha|hcaptcha|recaptcha|cloudflare|verify you are human|bevestig dat je een mens/i.test(txt) ||
          !!document.querySelector('iframe[src*="captcha"], iframe[src*="challenges.cloudflare"]');
        const err = [...document.querySelectorAll("*")]
          .filter((n) => n.children.length === 0 && /Vul alsjeblieft|ongeldig/i.test(n.textContent || ""))
          .map((n) => n.textContent.trim())[0];
        return { captcha, err };
      })
      .catch(() => ({ captcha: false, err: null }));
    const why = diag.captcha
      ? "captcha/botdetectie op de pagina"
      : diag.err
        ? `formulier weigert: "${diag.err}" (React-state kreeg de invoer niet)`
        : "geen validatiefout en geen captcha zichtbaar";
    throw new Error(`homepage-submit bleef hangen op ${page.url()} — geen /mijn-wensen: ${why}`);
  }
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
