# Screenshot clients (scrape validation)

Standalone Playwright scripts that drive each comparison site to its **results
page** in a real browser (via a remote [browserless](https://www.browserless.io)
instance) and save a **full-page screenshot** to `./screenshots/`. Use them to
eyeball a scrape against what the site actually renders for the same address and
usage. They are deliberately **not** wired to the dashboard or database.

One file per site, all sharing `screenshot-lib.mjs`:

| Site | Script | Status |
|------|--------|--------|
| Gaslicht.com | `screenshot-gaslicht.mjs` | ✅ works |
| Energievergelijk.nl | `screenshot-energievergelijk.mjs` | ✅ works |
| Overstappen.nl | `screenshot-overstappen.mjs` | ✅ works |
| Independer.nl | `screenshot-independer.mjs` | ✅ works |
| EnergieKiezer.nl | `screenshot-energiekiezer.mjs` | ⚠️ see note |
| Pricewise.nl | `screenshot-pricewise.mjs` | ⚠️ see note |

## Setup

`playwright-core` is already a dependency (repo root). The scripts read the
browserless connection from `.env`:

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

Output: `screenshots/<site>-<postcode>-<huisnr>-<timestamp>.png`. On failure a
`<site>-FAILED-…png` debug shot and the URL at the point of failure are written.

## Notes

- **Viewport / UA**: browserless is driven over CDP, where Playwright's viewport
  and user-agent options are ignored. `screenshot-lib.mjs` forces a 1440-wide
  desktop viewport and a Windows Chrome UA through the CDP session instead.
- **EnergieKiezer & Pricewise** currently stop at their start page from the
  browserless **datacenter IP**: both submit their compare form entirely
  client-side and the handler does not navigate in that environment (EnergieKiezer's
  own Hotjar refuses to launch, flagging the traffic as suspicious). The funnel
  steps in the scripts are correct — they reach the compare form, fill it, and
  click submit — so they should complete from a residential IP or a browserless
  instance with a residential/proxy egress. Until then they write a FAILED debug
  screenshot. The other four sites reach and screenshot the full ranking.
- Screenshots and `.env` are git-ignored.
