'use client';

import { useRef, useEffect } from 'react';
import type { AbteilungsErgebnis } from '@/types/prozessmodell';

interface AbteilungsChartProps {
  abteilungen: AbteilungsErgebnis[];
  width?: number;
  height?: number;
}

/**
 * Horizontales Balkendiagramm der Abteilungs-Anteile (Canvas 2D).
 * Labels und Farben kommen aus dem AbteilungsErgebnis (dynamisch).
 */
export function AbteilungsChart({ abteilungen, width = 400, height = 200 }: AbteilungsChartProps) {
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

    ctx.clearRect(0, 0, width, height);

    if (abteilungen.length === 0) return;

    const padding = { top: 15, right: 80, bottom: 10, left: 70 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = Math.max(...abteilungen.map((a) => a.minProColli), 0.01);
    const barH = Math.min(30, chartH / abteilungen.length - 8);

    abteilungen.forEach((abt, i) => {
      const y = padding.top + i * (chartH / abteilungen.length) + (chartH / abteilungen.length - barH) / 2;
      const barW = (abt.minProColli / maxVal) * chartW;

      // Label
      ctx.fillStyle = '#aaa';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(abt.label, padding.left - 8, y + barH / 2 + 4);

      // Bar
      ctx.fillStyle = abt.color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(padding.left, y, barW, barH);
      ctx.globalAlpha = 1;

      // Value
      ctx.fillStyle = '#ddd';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `${abt.minProColli.toFixed(3)} (${Math.round(abt.anteilGesamt * 100)}%)`,
        padding.left + barW + 5,
        y + barH / 2 + 4
      );
    });
  }, [abteilungen, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded border bg-background"
    />
  );
}
