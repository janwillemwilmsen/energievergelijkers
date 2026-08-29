import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const PROFILES = [
  { key: "laag", label: "Laag" },
  { key: "midden", label: "Midden" },
  { key: "hoog", label: "Hoog" },
  { key: "custom", label: "Aangepast" },
];

function eur(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
}

function when(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam" });
}

function duration(m) {
  if (m == null) return "onbepaald";
  if (m % 12 === 0) return `${m / 12} jaar`;
  return `${m} mnd`;
}

export default function ComparePage() {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [profile, setProfile] = useState("midden");
  const [custom, setCustom] = useState({ normaal: 2500, dal: 750, gas: 500 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("yearly_total");

  async function refresh() {
    const [latest, m] = await Promise.all([api.latest(), api.meta()]);
    setData(latest);
    setMeta(m);
    if (latest.settings?.usage?.custom) setCustom(latest.settings.usage.custom);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  const run = data?.profiles?.[profile];
  const highlighted = data?.highlighted || [];

  const rows = useMemo(() => {
    const list = [...(run?.offers || [])];
    const hi = new Set(highlighted);
    list.sort((a, b) => {
      const aH = hi.has(a.provider_key) ? 0 : 1;
      const bH = hi.has(b.provider_key) ? 0 : 1;
      if (aH !== bH) return aH - bH;
      const av = a[sort] ?? 1e9;
      const bv = b[sort] ?? 1e9;
      return av - bv;
    });
    return list;
  }, [run, highlighted, sort]);

  async function runNow() {
    setBusy(true);
    setError("");
    try {
      const body = { profile, wait: false };
      if (profile === "custom") body.usage = custom;
      const started = await api.compare(body);
      let tries = 0;
      while (tries < 80) {
        await new Promise((r) => setTimeout(r, 1500));
        const st = await api.compareStatus(started.runId);
        if (st.run && st.run.status !== "running") break;
        tries += 1;
      }
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveCustom() {
    await api.saveSettings({ usage: { custom } });
    await refresh();
  }

  const usage = data?.settings?.usage?.[profile];

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Laatste vergelijking</h2>
          <p className="lede">
            Adres {data?.settings?.postcode} {data?.settings?.huisnummer}. Verbruik per profiel is aanpasbaar
            onder Instellingen; aangepast hieronder.
          </p>
        </div>
        <button className="btn primary" disabled={busy} onClick={runNow}>
          {busy ? "Bezig met ophalen…" : "Nu ophalen"}
        </button>
      </div>

      <div className="tabs" role="tablist">
        {PROFILES.map((p) => (
          <button key={p.key} className={profile === p.key ? "tab on" : "tab"} onClick={() => setProfile(p.key)}>
            {p.label}
            <small>{meta?.presets?.[p.key]?.hint}</small>
          </button>
        ))}
      </div>

      {profile === "custom" && (
        <div className="usage-edit card">
          <label>
            Normaaltarief (kWh)
            <input type="number" value={custom.normaal} onChange={(e) => setCustom({ ...custom, normaal: Number(e.target.value) })} />
          </label>
          <label>
            Daltarief (kWh)
            <input type="number" value={custom.dal} onChange={(e) => setCustom({ ...custom, dal: Number(e.target.value) })} />
          </label>
          <label>
            Gas (m³)
            <input type="number" value={custom.gas} onChange={(e) => setCustom({ ...custom, gas: Number(e.target.value) })} />
          </label>
          <button className="btn" onClick={saveCustom}>
            Bewaar verbruik
          </button>
        </div>
      )}

      {error && <p className="banner err">{error}</p>}

      <div className="meta-row">
        <span>
          {usage ? `${usage.normaal} / ${usage.dal} kWh · ${usage.gas} m³` : "—"}
        </span>
        <span>{run ? `${when(run.started_at)} · ${run.status}` : "Nog geen run voor dit profiel"}</span>
        <label className="inline">
          Sorteer
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="yearly_total">per jaar</option>
            <option value="monthly_total">per maand</option>
          </select>
        </label>
      </div>

      {run?.sources && (
        <ul className="source-pills">
          {run.sources.map((s) => (
            <li key={s.id} className={s.status === "success" ? "ok" : "bad"}>
              {s.source} {s.status === "success" ? `· ${s.offer_count}` : `· ${s.error || "fout"}`}
            </li>
          ))}
        </ul>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Leverancier</th>
              <th>Product</th>
              <th>Bron</th>
              <th className="num">Per maand</th>
              <th className="num">Per jaar</th>
              <th className="num">Korting</th>
              <th>Looptijd</th>
              <th className="num">Cijfer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const pin = highlighted.includes(o.provider_key);
              return (
                <tr key={o.id} className={pin ? "highlight" : ""}>
                  <td>
                    {pin && <span className="pin">vastgezet</span>}
                    <strong>{o.provider}</strong>
                  </td>
                  <td>{o.product || o.contract_type || "—"}</td>
                  <td className="muted">{o.source}</td>
                  <td className="num">{eur(o.monthly_total)}</td>
                  <td className="num">{eur(o.yearly_total)}</td>
                  <td className="num">{eur(o.discount)}</td>
                  <td>{duration(o.duration_months)}</td>
                  <td className="num">{o.rating ?? "—"}</td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={8} className="empty">
                  Geen rijen. Start een run of kijk of het zaadbestand geladen is.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
