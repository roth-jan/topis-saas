'use client';

import { useRef, useEffect } from 'react';
import type { AbteilungDefinition } from '@/types/prozessmodell';

interface BenchmarkRadarProps {
  /** Aktuelle Werte pro Abteilung (key = abteilung id) */
  aktuell: Record<string, number>;
  /** Benchmark (bester Wert) pro Abteilung */
  benchmark: Record<string, number>;
  /** Abteilungs-Definitionen für Labels und Achsen */
  abteilungen: AbteilungDefinition[];
  width?: number;
  height?: number;
}

/**
 * Radar/Spider-Chart: Aktuelle Halle vs. Benchmark (Canvas 2D).
 * Achsen werden dynamisch aus den übergebenen Abteilungen generiert.
 */
export function BenchmarkRadar({ aktuell, benchmark, abteilungen, width = 300, height = 250 }: BenchmarkRadarProps) {
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

    const n = abteilungen.length;
    if (n === 0) return;

    const cx = width / 2;
    const cy = height / 2 + 5;
    const radius = Math.min(width, height) / 2 - 40;

    // Max value for normalization
    const maxVal = Math.max(
      ...abteilungen.map((a) => Math.max(aktuell[a.id] || 0, benchmark[a.id] || 0)),
      0.01
    );

    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2; // Start from top

    // Grid circles
    for (let level = 1; level <= 4; level++) {
      const r = (radius * level) / 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Axis lines + labels
    abteilungen.forEach((abt, i) => {
      const angle = startAngle + i * angleStep;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Label
      const labelR = radius + 18;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;
      ctx.fillStyle = '#aaa';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(abt.label, lx, ly);
    });

    // Draw polygon helper
    const drawPolygon = (values: Record<string, number>, color: string, fill: boolean) => {
      ctx.beginPath();
      abteilungen.forEach((abt, i) => {
        const angle = startAngle + i * angleStep;
        const val = (values[abt.id] || 0) / maxVal;
        const r = val * radius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      if (fill) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dots
      abteilungen.forEach((abt, i) => {
        const angle = startAngle + i * angleStep;
        const val = (values[abt.id] || 0) / maxVal;
        const r = val * radius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
    };

    // Benchmark (green dashed)
    drawPolygon(benchmark, '#22c55e', true);
    // Aktuell (primary color)
    drawPolygon(aktuell, '#3b82f6', true);

    // Legend
    const legendY = height - 12;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';

    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(10, legendY - 6, 10, 8);
    ctx.fillStyle = '#888';
    ctx.fillText('Aktuell', 24, legendY + 1);

    ctx.fillStyle = '#22c55e';
    ctx.fillRect(80, legendY - 6, 10, 8);
    ctx.fillStyle = '#888';
    ctx.fillText('Benchmark', 94, legendY + 1);
  }, [aktuell, benchmark, abteilungen, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded border bg-background"
    />
  );
}
