// Overstappen.nl — mirrors screenshot-overstappen.mjs: postcode form ->
// "Jouw gegevens" wizard (fields revealed progressively: leverancier ->
// energietype -> verbruik) -> "Toon beste deals" -> results. On the overview
// every contract type is ticked and the list fully expanded, so the page
// shows what overstappen-client.mjs fetches (same order, "Laagste prijs").
RR.launch({
  site: "Overstappen.nl",
  host: "overstappen.nl",
  // The overview survives a reload, but its sort falls back to
  // "Prijs/kwaliteit"; keep the frame (sorted "Laagste prijs") and only
  // update the tab's URL.
  stayInFrame: true,
  startUrl: function () { return "https://www.overstappen.nl/energie/vergelijken/"; },
  steps: [
    {
      name: "adres invullen",
      match: function (url, doc) { return /\/energie\/vergelijken\//.test(url) && !!doc.querySelector("#postcode"); },
      run: async function (win, input, log) {
        var cookie = RR.$(win, "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll");
        if (!RR.visible(cookie)) { try { cookie = await RR.waitSel(win, "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll", 4000); } catch (e) { cookie = null; } }
        if (cookie) { RR.click(cookie); await RR.sleep(800); }
        RR.fill(RR.$(win, "#postcode"), input.postcode);
        RR.fill(RR.$(win, "#housenumber"), String(input.huisnr));
        // First click triggers the address lookup, a follow-up click submits.
        for (var i = 0; i < 4; i++) {
          var form = RR.$(win, "#postcode").closest("form");
          var btn = Array.prototype.slice.call(form.querySelectorAll("button")).filter(function (b) { return /Energie vergelijken/i.test(b.textContent); })[0];
          if (!btn) throw new Error("knop 'Energie vergelijken' niet gevonden");
          await RR.submit(btn); // first click resolves the address, a later one submits
          try { await RR.waitUrl(win, /\/energie\/vergelijker\//, 8000); return; } catch (e) { if (i === 3) throw new Error("funnel kwam niet op gang (adres niet gevonden?)"); }
        }
      },
    },
    {
      name: "jouw gegevens",
      match: function (url, doc) { return /\/energie\/vergelijker\//.test(url) && !!doc.querySelector("#currentprovider"); },
      run: async function (win, input, log, state) {
        await RR.waitSel(win, "#currentprovider", 20000);
        RR.selectOption(RR.$(win, "#currentprovider"), 1); // Weet ik niet
        var typeSel = input.gas > 0 ? "energy-type-selection-1" : "energy-type-selection-2";
        await RR.waitFor(function () { return RR.$(win, "#" + typeSel); }, 10000);
        RR.click(RR.$(win, 'label[for="' + typeSel + '"]'));
        await RR.waitFor(function () { return RR.$(win, "#usage-knowledge-known"); }, 10000);
        RR.click(RR.$(win, 'label[for="usage-knowledge-known"]'));
        await RR.waitSel(win, "#electricityusagehigh-input", 10000);

        // Single meter: the site rejects dal = 0 while the double-meter box is
        // checked, so untick it via its label text (the input is styled over).
        if (input.dal === 0) {
          RR.click(RR.byText(win, "dubbele én slimme meter"));
          await RR.sleep(800);
          RR.fill(RR.$(win, "#electricityusagehigh-input"), String(input.normaal));
        } else {
          RR.fill(RR.$(win, "#electricityusagehigh-input"), String(input.normaal));
          RR.fill(RR.$(win, "#electricityusagelow-input"), String(input.dal));
        }
        if (input.gas > 0) RR.fill(RR.$(win, "#gasusage-input"), String(input.gas));

        if (input.teruglevering > 0) {
          RR.click(RR.byText(win, "Ik heb zonnepanelen"));
          await RR.sleep(1500);
          var high = RR.$(win, 'input[name="electricitysupplyhigh"], #electricitysupplyhigh-input');
          var low = RR.$(win, 'input[name="electricitysupplylow"], #electricitysupplylow-input');
          if (high) RR.fill(high, String(input.terugNormaal));
          if (low && input.terugDal > 0) RR.fill(low, String(input.terugDal));
        }
        await RR.sleep(300);
        var go = RR.byRole(win, "button", /Toon beste deals/i);
        if (!go) throw new Error("knop 'Toon beste deals' niet gevonden");
        state.wizardDone = true;
        await RR.submit(go);
      },
    },
    {
      name: "resultaten",
      final: true,
      match: function (url, doc, state) {
        return !!state.wizardDone && !doc.querySelector("#electricityusagehigh-input") && /per maand/i.test(doc.body.innerText);
      },
      run: async function (win, input, log) {
        await RR.waitText(win, /per maand/i, 45000);
        await RR.sleep(1500);
        // The overview ticks only "Vast" by default; the CLI fetches every
        // contract type. Tick Variabel and Dynamisch too (styled checkboxes:
        // click the surrounding label).
        var boxes = RR.$$(win, 'input[name="contract_type"]');
        for (var i = 0; i < boxes.length; i++) {
          if (boxes[i].checked) continue;
          RR.click(boxes[i].closest("label") || boxes[i]);
          await RR.sleep(1500);
        }
        if (boxes.length) log("contractsoort: " + boxes.filter(function (b) { return b.checked; }).length + "/" + boxes.length + " aangevinkt");
        await RR.sleep(1500);
        // Expand until every deal is on the page.
        for (var j = 0; j < 10; j++) {
          var more = RR.byRole(win, "button", /^Toon meer/i);
          if (!more) break;
          RR.click(more);
          await RR.sleep(1500);
        }
      },
    },
  ],
});
