// Gaslicht.com — mirrors screenshot-gaslicht.mjs: read the antiforgery token
// from the homepage, POST the comparison form in-page (same session/cookies),
// then open the results page the POST redirects to with every contract type
// selected. Single page: results appear in the opened window right away.
RR.launch({
  site: "Gaslicht.com",
  host: "gaslicht.com",
  startUrl: function () { return "https://www.gaslicht.com/"; },
  steps: [
    {
      name: "formulier posten",
      match: function (url) { return !/resultaten/.test(url); },
      run: async function (win, input, log, state) {
        RR.acceptCookies(win, [".js-cookie-accept"]);
        var tokenEl = await RR.waitFor(function () { return RR.$(win, 'input[name="__RequestVerificationToken"]'); }, 15000);
        var form = {
          __RequestVerificationToken: tokenEl.value,
          postal: input.pcSpaced,
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
        var res = await win.fetch("/energievergelijker/start", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(form).toString(),
          redirect: "follow",
          credentials: "include",
        });
        if (res.status >= 400) throw new Error("POST /energievergelijker/start -> " + res.status);
        var landed = res.url ? new URL(res.url).pathname : "";
        var path = /resultaten/.test(landed) ? landed : input.gas === 0 ? "/stroom-vergelijken/resultaten" : "/energievergelijken/resultaten";
        if (input.gas === 0 && !/stroom-vergelijken/.test(path)) log("let op: alleen-stroom kwam uit op " + path);
        // The UI defaults to "vast 1 jaar"; the scraper fetches every type.
        var q = new URLSearchParams({
          ContractType: "All,Vast,Vast1Jaar,Vast2JaarOfMeer,Dynamic,DynamicCombination,Variabel",
          take: "100",
        });
        // The site drops the query from its URL once loaded; remember the
        // full one so the tab can be handed over to the same selection.
        state.finalUrl = "https://www.gaslicht.com" + path + "?" + q;
        win.location.href = state.finalUrl;
      },
    },
    {
      name: "resultaten",
      final: true,
      match: function (url) { return /resultaten/.test(url); },
      run: async function (win) {
        await RR.waitSel(win, ".js-comparison-list-product", 30000);
        RR.acceptCookies(win, [".js-cookie-accept"]);
      },
    },
  ],
});
