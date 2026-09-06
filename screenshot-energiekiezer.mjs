#!/usr/bin/env node
// EnergieKiezer.nl screenshot client — fills the homepage widget
// (postcode/huisnummer) and submits to reach the results page, then
// screenshots it. Mirrors energiekiezer-client.mjs' address flow.
//
// NOTE: EnergieKiezer's homepage is a Next.js SPA whose "Vergelijk en
// bespaar" submit is driven entirely client-side. In the browserless
// datacenter environment the submit handler does not always navigate (the
// site flags datacenter traffic — Hotjar refuses to launch on it), so this
// script may stop at the homepage and write an <bron>-FAILED debug shot.
// Run it from a residential IP if it does not advance.

import { run, clickIfVisible } from "./screenshot-lib.mjs";

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
  await page.locator("#postalcode").pressSequentially(pcSpaced, { delay: 80 });
  await page.locator("#housenumber").click();
  await page.locator("#housenumber").pressSequentially(String(input.huisnr), { delay: 80 });
  await page.locator("#housenumber").blur().catch(() => {});
  // Wait for the address lookup that arms the compare button.
  await page.waitForResponse((r) => /\/address/i.test(r.url()), { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  await page.getByRole("button", { name: "Vergelijk en bespaar" }).first().click();
  // Results render on a client-side route; wait for prices to appear.
  await page.waitForFunction(
    () => /€\s?\d|per maand|per jaar/i.test(document.body.innerText) &&
          location.pathname !== "/",
    { timeout: 30_000 }
  );
  await clickIfVisible(page, ['button:has-text("Toon meer")', 'button:has-text("meer resultaten")'], { timeout: 2000 });
  await page.waitForTimeout(1500);
});
