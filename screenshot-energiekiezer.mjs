#!/usr/bin/env node
// EnergieKiezer.nl screenshot client.
//
// Primary route — no homepage widget at all. The site is a Next.js app that
// keeps the whole wizard state in sessionStorage["ekUser"] ({house, user,
// userChoices, userFilters}) and the results page (/mijn-wensen/resultaten)
// rebuilds itself from that on load. So: resolve the address via the public
// API (same call energiekiezer-client.mjs makes), seed that state, open the
// results URL, wait for prices. Reaches the ranking in ~6s versus 60-180s
// (and frequent timeouts) via the homepage form.
//
// Why not the homepage form: it's a React (Chakra) controlled form that
// silently no-ops its submit when keystrokes land before hydration, when the
// address lookup hasn't settled, on rapid re-clicks, and its address dropdown
// overlays the inputs so Playwright's click actionability check stalls for
// 25s. That flow is kept below only as a FALLBACK when the seeded results
// page doesn't render (e.g. the storage key changes after a site deploy).
//
// EnergieKiezer is bot-sensitive: both routes need the stealth stack in
// screenshot-lib.mjs (playwright stealth plugin + browserless stealth=true).

import { run, acceptCookies } from "./screenshot-lib.mjs";
import { UA } from "./energy-lib.mjs";

const BASE = "https://www.energiekiezer.nl";
const API = "https://api.energiekiezer.nl/api/v1";
const COOKIE_BTN = "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll";
const PRICES_RE = /€\s?\d|per maand|per jaar/i;

// Address as the site stores it (street/city are cosmetic but keep the
// "Je levering" summary identical to a manual run). Never fatal.
async function lookupAddress(pcSpaced, huisnr) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    const res = await fetch(
      `${API}/address?postalCode=${encodeURIComponent(pcSpaced)}&houseNumber=${huisnr}&withPossibleAdditions=true`,
      { headers: { accept: "application/json", origin: BASE, referer: BASE + "/", "user-agent": UA }, signal: ctrl.signal }
    );
    clearTimeout(t);
    if (!res.ok) return {};
    const a = await res.json();
    if (!a?.isFound) return {};
    return { street: a.street, city: a.city, isResidential: a.isResidential ?? true };
  } catch {
    return {};
  }
}

// sessionStorage["ekUser"] exactly as the site writes it after "Je verbruik"
// with "Ik weet mijn exacte verbruik" (captured 2026-09-13). meterType "smart"
// matches the scraper (required for dynamic contracts to show).
function buildState(input, address) {
  const consumption = { electricity: input.normaal, electricityOffPeak: input.dal };
  if (input.gas > 0) consumption.gas = input.gas;
  const solar = input.teruglevering > 0;
  return {
    house: {
      consumption,
      grossConsumption: { ...consumption },
      production: { electricity: solar ? input.terugNormaal : 0, electricityOffPeak: solar ? input.terugDal : 0 },
      meterType: "smart",
      houseNumber: String(input.huisnr),
      houseNumberAddition: "",
      postalCode: input.postcode.slice(0, 4) + " " + input.postcode.slice(4),
      ...address,
      extraInfo: {
        solarGeneration: solar ? input.teruglevering : 0,
        solarSelfConsumed: 0,
        solarFedBack: solar ? input.teruglevering : 0,
        batteryExtraSelfConsumed: 0,
      },
    },
    user: {},
    userChoices: {
      usageKnown: "yes",
      householdSize: "two",
      smartMeter: true,
      useElectricity: true,
      useGas: input.gas > 0,
      solarPanels: solar,
      homeBattery: false,
      priorities: ["priceQuality"],
      appliances: [],
      contractSuggestions: [],
    },
    userFilters: {
      contractDuration: [],
      contractType: [],
      costBelowPriceCap: false,
      costInterval: "month",
      electricityType: [],
      gasType: [],
      providers: [],
      sortBy: "priceQuality",
      onlyAvailableForSignup: false,
    },
  };
}

async function waitForPrices(page, timeout) {
  return page
    .waitForFunction((re) => new RegExp(re, "i").test(document.body.innerText), PRICES_RE.source, { timeout })
    .then(() => true, () => false);
}

async function seededResults(page, input) {
  const pcSpaced = input.postcode.slice(0, 4) + " " + input.postcode.slice(4);
  const address = await lookupAddress(pcSpaced, input.huisnr);
  const state = buildState(input, address);
  // Any same-origin page gives us the sessionStorage scope; the wizard page is
  // light and doesn't redirect.
  await page.goto(BASE + "/mijn-wensen", { waitUntil: "domcontentloaded" });
  await page.evaluate((s) => sessionStorage.setItem("ekUser", JSON.stringify(s)), state);
  await page.goto(BASE + "/mijn-wensen/resultaten", { waitUntil: "domcontentloaded" });
  await acceptCookies(page, [COOKIE_BTN]);
  const ok = (await waitForPrices(page, 30_000)) && /resultaten/.test(page.url());
  if (ok) {
    // Sanity check: the ranking must reflect OUR usage, not the site defaults.
    const summaryOk = await page
      .evaluate((n) => new RegExp(`\\b${n}\\s*kWh`).test(document.body.innerText), input.normaal)
      .catch(() => false);
    if (summaryOk) return true;
    console.error("energiekiezer: resultaten tonen niet het opgegeven verbruik — terugvallen op de homepage-flow");
  }
  return false;
}

// Fallback: the homepage widget -> "mijn-wensen" -> results, as before.
async function widgetFlow(page, input) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const cookie = page.locator(COOKIE_BTN);
  await cookie.waitFor({ state: "visible", timeout: 12_000 }).catch(() => {});
  if (await cookie.isVisible().catch(() => false)) {
    await cookie.click();
    await page.waitForTimeout(1200);
  }

  // Controlled React form: keystrokes before hydration never reach React
  // state (the submit then fails validation), so wait for hydration and check
  // the value React holds, retyping on mismatch.
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
  // force: the address-suggestion dropdown overlays the inputs after a lookup
  // and makes Playwright's actionability check stall for the full timeout.
  const typeField = async (sel, text) => {
    const loc = page.locator(sel);
    await loc.click({ force: true });
    await loc.fill("");
    await loc.pressSequentially(text, { delay: 90 });
    await page.keyboard.press("Tab");
  };
  const pcSpaced = input.postcode.slice(0, 4) + " " + input.postcode.slice(4);
  const huisnr = String(input.huisnr);
  const fillAddress = async () => {
    for (let i = 0; i < 2; i++) {
      const lookup = page.waitForResponse((r) => /\/address/i.test(r.url()), { timeout: 15_000 }).catch(() => null);
      await typeField("#postalcode", pcSpaced);
      await typeField("#housenumber", huisnr);
      await lookup;
      await page.waitForTimeout(1500);
      const pcOk = (await reactValue("#postalcode")).replace(/\s/g, "").toUpperCase() === input.postcode.toUpperCase();
      const nrOk = (await reactValue("#housenumber")).trim() === huisnr;
      if (pcOk && nrOk) return;
      await page.waitForTimeout(1000);
    }
  };
  await fillAddress();
  await page.waitForTimeout(3000);

  const submit = page.getByRole("button", { name: "Vergelijk en bespaar" }).first();
  const validation = page.getByText(/Vul alsjeblieft|ongeldig/i).first();
  let advanced = false;
  for (let attempt = 0; attempt < 3 && !advanced; attempt++) {
    if (attempt > 0) await page.waitForTimeout(4000);
    if (await validation.isVisible().catch(() => false)) await fillAddress();
    await submit.click({ force: true }).catch(() => {});
    advanced = await page.waitForURL(/mijn-wensen/i, { timeout: 12_000 }).then(() => true, () => false);
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
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // "Mijn wensen": exact usage, meter, solar, then results.
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
  await page.waitForURL(/resultaten/, { timeout: 20_000 }).catch(() => {});
  if (!(await waitForPrices(page, 30_000))) throw new Error(`geen prijzen zichtbaar op ${page.url()}`);
}

await run("screenshot-energiekiezer.mjs", "energiekiezer", async (page, input) => {
  const seeded = await seededResults(page, input).catch((e) => {
    console.error(`energiekiezer: seeded route mislukt (${e.message}) — terugvallen op de homepage-flow`);
    return false;
  });
  if (!seeded) await widgetFlow(page, input);
  // Let the lazy card images/logos settle before the full-page shot.
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1500);
});
