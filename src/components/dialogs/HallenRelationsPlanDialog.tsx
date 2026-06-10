'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, ChevronRight, Download, Info, Type } from 'lucide-react';
import { useTopisStore } from '@/lib/store';
import {
  aggregateRelationenProStellplatz,
  countRelationen,
  filterByProzesse,
  getAlleProzesse,
  getFuellgradFarbe,
  type StellplatzAggregat,
} from '@/lib/hallen-relations-plan';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Lastenheft 3.2.3 — Hallen-Relations-Plan
 *
 * „Verteilung Relationen auf Stellplätze, Mehrfach-Zuordnungen,
 *  ein-/ausblenden nach Prozess. Schriftgröße veränderbar.
 *  Menge je Stellplatz als Heatmap/Farbabstufung." */
export function HallenRelationsPlanDialog({ open, onOpenChange }: Props) {
  const objects = useTopisStore((s) => s.objects);

  // Aggregation einmal pro Objekt-Liste — bei großen Hallen lohnt sich das.
  const allAggregate = useMemo(
    () => aggregateRelationenProStellplatz(objects),
    [objects]
  );
  const alleProzesse = useMemo(() => getAlleProzesse(allAggregate), [allAggregate]);

  // Stellplätze mit Relationen ZUERST in der Tabelle, leere am Ende.
  // Innerhalb absteigend nach gesamtMenge (größte Brennpunkte oben).
  const sortedAll = useMemo(() => {
    return [...allAggregate].sort((a, b) => {
      if (a.relationen.length === 0 && b.relationen.length > 0) return 1;
      if (a.relationen.length > 0 && b.relationen.length === 0) return -1;
      return b.gesamtMenge - a.gesamtMenge;
    });
  }, [allAggregate]);

  const stellplatzAnzahl = allAggregate.length;
  const relationsAnzahl = countRelationen(allAggregate);
  const hasRelationen = relationsAnzahl > 0;

  // Aktive Prozesse — initial alle aktiv. Wenn keine Prozesse, leere Set.
  const [aktiveProzesse, setAktiveProzesse] = useState<Set<string>>(
    () => new Set(alleProzesse)
  );

  // Reset Filter, wenn sich die Prozess-Liste ändert (z.B. nach Edit am
  // Stellplatz). Ohne diesen Reset würden alle frisch hinzugefügten
  // Prozesse stumm ausgefiltert (sie sind nicht in `aktiveProzesse`).
  useMemo(() => {
    setAktiveProzesse((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const p of alleProzesse) {
        if (!next.has(p)) {
          next.add(p);
          changed = true;
        }
      }
      // Entferne Prozesse die es nicht mehr gibt.
      for (const p of Array.from(next)) {
        if (!alleProzesse.includes(p)) {
          next.delete(p);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [alleProzesse]);

  const filtered = useMemo(() => {
    // Wenn keine Prozesse aktiv: trotzdem leere Aggregate (ohne Relationen)
    // anzeigen, sonst wirkt der Dialog kaputt bei „alles abgewählt".
    // → Für Tabelle filtern wir sortedAll, aber nur sichtbare Zeilen mit
    // Relationen werden gefiltert. Leere Stellplätze bleiben sichtbar.
    if (!hasRelationen) return sortedAll;
    const filteredAgg = filterByProzesse(sortedAll, aktiveProzesse);
    // Stellplätze, die noch nie Relationen hatten, immer anzeigen
    const leere = sortedAll.filter((a) => a.relationen.length === 0);
    return [...filteredAgg, ...leere];
  }, [sortedAll, aktiveProzesse, hasRelationen]);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Lastenheft: „Schriftgröße veränderbar"
  const [fontSize, setFontSize] = useState(13);

  function toggleProzess(p: string, checked: boolean) {
    setAktiveProzesse((prev) => {
      const next = new Set(prev);
      if (checked) next.add(p);
      else next.delete(p);
      return next;
    });
  }
  function alleAktivieren() {
    setAktiveProzesse(new Set(alleProzesse));
  }
  function keineAktivieren() {
    setAktiveProzesse(new Set());
  }

  function handleCsvExport() {
    // CSV mit Stellplatz + alle Prozesse + Gesamt + Kapazität + Füllgrad
    const prozesseFuerHeader = alleProzesse;
    const header = [
      'Stellplatz',
      ...prozesseFuerHeader.map((p) => `Menge_${p}`),
      'Gesamt',
      'Kapazität',
      'Füllgrad_%',
      'Ampel',
      'Anzahl_Relationen',
    ].join(';');
    const rows = filtered.map((a) => {
      const farbe = a.fuellgrad != null
        ? getFuellgradFarbe(a.fuellgrad, findFuellgradSchwellen(objects, a.stellplatzId))
        : '';
      const fuellgradPct = a.fuellgrad != null ? (a.fuellgrad * 100).toFixed(1) : '';
      return [
        csvField(a.stellplatzName),
        ...prozesseFuerHeader.map((p) => a.prozesse[p] ?? 0),
        a.gesamtMenge,
        a.kapazitaet ?? '',
        fuellgradPct,
        farbe,
        a.relationen.length,
      ].join(';');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hallen-relations-plan_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[min(1100px,95vw)] h-[min(85vh,800px)] flex flex-col gap-3 p-4">
        <DialogHeader className="shrink-0">
          <DialogTitle>Hallen-Relations-Plan</DialogTitle>
          <DialogDescription>
            Verteilung der Relationen auf {stellplatzAnzahl} Stellplätze —{' '}
            {relationsAnzahl} Relations-Einträge gesamt. Mehrfach-Zuordnungen
            derselben Prozess+Relation werden summiert.
          </DialogDescription>
        </DialogHeader>

        {!hasRelationen && (
          <div className="shrink-0 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Noch keine Relationen.</strong> Über Stellplatz-Properties
              je Stellplatz die Relationen pflegen (Prozess, Relation, Menge).
              Sobald Werte hinterlegt sind, erscheinen sie hier.
            </div>
          </div>
        )}

        {/* Filter-Leiste: Prozesse + Schriftgröße */}
        <div className="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-2 border rounded-md p-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-semibold">Prozesse:</Label>
            {alleProzesse.length === 0 && (
              <span className="text-xs text-muted-foreground italic">
                — keine Prozesse vorhanden —
              </span>
            )}
            {alleProzesse.map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <Checkbox
                  id={`prozess-${p}`}
                  checked={aktiveProzesse.has(p)}
                  onCheckedChange={(c) => toggleProzess(p, !!c)}
                />
                <Label
                  htmlFor={`prozess-${p}`}
                  className="text-xs cursor-pointer select-none"
                >
                  {p}
                </Label>
              </div>
            ))}
            {alleProzesse.length > 1 && (
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={alleAktivieren}
                >
                  Alle
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px]"
                  onClick={keineAktivieren}
                >
                  Keine
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto min-w-[180px]">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="text-xs whitespace-nowrap">Schrift {fontSize}px</Label>
            <Slider
              value={[fontSize]}
              onValueChange={([v]) => setFontSize(v)}
              min={8}
              max={24}
              step={1}
              className="w-32"
            />
          </div>
        </div>

        {/* Tabelle */}
        <div
          className="flex-1 min-h-0 border rounded-md overflow-auto"
          style={{ fontSize: `${fontSize}px` }}
        >
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="text-left p-2 font-medium w-6"></th>
                <th className="text-left p-2 font-medium">Stellplatz</th>
                <th className="text-right p-2 font-medium">Gesamt-Menge</th>
                <th className="text-right p-2 font-medium">Kapazität</th>
                <th className="text-left p-2 font-medium w-28">Füllgrad</th>
                <th className="text-right p-2 font-medium">Anz. Relationen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-muted-foreground italic"
                  >
                    {stellplatzAnzahl === 0
                      ? 'Keine Stellplätze im Layout vorhanden.'
                      : 'Alle Stellplätze ausgeblendet — mindestens einen Prozess aktivieren.'}
                  </td>
                </tr>
              )}
              {filtered.map((a) => {
                const isExpanded = expandedIds.has(a.stellplatzId);
                const schwellen = findFuellgradSchwellen(objects, a.stellplatzId);
                const ampel = a.fuellgrad != null ? getFuellgradFarbe(a.fuellgrad, schwellen) : null;
                return (
                  <RowGroup
                    key={a.stellplatzId}
                    agg={a}
                    expanded={isExpanded}
                    onToggle={() => toggleExpand(a.stellplatzId)}
                    ampel={ampel}
                  />
                );
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter className="shrink-0 border-t pt-3 flex flex-row justify-between items-center sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCsvExport}
            disabled={filtered.length === 0}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            CSV-Export
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Sub-Komponenten -------------------------------------------------------

interface RowGroupProps {
  agg: StellplatzAggregat;
  expanded: boolean;
  onToggle: () => void;
  ampel: 'gruen' | 'gelb' | 'rot' | null;
}

function RowGroup({ agg, expanded, onToggle, ampel }: RowGroupProps) {
  const ampelColor =
    ampel === 'gruen'
      ? 'bg-emerald-500'
      : ampel === 'gelb'
        ? 'bg-amber-400'
        : ampel === 'rot'
          ? 'bg-red-500'
          : 'bg-muted-foreground/30';
  const isLeer = agg.relationen.length === 0;
  // Lastenheft: „Menge je Stellplatz als Heatmap/Farbabstufung" — Hintergrund-
  // Tönung nach Gesamt-Menge relativ zur Kapazität (sonst Default-Skala).
  const heatBg = computeHeatmapBg(agg);
  return (
    <>
      <tr
        className={`border-t hover:bg-muted/30 ${isLeer ? 'opacity-50' : ''}`}
        style={heatBg ? { backgroundColor: heatBg } : undefined}
      >
        <td className="p-2">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
            disabled={isLeer}
            aria-label={expanded ? 'Einklappen' : 'Ausklappen'}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </td>
        <td className="p-2 font-medium">{agg.stellplatzName}</td>
        <td className="p-2 text-right tabular-nums">
          {agg.gesamtMenge.toLocaleString('de-DE')}
        </td>
        <td className="p-2 text-right tabular-nums">
          {agg.kapazitaet != null ? agg.kapazitaet.toLocaleString('de-DE') : '—'}
        </td>
        <td className="p-2">
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${ampelColor}`} />
            <span className="text-muted-foreground">
              {agg.fuellgrad != null
                ? `${(agg.fuellgrad * 100).toFixed(0)} %`
                : '—'}
            </span>
          </div>
        </td>
        <td className="p-2 text-right tabular-nums">
          {agg.relationen.length}
        </td>
      </tr>
      {expanded && !isLeer && (
        <tr className="bg-muted/10">
          <td colSpan={6} className="p-0">
            <div className="px-4 py-2 border-t">
              <table className="w-full">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left p-1 font-normal">Prozess</th>
                    <th className="text-left p-1 font-normal">Relation</th>
                    <th className="text-left p-1 font-normal">Verladebereich</th>
                    <th className="text-right p-1 font-normal">Menge</th>
                  </tr>
                </thead>
                <tbody>
                  {agg.relationen.map((r, idx) => (
                    <tr key={idx} className="border-t border-muted">
                      <td className="p-1">{r.prozess}</td>
                      <td className="p-1">{r.relation}</td>
                      <td className="p-1">{r.verladebereich ?? '—'}</td>
                      <td className="p-1 text-right tabular-nums">
                        {r.menge.toLocaleString('de-DE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ---- Helper ----------------------------------------------------------------

/** Holt die Füllgrad-Schwellen aus dem Original-Stellplatz (am Aggregat
 * fehlen sie, da sie für die Aggregation irrelevant sind — nur für die
 * Anzeige). */
function findFuellgradSchwellen(
  objects: { id: number; fuellgradFarben?: { gruenBis: number; gelbBis: number } }[],
  stellplatzId: number
): { gruenBis: number; gelbBis: number } | undefined {
  const sp = objects.find((o) => o.id === stellplatzId);
  return sp?.fuellgradFarben;
}

/** Heatmap-Hintergrund pro Zeile.
 *
 * Wenn Kapazität existiert: nach Füllgrad einfärben (grün-gelb-rot
 * verlauf). Ohne Kapazität: blass-rote Tönung proportional zu
 * Gesamt-Menge gegenüber dem maximalen Wert (kommt im RowGroup leider
 * nicht an, also: wir geben hier nur ein dezentes Signal aus). */
function computeHeatmapBg(agg: StellplatzAggregat): string | undefined {
  if (agg.relationen.length === 0) return undefined;
  if (agg.fuellgrad != null) {
    const f = Math.max(0, Math.min(1, agg.fuellgrad));
    // grün → gelb → rot (siehe heatmap-utils gruen-rot, hier nur 0.15 Alpha)
    const r = f < 0.5 ? Math.round(255 * (f * 2)) : 255;
    const g = f < 0.5 ? 255 : Math.round(255 * (1 - (f - 0.5) * 2));
    return `rgba(${r}, ${g}, 0, 0.10)`;
  }
  // Ohne Kapazität: dezenter blauer Akzent, signalisiert „Daten vorhanden,
  // keine Kapazität zum Vergleich gepflegt".
  return 'rgba(59, 130, 246, 0.06)';
}

/** CSV-Feld mit Quotes, wenn nötig (Semikolon im Namen). */
function csvField(s: string): string {
  if (s.includes(';') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
