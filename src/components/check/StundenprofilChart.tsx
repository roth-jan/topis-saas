'use client';

import { useState } from 'react';
import { zahl } from '@/lib/format';

interface Props {
  data: { stunde: number; soll: number; ist: number; colli: number }[];
}

const H = 200; // Zeichenhöhe (viewBox), Breite folgt dem Container
const W = 600;
const PAD = { top: 22, right: 8, bottom: 22, left: 30 };

/**
 * Benötigte Mitarbeiter je Stunde (aus dem Colli-Aufkommen). Eine Reihe → kein Legendenkasten,
 * der Titel benennt sie. Liegen echte IST-Stunden vor, kommt die zweite Reihe samt Legende dazu.
 */
export function StundenprofilChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const stunden = Array.from({ length: 24 }, (_, h) => data.find((d) => d.stunde === h) ?? { stunde: h, soll: 0, ist: 0, colli: 0 });
  const mitIst = stunden.some((d) => d.ist > 0);
  const max = Math.max(1, ...stunden.map((d) => Math.max(d.soll, d.ist)));
  const schritt = max > 20 ? 10 : max > 8 ? 5 : 2;
  const oben = Math.ceil(max / schritt) * schritt;
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;
  const spalte = cw / 24;
  const bw = mitIst ? Math.max(3, (spalte - 4) / 2) : Math.max(4, spalte - 4);
  const y = (v: number) => PAD.top + ch - (v / oben) * ch;
  const spitze = stunden.reduce((a, b) => (b.soll > a.soll ? b : a), stunden[0]);
  const aktiv = hover != null ? stunden[hover] : null;

  return (
    <figure className="relative">
      {mitIst && (
        <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--viz-halle)' }} />Benötigt</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--viz-vergleich)' }} />Eingesetzt</span>
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
        aria-label={`Benötigte Mitarbeiter je Stunde, Spitze ${zahl(spitze.soll, 1)} um ${spitze.stunde} Uhr`}
        onMouseLeave={() => setHover(null)}>
        {Array.from({ length: oben / schritt + 1 }, (_, i) => i * schritt).map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--viz-achse)" strokeWidth={v === 0 ? 1 : 0.6} />
            <text x={PAD.left - 6} y={y(v)} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground" fontSize={10}>{zahl(v)}</text>
          </g>
        ))}
        {stunden.map((d, i) => {
          const x0 = PAD.left + i * spalte + 2;
          const gedimmt = hover != null && hover !== i;
          return (
            <g key={i} opacity={gedimmt ? 0.45 : 1}>
              {d.soll > 0 && (
                <path d={balken(x0, y(d.soll), bw, y(0) - y(d.soll))} fill="var(--viz-halle)" />
              )}
              {mitIst && d.ist > 0 && (
                <path d={balken(x0 + bw + 2, y(d.ist), bw, y(0) - y(d.ist))} fill="var(--viz-vergleich)" />
              )}
              {i % 3 === 0 && (
                <text x={PAD.left + i * spalte + spalte / 2} y={H - 6} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>{i}</text>
              )}
              {/* Trefferfläche größer als der Balken */}
              <rect x={PAD.left + i * spalte} y={PAD.top} width={spalte} height={ch} fill="transparent"
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                aria-label={`${i} bis ${i + 1} Uhr: ${zahl(d.soll, 1)} Mitarbeiter benötigt, ${zahl(d.colli)} Colli`} />
            </g>
          );
        })}
        {/* Einziges Direktlabel: die Spitzenstunde */}
        {hover == null && spitze.soll > 0 && (
          <text x={PAD.left + spitze.stunde * spalte + spalte / 2} y={y(spitze.soll) - 6} textAnchor="middle" className="fill-foreground" fontSize={11} fontWeight={600}>
            {zahl(spitze.soll, 1)}
          </text>
        )}
      </svg>
      {aktiv && (
        <div className="pointer-events-none absolute top-0 right-0 rounded-md border bg-popover px-3 py-2 text-xs shadow-sm">
          <div className="font-medium">{aktiv.stunde}:00–{aktiv.stunde + 1}:00 Uhr</div>
          <div className="text-muted-foreground">{zahl(aktiv.soll, 1)} Mitarbeiter benötigt{mitIst ? ` · ${zahl(aktiv.ist, 1)} eingesetzt` : ''}</div>
          <div className="text-muted-foreground">{zahl(aktiv.colli)} Colli</div>
        </div>
      )}
      <figcaption className="sr-only">
        <table>
          <thead><tr><th>Stunde</th><th>Benötigt</th>{mitIst && <th>Eingesetzt</th>}<th>Colli</th></tr></thead>
          <tbody>{stunden.map((d) => <tr key={d.stunde}><td>{d.stunde}</td><td>{zahl(d.soll, 1)}</td>{mitIst && <td>{zahl(d.ist, 1)}</td>}<td>{zahl(d.colli)}</td></tr>)}</tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/** Balken mit 4-px-Rundung oben, flach an der Grundlinie. */
function balken(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}
