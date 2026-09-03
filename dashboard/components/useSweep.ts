"use client";

import { useEffect, useRef, useState } from "react";

export type SweepRun = {
  platform: string;
  label: string;
  offers: number;
  status: string; // completed | failed
  error: string | null;
};
export type SweepStatus = {
  completed: number;
  succeeded: number;
  failed: number;
  expected: number;
  done: boolean;
  runs: SweepRun[];
};
export type SweepApi = {
  busy: boolean;
  label: string | null;
  sweepId: string | null;
  status: SweepStatus | null;
  error: string | null;
  start: (body: Record<string, unknown>, label: string) => Promise<void>;
};

/** Shared sweep launcher + progress poller (one active sweep per page).
 *  The last result stays visible until the next sweep starts. */
export function useSweep(onDataChanged: () => void): SweepApi {
  const [sweep, setSweep] = useState<{ sweepId: string; expected: number; label: string; done: boolean } | null>(null);
  const [status, setStatus] = useState<SweepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);
  const onChanged = useRef(onDataChanged);
  onChanged.current = onDataChanged;

  const start = async (body: Record<string, unknown>, label: string) => {
    setError(null);
    setStatus(null);
    const res = await fetch("/api/scrapes/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error ?? "Starten mislukt");
      return;
    }
    startedAt.current = Date.now();
    setSweep({ sweepId: j.sweepId, expected: j.expectedRuns, label, done: false });
    setStatus({ completed: 0, succeeded: 0, failed: 0, expected: j.expectedRuns, done: false, runs: [] });
  };

  useEffect(() => {
    if (!sweep || sweep.done) return;
    timer.current = setInterval(async () => {
      const s: SweepStatus = await fetch(
        `/api/scrapes/status?sweepId=${encodeURIComponent(sweep.sweepId)}&expected=${sweep.expected}`
      ).then((x) => x.json());
      setStatus((prev) => {
        if (s.completed !== (prev?.completed ?? 0)) onChanged.current();
        return s;
      });
      if (s.done || Date.now() - startedAt.current > 20 * 60_000) {
        if (timer.current) clearInterval(timer.current);
        setSweep((cur) => (cur ? { ...cur, done: true } : cur));
        if (!s.done)
          setError(`Sweep-timeout: ${s.completed}/${s.expected} platforms hebben gerapporteerd — bekijk het log`);
        onChanged.current();
      }
    }, 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sweep?.sweepId, sweep?.done]);

  return {
    busy: sweep != null && !sweep.done && !(status?.done ?? false),
    label: sweep?.label ?? null,
    sweepId: sweep?.sweepId ?? null,
    status,
    error,
    start,
  };
}
