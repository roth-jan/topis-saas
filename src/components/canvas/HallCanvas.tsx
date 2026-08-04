'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useTopisStore, useActiveHall, useObjects, useZoom, usePan, useTool } from '@/lib/store';
import { useBetriebsdatenStore, useHeatmapConfig } from '@/lib/betriebsdaten-store';
import { SCALE, TopisObject, ObjectType, OBJECT_COLORS, OBJECT_DEFAULTS, OBJECT_LABELS, Gang, PathArea, Conveyor } from '@/types/topis';
import { getHeatmapColor, getMetrikWert, formatMetrikWert } from '@/lib/heatmap-utils';
import { findPathBetweenObjects, lineCrossesAnyWall, buildGangGraph, findPath } from '@/lib/pathfinding';
import { findNearestAnchor } from '@/lib/path-anchor';
import { findGangSnap, extendEndpointToNearbyGang, isGangIsolated, type SnapResult } from '@/lib/gang-snap';
import { findSnap, SNAP_COLORS, type SnapHit } from '@/lib/canvas-snap';
import { pathForFormVariante, pointInFormVariante } from '@/lib/shape-render';
import { computeAlignment } from '@/lib/alignment';
import { hallOutline } from '@/lib/hall-shape';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export function HallCanvas() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== 'light'; // Default dunkel
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const rulerTopRef = useRef<HTMLCanvasElement>(null);
  const rulerLeftRef = useRef<HTMLCanvasElement>(null);

  const hall = useActiveHall();
  const objects = useObjects();
  const zoom = useZoom();
  const pan = usePan();
  const tool = useTool();
  const gaenge = useTopisStore((s) => s.gaenge);
  const cockpitRoute = useTopisStore((s) => s.cockpitRoute);
  // Brandschutzwände aus objects extrahieren - für A*-Wand-Blocker (Pfad darf nicht durch Wand)
  // Undurchlässige Objekte (Stapler kann nicht durchfahren).
  // Generisch: jeder Typ der typischerweise undurchlässig ist (wand, bereich, regal, hindernis)
  // PLUS explizit per istUndurchlaessig-Flag markierte Objekte.
  const brandschutzWaende = useMemo(
    () => objects.filter(o => {
      if (o.istUndurchlaessig === false) return false; // explizit ausgeschaltet
      if (o.istUndurchlaessig === true) return true;   // explizit eingeschaltet
      // Default-Verhalten je Typ. Türen sind NIE Blocker (Lastenheft 3.1.1.2)
      // — sie werden zusätzlich an lineCrossesAnyWall mitgegeben um die
      // Wand-Region als Durchlass zu öffnen.
      if (o.type === 'tuer') return true;
      return o.type === 'wand' || o.type === 'bereich' || o.type === 'regal' || o.type === 'hindernis';
    }),
    [objects]
  );
  // Gang-Graph einmal pro gaenge-Wechsel cachen statt 5x pro Render bauen.
  const gangGraph = useMemo(() => buildGangGraph(gaenge), [gaenge]);
  const simAuftraege = useTopisStore((s) => s.simAuftraege);
  const simAuftragPending = useTopisStore((s) => s.simAuftragPending);
  const startSimAuftrag = useTopisStore((s) => s.startSimAuftrag);
  const cancelSimAuftrag = useTopisStore((s) => s.cancelSimAuftrag);
  const finishSimAuftrag = useTopisStore((s) => s.finishSimAuftrag);
  const focusedTorId = useTopisStore((s) => s.focusedTorId);
  const showAllSimRoutes = useTopisStore((s) => s.showAllSimRoutes);
  const setFocusedTor = useTopisStore((s) => s.setFocusedTor);
  const animationActiveId = useTopisStore((s) => s.animationActiveId);
  const setAnimationActive = useTopisStore((s) => s.setAnimationActive);
  const [animationProgress, setAnimationProgress] = useState(0);
  const showGaenge = useTopisStore((s) => s.showGaenge);
  const showGrid = useTopisStore((s) => s.showGrid);
  const selectedObject = useTopisStore((s) => s.selectedObject);
  const paths = useTopisStore((s) => s.paths);
  const pathAreas = useTopisStore((s) => s.pathAreas);
  const conveyors = useTopisStore((s) => s.conveyors);
  const addPath = useTopisStore((s) => s.addPath);
  const updatePath = useTopisStore((s) => s.updatePath);
  const deletePath = useTopisStore((s) => s.deletePath);
  const selectPath = useTopisStore((s) => s.selectPath);
  const selectedPath = useTopisStore((s) => s.selectedPath);
  const addPathArea = useTopisStore((s) => s.addPathArea);
  const addConveyor = useTopisStore((s) => s.addConveyor);

  const setZoom = useTopisStore((s) => s.setZoom);
  const setPan = useTopisStore((s) => s.setPan);
  const selectObject = useTopisStore((s) => s.selectObject);
  const updateObject = useTopisStore((s) => s.updateObject);
  const addObject = useTopisStore((s) => s.addObject);
  const addObjects = useTopisStore((s) => s.addObjects);
  const nlGhost = useTopisStore((s) => s.nlGhost);
  const addGang = useTopisStore((s) => s.addGang);
  const updateGang = useTopisStore((s) => s.updateGang);
  const selectGang = useTopisStore((s) => s.selectGang);
  const selectedGang = useTopisStore((s) => s.selectedGang);
  const selectPathArea = useTopisStore((s) => s.selectPathArea);
  const selectedPathArea = useTopisStore((s) => s.selectedPathArea);
  const selectConveyor = useTopisStore((s) => s.selectConveyor);
  const selectedConveyor = useTopisStore((s) => s.selectedConveyor);
  const setTool = useTopisStore((s) => s.setTool);
  const heatmapConfig = useHeatmapConfig();
  const betriebsAnalyse = useBetriebsdatenStore((s) => s.analyse);

  const [isDragging, setIsDragging] = useState(false);
  // Drag-Threshold: 3px Maus-Bewegung bevor Object-Move startet. Verhindert
  // versehentliches Verschieben beim Klicken auf ein Element (Nico 22.05.).
  const dragMouseStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragThresholdPassedRef = useRef(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragObject, setDragObject] = useState<TopisObject | null>(null);
  // Ausrichtungslinien + Live-Maß beim Ziehen (in WELT-Koordinaten; draw() rendert sie oben).
  const alignRef = useRef<{ vx: number[]; hy: number[]; measures: { x: number; y: number; text: string }[] } | null>(null);
  // Serie ziehen (Drag-to-Fill, Factorio-Stil): Alt+Ziehen eines Objekts → Reihe von Kopien.
  const [serieSrc, setSerieSrc] = useState<TopisObject | null>(null);
  const [serieGhosts, setSerieGhosts] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  // Hover-Feedback (A2): Objekt unter dem Cursor hervorheben.
  const [hoverObjectId, setHoverObjectId] = useState<number | null>(null);
  // Tor-Pinsel ("Tor-Reihe"): an einer Wand ziehen → Vorschau mehrerer Tore
  // im festen Achsabstand, beim Loslassen als Batch anlegen (ein Undo-Schritt).
  const [pinselStart, setPinselStart] = useState<{ x: number; y: number } | null>(null);
  const [pinselSide, setPinselSide] = useState<'north' | 'south' | 'east' | 'west' | null>(null);
  const [pinselGhosts, setPinselGhosts] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  // Resize-State: an welcher Ecke des selektierten Objekts wird gezogen
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; h: number; mx: number; my: number } | null>(null);

  // Gang drawing state
  const [gangDrawStart, setGangDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [gangMousePos, setGangMousePos] = useState<{ x: number; y: number } | null>(null);
  // SimCity-Style Snap-Preview: aktueller Snap-Treffer beim Gang-Werkzeug
  const [gangSnap, setGangSnap] = useState<SnapResult>({ snapped: false });
  // Snap-Preview für andere Werkzeuge (Path, PathArea)
  const [toolSnap, setToolSnap] = useState<SnapHit | null>(null);
  // Drag-Handle für existierende Gang-Endpunkte
  const [gangEndpointDrag, setGangEndpointDrag] = useState<{ gangId: number; pointIndex: 0 | 1 } | null>(null);
  // Vorberechnete Graph-Knoten für die permanente Visualisierung
  const gangGraphNodes = useMemo(() => gangGraph.nodes, [gangGraph]);

  // Path drawing state
  const [pathDrawing, setPathDrawing] = useState(false);
  const [pathDragStart, setPathDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<{ waypoints: { x: number; y: number; objectId: number | null }[] } | null>(null);
  const [pathMousePos, setPathMousePos] = useState<{ x: number; y: number } | null>(null);

  // PathArea drawing state
  const [pathAreaStart, setPathAreaStart] = useState<{ x: number; y: number } | null>(null);
  const [pathAreaMousePos, setPathAreaMousePos] = useState<{ x: number; y: number } | null>(null);
  // Bereich per Rechteck aufziehen (A3, Prison-Architect-„Foundation-Tool").
  const [bereichStart, setBereichStart] = useState<{ x: number; y: number } | null>(null);
  const [bereichMousePos, setBereichMousePos] = useState<{ x: number; y: number } | null>(null);

  // Measure tool state
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null);

  // Stapler-Animation: requestAnimationFrame-Loop läuft solange animationActiveId gesetzt ist.
  // KONSTANTE Visual-Geschwindigkeit (40 m/s, ca. 12x Echtzeit) — kurze Pfade gehen schnell,
  // lange Pfade dauern proportional länger. Mindest-Dauer 0,8 s damit Mini-Wege sichtbar bleiben.
  useEffect(() => {
    if (!animationActiveId) {
      setAnimationProgress(0);
      return;
    }
    // Pfad-Länge (in Meter) für diese Animation bestimmen
    const a = simAuftraege.find((s) => s.id === animationActiveId);
    const von = a && objects.find((o) => o.id === a.vonObjectId);
    const nach = a && objects.find((o) => o.id === a.nachObjectId);
    let totalMeters = 50;
    if (a && von && nach) {
      const aCx = von.x + von.width / 2;
      const aCy = von.y + von.height / 2;
      const bCx = nach.x + nach.width / 2;
      const bCy = nach.y + nach.height / 2;
      try {
        const r = findPathBetweenObjects(von, nach, gangGraph, undefined, brandschutzWaende, pathAreas);
        totalMeters = r ? r.distance : Math.sqrt((bCx - aCx) ** 2 + (bCy - aCy) ** 2);
      } catch {
        totalMeters = Math.sqrt((bCx - aCx) ** 2 + (bCy - aCy) ** 2);
      }
    }
    const VISUAL_SPEED_M_S = 40;
    const duration = Math.max(800, (totalMeters / VISUAL_SPEED_M_S) * 1000);

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setAnimationProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setAnimationActive(null), 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animationActiveId, setAnimationActive, simAuftraege, objects, gaenge]);

  // Conveyor drawing state
  const [currentConveyor, setCurrentConveyor] = useState<{ points: { x: number; y: number }[] } | null>(null);
  const [conveyorMousePos, setConveyorMousePos] = useState<{ x: number; y: number } | null>(null);

  // Context menu state (for paths)
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    pathId: number;
    waypointIndex?: number;
  } | null>(null);

  // Object context menu state (right-click on overlapping objects)
  const [objectContextMenu, setObjectContextMenu] = useState<{
    x: number;
    y: number;
    objects: TopisObject[];
  } | null>(null);

  // Click-cycling state: track last click position and cycle index
  const [clickCycle, setClickCycle] = useState<{
    wx: number;
    wy: number;
    index: number;
    timestamp: number;
  } | null>(null);

  // Touch-Geraet-Erkennung — einmal pro Mount auswerten, nicht pro Klick.
  // Auf Touch-Geraeten (Tablet) erweitern wir die Klick-Toleranz fuer Tore,
  // damit man mit dem Finger genauer trifft. Maus-User merken nichts.
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    setIsCoarsePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsCoarsePointer(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
    };
  }, []);

  // Selected waypoint index (for highlighting)
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null);

  // Waypoint dragging state
  const [draggingWaypoint, setDraggingWaypoint] = useState<{
    pathId: number;
    waypointIndex: number;
  } | null>(null);

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((x: number, y: number) => ({
    x: x * SCALE * zoom + pan.x,
    y: y * SCALE * zoom + pan.y
  }), [zoom, pan]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((x: number, y: number) => ({
    x: (x - pan.x) / (SCALE * zoom),
    y: (y - pan.y) / (SCALE * zoom)
  }), [zoom, pan]);

  // Find ALL objects at position, sorted smallest first
  const findAllObjectsAt = useCallback((wx: number, wy: number): TopisObject[] => {
    const tolerance = Math.max(0.5, 2 / zoom);
    // Auf Touch-Geraeten: ~10px in Welt-Koordinaten extra Toleranz fuer Tore,
    // damit Finger-Klicks sicher treffen. 10px / SCALE / zoom = 1/zoom Meter.
    const torTouchExtra = isCoarsePointer ? 1 / Math.max(zoom, 0.1) : 0;

    const hits: TopisObject[] = [];
    for (const obj of objects) {
      const extra = obj.type === 'tor' ? torTouchExtra : 0;
      // AABB als schnelle Vorprüfung (mit optionalem Touch-Extra für Tore).
      if (wx >= obj.x - extra && wx <= obj.x + obj.width + extra &&
          wy >= obj.y - extra && wy <= obj.y + obj.height + extra) {
        // Lastenheft 3.1.3.1: bei formVariante=circle|trapez|polygon
        // muss die Hit-Detection mit der gerenderten Form übereinstimmen.
        // Touch-Extra wird hier ignoriert — die Form ist eng am sichtbaren
        // Rand; Toleranz greift im zweiten Pass.
        if (obj.formVariante && obj.formVariante !== 'rect') {
          if (!pointInFormVariante(wx, wy, obj)) continue;
        }
        hits.push(obj);
      }
    }

    // Also check with tolerance for small nearby objects
    if (hits.length === 0) {
      for (const obj of objects) {
        const extra = obj.type === 'tor' ? torTouchExtra : 0;
        const tol = tolerance + extra;
        if (wx >= obj.x - tol && wx <= obj.x + obj.width + tol &&
            wy >= obj.y - tol && wy <= obj.y + obj.height + tol) {
          // Hier akzeptieren wir die AABB-Toleranz auch für Nicht-Rect-Formen,
          // damit Touch-Klicks bei kleinen Objekten zuverlässig treffen.
          hits.push(obj);
        }
      }
    }

    // Sort by area: smallest first
    hits.sort((a, b) => (a.width * a.height) - (b.width * b.height));
    return hits;
  }, [objects, zoom, isCoarsePointer]);

  // Find object at position with click-cycling support
  const findObjectAt = useCallback((wx: number, wy: number): TopisObject | null => {
    let hits = findAllObjectsAt(wx, wy);
    if (hits.length === 0) return null;
    // Bereiche sind Hintergrund-Zonen (enthalten ihre Stellplätze bewusst). Solange am
    // Klickpunkt ein SOLIDES Objekt liegt, die Zonen beim Auswählen/Durchblättern ignorieren
    // → ein Klick (auch mehrfach) auf einen Stellplatz wählt IMMER den Stellplatz, nicht die
    // Zone darunter. Eine Zone wählt man an einer freien Stelle (ohne solides Objekt) an.
    const solid = hits.filter((o) => o.type !== 'bereich');
    if (solid.length > 0) hits = solid;

    // Check if this is a repeated click at the same position (within 3m tolerance)
    const now = Date.now();
    if (clickCycle &&
        Math.abs(wx - clickCycle.wx) < 3 &&
        Math.abs(wy - clickCycle.wy) < 3 &&
        now - clickCycle.timestamp < 2000) {
      // Cycle to next object
      const nextIndex = (clickCycle.index + 1) % hits.length;
      setClickCycle({ wx, wy, index: nextIndex, timestamp: now });
      return hits[nextIndex];
    }

    // First click at this position: pick smallest
    setClickCycle({ wx, wy, index: 0, timestamp: now });
    return hits[0];
  }, [findAllObjectsAt, clickCycle]);

  // Find nearest valid anchor (Tor/Bereich/Stellplatz/Sonderplatz/Messpunkt),
  // optional gefiltert nach Wegpunkt-Rolle.
  const findNearestObject = useCallback((
    wx: number,
    wy: number,
    tolerance: number = 3,
    rolle: 'start' | 'ende' | 'beides' = 'beides',
  ): TopisObject | null => {
    return findNearestAnchor(objects, wx, wy, tolerance, rolle);
  }, [objects]);

  // Find gang at position (point-to-line-segment distance with breite tolerance)
  const findGangAt = useCallback((wx: number, wy: number): Gang | null => {
    if (!showGaenge) return null;
    for (const gang of gaenge) {
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
  }, [gaenge, showGaenge]);

  // Find pathArea at position
  const findPathAreaAt = useCallback((wx: number, wy: number): PathArea | null => {
    for (const area of pathAreas) {
      if (area.x != null && area.y != null && area.width != null && area.height != null) {
        if (wx >= area.x && wx <= area.x + area.width &&
            wy >= area.y && wy <= area.y + area.height) {
          return area;
        }
      }
    }
    return null;
  }, [pathAreas]);

  // Find conveyor at position
  const findConveyorAt = useCallback((wx: number, wy: number): Conveyor | null => {
    const tolerance = Math.max(1, 2 / zoom);
    for (const conv of conveyors) {
      for (let i = 0; i < conv.points.length - 1; i++) {
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
  }, [conveyors, zoom]);

  // Save path with automatic object linking.
  // Wenn der User nur 2 Punkte klickt und beide auf einem Anker landen (Tor/Bereich/Stellplatz),
  // wird automatisch über das Gang-Netzwerk (A*) geroutet, statt eine Luftlinie zu ziehen.
  // Mehr als 2 Klicks → manueller Pfad bleibt wie geklickt.
  const savePathWithLinks = useCallback((waypoints: { x: number; y: number; objectId: number | null }[], color: string = '#f59e0b') => {
    if (waypoints.length < 2) return;

    const firstPoint = waypoints[0];
    const lastPoint = waypoints[waypoints.length - 1];

    const startObj = findNearestObject(firstPoint.x, firstPoint.y, 5, 'start');
    const endObj = findNearestObject(lastPoint.x, lastPoint.y, 5, 'ende');

    let finalWaypoints = waypoints;
    let routedOverGang = false;

    if (waypoints.length === 2 && startObj && endObj && startObj.id !== endObj.id) {
      const routed = findPathBetweenObjects(startObj, endObj, gangGraph, undefined, brandschutzWaende, pathAreas);
      if (routed && routed.path.length >= 2) {
        finalWaypoints = routed.path.map(p => ({ x: p.x, y: p.y, objectId: null }));
        routedOverGang = true;
      } else {
        toast.error(
          `Kein durchgehender Weg von ${startObj.name} nach ${endObj.name} gefunden. Prüfe Wegflächen / Wände / Gang-Netz.`,
          { duration: 5000 },
        );
        return;
      }
    } else if (waypoints.length >= 3 && gangGraph.nodes.length > 0) {
      // Lastenheft 3.1.4.2 „orientiert an Mitte des Wegs": auch manuelle Pfade
      // mit 3+ Stützstellen folgen der Mittellinie. Zwischen jedem Klick-Paar
      // A*. Wenn ein Segment kein A*-Ergebnis liefert → Luftlinie als Fallback.
      const stitched: { x: number; y: number; objectId: number | null }[] = [];
      let anyRouted = false;
      for (let i = 0; i + 1 < waypoints.length; i++) {
        const a = waypoints[i];
        const b = waypoints[i + 1];
        const r = findPath(a.x, a.y, b.x, b.y, gangGraph, undefined, brandschutzWaende, pathAreas);
        if (r && r.path.length >= 2) {
          if (stitched.length === 0) {
            r.path.forEach(p => stitched.push({ x: p.x, y: p.y, objectId: null }));
          } else {
            // erstes Element des nächsten Segments ist gleich dem letzten des vorherigen
            r.path.slice(1).forEach(p => stitched.push({ x: p.x, y: p.y, objectId: null }));
          }
          anyRouted = true;
        } else {
          // Fallback Luftlinie für dieses Segment
          if (stitched.length === 0) stitched.push({ ...a });
          stitched.push({ ...b });
        }
      }
      if (anyRouted) {
        finalWaypoints = stitched;
        routedOverGang = true;
      }
    }

    let name: string;
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
      waypoints: finalWaypoints,
      color,
      startObjectId: startObj?.id,
      startObjectName: startObj?.name,
      endObjectId: endObj?.id,
      endObjectName: endObj?.name,
      // Original-Klicks (Stützpunkte) speichern — Recompute kann zwischen
      // ihnen neu A*'en. Bei reinem 2-Anker-Pfad sind die Stützpunkte =
      // Start- und End-Anker; nicht nötig zu persistieren.
      stuetzpunkte: waypoints.length >= 3 ? waypoints : undefined,
    });

    if (routedOverGang) {
      toast.success(`Weg über Gänge berechnet: ${name}`);
    } else if (startObj || endObj) {
      toast.success(`Weg gespeichert: ${name}`);
    } else {
      toast.success('Weg gespeichert');
    }
  }, [addPath, findNearestObject, paths.length, gangGraph, brandschutzWaende]);

  // Find waypoint at position (returns path and waypoint index)
  const findWaypointAt = useCallback((wx: number, wy: number): { path: typeof paths[0]; waypointIndex: number } | null => {
    const threshold = 2; // 2m click tolerance for waypoints

    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      for (let j = 0; j < path.waypoints.length; j++) {
        const wp = path.waypoints[j];
        const dist = Math.sqrt(Math.pow(wx - wp.x, 2) + Math.pow(wy - wp.y, 2));
        if (dist < threshold) {
          return { path, waypointIndex: j };
        }
      }
    }
    return null;
  }, [paths]);

  // Find path at position (check if click is near any path segment)
  const findPathAt = useCallback((wx: number, wy: number) => {
    const threshold = 1.5; // 1.5m click tolerance

    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      if (path.waypoints.length < 2) continue;

      // Check each segment
      for (let j = 0; j < path.waypoints.length - 1; j++) {
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
  }, [paths]);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas — neutraler Zeichen-Viewport (leicht warmes Neutral).
    // Theme-abhängig: warmes Hellgrau im Light-Mode, Anthrazit im Dark-Mode.
    ctx.fillStyle = isDark ? '#1b1b1d' : '#e9e7e2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grundriss-Pfad (rect/L/T/U/C) einmal aufbauen — für Füllung UND Rand.
    const traceHallPath = () => {
      const outline = hallOutline(hall!);
      if (outline.length === 0) return false;
      ctx.beginPath();
      outline.forEach((pt, i) => {
        const s = worldToScreen(pt.x, pt.y);
        if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
      });
      ctx.closePath();
      return true;
    };

    // 1) Halle ZUERST füllen (sonst überdeckt sie das Grid).
    // Lastenheft 3.1.1.1: Grundform (rect/L/T/U/C) als Polygon; Aussparungen
    // (Notch) zeigen den Viewport-Hintergrund, kein extra Clipping nötig.
    if (hall) {
      // Light-Mode: warme „Werkstatt"-Bodenfläche (heller als Viewport, damit
      // die Halle sich abhebt); Dark-Mode: gespeicherte Hallenfarbe / warmes Anthrazit.
      ctx.fillStyle = isDark ? (hall.color || '#26252a') : '#faf7f2';
      if (traceHallPath()) ctx.fill();
    }

    // 2) Grid ÜBER der Halle zeichnen — 3 Stufen: Neben (1m) + Mittel (5m) + Haupt (10m).
    // Grid wird überall (auch außerhalb) gezeichnet → Orientierung beim Pannen.
    // Höhere Opacity innerhalb der Halle weil das Grid auf dem hellen Halle-
    // Hintergrund sichtbar bleiben muss; Außerhalb bleibt es subtil.
    if (showGrid) {
      const drawGridLines = (stepM: number, style: string) => {
        const stepPx = stepM * SCALE * zoom;
        if (stepPx < 6) return;
        ctx.strokeStyle = style;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = pan.x % stepPx; x < canvas.width; x += stepPx) {
          ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = pan.y % stepPx; y < canvas.height; y += stepPx) {
          ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
      };

      // Nebenlinien (1m) — nur bei genügend Zoom, sehr fein
      drawGridLines(1, isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.045)');
      // Mittellinien (5m)
      drawGridLines(5, isDark ? 'rgba(255, 255, 255, 0.13)' : 'rgba(0, 0, 0, 0.085)');
      // Hauptlinien (10m) — kräftig, geben die grobe Orientierung
      drawGridLines(10, isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.15)');
    }

    // 3) Halle-Border + Name nach dem Grid (sonst werden sie überzeichnet)
    if (hall) {
      const pos = worldToScreen(0, 0);
      const w = hall.width * SCALE * zoom;

      ctx.strokeStyle = isDark ? '#4a5568' : '#c4c8d0';
      ctx.lineWidth = 2;
      if (traceHallPath()) ctx.stroke();

      ctx.fillStyle = isDark ? '#718096' : '#8a8f99';
      ctx.font = `${12 * zoom}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(hall.name, pos.x + w / 2, pos.y - 8);
    }

    // Draw PathAreas (before objects for transparency)
    if (pathAreas.length > 0) {
      pathAreas.forEach(area => {
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
          area.points.slice(1).forEach(p => {
            const sp = worldToScreen(p.x, p.y);
            ctx.lineTo(sp.x, sp.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });
    }

    // Draw PathArea preview
    if (pathAreaStart && pathAreaMousePos) {
      const p1 = worldToScreen(Math.min(pathAreaStart.x, pathAreaMousePos.x), Math.min(pathAreaStart.y, pathAreaMousePos.y));
      const p2 = worldToScreen(Math.max(pathAreaStart.x, pathAreaMousePos.x), Math.max(pathAreaStart.y, pathAreaMousePos.y));
      ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.setLineDash([]);
    }

    // Bereich-Aufzieh-Vorschau (A3): Rechteck + Live-Maß (B × T in m).
    if (bereichStart && bereichMousePos) {
      const wx1 = Math.min(bereichStart.x, bereichMousePos.x), wy1 = Math.min(bereichStart.y, bereichMousePos.y);
      const wx2 = Math.max(bereichStart.x, bereichMousePos.x), wy2 = Math.max(bereichStart.y, bereichMousePos.y);
      const p1 = worldToScreen(wx1, wy1), p2 = worldToScreen(wx2, wy2);
      const col = OBJECT_COLORS['bereich'] || '#a855f7';
      ctx.save();
      ctx.fillStyle = col; ctx.globalAlpha = 0.16;
      ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.globalAlpha = 0.7; ctx.setLineDash([6, 4]); ctx.strokeStyle = col; ctx.lineWidth = 1.5;
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      const label = `${(wx2 - wx1).toFixed(1).replace('.', ',')} × ${(wy2 - wy1).toFixed(1).replace('.', ',')} m`;
      ctx.font = '700 12px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const cx = (p1.x + p2.x) / 2, cy = (p1.y + p2.y) / 2;
      const tw = ctx.measureText(label).width, padX = 6, bh = 18;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.roundRect(cx - tw / 2 - padX, cy - bh / 2, tw + padX * 2, bh, 5); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillText(label, cx, cy);
      ctx.restore();
    }

    // Draw Gänge
    if (showGaenge && gaenge.length > 0) {
      gaenge.forEach(gang => {
        if (gang.points.length < 2) return;

        // ECKIG: alle Polyline-Punkte rendern, lineCap='butt' (gerade Enden), lineJoin='miter' (eckige Ecken)
        const screenPoints = gang.points.map(p => worldToScreen(p.x, p.y));
        const breite = gang.breite * SCALE * zoom;
        const isSelectedGangItem = selectedGang?.id === gang.id;

        // Punkt-Gang: wenn Gang sehr kurz (<3m), als ausgefülltes Quadrat rendern
        const p1w = gang.points[0]; const p2w = gang.points[gang.points.length - 1];
        const lenM = Math.sqrt((p2w.x - p1w.x) ** 2 + (p2w.y - p1w.y) ** 2);
        if (gang.points.length === 2 && lenM < 3) {
          ctx.save();
          ctx.fillStyle = gang.farbe || 'rgba(100, 200, 100, 0.6)';
          const cx = (screenPoints[0].x + screenPoints[1].x) / 2;
          const cy = (screenPoints[0].y + screenPoints[1].y) / 2;
          const s = breite;
          ctx.fillRect(cx - s/2, cy - s/2, s, s);
          if (isSelectedGangItem) {
            ctx.strokeStyle = '#00bcd4';
            ctx.lineWidth = 3;
            ctx.strokeRect(cx - s/2 - 2, cy - s/2 - 2, s + 4, s + 4);
          }
          ctx.restore();
          return;
        }

        ctx.save();
        // Selection glow
        if (isSelectedGangItem) {
          ctx.strokeStyle = '#00bcd4';
          ctx.lineWidth = breite + 4;
          ctx.lineCap = 'butt';
          ctx.lineJoin = 'miter';
          ctx.beginPath();
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
          }
          ctx.stroke();
        }
        // Straßen-Look: 3 Layer pro Gang
        // 1) Schwarze Außenlinie (Fahrbahn-Rand): leicht breiter
        // 2) Asphalt-Fläche (Gang-Farbe als Untergrund)
        // 3) Gestrichelte Mittellinie (weiß)
        const buildPath = () => {
          ctx.beginPath();
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
          }
        };
        // 1) Schwarzer Rand
        ctx.strokeStyle = '#0a0a0a';
        ctx.lineWidth = breite + 2;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        buildPath();
        ctx.stroke();
        // 2) Asphalt
        ctx.strokeStyle = gang.farbe || '#3a3a3a';
        ctx.lineWidth = breite;
        buildPath();
        ctx.stroke();
        // 3) Gestrichelte Mittellinie — nur wenn Gang breit genug (>= 6px on screen)
        if (breite >= 6) {
          ctx.strokeStyle = '#fbbf24'; // amber/gelb wie echte Straßenmarkierung
          ctx.lineWidth = Math.max(1, breite * 0.08);
          ctx.setLineDash([Math.max(6, breite * 0.6), Math.max(6, breite * 0.6)]);
          buildPath();
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Drag-Handles an den Endpunkten des selected Gangs
        if (isSelectedGangItem && tool === 'select') {
          ctx.save();
          ctx.fillStyle = '#00bcd4';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          [0, gang.points.length - 1].forEach((pi) => {
            const sp = screenPoints[pi];
            ctx.fillRect(sp.x - 6, sp.y - 6, 12, 12);
            ctx.strokeRect(sp.x - 6, sp.y - 6, 12, 12);
          });
          ctx.restore();
        }
        ctx.restore();
      });
    }

    // Draw saved Paths
    paths.forEach(path => {
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
        path.waypoints.slice(1).forEach(wp => {
          const p = worldToScreen(wp.x, wp.y);
          ctx.lineTo(p.x, p.y);
        });
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
      path.waypoints.slice(1).forEach(wp => {
        const p = worldToScreen(wp.x, wp.y);
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Draw waypoints
      path.waypoints.forEach((wp, wpIndex) => {
        const p = worldToScreen(wp.x, wp.y);
        const isWaypointSelected = isSelected && selectedWaypointIndex === wpIndex;

        // Waypoint circle
        ctx.fillStyle = isWaypointSelected ? '#ef4444' : (isSelected ? '#00bcd4' : '#f59e0b');
        ctx.beginPath();
        ctx.arc(p.x, p.y, isWaypointSelected ? 8 : (isSelected ? 6 : 4), 0, Math.PI * 2);
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
      });
      ctx.restore();
    });

    // Draw current path being drawn
    if (currentPath && currentPath.waypoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      const first = worldToScreen(currentPath.waypoints[0].x, currentPath.waypoints[0].y);
      ctx.moveTo(first.x, first.y);
      currentPath.waypoints.slice(1).forEach(wp => {
        const p = worldToScreen(wp.x, wp.y);
        ctx.lineTo(p.x, p.y);
      });
      // Draw to mouse position when drawing
      if (pathDrawing && pathMousePos) {
        const mp = worldToScreen(pathMousePos.x, pathMousePos.y);
        ctx.lineTo(mp.x, mp.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw waypoints
      currentPath.waypoints.forEach(wp => {
        const p = worldToScreen(wp.x, wp.y);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Draw preview line for first segment (before currentPath exists)
    if (pathDrawing && pathDragStart && pathMousePos && (!currentPath || currentPath.waypoints.length === 0)) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.setLineDash([8, 4]);
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
    conveyors.forEach(conveyor => {
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
        conveyor.points.slice(1).forEach(p => {
          const sp = worldToScreen(p.x, p.y);
          ctx.lineTo(sp.x, sp.y);
        });
        ctx.stroke();
      }
      ctx.strokeStyle = '#06b6d4'; // Cyan for conveyors
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const first = worldToScreen(conveyor.points[0].x, conveyor.points[0].y);
      ctx.moveTo(first.x, first.y);
      conveyor.points.slice(1).forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.lineTo(sp.x, sp.y);
      });
      ctx.stroke();
      // Draw direction arrows
      for (let i = 0; i < conveyor.points.length - 1; i++) {
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
      conveyor.points.forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    });

    // Draw current conveyor being drawn
    if (currentConveyor && currentConveyor.points.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      const first = worldToScreen(currentConveyor.points[0].x, currentConveyor.points[0].y);
      ctx.moveTo(first.x, first.y);
      currentConveyor.points.slice(1).forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.lineTo(sp.x, sp.y);
      });
      // Draw to mouse position
      if (conveyorMousePos) {
        const mp = worldToScreen(conveyorMousePos.x, conveyorMousePos.y);
        ctx.lineTo(mp.x, mp.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw waypoints
      currentConveyor.points.forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
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
      ctx.setLineDash([5, 5]);
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
    objects.forEach(obj => {
      const pos = worldToScreen(obj.x, obj.y);
      const w = obj.width * SCALE * zoom;
      const h = obj.height * SCALE * zoom;

      ctx.save();

      const baseColor = obj.color || OBJECT_COLORS[obj.type] || '#666';
      const isSelected = selectedObject?.id === obj.id;

      // Generischer Kreis-Pfad: Objekte mit shape='circle' werden als Kreis gezeichnet.
      // Beispiel-Verwendung: Messpunkt, Scanner, RFID-Reader, Sensor — alles über
      // type: 'custom' + shape: 'circle' + tags + meta darstellbar, ohne neuen Typ.
      if (obj.shape === 'circle') {
        const cx = pos.x + w / 2;
        const cy = pos.y + h / 2;
        const r = Math.min(w, h) / 2;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isSelected ? (isDark ? '#fff' : '#1d1d1f') : (isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.45)');
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.stroke();
        // Crosshair (default für icon='crosshair' oder bei tag 'messpunkt')
        const wantsCrosshair = obj.icon === 'crosshair' || (obj.tags && obj.tags.includes('messpunkt'));
        if (wantsCrosshair) {
          ctx.beginPath();
          ctx.moveTo(cx - r * 0.5, cy);
          ctx.lineTo(cx + r * 0.5, cy);
          ctx.moveTo(cx, cy - r * 0.5);
          ctx.lineTo(cx, cy + r * 0.5);
          ctx.stroke();
        }
        // Label rechts daneben: bevorzugt meta.code, dann meta.label, dann name
        if (zoom > 0.4) {
          const label = obj.meta?.code || obj.meta?.label || obj.name;
          if (label) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.max(10, 12 * zoom)}px Inter, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, cx + r + 4, cy);
          }
        }
        ctx.restore();
        return;
      }

      // Object fill (rechteckige Objekte)
      // Lastenheft 3.1.3.1: formVariante=circle|trapez|polygon → Pfad statt Rechteck.
      // Für rect/undefined bleibt fillRect (Standard-Pfad, identische Performance).
      // Bereiche: semi-transparent (0.4) — Heatmap-tauglich, weniger visuelles Rauschen
      const useShapePath = obj.formVariante && obj.formVariante !== 'rect';
      if (useShapePath) {
        // Lastenheft 3.1.3.1 — Form-Variante via shape-render helper.
        // SCALE * zoom = Welt→Pixel-Faktor (vgl. w = obj.width * SCALE * zoom).
        const renderScale = SCALE * zoom;
        if (obj.type === 'bereich') {
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          pathForFormVariante(ctx, obj, worldToScreen, renderScale);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        } else {
          ctx.fillStyle = baseColor;
          ctx.beginPath();
          pathForFormVariante(ctx, obj, worldToScreen, renderScale);
          ctx.fill();
        }
        // Object border (gleicher Pfad)
        ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.beginPath();
        pathForFormVariante(ctx, obj, worldToScreen, renderScale);
        ctx.stroke();
      } else {
        // Abgerundete Ecken für einen weicheren, „spielerischen" Look. Radius wächst mit der
        // Objektgröße, bleibt aber bei kleinen Objekten (Tore) dezent.
        const rad = Math.max(0, Math.min(6 * zoom, w * 0.22, h * 0.22));
        const roundPath = () => { ctx.beginPath(); ctx.roundRect(pos.x, pos.y, w, h, rad); };
        if (obj.type === 'bereich') {
          // Zone = weicher, transparenter Hintergrund + gestrichelte Kante. Verdeckt die
          // Stellplätze darauf nicht mehr (vorher 0.4 → sehr dominant).
          roundPath();
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = 0.16;
          ctx.fill();
          ctx.globalAlpha = isSelected ? 0.9 : 0.55;
          ctx.strokeStyle = baseColor;
          ctx.setLineDash([6, 4]);
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1.0;
        } else {
          // Solides Objekt mit Tiefe: sanfter Schlagschatten + Füllung + feine Kante.
          ctx.save();
          ctx.shadowColor = 'rgba(0,0,0,0.30)';
          ctx.shadowBlur = 5 * zoom;
          ctx.shadowOffsetY = 1.5 * zoom;
          roundPath();
          ctx.fillStyle = baseColor;
          ctx.fill();
          ctx.restore();
          // feine Kante (theme-abhängig); Auswahl kräftig, Hover cyan hervorgehoben.
          const isHovered = obj.id === hoverObjectId && !isSelected;
          roundPath();
          ctx.strokeStyle = isSelected
            ? (isDark ? '#ffffff' : '#1d1d1f')
            : isHovered ? '#22d3ee' : (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.16)');
          ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1;
          ctx.stroke();
        }
      }

      // Regal (Lastenheft 3.1.3.2): Fächer/Bays entlang der Längsachse andeuten
      // + Ebenen-Zahl als Badge. Das Regal ist ein Stellplatz mit 2..n Ebenen;
      // in der 2D-Draufsicht zeigen wir die Palettenplätze (Bays) und wie viele
      // Ebenen es hat. Reine Darstellung — Kapazität/Rechnung unberührt.
      if (obj.type === 'regal' && zoom > 0.25) {
        const ebenen = obj.regalEbenen?.length || obj.ebenen || 3;
        const bays = Math.max(1, obj.palettenPlaetzeProEbene || Math.floor(obj.width / 1.2) || 1);
        const along = w >= h; // Längsachse
        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (along) {
          for (let i = 1; i < bays; i++) {
            const x = pos.x + (w * i) / bays;
            ctx.moveTo(x, pos.y + 1); ctx.lineTo(x, pos.y + h - 1);
          }
        } else {
          for (let i = 1; i < bays; i++) {
            const y = pos.y + (h * i) / bays;
            ctx.moveTo(pos.x + 1, y); ctx.lineTo(pos.x + w - 1, y);
          }
        }
        ctx.stroke();
        // Ebenen-Badge oben rechts („×N")
        if (zoom > 0.4) {
          const txt = `×${ebenen}`;
          ctx.font = `bold ${Math.max(9, 10 * zoom)}px Inter, sans-serif`;
          const tw = ctx.measureText(txt).width + 6;
          const th = Math.max(12, 13 * zoom);
          const bx = pos.x + w - tw - 2;
          const by = pos.y + 2;
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.beginPath(); ctx.roundRect(bx, by, tw, th, 3); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(txt, bx + tw / 2, by + th / 2);
        }
        ctx.restore();
      }

      // Object label — Tore und Bereiche unterschiedlich behandeln
      if (zoom > 0.3 && obj.name) {
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Lastenheft 3.1.2: Überladebrücke (optional, ohne Funktion).
        // Rechteck in Tor-Breite × einzutragender Länge, direkt INNEN vor
        // dem Tor (je nach Tor-Seite). Gestrichelter Umriss damit klar
        // ist: zeichnerisches Element, keine Daten-Auswertung.
        if (obj.type === 'tor' && obj.ueberladebrueckeAktiv && obj.ueberladebrueckeLaenge && obj.ueberladebrueckeLaenge > 0) {
          const lenPx = obj.ueberladebrueckeLaenge * SCALE * zoom;
          const side = obj.side ?? 'north';
          let bx = pos.x, by = pos.y, bw = w, bh = h;
          switch (side) {
            case 'north': bx = pos.x; by = pos.y + h; bw = w; bh = lenPx; break;
            case 'south': bx = pos.x; by = pos.y - lenPx; bw = w; bh = lenPx; break;
            case 'west':  bx = pos.x + w; by = pos.y; bw = lenPx; bh = h; break;
            case 'east':  bx = pos.x - lenPx; by = pos.y; bw = lenPx; bh = h; break;
          }
          ctx.save();
          ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(bx, by, bw, bh);
          ctx.setLineDash([]);
          ctx.restore();
        }

        if (obj.type === 'tor') {
          // Tor-Label: wenn der Name vom Default-Schema "Tor N" abweicht (User hat
          // umbenannt), den vollen Namen zeigen — sonst nur die Nummer.
          const isDefaultName = obj.name && /^Tor\s+\d+/i.test(obj.name);
          const label = isDefaultName
            ? String(obj.torNummer ?? obj.name.replace(/^Tor\s+/i, ''))
            : (obj.name || String(obj.torNummer ?? ''));
          const sektion = obj.meta?.sektion;
          const tour = obj.meta?.tour;
          if (zoom >= 0.7 && sektion) {
            ctx.font = `bold ${Math.max(8, 9 * zoom)}px Inter, sans-serif`;
            ctx.fillText(label, pos.x + w / 2, pos.y + h / 2 - 3);
            ctx.font = `${Math.max(6, 7 * zoom)}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            ctx.fillText(sektion.substring(0, 10), pos.x + w / 2, pos.y + h / 2 + 6);
          } else {
            ctx.font = `bold ${Math.max(8, 10 * zoom)}px Inter, sans-serif`;
            ctx.fillText(label, pos.x + w / 2, pos.y + h / 2);
          }
          // Tour-Label aus Optimizer-Anwenden: deutlich sichtbar IN der Halle direkt
          // hinter dem Tor (also Richtung Hallen-Mitte).
          if (tour) {
            const tourShort = tour.length > 12 ? tour.substring(0, 12) + '…' : tour;
            ctx.font = `bold ${Math.max(9, 11 * zoom)}px Inter, sans-serif`;
            ctx.textBaseline = 'middle';
            // Position: 8 m in die Halle hinein (je nach Seite)
            const inset = 8 * SCALE * zoom;
            const cx = pos.x + w / 2;
            const cy = pos.y + h / 2;
            const side = obj.side;
            let lx = cx;
            let ly = cy;
            if (side === 'north') ly = cy + inset;
            else if (side === 'south') ly = cy - inset;
            else if (side === 'east') lx = cx - inset;
            else if (side === 'west') lx = cx + inset;
            // Pillenförmiger Hintergrund
            const padX = 6, padY = 3;
            const textW = ctx.measureText(tourShort).width;
            ctx.fillStyle = 'rgba(245, 158, 11, 0.95)'; // amber-500
            const boxX = lx - textW / 2 - padX;
            const boxY = ly - 8 - padY;
            const boxW = textW + padX * 2;
            const boxH = 16 + padY * 2;
            ctx.beginPath();
            const radius = boxH / 2;
            ctx.moveTo(boxX + radius, boxY);
            ctx.lineTo(boxX + boxW - radius, boxY);
            ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + radius, radius);
            ctx.lineTo(boxX + boxW, boxY + boxH - radius);
            ctx.arcTo(boxX + boxW, boxY + boxH, boxX + boxW - radius, boxY + boxH, radius);
            ctx.lineTo(boxX + radius, boxY + boxH);
            ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - radius, radius);
            ctx.lineTo(boxX, boxY + radius);
            ctx.arcTo(boxX, boxY, boxX + radius, boxY, radius);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#1a1a2e';
            ctx.fillText(tourShort, lx, ly);
          }
        } else if (obj.type === 'bereich') {
          // Zonen-Label OBEN LINKS in der Zone — überdeckt die Stellplätze nicht und wird
          // nicht mittig abgeschnitten. Klein, halbfett, in der Zonenfarbe (uppercase).
          const fs = Math.max(9, Math.min(13, 11 * zoom));
          ctx.font = `600 ${fs}px Inter, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillStyle = baseColor;
          const pad = Math.max(4, 6 * zoom);
          ctx.fillText(obj.name.toUpperCase(), pos.x + pad, pos.y + pad);
        } else if (zoom > 0.5) {
          // Andere Objekt-Typen: wie bisher
          ctx.font = `${Math.max(9, 11 * zoom)}px Inter, sans-serif`;
          const label = obj.name.length > 8 ? obj.name.substring(0, 8) + '…' : obj.name;
          ctx.fillText(label, pos.x + w / 2, pos.y + h / 2);
        }
      }

      ctx.restore();
    });

    // Draw heatmap overlay
    if (heatmapConfig.aktiv && betriebsAnalyse && betriebsAnalyse.objektMetriken.length > 0) {
      const metriken = betriebsAnalyse.objektMetriken;
      const values = metriken.map(m => getMetrikWert(m, heatmapConfig.modus));
      const maxWert = Math.max(...values, 1);

      metriken.forEach(metrik => {
        const obj = objects.find(o => o.id === metrik.objectId);
        if (!obj) return;

        const pos = worldToScreen(obj.x, obj.y);
        const w = obj.width * SCALE * zoom;
        const h = obj.height * SCALE * zoom;
        const wert = getMetrikWert(metrik, heatmapConfig.modus);
        const intensity = wert / maxWert;

        ctx.save();
        const fillColor = getHeatmapColor(intensity, heatmapConfig.farbskala, heatmapConfig.intensitaet);
        ctx.fillStyle = fillColor;

        // MP-Objekte (shape='circle') brauchen größere Kreis-Heatmap, weil sie
        // sonst zu klein sind. Wir skalieren proportional zur Intensität.
        if (obj.shape === 'circle') {
          const cx = pos.x + w / 2;
          const cy = pos.y + h / 2;
          // Basis-Radius aus Objekt-Größe, plus Intensitäts-Boost (1× bis 3×)
          const baseR = Math.min(w, h) / 2;
          const r = baseR * (1 + intensity * 2);
          // Weicher Glow nach außen
          const grad = ctx.createRadialGradient(cx, cy, baseR * 0.3, cx, cy, r);
          grad.addColorStop(0, fillColor);
          grad.addColorStop(1, fillColor.replace(/[\d.]+\)$/, '0.05)'));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          // Value label oberhalb — schwarzer Outline für Kontrast auf Heatmap-Farben (A4 28.05.)
          if (zoom > 0.3) {
            const label = formatMetrikWert(wert, heatmapConfig.modus);
            ctx.font = `bold ${Math.max(11, 13 * zoom)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(0,0,0,0.85)';
            ctx.strokeText(label, cx, cy - baseR - 8);
            ctx.fillStyle = '#fff';
            ctx.fillText(label, cx, cy - baseR - 8);
          }
        } else {
          // Rechteckiges Heatmap-Overlay (Tore etc.)
          ctx.fillRect(pos.x, pos.y, w, h);
          if (zoom > 0.4) {
            const label = formatMetrikWert(wert, heatmapConfig.modus);
            ctx.font = `bold ${Math.max(9, 11 * zoom)}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const tx = pos.x + w / 2;
            const ty = pos.y + h / 2 + (zoom > 0.5 ? 12 * zoom : 0);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(0,0,0,0.85)';
            ctx.strokeText(label, tx, ty);
            ctx.fillStyle = 'rgba(255,255,255,0.98)';
            ctx.fillText(label, tx, ty);
          }
        }
        ctx.restore();
      });
    }

    // Draw Cockpit-Route (gewählte Tor→Tor-Route aus dem Cockpit-Tab)
    // — leuchtende cyan-amber Linie über A* mit Pfeilspitze am Ende.
    if (cockpitRoute) {
      const a = objects.find((o) => o.id === cockpitRoute.startId);
      const b = objects.find((o) => o.id === cockpitRoute.endId);
      if (a && b && gaenge.length > 0) {
        try {
          const result = findPathBetweenObjects(a, b, gangGraph, undefined, brandschutzWaende, pathAreas);
          if (result && result.path.length >= 2) {
            ctx.save();

            // Tor- und Ziel-Mittelpunkte (Welt-Koordinaten)
            const aCenter = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
            const bCenter = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
            const aCenterPx = worldToScreen(aCenter.x, aCenter.y);
            const bCenterPx = worldToScreen(bCenter.x, bCenter.y);
            const firstWp = result.path[0];
            const lastWp = result.path[result.path.length - 1];
            const firstWpPx = worldToScreen(firstWp.x, firstWp.y);
            const lastWpPx = worldToScreen(lastWp.x, lastWp.y);

            // Gesamt-Distanz inkl. Anbindung Tor↔Gang
            const dStart = Math.hypot(firstWp.x - aCenter.x, firstWp.y - aCenter.y);
            const dEnd = Math.hypot(lastWp.x - bCenter.x, lastWp.y - bCenter.y);
            const totalDistance = dStart + result.distance + dEnd;

            // 1) Anbindung Tor → Gang (gestrichelt amber, signalisiert "kein Gang")
            ctx.shadowColor = 'rgba(251,191,36,0.9)';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = 'rgba(251,191,36,0.85)';
            ctx.lineWidth = Math.max(2, 3 * zoom);
            ctx.lineCap = 'round';
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(aCenterPx.x, aCenterPx.y);
            ctx.lineTo(firstWpPx.x, firstWpPx.y);
            ctx.stroke();

            // 2) Anbindung Gang → Ziel (gestrichelt)
            ctx.beginPath();
            ctx.moveTo(lastWpPx.x, lastWpPx.y);
            ctx.lineTo(bCenterPx.x, bCenterPx.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // 3) Pfad über Gänge (durchgezogen, dicker)
            ctx.strokeStyle = 'rgba(251,191,36,0.95)';
            ctx.lineWidth = Math.max(2.5, 4 * zoom);
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(firstWpPx.x, firstWpPx.y);
            for (let i = 1; i < result.path.length; i++) {
              const p = worldToScreen(result.path[i].x, result.path[i].y);
              ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Start-Marker (grüner Punkt am Tor selbst)
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(aCenterPx.x, aCenterPx.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Ziel-Marker (cyan Punkt am Ziel) + Pfeilspitze Richtung Ziel
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(bCenterPx.x, bCenterPx.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Pfeilspitze am Ziel — Richtung aus letztem Anbindungs-Segment
            const angle = Math.atan2(bCenterPx.y - lastWpPx.y, bCenterPx.x - lastWpPx.x);
            const arrowSize = 11;
            ctx.fillStyle = 'rgba(251,191,36,0.95)';
            ctx.beginPath();
            ctx.moveTo(bCenterPx.x, bCenterPx.y);
            ctx.lineTo(bCenterPx.x - arrowSize * Math.cos(angle - Math.PI / 6),
                       bCenterPx.y - arrowSize * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(bCenterPx.x - arrowSize * Math.cos(angle + Math.PI / 6),
                       bCenterPx.y - arrowSize * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();

            // Distanz-Label in der Mitte des Gang-Pfads
            if (zoom > 0.3) {
              const midIdx = Math.floor(result.path.length / 2);
              const mid = worldToScreen(result.path[midIdx].x, result.path[midIdx].y);
              const label = `${Math.round(totalDistance)} m`;
              ctx.font = `bold ${Math.max(11, 13 * zoom)}px Inter, sans-serif`;
              const textW = ctx.measureText(label).width;
              ctx.fillStyle = 'rgba(0,0,0,0.78)';
              ctx.fillRect(mid.x - textW / 2 - 6, mid.y - 12, textW + 12, 18);
              ctx.fillStyle = '#fbbf24';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(label, mid.x, mid.y - 3);
            }
            ctx.restore();
          }
        } catch {
          // A*-Fehler stillschweigend
        }
      }
    }

    // ============ Simulierte Aufträge ============
    // IST-Aufträge: rote Belegungs-Marker + amber Linie. SIM-Varianten
    // (parentId gesetzt): blau gestrichelt — was-wäre-wenn-Vergleich.
    if (simAuftraege.length > 0 || simAuftragPending) {
      const istAuftraege = simAuftraege.filter((a) => !a.parentId);
      const simVarianten = simAuftraege.filter((a) => a.parentId);

      // Σ Colli + Auftragsanzahl pro Tor (für IST-Marker)
      const colliPerTor = new Map<number, number>();
      const auftragPerTor = new Map<number, number>();
      for (const a of istAuftraege) {
        colliPerTor.set(a.vonObjectId, (colliPerTor.get(a.vonObjectId) ?? 0) + a.colli);
        colliPerTor.set(a.nachObjectId, (colliPerTor.get(a.nachObjectId) ?? 0) + a.colli);
        auftragPerTor.set(a.vonObjectId, (auftragPerTor.get(a.vonObjectId) ?? 0) + 1);
        auftragPerTor.set(a.nachObjectId, (auftragPerTor.get(a.nachObjectId) ?? 0) + 1);
      }
      const maxCount = Math.max(1, ...Array.from(auftragPerTor.values()));

      // Filter: welche Aufträge bekommen jetzt eine Linie?
      // Default: nur Aufträge des fokussierten Tors. Mit Toggle "alle anzeigen": alle.
      const istToRender = showAllSimRoutes
        ? istAuftraege
        : focusedTorId != null
        ? istAuftraege.filter((a) => a.vonObjectId === focusedTorId || a.nachObjectId === focusedTorId)
        : [];
      const simToRender = showAllSimRoutes
        ? simVarianten
        : focusedTorId != null
        ? simVarianten.filter((a) => a.vonObjectId === focusedTorId || a.nachObjectId === focusedTorId)
        : [];

      // Hilfsfunktion: zeichnet Pfeilspitze am Ende eines Liniensegments
      const drawArrow = (toX: number, toY: number, fromX: number, fromY: number, color: string, size: number) => {
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - size * Math.cos(angle - Math.PI / 6), toY - size * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - size * Math.cos(angle + Math.PI / 6), toY - size * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      };

      // Hilfsfunktion: kompletter Auftragspfad (Tor-Mitte → Gang → Tor-Mitte) als durchgezogene
      // Linie + Pfeilspitze am Ziel. Wenn A* fehlschlägt: gestrichelte direkte Linie als Warnsignal.
      const drawAuftrag = (
        von: typeof objects[number],
        nach: typeof objects[number],
        color: string,
        widthPx: number,
        arrowSize: number,
        dashedFallback: boolean,
      ) => {
        const aCx = von.x + von.width / 2;
        const aCy = von.y + von.height / 2;
        const bCx = nach.x + nach.width / 2;
        const bCy = nach.y + nach.height / 2;
        const aPx = worldToScreen(aCx, aCy);
        const bPx = worldToScreen(bCx, bCy);

        let pathPoints: Array<{ x: number; y: number }> | null = null;
        try {
          const r = findPathBetweenObjects(von, nach, gangGraph, undefined, brandschutzWaende, pathAreas);
          if (r && r.path.length >= 2) {
            pathPoints = r.path.map((p) => worldToScreen(p.x, p.y));
          }
        } catch {
          // skip
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = widthPx;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (pathPoints) {
          // Tor → erster Wegpunkt → Pfad entlang Gang → letzter Wegpunkt → Tor (durchgezogen, ein Stück)
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(aPx.x, aPx.y);
          ctx.lineTo(pathPoints[0].x, pathPoints[0].y);
          for (let i = 1; i < pathPoints.length; i++) {
            ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
          }
          ctx.lineTo(bPx.x, bPx.y);
          ctx.stroke();
          // Pfeilspitze: aus dem letzten Pfadabschnitt
          const lastWp = pathPoints[pathPoints.length - 1];
          drawArrow(bPx.x, bPx.y, lastWp.x, lastWp.y, color, arrowSize);
        } else if (dashedFallback) {
          // A* hat versagt — direkter Strich mit gestrichelter Linie als Warnung
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(aPx.x, aPx.y);
          ctx.lineTo(bPx.x, bPx.y);
          ctx.stroke();
          ctx.setLineDash([]);
          drawArrow(bPx.x, bPx.y, aPx.x, aPx.y, color, arrowSize);
        }
      };

      // 1a. IST-Linien — amber durchgezogen + Pfeilspitze am Ziel-Tor
      ctx.save();
      ctx.shadowColor = 'rgba(251,191,36,0.6)';
      ctx.shadowBlur = 6;
      for (const a of istToRender) {
        const von = objects.find((o) => o.id === a.vonObjectId);
        const nach = objects.find((o) => o.id === a.nachObjectId);
        if (!von || !nach) continue;
        drawAuftrag(von, nach, 'rgba(251,191,36,0.95)', Math.max(2, 3 * zoom), Math.max(8, 10 * zoom), true);
      }
      ctx.shadowBlur = 0;
      ctx.restore();

      // 1b. SIM-Varianten — kräftiges Blau durchgezogen + Pfeilspitze
      if (simToRender.length > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(37,99,235,0.6)';
        ctx.shadowBlur = 8;
        for (const a of simToRender) {
          const von = objects.find((o) => o.id === a.vonObjectId);
          const nach = objects.find((o) => o.id === a.nachObjectId);
          if (!von || !nach) continue;
          drawAuftrag(von, nach, 'rgba(37,99,235,0.95)', Math.max(2.5, 3.5 * zoom), Math.max(9, 11 * zoom), true);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // 1c. Stapler-Animation: Sprite an interpolierter Position auf dem Pfad
      if (animationActiveId) {
        const a = simAuftraege.find((s) => s.id === animationActiveId);
        const von = a && objects.find((o) => o.id === a.vonObjectId);
        const nach = a && objects.find((o) => o.id === a.nachObjectId);
        if (a && von && nach) {
          const aCx = von.x + von.width / 2;
          const aCy = von.y + von.height / 2;
          const bCx = nach.x + nach.width / 2;
          const bCy = nach.y + nach.height / 2;
          let waypoints: Array<{ x: number; y: number }> = [{ x: aCx, y: aCy }];
          try {
            const r = findPathBetweenObjects(von, nach, gangGraph, undefined, brandschutzWaende, pathAreas);
            if (r && r.path.length >= 1) {
              for (const p of r.path) waypoints.push({ x: p.x, y: p.y });
            }
          } catch {}
          waypoints.push({ x: bCx, y: bCy });
          // Gesamtlänge berechnen, dann progress als Bruchteil der Länge
          let total = 0;
          const segs: number[] = [];
          for (let i = 0; i + 1 < waypoints.length; i++) {
            const dx = waypoints[i + 1].x - waypoints[i].x;
            const dy = waypoints[i + 1].y - waypoints[i].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            segs.push(d);
            total += d;
          }
          const target = animationProgress * total;
          let acc = 0;
          let px = waypoints[0].x;
          let py = waypoints[0].y;
          for (let i = 0; i < segs.length; i++) {
            if (acc + segs[i] >= target) {
              const t = segs[i] === 0 ? 0 : (target - acc) / segs[i];
              px = waypoints[i].x + (waypoints[i + 1].x - waypoints[i].x) * t;
              py = waypoints[i].y + (waypoints[i + 1].y - waypoints[i].y) * t;
              break;
            }
            acc += segs[i];
            px = waypoints[i + 1].x;
            py = waypoints[i + 1].y;
          }
          const sp = worldToScreen(px, py);
          // Stapler-Kreis mit Glow + Speed-Trail
          ctx.save();
          ctx.shadowColor = 'rgba(37,99,235,0.95)';
          ctx.shadowBlur = 18;
          ctx.fillStyle = 'rgba(37,99,235,1)';
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, Math.max(8, 10 * zoom), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${Math.max(11, 12 * zoom)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚛', sp.x, sp.y);
          // Progress-Balken über dem Stapler
          const barW = Math.max(40, 60 * zoom);
          const barH = 4;
          const barY = sp.y - Math.max(14, 16 * zoom);
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(sp.x - barW / 2, barY, barW, barH);
          ctx.fillStyle = 'rgba(37,99,235,1)';
          ctx.fillRect(sp.x - barW / 2, barY, barW * animationProgress, barH);
          ctx.restore();
        }
      }

      // 2. Belegungs-Marker auf jedem beteiligten Tor (rot, Intensität nach Anzahl)
      for (const [objectId, anzahlAuftraege] of auftragPerTor.entries()) {
        const obj = objects.find((o) => o.id === objectId);
        if (!obj) continue;
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        const p = worldToScreen(cx, cy);
        const isCircle = obj.shape === 'circle' || obj.tags?.includes('messpunkt');
        const r = isCircle
          ? Math.max(obj.width, obj.height) * SCALE * zoom * 0.6
          : Math.max(obj.width, obj.height) * SCALE * zoom * 0.5;
        const intensity = anzahlAuftraege / maxCount;
        ctx.save();
        // Roter Belegungs-Glow
        ctx.shadowColor = 'rgba(239,68,68,0.9)';
        ctx.shadowBlur = 10 + intensity * 12;
        ctx.strokeStyle = `rgba(239,68,68,${0.5 + intensity * 0.4})`;
        ctx.lineWidth = 2 + intensity * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(8, r + 4), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Beschriftung: Σ Colli
        const colli = colliPerTor.get(objectId) ?? 0;
        if (zoom > 0.4) {
          const label = colli >= 1000 ? `${(colli / 1000).toFixed(1)}k` : `${colli}`;
          ctx.font = `bold ${Math.max(10, 12 * zoom)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textW = ctx.measureText(label).width;
          ctx.fillStyle = 'rgba(239,68,68,0.95)';
          ctx.fillRect(p.x - textW / 2 - 4, p.y - r - 12, textW + 8, 14);
          ctx.fillStyle = '#fff';
          ctx.fillText(label, p.x, p.y - r - 5);
        }
      }

      // 3. Pending-Markierung (1. Tor angeklickt, wartet auf 2. Tor)
      if (simAuftragPending) {
        const von = objects.find((o) => o.id === simAuftragPending.vonObjectId);
        if (von) {
          const cx = von.x + von.width / 2;
          const cy = von.y + von.height / 2;
          const p = worldToScreen(cx, cy);
          const isCircle = von.shape === 'circle' || von.tags?.includes('messpunkt');
          const r = isCircle
            ? Math.max(von.width, von.height) * SCALE * zoom * 0.6
            : Math.max(von.width, von.height) * SCALE * zoom * 0.55;
          ctx.save();
          ctx.shadowColor = 'rgba(34,197,94,0.9)';
          ctx.shadowBlur = 14;
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(10, r + 6), 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#22c55e';
          ctx.font = `bold ${Math.max(10, 12 * zoom)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('VON — jetzt 2. Tor klicken', p.x, p.y - r - 14);
          ctx.restore();
        }
      }
    }

    // Draw selection handles
    if (selectedObject) {
      const pos = worldToScreen(selectedObject.x, selectedObject.y);
      const w = selectedObject.width * SCALE * zoom;
      const h = selectedObject.height * SCALE * zoom;

      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(pos.x - 2, pos.y - 2, w + 4, h + 4);
      ctx.setLineDash([]);

      // Corner handles
      const handleSize = 8;
      ctx.fillStyle = '#00bcd4';
      [[0, 0], [w, 0], [0, h], [w, h]].forEach(([dx, dy]) => {
        ctx.fillRect(pos.x + dx - handleSize / 2, pos.y + dy - handleSize / 2, handleSize, handleSize);
      });
    }

    // Tor-Pinsel: Geister-Tor-Reihe als halbtransparente Vorschau + Zähler
    if (pinselGhosts.length > 0) {
      ctx.save();
      const torColor = OBJECT_COLORS.tor ?? '#3b82f6';
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = torColor;
      ctx.strokeStyle = torColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      for (const g of pinselGhosts) {
        const p = worldToScreen(g.x, g.y);
        const w = g.width * SCALE * zoom;
        const h = g.height * SCALE * zoom;
        ctx.fillRect(p.x, p.y, w, h);
        ctx.strokeRect(p.x, p.y, w, h);
      }
      // Zähler-Label am zuletzt gesetzten Tor
      const last = pinselGhosts[pinselGhosts.length - 1];
      const lp = worldToScreen(last.x, last.y);
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      const label = `${pinselGhosts.length} ${pinselGhosts.length === 1 ? 'Tor' : 'Tore'}`;
      ctx.font = 'bold 13px system-ui, sans-serif';
      const tw = ctx.measureText(label).width;
      const lx = lp.x;
      const ly = lp.y - 22;
      ctx.fillStyle = torColor;
      ctx.fillRect(lx, ly, tw + 12, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, lx + 6, ly + 13);
      ctx.restore();
    }

    // KI-Textbuilder: Ghost-Vorschau (neue Halle + Tore) halbtransparent
    if (nlGhost) {
      ctx.save();
      // Ghost-Hallenumriss (gestrichelt)
      const h0 = worldToScreen(0, 0);
      const gw = nlGhost.hall.width * SCALE * zoom;
      const gh = nlGhost.hall.height * SCALE * zoom;
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 5]);
      ctx.strokeRect(h0.x, h0.y, gw, gh);
      // Ghost-Tore
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      for (const o of nlGhost.objects) {
        const c = OBJECT_COLORS[o.type as keyof typeof OBJECT_COLORS] ?? '#3b82f6';
        ctx.fillStyle = c;
        ctx.strokeStyle = c;
        const p = worldToScreen(o.x, o.y);
        ctx.fillRect(p.x, p.y, o.width * SCALE * zoom, o.height * SCALE * zoom);
        ctx.strokeRect(p.x, p.y, o.width * SCALE * zoom, o.height * SCALE * zoom);
      }
      // Label
      const torCount = nlGhost.objects.filter((o) => o.type === 'tor').length;
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);
      const label = `Vorschau: ${nlGhost.hall.name} · ${torCount} Tore`;
      ctx.font = 'bold 13px system-ui, sans-serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(h0.x, h0.y - 22, tw + 12, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, h0.x + 6, h0.y - 9);
      ctx.restore();
    }

    // Draw gang preview line when drawing
    if (gangDrawStart && gangMousePos) {
      const start = worldToScreen(gangDrawStart.x, gangDrawStart.y);
      const end = worldToScreen(gangMousePos.x, gangMousePos.y);
      const previewWidth = 3 * SCALE * zoom; // Default 3m width

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
      ctx.lineWidth = previewWidth;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw start point indicator — eckig (Quadrat) statt rund
      ctx.fillStyle = '#64c864';
      ctx.fillRect(start.x - 6, start.y - 6, 12, 12);

      // Draw end point indicator — eckig (Quadrat) statt rund
      ctx.strokeStyle = '#64c864';
      ctx.lineWidth = 2;
      ctx.strokeRect(end.x - 6, end.y - 6, 12, 12);

      // Show distance label
      const dist = Math.sqrt(
        Math.pow(gangMousePos.x - gangDrawStart.x, 2) +
        Math.pow(gangMousePos.y - gangDrawStart.y, 2)
      );
      ctx.fillStyle = '#fff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${dist.toFixed(1)}m`, (start.x + end.x) / 2, (start.y + end.y) / 2 - 15);
      ctx.restore();
    }

    // Snap-Indikator beim Gang-Werkzeug (SimCity-Style Magnet-Preview)
    if (tool === 'gang' && gangSnap.snapped) {
      const sp = worldToScreen(gangSnap.x, gangSnap.y);
      ctx.save();
      const colors: Record<typeof gangSnap.type, string> = {
        endpoint: '#22c55e',     // grün — Endpunkt
        intersection: '#fbbf24', // amber — Kreuzung
        perpendicular: '#06b6d4',// cyan — senkrechte Anbindung
      };
      const col = colors[gangSnap.type];
      ctx.strokeStyle = col;
      ctx.fillStyle = col + '40';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = col;
      const label = gangSnap.type === 'endpoint' ? 'ENDPUNKT'
        : gangSnap.type === 'intersection' ? 'KREUZUNG'
        : 'SENKRECHT';
      ctx.fillText(label, sp.x + 14, sp.y - 8);
      ctx.restore();
    }

    // Snap-Indikator für Path/PathArea-Werkzeug (generalisiert)
    if (toolSnap) {
      const sp = worldToScreen(toolSnap.x, toolSnap.y);
      const col = SNAP_COLORS[toolSnap.source];
      ctx.save();
      ctx.strokeStyle = col;
      ctx.fillStyle = col + '40';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = col;
      ctx.fillText(toolSnap.label, sp.x + 14, sp.y - 8);
      ctx.restore();
    }

    // Permanente Gang-Graph-Knoten zeigen (Endpunkte + Kreuzungen) — nur wenn
    // showGaenge aktiv ist. So sieht man wo der Graph verbunden ist.
    if (showGaenge && gangGraphNodes.length > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 1;
      for (const n of gangGraphNodes) {
        const np = worldToScreen(n.x, n.y);
        ctx.beginPath();
        ctx.arc(np.x, np.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // Ausrichtungslinien + Live-Maß beim Ziehen (Figma-/Prison-Architect-Gefühl). alignRef ist
    // ein Ref → keine Dependency nötig; während des Ziehens löst updateObject den Redraw aus.
    if (isDragging && dragObject && alignRef.current) {
      const a = alignRef.current;
      ctx.save();
      const accent = isDark ? '#67e8f9' : '#0891b2';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      for (const wx of a.vx) { const p = worldToScreen(wx, 0); ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, canvas.height); ctx.stroke(); }
      for (const wy of a.hy) { const p = worldToScreen(0, wy); ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(canvas.width, p.y); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const m of a.measures) {
        const p = worldToScreen(m.x, m.y);
        const tw = ctx.measureText(m.text).width;
        const padX = 5, bh = 16;
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.roundRect(p.x - tw / 2 - padX, p.y - bh / 2, tw + padX * 2, bh, 4); ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(m.text, p.x, p.y);
      }
      ctx.restore();
    }

    // Serie-ziehen-Vorschau (Drag-to-Fill): Geister-Kopien + Zähler am letzten Geist.
    if (serieSrc && serieGhosts.length > 0) {
      ctx.save();
      const col = serieSrc.color || OBJECT_COLORS[serieSrc.type] || '#22c55e';
      for (let i = 0; i < serieGhosts.length; i++) {
        const g = serieGhosts[i];
        const p = worldToScreen(g.x, g.y);
        const gw = g.width * SCALE * zoom, gh = g.height * SCALE * zoom;
        const rad = Math.max(0, Math.min(6 * zoom, gw * 0.22, gh * 0.22));
        ctx.beginPath(); ctx.roundRect(p.x, p.y, gw, gh, rad);
        ctx.globalAlpha = i === 0 ? 0.9 : 0.45; // Original kräftiger, Kopien blasser
        ctx.fillStyle = col; ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1.0;
      // Zähler-Pille am letzten Geist
      const last = serieGhosts[serieGhosts.length - 1];
      const lp = worldToScreen(last.x + last.width / 2, last.y + last.height / 2);
      const label = `${serieGhosts.length}×`;
      ctx.font = '700 12px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(label).width, padX = 6, bh = 18;
      ctx.fillStyle = '#0891b2';
      ctx.beginPath(); ctx.roundRect(lp.x - tw / 2 - padX, lp.y - bh / 2, tw + padX * 2, bh, 5); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillText(label, lp.x, lp.y);
      ctx.restore();
    }
  }, [hall, objects, gaenge, showGaenge, showGrid, zoom, pan, selectedObject, selectedPath, selectedWaypointIndex, selectedGang, selectedPathArea, selectedConveyor, worldToScreen, gangDrawStart, gangMousePos, gangSnap, gangGraphNodes, tool, toolSnap, paths, pathAreas, currentPath, pathMousePos, pathDrawing, pathDragStart, pathAreaStart, pathAreaMousePos, measureStart, measureEnd, conveyors, currentConveyor, conveyorMousePos, heatmapConfig, betriebsAnalyse, cockpitRoute, simAuftraege, simAuftragPending, focusedTorId, showAllSimRoutes, animationActiveId, animationProgress, isDark, pinselGhosts, nlGhost, isDragging, dragObject, serieSrc, serieGhosts, hoverObjectId, bereichStart, bereichMousePos]);

  // Initial centering - only once on mount
  const initializedRef = useRef(false);

  // Latest-draw-ref: der ResizeObserver-useEffect haengt nur an [hall?.id],
  // captured also eine stale draw-Closure. Wenn der User eine Sidebar ein-/
  // ausklappt, leert canvas.width=... den Canvas, und die stale draw-Closure
  // zeichnet mit veraltetem pan/zoom/state — die Halle ist kurz nicht
  // sichtbar bis irgendein Click/Pan einen Re-Render mit aktueller draw
  // ausloest. drawRef wird per useEffect immer auf die neueste draw-Funktion
  // aktualisiert, so dass handleResize per drawRef.current die aktuelle
  // Version aufrufen kann.
  // (Alex P. Bug "SIDEBARS resize now delay the graphic visibility. On
  // clicking the canvas area the graphic appears instantly".)
  const drawRef = useRef(draw);
  useEffect(() => { drawRef.current = draw; }, [draw]);

  // Resize handler: reagiert auf Container-Größe (nicht nur window!),
  // damit das Canvas korrekt mit-skaliert wenn Side-Panels collapsed/expanded
  // werden — sonst stretcht CSS den Pixel-Inhalt (Halle wirkt verzerrt+größer).
  //
  // WICHTIG: Pan + Zoom werden beim Resize NICHT angefasst — nur die Canvas-
  // Pixel-Dimensionen werden auf die neue Container-Groesse gezogen. Wenn der
  // User vorher gepant/gezoomt hat, bleibt diese Sicht erhalten.
  // (Alex P. Bug: "Sidebar-Toggle resettet die Grafik in obere linke Ecke" —
  // Ursache war stale pan-Closure plus halbierter Delta-Shift, der bei jedem
  // Toggle die Halle ein Stueck nach links/oben gezogen hat.)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === canvas.width && newH === canvas.height) return;

      // Nur Pixel-Dimensionen aktualisieren — pan/zoom bleiben wie sie sind.
      // Setzen von canvas.width/height leert den Canvas → sofort neu zeichnen,
      // sonst bleibt die Halle bis zum naechsten React-Tick unsichtbar
      // (Sidebar-Toggle-Delay, Alex P.).
      canvas.width = newW;
      canvas.height = newH;
      // drawRef.current statt der closure-stale `draw` aus dem outer scope —
      // dieser useEffect haengt nur an `[hall?.id]`, hat also draw vom letzten
      // Hall-Wechsel. Per ref bekommen wir die aktuelle draw-Funktion.
      // requestAnimationFrame stellt sicher, dass die Layout-Aenderung (durch
      // den Resize) abgeschlossen ist bevor wir zeichnen.
      requestAnimationFrame(() => drawRef.current());
    };

    // Initial setup + einmaliges Zentrieren (nur beim ersten Mount).
    if (!initializedRef.current && hall) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const hallW = hall.width * SCALE * zoom;
      const hallH = hall.height * SCALE * zoom;
      setPan({
        x: (canvas.width - hallW) / 2,
        y: (canvas.height - hallH) / 2
      });
      initializedRef.current = true;
    }

    // ResizeObserver fängt Container-Resize (z.B. Side-Panel-Toggle).
    // window-resize ist subset davon, ResizeObserver allein reicht.
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hall?.id]); // Only re-run when hall changes

  // === Mini-Map Rendering ===
  // Kleines Canvas unten rechts: Halle als skalierte Übersicht +
  // Viewport-Rechteck (zeigt aktuellen Ausschnitt). Klick darauf → Pan.
  useEffect(() => {
    const mini = minimapRef.current;
    const main = canvasRef.current;
    if (!mini || !main || !hall) return;
    const ctx = mini.getContext('2d');
    if (!ctx) return;

    const MM_W = mini.width;
    const MM_H = mini.height;
    ctx.clearRect(0, 0, MM_W, MM_H);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, MM_W, MM_H);

    // Skalierung: Halle (Welt-Meter) → Mini-Canvas
    const PAD = 4;
    const scaleMM = Math.min(
      (MM_W - PAD * 2) / hall.width,
      (MM_H - PAD * 2) / hall.height
    );
    const offX = (MM_W - hall.width * scaleMM) / 2;
    const offY = (MM_H - hall.height * scaleMM) / 2;

    // Halle
    ctx.fillStyle = hall.color || '#26262a';
    ctx.fillRect(offX, offY, hall.width * scaleMM, hall.height * scaleMM);
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 1;
    ctx.strokeRect(offX, offY, hall.width * scaleMM, hall.height * scaleMM);

    // Tore als kleine Punkte
    for (const obj of objects) {
      if (obj.type !== 'tor') continue;
      ctx.fillStyle = OBJECT_COLORS[obj.type] || '#3b82f6';
      ctx.fillRect(
        offX + obj.x * scaleMM,
        offY + obj.y * scaleMM,
        Math.max(1, obj.width * scaleMM),
        Math.max(1, obj.height * scaleMM)
      );
    }

    // Viewport-Rechteck (welcher Bereich des Welt-Koordinatensystems
    // ist gerade im Haupt-Canvas sichtbar?)
    const viewWorldX = -pan.x / (SCALE * zoom);
    const viewWorldY = -pan.y / (SCALE * zoom);
    const viewWorldW = main.width / (SCALE * zoom);
    const viewWorldH = main.height / (SCALE * zoom);
    ctx.strokeStyle = '#00bcd4';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      offX + viewWorldX * scaleMM,
      offY + viewWorldY * scaleMM,
      viewWorldW * scaleMM,
      viewWorldH * scaleMM
    );
    ctx.fillStyle = 'rgba(0,188,212,0.10)';
    ctx.fillRect(
      offX + viewWorldX * scaleMM,
      offY + viewWorldY * scaleMM,
      viewWorldW * scaleMM,
      viewWorldH * scaleMM
    );
  }, [hall, objects, zoom, pan]);

  // === Lineale Rendering ===
  // Top + Left Lineale mit Skala in Metern, sync mit Pan/Zoom.
  useEffect(() => {
    const top = rulerTopRef.current;
    const left = rulerLeftRef.current;
    const main = canvasRef.current;
    if (!top || !left || !main) return;
    const topCtx = top.getContext('2d');
    const leftCtx = left.getContext('2d');
    if (!topCtx || !leftCtx) return;

    const drawRuler = (ctx: CanvasRenderingContext2D, w: number, h: number, isHorizontal: boolean) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(20,20,20,0.85)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);

      // Skalierung: 1m = SCALE × zoom Pixel
      const pxPerM = SCALE * zoom;
      const stepM = pxPerM >= 30 ? 1 : pxPerM >= 10 ? 5 : pxPerM >= 4 ? 10 : 25;
      const majorEveryN = 5;

      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = '#aaa';
      ctx.textBaseline = 'middle';
      ctx.textAlign = isHorizontal ? 'center' : 'right';

      if (isHorizontal) {
        // Start-Meter im linken sichtbaren Bereich
        const startM = Math.floor((-pan.x / pxPerM) / stepM) * stepM;
        const endM = startM + Math.ceil(w / pxPerM) + stepM;
        for (let m = startM; m <= endM; m += stepM) {
          const x = m * pxPerM + pan.x;
          if (x < 0 || x > w) continue;
          const isMajor = m % (stepM * majorEveryN) === 0;
          ctx.strokeStyle = isMajor ? '#999' : '#555';
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(x, h - (isMajor ? h * 0.6 : h * 0.3));
          ctx.stroke();
          if (isMajor) {
            ctx.fillText(`${m}`, x, h * 0.3);
          }
        }
      } else {
        const startM = Math.floor((-pan.y / pxPerM) / stepM) * stepM;
        const endM = startM + Math.ceil(h / pxPerM) + stepM;
        for (let m = startM; m <= endM; m += stepM) {
          const y = m * pxPerM + pan.y;
          if (y < 0 || y > h) continue;
          const isMajor = m % (stepM * majorEveryN) === 0;
          ctx.strokeStyle = isMajor ? '#999' : '#555';
          ctx.beginPath();
          ctx.moveTo(w, y);
          ctx.lineTo(w - (isMajor ? w * 0.6 : w * 0.3), y);
          ctx.stroke();
          if (isMajor) {
            ctx.fillText(`${m}`, w * 0.55, y);
          }
        }
      }
    };

    top.width = main.width;
    top.height = 22;
    drawRuler(topCtx, top.width, top.height, true);

    left.width = 28;
    left.height = main.height;
    drawRuler(leftCtx, left.width, left.height, false);
  }, [zoom, pan, hall?.id]);

  // Mini-Map Click → Pan zur angeklickten Position
  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mini = minimapRef.current;
    const main = canvasRef.current;
    if (!mini || !main || !hall) return;
    const rect = mini.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const PAD = 4;
    const scaleMM = Math.min(
      (mini.width - PAD * 2) / hall.width,
      (mini.height - PAD * 2) / hall.height
    );
    const offX = (mini.width - hall.width * scaleMM) / 2;
    const offY = (mini.height - hall.height * scaleMM) / 2;
    const worldX = (mx - offX) / scaleMM;
    const worldY = (my - offY) / scaleMM;
    // Pan so setzen, dass (worldX, worldY) im Haupt-Canvas zentriert ist
    setPan({
      x: main.width / 2 - worldX * SCALE * zoom,
      y: main.height / 2 - worldY * SCALE * zoom,
    });
  };

  // Redraw whenever `draw` reference changes. Since `draw` is a useCallback whose
  // deps cover all render-relevant state, depending on `[draw]` here is both minimal
  // and correct — no duplicated dep list to drift.
  useEffect(() => {
    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [draw]);

  // Mouse handlers
  // Tor-Pinsel: nächste Wand aus einem Klickpunkt bestimmen (wie das Tor-Tool).
  const pinselNearestSide = (wx: number, wy: number, h: { width: number; height: number }): 'north' | 'south' | 'east' | 'west' => {
    const distNorth = wy;
    const distSouth = Math.abs(h.height - wy);
    const distWest = wx;
    const distEast = Math.abs(h.width - wx);
    const m = Math.min(distNorth, distSouth, distWest, distEast);
    if (m === distNorth) return 'north';
    if (m === distSouth) return 'south';
    if (m === distWest) return 'west';
    return 'east';
  };

  // Tor-Pinsel: Geister-Tore entlang der Wand zwischen Start- und aktuellem
  // Punkt berechnen — fester Achsabstand (Tor-Breite + 1 m), an die Hallenkante
  // geclampt. Tor an N/S-Wänden liegt quer (B=3.5, T=1.5), an O/W hochkant.
  const computePinselGhosts = (
    side: 'north' | 'south' | 'east' | 'west',
    start: { x: number; y: number },
    end: { x: number; y: number },
    h: { width: number; height: number },
  ): { x: number; y: number; width: number; height: number }[] => {
    const W = OBJECT_DEFAULTS.tor.width;   // entlang der Wand
    const D = OBJECT_DEFAULTS.tor.height;  // in die Halle hinein
    const pitch = W + 1;                   // Achsabstand Mitte-zu-Mitte
    const horiz = side === 'north' || side === 'south';
    const a0 = horiz ? start.x : start.y;
    const a1 = horiz ? end.x : end.y;
    const dir = a1 >= a0 ? 1 : -1;
    const len = Math.abs(a1 - a0);
    const count = Math.max(1, Math.floor(len / pitch) + 1);
    const ghosts: { x: number; y: number; width: number; height: number }[] = [];
    for (let i = 0; i < count; i++) {
      const center = a0 + dir * i * pitch;
      if (horiz) {
        const gw = W, gh = D;
        const x = Math.max(0, Math.min(h.width - gw, center - gw / 2));
        const y = side === 'north' ? 0 : h.height - gh;
        ghosts.push({ x, y, width: gw, height: gh });
      } else {
        const gw = D, gh = W;
        const y = Math.max(0, Math.min(h.height - gh, center - gh / 2));
        const x = side === 'west' ? 0 : h.width - gw;
        ghosts.push({ x, y, width: gw, height: gh });
      }
    }
    return ghosts;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Close context menus on any click
    if (contextMenu) setContextMenu(null);
    if (objectContextMenu) setObjectContextMenu(null);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const world = screenToWorld(x, y);

    if (tool === 'gang') {
      // Snap zuerst auflösen — wenn Cursor auf einem Anker (Endpunkt/Schnitt/
      // Senkrechte) liegt, übernimmt der Snap die Welt-Position.
      const snapHit = findGangSnap(world.x, world.y, gaenge, 2);
      const clickWorld = snapHit.snapped
        ? { x: snapHit.x, y: snapHit.y }
        : { x: Math.round(world.x), y: Math.round(world.y) };

      if (!gangDrawStart) {
        setGangDrawStart(clickWorld);
        setGangMousePos(clickWorld);
        if (snapHit.snapped) {
          toast.info(`Start auf existierendem Gang (${snapHit.type})`);
        }
      } else {
        const endPoint = clickWorld;
        // Auto-Extend: wenn End-Klick KNAPP an einem anderen Gang vorbei (nicht
        // schon vom Snap erfasst), Endpunkt auf die Linie projizieren.
        const extended = snapHit.snapped
          ? { x: endPoint.x, y: endPoint.y, extended: false }
          : extendEndpointToNearbyGang(endPoint, gaenge, 2);
        const finalEndCandidate = extended.extended
          ? { x: extended.x, y: extended.y }
          : endPoint;

        const dist = Math.sqrt(
          Math.pow(finalEndCandidate.x - gangDrawStart.x, 2) +
          Math.pow(finalEndCandidate.y - gangDrawStart.y, 2)
        );
        const isPunkt = dist < 1;
        const finalEnd = isPunkt
          ? { x: gangDrawStart.x + 1, y: gangDrawStart.y }
          : finalEndCandidate;

        const blockers = objects.filter(o => {
          if (o.istUndurchlaessig === false) return false;
          if (o.istUndurchlaessig === true) return true;
          return o.type === 'wand' || o.type === 'bereich' || o.type === 'regal' || o.type === 'hindernis';
        });
        const blockedBy = !isPunkt ? blockers.find(o =>
          lineCrossesAnyWall(gangDrawStart.x, gangDrawStart.y, finalEnd.x, finalEnd.y, [o])
        ) : null;
        if (blockedBy) {
          toast.error(`Gang kreuzt "${blockedBy.name}" — bitte außen herum zeichnen.`);
        } else {
          const newGang: Gang = {
            id: Date.now(),
            name: isPunkt ? `Punkt ${gaenge.length + 1}` : `Gang ${gaenge.length + 1}`,
            points: [gangDrawStart, finalEnd],
            breite: 3,
            typ: 'quergang',
            farbe: 'rgba(100, 200, 100, 0.6)',
          };
          addGang(newGang);
          if (extended.extended) {
            toast.success(`Gang erstellt (${dist.toFixed(1)} m) — Endpunkt automatisch auf existierenden Gang erweitert.`);
          } else {
            toast.success(isPunkt ? 'Punkt-Knoten gesetzt' : `Gang erstellt (${dist.toFixed(1)}m)`);
          }
          // Insel-Warnung
          if (!isPunkt && gaenge.length > 0 && isGangIsolated(newGang, gaenge)) {
            toast.warning('Neuer Gang ist nicht mit dem existierenden Netz verbunden (Insel) — A* kann ihn nicht erreichen.', { duration: 5000 });
          }
        }

        setGangDrawStart(null);
        setGangMousePos(null);
        setGangSnap({ snapped: false });
      }
      return;
    }

    // Path drawing — reiner Klick-Modus: jeder Klick fügt einen Wegpunkt hinzu.
    // Wenn der Klick auf einem Objekt liegt, übernimmt savePathWithLinks später
    // beim Doppelklick die Anker-Verknüpfung. Lastenheft 3.1.4.2: Wege dürfen
    // nicht durch Wände — wir warnen beim Setzen wenn das Segment eine Wand
    // kreuzt (Tür-Region ist erlaubt, siehe lineCrossesAnyWall).
    if (tool === 'path') {
      // Snap-Override: bei aktivem Snap-Treffer Klick-Position übernehmen
      const snapHit = findSnap({
        wx: world.x, wy: world.y, tolerance: 2,
        gaenge, paths, objects,
        sources: ['gang-endpoint', 'gang-intersection', 'object-anchor', 'path-waypoint'],
      });
      const snapPos = snapHit
        ? { x: snapHit.x, y: snapHit.y, objectId: null }
        : { x: Math.round(world.x), y: Math.round(world.y), objectId: null };

      // Bug C (28.05.): Lastenheft 3.1.4.2 — wenn Wegflächen definiert sind,
      // muss der Klickpunkt innerhalb mindestens einer pathArea liegen.
      const pointInsidePathArea = (x: number, y: number) =>
        pathAreas.some(a =>
          a.x != null && a.y != null && a.width != null && a.height != null &&
          x >= a.x && x <= a.x + a.width && y >= a.y && y <= a.y + a.height
        );
      if (pathAreas.length > 0 && !pointInsidePathArea(snapPos.x, snapPos.y)) {
        toast.warning('Wegpunkt liegt außerhalb der definierten Wegflächen.');
        return;
      }

      setPathMousePos(snapPos);
      setPathDrawing(true);
      if (!currentPath || currentPath.waypoints.length === 0) {
        setCurrentPath({ waypoints: [snapPos] });
        toast.info('Klicken Sie ein Ziel-Tor oder einen Bereich an — TOPIS routet automatisch über die Gänge. Mehrere Klicks = manueller Pfad. Enter speichert, ESC bricht ab.', { duration: 4500 });
      } else {
        const last = currentPath.waypoints[currentPath.waypoints.length - 1];
        const distLast = Math.hypot(snapPos.x - last.x, snapPos.y - last.y);
        if (distLast < 0.5) return;

        // NEU 28.05.: Wenn Start- und Endpunkt beide auf einem Anker (Tor/Bereich/
        // Stellplatz) liegen UND der User nur 2 Klicks gemacht hat, ist eindeutig
        // „verbinde diese beiden" gemeint. Wir rufen direkt savePathWithLinks auf,
        // ohne den Luftlinien-Wand-Check — A* findet eine Route über die Gänge.
        if (currentPath.waypoints.length === 1) {
          const startAnchor = findNearestObject(last.x, last.y, 5, 'start');
          const endAnchor = findNearestObject(snapPos.x, snapPos.y, 5, 'ende');
          if (startAnchor && endAnchor && startAnchor.id !== endAnchor.id) {
            savePathWithLinks([last, snapPos]);
            setCurrentPath(null);
            setPathDrawing(false);
            setPathDragStart(null);
            setPathMousePos(null);
            return;
          }
        }

        if (lineCrossesAnyWall(last.x, last.y, snapPos.x, snapPos.y, brandschutzWaende)) {
          toast.warning('Segment kreuzt Wand/Bereich. Wegpunkt setzen abgelehnt — klicke einen Punkt der nicht durch Hindernisse führt, oder nutze eine Tür.');
          return;
        }
        setCurrentPath({ waypoints: [...currentPath.waypoints, snapPos] });
      }
      return;
    }

    // PathArea drawing - drag to create rectangle
    if (tool === 'pathArea') {
      const snapHit = findSnap({
        wx: world.x, wy: world.y, tolerance: 2,
        pathAreas, gaenge, hall: hall ? { width: hall.width, height: hall.height } : undefined,
        sources: ['patharea-corner', 'gang-endpoint', 'hall-corner'],
      });
      const snapPos = snapHit
        ? { x: snapHit.x, y: snapHit.y }
        : { x: Math.round(world.x), y: Math.round(world.y) };
      setPathAreaStart(snapPos);
      setPathAreaMousePos(snapPos);
      return;
    }

    // Measure tool
    if (tool === 'measure') {
      const snapPos = { x: Math.round(world.x * 10) / 10, y: Math.round(world.y * 10) / 10 };
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

    // Auftrag-Anlege-Tool: 1. Klick = Von, 2. Klick = Nach → Colli-Prompt → Auftrag speichern
    if (tool === 'auftrag') {
      const hit = objects.find((o) => {
        const onCircle = o.shape === 'circle' || o.tags?.includes('messpunkt');
        if (onCircle) {
          const cx = o.x + o.width / 2;
          const cy = o.y + o.height / 2;
          const r = Math.max(o.width, o.height) / 2;
          const dx = world.x - cx;
          const dy = world.y - cy;
          return dx * dx + dy * dy <= r * r;
        }
        return world.x >= o.x && world.x <= o.x + o.width && world.y >= o.y && world.y <= o.y + o.height;
      });
      if (!hit) return;
      // Nur Tore + benannte Bereiche + Messpunkte als Ziele zulassen
      const istZiel = hit.type === 'tor' || hit.type === 'bereich' || hit.tags?.includes('messpunkt');
      if (!istZiel) return;

      if (!simAuftragPending) {
        // 1. Klick → Pending starten
        startSimAuftrag(hit.id);
      } else if (simAuftragPending.vonObjectId === hit.id) {
        // Auf gleiches Tor klicken → abbrechen
        cancelSimAuftrag();
      } else {
        // 2. Klick → Colli-Eingabe und Auftrag fertigmachen
        const von = objects.find((o) => o.id === simAuftragPending.vonObjectId);
        const colliStr = window.prompt(`Auftrag ${von?.name ?? 'Von'} → ${hit.name ?? 'Nach'}\nWieviele Colli?`, '100');
        if (colliStr == null) {
          cancelSimAuftrag();
          return;
        }
        const colli = Math.max(0, parseInt(colliStr.replace(',', '.')) || 0);
        if (colli === 0) {
          cancelSimAuftrag();
          return;
        }
        finishSimAuftrag(hit.id, colli);
      }
      return;
    }

    // Conveyor drawing - click to add points
    if (tool === 'conveyor') {
      const snapPos = { x: Math.round(world.x), y: Math.round(world.y) };
      if (!currentConveyor) {
        // Start new conveyor
        setCurrentConveyor({ points: [snapPos] });
      } else {
        // Add point to current conveyor
        setCurrentConveyor({
          points: [...currentConveyor.points, snapPos]
        });
      }
      setConveyorMousePos(snapPos);
      return;
    }

    if (tool === 'select') {
      // Gang-Endpunkt-Drag (vor allem anderen): wenn ein Gang selektiert ist
      // und der Klick auf einem Endpunkt-Handle landet → Drag starten.
      if (selectedGang) {
        const HANDLE_TOL = 10;
        const last = selectedGang.points.length - 1;
        for (const pi of [0, last] as const) {
          const pt = selectedGang.points[pi];
          const sp = worldToScreen(pt.x, pt.y);
          if (Math.abs(x - sp.x) <= HANDLE_TOL && Math.abs(y - sp.y) <= HANDLE_TOL) {
            setGangEndpointDrag({ gangId: selectedGang.id, pointIndex: pi === 0 ? 0 : 1 });
            return;
          }
        }
      }

      // ZUERST: Resize-Handle des aktuell selektierten Objekts prüfen.
      // Handles sind 8px Cyan-Quadrate an den 4 Ecken (im Screen-Space).
      // Wir prüfen in Screen-Koordinaten mit Toleranz, damit's auch bei
      // kleinem Zoom treffbar bleibt.
      if (selectedObject) {
        const oPos = worldToScreen(selectedObject.x, selectedObject.y);
        const oW = selectedObject.width * SCALE * zoom;
        const oH = selectedObject.height * SCALE * zoom;
        const HANDLE_TOL = 10;
        const corners: Array<['nw'|'ne'|'sw'|'se', number, number]> = [
          ['nw', oPos.x,      oPos.y],
          ['ne', oPos.x + oW, oPos.y],
          ['sw', oPos.x,      oPos.y + oH],
          ['se', oPos.x + oW, oPos.y + oH],
        ];
        for (const [which, hx, hy] of corners) {
          if (Math.abs(x - hx) <= HANDLE_TOL && Math.abs(y - hy) <= HANDLE_TOL) {
            setResizeHandle(which);
            setResizeStart({
              x: selectedObject.x, y: selectedObject.y,
              w: selectedObject.width, h: selectedObject.height,
              mx: world.x, my: world.y,
            });
            setIsDragging(true);
            return;
          }
        }
      }

      // Dann normales Object-Drag
      const obj = findObjectAt(world.x, world.y);
      if (obj) {
        // Alt gedrückt → „Serie ziehen": Objekt in einer Reihe vervielfältigen (Factorio-Stil).
        // Nur für freie Objekte (nicht Tore — die haben den Tor-Pinsel).
        if (e.altKey && obj.type !== 'tor') {
          selectObject(obj);
          setSerieSrc(obj);
          setSerieGhosts([{ x: obj.x, y: obj.y, width: obj.width, height: obj.height }]);
          setIsDragging(true);
          return;
        }
        selectObject(obj); // also clears selectedPath
        setSelectedWaypointIndex(null);
        // Wenn das angeklickte Tor in einem Sim-Auftrag steckt → fokussieren
        // (Wege werden auf der Halle nur für fokussiertes Tor gezeichnet)
        const istInSim = simAuftraege.some((a) => a.vonObjectId === obj.id || a.nachObjectId === obj.id);
        if (istInSim) {
          setFocusedTor(obj.id === focusedTorId ? null : obj.id);
        } else {
          setFocusedTor(null);
        }
        setDragObject(obj);
        setDragStart({ x: world.x - obj.x, y: world.y - obj.y });
        setIsDragging(true);
        dragMouseStartRef.current = { x: e.clientX, y: e.clientY };
        dragThresholdPassedRef.current = false;
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
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (tool === 'tor-pinsel') {
      if (!hall) {
        toast.error('Erst eine Halle anlegen');
        return;
      }
      const side = pinselNearestSide(world.x, world.y, hall);
      const start = { x: world.x, y: world.y };
      setPinselSide(side);
      setPinselStart(start);
      setPinselGhosts(computePinselGhosts(side, start, start, hall));
      return;
    } else if (tool === 'bereich') {
      // A3: Bereich per Rechteck aufziehen. Start merken; beim Ziehen Vorschau, beim
      // Loslassen als Bereich in Ziehgröße anlegen (kleiner Klick → Standardgröße als Fallback).
      setBereichStart({ x: Math.round(world.x * 10) / 10, y: Math.round(world.y * 10) / 10 });
      setBereichMousePos(null);
      return;
    } else if (tool in OBJECT_DEFAULTS) {
      // Add new object using defaults - centered on click position
      const objectType = tool as ObjectType;
      const defaults = OBJECT_DEFAULTS[objectType];
      const count = objects.filter(o => o.type === objectType).length + 1;

      let objX = Math.round(world.x - defaults.width / 2);
      let objY = Math.round(world.y - defaults.height / 2);
      let objWidth = defaults.width;
      let objHeight = defaults.height;
      let torSide: 'north' | 'south' | 'east' | 'west' | undefined;

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
        side: torSide,
        // Tore brauchen messpunkt-Tag + MP-Code, sonst greift der Demo-Generator
        // (filter: tags=messpunkt && meta.code) nicht.
        ...(objectType === 'tor'
          ? {
              torNummer: count,
              tags: ['messpunkt'],
              meta: { code: `MP${count}` },
            }
          : {}),
      });

      // Lastenheft 3.1.2: Überladebrücke ist **optional** und kein eigenes
      // Objekt — sie ist eine reine Tor-Visualisierungs-Property
      // (ueberladebrueckeAktiv + ueberladebrueckeLaenge). Default: aus.
      // Entladezone als eigenständige Nutzfläche (Type `entladebereich`)
      // bleibt verfügbar und wird vom User manuell gezeichnet.
      if (objectType === 'tor') {
        toast.success(`Tor ${count} erstellt`);
      }

      // Select the new object and switch to select tool for immediate editing
      selectObject(newObj);
      setTool('select');
      return;
    }

    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const world = screenToWorld(x, y);

    // Hover-Feedback (A2): Objekt unter dem Cursor merken (nur im Select-Tool, nicht während
    // laufender Aktionen). findAllObjectsAt ist seiteneffektfrei; Zonen sind niedrigere Priorität.
    if (tool === 'select' && !isDragging && !serieSrc && !pinselStart && !gangEndpointDrag) {
      const hits = findAllObjectsAt(world.x, world.y);
      const solid = hits.filter((o) => o.type !== 'bereich');
      const hoveredId = (solid[0] || hits[0])?.id ?? null;
      if (hoveredId !== hoverObjectId) setHoverObjectId(hoveredId);
    }

    // Tor-Pinsel: während des Ziehens die Geister-Tor-Reihe live nachführen.
    if (pinselStart && pinselSide && hall) {
      setPinselGhosts(computePinselGhosts(pinselSide, pinselStart, world, hall));
      return;
    }

    // Gang-Endpunkt-Drag mit Snap auf andere Gänge
    if (gangEndpointDrag && tool === 'select') {
      const otherGaenge = gaenge.filter(g => g.id !== gangEndpointDrag.gangId);
      const snap = findGangSnap(world.x, world.y, otherGaenge, 2);
      setGangSnap(snap);
      const newPos = snap.snapped
        ? { x: snap.x, y: snap.y }
        : { x: Math.round(world.x), y: Math.round(world.y) };
      const g = gaenge.find(g => g.id === gangEndpointDrag.gangId);
      if (g) {
        const newPoints = g.points.slice();
        newPoints[gangEndpointDrag.pointIndex === 0 ? 0 : newPoints.length - 1] = newPos;
        updateGang(g.id, { points: newPoints });
      }
      return;
    }

    // Update gang preview position + Snap-Preview
    if (tool === 'gang') {
      const snap = findGangSnap(world.x, world.y, gaenge, 2);
      setGangSnap(snap);
      if (gangDrawStart) {
        const pos = snap.snapped
          ? { x: snap.x, y: snap.y }
          : { x: Math.round(world.x), y: Math.round(world.y) };
        setGangMousePos(pos);
        return;
      }
    }

    // Update path preview position + Snap auf Tor-Anker, Gang-Knoten, Path-Waypoints
    if (tool === 'path') {
      const snap = findSnap({
        wx: world.x, wy: world.y, tolerance: 2,
        gaenge, paths, objects,
        sources: ['gang-endpoint', 'gang-intersection', 'object-anchor', 'path-waypoint'],
      });
      setToolSnap(snap);
      if (pathDrawing) {
        const pos = snap ? { x: snap.x, y: snap.y } : { x: Math.round(world.x), y: Math.round(world.y) };
        setPathMousePos(pos);
      }
      return;
    }

    // Update pathArea preview position + Snap auf andere pathArea-Ecken, Gang-Endpunkte, Halle-Ecken
    if (tool === 'pathArea') {
      const snap = findSnap({
        wx: world.x, wy: world.y, tolerance: 2,
        pathAreas, gaenge, hall: hall ? { width: hall.width, height: hall.height } : undefined,
        sources: ['patharea-corner', 'gang-endpoint', 'hall-corner'],
      });
      setToolSnap(snap);
      if (pathAreaStart) {
        const pos = snap ? { x: snap.x, y: snap.y } : { x: Math.round(world.x), y: Math.round(world.y) };
        setPathAreaMousePos(pos);
      }
      return;
    }

    // andere Werkzeuge: Snap-Preview ausblenden
    if (toolSnap) setToolSnap(null);

    // Bereich aufziehen (A3): Vorschau-Rechteck live nachführen.
    if (tool === 'bereich' && bereichStart) {
      setBereichMousePos({ x: Math.round(world.x * 10) / 10, y: Math.round(world.y * 10) / 10 });
      return;
    }

    // Update measure end position
    if (tool === 'measure' && measureStart) {
      setMeasureEnd({ x: Math.round(world.x * 10) / 10, y: Math.round(world.y * 10) / 10 });
      return;
    }

    // Update conveyor preview position
    if (tool === 'conveyor' && currentConveyor) {
      setConveyorMousePos({ x: Math.round(world.x), y: Math.round(world.y) });
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
      const path = paths.find(p => p.id === draggingWaypoint.pathId);
      if (path) {
        const newWaypoints = [...path.waypoints];
        newWaypoints[draggingWaypoint.waypointIndex] = {
          ...newWaypoints[draggingWaypoint.waypointIndex],
          x: Math.round(world.x),
          y: Math.round(world.y)
        };
        updatePath(draggingWaypoint.pathId, { waypoints: newWaypoints });
      }
    } else if (tool === 'select' && resizeHandle && resizeStart && selectedObject) {
      // Resize: an welcher Ecke wird gezogen, Größe + Position entsprechend anpassen
      const dx = world.x - resizeStart.mx;
      const dy = world.y - resizeStart.my;
      let newX = resizeStart.x;
      let newY = resizeStart.y;
      let newW = resizeStart.w;
      let newH = resizeStart.h;
      const MIN = 0.5;  // Mindestgröße 0.5m × 0.5m

      if (resizeHandle === 'se') {
        newW = Math.max(MIN, resizeStart.w + dx);
        newH = Math.max(MIN, resizeStart.h + dy);
      } else if (resizeHandle === 'ne') {
        newW = Math.max(MIN, resizeStart.w + dx);
        newH = Math.max(MIN, resizeStart.h - dy);
        newY = resizeStart.y + (resizeStart.h - newH);
      } else if (resizeHandle === 'sw') {
        newW = Math.max(MIN, resizeStart.w - dx);
        newX = resizeStart.x + (resizeStart.w - newW);
        newH = Math.max(MIN, resizeStart.h + dy);
      } else if (resizeHandle === 'nw') {
        newW = Math.max(MIN, resizeStart.w - dx);
        newX = resizeStart.x + (resizeStart.w - newW);
        newH = Math.max(MIN, resizeStart.h - dy);
        newY = resizeStart.y + (resizeStart.h - newH);
      }

      // Snap auf 0.1m für saubere Werte
      newX = Math.round(newX * 10) / 10;
      newY = Math.round(newY * 10) / 10;
      newW = Math.round(newW * 10) / 10;
      newH = Math.round(newH * 10) / 10;

      updateObject(selectedObject.id, { x: newX, y: newY, width: newW, height: newH });
    } else if (tool === 'select' && serieSrc) {
      // Serie ziehen: Reihe von Kopien entlang der dominanten Zieh-Achse, Abstand = Größe + 1 m
      // Lücke (im Rastermaß). Vorschau als Geister; Anlegen beim Loslassen.
      const src = serieSrc;
      const dx = world.x - (src.x + src.width / 2);
      const dy = world.y - (src.y + src.height / 2);
      const horiz = Math.abs(dx) >= Math.abs(dy);
      const ghosts: { x: number; y: number; width: number; height: number }[] = [];
      if (horiz) {
        const step = src.width + 1;
        const dir = dx >= 0 ? 1 : -1;
        const n = Math.max(1, Math.min(50, Math.floor(Math.abs(dx) / step) + 1));
        for (let i = 0; i < n; i++) ghosts.push({ x: src.x + dir * i * step, y: src.y, width: src.width, height: src.height });
      } else {
        const step = src.height + 1;
        const dir = dy >= 0 ? 1 : -1;
        const n = Math.max(1, Math.min(50, Math.floor(Math.abs(dy) / step) + 1));
        for (let i = 0; i < n; i++) ghosts.push({ x: src.x, y: src.y + dir * i * step, width: src.width, height: src.height });
      }
      // Auf Hallengrenzen begrenzen
      const inBounds = hall ? ghosts.filter((g) => g.x >= 0 && g.y >= 0 && g.x + g.width <= hall.width && g.y + g.height <= hall.height) : ghosts;
      setSerieGhosts(inBounds.length ? inBounds : [{ x: src.x, y: src.y, width: src.width, height: src.height }]);
    } else if (tool === 'select' && dragObject) {
      // Drag-Threshold: erst nach 3 px Maus-Bewegung als Verschieben werten
      // (verhindert versehentliches Verschieben beim Klicken — Nico 22.05.).
      if (!dragThresholdPassedRef.current && dragMouseStartRef.current) {
        const dx = e.clientX - dragMouseStartRef.current.x;
        const dy = e.clientY - dragMouseStartRef.current.y;
        if (Math.hypot(dx, dy) < 3) return;
        dragThresholdPassedRef.current = true;
      }
      // Snap: bei Toren auf die Tor-Breite (z.B. 3.75m), sonst auf 0.1m
      const snap = dragObject.type === 'tor' ? dragObject.width : 0.1;
      let newX = Math.round((world.x - dragStart.x) / snap) * snap;
      let newY = Math.round((world.y - dragStart.y) / snap) * snap;
      // Bei horizontalen Tor-Reihen (Nord/Süd) y nicht snappen — y bleibt
      // an der Wand, nur x rastet auf die Tor-Breite.
      if (dragObject.type === 'tor') {
        const side = dragObject.side;
        if (side === 'north' || side === 'south') {
          newY = Math.round((world.y - dragStart.y) * 10) / 10;
        } else if (side === 'east' || side === 'west') {
          newX = Math.round((world.x - dragStart.x) * 10) / 10;
        }
      }

      // Ausrichtung/Snapping an Nachbarn + Wände (nur freie Objekte, nicht Tore — die rasten
      // an der Wand). Snap-Toleranz ~8 px in Weltmeter umgerechnet, damit sie zoom-unabhängig
      // „gleich stark" wirkt. Setzt Führungslinien + Live-Maß für draw().
      if (dragObject.type !== 'tor') {
        const threshM = 8 / (SCALE * zoom);
        const rects = objects.map((o) => ({ id: o.id, x: o.x, y: o.y, width: o.width, height: o.height }));
        const al = computeAlignment({ id: dragObject.id, x: newX, y: newY, width: dragObject.width, height: dragObject.height }, rects, hall, threshM);
        newX = al.x; newY = al.y;
        alignRef.current = (al.vx.length || al.hy.length || al.measures.length) ? { vx: al.vx, hy: al.hy, measures: al.measures } : null;
      }

      // Clamp position within hall bounds
      if (hall) {
        newX = Math.max(0, Math.min(hall.width - dragObject.width, newX));
        newY = Math.max(0, Math.min(hall.height - dragObject.height, newY));
      }

      updateObject(dragObject.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Serie ziehen abschließen: Kopien (außer dem Original bei i=0) als Batch anlegen.
    if (serieSrc) {
      const copies = serieGhosts.slice(1);
      if (copies.length > 0) {
        const { id: _id, x: _x, y: _y, name: _n, ...rest } = serieSrc;
        void _id; void _x; void _y;
        const baseName = (_n || 'Objekt').replace(/\s*\d+$/, '');
        const newObjs = copies.map((g, i) => ({ ...rest, x: g.x, y: g.y, width: g.width, height: g.height, name: `${baseName} ${i + 2}` }));
        addObjects(newObjs as Omit<TopisObject, 'id'>[]);
        toast.success(`${copies.length} ${copies.length === 1 ? 'Kopie' : 'Kopien'} angelegt`);
      }
      setSerieSrc(null);
      setSerieGhosts([]);
      setIsDragging(false);
      return;
    }

    // Gang-Endpunkt-Drag beenden
    if (gangEndpointDrag) {
      setGangEndpointDrag(null);
      setGangSnap({ snapped: false });
      toast.success('Gang-Endpunkt verschoben');
      return;
    }

    // Tor-Pinsel abschließen: Geister-Tore als Batch anlegen (ein Undo-Schritt).
    if (pinselStart) {
      if (pinselGhosts.length > 0) {
        const base = objects.filter((o) => o.type === 'tor').length;
        const newGates = pinselGhosts.map((g, i) => ({
          type: 'tor' as ObjectType,
          x: g.x,
          y: g.y,
          width: g.width,
          height: g.height,
          name: `Tor ${base + i + 1}`,
          side: pinselSide ?? undefined,
          torNummer: base + i + 1,
          tags: ['messpunkt'],
          meta: { code: `MP${base + i + 1}` },
        }));
        addObjects(newGates);
        toast.success(`${newGates.length} ${newGates.length === 1 ? 'Tor' : 'Tore'} erstellt`);
      }
      setPinselStart(null);
      setPinselSide(null);
      setPinselGhosts([]);
      setTool('select');
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const world = screenToWorld(x, y);

      // Path-Drawing: nichts auf MouseUp — Klick-Modus läuft komplett über MouseDown.
      if (tool === 'path' && pathDrawing) {
        // no-op; Punkte werden in handleMouseDown gesetzt
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
          // Lastenheft 3.1.4.1: pathArea darf nicht über belegte Bereiche/Regale/Hindernisse gehen
          const blockers = objects.filter(o => ['bereich', 'regal', 'hindernis', 'wand'].includes(o.type));
          const ueberschneidet = blockers.find(b =>
            !(x2 <= b.x || b.x + b.width <= x1 || y2 <= b.y || b.y + b.height <= y1)
          );
          if (ueberschneidet) {
            toast.warning(
              `Wegfläche überschneidet "${ueberschneidet.name}" (${ueberschneidet.type}) — Wegflächen sollten nicht über belegten Elementen liegen. Trotzdem angelegt.`,
              { duration: 5000 },
            );
          }
          addPathArea({
            name: `Wegbereich ${pathAreas.length + 1}`,
            x: x1,
            y: y1,
            width: width,
            height: height,
            color: 'rgba(100, 150, 255, 0.2)'
          });
          if (!ueberschneidet) {
            toast.success(`Wegbereich erstellt (${width.toFixed(0)}m × ${height.toFixed(0)}m)`);
          }
        }
        setPathAreaStart(null);
        setPathAreaMousePos(null);
        return;
      }

      // Bereich (A3) — beim Loslassen als Rechteck anlegen (Mini-Ziehen → Standardgröße).
      if (tool === 'bereich' && bereichStart) {
        const def = OBJECT_DEFAULTS['bereich'];
        const mp = bereichMousePos;
        let x1 = bereichStart.x, y1 = bereichStart.y;
        let width = mp ? Math.abs(mp.x - bereichStart.x) : 0;
        let height = mp ? Math.abs(mp.y - bereichStart.y) : 0;
        if (mp) { x1 = Math.min(bereichStart.x, mp.x); y1 = Math.min(bereichStart.y, mp.y); }
        if (width < 1 || height < 1) { width = def.width; height = def.height; x1 = bereichStart.x - width / 2; y1 = bereichStart.y - height / 2; }
        if (hall) { x1 = Math.max(0, Math.min(hall.width - width, x1)); y1 = Math.max(0, Math.min(hall.height - height, y1)); }
        const count = objects.filter(o => o.type === 'bereich').length + 1;
        addObjects([{ type: 'bereich', x: Math.round(x1 * 10) / 10, y: Math.round(y1 * 10) / 10, width: Math.round(width * 10) / 10, height: Math.round(height * 10) / 10, name: `Bereich ${count}` }]);
        toast.success(`Bereich erstellt (${width.toFixed(0)} m × ${height.toFixed(0)} m)`);
        setBereichStart(null);
        setBereichMousePos(null);
        return;
      }
    }

    // Stop waypoint dragging
    if (draggingWaypoint) {
      // Update object links after moving waypoint
      const path = paths.find(p => p.id === draggingWaypoint.pathId);
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
      toast.success('Wegpunkt verschoben');
    }

    alignRef.current = null; // Führungslinien/Maße ausblenden
    setIsDragging(false);
    setDragObject(null);
    setResizeHandle(null);
    setResizeStart(null);
  };

  // Wheel zoom is handled via native event listener above (non-passive)

  // Native wheel listener (non-passive) to allow preventDefault for zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nativeWheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();

      // Shift+Wheel = horizontal pan
      if (e.shiftKey && !e.ctrlKey && !e.metaKey) {
        setPan({ x: pan.x - e.deltaY, y: pan.y });
        return;
      }

      // Figma-/Maps-Konvention:
      // - ctrlKey/metaKey gesetzt → Zoom (Pinch-Trackpad sendet automatisch ctrlKey,
      //   Cmd+Scroll mit Maus auch). Das ist der EINZIGE Zoom-Trigger.
      // - alles andere (2-Finger-Scroll vertikal/horizontal/diagonal, Maus-Wheel) → Pan.
      // Maus-Nutzer ohne Trackpad: Cmd+Scroll zum Zoomen, oder Toolbar-Buttons.
      const isZoomGesture = e.ctrlKey || e.metaKey;

      if (isZoomGesture) {
        // Zoom towards mouse position
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Bei pinch ist deltaY meist klein (-10..+10), bei wheel groß — abstufen
        const factor = Math.min(0.15, Math.abs(e.deltaY) * 0.01);
        const delta = e.deltaY > 0 ? (1 - factor) : (1 + factor);
        const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
        const zoomRatio = newZoom / zoom;
        const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
        const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      } else {
        // Pan in beide Achsen — deltaX und deltaY beliebig
        setPan({ x: pan.x - e.deltaX, y: pan.y - e.deltaY });
      }
    };

    canvas.addEventListener('wheel', nativeWheelHandler, { passive: false });
    return () => canvas.removeEventListener('wheel', nativeWheelHandler);
  }, [zoom, pan, setZoom, setPan]);

  // ------------------------------------------------------------------
  // Touch-Events (Tablet-Support)
  // Ein-Finger = Pan (oder Tap → Selection). Zwei-Finger = Pinch-Zoom
  // um den Mittelpunkt zwischen den Fingern. Maus-Handler bleiben
  // unverändert; Touch läuft als nativer Listener mit passive:false
  // damit preventDefault() zuverlässig Scroll/Doppeltap-Zoom verhindert.
  // Refs (nicht useState) → keine Re-Renders pro touchmove-Frame.
  // ------------------------------------------------------------------
  const touchPanRef = useRef<{ x: number; y: number } | null>(null);
  const touchPinchRef = useRef<{ distance: number; centerX: number; centerY: number } | null>(null);
  const touchTapRef = useRef<{ x: number; y: number; time: number; moved: boolean } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const TAP_MAX_MOVE = 8;     // Pixel – darüber gilt's als Drag
    const TAP_MAX_DURATION = 350; // ms

    const getCanvasPoint = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const p = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        touchPanRef.current = p;
        touchTapRef.current = { x: p.x, y: p.y, time: Date.now(), moved: false };
        touchPinchRef.current = null;
      } else if (e.touches.length === 2) {
        const p1 = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        const p2 = getCanvasPoint(e.touches[1].clientX, e.touches[1].clientY);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        touchPinchRef.current = {
          distance: Math.sqrt(dx * dx + dy * dy),
          centerX: (p1.x + p2.x) / 2,
          centerY: (p1.y + p2.y) / 2,
        };
        // Zweiter Finger landet → kein Pan, kein Tap mehr
        touchPanRef.current = null;
        touchTapRef.current = null;
        e.preventDefault();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // Standard-Verhalten (Scroll, Pinch-Page-Zoom) auf dem Canvas unterdrücken
      e.preventDefault();

      if (e.touches.length === 2 && touchPinchRef.current) {
        const p1 = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        const p2 = getCanvasPoint(e.touches[1].clientX, e.touches[1].clientY);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        const oldPinch = touchPinchRef.current;
        if (newDistance > 0 && oldPinch.distance > 0) {
          const scale = newDistance / oldPinch.distance;
          const newZoom = Math.max(0.1, Math.min(5, zoom * scale));
          if (newZoom !== zoom) {
            const zoomRatio = newZoom / zoom;
            // Anker = aktueller Mittelpunkt zwischen den Fingern
            const anchorX = (p1.x + p2.x) / 2;
            const anchorY = (p1.y + p2.y) / 2;
            const newPanX = anchorX - (anchorX - pan.x) * zoomRatio;
            const newPanY = anchorY - (anchorY - pan.y) * zoomRatio;
            setZoom(newZoom);
            setPan({ x: newPanX, y: newPanY });
          }
        }
        touchPinchRef.current = {
          distance: newDistance,
          centerX: (p1.x + p2.x) / 2,
          centerY: (p1.y + p2.y) / 2,
        };
        return;
      }

      if (e.touches.length === 1 && touchPanRef.current) {
        const p = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        const dx = p.x - touchPanRef.current.x;
        const dy = p.y - touchPanRef.current.y;
        if (touchTapRef.current) {
          const totalDx = p.x - touchTapRef.current.x;
          const totalDy = p.y - touchTapRef.current.y;
          if (Math.abs(totalDx) > TAP_MAX_MOVE || Math.abs(totalDy) > TAP_MAX_MOVE) {
            touchTapRef.current.moved = true;
          }
        }
        if (dx !== 0 || dy !== 0) {
          setPan({ x: pan.x + dx, y: pan.y + dy });
        }
        touchPanRef.current = p;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      // Tap-Detection: 1-Finger ohne nennenswerte Bewegung + kurze Dauer
      const tap = touchTapRef.current;
      if (
        tap &&
        !tap.moved &&
        e.touches.length === 0 &&
        Date.now() - tap.time <= TAP_MAX_DURATION
      ) {
        // Selection nur im 'select'-Tool, wie die Maus
        if (tool === 'select') {
          const world = screenToWorld(tap.x, tap.y);
          const obj = findObjectAt(world.x, world.y);
          if (obj) {
            selectObject(obj);
          } else {
            // Auch Gänge/Paths/Bereiche treffen, wie beim Mouse-Click
            const wp = findWaypointAt(world.x, world.y);
            if (wp) {
              selectPath(wp.path);
            } else {
              const pathHit = findPathAt(world.x, world.y);
              if (pathHit) {
                selectPath(pathHit);
              } else {
                const gangHit = findGangAt(world.x, world.y);
                if (gangHit) {
                  selectGang(gangHit);
                } else {
                  const areaHit = findPathAreaAt(world.x, world.y);
                  if (areaHit) {
                    selectPathArea(areaHit);
                  } else {
                    const convHit = findConveyorAt(world.x, world.y);
                    if (convHit) {
                      selectConveyor(convHit);
                    } else {
                      selectObject(null);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Wenn jetzt nur noch 1 Finger übrig ist (z.B. nach 2-Finger-Pinch
      // hebt einer ab) → Pan-Anker neu setzen, Pinch beenden
      if (e.touches.length === 1) {
        const p = getCanvasPoint(e.touches[0].clientX, e.touches[0].clientY);
        touchPanRef.current = p;
        touchPinchRef.current = null;
        touchTapRef.current = null;
      } else if (e.touches.length === 0) {
        touchPanRef.current = null;
        touchPinchRef.current = null;
        touchTapRef.current = null;
      }
    };

    const onTouchCancel = () => {
      touchPanRef.current = null;
      touchPinchRef.current = null;
      touchTapRef.current = null;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchCancel, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [
    zoom, pan, setZoom, setPan, tool, screenToWorld,
    findObjectAt, findGangAt, findPathAt, findPathAreaAt, findConveyorAt, findWaypointAt,
    selectObject, selectPath, selectGang, selectPathArea, selectConveyor,
  ]);

  // Handle keyboard events for drawing cancellation and deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gangDrawStart) {
          setGangDrawStart(null);
          setGangMousePos(null);
          setGangSnap({ snapped: false });
          toast.info('Gang-Zeichnen abgebrochen');
        }
        if (currentPath) {
          setCurrentPath(null);
          setPathDrawing(false);
          setPathDragStart(null);
          setPathMousePos(null);
          toast.info('Weg-Zeichnen abgebrochen');
        }
        if (pathAreaStart) {
          setPathAreaStart(null);
          setPathAreaMousePos(null);
          toast.info('Wegbereich abgebrochen');
        }
        if (measureStart) {
          setMeasureStart(null);
          setMeasureEnd(null);
          toast.info('Messung abgebrochen');
        }
        if (currentConveyor) {
          setCurrentConveyor(null);
          setConveyorMousePos(null);
          toast.info('Förderband-Zeichnen abgebrochen');
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
        toast.success('Weg gelöscht');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gangDrawStart, currentPath, pathAreaStart, measureStart, currentConveyor, selectedPath, deletePath, selectPath, contextMenu]);

  // Reset drawing states when tool changes
  useEffect(() => {
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
          speed: 1, // 1 m/s default
          capacity: 100 // 100 pallets/hour default
        });
        toast.success('Förderband gespeichert');
      }
      setCurrentConveyor(null);
      setConveyorMousePos(null);
    }
  }, [tool]);

  // Double-click to finish path or conveyor
  // Save-Trigger für Pfad/Förderband — von Enter-Taste aufgerufen, NICHT mehr
  // von Doppelklick. Bug B (28.05.): Doppelklick triggerte zwischen 2 schnellen
  // Klicks → Save mit n-1 Waypoints. Enter ist deterministisch.
  const savePendingDrawing = useCallback(() => {
    if (tool === 'path' && currentPath && currentPath.waypoints.length >= 2) {
      savePathWithLinks(currentPath.waypoints);
      setCurrentPath(null);
      setPathDrawing(false);
      setPathDragStart(null);
      setPathMousePos(null);
      return true;
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
      toast.success('Förderband gespeichert');
      return true;
    }
    return false;
  }, [tool, currentPath, currentConveyor, conveyors.length, savePathWithLinks, addConveyor]);

  // Enter speichert, ESC bricht ab. Ersetzt das frühere Doppelklick-Save.
  useEffect(() => {
    if (tool !== 'path' && tool !== 'conveyor') return;
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.key === 'Enter') {
        if (savePendingDrawing()) e.preventDefault();
      } else if (e.key === 'Escape') {
        if (tool === 'path' && currentPath) {
          e.preventDefault();
          setCurrentPath(null);
          setPathDrawing(false);
          setPathDragStart(null);
          setPathMousePos(null);
          toast.info('Pfad-Zeichnen abgebrochen');
        } else if (tool === 'conveyor' && currentConveyor) {
          e.preventDefault();
          setCurrentConveyor(null);
          setConveyorMousePos(null);
          toast.info('Förderband-Zeichnen abgebrochen');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tool, currentPath, currentConveyor, savePendingDrawing]);

  // Cursor based on tool
  const getCursor = () => {
    if (isDragging && tool === 'pan') return 'grabbing';
    if (tool === 'pan') return 'grab';
    if (resizeHandle === 'nw' || resizeHandle === 'se') return 'nwse-resize';
    if (resizeHandle === 'ne' || resizeHandle === 'sw') return 'nesw-resize';
    if (tool === 'select') return (dragObject || serieSrc) ? 'move' : (hoverObjectId != null ? 'move' : 'default');
    if (tool === 'gang') return gangDrawStart ? 'crosshair' : 'crosshair';
    return 'crosshair';
  };

  // Right-click to cancel drawing
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
      toast.info('Zeichnen abgebrochen');
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
      setContextMenu({ x: e.clientX, y: e.clientY, pathId: clickedPath.id });
      setObjectContextMenu(null);
      return;
    }

    // Check for overlapping objects → show object context menu
    const objectsHere = findAllObjectsAt(world.x, world.y);
    if (objectsHere.length > 0) {
      setObjectContextMenu({ x: e.clientX, y: e.clientY, objects: objectsHere });
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
  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setObjectContextMenu(null);
  };

  // Handle context menu delete path
  const handleContextMenuDeletePath = () => {
    if (contextMenu) {
      deletePath(contextMenu.pathId);
      selectPath(null);
      setSelectedWaypointIndex(null);
      setContextMenu(null);
      toast.success('Weg gelöscht');
    }
  };

  // Handle context menu delete waypoint
  const handleContextMenuDeleteWaypoint = () => {
    if (contextMenu && contextMenu.waypointIndex !== undefined && selectedPath) {
      const newWaypoints = [...selectedPath.waypoints];
      newWaypoints.splice(contextMenu.waypointIndex, 1);

      if (newWaypoints.length < 2) {
        // If less than 2 points remain, delete the entire path
        deletePath(contextMenu.pathId);
        selectPath(null);
        toast.success('Weg gelöscht (zu wenige Punkte)');
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
        toast.success('Wegpunkt gelöscht');
      }
      setSelectedWaypointIndex(null);
      setContextMenu(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-black overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: getCursor(), touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
      />

      {/* Legende — erscheint wenn Sim-Aufträge auf der Halle sind */}
      {simAuftraege.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[11px] rounded-md px-3 py-2 space-y-1 border border-white/20 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-0.5 bg-amber-400" />
            <span>IST-Auftrag (heutiger Plan)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-0.5 bg-blue-500" />
            <span>SIM-Variante (was-wäre-wenn)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full border-2 border-red-500" />
            <span>belegtes Tor — Pfeil zeigt Ziel</span>
          </div>
        </div>
      )}
      {/* Top Ruler */}
      <canvas
        ref={rulerTopRef}
        className="absolute top-0 left-7 pointer-events-none"
        style={{ height: 22 }}
      />
      {/* Left Ruler */}
      <canvas
        ref={rulerLeftRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: 28 }}
      />
      {/* Mini-Map unten rechts */}
      <canvas
        ref={minimapRef}
        width={200}
        height={80}
        onClick={handleMinimapClick}
        className="absolute bottom-3 right-3 border-2 border-cyan-700/60 rounded shadow-lg cursor-pointer hover:border-cyan-500 transition-colors"
        title="Übersicht — klicken zum Springen"
      />
      {/* Tool instructions */}
      {tool === 'path' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {currentPath && currentPath.waypoints.length >= 2 ? (
            <span>Weiteren Punkt klicken | <kbd className="px-1 bg-muted rounded">Doppelklick</kbd> Speichern | <kbd className="px-1 bg-muted rounded">Esc</kbd> Abbrechen</span>
          ) : (
            <span>Start-Punkt klicken (am besten auf einem Tor oder Bereich)</span>
          )}
        </div>
      )}
      {tool === 'pathArea' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          <span>Klicken und ziehen um einen Wegbereich zu definieren</span>
        </div>
      )}
      {tool === 'measure' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {measureStart && measureEnd ? (
            <span>Distanz: <strong>{Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2)).toFixed(2)} m</strong> | Klicken für neue Messung</span>
          ) : (
            <span>Klicken für Startpunkt, dann ziehen zum Messen</span>
          )}
        </div>
      )}
      {tool === 'gang' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {gangDrawStart ? (
            <span>Klicken Sie für den Endpunkt | <kbd className="px-1 bg-muted rounded">ESC</kbd> oder Rechtsklick zum Abbrechen</span>
          ) : (
            <span>Klicken Sie für den Startpunkt des Gangs</span>
          )}
        </div>
      )}
      {tool === 'conveyor' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {currentConveyor && currentConveyor.points.length > 0 ? (
            <span>Klicken für weiteren Punkt | <kbd className="px-1 bg-muted rounded">Doppelklick</kbd> zum Speichern | <kbd className="px-1 bg-muted rounded">ESC</kbd> Abbrechen</span>
          ) : (
            <span>Klicken um das Förderband zu zeichnen</span>
          )}
        </div>
      )}
      {tool === 'select' && selectedPath && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          <span>Wegpunkte anklicken & ziehen zum Verschieben | <kbd className="px-1 bg-muted rounded">Rechtsklick</kbd> Menü | <kbd className="px-1 bg-muted rounded">Entf</kbd> Löschen</span>
        </div>
      )}

      {/* Hilfetext für alle Objekt-Tools (tor, stellplatz, regal, bereich, wand,
          tuer, hindernis, rampe, leveller, pfosten, treppe, ladestation,
          gefahrgut, sperrplatz, klaerplatz, buero, sozialraum, wc, entladebereich,
          outdoor_area, outdoor_road, trailer_spot, parking, custom). Einheitliches
          Pattern: Klick = setzen (Standardgröße), Größe danach über Properties-Panel
          oder Resize-Handles. Drag-to-size existiert NICHT — Objekt entsteht bereits
          auf mousedown (s. handleMouseDown), der alte Hinweistext war falsch (Fix 21.07.2026). */}
      {OBJECT_LABELS[tool as ObjectType] && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          <span>
            <kbd className="px-1 bg-muted rounded">Klick</kbd> {OBJECT_LABELS[tool as ObjectType]} mit Standardgröße platzieren
            {' | '}
            Größe danach rechts unter <span className="font-medium">Eigenschaften</span> oder per Anfasser ändern
            {' | '}
            <kbd className="px-1 bg-muted rounded">V</kbd> zurück zur Auswahl
          </span>
        </div>
      )}

      {/* Context Menu for Paths */}
      {contextMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseContextMenu}
          />
          {/* Menu */}
          <div
            className="fixed z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-1.5 text-xs text-muted-foreground border-b">
              {contextMenu.waypointIndex !== undefined
                ? `${selectedPath?.name} - Punkt ${contextMenu.waypointIndex + 1}`
                : selectedPath?.name || 'Weg'}
            </div>

            {/* Waypoint-specific options */}
            {contextMenu.waypointIndex !== undefined && (
              <>
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                  onClick={() => {
                    if (selectedPath && contextMenu.waypointIndex !== undefined) {
                      const wp = selectedPath.waypoints[contextMenu.waypointIndex];
                      toast.info(`Punkt ${contextMenu.waypointIndex + 1}: X=${wp.x.toFixed(1)}m, Y=${wp.y.toFixed(1)}m`);
                    }
                    setContextMenu(null);
                  }}
                >
                  📍 Punkt-Position
                </button>
                <div className="px-3 py-1.5 text-xs text-muted-foreground italic">
                  Tipp: Punkt anklicken & ziehen zum Verschieben
                </div>
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                  onClick={handleContextMenuDeleteWaypoint}
                >
                  ❌ Punkt löschen
                </button>
                <div className="border-t my-1" />
              </>
            )}

            {/* Path options */}
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
              onClick={() => {
                if (selectedPath) {
                  const length = selectedPath.waypoints.reduce((sum, wp, i, arr) => {
                    if (i === 0) return 0;
                    const prev = arr[i - 1];
                    return sum + Math.sqrt(Math.pow(wp.x - prev.x, 2) + Math.pow(wp.y - prev.y, 2));
                  }, 0);
                  toast.info(`Länge: ${length.toFixed(1)}m | Punkte: ${selectedPath.waypoints.length}`);
                }
                setContextMenu(null);
              }}
            >
              📏 Weg-Details
            </button>
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
              onClick={handleContextMenuDeletePath}
            >
              🗑️ Gesamten Weg löschen
            </button>
          </div>
        </>
      )}

      {/* Context Menu for Objects (right-click on overlapping objects) */}
      {objectContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseContextMenu}
          />
          <div
            className="fixed z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[200px]"
            style={{ left: objectContextMenu.x, top: objectContextMenu.y }}
          >
            <div className="px-3 py-1.5 text-xs text-muted-foreground border-b">
              {objectContextMenu.objects.length} Objekte an dieser Position
            </div>
            {objectContextMenu.objects.map((obj) => (
              <button
                key={obj.id}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2 ${
                  selectedObject?.id === obj.id ? 'bg-primary/10 font-medium' : ''
                }`}
                onClick={() => {
                  selectObject(obj);
                  setObjectContextMenu(null);
                }}
              >
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: obj.color || '#3498db' }}
                />
                <span className="truncate">{obj.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {obj.width}×{obj.height}m
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
