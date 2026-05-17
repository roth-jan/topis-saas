'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, AlertTriangle, RefreshCw, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const fmtEUR = (v: number) =>
  v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const fmtNum = (v: number, d = 0) =>
  v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });

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
  const ergebnis = useProzessmodellStore((s) => s.ergebnis);

  // Stundensatz + Default-FFZ + Min/Colli-Fix als Parameter oben
  const [stundensatz, setStundensatz] = useState(35);
  const [defaultFfzId, setDefaultFfzId] = useState<number | null>(ffzList[0]?.id ?? null);
  // Fixer Anteil aus dem kalibrierten Prozessmodell — Entlader+Scanner+Verlader ohne Weg
  const fixDefault =
    ergebnis && ergebnis.minProColli > 0
      ? Math.max(0, ergebnis.minProColli - 0.75) // grober Abzug Verteiler-Anteil (0.75 bei AS)
      : 1.17;
  const [minFix, setMinFix] = useState(fixDefault);
  const [zeitraum, setZeitraum] = useState<string>('alle'); // 'alle' oder ISO-Woche

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

  // Komplette IST-Liste = aggregierte Scandaten + simulierte Aufträge
  const allIstZeilen = useMemo(() => [...simZeilen, ...istAgg.zeilen], [simZeilen, istAgg.zeilen]);

  // SOLL-Zeilen: Kopie vom IST, vom User editierbar
  const [sollOverrides, setSollOverrides] = useState<Map<string, Auftragszeile>>(new Map());
  const sollZeilen: Auftragszeile[] = useMemo(() => {
    return allIstZeilen.map((z) => sollOverrides.get(z.id) ?? z);
  }, [allIstZeilen, sollOverrides]);

  const sollMeta = useMemo(() => {
    const gColli = sollZeilen.reduce((s, z) => s + z.colli, 0);
    const gStd = sollZeilen.reduce((s, z) => s + z.gesamtStunden, 0);
    const gKos = sollZeilen.reduce((s, z) => s + z.kosten, 0);
    return { gesamtColli: gColli, gesamtStunden: gStd, gesamtKosten: gKos };
  }, [sollZeilen]);

  // Komplette IST-Meta inkl. Sim-Aufträge
  const allIstMeta = useMemo(() => ({
    gesamtColli: allIstZeilen.reduce((s, z) => s + z.colli, 0),
    gesamtStunden: allIstZeilen.reduce((s, z) => s + z.gesamtStunden, 0),
    gesamtKosten: allIstZeilen.reduce((s, z) => s + z.kosten, 0),
    simAnzahl: simZeilen.length,
    simKosten: simZeilen.reduce((s, z) => s + z.kosten, 0),
    simStunden: simZeilen.reduce((s, z) => s + z.gesamtStunden, 0),
    simColli: simZeilen.reduce((s, z) => s + z.colli, 0),
  }), [allIstZeilen, simZeilen]);

  const deltaKosten = sollMeta.gesamtKosten - allIstMeta.gesamtKosten;
  const deltaStunden = sollMeta.gesamtStunden - allIstMeta.gesamtStunden;

  function editZeile(id: string, edit: Partial<Pick<Auftragszeile, 'torObjectId' | 'bereichObjectId' | 'colli' | 'ffzId'>>) {
    const baseline = sollOverrides.get(id) ?? istAgg.zeilen.find((z) => z.id === id);
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
  const bereichOptions = useMemo(
    () => objects.filter((o) => o.type === 'bereich' && o.name).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [objects]
  );

  const hasData = records.length > 0;

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
        <div className="ml-auto flex items-center gap-2">
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
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {!hasData && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex gap-3 items-start text-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Keine Scandaten geladen.</p>
                    <p className="text-muted-foreground">
                      Im Editor unter Datei → „Volumen-Daten laden (Scans)" → z.B. AS Januar 2026.
                      Anschließend kommen die Auftragszeilen hier automatisch.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {hasData && (
            <>
              {/* Σ-Übersicht oben (sticky) */}
              <Card className="border-primary/30 bg-primary/5 sticky top-0 z-10">
                <CardContent className="py-3">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase">Σ Colli</div>
                      <div className="text-lg font-semibold">{fmtNum(allIstMeta.gesamtColli)}</div>
                      {allIstMeta.simAnzahl > 0 && (
                        <div className="text-[10px] text-amber-500">
                          davon {fmtNum(allIstMeta.simColli)} aus {allIstMeta.simAnzahl} Sim
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase">Σ Stunden</div>
                      <div className="text-lg font-semibold">{fmtNum(allIstMeta.gesamtStunden, 1)}</div>
                      {allIstMeta.simAnzahl > 0 && (
                        <div className="text-[10px] text-amber-500">
                          davon {fmtNum(allIstMeta.simStunden, 1)} h Sim
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase">Σ Kosten</div>
                      <div className="text-lg font-semibold">{fmtEUR(allIstMeta.gesamtKosten)}</div>
                      {allIstMeta.simAnzahl > 0 && (
                        <div className="text-[10px] text-amber-500">
                          davon {fmtEUR(allIstMeta.simKosten)} Sim
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground uppercase">Δ SOLL</div>
                      <div className={`text-lg font-semibold ${
                        deltaKosten < 0 ? 'text-green-600' : deltaKosten > 0 ? 'text-red-500' : ''
                      }`}>
                        {deltaKosten < 0 ? '−' : deltaKosten > 0 ? '+' : '±'}
                        {fmtEUR(Math.abs(deltaKosten))}
                        <span className="text-xs font-normal ml-1 text-muted-foreground">
                          ({deltaStunden < 0 ? '−' : '+'}{fmtNum(Math.abs(deltaStunden), 1)} h)
                        </span>
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

              {/* Auftrags-Tabelle */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 sticky top-0">
                        <tr>
                          <th className="text-left p-2 font-medium" rowSpan={2}>Von Tor</th>
                          <th className="text-left p-2 font-medium" rowSpan={2}>Nach Bereich</th>
                          <th className="text-right p-2 font-medium" rowSpan={2}>Colli</th>
                          <th className="text-left p-2 font-medium" rowSpan={2}>FFZ</th>
                          <th className="text-right p-2 font-medium" rowSpan={2}>Weg (m)</th>
                          <th className="text-right p-2 font-medium" rowSpan={2}>Min/Colli</th>
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
                                <Select
                                  value={soll.torObjectId != null ? String(soll.torObjectId) : ''}
                                  onValueChange={(v) =>
                                    editZeile(ist.id, { torObjectId: v ? Number(v) : null })
                                  }
                                >
                                  <SelectTrigger className="h-7 w-[140px] text-xs">
                                    <SelectValue placeholder={soll.torName}>{soll.torName}</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {torOptions.map((o) => (
                                      <SelectItem key={o.id} value={String(o.id)} className="text-xs">
                                        {o.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              {/* Nach Bereich */}
                              <td className="p-1.5">
                                <Select
                                  value={soll.bereichObjectId != null ? String(soll.bereichObjectId) : ''}
                                  onValueChange={(v) =>
                                    editZeile(ist.id, { bereichObjectId: v ? Number(v) : null })
                                  }
                                >
                                  <SelectTrigger className="h-7 w-[160px] text-xs">
                                    <SelectValue placeholder={soll.bereichName}>{soll.bereichName}</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {bereichOptions.map((o) => (
                                      <SelectItem key={o.id} value={String(o.id)} className="text-xs">
                                        {o.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              {/* Colli */}
                              <td className="p-1.5">
                                <Input
                                  type="number"
                                  value={soll.colli}
                                  onChange={(e) =>
                                    editZeile(ist.id, { colli: Math.max(0, Number(e.target.value) || 0) })
                                  }
                                  className="h-7 w-20 text-right text-xs"
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
                              {/* Weg */}
                              <td className="p-1.5 text-right">
                                {soll.warnung ? (
                                  <span className="text-amber-500" title={soll.warnung}>!</span>
                                ) : (
                                  fmtNum(soll.distanzM, 0)
                                )}
                              </td>
                              {/* Min/Colli */}
                              <td className="p-1.5 text-right tabular-nums">
                                {soll.minProColli.toFixed(2)}
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
                              {/* Reset / Sim-Löschen */}
                              <td className="p-1.5 border-l">
                                {isSim && ist.simAuftragId ? (
                                  <button
                                    type="button"
                                    onClick={() => removeSimAuftrag(ist.simAuftragId!)}
                                    className="text-[11px] text-red-500 hover:text-red-700 underline"
                                    title="Sim-Auftrag löschen"
                                  >
                                    löschen
                                  </button>
                                ) : (
                                  edited && (
                                    <button
                                      type="button"
                                      onClick={() => resetZeile(ist.id)}
                                      className="text-[11px] text-muted-foreground hover:text-foreground underline"
                                      title="Zeile auf IST zurücksetzen"
                                    >
                                      reset
                                    </button>
                                  )
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-muted/60 sticky bottom-0">
                        <tr className="border-t-2 font-semibold">
                          <td className="p-2" colSpan={2}>Σ</td>
                          <td className="p-2 text-right">{fmtNum(allIstMeta.gesamtColli)}</td>
                          <td className="p-2"></td>
                          <td className="p-2 text-right">{fmtNum(istAgg.meta.durchschnittWegM, 0)}</td>
                          <td className="p-2 text-right">Ø</td>
                          <td className="p-2 text-right border-l tabular-nums">{fmtNum(allIstMeta.gesamtStunden, 1)}</td>
                          <td className="p-2 text-right tabular-nums">{fmtNum(sollMeta.gesamtStunden, 1)}</td>
                          <td className="p-2 text-right border-l tabular-nums">{fmtEUR(allIstMeta.gesamtKosten)}</td>
                          <td className="p-2 text-right tabular-nums">{fmtEUR(sollMeta.gesamtKosten)}</td>
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
      </ScrollArea>
    </div>
  );
}
