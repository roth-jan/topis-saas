'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { berechneIstSoll, type IstSollAnalyse } from '@/lib/ist-soll-rechner';
import { Clock, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';

export function IstSollDialog() {
  const [open, setOpen] = useState(false);
  const [istMA, setIstMA] = useState<Record<number, number>>({});

  const stundenAggregation = useBetriebsdatenStore((s) => s.stundenAggregation);
  const scandatenRecords = useBetriebsdatenStore((s) => s.scandatenRecords);
  const ergebnis = useProzessmodellStore((s) => s.ergebnis);
  const berechne = useProzessmodellStore((s) => s.berechne);

  const minProColli = ergebnis?.minProColli || 1.917; // Fallback AS
  const arbeitsminProStunde = ergebnis?.arbeitsminProStunde || 52.9;

  // Arbeitstage
  const arbeitstage = useMemo(() => {
    const daten = [...new Set(scandatenRecords.map((r) => r.scandatum).filter(Boolean))];
    return Math.max(daten.length, 1);
  }, [scandatenRecords]);

  const analyse: IstSollAnalyse | null = useMemo(() => {
    if (stundenAggregation.length === 0) return null;
    return berechneIstSoll(stundenAggregation, istMA, minProColli, arbeitsminProStunde, arbeitstage);
  }, [stundenAggregation, istMA, minProColli, arbeitsminProStunde, arbeitstage]);

  const handleIstMAChange = (stunde: number, value: number) => {
    setIstMA((prev) => ({ ...prev, [stunde]: value }));
  };

  // Aktive Stunden (mit Colli)
  const aktiveStunden = useMemo(
    () => stundenAggregation.filter((a) => a.colli > 0).sort((a, b) => a.stunde - b.stunde),
    [stundenAggregation]
  );

  // Max-Wert für Balken
  const maxMA = useMemo(() => {
    if (!analyse) return 10;
    return Math.max(
      ...analyse.stunden.map((s) => Math.max(s.sollMA, s.istMA)),
      1
    );
  }, [analyse]);

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v && !ergebnis) berechne();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <Users className="h-3.5 w-3.5" />
          IST-SOLL
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            IST-SOLL-Analyse
          </DialogTitle>
          <DialogDescription>
            Stundengenaue Produktivitätsanalyse: SOLL-MA (aus Colli × Min/Colli) vs. IST-MA (Eingabe).
          </DialogDescription>
        </DialogHeader>

        {aktiveStunden.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Bitte zuerst Betriebsdaten importieren.
          </div>
        ) : (
          <div className="space-y-4">
            {/* KPIs */}
            {analyse && (
              <div className="grid grid-cols-4 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold">{analyse.gesamtSollStunden.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">SOLL (MA-Std)</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold">{analyse.gesamtIstStunden.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">IST (MA-Std)</div>
                </div>
                <div
                  className={`rounded-lg border p-3 text-center ${
                    analyse.gesamtDelta > 0
                      ? 'border-yellow-500/30 bg-yellow-500/5'
                      : analyse.gesamtDelta < -1
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-green-500/30 bg-green-500/5'
                  }`}
                >
                  <div className="text-xl font-bold">
                    {analyse.gesamtDelta > 0 ? '+' : ''}
                    {analyse.gesamtDelta.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Delta (Std)</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold">
                    {analyse.durchschnittLuecke > 0 ? '+' : ''}
                    {analyse.durchschnittLuecke.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Ø Lücke</div>
                </div>
              </div>
            )}

            {/* Parameter */}
            <div className="flex gap-4 text-xs text-muted-foreground bg-muted/50 rounded p-2">
              <span>Min/Colli: <strong>{minProColli.toFixed(3)}</strong></span>
              <span>Arbeitsmin/h: <strong>{arbeitsminProStunde}</strong></span>
              <span>Arbeitstage: <strong>{arbeitstage}</strong></span>
            </div>

            {/* Stündliche Tabelle + Balken */}
            <div className="border rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 font-medium w-16">Stunde</th>
                    <th className="text-right p-2 font-medium w-20">Colli</th>
                    <th className="text-right p-2 font-medium w-16">SOLL</th>
                    <th className="text-center p-2 font-medium w-24">IST (Eingabe)</th>
                    <th className="p-2 font-medium">Vergleich</th>
                    <th className="text-right p-2 font-medium w-16">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {analyse?.stunden.map((s) => {
                    const sollBreite = maxMA > 0 ? (s.sollMA / maxMA) * 100 : 0;
                    const istBreite = maxMA > 0 ? (s.istMA / maxMA) * 100 : 0;

                    return (
                      <tr key={s.stunde} className="border-t">
                        <td className="p-2 font-mono">
                          {s.stunde.toString().padStart(2, '0')}:00
                        </td>
                        <td className="p-2 text-right">
                          {Math.round(s.colli).toLocaleString('de-DE')}
                        </td>
                        <td className="p-2 text-right font-medium">{s.sollMA.toFixed(1)}</td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            value={istMA[s.stunde] || ''}
                            onChange={(e) =>
                              handleIstMAChange(s.stunde, parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="h-6 w-16 text-xs text-center mx-auto"
                            min={0}
                            step={1}
                          />
                        </td>
                        <td className="p-2">
                          {/* Stacked Bars */}
                          <div className="relative h-4">
                            <div
                              className="absolute top-0 left-0 h-2 bg-blue-500/60 rounded-sm"
                              style={{ width: `${sollBreite}%` }}
                              title={`SOLL: ${s.sollMA.toFixed(1)}`}
                            />
                            {s.istMA > 0 && (
                              <div
                                className={`absolute top-2 left-0 h-2 rounded-sm ${
                                  s.status === 'ueberbesetzt'
                                    ? 'bg-yellow-500/60'
                                    : s.status === 'unterbesetzt'
                                    ? 'bg-red-500/60'
                                    : 'bg-green-500/60'
                                }`}
                                style={{ width: `${istBreite}%` }}
                                title={`IST: ${s.istMA.toFixed(1)}`}
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          {s.istMA > 0 ? (
                            <span
                              className={`font-medium ${
                                s.status === 'ueberbesetzt'
                                  ? 'text-yellow-500'
                                  : s.status === 'unterbesetzt'
                                  ? 'text-red-500'
                                  : 'text-green-500'
                              }`}
                            >
                              {s.delta > 0 ? '+' : ''}
                              {s.delta.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-2 bg-blue-500/60 rounded-sm" /> SOLL
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-2 bg-green-500/60 rounded-sm" /> IST (passend)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-2 bg-yellow-500/60 rounded-sm" /> IST (Überbesetzung)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-2 bg-red-500/60 rounded-sm" /> IST (Unterbesetzung)
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
