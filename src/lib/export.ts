import { TopisState, Hall, TopisObject, Path, PathArea, Gang, FFZ, Conveyor } from '@/types/topis';

// Project export format
export interface TopisProject {
  version: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
  data: {
    halls: Hall[];
    activeHallId: number;
    objects: TopisObject[];
    paths: Path[];
    pathAreas: PathArea[];
    gaenge: Gang[];
    ffz: FFZ[];
    conveyors: Conveyor[];
  };
  meta: {
    objectCount: number;
    pathCount: number;
    gangCount: number;
  };
}

/**
 * Export the current state as a JSON project file
 */
export function exportToJSON(state: Partial<TopisState>, projectName: string = 'Unbenanntes Projekt'): string {
  const project: TopisProject = {
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
      conveyors: state.conveyors || [],
    },
    meta: {
      objectCount: state.objects?.length || 0,
      pathCount: state.paths?.length || 0,
      gangCount: state.gaenge?.length || 0,
    }
  };

  return JSON.stringify(project, null, 2);
}

/**
 * Import a JSON project file and return the state updates
 */
export function importFromJSON(jsonString: string): Partial<TopisState> | null {
  try {
    const project = JSON.parse(jsonString) as TopisProject;

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
      objectIdCounter: Math.max(...(project.data.objects?.map(o => o.id) || [0])) + 1,
      pathIdCounter: Math.max(...(project.data.paths?.map(p => p.id) || [0])) + 1,
    };
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
}

/**
 * Download a file to the user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open a file dialog and read the selected file
 */
export function openFileDialog(accept: string = '.json,.topis'): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('Keine Datei ausgewählt'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei'));
      };
      reader.readAsText(file);
    };

    input.click();
  });
}

/**
 * Export canvas as PNG image
 */
export function exportCanvasToPNG(canvas: HTMLCanvasElement, filename: string = 'halle.png'): void {
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export canvas as SVG (simplified - creates a basic SVG from canvas data)
 */
export function exportToSVG(
  state: Partial<TopisState>,
  width: number = 1000,
  height: number = 500
): string {
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
  objects.forEach((obj) => {
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

/**
 * Download SVG file
 */
export function downloadSVG(state: Partial<TopisState>, filename: string = 'halle.svg'): void {
  const svg = exportToSVG(state);
  downloadFile(svg, filename, 'image/svg+xml');
}

/**
 * Print layout - opens a print-friendly window
 */
export function printLayout(
  canvas: HTMLCanvasElement,
  hall: Hall,
  objects: TopisObject[]
): void {
  const imgData = canvas.toDataURL('image/png');

  // Count objects by type
  const objCounts: Record<string, number> = {};
  objects.forEach(obj => {
    objCounts[obj.type] = (objCounts[obj.type] || 0) + 1;
  });

  let statsHtml = '<table style="border-collapse: collapse; width: 100%;"><tr><th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Typ</th><th style="border: 1px solid #ccc; padding: 8px; text-align: right;">Anzahl</th></tr>';
  const typeNames: Record<string, string> = {
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

  for (const type in objCounts) {
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

/**
 * Export comparison report as text file
 */
export function exportReport(
  vorher: { objects: TopisObject[]; avgDistanz: number; prozesszeit: number },
  nachher: { objects: TopisObject[]; avgDistanz: number; prozesszeit: number },
  colliProTag: number = 5000
): void {
  const stundenVorher = (colliProTag * vorher.prozesszeit) / 60;
  const stundenNachher = (colliProTag * nachher.prozesszeit) / 60;
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
  - Tore: ${vorher.objects.filter(o => o.type === 'tor').length}
  - Stellplätze: ${vorher.objects.filter(o => o.type === 'stellplatz').length}

NACHHER:
  - Objekte: ${nachher.objects.length}
  - Tore: ${nachher.objects.filter(o => o.type === 'tor').length}
  - Stellplätze: ${nachher.objects.filter(o => o.type === 'stellplatz').length}

---
Generiert mit TOPIS SaaS - Hallenplanungssystem
ROTH Logistikberatung / NT Consult
  `.trim();

  downloadFile(report, `TOPIS-Report-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
}

/**
 * Export distance matrix as CSV
 */
export function exportMatrixCSV(
  results: Array<{ from: string; to: string; dist: number; time: number }>
): void {
  let csv = 'Von;Nach;Distanz (m);Zeit (s)\n';
  results.forEach(r => {
    csv += `${r.from};${r.to};${r.dist.toFixed(1)};${r.time.toFixed(1)}\n`;
  });

  downloadFile(csv, `topis_matrix_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}
