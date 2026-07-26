'use client';

// KI-Textbuilder — Eingabefeld + „Das habe ich verstanden"-Karte + Ghost-Vorschau.
// v1 nutzt den deterministischen Offline-Parser (parseCanonical). Der Edge-Function-/LLM-
// Pfad für Fuzzy-Sprache wird später eingehängt (gleiche Datenform LayoutParams).
// Spec: topis/SPEC-KI-TEXTBUILDER-2026-07-25.md

import { useState } from 'react';
import { useTopisStore } from '@/lib/store';
import { validateParams, paramsToLayout, FLAECHEN, type ValidationResult } from '@/lib/nl-layout';
import { resolveLayoutParams, llmVerfuegbar } from '@/lib/nl-llm';
import { generateBasicGangNet } from '@/lib/pathfinding';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ArrowRight, AlertTriangle, CircleAlert } from 'lucide-react';
import { toast } from 'sonner';

const SIDE_LABEL: Record<string, string> = { north: 'Nord', south: 'Süd', east: 'Ost', west: 'West' };
const FLAECHE_LABEL: Record<string, string> = Object.fromEntries(FLAECHEN.map((f) => [f.art, f.label]));
const NUM_LABEL: Record<string, string> = { seite: 'nach Seite (N1, S1 …)', alpha: 'A, B, C …', fortlaufend: 'fortlaufend' };

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
  const [built, setBuilt] = useState<ReturnType<typeof paramsToLayout> | null>(null);
  const [notUnderstood, setNotUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmPartial, setConfirmPartial] = useState(false);

  if (!open) return null;

  const understand = async () => {
    if (!text.trim() || busy) return;
    setNotUnderstood(false);
    setBusy(true);
    setConfirmPartial(false);
    try {
      const params = await resolveLayoutParams(text, 'm');
      if (!params) {
        setResult(null); setGhost(null); setBuilt(null); setNotUnderstood(true);
        return;
      }
      const v = validateParams(params);
      const layout = v.ok ? paramsToLayout(v.filled) : null;
      setResult(v);
      setBuilt(layout);
      setGhost(layout);
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!result?.ok || !built) return;
    if (dropped > 0 && !confirmPartial) return; // Teilresultat muss bestätigt werden
    resetState(); // v1: „createHall" ersetzt das aktuelle Layout (wie der Assistent).
    updateHall(1, { width: built.hall.width, height: built.hall.height, name: built.hall.name });
    const created = addObjects(built.objects);
    const gaenge = generateBasicGangNet(created, built.hall.width, built.hall.height, 1, result.filled.mittelgangM ?? 4);
    if (gaenge.length > 0) setGaenge(gaenge);
    const n = built.objects.length;
    toast.success(`Halle „${built.hall.name}" mit ${n} Objekten + Gangnetz erstellt`);
    close();
  };

  const close = () => {
    setGhost(null); setResult(null); setBuilt(null); setNotUnderstood(false);
    setConfirmPartial(false); setText(''); setOpen(false);
  };

  const g = result?.filled;
  // Angefordert vs. tatsächlich platziert (Ehrlichkeit statt stiller Verlust).
  const torCount = g ? (g.gates ?? []).reduce((a, gr) => a + gr.count, 0) : 0;
  const requested = g
    ? torCount + (g.zonen?.length ?? g.bereiche ?? 0)
      + (g.stellplaetzeJeTor ? torCount : (g.stellplaetze ?? 0))
      + (g.flaechen ?? []).reduce((a, f) => a + f.count, 0)
    : 0;
  const placed = built?.objects.length ?? 0;
  const dropped = Math.max(0, requested - placed);

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
            {g.stellplaetzeJeTor && (
              <span>📥 Stellplatz vor jedem Tor · <b>{g.stellplatzLaengeM ?? 12} × {g.stellplatzBreiteM ?? 3} m</b></span>
            )}
            {g.zonen && g.zonen.length > 0 && (
              <span>🏷️ {g.zonen.map((z) => z.side ? `${z.name} (${SIDE_LABEL[z.side]})` : z.name).join(' · ')}</span>
            )}
            {((!g.zonen && g.bereiche) || (g.stellplaetze && !g.stellplaetzeJeTor)) && (
              <span>📦 {[(!g.zonen && g.bereiche) ? `${g.bereiche} Bereiche` : null, (g.stellplaetze && !g.stellplaetzeJeTor) ? `${g.stellplaetze} Stellplätze` : null].filter(Boolean).join(' · ')}</span>
            )}
            <span>🛣️ Mittelgang <b>{g.mittelgangM ?? 4} m</b></span>
            {g.stellplatzLaengeM && !g.stellplaetzeJeTor && g.stellplaetze ? (
              <span className="text-muted-foreground text-xs">Stellplatz-Maß {g.stellplatzLaengeM} × {g.stellplatzBreiteM} m</span>
            ) : null}
            {g.flaechen && g.flaechen.length > 0 && (
              <span>🔧 {g.flaechen.map((f) => `${f.count} ${FLAECHE_LABEL[f.art] ?? f.art}`).join(' · ')}</span>
            )}
            {g.nummerierung && g.nummerierung !== 'fortlaufend' && (
              <span className="text-muted-foreground text-xs">Tor-Nummerierung: {NUM_LABEL[g.nummerierung]}</span>
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

          {result.ok && (
            <div className="mt-2 text-xs text-muted-foreground">
              Wird gebaut: <b className="text-foreground">{placed}</b> von {requested} Objekten
              {dropped > 0 && <span className="text-amber-600 dark:text-amber-500"> · {dropped} passen nicht in die Halle</span>}
            </div>
          )}
          {result.ok && dropped > 0 && (
            <label className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 cursor-pointer">
              <input type="checkbox" checked={confirmPartial} onChange={(e) => setConfirmPartial(e.target.checked)} />
              Teilresultat mit {dropped} fehlenden Objekten trotzdem übernehmen
            </label>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={apply} disabled={!result.ok || (dropped > 0 && !confirmPartial)} className="gap-1">
              Übernehmen <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {!result.ok ? 'Bitte Eingabe korrigieren' : dropped > 0 && !confirmPartial ? 'Teilresultat bestätigen' : 'Ghost-Vorschau ist im Plan sichtbar'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
