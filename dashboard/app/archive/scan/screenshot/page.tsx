"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { platformColor } from "@/lib/platformColors";

type ScanInfo = {
  scenario: { electricityNormal: number; electricityLow: number; gas: number; solarFeedIn: number };
  address: string | null;
  scrapedAt: string;
};

const PLATFORMS = ["gaslicht", "energiekiezer", "energievergelijk", "independer", "overstappen", "pricewise"];
const PLATFORM_LABELS: Record<string, string> = {
  gaslicht: "Gaslicht.com",
  energiekiezer: "EnergieKiezer.nl",
  energievergelijk: "Energievergelijk.nl",
  independer: "Independer.nl",
  overstappen: "Overstappen.nl",
  pricewise: "Pricewise.nl",
};

type Status = "idle" | "running" | "done" | "error";
type Row = { platform: string; state: Status; mtime?: number; error?: string; errorAt?: number };

const imgUrl = (sweepId: string, platform: string, v?: number) =>
  `/api/archive/scan/screenshot/image?sweepId=${encodeURIComponent(sweepId)}&platform=${platform}${v ? `&v=${v}` : ""}`;

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
  );
}

function ScreenshotInner() {
  const params = useSearchParams();
  const sweepId = params.get("sweepId") ?? "";
  // Preset sweeps hold 4 scenarios under one sweepId; scope to one scenario.
  const scenarioId = params.get("scenarioId");
  const [scan, setScan] = useState<ScanInfo | null>(null);
  const [rows, setRows] = useState<Row[]>(PLATFORMS.map((p) => ({ platform: p, state: "idle" as Status })));
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAny, setHasAny] = useState(false);

  // Load scan info + any screenshots already taken for this sweep. No rerun.
  useEffect(() => {
    if (!sweepId) return;
    fetch(
      `/api/archive/scan?sweepId=${encodeURIComponent(sweepId)}${scenarioId ? `&scenarioId=${encodeURIComponent(scenarioId)}` : ""}`
    )
      .then((x) => x.json())
      .then((r) => (r.error ? setError(r.error) : setScan(r)));
    fetch(`/api/archive/scan/screenshot?sweepId=${encodeURIComponent(sweepId)}`)
      .then((x) => x.json())
      .then((r) => {
        const shots: Record<string, number | null> = r.shots ?? {};
        setRows(
          PLATFORMS.map((p) =>
            shots[p] ? { platform: p, state: "done" as Status, mtime: shots[p] as number } : { platform: p, state: "idle" as Status }
          )
        );
        setHasAny(Object.values(shots).some(Boolean));
      })
      .catch(() => {});
  }, [sweepId, scenarioId]);

  const setRow = (platform: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.platform === platform ? { ...r, ...patch } : r)));

  // Without `only`, runs all platforms; with it, just that subset (retry).
  async function start(only?: string[]) {
    if (!sweepId || running) return;
    setRunning(true);
    setError(null);

    let res: Response;
    try {
      res = await fetch("/api/archive/scan/screenshot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sweepId,
          ...(scenarioId ? { scenarioId: Number(scenarioId) } : {}),
          ...(only ? { platforms: only } : {}),
        }),
      });
    } catch {
      setError("Kon de screenshot-run niet starten.");
      setRunning(false);
      return;
    }
    if (!res.ok || !res.body) {
      const msg = await res.json().then((b) => b.error).catch(() => null);
      setError(msg ?? "Screenshot-run mislukt.");
      setRunning(false);
      return;
    }

    // Read the newline-delimited JSON event stream.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    for (;;) {
      const { value, done: streamDone } = await reader.read();
      if (streamDone) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let ev: Record<string, unknown>;
        try {
          ev = JSON.parse(line);
        } catch {
          continue;
        }
        if (ev.type === "meta") {
          // Keep existing rows/images; each platform flips to "running" on its
          // own "start" event and to the fresh shot on "done".
        } else if (ev.type === "start") {
          setRow(ev.platform as string, { state: "running", error: undefined });
        } else if (ev.type === "done") {
          setRow(ev.platform as string, { state: "done", mtime: ev.mtime as number });
          setHasAny(true);
        } else if (ev.type === "error") {
          setRow(ev.platform as string, { state: "error", error: ev.error as string | undefined, errorAt: Date.now() });
        }
      }
    }
    setRunning(false);
  }

  if (error && !scan) return <div className="py-24 text-center text-rose-500">{error}</div>;
  if (!scan) return <div className="py-24 text-center text-slate-400">Laden…</div>;

  const sc = scan.scenario;
  const doneCount = rows.filter((r) => r.state === "done").length;
  const totalKwh = sc.electricityNormal + sc.electricityLow;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Screenshots ter validatie</h1>
          <p className="text-sm text-slate-500">
            {totalKwh} kWh
            {sc.gas > 0 ? ` · ${sc.gas} m³ gas` : " · alleen stroom"}
            {sc.solarFeedIn > 0 ? ` · ${sc.solarFeedIn} kWh teruglevering` : ""}
            {scan.address ? ` · 📍 ${scan.address}` : ""}
          </p>
        </div>
        <Link
          href={`/archive/scan?sweepId=${encodeURIComponent(sweepId)}${scenarioId ? `&scenarioId=${encodeURIComponent(scenarioId)}` : ""}`}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Terug naar scan
        </Link>
      </header>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Maakt van elke vergelijker een volledige schermafbeelding met exact hetzelfde adres en verbruik als deze
            scan, zodat je de gescrapete resultaten kunt controleren.
            {hasAny && !running && " De eerder gemaakte screenshots blijven bewaard."}
          </p>
          <button
            onClick={() => start()}
            disabled={running || !scan.address}
            className="flex shrink-0 items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running && <Spinner />}
            {running
              ? `Bezig… (${doneCount}/${rows.length})`
              : hasAny
                ? "Opnieuw uitvoeren"
                : "Start screenshots"}
          </button>
        </div>
        {!scan.address && (
          <p className="mt-2 text-xs text-rose-600">
            Deze scan heeft geen postcode/huisnummer, dus er kunnen geen screenshots gemaakt worden.
          </p>
        )}
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {rows.map((row) => {
          const c = platformColor(row.platform);
          return (
            <div key={row.platform} className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className={`flex items-center justify-between gap-2 rounded-t-xl border-t-4 ${c.border} px-4 py-2.5`}>
                <span className={`flex items-center gap-2 text-sm font-bold ${c.text}`}>
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c.hex }} />
                  {PLATFORM_LABELS[row.platform] ?? row.platform}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  {row.state === "running" && (
                    <>
                      <Spinner /> <span className="text-slate-500">bezig…</span>
                    </>
                  )}
                  {row.state === "idle" && <span className="text-slate-400">nog niet gemaakt</span>}
                  {row.state === "done" && <span className="text-emerald-600">✓ klaar</span>}
                  {row.state === "error" && <span className="text-rose-600">✗ mislukt</span>}
                  {/* Per-platform trigger: first shot when idle, re-shot when done
                      (the error state has its own retry button in the body). */}
                  {(row.state === "idle" || row.state === "done") && (
                    <button
                      onClick={() => start([row.platform])}
                      disabled={running || !scan.address}
                      title={row.state === "done" ? "Maak deze screenshot opnieuw" : "Maak alleen deze screenshot"}
                      className="ml-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {row.state === "done" ? "↻ Opnieuw" : "📷 Maak screenshot"}
                    </button>
                  )}
                </span>
              </div>
              <div className="p-3">
                {row.state === "done" ? (
                  <a
                    href={imgUrl(sweepId, row.platform, row.mtime)}
                    target="_blank"
                    rel="noreferrer"
                    title="Open volledige screenshot"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl(sweepId, row.platform, row.mtime)}
                      alt={`Screenshot ${row.platform}`}
                      className="max-h-96 w-full rounded-md object-cover object-top ring-1 ring-slate-200 transition hover:opacity-90"
                    />
                  </a>
                ) : row.state === "error" ? (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-xs text-rose-600">{row.error ?? "Onbekende fout"}</p>
                    <button
                      onClick={() => start([row.platform])}
                      disabled={running}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ↻ Opnieuw proberen
                    </button>
                    {/* The client writes a debug shot of the page where it got
                        stuck; show it so the cause (captcha, validation error,
                        cookie wall) is visible without shell access to /data. */}
                    <a
                      href={`${imgUrl(sweepId, row.platform, row.errorAt)}&debug=1`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open de debug-screenshot van het moment van falen"
                      className="w-full"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${imgUrl(sweepId, row.platform, row.errorAt)}&debug=1`}
                        alt={`Debug-screenshot ${row.platform}`}
                        onError={(e) => ((e.currentTarget.parentElement as HTMLElement).hidden = true)}
                        className="max-h-96 w-full rounded-md object-cover object-top ring-1 ring-rose-200 transition hover:opacity-90"
                      />
                      <span className="mt-1 block text-[11px] text-slate-400">Pagina op het moment van falen</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center text-xs text-slate-400">
                    {row.state === "running" ? "Screenshot wordt gemaakt…" : "Nog geen screenshot"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ScreenshotPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Suspense fallback={<div className="py-24 text-center text-slate-400">Laden…</div>}>
          <ScreenshotInner />
        </Suspense>
      </div>
    </main>
  );
}
