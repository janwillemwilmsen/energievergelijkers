#!/usr/bin/env node
// Energievergelijk.nl screenshot client — the Angular results page is
// deep-linkable: zipcode/housenumber/power/power_low/gas (same names as the
// API used by energievergelijk-client.mjs) go straight into the URL hash.

import { run, acceptCookies, clickIfVisible } from "./screenshot-lib.mjs";

const BASE = "https://www.energievergelijk.nl";

await run("screenshot-energievergelijk.mjs", "energievergelijk", async (page, input) => {
  const q = new URLSearchParams({
    zipcode: input.postcode,
    housenumber: String(input.huisnr),
    power: String(input.normaal),
    power_low: String(input.dal),
    gas: String(input.gas),
    price_rate: "m",
    // "2:5" = the "Alle contracten" radio under "Type contract" (the page
    // defaults to "Beste deals", a subset); same filter the CLI sends.
    filters: "2:5",
    origin: "home",
  });
  if (input.teruglevering > 0) q.set("solar", String(input.teruglevering));
  await page.goto(`${BASE}/energievergelijker#/search?${q}`, {
    waitUntil: "networkidle",
  });
  await acceptCookies(page);
  await page.waitForSelector('button:has-text("Toon meer resultaten")', { timeout: 30_000 });
  // Belt and braces: if the SPA ignored the hash filter, tick the radio itself.
  // The radios are custom spans (.ev-radio + .is-checked), not <input>s; the
  // first .fs-contract panel is the desktop one (a hidden mobile copy follows).
  const alle = page.locator('.fs-contract .ev-radio-row:has-text("Alle contracten")').first();
  if (await alle.count()) {
    const checked = (await alle.locator(".ev-radio.is-checked").count()) > 0;
    if (!checked) {
      await alle.click();
      await page.waitForTimeout(1500);
    }
  }

  // Expand the list until everything is on the page (same as the bookmarklet),
  // so the screenshot covers the full ranking, not just the top 10.
  for (let i = 0; i < 15; i++) {
    const clicked = await clickIfVisible(page, ['button:has-text("Toon meer resultaten")'], { timeout: 1500 });
    if (!clicked) break;
    await page.waitForTimeout(1000);
  }
});
