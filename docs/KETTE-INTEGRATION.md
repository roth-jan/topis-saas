# Ketten-Integration in HallCanvas (Lastenheft 3.1.5)

Dieses Dokument beschreibt, wie der Unterflur-Ketten-Wegbereich
(`KettenWegbereich`) im Canvas-Render und in der Hit-Detection eingebunden
wird. Geometrie und Store-Actions sind bereits gebaut, die Canvas-Integration
muss manuell vorgenommen werden.

## Was ist schon da

- **Typ:** `KettenWegbereich` in `src/types/topis.ts` (Lastenheft 3.1.5)
- **State:** `kettenWegbereiche`, `kettenWegbereichIdCounter`, `selectedKette` in `TopisState`
- **Persistenz:** beide Felder in `partialize` von `useTopisStore` (kein zusätzlicher Code nötig)
- **Geometrie-Lib:** `src/lib/kette-geometry.ts`
  - `kettenPolygon(k)` — geschlossenes Außen-Polygon als `{x, y}[]`
  - `kettenPfeilPositionen(k, intervall)` — `[{ pos, richtung }]`
  - `pointInKette(px, py, k)` — Boolean Hit-Test
  - `verbietetNutzflaeche(obj, ketten)` — Lastenheft-Constraint (nur Nutzflächen, nicht Tore/Wege)
  - `kettenLaenge(k)` — Gesamt-Strecke in m
- **Reine Action-Helfer:** `src/lib/kette-store-actions.ts`
  - `addKette(name, breite, fliessrichtung)` — erzeugt `Omit<KettenWegbereich, 'id'>`
  - `addPunktToKette(k, punkt)`, `moveStuetzpunkt`, `removeStuetzpunkt`, `setBreite`, `setFliessrichtung`
- **Store-Actions:** `addKette`, `updateKette`, `deleteKette`, `selectKette`, `addPunktToActiveKette`
- **Hook:** `useKettenWegbereiche()`, `useSelectedKette()`
- **Dialog:** `src/components/dialogs/KettenDialog.tsx`
- **Tool-Type:** `'kette'` bereits im `Tool`-Union enthalten

## Was im HallCanvas noch fehlt

### 1. Render-Phase (Z-Order)

Der Ketten-Wegbereich gehört in die Render-Reihenfolge:

```
1. Halle (Hintergrund)
2. Gänge
3. PathAreas
4. Conveyor-Linien
5. >>> Kettenbereiche (NEU — vor den Objekten, damit Tore obendrauf liegen)
6. Objekte (Tore, Stellplätze, Regale)
7. Heatmap-Overlay
8. Pfade
9. >>> Ketten-Pfeile (NEU — über Objekten, damit Pfeile sichtbar sind)
10. Selection-Highlight
```

**Begründung:** Lastenheft erlaubt Überlappung mit normalen Wegen → Kette wird
gezeichnet, normale Wege liegen oben drüber. Nutzflächen liegen nie in der Kette
(durch `verbietetNutzflaeche`-Validierung verhindert), Tore dürfen aber an die
Kette angrenzen. Pfeile gehören oben drauf, weil sie die wichtigste Information
über die Fließrichtung tragen.

### 2. Kontur-Render (Schritt 5)

```ts
import { kettenPolygon } from '@/lib/kette-geometry';

for (const k of kettenWegbereiche) {
  const poly = kettenPolygon(k);
  if (poly.length < 3) continue;

  ctx.save();
  // Füllung: halbtransparent (Lastenheft erlaubt Überlappung mit Wegen)
  ctx.fillStyle = (k.farbe ?? '#06b6d4') + '40'; // 25% Alpha
  ctx.strokeStyle = k.farbe ?? '#06b6d4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const p0 = worldToScreen(poly[0].x, poly[0].y);
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < poly.length; i++) {
    const p = worldToScreen(poly[i].x, poly[i].y);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Selektions-Highlight
  if (selectedKette?.id === k.id) {
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.stroke();
  }
  ctx.restore();
}
```

### 3. Pfeil-Render (Schritt 9)

```ts
import { kettenPfeilPositionen } from '@/lib/kette-geometry';

// Pfeil-Intervall = max(5m, breite × 2.5) — skaliert mit Ketten-Breite
const PFEIL_GROESSE_M = 1.5;

for (const k of kettenWegbereiche) {
  const intervall = Math.max(5, k.breite * 2.5);
  const pfeile = kettenPfeilPositionen(k, intervall);
  ctx.save();
  ctx.fillStyle = k.farbe ?? '#06b6d4';
  for (const { pos, richtung } of pfeile) {
    const s = worldToScreen(pos.x, pos.y);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(richtung);
    const halb = (PFEIL_GROESSE_M / 2) * SCALE * zoom;
    ctx.beginPath();
    ctx.moveTo(halb, 0);
    ctx.lineTo(-halb, halb * 0.6);
    ctx.lineTo(-halb, -halb * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
```

### 4. Hit-Detection (Klick im Select-Mode)

```ts
import { pointInKette } from '@/lib/kette-geometry';

// In handleCanvasClick, NACHDEM Objekte/Pfade/Gänge geprüft sind (geringere Priorität):
if (currentTool === 'select') {
  for (const k of kettenWegbereiche) {
    if (pointInKette(worldX, worldY, k)) {
      selectKette(k);
      return;
    }
  }
}
```

### 5. Tool-Flow `'kette'` (Stützpunkte setzen)

Beim Tool `'kette'` werden Klicks im Canvas als Stützpunkte auf die aktive Kette gesetzt:

```ts
if (currentTool === 'kette') {
  const aktive = useTopisStore.getState().selectedKette;
  if (!aktive) {
    // Wenn keine Kette aktiv: neue anlegen und auswählen
    const draft = addKetteHelper('Kette ' + (kettenWegbereiche.length + 1), 2, 'vorwaerts');
    const erzeugt = addKette(draft);
    selectKette(erzeugt);
    addPunktToActiveKette({ x: worldX, y: worldY });
  } else {
    addPunktToActiveKette({ x: worldX, y: worldY });
  }
  return;
}
```

**Beenden des Zeichnens:**
- ESC: `setTool('select')`
- Doppelklick: `setTool('select')`
- Tool-Wechsel über Toolbar: implizit

### 6. Stützpunkt-Marker (während Tool aktiv)

Wenn `currentTool === 'kette'` und eine Kette aktiv ist, zusätzlich kleine Kreise
an jedem Stützpunkt zeichnen, damit der User sieht wo er schon geklickt hat. Der
zuletzt gesetzte Punkt sollte hervorgehoben sein (gefüllt). Dies geschieht in
einer separaten Schicht oberhalb der Pfeile.

### 7. Validierungs-Hook (verbietetNutzflaeche)

Bei `addObject` und `updateObject` für Stellplatz/Regal/Bereich-Typen sollte
`verbietetNutzflaeche` aufgerufen und der Move/Insert abgelehnt oder mit einer
Warnung visualisiert werden (rotes Highlight). Lastenheft 3.1.5: „Nutzflächen
dürfen nicht im Kettenbereich liegen."

Dieser Hook liegt NICHT im Canvas, sondern im Store oder im
PropertiesPanel-Drop-Handler. Empfehlung: in `updateObject` als weiche Warnung
via `console.warn` + Toast, NICHT als harter Reject — sonst kann der User nicht
korrigieren.

## Performance-Hinweise

- `sampleMidline` hat 12 Steps pro Segment. Bei 5 Ketten à 4 Segmenten = 240 Samples.
  Vernachlässigbar.
- `kettenPolygon` und `kettenPfeilPositionen` rufen `sampleMidline` jeweils auf.
  Bei Bedarf einmal pro Frame cachen (z.B. via useMemo auf den Kette-Array).
- `pointInKette` ist O(n*Samples). Für Hit-Detection bei jedem Mausklick OK, für
  jeden Frame nicht nötig.

## Tests

`src/lib/kette-geometry.test.ts` deckt die reinen Geometrie-Funktionen ab.
Canvas-Render-Tests (Pixel-Vergleich) sind nicht vorgesehen — die Render-Logik
ist trivial-deterministisch über die Geometrie-Lib.
