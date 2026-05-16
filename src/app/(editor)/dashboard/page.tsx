'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { KPICard } from '@/components/dashboard/KPICard';
import { StundenChart } from '@/components/dashboard/StundenChart';
import { AbteilungsChart } from '@/components/dashboard/AbteilungsChart';
import { BenchmarkRadar } from '@/components/dashboard/BenchmarkRadar';
import { HallPreview } from '@/components/check/HallPreview';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { useTopisStore } from '@/lib/store';
import { REFERENZHALLEN } from '@/lib/data/referenzhallen';
import { berechneBenchmark } from '@/lib/benchmarking';
import { berechneFlaechenbedarf } from '@/lib/flaechenrechner';
import { berechneGewichtetenVerteilweg } from '@/lib/verteilweg-rechner';
import { findPathBetweenObjects } from '@/lib/pathfinding';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const halls = useTopisStore((s) => s.halls);
  const activeHallId = useTopisStore((s) => s.activeHallId);
  const activeHall = halls.find((h) => h.id === activeHallId) || halls[0];
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

  // === SE/SA-Split der Heatmap-Daten ===
  // SE = Eingang (entladen), SA = Ausgang (verladen). MP-Codes aus ROTH-Methodik.
  const SE_CODES = ['MP5', 'MP2', 'MP9b'];
  const SA_CODES = ['MP7', 'MP4', 'MP4a', 'MP9a'];
  const seAnalyse = useMemo(() => {
    if (!analyse) return null;
    const seIds = new Set(
      objects
        .filter((o) => SE_CODES.includes(o.meta?.code || ''))
        .map((o) => o.id)
    );
    const metriken = analyse.objektMetriken.filter((m) => seIds.has(m.objectId));
    return {
      ...analyse,
      objektMetriken: metriken,
      gesamtColli: metriken.reduce((s, m) => s + m.colli, 0),
    };
  }, [analyse, objects]);
  const saAnalyse = useMemo(() => {
    if (!analyse) return null;
    const saIds = new Set(
      objects
        .filter((o) => SA_CODES.includes(o.meta?.code || ''))
        .map((o) => o.id)
    );
    const metriken = analyse.objektMetriken.filter((m) => saIds.has(m.objectId));
    return {
      ...analyse,
      objektMetriken: metriken,
      gesamtColli: metriken.reduce((s, m) => s + m.colli, 0),
    };
  }, [analyse, objects]);

  // === Container-Width tracken für die zwei Hallen ===
  const hallsRowRef = useRef<HTMLDivElement>(null);
  const [hallSize, setHallSize] = useState({ width: 480, height: 160 });
  useEffect(() => {
    const el = hallsRowRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const totalW = e.contentRect.width;
        // 2 Hallen nebeneinander mit 12px gap, jeweils minus Padding
        const eachW = Math.max(280, Math.floor((totalW - 16) / 2) - 16);
        const aspect = activeHall ? activeHall.width / activeHall.height : 3.5;
        const eachH = Math.max(120, Math.min(240, Math.floor(eachW / aspect)));
        setHallSize({ width: eachW, height: eachH });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeHall]);

  // === Inline Route-Spiel im Dashboard ===
  const [routeStart, setRouteStart] = useState<number | null>(null);
  const [routeEnd, setRouteEnd] = useState<number | null>(null);
  const routeOptions = useMemo(
    () =>
      objects
        .filter((o) => o.type === 'tor' || (o.type === 'bereich' && o.name))
        .sort((a, b) => (a.torNummer ?? 999) - (b.torNummer ?? 999)),
    [objects]
  );
  const dashRoute = useMemo(() => {
    if (routeStart == null || routeEnd == null || routeStart === routeEnd) return null;
    const a = objects.find((o) => o.id === routeStart);
    const b = objects.find((o) => o.id === routeEnd);
    if (!a || !b) return null;
    try {
      const r = findPathBetweenObjects(a, b, gaenge);
      if (!r || r.path.length < 2) return null;
      const aCx = a.x + a.width / 2;
      const aCy = a.y + a.height / 2;
      const bCx = b.x + b.width / 2;
      const bCy = b.y + b.height / 2;
      const dStart = Math.hypot(r.path[0].x - aCx, r.path[0].y - aCy);
      const dEnd = Math.hypot(r.path[r.path.length - 1].x - bCx, r.path[r.path.length - 1].y - bCy);
      const total = dStart + r.distance + dEnd;
      return { waypoints: r.path, totalM: total, sek: total / 2.44, from: a.name, to: b.name };
    } catch {
      return null;
    }
  }, [routeStart, routeEnd, objects, gaenge]);

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
        <Link href="/topis-saas/projekt">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Editor
          </Button>
        </Link>
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

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 max-w-[1400px] mx-auto">
          {!hasData && !ergebnis ? (
            <div className="text-center text-muted-foreground py-20">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h2 className="text-lg font-medium">Noch keine Daten</h2>
              <p className="text-sm mt-1">
                Importiere Betriebsdaten und berechne das Prozessmodell im Editor.
              </p>
              <Link href="/topis-saas/projekt">
                <Button className="mt-4" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Zum Editor
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* ==================== Reihe 0: Zwei Hallen SE / SA + Route-Spiel ==================== */}
              {activeHall && (
                <>
                  <div ref={hallsRowRef} className="grid grid-cols-2 gap-3">
                    {/* SE-Halle */}
                    <Card className="overflow-hidden">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-500">SE — Eingang</h3>
                          <span className="text-[11px] text-muted-foreground">
                            {seAnalyse ? `${Math.round(seAnalyse.gesamtColli).toLocaleString('de-DE')} Colli` : '–'}
                          </span>
                        </div>
                        <HallPreview
                          hall={activeHall}
                          objects={objects}
                          gaenge={gaenge}
                          analyse={seAnalyse}
                          heatmapConfig={{ aktiv: true, modus: 'colli', farbskala: 'blau-rot', intensitaet: 1 }}
                          width={hallSize.width}
                          height={hallSize.height}
                          routeWaypoints={dashRoute?.waypoints}
                          routeStartId={routeStart ?? undefined}
                          routeEndId={routeEnd ?? undefined}
                        />
                      </CardContent>
                    </Card>
                    {/* SA-Halle */}
                    <Card className="overflow-hidden">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500">SA — Ausgang</h3>
                          <span className="text-[11px] text-muted-foreground">
                            {saAnalyse ? `${Math.round(saAnalyse.gesamtColli).toLocaleString('de-DE')} Colli` : '–'}
                          </span>
                        </div>
                        <HallPreview
                          hall={activeHall}
                          objects={objects}
                          gaenge={gaenge}
                          analyse={saAnalyse}
                          heatmapConfig={{ aktiv: true, modus: 'colli', farbskala: 'gruen-rot', intensitaet: 1 }}
                          width={hallSize.width}
                          height={hallSize.height}
                          routeWaypoints={dashRoute?.waypoints}
                          routeStartId={routeStart ?? undefined}
                          routeEndId={routeEnd ?? undefined}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Route-Spiel-Bereich */}
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-xs font-semibold uppercase tracking-wider">Route prüfen</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Von</span>
                          <Select
                            value={routeStart != null ? String(routeStart) : ''}
                            onValueChange={(v) => setRouteStart(v ? Number(v) : null)}
                          >
                            <SelectTrigger className="h-8 w-[170px] text-xs">
                              <SelectValue placeholder="Tor wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {routeOptions.map((o) => (
                                <SelectItem key={o.id} value={String(o.id)} className="text-xs">
                                  {o.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Nach</span>
                          <Select
                            value={routeEnd != null ? String(routeEnd) : ''}
                            onValueChange={(v) => setRouteEnd(v ? Number(v) : null)}
                          >
                            <SelectTrigger className="h-8 w-[170px] text-xs">
                              <SelectValue placeholder="Bereich/Tor wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {routeOptions.map((o) => (
                                <SelectItem key={o.id} value={String(o.id)} className="text-xs">
                                  {o.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {dashRoute && (
                          <div className="text-xs flex items-center gap-3 ml-auto">
                            <span>
                              <span className="text-muted-foreground">Distanz</span>{' '}
                              <span className="font-semibold">{Math.round(dashRoute.totalM)} m</span>
                            </span>
                            <span>
                              <span className="text-muted-foreground">Zeit</span>{' '}
                              <span className="font-semibold">{dashRoute.sek.toFixed(1)} s</span>
                            </span>
                          </div>
                        )}
                        {(routeStart != null || routeEnd != null) && (
                          <button
                            type="button"
                            className="text-[11px] text-muted-foreground hover:text-foreground underline"
                            onClick={() => {
                              setRouteStart(null);
                              setRouteEnd(null);
                            }}
                          >
                            zurücksetzen
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Wenn du Von und Nach wählst, wird der Weg in beiden Hallen oben eingezeichnet. TOPIS rechnet sofort Distanz + Zeit.
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

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
      </ScrollArea>
    </div>
  );
}
