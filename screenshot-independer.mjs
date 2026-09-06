#!/usr/bin/env node
// Independer.nl screenshot client — intro form -> "Je wensen" wizard ->
// results. Mirrors independer-client.mjs' address flow. The intro submit only
// advances once the address lookup (/api/address/getaddressdata) has returned,
// so the postcode/huisnummer must be entered as real keystrokes and given a
// moment before clicking "Energie vergelijken".

import { run, acceptCookies } from "./screenshot-lib.mjs";

const BASE = "https://www.independer.nl";

// The "Wie is je huidige leverancier?" control is either a native <select> or
// a custom combobox depending on the build; pick "weet ik niet" from whichever.
async function pickCurrentSupplier(page) {
  // 1) native <select> anywhere holding a "weet ik niet"-style option
  for (const sel of await page.locator("select").all()) {
    const label = await sel
      .evaluate((s) => [...s.options].find((o) => /weet ik niet|niet van toepassing|anders/i.test(o.text))?.text)
      .catch(() => null);
    if (label) {
      await sel.selectOption({ label });
      return;
    }
  }
  // 2) custom combobox: click the "Maak je keuze" trigger, then the option
  const trigger = page.getByText("Maak je keuze", { exact: false }).first();
  if (await trigger.count()) {
    await trigger.click().catch(() => {});
    await page.waitForTimeout(700);
    const opt = page.getByText(/weet ik niet|niet van toepassing|anders/i).first();
    if (await opt.count()) await opt.click().catch(() => {});
  }
}

await run("screenshot-independer.mjs", "independer", async (page, input) => {
  await page.goto(BASE + "/energie/intro.aspx", { waitUntil: "domcontentloaded" });
  await acceptCookies(page, ["#didomi-notice-agree-button", 'button:has-text("Akkoord")']);
  await page.waitForTimeout(800);

  const pcSpaced = input.postcode.slice(0, 4) + " " + input.postcode.slice(4);
  await page.locator("#postcode").click();
  await page.locator("#postcode").pressSequentially(pcSpaced, { delay: 60 });
  await page.locator("#huisnummer").click();
  await page.locator("#huisnummer").pressSequentially(String(input.huisnr), { delay: 60 });
  await page.locator("#huisnummer").blur().catch(() => {});
  // Wait for the address lookup to resolve, which arms the submit.
  await page.waitForResponse((r) => /getaddressdata/i.test(r.url()), { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1200);

  // The intro submit only fires once the address lookup has armed it; retry a
  // few times rather than failing on a single missed click.
  let arrived = false;
  for (let i = 0; i < 5 && !arrived; i++) {
    await page.locator("#salesboxSubmitButton").click().catch(() => {});
    arrived = await page.waitForURL(/\/energie\/invoer\/wensen/, { timeout: 8_000 }).then(() => true).catch(() => false);
    if (!arrived) await page.waitForTimeout(1500);
  }
  if (!arrived) throw new Error("intro kwam niet bij 'Je wensen'");

  // "Je wensen": aansluiting, verbruik, (contracttype overslaan = alle).
  const aansluiting = input.gas > 0 ? "Stroom en gas" : "Alleen stroom";
  await page.getByText(aansluiting, { exact: true }).click().catch(() => {});
  await page.waitForTimeout(400);

  // Single meter (dal 0) collapses the two stroom fields (#stroomVerbruikNormaal
  // + #stroomVerbruikDal) into one #stroomVerbruik.
  if (input.dal === 0) {
    await page.getByText("Ik heb een enkele meter", { exact: false }).click().catch(() => {});
    await page.waitForTimeout(500);
    await page.locator("#stroomVerbruik").fill(String(input.normaal)).catch(() => {});
  } else {
    await page.locator("#stroomVerbruikNormaal").fill(String(input.normaal)).catch(() => {});
    await page.locator("#stroomVerbruikDal").fill(String(input.dal)).catch(() => {});
  }
  if (input.gas > 0) await page.locator("#gasVerbruik").fill(String(input.gas)).catch(() => {});

  if (input.teruglevering > 0) {
    await page.getByText("Ik heb zonnepanelen", { exact: false }).click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // Two required choices gate the "Vergelijken" button.
  await page.getByText("Ik wil overstappen", { exact: true }).click().catch(() => {});
  await page.waitForTimeout(800);
  // "Ik wil overstappen" reveals a required current-supplier picker; the
  // scraper uses "weet ik niet" (huidigeLeverancier 9999).
  await pickCurrentSupplier(page);
  // The wizard forces ONE contract type here (the scraper fetches all); pick
  // the requested one, or "Vast" (meest gekozen) for the default "alle".
  const CONTRACT_LABEL = { vast: "Vast", dynamisch: "Dynamisch", variabel: "Variabel" };
  const wanted = CONTRACT_LABEL[input.contract] ?? "Vast";
  await page.getByText(wanted, { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: "Vergelijken" }).click();
  await page.waitForURL(/\/energie\/(vergelijking|resultaat)/, { timeout: 45_000 }).catch(() => {});
  await page.waitForSelector("text=/energiecontracten/i", { timeout: 45_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // Expand the full ranking (default shows ~10 of N).
  for (let i = 0; i < 6; i++) {
    const more = page.getByRole("button", { name: /Toon volgende/i }).first();
    if (!(await more.count()) || !(await more.isVisible().catch(() => false))) break;
    await more.click().catch(() => {});
    await page.waitForTimeout(1200);
  }
  await page.waitForTimeout(1000);
});
