import { Gang, TopisObject, FFZ, Path } from '@/types/topis';
import { anchorPoint } from './path-anchor';

/**
 * Brandschutzwand-Blocker: prüft ob eine Linie zwischen zwei Punkten ein
 * Wand-Rechteck schneidet. Verwendet für A*-Edge-Filter — Edges die durch
 * eine Wand führen werden aus dem Graph entfernt.
 */
function segmentIntersectsRect(
  x1: number, y1: number, x2: number, y2: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  // Bounding-Box-Schnelltest
  const segMinX = Math.min(x1, x2), segMaxX = Math.max(x1, x2);
  const segMinY = Math.min(y1, y2), segMaxY = Math.max(y1, y2);
  if (segMaxX < rx || segMinX > rx + rw || segMaxY < ry || segMinY > ry + rh) return false;
  // Endpunkt innerhalb Rechteck?
  if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
  if (x2 >= rx && x2 <= rx + rw && y2 >= ry && y2 <= ry + rh) return true;
  // Segment-Rechteck-Schnitt: prüfe Schnitt mit jeder Rechteck-Kante
  const edges: Array<[number, number, number, number]> = [
    [rx, ry, rx + rw, ry],         // oben
    [rx + rw, ry, rx + rw, ry + rh], // rechts
    [rx + rw, ry + rh, rx, ry + rh], // unten
    [rx, ry + rh, rx, ry],         // links
  ];
  for (const [ex1, ey1, ex2, ey2] of edges) {
    const d = (x2 - x1) * (ey2 - ey1) - (y2 - y1) * (ex2 - ex1);
    if (Math.abs(d) < 1e-9) continue;
    const t = ((ex1 - x1) * (ey2 - ey1) - (ey1 - y1) * (ex2 - ex1)) / d;
    const u = ((ex1 - x1) * (y2 - y1) - (ey1 - y1) * (x2 - x1)) / d;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }
  return false;
}

/**
 * Prüft ob ein Liniensegment durch eine der Wände führt.
 * Türen (type='tuer') = Durchlass in der Wand: wenn ein Wand-Rechteck eine
 * Tür überlappt, ist die Tür-Region passierbar (Lastenheft 3.1.1.2 + 3.1.4.2).
 */
export function lineCrossesAnyWall(
  x1: number, y1: number, x2: number, y2: number,
  walls: TopisObject[]
): boolean {
  const tueren = walls.filter((w) => w.type === 'tuer');
  for (const w of walls) {
    if (w.type === 'tuer') continue;
    if (!segmentIntersectsRect(x1, y1, x2, y2, w.x, w.y, w.width, w.height)) continue;
    let durchTuer = false;
    for (const t of tueren) {
      const overlapX = !(t.x + t.width <= w.x || w.x + w.width <= t.x);
      const overlapY = !(t.y + t.height <= w.y || w.y + w.height <= t.y);
      if (!overlapX || !overlapY) continue;
      if (segmentIntersectsRect(x1, y1, x2, y2, t.x, t.y, t.width, t.height)) {
        durchTuer = true;
        break;
      }
    }
    if (!durchTuer) return true;
  }
  return false;
}

// Graph node for A* pathfinding
export interface GraphNode {
  x: number;
  y: number;
  gangId: number;
  id: number;
}

// Graph edge for A* pathfinding
export interface GraphEdge {
  from: number;
  to: number;
  distance: number;
  gangId: number;
}

// Path result
export interface PathResult {
  path: { x: number; y: number }[];
  distance: number;
  time: number; // in seconds
  usedGangs: number[];
}

// Graph structure
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  gaenge: Gang[];
}

/**
 * Build a graph from corridor network for pathfinding
 */
export function buildGangGraph(gaenge: Gang[], ffz?: FFZ): Graph {
  if (gaenge.length === 0) return { nodes: [], edges: [], gaenge: [] };

  // Filter corridors passable by the vehicle type
  const passableGaenge = ffz
    ? gaenge.filter(g => g.breite >= ffz.mindestBreite)
    : gaenge;

  if (passableGaenge.length === 0) return { nodes: [], edges: [], gaenge: [] };

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let nodeId = 0;

  // Create nodes from corridor endpoints
  passableGaenge.forEach(gang => {
    gang.points.forEach(point => {
      // Check if node already exists at this position (within tolerance)
      const existingNode = nodes.find(n =>
        Math.abs(n.x - point.x) < 0.5 && Math.abs(n.y - point.y) < 0.5
      );

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

  // Find intersections between corridors and add them as nodes
  for (let i = 0; i < passableGaenge.length; i++) {
    for (let j = i + 1; j < passableGaenge.length; j++) {
      const intersections = findGangIntersections(passableGaenge[i], passableGaenge[j]);
      intersections.forEach(intersection => {
        const existing = nodes.find(n =>
          Math.abs(n.x - intersection.x) < 0.5 && Math.abs(n.y - intersection.y) < 0.5
        );
        if (!existing) {
          nodes.push({
            x: intersection.x,
            y: intersection.y,
            gangId: passableGaenge[i].id,
            id: nodeId++,
          });
        }
      });
    }
  }

  // Edges PRO GANG: alle Knoten die ON dem Gang liegen werden nach Position
  // entlang der Gang-Achse sortiert. Dann werden NUR AUFEINANDER FOLGENDE
  // Knoten verbunden. Das ergibt eine lineare Kette (0,54) ↔ (10,54) ↔ (30,54)
  // ↔ (45,54) ↔ ... ↔ (210,54). Vorher: sternförmig mit (0,54) und (210,54)
  // als Hubs — das erzeugte den "Sackgassen-Bug" (Stapler fuhr zwingend zum
  // Hallen-Eingang weil keine direkte Kette zwischen Kreuzungen existierte).
  for (const gang of passableGaenge) {
    const a = gang.points[0];
    const b = gang.points[gang.points.length - 1];
    const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);

    // Alle Knoten die innerhalb dieses Gang-Segments liegen
    const onGang = nodes.filter(n => {
      for (let i = 0; i + 1 < gang.points.length; i++) {
        if (isPointOnSegment(n, gang.points[i], gang.points[i + 1], 0.5)) return true;
      }
      return false;
    });

    // Sortiere entlang der Gang-Achse
    onGang.sort((p, q) => horizontal ? p.x - q.x : p.y - q.y);

    // Verbinde nur aufeinander folgende Knoten — lineare Kette
    for (let i = 0; i + 1 < onGang.length; i++) {
      const n1 = onGang[i];
      const n2 = onGang[i + 1];
      const d = Math.sqrt((n2.x - n1.x) ** 2 + (n2.y - n1.y) ** 2);
      edges.push({ from: n1.id, to: n2.id, distance: d, gangId: gang.id });
      edges.push({ from: n2.id, to: n1.id, distance: d, gangId: gang.id });
    }
  }

  return { nodes, edges, gaenge: passableGaenge };
}

/**
 * Find intersection points between two corridors
 */
function findGangIntersections(gang1: Gang, gang2: Gang): { x: number; y: number }[] {
  const intersections: { x: number; y: number }[] = [];

  for (let i = 0; i < gang1.points.length - 1; i++) {
    for (let j = 0; j < gang2.points.length - 1; j++) {
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
 */
function lineIntersection(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): { x: number; y: number } | null {
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
 * Check if a point lies on a line segment within a given tolerance
 */
function isPointOnSegment(
  point: { x: number; y: number },
  segStart: { x: number; y: number },
  segEnd: { x: number; y: number },
  tolerance: number
): boolean {
  const dx = segEnd.x - segStart.x;
  const dy = segEnd.y - segStart.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.sqrt((point.x - segStart.x) ** 2 + (point.y - segStart.y) ** 2) < tolerance;
  const t = ((point.x - segStart.x) * dx + (point.y - segStart.y) * dy) / lengthSq;
  if (t < -0.01 || t > 1.01) return false;
  const projX = segStart.x + t * dx;
  const projY = segStart.y + t * dy;
  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2) <= tolerance;
}

/**
 * Find nearest node in graph to a given point
 */
function findNearestNode(x: number, y: number, graph: Graph): GraphNode | null {
  let nearest: GraphNode | null = null;
  let minDist = Infinity;

  graph.nodes.forEach(node => {
    const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  });

  return nearest;
}

/**
 * Senkrechte Projektion eines Punktes auf ein Gang-Liniensegment.
 * Gibt den nächsten Punkt AUF dem Segment zurück (kein Endpunkt-Snap außer
 * wenn die Projektion außerhalb fällt).
 */
function projectOntoGang(x: number, y: number, gang: Gang): { x: number; y: number; dist: number } | null {
  let best: { x: number; y: number; dist: number } | null = null;
  for (let i = 0; i + 1 < gang.points.length; i++) {
    const a = gang.points[i];
    const b = gang.points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lsq = dx * dx + dy * dy;
    if (lsq === 0) continue;
    let t = ((x - a.x) * dx + (y - a.y) * dy) / lsq;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    const d = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
    if (!best || d < best.dist) {
      best = { x: px, y: py, dist: d };
    }
  }
  return best;
}

/**
 * Findet den Gang dessen senkrechte Projektion am nächsten zum Punkt liegt.
 * Gibt Projektionspunkt + Gang zurück. Das ist die rechtwinklige Anbindung:
 * Tor fährt senkrecht raus zum Gang, kein schräger Diagonal-Weg.
 *
 * Strategie: Hauptgänge werden BEVORZUGT, auch wenn ein Quergang-Endpunkt
 * zufällig 1-2m näher liegt. Sonst werden Tore die zufällig nah an einem
 * Quergang-Endpunkt sitzen schräg dorthin projiziert, statt senkrecht auf
 * den Hauptgang. Nur wenn der nächste Hauptgang deutlich weiter weg ist
 * als ein anderer Gang, wird der andere Gang genommen.
 */
function findNearestGangProjection(
  x: number,
  y: number,
  gaenge: Gang[]
): { x: number; y: number; dist: number; gang: Gang } | null {
  const isHauptgang = (g: Gang) =>
    (g as Gang & { istHauptgang?: boolean }).istHauptgang === true ||
    (g as Gang & { typ?: string }).typ === 'hauptgang';

  let bestHauptgang: { x: number; y: number; dist: number; gang: Gang } | null = null;
  let bestAny: { x: number; y: number; dist: number; gang: Gang } | null = null;
  for (const g of gaenge) {
    const p = projectOntoGang(x, y, g);
    if (!p) continue;
    const cand = { x: p.x, y: p.y, dist: p.dist, gang: g };
    if (!bestAny || p.dist < bestAny.dist) bestAny = cand;
    if (isHauptgang(g) && (!bestHauptgang || p.dist < bestHauptgang.dist)) {
      bestHauptgang = cand;
    }
  }

  // Wenn ein Hauptgang erreichbar UND nicht extrem viel weiter als der
  // absolut-nächste Gang (Faktor 2.5×), nimm den Hauptgang — er ist die
  // realistische Anbindung. Sonst Fallback auf den nächsten Gang überhaupt.
  if (bestHauptgang && bestAny && bestHauptgang.dist <= bestAny.dist * 2.5) {
    return bestHauptgang;
  }
  return bestAny;
}

/**
 * A* Pathfinding algorithm
 */
export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  graph: Graph,
  ffz?: FFZ,
  walls: TopisObject[] = [],
  pathAreas: { x?: number; y?: number; width?: number; height?: number }[] = [],
): PathResult | null {
  if (graph.nodes.length === 0 || graph.gaenge.length === 0) return null;

  // Rechtwinklige Anbindung: nicht nächsten Graph-KNOTEN nehmen, sondern
  // den senkrechten Projektionspunkt auf das nächste Gang-Liniensegment.
  // Damit fährt der Stapler vom Tor genau senkrecht auf den Gang raus,
  // nicht schräg zum Quergang-Endpunkt.
  const startProj = findNearestGangProjection(startX, startY, graph.gaenge);
  const endProj = findNearestGangProjection(endX, endY, graph.gaenge);
  if (!startProj || !endProj) return null;

  // Augmented Graph: Original-Knoten + 2 virtuelle Projektions-Knoten.
  // Die virtuellen Knoten sind mit allen Original-Knoten auf demselben Gang
  // verbunden (Manhattan-Distanz entlang des Gangs).
  const maxId = graph.nodes.reduce((m, n) => Math.max(m, n.id), 0);
  const startNodeId = maxId + 1;
  const endNodeId = maxId + 2;

  const startNode: GraphNode = { id: startNodeId, x: startProj.x, y: startProj.y, gangId: startProj.gang.id };
  const endNode: GraphNode = { id: endNodeId, x: endProj.x, y: endProj.y, gangId: endProj.gang.id };

  // Verbinde die Projektions-Knoten mit den umgebenden Original-Knoten
  // auf demselben Gang. WICHTIG:
  // 1. je 1 Nachbar VOR und 1 NACH dem virtuellen Knoten entlang der Gang-Achse
  //    (sonst beide auf derselben Seite → Schlangenlinie)
  // 2. die ALTE Edge zwischen vor- und nach-Nachbar wird entfernt — der
  //    virtuelle Knoten sitzt geometrisch DAZWISCHEN, also muss der Graph
  //    das auch abbilden (sonst nimmt A* manchmal den Umweg vor→nach→virtual
  //    statt direkt vor→virtual = sichtbar als "Haken zurück")
  function connectOnGang(virtualNode: GraphNode, gang: Gang) {
    // Kreuzungs-Knoten bekommen in buildGangGraph nur EINE gangId zugewiesen
    // (die des "ersten" der beiden kreuzenden Gänge). Deshalb dürfen wir hier
    // nicht nach gangId filtern, sondern müssen geometrisch prüfen ob ein
    // Knoten auf dem Gang-Segment liegt — sonst sieht ein langer
    // Anbindungs-Gang nur seine eigenen Endpunkte und keine V-Gang-Kreuzungen.
    const onGang = graph.nodes.filter((n) => {
      if (n.gangId === gang.id) return true;
      for (let i = 0; i + 1 < gang.points.length; i++) {
        if (isPointOnSegment(n, gang.points[i], gang.points[i + 1], 0.5)) return true;
      }
      return false;
    });
    if (onGang.length === 0) return { edges: [] as GraphEdge[], removeBetween: null as null | [number, number] };

    const a = gang.points[0];
    const b = gang.points[gang.points.length - 1];
    const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);

    const before: { node: GraphNode; dist: number }[] = [];
    const after: { node: GraphNode; dist: number }[] = [];
    for (const n of onGang) {
      const d = Math.sqrt((n.x - virtualNode.x) ** 2 + (n.y - virtualNode.y) ** 2);
      if (horizontal ? n.x < virtualNode.x : n.y < virtualNode.y) before.push({ node: n, dist: d });
      else after.push({ node: n, dist: d });
    }
    before.sort((x, y) => x.dist - y.dist);
    after.sort((x, y) => x.dist - y.dist);

    const edges: GraphEdge[] = [];
    const picks = [before[0], after[0]].filter(Boolean);
    for (const c of picks) {
      edges.push({ from: virtualNode.id, to: c.node.id, distance: c.dist, gangId: gang.id });
      edges.push({ from: c.node.id, to: virtualNode.id, distance: c.dist, gangId: gang.id });
    }
    // Alte direkte Edge zwischen vor und nach entfernen — virtualNode dazwischen
    const removeBetween: [number, number] | null =
      before[0] && after[0] ? [before[0].node.id, after[0].node.id] : null;

    return { edges, removeBetween };
  }

  const startConn = connectOnGang(startNode, startProj.gang);
  const endConn = connectOnGang(endNode, endProj.gang);

  // Edges die "über den virtualNode hinweg" gehen würden, müssen raus.
  // Wir entfernen sie pro Gang-ID damit wir nicht versehentlich Edges auf
  // anderen Gängen mitkillen.
  const removeSet = new Set<string>();
  for (const conn of [startConn, endConn]) {
    if (conn.removeBetween) {
      const [a, b] = conn.removeBetween;
      removeSet.add(`${a}-${b}`);
      removeSet.add(`${b}-${a}`);
    }
  }
  const filteredOriginalEdges = graph.edges.filter(
    (e) => !removeSet.has(`${e.from}-${e.to}`)
  );

  const augmentedNodes = [...graph.nodes, startNode, endNode];
  let augmentedEdges = [
    ...filteredOriginalEdges,
    ...startConn.edges,
    ...endConn.edges,
  ];

  // Edge-case: Start- und End-Projektion auf demselben Gang → direkte Verbindung
  if (startProj.gang.id === endProj.gang.id) {
    const d = Math.sqrt((endNode.x - startNode.x) ** 2 + (endNode.y - startNode.y) ** 2);
    augmentedEdges.push({ from: startNodeId, to: endNodeId, distance: d, gangId: startProj.gang.id });
    augmentedEdges.push({ from: endNodeId, to: startNodeId, distance: d, gangId: startProj.gang.id });
  }

  // BRANDSCHUTZWAND-BLOCKER: filtere Edges raus die durch eine Wand führen.
  // Andock-Edges zum/vom virtuellen Start/End-Knoten ausnehmen — sonst wird
  // ein Bereich-Anker durch sein eigenes Bereich-Rechteck blockiert.
  if (walls.length > 0) {
    const nodeById = new Map(augmentedNodes.map(n => [n.id, n]));
    augmentedEdges = augmentedEdges.filter(e => {
      if (e.from === startNodeId || e.to === startNodeId || e.from === endNodeId || e.to === endNodeId) return true;
      const a = nodeById.get(e.from); const b = nodeById.get(e.to);
      if (!a || !b) return true;
      return !lineCrossesAnyWall(a.x, a.y, b.x, b.y, walls);
    });
  }

  // Lastenheft 3.1.4.2: Wege dürfen nur auf definierten Wegbereichen liegen.
  // Wenn pathAreas existieren, filtern wir Edges raus deren Endpunkte nicht
  // jeweils in einer pathArea liegen. Start-/End-Projektionen werden
  // ausgenommen, weil sie an den Tor-Rand andocken (sonst kein einziger
  // Pfad mehr möglich).
  if (pathAreas.length > 0) {
    const inAnyArea = (px: number, py: number) =>
      pathAreas.some(a =>
        a.x != null && a.y != null && a.width != null && a.height != null &&
        px >= a.x && px <= a.x + a.width && py >= a.y && py <= a.y + a.height
      );
    const nodeById = new Map(augmentedNodes.map(n => [n.id, n]));
    augmentedEdges = augmentedEdges.filter(e => {
      // Andock-Edges zu/von virtuellem Start/End-Knoten ausnehmen
      if (e.from === startNodeId || e.to === startNodeId || e.from === endNodeId || e.to === endNodeId) return true;
      const a = nodeById.get(e.from); const b = nodeById.get(e.to);
      if (!a || !b) return true;
      return inAnyArea(a.x, a.y) && inAnyArea(b.x, b.y);
    });
  }

  // Standard-A* über augmented Graph
  const openSet = new Set<number>([startNodeId]);
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>();
  const fScore = new Map<number, number>();
  const gangUsage = new Map<number, Set<number>>();
  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, heuristic(startNode, endNode));
  gangUsage.set(startNodeId, new Set<number>([startNode.gangId]));

  while (openSet.size > 0) {
    let current = -1;
    let lowestF = Infinity;
    openSet.forEach((nodeId) => {
      const f = fScore.get(nodeId) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = nodeId;
      }
    });

    if (current === endNodeId) {
      // Pfad rekonstruieren über augmented Knoten
      const path: { x: number; y: number }[] = [];
      let c = current;
      while (c !== undefined && c !== null) {
        const n = augmentedNodes.find((x) => x.id === c);
        if (!n) break;
        path.unshift({ x: n.x, y: n.y });
        if (c === startNodeId) break;
        const parent = cameFrom.get(c);
        if (parent === undefined) break;
        c = parent;
      }
      const usedGangs = Array.from(gangUsage.get(current) || new Set<number>());
      const graphDistance = gScore.get(current) || 0;
      // Senkrechte Anbindung Tor → Projektion (vorne und hinten)
      const distance = graphDistance + startProj.dist + endProj.dist;

      const speed = ffz?.geschwindigkeit || 10;
      const speedMs = speed * 1000 / 3600;
      const time = distance / speedMs;

      return { path, distance, time, usedGangs };
    }

    openSet.delete(current);

    const neighbors = augmentedEdges
      .filter((e) => e.from === current)
      .map((e) => ({ nodeId: e.to, distance: e.distance, gangId: e.gangId }));

    neighbors.forEach(({ nodeId, distance, gangId }) => {
      const tentativeG = (gScore.get(current) ?? Infinity) + distance;
      if (tentativeG < (gScore.get(nodeId) ?? Infinity)) {
        cameFrom.set(nodeId, current);
        gScore.set(nodeId, tentativeG);
        const node = augmentedNodes.find((n) => n.id === nodeId);
        if (node) {
          fScore.set(nodeId, tentativeG + heuristic(node, endNode));
        }
        const currentGangs = gangUsage.get(current) || new Set<number>();
        const newGangs = new Set<number>(currentGangs);
        newGangs.add(gangId);
        gangUsage.set(nodeId, newGangs);
        openSet.add(nodeId);
      }
    });
  }

  return null;
}

/**
 * Heuristic function (Euclidean distance)
 */
function heuristic(a: GraphNode, b: GraphNode): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Reconstruct path from A* result
 */
function reconstructPath(
  cameFrom: Map<number, number>,
  current: number,
  nodes: GraphNode[]
): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  let node = nodes.find(n => n.id === current);

  while (node) {
    path.unshift({ x: node.x, y: node.y });
    const prevId = cameFrom.get(node.id);
    if (prevId === undefined) break;
    node = nodes.find(n => n.id === prevId);
  }

  return path;
}

/**
 * Check if a point lies within a corridor
 */
export function isPointInGang(x: number, y: number, gang: Gang): boolean {
  const halfWidth = gang.breite / 2;

  for (let i = 0; i < gang.points.length - 1; i++) {
    const p1 = gang.points[i];
    const p2 = gang.points[i + 1];

    // Calculate perpendicular distance to line segment
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) continue;

    // Projection of point onto line
    const t = Math.max(0, Math.min(1,
      ((x - p1.x) * dx + (y - p1.y) * dy) / (length * length)
    ));

    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;

    const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);

    if (dist <= halfWidth) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate optimal path between two objects.
 * Akzeptiert entweder ein Gang-Array (baut Graph intern) oder einen
 * vorgebauten Graph (für Render-Schleifen die den Graph cachen).
 */
export function findPathBetweenObjects(
  obj1: TopisObject,
  obj2: TopisObject,
  gaengeOrGraph: Gang[] | Graph,
  ffz?: FFZ,
  walls: TopisObject[] = [],
  pathAreas: { x?: number; y?: number; width?: number; height?: number }[] = [],
): PathResult | null {
  const graph: Graph = Array.isArray(gaengeOrGraph)
    ? buildGangGraph(gaengeOrGraph, ffz)
    : gaengeOrGraph;

  // Wegpunkt-Anker statt center: wegpunktOffset (0..1 normalisiert) verschiebt
  // den Pfad-Endpunkt vom Mittelpunkt z.B. an den Tor-Rand (Lastenheft 3.1.4.2).
  const start = anchorPoint(obj1);
  const end = anchorPoint(obj2);

  return findPath(start.x, start.y, end.x, end.y, graph, ffz, walls, pathAreas);
}

/**
 * Calculate total distance for a route visiting multiple objects
 */
export function calculateRouteDistance(
  objects: TopisObject[],
  gaenge: Gang[],
  ffz?: FFZ
): { totalDistance: number; totalTime: number; paths: PathResult[] } {
  if (objects.length < 2) {
    return { totalDistance: 0, totalTime: 0, paths: [] };
  }

  const graph = buildGangGraph(gaenge, ffz);
  const paths: PathResult[] = [];
  let totalDistance = 0;
  let totalTime = 0;

  for (let i = 0; i < objects.length - 1; i++) {
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

  return { totalDistance, totalTime, paths };
}

/**
 * Convert a PathResult into a Path object (without id, assigned by store)
 */
export function pathResultToPath(
  result: PathResult,
  startObj: TopisObject,
  endObj: TopisObject
): Omit<Path, 'id'> {
  return {
    name: `${startObj.name} → ${endObj.name}`,
    waypoints: result.path.map(p => ({ x: p.x, y: p.y, objectId: null })),
    color: '#22c55e',
    startObjectId: startObj.id,
    startObjectName: startObj.name,
    endObjectId: endObj.id,
    endObjectName: endObj.name,
    autoGenerated: true,
    distance: result.distance,
    time: result.time,
  };
}

/**
 * Batch-compute paths between all start×end combinations.
 * Builds graph only once for efficiency.
 */
export function computeAllPaths(
  startObjects: TopisObject[],
  endObjects: TopisObject[],
  gaenge: Gang[],
  ffz?: FFZ,
  walls: TopisObject[] = [],
  pathAreas: { x?: number; y?: number; width?: number; height?: number }[] = [],
): { start: TopisObject; end: TopisObject; result: PathResult | null }[] {
  const graph = buildGangGraph(gaenge, ffz);
  const results: { start: TopisObject; end: TopisObject; result: PathResult | null }[] = [];

  for (const start of startObjects) {
    for (const end of endObjects) {
      if (start.id === end.id) continue;
      const s = anchorPoint(start);
      const e = anchorPoint(end);
      const result = findPath(s.x, s.y, e.x, e.y, graph, ffz, walls, pathAreas);
      results.push({ start, end, result });
    }
  }

  return results;
}

/**
 * Erweitert die Gang-Topologie so, dass die senkrechten (V-)Gänge die
 * waagerechten (H-)Gänge tatsächlich schneiden und bis zu den Tor-Reihen
 * reichen. Notwendig wenn der Layout-Generator V-Gänge nur in der
 * Hallen-Mitte erzeugt und sie nicht bis zum nächsten H-Gang verbindet —
 * dann ist der Graph disconnected und A* findet keinen Pfad zwischen
 * Nord- und Süd-Toren.
 *
 * Vorgehen:
 * - V-Gänge: beide Endpunkte ggf. so verschieben, dass sie y=yMin / y=yMax
 *   (z.B. Tor-Reihen-Y) erreichen, oder mindestens den nächsten H-Gang
 *   überschneiden.
 * - H-Gänge analog mit x-Achse.
 * Edges die durch Wände gehen werden in A* ohnehin gefiltert — wir können
 * also pauschal verlängern.
 */
/**
 * Erzeugt fehlende Tor-Anbindungs-Gänge entlang der Tor-Reihen. In einer
 * Logistikhalle gibt es immer einen Fahrweg direkt vor den Toren — wenn
 * der Layout-Generator diesen vergisst, sind die Tore nicht über die
 * Gang-Topologie erreichbar.
 *
 * Anbindungs-Gang wird OFFSET m IN die Halle gesetzt (also unter Nord-Tore
 * und über Süd-Tore), damit der Stapler vom Tor erst die kurze Anbindung
 * fährt und dann auf den Hauptgang einschwenkt.
 */
export function generateTorAnbindungsGaenge(
  objects: TopisObject[],
  hallWidth: number,
  hallHeight: number,
  startId: number,
  offsetM: number = 2,
  breite: number = 4,
): Gang[] {
  const out: Gang[] = [];
  const tore = objects.filter((o) => o.type === 'tor');
  const sides: Array<'north' | 'south' | 'east' | 'west'> = ['north', 'south', 'east', 'west'];
  for (const side of sides) {
    const reihe = tore.filter((t) => t.side === side);
    if (reihe.length < 3) continue;
    if (side === 'north' || side === 'south') {
      const ys = reihe.map((t) => (side === 'north' ? t.y + t.height : t.y));
      const avg = ys.reduce((a, b) => a + b, 0) / ys.length;
      const y = side === 'north' ? avg + offsetM : avg - offsetM;
      if (y < 0 || y > hallHeight) continue;
      out.push({
        id: startId + out.length,
        name: `Tor-Anbindung ${side === 'north' ? 'Nord' : 'Süd'}`,
        points: [{ x: 0, y }, { x: hallWidth, y }],
        breite,
      } as Gang);
    } else {
      const xs = reihe.map((t) => (side === 'west' ? t.x + t.width : t.x));
      const avg = xs.reduce((a, b) => a + b, 0) / xs.length;
      const x = side === 'west' ? avg + offsetM : avg - offsetM;
      if (x < 0 || x > hallWidth) continue;
      out.push({
        id: startId + out.length,
        name: `Tor-Anbindung ${side === 'east' ? 'Ost' : 'West'}`,
        points: [{ x, y: 0 }, { x, y: hallHeight }],
        breite,
      } as Gang);
    }
  }
  return out;
}

/**
 * Erzeugt ein zusammenhängendes Basis-Gangnetz aus Halle + Toren:
 * je Wand (mit ≥3 Toren) eine Tor-Anbindung, plus Quer-/Längsgänge, damit
 * gegenüberliegende Wände verbunden sind — dann per connectGangsToBounds
 * verschweißt. Ergebnis ist A*-tauglich (Tore hängen sich an den nächsten Gang).
 * Genutzt vom KI-Textbuilder und beim Laden der Beispiel-Aufträge.
 */
export function generateBasicGangNet(
  objects: TopisObject[],
  hallWidth: number,
  hallHeight: number,
  startId: number = 1,
  centralAisleWidth: number = 4,
): Gang[] {
  const tore = objects.filter((o) => o.type === 'tor');
  if (tore.length < 2) return [];
  const anbindungen = generateTorAnbindungsGaenge(tore, hallWidth, hallHeight, startId);
  const connectors: Gang[] = [];
  let id = startId + anbindungen.length;
  const hasNS = tore.some((t) => t.side === 'north' || t.side === 'south');
  const hasEW = tore.some((t) => t.side === 'east' || t.side === 'west');
  // Vertikale Quergänge verbinden Nord- und Süd-Anbindung.
  if (hasNS) {
    for (const f of [0.2, 0.5, 0.8]) {
      const x = Math.round(hallWidth * f * 100) / 100;
      connectors.push({ id: id++, name: `Quergang ${Math.round(f * 100)}%`, points: [{ x, y: 0 }, { x, y: hallHeight }], breite: 4 } as Gang);
    }
  }
  // Zentraler Längsgang (immer) — Hauptzirkulation; die Innenraum-Buchten lassen genau
  // diese Zone frei (kreuzungsfrei, siehe interiorCells in nl-layout.ts).
  {
    const y = Math.round(hallHeight * 0.5 * 100) / 100;
    connectors.push({ id: id++, name: 'Längsgang Mitte', points: [{ x: 0, y }, { x: hallWidth, y }], breite: centralAisleWidth } as Gang);
  }
  void hasEW;
  return connectGangsToBounds([...anbindungen, ...connectors], 0, hallHeight, 0, hallWidth);
}

export function connectGangsToBounds(
  gaenge: Gang[],
  _yMin: number,
  _yMax: number,
  _xMin: number,
  _xMax: number,
  maxTolerance: number = 15,
): Gang[] {
  type Cls = { gang: Gang; horizontal: boolean; axis: number; lo: number; hi: number };
  const buildCls = (input: Gang[]): Cls[] => input.map((g) => {
    const pts = g.points || [];
    if (pts.length < 2) return { gang: g, horizontal: true, axis: 0, lo: 0, hi: 0 };
    const a = pts[0];
    const b = pts[pts.length - 1];
    const horizontal = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
    if (horizontal) {
      return { gang: g, horizontal: true, axis: (a.y + b.y) / 2, lo: Math.min(a.x, b.x), hi: Math.max(a.x, b.x) };
    }
    return { gang: g, horizontal: false, axis: (a.x + b.x) / 2, lo: Math.min(a.y, b.y), hi: Math.max(a.y, b.y) };
  });

  // Iterativ schliessen: starte mit kleiner Toleranz, weiter mit groesserer, bis maxTolerance.
  let current: Gang[] = gaenge;
  for (const tol of [4, 8, 12, maxTolerance]) {
    const cls = buildCls(current);
    const next = cls.map((c) => {
      if (!c.gang.points || c.gang.points.length < 2) return c.gang;
      let newLo = c.lo;
      let newHi = c.hi;
      for (const o of cls) {
        if (o.horizontal === c.horizontal) continue;
        if (o.lo - 0.5 > c.axis || o.hi + 0.5 < c.axis) continue;
        if (o.axis < newLo && newLo - o.axis <= tol) newLo = o.axis;
        if (o.axis > newHi && o.axis - newHi <= tol) newHi = o.axis;
      }
      if (newLo === c.lo && newHi === c.hi) return c.gang;
      const pts = c.horizontal
        ? [{ x: newLo, y: c.axis }, { x: newHi, y: c.axis }]
        : [{ x: c.axis, y: newLo }, { x: c.axis, y: newHi }];
      return { ...c.gang, points: pts };
    });
    current = next;
  }
  return current;
}
