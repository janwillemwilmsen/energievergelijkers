#!/usr/bin/env node
// Gaslicht.com screenshot client — loads the real results page in a browser
// (via browserless) and stores a full-page screenshot for scrape validation.
// Flow mirrors gaslicht-client.mjs: read the antiforgery token from the
// homepage, POST the comparison form in-page (same session/cookies), then
// navigate to the results page the POST redirects to: /energievergelijken/
// resultaten (stroom + gas) or /stroom-vergelijken/resultaten (alleen stroom).
// Never hardcode the former: it also renders for a no-gas session, but with
// dual-fuel products priced on a default gas usage.

import { run, acceptCookies } from "./screenshot-lib.mjs";

const BASE = "https://www.gaslicht.com";

await run("screenshot-gaslicht.mjs", "gaslicht", async (page, input) => {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await acceptCookies(page, ['button:has-text("Prima")', ".js-cookie-accept"]);

  const token = await page
    .locator('input[name="__RequestVerificationToken"]')
    .first()
    .inputValue();

  const form = {
    __RequestVerificationToken: token,
    postal: input.postcode.slice(0, 4) + " " + input.postcode.slice(4),
    houseNr: String(input.huisnr),
    housenrAdditional: "",
    huidigeLeverancier: "",
    inputhelp: "custom",
    typemeter: "double",
    stroomhoogverbruik: String(input.normaal),
    stroomlaagverbruik: String(input.dal),
    terugstroomhoog: input.terugNormaal ? String(input.terugNormaal) : "",
    terugstroomlaag: input.terugDal ? String(input.terugDal) : "",
    gasverbruik: input.gas > 0 ? String(input.gas) : "",
    "solar-panels": input.panelen ? String(input.panelen) : "",
    targetGroup: "Consumer",
    calculateDateTime: "",
    contractEndDate: "",
  };
  if (input.gas === 0) form.isNoGas = "true";

  // Same-origin POST from within the page: browser cookies + session apply.
  const { status, url } = await page.evaluate(async (body) => {
    const res = await fetch("/energievergelijker/start", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
      redirect: "follow",
      credentials: "include",
    });
    return { status: res.status, url: res.url };
  }, form);
  if (status >= 400) throw new Error(`POST /energievergelijker/start -> ${status}`);
  const landed = url ? new URL(url).pathname : "";
  const resultsPath = /resultaten/.test(landed)
    ? landed
    : input.gas === 0 ? "/stroom-vergelijken/resultaten" : "/energievergelijken/resultaten";
  if (input.gas === 0 && !/stroom-vergelijken/.test(resultsPath))
    throw new Error(`alleen-stroom request landed on ${resultsPath} (expected /stroom-vergelijken/...)`);

  // ContractType=All…: the UI defaults to "vast 1 jaar", but the scraper
  // fetches every contract type — show the same maximum in the screenshot.
  const q = new URLSearchParams({
    ContractType: "All,Vast,Vast1Jaar,Vast2JaarOfMeer,Dynamic,DynamicCombination,Variabel",
    take: "100",
  });
  await page.goto(`${BASE}${resultsPath}?${q}`, { waitUntil: "networkidle" });
  await page.waitForSelector(".js-comparison-list-product", { timeout: 30_000 });
  await acceptCookies(page, ['button:has-text("Prima")', ".js-cookie-accept"]);
});
