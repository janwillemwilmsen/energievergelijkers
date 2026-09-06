(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/Dashboard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Dashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ScenarioPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ScenarioPicker.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$KpiCards$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/KpiCards.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$TrendChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/TrendChart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OffersTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/OffersTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ScrapeControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ScrapeControls.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ScrapeForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ScrapeForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$useSweep$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/useSweep.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
function Dashboard() {
    _s();
    const [scenarios, setScenarios] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [scenarioId, setScenarioId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [overview, setOverview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [offers, setOffers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const loadScenarios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Dashboard.useCallback[loadScenarios]": async ()=>{
            const r = await fetch("/api/scenarios").then({
                "Dashboard.useCallback[loadScenarios]": (x)=>x.json()
            }["Dashboard.useCallback[loadScenarios]"]);
            setScenarios(r.scenarios);
            if (r.scenarios.length && scenarioId == null) {
                const medium = r.scenarios.find({
                    "Dashboard.useCallback[loadScenarios].medium": (s)=>s.name === "medium"
                }["Dashboard.useCallback[loadScenarios].medium"]);
                setScenarioId((medium ?? r.scenarios[0]).id);
            }
        }
    }["Dashboard.useCallback[loadScenarios]"], [
        scenarioId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            loadScenarios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["Dashboard.useEffect"], []);
    const loadData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Dashboard.useCallback[loadData]": (silent = false)=>{
            if (scenarioId == null) return;
            if (!silent) setLoading(true);
            Promise.all([
                fetch(`/api/overview?scenarioId=${scenarioId}`).then({
                    "Dashboard.useCallback[loadData]": (x)=>x.json()
                }["Dashboard.useCallback[loadData]"]),
                fetch(`/api/offers?scenarioId=${scenarioId}`).then({
                    "Dashboard.useCallback[loadData]": (x)=>x.json()
                }["Dashboard.useCallback[loadData]"])
            ]).then({
                "Dashboard.useCallback[loadData]": ([ov, of])=>{
                    setOverview(ov);
                    setOffers(of.offers ?? []);
                    setLoading(false);
                }
            }["Dashboard.useCallback[loadData]"]);
        }
    }["Dashboard.useCallback[loadData]"], [
        scenarioId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Dashboard.useEffect": ()=>{
            loadData();
        }
    }["Dashboard.useEffect"], [
        loadData
    ]);
    const sweep = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$useSweep$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSweep"])({
        "Dashboard.useSweep[sweep]": ()=>{
            loadScenarios();
            loadData(true);
        }
    }["Dashboard.useSweep[sweep]"]);
    const onScenarioCreated = async (id)=>{
        await loadScenarios();
        setScenarioId(id);
    };
    const activeScenario = scenarios.find((s)=>s.id === scenarioId) ?? null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto max-w-7xl px-4 py-6 space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex flex-wrap items-end justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold tracking-tight text-slate-900",
                                children: "Rank Radar"
                            }, void 0, false, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500",
                                children: [
                                    "Energiecontract-rankings over 6 vergelijkers",
                                    overview?.myCompany ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            " — eigen merk: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold text-emerald-700",
                                                children: overview.myCompany
                                            }, void 0, false, {
                                                fileName: "[project]/components/Dashboard.tsx",
                                                lineNumber: 75,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/Dashboard.tsx",
                                        lineNumber: 73,
                                        columnNumber: 15
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/Dashboard.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/archive",
                        className: "text-sm font-medium text-emerald-700 hover:underline",
                        children: "Scan-archief →"
                    }, void 0, false, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    activeScenario && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-slate-500",
                        children: [
                            activeScenario.electricityNormal + activeScenario.electricityLow,
                            " kWh",
                            activeScenario.gas > 0 ? ` · ${activeScenario.gas} m³ gas` : " · alleen stroom",
                            activeScenario.solarFeedIn > 0 ? ` · ${activeScenario.solarFeedIn} kWh teruglevering` : ""
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 84,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ScenarioPicker$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                scenarios: scenarios,
                activeId: scenarioId,
                onSelect: setScenarioId
            }, void 0, false, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ScrapeForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                sweep: sweep,
                onScenarioCreated: onScenarioCreated
            }, void 0, false, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ScrapeControls$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                scenarioId: scenarioId,
                scenarioLabel: activeScenario ? activeScenario.name ?? `${activeScenario.electricityNormal + activeScenario.electricityLow} kWh scenario` : "scenario",
                sweep: sweep
            }, void 0, false, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "py-24 text-center text-slate-400",
                children: "Laden…"
            }, void 0, false, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 108,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$KpiCards$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        cards: overview?.cards ?? []
                    }, void 0, false, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this),
                    scenarioId != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$TrendChart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        scenarioId: scenarioId
                    }, void 0, false, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 112,
                        columnNumber: 34
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OffersTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        offers: offers
                    }, void 0, false, {
                        fileName: "[project]/components/Dashboard.tsx",
                        lineNumber: 113,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/Dashboard.tsx",
                lineNumber: 110,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/Dashboard.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_s(Dashboard, "cZ1V7UwIEE6w4GGY/SUVXPci12E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$useSweep$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSweep"]
    ];
});
_c = Dashboard;
var _c;
__turbopack_context__.k.register(_c, "Dashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/KpiCards.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KpiCards
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function DeltaBadge({ delta }) {
    if (delta == null) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400",
        children: "nieuw"
    }, void 0, false, {
        fileName: "[project]/components/KpiCards.tsx",
        lineNumber: 20,
        columnNumber: 12
    }, this);
    if (delta > 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700",
        children: [
            "↑ ",
            delta,
            " ",
            delta === 1 ? "plek" : "plekken"
        ]
    }, void 0, true, {
        fileName: "[project]/components/KpiCards.tsx",
        lineNumber: 23,
        columnNumber: 7
    }, this);
    if (delta < 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700",
        children: [
            "↓ ",
            -delta,
            " ",
            delta === -1 ? "plek" : "plekken"
        ]
    }, void 0, true, {
        fileName: "[project]/components/KpiCards.tsx",
        lineNumber: 29,
        columnNumber: 7
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500",
        children: "= gelijk"
    }, void 0, false, {
        fileName: "[project]/components/KpiCards.tsx",
        lineNumber: 33,
        columnNumber: 10
    }, this);
}
_c = DeltaBadge;
function KpiCards({ cards }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
        children: cards.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-semibold uppercase tracking-wide text-slate-400",
                                children: c.label
                            }, void 0, false, {
                                fileName: "[project]/components/KpiCards.tsx",
                                lineNumber: 42,
                                columnNumber: 13
                            }, this),
                            c.hasData && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DeltaBadge, {
                                delta: c.delta
                            }, void 0, false, {
                                fileName: "[project]/components/KpiCards.tsx",
                                lineNumber: 43,
                                columnNumber: 27
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/KpiCards.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    !c.hasData ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 text-sm text-slate-400",
                        children: "Geen data voor dit scenario"
                    }, void 0, false, {
                        fileName: "[project]/components/KpiCards.tsx",
                        lineNumber: 46,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex items-baseline gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xl font-bold text-slate-900",
                                        children: c.myRank != null ? `#${c.myRank}` : "—"
                                    }, void 0, false, {
                                        fileName: "[project]/components/KpiCards.tsx",
                                        lineNumber: 50,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400",
                                        children: [
                                            "van ",
                                            c.offerCount
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/KpiCards.tsx",
                                        lineNumber: 53,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/KpiCards.tsx",
                                lineNumber: 49,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 space-y-0.5 text-xs text-slate-500",
                                children: [
                                    c.myAnnualCost != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Eigen beste: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-slate-700",
                                                children: [
                                                    "€",
                                                    c.myAnnualCost.toFixed(0),
                                                    "/jr"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/KpiCards.tsx",
                                                lineNumber: 58,
                                                columnNumber: 34
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/KpiCards.tsx",
                                        lineNumber: 57,
                                        columnNumber: 19
                                    }, this),
                                    c.leader && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "#1: ",
                                            c.leader.supplier,
                                            " (€",
                                            c.leader.annualCost.toFixed(0),
                                            ")",
                                            c.gapToLeader != null && c.gapToLeader > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-rose-500",
                                                children: [
                                                    " · +€",
                                                    c.gapToLeader.toFixed(0)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/KpiCards.tsx",
                                                lineNumber: 65,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/KpiCards.tsx",
                                        lineNumber: 62,
                                        columnNumber: 19
                                    }, this),
                                    c.scrapedAt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-slate-300",
                                        children: new Date(c.scrapedAt).toLocaleString("nl-NL", {
                                            dateStyle: "short",
                                            timeStyle: "short"
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/components/KpiCards.tsx",
                                        lineNumber: 70,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/KpiCards.tsx",
                                lineNumber: 55,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/KpiCards.tsx",
                        lineNumber: 48,
                        columnNumber: 13
                    }, this)
                ]
            }, c.platform, true, {
                fileName: "[project]/components/KpiCards.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/components/KpiCards.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c1 = KpiCards;
var _c, _c1;
__turbopack_context__.k.register(_c, "DeltaBadge");
__turbopack_context__.k.register(_c1, "KpiCards");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/OffersTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OffersTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const PAGE_SIZE = 25;
function MultiSelect({ label, options, selected, onChange }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen((v)=>!v),
                className: "rounded-md bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100",
                children: [
                    label,
                    selected.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-1 rounded-full bg-slate-900 px-1.5 text-[10px] text-white",
                        children: selected.size
                    }, void 0, false, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 44,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OffersTable.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute z-10 mt-1 max-h-64 w-56 overflow-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "mb-1 text-[11px] text-emerald-700 hover:underline",
                        onClick: ()=>onChange(new Set()),
                        children: "Alles wissen"
                    }, void 0, false, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this),
                    options.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex items-center gap-2 rounded px-1 py-0.5 text-xs text-slate-700 hover:bg-slate-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: selected.has(o),
                                    onChange: (e)=>{
                                        const next = new Set(selected);
                                        if (e.target.checked) next.add(o);
                                        else next.delete(o);
                                        onChange(next);
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/OffersTable.tsx",
                                    lineNumber: 57,
                                    columnNumber: 15
                                }, this),
                                o
                            ]
                        }, o, true, {
                            fileName: "[project]/components/OffersTable.tsx",
                            lineNumber: 56,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/components/OffersTable.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/OffersTable.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(MultiSelect, "xG1TONbKtDWtdOTrXaTAsNhPg/Q=");
_c = MultiSelect;
function OffersTable({ offers }) {
    _s1();
    const [sortKey, setSortKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("rank");
    const [sortAsc, setSortAsc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [platformFilter, setPlatformFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [supplierFilter, setSupplierFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [typeFilter, setTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [onlyMine, setOnlyMine] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const platforms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffersTable.useMemo[platforms]": ()=>[
                ...new Set(offers.map({
                    "OffersTable.useMemo[platforms]": (o)=>o.platformLabel
                }["OffersTable.useMemo[platforms]"]))
            ].sort()
    }["OffersTable.useMemo[platforms]"], [
        offers
    ]);
    const suppliers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffersTable.useMemo[suppliers]": ()=>[
                ...new Set(offers.map({
                    "OffersTable.useMemo[suppliers]": (o)=>o.supplier
                }["OffersTable.useMemo[suppliers]"]))
            ].sort()
    }["OffersTable.useMemo[suppliers]"], [
        offers
    ]);
    const types = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffersTable.useMemo[types]": ()=>[
                ...new Set(offers.map({
                    "OffersTable.useMemo[types]": (o)=>o.contractType
                }["OffersTable.useMemo[types]"]))
            ].sort()
    }["OffersTable.useMemo[types]"], [
        offers
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "OffersTable.useMemo[filtered]": ()=>{
            let rows = offers;
            if (platformFilter.size) rows = rows.filter({
                "OffersTable.useMemo[filtered]": (o)=>platformFilter.has(o.platformLabel)
            }["OffersTable.useMemo[filtered]"]);
            if (supplierFilter.size) rows = rows.filter({
                "OffersTable.useMemo[filtered]": (o)=>supplierFilter.has(o.supplier)
            }["OffersTable.useMemo[filtered]"]);
            if (typeFilter.size) rows = rows.filter({
                "OffersTable.useMemo[filtered]": (o)=>typeFilter.has(o.contractType)
            }["OffersTable.useMemo[filtered]"]);
            if (onlyMine) rows = rows.filter({
                "OffersTable.useMemo[filtered]": (o)=>o.isMyCompany
            }["OffersTable.useMemo[filtered]"]);
            const dir = sortAsc ? 1 : -1;
            return [
                ...rows
            ].sort({
                "OffersTable.useMemo[filtered]": (a, b)=>{
                    const va = a[sortKey], vb = b[sortKey];
                    if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
                    return String(va).localeCompare(String(vb)) * dir;
                }
            }["OffersTable.useMemo[filtered]"]);
        }
    }["OffersTable.useMemo[filtered]"], [
        offers,
        platformFilter,
        supplierFilter,
        typeFilter,
        onlyMine,
        sortKey,
        sortAsc
    ]);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    if (page >= pages && page !== 0) setPage(0);
    const header = (key, label, right = false)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            className: `cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 ${right ? "text-right" : "text-left"}`,
            onClick: ()=>{
                if (sortKey === key) setSortAsc(!sortAsc);
                else {
                    setSortKey(key);
                    setSortAsc(true);
                }
                setPage(0);
            },
            children: [
                label,
                sortKey === key && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "ml-1",
                    children: sortAsc ? "▲" : "▼"
                }, void 0, false, {
                    fileName: "[project]/components/OffersTable.tsx",
                    lineNumber: 120,
                    columnNumber: 27
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/OffersTable.tsx",
            lineNumber: 108,
            columnNumber: 5
        }, this);
    const typeBadge = (t, months)=>{
        const style = t === "vast" ? "bg-sky-50 text-sky-700 ring-sky-200" : t === "dynamisch" ? "bg-violet-50 text-violet-700 ring-violet-200" : t === "combinatie" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-slate-50 text-slate-600 ring-slate-200";
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: `rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${style}`,
            children: [
                t,
                months ? ` ${months / 12}jr` : ""
            ]
        }, void 0, true, {
            fileName: "[project]/components/OffersTable.tsx",
            lineNumber: 131,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl bg-white shadow-sm ring-1 ring-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2 border-b border-slate-100 p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mr-2 text-sm font-semibold text-slate-700",
                        children: [
                            "Alle contracten ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-normal text-slate-400",
                                children: [
                                    "(",
                                    filtered.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OffersTable.tsx",
                                lineNumber: 142,
                                columnNumber: 27
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MultiSelect, {
                        label: "Platform",
                        options: platforms,
                        selected: platformFilter,
                        onChange: (s)=>{
                            setPlatformFilter(s);
                            setPage(0);
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MultiSelect, {
                        label: "Leverancier",
                        options: suppliers,
                        selected: supplierFilter,
                        onChange: (s)=>{
                            setSupplierFilter(s);
                            setPage(0);
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MultiSelect, {
                        label: "Contracttype",
                        options: types,
                        selected: typeFilter,
                        onChange: (s)=>{
                            setTypeFilter(s);
                            setPage(0);
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center gap-1.5 text-xs text-slate-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: onlyMine,
                                onChange: (e)=>{
                                    setOnlyMine(e.target.checked);
                                    setPage(0);
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/OffersTable.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this),
                            "Alleen eigen merk"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OffersTable.tsx",
                lineNumber: 140,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full min-w-[720px] text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "border-b border-slate-100",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    header("rank", "Rank"),
                                    header("platform", "Platform"),
                                    header("supplier", "Leverancier"),
                                    header("contractName", "Contract"),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400",
                                        children: "Type"
                                    }, void 0, false, {
                                        fileName: "[project]/components/OffersTable.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this),
                                    header("monthlyCost", "€/mnd", true),
                                    header("annualCost", "€/jaar", true),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400",
                                        children: "Korting"
                                    }, void 0, false, {
                                        fileName: "[project]/components/OffersTable.tsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OffersTable.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/OffersTable.tsx",
                            lineNumber: 155,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: pageRows.map((o)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: o.isMyCompany ? "border-b border-emerald-100 bg-emerald-50/70 font-medium" : "border-b border-slate-50 hover:bg-slate-50/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-3 py-2 tabular-nums text-slate-500",
                                            children: [
                                                "#",
                                                o.rank
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 177,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-3 py-2 text-slate-500",
                                            children: o.platformLabel
                                        }, void 0, false, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 178,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-3 py-2 text-slate-800",
                                            children: [
                                                o.supplier,
                                                o.isMyCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ml-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white",
                                                    children: "WIJ"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/OffersTable.tsx",
                                                    lineNumber: 182,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 179,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "max-w-72 truncate px-3 py-2 text-slate-600",
                                            title: o.contractName,
                                            children: o.contractName
                                        }, void 0, false, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 185,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-3 py-2",
                                            children: typeBadge(o.contractType, o.durationMonths)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 188,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "text-gray-700 px-3 py-2 text-right tabular-nums text-slate-700",
                                            children: [
                                                "€",
                                                o.monthlyCost.toFixed(2)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-3 py-2 text-right tabular-nums font-medium text-slate-900",
                                            children: [
                                                "€",
                                                o.annualCost.toFixed(0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 190,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-3 py-2 text-right tabular-nums text-emerald-700",
                                            children: o.discount ? `€${o.discount.toFixed(0)}` : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OffersTable.tsx",
                                            lineNumber: 191,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, o.id, true, {
                                    fileName: "[project]/components/OffersTable.tsx",
                                    lineNumber: 169,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/OffersTable.tsx",
                            lineNumber: 167,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/OffersTable.tsx",
                    lineNumber: 154,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/OffersTable.tsx",
                lineNumber: 153,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between border-t border-slate-100 p-3 text-xs text-slate-500",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            filtered.length === 0 ? "0" : page * PAGE_SIZE + 1,
                            "–",
                            Math.min((page + 1) * PAGE_SIZE, filtered.length),
                            " van",
                            " ",
                            filtered.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: page === 0,
                                onClick: ()=>setPage(page - 1),
                                className: "rounded-md bg-slate-100 px-2.5 py-1 disabled:opacity-40",
                                children: "← Vorige"
                            }, void 0, false, {
                                fileName: "[project]/components/OffersTable.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-1 py-1",
                                children: [
                                    page + 1,
                                    "/",
                                    pages
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OffersTable.tsx",
                                lineNumber: 213,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: page >= pages - 1,
                                onClick: ()=>setPage(page + 1),
                                className: "rounded-md bg-slate-100 px-2.5 py-1 disabled:opacity-40",
                                children: "Volgende →"
                            }, void 0, false, {
                                fileName: "[project]/components/OffersTable.tsx",
                                lineNumber: 216,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OffersTable.tsx",
                        lineNumber: 205,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OffersTable.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/OffersTable.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
_s1(OffersTable, "oWmUruulYioxkmlDtNF7AQl14do=");
_c1 = OffersTable;
var _c, _c1;
__turbopack_context__.k.register(_c, "MultiSelect");
__turbopack_context__.k.register(_c1, "OffersTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ScenarioPicker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScenarioPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const PRESET_LABELS = {
    low: "Laag · 1.500 kWh / 800 m³",
    medium: "Midden · 2.900 kWh / 1.200 m³",
    high: "Hoog · 4.500 kWh / 2.000 m³",
    solar: "Zon · 3.500 kWh + 2.000 terug / 1.000 m³"
};
function ScenarioPicker({ scenarios, activeId, onSelect }) {
    const presets = scenarios.filter((s)=>s.isPreset);
    const customs = scenarios.filter((s)=>!s.isPreset);
    const btn = (active)=>`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${active ? "bg-slate-900 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap items-center gap-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400",
                    children: "Scenario"
                }, void 0, false, {
                    fileName: "[project]/components/ScenarioPicker.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                presets.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: btn(s.id === activeId),
                        onClick: ()=>onSelect(s.id),
                        children: [
                            PRESET_LABELS[s.name ?? ""] ?? s.name,
                            s.runCount === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 text-xs opacity-60",
                                children: "(geen data)"
                            }, void 0, false, {
                                fileName: "[project]/components/ScenarioPicker.tsx",
                                lineNumber: 49,
                                columnNumber: 34
                            }, this)
                        ]
                    }, s.id, true, {
                        fileName: "[project]/components/ScenarioPicker.tsx",
                        lineNumber: 47,
                        columnNumber: 11
                    }, this)),
                customs.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: btn(s.id === activeId),
                        onClick: ()=>onSelect(s.id),
                        children: [
                            s.electricityNormal + s.electricityLow,
                            " kWh",
                            s.gas > 0 ? ` / ${s.gas} m³` : " / mono",
                            s.solarFeedIn > 0 ? ` / ☀ ${s.solarFeedIn}` : ""
                        ]
                    }, s.id, true, {
                        fileName: "[project]/components/ScenarioPicker.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this))
            ]
        }, void 0, true, {
            fileName: "[project]/components/ScenarioPicker.tsx",
            lineNumber: 44,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ScenarioPicker.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c = ScenarioPicker;
var _c;
__turbopack_context__.k.register(_c, "ScenarioPicker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ScrapeControls.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScrapeControls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$domain$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/domain.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function PlatformChip({ name, label, run, busy }) {
    const short = label.split(".")[0];
    if (!run) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: `flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${busy ? "bg-slate-50 text-slate-400 ring-slate-200" : "bg-slate-50 text-slate-300 ring-slate-100"}`,
            title: busy ? `${label}: bezig of in wachtrij` : label,
            children: [
                busy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "inline-block h-2 w-2 animate-pulse rounded-full bg-slate-300"
                }, void 0, false, {
                    fileName: "[project]/components/ScrapeControls.tsx",
                    lineNumber: 17,
                    columnNumber: 18
                }, this),
                short
            ]
        }, void 0, true, {
            fileName: "[project]/components/ScrapeControls.tsx",
            lineNumber: 11,
            columnNumber: 7
        }, this);
    }
    if (run.status === "completed") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200",
            title: `${label}: ${run.offers} contracten opgehaald`,
            children: [
                "✓ ",
                short,
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-normal text-emerald-500",
                    children: run.offers
                }, void 0, false, {
                    fileName: "[project]/components/ScrapeControls.tsx",
                    lineNumber: 28,
                    columnNumber: 19
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ScrapeControls.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "flex cursor-help items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200",
        title: `${label} mislukt: ${run.error ?? "onbekende fout"}`,
        children: [
            "✗ ",
            short
        ]
    }, void 0, true, {
        fileName: "[project]/components/ScrapeControls.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c = PlatformChip;
function ScrapeControls({ scenarioId, scenarioLabel, sweep }) {
    _s();
    const { busy, status, error, label, sweepId, start } = sweep;
    const [log, setLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showLog, setShowLog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const runsByPlatform = new Map((status?.runs ?? []).map((r)=>[
            r.platform,
            r
        ]));
    const firstFailure = status?.runs.find((r)=>r.status === "failed");
    const toggleLog = async ()=>{
        if (!showLog && sweepId) {
            const r = await fetch(`/api/scrapes/log?sweepId=${encodeURIComponent(sweepId)}`).then((x)=>x.json());
            setLog(r.log ?? r.error ?? "geen log");
        }
        setShowLog((v)=>!v);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: busy || scenarioId == null,
                        onClick: ()=>scenarioId != null && start({
                                scenarioId
                            }, scenarioLabel),
                        className: "rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40",
                        title: "Draait de 6 scrapers voor het geselecteerde scenario (standaardadres)",
                        children: "▶ Scrape dit scenario"
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeControls.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: busy,
                        onClick: ()=>start({
                                presets: true
                            }, "alle 4 presets"),
                        className: "rounded-md bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 disabled:opacity-40",
                        title: "Draait de 6 scrapers voor alle 4 preset-scenario's (duurt langer)",
                        children: "⟳ Ververs alle presets"
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeControls.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    label && status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${!status.done ? "bg-amber-50 text-amber-700 ring-amber-200" : status.failed === 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"}`,
                        children: [
                            !status.done && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-block h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeControls.tsx",
                                lineNumber: 97,
                                columnNumber: 15
                            }, this),
                            !status.done ? `Bezig met ${label}… ${status.completed}/${status.expected}` : status.failed === 0 ? `Klaar — ${label}: ${status.runs.reduce((s, r)=>s + r.offers, 0)} contracten` : `Klaar — ${label}: ${status.succeeded} gelukt, ${status.failed} mislukt`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeControls.tsx",
                        lineNumber: 87,
                        columnNumber: 11
                    }, this),
                    sweepId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: toggleLog,
                        className: "text-xs font-medium text-slate-500 underline hover:text-slate-700",
                        children: showLog ? "Verberg log" : "Bekijk log"
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeControls.tsx",
                        lineNumber: 107,
                        columnNumber: 11
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-rose-600",
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeControls.tsx",
                        lineNumber: 111,
                        columnNumber: 19
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ScrapeControls.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            label && status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-1.5",
                children: [
                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$domain$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PLATFORMS"].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlatformChip, {
                            name: p.name,
                            label: p.label,
                            run: runsByPlatform.get(p.name),
                            busy: busy
                        }, p.name, false, {
                            fileName: "[project]/components/ScrapeControls.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this)),
                    firstFailure && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-1 max-w-xl truncate text-[11px] text-rose-500",
                        title: firstFailure.error ?? "",
                        children: [
                            "eerste fout: ",
                            (firstFailure.error ?? "").slice(0, 120)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeControls.tsx",
                        lineNumber: 126,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ScrapeControls.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this),
            showLog && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-200",
                children: log ?? "laden…"
            }, void 0, false, {
                fileName: "[project]/components/ScrapeControls.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ScrapeControls.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
_s(ScrapeControls, "gxLTVza2JQ87wjvW5Tv9P7W3zNg=");
_c1 = ScrapeControls;
var _c, _c1;
__turbopack_context__.k.register(_c, "PlatformChip");
__turbopack_context__.k.register(_c1, "ScrapeControls");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ScrapeForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScrapeForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ScrapeForm({ sweep, onScenarioCreated }) {
    _s();
    const [postcode, setPostcode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [huisnr, setHuisnr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [addr, setAddr] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        state: "idle"
    });
    const [normaal, setNormaal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(2500);
    const [dal, setDal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [gas, setGas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1000);
    const [mono, setMono] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [solar, setSolar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const debounce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Live postcode check, debounced.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrapeForm.useEffect": ()=>{
            const pc = postcode.replace(/\s+/g, "").toUpperCase();
            if (!/^\d{4}[A-Z]{2}$/.test(pc) || !/^\d+$/.test(huisnr.trim())) {
                setAddr({
                    state: "idle"
                });
                return;
            }
            setAddr({
                state: "checking"
            });
            if (debounce.current) clearTimeout(debounce.current);
            debounce.current = setTimeout({
                "ScrapeForm.useEffect": async ()=>{
                    try {
                        const r = await fetch(`/api/address/check?postcode=${pc}&huisnr=${huisnr.trim()}`).then({
                            "ScrapeForm.useEffect": (x)=>x.json()
                        }["ScrapeForm.useEffect"]);
                        setAddr(r.valid ? {
                            state: "valid",
                            street: r.street,
                            city: r.city
                        } : {
                            state: "invalid",
                            reason: r.reason
                        });
                    } catch  {
                        setAddr({
                            state: "invalid",
                            reason: "error"
                        });
                    }
                }
            }["ScrapeForm.useEffect"], 500);
            return ({
                "ScrapeForm.useEffect": ()=>{
                    if (debounce.current) clearTimeout(debounce.current);
                }
            })["ScrapeForm.useEffect"];
        }
    }["ScrapeForm.useEffect"], [
        postcode,
        huisnr
    ]);
    const canSubmit = addr.state === "valid" && normaal > 0 && (mono || gas > 0) && !sweep.busy;
    const submit = async (e)=>{
        e.preventDefault();
        if (!canSubmit) return;
        const pc = postcode.replace(/\s+/g, "").toUpperCase();
        // 1. find-or-create the scenario for this usage profile
        const sc = await fetch("/api/scenarios", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                electricityNormal: normaal,
                electricityLow: dal,
                gas: mono ? 0 : gas,
                solarFeedIn: solar
            })
        }).then((x)=>x.json());
        onScenarioCreated(sc.scenario.id);
        // 2. start the sweep for this address
        await sweep.start({
            scenarioId: sc.scenario.id,
            postcode: pc,
            huisnr: huisnr.trim()
        }, `${pc} ${huisnr.trim()}`);
    };
    const field = "mt-1 block rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 ring-1 ring-slate-200 disabled:opacity-40";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: submit,
        className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex items-baseline justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-slate-700",
                        children: "Eigen scrape — adres & verbruik"
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-slate-400",
                        children: "maakt (of hergebruikt) het scenario en start direct de 6 scrapers"
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ScrapeForm.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-end gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs text-slate-500",
                        children: [
                            "Postcode",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: postcode,
                                onChange: (e)=>setPostcode(e.target.value),
                                placeholder: "1234AB",
                                className: `${field} w-24 uppercase`,
                                maxLength: 7,
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs text-slate-500",
                        children: [
                            "Huisnr.",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: huisnr,
                                onChange: (e)=>setHuisnr(e.target.value.replace(/\D/g, "")),
                                placeholder: "27",
                                className: `${field} w-16`,
                                required: true
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 103,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 101,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-44 pb-1.5 text-xs",
                        children: [
                            addr.state === "checking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-slate-400",
                                children: "Adres controleren…"
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 112,
                                columnNumber: 41
                            }, this),
                            addr.state === "valid" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-emerald-700",
                                children: [
                                    "✓ ",
                                    [
                                        addr.street,
                                        addr.city
                                    ].filter(Boolean).join(", ") || "Adres gevonden"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this),
                            addr.state === "invalid" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium text-rose-600",
                                children: [
                                    "✗ ",
                                    addr.reason === "not_found" ? "Adres niet gevonden" : "Ongeldige invoer"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 119,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "mx-1 hidden h-8 w-px bg-slate-200 sm:block"
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs text-slate-500",
                        children: [
                            "Stroom normaal (kWh/jr)",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 1,
                                value: normaal,
                                onChange: (e)=>setNormaal(Number(e.target.value)),
                                className: `${field} w-32`
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs text-slate-500",
                        children: [
                            "Stroom dal (kWh/jr)",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 0,
                                value: dal,
                                onChange: (e)=>setDal(Number(e.target.value)),
                                className: `${field} w-28`
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: `text-xs ${mono ? "text-slate-300" : "text-slate-500"}`,
                        children: [
                            "Gas (m³/jr)",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 0,
                                value: gas,
                                disabled: mono,
                                onChange: (e)=>setGas(Number(e.target.value)),
                                className: `${field} w-24`
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center gap-1.5 pb-2 text-xs text-slate-600",
                        title: "Alleen stroom vergelijken, geen gasaansluiting",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: mono,
                                onChange: (e)=>setMono(e.target.checked)
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this),
                            "Alleen stroom"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs text-slate-500",
                        title: "Teruglevering zonnepanelen",
                        children: [
                            "Teruglevering (kWh/jr)",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 0,
                                value: solar,
                                onChange: (e)=>setSolar(Number(e.target.value)),
                                className: `${field} w-32`
                            }, void 0, false, {
                                fileName: "[project]/components/ScrapeForm.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 143,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        disabled: !canSubmit,
                        className: "rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40",
                        title: addr.state !== "valid" ? "Vul eerst een geldig adres in" : "Start de 6 scrapers",
                        children: "▶ Start scrape"
                    }, void 0, false, {
                        fileName: "[project]/components/ScrapeForm.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ScrapeForm.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-[11px] text-slate-400",
                children: "Dal 0 = enkele meter · teruglevering 0 = geen zonnepanelen · resultaten verschijnen live in de kaarten en het archief."
            }, void 0, false, {
                fileName: "[project]/components/ScrapeForm.tsx",
                lineNumber: 157,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ScrapeForm.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
_s(ScrapeForm, "CQ2pCLHKoztJPrtbznRn+gGHaag=");
_c = ScrapeForm;
var _c;
__turbopack_context__.k.register(_c, "ScrapeForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/TrendChart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrendChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const PLATFORM_OPTIONS = [
    [
        "gaslicht",
        "Gaslicht"
    ],
    [
        "energiekiezer",
        "Energiekiezer"
    ],
    [
        "energievergelijk",
        "Energievergelijk"
    ],
    [
        "independer",
        "Independer"
    ],
    [
        "overstappen",
        "Overstappen"
    ],
    [
        "pricewise",
        "Pricewise"
    ]
];
const COLORS = [
    "#059669",
    "#6366f1",
    "#f59e0b",
    "#ef4444",
    "#0ea5e9",
    "#a855f7"
];
function TrendChart({ scenarioId }) {
    _s();
    const [platform, setPlatform] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("gaslicht");
    const [days, setDays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(30);
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TrendChart.useEffect": ()=>{
            fetch(`/api/trends?scenarioId=${scenarioId}&platform=${platform}&days=${days}`).then({
                "TrendChart.useEffect": (x)=>x.json()
            }["TrendChart.useEffect"]).then(setData);
        }
    }["TrendChart.useEffect"], [
        scenarioId,
        platform,
        days
    ]);
    const maxRank = data?.points.length ? Math.max(10, ...data.points.flatMap((p)=>Object.values(p).filter((v)=>typeof v === "number"))) : 10;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-3 flex flex-wrap items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-sm font-semibold text-slate-700",
                        children: "Rankverloop — eigen merk vs. top-concurrenten"
                    }, void 0, false, {
                        fileName: "[project]/components/TrendChart.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: platform,
                                onChange: (e)=>setPlatform(e.target.value),
                                className: "rounded-md bg-slate-50 px-2 py-1 text-sm text-slate-700 ring-1 ring-slate-200",
                                children: PLATFORM_OPTIONS.map(([v, l])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: v,
                                        children: l
                                    }, v, false, {
                                        fileName: "[project]/components/TrendChart.tsx",
                                        lineNumber: 62,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/TrendChart.tsx",
                                lineNumber: 56,
                                columnNumber: 11
                            }, this),
                            [
                                7,
                                30,
                                90
                            ].map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setDays(d),
                                    className: `rounded-md px-2.5 py-1 text-xs font-medium ${days === d ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`,
                                    children: [
                                        d,
                                        "d"
                                    ]
                                }, d, true, {
                                    fileName: "[project]/components/TrendChart.tsx",
                                    lineNumber: 68,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/TrendChart.tsx",
                        lineNumber: 55,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/TrendChart.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            !data || data.points.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "py-16 text-center text-sm text-slate-400",
                children: "Geen trenddata voor deze selectie"
            }, void 0, false, {
                fileName: "[project]/components/TrendChart.tsx",
                lineNumber: 82,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                width: "100%",
                height: 320,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LineChart"], {
                    data: data.points,
                    margin: {
                        top: 8,
                        right: 16,
                        bottom: 4,
                        left: 0
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                            strokeDasharray: "3 3",
                            stroke: "#e2e8f0"
                        }, void 0, false, {
                            fileName: "[project]/components/TrendChart.tsx",
                            lineNumber: 86,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                            dataKey: "date",
                            tick: {
                                fontSize: 11,
                                fill: "#94a3b8"
                            },
                            tickFormatter: (v)=>new Date(v).toLocaleDateString("nl-NL", {
                                    day: "2-digit",
                                    month: "2-digit"
                                })
                        }, void 0, false, {
                            fileName: "[project]/components/TrendChart.tsx",
                            lineNumber: 87,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                            reversed: true,
                            domain: [
                                1,
                                Math.min(maxRank, 40)
                            ],
                            allowDecimals: false,
                            tick: {
                                fontSize: 11,
                                fill: "#94a3b8"
                            },
                            label: {
                                value: "Rank",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#94a3b8",
                                fontSize: 11
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/TrendChart.tsx",
                            lineNumber: 93,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                            labelFormatter: (v)=>new Date(String(v)).toLocaleString("nl-NL", {
                                    dateStyle: "medium"
                                }),
                            formatter: (value)=>[
                                    `#${value}`,
                                    undefined
                                ]
                        }, void 0, false, {
                            fileName: "[project]/components/TrendChart.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
                            wrapperStyle: {
                                fontSize: 12
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/TrendChart.tsx",
                            lineNumber: 104,
                            columnNumber: 13
                        }, this),
                        data.suppliers.map((s, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Line"], {
                                type: "monotone",
                                dataKey: s.name,
                                stroke: s.isMyCompany ? "#059669" : COLORS[i % (COLORS.length - 1) + 1],
                                strokeWidth: s.isMyCompany ? 3.5 : 1.5,
                                dot: false,
                                connectNulls: true
                            }, s.name, false, {
                                fileName: "[project]/components/TrendChart.tsx",
                                lineNumber: 106,
                                columnNumber: 15
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/TrendChart.tsx",
                    lineNumber: 85,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/TrendChart.tsx",
                lineNumber: 84,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/TrendChart.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_s(TrendChart, "Dw+zDurixCJdW8LbcFg2/fozvzg=");
_c = TrendChart;
var _c;
__turbopack_context__.k.register(_c, "TrendChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/useSweep.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSweep",
    ()=>useSweep
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useSweep(onDataChanged) {
    _s();
    const [sweep, setSweep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const timer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const startedAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const onChanged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onDataChanged);
    onChanged.current = onDataChanged;
    const start = async (body, label)=>{
        setError(null);
        setStatus(null);
        const res = await fetch("/api/scrapes/run", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(body)
        });
        const j = await res.json();
        if (!res.ok) {
            setError(j.error ?? "Starten mislukt");
            return;
        }
        startedAt.current = Date.now();
        setSweep({
            sweepId: j.sweepId,
            expected: j.expectedRuns,
            label,
            done: false
        });
        setStatus({
            completed: 0,
            succeeded: 0,
            failed: 0,
            expected: j.expectedRuns,
            done: false,
            runs: []
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSweep.useEffect": ()=>{
            if (!sweep || sweep.done) return;
            timer.current = setInterval({
                "useSweep.useEffect": async ()=>{
                    const s = await fetch(`/api/scrapes/status?sweepId=${encodeURIComponent(sweep.sweepId)}&expected=${sweep.expected}`).then({
                        "useSweep.useEffect": (x)=>x.json()
                    }["useSweep.useEffect"]);
                    setStatus({
                        "useSweep.useEffect": (prev)=>{
                            if (s.completed !== (prev?.completed ?? 0)) onChanged.current();
                            return s;
                        }
                    }["useSweep.useEffect"]);
                    if (s.done || Date.now() - startedAt.current > 20 * 60_000) {
                        if (timer.current) clearInterval(timer.current);
                        setSweep({
                            "useSweep.useEffect": (cur)=>cur ? {
                                    ...cur,
                                    done: true
                                } : cur
                        }["useSweep.useEffect"]);
                        if (!s.done) setError(`Sweep-timeout: ${s.completed}/${s.expected} platforms hebben gerapporteerd — bekijk het log`);
                        onChanged.current();
                    }
                }
            }["useSweep.useEffect"], 5000);
            return ({
                "useSweep.useEffect": ()=>{
                    if (timer.current) clearInterval(timer.current);
                }
            })["useSweep.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useSweep.useEffect"], [
        sweep?.sweepId,
        sweep?.done
    ]);
    return {
        busy: sweep != null && !sweep.done && !(status?.done ?? false),
        label: sweep?.label ?? null,
        sweepId: sweep?.sweepId ?? null,
        status,
        error,
        start
    };
}
_s(useSweep, "h9xrLmqkLoaHPGqgzYPvx8CcvGc=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/domain.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Domain constants + normalization shared by ingestion and seeding.
__turbopack_context__.s([
    "MY_COMPANY",
    ()=>MY_COMPANY,
    "PLATFORMS",
    ()=>PLATFORMS,
    "PRESET_SCENARIOS",
    ()=>PRESET_SCENARIOS,
    "normalizeContractType",
    ()=>normalizeContractType,
    "normalizeSupplier",
    ()=>normalizeSupplier
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const PLATFORMS = [
    {
        name: "gaslicht",
        label: "Gaslicht.com",
        baseUrl: "https://www.gaslicht.com"
    },
    {
        name: "energiekiezer",
        label: "Energiekiezer.nl",
        baseUrl: "https://www.energiekiezer.nl"
    },
    {
        name: "energievergelijk",
        label: "Energievergelijk.nl",
        baseUrl: "https://www.energievergelijk.nl"
    },
    {
        name: "independer",
        label: "Independer.nl",
        baseUrl: "https://www.independer.nl"
    },
    {
        name: "overstappen",
        label: "Overstappen.nl",
        baseUrl: "https://www.overstappen.nl"
    },
    {
        name: "pricewise",
        label: "Pricewise.nl",
        baseUrl: "https://www.pricewise.nl"
    }
];
const PRESET_SCENARIOS = [
    {
        name: "low",
        electricityNormal: 1500,
        electricityLow: 0,
        gas: 800,
        solarFeedIn: 0
    },
    {
        name: "medium",
        electricityNormal: 2900,
        electricityLow: 0,
        gas: 1200,
        solarFeedIn: 0
    },
    {
        name: "high",
        electricityNormal: 4500,
        electricityLow: 0,
        gas: 2000,
        solarFeedIn: 0
    },
    {
        name: "solar",
        electricityNormal: 3500,
        electricityLow: 0,
        gas: 1000,
        solarFeedIn: 2000
    }
];
const MY_COMPANY = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.MY_COMPANY_NAME ?? "Essent";
// Suppliers appear under slightly different names per platform
// ("OXXIO Nederland B.V.", "Oxxio", "OXXIO"). Normalize to one canonical name.
const SUPPLIER_ALIASES = {
    oxxio: "Oxxio",
    "oxxio nederland": "Oxxio",
    engie: "ENGIE",
    "engie nederland retail": "ENGIE",
    essent: "Essent",
    "essent retail energie": "Essent",
    coolblue: "Coolblue Energie",
    delta: "DELTA Energie",
    "frank energie dynamisch": "Frank Energie",
    "greenchoice dynamisch": "Greenchoice",
    "noord energie": "NoordEnergie",
    noordenergie: "NoordEnergie",
    om: "OM Nieuwe Energie",
    "om nieuwe energie": "OM Nieuwe Energie",
    "om | nieuwe energie": "OM Nieuwe Energie",
    "om nieuwe energie (samen om)": "OM Nieuwe Energie",
    "vattenfall sales nederland": "Vattenfall",
    eneco: "Eneco",
    "eneco consumenten": "Eneco",
    "budget thuis": "Budget Thuis",
    budgetenergie: "Budget Thuis",
    "budget energie": "Budget Thuis",
    unitedconsumers: "UnitedConsumers",
    "united consumers": "UnitedConsumers",
    "unitedconsumers energie": "UnitedConsumers",
    greenchoice: "Greenchoice",
    vandebron: "Vandebron",
    "vandebron energie": "Vandebron",
    vattenfall: "Vattenfall",
    "coolblue energie": "Coolblue Energie",
    energiedirect: "Energiedirect",
    "energiedirect.nl": "Energiedirect",
    mega: "Mega",
    "mega energie": "Mega",
    nextenergy: "NextEnergy",
    "next energy": "NextEnergy",
    powerpeers: "Powerpeers",
    "pure energie": "Pure Energie",
    "frank energie": "Frank Energie",
    "delta energie": "DELTA Energie",
    "innova energie": "Innova Energie",
    "zonopnaam energie": "Zonopnaam",
    zonopnaam: "Zonopnaam",
    "energie vanons": "Energie VanOns",
    "energie van ons": "Energie VanOns",
    tibber: "Tibber",
    zonneplan: "Zonneplan",
    "zonneplan energie": "Zonneplan",
    easyenergy: "easyEnergy",
    energiek: "Energiek",
    energyzero: "EnergyZero",
    "gewoon energie": "Gewoon Energie",
    "clean energy": "Clean Energy"
};
function normalizeSupplier(raw) {
    const cleaned = raw.replace(/\s+[BN]\.?V\.?\s*$/i, "") // strip trailing B.V. / N.V.
    .replace(/\s+/g, " ").trim();
    return SUPPLIER_ALIASES[cleaned.toLowerCase()] ?? cleaned;
}
function normalizeContractType(raw) {
    const t = (raw ?? "").toLowerCase();
    if (t.startsWith("vast") || t === "fixed") return "vast";
    if (t.startsWith("dynamisch") || t === "dynamic") return "dynamisch";
    if (t.startsWith("combinatie") || t.includes("combin")) return "combinatie";
    if (t.startsWith("variabel") || t === "variable") return "variabel";
    return t || "onbekend";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_097pau9._.js.map