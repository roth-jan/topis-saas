'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileUp, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

import { parseCsvMitProfil } from '@/lib/spaltenzuordnungen';
import { generateAutoLayout } from '@/lib/auto-layout-generator';
import { berechneMinProColli } from '@/lib/prozessrechner';
import { berechneBenchmark } from '@/lib/benchmarking';
import { bewerteKPIs } from '@/lib/ampel-system';
import { REFERENZHALLEN } from '@/lib/data/referenzhallen';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from '@/lib/data/prozessmodell-se';
import { berechneIstSoll } from '@/lib/ist-soll-rechner';
import { KundenCheckResults } from '@/components/check/KundenCheckResults';

import type { ScandatenRecord } from '@/types/scandaten';
import type { Hall, TopisObject, Gang } from '@/types/topis';
import type { GesamtErgebnis, ProzessParameter, AbteilungDefinition } from '@/types/prozessmodell';
import type { BetriebsAnalyse, StundenAggregation } from '@/lib/betriebsdaten-store';
import type { BenchmarkErgebnis } from '@/lib/benchmarking';
import type { AmpelBewertung } from '@/lib/ampel-system';
import type { TorZuordnung, RelationZuordnung } from '@/types/scandaten';
import type { AutoLayoutResult } from '@/lib/auto-layout-generator';

// Stores für "Im Experten-Editor öffnen"
import { useTopisStore } from '@/lib/store';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';

type Phase = 'upload' | 'analyzing' | 'results';

interface AnalyseErgebnis {
  layout: AutoLayoutResult;
  records: ScandatenRecord[];
  ergebnis: GesamtErgebnis;
  analyse: BetriebsAnalyse;
  benchmarkErgebnis: BenchmarkErgebnis;
  ampelBewertung: AmpelBewertung;
  stundenProfil: { stunde: number; soll: number; ist: number; colli: number }[];
  abteilungen: AbteilungDefinition[];
  colliProTag: number;
  arbeitstage: number;
}

// Fortschritts-Schritte
const ANALYSE_STEPS = [
  'CSV einlesen...',
  'Format erkennen...',
  'Halle generieren...',
  'Prozessmodell berechnen...',
  'Benchmark vergleichen...',
  'Stundenprofil erstellen...',
  'Bewertung abschließen...',
];

export default function CheckPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [analyseSchritt, setAnalyseSchritt] = useState(0);
  const [ergebnis, setErgebnis] = useState<AnalyseErgebnis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateiName, setDateiName] = useState<string>('');
  const [dateiInfo, setDateiInfo] = useState<string>('');

  // Store-Referenzen für Editor-Übernahme
  const loadState = useTopisStore((s) => s.loadState);
  const updateHall = useTopisStore((s) => s.updateHall);
  const resetState = useTopisStore((s) => s.resetState);
  const setGaengeStore = useTopisStore((s) => s.setGaenge);
  const addObjectStore = useTopisStore((s) => s.addObject);
  const importScandaten = useBetriebsdatenStore((s) => s.importScandatenRecords);
  const setAnalyseStore = useBetriebsdatenStore((s) => s.setAnalyse);
  const setTorZuordnungenStore = useBetriebsdatenStore((s) => s.setTorZuordnungen);
  const setRelationZuordnungenStore = useBetriebsdatenStore((s) => s.setRelationZuordnungen);
  const ladeModell = useProzessmodellStore((s) => s.ladeModell);

  // ============ Analyse-Pipeline ============
  const runAnalyse = useCallback(async (csvText: string, fileName: string) => {
    setPhase('analyzing');
    setError(null);
    setDateiName(fileName);

    try {
      // Step 1: CSV parsen
      setAnalyseSchritt(0);
      await tick();
      const { records, erkanntesProfil } = parseCsvMitProfil(csvText);

      if (records.length === 0) {
        throw new Error('Keine gültigen Datensätze gefunden. Bitte prüfen Sie das CSV-Format.');
      }

      // Step 2: Format Info
      setAnalyseSchritt(1);
      await tick();
      const uniqueStellplaetze = new Set(records.map((r) => r.stellplatz).filter(Boolean));
      const uniqueRelationen = new Set(records.map((r) => r.ausgangsrelation).filter(Boolean));
      const daten = records.filter((r) => r.scandatum).map((r) => r.scandatum);
      const minDatum = daten.length > 0 ? daten.sort()[0] : '?';
      const maxDatum = daten.length > 0 ? daten.sort().reverse()[0] : '?';
      setDateiInfo(`${records.length.toLocaleString('de-DE')} Datensätze · ${uniqueStellplaetze.size} Tore · ${uniqueRelationen.size} Relationen · ${minDatum} – ${maxDatum}`);

      // Step 3: Auto-Layout
      setAnalyseSchritt(2);
      await tick();
      const layout = generateAutoLayout(records);

      // Step 4: Prozessmodell berechnen
      setAnalyseSchritt(3);
      await tick();

      // Colli & Arbeitstage aus Daten berechnen
      const totalColli = records.reduce((sum, r) => sum + r.colli, 0);
      const uniqueDays = new Set(records.map((r) => r.scandatum).filter(Boolean));
      const arbeitstage = Math.max(uniqueDays.size, 1);
      const colliProTag = Math.round(totalColli / arbeitstage);

      // Parameter mit berechneten Werten
      const parameter: ProzessParameter[] = SE_STANDARD_PARAMETER.map((p) => {
        if (p.id === 'colliProTag') return { ...p, aktuellerWert: colliProTag, quelle: 'scandaten' as const };
        // Default-Verteilweg (geschätzt aus Hallengröße, da kein echtes Routing)
        if (p.id === 'verteilweg') {
          const geschaetzterWeg = Math.round(layout.hall.width * 0.9 + layout.hall.height * 0.3);
          return { ...p, aktuellerWert: geschaetzterWeg, quelle: 'layout' as const };
        }
        return { ...p };
      });

      const ergebnis = berechneMinProColli(PROZESSMODELL_SE, parameter);

      // Step 5: Benchmark
      setAnalyseSchritt(4);
      await tick();
      const benchmarkErgebnis = berechneBenchmark(ergebnis, parameter.find((p) => p.id === 'verteilweg')!.aktuellerWert, REFERENZHALLEN, 'Ihre Halle');

      // Step 6: Stundenprofil (IST-SOLL)
      setAnalyseSchritt(5);
      await tick();
      const stundenMap = new Map<number, StundenAggregation>();
      for (let h = 0; h < 24; h++) {
        stundenMap.set(h, { stunde: h, colli: 0, sendungen: 0, gewicht: 0, scans: 0 });
      }
      for (const r of records) {
        const stunde = r.scanzeit ? parseInt(r.scanzeit.split(':')[0]) : 0;
        const agg = stundenMap.get(stunde) || stundenMap.get(0)!;
        agg.colli += r.colli;
        agg.sendungen += r.sendungen;
        agg.gewicht += r.gewicht;
        agg.scans += 1;
      }
      const stundenAgg = Array.from(stundenMap.values());

      // IST-SOLL berechnen (ohne echte IST-Werte → nur SOLL)
      const istSoll = berechneIstSoll(stundenAgg, {}, ergebnis.minProColli, ergebnis.arbeitsminProStunde, arbeitstage);
      const stundenProfil = istSoll.stunden.map((s) => ({
        stunde: s.stunde,
        soll: s.sollMA,
        ist: 0,
        colli: s.colli,
      }));

      // Step 7: Ampel-Bewertung
      setAnalyseSchritt(6);
      await tick();

      // BetriebsAnalyse erstellen
      const analyse: BetriebsAnalyse = {
        zeitraum: { von: minDatum, bis: maxDatum },
        arbeitstage,
        gesamtSendungen: records.reduce((sum, r) => sum + r.sendungen, 0),
        gesamtColli: totalColli,
        gesamtGewicht: records.reduce((sum, r) => sum + r.gewicht, 0),
        objektMetriken: layout.torZuordnungen.map((tz) => {
          const torRecords = records.filter((r) => r.stellplatz === tz.stellplatzKey);
          return {
            objectId: tz.objectId,
            objectName: tz.objectName,
            sendungen: torRecords.reduce((sum, r) => sum + r.sendungen, 0) / arbeitstage,
            colli: torRecords.reduce((sum, r) => sum + r.colli, 0) / arbeitstage,
            gewicht: torRecords.reduce((sum, r) => sum + r.gewicht, 0) / arbeitstage,
            durchschnittLadezeit: 0,
            auslastung: 0,
            fahrtenProTag: 0,
          };
        }),
      };

      const ampelBewertung = bewerteKPIs(ergebnis, benchmarkErgebnis, REFERENZHALLEN, stundenProfil);

      // Ergebnis speichern
      setErgebnis({
        layout,
        records,
        ergebnis,
        analyse,
        benchmarkErgebnis,
        ampelBewertung,
        stundenProfil,
        abteilungen: PROZESSMODELL_SE.abteilungen,
        colliProTag,
        arbeitstage,
      });

      setPhase('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler bei der Analyse');
      setPhase('upload');
    }
  }, []);

  // ============ File Handling ============
  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt') && !file.name.endsWith('.tsv')) {
      setError('Bitte eine CSV-Datei hochladen (.csv, .txt, .tsv)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) runAnalyse(text, file.name);
    };
    reader.onerror = () => setError('Fehler beim Lesen der Datei');
    reader.readAsText(file, 'utf-8');
  }, [runAnalyse]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ============ Editor-Übernahme ============
  const handleOpenEditor = useCallback(() => {
    if (!ergebnis) return;
    const { layout, records, analyse } = ergebnis;

    // Stores befüllen
    resetState();
    updateHall(1, {
      width: layout.hall.width,
      height: layout.hall.height,
      name: layout.hall.name,
    });
    layout.objects.forEach((obj) => addObjectStore(obj));
    setGaengeStore(layout.gaenge);

    // Betriebsdaten
    importScandaten(records);
    setAnalyseStore(analyse);
    setTorZuordnungenStore(layout.torZuordnungen);
    setRelationZuordnungenStore(layout.relationZuordnungen);

    // Prozessmodell
    const verteilweg = Math.round(layout.hall.width * 0.9 + layout.hall.height * 0.3);
    const param = SE_STANDARD_PARAMETER.map((p) => {
      if (p.id === 'colliProTag') return { ...p, aktuellerWert: ergebnis.colliProTag };
      if (p.id === 'verteilweg') return { ...p, aktuellerWert: verteilweg };
      return { ...p };
    });
    ladeModell(PROZESSMODELL_SE, param);

    router.push('/projekt');
  }, [ergebnis, resetState, updateHall, addObjectStore, setGaengeStore, importScandaten, setAnalyseStore, setTorZuordnungenStore, setRelationZuordnungenStore, ladeModell, router]);

  // ============ Render ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
                T
              </div>
              <span className="font-semibold">TOPIS</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Hallen-Check</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/projekt" className="text-sm text-muted-foreground hover:text-foreground">
              Editor
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* ============ UPLOAD PHASE ============ */}
        {phase === 'upload' && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4 py-8">
              <h1 className="text-4xl font-bold tracking-tight">
                Wie produktiv ist <span className="text-primary">Ihre Halle</span>?
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Laden Sie Ihre Scandaten hoch und erhalten Sie in Sekunden eine vollständige Produktivitätsanalyse
                mit Benchmark-Vergleich gegen {REFERENZHALLEN.length} Referenzhallen.
              </p>
            </div>

            {/* Upload Zone */}
            <Card
              className={`border-2 border-dashed cursor-pointer transition-all ${
                dragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-muted-foreground/20 hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dragOver ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Upload className={`h-8 w-8 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {dragOver ? 'Datei hier ablegen...' : 'CSV-Datei per Drag & Drop ablegen'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      oder klicken zum Auswählen · WMS-Export, Scandaten, Betriebsdaten
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileUp className="h-4 w-4" />
                    Datei auswählen
                  </Button>
                </div>
              </CardContent>
            </Card>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,.tsv"
              className="hidden"
              onChange={handleFileInput}
            />

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {/* Formate */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Unterstützte Formate (Auto-Erkennung):</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['ROTH Standard', 'Andreas Schmid', 'Geis', 'PML Kiel', 'IDS Hub', 'Noerpel', 'Rhenus', 'TLT'].map((name) => (
                  <span key={name} className="px-3 py-1 bg-muted rounded-full text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ ANALYZING PHASE ============ */}
        {phase === 'analyzing' && (
          <div className="py-24 text-center space-y-8">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Analyse läuft...</h2>
              {dateiName && <p className="text-sm text-muted-foreground mb-1">{dateiName}</p>}
              {dateiInfo && <p className="text-sm text-muted-foreground">{dateiInfo}</p>}
            </div>
            <div className="max-w-md mx-auto space-y-3">
              {ANALYSE_STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i < analyseSchritt ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : i === analyseSchritt ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span className={`text-sm ${i <= analyseSchritt ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ RESULTS PHASE ============ */}
        {phase === 'results' && ergebnis && (
          <div className="space-y-6">
            {/* Result Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Hallen-Check Ergebnis</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {dateiName} · {dateiInfo}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => { setPhase('upload'); setErgebnis(null); }}>
                <ArrowLeft className="h-4 w-4" />
                Neue Analyse
              </Button>
            </div>

            {/* Results Dashboard */}
            <KundenCheckResults
              hall={ergebnis.layout.hall}
              objects={ergebnis.layout.objects}
              gaenge={ergebnis.layout.gaenge}
              records={ergebnis.records}
              ergebnis={ergebnis.ergebnis}
              analyse={ergebnis.analyse}
              benchmarkErgebnis={ergebnis.benchmarkErgebnis}
              ampelBewertung={ergebnis.ampelBewertung}
              torZuordnungen={ergebnis.layout.torZuordnungen}
              relationZuordnungen={ergebnis.layout.relationZuordnungen}
              stundenProfil={ergebnis.stundenProfil}
              abteilungen={ergebnis.abteilungen}
              onOpenEditor={handleOpenEditor}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>TOPIS Hallen-Check · ROTH Logistikberatung © 2026</span>
            <a href="mailto:info@roth-logistik.de" className="hover:text-foreground">
              info@roth-logistik.de
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Yield to event loop for UI updates */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 80));
}
