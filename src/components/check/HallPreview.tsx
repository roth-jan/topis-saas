'use client';

import { useRef, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import type { Hall, TopisObject, Gang } from '@/types/topis';
import { SCALE } from '@/types/topis';
import type { BetriebsAnalyse, HeatmapConfig } from '@/lib/betriebsdaten-store';
import { zahl } from '@/lib/format';

interface HallPreviewProps {
  hall: Hall;
  objects: TopisObject[];
  gaenge: Gang[];
  analyse: BetriebsAnalyse | null;
  heatmapConfig?: HeatmapConfig;
  /** Maximale Höhe in px; die Breite folgt immer dem Container. */
  maxHeight?: number;
}

// Farben je Theme. Heatmap = EIN Farbton hell→dunkel (Menge ist eine Größe, kein Ampelstatus).
const PALETTE = {
  light: {
    boden: '#f3eee9', rand: '#cfc6bd', gang: 'rgba(120,110,100,0.28)',
    zoneFill: 'rgba(155,44,44,0.06)', zoneRand: 'rgba(155,44,44,0.30)', zoneText: '#6b625b',
    torLeer: '#e2dbd4', rampe: ['#f3dcd6', '#7a1f1f'] as const, torText: '#ffffff',
  },
  dark: {
    boden: '#2f2a27', rand: '#57504a', gang: 'rgba(214,211,209,0.18)',
    zoneFill: 'rgba(203,70,68,0.10)', zoneRand: 'rgba(203,70,68,0.35)', zoneText: '#bdb6b0',
    torLeer: '#403934', rampe: ['#4a2826', '#ef6b66'] as const, torText: '#ffffff',
  },
};

function mischen(a: string, b: string, t: number): string {
  const h = (x: string) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const [r1, g1, b1] = h(a); const [r2, g2, b2] = h(b);
  const m = (u: number, v: number) => Math.round(u + (v - u) * t);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
}

/**
 * Hallenplan im Kunden-Check: nur lesen, passt sich der Container-Breite an (auch am Handy),
 * folgt Hell/Dunkel. Tore sind nach Colli pro Tag eingefärbt.
 */
export function HallPreview({ hall, objects, gaenge, analyse, heatmapConfig, maxHeight = 460 }: HallPreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [breite, setBreite] = useState(0);
  const { resolvedTheme } = useTheme();
  const farben = resolvedTheme === 'dark' ? PALETTE.dark : PALETTE.light;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBreite(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = breite < 500 ? 10 : 20;
  const hoehe = hall && breite > 0
    ? Math.round(Math.min(maxHeight, Math.max(160, (breite - pad * 2) * (hall.height / hall.width) + pad * 2)))
    : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hall || breite === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = breite * dpr;
    canvas.height = hoehe * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, breite, hoehe);

    const zoom = Math.min((breite - pad * 2) / (hall.width * SCALE), (hoehe - pad * 2) / (hall.height * SCALE));
    const ox = (breite - hall.width * SCALE * zoom) / 2;
    const oy = (hoehe - hall.height * SCALE * zoom) / 2;
    const P = (x: number, y: number) => ({ x: x * SCALE * zoom + ox, y: y * SCALE * zoom + oy });
    const m = SCALE * zoom; // px pro Meter

    // Hallenboden
    const tl = P(0, 0);
    ctx.fillStyle = farben.boden;
    ctx.fillRect(tl.x, tl.y, hall.width * m, hall.height * m);
    ctx.strokeStyle = farben.rand;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tl.x, tl.y, hall.width * m, hall.height * m);

    // Gänge
    ctx.strokeStyle = farben.gang;
    ctx.lineCap = 'round';
    for (const g of gaenge) {
      if (g.points.length < 2) continue;
      ctx.lineWidth = Math.max(2, g.breite * m * 0.5);
      ctx.beginPath();
      g.points.forEach((pt, i) => { const q = P(pt.x, pt.y); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
      ctx.stroke();
    }

    // Bereiche als ruhige Zonen mit Namen
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const o of objects) {
      if (o.type === 'tor') continue;
      const a = P(o.x, o.y); const w = o.width * m; const h = o.height * m;
      ctx.fillStyle = farben.zoneFill;
      ctx.fillRect(a.x, a.y, w, h);
      ctx.strokeStyle = farben.zoneRand;
      ctx.lineWidth = 1;
      ctx.strokeRect(a.x + 0.5, a.y + 0.5, w - 1, h - 1);
      const fs = Math.max(9, Math.min(12, h * 0.35));
      ctx.font = `500 ${fs}px Poppins, system-ui, sans-serif`;
      const label = o.name.length > 14 ? o.name.slice(0, 13) + '…' : o.name;
      if (ctx.measureText(label).width + 6 <= w && fs + 4 <= h) {
        ctx.fillStyle = farben.zoneText;
        ctx.fillText(label, a.x + w / 2, a.y + h / 2);
      }
    }

    // Tore: Farbe nach Colli/Tag (heller = wenig, dunkler = viel)
    const metriken = new Map((analyse?.objektMetriken ?? []).map((mm) => [mm.objectId, mm.colli]));
    const max = Math.max(1, ...metriken.values());
    const heat = heatmapConfig?.aktiv !== false;
    for (const o of objects) {
      if (o.type !== 'tor') continue;
      const a = P(o.x, o.y); const w = Math.max(1, o.width * m - 1); const h = Math.max(2, o.height * m);
      const c = metriken.get(o.id) ?? 0;
      ctx.fillStyle = heat && c > 0 ? mischen(farben.rampe[0], farben.rampe[1], Math.sqrt(c / max)) : farben.torLeer;
      ctx.fillRect(a.x, a.y, w, h);
      // Zahl nur, wenn sie lesbar hineinpasst
      if (heat && c > 0 && w >= 18 && h >= 11) {
        ctx.font = `600 ${Math.min(10, h * 0.8)}px Poppins, system-ui, sans-serif`;
        ctx.fillStyle = c / max > 0.35 ? farben.torText : '#3f3a36';
        ctx.fillText(zahl(c), a.x + w / 2, a.y + h / 2);
      }
    }
  }, [hall, objects, gaenge, analyse, heatmapConfig, breite, hoehe, pad, farben]);

  return (
    <div ref={wrapRef} className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: breite || '100%', height: hoehe || 0 }}
        role="img"
        aria-label={`Hallenplan ${zahl(hall.width)} × ${zahl(hall.height)} m mit ${objects.filter((o) => o.type === 'tor').length} Toren, eingefärbt nach Colli pro Tag`}
      />
    </div>
  );
}
