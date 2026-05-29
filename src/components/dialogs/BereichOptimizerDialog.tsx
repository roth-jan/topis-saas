'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTopisStore } from '@/lib/store';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { optimizeBereichPositions, type OptimizerErgebnis } from '@/lib/bereich-optimizer';
import { optimizeTorBelegung, type TorBelegungsErgebnis } from '@/lib/tor-belegung-optimizer';
import { Sparkles, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BereichOptimizerDialog({ open, onOpenChange }: Props) {
  const objects = useTopisStore((s) => s.objects);
  const gaenge = useTopisStore((s) => s.gaenge);
  const halls = useTopisStore((s) => s.halls);
  const activeHallId = useTopisStore((s) => s.activeHallId);
  const updateObject = useTopisStore((s) => s.updateObject);
  const records = useBetriebsdatenStore((s) => s.scandatenRecords);
  const relationZuordnungen = useBetriebsdatenStore((s) => s.relationZuordnungen);
  const setRelationZuordnungenStore = useBetriebsdatenStore((s) => s.setRelationZuordnungen);
  const simAuftraege = useTopisStore((s) => s.simAuftraege);
  const updateSimAuftrag = useTopisStore((s) => s.updateSimAuftrag);

  const aktiv = halls.find((h) => h.id === activeHallId) || halls[0];
  const [computing, setComputing] = useState(false);
  const [ergebnis, setErgebnis] = useState<OptimizerErgebnis | null>(null);
  const [torErgebnis, setTorErgebnis] = useState<TorBelegungsErgebnis | null>(null);
  const hatBereiche = objects.some((o) => o.type === 'bereich');
  const [modus, setModus] = useState<'bereich' | 'tor'>(hatBereiche ? 'bereich' : 'tor');

  // Wenn der User Click-Click-Aufträge angelegt hat, nutzt der Optimizer diese
  // statt der generierten Demo-Records. Jeder Auftrag wird in ein Record umgesetzt:
  // stellplatz = Eingangs-Tor-MP-Code, dispogebiet = aktuelles Ziel-Tor (= Tour),
  // colli = Auftrags-Colli.
  const effektiveRecords = useMemo(() => {
    if (simAuftraege.length > 0) {
      const heute = '2026-05-20';
      return simAuftraege.map((a, idx) => {
        const von = objects.find((o) => o.id === a.vonObjectId);
        const nach = objects.find((o) => o.id === a.nachObjectId);
        const vonCode = (von?.meta as { code?: string } | undefined)?.code
          || (von?.torNummer != null ? `MP${von.torNummer}` : `MP${a.vonObjectId}`);
        const tour = nach?.name || `Tor ${nach?.torNummer ?? a.nachObjectId}`;
        return {
          id: idx + 1,
          scandatum: heute,
          scanzeit: '06:00:00',
          timestamp: Date.now(),
          stellplatz: vonCode,
          messpunkt: von?.torNummer ?? a.vonObjectId,
          messpunktName: von?.name || vonCode,
          tour: '',
          dispogebiet: tour,
          ausgangsrelation: tour,
          sendungen: Math.max(1, Math.round(a.colli / 3)),
          colli: a.colli,
          gewicht: a.colli * 18,
        };
      });
    }
    return records;
  }, [simAuftraege, records, objects]);

  const checks = useMemo(() => {
    const tore = objects.filter((o) => o.type === 'tor').length;
    const bereiche = objects.filter((o) => o.type === 'bereich').length;
    const recCount = effektiveRecords.length;
    const relCount = relationZuordnungen.filter((r) => r.objectId !== null).length;
    const tourNamen = [...new Set(effektiveRecords.map((r) => r.dispogebiet || r.ausgangsrelation).filter(Boolean))];
    const distinkteRelationen = tourNamen.length;
    const datenquelle = simAuftraege.length > 0 ? 'auftraege' as const : 'records' as const;
    return { tore, bereiche, recCount, relCount, distinkteRelationen, tourNamen, datenquelle };
  }, [objects, effektiveRecords, relationZuordnungen, simAuftraege.length]);

  const bereichKannBerechnen = checks.tore > 0 && checks.bereiche > 0 && checks.recCount > 0 && checks.relCount > 0;
  const torKannBerechnen = checks.tore >= 2 && checks.recCount > 0 && checks.distinkteRelationen > 0;

  function berechneBereich() {
    if (!aktiv) return;
    setComputing(true);
    setErgebnis(null);
    setTimeout(() => {
      try {
        const erg = optimizeBereichPositions({
          objects, records: effektiveRecords, relationZuordnungen, gaenge,
          hallWidth: aktiv.width, hallHeight: aktiv.height,
        });
        setErgebnis(erg);
      } catch (err) {
        toast.error('Optimierung fehlgeschlagen: ' + (err as Error).message);
      } finally {
        setComputing(false);
      }
    }, 50);
  }

  function berechneTor() {
    if (!aktiv) return;
    setComputing(true);
    setTorErgebnis(null);
    setTimeout(() => {
      try {
        const erg = optimizeTorBelegung({
          objects, records: effektiveRecords, gaenge,
          hallWidth: aktiv.width, hallHeight: aktiv.height,
        });
        setTorErgebnis(erg);
      } catch (err) {
        toast.error('Tor-Belegungs-Optimierung fehlgeschlagen: ' + (err as Error).message);
      } finally {
        setComputing(false);
      }
    }, 50);
  }

  function anwendenBereich() {
    if (!ergebnis) return;
    for (const v of ergebnis.vorschlaege) {
      if (v.verschiebungM > 0.5) {
        updateObject(v.bereichId, { x: v.neuePosition.x, y: v.neuePosition.y });
      }
    }
    toast.success(
      `${ergebnis.vorschlaege.filter((v) => v.verschiebungM > 0.5).length} Bereiche verschoben — Ersparnis ${ergebnis.ersparnisProzent.toFixed(1)} %`,
    );
    onOpenChange(false);
  }

  function anwendenTor() {
    if (!torErgebnis) return;
    // Setze Tour-Zuordnung im Betriebsdaten-Store …
    const neue = Object.entries(torErgebnis.zuordnung).map(([relationKey, objectId]) => {
      const tor = objects.find((o) => o.id === objectId);
      return {
        relationKey,
        objectId,
        objectName: tor?.name || `Tor ${objectId}`,
      };
    });
    setRelationZuordnungenStore(neue);

    // … und schreibe die Tour als zusätzliches Label am Tor, damit es im Canvas
    // sichtbar wird (kommt in meta.tour, lässt das Tor-Objekt-Name unangetastet).
    for (const [relationKey, objectId] of Object.entries(torErgebnis.zuordnung)) {
      const tor = objects.find((o) => o.id === objectId);
      if (!tor) continue;
      const meta: Record<string, string> = { ...(tor.meta || {}), tour: relationKey };
      updateObject(objectId, { meta });
    }

    // Auftrags-Umleitung: pro Eingangs-Tor die häufigste Tour aus den Records
    // ermitteln, dann jeden Auftrag aus diesem Eingangs-Tor auf das neue
    // Ausgangs-Tor dieser Tour setzen.
    const tourProEingangsTor = new Map<number, string>();
    {
      const counts = new Map<number, Map<string, number>>();
      for (const r of effektiveRecords) {
        const torObj = objects.find((o) =>
          o.type === 'tor' && (
            (o.meta as { code?: string } | undefined)?.code === r.stellplatz
            || o.id === r.messpunkt
            || o.torNummer === r.messpunkt
          ),
        );
        if (!torObj) continue;
        const tour = r.dispogebiet || r.ausgangsrelation;
        if (!tour) continue;
        const m = counts.get(torObj.id) ?? new Map<string, number>();
        m.set(tour, (m.get(tour) ?? 0) + r.colli);
        counts.set(torObj.id, m);
      }
      for (const [torId, m] of counts) {
        let best = ''; let bestN = 0;
        for (const [tour, n] of m) { if (n > bestN) { best = tour; bestN = n; } }
        if (best) tourProEingangsTor.set(torId, best);
      }
    }
    let umgeleitet = 0;
    for (const auftrag of simAuftraege) {
      const tour = tourProEingangsTor.get(auftrag.vonObjectId);
      if (!tour) continue;
      const neuesZielId = torErgebnis.zuordnung[tour];
      if (neuesZielId && neuesZielId !== auftrag.nachObjectId) {
        updateSimAuftrag(auftrag.id, { nachObjectId: neuesZielId });
        umgeleitet++;
      }
    }

    toast.success(
      `${neue.length} Touren Toren zugewiesen${umgeleitet > 0 ? `, ${umgeleitet} Aufträge umgeleitet` : ''} — Ersparnis ${torErgebnis.ersparnisProzent.toFixed(1)} %`,
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Optimieren
          </DialogTitle>
        </DialogHeader>

        <Tabs value={modus} onValueChange={(v) => setModus(v as 'bereich' | 'tor')}>
          <TabsList className={hatBereiche ? 'grid w-full grid-cols-2' : 'grid w-full grid-cols-1'}>
            <TabsTrigger value="tor">Tor-Belegung (Cross-Docking)</TabsTrigger>
            {hatBereiche && <TabsTrigger value="bereich">Bereich-Positionen</TabsTrigger>}
          </TabsList>

          <TabsContent value="bereich" className="space-y-3 pt-3">
            <p className="text-xs text-muted-foreground">
              Verschiebt Sortier-/Pufferzonen zum Colli-Schwerpunkt der versorgten Tore.
              Sinnvoll wenn deine Halle Bereiche hat (z.B. Langgut-Sortierung).
            </p>

            {!bereichKannBerechnen && !ergebnis && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200 space-y-2">
                <div className="font-medium">Voraussetzungen fehlen:</div>
                <ul className="space-y-1 text-xs">
                  <li>{checks.tore > 0 ? '✓' : '✗'} Tore: {checks.tore}</li>
                  <li>{checks.bereiche > 0 ? '✓' : '✗'} Bereiche: {checks.bereiche}{checks.bereiche === 0 && ' (Tab Layout → Werkzeug Bereich → in Halle klicken)'}</li>
                  <li>{checks.recCount > 0 ? '✓' : '✗'} Records: {checks.recCount}</li>
                  <li>{checks.relCount > 0 ? '✓' : '✗'} Zuordnungen: {checks.relCount}{checks.relCount === 0 && checks.bereiche > 0 && ' (Volumen neu generieren nachdem Bereiche da sind)'}</li>
                </ul>
              </div>
            )}

            {bereichKannBerechnen && !ergebnis && !computing && (
              <Button onClick={berechneBereich} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" /> Bereich-Optimierung berechnen
              </Button>
            )}

            {computing && modus === 'bereich' && (
              <div className="py-8 text-center text-sm text-muted-foreground">A* läuft über das Gang-Netz…</div>
            )}

            {ergebnis && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <KpiKachel label="Verteilweg vorher" value={`${ergebnis.verteilwegVorherM.toFixed(1)} m`} />
                  <KpiKachel label="Verteilweg nachher" value={`${ergebnis.verteilwegNachherM.toFixed(1)} m`} />
                  <KpiKachel label="Ersparnis" value={`${ergebnis.ersparnisProzent.toFixed(1)} %`} emerald />
                </div>
                <div className="max-h-[320px] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bereich</TableHead>
                        <TableHead className="text-right">Verschiebung</TableHead>
                        <TableHead className="text-right">Tore</TableHead>
                        <TableHead className="text-right">Colli/Tag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ergebnis.vorschlaege.map((v) => (
                        <TableRow key={v.bereichId}>
                          <TableCell className="font-medium">{v.bereichName}</TableCell>
                          <TableCell className="text-right">{v.verschiebungM < 0.5 ? '—' : `${v.verschiebungM.toFixed(1)} m`}</TableCell>
                          <TableCell className="text-right">{v.toreVersorgt}</TableCell>
                          <TableCell className="text-right">{Math.round(v.colliProTag).toLocaleString('de-DE')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tor" className="space-y-3 pt-3">
            <p className="text-xs text-muted-foreground">
              Cross-Docking: weist jeder Relation/Tour das Ausgangs-Tor zu, das den
              Gesamt-Verteilweg minimiert (Greedy Center-of-Gravity). Keine Bereiche nötig.
            </p>
            {checks.recCount > 0 && (
              <div className="rounded-md border bg-card/50 p-2 text-xs text-muted-foreground">
                <div>
                  Datenquelle: {checks.datenquelle === 'auftraege'
                    ? <span className="text-foreground"><strong>{simAuftraege.length} Click-Aufträge</strong> (Tour = aktuelles Ziel-Tor)</span>
                    : <span>{checks.recCount.toLocaleString('de-DE')} Beispiel-Volumen-Records</span>
                  } · {checks.distinkteRelationen} Touren
                </div>
                <div className="mt-1 truncate"><span className="text-foreground/70">Touren:</span> {checks.tourNamen.slice(0, 10).join(', ')}{checks.tourNamen.length > 10 && ` … (+${checks.tourNamen.length - 10})`}</div>
                {checks.datenquelle === 'records' && !checks.bereiche && checks.tourNamen.some(t => /langgut|puffer|sektion|bereich/i.test(t)) && (
                  <div className="mt-1 text-amber-300">⚠ Tour-Namen sehen nach einer anderen Halle aus. Volumen neu generieren (Tab Daten → Beispiel-Volumen) für hallen-passende Touren.</div>
                )}
              </div>
            )}

            {!torKannBerechnen && !torErgebnis && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200 space-y-2">
                <div className="font-medium">Voraussetzungen fehlen:</div>
                <ul className="space-y-1 text-xs">
                  <li>{checks.tore >= 2 ? '✓' : '✗'} Mindestens 2 Tore: {checks.tore}</li>
                  <li>{checks.recCount > 0 ? '✓' : '✗'} Records: {checks.recCount}</li>
                  <li>{checks.distinkteRelationen > 0 ? '✓' : '✗'} Relationen (Dispogebiete): {checks.distinkteRelationen}</li>
                </ul>
              </div>
            )}

            {torKannBerechnen && !torErgebnis && !computing && (
              <Button onClick={berechneTor} className="w-full">
                <Sparkles className="mr-2 h-4 w-4" /> Tor-Belegung berechnen
              </Button>
            )}

            {computing && modus === 'tor' && (
              <div className="py-8 text-center text-sm text-muted-foreground">A* läuft über das Gang-Netz…</div>
            )}

            {torErgebnis && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <KpiKachel label="Verteilweg vorher" value={`${torErgebnis.verteilwegVorherM.toFixed(1)} m`} />
                  <KpiKachel label="Verteilweg nachher" value={`${torErgebnis.verteilwegNachherM.toFixed(1)} m`} />
                  <KpiKachel label="Ersparnis" value={`${torErgebnis.ersparnisProzent.toFixed(1)} %`} emerald />
                </div>
                <div className="max-h-[320px] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tour</TableHead>
                        <TableHead>Aktuell</TableHead>
                        <TableHead>Vorschlag</TableHead>
                        <TableHead className="text-right">Eingangs-Tore</TableHead>
                        <TableHead className="text-right">Colli/Tag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {torErgebnis.vorschlaege.map((v) => {
                        const verbessert = v.altesAusgangsTor && v.altesAusgangsTor.id !== v.neuesAusgangsTor.id;
                        return (
                          <TableRow key={v.relation}>
                            <TableCell className="font-medium">{v.relation}</TableCell>
                            <TableCell className="text-muted-foreground">{v.altesAusgangsTor?.name || '—'}</TableCell>
                            <TableCell className={verbessert ? 'font-medium text-emerald-300' : ''}>
                              {verbessert ? `→ ${v.neuesAusgangsTor.name}` : v.neuesAusgangsTor.name}
                            </TableCell>
                            <TableCell className="text-right">{v.eingangsToreCount}</TableCell>
                            <TableCell className="text-right">{Math.round(v.colliProTag).toLocaleString('de-DE')}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          {modus === 'bereich' && ergebnis && (
            <Button onClick={anwendenBereich}>Bereich-Vorschlag anwenden</Button>
          )}
          {modus === 'tor' && torErgebnis && (
            <Button onClick={anwendenTor}>Tor-Zuordnung anwenden</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KpiKachel({ label, value, emerald }: { label: string; value: string; emerald?: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${emerald ? 'border-emerald-500/40 bg-emerald-500/10' : 'bg-card'}`}>
      <div className={`flex items-center gap-1 text-xs ${emerald ? 'text-emerald-300' : 'text-muted-foreground'}`}>
        {emerald && <TrendingDown className="h-3 w-3" />} {label}
      </div>
      <div className={`mt-1 text-xl font-semibold ${emerald ? 'text-emerald-300' : ''}`}>{value}</div>
    </div>
  );
}
