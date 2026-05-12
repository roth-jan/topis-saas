'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useBetriebsdatenStore, type BetriebsAnalyse, type ObjektMetrik } from '@/lib/betriebsdaten-store';
import { useTopisStore } from '@/lib/store';
import { parseCsvMitProfil } from '@/lib/spaltenzuordnungen';
import { xlsxToCSV, isExcelFile } from '@/lib/xlsx-utils';
import { GitCompare, Upload, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { ScandatenRecord, TorZuordnung } from '@/types/scandaten';

function formatDelta(current: number, previous: number): { text: string; color: string; icon: 'up' | 'down' | 'same' } {
  if (previous === 0) return { text: '-', color: 'text-muted-foreground', icon: 'same' };
  const delta = ((current - previous) / previous) * 100;
  const sign = delta > 0 ? '+' : '';
  if (Math.abs(delta) < 0.5) return { text: `${sign}${delta.toFixed(1)}%`, color: 'text-muted-foreground', icon: 'same' };
  if (delta > 0) return { text: `${sign}${delta.toFixed(1)}%`, color: 'text-red-500', icon: 'up' };
  return { text: `${delta.toFixed(1)}%`, color: 'text-green-500', icon: 'down' };
}

export function VergleichDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const analyse = useBetriebsdatenStore((s) => s.analyse);
  const vergleichsAnalyse = useBetriebsdatenStore((s) => s.vergleichsAnalyse);
  const setVergleichsAnalyse = useBetriebsdatenStore((s) => s.setVergleichsAnalyse);
  const torZuordnungen = useBetriebsdatenStore((s) => s.torZuordnungen);
  const objects = useTopisStore((s) => s.objects);

  // Analyse berechnen für importierte Vergleichsdaten
  const analyseWithZuordnung = useCallback(
    (records: ScandatenRecord[], zuordnungen: TorZuordnung[]): BetriebsAnalyse => {
      const daten = [...new Set(records.map((r) => r.scandatum).filter(Boolean))];
      const arbeitstage = Math.max(daten.length, 1);
      const metriken: ObjektMetrik[] = [];

      const grouped = new Map<string, ScandatenRecord[]>();
      records.forEach((r) => {
        const key = r.stellplatz || `MP${r.messpunkt}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(r);
      });

      grouped.forEach((recs, stellplatzKey) => {
        const zuordnung = zuordnungen.find((z) => z.stellplatzKey === stellplatzKey);
        const objectId = zuordnung?.objectId || 0;
        if (!objectId) return;
        const obj = objects.find((o) => o.id === objectId);
        if (!obj) return;

        const totalSendungen = recs.reduce((s, r) => s + r.sendungen, 0);
        const totalColli = recs.reduce((s, r) => s + r.colli, 0);
        const totalGewicht = recs.reduce((s, r) => s + r.gewicht, 0);
        const ladezeiten = recs.filter((r) => r.ladezeit).map((r) => r.ladezeit!);
        const avgLadezeit = ladezeiten.length > 0 ? ladezeiten.reduce((a, b) => a + b, 0) / ladezeiten.length : 0;

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
        zeitraum: { von: daten.sort()[0] || '', bis: daten.sort()[daten.length - 1] || '' },
        arbeitstage,
        gesamtSendungen: records.reduce((s, r) => s + r.sendungen, 0),
        gesamtColli: records.reduce((s, r) => s + r.colli, 0),
        gesamtGewicht: records.reduce((s, r) => s + r.gewicht, 0),
        objektMetriken: metriken,
      };
    },
    [objects]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      let csvText: string;
      if (isExcelFile(file.name)) {
        const result = await xlsxToCSV(file);
        csvText = result.csvText;
      } else {
        csvText = await file.text();
      }

      const result = parseCsvMitProfil(csvText);
      if (result.records.length === 0) {
        toast.error('Keine Datensätze im Vergleichsdatensatz gefunden');
        return;
      }

      const vergleich = analyseWithZuordnung(result.records, torZuordnungen);
      setVergleichsAnalyse(vergleich);
      toast.success(`Vergleichsdaten geladen: ${result.records.length} Datensätze, ${vergleich.arbeitstage} Tage`);
    } catch (err) {
      toast.error('Fehler: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Top 5 Tore nach Colli-Veränderung
  const torVergleich = useMemo(() => {
    if (!analyse || !vergleichsAnalyse) return [];
    return analyse.objektMetriken
      .map((m) => {
        const vgl = vergleichsAnalyse.objektMetriken.find((v) => v.objectId === m.objectId);
        return {
          name: m.objectName,
          aktuellColli: m.colli,
          vergleichColli: vgl?.colli || 0,
          delta: vgl ? m.colli - vgl.colli : m.colli,
          deltaPct: vgl && vgl.colli > 0 ? ((m.colli - vgl.colli) / vgl.colli) * 100 : 0,
        };
      })
      .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
      .slice(0, 10);
  }, [analyse, vergleichsAnalyse]);

  const DeltaIcon = ({ icon }: { icon: 'up' | 'down' | 'same' }) => {
    if (icon === 'up') return <TrendingUp className="h-3.5 w-3.5" />;
    if (icon === 'down') return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs" disabled={!analyse}>
          <GitCompare className="h-3.5 w-3.5" />
          Vergleich
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Historischer Vergleich
          </DialogTitle>
          <DialogDescription>
            Vergleiche den aktuellen Datensatz mit einem zweiten Zeitraum.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aktueller Datensatz */}
          {analyse && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <Label className="text-xs text-muted-foreground">Aktueller Datensatz</Label>
              <div className="text-sm font-medium mt-1">
                {analyse.zeitraum.von} – {analyse.zeitraum.bis} ({analyse.arbeitstage} Tage)
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(analyse.gesamtColli).toLocaleString('de-DE')} Colli |{' '}
                {Math.round(analyse.gesamtSendungen).toLocaleString('de-DE')} Sendungen
              </div>
            </div>
          )}

          {/* Vergleichsdatensatz Upload */}
          <div>
            <Label>Vergleichsdatensatz hochladen (CSV/Excel)</Label>
            <input
              type="file"
              accept=".csv,.txt,.tsv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="mt-1 w-full text-sm file:mr-2 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
              disabled={loading}
            />
            {loading && <p className="text-xs text-muted-foreground mt-1">Lade...</p>}
          </div>

          {/* Vergleichsergebnisse */}
          {analyse && vergleichsAnalyse && (
            <>
              {/* KPI-Vergleich */}
              <div className="rounded-lg border p-4">
                <Label className="text-xs font-medium">KPI-Vergleich</Label>
                <div className="mt-2 space-y-2">
                  {[
                    {
                      label: 'Colli/Tag',
                      current: analyse.gesamtColli / analyse.arbeitstage,
                      previous: vergleichsAnalyse.gesamtColli / vergleichsAnalyse.arbeitstage,
                    },
                    {
                      label: 'Sendungen/Tag',
                      current: analyse.gesamtSendungen / analyse.arbeitstage,
                      previous: vergleichsAnalyse.gesamtSendungen / vergleichsAnalyse.arbeitstage,
                    },
                    {
                      label: 'Gewicht/Tag (kg)',
                      current: analyse.gesamtGewicht / analyse.arbeitstage,
                      previous: vergleichsAnalyse.gesamtGewicht / vergleichsAnalyse.arbeitstage,
                    },
                    {
                      label: 'Aktive Tore',
                      current: analyse.objektMetriken.length,
                      previous: vergleichsAnalyse.objektMetriken.length,
                    },
                  ].map(({ label, current, previous }) => {
                    const d = formatDelta(current, previous);
                    return (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground w-24 text-right">
                            {Math.round(previous).toLocaleString('de-DE')}
                          </span>
                          <span className="font-medium w-24 text-right">
                            {Math.round(current).toLocaleString('de-DE')}
                          </span>
                          <span className={`w-20 text-right font-medium flex items-center justify-end gap-1 ${d.color}`}>
                            <DeltaIcon icon={d.icon} />
                            {d.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex text-xs text-muted-foreground mt-2 gap-8 justify-end">
                  <span>Vergleich ({vergleichsAnalyse.zeitraum.von})</span>
                  <span>Aktuell ({analyse.zeitraum.von})</span>
                  <span>Delta</span>
                </div>
              </div>

              {/* Top Tore nach Veränderung */}
              <div className="rounded-lg border p-4">
                <Label className="text-xs font-medium">Größte Veränderungen (Colli/Tag pro Tor)</Label>
                <div className="mt-2 max-h-[300px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-1.5">Tor</th>
                        <th className="text-right p-1.5">Vorher</th>
                        <th className="text-right p-1.5">Aktuell</th>
                        <th className="text-right p-1.5">Delta</th>
                        <th className="p-1.5 w-24">Veränderung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {torVergleich.map((t) => {
                        const d = formatDelta(t.aktuellColli, t.vergleichColli);
                        const barWidth = Math.min(Math.abs(t.deltaPct), 100);
                        const isPositive = t.deltaPct > 0;
                        return (
                          <tr key={t.name} className="border-t">
                            <td className="p-1.5 font-medium">{t.name}</td>
                            <td className="p-1.5 text-right text-muted-foreground">
                              {Math.round(t.vergleichColli).toLocaleString('de-DE')}
                            </td>
                            <td className="p-1.5 text-right font-medium">
                              {Math.round(t.aktuellColli).toLocaleString('de-DE')}
                            </td>
                            <td className={`p-1.5 text-right font-medium ${d.color}`}>
                              {d.text}
                            </td>
                            <td className="p-1.5">
                              <div className="w-full h-3 bg-muted rounded overflow-hidden">
                                <div
                                  className={`h-full rounded ${isPositive ? 'bg-red-500/60' : 'bg-green-500/60'}`}
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!analyse && (
            <div className="text-center text-muted-foreground py-8">
              Bitte zuerst Betriebsdaten importieren.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
