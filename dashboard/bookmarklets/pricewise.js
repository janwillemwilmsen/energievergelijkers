// Pricewise.nl — mirrors screenshot-pricewise.mjs: start-compare form ->
// /energie/resultaat-v5/. The compare button is two-phase: the first click
// validates the address, the second fires the redirect to the results page.
// On the results page every tariff type is ticked and the full list is
// rendered, so the page shows what pricewise-client.mjs fetches.
RR.launch({
  site: "Pricewise.nl",
  host: "pricewise.nl",
  // The tariff-type filter is kept per funnel id (survives a reload), but the
  // expanded list is not: keep the frame with all deals rendered.
  stayInFrame: true,
  startUrl: function () { return "https://www.pricewise.nl/energie-vergelijken/"; },
  steps: [
    {
      name: "formulier invullen",
      match: function (url, doc) { return /energie-vergelijken/.test(url) && !!doc.querySelector("#pc_false"); },
      run: async function (win, input, log) {
        var ck = RR.$(win, "#btnCkOk");
        if (RR.visible(ck)) { RR.click(ck); await RR.sleep(1000); }

        await RR.type(RR.$(win, "#pc_false"), input.postcode, 90);
        RR.blur(RR.$(win, "#pc_false"));
        await RR.type(RR.$(win, "#hn_false"), String(input.huisnr), 90);
        RR.blur(RR.$(win, "#hn_false"));
        await RR.sleep(2500);

        // Current supplier: "Onbekend / Anders" (scraper uses currentsupplierid 1062).
        var sup = RR.$(win, "#suppliers_false");
        if (sup) RR.selectOption(sup, /onbekend|anders/i);

        var noGas = RR.$(win, "#hasnogas_false");
        if (input.gas === 0 && noGas && !noGas.checked) RR.click(noGas);

        // Reveal and fill the manual-usage fields.
        var manual = RR.byRole(win, "button", /Verbruik zelf invullen/i) || RR.byText(win, /Verbruik zelf invullen/i);
        if (manual) { RR.click(manual); await RR.sleep(1000); }
        var set = function (sel, v) { var el = RR.$(win, sel); if (el) RR.fill(el, String(v)); else log("veld " + sel + " ontbreekt"); };
        set("#elecPeak_false", input.normaal);
        set("#elecOffPeak_false", input.dal);
        if (input.gas > 0) set("#gas_false", input.gas);
        if (input.teruglevering > 0) {
          set("#elecPeaksp_false", input.terugNormaal);
          set("#elecOffPeaksp_false", input.terugDal);
        }
        await RR.sleep(800);

        // First click validates the address, the second triggers the redirect.
        RR.click(RR.$(win, "#en_0_btn_cta"));
        await RR.sleep(3000);
        try { await RR.waitUrl(win, /resultaat/i, 3000); return; } catch (e) {}
        RR.click(RR.$(win, "#en_0_btn_cta"));
        await RR.waitUrl(win, /resultaat/i, 30000);
      },
    },
    {
      name: "resultaten",
      final: true,
      match: function (url) { return /resultaat/i.test(url); },
      run: async function (win, input, log) {
        await RR.waitText(win, /per maand|per jaar|€/i, 45000);
        await RR.sleep(3000);
        // "Type tarief?" ticks only Vast by default; the CLI sends tarifftype 0
        // (= all). Tick Variabel and Dynamisch too (unnamed checkboxes, found
        // by their label text; click the label).
        var typeBox = function (label) {
          return RR.$$(win, 'input[type="checkbox"]').filter(function (i) {
            var l = i.closest("label");
            return RR.visible(i) && l && l.textContent.trim() === label;
          })[0];
        };
        var labels = ["Vast", "Variabel", "Dynamisch"];
        for (var i = 0; i < labels.length; i++) {
          var box = typeBox(labels[i]);
          if (box && !box.checked) { RR.click(box.closest("label")); await RR.sleep(3000); }
        }
        log("type tarief: " + labels.filter(function (l) { var b = typeBox(l); return b && b.checked; }).join(", "));
        // The page shows 10 deals; "Bekijk overige N deals" plus scrolling
        // renders the rest in chunks of 10. N tells us how many to expect.
        var count = function () { return (win.document.body.innerText.match(/Kies deze/g) || []).length; };
        var restMatch = win.document.body.innerText.match(/Bekijk overige (\d+) deals/i);
        var target = restMatch ? count() + Number(restMatch[1]) : 0;
        var more = RR.byText(win, /Bekijk overige \d+ deals/i);
        if (more) { RR.click(more.closest("button, a") || more); await RR.sleep(3000); }
        // Loading triggers on scrolling past the cards, so sweep the whole
        // page top to bottom each pass until the expected total is reached.
        var last = count(), stale = 0;
        for (var pass = 0; pass < 60 && count() < target && stale < 8; pass++) {
          for (var y = 0; y <= win.document.body.scrollHeight; y += 700) { win.scrollTo(0, y); await RR.sleep(60); }
          await RR.sleep(1500);
          var c = count();
          if (c === last) stale++; else { stale = 0; last = c; }
        }
        win.scrollTo(0, 0);
        log("deals op de pagina: " + count() + (target ? " van " + target : ""));
      },
    },
  ],
});
