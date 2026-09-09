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
    origin: "home",
  });
  if (input.teruglevering > 0) q.set("solar", String(input.teruglevering));
  await page.goto(`${BASE}/energievergelijker#/search?${q}`, {
    waitUntil: "networkidle",
  });
  await acceptCookies(page);
  await page.waitForSelector('button:has-text("Toon meer resultaten")', { timeout: 30_000 });

  // Expand the list a few times so the screenshot covers more than the top 10.
  for (let i = 0; i < 3; i++) {
    const clicked = await clickIfVisible(page, ['button:has-text("Toon meer resultaten")'], { timeout: 1500 });
    if (!clicked) break;
    await page.waitForTimeout(1000);
  }
});
