module.exports = [
"[project]/src/components/dashboard/KPICard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KPICard",
    ()=>KPICard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
function KPICard({ title, value, subtitle, icon, trend, highlight, details }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-lg border p-4 ${highlight ? 'border-primary bg-primary/5 border-2' : 'bg-card'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-muted-foreground uppercase tracking-wider",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                                lineNumber: 24,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `text-3xl font-bold mt-1 ${highlight ? 'text-primary' : ''}`,
                                children: value
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                                lineNumber: 25,
                                columnNumber: 11
                            }, this),
                            subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-muted-foreground mt-0.5",
                                children: subtitle
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                                lineNumber: 26,
                                columnNumber: 24
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dashboard/KPICard.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-muted-foreground",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/src/components/dashboard/KPICard.tsx",
                        lineNumber: 28,
                        columnNumber: 18
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            trend && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `text-xs mt-2 ${trend.positive ? 'text-green-500' : 'text-red-500'}`,
                children: trend.value
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                lineNumber: 32,
                columnNumber: 9
            }, this),
            details && details.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 pt-2 border-t space-y-1",
                children: details.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-muted-foreground",
                                children: d.label
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                                lineNumber: 41,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium",
                                children: d.value
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                                lineNumber: 42,
                                columnNumber: 15
                            }, this)
                        ]
                    }, d.label, true, {
                        fileName: "[project]/src/components/dashboard/KPICard.tsx",
                        lineNumber: 40,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/KPICard.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dashboard/KPICard.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/dashboard/StundenChart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StundenChart",
    ()=>StundenChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function StundenChart({ data, width = 500, height = 220 }) {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        // Clear
        ctx.clearRect(0, 0, width, height);
        if (data.length === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Keine Daten', width / 2, height / 2);
            return;
        }
        const padding = {
            top: 20,
            right: 15,
            bottom: 30,
            left: 40
        };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;
        const maxVal = Math.max(...data.map((d)=>Math.max(d.soll, d.ist)), 1);
        const barWidth = chartW / data.length;
        const barGap = 2;
        // Y-axis
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.stroke();
        // Grid lines + Y-axis labels
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        for(let i = 0; i <= 4; i++){
            const y = padding.top + chartH * i / 4;
            const val = maxVal * (1 - i / 4);
            ctx.fillText(val.toFixed(0), padding.left - 4, y + 3);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }
        // Bars
        data.forEach((d, i)=>{
            const x = padding.left + i * barWidth;
            const halfBar = (barWidth - barGap * 2) / 2;
            // SOLL bar (left, blue)
            const sollH = d.soll / maxVal * chartH;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
            ctx.fillRect(x + barGap, padding.top + chartH - sollH, halfBar, sollH);
            // IST bar (right, colored by status)
            if (d.ist > 0) {
                const istH = d.ist / maxVal * chartH;
                const delta = d.ist - d.soll;
                ctx.fillStyle = delta > 0.5 ? 'rgba(234, 179, 8, 0.6)' // Yellow (over)
                 : delta < -0.5 ? 'rgba(239, 68, 68, 0.6)' // Red (under)
                 : 'rgba(34, 197, 94, 0.6)'; // Green (good)
                ctx.fillRect(x + barGap + halfBar, padding.top + chartH - istH, halfBar, istH);
            }
            // X-axis label
            ctx.fillStyle = '#888';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${d.stunde}`, x + barWidth / 2, height - padding.bottom + 12);
        });
        // Legend
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        const legendY = 10;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.fillRect(padding.left + 5, legendY - 6, 10, 8);
        ctx.fillStyle = '#888';
        ctx.fillText('SOLL', padding.left + 18, legendY + 1);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.fillRect(padding.left + 55, legendY - 6, 10, 8);
        ctx.fillStyle = '#888';
        ctx.fillText('IST', padding.left + 68, legendY + 1);
    }, [
        data,
        width,
        height
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        style: {
            width,
            height
        },
        className: "rounded border bg-background"
    }, void 0, false, {
        fileName: "[project]/src/components/dashboard/StundenChart.tsx",
        lineNumber: 119,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/dashboard/AbteilungsChart.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AbteilungsChart",
    ()=>AbteilungsChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function AbteilungsChart({ abteilungen, width = 400, height = 200 }) {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
        if (abteilungen.length === 0) return;
        const padding = {
            top: 15,
            right: 80,
            bottom: 10,
            left: 70
        };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;
        const maxVal = Math.max(...abteilungen.map((a)=>a.minProColli), 0.01);
        const barH = Math.min(30, chartH / abteilungen.length - 8);
        abteilungen.forEach((abt, i)=>{
            const y = padding.top + i * (chartH / abteilungen.length) + (chartH / abteilungen.length - barH) / 2;
            const barW = abt.minProColli / maxVal * chartW;
            // Label
            ctx.fillStyle = '#aaa';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(abt.label, padding.left - 8, y + barH / 2 + 4);
            // Bar
            ctx.fillStyle = abt.color;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(padding.left, y, barW, barH);
            ctx.globalAlpha = 1;
            // Value
            ctx.fillStyle = '#ddd';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`${abt.minProColli.toFixed(3)} (${Math.round(abt.anteilGesamt * 100)}%)`, padding.left + barW + 5, y + barH / 2 + 4);
        });
    }, [
        abteilungen,
        width,
        height
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        style: {
            width,
            height
        },
        className: "rounded border bg-background"
    }, void 0, false, {
        fileName: "[project]/src/components/dashboard/AbteilungsChart.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/dashboard/BenchmarkRadar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BenchmarkRadar",
    ()=>BenchmarkRadar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function BenchmarkRadar({ aktuell, benchmark, abteilungen, width = 300, height = 250 }) {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
        const n = abteilungen.length;
        if (n === 0) return;
        const cx = width / 2;
        const cy = height / 2 + 5;
        const radius = Math.min(width, height) / 2 - 40;
        // Max value for normalization
        const maxVal = Math.max(...abteilungen.map((a)=>Math.max(aktuell[a.id] || 0, benchmark[a.id] || 0)), 0.01);
        const angleStep = Math.PI * 2 / n;
        const startAngle = -Math.PI / 2; // Start from top
        // Grid circles
        for(let level = 1; level <= 4; level++){
            const r = radius * level / 4;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
        // Axis lines + labels
        abteilungen.forEach((abt, i)=>{
            const angle = startAngle + i * angleStep;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Label
            const labelR = radius + 18;
            const lx = cx + Math.cos(angle) * labelR;
            const ly = cy + Math.sin(angle) * labelR;
            ctx.fillStyle = '#aaa';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(abt.label, lx, ly);
        });
        // Draw polygon helper
        const drawPolygon = (values, color, fill)=>{
            ctx.beginPath();
            abteilungen.forEach((abt, i)=>{
                const angle = startAngle + i * angleStep;
                const val = (values[abt.id] || 0) / maxVal;
                const r = val * radius;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            if (fill) {
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.15;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
            // Dots
            abteilungen.forEach((abt, i)=>{
                const angle = startAngle + i * angleStep;
                const val = (values[abt.id] || 0) / maxVal;
                const r = val * radius;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            });
        };
        // Benchmark (green dashed)
        drawPolygon(benchmark, '#22c55e', true);
        // Aktuell (primary color)
        drawPolygon(aktuell, '#3b82f6', true);
        // Legend
        const legendY = height - 12;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(10, legendY - 6, 10, 8);
        ctx.fillStyle = '#888';
        ctx.fillText('Aktuell', 24, legendY + 1);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(80, legendY - 6, 10, 8);
        ctx.fillStyle = '#888';
        ctx.fillText('Benchmark', 94, legendY + 1);
    }, [
        aktuell,
        benchmark,
        abteilungen,
        width,
        height
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        style: {
            width,
            height
        },
        className: "rounded border bg-background"
    }, void 0, false, {
        fileName: "[project]/src/components/dashboard/BenchmarkRadar.tsx",
        lineNumber: 147,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/betriebsdaten-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBetriebsAnalyse",
    ()=>useBetriebsAnalyse,
    "useBetriebsdatenStore",
    ()=>useBetriebsdatenStore,
    "useHeatmapConfig",
    ()=>useHeatmapConfig,
    "useRelationZuordnungen",
    ()=>useRelationZuordnungen,
    "useScandatenRecords",
    ()=>useScandatenRecords,
    "useStundenAggregation",
    ()=>useStundenAggregation,
    "useSzenarien",
    ()=>useSzenarien,
    "useTorZuordnungen",
    ()=>useTorZuordnungen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
'use client';
;
const defaultHeatmapConfig = {
    aktiv: false,
    modus: 'sendungen',
    farbskala: 'gruen-rot',
    intensitaet: 0.6
};
const useBetriebsdatenStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        scanRecords: [],
        scandatenRecords: [],
        analyse: null,
        torZuordnungen: [],
        relationZuordnungen: [],
        spaltenzuordnung: null,
        heatmapConfig: defaultHeatmapConfig,
        szenarien: [],
        aktivSzenario: null,
        stundenAggregation: [],
        importScanRecords: (records)=>set({
                scanRecords: records
            }),
        importScandatenRecords: (records)=>{
            // Auch stündliche Aggregation berechnen
            const stundenMap = new Map();
            for(let h = 0; h < 24; h++){
                stundenMap.set(h, {
                    stunde: h,
                    colli: 0,
                    sendungen: 0,
                    gewicht: 0,
                    scans: 0
                });
            }
            for (const r of records){
                const stunde = r.scanzeit ? parseInt(r.scanzeit.split(':')[0]) : 0;
                const agg = stundenMap.get(stunde) || stundenMap.get(0);
                agg.colli += r.colli;
                agg.sendungen += r.sendungen;
                agg.gewicht += r.gewicht;
                agg.scans += 1;
            }
            set({
                scandatenRecords: records,
                stundenAggregation: Array.from(stundenMap.values())
            });
        },
        setAnalyse: (analyse)=>set({
                analyse
            }),
        setTorZuordnungen: (zuordnungen)=>set({
                torZuordnungen: zuordnungen
            }),
        setRelationZuordnungen: (zuordnungen)=>set({
                relationZuordnungen: zuordnungen
            }),
        setSpaltenzuordnung: (profil)=>set({
                spaltenzuordnung: profil
            }),
        setHeatmapConfig: (config)=>set((state)=>({
                    heatmapConfig: {
                        ...state.heatmapConfig,
                        ...config
                    }
                })),
        toggleHeatmap: ()=>set((state)=>({
                    heatmapConfig: {
                        ...state.heatmapConfig,
                        aktiv: !state.heatmapConfig.aktiv
                    }
                })),
        setHeatmapModus: (modus)=>set((state)=>({
                    heatmapConfig: {
                        ...state.heatmapConfig,
                        modus
                    }
                })),
        addSzenario: (szenario)=>set((state)=>({
                    szenarien: [
                        ...state.szenarien,
                        szenario
                    ]
                })),
        removeSzenario: (id)=>set((state)=>({
                    szenarien: state.szenarien.filter((s)=>s.id !== id),
                    aktivSzenario: state.aktivSzenario === id ? null : state.aktivSzenario
                })),
        setAktivSzenario: (id)=>set({
                aktivSzenario: id
            }),
        setStundenAggregation: (agg)=>set({
                stundenAggregation: agg
            }),
        reset: ()=>set({
                scanRecords: [],
                scandatenRecords: [],
                analyse: null,
                torZuordnungen: [],
                relationZuordnungen: [],
                spaltenzuordnung: null,
                heatmapConfig: defaultHeatmapConfig,
                szenarien: [],
                aktivSzenario: null,
                stundenAggregation: []
            })
    }));
const useHeatmapConfig = ()=>useBetriebsdatenStore((s)=>s.heatmapConfig);
const useBetriebsAnalyse = ()=>useBetriebsdatenStore((s)=>s.analyse);
const useSzenarien = ()=>useBetriebsdatenStore((s)=>s.szenarien);
const useTorZuordnungen = ()=>useBetriebsdatenStore((s)=>s.torZuordnungen);
const useRelationZuordnungen = ()=>useBetriebsdatenStore((s)=>s.relationZuordnungen);
const useScandatenRecords = ()=>useBetriebsdatenStore((s)=>s.scandatenRecords);
const useStundenAggregation = ()=>useBetriebsdatenStore((s)=>s.stundenAggregation);
}),
"[project]/src/lib/data/prozessmodell-se.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PROZESSMODELL_SE",
    ()=>PROZESSMODELL_SE,
    "SE_STANDARD_PARAMETER",
    ()=>SE_STANDARD_PARAMETER
]);
/**
 * Vereinfachtes SE-Prozessmodell (Stückgut-Eingang).
 * Basiert auf dem ROTH 976-Zeilen-Excel, reduziert auf die Kernschritte,
 * die 90%+ der Gesamtzeit abdecken.
 *
 * Referenzwert AS Gersthofen: 1.917 Min/Colli
 * (Entlader 0.829 + Scanner 0.336 + Verteiler 0.752)
 *
 * Belader (SA) wurde entfernt — gehört nicht zum SE-Prozess.
 * Verteiler-Wege werden durch colliProFahrt (Batch-Faktor) geteilt.
 */ const SE_SCHRITTE = [
    // ==================== ENTLADER ====================
    // Fahrt zum Tor + Tor öffnen
    {
        nr: 1,
        beschreibung: 'Zum Tor fahren (leer)',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 30,
        wegAusLayout: false,
        geschwindigkeitMs: 2.86,
        standardzeitSek: 10.5,
        anteil: 1.0,
        haeufigkeit: 0.1
    },
    {
        nr: 2,
        beschreibung: 'Tor öffnen / Andockstellung prüfen',
        abteilung: 'entlader',
        hilfsmittel: '-',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 15.0,
        anteil: 1.0,
        haeufigkeit: 0.1
    },
    {
        nr: 3,
        beschreibung: 'In LKW einfahren',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 12,
        wegAusLayout: false,
        geschwindigkeitMs: 1.5,
        standardzeitSek: 8.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 4,
        beschreibung: 'Palette/Gitterbox aufnehmen',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 12.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 5,
        beschreibung: 'Rangieren im LKW',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 3,
        wegAusLayout: false,
        geschwindigkeitMs: 1.0,
        standardzeitSek: 3.0,
        anteil: 0.3,
        haeufigkeit: 1.0
    },
    {
        nr: 6,
        beschreibung: 'Aus LKW rausfahren',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 12,
        wegAusLayout: false,
        geschwindigkeitMs: 2.0,
        standardzeitSek: 6.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 7,
        beschreibung: 'Zur Entladestellfläche fahren',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 8,
        wegAusLayout: false,
        geschwindigkeitMs: 2.86,
        standardzeitSek: 2.8,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 8,
        beschreibung: 'Palette abstellen auf Entladefläche',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 8.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 9,
        beschreibung: 'Zurückfahren zum LKW',
        abteilung: 'entlader',
        hilfsmittel: 'Stapler',
        wegM: 8,
        wegAusLayout: false,
        geschwindigkeitMs: 2.86,
        standardzeitSek: 2.8,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 10,
        beschreibung: 'Wartezeit (LKW wechsel etc.)',
        abteilung: 'entlader',
        hilfsmittel: '-',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 20.0,
        anteil: 0.25,
        haeufigkeit: 1.0
    },
    {
        nr: 11,
        beschreibung: 'Gefäß öffnen (Plane, Deckel)',
        abteilung: 'entlader',
        hilfsmittel: 'Hand',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 23.0,
        anteil: 0.3,
        haeufigkeit: 1.0
    },
    {
        nr: 12,
        beschreibung: 'Rampe andocken',
        abteilung: 'entlader',
        hilfsmittel: '-',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 16.0,
        anteil: 0.15,
        haeufigkeit: 1.0
    },
    // ==================== SCANNER ====================
    {
        nr: 20,
        beschreibung: 'Zur Palette gehen',
        abteilung: 'scanner',
        hilfsmittel: 'Scanner',
        wegM: 3,
        wegAusLayout: false,
        geschwindigkeitMs: 1.2,
        standardzeitSek: 2.5,
        anteil: 1.0,
        haeufigkeit: 0.1
    },
    {
        nr: 21,
        beschreibung: 'Palette scannen (Barcode)',
        abteilung: 'scanner',
        hilfsmittel: 'Scanner',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 3.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 22,
        beschreibung: 'Colli scannen',
        abteilung: 'scanner',
        hilfsmittel: 'Scanner',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 4.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 23,
        beschreibung: 'Colli umsetzen / drehen (Label suchen)',
        abteilung: 'scanner',
        hilfsmittel: 'Hand',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 5.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 24,
        beschreibung: 'Ziel-Label aufkleben',
        abteilung: 'scanner',
        hilfsmittel: 'Drucker',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 3.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 25,
        beschreibung: 'Colli auf Verteilwagen setzen / Kette',
        abteilung: 'scanner',
        hilfsmittel: 'Hand/Kette',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 4.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 26,
        beschreibung: 'Problem-Colli separieren',
        abteilung: 'scanner',
        hilfsmittel: 'Hand',
        wegM: 2,
        wegAusLayout: false,
        geschwindigkeitMs: 1.2,
        standardzeitSek: 15.0,
        anteil: 0.05,
        haeufigkeit: 1.0
    },
    // ==================== VERTEILER ====================
    {
        nr: 40,
        beschreibung: 'Colli von Kette/Wagen nehmen',
        abteilung: 'verteiler',
        hilfsmittel: 'Hand',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 4.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 41,
        beschreibung: 'Ziel-Label lesen',
        abteilung: 'verteiler',
        hilfsmittel: 'Auge',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 2.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 42,
        beschreibung: 'Zum Stellplatz fahren/gehen (VERTEILWEG)',
        abteilung: 'verteiler',
        hilfsmittel: 'Schnelläufer',
        wegM: 138.8,
        wegAusLayout: true,
        geschwindigkeitMs: 2.44,
        standardzeitSek: 56.9,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 43,
        beschreibung: 'Colli abstellen am Stellplatz',
        abteilung: 'verteiler',
        hilfsmittel: 'Hand',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 3.0,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 44,
        beschreibung: 'Colli sortieren/stapeln',
        abteilung: 'verteiler',
        hilfsmittel: 'Hand',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 4.0,
        anteil: 0.5,
        haeufigkeit: 1.0
    },
    {
        nr: 45,
        beschreibung: 'Leerfahrt zurück zur Kette',
        abteilung: 'verteiler',
        hilfsmittel: 'Schnelläufer',
        wegM: 138.8,
        wegAusLayout: true,
        geschwindigkeitMs: 2.44,
        standardzeitSek: 56.9,
        anteil: 1.0,
        haeufigkeit: 1.0
    },
    {
        nr: 46,
        beschreibung: 'Wartezeit an Kette (kein Colli)',
        abteilung: 'verteiler',
        hilfsmittel: '-',
        wegM: 0,
        wegAusLayout: false,
        geschwindigkeitMs: 0,
        standardzeitSek: 5.0,
        anteil: 0.1,
        haeufigkeit: 1.0
    }
];
const PROZESSMODELL_SE = {
    id: 'se_standard',
    name: 'Stückgut-Eingang (SE)',
    beschreibung: 'Standard SE-Prozess: Entladen → Scannen → Verteilen',
    prozessTyp: 'se',
    schritte: SE_SCHRITTE,
    abteilungen: [
        {
            id: 'entlader',
            label: 'Entlader',
            color: '#3b82f6'
        },
        {
            id: 'scanner',
            label: 'Scanner',
            color: '#22c55e'
        },
        {
            id: 'verteiler',
            label: 'Verteiler',
            color: '#f59e0b'
        }
    ]
};
const SE_STANDARD_PARAMETER = [
    // Allgemein
    {
        id: 'colliProTag',
        name: 'Colli pro Tag',
        einheit: 'Cll/Tag',
        standardwert: 15000,
        aktuellerWert: 15000,
        quelle: 'eingabe',
        kategorie: 'allgemein',
        beschreibung: 'Durchschnittliche Colli-Menge pro Tag'
    },
    {
        id: 'sendungenProTag',
        name: 'Sendungen pro Tag',
        einheit: 'Sdg/Tag',
        standardwert: 5000,
        aktuellerWert: 5000,
        quelle: 'eingabe',
        kategorie: 'allgemein',
        beschreibung: 'Durchschnittliche Sendungsmenge pro Tag'
    },
    {
        id: 'colliProSendung',
        name: 'Colli pro Sendung',
        einheit: 'Cll/Sdg',
        standardwert: 3.0,
        aktuellerWert: 3.0,
        quelle: 'berechnet',
        kategorie: 'allgemein'
    },
    {
        id: 'arbeitsminProStunde',
        name: 'Arbeitsmin. pro Stunde',
        einheit: 'min',
        standardwert: 52.9,
        aktuellerWert: 52.9,
        quelle: 'eingabe',
        kategorie: 'allgemein',
        beschreibung: 'Effektive Arbeitszeit pro Stunde (abzgl. Verteilzeit, persönliche Zeit)'
    },
    {
        id: 'arbeitsstundenProTag',
        name: 'Arbeitsstunden pro Tag',
        einheit: 'h',
        standardwert: 8.0,
        aktuellerWert: 8.0,
        quelle: 'eingabe',
        kategorie: 'allgemein'
    },
    {
        id: 'colliProQm',
        name: 'Colli pro qm Stellfläche',
        einheit: 'Cll/qm',
        standardwert: 1.25,
        aktuellerWert: 1.25,
        quelle: 'eingabe',
        kategorie: 'allgemein',
        beschreibung: 'Standard-Faktor für Flächenbedarfsrechnung'
    },
    // Entlader
    {
        id: 'colliProPalette',
        name: 'Colli pro Palette',
        einheit: 'Cll/Pal',
        standardwert: 20,
        aktuellerWert: 20,
        quelle: 'eingabe',
        kategorie: 'entlader',
        beschreibung: 'Durchschnittliche Colli pro Palette (Entladung)'
    },
    {
        id: 'staplerGeschwindigkeit',
        name: 'Stapler-Geschwindigkeit',
        einheit: 'm/s',
        standardwert: 2.86,
        aktuellerWert: 2.86,
        quelle: 'eingabe',
        kategorie: 'entlader'
    },
    {
        id: 'lkwProTag',
        name: 'LKW pro Tag (Eingang)',
        einheit: 'LKW/Tag',
        standardwert: 40,
        aktuellerWert: 40,
        quelle: 'eingabe',
        kategorie: 'entlader'
    },
    // Scanner
    {
        id: 'scanZeitProColli',
        name: 'Scan-Zeit pro Colli',
        einheit: 'Sek',
        standardwert: 4.0,
        aktuellerWert: 4.0,
        quelle: 'eingabe',
        kategorie: 'scanner'
    },
    {
        id: 'labelAufklebenZeit',
        name: 'Label aufkleben',
        einheit: 'Sek',
        standardwert: 3.0,
        aktuellerWert: 3.0,
        quelle: 'eingabe',
        kategorie: 'scanner'
    },
    {
        id: 'problemColliAnteil',
        name: 'Problem-Colli Anteil',
        einheit: '%',
        standardwert: 5.0,
        aktuellerWert: 5.0,
        quelle: 'eingabe',
        kategorie: 'scanner'
    },
    // Verteiler
    {
        id: 'verteilweg',
        name: 'Gewichteter Verteilweg',
        einheit: 'm',
        standardwert: 138.8,
        aktuellerWert: 138.8,
        quelle: 'layout',
        kategorie: 'verteiler',
        beschreibung: 'Colli-gewichteter Durchschnittsweg (aus Layout)'
    },
    {
        id: 'schnellaeuferGeschwindigkeit',
        name: 'Schnelläufer-Geschwindigkeit',
        einheit: 'm/s',
        standardwert: 2.44,
        aktuellerWert: 2.44,
        quelle: 'eingabe',
        kategorie: 'verteiler'
    },
    {
        id: 'colliAbstellenZeit',
        name: 'Colli abstellen',
        einheit: 'Sek',
        standardwert: 3.0,
        aktuellerWert: 3.0,
        quelle: 'eingabe',
        kategorie: 'verteiler'
    },
    {
        id: 'colliProFahrt',
        name: 'Colli pro Verteiler-Fahrt',
        einheit: 'Cll/Fahrt',
        standardwert: 3.39,
        aktuellerWert: 3.39,
        quelle: 'eingabe',
        kategorie: 'verteiler',
        beschreibung: 'Batch: Wie viele Colli pro Verteiler-Fahrt (teilt Wegzeit)'
    }
];
}),
"[project]/src/lib/prozessrechner.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "berechneMABedarf",
    ()=>berechneMABedarf,
    "berechneMinProColli",
    ()=>berechneMinProColli,
    "berechneWegzeit",
    ()=>berechneWegzeit
]);
function berechneMinProColli(modell, parameter) {
    const getParam = (id)=>{
        const p = parameter.find((p)=>p.id === id);
        return p?.aktuellerWert ?? p?.standardwert ?? 0;
    };
    const verteilweg = getParam('verteilweg');
    const schnellaeuferGeschwindigkeit = getParam('schnellaeuferGeschwindigkeit') || 2.44;
    const colliProTag = getParam('colliProTag');
    const arbeitsminProStunde = getParam('arbeitsminProStunde') || 52.9;
    const arbeitsstundenProTag = getParam('arbeitsstundenProTag') || 8.0;
    const colliProFahrt = getParam('colliProFahrt') || 1;
    // Schritte mit aktualisierten Wegen berechnen
    const aktualisierteScritte = modell.schritte.map((schritt)=>{
        let zeitSek = schritt.standardzeitSek;
        // Weg-abhängige Schritte: Zeit aus Layout-Verteilweg berechnen
        if (schritt.wegAusLayout && verteilweg > 0) {
            const geschwindigkeit = schritt.geschwindigkeitMs || schnellaeuferGeschwindigkeit;
            zeitSek = verteilweg / geschwindigkeit;
            // Batch-Faktor: Mehrere Colli pro Fahrt → Wegzeit teilen
            if (colliProFahrt > 1) {
                zeitSek = zeitSek / colliProFahrt;
            }
        }
        const berechneteZeit = zeitSek * schritt.anteil * schritt.haeufigkeit;
        return {
            ...schritt,
            standardzeitSek: zeitSek,
            berechneteZeitSek: berechneteZeit
        };
    });
    // Abteilungen dynamisch aus dem Modell ableiten
    const abteilungIds = modell.abteilungen.map((a)=>a.id);
    const abteilungsErgebnisse = abteilungIds.map((abtId)=>{
        const abtDef = modell.abteilungen.find((a)=>a.id === abtId);
        const schritte = aktualisierteScritte.filter((s)=>s.abteilung === abtId);
        const gesamtSek = schritte.reduce((sum, s)=>sum + (s.berechneteZeitSek || 0), 0);
        const minProColli = gesamtSek / 60;
        return {
            abteilung: abtId,
            label: abtDef.label,
            color: abtDef.color,
            minProColli,
            anteilGesamt: 0,
            schritteAnzahl: schritte.length,
            hauptzeitSek: gesamtSek
        };
    });
    const gesamtMinProColli = abteilungsErgebnisse.reduce((sum, a)=>sum + a.minProColli, 0);
    // Anteile berechnen
    abteilungsErgebnisse.forEach((a)=>{
        a.anteilGesamt = gesamtMinProColli > 0 ? a.minProColli / gesamtMinProColli : 0;
    });
    // MA-Bedarf berechnen
    const { stunden, fte } = berechneMABedarf(colliProTag, gesamtMinProColli, arbeitsminProStunde, arbeitsstundenProTag);
    return {
        minProColli: gesamtMinProColli,
        abteilungen: abteilungsErgebnisse,
        maStundenBedarf: stunden,
        fte,
        colliProTag,
        arbeitsminProStunde
    };
}
function berechneMABedarf(colliProTag, minProColli, arbeitsminProStunde = 52.9, arbeitsstundenProTag = 8.0) {
    const gesamtMinuten = colliProTag * minProColli;
    const stunden = gesamtMinuten / arbeitsminProStunde;
    const fte = stunden / arbeitsstundenProTag;
    return {
        stunden,
        fte
    };
}
function berechneWegzeit(wegM, geschwindigkeitMs) {
    if (geschwindigkeitMs <= 0) return 0;
    return wegM / geschwindigkeitMs;
}
}),
"[project]/src/lib/prozessmodell-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useProzessAbteilungen",
    ()=>useProzessAbteilungen,
    "useProzessErgebnis",
    ()=>useProzessErgebnis,
    "useProzessParameter",
    ()=>useProzessParameter,
    "useProzessmodellStore",
    ()=>useProzessmodellStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/prozessmodell-se.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessrechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prozessrechner.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
const useProzessmodellStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        modell: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROZESSMODELL_SE"],
        parameter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SE_STANDARD_PARAMETER"].map((p)=>({
                ...p
            })),
        ergebnis: null,
        setModell: (modell)=>set({
                modell
            }),
        setParameter: (parameter)=>set({
                parameter
            }),
        updateParameter: (id, wert)=>{
            set((state)=>({
                    parameter: state.parameter.map((p)=>p.id === id ? {
                            ...p,
                            aktuellerWert: wert
                        } : p)
                }));
            // Auto-Berechnung
            get().berechne();
        },
        setVerteilweg: (wegM)=>{
            set((state)=>({
                    parameter: state.parameter.map((p)=>p.id === 'verteilweg' ? {
                            ...p,
                            aktuellerWert: wegM,
                            quelle: 'layout'
                        } : p)
                }));
            get().berechne();
        },
        setColliProTag: (colli)=>{
            set((state)=>({
                    parameter: state.parameter.map((p)=>p.id === 'colliProTag' ? {
                            ...p,
                            aktuellerWert: colli,
                            quelle: 'scandaten'
                        } : p)
                }));
            get().berechne();
        },
        ladeModell: (modell, parameter)=>{
            set({
                modell,
                parameter: parameter.map((p)=>({
                        ...p
                    })),
                ergebnis: null
            });
            get().berechne();
        },
        berechne: ()=>{
            const { modell, parameter } = get();
            const ergebnis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessrechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["berechneMinProColli"])(modell, parameter);
            set({
                ergebnis
            });
        },
        reset: ()=>set({
                modell: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROZESSMODELL_SE"],
                parameter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SE_STANDARD_PARAMETER"].map((p)=>({
                        ...p
                    })),
                ergebnis: null
            })
    }));
const useProzessErgebnis = ()=>useProzessmodellStore((s)=>s.ergebnis);
const useProzessParameter = ()=>useProzessmodellStore((s)=>s.parameter);
const useProzessAbteilungen = ()=>useProzessmodellStore((s)=>s.modell.abteilungen);
}),
"[project]/src/types/topis.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// TOPIS Type Definitions
// ==================== HALL ====================
__turbopack_context__.s([
    "DEFAULT_FFZ",
    ()=>DEFAULT_FFZ,
    "DEFAULT_HALL",
    ()=>DEFAULT_HALL,
    "OBJECT_COLORS",
    ()=>OBJECT_COLORS,
    "OBJECT_DEFAULTS",
    ()=>OBJECT_DEFAULTS,
    "OBJECT_LABELS",
    ()=>OBJECT_LABELS,
    "SCALE",
    ()=>SCALE
]);
const SCALE = 10; // pixels per meter
const DEFAULT_HALL = {
    id: 1,
    shape: 'rect',
    width: 100,
    height: 50,
    name: 'Neue Halle',
    walls: [],
    offsetX: 0,
    offsetY: 0,
    color: '#16213e'
};
const OBJECT_COLORS = {
    tor: '#3b82f6',
    stellplatz: '#22c55e',
    bereich: '#a855f7',
    regal: '#f59e0b',
    hindernis: '#6b7280',
    rampe: '#f97316',
    leveller: '#ea580c',
    pfosten: '#94a3b8',
    treppe: '#a16207',
    ladestation: '#10b981',
    gefahrgut: '#ef4444',
    sperrplatz: '#dc2626',
    klaerplatz: '#eab308',
    buero: '#6366f1',
    sozialraum: '#8b5cf6',
    wc: '#06b6d4',
    wand: '#777777',
    tuer: '#55aaaa',
    entladebereich: '#4ade80',
    outdoor_area: '#2d5a1d',
    outdoor_road: '#4a4a4a',
    trailer_spot: '#664422',
    parking: '#336699',
    custom: '#7799aa'
};
const OBJECT_DEFAULTS = {
    tor: {
        width: 3.5,
        height: 1.5,
        name: 'Tor'
    },
    stellplatz: {
        width: 12,
        height: 5,
        name: 'Stellplatz'
    },
    bereich: {
        width: 15,
        height: 10,
        name: 'Bereich'
    },
    regal: {
        width: 10,
        height: 1.2,
        name: 'Regal'
    },
    hindernis: {
        width: 2,
        height: 2,
        name: 'Hindernis'
    },
    rampe: {
        width: 4,
        height: 8,
        name: 'Rampe'
    },
    leveller: {
        width: 2,
        height: 2.5,
        name: 'Leveller'
    },
    pfosten: {
        width: 0.5,
        height: 0.5,
        name: 'Pfosten'
    },
    treppe: {
        width: 3,
        height: 4,
        name: 'Treppe'
    },
    ladestation: {
        width: 2,
        height: 2,
        name: 'Ladestation'
    },
    gefahrgut: {
        width: 6,
        height: 4,
        name: 'Gefahrgut'
    },
    sperrplatz: {
        width: 8,
        height: 4,
        name: 'Sperrplatz'
    },
    klaerplatz: {
        width: 8,
        height: 4,
        name: 'Klärplatz'
    },
    buero: {
        width: 6,
        height: 5,
        name: 'Büro'
    },
    sozialraum: {
        width: 8,
        height: 6,
        name: 'Sozialraum'
    },
    wc: {
        width: 3,
        height: 4,
        name: 'WC'
    },
    wand: {
        width: 6,
        height: 0.3,
        name: 'Wand'
    },
    tuer: {
        width: 1.2,
        height: 0.3,
        name: 'Tür'
    },
    entladebereich: {
        width: 8,
        height: 6,
        name: 'Entladebereich'
    },
    outdoor_area: {
        width: 30,
        height: 20,
        name: 'Außenbereich'
    },
    outdoor_road: {
        width: 20,
        height: 4,
        name: 'Straße'
    },
    trailer_spot: {
        width: 15,
        height: 3,
        name: 'Wechselbrücke'
    },
    parking: {
        width: 5,
        height: 5,
        name: 'Parkplatz'
    },
    custom: {
        width: 4,
        height: 4,
        name: 'Objekt'
    }
};
const OBJECT_LABELS = {
    tor: 'Tor',
    stellplatz: 'Stellplatz',
    bereich: 'Bereich',
    regal: 'Regal',
    hindernis: 'Hindernis',
    rampe: 'Rampe',
    leveller: 'Leveller',
    pfosten: 'Pfosten',
    treppe: 'Treppe',
    ladestation: 'Ladestation',
    gefahrgut: 'Gefahrgut',
    sperrplatz: 'Sperrplatz',
    klaerplatz: 'Klärplatz',
    buero: 'Büro',
    sozialraum: 'Sozialraum',
    wc: 'WC',
    wand: 'Wand',
    tuer: 'Tür',
    entladebereich: 'Entladebereich',
    outdoor_area: 'Außenbereich',
    outdoor_road: 'Straße',
    trailer_spot: 'Wechselbrücke',
    parking: 'Parkplatz',
    custom: 'Benutzerdefiniert'
};
const DEFAULT_FFZ = [
    {
        id: 1,
        name: 'Gabelstapler',
        type: 'gabelstapler',
        mindestBreite: 3.5,
        geschwindigkeit: 12,
        aufnahmeZeit: 15,
        abgabeZeit: 12,
        maxHubhoehe: 6,
        tragkraft: 2500
    },
    {
        id: 2,
        name: 'Ameise',
        type: 'ameise',
        mindestBreite: 2.5,
        geschwindigkeit: 6,
        aufnahmeZeit: 20,
        abgabeZeit: 15,
        maxHubhoehe: 0.2,
        tragkraft: 2000
    },
    {
        id: 3,
        name: 'Schlepper',
        type: 'schlepper',
        mindestBreite: 2.0,
        geschwindigkeit: 15,
        aufnahmeZeit: 10,
        abgabeZeit: 10,
        tragkraft: 5000
    },
    {
        id: 4,
        name: 'AGV',
        type: 'agv',
        mindestBreite: 2.0,
        geschwindigkeit: 5,
        aufnahmeZeit: 25,
        abgabeZeit: 25,
        tragkraft: 1500
    },
    {
        id: 5,
        name: 'Handhubwagen',
        type: 'handhubwagen',
        mindestBreite: 1.8,
        geschwindigkeit: 4,
        aufnahmeZeit: 30,
        abgabeZeit: 25,
        maxHubhoehe: 0.2,
        tragkraft: 2500
    },
    {
        id: 6,
        name: 'Kommissionierer',
        type: 'kommissionierer',
        mindestBreite: 2.2,
        geschwindigkeit: 8,
        aufnahmeZeit: 12,
        abgabeZeit: 10,
        maxHubhoehe: 3,
        tragkraft: 1000
    }
];
}),
"[project]/src/lib/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useActiveHall",
    ()=>useActiveHall,
    "useHalls",
    ()=>useHalls,
    "useObjects",
    ()=>useObjects,
    "usePan",
    ()=>usePan,
    "useSelectedConveyor",
    ()=>useSelectedConveyor,
    "useSelectedGang",
    ()=>useSelectedGang,
    "useSelectedObject",
    ()=>useSelectedObject,
    "useSelectedPathArea",
    ()=>useSelectedPathArea,
    "useTool",
    ()=>useTool,
    "useTopisStore",
    ()=>useTopisStore,
    "useZoom",
    ()=>useZoom
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/topis.ts [app-ssr] (ecmascript)");
;
;
// ==================== UNDO/REDO ====================
const MAX_UNDO_STACK = 50;
function captureLayoutSnapshot(state) {
    return {
        objects: JSON.parse(JSON.stringify(state.objects)),
        gaenge: JSON.parse(JSON.stringify(state.gaenge)),
        ffz: JSON.parse(JSON.stringify(state.ffz)),
        halls: JSON.parse(JSON.stringify(state.halls)),
        paths: JSON.parse(JSON.stringify(state.paths)),
        pathAreas: JSON.parse(JSON.stringify(state.pathAreas)),
        conveyors: JSON.parse(JSON.stringify(state.conveyors))
    };
}
function restoreLayoutSnapshot(snapshot) {
    return {
        objects: JSON.parse(JSON.stringify(snapshot.objects)),
        gaenge: JSON.parse(JSON.stringify(snapshot.gaenge)),
        ffz: JSON.parse(JSON.stringify(snapshot.ffz)),
        halls: JSON.parse(JSON.stringify(snapshot.halls)),
        paths: JSON.parse(JSON.stringify(snapshot.paths || [])),
        pathAreas: JSON.parse(JSON.stringify(snapshot.pathAreas || [])),
        conveyors: JSON.parse(JSON.stringify(snapshot.conveyors || [])),
        selectedObject: null,
        selectedPath: null,
        selectedGang: null,
        selectedPathArea: null,
        selectedConveyor: null
    };
}
const initialState = {
    halls: [
        {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_HALL"]
        }
    ],
    activeHallId: 1,
    hall: {
        width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_HALL"].width,
        height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_HALL"].height,
        shape: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_HALL"].shape,
        walls: []
    },
    objects: [],
    objectIdCounter: 1,
    selectedObject: null,
    paths: [],
    pathIdCounter: 1,
    selectedPath: null,
    currentPath: null,
    pathAreas: [],
    pathAreaIdCounter: 1,
    gaenge: [],
    showGaenge: true,
    selectedGang: null,
    ffz: [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_FFZ"]
    ],
    selectedPathArea: null,
    conveyors: [],
    conveyorIdCounter: 1,
    selectedConveyor: null,
    currentConveyor: null,
    zoom: 1,
    pan: {
        x: 0,
        y: 0
    },
    gridSize: 1,
    showGrid: true,
    snapToGrid: true,
    currentTool: 'select',
    filterType: 'all',
    projektVergleich: {
        vorher: null,
        nachher: null,
        vorherScreenshot: null,
        nachherScreenshot: null
    }
};
const useTopisStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        ...initialState,
        // Undo/Redo state
        undoStack: [],
        redoStack: [],
        originalLayout: null,
        pushSnapshot: ()=>set((state)=>{
                const snapshot = captureLayoutSnapshot(state);
                const newStack = [
                    ...state.undoStack,
                    snapshot
                ].slice(-MAX_UNDO_STACK);
                return {
                    undoStack: newStack,
                    redoStack: []
                };
            }),
        undo: ()=>{
            const { undoStack } = get();
            if (undoStack.length === 0) return;
            const currentSnapshot = captureLayoutSnapshot(get());
            const previousSnapshot = undoStack[undoStack.length - 1];
            const restored = restoreLayoutSnapshot(previousSnapshot);
            set((state)=>({
                    ...restored,
                    undoStack: state.undoStack.slice(0, -1),
                    redoStack: [
                        ...state.redoStack,
                        currentSnapshot
                    ]
                }));
        },
        redo: ()=>{
            const { redoStack } = get();
            if (redoStack.length === 0) return;
            const currentSnapshot = captureLayoutSnapshot(get());
            const nextSnapshot = redoStack[redoStack.length - 1];
            const restored = restoreLayoutSnapshot(nextSnapshot);
            set((state)=>({
                    ...restored,
                    undoStack: [
                        ...state.undoStack,
                        currentSnapshot
                    ],
                    redoStack: state.redoStack.slice(0, -1)
                }));
        },
        canUndo: ()=>get().undoStack.length > 0,
        canRedo: ()=>get().redoStack.length > 0,
        saveOriginalLayout: ()=>set((state)=>({
                    originalLayout: captureLayoutSnapshot(state)
                })),
        resetToOriginal: ()=>{
            const { originalLayout } = get();
            if (!originalLayout) return;
            const currentSnapshot = captureLayoutSnapshot(get());
            const restored = restoreLayoutSnapshot(originalLayout);
            set((state)=>({
                    ...restored,
                    undoStack: [
                        ...state.undoStack,
                        currentSnapshot
                    ],
                    redoStack: []
                }));
        },
        // Hall Actions
        setHalls: (halls)=>{
            get().pushSnapshot();
            set({
                halls
            });
        },
        setActiveHall: (id)=>set({
                activeHallId: id
            }),
        updateHall: (id, updates)=>{
            get().pushSnapshot();
            set((state)=>({
                    halls: state.halls.map((h)=>h.id === id ? {
                            ...h,
                            ...updates
                        } : h)
                }));
        },
        rotateHall90: ()=>{
            get().pushSnapshot();
            set((state)=>{
                const hall = state.halls.find((h)=>h.id === state.activeHallId);
                if (!hall) return state;
                const oldWidth = hall.width;
                const oldHeight = hall.height;
                const rotatedObjects = state.objects.map((obj)=>({
                        ...obj,
                        x: Math.round(obj.y),
                        y: Math.round(oldWidth - obj.x - obj.width),
                        width: obj.height,
                        height: obj.width
                    }));
                const rotatedHalls = state.halls.map((h)=>h.id === state.activeHallId ? {
                        ...h,
                        width: oldHeight,
                        height: oldWidth
                    } : h);
                return {
                    halls: rotatedHalls,
                    objects: rotatedObjects
                };
            });
        },
        // Object Actions
        addObject: (obj)=>{
            get().pushSnapshot();
            const id = get().objectIdCounter;
            const newObj = {
                ...obj,
                id
            };
            set((state)=>({
                    objects: [
                        ...state.objects,
                        newObj
                    ],
                    objectIdCounter: state.objectIdCounter + 1
                }));
            return newObj;
        },
        updateObject: (id, updates)=>{
            get().pushSnapshot();
            set((state)=>({
                    objects: state.objects.map((o)=>o.id === id ? {
                            ...o,
                            ...updates
                        } : o),
                    selectedObject: state.selectedObject?.id === id ? {
                        ...state.selectedObject,
                        ...updates
                    } : state.selectedObject
                }));
        },
        deleteObject: (id)=>{
            get().pushSnapshot();
            set((state)=>({
                    objects: state.objects.filter((o)=>o.id !== id),
                    selectedObject: state.selectedObject?.id === id ? null : state.selectedObject
                }));
        },
        selectObject: (obj)=>set({
                selectedObject: obj,
                selectedPath: null,
                selectedGang: null,
                selectedPathArea: null,
                selectedConveyor: null
            }),
        // Path Actions
        addPath: (path)=>{
            get().pushSnapshot();
            set((state)=>({
                    paths: [
                        ...state.paths,
                        {
                            ...path,
                            id: state.pathIdCounter
                        }
                    ],
                    pathIdCounter: state.pathIdCounter + 1
                }));
        },
        updatePath: (id, updates)=>set((state)=>{
                const updatedPaths = state.paths.map((p)=>p.id === id ? {
                        ...p,
                        ...updates
                    } : p);
                const updatedPath = updatedPaths.find((p)=>p.id === id) || null;
                return {
                    paths: updatedPaths,
                    selectedPath: state.selectedPath?.id === id ? updatedPath : state.selectedPath
                };
            }),
        deletePath: (id)=>{
            get().pushSnapshot();
            set((state)=>({
                    paths: state.paths.filter((p)=>p.id !== id),
                    selectedPath: state.selectedPath?.id === id ? null : state.selectedPath
                }));
        },
        selectPath: (path)=>set({
                selectedPath: path,
                selectedObject: null,
                selectedGang: null,
                selectedPathArea: null,
                selectedConveyor: null
            }),
        // PathArea Actions
        addPathArea: (area)=>{
            get().pushSnapshot();
            const id = get().pathAreaIdCounter;
            const newArea = {
                ...area,
                id
            };
            set((state)=>({
                    pathAreas: [
                        ...state.pathAreas,
                        newArea
                    ],
                    pathAreaIdCounter: state.pathAreaIdCounter + 1
                }));
            return newArea;
        },
        updatePathArea: (id, updates)=>set((state)=>{
                const updatedAreas = state.pathAreas.map((a)=>a.id === id ? {
                        ...a,
                        ...updates
                    } : a);
                return {
                    pathAreas: updatedAreas,
                    selectedPathArea: state.selectedPathArea?.id === id ? {
                        ...state.selectedPathArea,
                        ...updates
                    } : state.selectedPathArea
                };
            }),
        deletePathArea: (id)=>{
            get().pushSnapshot();
            set((state)=>({
                    pathAreas: state.pathAreas.filter((a)=>a.id !== id),
                    selectedPathArea: state.selectedPathArea?.id === id ? null : state.selectedPathArea
                }));
        },
        selectPathArea: (area)=>set({
                selectedPathArea: area,
                selectedObject: null,
                selectedPath: null,
                selectedConveyor: null,
                selectedGang: null
            }),
        // Gang Actions
        setGaenge: (gaenge)=>{
            get().pushSnapshot();
            set({
                gaenge
            });
        },
        addGang: (gang)=>{
            get().pushSnapshot();
            set((state)=>({
                    gaenge: [
                        ...state.gaenge,
                        gang
                    ]
                }));
        },
        updateGang: (id, updates)=>set((state)=>{
                const updatedGaenge = state.gaenge.map((g)=>g.id === id ? {
                        ...g,
                        ...updates
                    } : g);
                return {
                    gaenge: updatedGaenge,
                    selectedGang: state.selectedGang?.id === id ? {
                        ...state.selectedGang,
                        ...updates
                    } : state.selectedGang
                };
            }),
        deleteGang: (id)=>{
            get().pushSnapshot();
            set((state)=>({
                    gaenge: state.gaenge.filter((g)=>g.id !== id),
                    selectedGang: state.selectedGang?.id === id ? null : state.selectedGang
                }));
        },
        selectGang: (gang)=>set({
                selectedGang: gang,
                selectedObject: null,
                selectedPath: null,
                selectedConveyor: null,
                selectedPathArea: null
            }),
        toggleShowGaenge: ()=>set((state)=>({
                    showGaenge: !state.showGaenge
                })),
        // FFZ Actions
        setFFZ: (ffz)=>set({
                ffz
            }),
        // Conveyor Actions
        addConveyor: (conveyor)=>{
            get().pushSnapshot();
            const id = get().conveyorIdCounter;
            const newConveyor = {
                ...conveyor,
                id
            };
            set((state)=>({
                    conveyors: [
                        ...state.conveyors,
                        newConveyor
                    ],
                    conveyorIdCounter: state.conveyorIdCounter + 1
                }));
            return newConveyor;
        },
        updateConveyor: (id, updates)=>set((state)=>{
                const updatedConveyors = state.conveyors.map((c)=>c.id === id ? {
                        ...c,
                        ...updates
                    } : c);
                return {
                    conveyors: updatedConveyors,
                    selectedConveyor: state.selectedConveyor?.id === id ? {
                        ...state.selectedConveyor,
                        ...updates
                    } : state.selectedConveyor
                };
            }),
        deleteConveyor: (id)=>{
            get().pushSnapshot();
            set((state)=>({
                    conveyors: state.conveyors.filter((c)=>c.id !== id),
                    selectedConveyor: state.selectedConveyor?.id === id ? null : state.selectedConveyor
                }));
        },
        selectConveyor: (conveyor)=>set({
                selectedConveyor: conveyor,
                selectedObject: null,
                selectedPath: null,
                selectedGang: null,
                selectedPathArea: null
            }),
        // View Actions
        setZoom: (zoom)=>set({
                zoom: Math.max(0.1, Math.min(5, zoom))
            }),
        setPan: (pan)=>set({
                pan
            }),
        setTool: (tool)=>set({
                currentTool: tool
            }),
        toggleGrid: ()=>set((state)=>({
                    showGrid: !state.showGrid
                })),
        toggleSnap: ()=>set((state)=>({
                    snapToGrid: !state.snapToGrid
                })),
        // Project Actions
        saveVorher: (snapshot, screenshot)=>set((state)=>({
                    projektVergleich: {
                        ...state.projektVergleich,
                        vorher: snapshot,
                        vorherScreenshot: screenshot
                    }
                })),
        saveNachher: (snapshot, screenshot)=>set((state)=>({
                    projektVergleich: {
                        ...state.projektVergleich,
                        nachher: snapshot,
                        nachherScreenshot: screenshot
                    }
                })),
        loadSnapshot: (type)=>{
            const snapshot = get().projektVergleich[type];
            if (!snapshot) return;
            set({
                halls: JSON.parse(JSON.stringify(snapshot.halls)),
                objects: JSON.parse(JSON.stringify(snapshot.objects)),
                paths: JSON.parse(JSON.stringify(snapshot.paths)),
                pathAreas: JSON.parse(JSON.stringify(snapshot.pathAreas)),
                gaenge: JSON.parse(JSON.stringify(snapshot.gaenge)),
                ffz: JSON.parse(JSON.stringify(snapshot.ffz)),
                conveyors: JSON.parse(JSON.stringify(snapshot.conveyors))
            });
        },
        // Bulk Actions
        resetState: ()=>set({
                ...initialState,
                undoStack: [],
                redoStack: [],
                originalLayout: null
            }),
        loadState: (newState)=>set((state)=>({
                    ...state,
                    ...newState
                }))
    }));
const useObjects = ()=>useTopisStore((state)=>state.objects);
const useSelectedObject = ()=>useTopisStore((state)=>state.selectedObject);
const useHalls = ()=>useTopisStore((state)=>state.halls);
const useActiveHall = ()=>useTopisStore((state)=>state.halls.find((h)=>h.id === state.activeHallId) || state.halls[0]);
const useTool = ()=>useTopisStore((state)=>state.currentTool);
const useZoom = ()=>useTopisStore((state)=>state.zoom);
const usePan = ()=>useTopisStore((state)=>state.pan);
const useSelectedGang = ()=>useTopisStore((state)=>state.selectedGang);
const useSelectedPathArea = ()=>useTopisStore((state)=>state.selectedPathArea);
const useSelectedConveyor = ()=>useTopisStore((state)=>state.selectedConveyor);
}),
"[project]/src/lib/data/referenzhallen.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Referenzhalle für Benchmarking.
 * Daten aus realen ROTH-Beratungsprojekten.
 */ __turbopack_context__.s([
    "REFERENZHALLEN",
    ()=>REFERENZHALLEN
]);
const REFERENZHALLEN = [
    {
        id: 'as_gersthofen',
        name: 'Andreas Schmid',
        standort: 'Gersthofen (Halle 6)',
        typ: 'se',
        flaecheQm: 6334,
        tore: 85,
        colliProTag: 15000,
        minProColli: {
            entlader: 0.829,
            scanner: 0.336,
            verteiler: 0.752
        },
        minProColliGesamt: 1.917,
        verteilwegM: 138.8,
        fte: 54.5,
        jahr: 2019
    },
    {
        id: 'geis_nuernberg',
        name: 'Geis',
        standort: 'Nürnberg',
        typ: 'se',
        flaecheQm: 4200,
        tore: 52,
        colliProTag: 12000,
        minProColli: {
            entlader: 0.75,
            scanner: 0.30,
            verteiler: 0.68
        },
        minProColliGesamt: 1.73,
        verteilwegM: 112.0,
        fte: 39.3,
        jahr: 2020
    },
    {
        id: 'rhenus_mannheim',
        name: 'Rhenus',
        standort: 'Mannheim',
        typ: 'se',
        flaecheQm: 5800,
        tore: 68,
        colliProTag: 18000,
        minProColli: {
            entlader: 0.78,
            scanner: 0.32,
            verteiler: 0.85
        },
        minProColliGesamt: 1.95,
        verteilwegM: 155.0,
        fte: 66.3,
        jahr: 2021
    },
    {
        id: 'noerpel_ulm',
        name: 'Noerpel',
        standort: 'Ulm',
        typ: 'se',
        flaecheQm: 3500,
        tore: 40,
        colliProTag: 8000,
        minProColli: {
            entlader: 0.72,
            scanner: 0.28,
            verteiler: 0.62
        },
        minProColliGesamt: 1.62,
        verteilwegM: 95.0,
        fte: 24.5,
        jahr: 2019
    },
    {
        id: 'ids_hub_sued',
        name: 'IDS Hub Süd',
        standort: 'Augsburg',
        typ: 'se_sa_kombi',
        flaecheQm: 7200,
        tore: 96,
        colliProTag: 22000,
        minProColli: {
            entlader: 0.82,
            scanner: 0.35,
            verteiler: 0.90,
            belader: 0.12
        },
        minProColliGesamt: 2.19,
        verteilwegM: 168.0,
        fte: 91.1,
        jahr: 2022
    },
    {
        id: 'pml_kiel',
        name: 'PML',
        standort: 'Kiel',
        typ: 'se',
        flaecheQm: 2800,
        tore: 32,
        colliProTag: 6000,
        minProColli: {
            entlader: 0.70,
            scanner: 0.30,
            verteiler: 0.58
        },
        minProColliGesamt: 1.58,
        verteilwegM: 82.0,
        fte: 17.9,
        jahr: 2020
    },
    {
        id: 'tlt_hamburg',
        name: 'TLT',
        standort: 'Hamburg',
        typ: 'se',
        flaecheQm: 4800,
        tore: 58,
        colliProTag: 14000,
        minProColli: {
            entlader: 0.80,
            scanner: 0.33,
            verteiler: 0.78
        },
        minProColliGesamt: 1.91,
        verteilwegM: 130.0,
        fte: 50.6,
        jahr: 2021
    },
    {
        id: 'hellmann_osnabrueck',
        name: 'Hellmann',
        standort: 'Osnabrück',
        typ: 'se_sa_kombi',
        flaecheQm: 6000,
        tore: 72,
        colliProTag: 16000,
        minProColli: {
            entlader: 0.76,
            scanner: 0.31,
            verteiler: 0.72,
            belader: 0.10
        },
        minProColliGesamt: 1.89,
        verteilwegM: 125.0,
        fte: 57.2,
        jahr: 2022
    }
];
}),
"[project]/src/lib/benchmarking.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "berechneBenchmark",
    ()=>berechneBenchmark
]);
function berechneBenchmark(ergebnis, verteilwegM, referenzHallen, halleName = 'Aktuelle Halle') {
    // Aktuelle Abteilungswerte aus Ergebnis
    const aktuelleAbteilungen = {};
    ergebnis.abteilungen.forEach((a)=>{
        aktuelleAbteilungen[a.abteilung] = a.minProColli;
    });
    const aktuell = {
        minProColliGesamt: ergebnis.minProColli,
        abteilungen: aktuelleAbteilungen,
        verteilwegM,
        colliProTag: ergebnis.colliProTag,
        fte: ergebnis.fte
    };
    // Abteilungs-IDs aus dem Ergebnis ableiten
    const abteilungIds = ergebnis.abteilungen.map((a)=>a.abteilung);
    // Rankings pro Abteilung
    const rankings = abteilungIds.map((abtId)=>{
        const abtErgebnis = ergebnis.abteilungen.find((a)=>a.abteilung === abtId);
        const werte = referenzHallen.filter((h)=>h.minProColli[abtId] !== undefined && h.minProColli[abtId] > 0).map((h)=>({
                name: h.name,
                wert: h.minProColli[abtId]
            }));
        werte.push({
            name: halleName,
            wert: aktuelleAbteilungen[abtId] || 0
        });
        // Sortiere nach Wert aufsteigend (weniger = besser)
        werte.sort((a, b)=>a.wert - b.wert);
        const rang = werte.findIndex((w)=>w.name === halleName) + 1;
        const bester = werte[0];
        const schlechtester = werte[werte.length - 1];
        return {
            abteilung: abtId,
            label: abtErgebnis.label,
            rang,
            wert: aktuelleAbteilungen[abtId] || 0,
            bester,
            schlechtester
        };
    });
    // Gesamt-Ranking
    const gesamtWerte = referenzHallen.map((h)=>({
            name: h.name,
            standort: h.standort,
            wert: h.minProColliGesamt
        }));
    gesamtWerte.push({
        name: halleName,
        standort: '',
        wert: ergebnis.minProColli
    });
    gesamtWerte.sort((a, b)=>a.wert - b.wert);
    const gesamtRanking = gesamtWerte.findIndex((w)=>w.name === halleName) + 1;
    // Deltas zum Besten
    const deltas = rankings.map((r)=>{
        const delta = r.wert - r.bester.wert;
        const deltaProzent = r.bester.wert > 0 ? delta / r.bester.wert * 100 : 0;
        const einsparMinProColli = delta;
        const einsparMinProTag = einsparMinProColli * ergebnis.colliProTag;
        const einsparStundenProTag = einsparMinProTag / (ergebnis.arbeitsminProStunde || 52.9);
        return {
            abteilung: r.abteilung,
            label: r.label,
            delta,
            deltaProzent,
            potential: delta > 0.001 ? `${einsparStundenProTag.toFixed(1)} MA-Stunden/Tag einsparbar` : 'Bereits Benchmark-Level'
        };
    });
    // Hallen-Ranking
    const hallenRanking = gesamtWerte.map((w)=>({
            name: w.name,
            standort: w.standort,
            minProColliGesamt: w.wert,
            isAktuell: w.name === halleName
        }));
    return {
        aktuell,
        rankings,
        gesamtRanking,
        anzahlHallen: gesamtWerte.length,
        deltas,
        hallenRanking
    };
}
}),
"[project]/src/lib/flaechenrechner.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "berechneFlaechenbedarf",
    ()=>berechneFlaechenbedarf
]);
/** Standard-Faktor: 1.25 Colli pro qm Stellfläche */ const DEFAULT_COLLI_PRO_QM = 1.25;
function berechneFlaechenbedarf(records, relationZuordnungen, objects, colliProQm = DEFAULT_COLLI_PRO_QM) {
    // Arbeitstage ermitteln
    const daten = [
        ...new Set(records.map((r)=>r.scandatum).filter(Boolean))
    ];
    const arbeitstage = Math.max(daten.length, 1);
    // Gruppiere nach Relation
    const relationGroups = new Map();
    records.forEach((r)=>{
        const rel = r.ausgangsrelation || 'OHNE_RELATION';
        if (!relationGroups.has(rel)) relationGroups.set(rel, []);
        relationGroups.get(rel).push(r);
    });
    const ergebnisse = [];
    let gesamtBenoetigtQm = 0;
    let gesamtVerfuegbarQm = 0;
    relationGroups.forEach((recs, relation)=>{
        const totalColli = recs.reduce((s, r)=>s + r.colli, 0);
        const totalSendungen = recs.reduce((s, r)=>s + r.sendungen, 0);
        const totalGewicht = recs.reduce((s, r)=>s + r.gewicht, 0);
        const colliProTag = totalColli / arbeitstage;
        const benoetigtQm = colliProTag / colliProQm;
        // Verfügbare Fläche aus Zuordnung oder Layout-Objekt
        const zuordnung = relationZuordnungen.find((z)=>z.relationKey === relation);
        let verfuegbarQm = zuordnung?.flaecheQm || 0;
        if (verfuegbarQm === 0 && zuordnung?.objectId) {
            const obj = objects.find((o)=>o.id === zuordnung.objectId);
            if (obj) {
                verfuegbarQm = obj.width * obj.height; // Fläche aus Objektgröße
            }
        }
        const deltaQm = verfuegbarQm - benoetigtQm;
        const auslastung = verfuegbarQm > 0 ? benoetigtQm / verfuegbarQm : 0;
        let status = 'unbekannt';
        if (verfuegbarQm > 0) {
            if (auslastung <= 0.8) status = 'ok';
            else if (auslastung <= 1.0) status = 'knapp';
            else status = 'ueberlastet';
        }
        ergebnisse.push({
            relation,
            objectId: zuordnung?.objectId || null,
            objectName: zuordnung?.objectName || relation,
            colliProTag,
            sendungenProTag: totalSendungen / arbeitstage,
            gewichtProTag: totalGewicht / arbeitstage,
            benoetigtQm,
            verfuegbarQm,
            deltaQm,
            auslastung,
            status
        });
        gesamtBenoetigtQm += benoetigtQm;
        gesamtVerfuegbarQm += verfuegbarQm;
    });
    // Sortiere nach Colli absteigend
    ergebnisse.sort((a, b)=>b.colliProTag - a.colliProTag);
    return {
        gesamtBenoetigtQm,
        gesamtVerfuegbarQm,
        ergebnisse,
        colliProQm
    };
}
}),
"[project]/src/lib/pathfinding.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildGangGraph",
    ()=>buildGangGraph,
    "calculateRouteDistance",
    ()=>calculateRouteDistance,
    "findPath",
    ()=>findPath,
    "findPathBetweenObjects",
    ()=>findPathBetweenObjects,
    "isPointInGang",
    ()=>isPointInGang
]);
function buildGangGraph(gaenge, ffz) {
    if (gaenge.length === 0) return {
        nodes: [],
        edges: [],
        gaenge: []
    };
    // Filter corridors passable by the vehicle type
    const passableGaenge = ffz ? gaenge.filter((g)=>g.breite >= ffz.mindestBreite) : gaenge;
    if (passableGaenge.length === 0) return {
        nodes: [],
        edges: [],
        gaenge: []
    };
    const nodes = [];
    const edges = [];
    let nodeId = 0;
    // Create nodes from corridor endpoints
    passableGaenge.forEach((gang)=>{
        gang.points.forEach((point)=>{
            // Check if node already exists at this position (within tolerance)
            const existingNode = nodes.find((n)=>Math.abs(n.x - point.x) < 0.5 && Math.abs(n.y - point.y) < 0.5);
            if (!existingNode) {
                nodes.push({
                    x: point.x,
                    y: point.y,
                    gangId: gang.id,
                    id: nodeId++
                });
            }
        });
    });
    // Create edges within each corridor
    passableGaenge.forEach((gang)=>{
        for(let i = 0; i < gang.points.length - 1; i++){
            const p1 = gang.points[i];
            const p2 = gang.points[i + 1];
            const node1 = nodes.find((n)=>Math.abs(n.x - p1.x) < 0.5 && Math.abs(n.y - p1.y) < 0.5);
            const node2 = nodes.find((n)=>Math.abs(n.x - p2.x) < 0.5 && Math.abs(n.y - p2.y) < 0.5);
            if (node1 && node2) {
                const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
                edges.push({
                    from: node1.id,
                    to: node2.id,
                    distance,
                    gangId: gang.id
                });
                edges.push({
                    from: node2.id,
                    to: node1.id,
                    distance,
                    gangId: gang.id
                });
            }
        }
    });
    // Find intersections between corridors and add connections
    for(let i = 0; i < passableGaenge.length; i++){
        for(let j = i + 1; j < passableGaenge.length; j++){
            const intersections = findGangIntersections(passableGaenge[i], passableGaenge[j]);
            intersections.forEach((intersection)=>{
                // Add intersection as a node if not exists
                let intersectionNode = nodes.find((n)=>Math.abs(n.x - intersection.x) < 0.5 && Math.abs(n.y - intersection.y) < 0.5);
                if (!intersectionNode) {
                    intersectionNode = {
                        x: intersection.x,
                        y: intersection.y,
                        gangId: passableGaenge[i].id,
                        id: nodeId++
                    };
                    nodes.push(intersectionNode);
                }
            });
        }
    }
    return {
        nodes,
        edges,
        gaenge: passableGaenge
    };
}
/**
 * Find intersection points between two corridors
 */ function findGangIntersections(gang1, gang2) {
    const intersections = [];
    for(let i = 0; i < gang1.points.length - 1; i++){
        for(let j = 0; j < gang2.points.length - 1; j++){
            const p1 = gang1.points[i], p2 = gang1.points[i + 1];
            const p3 = gang2.points[j], p4 = gang2.points[j + 1];
            const intersection = lineIntersection(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
            if (intersection) {
                intersections.push(intersection);
            }
        }
    }
    return intersections;
}
/**
 * Calculate intersection point of two line segments
 */ function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.0001) return null; // Parallel lines
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }
    return null;
}
/**
 * Find nearest node in graph to a given point
 */ function findNearestNode(x, y, graph) {
    let nearest = null;
    let minDist = Infinity;
    graph.nodes.forEach((node)=>{
        const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        if (dist < minDist) {
            minDist = dist;
            nearest = node;
        }
    });
    return nearest;
}
function findPath(startX, startY, endX, endY, graph, ffz) {
    if (graph.nodes.length === 0) return null;
    // Find nearest nodes to start and end points
    const startNode = findNearestNode(startX, startY, graph);
    const endNode = findNearestNode(endX, endY, graph);
    if (!startNode || !endNode) return null;
    // A* implementation
    const openSet = new Set([
        startNode.id
    ]);
    const cameFrom = new Map();
    const gScore = new Map();
    gScore.set(startNode.id, 0);
    const fScore = new Map();
    fScore.set(startNode.id, heuristic(startNode, endNode));
    const gangUsage = new Map();
    gangUsage.set(startNode.id, new Set([
        startNode.gangId
    ]));
    while(openSet.size > 0){
        // Get node with lowest fScore
        let current = -1;
        let lowestF = Infinity;
        openSet.forEach((nodeId)=>{
            const f = fScore.get(nodeId) ?? Infinity;
            if (f < lowestF) {
                lowestF = f;
                current = nodeId;
            }
        });
        if (current === endNode.id) {
            // Reconstruct path
            const path = reconstructPath(cameFrom, current, graph.nodes);
            const usedGangs = Array.from(gangUsage.get(current) || new Set());
            const distance = gScore.get(current) || 0;
            // Calculate time based on FFZ speed
            const speed = ffz?.geschwindigkeit || 10; // km/h
            const speedMs = speed * 1000 / 3600; // m/s
            const time = distance / speedMs;
            return {
                path,
                distance,
                time,
                usedGangs
            };
        }
        openSet.delete(current);
        // Get neighbors
        const neighbors = graph.edges.filter((e)=>e.from === current).map((e)=>({
                nodeId: e.to,
                distance: e.distance,
                gangId: e.gangId
            }));
        neighbors.forEach(({ nodeId, distance, gangId })=>{
            const tentativeG = (gScore.get(current) ?? Infinity) + distance;
            if (tentativeG < (gScore.get(nodeId) ?? Infinity)) {
                cameFrom.set(nodeId, current);
                gScore.set(nodeId, tentativeG);
                const node = graph.nodes.find((n)=>n.id === nodeId);
                if (node) {
                    fScore.set(nodeId, tentativeG + heuristic(node, endNode));
                }
                // Track used corridors
                const currentGangs = gangUsage.get(current) || new Set();
                const newGangs = new Set(currentGangs);
                newGangs.add(gangId);
                gangUsage.set(nodeId, newGangs);
                openSet.add(nodeId);
            }
        });
    }
    // No path found
    return null;
}
/**
 * Heuristic function (Euclidean distance)
 */ function heuristic(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
/**
 * Reconstruct path from A* result
 */ function reconstructPath(cameFrom, current, nodes) {
    const path = [];
    let node = nodes.find((n)=>n.id === current);
    while(node){
        path.unshift({
            x: node.x,
            y: node.y
        });
        const prevId = cameFrom.get(node.id);
        if (prevId === undefined) break;
        node = nodes.find((n)=>n.id === prevId);
    }
    return path;
}
function isPointInGang(x, y, gang) {
    const halfWidth = gang.breite / 2;
    for(let i = 0; i < gang.points.length - 1; i++){
        const p1 = gang.points[i];
        const p2 = gang.points[i + 1];
        // Calculate perpendicular distance to line segment
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) continue;
        // Projection of point onto line
        const t = Math.max(0, Math.min(1, ((x - p1.x) * dx + (y - p1.y) * dy) / (length * length)));
        const projX = p1.x + t * dx;
        const projY = p1.y + t * dy;
        const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);
        if (dist <= halfWidth) {
            return true;
        }
    }
    return false;
}
function findPathBetweenObjects(obj1, obj2, gaenge, ffz) {
    const graph = buildGangGraph(gaenge, ffz);
    // Use center points of objects
    const start = {
        x: obj1.x + obj1.width / 2,
        y: obj1.y + obj1.height / 2
    };
    const end = {
        x: obj2.x + obj2.width / 2,
        y: obj2.y + obj2.height / 2
    };
    return findPath(start.x, start.y, end.x, end.y, graph, ffz);
}
function calculateRouteDistance(objects, gaenge, ffz) {
    if (objects.length < 2) {
        return {
            totalDistance: 0,
            totalTime: 0,
            paths: []
        };
    }
    const graph = buildGangGraph(gaenge, ffz);
    const paths = [];
    let totalDistance = 0;
    let totalTime = 0;
    for(let i = 0; i < objects.length - 1; i++){
        const result = findPathBetweenObjects(objects[i], objects[i + 1], gaenge, ffz);
        if (result) {
            paths.push(result);
            totalDistance += result.distance;
            totalTime += result.time;
            // Add pickup/dropoff time for FFZ
            if (ffz && i > 0) {
                totalTime += ffz.aufnahmeZeit + ffz.abgabeZeit;
            }
        }
    }
    return {
        totalDistance,
        totalTime,
        paths
    };
}
}),
"[project]/src/lib/verteilweg-rechner.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "berechneDistanzMitCache",
    ()=>berechneDistanzMitCache,
    "berechneGewichtetenVerteilweg",
    ()=>berechneGewichtetenVerteilweg,
    "clearDistanzCache",
    ()=>clearDistanzCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pathfinding.ts [app-ssr] (ecmascript)");
;
/** Distanz-Cache für wiederholte Queries (gleiche Paare ändern sich nicht) */ const distanzCache = new Map();
function getCacheKey(fromId, toId) {
    return `${fromId}->${toId}`;
}
function clearDistanzCache() {
    distanzCache.clear();
}
function berechneDistanzMitCache(from, to, gaenge, ffz) {
    const key = getCacheKey(from.id, to.id);
    const cached = distanzCache.get(key);
    if (cached !== undefined) return cached;
    const graph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["buildGangGraph"])(gaenge, ffz);
    const fromCenter = {
        x: from.x + from.width / 2,
        y: from.y + from.height / 2
    };
    const toCenter = {
        x: to.x + to.width / 2,
        y: to.y + to.height / 2
    };
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findPath"])(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y, graph, ffz);
    // Fallback: Luftlinie wenn kein Gang-Pfad
    const distanz = result ? result.distance : Math.sqrt((toCenter.x - fromCenter.x) ** 2 + (toCenter.y - fromCenter.y) ** 2);
    distanzCache.set(key, distanz);
    return distanz;
}
function berechneGewichtetenVerteilweg(records, torZuordnungen, relationZuordnungen, objects, gaenge, ffz) {
    const ergebnisse = [];
    let gesamtDistanzColli = 0;
    let gesamtColli = 0;
    // Gruppiere Records nach Stellplatz
    const stellplatzGroups = new Map();
    records.forEach((r)=>{
        if (!r.stellplatz) return;
        if (!stellplatzGroups.has(r.stellplatz)) stellplatzGroups.set(r.stellplatz, []);
        stellplatzGroups.get(r.stellplatz).push(r);
    });
    stellplatzGroups.forEach((recs, stellplatzKey)=>{
        const torZuordnung = torZuordnungen.find((z)=>z.stellplatzKey === stellplatzKey);
        if (!torZuordnung || !torZuordnung.objectId) return;
        const torObj = objects.find((o)=>o.id === torZuordnung.objectId);
        if (!torObj) return;
        // Gruppiere nach Relation
        const relationGroups = new Map();
        recs.forEach((r)=>{
            const rel = r.ausgangsrelation || 'UNBEKANNT';
            relationGroups.set(rel, (relationGroups.get(rel) || 0) + r.colli);
        });
        const wege = [];
        let stellplatzDistanzColli = 0;
        let stellplatzColli = 0;
        relationGroups.forEach((colli, relation)=>{
            // Finde Ziel-Bereich
            const relZuordnung = relationZuordnungen.find((z)=>z.relationKey === relation);
            let distanzM = 0;
            if (relZuordnung?.objectId) {
                const zielObj = objects.find((o)=>o.id === relZuordnung.objectId);
                if (zielObj) {
                    distanzM = berechneDistanzMitCache(torObj, zielObj, gaenge, ffz);
                }
            }
            // Wenn kein Ziel zugeordnet → Schätzung basierend auf Hallengröße
            if (distanzM === 0 && objects.length > 0) {
                // Fallback: Median-Distanz aller Objekte zum Tor (grobe Schätzung)
                distanzM = 50; // Default 50m wenn nichts berechenbar
            }
            wege.push({
                relation,
                distanzM,
                colli
            });
            stellplatzDistanzColli += distanzM * colli;
            stellplatzColli += colli;
        });
        const gewichteterWeg = stellplatzColli > 0 ? stellplatzDistanzColli / stellplatzColli : 0;
        ergebnisse.push({
            stellplatzKey,
            objectId: torZuordnung.objectId,
            objectName: torObj.name || stellplatzKey,
            gewichteterWegM: gewichteterWeg,
            colliGesamt: stellplatzColli,
            wege
        });
        gesamtDistanzColli += stellplatzDistanzColli;
        gesamtColli += stellplatzColli;
    });
    return {
        gesamtGewichteterWegM: gesamtColli > 0 ? gesamtDistanzColli / gesamtColli : 0,
        gesamtColli,
        ergebnisse
    };
}
}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/src/components/ui/scroll-area.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScrollArea",
    ()=>ScrollArea,
    "ScrollBar",
    ()=>ScrollBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-scroll-area/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function ScrollArea({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "scroll-area",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("relative", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"], {
                "data-slot": "scroll-area-viewport",
                className: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrollBar, {}, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Corner"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/scroll-area.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
function ScrollBar({ className, orientation = "vertical", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"], {
        "data-slot": "scroll-area-scrollbar",
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex touch-none p-px transition-colors select-none", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollAreaThumb"], {
            "data-slot": "scroll-area-thumb",
            className: "bg-border relative flex-1 rounded-full"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/scroll-area.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/scroll-area.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9",
            "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
            "icon-sm": "size-8",
            "icon-lg": "size-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        "data-variant": variant,
        "data-size": size,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/app/(editor)/dashboard/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$KPICard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/KPICard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$StundenChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/StundenChart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$AbteilungsChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/AbteilungsChart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$BenchmarkRadar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/BenchmarkRadar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/betriebsdaten-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessmodell$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prozessmodell-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$referenzhallen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/referenzhallen.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$benchmarking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/benchmarking.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$flaechenrechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/flaechenrechner.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$verteilweg$2d$rechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/verteilweg-rechner.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/scroll-area.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-ssr] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$route$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Route$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/route.js [app-ssr] (ecmascript) <export default as Route>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-ssr] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareStack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-stack.js [app-ssr] (ecmascript) <export default as SquareStack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function DashboardPage() {
    const analyse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.analyse);
    const scandatenRecords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.scandatenRecords);
    const stundenAggregation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.stundenAggregation);
    const torZuordnungen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.torZuordnungen);
    const relationZuordnungen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.relationZuordnungen);
    const objects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTopisStore"])((s)=>s.objects);
    const gaenge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTopisStore"])((s)=>s.gaenge);
    const modell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessmodell$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProzessmodellStore"])((s)=>s.modell);
    const ergebnis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessmodell$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProzessmodellStore"])((s)=>s.ergebnis);
    const parameter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessmodell$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProzessmodellStore"])((s)=>s.parameter);
    const berechne = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessmodell$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProzessmodellStore"])((s)=>s.berechne);
    // Auto-Berechnung
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!ergebnis) berechne();
    }, [
        ergebnis,
        berechne
    ]);
    const verteilwegParam = parameter.find((p)=>p.id === 'verteilweg');
    const verteilwegM = verteilwegParam?.aktuellerWert || 0;
    const arbeitsminProStunde = ergebnis?.arbeitsminProStunde || parameter.find((p)=>p.id === 'arbeitsminProStunde')?.aktuellerWert || 52.9;
    // Benchmark
    const benchmark = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!ergebnis) return null;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$benchmarking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["berechneBenchmark"])(ergebnis, verteilwegM, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$referenzhallen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REFERENZHALLEN"]);
    }, [
        ergebnis,
        verteilwegM
    ]);
    // Flächenbedarf — colliProQm aus Parameter
    const colliProQmParam = parameter.find((p)=>p.id === 'colliProQm');
    const colliProQm = colliProQmParam?.aktuellerWert || 1.25;
    const flaechenAnalyse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (scandatenRecords.length === 0) return null;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$flaechenrechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["berechneFlaechenbedarf"])(scandatenRecords, relationZuordnungen, objects, colliProQm);
    }, [
        scandatenRecords,
        relationZuordnungen,
        objects,
        colliProQm
    ]);
    // Verteilweg
    const verteilwegAnalyse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (scandatenRecords.length === 0 || torZuordnungen.length === 0) return null;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$verteilweg$2d$rechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["berechneGewichtetenVerteilweg"])(scandatenRecords, torZuordnungen, relationZuordnungen, objects, gaenge);
    }, [
        scandatenRecords,
        torZuordnungen,
        relationZuordnungen,
        objects,
        gaenge
    ]);
    // Stunden-Daten für Chart
    const stundenChartData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const arbeitstage = Math.max([
            ...new Set(scandatenRecords.map((r)=>r.scandatum).filter(Boolean))
        ].length, 1);
        return stundenAggregation.filter((a)=>a.colli > 0).map((a)=>({
                stunde: a.stunde,
                soll: ergebnis ? a.colli / arbeitstage * ergebnis.minProColli / arbeitsminProStunde : 0,
                ist: 0,
                colli: a.colli / arbeitstage
            }));
    }, [
        stundenAggregation,
        scandatenRecords,
        ergebnis,
        arbeitsminProStunde
    ]);
    // Benchmark Radar data
    const benchmarkRadarData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!benchmark) return null;
        const bestValues = {};
        benchmark.rankings.forEach((r)=>{
            bestValues[r.abteilung] = r.bester.wert;
        });
        return {
            aktuell: benchmark.aktuell.abteilungen,
            benchmark: bestValues
        };
    }, [
        benchmark
    ]);
    // Colli pro MA-Stunde
    const colliProMAStunde = ergebnis && ergebnis.maStundenBedarf > 0 ? Math.round(ergebnis.colliProTag / ergebnis.maStundenBedarf) : 0;
    const hasData = analyse && analyse.objektMetriken.length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen flex flex-col bg-background overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 px-4 py-2 border-b bg-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/topis-saas/projekt",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            size: "sm",
                            className: "gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                "Editor"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-6 w-px bg-border"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-sm font-bold flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 113,
                                columnNumber: 11
                            }, this),
                            "TOPIS Dashboard"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    analyse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-muted-foreground",
                        children: [
                            analyse.zeitraum.von,
                            " — ",
                            analyse.zeitraum.bis,
                            " | ",
                            analyse.arbeitstage,
                            " Arbeitstage"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ScrollArea"], {
                className: "flex-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 space-y-4 max-w-[1400px] mx-auto",
                    children: !hasData && !ergebnis ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center text-muted-foreground py-20",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                className: "h-12 w-12 mx-auto mb-4 opacity-30"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 127,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-medium",
                                children: "Noch keine Daten"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 128,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm mt-1",
                                children: "Importiere Betriebsdaten und berechne das Prozessmodell im Editor."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 129,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/topis-saas/projekt",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                    className: "mt-4",
                                    size: "sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                            className: "h-4 w-4 mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                            lineNumber: 134,
                                            columnNumber: 19
                                        }, this),
                                        "Zum Editor"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                    lineNumber: 133,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 132,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                        lineNumber: 126,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-4 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$KPICard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KPICard"], {
                                        title: "Min / Colli",
                                        value: ergebnis ? ergebnis.minProColli.toFixed(3) : '-',
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                            lineNumber: 146,
                                            columnNumber: 25
                                        }, void 0),
                                        highlight: true,
                                        details: ergebnis?.abteilungen.map((a)=>({
                                                label: a.label,
                                                value: `${a.minProColli.toFixed(3)} (${Math.round(a.anteilGesamt * 100)}%)`
                                            }))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 143,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$KPICard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KPICard"], {
                                        title: "Colli / MA-Stunde",
                                        value: colliProMAStunde ? colliProMAStunde.toString() : '-',
                                        subtitle: "Produktivität",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                            lineNumber: 157,
                                            columnNumber: 25
                                        }, void 0),
                                        details: [
                                            {
                                                label: 'Colli/Tag',
                                                value: ergebnis?.colliProTag.toLocaleString('de-DE') || '-'
                                            },
                                            {
                                                label: 'MA-Std/Tag',
                                                value: ergebnis ? Math.round(ergebnis.maStundenBedarf).toString() : '-'
                                            }
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 153,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$KPICard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KPICard"], {
                                        title: "FTE-Bedarf",
                                        value: ergebnis ? ergebnis.fte.toFixed(1) : '-',
                                        subtitle: ergebnis ? `${Math.round(ergebnis.maStundenBedarf)} MA-Stunden/Tag` : '',
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                            lineNumber: 167,
                                            columnNumber: 25
                                        }, void 0)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 163,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$KPICard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KPICard"], {
                                        title: "Ø Verteilweg",
                                        value: verteilwegAnalyse ? `${verteilwegAnalyse.gesamtGewichteterWegM.toFixed(1)} m` : verteilwegM > 0 ? `${verteilwegM.toFixed(1)} m` : '-',
                                        subtitle: "Colli-gewichtet",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$route$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Route$3e$__["Route"], {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                            lineNumber: 179,
                                            columnNumber: 25
                                        }, void 0),
                                        details: verteilwegAnalyse ? [
                                            {
                                                label: 'Stellplätze',
                                                value: verteilwegAnalyse.ergebnisse.length.toString()
                                            },
                                            {
                                                label: 'Gesamt Colli',
                                                value: Math.round(verteilwegAnalyse.gesamtColli).toLocaleString('de-DE')
                                            }
                                        ] : undefined
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 142,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border bg-card p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2",
                                                children: "Stundenprofil (SOLL-MA)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 191,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$StundenChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StundenChart"], {
                                                data: stundenChartData,
                                                width: 500,
                                                height: 220
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 194,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 190,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border bg-card p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2",
                                                children: "Abteilungs-Breakdown (Min/Colli)"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 199,
                                                columnNumber: 19
                                            }, this),
                                            ergebnis ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$AbteilungsChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AbteilungsChart"], {
                                                abteilungen: ergebnis.abteilungen,
                                                width: 400,
                                                height: 200
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 203,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center text-muted-foreground py-12 text-sm",
                                                children: "Prozessmodell berechnen"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 205,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 198,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 188,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border bg-card p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$stack$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SquareStack$3e$__["SquareStack"], {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                        lineNumber: 217,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Flächenbedarf (Top 10 Relationen)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 216,
                                                columnNumber: 19
                                            }, this),
                                            flaechenAnalyse ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "max-h-[200px] overflow-y-auto",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                    className: "w-full text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                            className: "bg-muted sticky top-0",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                        className: "text-left p-1.5 font-medium",
                                                                        children: "Relation"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                        lineNumber: 225,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                        className: "text-right p-1.5 font-medium",
                                                                        children: "Cll/Tag"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                        lineNumber: 226,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                        className: "text-right p-1.5 font-medium",
                                                                        children: "Bedarf qm"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                        lineNumber: 227,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                        className: "text-center p-1.5 font-medium",
                                                                        children: "Status"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                        lineNumber: 228,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                lineNumber: 224,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                            lineNumber: 223,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                            children: flaechenAnalyse.ergebnisse.slice(0, 10).map((e)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                    className: "border-t",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            className: "p-1.5",
                                                                            children: e.relation
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                            lineNumber: 234,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            className: "p-1.5 text-right",
                                                                            children: Math.round(e.colliProTag)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                            lineNumber: 235,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            className: "p-1.5 text-right",
                                                                            children: Math.round(e.benoetigtQm)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                            lineNumber: 236,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                            className: "p-1.5 text-center",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `text-[10px] px-1 py-0.5 rounded ${e.status === 'ok' ? 'bg-green-500/10 text-green-500' : e.status === 'knapp' ? 'bg-yellow-500/10 text-yellow-500' : e.status === 'ueberlastet' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'}`,
                                                                                children: e.status
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                                lineNumber: 238,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                            lineNumber: 237,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, e.relation, true, {
                                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                    lineNumber: 233,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                            lineNumber: 231,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                    lineNumber: 222,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 221,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center text-muted-foreground py-8 text-sm",
                                                children: "Keine Relationsdaten"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 258,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 215,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border bg-card p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                        lineNumber: 265,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Benchmark (vs. ",
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$referenzhallen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REFERENZHALLEN"].length,
                                                    " Referenzhallen)",
                                                    benchmark && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "ml-auto text-primary font-bold",
                                                        children: [
                                                            "Platz ",
                                                            benchmark.gesamtRanking,
                                                            "/",
                                                            benchmark.anzahlHallen
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                        lineNumber: 268,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 264,
                                                columnNumber: 19
                                            }, this),
                                            benchmarkRadarData ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$BenchmarkRadar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BenchmarkRadar"], {
                                                aktuell: benchmarkRadarData.aktuell,
                                                benchmark: benchmarkRadarData.benchmark,
                                                abteilungen: modell.abteilungen,
                                                width: 300,
                                                height: 220
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 274,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center text-muted-foreground py-8 text-sm",
                                                children: "Prozessmodell berechnen"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                lineNumber: 282,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 213,
                                columnNumber: 15
                            }, this),
                            analyse && analyse.objektMetriken.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border bg-card p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2",
                                        children: [
                                            "Tor-Detail (",
                                            analyse.objektMetriken.length,
                                            " Tore)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 290,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-h-[300px] overflow-y-auto",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "w-full text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    className: "bg-muted sticky top-0",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "text-left p-1.5 font-medium",
                                                                children: "Tor"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                lineNumber: 297,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "text-right p-1.5 font-medium",
                                                                children: "Colli/Tag"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                lineNumber: 298,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "text-right p-1.5 font-medium",
                                                                children: "Sdg/Tag"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                lineNumber: 299,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "text-right p-1.5 font-medium",
                                                                children: "Gew/Tag"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                lineNumber: 300,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "text-right p-1.5 font-medium",
                                                                children: "Auslastung"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                lineNumber: 301,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                className: "text-right p-1.5 font-medium",
                                                                children: "Fahrten"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                lineNumber: 302,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                        lineNumber: 296,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                    lineNumber: 295,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: [
                                                        ...analyse.objektMetriken
                                                    ].sort((a, b)=>b.colli - a.colli).map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            className: "border-t hover:bg-muted/50",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "p-1.5 font-medium",
                                                                    children: m.objectName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                    lineNumber: 310,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "p-1.5 text-right",
                                                                    children: Math.round(m.colli).toLocaleString('de-DE')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                    lineNumber: 311,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "p-1.5 text-right",
                                                                    children: Math.round(m.sendungen)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                    lineNumber: 312,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "p-1.5 text-right",
                                                                    children: m.gewicht >= 1000 ? `${(m.gewicht / 1000).toFixed(1)}t` : `${Math.round(m.gewicht)}kg`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                    lineNumber: 313,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "p-1.5 text-right",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: `${m.auslastung > 0.8 ? 'text-red-500' : m.auslastung > 0.5 ? 'text-yellow-500' : 'text-green-500'}`,
                                                                        children: [
                                                                            Math.round(m.auslastung * 100),
                                                                            "%"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                        lineNumber: 319,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                    lineNumber: 318,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    className: "p-1.5 text-right",
                                                                    children: Math.round(m.fahrtenProTag)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                                    lineNumber: 331,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, m.objectId, true, {
                                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                            lineNumber: 309,
                                                            columnNumber: 29
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                            lineNumber: 294,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                        lineNumber: 293,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                                lineNumber: 289,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                    lineNumber: 124,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(editor)/dashboard/page.tsx",
        lineNumber: 102,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_040c7a3b._.js.map