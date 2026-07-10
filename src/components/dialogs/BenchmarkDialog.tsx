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
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { REFERENZHALLEN } from '@/lib/data/referenzhallen';
import { berechneBenchmark } from '@/lib/benchmarking';
import { Trophy } from 'lucide-react';

export function BenchmarkDialog() {
  const [open, setOpen] = useState(false);
  const modell = useProzessmodellStore((s) => s.modell);
  const ergebnis = useProzessmodellStore((s) => s.ergebnis);
  const parameter = useProzessmodellStore((s) => s.parameter);
  const berechne = useProzessmodellStore((s) => s.berechne);

  const verteilwegParam = parameter.find((p) => p.id === 'verteilweg');
  const verteilwegM = verteilwegParam?.aktuellerWert || 138.8;

  const benchmark = useMemo(() => {
    if (!ergebnis) return null;
    return berechneBenchmark(ergebnis, verteilwegM, REFERENZHALLEN);
  }, [ergebnis, verteilwegM]);

  // Auto-berechne wenn Dialog öffnet ohne Ergebnis
  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v && !ergebnis) berechne();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <Trophy className="h-3.5 w-3.5" />
          Benchmark
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Benchmarking
          </DialogTitle>
          <DialogDescription>
            Vergleich mit {REFERENZHALLEN.length} Referenzhallen (Min/Colli pro Abteilung) —
            Rang im Feld von {REFERENZHALLEN.length + 1} inkl. Ihrer Halle.
          </DialogDescription>
        </DialogHeader>

        {!ergebnis ? (
          <div className="text-center text-muted-foreground py-12">
            Bitte zuerst das Prozessmodell berechnen.
            <Button className="mt-2 block mx-auto" size="sm" onClick={berechne}>
              Berechnen
            </Button>
          </div>
        ) : benchmark ? (
          <div className="space-y-4">
            {/* Gesamt-Ranking */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 text-center">
              <div className="text-lg text-muted-foreground">Platz</div>
              <div className="text-5xl font-bold">{benchmark.gesamtRanking}</div>
              <div className="text-sm text-muted-foreground">von {benchmark.anzahlHallen}</div>
              <div className="text-sm mt-1">
                {ergebnis.minProColli.toFixed(3)} Min/Colli
              </div>
            </div>

            {/* Abteilungs-Rankings */}
            <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${benchmark.rankings.length}, 1fr)` }}>
              {benchmark.rankings.map((r) => {
                const abtDef = modell.abteilungen.find((a) => a.id === r.abteilung);
                const color = abtDef?.color || '#888';
                return (
                  <div
                    key={r.abteilung}
                    className="rounded-lg border p-3 text-center"
                    style={{ borderColor: color + '60' }}
                  >
                    <div className="text-xs text-muted-foreground">{r.label}</div>
                    <div
                      className="text-2xl font-bold"
                      style={{ color }}
                    >
                      #{r.rang}
                    </div>
                    <div className="text-xs">{r.wert.toFixed(3)} Min/Cll</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Bester: {r.bester.name} ({r.bester.wert.toFixed(3)})
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delta-Analyse (Einsparpotential) */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Einsparpotential (vs. Benchmark)</h3>
              {benchmark.deltas.map((d) => {
                const abtDef = modell.abteilungen.find((a) => a.id === d.abteilung);
                const color = abtDef?.color || '#888';
                return (
                  <div
                    key={d.abteilung}
                    className="flex items-center gap-3 rounded border p-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="w-20 font-medium">{d.label}</span>
                    <span
                      className={`w-24 text-right ${
                        d.delta > 0.001 ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {d.delta > 0.001 ? '+' : ''}
                      {d.delta.toFixed(3)} Min
                    </span>
                    <span className="w-16 text-right text-muted-foreground">
                      {d.deltaProzent > 0 ? '+' : ''}
                      {d.deltaProzent.toFixed(0)}%
                    </span>
                    <span className="flex-1 text-xs text-muted-foreground">{d.potential}</span>
                  </div>
                );
              })}
            </div>

            {/* Balkendiagramm: Hallen-Ranking */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Gesamt-Ranking (Min/Colli)</h3>
              <div className="space-y-1">
                {benchmark.hallenRanking.map((h, i) => {
                  const maxWert = benchmark.hallenRanking[benchmark.hallenRanking.length - 1].minProColliGesamt;
                  const breite = maxWert > 0 ? (h.minProColliGesamt / maxWert) * 100 : 0;
                  return (
                    <div key={h.name} className="flex items-center gap-2 text-xs">
                      <span className="w-6 text-right text-muted-foreground">{i + 1}.</span>
                      <span className={`w-28 truncate ${h.isAktuell ? 'font-bold' : ''}`}>
                        {h.name}
                      </span>
                      <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                        <div
                          className={`h-full rounded ${h.isAktuell ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          style={{ width: `${breite}%` }}
                        />
                      </div>
                      <span className={`w-16 text-right ${h.isAktuell ? 'font-bold' : ''}`}>
                        {h.minProColliGesamt.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
