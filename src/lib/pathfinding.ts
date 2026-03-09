import { Gang, TopisObject, FFZ } from '@/types/topis';

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

  // Create edges within each corridor
  passableGaenge.forEach(gang => {
    for (let i = 0; i < gang.points.length - 1; i++) {
      const p1 = gang.points[i];
      const p2 = gang.points[i + 1];

      const node1 = nodes.find(n =>
        Math.abs(n.x - p1.x) < 0.5 && Math.abs(n.y - p1.y) < 0.5
      );
      const node2 = nodes.find(n =>
        Math.abs(n.x - p2.x) < 0.5 && Math.abs(n.y - p2.y) < 0.5
      );

      if (node1 && node2) {
        const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        edges.push({ from: node1.id, to: node2.id, distance, gangId: gang.id });
        edges.push({ from: node2.id, to: node1.id, distance, gangId: gang.id });
      }
    }
  });

  // Find intersections between corridors and add connections
  for (let i = 0; i < passableGaenge.length; i++) {
    for (let j = i + 1; j < passableGaenge.length; j++) {
      const intersections = findGangIntersections(passableGaenge[i], passableGaenge[j]);

      intersections.forEach(intersection => {
        // Add intersection as a node if not exists
        let intersectionNode = nodes.find(n =>
          Math.abs(n.x - intersection.x) < 0.5 && Math.abs(n.y - intersection.y) < 0.5
        );

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
 * A* Pathfinding algorithm
 */
export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  graph: Graph,
  ffz?: FFZ
): PathResult | null {
  if (graph.nodes.length === 0) return null;

  // Find nearest nodes to start and end points
  const startNode = findNearestNode(startX, startY, graph);
  const endNode = findNearestNode(endX, endY, graph);

  if (!startNode || !endNode) return null;

  // A* implementation
  const openSet = new Set<number>([startNode.id]);
  const cameFrom = new Map<number, number>();

  const gScore = new Map<number, number>();
  gScore.set(startNode.id, 0);

  const fScore = new Map<number, number>();
  fScore.set(startNode.id, heuristic(startNode, endNode));

  const gangUsage = new Map<number, Set<number>>();
  gangUsage.set(startNode.id, new Set<number>([startNode.gangId]));

  while (openSet.size > 0) {
    // Get node with lowest fScore
    let current = -1;
    let lowestF = Infinity;
    openSet.forEach(nodeId => {
      const f = fScore.get(nodeId) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        current = nodeId;
      }
    });

    if (current === endNode.id) {
      // Reconstruct path
      const path = reconstructPath(cameFrom, current, graph.nodes);
      const usedGangs = Array.from(gangUsage.get(current) || new Set<number>());
      const distance = gScore.get(current) || 0;

      // Calculate time based on FFZ speed
      const speed = ffz?.geschwindigkeit || 10; // km/h
      const speedMs = speed * 1000 / 3600; // m/s
      const time = distance / speedMs;

      return { path, distance, time, usedGangs };
    }

    openSet.delete(current);

    // Get neighbors
    const neighbors = graph.edges
      .filter(e => e.from === current)
      .map(e => ({ nodeId: e.to, distance: e.distance, gangId: e.gangId }));

    neighbors.forEach(({ nodeId, distance, gangId }) => {
      const tentativeG = (gScore.get(current) ?? Infinity) + distance;

      if (tentativeG < (gScore.get(nodeId) ?? Infinity)) {
        cameFrom.set(nodeId, current);
        gScore.set(nodeId, tentativeG);

        const node = graph.nodes.find(n => n.id === nodeId);
        if (node) {
          fScore.set(nodeId, tentativeG + heuristic(node, endNode));
        }

        // Track used corridors
        const currentGangs = gangUsage.get(current) || new Set<number>();
        const newGangs = new Set<number>(currentGangs);
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
 * Calculate optimal path between two objects
 */
export function findPathBetweenObjects(
  obj1: TopisObject,
  obj2: TopisObject,
  gaenge: Gang[],
  ffz?: FFZ
): PathResult | null {
  const graph = buildGangGraph(gaenge, ffz);

  // Use center points of objects
  const start = { x: obj1.x + obj1.width / 2, y: obj1.y + obj1.height / 2 };
  const end = { x: obj2.x + obj2.width / 2, y: obj2.y + obj2.height / 2 };

  return findPath(start.x, start.y, end.x, end.y, graph, ffz);
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
