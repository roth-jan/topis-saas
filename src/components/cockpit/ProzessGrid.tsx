'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Search, ListTree, UnfoldVertical, FoldVertical } from 'lucide-react';
import type { ModellBlock, ModellGroesse, ModellSchritt } from '@/lib/prozessmodell-excel-modell';

/**
 * Excel-artiges Grid über ALLE Prozessblöcke: je Block eine auf-/zuklappbare
 * Gruppe, darunter eine Zeile pro Größe (Menge/Parameter) mit direkt
 * editierbarer Wert-Zelle. Tastatur wie im Spreadsheet: ↑/↓ wechselt die
 * Zelle, Enter übernimmt und springt weiter. Jede Änderung rechnet live.
 */
export function ProzessGrid({
  bloecke,
  onEdit,
}: {
  bloecke: ModellBlock[];
  onEdit: (g: ModellGroesse, value: number) => void;
}) {
  const [suche, setSuche] = useState('');
  const [offen, setOffen] = useState<Set<number>>(() => new Set([0]));
  const [schritteOffen, setSchritteOffen] = useState<Set<number>>(new Set());

  const filter = suche.trim().toLowerCase();
  const treffer = useMemo(() => {
    if (!filter) return null;
    // Blöcke mit passenden Größen (oder passendem Blocknamen) + gefilterte Größen
    const map = new Map<number, ModellGroesse[]>();
    bloecke.forEach((b, i) => {
      if (b.name.toLowerCase().includes(filter)) {
        map.set(i, [...b.mengen, ...b.parameter]);
        return;
      }
      const gs = [...b.mengen, ...b.parameter].filter((g) => g.name.toLowerCase().includes(filter));
      if (gs.length) map.set(i, gs);
    });
    return map;
  }, [filter, bloecke]);

  const toggle = (i: number) => {
    setOffen((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });
  };
  const toggleSchritte = (i: number) => {
    setSchritteOffen((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });
  };

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      {/* Kopf: Suche + Auf-/Zuklappen */}
      <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 border-b">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Größe oder Block suchen…"
            className="h-7 pl-7 text-xs"
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setOffen(new Set(bloecke.map((_, i) => i)))}>
            <UnfoldVertical className="h-3.5 w-3.5" />
            Alle auf
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setOffen(new Set())}>
            <FoldVertical className="h-3.5 w-3.5" />
            Alle zu
          </Button>
        </div>
      </div>

      <div className="divide-y">
        {bloecke.map((b, i) => {
          const gefilterte = treffer ? treffer.get(i) : null;
          if (treffer && !gefilterte) return null;
          const istOffen = treffer ? true : offen.has(i);
          const groessen = gefilterte ?? [...b.mengen, ...b.parameter];
          return (
            <div key={i}>
              {/* Block-Kopfzeile */}
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/50 transition-colors"
              >
                {istOffen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="font-medium text-sm truncate flex-1">{b.name}</span>
                <span className="text-[11px] text-muted-foreground hidden md:inline">
                  {b.mengen.length + b.parameter.length} Größen · {b.schritte.length} Schritte
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums w-20 text-right">
                  {b.minProColli.toFixed(4)}
                </span>
                <span className="text-[10px] text-muted-foreground w-14">Min/Colli</span>
              </button>

              {istOffen && (
                <div className="border-t bg-background/50">
                  <table className="w-full text-xs">
                    <tbody>
                      {groessen.map((g) => (
                        <GroesseZeile key={g.row} groesse={g} onEdit={onEdit} />
                      ))}
                    </tbody>
                  </table>
                  {/* Schritte (read-only) einblendbar */}
                  <button
                    onClick={() => toggleSchritte(i)}
                    className="w-full flex items-center gap-1.5 px-9 py-1.5 text-[11px] text-muted-foreground hover:text-foreground border-t transition-colors"
                  >
                    <ListTree className="h-3 w-3" />
                    {schritteOffen.has(i) ? 'Prozessschritte ausblenden' : `Prozessschritte anzeigen (${b.schritte.length})`}
                  </button>
                  {schritteOffen.has(i) && <SchritteTabelle schritte={b.schritte} />}
                </div>
              )}
            </div>
          );
        })}
        {treffer && treffer.size === 0 && (
          <div className="px-3 py-4 text-xs text-muted-foreground text-center">Keine Treffer für &bdquo;{suche}&ldquo;</div>
        )}
      </div>
    </div>
  );
}

/** Eine Grid-Zeile: Name | Typ | Wert (editierbar). */
function GroesseZeile({ groesse: g, onEdit }: { groesse: ModellGroesse; onEdit: (g: ModellGroesse, v: number) => void }) {
  return (
    <tr className="border-t first:border-t-0 hover:bg-muted/30 group">
      <td className="pl-9 pr-2 py-1 w-full">
        <span className="truncate block max-w-[420px]" title={g.name}>{g.name}</span>
      </td>
      <td className="px-2 py-1 whitespace-nowrap">
        <span
          className={`inline-block rounded border px-1.5 py-px text-[10px] ${
            g.region === 'menge'
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {g.region === 'menge' ? 'Menge' : 'Parameter'}
        </span>
      </td>
      <td className="px-3 py-1 text-right w-32">
        {g.editierbar ? (
          <input
            type="number"
            step="any"
            data-grid-cell
            key={`${g.row}-${g.wert}`}
            defaultValue={fmtWert(g.wert)}
            onKeyDown={handleGridKeys}
            onBlur={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v) && Math.abs(v - g.wert) > 1e-9) onEdit(g, v);
            }}
            className="h-6 w-28 rounded border border-transparent bg-transparent px-1.5 text-right font-mono text-xs tabular-nums
              hover:border-input focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring/40
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        ) : (
          <span className="inline-block w-28 px-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground" title="abgeleitet (Formel)">
            {fmtWert(g.wert).toLocaleString('de-DE')}
          </span>
        )}
      </td>
    </tr>
  );
}

/** Spreadsheet-Tastatur: ↑/↓ = Zelle wechseln, Enter = übernehmen + weiter. */
function handleGridKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
  e.preventDefault();
  const cells = [...document.querySelectorAll<HTMLInputElement>('input[data-grid-cell]')];
  const idx = cells.indexOf(e.currentTarget);
  if (idx < 0) return;
  if (e.key === 'ArrowUp') {
    cells[idx - 1]?.focus();
    cells[idx - 1]?.select();
    return;
  }
  // Enter/ArrowDown: übernehmen (blur triggert onEdit) und zur nächsten Zelle.
  // Nach dem Recompute rendert React die Inputs neu → Ziel-Zelle über den Index
  // im nächsten Frame neu suchen.
  e.currentTarget.blur();
  requestAnimationFrame(() => {
    const neu = [...document.querySelectorAll<HTMLInputElement>('input[data-grid-cell]')];
    neu[Math.min(idx + 1, neu.length - 1)]?.focus();
    neu[Math.min(idx + 1, neu.length - 1)]?.select();
  });
}

function SchritteTabelle({ schritte }: { schritte: ModellSchritt[] }) {
  return (
    <div className="border-t overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead className="text-muted-foreground bg-muted/30">
          <tr className="text-left">
            <th className="pl-9 pr-2 py-1 font-medium">Nr.</th>
            <th className="px-2 py-1 font-medium">Schritt</th>
            <th className="px-2 py-1 font-medium">Abteilung</th>
            <th className="px-2 py-1 font-medium text-right">Anteil</th>
            <th className="px-2 py-1 font-medium text-right">Häuf./Tag</th>
            <th className="px-3 py-1 font-medium text-right">Min/Colli</th>
          </tr>
        </thead>
        <tbody>
          {schritte.map((s) => (
            <tr key={s.row} className="border-t hover:bg-muted/20">
              <td className="pl-9 pr-2 py-1 font-mono tabular-nums text-muted-foreground">{s.nr || ''}</td>
              <td className="px-2 py-1 max-w-[360px] truncate" title={s.name}>{s.name}</td>
              <td className="px-2 py-1 whitespace-nowrap text-muted-foreground">{s.abteilung}</td>
              <td className="px-2 py-1 text-right font-mono tabular-nums">{s.anteil.toFixed(2)}</td>
              <td className="px-2 py-1 text-right font-mono tabular-nums text-muted-foreground">{s.haeufigkeitJeTag.toFixed(1)}</td>
              <td className="px-3 py-1 text-right font-mono tabular-nums font-medium">{s.minProColli.toFixed(5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Anzeige-/Edit-Präzision: kleine Parameter (0.002) brauchen mehr Stellen. */
function fmtWert(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const abs = Math.abs(n);
  if (abs !== 0 && abs < 10) return Number(n.toPrecision(4));
  return Math.round(n * 100) / 100;
}
