// Energievergelijk.nl — mirrors screenshot-energievergelijk.mjs: the Angular
// results page is deep-linkable, so the start URL IS the results page (with
// "Alle contracten" selected, like the CLI). The step only dismisses cookies
// and expands the list past the top 10.
// Works from any site: off-domain it simply opens the deep link.
(function () {
  var startUrl = function (input) {
    var q = new URLSearchParams({
      zipcode: input.postcode,
      housenumber: String(input.huisnr),
      power: String(input.normaal),
      power_low: String(input.dal),
      gas: String(input.gas),
      price_rate: "m",
      // "2:5" = the "Alle contracten" radio (the page defaults to "Beste
      // deals", a subset); same filter the CLI sends.
      filters: "2:5",
      origin: "home",
    });
    if (input.teruglevering > 0) q.set("solar", String(input.teruglevering));
    return "https://www.energievergelijk.nl/energievergelijker#/search?" + q;
  };
  if (location.hostname.indexOf("energievergelijk.nl") < 0) {
    // Off-site: the deep link is all we need — this tab goes straight there
    // (a popup instead: window.__rrMode = "popup").
    RR.askInput("Energievergelijk.nl").then(function (input) {
      if (!input) return;
      if (window.__rrMode === "popup") window.open(startUrl(input), "rr-energievergelijk.nl", "popup=yes,width=1400,height=1100");
      else location.href = startUrl(input);
    });
    return;
  }
  RR.launch({
    site: "Energievergelijk.nl",
    host: "energievergelijk.nl",
    // A reload folds the list back to 10; keep the fully expanded frame.
    stayInFrame: true,
    startUrl: startUrl,
    steps: [
      {
        name: "resultaten",
        final: true,
        match: function (url) { return /energievergelijker/.test(url); },
        run: async function (win, input, log) {
          RR.acceptCookies(win);
          await RR.waitFor(function () { return RR.byRole(win, "button", /Toon meer resultaten/i); }, 30000);
          // Expand until every offer is on the page (10 per click).
          for (var i = 0; i < 15; i++) {
            var more = RR.byRole(win, "button", /Toon meer resultaten/i);
            if (!more) break;
            RR.click(more);
            await RR.sleep(1000);
          }
          log("aanbiedingen op de pagina: " + (win.document.body.innerText.match(/Bekijk/g) || []).length);
        },
      },
    ],
  });
})();
