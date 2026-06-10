'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopisStore } from '@/lib/store';
import { addKette as makeKette } from '@/lib/kette-store-actions';
import { kettenLaenge } from '@/lib/kette-geometry';
import { Trash2, Pencil } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Lastenheft 3.1.5 — Unterflurförderkette als zeichnerischer Wegbereich.
 *
 * Eigener Wegbereich mit festzulegender Breite, Kurven + Geraden über
 * Stützpunkte, EINE Fließrichtung (einstellbar). Im Plan dargestellt mit
 * Pfeilen entlang der Mittellinie.
 *
 * Die Stützpunkte selbst werden per Klick im Canvas gesetzt: Tool auf
 * `'kette'` schalten, dann nacheinander die Punkte klicken. Die
 * Canvas-Integration ist in HallCanvas dokumentiert (docs/KETTE-INTEGRATION.md).
 */
export function KettenDialog({ open, onOpenChange }: Props) {
  const ketten = useTopisStore((s) => s.kettenWegbereiche);
  const addKetteAction = useTopisStore((s) => s.addKette);
  const updateKette = useTopisStore((s) => s.updateKette);
  const deleteKette = useTopisStore((s) => s.deleteKette);
  const selectKette = useTopisStore((s) => s.selectKette);
  const selectedKette = useTopisStore((s) => s.selectedKette);
  const setTool = useTopisStore((s) => s.setTool);

  const [neuName, setNeuName] = useState('');
  const [neuBreite, setNeuBreite] = useState(2);

  function startZeichnen(id: number) {
    const k = ketten.find((kx) => kx.id === id);
    if (!k) return;
    selectKette(k);
    setTool('kette');
    onOpenChange(false);
  }

  function neuAnlegenUndZeichnen() {
    if (!neuName.trim()) return;
    const draft = makeKette(neuName, neuBreite, 'vorwaerts');
    const erzeugt = addKetteAction(draft);
    setNeuName('');
    setNeuBreite(2);
    selectKette(erzeugt);
    setTool('kette');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Unterflurförderkette</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Eine Kette ist ein eigener Wegbereich mit fester Breite und einer
              Fließrichtung. Sie wird über Stützpunkte gezeichnet (Geraden und
              Kurven). Normale Wege und Kettenbereich dürfen sich überlappen,
              Nutzflächen (Stellplätze, Regale, Bereiche) dürfen nicht im
              Kettenbereich liegen.
            </p>
            <p className="text-amber-600 dark:text-amber-400">
              Nach „Zeichnen" werden Stützpunkte per Klick im Canvas gesetzt.
              ESC oder Tool-Wechsel beendet das Zeichnen.
            </p>
          </div>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Neue Kette anlegen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={neuName}
                    onChange={(e) => setNeuName(e.target.value)}
                    placeholder="z.B. Hauptkette Halle 6"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Breite (m)</Label>
                  <Input
                    type="number"
                    min={0.5}
                    step={0.1}
                    value={neuBreite}
                    onChange={(e) =>
                      setNeuBreite(parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <Button
                onClick={neuAnlegenUndZeichnen}
                disabled={!neuName.trim() || neuBreite <= 0}
                className="w-full"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Kette zeichnen
              </Button>
            </CardContent>
          </Card>

          <ScrollArea className="h-[360px]">
            <div className="space-y-3">
              {ketten.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Noch keine Ketten angelegt.
                </p>
              )}
              {ketten.map((k) => {
                const laenge = kettenLaenge(k);
                const istAktiv = selectedKette?.id === k.id;
                return (
                  <Card key={k.id} className={istAktiv ? 'border-cyan-500' : ''}>
                    <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-sm">
                        {k.name}
                        {istAktiv && (
                          <span className="ml-2 text-xs text-cyan-600">
                            (aktiv)
                          </span>
                        )}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteKette(k.id)}
                        aria-label="Kette löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={k.name}
                            onChange={(e) =>
                              updateKette(k.id, { name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Breite (m)</Label>
                          <Input
                            type="number"
                            min={0.5}
                            step={0.1}
                            value={k.breite}
                            onChange={(e) =>
                              updateKette(k.id, {
                                breite: parseFloat(e.target.value) || k.breite,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Fließrichtung</Label>
                        <div className="flex gap-2">
                          <Button
                            variant={
                              k.fliessrichtung === 'vorwaerts'
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() =>
                              updateKette(k.id, { fliessrichtung: 'vorwaerts' })
                            }
                          >
                            Vorwärts →
                          </Button>
                          <Button
                            variant={
                              k.fliessrichtung === 'rueckwaerts'
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() =>
                              updateKette(k.id, {
                                fliessrichtung: 'rueckwaerts',
                              })
                            }
                          >
                            ← Rückwärts
                          </Button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Stützpunkte: {k.punkte.length} · Länge:{' '}
                        {laenge.toFixed(1)} m
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startZeichnen(k.id)}
                        >
                          <Pencil className="mr-2 h-3 w-3" />
                          {k.punkte.length === 0
                            ? 'Zeichnen starten'
                            : 'Weiter zeichnen'}
                        </Button>
                        {k.punkte.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateKette(k.id, { punkte: [] })}
                          >
                            Stützpunkte löschen
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
