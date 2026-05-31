'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTopisStore } from '@/lib/store';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Lastenheft 3.2.5 — Bereichseinteilung
 *
 * „Tore und Relations-/Stellplätze können zu Bereichen zusammengefasst werden.
 *  Je zugeordnetem Stellplatz wird die Menge der zugeordneten Relationen je
 *  Prozesskategorie summiert." */
export function BereichsEinteilungDialog({ open, onOpenChange }: Props) {
  const bereichsEinteilungen = useTopisStore((s) => s.bereichsEinteilungen);
  const objects = useTopisStore((s) => s.objects);
  const addBereichsEinteilung = useTopisStore((s) => s.addBereichsEinteilung);
  const updateBereichsEinteilung = useTopisStore((s) => s.updateBereichsEinteilung);
  const deleteBereichsEinteilung = useTopisStore((s) => s.deleteBereichsEinteilung);

  const [neuName, setNeuName] = useState('');

  const tore = objects.filter((o) => o.type === 'tor');
  const stellplaetze = objects.filter((o) => o.type === 'stellplatz' || o.type === 'regal');

  function csvExport() {
    const zeilen: string[] = ['Bereich;Tor-Anzahl;Stellplatz-Anzahl;Tor-IDs;Stellplatz-IDs'];
    for (const b of bereichsEinteilungen) {
      zeilen.push(`"${b.name}";${b.torIds.length};${b.stellplatzIds.length};"${b.torIds.join(',')}";"${b.stellplatzIds.join(',')}"`);
    }
    const blob = new Blob([zeilen.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bereichseinteilungen-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Bereichseinteilung (Lastenheft 3.2.5)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Bereiche fassen Tore + Stellplätze zur Auswertung zusammen. Pro Bereich werden Mengen je Prozesskategorie summiert.
          </div>

          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Neuen Bereich anlegen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={neuName}
                  onChange={(e) => setNeuName(e.target.value)}
                  placeholder="z.B. Block Nord, EZ 1, Logistix-Zone"
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    if (!neuName.trim()) return;
                    addBereichsEinteilung({ name: neuName.trim(), torIds: [], stellplatzIds: [] });
                    setNeuName('');
                  }}
                >
                  Anlegen
                </Button>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {bereichsEinteilungen.length === 0 && (
                <p className="text-sm text-muted-foreground">Noch keine Bereichseinteilung. Lege oben einen Bereich an.</p>
              )}
              {bereichsEinteilungen.map((b) => (
                <Card key={b.id}>
                  <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm">{b.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBereichsEinteilung(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Tore ({b.torIds.length} von {tore.length})</Label>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 rounded border">
                        {tore.map((t) => (
                          <label key={t.id} className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={b.torIds.includes(t.id)}
                              onChange={(e) => {
                                const newIds = e.target.checked
                                  ? [...b.torIds, t.id]
                                  : b.torIds.filter((id) => id !== t.id);
                                updateBereichsEinteilung(b.id, { torIds: newIds });
                              }}
                            />
                            <span>{t.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stellplätze/Regale ({b.stellplatzIds.length} von {stellplaetze.length})</Label>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 rounded border">
                        {stellplaetze.map((sp) => (
                          <label key={sp.id} className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={b.stellplatzIds.includes(sp.id)}
                              onChange={(e) => {
                                const newIds = e.target.checked
                                  ? [...b.stellplatzIds, sp.id]
                                  : b.stellplatzIds.filter((id) => id !== sp.id);
                                updateBereichsEinteilung(b.id, { stellplatzIds: newIds });
                              }}
                            />
                            <span>{sp.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={csvExport} disabled={bereichsEinteilungen.length === 0}>
            CSV-Export
          </Button>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
