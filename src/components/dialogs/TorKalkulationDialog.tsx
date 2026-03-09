'use client';

import { useState, useMemo } from 'react';
import { useTopisStore, useActiveHall } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Calculator, Save, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { TopisObject } from '@/types/topis';
import { findPathBetweenObjects } from '@/lib/pathfinding';

interface TorDaten {
  torId: number;
  name: string;
  palettenProTag: number;
  entladeZeitSek: number;
  beladeZeitSek: number;
  istEingang: boolean;
  istAusgang: boolean;
  zielObjektId: number | null;
}

export function TorKalkulationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const objects = useTopisStore((s) => s.objects);
  const gaenge = useTopisStore((s) => s.gaenge);
  const ffz = useTopisStore((s) => s.ffz);
  const updateObject = useTopisStore((s) => s.updateObject);
  const hall = useActiveHall();

  // Get all tore
  const tore = useMemo(() =>
    objects.filter(o => o.type === 'tor'),
    [objects]
  );

  // Get potential targets (Stellplätze, Regale, Bereiche)
  const zielObjekte = useMemo(() =>
    objects.filter(o => ['stellplatz', 'regal', 'bereich', 'entladebereich'].includes(o.type)),
    [objects]
  );

  // Local state for editing
  const [torDaten, setTorDaten] = useState<TorDaten[]>(() =>
    tore.map(tor => ({
      torId: tor.id,
      name: tor.name,
      palettenProTag: tor.palettenProTag || 0,
      entladeZeitSek: tor.entladeZeitSek || 30,
      beladeZeitSek: tor.beladeZeitSek || 25,
      istEingang: tor.istEingang ?? true,
      istAusgang: tor.istAusgang ?? false,
      zielObjektId: tor.zielObjektId || null,
    }))
  );

  // Update local state when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTorDaten(tore.map(tor => ({
        torId: tor.id,
        name: tor.name,
        palettenProTag: tor.palettenProTag || 0,
        entladeZeitSek: tor.entladeZeitSek || 30,
        beladeZeitSek: tor.beladeZeitSek || 25,
        istEingang: tor.istEingang ?? true,
        istAusgang: tor.istAusgang ?? false,
        zielObjektId: tor.zielObjektId || null,
      })));
    }
    setIsOpen(open);
  };

  // Update single tor data
  const updateTorDaten = (torId: number, updates: Partial<TorDaten>) => {
    setTorDaten(prev => prev.map(t =>
      t.torId === torId ? { ...t, ...updates } : t
    ));
  };

  // Calculate totals
  const berechnungen = useMemo(() => {
    const defaultFFZ = ffz[0]; // Use first FFZ (Gabelstapler)

    let gesamtPaletten = 0;
    let gesamtEntladeZeit = 0;
    let gesamtBeladeZeit = 0;
    let gesamtFahrzeit = 0;
    let gesamtFahrten = 0;

    const torDetails: {
      torId: number;
      name: string;
      paletten: number;
      entladeZeit: number;
      beladeZeit: number;
      fahrzeit: number;
      fahrstrecke: number;
      fahrten: number;
    }[] = [];

    torDaten.forEach(tor => {
      const torObj = tore.find(t => t.id === tor.torId);
      const zielObj = tor.zielObjektId ? objects.find(o => o.id === tor.zielObjektId) : null;

      if (!torObj || tor.palettenProTag === 0) return;

      gesamtPaletten += tor.palettenProTag;

      // Entladezeit (Eingang)
      const entladeZeitGesamt = tor.istEingang ? tor.palettenProTag * tor.entladeZeitSek : 0;
      gesamtEntladeZeit += entladeZeitGesamt;

      // Beladezeit (Ausgang)
      const beladeZeitGesamt = tor.istAusgang ? tor.palettenProTag * tor.beladeZeitSek : 0;
      gesamtBeladeZeit += beladeZeitGesamt;

      // Fahrzeit berechnen wenn Ziel definiert
      let fahrzeit = 0;
      let fahrstrecke = 0;
      let fahrten = tor.palettenProTag;

      if (zielObj && gaenge.length > 0 && defaultFFZ) {
        const pathResult = findPathBetweenObjects(torObj, zielObj, gaenge, defaultFFZ);
        if (pathResult) {
          // Hin und zurück pro Palette
          fahrstrecke = pathResult.distance;
          const zeitProFahrt = pathResult.time; // Eine Richtung
          fahrzeit = tor.palettenProTag * zeitProFahrt * 2; // Hin + Zurück
          gesamtFahrzeit += fahrzeit;
          gesamtFahrten += fahrten * 2;
        }
      }

      torDetails.push({
        torId: tor.torId,
        name: tor.name,
        paletten: tor.palettenProTag,
        entladeZeit: entladeZeitGesamt,
        beladeZeit: beladeZeitGesamt,
        fahrzeit,
        fahrstrecke,
        fahrten: fahrten * 2,
      });
    });

    const gesamtZeitSek = gesamtEntladeZeit + gesamtBeladeZeit + gesamtFahrzeit;
    const gesamtZeitStunden = gesamtZeitSek / 3600;

    return {
      gesamtPaletten,
      gesamtEntladeZeit,
      gesamtBeladeZeit,
      gesamtFahrzeit,
      gesamtFahrten,
      gesamtZeitSek,
      gesamtZeitStunden,
      torDetails,
    };
  }, [torDaten, tore, objects, gaenge, ffz]);

  // Save to store
  const handleSave = () => {
    torDaten.forEach(tor => {
      updateObject(tor.torId, {
        palettenProTag: tor.palettenProTag,
        entladeZeitSek: tor.entladeZeitSek,
        beladeZeitSek: tor.beladeZeitSek,
        istEingang: tor.istEingang,
        istAusgang: tor.istAusgang,
        zielObjektId: tor.zielObjektId || undefined,
      });
    });
    toast.success('Tor-Daten gespeichert');
  };

  // Export as CSV
  const handleExport = () => {
    const header = 'Tor;Paletten/Tag;Entladezeit (s);Beladezeit (s);Fahrzeit (s);Fahrstrecke (m);Fahrten\n';
    const rows = berechnungen.torDetails.map(t =>
      `${t.name};${t.paletten};${t.entladeZeit};${t.beladeZeit};${t.fahrzeit.toFixed(0)};${t.fahrstrecke.toFixed(1)};${t.fahrten}`
    ).join('\n');
    const summary = `\nGESAMT;${berechnungen.gesamtPaletten};;;${berechnungen.gesamtZeitSek.toFixed(0)};;${berechnungen.gesamtFahrten}\nStunden/Tag;${berechnungen.gesamtZeitStunden.toFixed(2)}`;

    const csv = header + rows + summary;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tor-kalkulation.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportiert');
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}min`;
    return `${(seconds / 3600).toFixed(2)}h`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Calculator className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Tor-Kalkulation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tor-Kalkulation</DialogTitle>
          <DialogDescription>
            Paletten und Zeiten pro Tor eingeben - Tagesberechnung
          </DialogDescription>
        </DialogHeader>

        {tore.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Keine Tore in der Halle. Füge zuerst Tore hinzu.
          </div>
        ) : (
          <>
            {/* Tor-Tabelle */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Tor</th>
                    <th className="px-3 py-2 text-center font-medium">Ein</th>
                    <th className="px-3 py-2 text-center font-medium">Aus</th>
                    <th className="px-3 py-2 text-right font-medium">Paletten/Tag</th>
                    <th className="px-3 py-2 text-right font-medium">Entlade-Zeit</th>
                    <th className="px-3 py-2 text-right font-medium">Belade-Zeit</th>
                    <th className="px-3 py-2 text-left font-medium">Ziel</th>
                  </tr>
                </thead>
                <tbody>
                  {torDaten.map((tor, idx) => (
                    <tr key={tor.torId} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="px-3 py-2 font-medium">{tor.name}</td>
                      <td className="px-3 py-2 text-center">
                        <Checkbox
                          checked={tor.istEingang}
                          onCheckedChange={(checked) => updateTorDaten(tor.torId, { istEingang: !!checked })}
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Checkbox
                          checked={tor.istAusgang}
                          onCheckedChange={(checked) => updateTorDaten(tor.torId, { istAusgang: !!checked })}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          className="w-20 h-7 text-right"
                          value={tor.palettenProTag}
                          onChange={(e) => updateTorDaten(tor.torId, { palettenProTag: parseInt(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          className="w-16 h-7 text-right"
                          value={tor.entladeZeitSek}
                          onChange={(e) => updateTorDaten(tor.torId, { entladeZeitSek: parseInt(e.target.value) || 0 })}
                        />
                        <span className="text-xs text-muted-foreground ml-1">s</span>
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="number"
                          min={0}
                          className="w-16 h-7 text-right"
                          value={tor.beladeZeitSek}
                          onChange={(e) => updateTorDaten(tor.torId, { beladeZeitSek: parseInt(e.target.value) || 0 })}
                        />
                        <span className="text-xs text-muted-foreground ml-1">s</span>
                      </td>
                      <td className="px-3 py-2">
                        <Select
                          value={tor.zielObjektId?.toString() || 'none'}
                          onValueChange={(v) => updateTorDaten(tor.torId, { zielObjektId: v === 'none' ? null : parseInt(v) })}
                        >
                          <SelectTrigger className="h-7 w-32">
                            <SelectValue placeholder="Wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">-</SelectItem>
                            {zielObjekte.map(obj => (
                              <SelectItem key={obj.id} value={obj.id.toString()}>
                                {obj.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ergebnis-Bereich */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Zusammenfassung */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-3">Tages-Zusammenfassung</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paletten gesamt:</span>
                    <span className="font-medium">{berechnungen.gesamtPaletten}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fahrten gesamt:</span>
                    <span className="font-medium">{berechnungen.gesamtFahrten}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entladezeit:</span>
                    <span>{formatTime(berechnungen.gesamtEntladeZeit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beladezeit:</span>
                    <span>{formatTime(berechnungen.gesamtBeladeZeit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fahrzeit:</span>
                    <span>{formatTime(berechnungen.gesamtFahrzeit)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-base font-medium">
                      <span>GESAMT:</span>
                      <span className="text-primary">{berechnungen.gesamtZeitStunden.toFixed(2)} Stunden/Tag</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail pro Tor */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-3">Detail pro Tor</h4>
                <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
                  {berechnungen.torDetails.map(t => (
                    <div key={t.torId} className="flex justify-between py-1 border-b border-border/50">
                      <span>{t.name}</span>
                      <span className="text-muted-foreground">
                        {t.paletten} Pal. | {formatTime(t.entladeZeit + t.beladeZeit + t.fahrzeit)}
                      </span>
                    </div>
                  ))}
                  {berechnungen.torDetails.length === 0 && (
                    <div className="text-muted-foreground">Keine Daten eingegeben</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleExport} disabled={tore.length === 0}>
            <FileDown className="h-4 w-4 mr-2" />
            CSV Export
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={tore.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
