'use client';

import { useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTopisStore } from '@/lib/store';
import {
  verladerAuslastung,
  verladerBedarf,
  gruppiereVerladerNachSchicht,
  schichtLabel,
} from '@/lib/verlader-rechner';
import type { Verlader, VerladerSchicht } from '@/types/topis';
import { Trash2, Pencil } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SCHICHT_OPTIONEN: VerladerSchicht[] = ['frueh', 'spaet', 'nacht', 'tag'];

/** Lastenheft Kapitel 4 — Verlader-Verwaltung
 *
 * Ein Verlader ist im Lastenheft eine Entität, die Tore und Stellplätze
 * bedient — typischerweise ein Mitarbeiter oder ein Team an einer
 * Verladestelle. Eigenschaften: Name, Schicht, FFZ-Zuordnung, bediente
 * Tor-/Stellplatz-Listen, Kapazität pro Stunde.
 */
export function VerladerDialog({ open, onOpenChange }: Props) {
  const verlader = useTopisStore((s) => s.verlader);
  const objects = useTopisStore((s) => s.objects);
  const ffz = useTopisStore((s) => s.ffz);
  const addVerlader = useTopisStore((s) => s.addVerlader);
  const updateVerlader = useTopisStore((s) => s.updateVerlader);
  const deleteVerlader = useTopisStore((s) => s.deleteVerlader);

  // Anlegen-Form
  const [neuName, setNeuName] = useState('');
  const [neuSchicht, setNeuSchicht] = useState<VerladerSchicht>('tag');
  const [neuKap, setNeuKap] = useState<string>('');

  // Bearbeiten
  const [editingId, setEditingId] = useState<number | null>(null);

  // Filter
  const [filterSchicht, setFilterSchicht] = useState<VerladerSchicht | 'alle'>('alle');

  // Bedarfs-Rechner Eingaben
  const [bedarfColli, setBedarfColli] = useState<string>('1000');
  const [bedarfKap, setBedarfKap] = useState<string>('50');
  const [bedarfStunden, setBedarfStunden] = useState<string>('8');

  const tore = useMemo(() => objects.filter((o) => o.type === 'tor'), [objects]);
  const stellplaetze = useMemo(
    () => objects.filter((o) => o.type === 'stellplatz' || o.type === 'regal'),
    [objects],
  );

  const sichtbareVerlader = useMemo(() => {
    if (filterSchicht === 'alle') return verlader;
    return verlader.filter((v) => (v.schicht ?? 'tag') === filterSchicht);
  }, [verlader, filterSchicht]);

  const gruppen = useMemo(() => gruppiereVerladerNachSchicht(verlader), [verlader]);

  const bedarfColliNum = Number(bedarfColli) || 0;
  const bedarfKapNum = Number(bedarfKap) || 0;
  const bedarfStundenNum = Number(bedarfStunden) || 0;
  const bedarfErgebnis = verladerBedarf(bedarfColliNum, bedarfKapNum, bedarfStundenNum);

  function handleAnlegen() {
    if (!neuName.trim()) return;
    const kap = Number(neuKap);
    addVerlader({
      name: neuName.trim(),
      schicht: neuSchicht,
      bedientToreIds: [],
      bedientStellplatzIds: [],
      kapazitaetProStunde: Number.isFinite(kap) && kap > 0 ? kap : undefined,
    });
    setNeuName('');
    setNeuKap('');
    setNeuSchicht('tag');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Verlader-Verwaltung</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Ein Verlader bedient Tore und Stellplätze. Auslastung und Bedarf werden aus Kapazität
            (Colli/h) und Volumen (Colli/Tag) berechnet.
          </div>

          {/* Anlegen-Form */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Neuen Verlader anlegen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={neuName}
                    onChange={(e) => setNeuName(e.target.value)}
                    placeholder="z.B. Müller, Team Nord"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Schicht</Label>
                  <Select
                    value={neuSchicht}
                    onValueChange={(v) => setNeuSchicht(v as VerladerSchicht)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHICHT_OPTIONEN.map((s) => (
                        <SelectItem key={s} value={s}>
                          {schichtLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kapazität (Colli/h)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={neuKap}
                    onChange={(e) => setNeuKap(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAnlegen} disabled={!neuName.trim()} className="w-full">
                    Anlegen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schicht-Filter */}
          <div className="flex items-center gap-2">
            <Label className="text-xs">Filter Schicht:</Label>
            <Select
              value={filterSchicht}
              onValueChange={(v) => setFilterSchicht(v as VerladerSchicht | 'alle')}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle ({verlader.length})</SelectItem>
                {SCHICHT_OPTIONEN.map((s) => (
                  <SelectItem key={s} value={s}>
                    {schichtLabel(s)} ({gruppen[s].length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabelle */}
          <ScrollArea className="h-[260px] rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Schicht</TableHead>
                  <TableHead className="text-right">Kapazität</TableHead>
                  <TableHead className="text-right">Tore</TableHead>
                  <TableHead className="text-right">Stellplätze</TableHead>
                  <TableHead className="text-right">Auslastung (Ø)</TableHead>
                  <TableHead className="w-24 text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sichtbareVerlader.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-xs text-muted-foreground">
                      Noch keine Verlader angelegt.
                    </TableCell>
                  </TableRow>
                )}
                {sichtbareVerlader.map((v) => {
                  // Auslastung-Anzeige: nutzt globalen Bedarfs-Colli-Wert als
                  // Referenzvolumen. Wenn nichts eingegeben ist, „—".
                  const auslastung =
                    bedarfColliNum > 0
                      ? verladerAuslastung(v, bedarfColliNum, bedarfStundenNum || 8)
                      : null;
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="text-xs">{schichtLabel(v.schicht ?? 'tag')}</TableCell>
                      <TableCell className="text-right text-xs">
                        {v.kapazitaetProStunde ? `${v.kapazitaetProStunde} Colli/h` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-xs">{v.bedientToreIds.length}</TableCell>
                      <TableCell className="text-right text-xs">
                        {v.bedientStellplatzIds.length}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {auslastung == null ? '—' : `${auslastung.toFixed(0)}%`}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(editingId === v.id ? null : v.id)}
                          title="Bearbeiten"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVerlader(v.id)}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Edit-Card */}
          {editingId != null &&
            (() => {
              const v = verlader.find((x) => x.id === editingId);
              if (!v) return null;
              return (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Bearbeiten: {v.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={v.name}
                          onChange={(e) => updateVerlader(v.id, { name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Schicht</Label>
                        <Select
                          value={v.schicht ?? 'tag'}
                          onValueChange={(val) =>
                            updateVerlader(v.id, { schicht: val as VerladerSchicht })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCHICHT_OPTIONEN.map((s) => (
                              <SelectItem key={s} value={s}>
                                {schichtLabel(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Kapazität (Colli/h)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={v.kapazitaetProStunde ?? ''}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            updateVerlader(v.id, {
                              kapazitaetProStunde:
                                Number.isFinite(n) && n > 0 ? n : undefined,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Bevorzugtes FFZ</Label>
                        <Select
                          value={v.ffzId ? String(v.ffzId) : 'keines'}
                          onValueChange={(val) =>
                            updateVerlader(v.id, {
                              ffzId: val === 'keines' ? undefined : Number(val),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keines">— keines —</SelectItem>
                            {ffz.map((f) => (
                              <SelectItem key={f.id} value={String(f.id)}>
                                {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Notiz</Label>
                      <Input
                        value={v.notiz ?? ''}
                        onChange={(e) => updateVerlader(v.id, { notiz: e.target.value })}
                        placeholder="optionale Bemerkung"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Bediente Tore ({v.bedientToreIds.length} von {tore.length})
                        </Label>
                        <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto rounded border p-1">
                          {tore.length === 0 && (
                            <span className="text-xs text-muted-foreground">Keine Tore vorhanden.</span>
                          )}
                          {tore.map((t) => (
                            <label key={t.id} className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={v.bedientToreIds.includes(t.id)}
                                onChange={(e) => {
                                  const ids = e.target.checked
                                    ? [...v.bedientToreIds, t.id]
                                    : v.bedientToreIds.filter((id) => id !== t.id);
                                  updateVerlader(v.id, { bedientToreIds: ids });
                                }}
                              />
                              <span>{t.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">
                          Bediente Stellplätze/Regale ({v.bedientStellplatzIds.length} von{' '}
                          {stellplaetze.length})
                        </Label>
                        <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto rounded border p-1">
                          {stellplaetze.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              Keine Stellplätze vorhanden.
                            </span>
                          )}
                          {stellplaetze.map((sp) => (
                            <label key={sp.id} className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={v.bedientStellplatzIds.includes(sp.id)}
                                onChange={(e) => {
                                  const ids = e.target.checked
                                    ? [...v.bedientStellplatzIds, sp.id]
                                    : v.bedientStellplatzIds.filter((id) => id !== sp.id);
                                  updateVerlader(v.id, { bedientStellplatzIds: ids });
                                }}
                              />
                              <span>{sp.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

          {/* Bedarf-Anzeige */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Bedarfs-Rechner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Volumen (Colli/Tag)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={bedarfColli}
                    onChange={(e) => setBedarfColli(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kapazität pro Verlader (Colli/h)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={bedarfKap}
                    onChange={(e) => setBedarfKap(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Arbeitsstunden pro Tag</Label>
                  <Input
                    type="number"
                    min={0}
                    value={bedarfStunden}
                    onChange={(e) => setBedarfStunden(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm">
                Benötigte Verlader:{' '}
                <span className="font-semibold">
                  {bedarfErgebnis > 0 ? bedarfErgebnis : '—'}
                </span>
                {bedarfErgebnis > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({bedarfColliNum} Colli / ({bedarfKapNum} Colli/h × {bedarfStundenNum} h))
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Die Volumen-Eingabe wird auch für die Auslastungs-Spalte oben verwendet.
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
