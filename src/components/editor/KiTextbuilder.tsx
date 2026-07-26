'use client';

// KI-Textbuilder — Eingabefeld + „Das habe ich verstanden"-Karte + Ghost-Vorschau.
// v1 nutzt den deterministischen Offline-Parser (parseCanonical). Der Edge-Function-/LLM-
// Pfad für Fuzzy-Sprache wird später eingehängt (gleiche Datenform LayoutParams).
// Spec: topis/SPEC-KI-TEXTBUILDER-2026-07-25.md

import { useState } from 'react';
import { useTopisStore } from '@/lib/store';
import { validateParams, paramsToLayout, type ValidationResult } from '@/lib/nl-layout';
import { resolveLayoutParams, llmVerfuegbar } from '@/lib/nl-llm';
import { generateBasicGangNet } from '@/lib/pathfinding';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ArrowRight, AlertTriangle, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';

const SIDE_LABEL: Record<string, string> = { north: 'Nord', south: 'Süd', east: 'Ost', west: 'West' };

export function KiTextbuilder() {
  const open = useTopisStore((s) => s.nlBuilderOpen);
  const setOpen = useTopisStore((s) => s.setNlBuilderOpen);
  const setGhost = useTopisStore((s) => s.setNlGhost);
  const updateHall = useTopisStore((s) => s.updateHall);
  const addObjects = useTopisStore((s) => s.addObjects);
  const setGaenge = useTopisStore((s) => s.setGaenge);
  const resetState = useTopisStore((s) => s.resetState);

  const [text, setText] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [notUnderstood, setNotUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const understand = async () => {
    if (!text.trim() || busy) return;
    setNotUnderstood(false);
    setBusy(true);
    try {
      const params = await resolveLayoutParams(text, 'm');
      if (!params) {
        setResult(null);
        setGhost(null);
        setNotUnderstood(true);
        return;
      }
      const v = validateParams(params);
      setResult(v);
      setGhost(v.ok ? paramsToLayout(v.filled) : null);
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!result?.ok) return;
    const layout = paramsToLayout(result.filled);
    // v1: „createHall" ersetzt das aktuelle Layout (wie der Assistent).
    resetState();
    updateHall(1, { width: layout.hall.width, height: layout.hall.height, name: layout.hall.name });
    const created = addObjects(layout.objects);
    // Basis-Gangnetz erzeugen, damit die Halle sofort wegefähig ist (A*, Aufträge).
    const gaenge = generateBasicGangNet(created, layout.hall.width, layout.hall.height, 1);
    if (gaenge.length > 0) setGaenge(gaenge);
    const torCount = layout.objects.filter((o) => o.type === 'tor').length;
    toast.success(`Halle „${layout.hall.name}" mit ${torCount} ${torCount === 1 ? 'Tor' : 'Toren'} + Gangnetz erstellt`);
    close();
  };

  const close = () => {
    setGhost(null);
    setResult(null);
    setNotUnderstood(false);
    setText('');
    setOpen(false);
  };

  const g = result?.filled;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[480px] max-w-[calc(100%-2rem)]
                    rounded-xl border bg-card/95 backdrop-blur shadow-2xl shadow-black/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Halle per Text bauen</span>
        <button onClick={close} aria-label="Schließen" className="ml-auto rounded p-1 hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') understand(); }}
          placeholder={llmVerfuegbar() ? 'z. B. Halle mit 210×58 m, 50 Tore im Norden und 50 im Süden' : 'z. B. Halle 100x50, 20 Tore Nord, Abstand 4,5'}
          aria-label="Hallenbeschreibung"
          disabled={busy}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
        />
        <Button size="sm" onClick={understand} disabled={busy}>{busy ? 'Verstehe …' : 'Verstehen'}</Button>
      </div>

      {notUnderstood && (
        <p className="mt-2 text-xs text-muted-foreground">
          Konnte ich nicht deuten. Beispiel: <span className="font-mono">Halle 100x50, 20 Tore Nord, Abstand 4,5</span>
        </p>
      )}

      {result && g && (
        <div className="mt-3 rounded-lg border bg-muted/40 p-3 text-sm">
          <div className="mb-1 text-xs font-medium text-muted-foreground">Das habe ich verstanden</div>
          <div className="flex flex-col gap-1">
            <span>📏 Halle <b>{g.hall.lengthM} × {g.hall.widthM} m</b></span>
            {g.gates && g.gates.length > 0
              ? g.gates.map((grp, i) => (
                  <span key={i}>🚪 <b>{grp.count}</b> Tore · <b>{SIDE_LABEL[grp.side]}</b> · Abstand <b>{grp.spacingM} m</b></span>
                ))
              : <span className="text-muted-foreground">keine Tore erkannt</span>}
            {(g.bereiche || g.stellplaetze) && (
              <span>📦 {[g.bereiche ? `${g.bereiche} Bereiche` : null, g.stellplaetze ? `${g.stellplaetze} Stellplätze` : null].filter(Boolean).join(' · ')}</span>
            )}
          </div>

          {g.ignored && g.ignored.length > 0 && (
            <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-medium">
                <AlertTriangle className="h-3.5 w-3.5" /> Nicht übernommen
              </div>
              <ul className="mt-1 ml-1 list-disc list-inside text-xs text-amber-700/90 dark:text-amber-300/90">
                {g.ignored.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </div>
          )}

          {result.warnings.map((w, i) => (
            <div key={i} className="mt-2 flex items-start gap-1.5 text-amber-600 dark:text-amber-500 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span>{w}</span>
            </div>
          ))}
          {result.errors.map((e, i) => (
            <div key={i} className="mt-2 flex items-start gap-1.5 text-red-600 dark:text-red-500 text-xs">
              <CircleAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" /> <span>{e}</span>
            </div>
          ))}

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={apply} disabled={!result.ok} className="gap-1">
              Übernehmen <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {result.ok ? 'Ghost-Vorschau ist im Plan sichtbar' : 'Bitte Eingabe korrigieren'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
