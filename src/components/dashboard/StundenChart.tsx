'use client';

import { useRef, useEffect } from 'react';

interface StundenChartProps {
  data: { stunde: number; soll: number; ist: number; colli: number }[];
  width?: number;
  height?: number;
}

/**
 * Stündliches IST-SOLL Bar Chart (Canvas 2D, kein Chart-Library).
 */
export function StundenChart({ data, width = 500, height = 220 }: StundenChartProps) {
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
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Keine Daten', width / 2, height / 2);
      return;
    }

    const padding = { top: 20, right: 15, bottom: 30, left: 40 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map((d) => Math.max(d.soll, d.ist)), 1);
    const barWidth = chartW / data.length;
    const barGap = 2;

    // Y-axis
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Grid lines + Y-axis labels
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH * i) / 4;
      const val = maxVal * (1 - i / 4);
      ctx.fillText(val.toFixed(0), padding.left - 4, y + 3);

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Bars
    data.forEach((d, i) => {
      const x = padding.left + i * barWidth;
      const halfBar = (barWidth - barGap * 2) / 2;

      // SOLL bar (left, blue)
      const sollH = (d.soll / maxVal) * chartH;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
      ctx.fillRect(x + barGap, padding.top + chartH - sollH, halfBar, sollH);

      // IST bar (right, colored by status)
      if (d.ist > 0) {
        const istH = (d.ist / maxVal) * chartH;
        const delta = d.ist - d.soll;
        ctx.fillStyle =
          delta > 0.5
            ? 'rgba(234, 179, 8, 0.6)' // Yellow (over)
            : delta < -0.5
            ? 'rgba(239, 68, 68, 0.6)' // Red (under)
            : 'rgba(34, 197, 94, 0.6)'; // Green (good)
        ctx.fillRect(x + barGap + halfBar, padding.top + chartH - istH, halfBar, istH);
      }

      // X-axis label
      ctx.fillStyle = '#888';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.stunde}`, x + barWidth / 2, height - padding.bottom + 12);
    });

    // Legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    const legendY = 10;

    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.fillRect(padding.left + 5, legendY - 6, 10, 8);
    ctx.fillStyle = '#888';
    ctx.fillText('SOLL', padding.left + 18, legendY + 1);

    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.fillRect(padding.left + 55, legendY - 6, 10, 8);
    ctx.fillStyle = '#888';
    ctx.fillText('IST', padding.left + 68, legendY + 1);
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded border bg-background"
    />
  );
}
