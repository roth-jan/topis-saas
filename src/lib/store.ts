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

interface TopisStore extends TopisState {
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

  // Hall Actions
  setHalls: (halls) => set({ halls }),
  setActiveHall: (id) => set({ activeHallId: id }),
  updateHall: (id, updates) => set((state) => ({
    halls: state.halls.map(h => h.id === id ? { ...h, ...updates } : h)
  })),

  rotateHall90: () => set((state) => {
    const hall = state.halls.find(h => h.id === state.activeHallId);
    if (!hall) return state;

    const oldWidth = hall.width;
    const oldHeight = hall.height;

    // Rotate all objects
    const rotatedObjects = state.objects.map(obj => {
      const oldX = obj.x;
      const oldY = obj.y;
      const oldObjWidth = obj.width;
      const oldObjHeight = obj.height;

      return {
        ...obj,
        x: Math.round(oldY),
        y: Math.round(oldWidth - oldX - oldObjWidth),
        width: oldObjHeight,
        height: oldObjWidth
      };
    });

    // Swap hall dimensions
    const rotatedHalls = state.halls.map(h =>
      h.id === state.activeHallId
        ? { ...h, width: oldHeight, height: oldWidth }
        : h
    );

    return {
      halls: rotatedHalls,
      objects: rotatedObjects
    };
  }),

  // Object Actions
  addObject: (obj) => {
    const id = get().objectIdCounter;
    const newObj = { ...obj, id } as TopisObject;
    set((state) => ({
      objects: [...state.objects, newObj],
      objectIdCounter: state.objectIdCounter + 1
    }));
    return newObj;
  },
  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map(o => o.id === id ? { ...o, ...updates } : o),
    selectedObject: state.selectedObject?.id === id
      ? { ...state.selectedObject, ...updates }
      : state.selectedObject
  })),
  deleteObject: (id) => set((state) => ({
    objects: state.objects.filter(o => o.id !== id),
    selectedObject: state.selectedObject?.id === id ? null : state.selectedObject
  })),
  selectObject: (obj) => set({ selectedObject: obj, selectedPath: null, selectedGang: null, selectedPathArea: null, selectedConveyor: null }),

  // Path Actions
  addPath: (path) => set((state) => ({
    paths: [...state.paths, { ...path, id: state.pathIdCounter }],
    pathIdCounter: state.pathIdCounter + 1
  })),
  updatePath: (id, updates) => set((state) => {
    const updatedPaths = state.paths.map(p => p.id === id ? { ...p, ...updates } : p);
    const updatedPath = updatedPaths.find(p => p.id === id) || null;
    return {
      paths: updatedPaths,
      selectedPath: state.selectedPath?.id === id ? updatedPath : state.selectedPath
    };
  }),
  deletePath: (id) => set((state) => ({
    paths: state.paths.filter(p => p.id !== id),
    selectedPath: state.selectedPath?.id === id ? null : state.selectedPath
  })),
  selectPath: (path) => set({ selectedPath: path, selectedObject: null, selectedGang: null, selectedPathArea: null, selectedConveyor: null }),

  // PathArea Actions
  addPathArea: (area) => {
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
  deletePathArea: (id) => set((state) => ({
    pathAreas: state.pathAreas.filter(a => a.id !== id),
    selectedPathArea: state.selectedPathArea?.id === id ? null : state.selectedPathArea
  })),
  selectPathArea: (area) => set({ selectedPathArea: area, selectedObject: null, selectedPath: null, selectedConveyor: null, selectedGang: null }),

  // Gang Actions
  setGaenge: (gaenge) => set({ gaenge }),
  addGang: (gang) => set((state) => ({
    gaenge: [...state.gaenge, gang]
  })),
  updateGang: (id, updates) => set((state) => {
    const updatedGaenge = state.gaenge.map(g => g.id === id ? { ...g, ...updates } : g);
    return {
      gaenge: updatedGaenge,
      selectedGang: state.selectedGang?.id === id
        ? { ...state.selectedGang, ...updates }
        : state.selectedGang
    };
  }),
  deleteGang: (id) => set((state) => ({
    gaenge: state.gaenge.filter(g => g.id !== id),
    selectedGang: state.selectedGang?.id === id ? null : state.selectedGang
  })),
  selectGang: (gang) => set({ selectedGang: gang, selectedObject: null, selectedPath: null, selectedConveyor: null, selectedPathArea: null }),
  toggleShowGaenge: () => set((state) => ({ showGaenge: !state.showGaenge })),

  // FFZ Actions
  setFFZ: (ffz) => set({ ffz }),

  // Conveyor Actions
  addConveyor: (conveyor) => {
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
  deleteConveyor: (id) => set((state) => ({
    conveyors: state.conveyors.filter(c => c.id !== id),
    selectedConveyor: state.selectedConveyor?.id === id ? null : state.selectedConveyor
  })),
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
  resetState: () => set(initialState),
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
