'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ChevronRight, ChevronDown, Search, ListTree, UnfoldVertical, FoldVertical, Plus, Trash2,
} from 'lucide-react';
import type { ModellBlock, ModellGroesse, ModellSchritt } from '@/lib/prozessmodell-excel-modell';
import type { SchrittFeld } from '@/lib/prozessmodell-nativ';

/**
 * Excel-artiges Grid über ALLE Prozessblöcke des NATIVEN Modells:
 * Größen (Mengen/Parameter) UND Prozessschritte direkt editierbar,
 * Schritte anleg-/löschbar. Tastatur wie im Spreadsheet: ↑/↓ wechselt
 * die Zelle, Enter übernimmt und springt weiter. Alles rechnet live.
 */
export function ProzessGrid({
  bloecke,
  onEdit,
  onSchrittEdit,
  onSchrittNeu,
  onSchrittLoeschen,
}: {
  bloecke: ModellBlock[];
  onEdit: (g: ModellGroesse, value: number) => void;
  onSchrittEdit: (s: ModellSchritt, feld: SchrittFeld, wert: string | number | null) => void;
  onSchrittNeu: (blockNativId: string, nachSchrittNativId?: string) => void;
  onSchrittLoeschen: (s: ModellSchritt) => void;
}) {
  const [suche, setSuche] = useState('');
  const [offen, setOffen] = useState<Set<number>>(() => new Set([0]));
  const [schritteOffen, setSchritteOffen] = useState<Set<number>>(new Set());

  const filter = suche.trim().toLowerCase();
  const treffer = useMemo(() => {
    if (!filter) return null;
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

  const toggle = (i: number) =>
    setOffen((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });
  const toggleSchritte = (i: number) =>
    setSchritteOffen((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });

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
            <div key={b.nativId ?? i}>
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
                  {groessen.length} Größen · {b.schritte.length} Schritte
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
                        <GroesseZeile key={g.nativId ?? g.row} groesse={g} onEdit={onEdit} />
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={() => toggleSchritte(i)}
                    className="w-full flex items-center gap-1.5 px-9 py-1.5 text-[11px] text-muted-foreground hover:text-foreground border-t transition-colors"
                  >
                    <ListTree className="h-3 w-3" />
                    {schritteOffen.has(i)
                      ? 'Prozessschritte ausblenden'
                      : `Prozessschritte bearbeiten (${b.schritte.length})`}
                  </button>
                  {schritteOffen.has(i) && (
                    <SchritteTabelle
                      block={b}
                      onSchrittEdit={onSchrittEdit}
                      onSchrittNeu={onSchrittNeu}
                      onSchrittLoeschen={onSchrittLoeschen}
                    />
                  )}
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
          <ZahlZelle wert={g.wert} breit onCommit={(v) => onEdit(g, v)} />
        ) : (
          <span className="inline-block w-28 px-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground" title="abgeleitet (Formel)">
            {fmtWert(g.wert).toLocaleString('de-DE')}
          </span>
        )}
      </td>
    </tr>
  );
}

/** Editierbare Zahlen-Zelle mit Spreadsheet-Tastatur. */
function ZahlZelle({
  wert,
  onCommit,
  breit = false,
  leerErlaubt = false,
  onLeer,
  title,
}: {
  wert: number | null;
  onCommit: (v: number) => void;
  breit?: boolean;
  leerErlaubt?: boolean;
  onLeer?: () => void;
  title?: string;
}) {
  return (
    <input
      type="number"
      step="any"
      data-grid-cell
      key={wert == null ? 'leer' : fmtWert(wert)}
      defaultValue={wert == null ? '' : fmtWert(wert)}
      title={title}
      onKeyDown={handleGridKeys}
      onBlur={(e) => {
        const roh = e.target.value.trim();
        if (roh === '') {
          if (leerErlaubt && wert != null) onLeer?.();
          return;
        }
        const v = parseFloat(roh);
        if (Number.isFinite(v) && (wert == null || Math.abs(v - wert) > 1e-9)) onCommit(v);
      }}
      className={`h-6 ${breit ? 'w-28' : 'w-16'} rounded border border-transparent bg-transparent px-1.5 text-right font-mono text-xs tabular-nums
        hover:border-input focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring/40
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
    />
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
  e.currentTarget.blur();
  requestAnimationFrame(() => {
    const neu = [...document.querySelectorAll<HTMLInputElement>('input[data-grid-cell]')];
    neu[Math.min(idx + 1, neu.length - 1)]?.focus();
    neu[Math.min(idx + 1, neu.length - 1)]?.select();
  });
}

/** Voll editierbare Schritt-Tabelle: Zeiten, Wege, Anteile, Name, Abteilung + anlegen/löschen. */
function SchritteTabelle({
  block,
  onSchrittEdit,
  onSchrittNeu,
  onSchrittLoeschen,
}: {
  block: ModellBlock;
  onSchrittEdit: (s: ModellSchritt, feld: SchrittFeld, wert: string | number | null) => void;
  onSchrittNeu: (blockNativId: string, nachSchrittNativId?: string) => void;
  onSchrittLoeschen: (s: ModellSchritt) => void;
}) {
  const abteilungen = useMemo(
    () => [...new Set(block.schritte.map((s) => s.abteilung))].filter(Boolean),
    [block.schritte],
  );
  return (
    <div className="border-t overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead className="text-muted-foreground bg-muted/30">
          <tr className="text-left">
            <th className="pl-9 pr-2 py-1 font-medium">Nr.</th>
            <th className="px-2 py-1 font-medium">Schritt</th>
            <th className="px-2 py-1 font-medium">Abteilung</th>
            <th className="px-2 py-1 font-medium text-right" title="Weg in Metern">Weg m</th>
            <th className="px-2 py-1 font-medium text-right" title="Geschwindigkeit m/s">m/s</th>
            <th className="px-2 py-1 font-medium text-right" title="Standardzeit in Sekunden">Sek</th>
            <th className="px-2 py-1 font-medium text-right">Anteil</th>
            <th className="px-2 py-1 font-medium text-right">Häuf./Tag</th>
            <th className="px-2 py-1 font-medium text-right">Min/Colli</th>
            <th className="px-2 py-1" />
          </tr>
        </thead>
        <tbody>
          {block.schritte.map((s) => (
            <tr key={s.nativId ?? s.row} className="border-t hover:bg-muted/20 group">
              <td className="pl-9 pr-2 py-0.5 font-mono tabular-nums text-muted-foreground">{s.nr || ''}</td>
              <td className="px-1 py-0.5 min-w-[220px]">
                <input
                  type="text"
                  defaultValue={s.name}
                  key={s.name}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== s.name) onSchrittEdit(s, 'name', v);
                  }}
                  className="w-full max-w-[340px] h-6 rounded border border-transparent bg-transparent px-1.5 text-[11px]
                    hover:border-input focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring/40 truncate"
                  title={s.name}
                />
              </td>
              <td className="px-1 py-0.5">
                <input
                  type="text"
                  list={`abt-${block.nativId}`}
                  defaultValue={s.abteilung}
                  key={s.abteilung}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== s.abteilung) onSchrittEdit(s, 'abteilung', v);
                  }}
                  className="w-24 h-6 rounded border border-transparent bg-transparent px-1.5 text-[11px]
                    hover:border-input focus:border-ring focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring/40"
                />
              </td>
              <td className="px-1 py-0.5 text-right">
                <ZahlZelle wert={s.wegM} leerErlaubt onLeer={() => onSchrittEdit(s, 'wegM', null)} onCommit={(v) => onSchrittEdit(s, 'wegM', v)} />
              </td>
              <td className="px-1 py-0.5 text-right">
                <ZahlZelle wert={s.geschwMs} leerErlaubt onLeer={() => onSchrittEdit(s, 'geschwMs', null)} onCommit={(v) => onSchrittEdit(s, 'geschwMs', v)} />
              </td>
              <td className="px-1 py-0.5 text-right">
                <ZahlZelle wert={s.standardSek} onCommit={(v) => onSchrittEdit(s, 'standardSek', v)} />
              </td>
              <td className="px-1 py-0.5 text-right">
                <ZahlZelle wert={s.anteil} onCommit={(v) => onSchrittEdit(s, 'anteil', v)} />
              </td>
              <td className="px-2 py-0.5 text-right font-mono tabular-nums text-muted-foreground">
                {s.haeufigkeitJeTag.toFixed(1)}
              </td>
              <td className="px-2 py-0.5 text-right font-mono tabular-nums font-medium">{s.minProColli.toFixed(5)}</td>
              <td className="px-1 py-0.5 text-right whitespace-nowrap">
                <button
                  onClick={() => onSchrittLoeschen(s)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-0.5 transition-opacity"
                  aria-label={`Schritt ${s.name} löschen`}
                  title="Schritt löschen"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <datalist id={`abt-${block.nativId}`}>
        {abteilungen.map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      {block.nativId && (
        <button
          onClick={() => onSchrittNeu(block.nativId!, block.schritte[block.schritte.length - 1]?.nativId)}
          className="w-full flex items-center gap-1.5 px-9 py-1.5 text-[11px] text-muted-foreground hover:text-foreground border-t transition-colors"
        >
          <Plus className="h-3 w-3" />
          Prozessschritt hinzufügen
        </button>
      )}
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
