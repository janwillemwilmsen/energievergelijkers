// Independer.nl — mirrors screenshot-independer.mjs: intro form -> "Je wensen"
// wizard -> results, then sort on "Goedkoopste" and expand the full ranking.
// The intro submit only arms once the address lookup has returned, so the
// address is filled and given a moment. (Whole-value fill, not keystrokes:
// the postcode mask re-inserts typed keys and doubles the last one.)
(function () {
  // "Wie is je huidige leverancier?" is a native <select> or a custom combobox
  // depending on the build; pick "weet ik niet" from whichever.
  async function pickCurrentSupplier(win) {
    var re = /weet ik niet|niet van toepassing|anders/i;
    var sels = RR.$$(win, "select");
    for (var i = 0; i < sels.length; i++) if (RR.selectOption(sels[i], re)) return;
    var trigger = RR.byText(win, "Maak je keuze");
    if (trigger) {
      RR.click(trigger);
      await RR.sleep(700);
      var opt = RR.byText(win, re);
      if (opt) RR.click(opt);
    }
  }

  RR.launch({
    site: "Independer.nl",
    host: "independer.nl",
    // A reload of /energie/resultaat keeps the "Goedkoopste" sort but folds
    // the list back to the first 10; keep the fully expanded frame.
    stayInFrame: true,
    startUrl: function () { return "https://www.independer.nl/energie/intro.aspx"; },
    steps: [
      {
        name: "adres invullen",
        match: function (url, doc) { return /\/energie\/intro/.test(url) && !!doc.querySelector("#postcode"); },
        run: async function (win, input, log) {
          RR.acceptCookies(win, ["#didomi-notice-agree-button"]);
          await RR.sleep(800);
          RR.fill(RR.$(win, "#postcode"), input.postcode);
          await RR.sleep(300);
          RR.fill(RR.$(win, "#huisnummer"), String(input.huisnr));
          await RR.sleep(2500); // address lookup arms the submit
          for (var i = 0; i < 5; i++) {
            await RR.submit(RR.$(win, "#salesboxSubmitButton"));
            try { await RR.waitUrl(win, /\/energie\/invoer\/wensen/, 8000); return; } catch (e) { await RR.sleep(1500); }
          }
          throw new Error("intro kwam niet bij 'Je wensen'");
        },
      },
      {
        name: "je wensen",
        match: function (url) { return /\/energie\/invoer\/wensen/.test(url); },
        run: async function (win, input, log) {
          await RR.waitFor(function () { return RR.byText(win, "Stroom en gas", { exact: true }); }, 20000);
          RR.click(RR.byText(win, input.gas > 0 ? "Stroom en gas" : "Alleen stroom", { exact: true }));
          await RR.sleep(400);

          // Single meter collapses the two stroom fields into one #stroomVerbruik.
          if (input.dal === 0) {
            RR.click(RR.byText(win, "Ik heb een enkele meter"));
            await RR.sleep(500);
            RR.fill(RR.$(win, "#stroomVerbruik"), String(input.normaal));
          } else {
            RR.fill(RR.$(win, "#stroomVerbruikNormaal"), String(input.normaal));
            RR.fill(RR.$(win, "#stroomVerbruikDal"), String(input.dal));
          }
          if (input.gas > 0) RR.fill(RR.$(win, "#gasVerbruik"), String(input.gas));

          // "Ik heb zonnepanelen" is a toggle the site remembers per session:
          // sync it to the input instead of clicking blindly.
          var opwekNormaal = function () { return RR.$(win, "#stroomOpwekkingNormaal, #stroomOpwekking"); };
          var solarOn = function () { return RR.visible(opwekNormaal()); };
          var wantSolar = input.teruglevering > 0;
          if (solarOn() !== wantSolar) { RR.click(RR.byText(win, "Ik heb zonnepanelen")); await RR.sleep(500); }
          if (wantSolar) {
            var amount = RR.$(win, "#solarPanelsAmount");
            if (amount) RR.fill(amount, String(input.panelen));
            if (input.dal === 0) RR.fill(opwekNormaal(), String(input.teruglevering));
            else {
              RR.fill(opwekNormaal(), String(input.terugNormaal));
              var dal = RR.$(win, "#stroomOpwekkingDal");
              if (dal) RR.fill(dal, String(input.terugDal));
            }
          } else if (solarOn()) {
            RR.fill(opwekNormaal(), "0");
            var d2 = RR.$(win, "#stroomOpwekkingDal");
            if (d2) RR.fill(d2, "0");
          }

          RR.click(RR.byText(win, "Ik wil overstappen", { exact: true }));
          await RR.sleep(800);
          await pickCurrentSupplier(win);
          // The wizard forces ONE contract type; "Vast" for the default "alle".
          var CONTRACT_LABEL = { vast: "Vast", dynamisch: "Dynamisch", variabel: "Variabel" };
          RR.click(RR.byText(win, CONTRACT_LABEL[input.contract] || "Vast", { exact: true }));
          await RR.sleep(500);
          var go = RR.byRole(win, "button", "Vergelijken");
          if (!go) throw new Error("knop 'Vergelijken' niet gevonden");
          await RR.submit(go); // Angular form: needs the real submit, not a synthetic click
        },
      },
      {
        name: "resultaten sorteren",
        final: true,
        match: function (url) { return /\/energie\/(vergelijking|resultaat)/.test(url); },
        run: async function (win, input, log) {
          await RR.waitText(win, /energiecontracten/i, 45000);
          await RR.sleep(1500);
          // Sort on price: a native <select> without id/name, found by its option.
          var sort = RR.$$(win, "select").filter(function (s) {
            return Array.prototype.some.call(s.options, function (o) { return /Goedkoopste/i.test(o.text); });
          })[0];
          if (sort) { RR.selectOption(sort, /Goedkoopste/i); await RR.sleep(2000); }
          else log("sorteer-select niet gevonden — volgorde blijft Prijs-kwaliteit");
          // Expand the full ranking (default shows ~10 of N).
          for (var i = 0; i < 6; i++) {
            var more = RR.byRole(win, "button", /Toon volgende/i);
            if (!more) break;
            RR.click(more);
            await RR.sleep(1200);
          }
        },
      },
    ],
  });
})();
