"use client";

import { useCallback, useEffect, useState } from "react";
import ScenarioPicker, { Scenario } from "./ScenarioPicker";
import KpiCards, { OverviewCard } from "./KpiCards";
import TrendChart from "./TrendChart";
import OffersTable, { OfferRow } from "./OffersTable";
import ScrapeControls from "./ScrapeControls";
import ScrapeForm from "./ScrapeForm";
import { useSweep } from "./useSweep";

export default function Dashboard() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioId, setScenarioId] = useState<number | null>(null);
  const [overview, setOverview] = useState<{ myCompany: string | null; cards: OverviewCard[] } | null>(null);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScenarios = useCallback(async () => {
    const r = await fetch("/api/scenarios").then((x) => x.json());
    setScenarios(r.scenarios);
    if (r.scenarios.length && scenarioId == null) {
      const medium = r.scenarios.find((s: Scenario) => s.name === "medium");
      setScenarioId((medium ?? r.scenarios[0]).id);
    }
  }, [scenarioId]);

  useEffect(() => {
    loadScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = useCallback(
    (silent = false) => {
      if (scenarioId == null) return;
      if (!silent) setLoading(true);
      Promise.all([
        fetch(`/api/overview?scenarioId=${scenarioId}`).then((x) => x.json()),
        fetch(`/api/offers?scenarioId=${scenarioId}`).then((x) => x.json()),
      ]).then(([ov, of]) => {
        setOverview(ov);
        setOffers(of.offers ?? []);
        setLoading(false);
      });
    },
    [scenarioId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sweep = useSweep(() => {
    loadScenarios();
    loadData(true);
  });

  const onScenarioCreated = async (id: number) => {
    await loadScenarios();
    setScenarioId(id);
  };

  const activeScenario = scenarios.find((s) => s.id === scenarioId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rank Radar</h1>
          <p className="text-sm text-slate-500">
            Energiecontract-rankings over 6 vergelijkers
            {overview?.myCompany ? (
              <>
                {" — eigen merk: "}
                <span className="font-semibold text-emerald-700">{overview.myCompany}</span>
              </>
            ) : null}
          </p>
        </div>
        <a href="/archive" className="text-sm font-medium text-emerald-700 hover:underline">
          Scan-archief →
        </a>
        {activeScenario && (
          <div className="text-xs text-slate-500">
            {activeScenario.electricityNormal + activeScenario.electricityLow} kWh
            {activeScenario.gas > 0 ? ` · ${activeScenario.gas} m³ gas` : " · alleen stroom"}
            {activeScenario.solarFeedIn > 0 ? ` · ${activeScenario.solarFeedIn} kWh teruglevering` : ""}
          </div>
        )}
      </header>

      <ScenarioPicker scenarios={scenarios} activeId={scenarioId} onSelect={setScenarioId} />

      <ScrapeForm sweep={sweep} onScenarioCreated={onScenarioCreated} />

      <ScrapeControls
        scenarioId={scenarioId}
        scenarioLabel={
          activeScenario
            ? activeScenario.name ??
              `${activeScenario.electricityNormal + activeScenario.electricityLow} kWh scenario`
            : "scenario"
        }
        sweep={sweep}
      />

      {loading ? (
        <div className="py-24 text-center text-slate-400">Laden…</div>
      ) : (
        <>
          <KpiCards cards={overview?.cards ?? []} />
          {scenarioId != null && <TrendChart scenarioId={scenarioId} />}
          <OffersTable offers={offers} />
        </>
      )}
    </div>
  );
}
