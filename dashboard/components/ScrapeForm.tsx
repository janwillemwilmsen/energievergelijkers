"use client";

import { useEffect, useRef, useState } from "react";
import { SweepApi } from "./useSweep";

type AddressState =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "valid"; street: string | null; city: string | null }
  | { state: "invalid"; reason: string };

/**
 * Custom scrape launcher: postcode + huisnummer (live validated), usage
 * (normaal/dal), gas or mono, teruglevering. Creates/finds the scenario and
 * starts a sweep for exactly that address and usage.
 */
export default function ScrapeForm({
  sweep,
  onScenarioCreated,
}: {
  sweep: SweepApi;
  onScenarioCreated: (scenarioId: number) => void;
}) {
  const [postcode, setPostcode] = useState("");
  const [huisnr, setHuisnr] = useState("");
  const [addr, setAddr] = useState<AddressState>({ state: "idle" });
  const [normaal, setNormaal] = useState(2500);
  const [dal, setDal] = useState(0);
  const [gas, setGas] = useState(1000);
  const [mono, setMono] = useState(false);
  const [solar, setSolar] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live postcode check, debounced.
  useEffect(() => {
    const pc = postcode.replace(/\s+/g, "").toUpperCase();
    if (!/^\d{4}[A-Z]{2}$/.test(pc) || !/^\d+$/.test(huisnr.trim())) {
      setAddr({ state: "idle" });
      return;
    }
    setAddr({ state: "checking" });
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/address/check?postcode=${pc}&huisnr=${huisnr.trim()}`).then((x) => x.json());
        setAddr(r.valid ? { state: "valid", street: r.street, city: r.city } : { state: "invalid", reason: r.reason });
      } catch {
        setAddr({ state: "invalid", reason: "error" });
      }
    }, 500);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [postcode, huisnr]);

  const canSubmit = addr.state === "valid" && normaal > 0 && (mono || gas > 0) && !sweep.busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const pc = postcode.replace(/\s+/g, "").toUpperCase();
    // 1. find-or-create the scenario for this usage profile
    const sc = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        electricityNormal: normaal,
        electricityLow: dal,
        gas: mono ? 0 : gas,
        solarFeedIn: solar,
      }),
    }).then((x) => x.json());
    onScenarioCreated(sc.scenario.id);
    // 2. start the sweep for this address
    await sweep.start(
      { scenarioId: sc.scenario.id, postcode: pc, huisnr: huisnr.trim() },
      `${pc} ${huisnr.trim()}`
    );
  };

  const field = "mt-1 block rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200 disabled:opacity-40";

  return (
    <form onSubmit={submit} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Eigen scrape — adres &amp; verbruik</h2>
        <span className="text-[11px] text-slate-400">maakt (of hergebruikt) het scenario en start direct de 6 scrapers</span>
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

        <span className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

        <label className="text-xs text-slate-500">
          Stroom normaal (kWh/jr)
          <input type="number" min={1} value={normaal} onChange={(e) => setNormaal(Number(e.target.value))} className={`${field} w-32`} />
        </label>
        <label className="text-xs text-slate-500">
          Stroom dal (kWh/jr)
          <input type="number" min={0} value={dal} onChange={(e) => setDal(Number(e.target.value))} className={`${field} w-28`} />
        </label>
        <label className={`text-xs ${mono ? "text-slate-300" : "text-slate-500"}`}>
          Gas (m³/jr)
          <input type="number" min={0} value={gas} disabled={mono} onChange={(e) => setGas(Number(e.target.value))} className={`${field} w-24`} />
        </label>
        <label className="flex items-center gap-1.5 pb-2 text-xs text-slate-600" title="Alleen stroom vergelijken, geen gasaansluiting">
          <input type="checkbox" checked={mono} onChange={(e) => setMono(e.target.checked)} />
          Alleen stroom
        </label>
        <label className="text-xs text-slate-500" title="Teruglevering zonnepanelen">
          Teruglevering (kWh/jr)
          <input type="number" min={0} value={solar} onChange={(e) => setSolar(Number(e.target.value))} className={`${field} w-32`} />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
          title={addr.state !== "valid" ? "Vul eerst een geldig adres in" : "Start de 6 scrapers"}
        >
          ▶ Start scrape
        </button>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Dal 0 = enkele meter · teruglevering 0 = geen zonnepanelen · resultaten verschijnen live in de kaarten en het archief.
      </p>
    </form>
  );
}
