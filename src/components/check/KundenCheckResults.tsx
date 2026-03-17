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
import { StundenChart } from '@/components/dashboard/StundenChart';
import { BenchmarkRadar } from '@/components/dashboard/BenchmarkRadar';

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

  return (
    <div className="space-y-8">
      {/* Section 1: Ampel-Grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Kennzahlen-Bewertung</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ampelBewertung.kpis.map((kpi) => (
            <AmpelCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Section 2: Hallenvorschau mit Heatmap */}
      <section>
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
          Hallenplan — Colli-Verteilung auf Toren
        </h3>
        <div className="flex justify-center">
          <HallPreview
            hall={hall}
            objects={objects}
            gaenge={gaenge}
            analyse={analyse}
            heatmapConfig={heatmapConfig}
            width={800}
            height={420}
          />
        </div>
        <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
          <span>{torObjects.length} Tore</span>
          <span>{objects.filter((o) => o.type === 'bereich').length} Bereiche</span>
          <span>{gaenge.length} Gänge</span>
          <span>{hall.width.toFixed(0)} x {hall.height.toFixed(0)} m</span>
        </div>
      </section>

      {/* Section 3: Charts nebeneinander */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Stundenprofil */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Stundenprofil — SOLL-MA/Stunde
          </h3>
          <StundenChart data={stundenProfil} width={450} height={240} />
          <p className="text-xs text-muted-foreground mt-2">
            SOLL = benötigte MA basierend auf Colli-Aufkommen je Stunde
          </p>
        </div>

        {/* Benchmark-Radar */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Benchmark-Radar — Position vs. {benchmarkErgebnis.anzahlHallen} Hallen
          </h3>
          <BenchmarkRadar
            aktuell={aktuelleWerte}
            benchmark={benchmarkWerte}
            abteilungen={abteilungen}
            width={350}
            height={280}
          />
        </div>
      </section>

      {/* Section 4: Top-10 Tore */}
      {topTore.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Top-10 Tore nach Colli-Volumen
          </h3>
          <div className="space-y-2">
            {topTore.map((tor, i) => {
              const pct = (tor.colli / maxTorColli) * 100;
              const obj = torObjects.find((t) => t.id === tor.objectId);
              const statusColor = pct >= 85 ? 'bg-red-500' : pct >= 65 ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <div key={tor.objectId} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-20 shrink-0">
                    {obj?.name || `Tor ${tor.objectId}`}
                  </span>
                  <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${statusColor} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-16 text-right">
                    {tor.colli >= 1000 ? `${(tor.colli / 1000).toFixed(1)}k` : Math.round(tor.colli)}
                  </span>
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                  <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 5: CTA */}
      <section>
        <BeratungCTA bewertung={ampelBewertung} onOpenEditor={onOpenEditor} />
      </section>
    </div>
  );
}
