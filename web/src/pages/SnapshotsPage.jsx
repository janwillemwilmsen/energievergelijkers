import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function SnapshotsPage() {
  const [data, setData] = useState(null);
  const [view, setView] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.snapshots().then(setData).catch((e) => setError(e.message));
  }, []);

  async function open(kind, id) {
    setError("");
    try {
      const text = await api.snapshotText(kind, id);
      setView({ kind, id, text });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Ruwe markdown</h2>
          <p className="lede">
            Elke run schrijft een gecombineerd bestand plus één bestand per bron naar schijf
            {data?.snapshotDir ? ` (${data.snapshotDir})` : ""}.
          </p>
        </div>
      </div>
      {error && <p className="banner err">{error}</p>}

      <div className="split">
        <div className="card list">
          <h3>Runs</h3>
          <ul>
            {(data?.runs || []).map((r) => (
              <li key={r.id}>
                <button className="linkish" onClick={() => open("run", r.id)}>
                  #{r.id} · {r.profile_key} · {new Date(r.started_at).toLocaleString("nl-NL")}
                </button>
                <a href={api.snapshotUrl("run", r.id, true)}>download</a>
              </li>
            ))}
          </ul>
          <h3>Per bron</h3>
          <ul>
            {(data?.sources || []).map((s) => (
              <li key={s.id}>
                <button className="linkish" onClick={() => open("source", s.id)}>
                  {s.source} · run #{s.run_id} · {s.status}
                </button>
                <a href={api.snapshotUrl("source", s.id, true)}>download</a>
              </li>
            ))}
          </ul>
        </div>
        <pre className="card markdown">{view?.text || "Kies een snapshot om te lezen."}</pre>
      </div>
    </section>
  );
}
