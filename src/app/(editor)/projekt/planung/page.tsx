'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, AlertTriangle, RefreshCw, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useTopisStore } from '@/lib/store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import {
  aggregateAuftragszeilen,
  applyZeilenEdit,
  simAuftraegeToZeilen,
  type Auftragszeile,
} from '@/lib/auftragsplanung';
import { RelationZuordnungDialog } from '@/components/dialogs/RelationZuordnungDialog';
import { TorComboBox } from '@/components/ui/tor-combobox';
import { useSimSettingsStore } from '@/lib/sim-settings-store';
import { ThemeToggleSimple } from '@/components/theme-toggle';

const fmtEUR = (v: number) =>
  v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const fmtNum = (v: number, d = 0) =>
  v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
// Σ Weg-Meter wird oft 4-/5-stellig — ab > 999 m als km formatieren, sonst
// quetscht die Zahl die Spalte und wird unleserlich.
const fmtMeterOrKm = (m: number): string => {
  if (m > 999) return `${(m / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
  return `${fmtNum(m, 0)} m`;
};

export default function PlanungPage() {
  const records = useBetriebsdatenStore((s) => s.scandatenRecords);
  const torZuordnungen = useBetriebsdatenStore((s) => s.torZuordnungen);
  const relationZuordnungen = useBetriebsdatenStore((s) => s.relationZuordnungen);
  const objects = useTopisStore((s) => s.objects);
  const gaenge = useTopisStore((s) => s.gaenge);
  const ffzList = useTopisStore((s) => s.ffz);
  const simAuftraege = useTopisStore((s) => s.simAuftraege);
  const removeSimAuftrag = useTopisStore((s) => s.removeSimAuftrag);
  const clearSimAuftraege = useTopisStore((s) => s.clearSimAuftraege);
  const forkSimAuftragAsSim = useTopisStore((s) => s.forkSimAuftragAsSim);
  const removeSimVarianteFor = useTopisStore((s) => s.removeSimVarianteFor);
  const setAnimationActive = useTopisStore((s) => s.setAnimationActive);
  const animationActiveId = useTopisStore((s) => s.animationActiveId);
  const setFocusedTor = useTopisStore((s) => s.setFocusedTor);
  const ergebnis = useProzessmodellStore((s) => s.ergebnis);

  // Stundensatz + Default-FFZ + Min/Colli-Fix kommen aus dem geteilten Settings-Store,
  // damit Dashboard und Planung dieselben Zahlen zeigen.
  const stundensatz = useSimSettingsStore((s) => s.stundensatzEuro);
  const setStundensatz = useSimSettingsStore((s) => s.setStundensatz);
  const minFix = useSimSettingsStore((s) => s.minProColliFix);
  const setMinFix = useSimSettingsStore((s) => s.setMinFix);
  const storeDefaultFfzId = useSimSettingsStore((s) => s.defaultFfzId);
  const setStoreDefaultFfzId = useSimSettingsStore((s) => s.setDefaultFfzId);
  const defaultFfzId = storeDefaultFfzId ?? ffzList[0]?.id ?? null;
  const setDefaultFfzId = (id: number | null) => setStoreDefaultFfzId(id);
  const [zeitraum, setZeitraum] = useState<string>('alle'); // 'alle' oder ISO-Woche
  // IST aus Scandaten: standardmäßig ausgeblendet, damit die Tabelle nur
  // zeigt was der Berater selbst angelegt hat. Anklicken um Vergleich
  // mit historischen Daten zu sehen.
  const [showIstScandaten, setShowIstScandaten] = useState(false);

  // IST-Aggregation aus Scandaten
  const istAgg = useMemo(
    () =>
      aggregateAuftragszeilen({
        records,
        objects,
        gaenge,
        torZuordnungen,
        relationZuordnungen,
        ffzList,
        defaultFfzId,
        stundensatzEuro: stundensatz,
        minProColliFix: minFix,
        zeitraumFilter: null,
      }),
    [records, objects, gaenge, torZuordnungen, relationZuordnungen, ffzList, defaultFfzId, stundensatz, minFix]
  );

  // Simulierte Aufträge aus dem Layout-Store (per Klick im Canvas angelegt)
  const simZeilen = useMemo(
    () =>
      simAuftraegeToZeilen({
        simAuftraege,
        objects,
        gaenge,
        ffzList,
        defaultFfzId,
        stundensatzEuro: stundensatz,
        minProColliFix: minFix,
      }),
    [simAuftraege, objects, gaenge, ffzList, defaultFfzId, stundensatz, minFix]
  );

  // simZeilen aufteilen in IST (ohne parentId) und SIM-Varianten (mit parentId).
  // IST-Sim-Aufträge sind die per Klick/Seed angelegten "Plan-Aufträge".
  // SIM-Varianten sind das Was-wäre-wenn-Fork eines IST-Auftrags.
  const istSimZeilen = useMemo(
    () => simZeilen.filter((z) => {
      const orig = simAuftraege.find((a) => a.id === z.simAuftragId);
      return orig && !orig.parentId;
    }),
    [simZeilen, simAuftraege]
  );
  const simVarianteByParent = useMemo(() => {
    const map = new Map<string, Auftragszeile>();
    for (const z of simZeilen) {
      const orig = simAuftraege.find((a) => a.id === z.simAuftragId);
      if (orig?.parentId) map.set(orig.parentId, z);
    }
    return map;
  }, [simZeilen, simAuftraege]);

  // Komplette IST-Liste: Sim-Aufträge immer, Scandaten nur wenn Toggle an.
  const allIstZeilen = useMemo(
    () => (showIstScandaten ? [...istSimZeilen, ...istAgg.zeilen] : istSimZeilen),
    [istSimZeilen, istAgg.zeilen, showIstScandaten]
  );

  // SOLL-Zeilen: pro IST → sollOverride (manuell editiert) ODER SIM-Variante (Fork) ODER IST selbst
  const [sollOverrides, setSollOverrides] = useState<Map<string, Auftragszeile>>(new Map());
  const sollZeilen: Auftragszeile[] = useMemo(() => {
    return allIstZeilen.map((z) => {
      if (sollOverrides.has(z.id)) return sollOverrides.get(z.id)!;
      // Wenn die IST-Zeile aus einem Sim-Auftrag stammt: prüfen ob es eine SIM-Variante gibt
      if (z.simAuftragId) {
        const sim = simVarianteByParent.get(z.simAuftragId);
        if (sim) return sim;
      }
      return z;
    });
  }, [allIstZeilen, sollOverrides, simVarianteByParent]);

  const sollMeta = useMemo(() => {
    const gColli = sollZeilen.reduce((s, z) => s + z.colli, 0);
    const gStd = sollZeilen.reduce((s, z) => s + z.gesamtStunden, 0);
    const gKos = sollZeilen.reduce((s, z) => s + Math.round(z.kosten), 0);
    // Σ Weg-Meter: nur Zeilen ohne Warnung (sonst ist distanzM 0 oder Luftlinie).
    // Single-Weg pro Auftrag — der Doppelweg wird intern in der Zeit-Berechnung
    // genutzt, aber im UI ist die Spalte als "Weg (m)" pro Auftrag deklariert.
    const gWegM = sollZeilen.reduce((s, z) => (z.warnung ? s : s + z.distanzM), 0);
    // Ø Min/Colli gewichtet nach Colli — ungewichtet wäre verzerrt durch
    // Mini-Aufträge mit nur 1 Colli aber langem Weg.
    const wMinColli = gColli > 0
      ? sollZeilen.reduce((s, z) => s + z.minProColli * z.colli, 0) / gColli
      : 0;
    return { gesamtColli: gColli, gesamtStunden: gStd, gesamtKosten: gKos, gesamtWegM: gWegM, avgMinProColli: wMinColli };
  }, [sollZeilen]);

  // Komplette IST-Meta inkl. Sim-Aufträge.
  // Σ Kosten muss konsistent mit der Anzeige sein — fmtEUR rundet jede Zelle
  // auf ganze Euro, also summieren wir die ebenfalls gerundeten Werte, damit
  // eine händische Excel-Nachrechnung (sum der angezeigten Werte) mit dem
  // Footer übereinstimmt (Alex 22.05., 1.395 € Diff).
  const allIstMeta = useMemo(() => {
    const gColli = allIstZeilen.reduce((s, z) => s + z.colli, 0);
    const gWegM = allIstZeilen.reduce((s, z) => (z.warnung ? s : s + z.distanzM), 0);
    const wMinColli = gColli > 0
      ? allIstZeilen.reduce((s, z) => s + z.minProColli * z.colli, 0) / gColli
      : 0;
    return {
      gesamtColli: gColli,
      gesamtStunden: allIstZeilen.reduce((s, z) => s + z.gesamtStunden, 0),
      gesamtKosten: allIstZeilen.reduce((s, z) => s + Math.round(z.kosten), 0),
      gesamtWegM: gWegM,
      avgMinProColli: wMinColli,
      simAnzahl: simZeilen.length,
      simKosten: simZeilen.reduce((s, z) => s + Math.round(z.kosten), 0),
      simStunden: simZeilen.reduce((s, z) => s + z.gesamtStunden, 0),
      simColli: simZeilen.reduce((s, z) => s + z.colli, 0),
    };
  }, [allIstZeilen, simZeilen]);

  const deltaKosten = sollMeta.gesamtKosten - allIstMeta.gesamtKosten;
  const deltaStunden = sollMeta.gesamtStunden - allIstMeta.gesamtStunden;

  // Pro-Tor-Belegung (basiert auf den effektiven SOLL-Werten, also IST + Direkt-Override + SIM-Variante).
  // Pro Tor das in einem Auftrag steckt: Σ Colli / Σ Stunden / Σ Kosten / Anzahl Aufträge.
  const torBelegung = useMemo(() => {
    type B = { torId: number; torName: string; colli: number; stunden: number; kosten: number; anzahl: number };
    const map = new Map<number, B>();
    for (const z of sollZeilen) {
      const torId = z.torObjectId;
      if (torId == null) continue;
      const torName = z.torName;
      const eintrag = map.get(torId) ?? { torId, torName, colli: 0, stunden: 0, kosten: 0, anzahl: 0 };
      eintrag.colli += z.colli;
      eintrag.stunden += z.gesamtStunden;
      eintrag.kosten += z.kosten;
      eintrag.anzahl += 1;
      map.set(torId, eintrag);
    }
    return [...map.values()].sort((a, b) => b.colli - a.colli);
  }, [sollZeilen]);

  function editZeile(id: string, edit: Partial<Pick<Auftragszeile, 'torObjectId' | 'bereichObjectId' | 'colli' | 'ffzId'>>) {
    // baseline kann aus dreierlei Quellen kommen:
    // 1. sollOverrides (bereits manuell editiert)
    // 2. istAgg.zeilen (aus Scandaten aggregiert)
    // 3. allIstZeilen (enthält auch Sim-Aufträge — die fehlten vorher!)
    const baseline =
      sollOverrides.get(id) ??
      istAgg.zeilen.find((z) => z.id === id) ??
      allIstZeilen.find((z) => z.id === id);
    if (!baseline) return;
    const neu = applyZeilenEdit(baseline, edit, { objects, gaenge, ffzList, stundensatzEuro: stundensatz });
    setSollOverrides((prev) => {
      const next = new Map(prev);
      next.set(id, neu);
      return next;
    });
  }

  function resetZeile(id: string) {
    setSollOverrides((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }

  function resetAll() {
    setSollOverrides(new Map());
  }

  // Optionen für die Dropdowns
  const torOptions = useMemo(
    () =>
      objects
        .filter((o) => o.type === 'tor' || o.tags?.includes('messpunkt'))
        .sort((a, b) => (a.torNummer ?? 999) - (b.torNummer ?? 999)),
    [objects]
  );
  // Ziel-Optionen für Sim-Aufträge: Tore (Cross-Docking) + Bereiche.
  // Tore vorne, sortiert nach Nummer; Bereiche danach alphabetisch.
  // WICHTIG: Bereiche OHNE name nicht rausfiltern — sonst wirkt die Combobox
  // inkonsistent (manche Optionen "fehlen plötzlich"). Stattdessen Fallback-Name.
  const bereichOptions = useMemo(() => {
    const tore = objects
      .filter((o) => o.type === 'tor')
      .sort((a, b) => (a.torNummer ?? 999) - (b.torNummer ?? 999));
    const bereiche = objects
      .filter((o) => o.type === 'bereich')
      .map((o) => (o.name ? o : { ...o, name: `Bereich #${o.id}` }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return [...tore, ...bereiche];
  }, [objects]);

  // Warnungs-Text für das "!" in der Weg-Spalte. "!" bleibt absichtlich
  // "!", denn 0 wäre semantisch falsch (es gibt KEINEN Weg, nicht "0 Meter Weg").
  function warnungText(w: Auftragszeile['warnung']): string {
    switch (w) {
      case 'weg-fehlt':
        return 'Pfad nicht gefunden — Gang-Netzwerk prüfen, kein Weg zwischen Tor und Bereich.';
      case 'tor-nicht-gemappt':
        return 'Tor nicht im Layout zugeordnet — Messpunkt → Tor-Mapping ergänzen.';
      case 'bereich-nicht-gemappt':
        return 'Bereich nicht im Layout zugeordnet — Relation → Bereich-Mapping ergänzen.';
      default:
        return 'Hinweis: Datenproblem in dieser Zeile.';
    }
  }

  // "Daten da" = entweder echte Scandaten oder per Hand angelegte Sim-Aufträge.
  // Ohne beides hat die Tabelle nichts zu zeigen — sonst arbeitet sie.
  const hasData = records.length > 0 || simAuftraege.length > 0;
  const hatNurSim = records.length === 0 && simAuftraege.length > 0;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card shrink-0">
        <a href="/topis-saas/projekt">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Editor
          </Button>
        </a>
        <div className="h-6 w-px bg-border" />
        <h1 className="text-sm font-bold flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Auftrags-Planung
        </h1>
        <span className="text-xs text-muted-foreground">
          IST aus Scandaten · SOLL-Spalte editierbar · Σ unten
        </span>
        <div className="ml-auto">
          <ThemeToggleSimple />
        </div>
      </div>

      {/* Parameter-Leiste */}
      <div className="border-b bg-muted/30 px-4 py-2 flex flex-wrap items-end gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <Label htmlFor="stundensatz" className="text-xs">Stundenkostensatz</Label>
          <div className="flex items-center gap-1">
            <Input
              id="stundensatz"
              type="number"
              value={stundensatz}
              onChange={(e) => setStundensatz(Number(e.target.value) || 0)}
              className="h-8 w-24 text-sm"
              min={0}
              step={0.5}
            />
            <span className="text-xs text-muted-foreground">€/h</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">FFZ Standard</Label>
          <Select
            value={defaultFfzId != null ? String(defaultFfzId) : ''}
            onValueChange={(v) => setDefaultFfzId(v ? Number(v) : null)}
          >
            <SelectTrigger className="h-8 w-44 text-sm">
              <SelectValue placeholder="FFZ wählen" />
            </SelectTrigger>
            <SelectContent>
              {ffzList.map((f) => (
                <SelectItem key={f.id} value={String(f.id)} className="text-sm">
                  {f.name} · {f.geschwindigkeit} km/h
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="minfix" className="text-xs">
            Min/Colli fix (Entlader+Scanner+Verlader, ohne Weg)
          </Label>
          <div className="flex items-center gap-1">
            <Input
              id="minfix"
              type="number"
              value={minFix.toFixed(3)}
              onChange={(e) => setMinFix(Number(e.target.value) || 0)}
              className="h-8 w-24 text-sm"
              min={0}
              step={0.01}
            />
            <span className="text-xs text-muted-foreground">Min/Colli</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Zeitraum</Label>
          <Select value={zeitraum} onValueChange={setZeitraum}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle" className="text-sm">Alle Tage</SelectItem>
              {istAgg.verfuegbareWochen.map((w) => (
                <SelectItem key={w} value={w} className="text-sm">
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {records.length > 0 && (
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showIstScandaten}
                onChange={(e) => setShowIstScandaten(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              IST aus Scandaten zeigen ({istAgg.zeilen.length})
            </label>
          )}
          <RelationZuordnungDialog />
          {simAuftraege.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-blue-500 border-blue-500/40"
              onClick={clearSimAuftraege}
            >
              {simAuftraege.length} Sim löschen
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={resetAll}
            disabled={sollOverrides.size === 0}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            SOLL zurücksetzen
          </Button>
        </div>
      </div>

      {/* Inhalt */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 pb-24 space-y-3">
          {!hasData && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex gap-3 items-start text-sm">
                  <Calculator className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Noch keine Aufträge vorhanden.</p>
                    <p className="text-muted-foreground">
                      Du hast zwei Wege:
                    </p>
                    <ul className="text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                      <li>
                        <strong>Reine Simulation:</strong> zurück zum Editor → Phase „Planung" → Knopf „Auftrag anlegen"
                        → auf der Halle erst Tor, dann Bereich/Tor klicken, Colli eingeben. So oft du willst.
                      </li>
                      <li>
                        <strong>Aus IST-Daten:</strong> im Editor unter Datei → „Volumen-Daten laden" → z.B. AS Januar 2026,
                        dann landen die Aufträge hier automatisch.
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {hatNurSim && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="py-3 text-xs">
                <div className="flex items-center gap-2">
                  <Calculator className="h-3.5 w-3.5 text-blue-500" />
                  <span><strong>{simAuftraege.length}</strong> Auftrag(e) aus reiner Simulation — keine IST-Daten geladen. Σ-Werte zeigen also nur was du selbst angelegt hast.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {hasData && (
            <>
              {/* Σ-Übersicht oben — NICHT sticky, sonst kollidiert sie mit dem
                  sticky thead der Auftrags-Tabelle (gleiches Scroll-Eltern-
                  Element). Beim Scrollen runter zeigt der sticky tfoot die
                  gleichen Σ-Werte. */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase">IST Σ Kosten</div>
                      <div className="text-lg font-semibold">{fmtEUR(allIstMeta.gesamtKosten)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {fmtNum(allIstMeta.gesamtColli)} Colli · {fmtNum(allIstMeta.gesamtStunden, 1)} h
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase">SOLL/SIM Σ Kosten</div>
                      <div className="text-lg font-semibold text-blue-600">{fmtEUR(sollMeta.gesamtKosten)}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {fmtNum(sollMeta.gesamtColli)} Colli · {fmtNum(sollMeta.gesamtStunden, 1)} h
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase">Δ SOLL vs IST</div>
                      <div className={`text-lg font-semibold ${
                        deltaKosten < 0 ? 'text-green-600' : deltaKosten > 0 ? 'text-red-500' : ''
                      }`}>
                        {deltaKosten < 0 ? '−' : deltaKosten > 0 ? '+' : '±'}
                        {fmtEUR(Math.abs(deltaKosten))}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {deltaStunden < 0 ? '−' : deltaStunden > 0 ? '+' : '±'}{fmtNum(Math.abs(deltaStunden), 1)} h
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {istAgg.meta.zeilenAnzahl} Auftragszeilen · {istAgg.meta.arbeitstage} Arbeitstage ·
                    Ø Weg {fmtNum(istAgg.meta.durchschnittWegM, 1)} m
                    {istAgg.meta.warnungen > 0 && (
                      <span className="text-amber-500 ml-2">
                        · {istAgg.meta.warnungen} Zeilen ohne sauberes Mapping
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Tor-Belegung — pro Tor aggregiert */}
              {torBelegung.length > 0 && (
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-baseline justify-between mb-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tor-Belegung ({torBelegung.length} Tore in Aufträgen)
                      </h3>
                      <span className="text-[10px] text-muted-foreground">sortiert nach Σ Colli</span>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/60 sticky top-0">
                          <tr>
                            <th className="text-left p-1.5 font-medium">Tor</th>
                            <th className="text-right p-1.5 font-medium">Aufträge</th>
                            <th className="text-right p-1.5 font-medium">Σ Colli</th>
                            <th className="text-right p-1.5 font-medium">Σ Std</th>
                            <th className="text-right p-1.5 font-medium">Σ Kosten</th>
                            <th className="text-right p-1.5 font-medium">Anteil</th>
                          </tr>
                        </thead>
                        <tbody>
                          {torBelegung.map((t, idx) => {
                            const anteil = sollMeta.gesamtKosten > 0 ? (t.kosten / sollMeta.gesamtKosten) * 100 : 0;
                            const hot = idx < 3;
                            return (
                              <tr key={t.torId} className="border-t hover:bg-muted/30">
                                <td className={`p-1.5 font-medium ${hot ? 'text-red-500' : ''}`}>
                                  {hot && '🔥 '}{t.torName}
                                </td>
                                <td className="p-1.5 text-right tabular-nums">{t.anzahl}</td>
                                <td className="p-1.5 text-right tabular-nums">{fmtNum(t.colli)}</td>
                                <td className="p-1.5 text-right tabular-nums">{fmtNum(t.stunden, 1)}</td>
                                <td className="p-1.5 text-right tabular-nums font-semibold">{fmtEUR(t.kosten)}</td>
                                <td className="p-1.5 text-right tabular-nums text-muted-foreground">{anteil.toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Auftrags-Tabelle */}
              <Card>
                <CardContent className="p-0">
                  {/* min-w nötig: ohne explizite Mindestbreite quetscht
                      sich die Tabelle und Spalten (insbesondere Colli +
                      Σ Kosten ganz rechts) werden abgeschnitten oder
                      unleserlich. Mit min-w erzwingen wir horizontalen
                      Scroll statt unleserlicher Quetschung. */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[1180px]">
                      <thead className="bg-muted/60 sticky top-0 z-10">
                        <tr>
                          <th className="text-left p-2 font-medium" rowSpan={2}>Von Tor</th>
                          <th className="text-left p-2 font-medium" rowSpan={2}>Nach Bereich</th>
                          <th className="text-right p-2 font-medium" rowSpan={2}>Colli</th>
                          <th className="text-left p-2 font-medium" rowSpan={2}>FFZ</th>
                          <th className="text-right p-2 font-medium" rowSpan={2}>Weg (m)</th>
                          <th className="text-right p-2 font-medium" rowSpan={2}>Min/Colli</th>
                          <th className="text-left p-2 font-medium border-l text-blue-600" rowSpan={2}>SIM-Ziel</th>
                          <th colSpan={2} className="text-center p-2 font-medium border-l">Σ Stunden</th>
                          <th colSpan={2} className="text-center p-2 font-medium border-l">Σ Kosten</th>
                          <th className="p-2 font-medium border-l" rowSpan={2}></th>
                        </tr>
                        <tr className="border-t border-border/50">
                          <th className="text-right p-1.5 font-normal text-muted-foreground border-l">IST</th>
                          <th className="text-right p-1.5 font-normal text-muted-foreground">SOLL</th>
                          <th className="text-right p-1.5 font-normal text-muted-foreground border-l">IST</th>
                          <th className="text-right p-1.5 font-normal text-muted-foreground">SOLL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allIstZeilen.map((ist) => {
                          const soll = sollOverrides.get(ist.id) ?? ist;
                          const edited = sollOverrides.has(ist.id);
                          const isSim = ist.quelle === 'sim';
                          return (
                            <tr
                              key={ist.id}
                              className={`border-t hover:bg-muted/30 ${edited ? 'bg-amber-500/5' : isSim ? 'bg-blue-500/5' : ''}`}
                            >
                              {/* Von Tor */}
                              <td className="p-1.5">
                                {isSim && (
                                  <span className="inline-block text-[9px] uppercase tracking-wider text-blue-500 font-semibold mr-1">Sim</span>
                                )}
                                <TorComboBox
                                  value={soll.torObjectId}
                                  options={torOptions}
                                  onChange={(id) => editZeile(ist.id, { torObjectId: id })}
                                  placeholder={soll.torName}
                                  width={140}
                                />
                              </td>
                              {/* Nach Bereich/Tor */}
                              <td className="p-1.5">
                                <TorComboBox
                                  value={soll.bereichObjectId}
                                  options={bereichOptions}
                                  onChange={(id) => editZeile(ist.id, { bereichObjectId: id })}
                                  placeholder={soll.bereichName}
                                  width={160}
                                />
                              </td>
                              {/* Colli — pr-6, sonst überlappen die nativen
                                  Spinner-Pfeile (Firefox) die letzte Ziffer. */}
                              <td className="p-1.5">
                                <Input
                                  type="number"
                                  value={soll.colli}
                                  onChange={(e) =>
                                    editZeile(ist.id, { colli: Math.max(0, Number(e.target.value) || 0) })
                                  }
                                  className="h-7 w-20 text-right pr-6 text-xs"
                                  min={0}
                                />
                              </td>
                              {/* FFZ */}
                              <td className="p-1.5">
                                <Select
                                  value={soll.ffzId != null ? String(soll.ffzId) : ''}
                                  onValueChange={(v) =>
                                    editZeile(ist.id, { ffzId: v ? Number(v) : null })
                                  }
                                >
                                  <SelectTrigger className="h-7 w-[130px] text-xs">
                                    <SelectValue placeholder={soll.ffzName}>{soll.ffzName}</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ffzList.map((f) => (
                                      <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                                        {f.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              {/* Weg — bei Warnung absichtlich "!" statt 0,
                                  weil 0 (= "kein Weg nötig") semantisch falsch
                                  wäre. Der Tooltip erklärt den genauen Grund. */}
                              <td className="p-1.5 text-right">
                                {soll.warnung ? (
                                  <span
                                    className="text-amber-500 font-bold cursor-help"
                                    title={warnungText(soll.warnung)}
                                    aria-label={warnungText(soll.warnung)}
                                  >
                                    !
                                  </span>
                                ) : (
                                  fmtNum(soll.distanzM, 0)
                                )}
                              </td>
                              {/* Min/Colli */}
                              <td className="p-1.5 text-right tabular-nums">
                                {soll.minProColli.toFixed(2)}
                              </td>
                              {/* SIM-Ziel-Tor (nur für IST-Sim-Aufträge). Wenn
                                  keine SIM gesetzt: leerer Placeholder mit
                                  klarem Text + Tooltip, damit Alex versteht
                                  was die Spalte tut. */}
                              <td
                                className="p-1.5 border-l"
                                title={
                                  isSim && ist.simAuftragId
                                    ? 'Keine Simulation für diesen Auftrag — Tor wählen für Was-wäre-wenn-Vergleich'
                                    : 'Nur für Sim-Aufträge verfügbar — IST-Zeilen aus Scandaten haben kein Sim-Ziel'
                                }
                              >
                                {isSim && ist.simAuftragId ? (
                                  (() => {
                                    const orig = simAuftraege.find((a) => a.id === ist.simAuftragId);
                                    const vonId = orig?.vonObjectId ?? -1;
                                    const sim = simVarianteByParent.get(ist.simAuftragId!);
                                    const simZielId = sim?.bereichObjectId ?? null;
                                    const torChoices = torOptions.filter((t) => t.id !== vonId && t.type === 'tor');
                                    return (
                                      <TorComboBox
                                        value={simZielId}
                                        options={torChoices}
                                        onChange={(id) => {
                                          if (id == null) removeSimVarianteFor(ist.simAuftragId!);
                                          else forkSimAuftragAsSim(ist.simAuftragId!, id);
                                        }}
                                        placeholder="— kein SIM —"
                                        width={140}
                                        allowNone
                                        noneLabel="— kein SIM —"
                                      />
                                    );
                                  })()
                                ) : (
                                  <span className="text-[11px] text-muted-foreground italic">— kein SIM —</span>
                                )}
                              </td>
                              {/* IST Std */}
                              <td className="p-1.5 text-right border-l tabular-nums text-muted-foreground">
                                {fmtNum(ist.gesamtStunden, 1)}
                              </td>
                              {/* SOLL Std */}
                              <td className={`p-1.5 text-right tabular-nums ${edited ? 'font-semibold' : ''}`}>
                                {fmtNum(soll.gesamtStunden, 1)}
                              </td>
                              {/* IST Kosten */}
                              <td className="p-1.5 text-right border-l tabular-nums text-muted-foreground">
                                {fmtEUR(ist.kosten)}
                              </td>
                              {/* SOLL Kosten */}
                              <td className={`p-1.5 text-right tabular-nums ${edited ? 'font-semibold' : ''}`}>
                                {fmtEUR(soll.kosten)}
                              </td>
                              {/* Reset / Sim-Löschen + Stapler abfahren */}
                              <td className="p-1.5 border-l">
                                <div className="flex flex-col gap-1 items-start">
                                  {isSim && ist.simAuftragId ? (
                                    <>
                                      {(() => {
                                        const orig = simAuftraege.find((a) => a.id === ist.simAuftragId);
                                        const sim = simVarianteByParent.get(ist.simAuftragId!);
                                        const simOrig = sim
                                          ? simAuftraege.find((a) => a.parentId === ist.simAuftragId!)
                                          : null;
                                        // Stapler-Animation läuft im Canvas auf /projekt/ — Animation-State
                                        // + Tor-Fokus persistieren wir und navigieren dann dorthin, sonst
                                        // sieht der User die Animation nicht (sie spielt im Hintergrund).
                                        const startStapler = (id: string, fokusTorId: number) => {
                                          setFocusedTor(fokusTorId);
                                          setAnimationActive(id);
                                          requestAnimationFrame(() => {
                                            window.location.href = '/topis-saas/projekt/';
                                          });
                                        };
                                        return (
                                          <div className="flex gap-1">
                                            {orig && (
                                              <button
                                                type="button"
                                                onClick={() => startStapler(orig.id, orig.vonObjectId)}
                                                className={`touch-tap-md text-[10px] px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-600 hover:bg-amber-500/10 ${animationActiveId === orig.id ? 'bg-amber-500/20' : ''}`}
                                                title="IST-Stapler abfahren (öffnet Canvas)"
                                              >
                                                ▶ IST
                                              </button>
                                            )}
                                            {simOrig && (
                                              <button
                                                type="button"
                                                onClick={() => startStapler(simOrig.id, simOrig.vonObjectId)}
                                                className={`touch-tap-md text-[10px] px-1.5 py-0.5 rounded border border-blue-500/40 text-blue-600 hover:bg-blue-500/10 ${animationActiveId === simOrig.id ? 'bg-blue-500/20' : ''}`}
                                                title="SIM-Stapler abfahren (öffnet Canvas)"
                                              >
                                                ▶ SIM
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })()}
                                      <button
                                        type="button"
                                        onClick={() => removeSimAuftrag(ist.simAuftragId!)}
                                        className="touch-tap-sm text-[11px] text-red-500 hover:text-red-700 underline inline-flex items-center"
                                        title="Sim-Auftrag löschen"
                                      >
                                        löschen
                                      </button>
                                    </>
                                  ) : (
                                    edited && (
                                      <button
                                        type="button"
                                        onClick={() => resetZeile(ist.id)}
                                        className="touch-tap-sm text-[11px] text-muted-foreground hover:text-foreground underline inline-flex items-center"
                                        title="Zeile auf IST zurücksetzen"
                                      >
                                        reset
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* tfoot — Spalten MÜSSEN 1:1 zum thead passen, sonst
                          rutschen die Werte in die falsche Spalte. Reihenfolge:
                          Von Tor (1) · Nach Bereich (2) · Colli (3) · FFZ (4)
                          · Weg m (5) · Min/Colli (6) · SIM-Ziel (7) ·
                          IST Std (8) · SOLL Std (9) · IST Kosten (10) ·
                          SOLL Kosten (11) · Aktionen (12) = 12 Spalten. */}
                      <tfoot className="bg-muted/60 sticky bottom-0">
                        <tr className="border-t-2 font-semibold">
                          {/* 1+2: Label */}
                          <td className="p-2" colSpan={2}>Σ Gesamt</td>
                          {/* 3: Σ Colli — explizit gelabelt, weil Alex sonst
                              die Zahl nicht zuordnen konnte. */}
                          <td className="p-2 text-right tabular-nums" title="Σ Colli">
                            <span className="text-[10px] text-muted-foreground mr-1">Σ</span>
                            {fmtNum(allIstMeta.gesamtColli)}
                          </td>
                          {/* 4: FFZ — keine Summe sinnvoll */}
                          <td className="p-2"></td>
                          {/* 5: Σ Weg-Meter — formatiert als km wenn > 999 m.
                              Nur Auftragszeilen ohne Warnung fließen ein. */}
                          <td
                            className="p-2 text-right tabular-nums"
                            title="Σ Weg-Meter aller Auftragszeilen (Einfachweg, ohne Zeilen mit Warnung)"
                          >
                            <span className="text-[10px] text-muted-foreground mr-1">Σ</span>
                            {fmtMeterOrKm(sollMeta.gesamtWegM)}
                          </td>
                          {/* 6: Ø Min/Colli (gewichtet) — Summe wäre sinnlos,
                              weil es eine Rate ist. Tooltip erklärt das. */}
                          <td
                            className="p-2 text-right tabular-nums"
                            title="Ø Min pro Colli, gewichtet nach Colli-Anzahl"
                          >
                            <span className="text-[10px] text-muted-foreground mr-1">Ø</span>
                            {sollMeta.avgMinProColli.toFixed(2)}
                          </td>
                          {/* 7: SIM-Ziel — leer */}
                          <td className="p-2 border-l"></td>
                          {/* 8+9: Σ Stunden IST/SOLL */}
                          <td className="p-2 text-right border-l tabular-nums">{fmtNum(allIstMeta.gesamtStunden, 1)}</td>
                          <td className="p-2 text-right tabular-nums">{fmtNum(sollMeta.gesamtStunden, 1)}</td>
                          {/* 10+11: Σ Kosten IST/SOLL */}
                          <td className="p-2 text-right border-l tabular-nums">{fmtEUR(allIstMeta.gesamtKosten)}</td>
                          <td className="p-2 text-right tabular-nums">{fmtEUR(sollMeta.gesamtKosten)}</td>
                          {/* 12: Aktionen — leer */}
                          <td className="p-2 border-l"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
