# Energievergelijker

Lokale webapp bovenop de bestaande Node-clients in deze repo. Hij haalt aanbiedingen op bij Nederlandse vergelijkingssites, bewaart elke run in SQLite, toont trends en schrijft ruwe markdown-snapshots — handmatig of via een in-process cron.

De `*-client.mjs`-bestanden blijven gewone CLI’s. De app importeert hun `compare` / `calculateOffers`-exports; CLI-side-effects draaien alleen als je het bestand zelf start.

## Starten

```bash
npm install
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Tijdens ontwikkeling (API + Vite-proxy):

```bash
npm install
npm run dev
```

API op poort 3000, frontend op 5173.

### Docker

```bash
docker compose up --build
```

Data (SQLite + markdown) staat in `./data`.

## Wat je krijgt

| Pagina | Inhoud |
| --- | --- |
| **Vergelijken** | Laatste run per profiel (laag / midden / hoog / aangepast), tabel, bronstatus, knop *Nu ophalen* |
| **Trends** | Lijnen van jaar- of maandbedrag, filter op profiel en bron |
| **Markdown** | Alle snapshots lezen en downloaden; bestanden ook onder `data/snapshots/` |
| **Instellingen** | Postcode, verbruik, bronnen, uitgelichte leveranciers, dagelijkse tijd of cron, profiel van de geplande job |

Instellingen en de planner zitten in SQLite. Een wijziging in de UI herlaadt de cron zonder redeploy.

## Standaardwaarden

**Adres:** `5216EK` `27` — het voorbeeld uit de gaslicht-client (Den Bosch). Vervang dit; de sites hebben een geldig adres nodig.

**Tijdzone:** `Europe/Amsterdam`  
**Cron:** elke dag 07:00 (`0 7 * * *`), profiel **midden**

**Verbruik** (dual meter: normaal + dal in kWh, gas in m³), afgerond naar Milieu Centraal / Nibud-achtige huishoudens (2024–2025):

| Profiel | Normaal | Dal | Totaal kWh | Gas m³ | Bedoeld als |
| --- | ---: | ---: | ---: | ---: | --- |
| Laag | 1170 | 630 | 1800 | 800 | 1–2 personen, appartement |
| Midden | 1885 | 1015 | 2900 | 1200 | 3 personen, tussenwoning |
| Hoog | 2600 | 1400 | 4000 | 1800 | 4+ personen, vrijstaand |
| Aangepast | 2500 | 750 | 3250 | 500 | default van de originele clients |

Alles is bewerkbaar en blijft bewaard.

**Uitgelicht (standaard):** Essent, Vattenfall, Eneco. Matching slikt kleine naamverschillen (`Nuon` → Vattenfall, `BudgetEnergie` / `Budget Energie`, `essent energie`, BV/NV-achtervoegsels).

**Bronnen:** energievergelijk, energiekiezer, overstappen, independer, pricewise, gaslicht, essent. Eén falende site stopt de rest niet; per bron wordt success/error bewaard.

## Eerste run / lege UI

Bij een lege database laadt de server `fixtures/seed-runs.json`: twee gedateerde snapshots (21 en 28 augustus 2026) voor elk verbruiksprofiel, plus markdown op schijf. Trends hebben daarmee meteen twee punten.

Daarna kun je *Nu ophalen* gebruiken voor live data. Sites kunnen rate-limiten of hun HTML/API wijzigen; een mislukte bron blijft zichtbaar als fout.

## Clients als CLI

Ongewijzigd in gebruik:

```bash
node gaslicht-client.mjs 5216EK 27 --normaal 2500 --dal 750 --gas 500 --json
node energievergelijk-client.mjs 5216EK 27 --normaal 1885 --dal 1015 --gas 1200
```

Importeer je ze vanuit de app, dan printen ze geen usage meer. Essent exporteert `calculateOffers` in plaats van `compare`.

## Data

- SQLite: `data/energie.db` (overschrijfbaar met `DB_PATH`)
- Markdown: `data/snapshots/`
- Schema: `runs`, `source_results` (ruwe JSON + markdown + fout), `offers` (genormaliseerde rijen voor trends), `settings`

## Tests

```bash
npm test
```

## Stack

Node 22 (ingebouwde `node:sqlite`), Express, `node-cron`, Vite + React + Recharts. Geen betaalde API’s.
