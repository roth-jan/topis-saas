'use client';

import { useRef, useEffect } from 'react';
import type { Hall, TopisObject, Gang } from '@/types/topis';
import { SCALE, OBJECT_COLORS } from '@/types/topis';
import type { BetriebsAnalyse, HeatmapConfig } from '@/lib/betriebsdaten-store';
import { getHeatmapColor } from '@/lib/heatmap-utils';

interface HallPreviewProps {
  hall: Hall;
  objects: TopisObject[];
  gaenge: Gang[];
  analyse: BetriebsAnalyse | null;
  heatmapConfig?: HeatmapConfig;
  width?: number;
  height?: number;
  /** Optionale Cockpit-Route — wird als amber Linie über die Halle gezeichnet */
  routeWaypoints?: { x: number; y: number }[];
  routeStartId?: number;
  routeEndId?: number;
}

/**
 * Read-Only Canvas-Vorschau einer Halle.
 * Kein Interaction, Auto-Zoom-to-Fit.
 */
export function HallPreview({
  hall,
  objects,
  gaenge,
  analyse,
  heatmapConfig,
  width = 700,
  height = 400,
  routeWaypoints,
  routeStartId,
  routeEndId,
}: HallPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    if (!hall) return;

    // Auto-Zoom-to-Fit
    const hallPxW = hall.width * SCALE;
    const hallPxH = hall.height * SCALE;
    const padding = 30;
    const scaleX = (width - padding * 2) / hallPxW;
    const scaleY = (height - padding * 2) / hallPxH;
    const zoom = Math.min(scaleX, scaleY, 2);
    const offsetX = (width - hallPxW * zoom) / 2;
    const offsetY = (height - hallPxH * zoom) / 2;

    const worldToScreen = (x: number, y: number) => ({
      x: x * SCALE * zoom + offsetX,
      y: y * SCALE * zoom + offsetY,
    });

    // === Hall Background ===
    const hallTL = worldToScreen(0, 0);
    const hallBR = worldToScreen(hall.width, hall.height);
    ctx.fillStyle = hall.color || '#16213e';
    ctx.fillRect(hallTL.x, hallTL.y, hallBR.x - hallTL.x, hallBR.y - hallTL.y);

    // Hall border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(hallTL.x, hallTL.y, hallBR.x - hallTL.x, hallBR.y - hallTL.y);

    // === Gaenge ===
    for (const gang of gaenge) {
      if (gang.points.length < 2) continue;
      ctx.strokeStyle = gang.istHauptgang ? 'rgba(100, 116, 139, 0.5)' : 'rgba(100, 116, 139, 0.3)';
      ctx.lineWidth = gang.breite * SCALE * zoom * 0.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const p0 = worldToScreen(gang.points[0].x, gang.points[0].y);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < gang.points.length; i++) {
        const p = worldToScreen(gang.points[i].x, gang.points[i].y);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // === Objects ===
    for (const obj of objects) {
      const tl = worldToScreen(obj.x, obj.y);
      const w = obj.width * SCALE * zoom;
      const h = obj.height * SCALE * zoom;
      const color = obj.color || OBJECT_COLORS[obj.type] || '#888';

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(tl.x, tl.y, w, h);
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(tl.x, tl.y, w, h);

      // Label
      const fontSize = Math.max(8, Math.min(11, w / 5));
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = obj.name.length > 12 ? obj.name.slice(0, 11) + '…' : obj.name;
      ctx.fillText(label, tl.x + w / 2, tl.y + h / 2);
    }

    // === Cockpit-Route (vor Heatmap, damit Marker oben drauf liegen) ===
    if (routeWaypoints && routeWaypoints.length >= 2) {
      const a = routeStartId != null ? objects.find((o) => o.id === routeStartId) : null;
      const b = routeEndId != null ? objects.find((o) => o.id === routeEndId) : null;
      const aCx = a ? a.x + a.width / 2 : routeWaypoints[0].x;
      const aCy = a ? a.y + a.height / 2 : routeWaypoints[0].y;
      const bCx = b ? b.x + b.width / 2 : routeWaypoints[routeWaypoints.length - 1].x;
      const bCy = b ? b.y + b.height / 2 : routeWaypoints[routeWaypoints.length - 1].y;
      const first = worldToScreen(routeWaypoints[0].x, routeWaypoints[0].y);
      const last = worldToScreen(routeWaypoints[routeWaypoints.length - 1].x, routeWaypoints[routeWaypoints.length - 1].y);
      const aPx = worldToScreen(aCx, aCy);
      const bPx = worldToScreen(bCx, bCy);

      ctx.save();
      // Anbindung Tor → Gang (gestrichelt)
      ctx.strokeStyle = 'rgba(251,191,36,0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(aPx.x, aPx.y);
      ctx.lineTo(first.x, first.y);
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(bPx.x, bPx.y);
      ctx.stroke();
      // Gang-Pfad (durchgezogen + Glow)
      ctx.setLineDash([]);
      ctx.shadowColor = 'rgba(251,191,36,0.9)';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = 'rgba(251,191,36,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < routeWaypoints.length; i++) {
        const p = worldToScreen(routeWaypoints[i].x, routeWaypoints[i].y);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Start (grün) + Ziel (cyan)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(aPx.x, aPx.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(bPx.x, bPx.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // === Heatmap Overlay ===
    if (heatmapConfig?.aktiv && analyse) {
      const torObjects = objects.filter((o) => o.type === 'tor');
      const maxColli = Math.max(...analyse.objektMetriken.map((m) => m.colli), 1);

      for (const tor of torObjects) {
        const metrik = analyse.objektMetriken.find((m) => m.objectId === tor.id);
        if (!metrik || metrik.colli === 0) continue;

        const intensity = metrik.colli / maxColli;
        const color = getHeatmapColor(intensity, heatmapConfig.farbskala, heatmapConfig.intensitaet);

        const tl = worldToScreen(tor.x, tor.y);
        const w = tor.width * SCALE * zoom;
        const h = tor.height * SCALE * zoom;

        ctx.fillStyle = color;
        ctx.fillRect(tl.x, tl.y, w, h);

        // Colli-Wert anzeigen
        const fontSize = Math.max(7, Math.min(10, w / 5));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          metrik.colli >= 1000 ? `${(metrik.colli / 1000).toFixed(1)}k` : `${Math.round(metrik.colli)}`,
          tl.x + w / 2,
          tl.y + h / 2
        );
      }
    }
  }, [hall, objects, gaenge, analyse, heatmapConfig, width, height, routeWaypoints, routeStartId, routeEndId]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-lg border border-border"
    />
  );
}
