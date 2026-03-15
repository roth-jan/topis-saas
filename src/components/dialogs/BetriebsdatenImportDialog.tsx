'use client';

import { useState, useCallback } from 'react';
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
import { useBetriebsdatenStore, ScanRecord, ObjektMetrik, BetriebsAnalyse, HeatmapModus } from '@/lib/betriebsdaten-store';
import { useTopisStore } from '@/lib/store';
import { Database, Upload, BarChart3, Thermometer } from 'lucide-react';
import { toast } from 'sonner';
import { getModusLabel } from '@/lib/heatmap-utils';

export function BetriebsdatenImportDialog() {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);

  const importScanRecords = useBetriebsdatenStore((s) => s.importScanRecords);
  const setAnalyse = useBetriebsdatenStore((s) => s.setAnalyse);
  const heatmapConfig = useBetriebsdatenStore((s) => s.heatmapConfig);
  const setHeatmapConfig = useBetriebsdatenStore((s) => s.setHeatmapConfig);
  const toggleHeatmap = useBetriebsdatenStore((s) => s.toggleHeatmap);
  const analyse = useBetriebsdatenStore((s) => s.analyse);
  const objects = useTopisStore((s) => s.objects);

  const parseCsv = useCallback((text: string): ScanRecord[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split(';').map((h) => h.trim().toLowerCase());
    const records: ScanRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';');
      if (cols.length < 5) continue;

      const getValue = (name: string) => {
        const idx = header.indexOf(name);
        return idx >= 0 ? cols[idx]?.trim() || '' : '';
      };

      const datum = getValue('scandatum') || getValue('datum');
      const zeit = getValue('scanzeit') || getValue('zeit');

      records.push({
        id: i,
        scandatum: datum,
        scanzeit: zeit,
        timestamp: new Date(`${datum}T${zeit}`).getTime() || 0,
        messpunkt: parseInt(getValue('messpunkt')) || 0,
        messpunktName: getValue('messpunktname') || getValue('messpunkt_name') || '',
        tour: getValue('tour') || '',
        dispogebiet: getValue('dispogebiet') || '',
        sendungen: parseFloat(getValue('sendungen')) || 1,
        colli: parseFloat(getValue('colli')) || 0,
        gewicht: parseFloat(getValue('gewicht')) || 0,
        ladezeit: parseFloat(getValue('ladezeit')) || undefined,
      });
    }

    return records;
  }, []);

  const analyseRecords = useCallback(
    (records: ScanRecord[]): BetriebsAnalyse => {
      const daten = [...new Set(records.map((r) => r.scandatum))];
      const arbeitstage = Math.max(daten.length, 1);

      // Map Messpunkte to objects (by name matching)
      const metriken: ObjektMetrik[] = [];

      // Group by messpunkt
      const grouped = new Map<string, ScanRecord[]>();
      records.forEach((r) => {
        const key = r.messpunktName || `MP${r.messpunkt}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
      });

      grouped.forEach((recs, mpName) => {
        // Try to find matching object
        const obj = objects.find(
          (o) =>
            o.name?.toLowerCase().includes(mpName.toLowerCase()) ||
            mpName.toLowerCase().includes(o.name?.toLowerCase() || '---')
        );

        if (obj) {
          const totalSendungen = recs.reduce((s, r) => s + r.sendungen, 0);
          const totalColli = recs.reduce((s, r) => s + r.colli, 0);
          const totalGewicht = recs.reduce((s, r) => s + r.gewicht, 0);
          const ladezeiten = recs.filter((r) => r.ladezeit).map((r) => r.ladezeit!);
          const avgLadezeit = ladezeiten.length > 0 ? ladezeiten.reduce((a, b) => a + b, 0) / ladezeiten.length : 0;

          metriken.push({
            objectId: obj.id,
            objectName: obj.name || mpName,
            sendungen: totalSendungen / arbeitstage,
            colli: totalColli / arbeitstage,
            gewicht: totalGewicht / arbeitstage,
            durchschnittLadezeit: avgLadezeit,
            auslastung: Math.min(1, (totalSendungen / arbeitstage) / 50), // 50 Sdg/Tag = 100%
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

  const handleImport = () => {
    setImporting(true);
    try {
      const records = parseCsv(csvText);
      if (records.length === 0) {
        toast.error('Keine gültigen Datensätze gefunden');
        return;
      }

      importScanRecords(records);
      const result = analyseRecords(records);
      setAnalyse(result);
      setHeatmapConfig({ aktiv: true });

      toast.success(`${records.length} Datensätze importiert, ${result.objektMetriken.length} Objekte zugeordnet`);
      setCsvText('');
    } catch (e) {
      toast.error('Fehler beim Import: ' + (e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleDemoData = () => {
    // Generate demo betriebsdaten for existing objects
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <Database className="h-3.5 w-3.5" />
          Betriebsdaten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Betriebsdaten importieren
          </DialogTitle>
          <DialogDescription>
            Importiere Scan-/Betriebsdaten (CSV) um Heatmaps und Auslastungsanalysen zu erstellen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>CSV-Datei hochladen</Label>
            <div className="mt-1 flex gap-2">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
              />
              <Button variant="secondary" size="sm" onClick={handleDemoData}>
                <BarChart3 className="h-3.5 w-3.5 mr-1" />
                Demo-Daten
              </Button>
            </div>
          </div>

          {/* CSV Preview */}
          {csvText && (
            <div>
              <Label>Vorschau ({csvText.split('\n').length - 1} Zeilen)</Label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={8}
                className="mt-1 w-full rounded border bg-muted p-2 font-mono text-xs"
              />
            </div>
          )}

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
                      {(['sendungen', 'colli', 'gewicht', 'auslastung', 'ladezeit'] as HeatmapModus[]).map((m) => (
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
                    onValueChange={(v) => setHeatmapConfig({ farbskala: v as 'gruen-rot' | 'blau-rot' | 'mono' })}
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

              <div className="text-xs text-muted-foreground">
                {analyse.objektMetriken.length} Objekte zugeordnet |{' '}
                {analyse.arbeitstage} Arbeitstage |{' '}
                {Math.round(analyse.gesamtSendungen).toLocaleString('de-DE')} Sendungen gesamt
              </div>
            </div>
          )}

          {/* Import Button */}
          {csvText && (
            <div className="flex justify-end">
              <Button onClick={handleImport} disabled={importing}>
                <Upload className="h-4 w-4 mr-1" />
                {importing ? 'Importiere...' : 'Importieren & Analysieren'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
