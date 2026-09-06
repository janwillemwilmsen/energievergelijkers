(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/archive/scan/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScanDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Scatter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Scatter.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$ScatterChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/ScatterChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ZAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/ZAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/platformColors.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const eur = (v, d = 0)=>v == null ? "—" : `€${v.toFixed(d)}`;
const TYPE_ABBR = {
    vast: "V",
    variabel: "Var",
    dynamisch: "Dyn",
    combinatie: "C"
};
// Distinct marker colors for brand highlighting; assigned per brand by its
// position in the provider list, cycling when there are more brands.
const BRAND_PALETTE = [
    "#f59e0b",
    "#0ea5e9",
    "#a855f7",
    "#f43f5e",
    "#84cc16",
    "#06b6d4",
    "#d946ef",
    "#f97316",
    "#6366f1",
    "#14b8a6",
    "#eab308",
    "#ec4899"
];
// All brands as clickable pills; a click toggles highlighting of that brand
// in the ranking columns. Purely visual — it does not filter.
function BrandPills({ providers, brandColor, selected, onToggle }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-3 flex flex-wrap items-center gap-1.5 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "mr-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400",
                children: "Markeer merk"
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            providers.map((p)=>{
                const hex = brandColor.get(p.name);
                const active = selected.has(p.name);
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>onToggle(p.name),
                    className: `flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? "text-slate-900" : "text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`,
                    style: active ? {
                        background: `${hex}2e`,
                        boxShadow: `inset 0 0 0 2px ${hex}`
                    } : undefined,
                    title: active ? "Klik om markering te verwijderen" : "Klik om dit merk te markeren in de rankings",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "inline-block h-2 w-2 rounded-full",
                            style: {
                                background: hex
                            }
                        }, void 0, false, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 105,
                            columnNumber: 13
                        }, this),
                        p.name,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-slate-400",
                            children: p.total
                        }, void 0, false, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 107,
                            columnNumber: 13
                        }, this)
                    ]
                }, p.name, true, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 96,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
_c = BrandPills;
// Custom tooltip for the positioning scatter: identifies the exact contract.
function ScatterTip({ active, payload }) {
    const d = active && payload?.length ? payload[0].payload : null;
    if (!d) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-64 rounded-md bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-semibold text-slate-900",
                children: [
                    d.supplier,
                    d.my && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-1.5 rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold text-white",
                        children: "WIJ"
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 126,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "truncate text-slate-500",
                title: d.contract,
                children: d.contract
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1 text-slate-600",
                children: [
                    eur(d.x),
                    "/jaar · ",
                    eur(d.monthly, 2),
                    "/mnd",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: d.y > 0 ? "text-emerald-700" : "text-slate-400",
                        children: [
                            " ",
                            "· cashback ",
                            d.y > 0 ? eur(d.y) : "geen"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-0.5 text-[10px] text-slate-400",
                children: [
                    d.platformLabel,
                    " · ",
                    d.type
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this);
}
_c1 = ScatterTip;
function StatsTable({ platforms }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "w-full min-w-[760px] text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2",
                                children: "Vergelijker"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 146,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "# Contracten"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 147,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Laagste prijs"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 148,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Hoogste prijs"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Gem. prijs"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 150,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Cashback min"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 151,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Cashback max"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 152,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Vast"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Variabel"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 154,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Dynamisch"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 155,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 145,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 144,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: platforms.map((p)=>{
                        const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(p.platform);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "border-b border-slate-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: `px-3 py-2 font-semibold ${c.text}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "mr-1.5 inline-block h-2.5 w-2.5 rounded-full",
                                            style: {
                                                background: c.hex
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 164,
                                            columnNumber: 19
                                        }, this),
                                        p.label
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 163,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-2 text-right tabular-nums",
                                    children: p.stats.count
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 167,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2 text-right tabular-nums font-medium text-emerald-700",
                                    children: eur(p.stats.priceMin)
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 168,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2 text-right tabular-nums text-rose-600",
                                    children: eur(p.stats.priceMax)
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 169,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-2 text-right tabular-nums",
                                    children: eur(p.stats.priceAvg)
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 170,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-2 text-right tabular-nums",
                                    children: eur(p.stats.cashbackMin)
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 171,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-2 text-right tabular-nums",
                                    children: eur(p.stats.cashbackMax)
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 172,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-2 text-right tabular-nums",
                                    children: p.stats.perType["vast"] ?? 0
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 173,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-2 text-right tabular-nums",
                                    children: p.stats.perType["variabel"] ?? 0
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 174,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-2 text-right tabular-nums",
                                    children: (p.stats.perType["dynamisch"] ?? 0) + (p.stats.perType["combinatie"] ?? 0)
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 175,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, p.platform, true, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 162,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 158,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/archive/scan/page.tsx",
            lineNumber: 143,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 142,
        columnNumber: 5
    }, this);
}
_c2 = StatsTable;
// Contract-type + provider filters shown above the ranking columns. Both are
// multi-select; combinations apply as AND across the two dimensions.
function RankingFilters({ types, providers, typeFilter, providerFilter, onTypes, onProviders }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggle = (set, v, cb)=>{
        const next = new Set(set);
        if (next.has(v)) next.delete(v);
        else next.add(v);
        cb(next);
    };
    const active = typeFilter.size > 0 || providerFilter.size > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-semibold uppercase tracking-wide text-slate-400",
                children: "Contracttype"
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 214,
                columnNumber: 7
            }, this),
            types.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>toggle(typeFilter, t, onTypes),
                    className: `rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${typeFilter.has(t) ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
                    children: t
                }, t, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 216,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "ml-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400",
                children: "Leverancier"
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setOpen((v)=>!v),
                        className: "rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200",
                        children: [
                            "Kies leveranciers",
                            providerFilter.size > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 rounded-full bg-slate-900 px-1.5 text-[10px] text-white",
                                children: providerFilter.size
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 237,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 231,
                        columnNumber: 9
                    }, this),
                    open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-10",
                        onClick: ()=>setOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 240,
                        columnNumber: 18
                    }, this),
                    open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute z-20 mt-1 max-h-72 w-64 overflow-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-slate-200",
                        children: providers.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex items-center gap-2 rounded px-1 py-0.5 text-xs text-slate-700 hover:bg-slate-50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "checkbox",
                                        checked: providerFilter.has(p.name),
                                        onChange: ()=>toggle(providerFilter, p.name, onProviders)
                                    }, void 0, false, {
                                        fileName: "[project]/app/archive/scan/page.tsx",
                                        lineNumber: 245,
                                        columnNumber: 17
                                    }, this),
                                    p.name,
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-slate-400",
                                        children: [
                                            "(",
                                            p.total,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/archive/scan/page.tsx",
                                        lineNumber: 250,
                                        columnNumber: 26
                                    }, this)
                                ]
                            }, p.name, true, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 244,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 242,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 230,
                columnNumber: 7
            }, this),
            [
                ...providerFilter
            ].map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>toggle(providerFilter, name, onProviders),
                    className: "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 hover:bg-emerald-200",
                    title: "Klik om te verwijderen",
                    children: [
                        name,
                        " ✕"
                    ]
                }, name, true, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 257,
                    columnNumber: 9
                }, this)),
            active && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>{
                    onTypes(new Set());
                    onProviders(new Set());
                },
                className: "ml-auto text-xs font-medium text-rose-600 hover:underline",
                children: "Wis filters"
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 267,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 213,
        columnNumber: 5
    }, this);
}
_s(RankingFilters, "xG1TONbKtDWtdOTrXaTAsNhPg/Q=");
_c3 = RankingFilters;
function PlatformColumns({ platforms, typeFilter, providerFilter, highlighted, brandColor }) {
    const match = (o)=>(typeFilter.size === 0 || typeFilter.has(o.contractType)) && (providerFilter.size === 0 || providerFilter.has(o.supplier));
    const filtering = typeFilter.size > 0 || providerFilter.size > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto pb-2",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex min-w-[1080px] gap-3",
            children: platforms.map((p)=>{
                const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(p.platform);
                const visible = p.offers.filter(match);
                const cheapest = visible.length ? Math.min(...visible.map((o)=>o.annualCost)) : null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `w-0 flex-1 rounded-xl border-t-4 ${c.border} bg-white shadow-sm ring-1 ring-slate-200`,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `rounded-t-lg px-3 py-2 ${c.bg}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `text-sm font-bold ${c.text}`,
                                    children: p.label
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 308,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[11px] text-slate-500",
                                    children: [
                                        filtering ? `${visible.length} van ${p.stats.count}` : `${p.stats.count}`,
                                        " contracten",
                                        cheapest != null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                " · v.a. ",
                                                eur(cheapest)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 311,
                                            columnNumber: 40
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 309,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 307,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                            className: "max-h-[520px] divide-y divide-slate-50 overflow-y-auto",
                            children: [
                                visible.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                    className: "px-3 py-6 text-center text-[11px] text-slate-400",
                                    children: "Geen contracten binnen filter"
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 316,
                                    columnNumber: 19
                                }, this),
                                visible.map((o)=>{
                                    const hlHex = highlighted.has(o.supplier) ? brandColor.get(o.supplier) : undefined;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                        className: `px-3 py-1.5 text-xs ${o.isMyCompany && !hlHex ? "bg-emerald-50 font-semibold" : hlHex ? "font-medium" : ""}`,
                                        style: hlHex ? {
                                            background: `${hlHex}1f`,
                                            boxShadow: `inset 3px 0 0 ${hlHex}`
                                        } : undefined,
                                        title: o.contractName,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-baseline justify-between gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "truncate text-slate-800",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "mr-1 tabular-nums text-slate-400",
                                                                children: [
                                                                    o.rank,
                                                                    "."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                                lineNumber: 329,
                                                                columnNumber: 25
                                                            }, this),
                                                            hlHex && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "mr-1 inline-block h-2 w-2 rounded-full",
                                                                style: {
                                                                    background: hlHex
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                                lineNumber: 330,
                                                                columnNumber: 35
                                                            }, this),
                                                            o.supplier,
                                                            o.isMyCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "ml-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white",
                                                                children: "WIJ"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                                lineNumber: 332,
                                                                columnNumber: 43
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/archive/scan/page.tsx",
                                                        lineNumber: 328,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "shrink-0 tabular-nums font-medium text-slate-900",
                                                        children: eur(o.monthlyCost, 2)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/archive/scan/page.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                lineNumber: 327,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-[10px] text-slate-400",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            TYPE_ABBR[o.contractType] ?? o.contractType,
                                                            o.durationMonths ? ` ${o.durationMonths / 12}jr` : ""
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/archive/scan/page.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 23
                                                    }, this),
                                                    o.discount ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-emerald-600",
                                                        children: [
                                                            "cb ",
                                                            eur(o.discount)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/archive/scan/page.tsx",
                                                        lineNumber: 341,
                                                        columnNumber: 37
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                lineNumber: 336,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, o.rank, true, {
                                        fileName: "[project]/app/archive/scan/page.tsx",
                                        lineNumber: 321,
                                        columnNumber: 19
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 314,
                            columnNumber: 15
                        }, this)
                    ]
                }, p.platform, true, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 306,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/app/archive/scan/page.tsx",
            lineNumber: 300,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 299,
        columnNumber: 5
    }, this);
}
_c4 = PlatformColumns;
function ProviderMatrix({ detail }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "w-full min-w-[720px] text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-left",
                                children: "Leverancier"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 361,
                                columnNumber: 13
                            }, this),
                            detail.platforms.map((p)=>{
                                const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(p.platform);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    className: `px-3 py-2 text-right ${c.text}`,
                                    children: p.label.split(".")[0]
                                }, p.platform, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 365,
                                    columnNumber: 17
                                }, this);
                            }),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Totaal"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 370,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 360,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 359,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: detail.providers.map((pr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "border-b border-slate-50 hover:bg-slate-50/90",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-1.5 text-slate-700",
                                    children: pr.name
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 376,
                                    columnNumber: 15
                                }, this),
                                detail.platforms.map((p)=>{
                                    const n = pr.counts[p.platform] ?? 0;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: `px-3 py-1.5 text-right tabular-nums ${n === 0 ? "text-slate-300" : "text-slate-700"}`,
                                        children: n === 0 ? "·" : n
                                    }, p.platform, false, {
                                        fileName: "[project]/app/archive/scan/page.tsx",
                                        lineNumber: 380,
                                        columnNumber: 19
                                    }, this);
                                }),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "text-gray-700 px-3 py-1.5 text-right tabular-nums font-semibold",
                                    children: pr.total
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 385,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, pr.name, true, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 375,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 373,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/archive/scan/page.tsx",
            lineNumber: 358,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 357,
        columnNumber: 5
    }, this);
}
_c5 = ProviderMatrix;
function Charts({ detail }) {
    // 1. Price range per platform (floating min-max bar, avg via tooltip)
    const rangeData = detail.platforms.map((p)=>({
            name: p.label.split(".")[0],
            platform: p.platform,
            base: p.stats.priceMin ?? 0,
            range: (p.stats.priceMax ?? 0) - (p.stats.priceMin ?? 0),
            min: p.stats.priceMin,
            max: p.stats.priceMax,
            avg: p.stats.priceAvg
        }));
    // 2. Scatter: cashback vs annual price, per platform color; own brand ringed.
    // Offers without cashback sit on the y=0 line by design ("duur zonder actie").
    const scatterByPlatform = detail.platforms.map((p)=>({
            platform: p.platform,
            label: p.label.split(".")[0],
            data: p.offers.map((o)=>({
                    x: o.annualCost,
                    y: o.discount ?? 0,
                    my: o.isMyCompany,
                    supplier: o.supplier,
                    contract: o.contractName,
                    platformLabel: p.label,
                    type: o.contractType + (o.durationMonths ? ` ${o.durationMonths / 12}jr` : ""),
                    monthly: o.monthlyCost
                }))
        }));
    // 3. Contract type mix per platform (stacked)
    const mixData = detail.platforms.map((p)=>({
            name: p.label.split(".")[0],
            vast: p.stats.perType["vast"] ?? 0,
            variabel: p.stats.perType["variabel"] ?? 0,
            dynamisch: (p.stats.perType["dynamisch"] ?? 0) + (p.stats.perType["combinatie"] ?? 0)
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 gap-4 xl:grid-cols-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-2 text-sm font-semibold text-slate-700",
                        children: "Prijsspreiding per vergelijker (jaarkosten, min–max)"
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 434,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                        width: "100%",
                        height: 260,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                            data: rangeData,
                            margin: {
                                top: 8,
                                right: 8,
                                left: 0,
                                bottom: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                    strokeDasharray: "3 3",
                                    stroke: "#e2e8f0"
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 437,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                    dataKey: "name",
                                    tick: {
                                        fontSize: 11
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 438,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                    domain: [
                                        "auto",
                                        "auto"
                                    ],
                                    tick: {
                                        fontSize: 11
                                    },
                                    tickFormatter: (v)=>`€${v}`
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 439,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    formatter: (_v, key, item)=>key === "range" ? [
                                            `${eur(item.payload.min)} – ${eur(item.payload.max)} (gem. ${eur(item.payload.avg)})`,
                                            "spreiding"
                                        ] : []
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 440,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                    dataKey: "base",
                                    stackId: "r",
                                    fill: "transparent"
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 447,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                    dataKey: "range",
                                    stackId: "r",
                                    radius: [
                                        4,
                                        4,
                                        4,
                                        4
                                    ],
                                    children: rangeData.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                            fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(d.platform).hex,
                                            fillOpacity: 0.75
                                        }, d.platform, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 450,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 448,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 436,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 435,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[11px] text-slate-400",
                        children: "Een smalle balk = homogeen aanbod; een lage onderkant = scherpe instapprijs op die site."
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 455,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 433,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-2 text-sm font-semibold text-slate-700",
                        children: "Marktpositionering: cashback vs. jaarprijs"
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 461,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                        width: "100%",
                        height: 260,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$ScatterChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScatterChart"], {
                            margin: {
                                top: 8,
                                right: 8,
                                left: 0,
                                bottom: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                    strokeDasharray: "3 3",
                                    stroke: "#e2e8f0"
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 464,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                    type: "number",
                                    dataKey: "x",
                                    name: "jaarprijs",
                                    domain: [
                                        "auto",
                                        "auto"
                                    ],
                                    tick: {
                                        fontSize: 11
                                    },
                                    tickFormatter: (v)=>`€${v}`
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 465,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                    type: "number",
                                    dataKey: "y",
                                    name: "cashback",
                                    tick: {
                                        fontSize: 11
                                    },
                                    tickFormatter: (v)=>`€${v}`
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 466,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ZAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZAxis"], {
                                    range: [
                                        28,
                                        28
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 467,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                    cursor: {
                                        strokeDasharray: "3 3"
                                    },
                                    content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScatterTip, {}, void 0, false, {
                                        fileName: "[project]/app/archive/scan/page.tsx",
                                        lineNumber: 468,
                                        columnNumber: 67
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 468,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
                                    wrapperStyle: {
                                        fontSize: 11
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 469,
                                    columnNumber: 13
                                }, this),
                                scatterByPlatform.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Scatter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scatter"], {
                                        name: s.label,
                                        data: s.data,
                                        fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(s.platform).hex,
                                        fillOpacity: 0.6,
                                        children: s.data.map((d, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cell"], {
                                                fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(s.platform).hex,
                                                fillOpacity: d.my ? 0.95 : 0.55,
                                                stroke: d.my ? "#065f46" : undefined,
                                                strokeWidth: d.my ? 2.5 : 0
                                            }, i, false, {
                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                lineNumber: 473,
                                                columnNumber: 19
                                            }, this))
                                    }, s.platform, false, {
                                        fileName: "[project]/app/archive/scan/page.tsx",
                                        lineNumber: 471,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 463,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 462,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-[11px] text-slate-400",
                        children: "Linksboven = agressief geprijsd mét hoge cashback (de vecht-hoek); de stippen óp de onderlijn zijn contracten zonder cashback (€0) — meestal dynamische/variabele producten. Eigen merk heeft een donkere ring."
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 485,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 460,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 xl:col-span-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "mb-2 text-sm font-semibold text-slate-700",
                        children: "Contracttype-mix per vergelijker"
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 492,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                        width: "100%",
                        height: 220,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                            data: mixData,
                            layout: "vertical",
                            margin: {
                                top: 4,
                                right: 8,
                                left: 30,
                                bottom: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                    strokeDasharray: "3 3",
                                    stroke: "#e2e8f0"
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 495,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                    type: "number",
                                    tick: {
                                        fontSize: 11
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 496,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                    type: "category",
                                    dataKey: "name",
                                    tick: {
                                        fontSize: 11
                                    },
                                    width: 90
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 497,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {}, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 498,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
                                    wrapperStyle: {
                                        fontSize: 11
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 499,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                    dataKey: "vast",
                                    stackId: "m",
                                    fill: "#0ea5e9",
                                    name: "vast"
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 500,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                    dataKey: "variabel",
                                    stackId: "m",
                                    fill: "#94a3b8",
                                    name: "variabel"
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 501,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                    dataKey: "dynamisch",
                                    stackId: "m",
                                    fill: "#a855f7",
                                    name: "dynamisch",
                                    radius: [
                                        0,
                                        4,
                                        4,
                                        0
                                    ]
                                }, void 0, false, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 502,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/archive/scan/page.tsx",
                            lineNumber: 494,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 493,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 491,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 432,
        columnNumber: 5
    }, this);
}
_c6 = Charts;
function TariffTip({ active, payload }) {
    const d = active && payload?.length ? payload[0].payload : null;
    if (!d) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-64 rounded-md bg-white p-2.5 text-xs shadow-lg ring-1 ring-slate-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "font-semibold text-slate-900",
                children: [
                    d.supplier,
                    d.isMyCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-1.5 rounded bg-emerald-600 px-1 py-0.5 text-[9px] font-bold text-white",
                        children: "WIJ"
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 524,
                        columnNumber: 27
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 522,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "truncate text-slate-500",
                title: d.contractName,
                children: d.contractName
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 526,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1 text-slate-600",
                children: [
                    "stroom €",
                    d.x.toFixed(4),
                    "/kWh · gas €",
                    d.y.toFixed(4),
                    "/m³"
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 527,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-0.5 text-[10px] text-slate-400",
                children: [
                    d.platformLabel,
                    " · ",
                    d.contractType
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 530,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 521,
        columnNumber: 5
    }, this);
}
_c7 = TariffTip;
function TariffSection({ detail }) {
    _s1();
    const [typeFilter, setTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [providerFilter, setProviderFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [sortKey, setSortKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("tariffElecNormal");
    const [sortAsc, setSortAsc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const allTypes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TariffSection.useMemo[allTypes]": ()=>[
                ...new Set(detail.platforms.flatMap({
                    "TariffSection.useMemo[allTypes]": (p)=>p.offers.map({
                            "TariffSection.useMemo[allTypes]": (o)=>o.contractType
                        }["TariffSection.useMemo[allTypes]"])
                }["TariffSection.useMemo[allTypes]"]))
            ].sort()
    }["TariffSection.useMemo[allTypes]"], [
        detail
    ]);
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TariffSection.useMemo[rows]": ()=>detail.platforms.flatMap({
                "TariffSection.useMemo[rows]": (p)=>p.offers.map({
                        "TariffSection.useMemo[rows]": (o)=>({
                                ...o,
                                platform: p.platform,
                                platformLabel: p.label
                            })
                    }["TariffSection.useMemo[rows]"])
            }["TariffSection.useMemo[rows]"])
    }["TariffSection.useMemo[rows]"], [
        detail
    ]);
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TariffSection.useMemo[filtered]": ()=>{
            let r = rows.filter({
                "TariffSection.useMemo[filtered].r": (o)=>o.tariffElecNormal != null || o.tariffGas != null
            }["TariffSection.useMemo[filtered].r"]);
            if (typeFilter.size) r = r.filter({
                "TariffSection.useMemo[filtered]": (o)=>typeFilter.has(o.contractType)
            }["TariffSection.useMemo[filtered]"]);
            if (providerFilter.size) r = r.filter({
                "TariffSection.useMemo[filtered]": (o)=>providerFilter.has(o.supplier)
            }["TariffSection.useMemo[filtered]"]);
            const dir = sortAsc ? 1 : -1;
            const tariffSort = [
                "tariffElecNormal",
                "tariffElecLow",
                "tariffGas",
                "feedInTariff"
            ].includes(sortKey);
            return [
                ...r
            ].sort({
                "TariffSection.useMemo[filtered]": (a, b)=>{
                    // When sorting on a tariff column, keep delivery-only rows (excl.
                    // belastingen — structurally lower) below the comparable all-in rows.
                    if (tariffSort && a.tariffDeliveryOnly !== b.tariffDeliveryOnly) return a.tariffDeliveryOnly ? 1 : -1;
                    const va = a[sortKey], vb = b[sortKey];
                    if (va == null && vb == null) return 0;
                    if (va == null) return 1; // nulls last regardless of direction
                    if (vb == null) return -1;
                    if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
                    return String(va).localeCompare(String(vb)) * dir;
                }
            }["TariffSection.useMemo[filtered]"]);
        }
    }["TariffSection.useMemo[filtered]"], [
        rows,
        typeFilter,
        providerFilter,
        sortKey,
        sortAsc
    ]);
    // Scatter: only all-in tariffs with both commodities; delivery-only rows
    // (Pricewise, excl. belastingen) would distort the comparison.
    const scatterByPlatform = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TariffSection.useMemo[scatterByPlatform]": ()=>detail.platforms.map({
                "TariffSection.useMemo[scatterByPlatform]": (p)=>({
                        platform: p.platform,
                        label: p.label.split(".")[0],
                        data: filtered.filter({
                            "TariffSection.useMemo[scatterByPlatform]": (o)=>o.platform === p.platform && !o.tariffDeliveryOnly && o.tariffElecNormal != null && o.tariffGas != null && !o.isMyCompany
                        }["TariffSection.useMemo[scatterByPlatform]"]).map({
                            "TariffSection.useMemo[scatterByPlatform]": (o)=>({
                                    ...o,
                                    x: o.tariffElecNormal,
                                    y: o.tariffGas
                                })
                        }["TariffSection.useMemo[scatterByPlatform]"])
                    })
            }["TariffSection.useMemo[scatterByPlatform]"])
    }["TariffSection.useMemo[scatterByPlatform]"], [
        detail,
        filtered
    ]);
    const myPoints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TariffSection.useMemo[myPoints]": ()=>filtered.filter({
                "TariffSection.useMemo[myPoints]": (o)=>o.isMyCompany && !o.tariffDeliveryOnly && o.tariffElecNormal != null && o.tariffGas != null
            }["TariffSection.useMemo[myPoints]"]).map({
                "TariffSection.useMemo[myPoints]": (o)=>({
                        ...o,
                        x: o.tariffElecNormal,
                        y: o.tariffGas
                    })
            }["TariffSection.useMemo[myPoints]"])
    }["TariffSection.useMemo[myPoints]"], [
        filtered
    ]);
    const th = (key, label, right = true)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
            className: `cursor-pointer select-none whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 ${right ? "text-right" : "text-left"}`,
            onClick: ()=>{
                if (sortKey === key) setSortAsc(!sortAsc);
                else {
                    setSortKey(key);
                    setSortAsc(true);
                }
            },
            children: [
                label,
                sortKey === key && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "ml-1",
                    children: sortAsc ? "▲" : "▼"
                }, void 0, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 605,
                    columnNumber: 27
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/archive/scan/page.tsx",
            lineNumber: 594,
            columnNumber: 5
        }, this);
    const t4 = (v)=>v == null ? "—" : `€${v.toFixed(4)}`;
    const hasDeliveryOnly = filtered.some((o)=>o.tariffDeliveryOnly);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500",
                children: "Tarieven per contract (€/kWh · €/m³)"
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 613,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RankingFilters, {
                types: allTypes,
                providers: detail.providers,
                typeFilter: typeFilter,
                providerFilter: providerFilter,
                onTypes: setTypeFilter,
                onProviders: setProviderFilter
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 616,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-4 xl:grid-cols-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white shadow-sm ring-1 ring-slate-200 xl:col-span-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-[480px] overflow-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full min-w-[680px] text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "sticky top-0 z-[5] bg-white shadow-[0_1px_0_#f1f5f9]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    th("platformLabel", "Vergelijker", false),
                                                    th("supplier", "Leverancier", false),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400",
                                                        children: "Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/archive/scan/page.tsx",
                                                        lineNumber: 632,
                                                        columnNumber: 19
                                                    }, this),
                                                    th("tariffElecNormal", "Stroom normaal"),
                                                    th("tariffElecLow", "Stroom dal"),
                                                    th("tariffGas", "Gas"),
                                                    th("feedInTariff", "Teruglever"),
                                                    th("annualCost", "€/jaar")
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                lineNumber: 629,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 628,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: filtered.map((o, i)=>{
                                                const c = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(o.platform);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: o.isMyCompany ? "border-b border-emerald-100 bg-emerald-50/70 font-medium" : "border-b border-slate-50 hover:bg-slate-50/60",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: `whitespace-nowrap px-3 py-1.5 text-xs font-semibold ${c.text}`,
                                                            children: o.platformLabel.split(".")[0]
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 648,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "whitespace-nowrap px-3 py-1.5 text-xs text-slate-800",
                                                            title: o.contractName,
                                                            children: [
                                                                o.supplier,
                                                                o.isMyCompany && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "ml-1 rounded bg-emerald-600 px-1 text-[9px] font-bold text-white",
                                                                    children: "WIJ"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/archive/scan/page.tsx",
                                                                    lineNumber: 653,
                                                                    columnNumber: 43
                                                                }, this),
                                                                o.tariffDeliveryOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "ml-1 text-slate-400",
                                                                    title: "Alleen leveringstarief, excl. belastingen — niet vergelijkbaar met de overige rijen",
                                                                    children: "†"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/archive/scan/page.tsx",
                                                                    lineNumber: 654,
                                                                    columnNumber: 50
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 651,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "whitespace-nowrap px-3 py-1.5 text-[11px] text-slate-500",
                                                            children: [
                                                                TYPE_ABBR[o.contractType] ?? o.contractType,
                                                                o.durationMonths ? ` ${o.durationMonths / 12}jr` : ""
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 656,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-3 py-1.5 text-right text-xs tabular-nums text-slate-700",
                                                            children: t4(o.tariffElecNormal)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 660,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-3 py-1.5 text-right text-xs tabular-nums text-slate-700",
                                                            children: t4(o.tariffElecLow)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 661,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-3 py-1.5 text-right text-xs tabular-nums text-slate-700",
                                                            children: t4(o.tariffGas)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 662,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-3 py-1.5 text-right text-xs tabular-nums text-slate-500",
                                                            children: t4(o.feedInTariff)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 663,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "px-3 py-1.5 text-right text-xs tabular-nums font-medium text-slate-900",
                                                            children: eur(o.annualCost)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/archive/scan/page.tsx",
                                                            lineNumber: 664,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, `${o.platform}-${o.rank}-${i}`, true, {
                                                    fileName: "[project]/app/archive/scan/page.tsx",
                                                    lineNumber: 644,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 640,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 627,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 626,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-slate-100 p-2 text-[11px] text-slate-400",
                                children: [
                                    filtered.length,
                                    " contracten · tarieven incl. btw en energiebelasting",
                                    hasDeliveryOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: " · † Pricewise toont alleen leveringstarieven (excl. belastingen)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/archive/scan/page.tsx",
                                        lineNumber: 673,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 671,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 625,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 xl:col-span-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mb-2 text-sm font-semibold text-slate-700",
                                children: "Stroomtarief vs. gastarief"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 678,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                width: "100%",
                                height: 400,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$ScatterChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScatterChart"], {
                                    margin: {
                                        top: 8,
                                        right: 8,
                                        left: 0,
                                        bottom: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                            strokeDasharray: "3 3",
                                            stroke: "#e2e8f0"
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 681,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                            type: "number",
                                            dataKey: "x",
                                            name: "stroom",
                                            domain: [
                                                "auto",
                                                "auto"
                                            ],
                                            tick: {
                                                fontSize: 11
                                            },
                                            tickFormatter: (v)=>`€${v}`
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 682,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                            type: "number",
                                            dataKey: "y",
                                            name: "gas",
                                            domain: [
                                                "auto",
                                                "auto"
                                            ],
                                            tick: {
                                                fontSize: 11
                                            },
                                            tickFormatter: (v)=>`€${v}`
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 683,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ZAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZAxis"], {
                                            range: [
                                                30,
                                                30
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 684,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            cursor: {
                                                strokeDasharray: "3 3"
                                            },
                                            content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TariffTip, {}, void 0, false, {
                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                lineNumber: 685,
                                                columnNumber: 69
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 685,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
                                            wrapperStyle: {
                                                fontSize: 11
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 686,
                                            columnNumber: 15
                                        }, this),
                                        scatterByPlatform.filter((s)=>s.data.length).map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Scatter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scatter"], {
                                                name: s.label,
                                                data: s.data,
                                                fill: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$platformColors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["platformColor"])(s.platform).hex,
                                                fillOpacity: 0.55
                                            }, s.platform, false, {
                                                fileName: "[project]/app/archive/scan/page.tsx",
                                                lineNumber: 690,
                                                columnNumber: 19
                                            }, this)),
                                        myPoints.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Scatter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Scatter"], {
                                            name: "Eigen merk",
                                            data: myPoints,
                                            fill: "#059669",
                                            stroke: "#065f46",
                                            strokeWidth: 2
                                        }, void 0, false, {
                                            fileName: "[project]/app/archive/scan/page.tsx",
                                            lineNumber: 693,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/archive/scan/page.tsx",
                                    lineNumber: 680,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 679,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-[11px] text-slate-400",
                                children: "Elke stip = één contract (all-in tarieven; Pricewise uitgesloten). Linksonder is op beide commodities de scherpste prijs; de verticale spreiding bij gelijk stroomtarief laat zien wie marge op gas pakt."
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 697,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 677,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 624,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 612,
        columnNumber: 5
    }, this);
}
_s1(TariffSection, "mtHeexcAflJsrSxRiCfX5I1dS8Y=");
_c8 = TariffSection;
function ScanDetailInner() {
    _s2();
    const sweepId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])().get("sweepId");
    const [detail, setDetail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [typeFilter, setTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [providerFilter, setProviderFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [highlighted, setHighlighted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScanDetailInner.useEffect": ()=>{
            if (!sweepId) return;
            fetch(`/api/archive/scan?sweepId=${encodeURIComponent(sweepId)}`).then({
                "ScanDetailInner.useEffect": (x)=>x.json()
            }["ScanDetailInner.useEffect"]).then({
                "ScanDetailInner.useEffect": (r)=>r.error ? setError(r.error) : setDetail(r)
            }["ScanDetailInner.useEffect"]);
        }
    }["ScanDetailInner.useEffect"], [
        sweepId
    ]);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-24 text-center text-rose-500",
        children: error
    }, void 0, false, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 723,
        columnNumber: 21
    }, this);
    if (!detail) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-24 text-center text-slate-400",
        children: "Laden…"
    }, void 0, false, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 724,
        columnNumber: 23
    }, this);
    const allTypes = [
        ...new Set(detail.platforms.flatMap((p)=>p.offers.map((o)=>o.contractType)))
    ].sort();
    const brandColor = new Map(detail.providers.map((p, i)=>[
            p.name,
            BRAND_PALETTE[i % BRAND_PALETTE.length]
        ]));
    const sc = detail.scenario;
    const total = detail.platforms.reduce((s, p)=>s + p.stats.count, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex flex-wrap items-end justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold tracking-tight text-slate-900",
                                children: [
                                    "Scan ",
                                    new Date(detail.scrapedAt).toLocaleString("nl-NL", {
                                        dateStyle: "medium",
                                        timeStyle: "short"
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 736,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500",
                                children: [
                                    sc.electricityNormal + sc.electricityLow,
                                    " kWh",
                                    sc.gas > 0 ? ` · ${sc.gas} m³ gas` : " · alleen stroom",
                                    sc.solarFeedIn > 0 ? ` · ${sc.solarFeedIn} kWh teruglevering` : "",
                                    detail.address ? ` · 📍 ${detail.address}` : "",
                                    " — ",
                                    total,
                                    " contracten over",
                                    " ",
                                    detail.platforms.length,
                                    " vergelijkers"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 739,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 735,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/archive/scan/screenshot?sweepId=${encodeURIComponent(sweepId ?? "")}`,
                                className: "rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700",
                                children: "📷 Screenshots"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 747,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/archive",
                                className: "text-sm font-medium text-emerald-700 hover:underline",
                                children: "← Archief"
                            }, void 0, false, {
                                fileName: "[project]/app/archive/scan/page.tsx",
                                lineNumber: 753,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 746,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 734,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatsTable, {
                platforms: detail.platforms
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 759,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500",
                        children: "Rankings naast elkaar"
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 761,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RankingFilters, {
                        types: allTypes,
                        providers: detail.providers,
                        typeFilter: typeFilter,
                        providerFilter: providerFilter,
                        onTypes: setTypeFilter,
                        onProviders: setProviderFilter
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 762,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BrandPills, {
                        providers: detail.providers,
                        brandColor: brandColor,
                        selected: highlighted,
                        onToggle: (name)=>setHighlighted((prev)=>{
                                const next = new Set(prev);
                                if (next.has(name)) next.delete(name);
                                else next.add(name);
                                return next;
                            })
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 770,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PlatformColumns, {
                        platforms: detail.platforms,
                        typeFilter: typeFilter,
                        providerFilter: providerFilter,
                        highlighted: highlighted,
                        brandColor: brandColor
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 783,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 760,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Charts, {
                detail: detail
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 791,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TariffSection, {
                detail: detail
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 792,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500",
                        children: "Contracten per leverancier per vergelijker"
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 794,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProviderMatrix, {
                        detail: detail
                    }, void 0, false, {
                        fileName: "[project]/app/archive/scan/page.tsx",
                        lineNumber: 797,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 793,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 733,
        columnNumber: 5
    }, this);
}
_s2(ScanDetailInner, "XPUTUwCoV/b7Jz4efD8yiCUHCwo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c9 = ScanDetailInner;
function ScanDetailPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-slate-100",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-7xl px-4 py-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "py-24 text-center text-slate-400",
                    children: "Laden…"
                }, void 0, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 807,
                    columnNumber: 29
                }, this),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScanDetailInner, {}, void 0, false, {
                    fileName: "[project]/app/archive/scan/page.tsx",
                    lineNumber: 808,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/archive/scan/page.tsx",
                lineNumber: 807,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/archive/scan/page.tsx",
            lineNumber: 806,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/archive/scan/page.tsx",
        lineNumber: 805,
        columnNumber: 5
    }, this);
}
_c10 = ScanDetailPage;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10;
__turbopack_context__.k.register(_c, "BrandPills");
__turbopack_context__.k.register(_c1, "ScatterTip");
__turbopack_context__.k.register(_c2, "StatsTable");
__turbopack_context__.k.register(_c3, "RankingFilters");
__turbopack_context__.k.register(_c4, "PlatformColumns");
__turbopack_context__.k.register(_c5, "ProviderMatrix");
__turbopack_context__.k.register(_c6, "Charts");
__turbopack_context__.k.register(_c7, "TariffTip");
__turbopack_context__.k.register(_c8, "TariffSection");
__turbopack_context__.k.register(_c9, "ScanDetailInner");
__turbopack_context__.k.register(_c10, "ScanDetailPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/platformColors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// One distinct color family per comparison platform, used across the archive.
__turbopack_context__.s([
    "PLATFORM_COLORS",
    ()=>PLATFORM_COLORS,
    "platformColor",
    ()=>platformColor
]);
const PLATFORM_COLORS = {
    gaslicht: {
        hex: "#f59e0b",
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-700",
        chip: "bg-amber-100 text-amber-800"
    },
    energiekiezer: {
        hex: "#0ea5e9",
        bg: "bg-sky-50",
        border: "border-sky-300",
        text: "text-sky-700",
        chip: "bg-sky-100 text-sky-800"
    },
    energievergelijk: {
        hex: "#a855f7",
        bg: "bg-purple-50",
        border: "border-purple-300",
        text: "text-purple-700",
        chip: "bg-purple-100 text-purple-800"
    },
    independer: {
        hex: "#6366f1",
        bg: "bg-indigo-50",
        border: "border-indigo-300",
        text: "text-indigo-700",
        chip: "bg-indigo-100 text-indigo-800"
    },
    overstappen: {
        hex: "#ef4444",
        bg: "bg-rose-50",
        border: "border-rose-300",
        text: "text-rose-700",
        chip: "bg-rose-100 text-rose-800"
    },
    pricewise: {
        hex: "#14b8a6",
        bg: "bg-teal-50",
        border: "border-teal-300",
        text: "text-teal-700",
        chip: "bg-teal-100 text-teal-800"
    }
};
const platformColor = (name)=>PLATFORM_COLORS[name] ?? {
        hex: "#64748b",
        bg: "bg-slate-50",
        border: "border-slate-300",
        text: "text-slate-700",
        chip: "bg-slate-100 text-slate-700"
    };
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0luq73n._.js.map