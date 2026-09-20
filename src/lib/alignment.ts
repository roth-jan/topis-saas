// Ausrichtung/Snapping beim Ziehen im Editor (Figma-/Prison-Architect-Gefühl).
// Rastet Kanten/Mitte des gezogenen Objekts an Kanten/Mitten anderer Objekte, an die Wände
// und die Hallenmitte — liefert Führungslinien (Welt-Koordinaten) + Live-Maß (Lücke zum
// nächsten Nachbarn/zur Wand) in Metern. Rein geometrisch, testbar, keine Store-Abhängigkeit.

export interface DragRect { id: number; x: number; y: number; width: number; height: number }

export interface AlignmentResult {
  x: number;
  y: number;
  vx: number[]; // vertikale Führungslinien (Welt-x)
  hy: number[]; // horizontale Führungslinien (Welt-y)
  measures: { x: number; y: number; text: string }[];
}

export function computeAlignment(
  drag: DragRect,
  others: DragRect[],
  hall: { width: number; height: number } | null,
  threshM: number,
): AlignmentResult {
  const rest = others.filter((o) => o.id !== drag.id);

  const snapAxis = (start: number, size: number, targets: number[]) => {
    const anchors: [number, number][] = [[start, 0], [start + size / 2, size / 2], [start + size, size]];
    let best: { d: number; newStart: number; guide: number } | null = null;
    for (const [anchor, off] of anchors) {
      for (const t of targets) {
        const d = Math.abs(anchor - t);
        if (d <= threshM && (!best || d < best.d)) best = { d, newStart: t - off, guide: t };
      }
    }
    return best;
  };

  const xTargets: number[] = [];
  const yTargets: number[] = [];
  for (const o of rest) {
    xTargets.push(o.x, o.x + o.width / 2, o.x + o.width);
    yTargets.push(o.y, o.y + o.height / 2, o.y + o.height);
  }
  if (hall) { xTargets.push(0, hall.width / 2, hall.width); yTargets.push(0, hall.height / 2, hall.height); }

  const bx = snapAxis(drag.x, drag.width, xTargets);
  const by = snapAxis(drag.y, drag.height, yTargets);
  const x = bx ? bx.newStart : drag.x;
  const y = by ? by.newStart : drag.y;

  // Live-Maß: kleinste Kante-zu-Kante-Lücke zum nächsten Nachbarn (mit Achsen-Überlappung),
  // in der finalen (gesnappten) Position — horizontal + vertikal je eine.
  const measures: { x: number; y: number; text: string }[] = [];
  const fmt = (m: number) => `${m.toFixed(2).replace('.', ',')} m`;
  const overlapsY = (o: DragRect) => y < o.y + o.height && y + drag.height > o.y;
  const overlapsX = (o: DragRect) => x < o.x + o.width && x + drag.width > o.x;

  let hGap: { gap: number; atX: number; atY: number } | null = null;
  for (const o of rest) {
    if (!overlapsY(o)) continue;
    const yMid = Math.max(y, o.y) + (Math.min(y + drag.height, o.y + o.height) - Math.max(y, o.y)) / 2;
    if (o.x + o.width <= x) { const g = x - (o.x + o.width); if (!hGap || g < hGap.gap) hGap = { gap: g, atX: x - g / 2, atY: yMid }; }
    else if (o.x >= x + drag.width) { const g = o.x - (x + drag.width); if (!hGap || g < hGap.gap) hGap = { gap: g, atX: x + drag.width + g / 2, atY: yMid }; }
  }
  if (hGap && hGap.gap >= 0.01) measures.push({ x: hGap.atX, y: hGap.atY, text: fmt(hGap.gap) });

  let vGap: { gap: number; atX: number; atY: number } | null = null;
  for (const o of rest) {
    if (!overlapsX(o)) continue;
    const xMid = Math.max(x, o.x) + (Math.min(x + drag.width, o.x + o.width) - Math.max(x, o.x)) / 2;
    if (o.y + o.height <= y) { const g = y - (o.y + o.height); if (!vGap || g < vGap.gap) vGap = { gap: g, atX: xMid, atY: y - g / 2 }; }
    else if (o.y >= y + drag.height) { const g = o.y - (y + drag.height); if (!vGap || g < vGap.gap) vGap = { gap: g, atX: xMid, atY: y + drag.height + g / 2 }; }
  }
  if (vGap && vGap.gap >= 0.01) measures.push({ x: vGap.atX, y: vGap.atY, text: fmt(vGap.gap) });

  return { x, y, vx: bx ? [bx.guide] : [], hy: by ? [by.guide] : [], measures };
}
