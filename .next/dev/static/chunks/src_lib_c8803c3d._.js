(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/topis.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature();
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
            ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_HALL"]
        }
    ],
    activeHallId: 1,
    hall: {
        width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_HALL"].width,
        height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_HALL"].height,
        shape: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_HALL"].shape,
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
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_FFZ"]
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
const useTopisStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
const useObjects = ()=>{
    _s();
    return useTopisStore({
        "useObjects.useTopisStore": (state)=>state.objects
    }["useObjects.useTopisStore"]);
};
_s(useObjects, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useSelectedObject = ()=>{
    _s1();
    return useTopisStore({
        "useSelectedObject.useTopisStore": (state)=>state.selectedObject
    }["useSelectedObject.useTopisStore"]);
};
_s1(useSelectedObject, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useHalls = ()=>{
    _s2();
    return useTopisStore({
        "useHalls.useTopisStore": (state)=>state.halls
    }["useHalls.useTopisStore"]);
};
_s2(useHalls, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useActiveHall = ()=>{
    _s3();
    return useTopisStore({
        "useActiveHall.useTopisStore": (state)=>state.halls.find({
                "useActiveHall.useTopisStore": (h)=>h.id === state.activeHallId
            }["useActiveHall.useTopisStore"]) || state.halls[0]
    }["useActiveHall.useTopisStore"]);
};
_s3(useActiveHall, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useTool = ()=>{
    _s4();
    return useTopisStore({
        "useTool.useTopisStore": (state)=>state.currentTool
    }["useTool.useTopisStore"]);
};
_s4(useTool, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useZoom = ()=>{
    _s5();
    return useTopisStore({
        "useZoom.useTopisStore": (state)=>state.zoom
    }["useZoom.useTopisStore"]);
};
_s5(useZoom, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const usePan = ()=>{
    _s6();
    return useTopisStore({
        "usePan.useTopisStore": (state)=>state.pan
    }["usePan.useTopisStore"]);
};
_s6(usePan, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useSelectedGang = ()=>{
    _s7();
    return useTopisStore({
        "useSelectedGang.useTopisStore": (state)=>state.selectedGang
    }["useSelectedGang.useTopisStore"]);
};
_s7(useSelectedGang, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useSelectedPathArea = ()=>{
    _s8();
    return useTopisStore({
        "useSelectedPathArea.useTopisStore": (state)=>state.selectedPathArea
    }["useSelectedPathArea.useTopisStore"]);
};
_s8(useSelectedPathArea, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
const useSelectedConveyor = ()=>{
    _s9();
    return useTopisStore({
        "useSelectedConveyor.useTopisStore": (state)=>state.selectedConveyor
    }["useSelectedConveyor.useTopisStore"]);
};
_s9(useSelectedConveyor, "GKKZTmrOqUUXMcYB6FeGPNxuyaA=", false, function() {
    return [
        useTopisStore
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/betriebsdaten-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature();
'use client';
;
const defaultHeatmapConfig = {
    aktiv: false,
    modus: 'sendungen',
    farbskala: 'gruen-rot',
    intensitaet: 0.6
};
const useBetriebsdatenStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
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
const useHeatmapConfig = ()=>{
    _s();
    return useBetriebsdatenStore({
        "useHeatmapConfig.useBetriebsdatenStore": (s)=>s.heatmapConfig
    }["useHeatmapConfig.useBetriebsdatenStore"]);
};
_s(useHeatmapConfig, "87uD14cfNXW38BSFDpbMDGHkhQI=", false, function() {
    return [
        useBetriebsdatenStore
    ];
});
const useBetriebsAnalyse = ()=>{
    _s1();
    return useBetriebsdatenStore({
        "useBetriebsAnalyse.useBetriebsdatenStore": (s)=>s.analyse
    }["useBetriebsAnalyse.useBetriebsdatenStore"]);
};
_s1(useBetriebsAnalyse, "87uD14cfNXW38BSFDpbMDGHkhQI=", false, function() {
    return [
        useBetriebsdatenStore
    ];
});
const useSzenarien = ()=>{
    _s2();
    return useBetriebsdatenStore({
        "useSzenarien.useBetriebsdatenStore": (s)=>s.szenarien
    }["useSzenarien.useBetriebsdatenStore"]);
};
_s2(useSzenarien, "87uD14cfNXW38BSFDpbMDGHkhQI=", false, function() {
    return [
        useBetriebsdatenStore
    ];
});
const useTorZuordnungen = ()=>{
    _s3();
    return useBetriebsdatenStore({
        "useTorZuordnungen.useBetriebsdatenStore": (s)=>s.torZuordnungen
    }["useTorZuordnungen.useBetriebsdatenStore"]);
};
_s3(useTorZuordnungen, "87uD14cfNXW38BSFDpbMDGHkhQI=", false, function() {
    return [
        useBetriebsdatenStore
    ];
});
const useRelationZuordnungen = ()=>{
    _s4();
    return useBetriebsdatenStore({
        "useRelationZuordnungen.useBetriebsdatenStore": (s)=>s.relationZuordnungen
    }["useRelationZuordnungen.useBetriebsdatenStore"]);
};
_s4(useRelationZuordnungen, "87uD14cfNXW38BSFDpbMDGHkhQI=", false, function() {
    return [
        useBetriebsdatenStore
    ];
});
const useScandatenRecords = ()=>{
    _s5();
    return useBetriebsdatenStore({
        "useScandatenRecords.useBetriebsdatenStore": (s)=>s.scandatenRecords
    }["useScandatenRecords.useBetriebsdatenStore"]);
};
_s5(useScandatenRecords, "87uD14cfNXW38BSFDpbMDGHkhQI=", false, function() {
    return [
        useBetriebsdatenStore
    ];
});
const useStundenAggregation = ()=>{
    _s6();
    return useBetriebsdatenStore({
        "useStundenAggregation.useBetriebsdatenStore": (s)=>s.stundenAggregation
    }["useStundenAggregation.useBetriebsdatenStore"]);
};
_s6(useStundenAggregation, "87uD14cfNXW38BSFDpbMDGHkhQI=", false, function() {
    return [
        useBetriebsdatenStore
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/heatmap-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/export.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "downloadFile",
    ()=>downloadFile,
    "downloadSVG",
    ()=>downloadSVG,
    "exportCanvasToPNG",
    ()=>exportCanvasToPNG,
    "exportMatrixCSV",
    ()=>exportMatrixCSV,
    "exportReport",
    ()=>exportReport,
    "exportToJSON",
    ()=>exportToJSON,
    "exportToSVG",
    ()=>exportToSVG,
    "importFromJSON",
    ()=>importFromJSON,
    "openFileDialog",
    ()=>openFileDialog,
    "printLayout",
    ()=>printLayout
]);
function exportToJSON(state, projectName = 'Unbenanntes Projekt') {
    const project = {
        version: '1.0.0',
        name: projectName,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        data: {
            halls: state.halls || [],
            activeHallId: state.activeHallId || 1,
            objects: state.objects || [],
            paths: state.paths || [],
            pathAreas: state.pathAreas || [],
            gaenge: state.gaenge || [],
            ffz: state.ffz || [],
            conveyors: state.conveyors || []
        },
        meta: {
            objectCount: state.objects?.length || 0,
            pathCount: state.paths?.length || 0,
            gangCount: state.gaenge?.length || 0
        }
    };
    return JSON.stringify(project, null, 2);
}
function importFromJSON(jsonString) {
    try {
        const project = JSON.parse(jsonString);
        // Validate version
        if (!project.version) {
            throw new Error('Ungültige Projektdatei: Version fehlt');
        }
        // Validate required data
        if (!project.data) {
            throw new Error('Ungültige Projektdatei: Daten fehlen');
        }
        // Return state updates
        return {
            halls: project.data.halls || [],
            activeHallId: project.data.activeHallId || 1,
            objects: project.data.objects || [],
            paths: project.data.paths || [],
            pathAreas: project.data.pathAreas || [],
            gaenge: project.data.gaenge || [],
            ffz: project.data.ffz || [],
            conveyors: project.data.conveyors || [],
            // Reset counters based on imported data
            objectIdCounter: Math.max(...project.data.objects?.map((o)=>o.id) || [
                0
            ]) + 1,
            pathIdCounter: Math.max(...project.data.paths?.map((p)=>p.id) || [
                0
            ]) + 1
        };
    } catch (error) {
        console.error('Import error:', error);
        return null;
    }
}
function downloadFile(content, filename, mimeType = 'application/json') {
    const blob = new Blob([
        content
    ], {
        type: mimeType
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
function openFileDialog(accept = '.json,.topis') {
    return new Promise((resolve, reject)=>{
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.onchange = (e)=>{
            const file = e.target.files?.[0];
            if (!file) {
                reject(new Error('Keine Datei ausgewählt'));
                return;
            }
            const reader = new FileReader();
            reader.onload = ()=>{
                resolve(reader.result);
            };
            reader.onerror = ()=>{
                reject(new Error('Fehler beim Lesen der Datei'));
            };
            reader.readAsText(file);
        };
        input.click();
    });
}
function exportCanvasToPNG(canvas, filename = 'halle.png') {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function exportToSVG(state, width = 1000, height = 500) {
    const scale = 10; // SCALE constant from types
    const hall = state.halls?.[0];
    const objects = state.objects || [];
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .object-label { font-family: Inter, sans-serif; font-size: 11px; fill: white; }
    .hall-label { font-family: Inter, sans-serif; font-size: 14px; fill: #718096; }
  </style>

  <!-- Background -->
  <rect width="100%" height="100%" fill="#0a0a0a"/>
`;
    // Draw hall
    if (hall) {
        const hallW = hall.width * scale;
        const hallH = hall.height * scale;
        const hallX = 50;
        const hallY = 50;
        svg += `
  <!-- Hall: ${hall.name} -->
  <rect x="${hallX}" y="${hallY}" width="${hallW}" height="${hallH}" fill="${hall.color || '#16213e'}" stroke="#4a5568" stroke-width="2"/>
  <text x="${hallX + hallW / 2}" y="${hallY - 10}" text-anchor="middle" class="hall-label">${hall.name}</text>
`;
    }
    // Draw objects
    objects.forEach((obj)=>{
        const x = 50 + obj.x * scale;
        const y = 50 + obj.y * scale;
        const w = obj.width * scale;
        const h = obj.height * scale;
        svg += `
  <!-- ${obj.type}: ${obj.name} -->
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${obj.color || '#666'}" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
  <text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" class="object-label">${obj.name}</text>
`;
    });
    svg += `
</svg>`;
    return svg;
}
function downloadSVG(state, filename = 'halle.svg') {
    const svg = exportToSVG(state);
    downloadFile(svg, filename, 'image/svg+xml');
}
function printLayout(canvas, hall, objects) {
    const imgData = canvas.toDataURL('image/png');
    // Count objects by type
    const objCounts = {};
    objects.forEach((obj)=>{
        objCounts[obj.type] = (objCounts[obj.type] || 0) + 1;
    });
    let statsHtml = '<table style="border-collapse: collapse; width: 100%;"><tr><th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Typ</th><th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Anzahl</th></tr>';
    const typeNames = {
        tor: 'Tore',
        stellplatz: 'Stellplätze',
        regal: 'Regale',
        bereich: 'Bereiche',
        wand: 'Wände',
        pfosten: 'Pfosten',
        tuer: 'Türen',
        treppe: 'Treppen',
        rampe: 'Rampen',
        leveller: 'Leveller',
        ladestation: 'Ladestationen',
        gefahrgut: 'Gefahrgut',
        klaerplatz: 'Klärplätze',
        sperrplatz: 'Sperrplätze',
        buero: 'Büros',
        wc: 'WCs',
        sozialraum: 'Sozialräume'
    };
    for(const type in objCounts){
        statsHtml += `<tr><td style="border: 1px solid #ccc; padding: 8px;">${typeNames[type] || type}</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right;">${objCounts[type]}</td></tr>`;
    }
    statsHtml += `<tr><td style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">Gesamt</td><td style="border: 1px solid #ccc; padding: 8px; text-align: right; font-weight: bold;">${objects.length}</td></tr>`;
    statsHtml += '</table>';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Popup-Blocker verhindert das Öffnen des Druckfensters');
        return;
    }
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${hall.name} - Druckansicht</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
        h1 { margin-bottom: 5px; color: #333; }
        .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
        .layout { text-align: center; margin: 20px 0; }
        .layout img { max-width: 100%; border: 1px solid #ccc; }
        .stats { margin-top: 20px; max-width: 400px; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${hall.name}</h1>
      <div class="meta">${hall.width}m × ${hall.height}m | Fläche: ${(hall.width * hall.height).toLocaleString('de-DE')} m² | Erstellt: ${new Date().toLocaleDateString('de-DE')}</div>
      <div class="layout"><img src="${imgData}" alt="Hallenplan"></div>
      <h3>Objektübersicht</h3>
      <div class="stats">${statsHtml}</div>
      <div class="footer">Generiert mit TOPIS SaaS - Hallenplanungssystem | ROTH Logistikberatung / NT Consult</div>
      <div class="no-print" style="margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; background: #A5242C; color: white; border: none; border-radius: 4px;">🖨️ Drucken</button>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">Schließen</button>
      </div>
    </body>
    </html>
  `);
    printWindow.document.close();
}
function exportReport(vorher, nachher, colliProTag = 5000) {
    const stundenVorher = colliProTag * vorher.prozesszeit / 60;
    const stundenNachher = colliProTag * nachher.prozesszeit / 60;
    const stundenDiff = stundenVorher - stundenNachher;
    const report = `
TOPIS PROJEKT-REPORT
====================
Erstellt: ${new Date().toLocaleString('de-DE')}

ZUSAMMENFASSUNG
---------------
Prozesszeit VORHER:  ${vorher.prozesszeit.toFixed(2)} Min/Colli
Prozesszeit NACHHER: ${nachher.prozesszeit.toFixed(2)} Min/Colli
Verbesserung:        ${((vorher.prozesszeit - nachher.prozesszeit) / vorher.prozesszeit * 100).toFixed(1)}%

Ø Distanz VORHER:    ${vorher.avgDistanz.toFixed(1)} m
Ø Distanz NACHHER:   ${nachher.avgDistanz.toFixed(1)} m
Einsparung:          ${(vorher.avgDistanz - nachher.avgDistanz).toFixed(1)} m

HOCHRECHNUNG (${colliProTag.toLocaleString('de-DE')} Colli/Tag)
---------------------------------------
Stunden VORHER:      ${stundenVorher.toFixed(1)} Std/Tag
Stunden NACHHER:     ${stundenNachher.toFixed(1)} Std/Tag
Einsparung:          ${stundenDiff.toFixed(1)} Std/Tag

Pro Monat (21 Tage): ${(stundenDiff * 21).toFixed(0)} Stunden
Pro Jahr (250 Tage): ${(stundenDiff * 250).toFixed(0)} Stunden

LAYOUT-DETAILS
--------------
VORHER:
  - Objekte: ${vorher.objects.length}
  - Tore: ${vorher.objects.filter((o)=>o.type === 'tor').length}
  - Stellplätze: ${vorher.objects.filter((o)=>o.type === 'stellplatz').length}

NACHHER:
  - Objekte: ${nachher.objects.length}
  - Tore: ${nachher.objects.filter((o)=>o.type === 'tor').length}
  - Stellplätze: ${nachher.objects.filter((o)=>o.type === 'stellplatz').length}

---
Generiert mit TOPIS SaaS - Hallenplanungssystem
ROTH Logistikberatung / NT Consult
  `.trim();
    downloadFile(report, `TOPIS-Report-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
}
function exportMatrixCSV(results) {
    let csv = 'Von;Nach;Distanz (m);Zeit (s)\n';
    results.forEach((r)=>{
        csv += `${r.from};${r.to};${r.dist.toFixed(1)};${r.time.toFixed(1)}\n`;
    });
    downloadFile(csv, `topis_matrix_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/gang-generator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_GANG_SETTINGS",
    ()=>DEFAULT_GANG_SETTINGS,
    "calculateGangArea",
    ()=>calculateGangArea,
    "calculateTotalGangLength",
    ()=>calculateTotalGangLength,
    "createGang",
    ()=>createGang,
    "generateGaenge",
    ()=>generateGaenge,
    "resetGangIdCounter",
    ()=>resetGangIdCounter
]);
const DEFAULT_GANG_SETTINGS = {
    hauptgangBreite: 3.5,
    regalgangBreite: 2.5,
    generateHauptweg: true,
    generateZufahrten: true,
    generateRegalgaenge: true
};
let gangIdCounter = 1;
/**
 * Generate a unique ID for a Gang
 */ function nextGangId() {
    return gangIdCounter++;
}
function resetGangIdCounter(maxId = 0) {
    gangIdCounter = maxId + 1;
}
/**
 * Cluster objects by their Y position
 */ function clusterByY(objects, threshold = 5) {
    if (objects.length === 0) return [];
    const sorted = [
        ...objects
    ].sort((a, b)=>a.y - b.y);
    const clusters = [];
    let currentCluster = [
        sorted[0]
    ];
    for(let i = 1; i < sorted.length; i++){
        const prevY = sorted[i - 1].y;
        const currY = sorted[i].y;
        if (Math.abs(currY - prevY) <= threshold) {
            currentCluster.push(sorted[i]);
        } else {
            clusters.push(currentCluster);
            currentCluster = [
                sorted[i]
            ];
        }
    }
    clusters.push(currentCluster);
    return clusters;
}
function generateGaenge(hall, objects, settings = DEFAULT_GANG_SETTINGS) {
    if (objects.length === 0) {
        return [];
    }
    const neueGaenge = [];
    const { hauptgangBreite, regalgangBreite } = settings;
    const hallBreite = hall.width;
    const hallHoehe = hall.height;
    const mitteY = hallHoehe / 2;
    // Collect objects by type
    const tore = objects.filter((o)=>o.type === 'tor');
    const stellplaetze = objects.filter((o)=>o.type === 'stellplatz');
    const regale = objects.filter((o)=>o.type === 'regal');
    const bereiche = objects.filter((o)=>o.type === 'bereich');
    // ============================================
    // 1. HAUPTVERKEHRSWEG durch die Mitte der Halle
    // ============================================
    if (settings.generateHauptweg) {
        neueGaenge.push({
            id: nextGangId(),
            name: 'Hauptweg Mitte',
            points: [
                {
                    x: 3,
                    y: mitteY
                },
                {
                    x: hallBreite - 3,
                    y: mitteY
                }
            ],
            breite: hauptgangBreite,
            typ: 'hauptgang',
            istHauptgang: true,
            farbe: 'rgba(50, 150, 50, 0.4)'
        });
    }
    // ============================================
    // 2. ZUFAHRTSWEGE zu Toren
    // ============================================
    if (settings.generateZufahrten && tore.length > 0) {
        // Nordseite Tore (y < mitteY)
        const toreNord = tore.filter((t)=>t.y + t.height / 2 < mitteY);
        const torClustersNord = clusterByY(toreNord, 10);
        torClustersNord.forEach((cluster, idx)=>{
            const clusterMitteX = cluster.reduce((sum, t)=>sum + t.x + t.width / 2, 0) / cluster.length;
            const startY = Math.min(...cluster.map((t)=>t.y + t.height)) + 2;
            neueGaenge.push({
                id: nextGangId(),
                name: `Zufahrt Nord ${idx + 1}`,
                points: [
                    {
                        x: clusterMitteX,
                        y: startY
                    },
                    {
                        x: clusterMitteX,
                        y: mitteY
                    }
                ],
                breite: hauptgangBreite,
                typ: 'hauptgang',
                istHauptgang: true,
                farbe: 'rgba(80, 180, 80, 0.35)'
            });
        });
        // Südseite Tore (y >= mitteY)
        const toreSued = tore.filter((t)=>t.y + t.height / 2 >= mitteY);
        const torClustersSued = clusterByY(toreSued, 10);
        torClustersSued.forEach((cluster, idx)=>{
            const clusterMitteX = cluster.reduce((sum, t)=>sum + t.x + t.width / 2, 0) / cluster.length;
            const startY = Math.max(...cluster.map((t)=>t.y)) - 2;
            neueGaenge.push({
                id: nextGangId(),
                name: `Zufahrt Süd ${idx + 1}`,
                points: [
                    {
                        x: clusterMitteX,
                        y: mitteY
                    },
                    {
                        x: clusterMitteX,
                        y: startY
                    }
                ],
                breite: hauptgangBreite,
                typ: 'hauptgang',
                istHauptgang: true,
                farbe: 'rgba(80, 180, 80, 0.35)'
            });
        });
    }
    // ============================================
    // 3. REGALGÄNGE (zwischen Regalen)
    // ============================================
    if (settings.generateRegalgaenge && regale.length > 0) {
        // Sortiere Regale nach Y-Position
        const regalClusters = clusterByY(regale, regalgangBreite + 0.5);
        regalClusters.forEach((cluster, idx)=>{
            if (cluster.length > 0) {
                const minX = Math.min(...cluster.map((r)=>r.x));
                const maxX = Math.max(...cluster.map((r)=>r.x + r.width));
                const gangY = cluster[0].y + cluster[0].height + regalgangBreite / 2;
                // Nur wenn Gang zwischen Regalreihen Sinn macht
                if (gangY < hallHoehe - 5) {
                    neueGaenge.push({
                        id: nextGangId(),
                        name: `Regalgang ${idx + 1}`,
                        points: [
                            {
                                x: minX - 2,
                                y: gangY
                            },
                            {
                                x: maxX + 2,
                                y: gangY
                            }
                        ],
                        breite: regalgangBreite,
                        typ: 'regalgang',
                        istHauptgang: false,
                        farbe: 'rgba(200, 180, 100, 0.3)'
                    });
                }
            }
        });
        // Vertikale Regalgänge links und rechts
        const allRegalX = regale.flatMap((r)=>[
                r.x,
                r.x + r.width
            ]);
        const allRegalY = regale.flatMap((r)=>[
                r.y,
                r.y + r.height
            ]);
        const minRegalX = Math.min(...allRegalX);
        const maxRegalX = Math.max(...allRegalX);
        const minRegalY = Math.min(...allRegalY);
        const maxRegalY = Math.max(...allRegalY);
        // Linker Regalzugang
        neueGaenge.push({
            id: nextGangId(),
            name: 'Regalzugang West',
            points: [
                {
                    x: minRegalX - 2,
                    y: minRegalY - 2
                },
                {
                    x: minRegalX - 2,
                    y: maxRegalY + 2
                }
            ],
            breite: regalgangBreite,
            typ: 'regalgang',
            istHauptgang: false,
            farbe: 'rgba(200, 180, 100, 0.3)'
        });
        // Rechter Regalzugang
        neueGaenge.push({
            id: nextGangId(),
            name: 'Regalzugang Ost',
            points: [
                {
                    x: maxRegalX + 2,
                    y: minRegalY - 2
                },
                {
                    x: maxRegalX + 2,
                    y: maxRegalY + 2
                }
            ],
            breite: regalgangBreite,
            typ: 'regalgang',
            istHauptgang: false,
            farbe: 'rgba(200, 180, 100, 0.3)'
        });
        // Verbindung Regal zum Hauptweg
        const regalMitteY = (minRegalY + maxRegalY) / 2;
        if (Math.abs(regalMitteY - mitteY) > 5) {
            neueGaenge.push({
                id: nextGangId(),
                name: 'Regal-Hauptweg-Verbindung',
                points: [
                    {
                        x: minRegalX - 2,
                        y: regalMitteY
                    },
                    {
                        x: minRegalX - 2,
                        y: mitteY
                    }
                ],
                breite: hauptgangBreite,
                typ: 'hauptgang',
                istHauptgang: true,
                farbe: 'rgba(80, 180, 80, 0.35)'
            });
        }
    }
    // ============================================
    // 4. ZUFAHRTEN zu Bereichen
    // ============================================
    if (settings.generateZufahrten && bereiche.length > 0) {
        bereiche.forEach((bereich)=>{
            const bereichMitteX = bereich.x + bereich.width / 2;
            const bereichMitteY = bereich.y + bereich.height / 2;
            // Zufahrt zum Hauptweg
            neueGaenge.push({
                id: nextGangId(),
                name: `Zufahrt ${bereich.name}`,
                points: [
                    {
                        x: bereichMitteX,
                        y: bereichMitteY > mitteY ? bereich.y : bereich.y + bereich.height
                    },
                    {
                        x: bereichMitteX,
                        y: mitteY
                    }
                ],
                breite: hauptgangBreite,
                typ: 'hauptgang',
                istHauptgang: true,
                farbe: 'rgba(80, 180, 80, 0.35)'
            });
        });
    }
    return neueGaenge;
}
function createGang(name, points, breite = 3.5, typ = 'hauptgang') {
    const farben = {
        hauptgang: 'rgba(50, 150, 50, 0.4)',
        quergang: 'rgba(80, 180, 80, 0.35)',
        regalgang: 'rgba(200, 180, 100, 0.3)'
    };
    return {
        id: nextGangId(),
        name,
        points,
        breite,
        typ,
        istHauptgang: typ === 'hauptgang',
        farbe: farben[typ] || farben.hauptgang
    };
}
function calculateTotalGangLength(gaenge) {
    return gaenge.reduce((total, gang)=>{
        let length = 0;
        for(let i = 0; i < gang.points.length - 1; i++){
            const p1 = gang.points[i];
            const p2 = gang.points[i + 1];
            length += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        }
        return total + length;
    }, 0);
}
function calculateGangArea(gaenge) {
    return gaenge.reduce((total, gang)=>{
        let length = 0;
        for(let i = 0; i < gang.points.length - 1; i++){
            const p1 = gang.points[i];
            const p2 = gang.points[i + 1];
            length += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        }
        return total + length * gang.breite;
    }, 0);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/pathfinding.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/simulation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assignTaskToVehicle",
    ()=>assignTaskToVehicle,
    "calculateSimulationStats",
    ()=>calculateSimulationStats,
    "createInitialSimulationState",
    ()=>createInitialSimulationState,
    "createSimulationTask",
    ()=>createSimulationTask,
    "createSimulationVehicle",
    ()=>createSimulationVehicle,
    "generateRandomTasks",
    ()=>generateRandomTasks,
    "updateVehicle",
    ()=>updateVehicle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pathfinding.ts [app-client] (ecmascript)");
;
const createInitialSimulationState = ()=>({
        isRunning: false,
        speed: 1,
        time: 0,
        vehicles: [],
        tasks: [],
        completedTasks: 0,
        totalDistance: 0
    });
function createSimulationVehicle(id, ffz, startX, startY) {
    return {
        id,
        ffz,
        x: startX,
        y: startY,
        targetX: startX,
        targetY: startY,
        path: [],
        pathIndex: 0,
        state: 'idle',
        loadedPallet: false,
        currentTask: null
    };
}
function createSimulationTask(id, from, to, priority = 1) {
    return {
        id,
        from,
        to,
        priority
    };
}
function assignTaskToVehicle(vehicle, task, gaenge) {
    // Find path to pickup location
    const pathResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findPathBetweenObjects"])({
        ...task.from,
        x: vehicle.x,
        y: vehicle.y,
        width: 1,
        height: 1
    }, task.from, gaenge, vehicle.ffz);
    if (!pathResult) {
        return vehicle;
    }
    return {
        ...vehicle,
        currentTask: task,
        path: pathResult.path,
        pathIndex: 0,
        state: 'moving',
        targetX: task.from.x + task.from.width / 2,
        targetY: task.from.y + task.from.height / 2
    };
}
function updateVehicle(vehicle, deltaTime, gaenge) {
    let distanceMoved = 0;
    let taskCompleted = false;
    // If idle, do nothing
    if (vehicle.state === 'idle' || vehicle.path.length === 0) {
        return {
            vehicle,
            distanceMoved,
            taskCompleted
        };
    }
    // If loading/unloading, wait
    if (vehicle.state === 'loading' || vehicle.state === 'unloading') {
        const waitTime = vehicle.state === 'loading' ? vehicle.ffz.aufnahmeZeit : vehicle.ffz.abgabeZeit;
        // Simplified: complete after wait time
        if (deltaTime >= waitTime) {
            if (vehicle.state === 'loading') {
                // After loading, go to destination
                if (vehicle.currentTask) {
                    const pathResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findPathBetweenObjects"])(vehicle.currentTask.from, vehicle.currentTask.to, gaenge, vehicle.ffz);
                    if (pathResult) {
                        return {
                            vehicle: {
                                ...vehicle,
                                loadedPallet: true,
                                state: 'moving',
                                path: pathResult.path,
                                pathIndex: 0,
                                targetX: vehicle.currentTask.to.x + vehicle.currentTask.to.width / 2,
                                targetY: vehicle.currentTask.to.y + vehicle.currentTask.to.height / 2
                            },
                            distanceMoved: 0,
                            taskCompleted: false
                        };
                    }
                }
            } else {
                // After unloading, task complete
                return {
                    vehicle: {
                        ...vehicle,
                        loadedPallet: false,
                        state: 'idle',
                        currentTask: null,
                        path: [],
                        pathIndex: 0
                    },
                    distanceMoved: 0,
                    taskCompleted: true
                };
            }
        }
        return {
            vehicle,
            distanceMoved,
            taskCompleted
        };
    }
    // Moving state
    if (vehicle.state === 'moving' && vehicle.pathIndex < vehicle.path.length) {
        const target = vehicle.path[vehicle.pathIndex];
        const dx = target.x - vehicle.x;
        const dy = target.y - vehicle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Calculate speed in m/s
        const speedMs = vehicle.ffz.geschwindigkeit * 1000 / 3600;
        const moveDistance = speedMs * deltaTime;
        if (distance <= moveDistance) {
            // Reached waypoint
            distanceMoved += distance;
            vehicle = {
                ...vehicle,
                x: target.x,
                y: target.y,
                pathIndex: vehicle.pathIndex + 1
            };
            // Check if reached end of path
            if (vehicle.pathIndex >= vehicle.path.length) {
                // Reached destination
                if (!vehicle.loadedPallet && vehicle.currentTask) {
                    // At pickup location, start loading
                    return {
                        vehicle: {
                            ...vehicle,
                            state: 'loading'
                        },
                        distanceMoved,
                        taskCompleted
                    };
                } else if (vehicle.loadedPallet) {
                    // At delivery location, start unloading
                    return {
                        vehicle: {
                            ...vehicle,
                            state: 'unloading'
                        },
                        distanceMoved,
                        taskCompleted
                    };
                }
            }
        } else {
            // Move towards target
            const ratio = moveDistance / distance;
            vehicle = {
                ...vehicle,
                x: vehicle.x + dx * ratio,
                y: vehicle.y + dy * ratio
            };
            distanceMoved += moveDistance;
        }
    }
    return {
        vehicle,
        distanceMoved,
        taskCompleted
    };
}
function generateRandomTasks(objects, count) {
    const stellplaetze = objects.filter((o)=>o.type === 'stellplatz');
    const tore = objects.filter((o)=>o.type === 'tor');
    if (stellplaetze.length === 0 || tore.length === 0) {
        return [];
    }
    const tasks = [];
    for(let i = 0; i < count; i++){
        // Random from gate to stellplatz or stellplatz to gate
        const isInbound = Math.random() > 0.5;
        const from = isInbound ? tore[Math.floor(Math.random() * tore.length)] : stellplaetze[Math.floor(Math.random() * stellplaetze.length)];
        const to = isInbound ? stellplaetze[Math.floor(Math.random() * stellplaetze.length)] : tore[Math.floor(Math.random() * tore.length)];
        tasks.push(createSimulationTask(i + 1, from, to, 1));
    }
    return tasks;
}
function calculateSimulationStats(state) {
    const avgDistancePerTask = state.completedTasks > 0 ? state.totalDistance / state.completedTasks : 0;
    const avgTimePerTask = state.completedTasks > 0 && state.time > 0 ? state.time / state.completedTasks : 0;
    const throughput = state.time > 0 ? state.completedTasks / state.time * 3600 : 0;
    const busyVehicles = state.vehicles.filter((v)=>v.state !== 'idle').length;
    const utilization = state.vehicles.length > 0 ? busyVehicles / state.vehicles.length * 100 : 0;
    return {
        avgDistancePerTask,
        avgTimePerTask,
        throughput,
        utilization
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeProduktivitaet",
    ()=>analyzeProduktivitaet,
    "formatAnalyse",
    ()=>formatAnalyse,
    "generateEmpfehlungen",
    ()=>generateEmpfehlungen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gang$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gang-generator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pathfinding.ts [app-client] (ecmascript)");
;
;
// Default FFZ for calculations
const DEFAULT_FFZ = {
    id: 0,
    name: 'Standard-Stapler',
    type: 'gabelstapler',
    mindestBreite: 3.5,
    geschwindigkeit: 12,
    aufnahmeZeit: 15,
    abgabeZeit: 12,
    maxHubhoehe: 6,
    tragkraft: 2500
};
function analyzeProduktivitaet(hall, objects, gaenge, ffz = DEFAULT_FFZ) {
    // Hall metrics
    const hallenFlaeche = hall.width * hall.height;
    const gangFlaeche = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gang$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateGangArea"])(gaenge);
    const gangLaenge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gang$2d$generator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateTotalGangLength"])(gaenge);
    // Object metrics
    const objektAnzahl = objects.length;
    const stellplaetze = objects.filter((o)=>o.type === 'stellplatz');
    const tore = objects.filter((o)=>o.type === 'tor');
    const regale = objects.filter((o)=>o.type === 'regal');
    const stellplatzAnzahl = stellplaetze.length;
    const torAnzahl = tore.length;
    const regalAnzahl = regale.length;
    // Regal capacity - mit neuen Feldern (Lastenheft + Papa)
    const regalKapazitaet = regale.reduce((sum, regal)=>{
        const ebenen = regal.ebenen || 3;
        // Nutze palettenPlaetzeProEbene wenn definiert, sonst berechne
        const palettesPerLevel = regal.palettenPlaetzeProEbene || Math.floor(regal.width / 1.2);
        return sum + palettesPerLevel * ebenen;
    }, 0);
    // Stellplatz capacity - mit Stapelhöhe (Papa's Anforderung)
    const stellplatzKapazitaet = stellplaetze.reduce((sum, sp)=>{
        const stapelHoehe = sp.stapelHoehe || 1;
        // Nutze palettenProStellplatz wenn definiert, sonst berechne
        const paletten = sp.palettenProStellplatz || Math.floor(sp.width * sp.height / 1.2 * stapelHoehe);
        return sum + paletten;
    }, 0);
    // Object area
    const objektFlaeche = objects.reduce((sum, obj)=>sum + obj.width * obj.height, 0);
    // Calculate usable area
    const nutzFlaeche = hallenFlaeche - gangFlaeche;
    const nutzungsFaktor = nutzFlaeche / hallenFlaeche * 100;
    const gangAnteil = gangFlaeche / hallenFlaeche * 100;
    // Distance calculations between all stellplätze
    let distances = [];
    let times = [];
    if (stellplaetze.length >= 2 && gaenge.length > 0) {
        // Calculate distances between pairs of stellplätze
        for(let i = 0; i < Math.min(stellplaetze.length, 10); i++){
            for(let j = i + 1; j < Math.min(stellplaetze.length, 10); j++){
                const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findPathBetweenObjects"])(stellplaetze[i], stellplaetze[j], gaenge, ffz);
                if (result) {
                    distances.push(result.distance);
                    times.push(result.time);
                }
            }
        }
        // Also calculate gate to stellplatz distances
        if (tore.length > 0) {
            for (const tor of tore.slice(0, 3)){
                for (const stellplatz of stellplaetze.slice(0, 5)){
                    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findPathBetweenObjects"])(tor, stellplatz, gaenge, ffz);
                    if (result) {
                        distances.push(result.distance);
                        times.push(result.time);
                    }
                }
            }
        }
    }
    // Calculate distance metrics
    const durchschnittlicheDistanz = distances.length > 0 ? distances.reduce((a, b)=>a + b, 0) / distances.length : 0;
    const maxDistanz = distances.length > 0 ? Math.max(...distances) : 0;
    const minDistanz = distances.length > 0 ? Math.min(...distances) : 0;
    // Calculate time metrics
    const durchschnittlicheZeit = times.length > 0 ? times.reduce((a, b)=>a + b, 0) / times.length : 0;
    // Estimate cycle time (gate -> stellplatz -> gate)
    const geschaetzteDurchsatzZeit = durchschnittlicheZeit * 2 + ffz.aufnahmeZeit + ffz.abgabeZeit;
    // Calculate efficiency score (0-100)
    const effizienzScore = calculateEffizienzScore({
        durchschnittlicheDistanz,
        hallenFlaeche,
        gangAnteil,
        stellplatzAnzahl,
        torAnzahl
    });
    // Calculate optimization potential
    const optimalDistanz = Math.sqrt(hallenFlaeche) * 0.3; // theoretical optimal
    const optimierungspotential = durchschnittlicheDistanz > optimalDistanz ? (durchschnittlicheDistanz - optimalDistanz) / durchschnittlicheDistanz * 100 : 0;
    return {
        hallenFlaeche,
        nutzFlaeche,
        nutzungsFaktor,
        objektAnzahl,
        stellplatzAnzahl,
        torAnzahl,
        regalAnzahl,
        regalKapazitaet,
        gangLaenge,
        gangFlaeche,
        gangAnteil,
        durchschnittlicheDistanz,
        maxDistanz,
        minDistanz,
        durchschnittlicheZeit,
        geschaetzteDurchsatzZeit,
        effizienzScore,
        optimierungspotential
    };
}
/**
 * Calculate efficiency score based on various metrics
 */ function calculateEffizienzScore(params) {
    const { durchschnittlicheDistanz, hallenFlaeche, gangAnteil, stellplatzAnzahl, torAnzahl } = params;
    let score = 100;
    // Penalize for high average distance relative to hall size
    const optimalDistanz = Math.sqrt(hallenFlaeche) * 0.3;
    if (durchschnittlicheDistanz > optimalDistanz) {
        score -= Math.min(30, (durchschnittlicheDistanz / optimalDistanz - 1) * 20);
    }
    // Penalize for too much or too little corridor area (optimal 15-25%)
    if (gangAnteil < 10) {
        score -= (10 - gangAnteil) * 2;
    } else if (gangAnteil > 30) {
        score -= (gangAnteil - 30) * 1.5;
    }
    // Bonus for good stellplatz-to-tor ratio
    if (torAnzahl > 0 && stellplatzAnzahl > 0) {
        const ratio = stellplatzAnzahl / torAnzahl;
        if (ratio >= 5 && ratio <= 15) {
            score += 5;
        }
    }
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
}
function generateEmpfehlungen(analyse) {
    const empfehlungen = [];
    // Distance recommendations
    if (analyse.durchschnittlicheDistanz > 50) {
        empfehlungen.push('Die durchschnittliche Wegstrecke ist hoch. Erwägen Sie eine Neuanordnung der Stellplätze.');
    }
    // Corridor recommendations
    if (analyse.gangAnteil < 15) {
        empfehlungen.push('Der Ganganteil ist niedrig. Stellen Sie sicher, dass alle Bereiche erreichbar sind.');
    } else if (analyse.gangAnteil > 30) {
        empfehlungen.push('Der Ganganteil ist hoch. Prüfen Sie ob Gänge zusammengelegt werden können.');
    }
    // Gate recommendations
    if (analyse.torAnzahl < 2) {
        empfehlungen.push('Wenige Tore können zu Engpässen führen. Erwägen Sie zusätzliche Tore.');
    }
    // Stellplatz recommendations
    if (analyse.stellplatzAnzahl === 0) {
        empfehlungen.push('Keine Stellplätze definiert. Fügen Sie Stellplätze für eine genauere Analyse hinzu.');
    }
    // Efficiency recommendations
    if (analyse.effizienzScore < 60) {
        empfehlungen.push('Die Gesamt-Effizienz ist verbesserungswürdig. Nutzen Sie den Gang-Generator für optimierte Wege.');
    }
    // Optimization potential
    if (analyse.optimierungspotential > 20) {
        empfehlungen.push(`Es besteht ca. ${analyse.optimierungspotential.toFixed(0)}% Optimierungspotential bei den Wegstrecken.`);
    }
    // Regal recommendations
    if (analyse.regalAnzahl > 0 && analyse.regalKapazitaet === 0) {
        empfehlungen.push('Definieren Sie Regal-Ebenen für eine genauere Kapazitätsberechnung.');
    }
    return empfehlungen;
}
function formatAnalyse(analyse) {
    const kennzahlen = [
        {
            label: 'Hallenfläche',
            wert: analyse.hallenFlaeche.toFixed(0),
            einheit: 'm²'
        },
        {
            label: 'Nutzfläche',
            wert: analyse.nutzFlaeche.toFixed(0),
            einheit: 'm²'
        },
        {
            label: 'Nutzungsfaktor',
            wert: analyse.nutzungsFaktor.toFixed(1),
            einheit: '%'
        },
        {
            label: 'Objekte',
            wert: analyse.objektAnzahl.toString(),
            einheit: ''
        },
        {
            label: 'Stellplätze',
            wert: analyse.stellplatzAnzahl.toString(),
            einheit: ''
        },
        {
            label: 'Tore',
            wert: analyse.torAnzahl.toString(),
            einheit: ''
        },
        {
            label: 'Regale',
            wert: analyse.regalAnzahl.toString(),
            einheit: ''
        },
        {
            label: 'Regal-Kapazität',
            wert: analyse.regalKapazitaet.toString(),
            einheit: 'Paletten'
        },
        {
            label: 'Ganglänge',
            wert: analyse.gangLaenge.toFixed(0),
            einheit: 'm'
        },
        {
            label: 'Gangfläche',
            wert: analyse.gangFlaeche.toFixed(0),
            einheit: 'm²'
        },
        {
            label: 'Ganganteil',
            wert: analyse.gangAnteil.toFixed(1),
            einheit: '%'
        },
        {
            label: 'Ø Distanz',
            wert: analyse.durchschnittlicheDistanz.toFixed(1),
            einheit: 'm'
        },
        {
            label: 'Max. Distanz',
            wert: analyse.maxDistanz.toFixed(1),
            einheit: 'm'
        },
        {
            label: 'Ø Fahrzeit',
            wert: analyse.durchschnittlicheZeit.toFixed(0),
            einheit: 's'
        },
        {
            label: 'Durchsatzzeit',
            wert: analyse.geschaetzteDurchsatzZeit.toFixed(0),
            einheit: 's'
        },
        {
            label: 'Effizienz-Score',
            wert: analyse.effizienzScore.toFixed(0),
            einheit: '/100'
        }
    ];
    return {
        kennzahlen,
        empfehlungen: generateEmpfehlungen(analyse)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/spaltenzuordnungen.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/data/prozessmodell-se.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/prozessrechner.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/prozessmodell-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/prozessmodell-se.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessrechner$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prozessrechner.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
;
const useProzessmodellStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        modell: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROZESSMODELL_SE"],
        parameter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SE_STANDARD_PARAMETER"].map((p)=>({
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
            const ergebnis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prozessrechner$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["berechneMinProColli"])(modell, parameter);
            set({
                ergebnis
            });
        },
        reset: ()=>set({
                modell: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PROZESSMODELL_SE"],
                parameter: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$prozessmodell$2d$se$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SE_STANDARD_PARAMETER"].map((p)=>({
                        ...p
                    })),
                ergebnis: null
            })
    }));
const useProzessErgebnis = ()=>{
    _s();
    return useProzessmodellStore({
        "useProzessErgebnis.useProzessmodellStore": (s)=>s.ergebnis
    }["useProzessErgebnis.useProzessmodellStore"]);
};
_s(useProzessErgebnis, "vGXzc1O7YBKbx/7iQBEFpGO8QBg=", false, function() {
    return [
        useProzessmodellStore
    ];
});
const useProzessParameter = ()=>{
    _s1();
    return useProzessmodellStore({
        "useProzessParameter.useProzessmodellStore": (s)=>s.parameter
    }["useProzessParameter.useProzessmodellStore"]);
};
_s1(useProzessParameter, "vGXzc1O7YBKbx/7iQBEFpGO8QBg=", false, function() {
    return [
        useProzessmodellStore
    ];
});
const useProzessAbteilungen = ()=>{
    _s2();
    return useProzessmodellStore({
        "useProzessAbteilungen.useProzessmodellStore": (s)=>s.modell.abteilungen
    }["useProzessAbteilungen.useProzessmodellStore"]);
};
_s2(useProzessAbteilungen, "vGXzc1O7YBKbx/7iQBEFpGO8QBg=", false, function() {
    return [
        useProzessmodellStore
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/flaechenrechner.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/verteilweg-rechner.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "berechneDistanzMitCache",
    ()=>berechneDistanzMitCache,
    "berechneGewichtetenVerteilweg",
    ()=>berechneGewichtetenVerteilweg,
    "clearDistanzCache",
    ()=>clearDistanzCache
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pathfinding.ts [app-client] (ecmascript)");
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
    const graph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buildGangGraph"])(gaenge, ffz);
    const fromCenter = {
        x: from.x + from.width / 2,
        y: from.y + from.height / 2
    };
    const toCenter = {
        x: to.x + to.width / 2,
        y: to.y + to.height / 2
    };
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pathfinding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findPath"])(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y, graph, ffz);
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/data/referenzhallen.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/benchmarking.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/ist-soll-rechner.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/showcase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEMO_SCENARIOS",
    ()=>DEMO_SCENARIOS,
    "createInitialShowcaseState",
    ()=>createInitialShowcaseState,
    "generatePapaHalleObjects",
    ()=>generatePapaHalleObjects,
    "generateStandardDemoObjects",
    ()=>generateStandardDemoObjects
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/topis.ts [app-client] (ecmascript)");
;
function generateStandardDemoObjects() {
    const objects = [];
    // Tore an der Nordseite
    for(let i = 0; i < 4; i++){
        objects.push({
            type: 'tor',
            x: 15 + i * 20,
            y: 0,
            width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].tor.width,
            height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].tor.height,
            name: `Tor ${i + 1}`,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor
        });
    }
    // Stellplätze in der Mitte
    for(let row = 0; row < 2; row++){
        for(let col = 0; col < 5; col++){
            objects.push({
                type: 'stellplatz',
                x: 10 + col * 18,
                y: 8 + row * 8,
                width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].stellplatz.width,
                height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].stellplatz.height,
                name: `SP ${row * 5 + col + 1}`,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].stellplatz
            });
        }
    }
    // Regale
    for(let i = 0; i < 3; i++){
        objects.push({
            type: 'regal',
            x: 10 + i * 30,
            y: 30,
            width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].regal.width,
            height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].regal.height,
            name: `Regal ${i + 1}`,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].regal,
            ebenen: 4
        });
    }
    // Bereiche
    objects.push({
        type: 'bereich',
        x: 5,
        y: 35,
        width: 20,
        height: 12,
        name: 'Wareneingang',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].bereich
    });
    objects.push({
        type: 'bereich',
        x: 75,
        y: 35,
        width: 20,
        height: 12,
        name: 'Warenausgang',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].bereich
    });
    // Büro
    objects.push({
        type: 'buero',
        x: 90,
        y: 3,
        width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].buero.width,
        height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].buero.height,
        name: 'Büro',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].buero
    });
    // Sozialraum und WC
    objects.push({
        type: 'sozialraum',
        x: 90,
        y: 10,
        width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].sozialraum.width,
        height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].sozialraum.height,
        name: 'Sozialraum',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].sozialraum
    });
    objects.push({
        type: 'wc',
        x: 90,
        y: 18,
        width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].wc.width,
        height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].wc.height,
        name: 'WC',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].wc
    });
    // Ladestation
    objects.push({
        type: 'ladestation',
        x: 5,
        y: 20,
        width: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].ladestation.width,
        height: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_DEFAULTS"].ladestation.height,
        name: 'Ladestation',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].ladestation
    });
    return objects;
}
function generatePapaHalleObjects() {
    const objects = [];
    // ============ TORE LINKS OBEN (Eingang) - Tor 7, 8, 9, 10 ============
    objects.push({
        type: 'tor',
        x: 0,
        y: 5,
        width: 1.5,
        height: 3.5,
        name: 'Tor 10',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 40,
        entladeZeitSek: 30
    });
    objects.push({
        type: 'tor',
        x: 0,
        y: 12,
        width: 1.5,
        height: 3.5,
        name: 'Tor 9',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 35,
        entladeZeitSek: 30
    });
    objects.push({
        type: 'tor',
        x: 0,
        y: 19,
        width: 1.5,
        height: 3.5,
        name: 'Tor 8',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 30,
        entladeZeitSek: 30
    });
    objects.push({
        type: 'tor',
        x: 0,
        y: 26,
        width: 1.5,
        height: 3.5,
        name: 'Tor 7',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 45,
        entladeZeitSek: 30
    });
    // ============ TORE LINKS UNTEN (Eingang) - Tor 1, 2, 3, 6 ============
    objects.push({
        type: 'tor',
        x: 0,
        y: 35,
        width: 1.5,
        height: 3.5,
        name: 'Tor 1',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 50,
        entladeZeitSek: 30
    });
    objects.push({
        type: 'tor',
        x: 0,
        y: 42,
        width: 1.5,
        height: 3.5,
        name: 'Tor 2',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 50,
        entladeZeitSek: 30
    });
    objects.push({
        type: 'tor',
        x: 0,
        y: 49,
        width: 1.5,
        height: 3.5,
        name: 'Tor 3',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 50,
        entladeZeitSek: 30
    });
    objects.push({
        type: 'tor',
        x: 0,
        y: 56,
        width: 1.5,
        height: 3.5,
        name: 'Tor 6',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istEingang: true,
        palettenProTag: 40,
        entladeZeitSek: 30
    });
    // ============ TORE RECHTS (Ausgang) ============
    objects.push({
        type: 'tor',
        x: 98.5,
        y: 15,
        width: 1.5,
        height: 3.5,
        name: 'Tor Aus 1',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istAusgang: true,
        palettenProTag: 60,
        beladeZeitSek: 25
    });
    objects.push({
        type: 'tor',
        x: 98.5,
        y: 25,
        width: 1.5,
        height: 3.5,
        name: 'Tor Aus 2',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor,
        istAusgang: true,
        palettenProTag: 60,
        beladeZeitSek: 25
    });
    // ============ NAH VARIABEL - Stellplätze nahe Toren ============
    for(let i = 0; i < 4; i++){
        objects.push({
            type: 'stellplatz',
            x: 5,
            y: 5 + i * 8,
            width: 10,
            height: 5,
            name: `Nah ${i + 1}`,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].stellplatz
        });
    }
    // ============ BEREICHE 1, 2, 3, 4 (Mitte) ============
    // Bereich 1 - oben rechts
    objects.push({
        type: 'bereich',
        x: 55,
        y: 5,
        width: 18,
        height: 14,
        name: 'Bereich 1',
        color: '#3b5998'
    });
    // Bereich 2 - mitte rechts
    objects.push({
        type: 'bereich',
        x: 55,
        y: 22,
        width: 18,
        height: 14,
        name: 'Bereich 2',
        color: '#4a69bd'
    });
    // Bereich 3 - oben mitte
    objects.push({
        type: 'bereich',
        x: 32,
        y: 5,
        width: 18,
        height: 14,
        name: 'Bereich 3',
        color: '#6a89cc'
    });
    // Bereich 4 - mitte mitte
    objects.push({
        type: 'bereich',
        x: 32,
        y: 22,
        width: 18,
        height: 14,
        name: 'Bereich 4',
        color: '#82ccdd'
    });
    // ============ HOCHREGALLAGER (links unten) ============
    objects.push({
        type: 'bereich',
        x: 5,
        y: 45,
        width: 22,
        height: 20,
        name: 'Hochregal',
        color: '#2c3e50'
    });
    // Regalreihen im Hochregallager
    for(let i = 0; i < 4; i++){
        objects.push({
            type: 'regal',
            x: 7,
            y: 48 + i * 4,
            width: 18,
            height: 1.2,
            name: `HR ${i + 1}`,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].regal,
            ebenen: 6
        });
    }
    // ============ KOMMISSIONIERUNG ============
    objects.push({
        type: 'bereich',
        x: 32,
        y: 45,
        width: 15,
        height: 10,
        name: 'Kommission.',
        color: '#8e44ad'
    });
    // ============ BLECHE 03 ============
    objects.push({
        type: 'bereich',
        x: 50,
        y: 45,
        width: 12,
        height: 10,
        name: 'Bleche 03',
        color: '#7f8c8d'
    });
    // ============ STANGEN ============
    objects.push({
        type: 'bereich',
        x: 65,
        y: 45,
        width: 10,
        height: 10,
        name: 'Stangen',
        color: '#95a5a6'
    });
    // ============ KRAN 06 GLEISE ============
    objects.push({
        type: 'bereich',
        x: 32,
        y: 58,
        width: 43,
        height: 6,
        name: 'Kran 06 Gleise',
        color: '#e74c3c'
    });
    // ============ ENTLADEBEREICHE hinter Eingangs-Toren ============
    objects.push({
        type: 'entladebereich',
        x: 18,
        y: 5,
        width: 10,
        height: 30,
        name: 'Entlade Ein',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].entladebereich
    });
    // ============ INFRASTRUKTUR ============
    objects.push({
        type: 'buero',
        x: 80,
        y: 5,
        width: 8,
        height: 6,
        name: 'Büro',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].buero
    });
    objects.push({
        type: 'ladestation',
        x: 80,
        y: 55,
        width: 4,
        height: 4,
        name: 'Ladestation',
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].ladestation
    });
    return objects;
}
const DEMO_SCENARIOS = {
    papa: {
        name: "Papa's Testhalle",
        description: 'Umschlaghalle mit 10 Toren, Hochregal, Kommissionierung, Kran - nach Zeichnung.',
        hall: {
            width: 100,
            height: 68,
            name: 'Papa Halle',
            color: '#1a1a2e'
        },
        objects: generatePapaHalleObjects(),
        gaenge: []
    },
    standard: {
        name: 'Standard-Umschlaghalle',
        description: 'Eine typische 100×50m Umschlaghalle mit Toren, Stellplätzen und Regalen.',
        hall: {
            width: 100,
            height: 50,
            name: 'Demo-Halle',
            color: '#16213e'
        },
        objects: generateStandardDemoObjects(),
        gaenge: []
    },
    lager: {
        name: 'Lager mit Hochregalen',
        description: 'Ein Lager mit mehreren Regalreihen und optimierten Fahrgängen.',
        hall: {
            width: 80,
            height: 60,
            name: 'Lagerhalle',
            color: '#1a1a2e'
        },
        objects: [
            // Multiple regal rows
            ...Array.from({
                length: 6
            }, (_, i)=>({
                    type: 'regal',
                    x: 10,
                    y: 5 + i * 8,
                    width: 60,
                    height: 1.2,
                    name: `Regalreihe ${i + 1}`,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].regal,
                    ebenen: 5
                })),
            // Tore
            {
                type: 'tor',
                x: 10,
                y: 0,
                width: 4,
                height: 1.5,
                name: 'Tor WE',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor
            },
            {
                type: 'tor',
                x: 66,
                y: 0,
                width: 4,
                height: 1.5,
                name: 'Tor WA',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor
            },
            // Bereiche
            {
                type: 'bereich',
                x: 5,
                y: 52,
                width: 15,
                height: 6,
                name: 'Wareneingang',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].bereich
            },
            {
                type: 'bereich',
                x: 60,
                y: 52,
                width: 15,
                height: 6,
                name: 'Warenausgang',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].bereich
            }
        ],
        gaenge: []
    },
    umschlag: {
        name: 'Cross-Docking Terminal',
        description: 'Ein Umschlagterminal für schnellen Warendurchsatz.',
        hall: {
            width: 150,
            height: 50,
            name: 'Cross-Dock',
            color: '#0f172a'
        },
        objects: [
            // Tore Nordseite (Wareneingang)
            ...Array.from({
                length: 8
            }, (_, i)=>({
                    type: 'tor',
                    x: 10 + i * 17,
                    y: 0,
                    width: 3.5,
                    height: 1.5,
                    name: `WE ${i + 1}`,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor
                })),
            // Tore Südseite (Warenausgang)
            ...Array.from({
                length: 8
            }, (_, i)=>({
                    type: 'tor',
                    x: 10 + i * 17,
                    y: 48.5,
                    width: 3.5,
                    height: 1.5,
                    name: `WA ${i + 1}`,
                    color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].tor
                })),
            // Mittige Sortierfläche
            {
                type: 'bereich',
                x: 30,
                y: 18,
                width: 90,
                height: 14,
                name: 'Sortierfläche',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].bereich
            },
            // Büro
            {
                type: 'buero',
                x: 5,
                y: 20,
                width: 8,
                height: 10,
                name: 'Disposition',
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$topis$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OBJECT_COLORS"].buero
            }
        ],
        gaenge: []
    }
};
const createInitialShowcaseState = ()=>({
        isRunning: false,
        currentStep: 0,
        totalSteps: 5,
        scenario: 'standard'
    });
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/layouts/schmid-halle6.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadSchmidLayout",
    ()=>loadSchmidLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store.ts [app-client] (ecmascript)");
;
/**
 * Andreas Schmid Gersthofen - Halle 6 IST-Stand (01.10.2018)
 *
 * Basierend auf:
 * - "Neu Halle 6 IST Stand 01.10.2018.pdf"
 * - "Halle_IA 12.02.2019.pdf"
 * - Lagerhalle.mdb (Hallenmodul)
 * - Messungen_DK.xlsx
 * - Wege_Halle6.xlsx
 *
 * Halle: 150.80m × 42m
 * Tore: 85 gesamt (Süd 1-38, Ost 39-46, Nord 47-85)
 * Sektionen Nord: 8, 7, 6, 5, 4
 * Sektionen Süd: 1, 1A, 2, 3, EX
 * Kette/Band: Zentral durch die Halle
 * Entladezonen: EZ 1 (Tore 19-26), EZ 2 (Tore 65-73), EZ 3 (Tore 78-80)
 */ function createSchmidHalle6() {
    const objects = [];
    const W = 151, H = 42;
    const torW = 3, torD = 1.5;
    // SÜDSEITE - Tore 1-38
    for(let i = 0; i < 22; i++){
        objects.push({
            type: 'tor',
            x: 1 + i * 3.85,
            y: H - torD,
            width: torW,
            height: torD,
            name: `Tor ${i + 1}`,
            torNummer: i + 1
        });
    }
    for(let i = 0; i < 16; i++){
        objects.push({
            type: 'tor',
            x: 93 + i * 3.55,
            y: H - torD,
            width: torW,
            height: torD,
            name: `Tor ${23 + i}`,
            torNummer: 23 + i
        });
    }
    // OSTSEITE - Tore 39-46
    for(let i = 0; i < 8; i++){
        objects.push({
            type: 'tor',
            x: W - torD,
            y: 33 - i * 3.5,
            width: torD,
            height: torW,
            name: `Tor ${39 + i}`,
            torNummer: 39 + i
        });
    }
    // NORDSEITE - Tore 47-85
    for(let i = 0; i < 39; i++){
        objects.push({
            type: 'tor',
            x: 1 + i * 3.84,
            y: 0,
            width: torW,
            height: torD,
            name: `Tor ${85 - i}`,
            torNummer: 85 - i
        });
    }
    // KUNDENZONEN SÜDEN
    const kundenSued = [
        {
            name: 'AS',
            color: '#ef4444',
            x: 1,
            w: 15
        },
        {
            name: 'Logistix',
            color: '#3b82f6',
            x: 16,
            w: 12
        },
        {
            name: 'Murphy',
            color: '#a855f7',
            x: 28,
            w: 12
        },
        {
            name: 'Strauss',
            color: '#f59e0b',
            x: 40,
            w: 15
        },
        {
            name: 'A.Sigl',
            color: '#ec4899',
            x: 55,
            w: 12
        },
        {
            name: 'VT',
            color: '#8b5cf6',
            x: 118,
            w: 12
        },
        {
            name: 'G.Sigl',
            color: '#06b6d4',
            x: 130,
            w: 12
        }
    ];
    kundenSued.forEach((k)=>{
        objects.push({
            type: 'bereich',
            x: k.x,
            y: H - 3.5,
            width: k.w,
            height: 2,
            name: k.name,
            color: k.color
        });
    });
    // KUNDENZONEN NORDEN
    const kundenNord = [
        {
            name: 'AS Ü.79',
            color: '#ef4444',
            x: 1,
            w: 18
        },
        {
            name: 'Strauss',
            color: '#f59e0b',
            x: 20,
            w: 8
        },
        {
            name: 'VT',
            color: '#8b5cf6',
            x: 29,
            w: 8
        },
        {
            name: 'Fischer&VT 70/71',
            color: '#14b8a6',
            x: 38,
            w: 22
        },
        {
            name: 'Fischer',
            color: '#14b8a6',
            x: 78,
            w: 20
        },
        {
            name: 'G.Sigl',
            color: '#06b6d4',
            x: 100,
            w: 20
        },
        {
            name: 'Huber',
            color: '#22c55e',
            x: 122,
            w: 27
        }
    ];
    kundenNord.forEach((k)=>{
        objects.push({
            type: 'bereich',
            x: k.x,
            y: 1.5,
            width: k.w,
            height: 2,
            name: k.name,
            color: k.color
        });
    });
    // STELLPLATZ-SEKTIONEN NORDHÄLFTE
    const sektionenNord = [
        {
            name: 'Sektion 8',
            x: 2,
            w: 26
        },
        {
            name: 'Sektion 7',
            x: 31,
            w: 30
        },
        {
            name: 'Sektion 6',
            x: 80,
            w: 18
        },
        {
            name: 'Sektion 5',
            x: 101,
            w: 18
        },
        {
            name: 'Sektion 4',
            x: 122,
            w: 24
        }
    ];
    sektionenNord.forEach((s)=>{
        objects.push({
            type: 'stellplatz',
            x: s.x,
            y: 4,
            width: s.w,
            height: 6,
            name: s.name + ' oben',
            color: '#334155'
        });
        objects.push({
            type: 'stellplatz',
            x: s.x,
            y: 11,
            width: s.w,
            height: 6,
            name: s.name + ' unten',
            color: '#334155'
        });
    });
    // STELLPLATZ-SEKTIONEN SÜDHÄLFTE
    const sektionenSued = [
        {
            name: 'Sektion 1',
            x: 2,
            w: 26
        },
        {
            name: 'Sektion 1A',
            x: 31,
            w: 22
        },
        {
            name: 'Sektion 2',
            x: 56,
            w: 20
        },
        {
            name: 'Sektion 3',
            x: 118,
            w: 22
        }
    ];
    sektionenSued.forEach((s)=>{
        objects.push({
            type: 'stellplatz',
            x: s.x,
            y: 24,
            width: s.w,
            height: 6,
            name: s.name + ' oben',
            color: '#334155'
        });
        objects.push({
            type: 'stellplatz',
            x: s.x,
            y: 31,
            width: s.w,
            height: 6,
            name: s.name + ' unten',
            color: '#334155'
        });
    });
    // SONDERBEREICHE
    objects.push({
        type: 'bereich',
        x: 63,
        y: 5,
        width: 7,
        height: 12,
        name: 'BP 2',
        color: '#78716c'
    });
    objects.push({
        type: 'bereich',
        x: 71,
        y: 5,
        width: 7,
        height: 12,
        name: 'BP 1',
        color: '#78716c'
    });
    objects.push({
        type: 'bereich',
        x: 78,
        y: 25,
        width: 10,
        height: 8,
        name: 'ÜZ SE',
        color: '#a3a3a3'
    });
    objects.push({
        type: 'stellplatz',
        x: 90,
        y: 25,
        width: 25,
        height: 12,
        name: 'Paletten',
        color: '#78716c'
    });
    objects.push({
        type: 'bereich',
        x: 82,
        y: 34,
        width: 10,
        height: 4,
        name: 'BP 1 Süd',
        color: '#78716c'
    });
    objects.push({
        type: 'bereich',
        x: 93,
        y: 34,
        width: 10,
        height: 4,
        name: 'BP 2 Süd',
        color: '#78716c'
    });
    objects.push({
        type: 'buero',
        x: W - 6,
        y: 4,
        width: 5,
        height: 8,
        name: 'Büro',
        color: '#6366f1'
    });
    objects.push({
        type: 'bereich',
        x: 142,
        y: 31,
        width: 7,
        height: 6,
        name: 'EX',
        color: '#dc2626'
    });
    // KETTE / FÖRDERBAND
    objects.push({
        type: 'hindernis',
        x: 10,
        y: 19.5,
        width: 130,
        height: 3,
        name: 'Kette/Förderband',
        color: '#475569'
    });
    // ENTLADEZONEN
    objects.push({
        type: 'entladebereich',
        x: 67,
        y: H - 4,
        width: 20,
        height: 2.5,
        name: 'EZ 1 (Tore 19-26)',
        color: '#4ade80'
    });
    objects.push({
        type: 'entladebereich',
        x: 44,
        y: 1.5,
        width: 30,
        height: 2,
        name: 'EZ 2 (Tore 65-73)',
        color: '#4ade80'
    });
    objects.push({
        type: 'entladebereich',
        x: 17,
        y: 1.5,
        width: 10,
        height: 2,
        name: 'EZ 3 (Tore 78-80)',
        color: '#4ade80'
    });
    // GÄNGE
    let gangId = 1;
    const gaenge = [];
    gaenge.push({
        id: gangId++,
        name: 'Hauptgang Nord',
        points: [
            {
                x: 0,
                y: 10.5
            },
            {
                x: W,
                y: 10.5
            }
        ],
        breite: 3.5,
        typ: 'hauptgang',
        farbe: '#22c55e'
    });
    gaenge.push({
        id: gangId++,
        name: 'Hauptgang Mitte',
        points: [
            {
                x: 0,
                y: 18.5
            },
            {
                x: W,
                y: 18.5
            }
        ],
        breite: 3,
        typ: 'hauptgang',
        farbe: '#22c55e'
    });
    gaenge.push({
        id: gangId++,
        name: 'Hauptgang Mitte Süd',
        points: [
            {
                x: 0,
                y: 23
            },
            {
                x: W,
                y: 23
            }
        ],
        breite: 3,
        typ: 'hauptgang',
        farbe: '#22c55e'
    });
    gaenge.push({
        id: gangId++,
        name: 'Hauptgang Süd',
        points: [
            {
                x: 0,
                y: 30.5
            },
            {
                x: W,
                y: 30.5
            }
        ],
        breite: 3.5,
        typ: 'hauptgang',
        farbe: '#22c55e'
    });
    const quergangX = [
        0.5,
        29,
        54,
        63,
        78,
        99,
        119,
        141,
        W - 0.5
    ];
    quergangX.forEach((x, i)=>{
        gaenge.push({
            id: gangId++,
            name: `Quergang ${i + 1}`,
            points: [
                {
                    x,
                    y: 0
                },
                {
                    x,
                    y: H
                }
            ],
            breite: 3,
            typ: 'quergang',
            farbe: '#22c55e'
        });
    });
    const zufahrtX = [
        14,
        42,
        66,
        90,
        110,
        130
    ];
    zufahrtX.forEach((x, i)=>{
        gaenge.push({
            id: gangId++,
            name: `Zufahrt ${i + 1}`,
            points: [
                {
                    x,
                    y: 1.5
                },
                {
                    x,
                    y: 18
                }
            ],
            breite: 2.5,
            typ: 'regalgang',
            farbe: '#4ade80'
        });
        gaenge.push({
            id: gangId++,
            name: `Zufahrt ${i + 1} Süd`,
            points: [
                {
                    x,
                    y: 23
                },
                {
                    x,
                    y: H - 1.5
                }
            ],
            breite: 2.5,
            typ: 'regalgang',
            farbe: '#4ade80'
        });
    });
    return {
        objects,
        gaenge,
        hall: {
            width: W,
            height: H,
            name: 'Halle 6 - Andreas Schmid Gersthofen'
        }
    };
}
function loadSchmidLayout() {
    const { resetState, updateHall, addObject, setGaenge } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTopisStore"].getState();
    const layout = createSchmidHalle6();
    resetState();
    updateHall(1, {
        width: layout.hall.width,
        height: layout.hall.height,
        name: layout.hall.name,
        color: '#16213e'
    });
    layout.objects.forEach((obj)=>addObject(obj));
    setGaenge(layout.gaenge);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_c8803c3d._.js.map