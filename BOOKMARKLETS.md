# Bookmarklets (resultatenpagina in je eigen Chrome)

Eén bookmark per vergelijker die de hele funnel doorloopt tot en met de
resultatenpagina, met **dezelfde argumenten als de CLI-scripts**. Bedoeld om
een scrape snel met eigen ogen te controleren zonder browserless of Playwright.

| Site | Bron | Stappen die de bookmark zet |
|------|------|-----------------------------|
| Gaslicht.com | `dashboard/bookmarklets/gaslicht.js` | antiforgery-token → POST formulier → resultaten met alle contracttypes |
| Energievergelijk.nl | `dashboard/bookmarklets/energievergelijk.js` | deeplink met "Alle contracten" (`filters=2:5`) → cookies → "Toon meer resultaten" tot alles staat |
| EnergieKiezer.nl | `dashboard/bookmarklets/energiekiezer.js` | adres-API → `sessionStorage.ekUser` zetten → resultaten (Goedkoopste) |
| Overstappen.nl | `dashboard/bookmarklets/overstappen.js` | postcode-formulier → "Jouw gegevens" wizard → "Toon beste deals" → Vast + Variabel + Dynamisch aanvinken → "Toon meer" tot alles staat |
| Independer.nl | `dashboard/bookmarklets/independer.js` | intro → "Je wensen" → resultaten → sorteren op Goedkoopste → hele lijst |
| Pricewise.nl | `dashboard/bookmarklets/pricewise.js` | start-formulier (leverancier, verbruik) → 2× vergelijk-knop → resultaten → Vast + Variabel + Dynamisch aanvinken → "Bekijk overige deals" + scrollen tot alles staat |

Elke bookmark is een vertaling van het bijbehorende `screenshot-<site>.mjs`
(zelfde selectors en wachtmomenten), aangevuld met de filterstappen hierboven
zodat de pagina dezelfde set toont als de CLI-client (`<site>-client.mjs`).

## Vergelijkbaarheid met de CLI

Gemeten op 2026-09-14 voor 5216EK 27, 2500/750 kWh, 500 m³:

| Site | CLI | Bookmarklet-pagina | Verschil |
|------|-----|--------------------|----------|
| Gaslicht | 77 records | 76 kaarten, zelfde volgorde | één productvariant is op de pagina een sub-optie van een kaart; de advertentiekaart bovenaan telt niet mee |
| Energievergelijk | 63 records | 56–63 kaarten na uitklappen | gelijk sinds de CLI ook `filters: ["2:5"]` stuurt (daarvoor 34: de "Beste deals"-subset) |
| EnergieKiezer | 69 | 69, Goedkoopste | gelijk; de pagina toont eerst een top-3-blok |
| Overstappen | 55 | 55 na aanvinken van alle contractsoorten | gelijk, zelfde volgorde ("Laagste prijs") |
| Independer | 85 (Vast 46 + Variabel 10 + Dynamisch 29) | 46 (Vast) | de wizard dwingt één type; wissel op de resultatenpagina het "Type contract"-radio of gebruik "zelf invullen" met `--contract dynamisch` / `variabel` |
| Pricewise | 70 records (67 unieke) | 64 na aanvinken van alle tarieftypes en uitklappen | gelijk in de top; de pagina voegt enkele productvarianten samen |

Blijvende verschillen: de CLI sorteert alles op jaarkosten incl. korting en
negeert uitgelichte/advertentie-posities; op de pagina's staat een
"Uitgelicht"- of "Advertentie"-kaart soms boven de lijst. `--contract` en
`--looptijd` filtert de CLI achteraf in code; op de pagina's gebruik je het
filterpaneel.

## Installeren

Open **/bookmarklets** in het dashboard (link in de kop van de homepage; na
een deploy dus ook online). De pagina toont per vergelijker één bookmark per
preset uit `/admin/presets` (Laag, Midden, Hoog, Zon, …) plus een variant
"zelf invullen". De naam van de bookmark bevat het verbruik
("Gaslicht · Midden 2.900 kWh / 1.200 m³") en de preset-waarden en het
standaardadres zitten in de URL gebakken, zodat de bookmark direct start.
Sleep de knoppen naar je bladwijzerbalk, of gebruik "kopieer URL" en plak
die als URL van een nieuwe bladwijzer.

Na een wijziging van een preset, het adres of `dashboard/bookmarklets/*.js`:
bookmarks opnieuw slepen — de code zit volledig in de bookmark-URL, er wordt
niets van een server geladen. De pagina bouwt de URL's per request
(`dashboard/lib/bookmarklets.ts` leest `lib.js` + `<site>.js` van schijf).

## Gebruik

1. Ga naar de vergelijker (welke pagina van het domein maakt niet uit).
   Klik je de bookmark ergens anders, dan stuurt hij dit tabblad eerst naar
   de startpagina van de site (je invoer reist mee in de URL) en klik je daar
   de bookmark nogmaals.
2. Klik de bookmark. Een preset-bookmark start meteen. De variant "zelf
   invullen" toont linksboven een paneel met de CLI-syntax:

   ```
   <postcode> <huisnr> [--normaal N] [--dal N] [--gas N | --geen-gas]
                       [--teruglevering N] [--panelen N] [--contract vast|variabel|dynamisch|alle]
   ```

   bijv. `5216EK 27 --normaal 2900 --gas 1200` of
   `5216EK 27 --normaal 3500 --gas 1000 --teruglevering 2000`.
   Defaults zijn die van de scrapers (2500 / 750 / 500). Je laatste invoer
   wordt onthouden (per site, in `localStorage`).
3. De funnel draait **in dit tabblad**: de startpagina laadt in een frame
   dat het hele tabblad vult, de bookmark stuurt dat frame stap voor stap
   (statusbox rechtsonder: `…` pagina laden, `▶` bezig, `✓` klaar, `✗` mislukt
   met reden) en zodra de resultaten staan navigeert het tabblad zelf naar de
   resultaten-URL. Je eindigt dus op een gewone pagina met de ranking.
   Alleen Gaslicht en EnergieKiezer navigeren door naar de resultaten-URL;
   de andere vier blijven in het frame (de URL-balk wordt wel bijgewerkt),
   omdat een herlaad hun uitgeklapte lijst weer dichtvouwt of (Overstappen)
   de sortering terugzet op "Prijs/kwaliteit". Elke stap wacht eerst tot de pagina volledig geladen is
   én de DOM even stil is, zodat de site-scripts de formulieren al gebonden
   hebben voordat er iets wordt ingevuld.

Liever een apart venster? Zet in de console `window.__rrMode = "popup"`
voordat je de bookmark klikt (of pas de default aan in `lib.js`, functie
`start`). Weigert een site zich te laten framen (nu geen van de zes), dan
stuurt de bookmark de huidige tab pagina voor pagina: klik na elke
paginawissel de bookmark opnieuw, hij gaat zonder paneel verder.

**Vanuit de console** (zonder paneel): plak de gedecodeerde bookmark-URL (of
`lib.js` + `<site>.js`) met daarvoor `window.__rrArgs = "5216EK 27 --gas 1200"`.
`window.__rrMode` kiest de modus: `"frame"` (default), `"popup"` of `"inline"`.

## Beperkingen

- `--contract` doet alleen iets op Independer (de wizard dwingt één type;
  "alle" wordt "Vast"). Alle andere sites tonen alle contracttypes.
- Independer en Pricewise onthouden eerdere antwoorden in de sessie;
  het zonnepanelen-schakelaar op Independer wordt daarom gesynchroniseerd met
  de invoer i.p.v. blind aangeklikt.
- Sites veranderen. Gaat een stap mis, dan staat de reden in de statusbox en
  in de console (`[rr:<site>] …`); de selectors staan in `dashboard/bookmarklets/<site>.js`
  en horen gelijk te lopen met `screenshot-<site>.mjs`.

## Opbouw

- `dashboard/bookmarklets/lib.js` — gedeelde runtime: argument-parser (spiegel van
  `parseCli` in `energy-lib.mjs`), DOM-helpers (`fill`, `type`, `click`,
  `submit`, `selectOption`, `acceptCookies`, `waitFor…`), statusbox en de
  driver die een frame (of venster) stap voor stap door de funnel loodst.
  Elke stap heeft een `match(url, doc, state)` en een
  `run(win, input, log, state)`; een stap draait hooguit één keer per
  document. Een stap kan `state.finalUrl` zetten als de URL om aan het einde
  naar over te schakelen afwijkt van wat het frame toont (Gaslicht laat de
  contracttype-query uit zijn URL vallen); `stayInFrame: true` op een site
  houdt de resultaten in het frame.
- `dashboard/bookmarklets/<site>.js` — de stappen per site.
- `dashboard/lib/bookmarklets.ts` + `dashboard/app/bookmarklets/page.tsx` —
  plakken lib + site aan elkaar (met `RR_PRESET_ARGS` voor een preset),
  `encodeURIComponent`, en tonen de sleepbare links. React blokkeert
  `javascript:`-hrefs in JSX, daarom worden de links als ruwe HTML gerenderd.

Lessen uit de praktijk die in de helpers zitten: invoervelden met een masker
(Independer-postcode) via `fill` en niet per toetsaanslag; formulieren van
Angular (Independer "Vergelijken") reageren niet op een synthetische klik maar
wel op `form.requestSubmit()`; `<select>`s met `ng-model-options updateOn:blur`
(Pricewise leverancier) committen pas na een blur-event.
