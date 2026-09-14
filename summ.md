# ab-har — repository summary

_Written 2026-09-13 from the code as it stands (19 commits, 2026-08-29 → 2026-09-13)._

## 1. What this repo is

A two-part system for an energy supplier (own brand: **Essent**, configurable) to
track where its contracts rank on six Dutch energy price-comparison websites, and
to keep that history over time for four standard consumption profiles.

| Part | Where | What |
|---|---|---|
| **Scrapers** | repo root, `*-client.mjs` + `energy-lib.mjs` | Seven standalone Node CLIs that query a comparison site's own API/HTML and emit one canonical JSON record per contract. |
| **Screenshot clients** | repo root, `screenshot-*.mjs` + `screenshot-lib.mjs` | Six Playwright scripts that drive the same sites in a real browser (remote browserless) to a results page and save a full-page PNG, for validating scrapes by eye. |
| **Rank Radar dashboard** | `dashboard/` | A Next.js 16 app (App Router, TypeScript, Tailwind v4, Prisma + SQLite, Recharts) that runs the scrapers, ingests their output, stores every run, and visualises own-brand rank, competitors, trends, diffs and screenshots. |

The original brief is in `p.txt` ("build a full-stack dashboard to track and
analyze energy contract rankings across multiple Dutch price-comparison
platforms"). The six platforms: **Gaslicht.com, EnergieKiezer.nl,
Energievergelijk.nl, Independer.nl, Overstappen.nl, Pricewise.nl**. A typical
sweep yields roughly 70–80 contracts per platform, about 450 in total.

Deployment target is **Coolify with Nixpacks** (`nixpacks.toml` in the root),
one container running the dashboard, which spawns the scrapers from its parent
directory. Only `/data` persists between deploys (SQLite database and
screenshots live there).

---

## 2. Repository layout

```
ab-har/
├── energy-lib.mjs               shared CLI parsing, filtering, canonical record, output
├── gaslicht-client.mjs          ┐
├── energiekiezer-client.mjs     │
├── energievergelijk-client.mjs  │  one scraper per comparison site
├── independer-client.mjs        │
├── overstappen-client.mjs       │
├── pricewise-client.mjs         ┘
├── essent-client.mjs            own-brand offer client (Essent.nl funnel API)
├── screenshot-lib.mjs           browserless connection, stealth, viewport, saveShot(), run()
├── screenshot-<site>.mjs        six browser-driven screenshot clients
├── SCREENSHOTS.md               how the screenshot clients work, per-site quirks
├── nixpacks.toml                Coolify build/start phases for the whole repo
├── package.json                 root deps (playwright-extra, stealth) + proxies npm scripts into dashboard/
├── p.txt                        original product brief
├── .env                         BROWSERLESS_URL / BROWSERLESS_TOKEN (git-ignored)
├── screenshots/                 local screenshot output (git-ignored)
└── dashboard/                   the Rank Radar Next.js app (see §5)
```

---

## 3. The scrapers (repo root)

### 3.1 Shared library — `energy-lib.mjs`

Guarantees that every client behaves identically:

- **Uniform CLI**: `node <site>-client.mjs <postcode> <huisnr> [--normaal N] [--dal N] [--gas N | --geen-gas] [--teruglevering N] [--panelen N] [--contract vast|variabel|dynamisch|combinatie|alle] [--looptijd 1|2|3|alle] [--json]`. Defaults: 2500 kWh normaal, 750 kWh dal, 500 m³ gas, no solar. Feed-in is split over normaal/dal in the same ratio as consumption; panel count defaults to feed-in ÷ 350.
- **Canonical record**: 35 fixed Dutch-named keys in fixed order (`bron`, `opgehaaldOp`, address, usage, `leverancier`, `product`, `contractType`, `looptijdMaanden`, `prijsPerMaand`, `prijsPerJaar`, `prijsPerJaarExclKorting`, `korting`, all-in and delivery-only tariffs, fixed costs, `terugleverVergoedingPerKwh`, `rating`, `aantalReviews`, `duurzaamheidsScore`, `labels`, `bronOfferId`). Unknown values are `null`, never omitted. Tariff convention: `tariefStroom*`/`tariefGas` are all-in per kWh/m³ (incl. btw and energiebelasting); the `*Levering` variants are delivery-only.
- **Uniform filtering**: each client always fetches the site's maximum, then `filterRecords` applies `--contract` / `--looptijd` client-side so the flags mean the same everywhere. `sortRecords` orders by `prijsPerJaar`.
- **Output**: human-readable list, or `--json` for the canonical records the dashboard ingests.

### 3.2 Per-site clients

Each was reverse-engineered from a recorded HAR (late August 2026) and documents its mechanism in its header:

| Client | Mechanism |
|---|---|
| `gaslicht-client.mjs` | ASP.NET form flow + HTML scraping. Gets an antiforgery token from `/`, POSTs the comparison form, follows the 302 to the results page (different path for stroom+gas vs alleen stroom, and it matters: the dual-fuel path also answers for a no-gas session but with wrong prices), then XHR `?partial=true&take=100` per contract type plus a price-details fragment per offer. |
| `energiekiezer-client.mjs` | Clean unauthenticated JSON API (`api.energiekiezer.nl/api/v1`): `GET /address` then `POST /search`. `meterType: "smart"` is required for dynamic contracts to appear. |
| `energievergelijk-client.mjs` | One unauthenticated `POST https://compare.energievergelijk.nl/api/search`. Endpoint moved 2026-09-09 (old host now CNAMEs to WordPress). |
| `independer-client.mjs` | JSON API with ASP.NET Core antiforgery (XSRF cookie echoed as header). Returns one contract kind per call, so "alle" fetches Vast + Variabel + Dynamisch and merges. |
| `overstappen-client.mjs` | Public REST API (`api.overstappen.nl`) with a static Basic credential lifted from the site's frontend bundle. Two GETs. |
| `pricewise-client.mjs` | AngularJS app over a session JSON API whose request bodies must be **LZW-compressed** (WAF returns 403 on plain JSON) and whose responses come back as an `ojc_blob` in the same format. Multi-step funnel with GUID headers. Tariffs are delivery-only. |
| `essent-client.mjs` | Essent.nl's own `/api/public/` funnel; produces the own brand's offers in the same canonical shape. Not one of the six platforms; used for reference/validation. |

---

## 4. The screenshot clients (repo root)

Purpose: see what the site actually renders for the same address and usage as a scrape. Documented in `SCREENSHOTS.md`.

### 4.1 `screenshot-lib.mjs`

- Connects over CDP to a remote **browserless** instance (`BROWSERLESS_URL`, `BROWSERLESS_TOKEN`, read from `.env` or the environment) with `stealth=true` and a 180 s session timeout, plus `playwright-extra` with the puppeteer stealth plugin. EnergieKiezer and Pricewise refuse to advance past their start page without this stack.
- Over CDP Playwright's viewport/UA options are ignored, so it forces a 1440-wide desktop viewport and a Windows Chrome user agent through a raw CDP session.
- `run(scriptName, bron, flow)`: parses the same CLI as the scrapers, runs the site flow, auto-scrolls so lazy content renders, then `saveShot()`. On failure it still writes a `<site>-FAILED-<stamp>.png` debug shot and prints the URL at the point of failure.
- `saveShot()` output location: `SHOTS_DIR` if set, else `/data/screenshots` on Linux when `/data` exists (production), else `./screenshots`. `SHOT_NAME` (set by the dashboard) gives a deterministic `<platform>.png` so reruns overwrite in place.

### 4.2 Per-site flows and quirks

| Client | Route to the results page |
|---|---|
| `screenshot-gaslicht.mjs` | Mirrors the scraper: read the antiforgery token, POST the form in-page, navigate to the redirected results URL. |
| `screenshot-energievergelijk.mjs` | The Angular results page is deep-linkable; usage goes straight into the URL hash. |
| `screenshot-overstappen.mjs` | Walks the progressive "Jouw gegevens" wizard. |
| `screenshot-pricewise.mjs` | Start form → results; the compare button is two-phase (first click validates the address, second fires the redirect). |
| `screenshot-independer.mjs` | Intro form (submit only arms after the address lookup returns) → "Je wensen" wizard (aansluiting, usage, solar toggle synced to the input because the session remembers previous answers, "Ik wil overstappen", current supplier, one forced contract type) → results. Then switches the sort select to **Goedkoopste** and expands the full ranking. |
| `screenshot-energiekiezer.mjs` | Does **not** use the homepage widget. The site keeps its wizard state in `sessionStorage["ekUser"]`; the client resolves the address via the public API, seeds that state (usage, gas on/off, solar, `sortBy: "price"` = Goedkoopste) and opens `/mijn-wensen/resultaten` directly (~13 s). The old widget flow is kept only as a fallback. |

Both Independer and EnergieKiezer sort on lowest price and warn on stderr if the visible list prices are not ascending.

---

## 5. The dashboard — `dashboard/` ("Rank Radar")

### 5.1 Stack

- **Next.js 16.3.4** (App Router, Turbopack), **React 19**, **TypeScript** strict, alias `@/*`.
- **Tailwind CSS v4** via `@tailwindcss/postcss`, Geist fonts.
- **Prisma 6.19** on **SQLite** (`DATABASE_URL`, dev `file:./dev.db`, prod `file:/data/rankradar.db`). No migrations directory: production runs `prisma db push` + seed on every boot. Schema is kept Postgres-portable (raw JSON stored as string).
- **Recharts 3** for all charts.
- **No auth, no tests.** Only `eslint` (next core-web-vitals + typescript). All API routes and `/admin` are open.
- `next.config.ts` only pins `turbopack.root` (two lockfiles in the repo confused root inference).
- `CLAUDE.md` just includes `AGENTS.md` (a Next-generated notice about reading the bundled Next docs).

### 5.2 Data model (`prisma/schema.prisma`)

No Prisma enums; enum-like values are strings.

- **Platform** — a comparison site: `name` (slug, unique), `label`, `baseUrl`. Six seeded.
- **Supplier** — an energy supplier: `name` (unique, normalised at ingest so "OXXIO Nederland B.V." and "Oxxio" are one row), `isMyCompany` (own-brand flag).
- **Scenario** — a consumption profile: `name`/`label` (preset slug and display name, null for custom), `sortOrder`, `electricityNormal`, `electricityLow` (0 = single meter), `gas` (0 = electricity-only), `solarFeedIn`, `isPreset`. Unique on the usage tuple, so custom scenarios are find-or-created by usage.
- **Setting** — key/value; currently `defaultPostcode` and `defaultHuisnr`.
- **ScrapeRun** — one scraper execution for one platform and one scenario: `sweepId` (groups the six runs of a sweep; an "all presets" sweep puts four scenarios under one sweepId), `scrapedAt`, `postcode`, `houseNumber`, `status` (`completed|failed|partial`), `error`, `offerCount`.
- **ContractOffer** — one ranked contract in a run: `contractName`, `contractType` (`vast|variabel|dynamisch|combinatie`), `durationMonths`, **`rank`** (by annual cost within the run) and **`typeRank`** (within the same contract type), `annualCost`, `monthlyCost`, `annualCostExDiscount`, `discount`, `feedInTariff`, `tariffElecNormal/Low`, `tariffGas`, `rating`, `reviewCount`, `rawJson` (the full canonical scraper record). Cascades on run delete.

### 5.3 Pages (8)

| Route | Purpose |
|---|---|
| `/` | Home: scenario picker chips, "▶ Scrape dit scenario" / "⟳ Ververs alle presets" with live x/6 progress and a log viewer, custom-scrape form (address validated live), six per-platform KPI cards (own rank, delta vs previous run, own price, leader and gap), and a preset × contract-type × platform matrix. |
| `/archive` | Every sweep grouped per scenario, newest first, with counts, price/cashback ranges, type mix and per-supplier counts. |
| `/archive/scan` | Full detail of one scan: per-platform stats, six side-by-side ranking columns with type/provider filters and brand-highlight pills, price-spread chart, cashback-vs-price scatter, contract-type mix, tariff table and scatter, provider × platform matrix, full offers table. Under each ranking column a footer either opens that platform's screenshot in a small popup window or takes one for just that platform. |
| `/archive/scan/screenshot` | Screenshot runner and gallery for one scan: which of the six PNGs exist, run/retry all or one, live per-platform progress via an NDJSON stream, inline images and failure debug shots. |
| `/archive/diff` | Compare two scans of the same scenario: per-platform summary (count, new/gone, cheapest delta) and a per-contract table with rank and €/yr deltas, filterable on Nieuw/Verdwenen/Gestegen/Gedaald. |
| `/archive/vergelijk` | Time series for one scenario: rank line chart per supplier (inverted y-axis, own brand emerald), movers table, cross-platform chart with 13 switchable metrics, stacked contract-type-mix area chart. |
| `/admin` | Every run incl. failed/partial, grouped per sweep, with delete per run or per scan. |
| `/admin/presets` | Editable default scrape address and full CRUD/reorder of preset scenarios. |

### 5.4 API routes (20)

**Scrape pipeline**
- `POST /api/scrapes/run` — `{scenarioId, postcode?, huisnr?}` or `{presets:true}`. Generates a `sweepId`, enforces a **12-hour cooldown** on preset sweeps (HTTP 429 unless an explicit address is given), then spawns `scripts/run-scrapes.mjs` **detached** with output in `sweep-<sweepId>.log`.
- `GET /api/scrapes/status` — per-platform progress for a sweep. `GET /api/scrapes/log` — last 120 lines of the sweep log.
- `POST /api/scrapes/ingest` — the heart: takes one platform's raw records (or a failure report), upserts Platform, Scenario (by usage tuple) and normalised Suppliers (flagging the own brand), assigns `rank` and `typeRank` by annual cost, creates the ScrapeRun and bulk-inserts the offers with `rawJson`.

**Presets and config**
- `GET/POST /api/presets`, `PATCH/DELETE /api/presets/[id]`, `PUT /api/presets/order`, `GET/PUT /api/presets/address`. The runner scripts read presets and the default address from this API rather than from code.
- `GET/POST /api/scenarios` — all scenarios (presets first, with run counts and cooldown info); find-or-create a custom one.

**Read endpoints**
- `GET /api/overview` and `/api/overview/presets` — own-brand rank cards and the homepage matrix (shared logic in `lib/overviewCards.ts`).
- `GET /api/offers` — all offers from the latest completed run per platform.
- `GET /api/trends` and `/api/trends/overview` — rank time series per supplier, and per-platform aggregate series (cheapest, avg, count, cashback, own rank/delta, tariff min/avg/max, rating, type mix).
- `GET /api/archive`, `/api/archive/scan` — sweeps grouped per scenario; one scan in full (recovers Pricewise's delivery-only tariffs from `rawJson`).
- `GET/POST /api/archive/scan/screenshot` — list existing PNGs for a sweep (per scenario); run the screenshot clients per platform sequentially and stream NDJSON progress. `GET /api/archive/scan/screenshot/image` — serve a PNG or the newest failure debug shot.
- `GET/DELETE /api/admin/runs` — list everything; delete by run or by sweep.
- `GET /api/address/check` — validate a Dutch address via EnergieKiezer's public address API, falling back to Essent's.

### 5.5 Scripts

- `scripts/run-scrapes.mjs` — the sweep runner. Fetches presets and default address from the dashboard's `/api/presets` (refuses to guess if the dashboard is down), runs the six root scrapers with `--json` (300 s timeout each) and POSTs records, or a failure report, to `/api/scrapes/ingest`, so the UI never hangs at 0/6.
- `scripts/run-screenshots.mjs` — same shape for the screenshot clients, sequential because they share one browserless. The dashboard's screenshot API spawns the clients directly instead of using this script.
- `scripts/backfill-type-rank.mjs` — idempotent backfill of `typeRank`; runs on every production boot.
- `prisma/seed.mjs` — reference data only: six platforms, sixteen known suppliers (own brand flagged), the four presets **only if none exist yet**, and the default address. Plain Node, so constants are duplicated from `lib/` on purpose.

### 5.6 `lib/`

| Module | Role |
|---|---|
| `domain.ts` | The six platforms, initial preset scenarios, `MY_COMPANY` (env `MY_COMPANY_NAME`, default Essent), ~55 supplier aliases + `normalizeSupplier()`, `normalizeContractType()`, the `ScraperRecord` type. |
| `presets.ts` | Preset/config loader: default address (5216EK 27), 12 h cooldown, scenario ordering, validators for postcode/huisnr/slug/usage. |
| `overviewCards.ts` | Shared "where do we stand" computation from the two most recent runs per platform. |
| `shots.ts` | Screenshot filesystem layout: repo-root discovery, `SHOTS_DIR` → `/data/screenshots` → `./screenshots`, one folder per sweep with an `s<scenarioId>` sub-folder for multi-scenario sweeps, platform allowlist (path-traversal guard). |
| `platformColors.ts` | One colour family per platform for charts and chips. |
| `scenarioLabel.ts` | Human labels like "2.900 kWh / 1.200 m³" or "… / mono", "+ 2.000 terug". |
| `db.ts` | Prisma client singleton. |

### 5.7 Components (8)

`Dashboard` (home shell), `ScenarioPicker` (preset chips + sweep buttons with cooldown), `ScrapeControls` (progress bar, per-platform ✓/✗ chips, log toggle), `ScrapeForm` (custom scrape with live address validation), `KpiCards`, `PresetMatrix`, `OffersTable` (sortable, multi-filter, 25/page, "only mine"), and the `useSweep` hook (starts a sweep, polls status every 5 s, 20 min timeout).

### 5.8 Scenario presets

Initial values (seeded once; afterwards the live set is the `Scenario` rows with `isPreset`, edited on `/admin/presets`):

| Slug | Label | Electricity | Gas | Feed-in |
|---|---|---|---|---|
| low | Laag | 1.500 kWh | 800 m³ | — |
| medium | Midden | 2.900 kWh | 1.200 m³ | — |
| high | Hoog | 4.500 kWh | 2.000 m³ | — |
| solar | Zon | 3.500 kWh | 1.000 m³ | 2.000 kWh |

### 5.9 Own-brand concept

`MY_COMPANY_NAME` (default `Essent`) is read in `lib/domain.ts` and `prisma/seed.mjs`, materialised as `Supplier.isMyCompany` at seed and ingest time. Everything downstream reads the DB flag: KPI cards, matrix, trends, archive counts, and the green "WIJ" badge / emerald row highlight in tables and charts. Changing the env var later does not re-flag existing supplier rows.

---

## 6. Runtime flow, end to end

1. User picks a scenario on `/` and clicks scrape (or a Coolify scheduled task runs `node scripts/run-scrapes.mjs --scenario all`).
2. `POST /api/scrapes/run` spawns `run-scrapes.mjs` detached with a fresh `sweepId`.
3. The runner fetches presets/address from the API, then runs each root `*-client.mjs --json` and POSTs the records to `/api/scrapes/ingest`.
4. Ingest normalises suppliers, derives/upserts the scenario from the usage in the records, ranks the offers and stores run + offers.
5. The UI polls `/api/scrapes/status` and refreshes cards as platforms complete.
6. From a scan page, screenshots can be taken per platform; the dashboard spawns `screenshot-<site>.mjs` with `SHOTS_DIR`/`SHOT_NAME` so the PNG lands in `<shots>/<sweepId>[/s<scenarioId>]/<platform>.png`, then serves it back.

---

## 7. Configuration and deployment

**Environment variables**

| Variable | Read by | Purpose |
|---|---|---|
| `DATABASE_URL` | Prisma | SQLite file; prod `file:/data/rankradar.db`. |
| `MY_COMPANY_NAME` | dashboard, seed | Own brand, default Essent. |
| `BROWSERLESS_URL`, `BROWSERLESS_TOKEN` | `screenshot-lib.mjs` | Remote browser for screenshots. |
| `SHOTS_DIR` | `lib/shots.ts`, `screenshot-lib.mjs` | Override screenshot root (else `/data/screenshots` in prod). |
| `SHOT_NAME` | `screenshot-lib.mjs` | Set per child by the dashboard for deterministic filenames. |
| `DASHBOARD_URL` | runner scripts | Where to fetch presets / POST ingest (default `http://localhost:3000`). |
| `PORT` | `/api/scrapes/run` | Builds the loopback `DASHBOARD_URL` for the spawned runner. |

**Coolify / Nixpacks** (`nixpacks.toml`): Base directory must be the repo root, not `/dashboard`, because the dashboard spawns the scrapers from its parent. Node 22 + openssl. Install runs `npm ci` in both root and `dashboard/`; build runs `prisma generate` + `next build`; start runs `prisma db push`, the seed, the typeRank backfill, then `next start` on port 3000. Persistent volume on `/data`. No Chromium in the image: screenshots go through browserless over CDP.

**Local development**: `npm install` in both dirs, `npx prisma db push`, `npx prisma db seed`, `npm run dev` (root `package.json` proxies to `dashboard/`). Scrapers and screenshot clients run directly from the root with the uniform CLI.

---

## 8. Housekeeping notes

- `.env` (root and dashboard) is git-ignored and untracked; the browserless token lives only on disk.
- Five `dashboard/sweep-ui-*.log` files are tracked in git despite the ignore rule (added before it); about 28 exist locally.
- `screenshots/` and `prisma/*.db` are ignored.
- No tests and no auth: the app assumes a trusted network in front of it.
- Documentation lives in `dashboard/README.md` (Dutch, stack, quick start, ingest, Coolify table, API table) and `SCREENSHOTS.md` (screenshot clients, per-site quirks, storage layout).
