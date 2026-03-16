'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBetriebsdatenStore, ObjektMetrik, BetriebsAnalyse, HeatmapModus } from '@/lib/betriebsdaten-store';
import { useTopisStore } from '@/lib/store';
import { Database, Upload, BarChart3, Thermometer, ChevronLeft, ChevronRight, Check, FileText, Link2, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getModusLabel } from '@/lib/heatmap-utils';
import { SPALTEN_PROFILE, parseCsvMitProfil } from '@/lib/spaltenzuordnungen';
import type { ScandatenRecord, TorZuordnung, RelationZuordnung, Spaltenzuordnung } from '@/types/scandaten';

type WizardStep = 1 | 2 | 3 | 4;

export function BetriebsdatenImportDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  // Parsed data
  const [parsedRecords, setParsedRecords] = useState<ScandatenRecord[]>([]);
  const [erkanntesProfil, setErkanntesProfil] = useState<Spaltenzuordnung | null>(null);
  const [selectedProfilId, setSelectedProfilId] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  // Zuordnungen
  const [torZuordnungen, setTorZuordnungen] = useState<TorZuordnung[]>([]);
  const [relationZuordnungen, setRelationZuordnungen] = useState<RelationZuordnung[]>([]);

  // Store
  const importScandatenRecords = useBetriebsdatenStore((s) => s.importScandatenRecords);
  const setAnalyse = useBetriebsdatenStore((s) => s.setAnalyse);
  const storeTorZuordnungen = useBetriebsdatenStore((s) => s.setTorZuordnungen);
  const storeRelationZuordnungen = useBetriebsdatenStore((s) => s.setRelationZuordnungen);
  const storeSpaltenzuordnung = useBetriebsdatenStore((s) => s.setSpaltenzuordnung);
  const heatmapConfig = useBetriebsdatenStore((s) => s.heatmapConfig);
  const setHeatmapConfig = useBetriebsdatenStore((s) => s.setHeatmapConfig);
  const toggleHeatmap = useBetriebsdatenStore((s) => s.toggleHeatmap);
  const analyse = useBetriebsdatenStore((s) => s.analyse);
  const objects = useTopisStore((s) => s.objects);

  // Layout-Tore und Bereiche
  const layoutTore = useMemo(() => objects.filter((o) => o.type === 'tor'), [objects]);
  const layoutBereiche = useMemo(
    () => objects.filter((o) => ['bereich', 'stellplatz', 'entladebereich'].includes(o.type)),
    [objects]
  );

  // ==================== STEP 1: Datei + Format ====================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      parseAndDetect(text);
    };
    reader.readAsText(file);
  };

  const parseAndDetect = useCallback(
    (text: string, profilOverride?: Spaltenzuordnung) => {
      const profil = profilOverride || (selectedProfilId ? SPALTEN_PROFILE.find((p) => p.id === selectedProfilId) : undefined);
      const result = parseCsvMitProfil(text, profil || undefined);

      setParsedRecords(result.records);
      setCsvHeaders(result.headers);

      if (result.erkanntesProfil && !profilOverride) {
        setErkanntesProfil(result.erkanntesProfil);
        setSelectedProfilId(result.erkanntesProfil.id);
      }

      // Auto-Tor-Zuordnung
      if (result.records.length > 0) {
        const uniqueStellplaetze = [...new Set(result.records.map((r) => r.stellplatz).filter(Boolean))];
        const autoZuordnungen: TorZuordnung[] = uniqueStellplaetze.map((sp) => {
          // Auto-Match: stellplatz === torNummer
          const spNum = parseInt(sp);
          const matchedTor = layoutTore.find(
            (t) =>
              t.torNummer === spNum ||
              t.name?.toLowerCase() === sp.toLowerCase() ||
              t.name?.toLowerCase() === `tor ${sp}`.toLowerCase() ||
              t.name?.toLowerCase().includes(sp.toLowerCase())
          );
          return {
            stellplatzKey: sp,
            objectId: matchedTor?.id || 0,
            objectName: matchedTor?.name || '(nicht zugeordnet)',
            autoMatched: !!matchedTor,
          };
        });
        setTorZuordnungen(autoZuordnungen);

        // Auto-Relations-Zuordnung
        const uniqueRelationen = [...new Set(result.records.map((r) => r.ausgangsrelation).filter(Boolean))];
        const autoRelationen: RelationZuordnung[] = uniqueRelationen.map((rel) => {
          const matchedBereich = layoutBereiche.find(
            (b) =>
              b.name?.toLowerCase() === rel.toLowerCase() ||
              b.name?.toLowerCase().includes(rel.toLowerCase()) ||
              rel.toLowerCase().includes(b.name?.toLowerCase() || '---')
          );
          return {
            relationKey: rel,
            objectId: matchedBereich?.id || null,
            objectName: matchedBereich?.name || '(nicht zugeordnet)',
          };
        });
        setRelationZuordnungen(autoRelationen);
      }
    },
    [layoutTore, layoutBereiche, selectedProfilId]
  );

  const handleProfilChange = (profilId: string) => {
    setSelectedProfilId(profilId);
    const profil = SPALTEN_PROFILE.find((p) => p.id === profilId);
    if (csvText && profil) {
      parseAndDetect(csvText, profil);
    }
  };

  // ==================== STEP 2: Tor-Zuordnung ====================
  const handleTorZuordnungChange = (stellplatzKey: string, objectId: number) => {
    setTorZuordnungen((prev) =>
      prev.map((z) => {
        if (z.stellplatzKey !== stellplatzKey) return z;
        const obj = layoutTore.find((t) => t.id === objectId);
        return {
          ...z,
          objectId,
          objectName: obj?.name || '(nicht zugeordnet)',
          autoMatched: false,
        };
      })
    );
  };

  const zuordnungsStats = useMemo(() => {
    const total = torZuordnungen.length;
    const zugeordnet = torZuordnungen.filter((z) => z.objectId > 0).length;
    const auto = torZuordnungen.filter((z) => z.autoMatched && z.objectId > 0).length;
    return { total, zugeordnet, auto };
  }, [torZuordnungen]);

  // ==================== STEP 3: Relations-Zuordnung ====================
  const handleRelationChange = (relationKey: string, objectId: number | null) => {
    setRelationZuordnungen((prev) =>
      prev.map((z) => {
        if (z.relationKey !== relationKey) return z;
        const obj = objectId ? [...layoutBereiche, ...layoutTore].find((b) => b.id === objectId) : null;
        return {
          ...z,
          objectId,
          objectName: obj?.name || '(nicht zugeordnet)',
        };
      })
    );
  };

  // ==================== STEP 4: Import ====================
  const handleImport = () => {
    setImporting(true);
    try {
      if (parsedRecords.length === 0) {
        toast.error('Keine gültigen Datensätze gefunden');
        return;
      }

      // Store setzen
      importScandatenRecords(parsedRecords);
      storeTorZuordnungen(torZuordnungen);
      storeRelationZuordnungen(relationZuordnungen);
      storeSpaltenzuordnung(erkanntesProfil);

      // Analyse berechnen (mit Tor-Zuordnung statt Name-Match!)
      const result = analyseWithZuordnung(parsedRecords, torZuordnungen);
      setAnalyse(result);
      setHeatmapConfig({ aktiv: true });

      toast.success(
        `${parsedRecords.length} Datensätze importiert, ${result.objektMetriken.length} Tore zugeordnet`
      );
      setOpen(false);
      resetWizard();
    } catch (e) {
      toast.error('Fehler beim Import: ' + (e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  /** Analyse MIT korrekter Tor-Zuordnung (statt fuzzy Name-Match) */
  const analyseWithZuordnung = useCallback(
    (records: ScandatenRecord[], zuordnungen: TorZuordnung[]): BetriebsAnalyse => {
      const daten = [...new Set(records.map((r) => r.scandatum).filter(Boolean))];
      const arbeitstage = Math.max(daten.length, 1);

      const metriken: ObjektMetrik[] = [];

      // Group by stellplatz
      const grouped = new Map<string, ScandatenRecord[]>();
      records.forEach((r) => {
        const key = r.stellplatz || `MP${r.messpunkt}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
      });

      grouped.forEach((recs, stellplatzKey) => {
        // Zuordnung über Tor-Zuordnungs-Tabelle (NICHT fuzzy Name!)
        const zuordnung = zuordnungen.find((z) => z.stellplatzKey === stellplatzKey);
        const objectId = zuordnung?.objectId || 0;
        if (!objectId) return;

        const obj = objects.find((o) => o.id === objectId);
        if (!obj) return;

        const totalSendungen = recs.reduce((s, r) => s + r.sendungen, 0);
        const totalColli = recs.reduce((s, r) => s + r.colli, 0);
        const totalGewicht = recs.reduce((s, r) => s + r.gewicht, 0);
        const ladezeiten = recs.filter((r) => r.ladezeit).map((r) => r.ladezeit!);
        const avgLadezeit =
          ladezeiten.length > 0 ? ladezeiten.reduce((a, b) => a + b, 0) / ladezeiten.length : 0;

        // Check if already added (multiple stellplatz can map to same object)
        const existing = metriken.find((m) => m.objectId === objectId);
        if (existing) {
          existing.sendungen += totalSendungen / arbeitstage;
          existing.colli += totalColli / arbeitstage;
          existing.gewicht += totalGewicht / arbeitstage;
          existing.fahrtenProTag += recs.length / arbeitstage;
          existing.auslastung = Math.min(1, existing.sendungen / 50);
        } else {
          metriken.push({
            objectId,
            objectName: obj.name || stellplatzKey,
            sendungen: totalSendungen / arbeitstage,
            colli: totalColli / arbeitstage,
            gewicht: totalGewicht / arbeitstage,
            durchschnittLadezeit: avgLadezeit,
            auslastung: Math.min(1, (totalSendungen / arbeitstage) / 50),
            fahrtenProTag: recs.length / arbeitstage,
          });
        }
      });

      return {
        zeitraum: {
          von: daten.sort()[0] || '',
          bis: daten.sort()[daten.length - 1] || '',
        },
        arbeitstage,
        gesamtSendungen: records.reduce((s, r) => s + r.sendungen, 0),
        gesamtColli: records.reduce((s, r) => s + r.colli, 0),
        gesamtGewicht: records.reduce((s, r) => s + r.gewicht, 0),
        objektMetriken: metriken,
      };
    },
    [objects]
  );

  const handleDemoData = () => {
    const tore = objects.filter((o) => o.type === 'tor');
    if (tore.length === 0) {
      toast.error('Keine Tore im Layout vorhanden');
      return;
    }

    const metriken: ObjektMetrik[] = tore.map((tor) => ({
      objectId: tor.id,
      objectName: tor.name || `Tor ${tor.id}`,
      sendungen: Math.round(5 + Math.random() * 45),
      colli: Math.round(20 + Math.random() * 180),
      gewicht: Math.round(500 + Math.random() * 9500),
      durchschnittLadezeit: Math.round(30 + Math.random() * 90),
      auslastung: 0.1 + Math.random() * 0.9,
      fahrtenProTag: Math.round(3 + Math.random() * 20),
    }));

    setAnalyse({
      zeitraum: { von: '2026-02-01', bis: '2026-02-28' },
      arbeitstage: 20,
      gesamtSendungen: metriken.reduce((s, m) => s + m.sendungen * 20, 0),
      gesamtColli: metriken.reduce((s, m) => s + m.colli * 20, 0),
      gesamtGewicht: metriken.reduce((s, m) => s + m.gewicht * 20, 0),
      objektMetriken: metriken,
    });

    setHeatmapConfig({ aktiv: true });
    toast.success(`Demo-Daten für ${metriken.length} Tore generiert`);
    setOpen(false);
  };

  const resetWizard = () => {
    setStep(1);
    setCsvText('');
    setParsedRecords([]);
    setErkanntesProfil(null);
    setSelectedProfilId('');
    setCsvHeaders([]);
    setTorZuordnungen([]);
    setRelationZuordnungen([]);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return parsedRecords.length > 0;
      case 2:
        return zuordnungsStats.zugeordnet > 0;
      case 3:
        return true; // Relations sind optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const stepLabels = ['Datei & Format', 'Tor-Zuordnung', 'Relationen', 'Vorschau & Import'];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetWizard();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <Database className="h-3.5 w-3.5" />
          Betriebsdaten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Betriebsdaten importieren
          </DialogTitle>
          <DialogDescription>
            Scandaten (CSV) importieren, Tore zuordnen und Heatmaps erstellen.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 mb-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > i + 1 ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-xs truncate ${step === i + 1 ? 'font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {i < 3 && <div className="flex-1 h-px bg-border min-w-2" />}
            </div>
          ))}
        </div>

        {/* ==================== STEP 1 ==================== */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>CSV-Datei hochladen</Label>
              <div className="mt-1 flex gap-2">
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
                />
                <Button variant="secondary" size="sm" onClick={handleDemoData}>
                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                  Demo-Daten
                </Button>
              </div>
            </div>

            {csvText && (
              <>
                <div>
                  <Label>Format</Label>
                  <Select value={selectedProfilId} onValueChange={handleProfilChange}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="Auto-Erkennung..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SPALTEN_PROFILE.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {erkanntesProfil?.id === p.id ? '(erkannt)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {erkanntesProfil && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <FileText className="h-3 w-3 inline mr-1" />
                      Auto-erkannt: <strong>{erkanntesProfil.name}</strong> — {erkanntesProfil.beschreibung}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Vorschau ({csvText.split('\n').length - 1} Zeilen)</Label>
                  <textarea
                    value={csvText.split('\n').slice(0, 6).join('\n') + (csvText.split('\n').length > 6 ? '\n...' : '')}
                    readOnly
                    rows={5}
                    className="mt-1 w-full rounded border bg-muted p-2 font-mono text-xs"
                  />
                </div>

                {parsedRecords.length > 0 && (
                  <div className="rounded-lg border bg-green-500/10 p-3 text-sm">
                    <strong>{parsedRecords.length}</strong> Datensätze erkannt |{' '}
                    <strong>{[...new Set(parsedRecords.map((r) => r.stellplatz).filter(Boolean))].length}</strong>{' '}
                    unique Stellplätze |{' '}
                    <strong>{[...new Set(parsedRecords.map((r) => r.ausgangsrelation).filter(Boolean))].length}</strong>{' '}
                    Relationen |{' '}
                    Spalten: {csvHeaders.join(', ')}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================== STEP 2: Tor-Zuordnung ==================== */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" />
                  Stellplatz → Layout-Tor
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ordne CSV-Stellplätze den Toren im Layout zu.
                </p>
              </div>
              <div className="text-xs text-right">
                <span className="text-green-500 font-medium">{zuordnungsStats.zugeordnet}</span> / {zuordnungsStats.total} zugeordnet
                {zuordnungsStats.auto > 0 && (
                  <span className="text-muted-foreground ml-1">({zuordnungsStats.auto} auto)</span>
                )}
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto border rounded">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Stellplatz (CSV)</th>
                    <th className="text-left p-2 font-medium">Scans</th>
                    <th className="text-left p-2 font-medium">Colli</th>
                    <th className="text-left p-2 font-medium">Layout-Tor</th>
                  </tr>
                </thead>
                <tbody>
                  {torZuordnungen.map((z) => {
                    const scans = parsedRecords.filter((r) => r.stellplatz === z.stellplatzKey);
                    const totalColli = scans.reduce((s, r) => s + r.colli, 0);
                    return (
                      <tr
                        key={z.stellplatzKey}
                        className={`border-t ${z.objectId > 0 ? '' : 'bg-red-500/5'}`}
                      >
                        <td className="p-2 font-mono">{z.stellplatzKey}</td>
                        <td className="p-2">{scans.length}</td>
                        <td className="p-2">{Math.round(totalColli).toLocaleString('de-DE')}</td>
                        <td className="p-2">
                          <Select
                            value={z.objectId > 0 ? z.objectId.toString() : '0'}
                            onValueChange={(v) => handleTorZuordnungChange(z.stellplatzKey, parseInt(v))}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">(nicht zugeordnet)</SelectItem>
                              {layoutTore.map((t) => (
                                <SelectItem key={t.id} value={t.id.toString()}>
                                  {t.name || `Tor ${t.torNummer || t.id}`}
                                  {t.torNummer ? ` (#${t.torNummer})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {torZuordnungen.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Keine Stellplätze in den Daten gefunden.
                <br />
                Stelle sicher, dass das CSV-Format korrekt erkannt wurde.
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 3: Relations-Zuordnung ==================== */}
        {step === 3 && (
          <div className="space-y-3">
            <div>
              <Label className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Ausgangsrelation → Layout-Bereich
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Optional: Ordne Relationen Layout-Bereichen zu (für Flächenbedarf + Verteilweg).
              </p>
            </div>

            {relationZuordnungen.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Relation (CSV)</th>
                      <th className="text-left p-2 font-medium">Colli</th>
                      <th className="text-left p-2 font-medium">Layout-Bereich</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relationZuordnungen.map((z) => {
                      const recs = parsedRecords.filter((r) => r.ausgangsrelation === z.relationKey);
                      const totalColli = recs.reduce((s, r) => s + r.colli, 0);
                      return (
                        <tr key={z.relationKey} className="border-t">
                          <td className="p-2 font-mono">{z.relationKey}</td>
                          <td className="p-2">{Math.round(totalColli).toLocaleString('de-DE')}</td>
                          <td className="p-2">
                            <Select
                              value={z.objectId?.toString() || '0'}
                              onValueChange={(v) =>
                                handleRelationChange(z.relationKey, v === '0' ? null : parseInt(v))
                              }
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">(nicht zugeordnet)</SelectItem>
                                {layoutBereiche.map((b) => (
                                  <SelectItem key={b.id} value={b.id.toString()}>
                                    {b.name || `${b.type} ${b.id}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                Keine Ausgangsrelationen in den Daten gefunden.
                <br />
                Dieser Schritt kann übersprungen werden.
              </div>
            )}
          </div>
        )}

        {/* ==================== STEP 4: Vorschau & Import ==================== */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium text-sm">Import-Zusammenfassung</span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div>Datensätze:</div>
                <div className="font-medium">{parsedRecords.length.toLocaleString('de-DE')}</div>

                <div>Format:</div>
                <div className="font-medium">{erkanntesProfil?.name || 'Unbekannt'}</div>

                <div>Unique Stellplätze:</div>
                <div className="font-medium">
                  {[...new Set(parsedRecords.map((r) => r.stellplatz).filter(Boolean))].length}
                </div>

                <div>Tore zugeordnet:</div>
                <div className="font-medium text-green-500">
                  {zuordnungsStats.zugeordnet} / {zuordnungsStats.total}
                </div>

                <div>Relationen zugeordnet:</div>
                <div className="font-medium">
                  {relationZuordnungen.filter((r) => r.objectId).length} / {relationZuordnungen.length}
                </div>

                <div>Zeitraum:</div>
                <div className="font-medium">
                  {parsedRecords.length > 0
                    ? (() => {
                        const daten = [...new Set(parsedRecords.map((r) => r.scandatum).filter(Boolean))].sort();
                        return `${daten[0]} – ${daten[daten.length - 1]} (${daten.length} Tage)`;
                      })()
                    : '-'}
                </div>

                <div>Gesamt Colli:</div>
                <div className="font-medium">
                  {Math.round(parsedRecords.reduce((s, r) => s + r.colli, 0)).toLocaleString('de-DE')}
                </div>

                <div>Gesamt Sendungen:</div>
                <div className="font-medium">
                  {Math.round(parsedRecords.reduce((s, r) => s + r.sendungen, 0)).toLocaleString('de-DE')}
                </div>
              </div>
            </div>

            {/* Heatmap Controls */}
            {analyse && (
              <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Thermometer className="h-4 w-4" />
                    Heatmap
                  </span>
                  <Button
                    variant={heatmapConfig.aktiv ? 'default' : 'outline'}
                    size="sm"
                    onClick={toggleHeatmap}
                  >
                    {heatmapConfig.aktiv ? 'Aktiv' : 'Inaktiv'}
                  </Button>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs">Metrik</Label>
                    <Select
                      value={heatmapConfig.modus}
                      onValueChange={(v) => setHeatmapConfig({ modus: v as HeatmapModus })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            'sendungen',
                            'colli',
                            'gewicht',
                            'auslastung',
                            'ladezeit',
                            'colliVerteilung',
                          ] as HeatmapModus[]
                        ).map((m) => (
                          <SelectItem key={m} value={m}>
                            {getModusLabel(m)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Farbskala</Label>
                    <Select
                      value={heatmapConfig.farbskala}
                      onValueChange={(v) =>
                        setHeatmapConfig({ farbskala: v as 'gruen-rot' | 'blau-rot' | 'mono' })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gruen-rot">Grün → Rot</SelectItem>
                        <SelectItem value="blau-rot">Blau → Rot</SelectItem>
                        <SelectItem value="mono">Mono (Rot)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {zuordnungsStats.zugeordnet < zuordnungsStats.total && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400">
                <strong>Hinweis:</strong>{' '}
                {zuordnungsStats.total - zuordnungsStats.zugeordnet} Stellplätze sind nicht zugeordnet.
                Daten dieser Stellplätze werden nicht in der Heatmap angezeigt.
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-4 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep((s) => Math.max(1, s - 1) as WizardStep)}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>

          {step < 4 ? (
            <Button
              size="sm"
              onClick={() => setStep((s) => Math.min(4, s + 1) as WizardStep)}
              disabled={!canProceed()}
            >
              Weiter
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleImport} disabled={importing}>
              <Upload className="h-4 w-4 mr-1" />
              {importing ? 'Importiere...' : 'Importieren & Analysieren'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
