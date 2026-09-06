// Shared library for the screenshot clients (screenshot-*.mjs).
// Connects to a remote browserless instance (BROWSERLESS_URL/-TOKEN in .env),
// drives the site to its results page and stores a full-page screenshot in
// ./screenshots/. CLI flags are identical to the scraper clients:
//   node screenshot-<site>.mjs <postcode> <huisnr> [--normaal N] [--dal N]
//        [--gas N|--geen-gas] [--teruglevering N] [--panelen N]
// Standalone by design — not wired to the dashboard or database.

import { readFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { UA, parseCli } from "./energy-lib.mjs";

// Stealth evasions (hide webdriver, patch navigator/plugins/WebGL, etc.).
// Combined with browserless' own `stealth=true`, this is what lets the
// bot-sensitive sites (EnergieKiezer, Pricewise) advance past their start page.
chromium.use(StealthPlugin());

const ROOT = path.dirname(fileURLToPath(import.meta.url));

export function loadEnv() {
  try {
    for (const line of readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch { /* no .env — env vars may be set externally */ }
}

export async function connect() {
  loadEnv();
  const url = process.env.BROWSERLESS_URL;
  if (!url) {
    console.error("BROWSERLESS_URL ontbreekt — zet hem in .env of als omgevingsvariabele.");
    process.exit(1);
  }
  const token = process.env.BROWSERLESS_TOKEN;
  // timeout: browserless kills sessions after 30s by default — far too short
  // for a full funnel + screenshot.
  // stealth: browserless' own anti-detection layer, on top of the playwright
  // stealth plugin above.
  const params = new URLSearchParams({ timeout: "180000", stealth: "true" });
  if (token) params.set("token", token);
  const qs = (u) => `${u}${u.includes("?") ? "&" : "?"}${params}`;

  // Prefer browserless' native Playwright endpoint: unlike raw CDP it honors
  // viewport emulation, so screenshots come out desktop-width. Fall back to
  // CDP for older builds.
  const base = url.replace(/\/$/, "");
  const browser = await chromium.connectOverCDP(qs(base), { timeout: 30_000 });
  // connectOverCDP attaches to the existing (default) browser context.
  const context = browser.contexts()[0] ?? (await browser.newContext());
  return { browser, context };
}

// Click the first selector that becomes visible — for cookie walls and other
// interstitials. Best-effort: returns false when none showed up.
export async function clickIfVisible(page, selectors, { timeout = 3000 } = {}) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      await loc.waitFor({ state: "visible", timeout });
      await loc.click();
      return true;
    } catch { /* try next */ }
  }
  return false;
}

// Common Dutch consent-manager buttons; site scripts prepend their own exact
// selector so this list is only the fallback.
export const GENERIC_COOKIE_SELECTORS = [
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll", // Cookiebot
  "#CybotCookiebotDialogBodyButtonAccept", // Cookiebot (alt)
  "#onetrust-accept-btn-handler",
  "button#accept-all",
  'button:has-text("Alles accepteren")',
  'button:has-text("Accepteren")',
  'button:has-text("Akkoord")',
  'button:has-text("Ja, ik accepteer")',
];

export async function acceptCookies(page, ownSelectors = []) {
  await clickIfVisible(page, [...ownSelectors, ...GENERIC_COOKIE_SELECTORS]);
}

// Scroll through the whole page so lazy-loaded cards/images render before the
// full-page screenshot, then return to the top.
export async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = 800;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

export async function saveShot(page, name, input) {
  // SHOTS_DIR lets the deployment point this at a persistent volume
  // (e.g. /data/screenshots). Without it, prefer the /data volume when it
  // exists (production — the container FS loses shots on redeploy), else
  // ./screenshots next to the scripts. Keep in sync with shotsBase() in
  // dashboard/lib/shots.ts.
  const dir = process.env.SHOTS_DIR
    ? path.resolve(process.env.SHOTS_DIR)
    : process.platform === "linux" && existsSync("/data")
      ? "/data/screenshots"
      : path.join(ROOT, "screenshots");
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  // SHOT_NAME (set by the dashboard) gives a deterministic filename so reruns
  // overwrite in place; failure debug shots keep a timestamp so they never
  // clobber a good screenshot.
  const base =
    process.env.SHOT_NAME && !/FAILED/.test(name)
      ? `${process.env.SHOT_NAME}.png`
      : `${name}-${input.postcode}-${input.huisnr}-${stamp}.png`;
  const file = path.join(dir, base);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

// Uniform runner: parse CLI, connect, run the site flow, screenshot, clean up.
// On failure a <bron>-FAILED-*.png debug screenshot is still written.
export async function run(scriptName, bron, flow) {
  const input = parseCli(process.argv, scriptName);
  console.log(`${bron}: verbinden met browserless…`);
  const { browser, context } = await connect();
  const page = await context.newPage();
  // Over a CDP connection Playwright's viewport emulation is ignored (pages
  // render at 800x600), so drive the viewport through a raw CDP session.
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false,
  });
  // Over CDP the context userAgent/locale options are ignored (the remote
  // Chrome sends its own Linux UA, which some sites flag as a bot); override
  // both through the CDP session instead.
  await cdp.send("Emulation.setUserAgentOverride", { userAgent: UA, acceptLanguage: "nl-NL,nl;q=0.9" });
  await context.setExtraHTTPHeaders({ "accept-language": "nl-NL,nl;q=0.9" });
  page.setDefaultTimeout(25_000);
  page.setDefaultNavigationTimeout(45_000);
  try {
    await flow(page, input, context);
    await autoScroll(page);
    const file = await saveShot(page, bron, input);
    console.log(`OK ${bron} — screenshot: ${path.relative(ROOT, file)}`);
  } catch (e) {
    console.error(`FAILED ${bron}: ${e.message}`);
    try {
      const dbg = await saveShot(page, `${bron}-FAILED`, input);
      console.error(`  debug-screenshot: ${path.relative(ROOT, dbg)}`);
      console.error(`  url op moment van falen: ${page.url()}`);
    } catch { /* page already gone */ }
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}
