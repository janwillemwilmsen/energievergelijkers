"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Preset = {
  id: number;
  name: string;
  label: string;
  electricityNormal: number;
  electricityLow: number;
  gas: number;
  solarFeedIn: number;
  sortOrder: number;
  runCount: number;
};
type Address = { postcode: string; huisnr: string };

type Draft = {
  name: string;
  label: string;
  electricityNormal: number;
  electricityLow: number;
  gas: number;
  mono: boolean;
  solarFeedIn: number;
};

type AddressState =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "valid"; street: string | null; city: string | null }
  | { state: "invalid"; reason: string };
type AddressResult = Exclude<AddressState, { state: "idle" | "checking" }> & { key: string };

const nf = new Intl.NumberFormat("nl-NL");
const field =
  "mt-1 block rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200 disabled:opacity-40";
const btnPrimary =
  "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed";
const btnGhost = "rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30";

async function call<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `${method} ${url} -> ${res.status}`);
  return data as T;
}

const toDraft = (p: Preset): Draft => ({
  name: p.name,
  label: p.label,
  electricityNormal: p.electricityNormal,
  electricityLow: p.electricityLow,
  gas: p.gas,
  mono: p.gas === 0,
  solarFeedIn: p.solarFeedIn,
});

const draftBody = (d: Draft) => ({
  name: d.name.trim().toLowerCase(),
  label: d.label.trim(),
  electricityNormal: d.electricityNormal,
  electricityLow: d.electricityLow,
  gas: d.mono ? 0 : d.gas,
  solarFeedIn: d.solarFeedIn,
});

const usageChanged = (p: Preset, d: Draft) =>
  p.electricityNormal !== d.electricityNormal ||
  p.electricityLow !== d.electricityLow ||
  p.gas !== (d.mono ? 0 : d.gas) ||
  p.solarFeedIn !== d.solarFeedIn;

/** Debounced live address check via /api/address/check (same as the scrape form).
 *  Only the async result is state; "idle"/"checking" derive from the inputs. */
function useAddressCheck(postcode: string, huisnr: string): AddressState {
  const pc = postcode.replace(/\s+/g, "").toUpperCase();
  const nr = huisnr.trim();
  const key = /^\d{4}[A-Z]{2}$/.test(pc) && /^\d+$/.test(nr) ? `${pc} ${nr}` : null;
  const [result, setResult] = useState<AddressResult | null>(null);
  useEffect(() => {
    if (!key) return;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/address/check?postcode=${pc}&huisnr=${nr}`).then((x) => x.json());
        setResult(r.valid ? { key, state: "valid", street: r.street, city: r.city } : { key, state: "invalid", reason: r.reason });
      } catch {
        setResult({ key, state: "invalid", reason: "error" });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [key, pc, nr]);
  if (!key) return { state: "idle" };
  return result?.key === key ? result : { state: "checking" };
}

function AddressCard({ initial, onSaved }: { initial: Address; onSaved: (a: Address) => void }) {
  const [postcode, setPostcode] = useState(initial.postcode);
  const [huisnr, setHuisnr] = useState(initial.huisnr);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const addr = useAddressCheck(postcode, huisnr);
  const dirty = postcode.replace(/\s+/g, "").toUpperCase() !== initial.postcode || huisnr.trim() !== initial.huisnr;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await call<{ address: Address }>("/api/presets/address", "PUT", { postcode, huisnr });
      onSaved(r.address);
      setPostcode(r.address.postcode);
      setHuisnr(r.address.huisnr);
      setMsg({ ok: true, text: "Standaardadres opgeslagen" });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Standaardadres</h2>
        <span className="text-[11px] text-slate-400">
          gebruikt door “Scrape dit scenario”, “Ververs alle presets” en de CLI-runners zonder --postcode
        </span>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-500">
          Postcode
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="1234AB"
            className={`${field} w-24 uppercase`}
            maxLength={7}
            required
          />
        </label>
        <label className="text-xs text-slate-500">
          Huisnr.
          <input
            value={huisnr}
            onChange={(e) => setHuisnr(e.target.value.replace(/\D/g, ""))}
            placeholder="27"
            className={`${field} w-16`}
            required
          />
        </label>
        <div className="min-w-44 pb-1.5 text-xs">
          {addr.state === "checking" && <span className="text-slate-400">Adres controleren…</span>}
          {addr.state === "valid" && (
            <span className="font-medium text-emerald-700">
              ✓ {[addr.street, addr.city].filter(Boolean).join(", ") || "Adres gevonden"}
            </span>
          )}
          {addr.state === "invalid" && (
            <span className="font-medium text-rose-600">
              ✗ {addr.reason === "not_found" ? "Adres niet gevonden" : "Ongeldige invoer"}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={busy || !dirty || addr.state !== "valid"}
          className={btnPrimary}
          title={addr.state !== "valid" ? "Vul eerst een geldig adres in" : "Opslaan"}
        >
          Opslaan
        </button>
        {msg && <span className={`text-xs ${msg.ok ? "text-emerald-700" : "text-rose-600"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

function UsageFields({ d, set }: { d: Draft; set: (patch: Partial<Draft>) => void }) {
  const num = (v: string) => Math.max(0, Math.floor(Number(v) || 0));
  return (
    <>
      <td className="px-2 py-2">
        <input
          type="number"
          min={1}
          value={d.electricityNormal}
          onChange={(e) => set({ electricityNormal: num(e.target.value) })}
          className={`${field} mt-0 w-24 tabular-nums`}
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          min={0}
          value={d.electricityLow}
          onChange={(e) => set({ electricityLow: num(e.target.value) })}
          className={`${field} mt-0 w-24 tabular-nums`}
        />
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={d.mono ? 0 : d.gas}
            disabled={d.mono}
            onChange={(e) => set({ gas: num(e.target.value) })}
            className={`${field} mt-0 w-24 tabular-nums`}
          />
          <label className="flex items-center gap-1 whitespace-nowrap text-[11px] text-slate-500" title="Alleen stroom, geen gasaansluiting">
            <input type="checkbox" checked={d.mono} onChange={(e) => set({ mono: e.target.checked })} />
            mono
          </label>
        </div>
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          min={0}
          value={d.solarFeedIn}
          onChange={(e) => set({ solarFeedIn: num(e.target.value) })}
          className={`${field} mt-0 w-24 tabular-nums`}
        />
      </td>
    </>
  );
}

function PresetRow({
  preset,
  index,
  count,
  onChanged,
  onMove,
}: {
  preset: Preset;
  index: number;
  count: number;
  onChanged: () => Promise<void>;
  onMove: (dir: -1 | 1) => Promise<void>;
}) {
  // The row is keyed on the server copy (see the table), so a saved/reloaded
  // preset remounts the row with a fresh draft.
  const [d, setD] = useState<Draft>(() => toDraft(preset));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));
  const body = draftBody(d);
  const dirty =
    body.name !== preset.name || body.label !== preset.label || usageChanged(preset, d);
  const valid = body.label.length > 0 && /^[a-z0-9][a-z0-9-]{0,31}$/.test(body.name) && body.electricityNormal >= 1;

  const save = async () => {
    if (
      usageChanged(preset, d) &&
      preset.runCount > 0 &&
      !window.confirm(
        `Het verbruik van “${preset.label}” wijzigen?\n\nDe ${preset.runCount} bestaande scans blijven onder het oude verbruik staan (als eigen scenario); nieuwe scans van deze preset gebruiken het nieuwe verbruik.`
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await call(`/api/presets/${preset.id}`, "PATCH", body);
      await onChanged();
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  };

  const remove = async () => {
    const keep = preset.runCount > 0 ? `\n\nDe ${preset.runCount} scans blijven in het archief als eigen scenario.` : "";
    if (!window.confirm(`Preset “${preset.label}” verwijderen?${keep}`)) return;
    setBusy(true);
    setError(null);
    try {
      await call(`/api/presets/${preset.id}`, "DELETE");
      await onChanged();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <tr className={`border-t border-slate-100 ${busy ? "opacity-50" : ""}`}>
        <td className="px-2 py-2">
          <div className="flex flex-col items-center gap-0.5">
            <button disabled={busy || index === 0} onClick={() => onMove(-1)} className={btnGhost} title="Omhoog">
              ▲
            </button>
            <button disabled={busy || index === count - 1} onClick={() => onMove(1)} className={btnGhost} title="Omlaag">
              ▼
            </button>
          </div>
        </td>
        <td className="px-2 py-2">
          <input value={d.label} onChange={(e) => set({ label: e.target.value })} className={`${field} mt-0 w-32`} maxLength={40} />
        </td>
        <td className="px-2 py-2">
          <input
            value={d.name}
            onChange={(e) => set({ name: e.target.value.toLowerCase() })}
            className={`${field} mt-0 w-28 font-mono text-xs`}
            maxLength={32}
            title="Slug voor de CLI: node scripts/run-scrapes.mjs --scenario <slug>"
          />
        </td>
        <UsageFields d={d} set={set} />
        <td className="px-2 py-2 text-right tabular-nums text-slate-500">{nf.format(preset.runCount)}</td>
        <td className="px-2 py-2">
          <div className="flex items-center justify-end gap-1">
            <button disabled={busy || !dirty || !valid} onClick={save} className={btnPrimary}>
              Opslaan
            </button>
            <button disabled={busy} onClick={remove} className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-30">
              Verwijder
            </button>
          </div>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={9} className="px-2 pb-2 text-xs text-rose-600">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}

const EMPTY_DRAFT: Draft = { name: "", label: "", electricityNormal: 2500, electricityLow: 0, gas: 1000, mono: false, solarFeedIn: 0 };

function NewPresetRow({ onCreated, onCancel }: { onCreated: () => Promise<void>; onCancel: () => void }) {
  const [d, setD] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));
  const body = draftBody(d);
  const valid = body.label.length > 0 && /^[a-z0-9][a-z0-9-]{0,31}$/.test(body.name) && body.electricityNormal >= 1;

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      await call("/api/presets", "POST", body);
      await onCreated();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <tr className={`border-t-2 border-emerald-200 bg-emerald-50/40 ${busy ? "opacity-50" : ""}`}>
        <td className="px-2 py-2 text-center text-xs font-semibold text-emerald-700">nieuw</td>
        <td className="px-2 py-2">
          <input value={d.label} onChange={(e) => set({ label: e.target.value })} placeholder="Label" className={`${field} mt-0 w-32`} maxLength={40} autoFocus />
        </td>
        <td className="px-2 py-2">
          <input
            value={d.name}
            onChange={(e) => set({ name: e.target.value.toLowerCase() })}
            placeholder="slug"
            className={`${field} mt-0 w-28 font-mono text-xs`}
            maxLength={32}
          />
        </td>
        <UsageFields d={d} set={set} />
        <td className="px-2 py-2 text-right text-slate-300">—</td>
        <td className="px-2 py-2">
          <div className="flex items-center justify-end gap-1">
            <button disabled={busy || !valid} onClick={create} className={btnPrimary}>
              Toevoegen
            </button>
            <button disabled={busy} onClick={onCancel} className={btnGhost}>
              Annuleer
            </button>
          </div>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={9} className="px-2 pb-2 text-xs text-rose-600">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}

export default function PresetsAdminPage() {
  const [presets, setPresets] = useState<Preset[] | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      call<{ presets: Preset[]; address: Address }>("/api/presets", "GET")
        .then((r) => {
          setPresets(r.presets);
          setAddress(r.address);
          setLoadError(null);
        })
        .catch((err: Error) => setLoadError(err.message)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  const move = async (index: number, dir: -1 | 1) => {
    if (!presets) return;
    const ids = presets.map((p) => p.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    try {
      const r = await call<{ presets: Preset[] }>("/api/presets/order", "PUT", { ids });
      setPresets(r.presets);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Presets &amp; standaardadres</h1>
            <p className="text-sm text-slate-500">
              De scenario-chips op het dashboard en het adres waarmee preset-scans draaien.
            </p>
          </div>
          <nav className="flex gap-4">
            <Link href="/admin" className="text-sm font-medium text-emerald-700 hover:underline">
              ← Beheer
            </Link>
            <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
              Dashboard
            </Link>
          </nav>
        </header>

        {loadError && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-200">{loadError}</div>}

        {address && <AddressCard key={`${address.postcode}-${address.huisnr}`} initial={address} onSaved={setAddress} />}

        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-700">Presets</h2>
            <button onClick={() => setAdding(true)} disabled={adding || !presets} className={btnPrimary}>
              + Nieuwe preset
            </button>
          </div>

          {presets == null ? (
            <div className="py-12 text-center text-slate-400">Laden…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-2 py-1 text-center">Volgorde</th>
                    <th className="px-2 py-1">Label</th>
                    <th className="px-2 py-1">Slug</th>
                    <th className="px-2 py-1">Stroom normaal (kWh/jr)</th>
                    <th className="px-2 py-1">Stroom dal (kWh/jr)</th>
                    <th className="px-2 py-1">Gas (m³/jr)</th>
                    <th className="px-2 py-1">Teruglevering (kWh/jr)</th>
                    <th className="px-2 py-1 text-right">Scans</th>
                    <th className="px-2 py-1" />
                  </tr>
                </thead>
                <tbody>
                  {presets.map((p, i) => (
                    <PresetRow
                      key={`${p.id}:${p.name}:${p.label}:${p.electricityNormal}:${p.electricityLow}:${p.gas}:${p.solarFeedIn}`}
                      preset={p}
                      index={i}
                      count={presets.length}
                      onChanged={load}
                      onMove={(dir) => move(i, dir)}
                    />
                  ))}
                  {adding && (
                    <NewPresetRow
                      onCreated={async () => {
                        await load();
                        setAdding(false);
                      }}
                      onCancel={() => setAdding(false)}
                    />
                  )}
                  {presets.length === 0 && !adding && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Geen presets — voeg er een toe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <ul className="mt-3 space-y-1 text-[11px] text-slate-400">
            <li>Dal 0 = enkele meter · mono = alleen stroom · teruglevering 0 = geen zonnepanelen.</li>
            <li>
              Label en slug wijzigen is direct. Verbruik wijzigen maakt een nieuw scenario: bestaande scans blijven onder het oude
              verbruik staan als eigen scenario, zodat het archief en de trends kloppen.
            </li>
            <li>
              De slug is de naam voor de CLI (<code>node scripts/run-scrapes.mjs --scenario &lt;slug&gt;</code>); “Ververs alle presets” draait
              ze in deze volgorde.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
