// EnergieKiezer.nl — mirrors the primary route of screenshot-energiekiezer.mjs:
// the Next.js app keeps the whole wizard state in sessionStorage["ekUser"] and
// /mijn-wensen/resultaten rebuilds itself from that on load. So: look up the
// address (cosmetic, best effort), seed that state in the opened window, and
// load the results URL. No homepage form involved.
RR.launch({
  site: "EnergieKiezer.nl",
  host: "energiekiezer.nl",
  startUrl: function () { return "https://www.energiekiezer.nl/mijn-wensen"; },
  steps: [
    {
      name: "wizard-state zetten",
      match: function (url) { return /\/mijn-wensen\/?(\?|#|$)/.test(url); },
      run: async function (win, input, log) {
        var address = {};
        try {
          var res = await win.fetch(
            "https://api.energiekiezer.nl/api/v1/address?postalCode=" + encodeURIComponent(input.pcSpaced) +
              "&houseNumber=" + encodeURIComponent(input.huisnr) + "&withPossibleAdditions=true",
            { headers: { accept: "application/json" } }
          );
          var a = res.ok ? await res.json() : null;
          if (a && a.isFound) address = { street: a.street, city: a.city, isResidential: a.isResidential == null ? true : a.isResidential };
          else log("adres niet gevonden via API (niet fataal)");
        } catch (e) { log("adres-lookup mislukt (niet fataal)"); }

        var consumption = { electricity: input.normaal, electricityOffPeak: input.dal };
        if (input.gas > 0) consumption.gas = input.gas;
        var solar = input.teruglevering > 0;
        var state = {
          house: Object.assign({
            consumption: consumption,
            grossConsumption: Object.assign({}, consumption),
            production: { electricity: solar ? input.terugNormaal : 0, electricityOffPeak: solar ? input.terugDal : 0 },
            meterType: "smart",
            houseNumber: String(input.huisnr),
            houseNumberAddition: "",
            postalCode: input.pcSpaced,
          }, address, {
            extraInfo: {
              solarGeneration: solar ? input.teruglevering : 0,
              solarSelfConsumed: 0,
              solarFedBack: solar ? input.teruglevering : 0,
              batteryExtraSelfConsumed: 0,
            },
          }),
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
            sortBy: "price", // "Goedkoopste" tab; the site's own default is priceQuality
            onlyAvailableForSignup: false,
          },
        };
        win.sessionStorage.setItem("ekUser", JSON.stringify(state));
        win.location.href = "https://www.energiekiezer.nl/mijn-wensen/resultaten";
      },
    },
    {
      name: "resultaten",
      final: true,
      match: function (url) { return /\/mijn-wensen\/resultaten/.test(url); },
      run: async function (win, input, log) {
        RR.acceptCookies(win);
        await RR.waitText(win, /€\s?\d|per maand|per jaar/i, 30000);
        var ok = new RegExp("\\b" + input.normaal + "\\s*kWh").test(win.document.body.innerText);
        if (!ok) log("let op: de samenvatting toont niet het opgegeven verbruik (state niet overgenomen?)");
      },
    },
  ],
});
