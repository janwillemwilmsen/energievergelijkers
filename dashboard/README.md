# Rank Radar

Dashboard voor energiecontract-rankings over 6 Nederlandse vergelijkers
(Gaslicht, Energiekiezer, Energievergelijk, Independer, Overstappen, Pricewise).

## Stack

- **Next.js (App Router) + TypeScript + Tailwind** — frontend én API-routes in één app
- **Prisma + SQLite** (dev) — zet `datasource.provider = "postgresql"` voor productie
- **Recharts** — rankverloop (geïnverteerde Y-as, #1 boven)

## Quick start

```bash
npm install
npx prisma db push     # maakt prisma/dev.db
npx prisma db seed     # platforms + leveranciers + 4 preset-scenario's (géén mock-rankings)
npm run dev            # http://localhost:3000
```

Data komt uitsluitend uit echte scrapes. In de app: **▶ Scrape dit scenario**
draait de 6 scrapers voor het geselecteerde scenario; **⟳ Ververs alle presets**
draait ze voor alle 4 preset-scenario's. Voortgang is live zichtbaar
(x/6 platforms) en de cijfers verversen zodra resultaten binnenkomen.
Hetzelfde kan headless via `POST /api/scrapes/run` (`{scenarioId}` of `{presets:true}`)
met voortgang op `GET /api/scrapes/status?sweepId=...`.

## Echte data ingesten

De scrapers in de bovenliggende map schrijven canonieke records (`--json`).
Een volledige sweep over alle 6 platforms voor een scenario:

```bash
node scripts/run-scrapes.mjs --scenario medium            # presets: low|medium|high|solar
node scripts/run-scrapes.mjs --normaal 2500 --dal 750 --gas 500   # custom
```

Of rechtstreeks tegen de API — de `records` zijn letterlijk de scraper-output:

```
POST /api/scrapes/ingest
{ "platform": "gaslicht", "sweepId": "...", "records": [ ...canonieke records... ] }
```

Het scenario wordt automatisch afgeleid uit de records (verbruik + teruglevering)
en ge-upsert; leveranciersnamen worden genormaliseerd ("OXXIO Nederland B.V." → "Oxxio");
`rank` wordt berekend op jaarkosten binnen de run.

## Eigen merk

`MY_COMPANY_NAME` (default: `Essent`) bepaalt welke leverancier `isMyCompany`
krijgt en groen wordt uitgelicht.

## Deployen op Coolify (Nixpacks)

De build wordt gestuurd door `nixpacks.toml` in de **repo-root** (de scrapers
staan in de root, de app in `/dashboard` — de sweep-runner spawnt ze uit de
bovenliggende map).

Instellingen in Coolify:

| Instelling | Waarde |
|---|---|
| Build pack | Nixpacks |
| Base directory | `/` (repo-root — **niet** `/dashboard`) |
| Port | `3000` |
| Persistent storage | volume gemount op `/data` |
| Env `DATABASE_URL` | `file:/data/rankradar.db` |
| Env `MY_COMPANY_NAME` | `Essent` (optioneel, is de default) |

Bij elke start draait `prisma db push` + de seed (idempotent) tegen het
volume, daarna `next start`. Scrapes gestart vanuit de UI draaien als
detached processen binnen dezelfde container — dat vereist een "echte"
container-host zoals Coolify; serverless zou ze afbreken.

Voor automatische trend-historie: maak in Coolify een **Scheduled Task** op
deze applicatie, bijv. dagelijks:

```bash
cd /app/dashboard && node scripts/run-scrapes.mjs --scenario all
```

Let op: vergelijkers met strengere anti-botlagen (Gaslicht, Pricewise) kunnen
kritischer zijn voor datacenter-IP's dan voor een thuisverbinding; faalt een
platform structureel na de migratie, controleer dan eerst het sweep-log.

## API

| Route | Doel |
|---|---|
| `POST /api/scrapes/ingest` | run + offers batch-insert |
| `GET /api/overview?scenarioId=` | KPI per platform: eigen rank, delta t.o.v. vorige run, gat naar #1 |
| `GET /api/trends?scenarioId=&platform=&days=` | ranktijdreeks: eigen merk + top-5 concurrenten |
| `GET /api/offers?scenarioId=` | alle offers van de laatste run per platform (mastertabel) |
| `GET/POST /api/scenarios` | presets + custom scenario's (find-or-create) |
