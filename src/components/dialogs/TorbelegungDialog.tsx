'use client';

import { useState, useMemo, useRef } from 'react';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { berechneSpitzenauslastung, berechneTorbelegungKPIs, berechneAnkunftsverteilung } from '@/lib/torbelegung-rechner';
import { SCHMID_FAHRPLAN } from '@/lib/data/schmid-fahrplan';
import { getHeatmapColor } from '@/lib/heatmap-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CalendarClock, Truck, ArrowRight, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Fahrplan } from '@/types/torbelegung';
import { parseAnkunftszeitenExcel } from '@/lib/fahrplan-import';

export function TorbelegungDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [activeTab, setActiveTab] = useState('se');

  const fahrplan = useBetriebsdatenStore((s) => s.fahrplan);
  const setFahrplan = useBetriebsdatenStore((s) => s.setFahrplan);
  const fahrplanFileRef = useRef<HTMLInputElement>(null);

  const activeFahrplan = fahrplan;

  const handleLoadFahrplan = (source: string) => {
    if (source === 'schmid_halle6') {
      setFahrplan(SCHMID_FAHRPLAN);
      toast.success(`Fahrplan "${SCHMID_FAHRPLAN.name}" geladen (${SCHMID_FAHRPLAN.seAnkuenfte.length} SE, ${SCHMID_FAHRPLAN.saAbfahrten.length} SA)`);
    }
  };

  const handleFahrplanExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fp = await parseAnkunftszeitenExcel(file);
      setFahrplan(fp);
      toast.success(`Fahrplan aus Excel geladen: ${fp.seAnkuenfte.length} SE-Ankünfte, ${fp.torbelegung.length} Torbelegungen`);
    } catch (err) {
      toast.error('Fehler beim Excel-Import: ' + (err as Error).message);
    }
    // Reset file input
    if (fahrplanFileRef.current) fahrplanFileRef.current.value = '';
  };

  // KPIs
  const spitzenAnalyse = useMemo(() =>
    activeFahrplan ? berechneSpitzenauslastung(activeFahrplan) : null,
    [activeFahrplan]
  );

  const torbelegungKPIs = useMemo(() =>
    activeFahrplan ? berechneTorbelegungKPIs(activeFahrplan.torbelegung) : null,
    [activeFahrplan]
  );

  const ankunftsverteilung = useMemo(() =>
    activeFahrplan ? berechneAnkunftsverteilung(activeFahrplan) : null,
    [activeFahrplan]
  );

  // SE Torbelegung Heatmap data
  const seTore = useMemo(() => {
    if (!activeFahrplan) return [];
    const toreSet = new Set(activeFahrplan.torbelegung.map(z => z.tor));
    return [...toreSet].sort();
  }, [activeFahrplan]);

  const seHalbstunden = useMemo(() => {
    const hs: { stunde: number; minute: number; label: string }[] = [];
    for (let h = 0; h <= 5; h++) {
      hs.push({ stunde: h, minute: 0, label: `${h.toString().padStart(2, '0')}:00` });
      hs.push({ stunde: h, minute: 30, label: `${h.toString().padStart(2, '0')}:30` });
    }
    return hs;
  }, []);

  // SA sorted by time
  const saAbfahrtenSorted = useMemo(() => {
    if (!activeFahrplan) return [];
    return [...activeFahrplan.saAbfahrten].sort((a, b) => {
      const [ah, am] = a.sollZeit.split(':').map(Number);
      const [bh, bm] = b.sollZeit.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });
  }, [activeFahrplan]);

  // Filter state for Fahrplan tab
  const [fahrplanFilter, setFahrplanFilter] = useState<'alle' | 'SE' | 'SA'>('alle');

  const alleFahrplanEntries = useMemo(() => {
    if (!activeFahrplan) return [];
    const entries: { typ: 'SE' | 'SA'; relation: string; zeit: string; netzwerk?: string; depot?: string; art?: string }[] = [];
    for (const se of activeFahrplan.seAnkuenfte) {
      entries.push({ typ: 'SE', relation: se.relation, zeit: se.sollZeit, netzwerk: se.netzwerk });
    }
    for (const sa of activeFahrplan.saAbfahrten) {
      entries.push({ typ: 'SA', relation: sa.relation, zeit: sa.sollZeit, depot: sa.depot, art: sa.art });
    }
    // Sort by time
    entries.sort((a, b) => {
      const [ah, am] = a.zeit.split(':').map(Number);
      const [bh, bm] = b.zeit.split(':').map(Number);
      return (ah * 60 + am) - (bh * 60 + bm);
    });
    if (fahrplanFilter !== 'alle') {
      return entries.filter(e => e.typ === fahrplanFilter);
    }
    return entries;
  }, [activeFahrplan, fahrplanFilter]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <CalendarClock className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Torbelegung</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Verladeplan / Torbelegung</DialogTitle>
          <DialogDescription>
            Zeitliche Steuerung: Wann kommt welcher LKW an welches Tor? SE-Ankünfte, SA-Abfahrten, Torbelegung.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Selection */}
          <div className="flex items-center gap-2">
            <Select value={selectedSource} onValueChange={(v) => { setSelectedSource(v); handleLoadFahrplan(v); }}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Fahrplan-Daten auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schmid_halle6">Demo-Fahrplan ({SCHMID_FAHRPLAN.seAnkuenfte.length} SE + {SCHMID_FAHRPLAN.saAbfahrten.length} SA)</SelectItem>
              </SelectContent>
            </Select>
            <input
              ref={fahrplanFileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFahrplanExcelImport}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fahrplanFileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-1" />
              Aus Excel
            </Button>
            {activeFahrplan && (
              <Badge variant="secondary">{activeFahrplan.name}</Badge>
            )}
          </div>

          {/* KPI Bar */}
          {activeFahrplan && spitzenAnalyse && (
            <div className="grid grid-cols-5 gap-2 text-sm bg-muted/50 p-3 rounded-lg">
              <div>
                <div className="text-muted-foreground text-xs">SE-Ankünfte</div>
                <div className="font-bold">{activeFahrplan.seAnkuenfte.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">SA-Abfahrten</div>
                <div className="font-bold">{activeFahrplan.saAbfahrten.length}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Spitzenstunde</div>
                <div className="font-bold">{spitzenAnalyse.spitzenStunde.stunde.toString().padStart(2, '0')}:{spitzenAnalyse.spitzenStunde.minute.toString().padStart(2, '0')}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Aktive Tore</div>
                <div className="font-bold">{spitzenAnalyse.aktiveTore}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Verladebereiche</div>
                <div className="font-bold">{activeFahrplan.verladebereiche.length}</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          {activeFahrplan && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="se">SE Torbelegung</TabsTrigger>
                <TabsTrigger value="sa">SA Verladeplan</TabsTrigger>
                <TabsTrigger value="fahrplan">Fahrplan</TabsTrigger>
              </TabsList>

              {/* Tab 1: SE Torbelegung Heatmap */}
              <TabsContent value="se" className="space-y-3">
                <h4 className="text-sm font-medium">SE Torbelegung (Heatmap: Ø Fahrzeuge pro Halbstunde)</h4>
                {activeFahrplan.torbelegung.length > 0 ? (
                  <ScrollArea className="h-64 border rounded-md">
                    <table className="w-full text-xs">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-1.5 text-left w-16">Tor</th>
                          {seHalbstunden.map(hs => (
                            <th key={hs.label} className="p-1.5 text-center min-w-[52px]">{hs.label}</th>
                          ))}
                          <th className="p-1.5 text-right">Ø/Tag</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seTore.map(tor => {
                          const torZellen = activeFahrplan.torbelegung.filter(z => z.tor === tor);
                          const torTotal = torZellen.reduce((s, z) => s + z.auslastung, 0);
                          return (
                            <tr key={tor} className="border-t">
                              <td className="p-1.5 font-medium">{tor}</td>
                              {seHalbstunden.map(hs => {
                                const zelle = torZellen.find(z => z.stunde === hs.stunde && z.minute === hs.minute);
                                const wert = zelle?.auslastung || 0;
                                const intensity = Math.min(wert / 1.5, 1); // 1.5 = Skalierung
                                return (
                                  <td key={hs.label} className="p-1 text-center" style={{
                                    backgroundColor: wert > 0 ? getHeatmapColor(intensity, 'gruen-rot', 0.7) : undefined,
                                  }}>
                                    {wert > 0 ? wert.toFixed(2) : ''}
                                  </td>
                                );
                              })}
                              <td className="p-1.5 text-right font-medium">{torTotal.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Torbelegungsdaten vorhanden (Template-Daten zeigen exemplarische Belegung).</p>
                )}

                {/* Ankunftsverteilung */}
                {ankunftsverteilung && ankunftsverteilung.length > 0 && (
                  <>
                    <Separator />
                    <h4 className="text-sm font-medium">SE-Ankunftsverteilung (kumuliert)</h4>
                    <ScrollArea className="h-40 border rounded-md">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="p-1.5 text-left">Zeit</th>
                            <th className="p-1.5 text-right">Ankünfte</th>
                            <th className="p-1.5 text-right">Kumuliert</th>
                            <th className="p-1.5 text-right">%</th>
                            <th className="p-1.5 w-40">Fortschritt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ankunftsverteilung.filter(a => a.anzahl > 0).map(a => (
                            <tr key={a.zeit} className="border-t">
                              <td className="p-1.5 font-medium">{a.zeit}</td>
                              <td className="p-1.5 text-right">{a.anzahl}</td>
                              <td className="p-1.5 text-right">{a.kumuliert}</td>
                              <td className="p-1.5 text-right">{a.prozent.toFixed(1)}%</td>
                              <td className="p-1.5">
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${a.prozent}%` }} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </>
                )}

                {torbelegungKPIs && (
                  <div className="grid grid-cols-4 gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                    <div>
                      <div className="text-muted-foreground text-xs">Ø Auslastung/Slot</div>
                      <div className="font-medium">{torbelegungKPIs.durchschnittlicheAuslastung.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Belegte Slots</div>
                      <div className="font-medium">{torbelegungKPIs.belegteSlots}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Leere Tore</div>
                      <div className="font-medium">{torbelegungKPIs.leereTore}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Überlastet (&ge;2.0)</div>
                      <div className="font-medium">{torbelegungKPIs.ueberlasteteTore.length > 0 ? torbelegungKPIs.ueberlasteteTore.join(', ') : 'Keine'}</div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: SA Verladeplan */}
              <TabsContent value="sa" className="space-y-3">
                <h4 className="text-sm font-medium">SA Verladeplan nach Bereichen</h4>
                {activeFahrplan.verladebereiche.length > 0 ? (
                  <ScrollArea className="h-64 border rounded-md">
                    <table className="w-full text-xs">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-1.5 text-left">Bereich</th>
                          <th className="p-1.5 text-right">Abfahrten</th>
                          <th className="p-1.5 text-right">Colli/Tag</th>
                          <th className="p-1.5 text-left">Relationen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeFahrplan.verladebereiche.map(vb => {
                          const maxColli = Math.max(...activeFahrplan.verladebereiche.map(v => v.colliProTag));
                          const intensity = maxColli > 0 ? vb.colliProTag / maxColli : 0;
                          return (
                            <tr key={vb.bereich} className="border-t">
                              <td className="p-1.5 font-medium" style={{
                                backgroundColor: getHeatmapColor(intensity, 'blau-rot', 0.3),
                              }}>{vb.bereich}</td>
                              <td className="p-1.5 text-right">{vb.abfahrten}</td>
                              <td className="p-1.5 text-right font-medium">{vb.colliProTag}</td>
                              <td className="p-1.5">
                                <div className="flex flex-wrap gap-1">
                                  {vb.relationen.map(r => (
                                    <Badge key={r.relation} variant="outline" className="text-[10px]">
                                      {r.relation} ({r.verladeende})
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t bg-muted/50 font-medium">
                          <td className="p-1.5">Gesamt</td>
                          <td className="p-1.5 text-right">{activeFahrplan.verladebereiche.reduce((s, v) => s + v.abfahrten, 0)}</td>
                          <td className="p-1.5 text-right">{activeFahrplan.verladebereiche.reduce((s, v) => s + v.colliProTag, 0).toLocaleString()}</td>
                          <td className="p-1.5"></td>
                        </tr>
                      </tbody>
                    </table>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Verladebereiche definiert.</p>
                )}

                <Separator />

                {/* SA Abfahrten Tabelle */}
                <h4 className="text-sm font-medium">SA Abfahrten nach Zeit</h4>
                <ScrollArea className="h-48 border rounded-md">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-1.5 text-left">Zeit</th>
                        <th className="p-1.5 text-left">Relation</th>
                        <th className="p-1.5 text-left">Depot</th>
                        <th className="p-1.5 text-left">WB</th>
                        <th className="p-1.5 text-left">Art</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saAbfahrtenSorted.map((sa, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-1.5 font-medium">{sa.sollZeit}</td>
                          <td className="p-1.5">{sa.relation}</td>
                          <td className="p-1.5">{sa.depot}</td>
                          <td className="p-1.5">{sa.wechselbruecke}</td>
                          <td className="p-1.5">
                            <Badge variant={sa.art === 'BG' ? 'default' : sa.art === 'RL' ? 'secondary' : 'outline'} className="text-[10px]">
                              {sa.art}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </TabsContent>

              {/* Tab 3: Fahrplan */}
              <TabsContent value="fahrplan" className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">Fahrplan</h4>
                  <div className="flex gap-1">
                    <Button size="sm" variant={fahrplanFilter === 'alle' ? 'default' : 'outline'} onClick={() => setFahrplanFilter('alle')} className="h-6 text-xs px-2">
                      Alle ({activeFahrplan.seAnkuenfte.length + activeFahrplan.saAbfahrten.length})
                    </Button>
                    <Button size="sm" variant={fahrplanFilter === 'SE' ? 'default' : 'outline'} onClick={() => setFahrplanFilter('SE')} className="h-6 text-xs px-2">
                      SE ({activeFahrplan.seAnkuenfte.length})
                    </Button>
                    <Button size="sm" variant={fahrplanFilter === 'SA' ? 'default' : 'outline'} onClick={() => setFahrplanFilter('SA')} className="h-6 text-xs px-2">
                      SA ({activeFahrplan.saAbfahrten.length})
                    </Button>
                  </div>
                </div>

                {/* Zeitstrahl Visualisierung */}
                <div className="border rounded-md p-3 space-y-2">
                  <div className="text-xs text-muted-foreground mb-1">Zeitstrahl (00:00 – 23:00)</div>
                  <div className="relative h-16">
                    {/* Achse */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
                    {/* Stunden-Marker */}
                    {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map(h => (
                      <div key={h} className="absolute top-1/2 text-[9px] text-muted-foreground" style={{ left: `${(h / 24) * 100}%`, transform: 'translateX(-50%)' }}>
                        <div className="w-px h-2 bg-border mx-auto" />
                        <div className="mt-1">{h.toString().padStart(2, '0')}</div>
                      </div>
                    ))}
                    {/* SE Punkte (oben, blau) */}
                    {activeFahrplan.seAnkuenfte.map((se, i) => {
                      const [h, m] = se.sollZeit.split(':').map(Number);
                      const pct = ((h * 60 + m) / (24 * 60)) * 100;
                      return (
                        <div key={`se-${i}`} className="absolute w-1.5 h-1.5 rounded-full bg-blue-500" style={{ left: `${pct}%`, top: 'calc(50% - 8px)', transform: 'translate(-50%, -50%)' }} title={`SE ${se.relation} ${se.sollZeit}`} />
                      );
                    })}
                    {/* SA Punkte (unten, orange) */}
                    {activeFahrplan.saAbfahrten.map((sa, i) => {
                      const [h, m] = sa.sollZeit.split(':').map(Number);
                      const pct = ((h * 60 + m) / (24 * 60)) * 100;
                      return (
                        <div key={`sa-${i}`} className="absolute w-1.5 h-1.5 rounded-full bg-orange-500" style={{ left: `${pct}%`, top: 'calc(50% + 8px)', transform: 'translate(-50%, -50%)' }} title={`SA ${sa.relation} ${sa.sollZeit}`} />
                      );
                    })}
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> SE-Ankünfte</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> SA-Abfahrten</span>
                  </div>
                </div>

                {/* Fahrplan Tabelle */}
                <ScrollArea className="h-64 border rounded-md">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-1.5 text-left">Zeit</th>
                        <th className="p-1.5 text-center">Typ</th>
                        <th className="p-1.5 text-left">Relation</th>
                        <th className="p-1.5 text-left">Netzwerk/Depot</th>
                        <th className="p-1.5 text-left">Art</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alleFahrplanEntries.map((entry, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-1.5 font-medium">{entry.zeit}</td>
                          <td className="p-1.5 text-center">
                            <Badge variant={entry.typ === 'SE' ? 'default' : 'secondary'} className="text-[10px]">
                              {entry.typ}
                            </Badge>
                          </td>
                          <td className="p-1.5">{entry.relation}</td>
                          <td className="p-1.5 text-muted-foreground">{entry.netzwerk || entry.depot || ''}</td>
                          <td className="p-1.5">{entry.art || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          {!activeFahrplan && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Wählen Sie eine Fahrplan-Datenquelle aus, um die Torbelegung anzuzeigen.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
