import { create } from 'zustand';
import {
  TopisState,
  TopisObject,
  Hall,
  Path,
  PathArea,
  Gang,
  FFZ,
  Conveyor,
  Tool,
  ObjectType,
  DEFAULT_HALL,
  DEFAULT_FFZ,
  OBJECT_DEFAULTS,
  ProjektSnapshot
} from '@/types/topis';
import type { LayoutSnapshot } from '@/types/betriebsdaten';

// ==================== UNDO/REDO ====================
const MAX_UNDO_STACK = 50;

function captureLayoutSnapshot(state: TopisState): LayoutSnapshot {
  return {
    objects: JSON.parse(JSON.stringify(state.objects)),
    gaenge: JSON.parse(JSON.stringify(state.gaenge)),
    ffz: JSON.parse(JSON.stringify(state.ffz)),
    halls: JSON.parse(JSON.stringify(state.halls)),
    paths: JSON.parse(JSON.stringify(state.paths)),
    pathAreas: JSON.parse(JSON.stringify(state.pathAreas)),
    conveyors: JSON.parse(JSON.stringify(state.conveyors)),
  };
}

function restoreLayoutSnapshot(snapshot: LayoutSnapshot): Partial<TopisState> {
  return {
    objects: JSON.parse(JSON.stringify(snapshot.objects)) as TopisObject[],
    gaenge: JSON.parse(JSON.stringify(snapshot.gaenge)) as Gang[],
    ffz: JSON.parse(JSON.stringify(snapshot.ffz)) as FFZ[],
    halls: JSON.parse(JSON.stringify(snapshot.halls)) as Hall[],
    paths: JSON.parse(JSON.stringify(snapshot.paths || [])) as Path[],
    pathAreas: JSON.parse(JSON.stringify(snapshot.pathAreas || [])) as PathArea[],
    conveyors: JSON.parse(JSON.stringify(snapshot.conveyors || [])) as Conveyor[],
    selectedObject: null,
    selectedPath: null,
    selectedGang: null,
    selectedPathArea: null,
    selectedConveyor: null,
  };
}

interface TopisStore extends TopisState {
  // Undo/Redo
  undoStack: LayoutSnapshot[];
  redoStack: LayoutSnapshot[];
  originalLayout: LayoutSnapshot | null;
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveOriginalLayout: () => void;
  resetToOriginal: () => void;

  // Hall Actions
  setHalls: (halls: Hall[]) => void;
  setActiveHall: (id: number) => void;
  updateHall: (id: number, updates: Partial<Hall>) => void;
  rotateHall90: () => void;

  // Object Actions
  addObject: (obj: Omit<TopisObject, 'id'>) => TopisObject;
  updateObject: (id: number, updates: Partial<TopisObject>) => void;
  deleteObject: (id: number) => void;
  selectObject: (obj: TopisObject | null) => void;

  // Path Actions
  addPath: (path: Omit<Path, 'id'>) => void;
  updatePath: (id: number, updates: Partial<Path>) => void;
  deletePath: (id: number) => void;
  selectPath: (path: Path | null) => void;

  // Gang Actions
  setGaenge: (gaenge: Gang[]) => void;
  addGang: (gang: Gang) => void;
  updateGang: (id: number, updates: Partial<Gang>) => void;
  deleteGang: (id: number) => void;
  selectGang: (gang: Gang | null) => void;
  toggleShowGaenge: () => void;

  // FFZ Actions
  setFFZ: (ffz: FFZ[]) => void;

  // PathArea Actions
  addPathArea: (area: Omit<PathArea, 'id'>) => PathArea;
  updatePathArea: (id: number, updates: Partial<PathArea>) => void;
  deletePathArea: (id: number) => void;
  selectPathArea: (area: PathArea | null) => void;

  // Conveyor Actions
  addConveyor: (conveyor: Omit<Conveyor, 'id'>) => Conveyor;
  updateConveyor: (id: number, updates: Partial<Conveyor>) => void;
  deleteConveyor: (id: number) => void;
  selectConveyor: (conveyor: Conveyor | null) => void;

  // View Actions
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setTool: (tool: Tool) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  // Project Actions
  saveVorher: (snapshot: ProjektSnapshot, screenshot: string) => void;
  saveNachher: (snapshot: ProjektSnapshot, screenshot: string) => void;
  loadSnapshot: (type: 'vorher' | 'nachher') => void;

  // Bulk Actions
  resetState: () => void;
  loadState: (state: Partial<TopisState>) => void;
}

const initialState: TopisState = {
  halls: [{ ...DEFAULT_HALL }],
  activeHallId: 1,
  hall: {
    width: DEFAULT_HALL.width,
    height: DEFAULT_HALL.height,
    shape: DEFAULT_HALL.shape,
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
  ffz: [...DEFAULT_FFZ],
  selectedPathArea: null,
  conveyors: [],
  conveyorIdCounter: 1,
  selectedConveyor: null,
  currentConveyor: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
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

export const useTopisStore = create<TopisStore>((set, get) => ({
  ...initialState,

  // Undo/Redo state
  undoStack: [],
  redoStack: [],
  originalLayout: null,

  pushSnapshot: () => set((state) => {
    const snapshot = captureLayoutSnapshot(state);
    const newStack = [...state.undoStack, snapshot].slice(-MAX_UNDO_STACK);
    return { undoStack: newStack, redoStack: [] };
  }),

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;

    const currentSnapshot = captureLayoutSnapshot(get());
    const previousSnapshot = undoStack[undoStack.length - 1];
    const restored = restoreLayoutSnapshot(previousSnapshot);

    set((state) => ({
      ...restored,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentSnapshot],
    }));
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;

    const currentSnapshot = captureLayoutSnapshot(get());
    const nextSnapshot = redoStack[redoStack.length - 1];
    const restored = restoreLayoutSnapshot(nextSnapshot);

    set((state) => ({
      ...restored,
      undoStack: [...state.undoStack, currentSnapshot],
      redoStack: state.redoStack.slice(0, -1),
    }));
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  saveOriginalLayout: () => set((state) => ({
    originalLayout: captureLayoutSnapshot(state),
  })),

  resetToOriginal: () => {
    const { originalLayout } = get();
    if (!originalLayout) return;
    const currentSnapshot = captureLayoutSnapshot(get());
    const restored = restoreLayoutSnapshot(originalLayout);
    set((state) => ({
      ...restored,
      undoStack: [...state.undoStack, currentSnapshot],
      redoStack: [],
    }));
  },

  // Hall Actions
  setHalls: (halls) => { get().pushSnapshot(); set({ halls }); },
  setActiveHall: (id) => set({ activeHallId: id }),
  updateHall: (id, updates) => {
    get().pushSnapshot();
    set((state) => ({
      halls: state.halls.map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  },

  rotateHall90: () => {
    get().pushSnapshot();
    set((state) => {
      const hall = state.halls.find(h => h.id === state.activeHallId);
      if (!hall) return state;

      const oldWidth = hall.width;
      const oldHeight = hall.height;

      const rotatedObjects = state.objects.map(obj => ({
        ...obj,
        x: Math.round(obj.y),
        y: Math.round(oldWidth - obj.x - obj.width),
        width: obj.height,
        height: obj.width
      }));

      const rotatedHalls = state.halls.map(h =>
        h.id === state.activeHallId
          ? { ...h, width: oldHeight, height: oldWidth }
          : h
      );

      return { halls: rotatedHalls, objects: rotatedObjects };
    });
  },

  // Object Actions
  addObject: (obj) => {
    get().pushSnapshot();
    const id = get().objectIdCounter;
    const newObj = { ...obj, id } as TopisObject;
    set((state) => ({
      objects: [...state.objects, newObj],
      objectIdCounter: state.objectIdCounter + 1
    }));
    return newObj;
  },
  updateObject: (id, updates) => {
    get().pushSnapshot();
    set((state) => ({
      objects: state.objects.map(o => o.id === id ? { ...o, ...updates } : o),
      selectedObject: state.selectedObject?.id === id
        ? { ...state.selectedObject, ...updates }
        : state.selectedObject
    }));
  },
  deleteObject: (id) => {
    get().pushSnapshot();
    set((state) => ({
      objects: state.objects.filter(o => o.id !== id),
      selectedObject: state.selectedObject?.id === id ? null : state.selectedObject
    }));
  },
  selectObject: (obj) => set({ selectedObject: obj, selectedPath: null, selectedGang: null, selectedPathArea: null, selectedConveyor: null }),

  // Path Actions
  addPath: (path) => {
    get().pushSnapshot();
    set((state) => ({
      paths: [...state.paths, { ...path, id: state.pathIdCounter }],
      pathIdCounter: state.pathIdCounter + 1
    }));
  },
  updatePath: (id, updates) => set((state) => {
    const updatedPaths = state.paths.map(p => p.id === id ? { ...p, ...updates } : p);
    const updatedPath = updatedPaths.find(p => p.id === id) || null;
    return {
      paths: updatedPaths,
      selectedPath: state.selectedPath?.id === id ? updatedPath : state.selectedPath
    };
  }),
  deletePath: (id) => {
    get().pushSnapshot();
    set((state) => ({
      paths: state.paths.filter(p => p.id !== id),
      selectedPath: state.selectedPath?.id === id ? null : state.selectedPath
    }));
  },
  selectPath: (path) => set({ selectedPath: path, selectedObject: null, selectedGang: null, selectedPathArea: null, selectedConveyor: null }),

  // PathArea Actions
  addPathArea: (area) => {
    get().pushSnapshot();
    const id = get().pathAreaIdCounter;
    const newArea = { ...area, id } as PathArea;
    set((state) => ({
      pathAreas: [...state.pathAreas, newArea],
      pathAreaIdCounter: state.pathAreaIdCounter + 1
    }));
    return newArea;
  },
  updatePathArea: (id, updates) => set((state) => {
    const updatedAreas = state.pathAreas.map(a => a.id === id ? { ...a, ...updates } : a);
    return {
      pathAreas: updatedAreas,
      selectedPathArea: state.selectedPathArea?.id === id
        ? { ...state.selectedPathArea, ...updates }
        : state.selectedPathArea
    };
  }),
  deletePathArea: (id) => {
    get().pushSnapshot();
    set((state) => ({
      pathAreas: state.pathAreas.filter(a => a.id !== id),
      selectedPathArea: state.selectedPathArea?.id === id ? null : state.selectedPathArea
    }));
  },
  selectPathArea: (area) => set({ selectedPathArea: area, selectedObject: null, selectedPath: null, selectedConveyor: null, selectedGang: null }),

  // Gang Actions
  setGaenge: (gaenge) => { get().pushSnapshot(); set({ gaenge }); },
  addGang: (gang) => {
    get().pushSnapshot();
    set((state) => ({ gaenge: [...state.gaenge, gang] }));
  },
  updateGang: (id, updates) => set((state) => {
    const updatedGaenge = state.gaenge.map(g => g.id === id ? { ...g, ...updates } : g);
    return {
      gaenge: updatedGaenge,
      selectedGang: state.selectedGang?.id === id
        ? { ...state.selectedGang, ...updates }
        : state.selectedGang
    };
  }),
  deleteGang: (id) => {
    get().pushSnapshot();
    set((state) => ({
      gaenge: state.gaenge.filter(g => g.id !== id),
      selectedGang: state.selectedGang?.id === id ? null : state.selectedGang
    }));
  },
  selectGang: (gang) => set({ selectedGang: gang, selectedObject: null, selectedPath: null, selectedConveyor: null, selectedPathArea: null }),
  toggleShowGaenge: () => set((state) => ({ showGaenge: !state.showGaenge })),

  // FFZ Actions
  setFFZ: (ffz) => set({ ffz }),

  // Conveyor Actions
  addConveyor: (conveyor) => {
    get().pushSnapshot();
    const id = get().conveyorIdCounter;
    const newConveyor = { ...conveyor, id } as Conveyor;
    set((state) => ({
      conveyors: [...state.conveyors, newConveyor],
      conveyorIdCounter: state.conveyorIdCounter + 1
    }));
    return newConveyor;
  },
  updateConveyor: (id, updates) => set((state) => {
    const updatedConveyors = state.conveyors.map(c => c.id === id ? { ...c, ...updates } : c);
    return {
      conveyors: updatedConveyors,
      selectedConveyor: state.selectedConveyor?.id === id
        ? { ...state.selectedConveyor, ...updates }
        : state.selectedConveyor
    };
  }),
  deleteConveyor: (id) => {
    get().pushSnapshot();
    set((state) => ({
      conveyors: state.conveyors.filter(c => c.id !== id),
      selectedConveyor: state.selectedConveyor?.id === id ? null : state.selectedConveyor
    }));
  },
  selectConveyor: (conveyor) => set({ selectedConveyor: conveyor, selectedObject: null, selectedPath: null, selectedGang: null, selectedPathArea: null }),

  // View Actions
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (pan) => set({ pan }),
  setTool: (tool) => set({ currentTool: tool }),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  // Project Actions
  saveVorher: (snapshot, screenshot) => set((state) => ({
    projektVergleich: {
      ...state.projektVergleich,
      vorher: snapshot,
      vorherScreenshot: screenshot
    }
  })),
  saveNachher: (snapshot, screenshot) => set((state) => ({
    projektVergleich: {
      ...state.projektVergleich,
      nachher: snapshot,
      nachherScreenshot: screenshot
    }
  })),
  loadSnapshot: (type) => {
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
  resetState: () => set({ ...initialState, undoStack: [], redoStack: [], originalLayout: null }),
  loadState: (newState) => set((state) => ({ ...state, ...newState }))
}));

// Selector hooks for performance
export const useObjects = () => useTopisStore((state) => state.objects);
export const useSelectedObject = () => useTopisStore((state) => state.selectedObject);
export const useHalls = () => useTopisStore((state) => state.halls);
export const useActiveHall = () => useTopisStore((state) =>
  state.halls.find(h => h.id === state.activeHallId) || state.halls[0]
);
export const useTool = () => useTopisStore((state) => state.currentTool);
export const useZoom = () => useTopisStore((state) => state.zoom);
export const usePan = () => useTopisStore((state) => state.pan);
export const useSelectedGang = () => useTopisStore((state) => state.selectedGang);
export const useSelectedPathArea = () => useTopisStore((state) => state.selectedPathArea);
export const useSelectedConveyor = () => useTopisStore((state) => state.selectedConveyor);
