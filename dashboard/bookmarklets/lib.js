// Shared runtime for the Rank Radar bookmarklets (dashboard/bookmarklets/<site>.js).
// The dashboard page /bookmarklets (lib/bookmarklets.ts) glues this file and
// one site file into a `javascript:` URL, optionally with the arguments of a
// preset baked in (RR_PRESET_ARGS). Nothing is loaded from a server at
// runtime: the whole thing lives inside the bookmark URL.
//
// How a bookmarklet runs:
//  1. You must be on the site's own domain (same origin). Elsewhere it sends
//     the tab to the site's start page (arguments travel along in the URL
//     hash) and you click the bookmark once more there.
//  2. With a preset baked in it starts right away; otherwise a panel asks for
//     the SAME arguments as the CLI scripts ("5216EK 27 --normaal 2500 --dal
//     750 --gas 500 ...") and remembers them.
//  3. Default ("frame" mode): the tab itself shows the funnel. The start page
//     loads in a same-origin frame that fills the tab; the driver keeps
//     running above it and walks the frame through every funnel step. When
//     the results page is rendered the tab navigates to that results URL, so
//     you end on a normal page with the ranking. Set window.__rrMode =
//     "popup" to get a separate window instead.
//  4. If the site refuses to be framed (or the popup is blocked) it falls
//     back to driving the current tab page by page: after each page change
//     click the bookmark again, it resumes without asking.
var RR = (function () {
  "use strict";
  var KEY = "rr-bookmarklet-args";
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  // ---- CLI-compatible argument parsing (mirrors energy-lib.mjs parseCli) ----
  var USAGE =
    "<postcode> <huisnr> [--normaal N] [--dal N] [--gas N | --geen-gas] " +
    "[--teruglevering N] [--panelen N] [--contract vast|variabel|dynamisch|alle]";
  function parseArgs(str) {
    var args = String(str || "").trim().split(/\s+/).filter(Boolean);
    if (args.length < 2 || args[0].charAt(0) === "-") return null;
    var flag = function (name, dflt) {
      var i = args.indexOf("--" + name);
      return i >= 0 && i + 1 < args.length ? args[i + 1] : dflt;
    };
    var normaal = Number(flag("normaal", 2500));
    var dal = Number(flag("dal", 750));
    var gas = args.indexOf("--geen-gas") >= 0 ? 0 : Number(flag("gas", 500));
    var teruglevering = Number(flag("teruglevering", 0));
    var terugNormaal = teruglevering ? Math.round((teruglevering * normaal) / (normaal + dal || 1)) : 0;
    var terugDal = teruglevering - terugNormaal;
    var panelen = Number(flag("panelen", teruglevering > 0 ? Math.max(1, Math.round(teruglevering / 350)) : 0));
    var contract = flag("contract", "alle");
    if ([normaal, dal, gas, teruglevering, panelen].some(isNaN)) return null;
    if (["vast", "variabel", "dynamisch", "combinatie", "alle"].indexOf(contract) < 0) return null;
    var postcode = args[0].replace(/\s+/g, "").toUpperCase();
    if (!/^\d{4}[A-Z]{2}$/.test(postcode)) return null;
    return {
      postcode: postcode,
      pcSpaced: postcode.slice(0, 4) + " " + postcode.slice(4),
      huisnr: args[1],
      normaal: normaal, dal: dal, gas: gas,
      teruglevering: teruglevering, terugNormaal: terugNormaal, terugDal: terugDal, panelen: panelen,
      contract: contract,
      raw: args.join(" "),
    };
  }
  function askInput(site) {
    // Arguments baked into the bookmark by the dashboard (/bookmarklets picks
    // a preset + the default address) come first; window.__rrArgs lets you
    // run a bookmarklet from the console without the panel.
    var preset = (typeof RR_PRESET_ARGS !== "undefined" && RR_PRESET_ARGS) || window.__rrArgs;
    var last = null, resume = null;
    try {
      last = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
      // Inline mode (popup blocked): the flow continues after a page change
      // without asking again.
      resume = sessionStorage.getItem(KEY + "-resume");
      sessionStorage.removeItem(KEY + "-resume");
    } catch (e) {}
    if (resume && last && parseArgs(last)) return Promise.resolve(parseArgs(last));
    // Arguments handed over by the off-site hop (#rr=<args>): use them once
    // and clean the URL.
    var m = /(?:^#|&)rr=([^&]+)/.exec(location.hash || "");
    if (m) {
      var fromHash = parseArgs(decodeURIComponent(m[1]));
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      if (fromHash) {
        try { localStorage.setItem(KEY, fromHash.raw); sessionStorage.setItem(KEY, fromHash.raw); } catch (e) {}
        return Promise.resolve(fromHash);
      }
    }
    if (preset) {
      var pre = parseArgs(preset);
      if (!pre) alert("Ongeldige window.__rrArgs.\n" + USAGE);
      return Promise.resolve(pre);
    }
    // In-page panel instead of prompt(): the click on "Start" is a fresh user
    // gesture, so the popup window is allowed no matter how long you type.
    return new Promise(function (resolve) {
      var old = document.getElementById("rr-bookmarklet-ask");
      if (old) old.remove();
      var wrap = document.createElement("div");
      wrap.id = "rr-bookmarklet-ask";
      wrap.style.cssText = "position:fixed;z-index:2147483647;top:16px;left:16px;width:520px;max-width:calc(100vw - 32px);background:#0f172a;color:#e2e8f0;font:13px/1.45 system-ui,sans-serif;padding:14px 16px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.45)";
      wrap.innerHTML =
        '<div style="font-weight:700;font-size:14px;margin-bottom:6px">Rank Radar → ' + site + '</div>' +
        '<div style="color:#94a3b8;margin-bottom:8px;white-space:pre-wrap">' + USAGE.replace(/</g, "&lt;") + '</div>' +
        '<input id="rr-ask-input" spellcheck="false" style="width:100%;box-sizing:border-box;font:13px/1.4 ui-monospace,Consolas,monospace;padding:8px 10px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#f8fafc;outline:none">' +
        '<div id="rr-ask-err" style="color:#fca5a5;min-height:18px;margin-top:6px"></div>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:6px">' +
        '<button id="rr-ask-cancel" type="button" style="font:600 13px system-ui;padding:7px 14px;border-radius:8px;border:1px solid #475569;background:transparent;color:#e2e8f0;cursor:pointer">Annuleren</button>' +
        '<button id="rr-ask-go" type="button" style="font:700 13px system-ui;padding:7px 18px;border-radius:8px;border:0;background:#10b981;color:#052e16;cursor:pointer">Start ▶</button>' +
        '</div>';
      (document.body || document.documentElement).appendChild(wrap);
      var inp = wrap.querySelector("#rr-ask-input");
      var err = wrap.querySelector("#rr-ask-err");
      inp.value = last || "5216EK 27 --normaal 2500 --dal 750 --gas 500";
      var finish = function (val) { wrap.remove(); resolve(val); };
      var go = function () {
        var input = parseArgs(inp.value);
        if (!input) { err.textContent = "Ongeldige invoer — minimaal <postcode> <huisnr>."; inp.focus(); return; }
        try { localStorage.setItem(KEY, input.raw); sessionStorage.setItem(KEY, input.raw); } catch (e) {}
        finish(input);
      };
      wrap.querySelector("#rr-ask-go").addEventListener("click", go);
      wrap.querySelector("#rr-ask-cancel").addEventListener("click", function () { finish(null); });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); go(); }
        if (e.key === "Escape") { e.preventDefault(); finish(null); }
        e.stopPropagation();
      });
      setTimeout(function () { inp.focus(); inp.select(); }, 0);
    });
  }

  // ---- DOM helpers (all take the window they operate on) ----
  function $(win, sel) { return win.document.querySelector(sel); }
  function $$(win, sel) { return Array.prototype.slice.call(win.document.querySelectorAll(sel)); }
  function visible(el) {
    if (!el || !el.getClientRects().length) return false;
    var cs = el.ownerDocument.defaultView.getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none";
  }
  // Deepest visible element whose text matches (like Playwright's getByText).
  // `exact` matches the trimmed text as a whole (case-insensitive).
  function byText(win, re, opts) {
    opts = opts || {};
    var tag = opts.tag || "*";
    var test = re instanceof RegExp ? function (t) { return re.test(t); } :
      opts.exact ? function (t) { return t.toLowerCase() === String(re).toLowerCase(); } :
        function (t) { return t.toLowerCase().indexOf(String(re).toLowerCase()) >= 0; };
    var all = $$(win, tag).filter(function (el) {
      if (/^(script|style|noscript)$/i.test(el.tagName)) return false;
      return visible(el) && test((el.textContent || "").replace(/\s+/g, " ").trim());
    });
    // keep only elements that have no matching descendant
    return all.filter(function (el) { return !all.some(function (o) { return o !== el && el.contains(o); }); })[0] || null;
  }
  function byRole(win, role, re) {
    var sel = role === "button" ? 'button, [role="button"], input[type="submit"], input[type="button"], a.btn, a.button' : '[role="' + role + '"]';
    return $$(win, sel).filter(visible).filter(function (el) {
      var t = (el.value && /^input$/i.test(el.tagName) ? el.value : el.textContent || "").replace(/\s+/g, " ").trim();
      return re instanceof RegExp ? re.test(t) : t.toLowerCase() === String(re).toLowerCase();
    })[0] || null;
  }
  function waitFor(fn, timeout, every) {
    timeout = timeout || 20000; every = every || 250;
    var t0 = Date.now();
    return new Promise(function (resolve, reject) {
      (function tick() {
        var v = null;
        try { v = fn(); } catch (e) {}
        if (v) return resolve(v);
        if (Date.now() - t0 > timeout) return reject(new Error("timeout na " + Math.round(timeout / 1000) + "s: " + (fn.desc || "wachten")));
        setTimeout(tick, every);
      })();
    });
  }
  function waitSel(win, sel, timeout) {
    var f = function () { var el = $(win, sel); return visible(el) ? el : null; };
    f.desc = sel;
    return waitFor(f, timeout);
  }
  function waitText(win, re, timeout) {
    var f = function () { return re.test(win.document.body.innerText) ? true : null; };
    f.desc = "tekst " + re;
    return waitFor(f, timeout);
  }
  function waitUrl(win, re, timeout) {
    var f = function () { return re.test(win.location.href) ? true : null; };
    f.desc = "url " + re;
    return waitFor(f, timeout);
  }
  // Wait until a (new) document is loaded and its DOM has been quiet for a
  // moment, so fills land after the site's framework has bound the form.
  function settle(win, quiet, max) {
    quiet = quiet || 600; max = max || 8000;
    var t0 = Date.now();
    return new Promise(function (resolve) {
      var last = Date.now();
      var obs = null;
      var arm = function () {
        try {
          obs = new win.MutationObserver(function () { last = Date.now(); });
          obs.observe(win.document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
        } catch (e) { obs = null; }
      };
      (function tick() {
        var ready = false;
        try { ready = win.document.readyState === "complete"; } catch (e) {}
        if (ready && !obs) { arm(); last = Date.now(); }
        var done = ready && Date.now() - last >= quiet;
        if (done || Date.now() - t0 > max) {
          try { if (obs) obs.disconnect(); } catch (e) {}
          return setTimeout(resolve, 250);
        }
        setTimeout(tick, 150);
      })();
    });
  }
  function fire(el, type, init) {
    var win = el.ownerDocument.defaultView;
    var Ctor = /^key/.test(type) ? win.KeyboardEvent : type === "input" ? win.InputEvent : /^(mouse|click|dblclick)/.test(type) ? win.MouseEvent : /^pointer/.test(type) ? win.PointerEvent : /^focus|^blur/.test(type) ? win.FocusEvent : win.Event;
    var ev = new Ctor(type, Object.assign({ bubbles: true, cancelable: true, composed: true }, init || {}));
    el.dispatchEvent(ev);
  }
  // Set a value the way frameworks (React/Angular/Vue/jQuery) notice it: use
  // the prototype's setter (bypasses React's value tracker) + input/change.
  function setValue(el, value) {
    var win = el.ownerDocument.defaultView;
    var proto = el.tagName === "SELECT" ? win.HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
    var setter = Object.getOwnPropertyDescriptor(proto, "value").set;
    el.focus();
    setter.call(el, String(value));
    fire(el, "input", { inputType: "insertText", data: String(value) });
    fire(el, "change");
  }
  function fill(el, value) { setValue(el, value); fire(el, "blur"); fire(el, "focusout"); }
  // Character-by-character typing for forms that listen to keystrokes
  // (address lookups on Pricewise / EnergieKiezer). Prefer fill() for inputs
  // with a formatting mask (Independer's postcode): they re-insert keys.
  function type(el, text, delay) {
    delay = delay || 60;
    var win = el.ownerDocument.defaultView;
    var setter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, "value").set;
    return new Promise(function (resolve) {
      el.focus();
      fire(el, "focus"); fire(el, "focusin");
      setter.call(el, "");
      fire(el, "input", { inputType: "deleteContentBackward" });
      var chars = String(text).split("");
      var i = 0;
      (function next() {
        if (i >= chars.length) { fire(el, "change"); return resolve(); }
        var ch = chars[i++];
        fire(el, "keydown", { key: ch });
        setter.call(el, el.value + ch);
        fire(el, "input", { inputType: "insertText", data: ch });
        fire(el, "keyup", { key: ch });
        setTimeout(next, delay);
      })();
    });
  }
  function blur(el) { fire(el, "keydown", { key: "Tab" }); el.blur(); fire(el, "blur"); fire(el, "focusout"); }
  function click(el) {
    if (!el) return false;
    el.scrollIntoView({ block: "center" });
    fire(el, "pointerdown"); fire(el, "mousedown"); fire(el, "pointerup"); fire(el, "mouseup");
    el.click();
    return true;
  }
  // Advance the funnel with a button: fire a click and, when the page hasn't
  // moved on after `grace` ms and the button submits a form, submit that form
  // for real (Angular forms on Independer ignore the synthetic click but
  // honour requestSubmit). Resolves true when the URL changed.
  function submit(el, grace) {
    grace = grace || 1500;
    if (!el) return Promise.resolve(false);
    var win = el.ownerDocument.defaultView;
    var before = win.location.href;
    click(el);
    return sleep(grace).then(function () {
      var moved = false;
      try { moved = win.location.href !== before; } catch (e) { moved = true; }
      if (moved) return true;
      var form = el.form || el.closest("form");
      if (form && (el.type === "submit" || el.tagName === "INPUT")) {
        try { form.requestSubmit(el); } catch (e) { try { form.requestSubmit(); } catch (e2) {} }
      }
      return sleep(300).then(function () { try { return win.location.href !== before; } catch (e) { return true; } });
    });
  }
  function selectOption(sel, matcher) {
    var opt = Array.prototype.slice.call(sel.options).find(function (o) {
      return typeof matcher === "number" ? o.index === matcher : matcher instanceof RegExp ? matcher.test(o.text) : o.text.trim() === matcher;
    });
    if (!opt) return false;
    sel.focus();
    fire(sel, "focus");
    setValue(sel, opt.value);
    // AngularJS models with updateOn:'blur' (Pricewise) only commit on blur.
    fire(sel, "blur");
    fire(sel, "focusout");
    return true;
  }
  var GENERIC_COOKIE_SELECTORS = [
    "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
    "#CybotCookiebotDialogBodyButtonAccept",
    "#onetrust-accept-btn-handler",
    "#didomi-notice-agree-button",
    "button#accept-all",
  ];
  var GENERIC_COOKIE_TEXTS = [/^Alles accepteren$/i, /^Accepteren$/i, /^Akkoord$/i, /^Ja, ik accepteer$/i, /^Prima$/i];
  // Best-effort: click whichever consent button is visible (own selectors first).
  function acceptCookies(win, own) {
    var sels = (own || []).concat(GENERIC_COOKIE_SELECTORS);
    for (var i = 0; i < sels.length; i++) { var el = $(win, sels[i]); if (visible(el)) return click(el); }
    for (var j = 0; j < GENERIC_COOKIE_TEXTS.length; j++) { var b = byRole(win, "button", GENERIC_COOKIE_TEXTS[j]); if (b) return click(b); }
    return false;
  }

  // ---- status box (in the driving tab and mirrored into the driven window) ----
  function box(doc) {
    var el = doc.getElementById("rr-bookmarklet-status");
    if (el) return el;
    el = doc.createElement("div");
    el.id = "rr-bookmarklet-status";
    el.style.cssText = "position:fixed;z-index:2147483647;right:12px;bottom:12px;max-width:380px;background:#0f172a;color:#e2e8f0;font:12px/1.4 system-ui,sans-serif;padding:10px 12px;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.35);white-space:pre-wrap;pointer-events:none";
    (doc.body || doc.documentElement).appendChild(el);
    return el;
  }
  function makeLog(site, getWin) {
    var lines = [];
    return function (msg) {
      lines.push(msg);
      if (lines.length > 8) lines.shift();
      var text = "Rank Radar · " + site + "\n" + lines.join("\n");
      try { box(document).textContent = text; } catch (e) {}
      try { var w = getWin(); if (w && w !== window) box(w.document).textContent = text; } catch (e) {}
      try { console.log("[rr:" + site + "] " + msg); } catch (e) {}
    };
  }

  // ---- driver ----
  // cfg: { site, host, startUrl(input) -> string, steps: [{ name, match(url, doc, state) -> bool,
  //        run(win, input, log, state) -> Promise, final?: bool }] }
  // Each step runs at most once per document (SPA transitions keep the same
  // document, full navigations get a fresh one).
  // Full-tab same-origin frame that hosts the funnel; returns its window.
  function openFrame(url) {
    var old = document.getElementById("rr-bookmarklet-frame");
    if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.id = "rr-bookmarklet-frame";
    wrap.style.cssText = "position:fixed;inset:0;z-index:2147483646;background:#fff";
    var f = document.createElement("iframe");
    f.style.cssText = "border:0;width:100%;height:100%;display:block";
    f.src = url;
    wrap.appendChild(f);
    (document.body || document.documentElement).appendChild(wrap);
    try { document.documentElement.style.overflow = "hidden"; } catch (e) {}
    return f.contentWindow;
  }
  function closeFrame() {
    var old = document.getElementById("rr-bookmarklet-frame");
    if (old) old.remove();
    try { document.documentElement.style.overflow = ""; } catch (e) {}
  }
  function launch(cfg) {
    var offSite = location.hostname.replace(/^www\./, "").indexOf(cfg.host) < 0;
    askInput(cfg.site).then(function (input) {
      if (!input) return;
      if (offSite) {
        // Different origin: send this tab to the start page with the
        // arguments in the hash; one more bookmark click there starts the run
        // without asking again.
        var u = cfg.startUrl(input);
        u += (u.indexOf("#") >= 0 ? "&" : "#") + "rr=" + encodeURIComponent(input.raw);
        alert("Je gaat nu naar " + cfg.host + ". Klik daar de bookmark nogmaals; je invoer gaat mee.");
        setTimeout(function () { location.href = u; }, 50);
        return;
      }
      start(cfg, input);
    });
  }
  function start(cfg, input) {
    var mode = window.__rrMode || (window.__rrInline ? "inline" : "frame");
    var win = null;
    var log = makeLog(cfg.site, function () { return mode === "frame" ? null : win; });
    var state = {};
    if (mode === "frame") {
      try { win = openFrame(cfg.startUrl(input)); } catch (e) { win = null; }
    } else if (mode === "popup") {
      try { win = window.open(cfg.startUrl(input), "rr-" + cfg.host, "popup=yes,width=1400,height=1100"); } catch (e) { win = null; }
    }
    var runInline = !win;
    var goInline = function () {
      // Drive this very tab, one page per click; the next click resumes.
      closeFrame();
      var here = window.location.href;
      var wantsStart = cfg.steps.some(function (s) { try { return s.match(here, window.document, state); } catch (e) { return false; } });
      try { sessionStorage.setItem(KEY + "-resume", "1"); } catch (e) {}
      if (!wantsStart) { setTimeout(function () { location.href = cfg.startUrl(input); }, 50); return false; }
      log("deze tab wordt pagina voor pagina gestuurd; klik na elke paginawissel de bookmark opnieuw");
      return true;
    };
    if (runInline) {
      win = window;
      if (!goInline()) return;
    } else {
      log("gestart (" + mode + "): " + input.raw);
    }
    var ranFor = new WeakMap();
    var started = Date.now();
    var sawPage = false;
    (async function loop() {
      var idle = 0;
      for (;;) {
        await sleep(400);
        var doc, href;
        try {
          if (mode === "popup" && !runInline && win.closed) { log("resultaatvenster gesloten — gestopt"); return; }
          doc = win.document; href = win.location.href;
        } catch (e) { doc = null; }
        if (!doc || !doc.body || /^about:/.test(href)) {
          // A site that refuses to be framed never yields a readable page.
          if (mode === "frame" && !runInline && !sawPage && Date.now() - started > 12000) {
            log("pagina laadt niet in een frame → deze tab wordt zelf gestuurd");
            mode = "inline"; runInline = true; win = window;
            if (!goInline()) return;
          }
          continue;
        }
        sawPage = true;
        var done = ranFor.get(doc) || (ranFor.set(doc, {}), ranFor.get(doc));
        var step = null;
        for (var i = 0; i < cfg.steps.length; i++) {
          var s = cfg.steps[i];
          if (done[s.name]) continue;
          var ok = false;
          try { ok = s.match(href, doc, state); } catch (e) {}
          if (ok) { step = s; break; }
        }
        if (!step) {
          if (++idle > 150) { log("geen volgende stap gevonden op " + href.replace(/^https?:\/\//, "").slice(0, 60) + " — gestopt"); return; }
          continue;
        }
        idle = 0;
        done[step.name] = true;
        log("… " + step.name + " (pagina laden)");
        await settle(win);
        // The document was replaced while settling: re-evaluate on the new one.
        try { if (win.document !== doc) { done[step.name] = false; continue; } } catch (e) { continue; }
        log("▶ " + step.name);
        try {
          await step.run(win, input, log, state);
          log("✓ " + step.name);
        } catch (e) {
          log("✗ " + step.name + ": " + (e && e.message ? e.message : e));
          if (step.final || step.fatal) return;
        }
        if (step.final) {
          if (mode === "frame" && !runInline) {
            // Hand the tab over to the results page itself (session/storage
            // state is shared with the frame, so it renders the same ranking).
            // A step may record the exact URL to hand over (state.finalUrl),
            // e.g. when the site strips query parameters from its own URL.
            var finalUrl = state.finalUrl || null;
            try { if (!finalUrl) finalUrl = win.location.href; } catch (e) {}
            if (finalUrl && !cfg.stayInFrame) {
              log("klaar — resultaten openen in dit venster");
              setTimeout(function () { location.href = finalUrl; }, 300);
            } else {
              log("klaar — resultatenpagina staat open");
              try { if (finalUrl) history.replaceState(null, "", finalUrl); } catch (e) {}
            }
          } else {
            log("klaar — resultatenpagina staat open");
            if (runInline) setTimeout(function () { try { box(document).remove(); } catch (e) {} }, 6000);
          }
          return;
        }
        if (runInline) { // a navigation follows; the next click resumes without prompting
          try { sessionStorage.setItem(KEY + "-resume", "1"); } catch (e) {}
          return;
        }
      }
    })();
  }

  return {
    launch: launch, parseArgs: parseArgs, askInput: askInput, sleep: sleep, settle: settle,
    $: $, $$: $$, visible: visible, byText: byText, byRole: byRole,
    waitFor: waitFor, waitSel: waitSel, waitText: waitText, waitUrl: waitUrl,
    fill: fill, setValue: setValue, type: type, blur: blur, click: click, submit: submit, selectOption: selectOption,
    acceptCookies: acceptCookies, fire: fire,
  };
})();
