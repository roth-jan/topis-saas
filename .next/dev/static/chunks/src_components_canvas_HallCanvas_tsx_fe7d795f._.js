(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/canvas/HallCanvas.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HallCanvas",
    ()=>HallCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/betriebsdaten-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/topis.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/heatmap-utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function HallCanvas() {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hall = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActiveHall"])();
    const objects = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useObjects"])();
    const zoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZoom"])();
    const pan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePan"])();
    const tool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTool"])();
    const gaenge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[gaenge]": (s)=>s.gaenge
    }["HallCanvas.useTopisStore[gaenge]"]);
    const showGaenge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[showGaenge]": (s)=>s.showGaenge
    }["HallCanvas.useTopisStore[showGaenge]"]);
    const showGrid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[showGrid]": (s)=>s.showGrid
    }["HallCanvas.useTopisStore[showGrid]"]);
    const selectedObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectedObject]": (s)=>s.selectedObject
    }["HallCanvas.useTopisStore[selectedObject]"]);
    const paths = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[paths]": (s)=>s.paths
    }["HallCanvas.useTopisStore[paths]"]);
    const pathAreas = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[pathAreas]": (s)=>s.pathAreas
    }["HallCanvas.useTopisStore[pathAreas]"]);
    const conveyors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[conveyors]": (s)=>s.conveyors
    }["HallCanvas.useTopisStore[conveyors]"]);
    const addPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[addPath]": (s)=>s.addPath
    }["HallCanvas.useTopisStore[addPath]"]);
    const updatePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[updatePath]": (s)=>s.updatePath
    }["HallCanvas.useTopisStore[updatePath]"]);
    const deletePath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[deletePath]": (s)=>s.deletePath
    }["HallCanvas.useTopisStore[deletePath]"]);
    const selectPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectPath]": (s)=>s.selectPath
    }["HallCanvas.useTopisStore[selectPath]"]);
    const selectedPath = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectedPath]": (s)=>s.selectedPath
    }["HallCanvas.useTopisStore[selectedPath]"]);
    const addPathArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[addPathArea]": (s)=>s.addPathArea
    }["HallCanvas.useTopisStore[addPathArea]"]);
    const addConveyor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[addConveyor]": (s)=>s.addConveyor
    }["HallCanvas.useTopisStore[addConveyor]"]);
    const setZoom = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[setZoom]": (s)=>s.setZoom
    }["HallCanvas.useTopisStore[setZoom]"]);
    const setPan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[setPan]": (s)=>s.setPan
    }["HallCanvas.useTopisStore[setPan]"]);
    const selectObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectObject]": (s)=>s.selectObject
    }["HallCanvas.useTopisStore[selectObject]"]);
    const updateObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[updateObject]": (s)=>s.updateObject
    }["HallCanvas.useTopisStore[updateObject]"]);
    const addObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[addObject]": (s)=>s.addObject
    }["HallCanvas.useTopisStore[addObject]"]);
    const addGang = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[addGang]": (s)=>s.addGang
    }["HallCanvas.useTopisStore[addGang]"]);
    const selectGang = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectGang]": (s)=>s.selectGang
    }["HallCanvas.useTopisStore[selectGang]"]);
    const selectedGang = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectedGang]": (s)=>s.selectedGang
    }["HallCanvas.useTopisStore[selectedGang]"]);
    const selectPathArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectPathArea]": (s)=>s.selectPathArea
    }["HallCanvas.useTopisStore[selectPathArea]"]);
    const selectedPathArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectedPathArea]": (s)=>s.selectedPathArea
    }["HallCanvas.useTopisStore[selectedPathArea]"]);
    const selectConveyor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectConveyor]": (s)=>s.selectConveyor
    }["HallCanvas.useTopisStore[selectConveyor]"]);
    const selectedConveyor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[selectedConveyor]": (s)=>s.selectedConveyor
    }["HallCanvas.useTopisStore[selectedConveyor]"]);
    const setTool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"])({
        "HallCanvas.useTopisStore[setTool]": (s)=>s.setTool
    }["HallCanvas.useTopisStore[setTool]"]);
    const heatmapConfig = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useHeatmapConfig"])();
    const betriebsAnalyse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"])({
        "HallCanvas.useBetriebsdatenStore[betriebsAnalyse]": (s)=>s.analyse
    }["HallCanvas.useBetriebsdatenStore[betriebsAnalyse]"]);
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dragStart, setDragStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        x: 0,
        y: 0
    });
    const [dragObject, setDragObject] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Gang drawing state
    const [gangDrawStart, setGangDrawStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gangMousePos, setGangMousePos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Path drawing state
    const [pathDrawing, setPathDrawing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pathDragStart, setPathDragStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentPath, setCurrentPath] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pathMousePos, setPathMousePos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // PathArea drawing state
    const [pathAreaStart, setPathAreaStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pathAreaMousePos, setPathAreaMousePos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Measure tool state
    const [measureStart, setMeasureStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [measureEnd, setMeasureEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Conveyor drawing state
    const [currentConveyor, setCurrentConveyor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [conveyorMousePos, setConveyorMousePos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Context menu state (for paths)
    const [contextMenu, setContextMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Object context menu state (right-click on overlapping objects)
    const [objectContextMenu, setObjectContextMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Click-cycling state: track last click position and cycle index
    const [clickCycle, setClickCycle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Selected waypoint index (for highlighting)
    const [selectedWaypointIndex, setSelectedWaypointIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Waypoint dragging state
    const [draggingWaypoint, setDraggingWaypoint] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Convert world coordinates to screen coordinates
    const worldToScreen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[worldToScreen]": (x, y)=>({
                x: x * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom + pan.x,
                y: y * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom + pan.y
            })
    }["HallCanvas.useCallback[worldToScreen]"], [
        zoom,
        pan
    ]);
    // Convert screen coordinates to world coordinates
    const screenToWorld = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[screenToWorld]": (x, y)=>({
                x: (x - pan.x) / (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom),
                y: (y - pan.y) / (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom)
            })
    }["HallCanvas.useCallback[screenToWorld]"], [
        zoom,
        pan
    ]);
    // Find ALL objects at position, sorted smallest first
    const findAllObjectsAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findAllObjectsAt]": (wx, wy)=>{
            const tolerance = Math.max(0.5, 2 / zoom);
            const hits = [];
            for (const obj of objects){
                if (wx >= obj.x && wx <= obj.x + obj.width && wy >= obj.y && wy <= obj.y + obj.height) {
                    hits.push(obj);
                }
            }
            // Also check with tolerance for small nearby objects
            if (hits.length === 0) {
                for (const obj of objects){
                    if (wx >= obj.x - tolerance && wx <= obj.x + obj.width + tolerance && wy >= obj.y - tolerance && wy <= obj.y + obj.height + tolerance) {
                        hits.push(obj);
                    }
                }
            }
            // Sort by area: smallest first
            hits.sort({
                "HallCanvas.useCallback[findAllObjectsAt]": (a, b)=>a.width * a.height - b.width * b.height
            }["HallCanvas.useCallback[findAllObjectsAt]"]);
            return hits;
        }
    }["HallCanvas.useCallback[findAllObjectsAt]"], [
        objects,
        zoom
    ]);
    // Find object at position with click-cycling support
    const findObjectAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findObjectAt]": (wx, wy)=>{
            const hits = findAllObjectsAt(wx, wy);
            if (hits.length === 0) return null;
            // Check if this is a repeated click at the same position (within 3m tolerance)
            const now = Date.now();
            if (clickCycle && Math.abs(wx - clickCycle.wx) < 3 && Math.abs(wy - clickCycle.wy) < 3 && now - clickCycle.timestamp < 2000) {
                // Cycle to next object
                const nextIndex = (clickCycle.index + 1) % hits.length;
                setClickCycle({
                    wx,
                    wy,
                    index: nextIndex,
                    timestamp: now
                });
                return hits[nextIndex];
            }
            // First click at this position: pick smallest
            setClickCycle({
                wx,
                wy,
                index: 0,
                timestamp: now
            });
            return hits[0];
        }
    }["HallCanvas.useCallback[findObjectAt]"], [
        findAllObjectsAt,
        clickCycle
    ]);
    // Find nearest object within tolerance (for path endpoint linking)
    const findNearestObject = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findNearestObject]": (wx, wy, tolerance = 3)=>{
            let nearest = null;
            let minDist = tolerance;
            for (const obj of objects){
                // Check distance to object center
                const centerX = obj.x + obj.width / 2;
                const centerY = obj.y + obj.height / 2;
                const dist = Math.sqrt(Math.pow(wx - centerX, 2) + Math.pow(wy - centerY, 2));
                // Also check if point is inside or very close to object bounds
                const insideOrNear = wx >= obj.x - tolerance && wx <= obj.x + obj.width + tolerance && wy >= obj.y - tolerance && wy <= obj.y + obj.height + tolerance;
                if (insideOrNear && dist < minDist) {
                    minDist = dist;
                    nearest = obj;
                }
            }
            return nearest;
        }
    }["HallCanvas.useCallback[findNearestObject]"], [
        objects
    ]);
    // Find gang at position (point-to-line-segment distance with breite tolerance)
    const findGangAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findGangAt]": (wx, wy)=>{
            if (!showGaenge) return null;
            for (const gang of gaenge){
                if (gang.points.length < 2) continue;
                const p1 = gang.points[0];
                const p2 = gang.points[1];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const lenSq = dx * dx + dy * dy;
                if (lenSq === 0) continue;
                const t = Math.max(0, Math.min(1, ((wx - p1.x) * dx + (wy - p1.y) * dy) / lenSq));
                const projX = p1.x + t * dx;
                const projY = p1.y + t * dy;
                const dist = Math.sqrt((wx - projX) ** 2 + (wy - projY) ** 2);
                if (dist <= gang.breite / 2 + 0.5) return gang;
            }
            return null;
        }
    }["HallCanvas.useCallback[findGangAt]"], [
        gaenge,
        showGaenge
    ]);
    // Find pathArea at position
    const findPathAreaAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findPathAreaAt]": (wx, wy)=>{
            for (const area of pathAreas){
                if (area.x != null && area.y != null && area.width != null && area.height != null) {
                    if (wx >= area.x && wx <= area.x + area.width && wy >= area.y && wy <= area.y + area.height) {
                        return area;
                    }
                }
            }
            return null;
        }
    }["HallCanvas.useCallback[findPathAreaAt]"], [
        pathAreas
    ]);
    // Find conveyor at position
    const findConveyorAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findConveyorAt]": (wx, wy)=>{
            const tolerance = Math.max(1, 2 / zoom);
            for (const conv of conveyors){
                for(let i = 0; i < conv.points.length - 1; i++){
                    const p1 = conv.points[i];
                    const p2 = conv.points[i + 1];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const lenSq = dx * dx + dy * dy;
                    if (lenSq === 0) continue;
                    const t = Math.max(0, Math.min(1, ((wx - p1.x) * dx + (wy - p1.y) * dy) / lenSq));
                    const projX = p1.x + t * dx;
                    const projY = p1.y + t * dy;
                    const dist = Math.sqrt((wx - projX) ** 2 + (wy - projY) ** 2);
                    if (dist <= tolerance) return conv;
                }
            }
            return null;
        }
    }["HallCanvas.useCallback[findConveyorAt]"], [
        conveyors,
        zoom
    ]);
    // Save path with automatic object linking
    const savePathWithLinks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[savePathWithLinks]": (waypoints, color = '#f59e0b')=>{
            if (waypoints.length < 2) return;
            const firstPoint = waypoints[0];
            const lastPoint = waypoints[waypoints.length - 1];
            // Find objects at start and end
            const startObj = findNearestObject(firstPoint.x, firstPoint.y, 5);
            const endObj = findNearestObject(lastPoint.x, lastPoint.y, 5);
            // Generate name based on linked objects
            let name;
            if (startObj && endObj) {
                name = `${startObj.name} → ${endObj.name}`;
            } else if (startObj) {
                name = `${startObj.name} → ...`;
            } else if (endObj) {
                name = `... → ${endObj.name}`;
            } else {
                name = `Weg ${paths.length + 1}`;
            }
            addPath({
                name,
                waypoints,
                color,
                startObjectId: startObj?.id,
                startObjectName: startObj?.name,
                endObjectId: endObj?.id,
                endObjectName: endObj?.name
            });
            // Show detailed toast
            if (startObj || endObj) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Weg gespeichert: ${name}`);
            } else {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Weg gespeichert');
            }
        }
    }["HallCanvas.useCallback[savePathWithLinks]"], [
        addPath,
        findNearestObject,
        paths.length
    ]);
    // Find waypoint at position (returns path and waypoint index)
    const findWaypointAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findWaypointAt]": (wx, wy)=>{
            const threshold = 2; // 2m click tolerance for waypoints
            for(let i = paths.length - 1; i >= 0; i--){
                const path = paths[i];
                for(let j = 0; j < path.waypoints.length; j++){
                    const wp = path.waypoints[j];
                    const dist = Math.sqrt(Math.pow(wx - wp.x, 2) + Math.pow(wy - wp.y, 2));
                    if (dist < threshold) {
                        return {
                            path,
                            waypointIndex: j
                        };
                    }
                }
            }
            return null;
        }
    }["HallCanvas.useCallback[findWaypointAt]"], [
        paths
    ]);
    // Find path at position (check if click is near any path segment)
    const findPathAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[findPathAt]": (wx, wy)=>{
            const threshold = 1.5; // 1.5m click tolerance
            for(let i = paths.length - 1; i >= 0; i--){
                const path = paths[i];
                if (path.waypoints.length < 2) continue;
                // Check each segment
                for(let j = 0; j < path.waypoints.length - 1; j++){
                    const p1 = path.waypoints[j];
                    const p2 = path.waypoints[j + 1];
                    // Calculate distance from point to line segment
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const lengthSq = dx * dx + dy * dy;
                    if (lengthSq === 0) continue;
                    // Project point onto line segment
                    const t = Math.max(0, Math.min(1, ((wx - p1.x) * dx + (wy - p1.y) * dy) / lengthSq));
                    const projX = p1.x + t * dx;
                    const projY = p1.y + t * dy;
                    // Distance to projected point
                    const dist = Math.sqrt(Math.pow(wx - projX, 2) + Math.pow(wy - projY, 2));
                    if (dist < threshold) {
                        return path;
                    }
                }
            }
            return null;
        }
    }["HallCanvas.useCallback[findPathAt]"], [
        paths
    ]);
    // Draw function
    const draw = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "HallCanvas.useCallback[draw]": ()=>{
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;
            // Clear canvas
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw grid
            if (showGrid) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                const gridPx = 1 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                for(let x = pan.x % gridPx; x < canvas.width; x += gridPx){
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvas.height);
                    ctx.stroke();
                }
                for(let y = pan.y % gridPx; y < canvas.height; y += gridPx){
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y);
                    ctx.stroke();
                }
            }
            // Draw hall
            if (hall) {
                const pos = worldToScreen(0, 0);
                const w = hall.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                const h = hall.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                // Hall background
                ctx.fillStyle = hall.color || '#16213e';
                ctx.fillRect(pos.x, pos.y, w, h);
                // Hall border
                ctx.strokeStyle = '#4a5568';
                ctx.lineWidth = 2;
                ctx.strokeRect(pos.x, pos.y, w, h);
                // Hall name
                ctx.fillStyle = '#718096';
                ctx.font = `${12 * zoom}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(hall.name, pos.x + w / 2, pos.y - 8);
            }
            // Draw PathAreas (before objects for transparency)
            if (pathAreas.length > 0) {
                pathAreas.forEach({
                    "HallCanvas.useCallback[draw]": (area)=>{
                        const isSelectedArea = selectedPathArea?.id === area.id;
                        ctx.fillStyle = isSelectedArea ? 'rgba(100, 150, 255, 0.4)' : 'rgba(100, 150, 255, 0.2)';
                        ctx.strokeStyle = isSelectedArea ? '#00bcd4' : 'rgba(100, 150, 255, 0.6)';
                        ctx.lineWidth = isSelectedArea ? 3 : 2;
                        if (area.x !== undefined && area.y !== undefined && area.width !== undefined && area.height !== undefined) {
                            // Rectangle format
                            const p1 = worldToScreen(area.x, area.y);
                            const p2 = worldToScreen(area.x + area.width, area.y + area.height);
                            ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                            ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                        } else if (area.points && area.points.length >= 3) {
                            // Polygon format
                            ctx.beginPath();
                            const first = worldToScreen(area.points[0].x, area.points[0].y);
                            ctx.moveTo(first.x, first.y);
                            area.points.slice(1).forEach({
                                "HallCanvas.useCallback[draw]": (p)=>{
                                    const sp = worldToScreen(p.x, p.y);
                                    ctx.lineTo(sp.x, sp.y);
                                }
                            }["HallCanvas.useCallback[draw]"]);
                            ctx.closePath();
                            ctx.fill();
                            ctx.stroke();
                        }
                    }
                }["HallCanvas.useCallback[draw]"]);
            }
            // Draw PathArea preview
            if (pathAreaStart && pathAreaMousePos) {
                const p1 = worldToScreen(Math.min(pathAreaStart.x, pathAreaMousePos.x), Math.min(pathAreaStart.y, pathAreaMousePos.y));
                const p2 = worldToScreen(Math.max(pathAreaStart.x, pathAreaMousePos.x), Math.max(pathAreaStart.y, pathAreaMousePos.y));
                ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
                ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                ctx.setLineDash([
                    5,
                    5
                ]);
                ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                ctx.setLineDash([]);
            }
            // Draw Gänge
            if (showGaenge && gaenge.length > 0) {
                gaenge.forEach({
                    "HallCanvas.useCallback[draw]": (gang)=>{
                        if (gang.points.length < 2) return;
                        const start = worldToScreen(gang.points[0].x, gang.points[0].y);
                        const end = worldToScreen(gang.points[1].x, gang.points[1].y);
                        const breite = gang.breite * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                        const isSelectedGangItem = selectedGang?.id === gang.id;
                        ctx.save();
                        // Selection glow
                        if (isSelectedGangItem) {
                            ctx.strokeStyle = '#00bcd4';
                            ctx.lineWidth = breite + 4;
                            ctx.lineCap = 'round';
                            ctx.beginPath();
                            ctx.moveTo(start.x, start.y);
                            ctx.lineTo(end.x, end.y);
                            ctx.stroke();
                        }
                        ctx.strokeStyle = gang.farbe || 'rgba(100, 200, 100, 0.6)';
                        ctx.lineWidth = breite;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(start.x, start.y);
                        ctx.lineTo(end.x, end.y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }["HallCanvas.useCallback[draw]"]);
            }
            // Draw saved Paths
            paths.forEach({
                "HallCanvas.useCallback[draw]": (path)=>{
                    if (path.waypoints.length < 2) return;
                    const isSelected = selectedPath?.id === path.id;
                    ctx.save();
                    // Selection highlight (glow effect)
                    if (isSelected) {
                        ctx.strokeStyle = '#00bcd4';
                        ctx.lineWidth = 8;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.beginPath();
                        const first = worldToScreen(path.waypoints[0].x, path.waypoints[0].y);
                        ctx.moveTo(first.x, first.y);
                        path.waypoints.slice(1).forEach({
                            "HallCanvas.useCallback[draw]": (wp)=>{
                                const p = worldToScreen(wp.x, wp.y);
                                ctx.lineTo(p.x, p.y);
                            }
                        }["HallCanvas.useCallback[draw]"]);
                        ctx.stroke();
                    }
                    // Main path line
                    ctx.strokeStyle = isSelected ? '#fff' : '#f59e0b';
                    ctx.lineWidth = isSelected ? 4 : 3;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();
                    const first = worldToScreen(path.waypoints[0].x, path.waypoints[0].y);
                    ctx.moveTo(first.x, first.y);
                    path.waypoints.slice(1).forEach({
                        "HallCanvas.useCallback[draw]": (wp)=>{
                            const p = worldToScreen(wp.x, wp.y);
                            ctx.lineTo(p.x, p.y);
                        }
                    }["HallCanvas.useCallback[draw]"]);
                    ctx.stroke();
                    // Draw waypoints
                    path.waypoints.forEach({
                        "HallCanvas.useCallback[draw]": (wp, wpIndex)=>{
                            const p = worldToScreen(wp.x, wp.y);
                            const isWaypointSelected = isSelected && selectedWaypointIndex === wpIndex;
                            // Waypoint circle
                            ctx.fillStyle = isWaypointSelected ? '#ef4444' : isSelected ? '#00bcd4' : '#f59e0b';
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, isWaypointSelected ? 8 : isSelected ? 6 : 4, 0, Math.PI * 2);
                            ctx.fill();
                            // Border for selected waypoints
                            if (isSelected || isWaypointSelected) {
                                ctx.strokeStyle = isWaypointSelected ? '#fff' : '#fff';
                                ctx.lineWidth = isWaypointSelected ? 3 : 2;
                                ctx.stroke();
                            }
                            // Show waypoint number when path is selected
                            if (isSelected) {
                                ctx.fillStyle = '#fff';
                                ctx.font = 'bold 10px Inter, sans-serif';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillText(`${wpIndex + 1}`, p.x, p.y);
                            }
                        }
                    }["HallCanvas.useCallback[draw]"]);
                    ctx.restore();
                }
            }["HallCanvas.useCallback[draw]"]);
            // Draw current path being drawn
            if (currentPath && currentPath.waypoints.length > 0) {
                ctx.save();
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.setLineDash([
                    8,
                    4
                ]);
                ctx.beginPath();
                const first = worldToScreen(currentPath.waypoints[0].x, currentPath.waypoints[0].y);
                ctx.moveTo(first.x, first.y);
                currentPath.waypoints.slice(1).forEach({
                    "HallCanvas.useCallback[draw]": (wp)=>{
                        const p = worldToScreen(wp.x, wp.y);
                        ctx.lineTo(p.x, p.y);
                    }
                }["HallCanvas.useCallback[draw]"]);
                // Draw to mouse position when drawing
                if (pathDrawing && pathMousePos) {
                    const mp = worldToScreen(pathMousePos.x, pathMousePos.y);
                    ctx.lineTo(mp.x, mp.y);
                }
                ctx.stroke();
                ctx.setLineDash([]);
                // Draw waypoints
                currentPath.waypoints.forEach({
                    "HallCanvas.useCallback[draw]": (wp)=>{
                        const p = worldToScreen(wp.x, wp.y);
                        ctx.fillStyle = '#22c55e';
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }["HallCanvas.useCallback[draw]"]);
                ctx.restore();
            }
            // Draw preview line for first segment (before currentPath exists)
            if (pathDrawing && pathDragStart && pathMousePos && (!currentPath || currentPath.waypoints.length === 0)) {
                ctx.save();
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.setLineDash([
                    8,
                    4
                ]);
                const start = worldToScreen(pathDragStart.x, pathDragStart.y);
                const end = worldToScreen(pathMousePos.x, pathMousePos.y);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                ctx.setLineDash([]);
                // Draw start point
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
                ctx.fill();
                // Draw end point preview
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(end.x, end.y, 5, 0, Math.PI * 2);
                ctx.stroke();
                // Show distance
                const dist = Math.sqrt(Math.pow(pathMousePos.x - pathDragStart.x, 2) + Math.pow(pathMousePos.y - pathDragStart.y, 2));
                ctx.fillStyle = '#fff';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${dist.toFixed(1)}m`, (start.x + end.x) / 2, (start.y + end.y) / 2 - 10);
                ctx.restore();
            }
            // Draw saved Conveyors
            conveyors.forEach({
                "HallCanvas.useCallback[draw]": (conveyor)=>{
                    if (conveyor.points.length < 2) return;
                    const isSelectedConv = selectedConveyor?.id === conveyor.id;
                    ctx.save();
                    // Selection glow
                    if (isSelectedConv) {
                        ctx.strokeStyle = '#00bcd4';
                        ctx.lineWidth = 10;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.beginPath();
                        const gf = worldToScreen(conveyor.points[0].x, conveyor.points[0].y);
                        ctx.moveTo(gf.x, gf.y);
                        conveyor.points.slice(1).forEach({
                            "HallCanvas.useCallback[draw]": (p)=>{
                                const sp = worldToScreen(p.x, p.y);
                                ctx.lineTo(sp.x, sp.y);
                            }
                        }["HallCanvas.useCallback[draw]"]);
                        ctx.stroke();
                    }
                    ctx.strokeStyle = '#06b6d4'; // Cyan for conveyors
                    ctx.lineWidth = 6;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();
                    const first = worldToScreen(conveyor.points[0].x, conveyor.points[0].y);
                    ctx.moveTo(first.x, first.y);
                    conveyor.points.slice(1).forEach({
                        "HallCanvas.useCallback[draw]": (p)=>{
                            const sp = worldToScreen(p.x, p.y);
                            ctx.lineTo(sp.x, sp.y);
                        }
                    }["HallCanvas.useCallback[draw]"]);
                    ctx.stroke();
                    // Draw direction arrows
                    for(let i = 0; i < conveyor.points.length - 1; i++){
                        const p1 = worldToScreen(conveyor.points[i].x, conveyor.points[i].y);
                        const p2 = worldToScreen(conveyor.points[i + 1].x, conveyor.points[i + 1].y);
                        const mx = (p1.x + p2.x) / 2;
                        const my = (p1.y + p2.y) / 2;
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                        ctx.save();
                        ctx.translate(mx, my);
                        ctx.rotate(angle);
                        ctx.fillStyle = '#fff';
                        ctx.beginPath();
                        ctx.moveTo(6, 0);
                        ctx.lineTo(-4, -4);
                        ctx.lineTo(-4, 4);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }
                    // Draw endpoints
                    conveyor.points.forEach({
                        "HallCanvas.useCallback[draw]": (p)=>{
                            const sp = worldToScreen(p.x, p.y);
                            ctx.fillStyle = '#06b6d4';
                            ctx.beginPath();
                            ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }["HallCanvas.useCallback[draw]"]);
                    ctx.restore();
                }
            }["HallCanvas.useCallback[draw]"]);
            // Draw current conveyor being drawn
            if (currentConveyor && currentConveyor.points.length > 0) {
                ctx.save();
                ctx.strokeStyle = '#0ea5e9';
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.setLineDash([
                    10,
                    5
                ]);
                ctx.beginPath();
                const first = worldToScreen(currentConveyor.points[0].x, currentConveyor.points[0].y);
                ctx.moveTo(first.x, first.y);
                currentConveyor.points.slice(1).forEach({
                    "HallCanvas.useCallback[draw]": (p)=>{
                        const sp = worldToScreen(p.x, p.y);
                        ctx.lineTo(sp.x, sp.y);
                    }
                }["HallCanvas.useCallback[draw]"]);
                // Draw to mouse position
                if (conveyorMousePos) {
                    const mp = worldToScreen(conveyorMousePos.x, conveyorMousePos.y);
                    ctx.lineTo(mp.x, mp.y);
                }
                ctx.stroke();
                ctx.setLineDash([]);
                // Draw waypoints
                currentConveyor.points.forEach({
                    "HallCanvas.useCallback[draw]": (p)=>{
                        const sp = worldToScreen(p.x, p.y);
                        ctx.fillStyle = '#0ea5e9';
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }["HallCanvas.useCallback[draw]"]);
                ctx.restore();
            }
            // Draw measure line
            if (measureStart && measureEnd) {
                const s = worldToScreen(measureStart.x, measureStart.y);
                const e = worldToScreen(measureEnd.x, measureEnd.y);
                const dist = Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2));
                ctx.save();
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2;
                ctx.setLineDash([
                    5,
                    5
                ]);
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(e.x, e.y);
                ctx.stroke();
                ctx.setLineDash([]);
                // Draw distance label
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${dist.toFixed(2)} m`, (s.x + e.x) / 2, (s.y + e.y) / 2 - 10);
                // Draw endpoints
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            // Draw objects
            objects.forEach({
                "HallCanvas.useCallback[draw]": (obj)=>{
                    const pos = worldToScreen(obj.x, obj.y);
                    const w = obj.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                    const h = obj.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                    ctx.save();
                    // Object fill
                    const baseColor = obj.color || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"][obj.type] || '#666';
                    ctx.fillStyle = baseColor;
                    ctx.fillRect(pos.x, pos.y, w, h);
                    // Object border
                    ctx.strokeStyle = selectedObject?.id === obj.id ? '#fff' : 'rgba(255,255,255,0.3)';
                    ctx.lineWidth = selectedObject?.id === obj.id ? 2 : 1;
                    ctx.strokeRect(pos.x, pos.y, w, h);
                    // Object label
                    if (zoom > 0.5 && obj.name) {
                        ctx.fillStyle = '#fff';
                        ctx.font = `${Math.max(9, 11 * zoom)}px Inter, sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const label = obj.name.length > 8 ? obj.name.substring(0, 8) + '…' : obj.name;
                        ctx.fillText(label, pos.x + w / 2, pos.y + h / 2);
                    }
                    ctx.restore();
                }
            }["HallCanvas.useCallback[draw]"]);
            // Draw heatmap overlay
            if (heatmapConfig.aktiv && betriebsAnalyse && betriebsAnalyse.objektMetriken.length > 0) {
                const metriken = betriebsAnalyse.objektMetriken;
                const values = metriken.map({
                    "HallCanvas.useCallback[draw].values": (m)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMetrikWert"])(m, heatmapConfig.modus)
                }["HallCanvas.useCallback[draw].values"]);
                const maxWert = Math.max(...values, 1);
                metriken.forEach({
                    "HallCanvas.useCallback[draw]": (metrik)=>{
                        const obj = objects.find({
                            "HallCanvas.useCallback[draw].obj": (o)=>o.id === metrik.objectId
                        }["HallCanvas.useCallback[draw].obj"]);
                        if (!obj) return;
                        const pos = worldToScreen(obj.x, obj.y);
                        const w = obj.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                        const h = obj.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                        const wert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMetrikWert"])(metrik, heatmapConfig.modus);
                        const intensity = wert / maxWert;
                        ctx.save();
                        // Colored overlay
                        ctx.fillStyle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getHeatmapColor"])(intensity, heatmapConfig.farbskala, heatmapConfig.intensitaet);
                        ctx.fillRect(pos.x, pos.y, w, h);
                        // Value label
                        if (zoom > 0.4) {
                            const label = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$heatmap$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMetrikWert"])(wert, heatmapConfig.modus);
                            ctx.fillStyle = 'rgba(255,255,255,0.95)';
                            ctx.font = `bold ${Math.max(9, 11 * zoom)}px Inter, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(label, pos.x + w / 2, pos.y + h / 2 + (zoom > 0.5 ? 12 * zoom : 0));
                        }
                        ctx.restore();
                    }
                }["HallCanvas.useCallback[draw]"]);
            }
            // Draw selection handles
            if (selectedObject) {
                const pos = worldToScreen(selectedObject.x, selectedObject.y);
                const w = selectedObject.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                const h = selectedObject.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                ctx.strokeStyle = '#00bcd4';
                ctx.lineWidth = 2;
                ctx.setLineDash([
                    5,
                    5
                ]);
                ctx.strokeRect(pos.x - 2, pos.y - 2, w + 4, h + 4);
                ctx.setLineDash([]);
                // Corner handles
                const handleSize = 8;
                ctx.fillStyle = '#00bcd4';
                [
                    [
                        0,
                        0
                    ],
                    [
                        w,
                        0
                    ],
                    [
                        0,
                        h
                    ],
                    [
                        w,
                        h
                    ]
                ].forEach({
                    "HallCanvas.useCallback[draw]": ([dx, dy])=>{
                        ctx.fillRect(pos.x + dx - handleSize / 2, pos.y + dy - handleSize / 2, handleSize, handleSize);
                    }
                }["HallCanvas.useCallback[draw]"]);
            }
            // Draw gang preview line when drawing
            if (gangDrawStart && gangMousePos) {
                const start = worldToScreen(gangDrawStart.x, gangDrawStart.y);
                const end = worldToScreen(gangMousePos.x, gangMousePos.y);
                const previewWidth = 3 * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom; // Default 3m width
                ctx.save();
                ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
                ctx.lineWidth = previewWidth;
                ctx.lineCap = 'round';
                ctx.setLineDash([
                    10,
                    10
                ]);
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                ctx.setLineDash([]);
                // Draw start point indicator
                ctx.fillStyle = '#64c864';
                ctx.beginPath();
                ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
                ctx.fill();
                // Draw end point indicator
                ctx.strokeStyle = '#64c864';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
                ctx.stroke();
                // Show distance label
                const dist = Math.sqrt(Math.pow(gangMousePos.x - gangDrawStart.x, 2) + Math.pow(gangMousePos.y - gangDrawStart.y, 2));
                ctx.fillStyle = '#fff';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${dist.toFixed(1)}m`, (start.x + end.x) / 2, (start.y + end.y) / 2 - 15);
                ctx.restore();
            }
        }
    }["HallCanvas.useCallback[draw]"], [
        hall,
        objects,
        gaenge,
        showGaenge,
        showGrid,
        zoom,
        pan,
        selectedObject,
        selectedPath,
        selectedWaypointIndex,
        selectedGang,
        selectedPathArea,
        selectedConveyor,
        worldToScreen,
        gangDrawStart,
        gangMousePos,
        paths,
        pathAreas,
        currentPath,
        pathMousePos,
        pathDrawing,
        pathDragStart,
        pathAreaStart,
        pathAreaMousePos,
        measureStart,
        measureEnd,
        conveyors,
        currentConveyor,
        conveyorMousePos,
        heatmapConfig,
        betriebsAnalyse
    ]);
    // Initial centering - only once on mount
    const initializedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Resize handler
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HallCanvas.useEffect": ()=>{
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;
            const handleResize = {
                "HallCanvas.useEffect.handleResize": ()=>{
                    canvas.width = container.clientWidth;
                    canvas.height = container.clientHeight;
                    draw();
                }
            }["HallCanvas.useEffect.handleResize"];
            // Initial setup and centering
            if (!initializedRef.current && hall) {
                canvas.width = container.clientWidth;
                canvas.height = container.clientHeight;
                const hallW = hall.width * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                const hallH = hall.height * __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SCALE"] * zoom;
                setPan({
                    x: (canvas.width - hallW) / 2,
                    y: (canvas.height - hallH) / 2
                });
                initializedRef.current = true;
            }
            handleResize();
            window.addEventListener('resize', handleResize);
            return ({
                "HallCanvas.useEffect": ()=>window.removeEventListener('resize', handleResize)
            })["HallCanvas.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["HallCanvas.useEffect"], [
        hall?.id
    ]); // Only re-run when hall changes
    // Redraw on state changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HallCanvas.useEffect": ()=>{
            const animationId = requestAnimationFrame(draw);
            return ({
                "HallCanvas.useEffect": ()=>cancelAnimationFrame(animationId)
            })["HallCanvas.useEffect"];
        }
    }["HallCanvas.useEffect"], [
        hall,
        objects,
        gaenge,
        showGaenge,
        showGrid,
        zoom,
        pan,
        selectedObject,
        selectedPath,
        selectedWaypointIndex,
        gangDrawStart,
        gangMousePos,
        paths,
        pathAreas,
        currentPath,
        pathMousePos,
        pathDrawing,
        pathDragStart,
        pathAreaStart,
        pathAreaMousePos,
        measureStart,
        measureEnd,
        conveyors,
        currentConveyor,
        conveyorMousePos,
        heatmapConfig,
        betriebsAnalyse
    ]);
    // Mouse handlers
    const handleMouseDown = (e)=>{
        // Close context menus on any click
        if (contextMenu) setContextMenu(null);
        if (objectContextMenu) setObjectContextMenu(null);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const world = screenToWorld(x, y);
        if (tool === 'gang') {
            // Gang drawing mode
            if (!gangDrawStart) {
                // First click - set start point
                setGangDrawStart({
                    x: Math.round(world.x),
                    y: Math.round(world.y)
                });
                setGangMousePos({
                    x: Math.round(world.x),
                    y: Math.round(world.y)
                });
            } else {
                // Second click - create the gang
                const endPoint = {
                    x: Math.round(world.x),
                    y: Math.round(world.y)
                };
                const dist = Math.sqrt(Math.pow(endPoint.x - gangDrawStart.x, 2) + Math.pow(endPoint.y - gangDrawStart.y, 2));
                if (dist > 1) {
                    // Only create gang if distance is significant
                    const newGang = {
                        id: Date.now(),
                        name: `Gang ${gaenge.length + 1}`,
                        points: [
                            gangDrawStart,
                            endPoint
                        ],
                        breite: 3,
                        typ: 'quergang',
                        farbe: 'rgba(100, 200, 100, 0.6)'
                    };
                    addGang(newGang);
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Gang erstellt (${dist.toFixed(1)}m)`);
                }
                // Reset drawing state
                setGangDrawStart(null);
                setGangMousePos(null);
            }
            return;
        }
        // Path drawing - SimCity/Anno style: click-drag-release for each segment
        if (tool === 'path') {
            const snapPos = {
                x: Math.round(world.x),
                y: Math.round(world.y)
            };
            setPathDrawing(true);
            setPathMousePos(snapPos);
            // Case 1: No current path - start fresh
            if (!currentPath || currentPath.waypoints.length === 0) {
                setPathDragStart(snapPos);
                return;
            }
            // Case 2: Current path exists - check if continuing from last point
            const lastPoint = currentPath.waypoints[currentPath.waypoints.length - 1];
            const distToLast = Math.sqrt(Math.pow(snapPos.x - lastPoint.x, 2) + Math.pow(snapPos.y - lastPoint.y, 2));
            if (distToLast < 3) {
                // Continue from last point
                setPathDragStart({
                    x: lastPoint.x,
                    y: lastPoint.y
                });
            } else {
                // Clicking elsewhere - save current path if valid, start new
                if (currentPath.waypoints.length >= 2) {
                    savePathWithLinks(currentPath.waypoints);
                }
                setCurrentPath(null);
                setPathDragStart(snapPos);
            }
            return;
        }
        // PathArea drawing - drag to create rectangle
        if (tool === 'pathArea') {
            const snapPos = {
                x: Math.round(world.x),
                y: Math.round(world.y)
            };
            setPathAreaStart(snapPos);
            setPathAreaMousePos(snapPos);
            return;
        }
        // Measure tool
        if (tool === 'measure') {
            const snapPos = {
                x: Math.round(world.x * 10) / 10,
                y: Math.round(world.y * 10) / 10
            };
            if (!measureStart) {
                setMeasureStart(snapPos);
                setMeasureEnd(snapPos);
            } else {
                // Reset for new measurement
                setMeasureStart(snapPos);
                setMeasureEnd(snapPos);
            }
            return;
        }
        // Conveyor drawing - click to add points
        if (tool === 'conveyor') {
            const snapPos = {
                x: Math.round(world.x),
                y: Math.round(world.y)
            };
            if (!currentConveyor) {
                // Start new conveyor
                setCurrentConveyor({
                    points: [
                        snapPos
                    ]
                });
            } else {
                // Add point to current conveyor
                setCurrentConveyor({
                    points: [
                        ...currentConveyor.points,
                        snapPos
                    ]
                });
            }
            setConveyorMousePos(snapPos);
            return;
        }
        if (tool === 'select') {
            // First check for objects
            const obj = findObjectAt(world.x, world.y);
            if (obj) {
                selectObject(obj); // also clears selectedPath
                setSelectedWaypointIndex(null);
                setDragObject(obj);
                setDragStart({
                    x: world.x - obj.x,
                    y: world.y - obj.y
                });
                setIsDragging(true);
                return;
            }
            // Check for waypoints first (more specific) - enable dragging
            const waypointHit = findWaypointAt(world.x, world.y);
            if (waypointHit) {
                selectPath(waypointHit.path);
                setSelectedWaypointIndex(waypointHit.waypointIndex);
                selectObject(null);
                // Start dragging this waypoint
                setDraggingWaypoint({
                    pathId: waypointHit.path.id,
                    waypointIndex: waypointHit.waypointIndex
                });
                setIsDragging(true);
                return;
            }
            // Then check for path segments
            const path = findPathAt(world.x, world.y);
            if (path) {
                selectPath(path);
                setSelectedWaypointIndex(null);
                return;
            }
            // Check for gangs (Fahrgänge)
            const gang = findGangAt(world.x, world.y);
            if (gang) {
                selectGang(gang);
                setSelectedWaypointIndex(null);
                return;
            }
            // Check for path areas
            const pathArea = findPathAreaAt(world.x, world.y);
            if (pathArea) {
                selectPathArea(pathArea);
                setSelectedWaypointIndex(null);
                return;
            }
            // Check for conveyors
            const conv = findConveyorAt(world.x, world.y);
            if (conv) {
                selectConveyor(conv);
                setSelectedWaypointIndex(null);
                return;
            }
            // Nothing found - deselect all
            selectObject(null);
            setSelectedWaypointIndex(null);
            return;
        } else if (tool === 'pan') {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - pan.x,
                y: e.clientY - pan.y
            });
        } else if (tool in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"]) {
            // Add new object using defaults - centered on click position
            const objectType = tool;
            const defaults = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"][objectType];
            const count = objects.filter((o)=>o.type === objectType).length + 1;
            let objX = Math.round(world.x - defaults.width / 2);
            let objY = Math.round(world.y - defaults.height / 2);
            let objWidth = defaults.width;
            let objHeight = defaults.height;
            let torSide;
            // Special handling for Tor: must be at hall edge
            if (objectType === 'tor' && hall) {
                // Find nearest wall
                const distNorth = objY;
                const distSouth = Math.abs(hall.height - objY - objHeight);
                const distWest = objX;
                const distEast = Math.abs(hall.width - objX - objWidth);
                const minDist = Math.min(distNorth, distSouth, distWest, distEast);
                // Snap to nearest wall
                if (minDist === distNorth) {
                    objY = 0;
                    objWidth = defaults.width;
                    objHeight = defaults.height;
                    torSide = 'north';
                } else if (minDist === distSouth) {
                    objY = hall.height - defaults.height;
                    objWidth = defaults.width;
                    objHeight = defaults.height;
                    torSide = 'south';
                } else if (minDist === distWest) {
                    objX = 0;
                    objWidth = defaults.height; // Swap for vertical orientation
                    objHeight = defaults.width;
                    torSide = 'west';
                } else {
                    objX = hall.width - defaults.height;
                    objWidth = defaults.height; // Swap for vertical orientation
                    objHeight = defaults.width;
                    torSide = 'east';
                }
                // Re-center along the wall based on click position
                if (torSide === 'north' || torSide === 'south') {
                    objX = Math.max(0, Math.min(hall.width - objWidth, Math.round(world.x - objWidth / 2)));
                } else {
                    objY = Math.max(0, Math.min(hall.height - objHeight, Math.round(world.y - objHeight / 2)));
                }
            } else if (hall) {
                // For non-Tor objects: clamp to hall boundaries
                objX = Math.max(0, Math.min(hall.width - objWidth, objX));
                objY = Math.max(0, Math.min(hall.height - objHeight, objY));
            }
            const newObj = addObject({
                type: objectType,
                x: objX,
                y: objY,
                width: objWidth,
                height: objHeight,
                name: `${defaults.name} ${count}`,
                side: torSide
            });
            // For Tor: automatically create Entladebereich behind it
            if (objectType === 'tor' && hall && torSide) {
                const entladeDefaults = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"]['entladebereich'];
                let entladeX = 0, entladeY = 0;
                const entladeWidth = entladeDefaults.width;
                const entladeHeight = entladeDefaults.height;
                // Position Entladebereich inside the hall, behind the Tor
                switch(torSide){
                    case 'north':
                        entladeX = objX + (objWidth - entladeWidth) / 2;
                        entladeY = objHeight; // Just below the tor
                        break;
                    case 'south':
                        entladeX = objX + (objWidth - entladeWidth) / 2;
                        entladeY = hall.height - objHeight - entladeHeight;
                        break;
                    case 'west':
                        entladeX = objWidth; // Just right of the tor
                        entladeY = objY + (objHeight - entladeHeight) / 2;
                        break;
                    case 'east':
                        entladeX = hall.width - objWidth - entladeWidth;
                        entladeY = objY + (objHeight - entladeHeight) / 2;
                        break;
                }
                // Ensure Entladebereich stays within hall bounds
                entladeX = Math.max(0, Math.min(hall.width - entladeWidth, entladeX));
                entladeY = Math.max(0, Math.min(hall.height - entladeHeight, entladeY));
                addObject({
                    type: 'entladebereich',
                    x: entladeX,
                    y: entladeY,
                    width: entladeWidth,
                    height: entladeHeight,
                    name: `Entlade ${count}`
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Tor mit Entladebereich erstellt (${torSide})`);
            }
            // Select the new object and switch to select tool for immediate editing
            selectObject(newObj);
            setTool('select');
            return;
        }
        setIsDragging(true);
    };
    const handleMouseMove = (e)=>{
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const world = screenToWorld(x, y);
        // Update gang preview position
        if (tool === 'gang' && gangDrawStart) {
            setGangMousePos({
                x: Math.round(world.x),
                y: Math.round(world.y)
            });
            return;
        }
        // Update path preview position
        if (tool === 'path' && pathDrawing) {
            setPathMousePos({
                x: Math.round(world.x),
                y: Math.round(world.y)
            });
            return;
        }
        // Update pathArea preview position
        if (tool === 'pathArea' && pathAreaStart) {
            setPathAreaMousePos({
                x: Math.round(world.x),
                y: Math.round(world.y)
            });
            return;
        }
        // Update measure end position
        if (tool === 'measure' && measureStart) {
            setMeasureEnd({
                x: Math.round(world.x * 10) / 10,
                y: Math.round(world.y * 10) / 10
            });
            return;
        }
        // Update conveyor preview position
        if (tool === 'conveyor' && currentConveyor) {
            setConveyorMousePos({
                x: Math.round(world.x),
                y: Math.round(world.y)
            });
            return;
        }
        if (!isDragging) return;
        if (tool === 'pan') {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        } else if (tool === 'select' && draggingWaypoint) {
            // Dragging a waypoint - update path in real-time
            const path = paths.find((p)=>p.id === draggingWaypoint.pathId);
            if (path) {
                const newWaypoints = [
                    ...path.waypoints
                ];
                newWaypoints[draggingWaypoint.waypointIndex] = {
                    ...newWaypoints[draggingWaypoint.waypointIndex],
                    x: Math.round(world.x),
                    y: Math.round(world.y)
                };
                updatePath(draggingWaypoint.pathId, {
                    waypoints: newWaypoints
                });
            }
        } else if (tool === 'select' && dragObject) {
            // Snap to 0.1m grid (not 1m) for precise repositioning
            let newX = Math.round((world.x - dragStart.x) * 10) / 10;
            let newY = Math.round((world.y - dragStart.y) * 10) / 10;
            // Clamp position within hall bounds
            if (hall) {
                newX = Math.max(0, Math.min(hall.width - dragObject.width, newX));
                newY = Math.max(0, Math.min(hall.height - dragObject.height, newY));
            }
            updateObject(dragObject.id, {
                x: newX,
                y: newY
            });
        }
    };
    const handleMouseUp = (e)=>{
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const world = screenToWorld(x, y);
            // Path drawing - SimCity style: add segment on mouse up
            if (tool === 'path' && pathDrawing && pathDragStart) {
                const endPoint = {
                    x: Math.round(world.x),
                    y: Math.round(world.y),
                    objectId: null
                };
                const dist = Math.sqrt(Math.pow(endPoint.x - pathDragStart.x, 2) + Math.pow(endPoint.y - pathDragStart.y, 2));
                // Only add segment if we moved more than 1m
                if (dist > 1) {
                    const startPoint = {
                        x: pathDragStart.x,
                        y: pathDragStart.y,
                        objectId: null
                    };
                    if (currentPath && currentPath.waypoints.length > 0) {
                        // Check if start point is already the last point in path
                        const lastPoint = currentPath.waypoints[currentPath.waypoints.length - 1];
                        const isConnected = lastPoint.x === pathDragStart.x && lastPoint.y === pathDragStart.y;
                        if (isConnected) {
                            // Just add end point (continuing path)
                            setCurrentPath({
                                waypoints: [
                                    ...currentPath.waypoints,
                                    endPoint
                                ]
                            });
                        } else {
                            // Add both points (shouldn't happen normally)
                            setCurrentPath({
                                waypoints: [
                                    ...currentPath.waypoints,
                                    startPoint,
                                    endPoint
                                ]
                            });
                        }
                    } else {
                        // First segment - create new path with both points
                        setCurrentPath({
                            waypoints: [
                                startPoint,
                                endPoint
                            ]
                        });
                    }
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Segment: ${dist.toFixed(1)}m`);
                }
                setPathDrawing(false);
                setPathDragStart(null);
                return;
            }
            // PathArea - create area on mouse up
            if (tool === 'pathArea' && pathAreaStart && pathAreaMousePos) {
                const x1 = Math.min(pathAreaStart.x, pathAreaMousePos.x);
                const y1 = Math.min(pathAreaStart.y, pathAreaMousePos.y);
                const x2 = Math.max(pathAreaStart.x, pathAreaMousePos.x);
                const y2 = Math.max(pathAreaStart.y, pathAreaMousePos.y);
                const width = x2 - x1;
                const height = y2 - y1;
                if (width > 1 && height > 1) {
                    addPathArea({
                        name: `Wegbereich ${pathAreas.length + 1}`,
                        x: x1,
                        y: y1,
                        width: width,
                        height: height,
                        color: 'rgba(100, 150, 255, 0.2)'
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Wegbereich erstellt (${width.toFixed(0)}m × ${height.toFixed(0)}m)`);
                }
                setPathAreaStart(null);
                setPathAreaMousePos(null);
                return;
            }
        }
        // Stop waypoint dragging
        if (draggingWaypoint) {
            // Update object links after moving waypoint
            const path = paths.find((p)=>p.id === draggingWaypoint.pathId);
            if (path && path.waypoints.length >= 2) {
                const firstPoint = path.waypoints[0];
                const lastPoint = path.waypoints[path.waypoints.length - 1];
                const startObj = findNearestObject(firstPoint.x, firstPoint.y, 5);
                const endObj = findNearestObject(lastPoint.x, lastPoint.y, 5);
                let name = path.name;
                if (startObj && endObj) {
                    name = `${startObj.name} → ${endObj.name}`;
                } else if (startObj) {
                    name = `${startObj.name} → ...`;
                } else if (endObj) {
                    name = `... → ${endObj.name}`;
                }
                updatePath(draggingWaypoint.pathId, {
                    name,
                    startObjectId: startObj?.id,
                    startObjectName: startObj?.name,
                    endObjectId: endObj?.id,
                    endObjectName: endObj?.name
                });
            }
            setDraggingWaypoint(null);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Wegpunkt verschoben');
        }
        setIsDragging(false);
        setDragObject(null);
    };
    // Wheel zoom is handled via native event listener above (non-passive)
    // Native wheel listener (non-passive) to allow preventDefault for zoom
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HallCanvas.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const nativeWheelHandler = {
                "HallCanvas.useEffect.nativeWheelHandler": (e)=>{
                    e.preventDefault();
                    const rect = canvas.getBoundingClientRect();
                    // Shift+Wheel = horizontal pan
                    if (e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        setPan({
                            x: pan.x - e.deltaY,
                            y: pan.y
                        });
                        return;
                    }
                    // Trackpad two-finger scroll (has deltaX) → Pan
                    // Mouse wheel (only deltaY) or Ctrl/pinch → Zoom
                    const isTrackpadPan = !e.ctrlKey && !e.metaKey && Math.abs(e.deltaX) > 0;
                    if (isTrackpadPan) {
                        setPan({
                            x: pan.x - e.deltaX,
                            y: pan.y - e.deltaY
                        });
                    } else {
                        // Zoom towards mouse position
                        const mouseX = e.clientX - rect.left;
                        const mouseY = e.clientY - rect.top;
                        const delta = e.deltaY > 0 ? 0.9 : 1.1;
                        const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
                        const zoomRatio = newZoom / zoom;
                        const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
                        const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
                        setZoom(newZoom);
                        setPan({
                            x: newPanX,
                            y: newPanY
                        });
                    }
                }
            }["HallCanvas.useEffect.nativeWheelHandler"];
            canvas.addEventListener('wheel', nativeWheelHandler, {
                passive: false
            });
            return ({
                "HallCanvas.useEffect": ()=>canvas.removeEventListener('wheel', nativeWheelHandler)
            })["HallCanvas.useEffect"];
        }
    }["HallCanvas.useEffect"], [
        zoom,
        pan,
        setZoom,
        setPan
    ]);
    // Handle keyboard events for drawing cancellation and deletion
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HallCanvas.useEffect": ()=>{
            const handleKeyDown = {
                "HallCanvas.useEffect.handleKeyDown": (e)=>{
                    if (e.key === 'Escape') {
                        if (gangDrawStart) {
                            setGangDrawStart(null);
                            setGangMousePos(null);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info('Gang-Zeichnen abgebrochen');
                        }
                        if (currentPath) {
                            setCurrentPath(null);
                            setPathDrawing(false);
                            setPathDragStart(null);
                            setPathMousePos(null);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info('Weg-Zeichnen abgebrochen');
                        }
                        if (pathAreaStart) {
                            setPathAreaStart(null);
                            setPathAreaMousePos(null);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info('Wegbereich abgebrochen');
                        }
                        if (measureStart) {
                            setMeasureStart(null);
                            setMeasureEnd(null);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info('Messung abgebrochen');
                        }
                        if (currentConveyor) {
                            setCurrentConveyor(null);
                            setConveyorMousePos(null);
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info('Förderband-Zeichnen abgebrochen');
                        }
                        // Deselect path and close context menu on Escape
                        if (selectedPath) {
                            selectPath(null);
                        }
                        if (contextMenu) {
                            setContextMenu(null);
                        }
                        if (objectContextMenu) {
                            setObjectContextMenu(null);
                        }
                    }
                    // Delete selected path with Delete or Backspace key
                    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPath) {
                        // Don't delete if typing in an input
                        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                            return;
                        }
                        deletePath(selectedPath.id);
                        selectPath(null);
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Weg gelöscht');
                    }
                }
            }["HallCanvas.useEffect.handleKeyDown"];
            window.addEventListener('keydown', handleKeyDown);
            return ({
                "HallCanvas.useEffect": ()=>window.removeEventListener('keydown', handleKeyDown)
            })["HallCanvas.useEffect"];
        }
    }["HallCanvas.useEffect"], [
        gangDrawStart,
        currentPath,
        pathAreaStart,
        measureStart,
        currentConveyor,
        selectedPath,
        deletePath,
        selectPath,
        contextMenu
    ]);
    // Reset drawing states when tool changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HallCanvas.useEffect": ()=>{
            if (tool !== 'gang') {
                setGangDrawStart(null);
                setGangMousePos(null);
            }
            if (tool !== 'path') {
                // Save current path if exists
                if (currentPath && currentPath.waypoints.length >= 2) {
                    savePathWithLinks(currentPath.waypoints);
                }
                setCurrentPath(null);
                setPathDrawing(false);
                setPathDragStart(null);
                setPathMousePos(null);
            }
            if (tool !== 'pathArea') {
                setPathAreaStart(null);
                setPathAreaMousePos(null);
            }
            if (tool !== 'measure') {
                setMeasureStart(null);
                setMeasureEnd(null);
            }
            if (tool !== 'conveyor') {
                // Save current conveyor if exists
                if (currentConveyor && currentConveyor.points.length >= 2) {
                    addConveyor({
                        name: `Förderband ${conveyors.length + 1}`,
                        points: currentConveyor.points,
                        speed: 1,
                        capacity: 100 // 100 pallets/hour default
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Förderband gespeichert');
                }
                setCurrentConveyor(null);
                setConveyorMousePos(null);
            }
        }
    }["HallCanvas.useEffect"], [
        tool
    ]);
    // Double-click to finish path or conveyor
    const handleDoubleClick = ()=>{
        if (tool === 'path' && currentPath && currentPath.waypoints.length >= 2) {
            savePathWithLinks(currentPath.waypoints);
            setCurrentPath(null);
            setPathDrawing(false);
            setPathDragStart(null);
            setPathMousePos(null);
        }
        if (tool === 'conveyor' && currentConveyor && currentConveyor.points.length >= 2) {
            addConveyor({
                name: `Förderband ${conveyors.length + 1}`,
                points: currentConveyor.points,
                speed: 1,
                capacity: 100
            });
            setCurrentConveyor(null);
            setConveyorMousePos(null);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Förderband gespeichert');
        }
    };
    // Cursor based on tool
    const getCursor = ()=>{
        if (isDragging && tool === 'pan') return 'grabbing';
        if (tool === 'pan') return 'grab';
        if (tool === 'select') return dragObject ? 'move' : 'default';
        if (tool === 'gang') return gangDrawStart ? 'crosshair' : 'crosshair';
        return 'crosshair';
    };
    // Right-click to cancel drawing
    const handleContextMenu = (e)=>{
        e.preventDefault();
        // If drawing, cancel drawing
        if (gangDrawStart || currentPath || pathAreaStart || measureStart || currentConveyor) {
            if (gangDrawStart) {
                setGangDrawStart(null);
                setGangMousePos(null);
            }
            if (currentPath) {
                setCurrentPath(null);
                setPathDrawing(false);
                setPathDragStart(null);
                setPathMousePos(null);
            }
            if (pathAreaStart) {
                setPathAreaStart(null);
                setPathAreaMousePos(null);
            }
            if (measureStart) {
                setMeasureStart(null);
                setMeasureEnd(null);
            }
            if (currentConveyor) {
                setCurrentConveyor(null);
                setConveyorMousePos(null);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info('Zeichnen abgebrochen');
            return;
        }
        // Check if right-clicking on a waypoint or path
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const world = screenToWorld(x, y);
        // First check for waypoints (more specific)
        const waypointHit = findWaypointAt(world.x, world.y);
        if (waypointHit) {
            selectPath(waypointHit.path);
            setSelectedWaypointIndex(waypointHit.waypointIndex);
            selectObject(null);
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                pathId: waypointHit.path.id,
                waypointIndex: waypointHit.waypointIndex
            });
            return;
        }
        // Then check for path segments
        const clickedPath = findPathAt(world.x, world.y);
        if (clickedPath) {
            selectPath(clickedPath);
            setSelectedWaypointIndex(null);
            selectObject(null);
            setContextMenu({
                x: e.clientX,
                y: e.clientY,
                pathId: clickedPath.id
            });
            setObjectContextMenu(null);
            return;
        }
        // Check for overlapping objects → show object context menu
        const objectsHere = findAllObjectsAt(world.x, world.y);
        if (objectsHere.length > 0) {
            setObjectContextMenu({
                x: e.clientX,
                y: e.clientY,
                objects: objectsHere
            });
            setContextMenu(null);
            // Select the first/smallest one immediately
            selectObject(objectsHere[0]);
        } else {
            setContextMenu(null);
            setObjectContextMenu(null);
            setSelectedWaypointIndex(null);
        }
    };
    // Close context menus when clicking elsewhere
    const handleCloseContextMenu = ()=>{
        setContextMenu(null);
        setObjectContextMenu(null);
    };
    // Handle context menu delete path
    const handleContextMenuDeletePath = ()=>{
        if (contextMenu) {
            deletePath(contextMenu.pathId);
            selectPath(null);
            setSelectedWaypointIndex(null);
            setContextMenu(null);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Weg gelöscht');
        }
    };
    // Handle context menu delete waypoint
    const handleContextMenuDeleteWaypoint = ()=>{
        if (contextMenu && contextMenu.waypointIndex !== undefined && selectedPath) {
            const newWaypoints = [
                ...selectedPath.waypoints
            ];
            newWaypoints.splice(contextMenu.waypointIndex, 1);
            if (newWaypoints.length < 2) {
                // If less than 2 points remain, delete the entire path
                deletePath(contextMenu.pathId);
                selectPath(null);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Weg gelöscht (zu wenige Punkte)');
            } else {
                // Update path with remaining waypoints using updatePath
                // Recalculate object links
                const firstPoint = newWaypoints[0];
                const lastPoint = newWaypoints[newWaypoints.length - 1];
                const startObj = findNearestObject(firstPoint.x, firstPoint.y, 5);
                const endObj = findNearestObject(lastPoint.x, lastPoint.y, 5);
                let name = selectedPath.name;
                if (startObj && endObj) {
                    name = `${startObj.name} → ${endObj.name}`;
                } else if (startObj) {
                    name = `${startObj.name} → ...`;
                } else if (endObj) {
                    name = `... → ${endObj.name}`;
                }
                updatePath(contextMenu.pathId, {
                    waypoints: newWaypoints,
                    name,
                    startObjectId: startObj?.id,
                    startObjectName: startObj?.name,
                    endObjectId: endObj?.id,
                    endObjectName: endObj?.name
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Wegpunkt gelöscht');
            }
            setSelectedWaypointIndex(null);
            setContextMenu(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: "w-full h-full bg-black overflow-hidden relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "w-full h-full",
                style: {
                    cursor: getCursor()
                },
                onMouseDown: handleMouseDown,
                onMouseMove: handleMouseMove,
                onMouseUp: handleMouseUp,
                onMouseLeave: handleMouseUp,
                onContextMenu: handleContextMenu,
                onDoubleClick: handleDoubleClick
            }, void 0, false, {
                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                lineNumber: 1698,
                columnNumber: 7
            }, this),
            tool === 'path' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg",
                children: currentPath && currentPath.waypoints.length >= 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        "Vom Endpunkt weiterziehen | ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                            className: "px-1 bg-muted rounded",
                            children: "Doppelklick"
                        }, void 0, false, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1713,
                            columnNumber: 47
                        }, this),
                        " Speichern | ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                            className: "px-1 bg-muted rounded",
                            children: "Rechtsklick"
                        }, void 0, false, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1713,
                            columnNumber: 116
                        }, this),
                        " Fertig"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1713,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Klicken & Ziehen für Weg-Segment (wie SimCity)"
                }, void 0, false, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1715,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                lineNumber: 1711,
                columnNumber: 9
            }, this),
            tool === 'pathArea' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Klicken und ziehen um einen Wegbereich zu definieren"
                }, void 0, false, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1721,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                lineNumber: 1720,
                columnNumber: 9
            }, this),
            tool === 'measure' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg",
                children: measureStart && measureEnd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        "Distanz: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: [
                                Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2)).toFixed(2),
                                " m"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1727,
                            columnNumber: 28
                        }, this),
                        " | Klicken für neue Messung"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1727,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Klicken für Startpunkt, dann ziehen zum Messen"
                }, void 0, false, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1729,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                lineNumber: 1725,
                columnNumber: 9
            }, this),
            tool === 'gang' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg",
                children: gangDrawStart ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        "Klicken Sie für den Endpunkt | ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                            className: "px-1 bg-muted rounded",
                            children: "ESC"
                        }, void 0, false, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1736,
                            columnNumber: 50
                        }, this),
                        " oder Rechtsklick zum Abbrechen"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1736,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Klicken Sie für den Startpunkt des Gangs"
                }, void 0, false, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1738,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                lineNumber: 1734,
                columnNumber: 9
            }, this),
            tool === 'conveyor' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg",
                children: currentConveyor && currentConveyor.points.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        "Klicken für weiteren Punkt | ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                            className: "px-1 bg-muted rounded",
                            children: "Doppelklick"
                        }, void 0, false, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1745,
                            columnNumber: 48
                        }, this),
                        " zum Speichern | ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                            className: "px-1 bg-muted rounded",
                            children: "ESC"
                        }, void 0, false, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1745,
                            columnNumber: 121
                        }, this),
                        " Abbrechen"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1745,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: "Klicken um das Förderband zu zeichnen"
                }, void 0, false, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1747,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                lineNumber: 1743,
                columnNumber: 9
            }, this),
            tool === 'select' && selectedPath && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    children: [
                        "Wegpunkte anklicken & ziehen zum Verschieben | ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                            className: "px-1 bg-muted rounded",
                            children: "Rechtsklick"
                        }, void 0, false, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1753,
                            columnNumber: 64
                        }, this),
                        " Menü | ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("kbd", {
                            className: "px-1 bg-muted rounded",
                            children: "Entf"
                        }, void 0, false, {
                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                            lineNumber: 1753,
                            columnNumber: 128
                        }, this),
                        " Löschen"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                    lineNumber: 1753,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                lineNumber: 1752,
                columnNumber: 9
            }, this),
            contextMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-40",
                        onClick: handleCloseContextMenu
                    }, void 0, false, {
                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                        lineNumber: 1761,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px]",
                        style: {
                            left: contextMenu.x,
                            top: contextMenu.y
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-1.5 text-xs text-muted-foreground border-b",
                                children: contextMenu.waypointIndex !== undefined ? `${selectedPath?.name} - Punkt ${contextMenu.waypointIndex + 1}` : selectedPath?.name || 'Weg'
                            }, void 0, false, {
                                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                lineNumber: 1770,
                                columnNumber: 13
                            }, this),
                            contextMenu.waypointIndex !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2",
                                        onClick: ()=>{
                                            if (selectedPath && contextMenu.waypointIndex !== undefined) {
                                                const wp = selectedPath.waypoints[contextMenu.waypointIndex];
                                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(`Punkt ${contextMenu.waypointIndex + 1}: X=${wp.x.toFixed(1)}m, Y=${wp.y.toFixed(1)}m`);
                                            }
                                            setContextMenu(null);
                                        },
                                        children: "📍 Punkt-Position"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                        lineNumber: 1779,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-3 py-1.5 text-xs text-muted-foreground italic",
                                        children: "Tipp: Punkt anklicken & ziehen zum Verschieben"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                        lineNumber: 1791,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2",
                                        onClick: handleContextMenuDeleteWaypoint,
                                        children: "❌ Punkt löschen"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                        lineNumber: 1794,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t my-1"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                        lineNumber: 1800,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2",
                                onClick: ()=>{
                                    if (selectedPath) {
                                        const length = selectedPath.waypoints.reduce((sum, wp, i, arr)=>{
                                            if (i === 0) return 0;
                                            const prev = arr[i - 1];
                                            return sum + Math.sqrt(Math.pow(wp.x - prev.x, 2) + Math.pow(wp.y - prev.y, 2));
                                        }, 0);
                                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].info(`Länge: ${length.toFixed(1)}m | Punkte: ${selectedPath.waypoints.length}`);
                                    }
                                    setContextMenu(null);
                                },
                                children: "📏 Weg-Details"
                            }, void 0, false, {
                                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                lineNumber: 1805,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2",
                                onClick: handleContextMenuDeletePath,
                                children: "🗑️ Gesamten Weg löschen"
                            }, void 0, false, {
                                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                lineNumber: 1821,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                        lineNumber: 1766,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            objectContextMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-40",
                        onClick: handleCloseContextMenu
                    }, void 0, false, {
                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                        lineNumber: 1834,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[200px]",
                        style: {
                            left: objectContextMenu.x,
                            top: objectContextMenu.y
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-3 py-1.5 text-xs text-muted-foreground border-b",
                                children: [
                                    objectContextMenu.objects.length,
                                    " Objekte an dieser Position"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                lineNumber: 1842,
                                columnNumber: 13
                            }, this),
                            objectContextMenu.objects.map((obj)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: `w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 ${selectedObject?.id === obj.id ? 'bg-primary/10 font-medium' : ''}`,
                                    onClick: ()=>{
                                        selectObject(obj);
                                        setObjectContextMenu(null);
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "w-3 h-3 rounded-sm flex-shrink-0",
                                            style: {
                                                backgroundColor: obj.color || '#3498db'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                            lineNumber: 1856,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate",
                                            children: obj.name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                            lineNumber: 1860,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "ml-auto text-xs text-muted-foreground",
                                            children: [
                                                obj.width,
                                                "×",
                                                obj.height,
                                                "m"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                            lineNumber: 1861,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, obj.id, true, {
                                    fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                                    lineNumber: 1846,
                                    columnNumber: 15
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
                        lineNumber: 1838,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/canvas/HallCanvas.tsx",
        lineNumber: 1697,
        columnNumber: 5
    }, this);
}
_s(HallCanvas, "mX03ljFi8dSNPMUhbxDRQLeczAI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActiveHall"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useObjects"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZoom"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePan"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTool"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useHeatmapConfig"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$betriebsdaten$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBetriebsdatenStore"]
    ];
});
_c = HallCanvas;
var _c;
__turbopack_context__.k.register(_c, "HallCanvas");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_canvas_HallCanvas_tsx_fe7d795f._.js.map