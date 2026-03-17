module.exports = [
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
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
"[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/lib/spaltenzuordnungen.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SPALTEN_PROFILE",
    ()=>SPALTEN_PROFILE,
    "erkenneSpaltenprofil",
    ()=>erkenneSpaltenprofil,
    "parseCsvMitProfil",
    ()=>parseCsvMitProfil,
    "parseZeileMitProfil",
    ()=>parseZeileMitProfil
]);
const SPALTEN_PROFILE = [
    {
        id: 'STANDARD',
        name: 'ROTH Standard (19 Felder)',
        beschreibung: 'Standardformat mit allen 19 Feldern',
        delimiter: ';',
        datumsformat: 'YYYY-MM-DD',
        mapping: {
            scandatum: 'scandatum',
            scanzeit: 'scanzeit',
            stellplatz: 'stellplatz',
            messpunkt: 'messpunkt',
            messpunktname: 'messpunktName',
            tour: 'tour',
            dispogebiet: 'dispogebiet',
            ausgangsrelation: 'ausgangsrelation',
            sendungen: 'sendungen',
            colli: 'colli',
            gewicht: 'gewicht',
            ladezeit: 'ladezeit',
            palette: 'palette',
            volumen: 'volumen',
            lademeter: 'lademeter',
            fahrzeugtyp: 'fahrzeugtyp',
            kundenname: 'kundenname'
        }
    },
    {
        id: 'AS_2019',
        name: 'Andreas Schmid 2019',
        beschreibung: 'SE-Scandaten Gersthofen (Stellplatz = Tor-Nr)',
        delimiter: ';',
        datumsformat: 'DD.MM.YYYY',
        mapping: {
            datum: 'scandatum',
            zeit: 'scanzeit',
            stellplatz: 'stellplatz',
            tor: 'stellplatz',
            tornummer: 'stellplatz',
            messpunkt: 'messpunkt',
            messpunktname: 'messpunktName',
            messpunkt_name: 'messpunktName',
            tour: 'tour',
            tourkz: 'tour',
            dispogebiet: 'dispogebiet',
            dispo: 'dispogebiet',
            relation: 'ausgangsrelation',
            ausgangsrelation: 'ausgangsrelation',
            ziel: 'ausgangsrelation',
            sendungen: 'sendungen',
            sdg: 'sendungen',
            colli: 'colli',
            cll: 'colli',
            gewicht: 'gewicht',
            gew: 'gewicht',
            kg: 'gewicht',
            ladezeit: 'ladezeit'
        }
    },
    {
        id: 'GEIS',
        name: 'Geis Logistik',
        beschreibung: 'Geis Scandaten-Format',
        delimiter: ';',
        datumsformat: 'DD.MM.YYYY',
        mapping: {
            scandatum: 'scandatum',
            datum: 'scandatum',
            scanzeit: 'scanzeit',
            zeit: 'scanzeit',
            tor: 'stellplatz',
            tornr: 'stellplatz',
            stellplatz: 'stellplatz',
            messpunkt: 'messpunkt',
            bezeichnung: 'messpunktName',
            route: 'tour',
            tour: 'tour',
            gebiet: 'dispogebiet',
            relation: 'ausgangsrelation',
            sendungen: 'sendungen',
            colli: 'colli',
            pakete: 'colli',
            gewicht: 'gewicht'
        }
    },
    {
        id: 'PML_KIEL',
        name: 'PML Kiel',
        beschreibung: 'PML Kiel Scandaten-Format',
        delimiter: ';',
        datumsformat: 'DD.MM.YYYY',
        mapping: {
            datum: 'scandatum',
            uhrzeit: 'scanzeit',
            tor: 'stellplatz',
            tornummer: 'stellplatz',
            linie: 'tour',
            tour: 'tour',
            gebiet: 'dispogebiet',
            relation: 'ausgangsrelation',
            sdg: 'sendungen',
            sendungen: 'sendungen',
            cll: 'colli',
            colli: 'colli',
            gew: 'gewicht',
            gewicht: 'gewicht'
        }
    },
    {
        id: 'IDS_HUB',
        name: 'IDS Hub',
        beschreibung: 'IDS Hub-Scandaten',
        delimiter: ';',
        datumsformat: 'YYYY-MM-DD',
        mapping: {
            date: 'scandatum',
            datum: 'scandatum',
            time: 'scanzeit',
            zeit: 'scanzeit',
            gate: 'stellplatz',
            tor: 'stellplatz',
            depot: 'dispogebiet',
            destination: 'ausgangsrelation',
            relation: 'ausgangsrelation',
            shipments: 'sendungen',
            sendungen: 'sendungen',
            parcels: 'colli',
            colli: 'colli',
            weight: 'gewicht',
            gewicht: 'gewicht'
        }
    },
    {
        id: 'NOERPEL',
        name: 'Noerpel',
        beschreibung: 'Noerpel Scandaten-Format',
        delimiter: ';',
        datumsformat: 'DD.MM.YYYY',
        mapping: {
            datum: 'scandatum',
            zeit: 'scanzeit',
            rampe: 'stellplatz',
            tor: 'stellplatz',
            tournr: 'tour',
            tour: 'tour',
            gebiet: 'dispogebiet',
            empfaenger: 'ausgangsrelation',
            relation: 'ausgangsrelation',
            sdg: 'sendungen',
            sendungen: 'sendungen',
            cll: 'colli',
            colli: 'colli',
            kg: 'gewicht',
            gewicht: 'gewicht',
            ldm: 'lademeter'
        }
    },
    {
        id: 'RHENUS',
        name: 'Rhenus',
        beschreibung: 'Rhenus Scandaten-Format',
        delimiter: ';',
        datumsformat: 'DD.MM.YYYY',
        mapping: {
            scandatum: 'scandatum',
            datum: 'scandatum',
            scanzeit: 'scanzeit',
            zeit: 'scanzeit',
            verladeplatz: 'stellplatz',
            tor: 'stellplatz',
            linie: 'tour',
            tour: 'tour',
            dispo: 'dispogebiet',
            richtung: 'ausgangsrelation',
            relation: 'ausgangsrelation',
            sendungen: 'sendungen',
            colli: 'colli',
            gewicht: 'gewicht'
        }
    },
    {
        id: 'TLT',
        name: 'TLT',
        beschreibung: 'TLT Scandaten-Format',
        delimiter: ';',
        datumsformat: 'DD.MM.YYYY',
        mapping: {
            tag: 'scandatum',
            datum: 'scandatum',
            uhr: 'scanzeit',
            zeit: 'scanzeit',
            platz: 'stellplatz',
            tor: 'stellplatz',
            fahrt: 'tour',
            tour: 'tour',
            zielgebiet: 'dispogebiet',
            ziel: 'ausgangsrelation',
            relation: 'ausgangsrelation',
            sdg: 'sendungen',
            sendungen: 'sendungen',
            stk: 'colli',
            colli: 'colli',
            kg: 'gewicht',
            gewicht: 'gewicht'
        }
    }
];
function erkenneSpaltenprofil(csvHeaders) {
    const normalizedHeaders = csvHeaders.map((h)=>h.trim().toLowerCase());
    let bestMatch = null;
    let bestScore = 0;
    for (const profil of SPALTEN_PROFILE){
        const profilKeys = Object.keys(profil.mapping).map((k)=>k.toLowerCase());
        const matchCount = normalizedHeaders.filter((h)=>profilKeys.includes(h)).length;
        const score = matchCount / normalizedHeaders.length;
        if (score > bestScore && matchCount >= 3) {
            bestScore = score;
            bestMatch = profil;
        }
    }
    return bestMatch;
}
function parseZeileMitProfil(cols, headers, profil, zeilenNr) {
    const normalizedHeaders = headers.map((h)=>h.trim().toLowerCase());
    const getValue = (standardFeld)=>{
        // Finde den CSV-Header, der auf dieses Standardfeld mappt
        for (const [csvKey, targetFeld] of Object.entries(profil.mapping)){
            if (targetFeld === standardFeld) {
                const idx = normalizedHeaders.indexOf(csvKey.toLowerCase());
                if (idx >= 0 && idx < cols.length) {
                    return cols[idx]?.trim() || '';
                }
            }
        }
        return '';
    };
    const datum = getValue('scandatum');
    const zeit = getValue('scanzeit');
    const stellplatz = getValue('stellplatz');
    // Mindestens Datum und Stellplatz oder Colli sollten vorhanden sein
    const colli = parseFloat(getValue('colli')) || 0;
    const sendungen = parseFloat(getValue('sendungen')) || (colli > 0 ? 1 : 0);
    if (!datum && !stellplatz && colli === 0) return null;
    // Datum normalisieren
    let normalizedDatum = datum;
    if (profil.datumsformat === 'DD.MM.YYYY' && datum.includes('.')) {
        const parts = datum.split('.');
        if (parts.length === 3) {
            normalizedDatum = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return {
        id: zeilenNr,
        scandatum: normalizedDatum,
        scanzeit: zeit,
        timestamp: new Date(`${normalizedDatum}T${zeit || '00:00:00'}`).getTime() || 0,
        stellplatz,
        messpunkt: parseInt(getValue('messpunkt')) || 0,
        messpunktName: getValue('messpunktName') || '',
        tour: getValue('tour') || '',
        dispogebiet: getValue('dispogebiet') || '',
        ausgangsrelation: getValue('ausgangsrelation') || '',
        sendungen,
        colli,
        gewicht: parseFloat(getValue('gewicht')) || 0,
        ladezeit: parseFloat(getValue('ladezeit')) || undefined,
        palette: parseFloat(getValue('palette')) || undefined,
        volumen: parseFloat(getValue('volumen')) || undefined,
        lademeter: parseFloat(getValue('lademeter')) || undefined,
        fahrzeugtyp: getValue('fahrzeugtyp') || undefined,
        kundenname: getValue('kundenname') || undefined
    };
}
function parseCsvMitProfil(text, profil) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return {
        records: [],
        erkanntesProfil: null,
        headers: []
    };
    // Delimiter erkennen (meistens ; aber manchmal , oder \t)
    const firstLine = lines[0];
    const delimiter = profil?.delimiter || (firstLine.includes('\t') ? '\t' : firstLine.split(';').length > firstLine.split(',').length ? ';' : ',');
    const headers = firstLine.split(delimiter).map((h)=>h.trim());
    const erkanntesProfil = profil || erkenneSpaltenprofil(headers);
    if (!erkanntesProfil) {
        return {
            records: [],
            erkanntesProfil: null,
            headers
        };
    }
    const records = [];
    for(let i = 1; i < lines.length; i++){
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(delimiter);
        const record = parseZeileMitProfil(cols, headers, erkanntesProfil, i);
        if (record) records.push(record);
    }
    return {
        records,
        erkanntesProfil,
        headers
    };
}
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
"[project]/src/lib/auto-layout-generator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateAutoLayout",
    ()=>generateAutoLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/topis.ts [app-ssr] (ecmascript)");
;
function generateAutoLayout(records) {
    // 1. Unique Stellplätze (= Tore) und Relationen (= Bereiche) extrahieren
    const stellplaetze = extractUniqueStellplaetze(records);
    const relationen = extractUniqueRelationen(records);
    // 2. Hallengröße berechnen
    const toreAnzahl = stellplaetze.length;
    const bereicheAnzahl = relationen.length;
    const hallWidth = Math.max(60, toreAnzahl * 4.5);
    const hallHeight = Math.max(30, hallWidth * 0.35);
    // 3. Hall erstellen
    const hall = {
        id: 1,
        shape: 'rect',
        width: hallWidth,
        height: hallHeight,
        name: 'Auto-Layout',
        walls: [],
        offsetX: 0,
        offsetY: 0,
        color: '#16213e'
    };
    const objects = [];
    let idCounter = 1;
    // 4. Tore entlang Süd- und Nord-Wand platzieren
    const toreSued = Math.ceil(toreAnzahl / 2);
    const toreNord = toreAnzahl - toreSued;
    const torWidth = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].tor.width;
    const torHeight = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].tor.height;
    // Süd-Wand (y = hallHeight - torHeight)
    const suedSpacing = hallWidth / (toreSued + 1);
    for(let i = 0; i < toreSued; i++){
        const x = suedSpacing * (i + 1) - torWidth / 2;
        objects.push({
            id: idCounter++,
            type: 'tor',
            x,
            y: hallHeight - torHeight,
            width: torWidth,
            height: torHeight,
            name: `Tor ${stellplaetze[i].key}`,
            side: 'south',
            torNummer: i + 1
        });
    }
    // Nord-Wand (y = 0)
    const nordSpacing = hallWidth / (toreNord + 1);
    for(let i = 0; i < toreNord; i++){
        const stellplatzIdx = toreSued + i;
        const x = nordSpacing * (i + 1) - torWidth / 2;
        objects.push({
            id: idCounter++,
            type: 'tor',
            x,
            y: 0,
            width: torWidth,
            height: torHeight,
            name: `Tor ${stellplaetze[stellplatzIdx].key}`,
            side: 'north',
            torNummer: toreSued + i + 1
        });
    }
    // 5. Bereiche im Innenraum platzieren
    const bereichMarginTop = torHeight + 3;
    const bereichMarginBottom = torHeight + 3;
    const verfuegbareHoehe = hallHeight - bereichMarginTop - bereichMarginBottom;
    const bereichHeight = Math.min(Math.max(6, verfuegbareHoehe / Math.max(Math.ceil(bereicheAnzahl / 4), 1) - 2), 12);
    const bereichWidth = Math.min(Math.max(8, hallWidth / 6), 18);
    const cols = Math.max(Math.ceil(Math.sqrt(bereicheAnzahl * 1.5)), 2);
    const rows = Math.ceil(bereicheAnzahl / cols);
    const colSpacing = (hallWidth - 4) / (cols + 1);
    const rowSpacing = verfuegbareHoehe / (rows + 1);
    for(let i = 0; i < bereicheAnzahl; i++){
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = colSpacing * (col + 1) + 2 - bereichWidth / 2;
        const y = bereichMarginTop + rowSpacing * (row + 1) - bereichHeight / 2;
        objects.push({
            id: idCounter++,
            type: 'bereich',
            x: Math.max(1, Math.min(x, hallWidth - bereichWidth - 1)),
            y: Math.max(bereichMarginTop, Math.min(y, hallHeight - bereichMarginBottom - bereichHeight)),
            width: bereichWidth,
            height: bereichHeight,
            name: `${relationen[i].key}`
        });
    }
    // 6. Gänge generieren
    const gaenge = [];
    const gangBreite = 3.5;
    const hauptgangY = hallHeight / 2;
    // Hauptgang (horizontal, mittig)
    gaenge.push({
        id: 1,
        name: 'Hauptgang',
        points: [
            {
                x: 0,
                y: hauptgangY
            },
            {
                x: hallWidth,
                y: hauptgangY
            }
        ],
        breite: gangBreite,
        typ: 'hauptgang',
        istHauptgang: true
    });
    // Quergang links
    gaenge.push({
        id: 2,
        name: 'Quergang Links',
        points: [
            {
                x: hallWidth * 0.25,
                y: 0
            },
            {
                x: hallWidth * 0.25,
                y: hallHeight
            }
        ],
        breite: gangBreite,
        typ: 'quergang'
    });
    // Quergang rechts
    gaenge.push({
        id: 3,
        name: 'Quergang Rechts',
        points: [
            {
                x: hallWidth * 0.75,
                y: 0
            },
            {
                x: hallWidth * 0.75,
                y: hallHeight
            }
        ],
        breite: gangBreite,
        typ: 'quergang'
    });
    // 7. TorZuordnungen erstellen
    const torObjects = objects.filter((o)=>o.type === 'tor');
    const torZuordnungen = stellplaetze.map((sp, i)=>({
            stellplatzKey: sp.key,
            objectId: torObjects[i]?.id ?? 0,
            objectName: torObjects[i]?.name ?? '',
            autoMatched: true
        }));
    // 8. RelationZuordnungen erstellen
    const bereichObjects = objects.filter((o)=>o.type === 'bereich');
    const relationZuordnungen = relationen.map((rel, i)=>({
            relationKey: rel.key,
            objectId: bereichObjects[i]?.id ?? null,
            objectName: bereichObjects[i]?.name ?? rel.key
        }));
    return {
        hall,
        objects,
        gaenge,
        torZuordnungen,
        relationZuordnungen
    };
}
function extractUniqueStellplaetze(records) {
    const map = new Map();
    for (const r of records){
        if (!r.stellplatz) continue;
        map.set(r.stellplatz, (map.get(r.stellplatz) || 0) + r.colli);
    }
    return Array.from(map.entries()).map(([key, colli])=>({
            key,
            colli
        })).sort((a, b)=>{
        // Numerisch sortieren wenn möglich
        const numA = parseInt(a.key);
        const numB = parseInt(b.key);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.key.localeCompare(b.key);
    });
}
function extractUniqueRelationen(records) {
    const map = new Map();
    for (const r of records){
        if (!r.ausgangsrelation) continue;
        map.set(r.ausgangsrelation, (map.get(r.ausgangsrelation) || 0) + r.colli);
    }
    return Array.from(map.entries()).map(([key, colli])=>({
            key,
            colli
        })).sort((a, b)=>b.colli - a.colli); // Nach Volumen sortiert
}
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
            const geschwindigkeit = schnellaeuferGeschwindigkeit || schritt.geschwindigkeitMs || 2.44;
            zeitSek = verteilweg / geschwindigkeit;
            // Batch-Faktor: Mehrere Colli pro Fahrt → Wegzeit teilen
            if (colliProFahrt > 1) {
                zeitSek = zeitSek / colliProFahrt;
            }
        } else if (schritt.geschwindigkeitsParameter && schritt.wegM > 0) {
            const paramSpeed = getParam(schritt.geschwindigkeitsParameter);
            if (paramSpeed > 0) {
                zeitSek = schritt.wegM / paramSpeed;
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
"[project]/src/lib/ampel-system.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "bewerteKPIs",
    ()=>bewerteKPIs
]);
function bewerteKPIs(ergebnis, benchmarkErgebnis, referenzHallen, stundenProfil) {
    const kpis = [];
    // Bester Referenzwert (Min/Colli gesamt)
    const bestMinProColli = Math.min(...referenzHallen.map((h)=>h.minProColliGesamt));
    const bestColliProMAh = Math.max(...referenzHallen.map((h)=>{
        const arbeitsmin = 52.9;
        return arbeitsmin / h.minProColliGesamt;
    }));
    // === KPI 1: Prozesszeit (Min/Colli) ===
    {
        const wert = ergebnis.minProColli;
        const ratio = wert / bestMinProColli;
        let status = 'gruen';
        if (ratio > 1.5) status = 'rot';
        else if (ratio > 1.1) status = 'gelb';
        const deltaProzent = (wert - bestMinProColli) / bestMinProColli * 100;
        const einsparMin = wert - bestMinProColli;
        const einsparStunden = einsparMin * ergebnis.colliProTag / (ergebnis.arbeitsminProStunde || 52.9);
        kpis.push({
            id: 'minProColli',
            label: 'Prozesszeit',
            wert: wert.toFixed(2),
            einheit: 'Min/Colli',
            referenz: `Benchmark: ${bestMinProColli.toFixed(2)}`,
            status,
            delta: deltaProzent,
            potenzialText: einsparStunden > 0.5 ? `${einsparStunden.toFixed(1)} MA-h/Tag einsparbar` : 'Im Benchmark-Bereich'
        });
    }
    // === KPI 2: Colli/MA-h (Produktivität) ===
    {
        const arbeitsmin = ergebnis.arbeitsminProStunde || 52.9;
        const colliProMAh = ergebnis.minProColli > 0 ? arbeitsmin / ergebnis.minProColli : 0;
        const ratio = bestColliProMAh > 0 ? colliProMAh / bestColliProMAh : 0;
        let status = 'gruen';
        if (ratio < 0.7) status = 'rot';
        else if (ratio < 0.9) status = 'gelb';
        const deltaProzent = bestColliProMAh > 0 ? (colliProMAh - bestColliProMAh) / bestColliProMAh * 100 : 0;
        kpis.push({
            id: 'colliProMAh',
            label: 'Produktivität',
            wert: Math.round(colliProMAh).toString(),
            einheit: 'Colli/MA-h',
            referenz: `Benchmark: ${Math.round(bestColliProMAh)}`,
            status,
            delta: deltaProzent,
            potenzialText: ratio < 0.9 ? `${Math.round((1 - ratio) * 100)}% unter Best Practice` : 'Gute Produktivität'
        });
    }
    // === KPI 3: Rang im Benchmark ===
    {
        const rang = benchmarkErgebnis.gesamtRanking;
        const anzahl = benchmarkErgebnis.anzahlHallen;
        let status = 'gruen';
        if (rang >= 7) status = 'rot';
        else if (rang >= 4) status = 'gelb';
        kpis.push({
            id: 'rang',
            label: 'Benchmark-Rang',
            wert: `Platz ${rang}`,
            einheit: `von ${anzahl}`,
            referenz: `${anzahl} Vergleichshallen`,
            status,
            delta: 0,
            potenzialText: rang > 3 ? `${rang - 3} Plätze Verbesserungspotenzial` : 'Top 3 im Benchmark'
        });
    }
    // === KPI 4: Spitzenfaktor (max/avg Stundenprofil) ===
    if (stundenProfil && stundenProfil.length > 0) {
        const colliWerte = stundenProfil.filter((s)=>s.colli > 0).map((s)=>s.colli);
        if (colliWerte.length > 0) {
            const maxColli = Math.max(...colliWerte);
            const avgColli = colliWerte.reduce((sum, c)=>sum + c, 0) / colliWerte.length;
            const spitzenFaktor = avgColli > 0 ? maxColli / avgColli : 1;
            let status = 'gruen';
            if (spitzenFaktor > 2.0) status = 'rot';
            else if (spitzenFaktor > 1.5) status = 'gelb';
            kpis.push({
                id: 'spitzenfaktor',
                label: 'Lastverteilung',
                wert: spitzenFaktor.toFixed(1),
                einheit: 'Spitze/Ø',
                referenz: 'Optimal: ≤ 1.5',
                status,
                delta: (spitzenFaktor - 1.5) / 1.5 * 100,
                potenzialText: spitzenFaktor > 1.5 ? `Spitze ${((spitzenFaktor - 1) * 100).toFixed(0)}% über Durchschnitt` : 'Gleichmäßige Auslastung'
            });
        }
    }
    // Zusammenfassung
    const roteAmpeln = kpis.filter((k)=>k.status === 'rot').length;
    const gelbeAmpeln = kpis.filter((k)=>k.status === 'gelb').length;
    // Potenzial in MA-Stunden berechnen
    const minProColliDelta = ergebnis.minProColli - bestMinProColli;
    const potenzialMAStunden = minProColliDelta > 0 ? minProColliDelta * ergebnis.colliProTag / (ergebnis.arbeitsminProStunde || 52.9) : 0;
    // Headline generieren
    let headline = '';
    if (roteAmpeln >= 2) {
        const deltaProzent = (ergebnis.minProColli - bestMinProColli) / bestMinProColli * 100;
        headline = `${Math.round(deltaProzent)}% über Benchmark. Potenzial: ${potenzialMAStunden.toFixed(0)} MA-h/Tag`;
    } else if (roteAmpeln === 1 || gelbeAmpeln >= 2) {
        headline = `Optimierungspotenzial identifiziert: ${potenzialMAStunden.toFixed(1)} MA-h/Tag`;
    } else {
        headline = 'Gute Performance — im Benchmark-Bereich';
    }
    return {
        kpis,
        roteAmpeln,
        gelbeAmpeln,
        headline,
        potenzialMAStunden
    };
}
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
        id: 'geis_naila',
        name: 'Geis (Bischoff)',
        standort: 'Naila',
        typ: 'se',
        flaecheQm: 6975,
        tore: 40,
        colliProTag: 2742,
        minProColli: {
            entlader: 1.35,
            scanner: 0.34,
            verteiler: 1.75
        },
        minProColliGesamt: 3.44,
        verteilwegM: 142.2,
        fte: 87.9,
        jahr: 2013
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
        haeufigkeit: 0.1,
        geschwindigkeitsParameter: 'staplerGeschwindigkeit'
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
        haeufigkeit: 1.0,
        geschwindigkeitsParameter: 'staplerGeschwindigkeit'
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
        haeufigkeit: 1.0,
        geschwindigkeitsParameter: 'staplerGeschwindigkeit'
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
        name: 'Verteilgeschwindigkeit (Schnelläufer/Ameise)',
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
"[project]/src/lib/ist-soll-rechner.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "berechneIstSoll",
    ()=>berechneIstSoll
]);
function berechneIstSoll(stundenAggregation, istMAProStunde, minProColli, arbeitsminProStunde = 52.9, arbeitstage = 1) {
    const stunden = [];
    let gesamtSollStunden = 0;
    let gesamtIstStunden = 0;
    // Nur Stunden mit Aktivität
    const aktiveStunden = stundenAggregation.filter((a)=>a.colli > 0);
    aktiveStunden.forEach((agg)=>{
        // Colli pro Stunde (Durchschnitt pro Tag)
        const colliProStunde = arbeitstage > 1 ? agg.colli / arbeitstage : agg.colli;
        // SOLL-MA für diese Stunde
        const sollMA = colliProStunde * minProColli / arbeitsminProStunde;
        // IST-MA
        const istMA = istMAProStunde[agg.stunde] || 0;
        const delta = istMA - sollMA;
        const lueckeProzent = sollMA > 0 ? (istMA - sollMA) / sollMA * 100 : 0;
        let status = 'passend';
        if (delta > 0.5) status = 'ueberbesetzt';
        else if (delta < -0.5) status = 'unterbesetzt';
        stunden.push({
            stunde: agg.stunde,
            sollMA,
            istMA,
            delta,
            lueckeProzent,
            colli: colliProStunde,
            status
        });
        gesamtSollStunden += sollMA;
        gesamtIstStunden += istMA;
    });
    const durchschnittLuecke = gesamtSollStunden > 0 ? (gesamtIstStunden - gesamtSollStunden) / gesamtSollStunden * 100 : 0;
    return {
        stunden,
        durchschnittLuecke,
        gesamtSollStunden,
        gesamtIstStunden,
        gesamtDelta: gesamtIstStunden - gesamtSollStunden,
        minProColli,
        arbeitsminProStunde
    };
}
}),
"[project]/src/lib/heatmap-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatMetrikWert",
    ()=>formatMetrikWert,
    "getHeatmapColor",
    ()=>getHeatmapColor,
    "getMetrikWert",
    ()=>getMetrikWert,
    "getModusLabel",
    ()=>getModusLabel
]);
function getMetrikWert(metrik, modus) {
    switch(modus){
        case 'sendungen':
            return metrik.sendungen;
        case 'colli':
        case 'colliVerteilung':
            return metrik.colli;
        case 'gewicht':
            return metrik.gewicht;
        case 'auslastung':
        case 'flaechenbedarf':
            return metrik.auslastung;
        case 'ladezeit':
            return metrik.durchschnittLadezeit;
        case 'verteilweg':
            return metrik.fahrtenProTag; // Wird in Phase 3 durch echten Verteilweg ersetzt
        default:
            return metrik.sendungen;
    }
}
function formatMetrikWert(wert, modus) {
    switch(modus){
        case 'sendungen':
            return `${Math.round(wert)} Sdg`;
        case 'colli':
        case 'colliVerteilung':
            return `${Math.round(wert)} Cll`;
        case 'gewicht':
            return wert >= 1000 ? `${(wert / 1000).toFixed(1)}t` : `${Math.round(wert)}kg`;
        case 'auslastung':
            return `${Math.round(wert * 100)}%`;
        case 'ladezeit':
            return wert >= 60 ? `${(wert / 60).toFixed(1)}min` : `${Math.round(wert)}s`;
        case 'flaechenbedarf':
            return `${Math.round(wert * 100)}%`;
        case 'verteilweg':
            return `${Math.round(wert)}m`;
        default:
            return `${Math.round(wert)}`;
    }
}
function getHeatmapColor(intensity, farbskala, opacityFactor) {
    const clamped = Math.max(0, Math.min(1, intensity));
    const alpha = clamped * opacityFactor;
    switch(farbskala){
        case 'gruen-rot':
            {
                // Green (low) → Yellow (mid) → Red (high)
                const r = clamped < 0.5 ? Math.round(255 * (clamped * 2)) : 255;
                const g = clamped < 0.5 ? 255 : Math.round(255 * (1 - (clamped - 0.5) * 2));
                return `rgba(${r}, ${g}, 0, ${alpha.toFixed(2)})`;
            }
        case 'blau-rot':
            {
                // Blue (low) → Purple (mid) → Red (high)
                const r = Math.round(255 * clamped);
                const b = Math.round(255 * (1 - clamped));
                return `rgba(${r}, 0, ${b}, ${alpha.toFixed(2)})`;
            }
        case 'mono':
            {
                // Transparent (low) → Dark red (high)
                return `rgba(220, 38, 38, ${alpha.toFixed(2)})`;
            }
        default:
            return `rgba(220, 38, 38, ${alpha.toFixed(2)})`;
    }
}
function getModusLabel(modus) {
    switch(modus){
        case 'sendungen':
            return 'Sendungen';
        case 'colli':
            return 'Colli';
        case 'gewicht':
            return 'Gewicht';
        case 'auslastung':
            return 'Auslastung';
        case 'ladezeit':
            return 'Ø Ladezeit';
        case 'flaechenbedarf':
            return 'Flächenbedarf';
        case 'verteilweg':
            return 'Verteilweg';
        case 'colliVerteilung':
            return 'Colli-Verteilung';
    }
}
}),
"[project]/src/components/check/HallPreview.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HallPreview",
    ()=>HallPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/topis.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/heatmap-utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function HallPreview({ hall, objects, gaenge, analyse, heatmapConfig, width = 700, height = 400 }) {
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
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
        if (!hall) return;
        // Auto-Zoom-to-Fit
        const hallPxW = hall.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"];
        const hallPxH = hall.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"];
        const padding = 30;
        const scaleX = (width - padding * 2) / hallPxW;
        const scaleY = (height - padding * 2) / hallPxH;
        const zoom = Math.min(scaleX, scaleY, 2);
        const offsetX = (width - hallPxW * zoom) / 2;
        const offsetY = (height - hallPxH * zoom) / 2;
        const worldToScreen = (x, y)=>({
                x: x * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"] * zoom + offsetX,
                y: y * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"] * zoom + offsetY
            });
        // === Hall Background ===
        const hallTL = worldToScreen(0, 0);
        const hallBR = worldToScreen(hall.width, hall.height);
        ctx.fillStyle = hall.color || '#16213e';
        ctx.fillRect(hallTL.x, hallTL.y, hallBR.x - hallTL.x, hallBR.y - hallTL.y);
        // Hall border
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(hallTL.x, hallTL.y, hallBR.x - hallTL.x, hallBR.y - hallTL.y);
        // === Gaenge ===
        for (const gang of gaenge){
            if (gang.points.length < 2) continue;
            ctx.strokeStyle = gang.istHauptgang ? 'rgba(100, 116, 139, 0.5)' : 'rgba(100, 116, 139, 0.3)';
            ctx.lineWidth = gang.breite * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"] * zoom * 0.3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            const p0 = worldToScreen(gang.points[0].x, gang.points[0].y);
            ctx.moveTo(p0.x, p0.y);
            for(let i = 1; i < gang.points.length; i++){
                const p = worldToScreen(gang.points[i].x, gang.points[i].y);
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }
        // === Objects ===
        for (const obj of objects){
            const tl = worldToScreen(obj.x, obj.y);
            const w = obj.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
            const h = obj.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
            const color = obj.color || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OBJECT_COLORS"][obj.type] || '#888';
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(tl.x, tl.y, w, h);
            ctx.globalAlpha = 1;
            // Border
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.strokeRect(tl.x, tl.y, w, h);
            // Label
            const fontSize = Math.max(8, Math.min(11, w / 5));
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = obj.name.length > 12 ? obj.name.slice(0, 11) + '…' : obj.name;
            ctx.fillText(label, tl.x + w / 2, tl.y + h / 2);
        }
        // === Heatmap Overlay ===
        if (heatmapConfig?.aktiv && analyse) {
            const torObjects = objects.filter((o)=>o.type === 'tor');
            const maxColli = Math.max(...analyse.objektMetriken.map((m)=>m.colli), 1);
            for (const tor of torObjects){
                const metrik = analyse.objektMetriken.find((m)=>m.objectId === tor.id);
                if (!metrik || metrik.colli === 0) continue;
                const intensity = metrik.colli / maxColli;
                const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getHeatmapColor"])(intensity, heatmapConfig.farbskala, heatmapConfig.intensitaet);
                const tl = worldToScreen(tor.x, tor.y);
                const w = tor.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                const h = tor.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                ctx.fillStyle = color;
                ctx.fillRect(tl.x, tl.y, w, h);
                // Colli-Wert anzeigen
                const fontSize = Math.max(7, Math.min(10, w / 5));
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(metrik.colli >= 1000 ? `${(metrik.colli / 1000).toFixed(1)}k` : `${Math.round(metrik.colli)}`, tl.x + w / 2, tl.y + h / 2);
            }
        }
    }, [
        hall,
        objects,
        gaenge,
        analyse,
        heatmapConfig,
        width,
        height
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        style: {
            width,
            height
        },
        className: "rounded-lg border border-border"
    }, void 0, false, {
        fileName: "[project]/src/components/check/HallPreview.tsx",
        lineNumber: 155,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/check/AmpelCard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AmpelCard",
    ()=>AmpelCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
'use client';
;
const STATUS_COLORS = {
    gruen: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        dot: 'bg-green-500',
        text: 'text-green-400'
    },
    gelb: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-500',
        text: 'text-yellow-400'
    },
    rot: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        dot: 'bg-red-500',
        text: 'text-red-400'
    }
};
function AmpelCard({ kpi }) {
    const colors = STATUS_COLORS[kpi.status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-xl border ${colors.border} ${colors.bg} p-4 flex flex-col gap-2`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `w-3 h-3 rounded-full ${colors.dot} shadow-lg`
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/AmpelCard.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-muted-foreground",
                        children: kpi.label
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/AmpelCard.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/check/AmpelCard.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-baseline gap-1.5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-2xl font-bold ${colors.text}`,
                        children: kpi.wert
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/AmpelCard.tsx",
                        lineNumber: 31,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-muted-foreground",
                        children: kpi.einheit
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/AmpelCard.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/check/AmpelCard.tsx",
                lineNumber: 30,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-muted-foreground",
                children: kpi.referenz
            }, void 0, false, {
                fileName: "[project]/src/components/check/AmpelCard.tsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            kpi.delta !== 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `text-xs font-medium ${colors.text}`,
                children: [
                    kpi.delta > 0 ? '+' : '',
                    Math.round(kpi.delta),
                    "% vs. Benchmark"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/check/AmpelCard.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/check/AmpelCard.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/check/BeratungCTA.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BeratungCTA",
    ()=>BeratungCTA
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-ssr] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-ssr] (ecmascript) <export default as Phone>");
'use client';
;
;
;
function BeratungCTA({ bewertung, onOpenEditor }) {
    const hasProblems = bewertung.roteAmpeln > 0 || bewertung.gelbeAmpeln > 0;
    const worstKPI = bewertung.kpis.find((k)=>k.status === 'rot') || bewertung.kpis.find((k)=>k.status === 'gelb');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-xl border-2 p-6 ${hasProblems ? 'border-red-500/40 bg-red-500/5' : 'border-green-500/40 bg-green-500/5'}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 mb-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `w-3 h-3 rounded-full ${hasProblems ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/check/BeratungCTA.tsx",
                                    lineNumber: 25,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `text-lg font-semibold ${hasProblems ? 'text-red-400' : 'text-green-400'}`,
                                    children: bewertung.headline
                                }, void 0, false, {
                                    fileName: "[project]/src/components/check/BeratungCTA.tsx",
                                    lineNumber: 26,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/check/BeratungCTA.tsx",
                            lineNumber: 24,
                            columnNumber: 11
                        }, this),
                        worstKPI && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground",
                            children: worstKPI.potenzialText
                        }, void 0, false, {
                            fileName: "[project]/src/components/check/BeratungCTA.tsx",
                            lineNumber: 31,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/check/BeratungCTA.tsx",
                    lineNumber: 23,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col sm:flex-row gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            href: "mailto:info@roth-logistik.de?subject=Hallen-Check%20Beratung&body=Ich%20habe%20den%20TOPIS%20Hallen-Check%20durchgeführt%20und%20möchte%20gerne%20ein%20Beratungsgespräch%20vereinbaren.",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                size: "lg",
                                className: "gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/check/BeratungCTA.tsx",
                                        lineNumber: 41,
                                        columnNumber: 15
                                    }, this),
                                    "Beratungsgespräch vereinbaren"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/check/BeratungCTA.tsx",
                                lineNumber: 40,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/check/BeratungCTA.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this),
                        onOpenEditor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            size: "lg",
                            className: "gap-2",
                            onClick: onOpenEditor,
                            children: [
                                "Im Experten-Editor öffnen",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/check/BeratungCTA.tsx",
                                    lineNumber: 48,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/check/BeratungCTA.tsx",
                            lineNumber: 46,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/check/BeratungCTA.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/check/BeratungCTA.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/check/BeratungCTA.tsx",
        lineNumber: 20,
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
"[project]/src/components/check/KundenCheckResults.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "KundenCheckResults",
    ()=>KundenCheckResults
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$HallPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/check/HallPreview.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$AmpelCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/check/AmpelCard.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$BeratungCTA$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/check/BeratungCTA.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$StundenChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/StundenChart.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$BenchmarkRadar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/BenchmarkRadar.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
function KundenCheckResults({ hall, objects, gaenge, ergebnis, analyse, benchmarkErgebnis, ampelBewertung, stundenProfil, abteilungen, onOpenEditor }) {
    // Heatmap auf Colli-Verteilung
    const heatmapConfig = {
        aktiv: true,
        modus: 'colliVerteilung',
        farbskala: 'gruen-rot',
        intensitaet: 0.7
    };
    // Benchmark-Daten für Radar
    const aktuelleWerte = {};
    const benchmarkWerte = {};
    ergebnis.abteilungen.forEach((a)=>{
        aktuelleWerte[a.abteilung] = a.minProColli;
    });
    // Bester Wert aus dem Ranking als Benchmark
    benchmarkErgebnis.rankings.forEach((r)=>{
        benchmarkWerte[r.abteilung] = r.bester.wert;
    });
    // Top-10 Tore nach Colli
    const torObjects = objects.filter((o)=>o.type === 'tor');
    const topTore = analyse.objektMetriken.filter((m)=>torObjects.some((t)=>t.id === m.objectId)).sort((a, b)=>b.colli - a.colli).slice(0, 10);
    const maxTorColli = topTore.length > 0 ? topTore[0].colli : 1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold mb-4 text-muted-foreground",
                        children: "Kennzahlen-Bewertung"
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 lg:grid-cols-4 gap-4",
                        children: ampelBewertung.kpis.map((kpi)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$AmpelCard$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AmpelCard"], {
                                kpi: kpi
                            }, kpi.id, false, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold mb-4 text-muted-foreground",
                        children: "Hallenplan — Colli-Verteilung auf Toren"
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$HallPreview$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HallPreview"], {
                            hall: hall,
                            objects: objects,
                            gaenge: gaenge,
                            analyse: analyse,
                            heatmapConfig: heatmapConfig,
                            width: 800,
                            height: 420
                        }, void 0, false, {
                            fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-center gap-6 mt-3 text-xs text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    torObjects.length,
                                    " Tore"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 106,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    objects.filter((o)=>o.type === 'bereich').length,
                                    " Bereiche"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    gaenge.length,
                                    " Gänge"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    hall.width.toFixed(0),
                                    " x ",
                                    hall.height.toFixed(0),
                                    " m"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 109,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "grid md:grid-cols-2 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold mb-4 text-muted-foreground",
                                children: "Stundenprofil — SOLL-MA/Stunde"
                            }, void 0, false, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$StundenChart$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StundenChart"], {
                                data: stundenProfil,
                                width: 450,
                                height: 240
                            }, void 0, false, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-muted-foreground mt-2",
                                children: "SOLL = benötigte MA basierend auf Colli-Aufkommen je Stunde"
                            }, void 0, false, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold mb-4 text-muted-foreground",
                                children: [
                                    "Benchmark-Radar — Position vs. ",
                                    benchmarkErgebnis.anzahlHallen,
                                    " Hallen"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$BenchmarkRadar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BenchmarkRadar"], {
                                aktuell: aktuelleWerte,
                                benchmark: benchmarkWerte,
                                abteilungen: abteilungen,
                                width: 350,
                                height: 280
                            }, void 0, false, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            topTore.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold mb-4 text-muted-foreground",
                        children: "Top-10 Tore nach Colli-Volumen"
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: topTore.map((tor, i)=>{
                            const pct = tor.colli / maxTorColli * 100;
                            const obj = torObjects.find((t)=>t.id === tor.objectId);
                            const statusColor = pct >= 85 ? 'bg-red-500' : pct >= 65 ? 'bg-yellow-500' : 'bg-green-500';
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm text-muted-foreground w-20 shrink-0",
                                        children: obj?.name || `Tor ${tor.objectId}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                        lineNumber: 154,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-5 bg-muted rounded-full overflow-hidden",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `h-full ${statusColor} rounded-full transition-all`,
                                            style: {
                                                width: `${pct}%`
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                            lineNumber: 158,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                        lineNumber: 157,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-mono w-16 text-right",
                                        children: tor.colli >= 1000 ? `${(tor.colli / 1000).toFixed(1)}k` : Math.round(tor.colli)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                        lineNumber: 163,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `w-2.5 h-2.5 rounded-full ${statusColor}`
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                        lineNumber: 166,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-muted-foreground w-10 text-right",
                                        children: [
                                            Math.round(pct),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                        lineNumber: 167,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, tor.objectId, true, {
                                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                                lineNumber: 153,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                lineNumber: 143,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$BeratungCTA$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BeratungCTA"], {
                    bewertung: ampelBewertung,
                    onOpenEditor: onOpenEditor
                }, void 0, false, {
                    fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                    lineNumber: 177,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/check/KundenCheckResults.tsx",
                lineNumber: 176,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/check/KundenCheckResults.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
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
        addPaths: (paths)=>{
            if (paths.length === 0) return;
            get().pushSnapshot();
            set((state)=>{
                let counter = state.pathIdCounter;
                const newPaths = paths.map((p)=>({
                        ...p,
                        id: counter++
                    }));
                return {
                    paths: [
                        ...state.paths,
                        ...newPaths
                    ],
                    pathIdCounter: counter
                };
            });
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
        deleteAutoGeneratedPaths: ()=>{
            const hasAuto = get().paths.some((p)=>p.autoGenerated);
            if (!hasAuto) return;
            get().pushSnapshot();
            set((state)=>({
                    paths: state.paths.filter((p)=>!p.autoGenerated),
                    selectedPath: state.selectedPath?.autoGenerated ? null : state.selectedPath
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
"[project]/src/lib/betriebsdaten-store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBetriebsAnalyse",
    ()=>useBetriebsAnalyse,
    "useBetriebsdatenStore",
    ()=>useBetriebsdatenStore,
    "useDistanzmatrix",
    ()=>useDistanzmatrix,
    "useDistanzmatrixErgebnis",
    ()=>useDistanzmatrixErgebnis,
    "useFahrplan",
    ()=>useFahrplan,
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
        distanzmatrix: null,
        distanzmatrixErgebnis: null,
        fahrplan: null,
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
        setDistanzmatrix: (dm)=>set({
                distanzmatrix: dm
            }),
        setDistanzmatrixErgebnis: (erg)=>set({
                distanzmatrixErgebnis: erg
            }),
        setFahrplan: (fp)=>set({
                fahrplan: fp
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
                stundenAggregation: [],
                distanzmatrix: null,
                distanzmatrixErgebnis: null,
                fahrplan: null
            })
    }));
const useHeatmapConfig = ()=>useBetriebsdatenStore((s)=>s.heatmapConfig);
const useBetriebsAnalyse = ()=>useBetriebsdatenStore((s)=>s.analyse);
const useSzenarien = ()=>useBetriebsdatenStore((s)=>s.szenarien);
const useTorZuordnungen = ()=>useBetriebsdatenStore((s)=>s.torZuordnungen);
const useRelationZuordnungen = ()=>useBetriebsdatenStore((s)=>s.relationZuordnungen);
const useScandatenRecords = ()=>useBetriebsdatenStore((s)=>s.scandatenRecords);
const useStundenAggregation = ()=>useBetriebsdatenStore((s)=>s.stundenAggregation);
const useDistanzmatrix = ()=>useBetriebsdatenStore((s)=>s.distanzmatrix);
const useDistanzmatrixErgebnis = ()=>useBetriebsdatenStore((s)=>s.distanzmatrixErgebnis);
const useFahrplan = ()=>useBetriebsdatenStore((s)=>s.fahrplan);
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
"[project]/src/app/check/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CheckPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-up.js [app-ssr] (ecmascript) <export default as FileUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spaltenzuordnungen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/spaltenzuordnungen.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auto$2d$layout$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auto-layout-generator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessrechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prozessrechner.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$benchmarking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/benchmarking.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ampel$2d$system$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ampel-system.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$referenzhallen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/referenzhallen.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/prozessmodell-se.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ist$2d$soll$2d$rechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ist-soll-rechner.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$KundenCheckResults$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/check/KundenCheckResults.tsx [app-ssr] (ecmascript)");
// Stores für "Im Experten-Editor öffnen"
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/betriebsdaten-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessmodell$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prozessmodell-store.ts [app-ssr] (ecmascript)");
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
;
;
// Fortschritts-Schritte
const ANALYSE_STEPS = [
    'CSV einlesen...',
    'Format erkennen...',
    'Halle generieren...',
    'Prozessmodell berechnen...',
    'Benchmark vergleichen...',
    'Stundenprofil erstellen...',
    'Bewertung abschließen...'
];
function CheckPage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('upload');
    const [dragOver, setDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [analyseSchritt, setAnalyseSchritt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [ergebnis, setErgebnis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dateiName, setDateiName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [dateiInfo, setDateiInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Store-Referenzen für Editor-Übernahme
    const loadState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTopisStore"])((s)=>s.loadState);
    const updateHall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTopisStore"])((s)=>s.updateHall);
    const resetState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTopisStore"])((s)=>s.resetState);
    const setGaengeStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTopisStore"])((s)=>s.setGaenge);
    const addObjectStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTopisStore"])((s)=>s.addObject);
    const importScandaten = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.importScandatenRecords);
    const setAnalyseStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.setAnalyse);
    const setTorZuordnungenStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.setTorZuordnungen);
    const setRelationZuordnungenStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])((s)=>s.setRelationZuordnungen);
    const ladeModell = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessmodell$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useProzessmodellStore"])((s)=>s.ladeModell);
    // ============ Analyse-Pipeline ============
    const runAnalyse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (csvText, fileName)=>{
        setPhase('analyzing');
        setError(null);
        setDateiName(fileName);
        try {
            // Step 1: CSV parsen
            setAnalyseSchritt(0);
            await tick();
            const { records, erkanntesProfil } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spaltenzuordnungen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseCsvMitProfil"])(csvText);
            if (records.length === 0) {
                throw new Error('Keine gültigen Datensätze gefunden. Bitte prüfen Sie das CSV-Format.');
            }
            // Step 2: Format Info
            setAnalyseSchritt(1);
            await tick();
            const uniqueStellplaetze = new Set(records.map((r)=>r.stellplatz).filter(Boolean));
            const uniqueRelationen = new Set(records.map((r)=>r.ausgangsrelation).filter(Boolean));
            const daten = records.filter((r)=>r.scandatum).map((r)=>r.scandatum);
            const minDatum = daten.length > 0 ? daten.sort()[0] : '?';
            const maxDatum = daten.length > 0 ? daten.sort().reverse()[0] : '?';
            setDateiInfo(`${records.length.toLocaleString('de-DE')} Datensätze · ${uniqueStellplaetze.size} Tore · ${uniqueRelationen.size} Relationen · ${minDatum} – ${maxDatum}`);
            // Step 3: Auto-Layout
            setAnalyseSchritt(2);
            await tick();
            const layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auto$2d$layout$2d$generator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAutoLayout"])(records);
            // Step 4: Prozessmodell berechnen
            setAnalyseSchritt(3);
            await tick();
            // Colli & Arbeitstage aus Daten berechnen
            const totalColli = records.reduce((sum, r)=>sum + r.colli, 0);
            const uniqueDays = new Set(records.map((r)=>r.scandatum).filter(Boolean));
            const arbeitstage = Math.max(uniqueDays.size, 1);
            const colliProTag = Math.round(totalColli / arbeitstage);
            // Parameter mit berechneten Werten
            const parameter = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SE_STANDARD_PARAMETER"].map((p)=>{
                if (p.id === 'colliProTag') return {
                    ...p,
                    aktuellerWert: colliProTag,
                    quelle: 'scandaten'
                };
                // Default-Verteilweg (geschätzt aus Hallengröße, da kein echtes Routing)
                if (p.id === 'verteilweg') {
                    const geschaetzterWeg = Math.round(layout.hall.width * 0.9 + layout.hall.height * 0.3);
                    return {
                        ...p,
                        aktuellerWert: geschaetzterWeg,
                        quelle: 'layout'
                    };
                }
                return {
                    ...p
                };
            });
            const ergebnis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessrechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["berechneMinProColli"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROZESSMODELL_SE"], parameter);
            // Step 5: Benchmark
            setAnalyseSchritt(4);
            await tick();
            const benchmarkErgebnis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$benchmarking$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["berechneBenchmark"])(ergebnis, parameter.find((p)=>p.id === 'verteilweg').aktuellerWert, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$referenzhallen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REFERENZHALLEN"], 'Ihre Halle');
            // Step 6: Stundenprofil (IST-SOLL)
            setAnalyseSchritt(5);
            await tick();
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
            const stundenAgg = Array.from(stundenMap.values());
            // IST-SOLL berechnen (ohne echte IST-Werte → nur SOLL)
            const istSoll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ist$2d$soll$2d$rechner$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["berechneIstSoll"])(stundenAgg, {}, ergebnis.minProColli, ergebnis.arbeitsminProStunde, arbeitstage);
            const stundenProfil = istSoll.stunden.map((s)=>({
                    stunde: s.stunde,
                    soll: s.sollMA,
                    ist: 0,
                    colli: s.colli
                }));
            // Step 7: Ampel-Bewertung
            setAnalyseSchritt(6);
            await tick();
            // BetriebsAnalyse erstellen
            const analyse = {
                zeitraum: {
                    von: minDatum,
                    bis: maxDatum
                },
                arbeitstage,
                gesamtSendungen: records.reduce((sum, r)=>sum + r.sendungen, 0),
                gesamtColli: totalColli,
                gesamtGewicht: records.reduce((sum, r)=>sum + r.gewicht, 0),
                objektMetriken: layout.torZuordnungen.map((tz)=>{
                    const torRecords = records.filter((r)=>r.stellplatz === tz.stellplatzKey);
                    return {
                        objectId: tz.objectId,
                        objectName: tz.objectName,
                        sendungen: torRecords.reduce((sum, r)=>sum + r.sendungen, 0) / arbeitstage,
                        colli: torRecords.reduce((sum, r)=>sum + r.colli, 0) / arbeitstage,
                        gewicht: torRecords.reduce((sum, r)=>sum + r.gewicht, 0) / arbeitstage,
                        durchschnittLadezeit: 0,
                        auslastung: 0,
                        fahrtenProTag: 0
                    };
                })
            };
            const ampelBewertung = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ampel$2d$system$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bewerteKPIs"])(ergebnis, benchmarkErgebnis, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$referenzhallen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REFERENZHALLEN"], stundenProfil);
            // Ergebnis speichern
            setErgebnis({
                layout,
                records,
                ergebnis,
                analyse,
                benchmarkErgebnis,
                ampelBewertung,
                stundenProfil,
                abteilungen: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROZESSMODELL_SE"].abteilungen,
                colliProTag,
                arbeitstage
            });
            setPhase('results');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unbekannter Fehler bei der Analyse');
            setPhase('upload');
        }
    }, []);
    // ============ File Handling ============
    const handleFile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((file)=>{
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt') && !file.name.endsWith('.tsv')) {
            setError('Bitte eine CSV-Datei hochladen (.csv, .txt, .tsv)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e)=>{
            const text = e.target?.result;
            if (text) runAnalyse(text, file.name);
        };
        reader.onerror = ()=>setError('Fehler beim Lesen der Datei');
        reader.readAsText(file, 'utf-8');
    }, [
        runAnalyse
    ]);
    const handleDrop = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [
        handleFile
    ]);
    const handleFileInput = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((e)=>{
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }, [
        handleFile
    ]);
    // ============ Editor-Übernahme ============
    const handleOpenEditor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!ergebnis) return;
        const { layout, records, analyse } = ergebnis;
        // Stores befüllen
        resetState();
        updateHall(1, {
            width: layout.hall.width,
            height: layout.hall.height,
            name: layout.hall.name
        });
        layout.objects.forEach((obj)=>addObjectStore(obj));
        setGaengeStore(layout.gaenge);
        // Betriebsdaten
        importScandaten(records);
        setAnalyseStore(analyse);
        setTorZuordnungenStore(layout.torZuordnungen);
        setRelationZuordnungenStore(layout.relationZuordnungen);
        // Prozessmodell
        const verteilweg = Math.round(layout.hall.width * 0.9 + layout.hall.height * 0.3);
        const param = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SE_STANDARD_PARAMETER"].map((p)=>{
            if (p.id === 'colliProTag') return {
                ...p,
                aktuellerWert: ergebnis.colliProTag
            };
            if (p.id === 'verteilweg') return {
                ...p,
                aktuellerWert: verteilweg
            };
            return {
                ...p
            };
        });
        ladeModell(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PROZESSMODELL_SE"], param);
        router.push('/projekt');
    }, [
        ergebnis,
        resetState,
        updateHall,
        addObjectStore,
        setGaengeStore,
        importScandaten,
        setAnalyseStore,
        setTorZuordnungenStore,
        setRelationZuordnungenStore,
        ladeModell,
        router
    ]);
    // ============ Render ============
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-b from-background to-muted",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b bg-background/95 backdrop-blur",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 h-14 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "flex items-center gap-2 hover:opacity-80",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-7 h-7 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm",
                                            children: "T"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/check/page.tsx",
                                            lineNumber: 286,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: "TOPIS"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/check/page.tsx",
                                            lineNumber: 289,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/check/page.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-muted-foreground",
                                    children: "/"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/check/page.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: "Hallen-Check"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/check/page.tsx",
                                    lineNumber: 292,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/check/page.tsx",
                            lineNumber: 284,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "flex items-center gap-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: "/projekt",
                                className: "text-sm text-muted-foreground hover:text-foreground",
                                children: "Editor"
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 295,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/check/page.tsx",
                            lineNumber: 294,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/check/page.tsx",
                    lineNumber: 283,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/check/page.tsx",
                lineNumber: 282,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "container mx-auto px-4 py-8 max-w-5xl",
                children: [
                    phase === 'upload' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center space-y-4 py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-4xl font-bold tracking-tight",
                                        children: [
                                            "Wie produktiv ist ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-primary",
                                                children: "Ihre Halle"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 309,
                                                columnNumber: 35
                                            }, this),
                                            "?"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 308,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg text-muted-foreground max-w-xl mx-auto",
                                        children: [
                                            "Laden Sie Ihre Scandaten hoch und erhalten Sie in Sekunden eine vollständige Produktivitätsanalyse mit Benchmark-Vergleich gegen ",
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$referenzhallen$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["REFERENZHALLEN"].length,
                                            " Referenzhallen."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 311,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 307,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                                className: `border-2 border-dashed cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/20 hover:border-primary/50'}`,
                                onDragOver: (e)=>{
                                    e.preventDefault();
                                    setDragOver(true);
                                },
                                onDragLeave: ()=>setDragOver(false),
                                onDrop: handleDrop,
                                onClick: ()=>fileInputRef.current?.click(),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "py-16 text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `w-16 h-16 rounded-full flex items-center justify-center ${dragOver ? 'bg-primary/20' : 'bg-muted'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                    className: `h-8 w-8 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/check/page.tsx",
                                                    lineNumber: 332,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 331,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-lg font-medium",
                                                        children: dragOver ? 'Datei hier ablegen...' : 'CSV-Datei per Drag & Drop ablegen'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/check/page.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-muted-foreground mt-1",
                                                        children: "oder klicken zum Auswählen · WMS-Export, Scandaten, Betriebsdaten"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/check/page.tsx",
                                                        lineNumber: 338,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 334,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                size: "sm",
                                                className: "gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileUp$3e$__["FileUp"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/check/page.tsx",
                                                        lineNumber: 343,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Datei auswählen"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 342,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 330,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/check/page.tsx",
                                    lineNumber: 329,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 318,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                ref: fileInputRef,
                                type: "file",
                                accept: ".csv,.txt,.tsv",
                                className: "hidden",
                                onChange: handleFileInput
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 349,
                                columnNumber: 13
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-destructive text-sm",
                                    children: error
                                }, void 0, false, {
                                    fileName: "[project]/src/app/check/page.tsx",
                                    lineNumber: 360,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 359,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground mb-3",
                                        children: "Unterstützte Formate (Auto-Erkennung):"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 366,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap justify-center gap-2",
                                        children: [
                                            'ROTH Standard',
                                            'Andreas Schmid',
                                            'Geis',
                                            'PML Kiel',
                                            'IDS Hub',
                                            'Noerpel',
                                            'Rhenus',
                                            'TLT'
                                        ].map((name)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "px-3 py-1 bg-muted rounded-full text-xs",
                                                children: name
                                            }, name, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 369,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 367,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 365,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/check/page.tsx",
                        lineNumber: 305,
                        columnNumber: 11
                    }, this),
                    phase === 'analyzing' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-24 text-center space-y-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "h-12 w-12 animate-spin text-primary"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/check/page.tsx",
                                    lineNumber: 382,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 381,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold mb-2",
                                        children: "Analyse läuft..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 385,
                                        columnNumber: 15
                                    }, this),
                                    dateiName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground mb-1",
                                        children: dateiName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 386,
                                        columnNumber: 29
                                    }, this),
                                    dateiInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground",
                                        children: dateiInfo
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 387,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 384,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-w-md mx-auto space-y-3",
                                children: ANALYSE_STEPS.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            i < analyseSchritt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                className: "h-4 w-4 text-green-500 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 393,
                                                columnNumber: 21
                                            }, this) : i === analyseSchritt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                className: "h-4 w-4 animate-spin text-primary shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 395,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 397,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `text-sm ${i <= analyseSchritt ? 'text-foreground' : 'text-muted-foreground'}`,
                                                children: step
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 399,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 391,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 389,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/check/page.tsx",
                        lineNumber: 380,
                        columnNumber: 11
                    }, this),
                    phase === 'results' && ergebnis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-bold",
                                                children: "Hallen-Check Ergebnis"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 414,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-muted-foreground mt-1",
                                                children: [
                                                    dateiName,
                                                    " · ",
                                                    dateiInfo
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 415,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 413,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        size: "sm",
                                        className: "gap-2",
                                        onClick: ()=>{
                                            setPhase('upload');
                                            setErgebnis(null);
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/check/page.tsx",
                                                lineNumber: 420,
                                                columnNumber: 17
                                            }, this),
                                            "Neue Analyse"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/check/page.tsx",
                                        lineNumber: 419,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 412,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$check$2f$KundenCheckResults$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["KundenCheckResults"], {
                                hall: ergebnis.layout.hall,
                                objects: ergebnis.layout.objects,
                                gaenge: ergebnis.layout.gaenge,
                                records: ergebnis.records,
                                ergebnis: ergebnis.ergebnis,
                                analyse: ergebnis.analyse,
                                benchmarkErgebnis: ergebnis.benchmarkErgebnis,
                                ampelBewertung: ergebnis.ampelBewertung,
                                torZuordnungen: ergebnis.layout.torZuordnungen,
                                relationZuordnungen: ergebnis.layout.relationZuordnungen,
                                stundenProfil: ergebnis.stundenProfil,
                                abteilungen: ergebnis.abteilungen,
                                onOpenEditor: handleOpenEditor
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 426,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/check/page.tsx",
                        lineNumber: 410,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/check/page.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "border-t mt-16",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto px-4 py-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center text-sm text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "TOPIS Hallen-Check · ROTH Logistikberatung © 2026"
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 449,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "mailto:info@roth-logistik.de",
                                className: "hover:text-foreground",
                                children: "info@roth-logistik.de"
                            }, void 0, false, {
                                fileName: "[project]/src/app/check/page.tsx",
                                lineNumber: 450,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/check/page.tsx",
                        lineNumber: 448,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/check/page.tsx",
                    lineNumber: 447,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/check/page.tsx",
                lineNumber: 446,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/check/page.tsx",
        lineNumber: 280,
        columnNumber: 5
    }, this);
}
/** Yield to event loop for UI updates */ function tick() {
    return new Promise((resolve)=>setTimeout(resolve, 80));
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__881bd09a._.js.map