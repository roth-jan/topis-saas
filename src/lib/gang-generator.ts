import { Gang, TopisObject, Hall } from '@/types/topis';

export interface GangSettings {
  hauptgangBreite: number; // Default 3.5m
  regalgangBreite: number; // Default 2.5m
  generateHauptweg: boolean;
  generateZufahrten: boolean;
  generateRegalgaenge: boolean;
}

export const DEFAULT_GANG_SETTINGS: GangSettings = {
  hauptgangBreite: 3.5,
  regalgangBreite: 2.5,
  generateHauptweg: true,
  generateZufahrten: true,
  generateRegalgaenge: true,
};

let gangIdCounter = 1;

/**
 * Generate a unique ID for a Gang
 */
function nextGangId(): number {
  return gangIdCounter++;
}

/**
 * Reset the gang ID counter (useful when loading a project)
 */
export function resetGangIdCounter(maxId: number = 0): void {
  gangIdCounter = maxId + 1;
}

/**
 * Cluster objects by their Y position
 */
function clusterByY(objects: TopisObject[], threshold: number = 5): TopisObject[][] {
  if (objects.length === 0) return [];

  const sorted = [...objects].sort((a, b) => a.y - b.y);
  const clusters: TopisObject[][] = [];
  let currentCluster: TopisObject[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevY = sorted[i - 1].y;
    const currY = sorted[i].y;

    if (Math.abs(currY - prevY) <= threshold) {
      currentCluster.push(sorted[i]);
    } else {
      clusters.push(currentCluster);
      currentCluster = [sorted[i]];
    }
  }
  clusters.push(currentCluster);

  return clusters;
}

/**
 * Generate corridors automatically based on hall layout and objects
 */
export function generateGaenge(
  hall: Hall,
  objects: TopisObject[],
  settings: GangSettings = DEFAULT_GANG_SETTINGS
): Gang[] {
  if (objects.length === 0) {
    return [];
  }

  const neueGaenge: Gang[] = [];
  const { hauptgangBreite, regalgangBreite } = settings;
  const hallBreite = hall.width;
  const hallHoehe = hall.height;
  const mitteY = hallHoehe / 2;

  // Collect objects by type
  const tore = objects.filter(o => o.type === 'tor');
  const stellplaetze = objects.filter(o => o.type === 'stellplatz');
  const regale = objects.filter(o => o.type === 'regal');
  const bereiche = objects.filter(o => o.type === 'bereich');

  // ============================================
  // 1. HAUPTVERKEHRSWEG durch die Mitte der Halle
  // ============================================
  if (settings.generateHauptweg) {
    neueGaenge.push({
      id: nextGangId(),
      name: 'Hauptweg Mitte',
      points: [
        { x: 3, y: mitteY },
        { x: hallBreite - 3, y: mitteY }
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
    const toreNord = tore.filter(t => (t.y + t.height / 2) < mitteY);
    const torClustersNord = clusterByY(toreNord, 10);

    torClustersNord.forEach((cluster, idx) => {
      const clusterMitteX = cluster.reduce((sum, t) => sum + t.x + t.width / 2, 0) / cluster.length;
      const startY = Math.min(...cluster.map(t => t.y + t.height)) + 2;

      neueGaenge.push({
        id: nextGangId(),
        name: `Zufahrt Nord ${idx + 1}`,
        points: [
          { x: clusterMitteX, y: startY },
          { x: clusterMitteX, y: mitteY }
        ],
        breite: hauptgangBreite,
        typ: 'hauptgang',
        istHauptgang: true,
        farbe: 'rgba(80, 180, 80, 0.35)'
      });
    });

    // Südseite Tore (y >= mitteY)
    const toreSued = tore.filter(t => (t.y + t.height / 2) >= mitteY);
    const torClustersSued = clusterByY(toreSued, 10);

    torClustersSued.forEach((cluster, idx) => {
      const clusterMitteX = cluster.reduce((sum, t) => sum + t.x + t.width / 2, 0) / cluster.length;
      const startY = Math.max(...cluster.map(t => t.y)) - 2;

      neueGaenge.push({
        id: nextGangId(),
        name: `Zufahrt Süd ${idx + 1}`,
        points: [
          { x: clusterMitteX, y: mitteY },
          { x: clusterMitteX, y: startY }
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

    regalClusters.forEach((cluster, idx) => {
      if (cluster.length > 0) {
        const minX = Math.min(...cluster.map(r => r.x));
        const maxX = Math.max(...cluster.map(r => r.x + r.width));
        const gangY = cluster[0].y + cluster[0].height + regalgangBreite / 2;

        // Nur wenn Gang zwischen Regalreihen Sinn macht
        if (gangY < hallHoehe - 5) {
          neueGaenge.push({
            id: nextGangId(),
            name: `Regalgang ${idx + 1}`,
            points: [
              { x: minX - 2, y: gangY },
              { x: maxX + 2, y: gangY }
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
    const allRegalX = regale.flatMap(r => [r.x, r.x + r.width]);
    const allRegalY = regale.flatMap(r => [r.y, r.y + r.height]);
    const minRegalX = Math.min(...allRegalX);
    const maxRegalX = Math.max(...allRegalX);
    const minRegalY = Math.min(...allRegalY);
    const maxRegalY = Math.max(...allRegalY);

    // Linker Regalzugang
    neueGaenge.push({
      id: nextGangId(),
      name: 'Regalzugang West',
      points: [
        { x: minRegalX - 2, y: minRegalY - 2 },
        { x: minRegalX - 2, y: maxRegalY + 2 }
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
        { x: maxRegalX + 2, y: minRegalY - 2 },
        { x: maxRegalX + 2, y: maxRegalY + 2 }
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
          { x: minRegalX - 2, y: regalMitteY },
          { x: minRegalX - 2, y: mitteY }
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
    bereiche.forEach(bereich => {
      const bereichMitteX = bereich.x + bereich.width / 2;
      const bereichMitteY = bereich.y + bereich.height / 2;

      // Zufahrt zum Hauptweg
      neueGaenge.push({
        id: nextGangId(),
        name: `Zufahrt ${bereich.name}`,
        points: [
          { x: bereichMitteX, y: bereichMitteY > mitteY ? bereich.y : bereich.y + bereich.height },
          { x: bereichMitteX, y: mitteY }
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

/**
 * Create a single Gang manually
 */
export function createGang(
  name: string,
  points: { x: number; y: number }[],
  breite: number = 3.5,
  typ: 'hauptgang' | 'quergang' | 'regalgang' = 'hauptgang'
): Gang {
  const farben: Record<string, string> = {
    hauptgang: 'rgba(50, 150, 50, 0.4)',
    quergang: 'rgba(80, 180, 80, 0.35)',
    regalgang: 'rgba(200, 180, 100, 0.3)',
  };

  return {
    id: nextGangId(),
    name,
    points,
    breite,
    typ,
    istHauptgang: typ === 'hauptgang',
    farbe: farben[typ] || farben.hauptgang,
  };
}

/**
 * Calculate the total length of all corridors
 */
export function calculateTotalGangLength(gaenge: Gang[]): number {
  return gaenge.reduce((total, gang) => {
    let length = 0;
    for (let i = 0; i < gang.points.length - 1; i++) {
      const p1 = gang.points[i];
      const p2 = gang.points[i + 1];
      length += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    return total + length;
  }, 0);
}

/**
 * Calculate area covered by corridors
 */
export function calculateGangArea(gaenge: Gang[]): number {
  return gaenge.reduce((total, gang) => {
    let length = 0;
    for (let i = 0; i < gang.points.length - 1; i++) {
      const p1 = gang.points[i];
      const p2 = gang.points[i + 1];
      length += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }
    return total + length * gang.breite;
  }, 0);
}
