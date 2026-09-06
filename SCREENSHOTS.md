# Screenshot clients (scrape validation)

Standalone Playwright scripts that drive each comparison site to its **results
page** in a real browser (via a remote [browserless](https://www.browserless.io)
instance) and save a **full-page screenshot** to `./screenshots/`. Use them to
eyeball a scrape against what the site actually renders for the same address and
usage. They are deliberately **not** wired to the dashboard or database.

One file per site, all sharing `screenshot-lib.mjs`. All six reach the full
results ranking and screenshot it:

| Site | Script |
|------|--------|
| Gaslicht.com | `screenshot-gaslicht.mjs` |
| Energievergelijk.nl | `screenshot-energievergelijk.mjs` |
| Overstappen.nl | `screenshot-overstappen.mjs` |
| Independer.nl | `screenshot-independer.mjs` |
| EnergieKiezer.nl | `screenshot-energiekiezer.mjs` |
| Pricewise.nl | `screenshot-pricewise.mjs` |

## Setup

Dependencies (repo root): `playwright-core`, `playwright-extra`,
`puppeteer-extra-plugin-stealth`. The scripts read the browserless connection
from `.env`:

```
BROWSERLESS_URL=wss://browserless.chatle.nl
BROWSERLESS_TOKEN=xxxxxxxx
```

(These are read directly from `.env`; no extra tooling needed. Env vars set in
the shell take precedence.)

## Usage

Same CLI as the scraper clients — nothing is hard-coded, you pass it all in:

```sh
node screenshot-gaslicht.mjs <postcode> <huisnr> [options]
```

Options (all optional, same defaults as the scrapers):

| Flag | Meaning | Default |
|------|---------|---------|
| `--normaal N` | stroom normaal/piek kWh/jaar | 2500 |
| `--dal N` | stroom dal kWh/jaar | 750 |
| `--gas N` | gas m³/jaar | 500 |
| `--geen-gas` | alleen stroom (gas = 0) | — |
| `--teruglevering N` | teruglevering kWh/jaar | 0 |
| `--panelen N` | aantal zonnepanelen | teruglevering/350 |
| `--contract T` | vast \| variabel \| dynamisch \| alle | alle |

Examples:

```sh
# Default household, with gas
node screenshot-gaslicht.mjs 5216EK 27

# High usage, electricity only
node screenshot-overstappen.mjs 1011AB 1 --normaal 4000 --dal 1500 --geen-gas

# With solar feed-in
node screenshot-independer.mjs 5216EK 27 --gas 800 --teruglevering 3000
```

Output: `<SHOTS_DIR>/<site>-<postcode>-<huisnr>-<timestamp>.png` (defaults to
`./screenshots/`). On failure a `<site>-FAILED-…png` debug shot and the URL at
the point of failure are written.

## From the dashboard UI

Each scan detail page (`/archive/scan?sweepId=…`) has a **📷 Screenshots**
button that opens `/archive/scan/screenshot?sweepId=…`. That page runs the
clients for the scan's **own** postcode + usage (so the shots are directly
comparable to the scrape), streaming live per-platform status (spinner →
✓/✗) via `POST /api/archive/scan/screenshot`, and shows each finished
screenshot inline (served by `/api/archive/scan/screenshot/image`).

## From the CLI / in production

The dashboard triggers screenshots the same way it triggers sweeps — by
spawning a child process, not by importing Playwright into Next.js:

```sh
# from the dashboard/ directory
node scripts/run-screenshots.mjs --scenario medium --postcode 5216EK --huisnr 27
node scripts/run-screenshots.mjs --only pricewise --normaal 2900 --gas 1200
```

`run-screenshots.mjs` runs the `screenshot-*.mjs` clients from the repo root
(same `SCRAPER_DIR` resolution as `run-scrapes.mjs`) and prints the saved path
per platform. `--scenario low|medium|high|solar` uses the shared presets, or
pass `--normaal/--dal/--gas/--teruglevering`; `--only <platform>` runs one.

**Deployment (Nixpacks/Coolify):**

- `nixpacks.toml` installs **both** npm projects: `npm ci` (root — the
  screenshot deps) and `cd dashboard && npm ci`. No system Chromium is
  installed; the clients connect to a remote browserless over CDP.
- Set these env vars in Coolify: `BROWSERLESS_URL`, `BROWSERLESS_TOKEN`, and
  optionally `SHOTS_DIR=/data/screenshots` to keep screenshots on the
  persistent volume (otherwise they live in the ephemeral container FS).

## Notes

- **Stealth**: `screenshot-lib.mjs` uses `playwright-extra` with
  `puppeteer-extra-plugin-stealth`, and connects to browserless with
  `stealth=true`. EnergieKiezer and Pricewise flatly refuse to advance past
  their start page without this (EnergieKiezer's own Hotjar flags the session
  as a bot; both submit their form client-side and the handler no-ops for a
  detected browser). The other four sites work with or without it.
- **Viewport / UA**: browserless is driven over CDP, where Playwright's viewport
  and user-agent options are ignored. `screenshot-lib.mjs` forces a 1440-wide
  desktop viewport and a Windows Chrome UA through the CDP session instead.
- **Timing quirks** (encoded in the scripts, noted here so they are not
  "simplified" away):
  - *EnergieKiezer* — enter postcode/huisnummer as real keystrokes, Tab out of
    each field, wait for the address lookup, pause, then click **once**. Rapid
    re-clicks make the submit no-op.
  - *Pricewise* — the compare button is two-phase: the first click validates the
    address, a second click fires the redirect to `/energie/resultaat-v5/`.
  - *Independer* — the intro submit only arms once `/api/address/getaddressdata`
    returns; the "Je wensen" step then requires overstappen + current supplier +
    a contract type before "Vergelijken".
- **Contract type**: Independer's wizard forces one contract type (default
  "Vast"; pass `--contract dynamisch|variabel` to switch). The other five show
  all types at once, matching the scrapers' default `alle`.
- Screenshots and `.env` are git-ignored.
