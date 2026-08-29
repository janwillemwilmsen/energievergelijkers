import { useEffect, useState } from "react";
import { api } from "../api.js";

const empty = {
  postcode: "",
  huisnummer: "",
  timezone: "Europe/Amsterdam",
  cronMode: "daily",
  dailyTime: "07:00",
  cronExpression: "0 7 * * *",
  scheduleProfile: "midden",
  enabledSources: [],
  highlightedProviders: [],
  usage: {},
};

export default function SettingsPage() {
  const [form, setForm] = useState(empty);
  const [meta, setMeta] = useState(null);
  const [providers, setProviders] = useState([]);
  const [scheduler, setScheduler] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  async function load() {
    const [s, m, t] = await Promise.all([api.settings(), api.meta(), api.trends()]);
    setForm({ ...empty, ...s.settings });
    setScheduler(s.scheduler);
    setMeta(m);
    setProviders(t.providers || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function setUsage(profile, field, value) {
    setForm((f) => ({
      ...f,
      usage: { ...f.usage, [profile]: { ...f.usage[profile], [field]: Number(value) } },
    }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setMsg("");
    try {
      const out = await api.saveSettings(form);
      setForm(out.settings);
      setScheduler(out.scheduler);
      setMsg(out.schedule?.ok === false ? out.schedule.error : "Opgeslagen. De planner leest dit meteen.");
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleSource(id) {
    setForm((f) => {
      const has = f.enabledSources.includes(id);
      return {
        ...f,
        enabledSources: has ? f.enabledSources.filter((x) => x !== id) : [...f.enabledSources, id],
      };
    });
  }

  function toggleHighlight(key) {
    setForm((f) => {
      const has = f.highlightedProviders.includes(key);
      return {
        ...f,
        highlightedProviders: has
          ? f.highlightedProviders.filter((x) => x !== key)
          : [...f.highlightedProviders, key],
      };
    });
  }

  function addHighlight(e) {
    e.preventDefault();
    const v = highlightInput.trim();
    if (!v) return;
    setForm((f) => ({
      ...f,
      highlightedProviders: [...new Set([...f.highlightedProviders, v])],
    }));
    setHighlightInput("");
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Instellingen</h2>
          <p className="lede">
            Alles hier staat in SQLite. Cron en het verbruiksprofiel van de nachtelijke job
            wijzigen zonder herstart.
          </p>
        </div>
      </div>
      {error && <p className="banner err">{error}</p>}
      {msg && <p className="banner ok">{msg}</p>}

      <form className="settings" onSubmit={save}>
        <fieldset className="card">
          <legend>Adres</legend>
          <p className="hint">Clients vereisen postcode + huisnummer. Standaard is het gaslicht-voorbeeld 5216EK 27.</p>
          <label>
            Postcode
            <input value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
          </label>
          <label>
            Huisnummer
            <input value={form.huisnummer} onChange={(e) => setForm({ ...form, huisnummer: e.target.value })} />
          </label>
        </fieldset>

        <fieldset className="card">
          <legend>Verbruik (kWh / m³)</legend>
          <p className="hint">
            Dual meter: normaal + dal. Presets volgen Milieu Centraal-achtige huishoudens (zie README).
          </p>
          <div className="usage-grid">
            {["laag", "midden", "hoog", "custom"].map((key) => (
              <div key={key} className="usage-col">
                <strong>{meta?.presets?.[key]?.label || key}</strong>
                <small>{meta?.presets?.[key]?.hint}</small>
                <label>
                  Normaal
                  <input
                    type="number"
                    value={form.usage?.[key]?.normaal ?? ""}
                    onChange={(e) => setUsage(key, "normaal", e.target.value)}
                  />
                </label>
                <label>
                  Dal
                  <input
                    type="number"
                    value={form.usage?.[key]?.dal ?? ""}
                    onChange={(e) => setUsage(key, "dal", e.target.value)}
                  />
                </label>
                <label>
                  Gas m³
                  <input
                    type="number"
                    value={form.usage?.[key]?.gas ?? ""}
                    onChange={(e) => setUsage(key, "gas", e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="card">
          <legend>Bronnen</legend>
          <ul className="check-list">
            {(meta?.sources || []).map((s) => (
              <li key={s.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={form.enabledSources.includes(s.id)}
                    onChange={() => toggleSource(s.id)}
                  />
                  {s.label}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset className="card">
          <legend>Uitgelichte leveranciers</legend>
          <p className="hint">Komen bovenaan in tabellen, dikker in grafieken. Namen worden genormaliseerd (Nuon = Vattenfall).</p>
          <ul className="check-list">
            {providers.map((p) => (
              <li key={p.provider_key}>
                <label>
                  <input
                    type="checkbox"
                    checked={form.highlightedProviders.includes(p.provider_key)}
                    onChange={() => toggleHighlight(p.provider_key)}
                  />
                  {p.provider}
                </label>
              </li>
            ))}
          </ul>
          <div className="inline-add">
            <input
              placeholder="Andere naam, bijv. Coolblue"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
            />
            <button type="button" className="btn" onClick={addHighlight}>
              Voeg toe
            </button>
          </div>
        </fieldset>

        <fieldset className="card">
          <legend>Planner</legend>
          <p className="hint">
            Tijdzone vast op Europe/Amsterdam. Huidige schema: {scheduler?.nextHint || "—"}.
          </p>
          <label>
            Profiel voor de geplande job
            <select
              value={form.scheduleProfile}
              onChange={(e) => setForm({ ...form, scheduleProfile: e.target.value })}
            >
              <option value="laag">Laag</option>
              <option value="midden">Midden</option>
              <option value="hoog">Hoog</option>
              <option value="custom">Aangepast</option>
            </select>
          </label>
          <label className="radio">
            <input
              type="radio"
              name="cronMode"
              checked={form.cronMode === "daily"}
              onChange={() => setForm({ ...form, cronMode: "daily" })}
            />
            Elke dag om
            <input type="time" value={form.dailyTime} onChange={(e) => setForm({ ...form, dailyTime: e.target.value })} />
          </label>
          <label className="radio">
            <input
              type="radio"
              name="cronMode"
              checked={form.cronMode === "advanced"}
              onChange={() => setForm({ ...form, cronMode: "advanced" })}
            />
            Cron-expressie
            <input
              value={form.cronExpression}
              onChange={(e) => setForm({ ...form, cronExpression: e.target.value })}
              placeholder="0 7 * * *"
            />
          </label>
        </fieldset>

        <button className="btn primary" type="submit">
          Instellingen bewaren
        </button>
      </form>
    </section>
  );
}
