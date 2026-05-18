'use client';

import { useMemo, useEffect, useState } from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { StundenChart } from '@/components/dashboard/StundenChart';
import { AbteilungsChart } from '@/components/dashboard/AbteilungsChart';
import { BenchmarkRadar } from '@/components/dashboard/BenchmarkRadar';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { useTopisStore } from '@/lib/store';
import { REFERENZHALLEN } from '@/lib/data/referenzhallen';
import { berechneBenchmark } from '@/lib/benchmarking';
import { berechneFlaechenbedarf } from '@/lib/flaechenrechner';
import { berechneGewichtetenVerteilweg } from '@/lib/verteilweg-rechner';
import { simAuftraegeToZeilen } from '@/lib/auftragsplanung';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Timer,
  Users,
  Route,
  BarChart3,
  ArrowLeft,
  TrendingUp,
  SquareStack,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const analyse = useBetriebsdatenStore((s) => s.analyse);
  const scandatenRecords = useBetriebsdatenStore((s) => s.scandatenRecords);
  const stundenAggregation = useBetriebsdatenStore((s) => s.stundenAggregation);
  const torZuordnungen = useBetriebsdatenStore((s) => s.torZuordnungen);
  const relationZuordnungen = useBetriebsdatenStore((s) => s.relationZuordnungen);
  const objects = useTopisStore((s) => s.objects);
  const gaenge = useTopisStore((s) => s.gaenge);
  const ffzList = useTopisStore((s) => s.ffz);
  const simAuftraege = useTopisStore((s) => s.simAuftraege);
  const forkSimAuftragAsSim = useTopisStore((s) => s.forkSimAuftragAsSim);
  const removeSimVarianteFor = useTopisStore((s) => s.removeSimVarianteFor);

  // Planungs-Block: Stundensatz + FFZ + Min/Colli-Fix als Dashboard-Parameter
  const [planSatz, setPlanSatz] = useState(35);
  const [planMinFix, setPlanMinFix] = useState(1.17);
  const modell = useProzessmodellStore((s) => s.modell);
  const ergebnis = useProzessmodellStore((s) => s.ergebnis);
  const parameter = useProzessmodellStore((s) => s.parameter);
  const berechne = useProzessmodellStore((s) => s.berechne);

  // Auto-Berechnung
  useEffect(() => {
    if (!ergebnis) berechne();
  }, [ergebnis, berechne]);

  const verteilwegParam = parameter.find((p) => p.id === 'verteilweg');
  const verteilwegM = verteilwegParam?.aktuellerWert || 0;
  const arbeitsminProStunde = ergebnis?.arbeitsminProStunde || parameter.find((p) => p.id === 'arbeitsminProStunde')?.aktuellerWert || 52.9;

  // Benchmark
  const benchmark = useMemo(() => {
    if (!ergebnis) return null;
    return berechneBenchmark(ergebnis, verteilwegM, REFERENZHALLEN);
  }, [ergebnis, verteilwegM]);

  // Flächenbedarf — colliProQm aus Parameter
  const colliProQmParam = parameter.find((p) => p.id === 'colliProQm');
  const colliProQm = colliProQmParam?.aktuellerWert || 1.25;
  const flaechenAnalyse = useMemo(() => {
    if (scandatenRecords.length === 0) return null;
    return berechneFlaechenbedarf(scandatenRecords, relationZuordnungen, objects, colliProQm);
  }, [scandatenRecords, relationZuordnungen, objects, colliProQm]);

  // Verteilweg
  const verteilwegAnalyse = useMemo(() => {
    if (scandatenRecords.length === 0 || torZuordnungen.length === 0) return null;
    return berechneGewichtetenVerteilweg(scandatenRecords, torZuordnungen, relationZuordnungen, objects, gaenge);
  }, [scandatenRecords, torZuordnungen, relationZuordnungen, objects, gaenge]);

  // Stunden-Daten für Chart
  const stundenChartData = useMemo(() => {
    const arbeitstage = Math.max([...new Set(scandatenRecords.map((r) => r.scandatum).filter(Boolean))].length, 1);
    return stundenAggregation
      .filter((a) => a.colli > 0)
      .map((a) => ({
        stunde: a.stunde,
        soll: ergebnis ? (a.colli / arbeitstage * ergebnis.minProColli) / arbeitsminProStunde : 0,
        ist: 0, // IST-Daten müssen separat eingegeben werden
        colli: a.colli / arbeitstage,
      }));
  }, [stundenAggregation, scandatenRecords, ergebnis, arbeitsminProStunde]);

  // Benchmark Radar data
  const benchmarkRadarData = useMemo(() => {
    if (!benchmark) return null;
    const bestValues: Record<string, number> = {};
    benchmark.rankings.forEach((r) => {
      bestValues[r.abteilung] = r.bester.wert;
    });
    return { aktuell: benchmark.aktuell.abteilungen, benchmark: bestValues };
  }, [benchmark]);

  // Colli pro MA-Stunde
  const colliProMAStunde = ergebnis && ergebnis.maStundenBedarf > 0
    ? Math.round(ergebnis.colliProTag / ergebnis.maStundenBedarf)
    : 0;

  const hasData = analyse && analyse.objektMetriken.length > 0;

  // === Aggregation Tag/Woche/Monat/Jahr ===
  const aggregation = useMemo(() => {
    if (!ergebnis || !analyse) return null;
    const tagesStd = ergebnis.colliProTag > 0 ? (ergebnis.colliProTag * ergebnis.minProColli) / arbeitsminProStunde : 0;
    return {
      tag: tagesStd,
      woche: tagesStd * 5,
      monat: tagesStd * 21, // 5 Tage × 4.2 Wochen
      jahr: tagesStd * 251, // ~251 Werktage
    };
  }, [ergebnis, analyse, arbeitsminProStunde]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card">
        <a href="/topis-saas/projekt">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Editor
          </Button>
        </a>
        <div className="h-6 w-px bg-border" />
        <h1 className="text-sm font-bold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          TOPIS Dashboard
        </h1>
        {analyse && (
          <span className="text-xs text-muted-foreground">
            {analyse.zeitraum.von} — {analyse.zeitraum.bis} | {analyse.arbeitstage} Arbeitstage
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 pb-24 space-y-4 max-w-[1400px] mx-auto">
          {!hasData && !ergebnis ? (
            <div className="text-center text-muted-foreground py-20">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h2 className="text-lg font-medium">Noch keine Daten</h2>
              <p className="text-sm mt-1">
                Importiere Betriebsdaten und berechne das Prozessmodell im Editor.
              </p>
              <a href="/topis-saas/projekt">
                <Button className="mt-4" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Zum Editor
                </Button>
              </a>
            </div>
          ) : (
            <>

              {/* ==================== Reihe 0: Planungs-Block (IST + SIM) ==================== */}
              {(() => {
                const allZeilen = simAuftraegeToZeilen({
                  simAuftraege,
                  objects,
                  gaenge,
                  ffzList,
                  defaultFfzId: ffzList[0]?.id ?? null,
                  stundensatzEuro: planSatz,
                  minProColliFix: planMinFix,
                });
                // Trennen: IST = ohne parentId, SIM = mit parentId
                const istRaw = simAuftraege.filter((a) => !a.parentId);
                const simByParent = new Map(simAuftraege.filter((a) => a.parentId).map((a) => [a.parentId!, a]));
                const torObjects = objects.filter((o) => o.type === 'tor').sort((a, b) => (a.torNummer ?? 999) - (b.torNummer ?? 999));

                const istZeilen = allZeilen.filter((z) => {
                  const orig = simAuftraege.find((a) => a.id === z.simAuftragId);
                  return orig && !orig.parentId;
                });
                const simZeilen = allZeilen.filter((z) => {
                  const orig = simAuftraege.find((a) => a.id === z.simAuftragId);
                  return orig && orig.parentId;
                });
                const simZeilenByParent = new Map(simZeilen.map((z) => {
                  const orig = simAuftraege.find((a) => a.id === z.simAuftragId);
                  return [orig?.parentId ?? '', z];
                }));

                const sumIstStd = istZeilen.reduce((s, z) => s + z.gesamtStunden, 0);
                const sumIstKos = istZeilen.reduce((s, z) => s + z.kosten, 0);
                // Effektive SIM-Summe: für jeden IST-Auftrag nimm SIM wenn vorhanden, sonst IST
                let sumEffStd = 0, sumEffKos = 0;
                for (const ist of istZeilen) {
                  const orig = simAuftraege.find((a) => a.id === ist.simAuftragId);
                  if (!orig) continue;
                  const sim = simZeilenByParent.get(orig.id);
                  if (sim) {
                    sumEffStd += sim.gesamtStunden;
                    sumEffKos += sim.kosten;
                  } else {
                    sumEffStd += ist.gesamtStunden;
                    sumEffKos += ist.kosten;
                  }
                }
                const deltaKos = sumEffKos - sumIstKos;
                const deltaStd = sumEffStd - sumIstStd;
                const simAnzahl = simZeilenByParent.size;

                return (
                  <Card className="border-blue-500/40 bg-blue-500/5">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                          Planung — IST ({istZeilen.length}) {simAnzahl > 0 ? `· SIM-Varianten (${simAnzahl})` : ''}
                        </h3>
                        <div className="flex items-end gap-3">
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="plansatz" className="text-[10px]">Stundensatz</Label>
                            <div className="flex items-center gap-1">
                              <Input id="plansatz" type="number" value={planSatz}
                                onChange={(e) => setPlanSatz(Number(e.target.value) || 0)}
                                className="h-7 w-20 text-xs" min={0} step={0.5} />
                              <span className="text-[10px] text-muted-foreground">€/h</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="planminfix" className="text-[10px]">Min/Colli fix</Label>
                            <Input id="planminfix" type="number" value={planMinFix}
                              onChange={(e) => setPlanMinFix(Number(e.target.value) || 0)}
                              className="h-7 w-20 text-xs" min={0} step={0.01} />
                          </div>
                        </div>
                      </div>

                      {istZeilen.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-3 text-center">
                          Noch keine IST-Aufträge. Zurück zum Editor → Phase „Planung" →
                          „10 Beispiele laden" oder „Auftrag anlegen".
                        </div>
                      ) : (
                        <>
                          {/* Gesamtsummen oben: IST | SIM-effektiv | Δ */}
                          <div className="grid grid-cols-3 gap-3 text-sm border-y border-blue-500/20 py-2">
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase">IST Σ Kosten</div>
                              <div className="text-xl font-bold">{sumIstKos.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</div>
                              <div className="text-[10px] text-muted-foreground">{sumIstStd.toFixed(1)} h</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase">SIM Σ Kosten (effektiv)</div>
                              <div className="text-xl font-bold text-blue-600">{sumEffKos.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</div>
                              <div className="text-[10px] text-muted-foreground">{sumEffStd.toFixed(1)} h</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-muted-foreground uppercase">Δ SIM vs IST</div>
                              <div className={`text-xl font-bold ${deltaKos < 0 ? 'text-green-600' : deltaKos > 0 ? 'text-red-500' : ''}`}>
                                {deltaKos < 0 ? '−' : deltaKos > 0 ? '+' : '±'}
                                {Math.abs(deltaKos).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {deltaStd < 0 ? '−' : '+'}{Math.abs(deltaStd).toFixed(1)} h
                              </div>
                            </div>
                          </div>

                          {/* Tabelle: pro IST eine Zeile + Sim-Auswahl rechts */}
                          <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-blue-500/10 sticky top-0">
                                <tr>
                                  <th className="text-left p-1.5 font-medium">IST Von → Nach</th>
                                  <th className="text-right p-1.5 font-medium">Colli</th>
                                  <th className="text-right p-1.5 font-medium">IST Weg</th>
                                  <th className="text-right p-1.5 font-medium">IST €</th>
                                  <th className="p-1.5 font-medium">SIM Ziel-Tor</th>
                                  <th className="text-right p-1.5 font-medium">SIM Weg</th>
                                  <th className="text-right p-1.5 font-medium">SIM €</th>
                                  <th className="text-right p-1.5 font-medium">Δ</th>
                                  <th className="p-1.5 font-medium"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {istZeilen.map((ist) => {
                                  const orig = simAuftraege.find((a) => a.id === ist.simAuftragId);
                                  if (!orig) return null;
                                  const sim = simZeilenByParent.get(orig.id);
                                  const rowDelta = sim ? sim.kosten - ist.kosten : 0;
                                  return (
                                    <tr key={ist.id} className="border-t border-blue-500/10 hover:bg-blue-500/5">
                                      <td className="p-1.5 font-medium">{ist.torName} → {ist.bereichName}</td>
                                      <td className="p-1.5 text-right tabular-nums">{ist.colli.toLocaleString('de-DE')}</td>
                                      <td className="p-1.5 text-right tabular-nums">
                                        {ist.warnung === 'weg-fehlt'
                                          ? <span className="text-amber-500" title="A* fand keinen Gang-Pfad — Luftlinie als Schätzung">~{Math.round(ist.distanzM)}m</span>
                                          : ist.warnung
                                          ? <span className="text-amber-500">!</span>
                                          : `${Math.round(ist.distanzM)}m`}
                                      </td>
                                      <td className="p-1.5 text-right tabular-nums">{ist.kosten.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td>
                                      <td className="p-1.5">
                                        <select
                                          className="h-7 w-[200px] text-xs bg-background border rounded px-1"
                                          value={sim ? sim.bereichObjectId ?? '' : ''}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) {
                                              removeSimVarianteFor(orig.id);
                                            } else {
                                              forkSimAuftragAsSim(orig.id, Number(val));
                                            }
                                          }}
                                        >
                                          <option value="">— keine Simulation —</option>
                                          {(() => {
                                            const sued = torObjects.filter((t) => t.id !== orig.vonObjectId && (t.torNummer ?? 0) >= 1 && (t.torNummer ?? 0) <= 52);
                                            const kopf = torObjects.filter((t) => t.id !== orig.vonObjectId && (t.torNummer ?? 0) >= 53 && (t.torNummer ?? 0) <= 60);
                                            const nord = torObjects.filter((t) => t.id !== orig.vonObjectId && (t.torNummer ?? 0) >= 61);
                                            return (
                                              <>
                                                {sued.length > 0 && (
                                                  <optgroup label={`Süd (Tor 1–52, ${sued.length})`}>
                                                    {sued.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                  </optgroup>
                                                )}
                                                {kopf.length > 0 && (
                                                  <optgroup label={`Kopframpe (Tor 53–60, ${kopf.length})`}>
                                                    {kopf.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                  </optgroup>
                                                )}
                                                {nord.length > 0 && (
                                                  <optgroup label={`Nord (Tor 61–115, ${nord.length})`}>
                                                    {nord.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                  </optgroup>
                                                )}
                                              </>
                                            );
                                          })()}
                                        </select>
                                      </td>
                                      <td className="p-1.5 text-right tabular-nums">
                                        {sim
                                          ? (sim.warnung === 'weg-fehlt'
                                              ? <span className="text-amber-500" title="A* fand keinen Gang-Pfad — Luftlinie">~{Math.round(sim.distanzM)}m</span>
                                              : `${Math.round(sim.distanzM)}m`)
                                          : '—'}
                                      </td>
                                      <td className="p-1.5 text-right tabular-nums text-blue-600 font-semibold">
                                        {sim ? sim.kosten.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : '—'}
                                      </td>
                                      <td className={`p-1.5 text-right tabular-nums ${rowDelta < 0 ? 'text-green-600' : rowDelta > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {sim ? `${rowDelta < 0 ? '−' : '+'}${Math.abs(rowDelta).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}` : '—'}
                                      </td>
                                      <td className="p-1.5">
                                        {sim && (
                                          <button
                                            type="button"
                                            onClick={() => removeSimVarianteFor(orig.id)}
                                            className="text-[10px] text-muted-foreground hover:text-foreground underline"
                                          >
                                            ×
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            IST = wie heute geplant · SIM = was-wäre-wenn anderes Ziel-Tor · Linien auf der Halle: IST amber, SIM blau gestrichelt
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* ==================== Reihe 1: KPI-Karten ==================== */}
              <div className="grid grid-cols-4 gap-3">
                <KPICard
                  title="Min / Colli"
                  value={ergebnis ? ergebnis.minProColli.toFixed(3) : '-'}
                  icon={<Timer className="h-5 w-5" />}
                  highlight
                  details={ergebnis?.abteilungen.map((a) => ({
                    label: a.label,
                    value: `${a.minProColli.toFixed(3)} (${Math.round(a.anteilGesamt * 100)}%)`,
                  }))}
                />
                <KPICard
                  title="Colli / MA-Stunde"
                  value={colliProMAStunde ? colliProMAStunde.toString() : '-'}
                  subtitle="Produktivität"
                  icon={<TrendingUp className="h-5 w-5" />}
                  details={[
                    { label: 'Colli/Tag', value: ergebnis?.colliProTag.toLocaleString('de-DE') || '-' },
                    { label: 'MA-Std/Tag', value: ergebnis ? Math.round(ergebnis.maStundenBedarf).toString() : '-' },
                  ]}
                />
                <KPICard
                  title="FTE-Bedarf"
                  value={ergebnis ? ergebnis.fte.toFixed(1) : '-'}
                  subtitle={ergebnis ? `${Math.round(ergebnis.maStundenBedarf)} MA-Stunden/Tag` : ''}
                  icon={<Users className="h-5 w-5" />}
                />
                <KPICard
                  title="Ø Verteilweg"
                  value={
                    verteilwegAnalyse
                      ? `${verteilwegAnalyse.gesamtGewichteterWegM.toFixed(1)} m`
                      : verteilwegM > 0
                      ? `${verteilwegM.toFixed(1)} m`
                      : '-'
                  }
                  subtitle="Colli-gewichtet"
                  icon={<Route className="h-5 w-5" />}
                  details={verteilwegAnalyse ? [
                    { label: 'Stellplätze', value: verteilwegAnalyse.ergebnisse.length.toString() },
                    { label: 'Gesamt Colli', value: Math.round(verteilwegAnalyse.gesamtColli).toLocaleString('de-DE') },
                  ] : undefined}
                />
              </div>

              {/* ==================== Reihe 2: Analyse ==================== */}
              <div className="grid grid-cols-2 gap-3">
                {/* IST-SOLL Chart */}
                <div className="rounded-lg border bg-card p-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Stundenprofil (SOLL-MA)
                  </h3>
                  <StundenChart data={stundenChartData} width={500} height={220} />
                </div>

                {/* Abteilungs-Breakdown */}
                <div className="rounded-lg border bg-card p-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Abteilungs-Breakdown (Min/Colli)
                  </h3>
                  {ergebnis ? (
                    <AbteilungsChart abteilungen={ergebnis.abteilungen} width={400} height={200} />
                  ) : (
                    <div className="text-center text-muted-foreground py-12 text-sm">
                      Prozessmodell berechnen
                    </div>
                  )}
                </div>
              </div>

              {/* ==================== Reihe 3: Detail ==================== */}
              <div className="grid grid-cols-2 gap-3">
                {/* Flächenbedarf */}
                <div className="rounded-lg border bg-card p-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <SquareStack className="h-3.5 w-3.5" />
                    Flächenbedarf (Top 10 Relationen)
                  </h3>
                  {flaechenAnalyse ? (
                    <div className="max-h-[200px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-1.5 font-medium">Relation</th>
                            <th className="text-right p-1.5 font-medium">Cll/Tag</th>
                            <th className="text-right p-1.5 font-medium">Bedarf qm</th>
                            <th className="text-center p-1.5 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {flaechenAnalyse.ergebnisse.slice(0, 10).map((e) => (
                            <tr key={e.relation} className="border-t">
                              <td className="p-1.5">{e.relation}</td>
                              <td className="p-1.5 text-right">{Math.round(e.colliProTag)}</td>
                              <td className="p-1.5 text-right">{Math.round(e.benoetigtQm)}</td>
                              <td className="p-1.5 text-center">
                                <span
                                  className={`text-[10px] px-1 py-0.5 rounded ${
                                    e.status === 'ok'
                                      ? 'bg-green-500/10 text-green-500'
                                      : e.status === 'knapp'
                                      ? 'bg-yellow-500/10 text-yellow-500'
                                      : e.status === 'ueberlastet'
                                      ? 'bg-red-500/10 text-red-500'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {e.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm">Keine Relationsdaten</div>
                  )}
                </div>

                {/* Benchmark Radar */}
                <div className="rounded-lg border bg-card p-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" />
                    Benchmark (vs. {REFERENZHALLEN.length} Referenzhallen)
                    {benchmark && (
                      <span className="ml-auto text-primary font-bold">
                        Platz {benchmark.gesamtRanking}/{benchmark.anzahlHallen}
                      </span>
                    )}
                  </h3>
                  {benchmarkRadarData ? (
                    <BenchmarkRadar
                      aktuell={benchmarkRadarData.aktuell}
                      benchmark={benchmarkRadarData.benchmark}
                      abteilungen={modell.abteilungen}
                      width={300}
                      height={220}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm">Prozessmodell berechnen</div>
                  )}
                </div>
              </div>

              {/* ==================== Reihe 4: Tor-Detail ==================== */}
              {analyse && analyse.objektMetriken.length > 0 && (
                <div className="rounded-lg border bg-card p-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                    Tor-Detail ({analyse.objektMetriken.length} Tore)
                  </h3>
                  <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left p-1.5 font-medium">Tor</th>
                          <th className="text-right p-1.5 font-medium">Colli/Tag</th>
                          <th className="text-right p-1.5 font-medium">Sdg/Tag</th>
                          <th className="text-right p-1.5 font-medium">Gew/Tag</th>
                          <th className="text-right p-1.5 font-medium">Auslastung</th>
                          <th className="text-right p-1.5 font-medium">Fahrten</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...analyse.objektMetriken]
                          .sort((a, b) => b.colli - a.colli)
                          .map((m) => (
                            <tr key={m.objectId} className="border-t hover:bg-muted/50">
                              <td className="p-1.5 font-medium">{m.objectName}</td>
                              <td className="p-1.5 text-right">{Math.round(m.colli).toLocaleString('de-DE')}</td>
                              <td className="p-1.5 text-right">{Math.round(m.sendungen)}</td>
                              <td className="p-1.5 text-right">
                                {m.gewicht >= 1000
                                  ? `${(m.gewicht / 1000).toFixed(1)}t`
                                  : `${Math.round(m.gewicht)}kg`}
                              </td>
                              <td className="p-1.5 text-right">
                                <span
                                  className={`${
                                    m.auslastung > 0.8
                                      ? 'text-red-500'
                                      : m.auslastung > 0.5
                                      ? 'text-yellow-500'
                                      : 'text-green-500'
                                  }`}
                                >
                                  {Math.round(m.auslastung * 100)}%
                                </span>
                              </td>
                              <td className="p-1.5 text-right">{Math.round(m.fahrtenProTag)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ==================== Abschluss-Seite: Aggregation Tag/Woche/Monat/Jahr ==================== */}
              {aggregation && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                      Personalstunden-Aggregation
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <div className="text-[11px] text-muted-foreground uppercase">pro Tag</div>
                        <div className="text-2xl font-bold">{Math.round(aggregation.tag).toLocaleString('de-DE')}</div>
                        <div className="text-[11px] text-muted-foreground">Std</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] text-muted-foreground uppercase">pro Woche</div>
                        <div className="text-2xl font-bold">{Math.round(aggregation.woche).toLocaleString('de-DE')}</div>
                        <div className="text-[11px] text-muted-foreground">Std (5 Tage)</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] text-muted-foreground uppercase">pro Monat</div>
                        <div className="text-2xl font-bold">{Math.round(aggregation.monat).toLocaleString('de-DE')}</div>
                        <div className="text-[11px] text-muted-foreground">Std (21 Werktage)</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] text-muted-foreground uppercase">pro Jahr</div>
                        <div className="text-2xl font-bold">{Math.round(aggregation.jahr).toLocaleString('de-DE')}</div>
                        <div className="text-[11px] text-muted-foreground">Std (251 Werktage)</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary/20 grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">FTE-Bedarf</span>
                        <span className="ml-2 font-semibold">{ergebnis ? ergebnis.fte.toFixed(1) : '–'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Colli/Jahr</span>
                        <span className="ml-2 font-semibold">
                          {ergebnis ? Math.round(ergebnis.colliProTag * 251).toLocaleString('de-DE') : '–'}
                        </span>
                      </div>
                      <div className="col-span-2 text-[11px] text-muted-foreground italic">
                        Grundlage: Σ(Colli × Min/Colli) ÷ Arbeitsmin pro Stunde · Werktage = aktuelle Schicht-Annahme
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
