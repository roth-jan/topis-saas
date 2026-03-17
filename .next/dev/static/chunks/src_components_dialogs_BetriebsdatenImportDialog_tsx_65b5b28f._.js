(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BetriebsdatenImportDialog",
    ()=>BetriebsdatenImportDialog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/betriebsdaten-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/database.js [app-client] (ecmascript) <export default as Database>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.js [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/thermometer.js [app-client] (ecmascript) <export default as Thermometer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link-2.js [app-client] (ecmascript) <export default as Link2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/heatmap-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spaltenzuordnungen$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/spaltenzuordnungen.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
function BetriebsdatenImportDialog() {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [csvText, setCsvText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [importing, setImporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Parsed data
    const [parsedRecords, setParsedRecords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [erkanntesProfil, setErkanntesProfil] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedProfilId, setSelectedProfilId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [csvHeaders, setCsvHeaders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Zuordnungen
    const [torZuordnungen, setTorZuordnungen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [relationZuordnungen, setRelationZuordnungen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Store
    const importScandatenRecords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[importScandatenRecords]": (s)=>s.importScandatenRecords
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[importScandatenRecords]"]);
    const setAnalyse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[setAnalyse]": (s)=>s.setAnalyse
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[setAnalyse]"]);
    const storeTorZuordnungen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[storeTorZuordnungen]": (s)=>s.setTorZuordnungen
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[storeTorZuordnungen]"]);
    const storeRelationZuordnungen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[storeRelationZuordnungen]": (s)=>s.setRelationZuordnungen
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[storeRelationZuordnungen]"]);
    const storeSpaltenzuordnung = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[storeSpaltenzuordnung]": (s)=>s.setSpaltenzuordnung
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[storeSpaltenzuordnung]"]);
    const heatmapConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[heatmapConfig]": (s)=>s.heatmapConfig
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[heatmapConfig]"]);
    const setHeatmapConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[setHeatmapConfig]": (s)=>s.setHeatmapConfig
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[setHeatmapConfig]"]);
    const toggleHeatmap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[toggleHeatmap]": (s)=>s.toggleHeatmap
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[toggleHeatmap]"]);
    const analyse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "BetriebsdatenImportDialog.useBetriebsdatenStore[analyse]": (s)=>s.analyse
    }["BetriebsdatenImportDialog.useBetriebsdatenStore[analyse]"]);
    const objects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "BetriebsdatenImportDialog.useTopisStore[objects]": (s)=>s.objects
    }["BetriebsdatenImportDialog.useTopisStore[objects]"]);
    // Layout-Tore und Bereiche
    const layoutTore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BetriebsdatenImportDialog.useMemo[layoutTore]": ()=>objects.filter({
                "BetriebsdatenImportDialog.useMemo[layoutTore]": (o)=>o.type === 'tor'
            }["BetriebsdatenImportDialog.useMemo[layoutTore]"])
    }["BetriebsdatenImportDialog.useMemo[layoutTore]"], [
        objects
    ]);
    const layoutBereiche = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BetriebsdatenImportDialog.useMemo[layoutBereiche]": ()=>objects.filter({
                "BetriebsdatenImportDialog.useMemo[layoutBereiche]": (o)=>[
                        'bereich',
                        'stellplatz',
                        'entladebereich'
                    ].includes(o.type)
            }["BetriebsdatenImportDialog.useMemo[layoutBereiche]"])
    }["BetriebsdatenImportDialog.useMemo[layoutBereiche]"], [
        objects
    ]);
    // ==================== STEP 1: Datei + Format ====================
    const handleFileUpload = (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev)=>{
            const text = ev.target?.result;
            setCsvText(text);
            parseAndDetect(text);
        };
        reader.readAsText(file);
    };
    const parseAndDetect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "BetriebsdatenImportDialog.useCallback[parseAndDetect]": (text, profilOverride)=>{
            const profil = profilOverride || (selectedProfilId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spaltenzuordnungen$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPALTEN_PROFILE"].find({
                "BetriebsdatenImportDialog.useCallback[parseAndDetect]": (p)=>p.id === selectedProfilId
            }["BetriebsdatenImportDialog.useCallback[parseAndDetect]"]) : undefined);
            const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spaltenzuordnungen$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseCsvMitProfil"])(text, profil || undefined);
            setParsedRecords(result.records);
            setCsvHeaders(result.headers);
            if (result.erkanntesProfil && !profilOverride) {
                setErkanntesProfil(result.erkanntesProfil);
                setSelectedProfilId(result.erkanntesProfil.id);
            }
            // Auto-Tor-Zuordnung
            if (result.records.length > 0) {
                const uniqueStellplaetze = [
                    ...new Set(result.records.map({
                        "BetriebsdatenImportDialog.useCallback[parseAndDetect]": (r)=>r.stellplatz
                    }["BetriebsdatenImportDialog.useCallback[parseAndDetect]"]).filter(Boolean))
                ];
                const autoZuordnungen = uniqueStellplaetze.map({
                    "BetriebsdatenImportDialog.useCallback[parseAndDetect].autoZuordnungen": (sp)=>{
                        // Auto-Match: stellplatz === torNummer
                        const spNum = parseInt(sp);
                        const matchedTor = layoutTore.find({
                            "BetriebsdatenImportDialog.useCallback[parseAndDetect].autoZuordnungen.matchedTor": (t)=>t.torNummer === spNum || t.name?.toLowerCase() === sp.toLowerCase() || t.name?.toLowerCase() === `tor ${sp}`.toLowerCase() || t.name?.toLowerCase().includes(sp.toLowerCase())
                        }["BetriebsdatenImportDialog.useCallback[parseAndDetect].autoZuordnungen.matchedTor"]);
                        return {
                            stellplatzKey: sp,
                            objectId: matchedTor?.id || 0,
                            objectName: matchedTor?.name || '(nicht zugeordnet)',
                            autoMatched: !!matchedTor
                        };
                    }
                }["BetriebsdatenImportDialog.useCallback[parseAndDetect].autoZuordnungen"]);
                setTorZuordnungen(autoZuordnungen);
                // Auto-Relations-Zuordnung
                const uniqueRelationen = [
                    ...new Set(result.records.map({
                        "BetriebsdatenImportDialog.useCallback[parseAndDetect]": (r)=>r.ausgangsrelation
                    }["BetriebsdatenImportDialog.useCallback[parseAndDetect]"]).filter(Boolean))
                ];
                const autoRelationen = uniqueRelationen.map({
                    "BetriebsdatenImportDialog.useCallback[parseAndDetect].autoRelationen": (rel)=>{
                        const matchedBereich = layoutBereiche.find({
                            "BetriebsdatenImportDialog.useCallback[parseAndDetect].autoRelationen.matchedBereich": (b)=>b.name?.toLowerCase() === rel.toLowerCase() || b.name?.toLowerCase().includes(rel.toLowerCase()) || rel.toLowerCase().includes(b.name?.toLowerCase() || '---')
                        }["BetriebsdatenImportDialog.useCallback[parseAndDetect].autoRelationen.matchedBereich"]);
                        return {
                            relationKey: rel,
                            objectId: matchedBereich?.id || null,
                            objectName: matchedBereich?.name || '(nicht zugeordnet)'
                        };
                    }
                }["BetriebsdatenImportDialog.useCallback[parseAndDetect].autoRelationen"]);
                setRelationZuordnungen(autoRelationen);
            }
        }
    }["BetriebsdatenImportDialog.useCallback[parseAndDetect]"], [
        layoutTore,
        layoutBereiche,
        selectedProfilId
    ]);
    const handleProfilChange = (profilId)=>{
        setSelectedProfilId(profilId);
        const profil = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spaltenzuordnungen$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPALTEN_PROFILE"].find((p)=>p.id === profilId);
        if (csvText && profil) {
            parseAndDetect(csvText, profil);
        }
    };
    // ==================== STEP 2: Tor-Zuordnung ====================
    const handleTorZuordnungChange = (stellplatzKey, objectId)=>{
        setTorZuordnungen((prev)=>prev.map((z)=>{
                if (z.stellplatzKey !== stellplatzKey) return z;
                const obj = layoutTore.find((t)=>t.id === objectId);
                return {
                    ...z,
                    objectId,
                    objectName: obj?.name || '(nicht zugeordnet)',
                    autoMatched: false
                };
            }));
    };
    const zuordnungsStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BetriebsdatenImportDialog.useMemo[zuordnungsStats]": ()=>{
            const total = torZuordnungen.length;
            const zugeordnet = torZuordnungen.filter({
                "BetriebsdatenImportDialog.useMemo[zuordnungsStats]": (z)=>z.objectId > 0
            }["BetriebsdatenImportDialog.useMemo[zuordnungsStats]"]).length;
            const auto = torZuordnungen.filter({
                "BetriebsdatenImportDialog.useMemo[zuordnungsStats]": (z)=>z.autoMatched && z.objectId > 0
            }["BetriebsdatenImportDialog.useMemo[zuordnungsStats]"]).length;
            return {
                total,
                zugeordnet,
                auto
            };
        }
    }["BetriebsdatenImportDialog.useMemo[zuordnungsStats]"], [
        torZuordnungen
    ]);
    // ==================== STEP 3: Relations-Zuordnung ====================
    const handleRelationChange = (relationKey, objectId)=>{
        setRelationZuordnungen((prev)=>prev.map((z)=>{
                if (z.relationKey !== relationKey) return z;
                const obj = objectId ? [
                    ...layoutBereiche,
                    ...layoutTore
                ].find((b)=>b.id === objectId) : null;
                return {
                    ...z,
                    objectId,
                    objectName: obj?.name || '(nicht zugeordnet)'
                };
            }));
    };
    // ==================== STEP 4: Import ====================
    const handleImport = ()=>{
        setImporting(true);
        try {
            if (parsedRecords.length === 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Keine gültigen Datensätze gefunden');
                return;
            }
            // Store setzen
            importScandatenRecords(parsedRecords);
            storeTorZuordnungen(torZuordnungen);
            storeRelationZuordnungen(relationZuordnungen);
            storeSpaltenzuordnung(erkanntesProfil);
            // Analyse berechnen (mit Tor-Zuordnung statt Name-Match!)
            const result = analyseWithZuordnung(parsedRecords, torZuordnungen);
            setAnalyse(result);
            setHeatmapConfig({
                aktiv: true
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`${parsedRecords.length} Datensätze importiert, ${result.objektMetriken.length} Tore zugeordnet`);
            setOpen(false);
            resetWizard();
        } catch (e) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Fehler beim Import: ' + e.message);
        } finally{
            setImporting(false);
        }
    };
    /** Analyse MIT korrekter Tor-Zuordnung (statt fuzzy Name-Match) */ const analyseWithZuordnung = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (records, zuordnungen)=>{
            const daten = [
                ...new Set(records.map({
                    "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (r)=>r.scandatum
                }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"]).filter(Boolean))
            ];
            const arbeitstage = Math.max(daten.length, 1);
            const metriken = [];
            // Group by stellplatz
            const grouped = new Map();
            records.forEach({
                "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (r)=>{
                    const key = r.stellplatz || `MP${r.messpunkt}`;
                    if (!grouped.has(key)) grouped.set(key, []);
                    grouped.get(key).push(r);
                }
            }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"]);
            grouped.forEach({
                "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (recs, stellplatzKey)=>{
                    // Zuordnung über Tor-Zuordnungs-Tabelle (NICHT fuzzy Name!)
                    const zuordnung = zuordnungen.find({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].zuordnung": (z)=>z.stellplatzKey === stellplatzKey
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].zuordnung"]);
                    const objectId = zuordnung?.objectId || 0;
                    if (!objectId) return;
                    const obj = objects.find({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].obj": (o)=>o.id === objectId
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].obj"]);
                    if (!obj) return;
                    const totalSendungen = recs.reduce({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].totalSendungen": (s, r)=>s + r.sendungen
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].totalSendungen"], 0);
                    const totalColli = recs.reduce({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].totalColli": (s, r)=>s + r.colli
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].totalColli"], 0);
                    const totalGewicht = recs.reduce({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].totalGewicht": (s, r)=>s + r.gewicht
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].totalGewicht"], 0);
                    const ladezeiten = recs.filter({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].ladezeiten": (r)=>r.ladezeit
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].ladezeiten"]).map({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].ladezeiten": (r)=>r.ladezeit
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].ladezeiten"]);
                    const avgLadezeit = ladezeiten.length > 0 ? ladezeiten.reduce({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (a, b)=>a + b
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"], 0) / ladezeiten.length : 0;
                    // Check if already added (multiple stellplatz can map to same object)
                    const existing = metriken.find({
                        "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].existing": (m)=>m.objectId === objectId
                    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung].existing"]);
                    if (existing) {
                        existing.sendungen += totalSendungen / arbeitstage;
                        existing.colli += totalColli / arbeitstage;
                        existing.gewicht += totalGewicht / arbeitstage;
                        existing.fahrtenProTag += recs.length / arbeitstage;
                        existing.auslastung = Math.min(1, existing.sendungen / 50);
                    } else {
                        metriken.push({
                            objectId,
                            objectName: obj.name || stellplatzKey,
                            sendungen: totalSendungen / arbeitstage,
                            colli: totalColli / arbeitstage,
                            gewicht: totalGewicht / arbeitstage,
                            durchschnittLadezeit: avgLadezeit,
                            auslastung: Math.min(1, totalSendungen / arbeitstage / 50),
                            fahrtenProTag: recs.length / arbeitstage
                        });
                    }
                }
            }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"]);
            return {
                zeitraum: {
                    von: daten.sort()[0] || '',
                    bis: daten.sort()[daten.length - 1] || ''
                },
                arbeitstage,
                gesamtSendungen: records.reduce({
                    "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (s, r)=>s + r.sendungen
                }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"], 0),
                gesamtColli: records.reduce({
                    "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (s, r)=>s + r.colli
                }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"], 0),
                gesamtGewicht: records.reduce({
                    "BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]": (s, r)=>s + r.gewicht
                }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"], 0),
                objektMetriken: metriken
            };
        }
    }["BetriebsdatenImportDialog.useCallback[analyseWithZuordnung]"], [
        objects
    ]);
    const handleDemoData = ()=>{
        const tore = objects.filter((o)=>o.type === 'tor');
        if (tore.length === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Keine Tore im Layout vorhanden');
            return;
        }
        const metriken = tore.map((tor)=>({
                objectId: tor.id,
                objectName: tor.name || `Tor ${tor.id}`,
                sendungen: Math.round(5 + Math.random() * 45),
                colli: Math.round(20 + Math.random() * 180),
                gewicht: Math.round(500 + Math.random() * 9500),
                durchschnittLadezeit: Math.round(30 + Math.random() * 90),
                auslastung: 0.1 + Math.random() * 0.9,
                fahrtenProTag: Math.round(3 + Math.random() * 20)
            }));
        setAnalyse({
            zeitraum: {
                von: '2026-02-01',
                bis: '2026-02-28'
            },
            arbeitstage: 20,
            gesamtSendungen: metriken.reduce((s, m)=>s + m.sendungen * 20, 0),
            gesamtColli: metriken.reduce((s, m)=>s + m.colli * 20, 0),
            gesamtGewicht: metriken.reduce((s, m)=>s + m.gewicht * 20, 0),
            objektMetriken: metriken
        });
        setHeatmapConfig({
            aktiv: true
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Demo-Daten für ${metriken.length} Tore generiert`);
        setOpen(false);
    };
    const resetWizard = ()=>{
        setStep(1);
        setCsvText('');
        setParsedRecords([]);
        setErkanntesProfil(null);
        setSelectedProfilId('');
        setCsvHeaders([]);
        setTorZuordnungen([]);
        setRelationZuordnungen([]);
    };
    const canProceed = ()=>{
        switch(step){
            case 1:
                return parsedRecords.length > 0;
            case 2:
                return zuordnungsStats.zugeordnet > 0;
            case 3:
                return true; // Relations sind optional
            case 4:
                return true;
            default:
                return false;
        }
    };
    const stepLabels = [
        'Datei & Format',
        'Tor-Zuordnung',
        'Relationen',
        'Vorschau & Import'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: open,
        onOpenChange: (v)=>{
            setOpen(v);
            if (!v) resetWizard();
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTrigger"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    size: "sm",
                    className: "gap-1 text-xs",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                            lineNumber: 346,
                            columnNumber: 11
                        }, this),
                        "Betriebsdaten"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                    lineNumber: 345,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                lineNumber: 344,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                className: "max-w-3xl max-h-[85vh] overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$database$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Database$3e$__["Database"], {
                                        className: "h-5 w-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, this),
                                    "Betriebsdaten importieren"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 352,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                                children: "Scandaten (CSV) importieren, Tore zuordnen und Heatmaps erstellen."
                            }, void 0, false, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 356,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                        lineNumber: 351,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 mb-2",
                        children: stepLabels.map((label, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`,
                                        children: step > i + 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                            className: "h-3 w-3"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                            lineNumber: 374,
                                            columnNumber: 33
                                        }, this) : i + 1
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 365,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `text-xs truncate ${step === i + 1 ? 'font-medium' : 'text-muted-foreground'}`,
                                        children: label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 376,
                                        columnNumber: 15
                                    }, this),
                                    i < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-px bg-border min-w-2"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 379,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 364,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                        lineNumber: 362,
                        columnNumber: 9
                    }, this),
                    step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        children: "CSV-Datei hochladen"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 388,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                accept: ".csv,.txt,.tsv",
                                                onChange: handleFileUpload,
                                                className: "flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 390,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "secondary",
                                                size: "sm",
                                                onClick: handleDemoData,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                                                        className: "h-3.5 w-3.5 mr-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 397,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Demo-Daten"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 396,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 389,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 387,
                                columnNumber: 13
                            }, this),
                            csvText && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                children: "Format"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 406,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                value: selectedProfilId,
                                                onValueChange: handleProfilChange,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                        className: "h-8 text-xs mt-1",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                            placeholder: "Auto-Erkennung..."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 409,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 408,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                        children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$spaltenzuordnungen$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SPALTEN_PROFILE"].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                value: p.id,
                                                                children: [
                                                                    p.name,
                                                                    " ",
                                                                    erkanntesProfil?.id === p.id ? '(erkannt)' : ''
                                                                ]
                                                            }, p.id, true, {
                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                lineNumber: 413,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 411,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 407,
                                                columnNumber: 19
                                            }, this),
                                            erkanntesProfil && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground mt-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                        className: "h-3 w-3 inline mr-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 421,
                                                        columnNumber: 23
                                                    }, this),
                                                    "Auto-erkannt: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: erkanntesProfil.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 422,
                                                        columnNumber: 37
                                                    }, this),
                                                    " — ",
                                                    erkanntesProfil.beschreibung
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 420,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 405,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                children: [
                                                    "Vorschau (",
                                                    csvText.split('\n').length - 1,
                                                    " Zeilen)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 428,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                value: csvText.split('\n').slice(0, 6).join('\n') + (csvText.split('\n').length > 6 ? '\n...' : ''),
                                                readOnly: true,
                                                rows: 5,
                                                className: "mt-1 w-full rounded border bg-muted p-2 font-mono text-xs"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 429,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 427,
                                        columnNumber: 17
                                    }, this),
                                    parsedRecords.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-lg border bg-green-500/10 p-3 text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: parsedRecords.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 439,
                                                columnNumber: 21
                                            }, this),
                                            " Datensätze erkannt |",
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    ...new Set(parsedRecords.map((r)=>r.stellplatz).filter(Boolean))
                                                ].length
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 440,
                                                columnNumber: 21
                                            }, this),
                                            ' ',
                                            "unique Stellplätze |",
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    ...new Set(parsedRecords.map((r)=>r.ausgangsrelation).filter(Boolean))
                                                ].length
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 442,
                                                columnNumber: 21
                                            }, this),
                                            ' ',
                                            "Relationen |",
                                            ' ',
                                            "Spalten: ",
                                            csvHeaders.join(', ')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 438,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                        lineNumber: 386,
                        columnNumber: 11
                    }, this),
                    step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link2$3e$__["Link2"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 458,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Stellplatz → Layout-Tor"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 457,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground mt-0.5",
                                                children: "Ordne CSV-Stellplätze den Toren im Layout zu."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 461,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 456,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-right",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-green-500 font-medium",
                                                children: zuordnungsStats.zugeordnet
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 466,
                                                columnNumber: 17
                                            }, this),
                                            " / ",
                                            zuordnungsStats.total,
                                            " zugeordnet",
                                            zuordnungsStats.auto > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-muted-foreground ml-1",
                                                children: [
                                                    "(",
                                                    zuordnungsStats.auto,
                                                    " auto)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 468,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 465,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 455,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-[400px] overflow-y-auto border rounded",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "bg-muted sticky top-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left p-2 font-medium",
                                                        children: "Stellplatz (CSV)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 477,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left p-2 font-medium",
                                                        children: "Scans"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 478,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left p-2 font-medium",
                                                        children: "Colli"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 479,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left p-2 font-medium",
                                                        children: "Layout-Tor"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 480,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 476,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                            lineNumber: 475,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: torZuordnungen.map((z)=>{
                                                const scans = parsedRecords.filter((r)=>r.stellplatz === z.stellplatzKey);
                                                const totalColli = scans.reduce((s, r)=>s + r.colli, 0);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: `border-t ${z.objectId > 0 ? '' : 'bg-red-500/5'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2 font-mono",
                                                            children: z.stellplatzKey
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 492,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2",
                                                            children: scans.length
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 493,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2",
                                                            children: Math.round(totalColli).toLocaleString('de-DE')
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 494,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                value: z.objectId > 0 ? z.objectId.toString() : '0',
                                                                onValueChange: (v)=>handleTorZuordnungChange(z.stellplatzKey, parseInt(v)),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                        className: "h-7 text-xs",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {}, void 0, false, {
                                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                            lineNumber: 501,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 500,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                value: "0",
                                                                                children: "(nicht zugeordnet)"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                                lineNumber: 504,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            layoutTore.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: t.id.toString(),
                                                                                    children: [
                                                                                        t.name || `Tor ${t.torNummer || t.id}`,
                                                                                        t.torNummer ? ` (#${t.torNummer})` : ''
                                                                                    ]
                                                                                }, t.id, true, {
                                                                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                                    lineNumber: 506,
                                                                                    columnNumber: 33
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 503,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                lineNumber: 496,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 495,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, z.stellplatzKey, true, {
                                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                    lineNumber: 488,
                                                    columnNumber: 23
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                            lineNumber: 483,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                    lineNumber: 474,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 473,
                                columnNumber: 13
                            }, this),
                            torZuordnungen.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center text-sm text-muted-foreground py-8",
                                children: [
                                    "Keine Stellplätze in den Daten gefunden.",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 524,
                                        columnNumber: 17
                                    }, this),
                                    "Stelle sicher, dass das CSV-Format korrekt erkannt wurde."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 522,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                        lineNumber: 454,
                        columnNumber: 11
                    }, this),
                    step === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 536,
                                                columnNumber: 17
                                            }, this),
                                            "Ausgangsrelation → Layout-Bereich"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 535,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mt-0.5",
                                        children: "Optional: Ordne Relationen Layout-Bereichen zu (für Flächenbedarf + Verteilweg)."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 539,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 534,
                                columnNumber: 13
                            }, this),
                            relationZuordnungen.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-[400px] overflow-y-auto border rounded",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                    className: "w-full text-xs",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                            className: "bg-muted sticky top-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left p-2 font-medium",
                                                        children: "Relation (CSV)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 549,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left p-2 font-medium",
                                                        children: "Colli"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        className: "text-left p-2 font-medium",
                                                        children: "Layout-Bereich"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 551,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 548,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                            lineNumber: 547,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: relationZuordnungen.map((z)=>{
                                                const recs = parsedRecords.filter((r)=>r.ausgangsrelation === z.relationKey);
                                                const totalColli = recs.reduce((s, r)=>s + r.colli, 0);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "border-t",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2 font-mono",
                                                            children: z.relationKey
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 560,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2",
                                                            children: Math.round(totalColli).toLocaleString('de-DE')
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 561,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-2",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                value: z.objectId?.toString() || '0',
                                                                onValueChange: (v)=>handleRelationChange(z.relationKey, v === '0' ? null : parseInt(v)),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                        className: "h-7 text-xs",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {}, void 0, false, {
                                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                            lineNumber: 570,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 569,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                value: "0",
                                                                                children: "(nicht zugeordnet)"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                                lineNumber: 573,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            layoutBereiche.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                    value: b.id.toString(),
                                                                                    children: b.name || `${b.type} ${b.id}`
                                                                                }, b.id, false, {
                                                                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                                    lineNumber: 575,
                                                                                    columnNumber: 35
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 572,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                lineNumber: 563,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                            lineNumber: 562,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, z.relationKey, true, {
                                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                    lineNumber: 559,
                                                    columnNumber: 25
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                            lineNumber: 554,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                    lineNumber: 546,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 545,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center text-sm text-muted-foreground py-8",
                                children: [
                                    "Keine Ausgangsrelationen in den Daten gefunden.",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 591,
                                        columnNumber: 17
                                    }, this),
                                    "Dieser Schritt kann übersprungen werden."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 589,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                        lineNumber: 533,
                        columnNumber: 11
                    }, this),
                    step === 4 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border bg-muted/50 p-4 space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 603,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium text-sm",
                                                children: "Import-Zusammenfassung"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 604,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 602,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-x-6 gap-y-1 text-sm",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Datensätze:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 608,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium",
                                                children: parsedRecords.length.toLocaleString('de-DE')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 609,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Format:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 611,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium",
                                                children: erkanntesProfil?.name || 'Unbekannt'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 612,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Unique Stellplätze:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 614,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium",
                                                children: [
                                                    ...new Set(parsedRecords.map((r)=>r.stellplatz).filter(Boolean))
                                                ].length
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 615,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Tore zugeordnet:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 619,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium text-green-500",
                                                children: [
                                                    zuordnungsStats.zugeordnet,
                                                    " / ",
                                                    zuordnungsStats.total
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 620,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Relationen zugeordnet:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 624,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium",
                                                children: [
                                                    relationZuordnungen.filter((r)=>r.objectId).length,
                                                    " / ",
                                                    relationZuordnungen.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 625,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Zeitraum:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 629,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium",
                                                children: parsedRecords.length > 0 ? (()=>{
                                                    const daten = [
                                                        ...new Set(parsedRecords.map((r)=>r.scandatum).filter(Boolean))
                                                    ].sort();
                                                    return `${daten[0]} – ${daten[daten.length - 1]} (${daten.length} Tage)`;
                                                })() : '-'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 630,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Gesamt Colli:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 639,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium",
                                                children: Math.round(parsedRecords.reduce((s, r)=>s + r.colli, 0)).toLocaleString('de-DE')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 640,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: "Gesamt Sendungen:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 644,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-medium",
                                                children: Math.round(parsedRecords.reduce((s, r)=>s + r.sendungen, 0)).toLocaleString('de-DE')
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 645,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 607,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 601,
                                columnNumber: 13
                            }, this),
                            analyse && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border bg-muted/50 p-3 space-y-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-medium flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$thermometer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Thermometer$3e$__["Thermometer"], {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 656,
                                                        columnNumber: 21
                                                    }, this),
                                                    "Heatmap"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 655,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: heatmapConfig.aktiv ? 'default' : 'outline',
                                                size: "sm",
                                                onClick: toggleHeatmap,
                                                children: heatmapConfig.aktiv ? 'Aktiv' : 'Inaktiv'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 659,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 654,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        className: "text-xs",
                                                        children: "Metrik"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 670,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                        value: heatmapConfig.modus,
                                                        onValueChange: (v)=>setHeatmapConfig({
                                                                modus: v
                                                            }),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                className: "h-8 text-xs",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {}, void 0, false, {
                                                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                    lineNumber: 676,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                lineNumber: 675,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                children: [
                                                                    'sendungen',
                                                                    'colli',
                                                                    'gewicht',
                                                                    'auslastung',
                                                                    'ladezeit',
                                                                    'colliVerteilung'
                                                                ].map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                        value: m,
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModusLabel"])(m)
                                                                    }, m, false, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 689,
                                                                        columnNumber: 27
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                lineNumber: 678,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 671,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 669,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        className: "text-xs",
                                                        children: "Farbskala"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 697,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                        value: heatmapConfig.farbskala,
                                                        onValueChange: (v)=>setHeatmapConfig({
                                                                farbskala: v
                                                            }),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                className: "h-8 text-xs",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {}, void 0, false, {
                                                                    fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                    lineNumber: 705,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                lineNumber: 704,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                        value: "gruen-rot",
                                                                        children: "Grün → Rot"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 708,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                        value: "blau-rot",
                                                                        children: "Blau → Rot"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 709,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                        value: "mono",
                                                                        children: "Mono (Rot)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                        lineNumber: 710,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                                lineNumber: 707,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                        lineNumber: 698,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                                lineNumber: 696,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 668,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 653,
                                columnNumber: 15
                            }, this),
                            zuordnungsStats.zugeordnet < zuordnungsStats.total && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "Hinweis:"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 720,
                                        columnNumber: 17
                                    }, this),
                                    ' ',
                                    zuordnungsStats.total - zuordnungsStats.zugeordnet,
                                    " Stellplätze sind nicht zugeordnet. Daten dieser Stellplätze werden nicht in der Heatmap angezeigt."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 719,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                        lineNumber: 600,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between mt-4 pt-3 border-t",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                variant: "outline",
                                size: "sm",
                                onClick: ()=>setStep((s)=>Math.max(1, s - 1)),
                                disabled: step === 1,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        className: "h-4 w-4 mr-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 736,
                                        columnNumber: 13
                                    }, this),
                                    "Zurück"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 730,
                                columnNumber: 11
                            }, this),
                            step < 4 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                onClick: ()=>setStep((s)=>Math.min(4, s + 1)),
                                disabled: !canProceed(),
                                children: [
                                    "Weiter",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        className: "h-4 w-4 ml-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 747,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 741,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                size: "sm",
                                onClick: handleImport,
                                disabled: importing,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                        className: "h-4 w-4 mr-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                        lineNumber: 751,
                                        columnNumber: 15
                                    }, this),
                                    importing ? 'Importiere...' : 'Importieren & Analysieren'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                                lineNumber: 750,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                        lineNumber: 729,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
                lineNumber: 350,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dialogs/BetriebsdatenImportDialog.tsx",
        lineNumber: 337,
        columnNumber: 5
    }, this);
}
_s(BetriebsdatenImportDialog, "otSI0D+zjW36cLuAE8QFjnylcv8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"]
    ];
});
_c = BetriebsdatenImportDialog;
var _c;
__turbopack_context__.k.register(_c, "BetriebsdatenImportDialog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_dialogs_BetriebsdatenImportDialog_tsx_65b5b28f._.js.map