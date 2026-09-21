'use client';

import type { Hall, TopisObject, Gang } from '@/types/topis';
import type { ScandatenRecord } from '@/types/scandaten';
import type { GesamtErgebnis } from '@/types/prozessmodell';
import type { BetriebsAnalyse, HeatmapConfig } from '@/lib/betriebsdaten-store';
import type { BenchmarkErgebnis } from '@/lib/benchmarking';
import type { AmpelBewertung } from '@/lib/ampel-system';
import type { TorZuordnung, RelationZuordnung } from '@/types/scandaten';
import type { AbteilungDefinition } from '@/types/prozessmodell';

import { HallPreview } from './HallPreview';
import { AmpelCard } from './AmpelCard';
import { BeratungCTA } from './BeratungCTA';
import { appUrl } from '@/lib/base-path';
import { StundenprofilChart } from './StundenprofilChart';
import { AbteilungsVergleich } from './AbteilungsVergleich';
import { zahl } from '@/lib/format';
import { Info, Upload } from 'lucide-react';

type Datenquelle = 'scandaten' | 'eckdaten' | 'demo';

interface KundenCheckResultsProps {
  hall: Hall;
  objects: TopisObject[];
  gaenge: Gang[];
  records: ScandatenRecord[];
  ergebnis: GesamtErgebnis;
  analyse: BetriebsAnalyse;
  benchmarkErgebnis: BenchmarkErgebnis;
  ampelBewertung: AmpelBewertung;
  torZuordnungen: TorZuordnung[];
  relationZuordnungen: RelationZuordnung[];
  stundenProfil: { stunde: number; soll: number; ist: number; colli: number }[];
  abteilungen: AbteilungDefinition[];
  onOpenEditor?: () => void;
  datenquelle?: Datenquelle;
  onNeueAnalyse?: () => void;
}

/**
 * Kunden-Check Ergebnis-Dashboard.
 * Assembliert alle Ergebnis-Komponenten.
 */
export function KundenCheckResults({
  hall,
  objects,
  gaenge,
  ergebnis,
  analyse,
  benchmarkErgebnis,
  ampelBewertung,
  stundenProfil,
  abteilungen,
  onOpenEditor,
  datenquelle = 'scandaten',
  onNeueAnalyse,
}: KundenCheckResultsProps) {
  // Heatmap auf Colli-Verteilung
  const heatmapConfig: HeatmapConfig = {
    aktiv: true,
    modus: 'colliVerteilung',
    farbskala: 'gruen-rot',
    intensitaet: 0.7,
  };

  // Benchmark-Daten für Radar
  const aktuelleWerte: Record<string, number> = {};
  const benchmarkWerte: Record<string, number> = {};
  ergebnis.abteilungen.forEach((a) => {
    aktuelleWerte[a.abteilung] = a.minProColli;
  });
  // Bester Wert aus dem Ranking als Benchmark
  benchmarkErgebnis.rankings.forEach((r) => {
    benchmarkWerte[r.abteilung] = r.bester.wert;
  });

  // Top-10 Tore nach Colli
  const torObjects = objects.filter((o) => o.type === 'tor');
  const topTore = analyse.objektMetriken
    .filter((m) => torObjects.some((t) => t.id === m.objectId))
    .sort((a, b) => b.colli - a.colli)
    .slice(0, 10);
  const maxTorColli = topTore.length > 0 ? topTore[0].colli : 1;

  const vergleichsHallen = benchmarkErgebnis.anzahlHallen - 1;

  return (
    <div className="space-y-10">
      {/* Datenquelle-Hinweis */}
      {(datenquelle === 'eckdaten' || datenquelle === 'demo') && (
        <div className="flex items-start gap-3 rounded-lg border bg-muted/60 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium">
              {datenquelle === 'demo'
                ? `Sie sehen eine Beispielanalyse einer realen Umschlaghalle (${torObjects.length} Tore, rund ${zahl(Math.round(ergebnis.colliProTag / 100) * 100)} Colli pro Tag).`
                : 'Diese Analyse ist aus Ihren Eckdaten geschätzt.'}
            </p>
            <p className="mt-1 text-muted-foreground">
              {datenquelle === 'demo' ? 'Mit Ihren eigenen Scandaten sehen Sie dieselbe Auswertung für Ihre Halle. ' : 'Mit Ihren Scandaten werden Stundenprofil und Tor-Auslastung exakt. '}
              {onNeueAnalyse && (
                <button onClick={onNeueAnalyse} className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline dark:text-red-300">
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  Eigene Daten laden
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Ampeln */}
      <section aria-labelledby="h-ampeln">
        <h3 id="h-ampeln" className="mb-4 text-base font-semibold">Ihre Halle auf einen Blick</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ampelBewertung.kpis.map((kpi) => (
            <AmpelCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Personalbedarf — skaliert MIT dem Volumen (Min/Colli ist volumenunabhängig) */}
      <section aria-labelledby="h-personal">
        <h3 id="h-personal" className="mb-4 text-base font-semibold">Personalbedarf bei diesem Volumen</h3>
        <dl className="grid grid-cols-2 overflow-hidden rounded-lg border bg-card lg:grid-cols-4">
          {[
            { k: 'Colli pro Tag', v: zahl(ergebnis.colliProTag) },
            { k: 'Mitarbeiterstunden pro Tag', v: zahl(ergebnis.maStundenBedarf, 1) },
            { k: 'Vollzeitkräfte', v: zahl(ergebnis.fte, 1) },
            { k: 'Minuten pro Colli', v: zahl(ergebnis.minProColli, 2) },
          ].map((e, i) => (
            <div key={e.k} className={`p-4 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
              <dt className="text-xs text-muted-foreground">{e.k}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{e.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          Bei doppeltem Tagesvolumen verdoppeln sich Mitarbeiterstunden und Vollzeitkräfte. Minuten pro Colli und Produktivität bleiben gleich.
        </p>
      </section>

      {/* Hallenplan */}
      <section aria-labelledby="h-plan">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="h-plan" className="text-base font-semibold">Wo die Colli ankommen</h3>
          <span className="text-xs text-muted-foreground">
            {torObjects.length} Tore · {zahl(hall.width)} × {zahl(hall.height)} m · automatisch aus Ihren Daten angelegt
          </span>
        </div>
        <div className="rounded-lg border bg-card p-2 sm:p-3">
          <HallPreview hall={hall} objects={objects} gaenge={gaenge} analyse={analyse} heatmapConfig={heatmapConfig} />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>wenig</span>
          <span className="h-2 w-24 rounded-full" style={{ background: 'linear-gradient(to right, var(--viz-heat-lo), var(--viz-heat-hi))' }} aria-hidden="true" />
          <span>viel Colli pro Tag und Tor</span>
        </div>
      </section>

      {/* Stundenprofil + Abteilungsvergleich */}
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-base font-semibold">Benötigte Mitarbeiter je Stunde</h3>
          <p className="mb-4 text-xs text-muted-foreground">Aus dem Colli-Aufkommen je Stunde gerechnet</p>
          <StundenprofilChart data={stundenProfil} />
        </div>
        <div>
          <h3 className="mb-1 text-base font-semibold">Wo die Zeit pro Colli steckt</h3>
          <p className="mb-4 text-xs text-muted-foreground">Je Abteilung im Vergleich zur besten Halle</p>
          <AbteilungsVergleich aktuell={aktuelleWerte} bester={benchmarkWerte} abteilungen={abteilungen} anzahlVergleich={vergleichsHallen} />
        </div>
      </section>

      {/* Top-10 Tore */}
      {topTore.length > 0 && (
        <section aria-labelledby="h-tore">
          <h3 id="h-tore" className="mb-4 text-base font-semibold">Die zehn meistgenutzten Tore</h3>
          <ol className="space-y-1.5">
            {topTore.map((tor) => {
              const obj = torObjects.find((t) => t.id === tor.objectId);
              return (
                <li key={tor.objectId} className="flex items-center gap-3 text-sm">
                  <span className="w-16 shrink-0 text-muted-foreground">{obj?.name || `Tor ${tor.objectId}`}</span>
                  <div className="h-3 flex-1">
                    <div className="h-3 rounded-r-[4px]" style={{ width: `${(tor.colli / maxTorColli) * 100}%`, background: 'var(--viz-halle)' }} />
                  </div>
                  <span className="w-24 shrink-0 text-right tabular-nums text-muted-foreground">{zahl(tor.colli)} Colli/Tag</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Section 5: CTA */}
      <section>
        <BeratungCTA
          bewertung={ampelBewertung}
          onOpenEditor={onOpenEditor}
          onOpenCockpit={() => {
            // Eckdaten-Übergabe an die ROTH-Vorlagen-Tür des Cockpits:
            // Colli/Tag aus der Analyse × 21 Standard-Arbeitstage als
            // VORSCHLAG (im Formular editierbar, nichts wird erfunden).
            try {
              sessionStorage.setItem(
                'topis-cockpit-vorbelegung',
                JSON.stringify({
                  colliProMonat: Math.round(ergebnis.colliProTag * 21),
                  arbeitstage: 21,
                  quelle: 'check',
                }),
              );
            } catch { /* Storage gesperrt → Formular startet leer */ }
            window.location.href = appUrl('/cockpit/');
          }}
        />
      </section>
    </div>
  );
}
