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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { useTopisStore } from '@/lib/store';
import { berechneFlaechenbedarf } from '@/lib/flaechenrechner';
import { berechneGewichtetenVerteilweg } from '@/lib/verteilweg-rechner';
import { SquareStack, Route, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function FlaechenbedarfDialog() {
  const [open, setOpen] = useState(false);
  const paramColliProQm = useProzessmodellStore((s) => s.parameter.find((p) => p.id === 'colliProQm'));
  const [colliProQm, setColliProQm] = useState(paramColliProQm?.aktuellerWert ?? 1.25);
  const [tab, setTab] = useState<'flaeche' | 'verteilweg'>('flaeche');

  const scandatenRecords = useBetriebsdatenStore((s) => s.scandatenRecords);
  const torZuordnungen = useBetriebsdatenStore((s) => s.torZuordnungen);
  const relationZuordnungen = useBetriebsdatenStore((s) => s.relationZuordnungen);
  const objects = useTopisStore((s) => s.objects);
  const gaenge = useTopisStore((s) => s.gaenge);

  const flaechenAnalyse = useMemo(() => {
    if (scandatenRecords.length === 0) return null;
    return berechneFlaechenbedarf(scandatenRecords, relationZuordnungen, objects, colliProQm);
  }, [scandatenRecords, relationZuordnungen, objects, colliProQm]);

  const verteilwegAnalyse = useMemo(() => {
    if (scandatenRecords.length === 0 || torZuordnungen.length === 0) return null;
    return berechneGewichtetenVerteilweg(
      scandatenRecords,
      torZuordnungen,
      relationZuordnungen,
      objects,
      gaenge
    );
  }, [scandatenRecords, torZuordnungen, relationZuordnungen, objects, gaenge]);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
      case 'knapp':
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />;
      case 'ueberlastet':
        return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <span className="text-xs text-muted-foreground">?</span>;
    }
  };

  const hasData = scandatenRecords.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <SquareStack className="h-3.5 w-3.5" />
          Fläche & Wege
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SquareStack className="h-5 w-5" />
            Flächenbedarf & Verteilwege
          </DialogTitle>
          <DialogDescription>
            Flächenbedarfsrechnung pro Relation und gewichtete Verteilwege.
          </DialogDescription>
        </DialogHeader>

        {!hasData ? (
          <div className="text-center text-muted-foreground py-12">
            Bitte zuerst Betriebsdaten importieren.
          </div>
        ) : (
          <>
            {/* Tab Switch */}
            <div className="flex gap-1 border-b">
              <button
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'flaeche' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setTab('flaeche')}
              >
                <SquareStack className="h-3.5 w-3.5 inline mr-1" />
                Flächenbedarf
              </button>
              <button
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === 'verteilweg' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setTab('verteilweg')}
              >
                <Route className="h-3.5 w-3.5 inline mr-1" />
                Verteilwege
              </button>
            </div>

            {/* ==================== Flächenbedarf ==================== */}
            {tab === 'flaeche' && flaechenAnalyse && (
              <div className="space-y-3">
                {/* Zusammenfassung */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-xl font-bold">{Math.round(flaechenAnalyse.gesamtBenoetigtQm)}</div>
                    <div className="text-xs text-muted-foreground">Benötigt (qm)</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-xl font-bold">
                      {flaechenAnalyse.gesamtVerfuegbarQm > 0
                        ? Math.round(flaechenAnalyse.gesamtVerfuegbarQm)
                        : '?'}
                    </div>
                    <div className="text-xs text-muted-foreground">Verfügbar (qm)</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <Input
                      type="number"
                      value={colliProQm}
                      onChange={(e) => setColliProQm(parseFloat(e.target.value) || 1.25)}
                      className="h-7 text-center text-lg font-bold w-20 mx-auto"
                      step={0.05}
                    />
                    <div className="text-xs text-muted-foreground mt-1">Colli/qm</div>
                  </div>
                </div>

                {/* Tabelle */}
                <div className="max-h-[400px] overflow-y-auto border rounded">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-2 font-medium">Relation</th>
                        <th className="text-right p-2 font-medium">Colli/Tag</th>
                        <th className="text-right p-2 font-medium">Benötigt qm</th>
                        <th className="text-right p-2 font-medium">Verfügbar qm</th>
                        <th className="text-right p-2 font-medium">Delta</th>
                        <th className="text-center p-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flaechenAnalyse.ergebnisse.map((e) => (
                        <tr
                          key={e.relation}
                          className={`border-t ${
                            e.status === 'ueberlastet'
                              ? 'bg-red-500/5'
                              : e.status === 'knapp'
                              ? 'bg-yellow-500/5'
                              : ''
                          }`}
                        >
                          <td className="p-2 font-mono">{e.relation}</td>
                          <td className="p-2 text-right">{Math.round(e.colliProTag).toLocaleString('de-DE')}</td>
                          <td className="p-2 text-right">{Math.round(e.benoetigtQm)}</td>
                          <td className="p-2 text-right">
                            {e.verfuegbarQm > 0 ? Math.round(e.verfuegbarQm) : '-'}
                          </td>
                          <td
                            className={`p-2 text-right font-medium ${
                              e.deltaQm > 0 ? 'text-green-500' : e.deltaQm < 0 ? 'text-red-500' : ''
                            }`}
                          >
                            {e.verfuegbarQm > 0 ? `${e.deltaQm > 0 ? '+' : ''}${Math.round(e.deltaQm)}` : '-'}
                          </td>
                          <td className="p-2 text-center">{statusIcon(e.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== Verteilwege ==================== */}
            {tab === 'verteilweg' && (
              <div className="space-y-3">
                {verteilwegAnalyse ? (
                  <>
                    {/* Zusammenfassung */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 text-center">
                        <div className="text-3xl font-bold">
                          {verteilwegAnalyse.gesamtGewichteterWegM.toFixed(1)} m
                        </div>
                        <div className="text-sm text-muted-foreground">Gewichteter Durchschnittsweg</div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-3xl font-bold">
                          {verteilwegAnalyse.gesamtColli.toLocaleString('de-DE')}
                        </div>
                        <div className="text-sm text-muted-foreground">Gesamt Colli</div>
                      </div>
                    </div>

                    {/* Pro Tor/Stellplatz */}
                    <div className="max-h-[350px] overflow-y-auto border rounded">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-2 font-medium">Stellplatz</th>
                            <th className="text-left p-2 font-medium">Tor</th>
                            <th className="text-right p-2 font-medium">Colli</th>
                            <th className="text-right p-2 font-medium">Ø Weg (m)</th>
                            <th className="text-right p-2 font-medium">Relationen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verteilwegAnalyse.ergebnisse
                            .sort((a, b) => b.colliGesamt - a.colliGesamt)
                            .map((e) => (
                              <tr key={e.stellplatzKey} className="border-t">
                                <td className="p-2 font-mono">{e.stellplatzKey}</td>
                                <td className="p-2">{e.objectName}</td>
                                <td className="p-2 text-right">{Math.round(e.colliGesamt).toLocaleString('de-DE')}</td>
                                <td className="p-2 text-right font-medium">{e.gewichteterWegM.toFixed(1)}</td>
                                <td className="p-2 text-right">{e.wege.length}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        useProzessmodellStore.getState().setVerteilweg(verteilwegAnalyse.gesamtGewichteterWegM);
                        toast.success(
                          `Verteilweg ${verteilwegAnalyse.gesamtGewichteterWegM.toFixed(1)}m in Prozessmodell übernommen`
                        );
                      }}
                    >
                      <Route className="h-3.5 w-3.5 mr-1" />
                      In Prozessmodell übernehmen
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Verteilwege benötigen importierte Scandaten mit Tor- und Relations-Zuordnungen.
                    {gaenge.length === 0 && (
                      <p className="mt-2 text-xs">
                        Tipp: Lege Gänge an, damit Wege über das Gang-Netzwerk berechnet werden können.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
