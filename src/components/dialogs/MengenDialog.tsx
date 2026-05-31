'use client';

import { useMemo, useRef, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Trash2, Upload, Download } from 'lucide-react';
import { useTopisStore } from '@/lib/store';
import { exportMengenAsCsv, PACKSTUECK_TYPEN } from '@/lib/mengen-store-actions';
import type { PackstueckTyp } from '@/types/topis';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYP_LABEL: Record<PackstueckTyp, string> = {
  palette: 'Palette',
  halbpalette: 'Halbpalette',
  chep: 'Chep',
  gibo: 'GiBo',
  industriepalette: 'Industriepalette',
  colli: 'Colli',
  sonstiges: 'Sonstiges',
};

/** Lastenheft 3.2.1 — Prozess- und Mengenkategorien
 *
 * Zwei Tabs:
 *  1. Prozesskategorien: anlegen, Subprozesse als Komma-Liste, löschen
 *     (kaskadiert auf alle Einträge dieser Kategorie).
 *  2. Mengen-Einträge: Tabelle nach Prozess filterbar; neuer Eintrag mit
 *     Anzahl (2 NK), Packstück-Typ, Maße (L×B×H in m), stapelbar.
 *
 * CSV-Import (append/replace) + Export laufen über
 * `useTopisStore.importMengenFromCsv` bzw. `exportMengenAsCsv`.
 */
export function MengenDialog({ open, onOpenChange }: Props) {
  const prozesskategorien = useTopisStore((s) => s.prozesskategorien);
  const mengenEintraege = useTopisStore((s) => s.mengenEintraege);
  const addProzesskategorie = useTopisStore((s) => s.addProzesskategorie);
  const updateProzesskategorie = useTopisStore((s) => s.updateProzesskategorie);
  const deleteProzesskategorie = useTopisStore((s) => s.deleteProzesskategorie);
  const addMengenEintrag = useTopisStore((s) => s.addMengenEintrag);
  const updateMengenEintrag = useTopisStore((s) => s.updateMengenEintrag);
  const deleteMengenEintrag = useTopisStore((s) => s.deleteMengenEintrag);
  const importMengenFromCsv = useTopisStore((s) => s.importMengenFromCsv);

  // ===== Tab 1 State (Prozesskategorie anlegen) =====
  const [neuKatName, setNeuKatName] = useState('');
  const [neuKatSubs, setNeuKatSubs] = useState('');

  // ===== Tab 2 State (Mengen-Eintrag anlegen) =====
  const [eFilter, setEFilter] = useState<string>('alle');
  const [eProzess, setEProzess] = useState<string>('');
  const [eSubprozess, setESubprozess] = useState<string>('');
  const [eRelation, setERelation] = useState<string>('');
  const [eAnzahl, setEAnzahl] = useState<string>('');
  const [eTyp, setETyp] = useState<PackstueckTyp>('palette');
  const [eLaenge, setELaenge] = useState<string>('');
  const [eBreite, setEBreite] = useState<string>('');
  const [eHoehe, setEHoehe] = useState<string>('');
  const [eStapelbar, setEStapelbar] = useState<'unbestimmt' | 'ja' | 'nein'>('unbestimmt');

  // ===== CSV-Import =====
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModus, setImportModus] = useState<'append' | 'replace'>('append');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const gefilterteEintraege = useMemo(() => {
    if (eFilter === 'alle') return mengenEintraege;
    return mengenEintraege.filter((m) => m.prozess === eFilter);
  }, [mengenEintraege, eFilter]);

  const aktiveSubprozesse = useMemo(() => {
    const kat = prozesskategorien.find((p) => p.name === eProzess);
    return kat?.subprozesse ?? [];
  }, [prozesskategorien, eProzess]);

  function parseNum(v: string): number | undefined {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  }

  function handleAddKategorie() {
    if (!neuKatName.trim()) return;
    const subs = neuKatSubs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    addProzesskategorie(neuKatName.trim(), subs.length > 0 ? subs : undefined);
    setNeuKatName('');
    setNeuKatSubs('');
  }

  function handleAddEintrag() {
    if (!eProzess.trim() || !eRelation.trim()) return;
    const anzahl = parseNum(eAnzahl);
    if (anzahl === undefined) return;
    addMengenEintrag({
      prozess: eProzess.trim(),
      ...(eSubprozess.trim() ? { subprozess: eSubprozess.trim() } : {}),
      relation: eRelation.trim(),
      anzahl: Math.round(anzahl * 100) / 100,
      typ: eTyp,
      ...(parseNum(eLaenge) !== undefined ? { laenge: parseNum(eLaenge) } : {}),
      ...(parseNum(eBreite) !== undefined ? { breite: parseNum(eBreite) } : {}),
      ...(parseNum(eHoehe) !== undefined ? { hoehe: parseNum(eHoehe) } : {}),
      ...(eStapelbar !== 'unbestimmt' ? { stapelbar: eStapelbar === 'ja' } : {}),
    });
    // Reset Form (Prozess + Typ bleiben für schnelles Mehrfach-Anlegen)
    setESubprozess('');
    setERelation('');
    setEAnzahl('');
    setELaenge('');
    setEBreite('');
    setEHoehe('');
    setEStapelbar('unbestimmt');
  }

  function handleCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const result = importMengenFromCsv(text, importModus);
      const teile: string[] = [];
      teile.push(`${result.imported} importiert`);
      if (result.skipped > 0) teile.push(`${result.skipped} übersprungen`);
      if (importModus === 'replace' && result.ersetzteProzesse.length > 0) {
        teile.push(`ersetzt: ${result.ersetzteProzesse.join(', ')}`);
      }
      if (result.warnings.length > 0) teile.push(`${result.warnings.length} Warnung(en)`);
      setImportStatus(teile.join(' · '));
    };
    reader.onerror = () => setImportStatus('Fehler beim Lesen der Datei');
    reader.readAsText(file, 'utf-8');
  }

  function handleCsvExport() {
    if (mengenEintraege.length === 0) return;
    const csv = exportMengenAsCsv(mengenEintraege);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mengen-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[88vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Prozess- und Mengenkategorien (Lastenheft 3.2.1)</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="kategorien" className="w-full">
          <TabsList>
            <TabsTrigger value="kategorien">
              Prozesskategorien ({prozesskategorien.length})
            </TabsTrigger>
            <TabsTrigger value="eintraege">
              Mengen-Einträge ({mengenEintraege.length})
            </TabsTrigger>
          </TabsList>

          {/* ===== TAB 1: PROZESSKATEGORIEN ===== */}
          <TabsContent value="kategorien" className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Eine Prozesskategorie kann optional Subprozesse haben. Beim Löschen werden alle
              Mengen-Einträge dieser Kategorie ebenfalls entfernt.
            </div>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Neue Prozesskategorie anlegen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={neuKatName}
                      onChange={(e) => setNeuKatName(e.target.value)}
                      placeholder="z.B. SE, SA, Wareneingang"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Subprozesse (Komma-getrennt, optional)</Label>
                    <Input
                      value={neuKatSubs}
                      onChange={(e) => setNeuKatSubs(e.target.value)}
                      placeholder="z.B. Entladen, Scannen, Verteilen"
                    />
                  </div>
                </div>
                <Button onClick={handleAddKategorie} disabled={!neuKatName.trim()}>
                  Anlegen
                </Button>
              </CardContent>
            </Card>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {prozesskategorien.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Noch keine Prozesskategorien angelegt.
                  </p>
                )}
                {prozesskategorien.map((kat) => {
                  const eintragCount = mengenEintraege.filter((m) => m.prozess === kat.name).length;
                  return (
                    <Card key={kat.id}>
                      <CardContent className="py-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={kat.name}
                            onChange={(e) =>
                              updateProzesskategorie(kat.id, { name: e.target.value })
                            }
                            className="flex-1 font-medium"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {eintragCount} Eintrag/e
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (
                                eintragCount === 0 ||
                                confirm(
                                  `Prozesskategorie "${kat.name}" und ${eintragCount} zugehörige Mengen-Einträge wirklich löschen?`
                                )
                              ) {
                                deleteProzesskategorie(kat.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Subprozesse (Komma-getrennt)</Label>
                          <Input
                            value={(kat.subprozesse ?? []).join(', ')}
                            onChange={(e) => {
                              const subs = e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0);
                              updateProzesskategorie(kat.id, { subprozesse: subs });
                            }}
                            placeholder="(keine)"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ===== TAB 2: MENGEN-EINTRÄGE ===== */}
          <TabsContent value="eintraege" className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Neuer Mengen-Eintrag</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Prozess</Label>
                    {prozesskategorien.length > 0 ? (
                      <Select value={eProzess} onValueChange={(v) => { setEProzess(v); setESubprozess(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen …" />
                        </SelectTrigger>
                        <SelectContent>
                          {prozesskategorien.map((p) => (
                            <SelectItem key={p.id} value={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={eProzess}
                        onChange={(e) => setEProzess(e.target.value)}
                        placeholder="(zuerst Kategorie anlegen)"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Subprozess (optional)</Label>
                    {aktiveSubprozesse.length > 0 ? (
                      <Select value={eSubprozess || '__leer__'} onValueChange={(v) => setESubprozess(v === '__leer__' ? '' : v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__leer__">(keiner)</SelectItem>
                          {aktiveSubprozesse.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={eSubprozess}
                        onChange={(e) => setESubprozess(e.target.value)}
                        placeholder="(keine)"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Relation</Label>
                    <Input
                      value={eRelation}
                      onChange={(e) => setERelation(e.target.value)}
                      placeholder="z.B. Tor10-Lager"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Anzahl (2 NK)</Label>
                    <Input
                      value={eAnzahl}
                      onChange={(e) => setEAnzahl(e.target.value)}
                      placeholder="0,00"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Typ</Label>
                    <Select value={eTyp} onValueChange={(v) => setETyp(v as PackstueckTyp)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKSTUECK_TYPEN.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TYP_LABEL[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Länge [m]</Label>
                    <Input value={eLaenge} onChange={(e) => setELaenge(e.target.value)} inputMode="decimal" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Breite [m]</Label>
                    <Input value={eBreite} onChange={(e) => setEBreite(e.target.value)} inputMode="decimal" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Höhe [m]</Label>
                    <Input value={eHoehe} onChange={(e) => setEHoehe(e.target.value)} inputMode="decimal" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Stapelbar</Label>
                    <Select value={eStapelbar} onValueChange={(v) => setEStapelbar(v as 'unbestimmt' | 'ja' | 'nein')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unbestimmt">(unbestimmt)</SelectItem>
                        <SelectItem value="ja">Ja</SelectItem>
                        <SelectItem value="nein">Nein</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleAddEintrag}
                  disabled={!eProzess.trim() || !eRelation.trim() || parseNum(eAnzahl) === undefined}
                >
                  Eintrag hinzufügen
                </Button>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Filter Prozess:</Label>
              <Select value={eFilter} onValueChange={setEFilter}>
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alle">Alle ({mengenEintraege.length})</SelectItem>
                  {prozesskategorien.map((p) => {
                    const cnt = mengenEintraege.filter((m) => m.prozess === p.name).length;
                    return (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name} ({cnt})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {gefilterteEintraege.length} Eintrag/e angezeigt
              </span>
            </div>

            <ScrollArea className="h-[300px] border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prozess</TableHead>
                    <TableHead>Subprozess</TableHead>
                    <TableHead>Relation</TableHead>
                    <TableHead className="text-right">Anzahl</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="text-right">L [m]</TableHead>
                    <TableHead className="text-right">B [m]</TableHead>
                    <TableHead className="text-right">H [m]</TableHead>
                    <TableHead>Stapelbar</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gefilterteEintraege.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-4">
                        Keine Einträge.
                      </TableCell>
                    </TableRow>
                  )}
                  {gefilterteEintraege.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.prozess}</TableCell>
                      <TableCell>{m.subprozess ?? '—'}</TableCell>
                      <TableCell>{m.relation}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="text"
                          value={m.anzahl}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value.replace(',', '.'));
                            if (Number.isFinite(v)) {
                              updateMengenEintrag(m.id, { anzahl: Math.round(v * 100) / 100 });
                            }
                          }}
                          className="h-7 text-right w-20 ml-auto"
                        />
                      </TableCell>
                      <TableCell>{TYP_LABEL[m.typ]}</TableCell>
                      <TableCell className="text-right">{m.laenge ?? '—'}</TableCell>
                      <TableCell className="text-right">{m.breite ?? '—'}</TableCell>
                      <TableCell className="text-right">{m.hoehe ?? '—'}</TableCell>
                      <TableCell>
                        {m.stapelbar == null ? '—' : m.stapelbar ? 'Ja' : 'Nein'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMengenEintrag(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">CSV-Import/Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Format (Semikolon, Header optional):
                  <code className="ml-1 text-[10px]">
                    prozess;subprozess;relation;anzahl;typ;laenge;breite;hoehe;stapelbar
                  </code>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-xs">Modus:</Label>
                  <Select value={importModus} onValueChange={(v) => setImportModus(v as 'append' | 'replace')}>
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="append">Anhängen</SelectItem>
                      <SelectItem value="replace">Prozesskategorien ersetzen</SelectItem>
                    </SelectContent>
                  </Select>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCsvFile(f);
                      e.target.value = '';
                    }}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" />
                    CSV importieren
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCsvExport}
                    disabled={mengenEintraege.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV exportieren
                  </Button>
                </div>
                {importStatus && (
                  <p className="text-xs text-muted-foreground">{importStatus}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
