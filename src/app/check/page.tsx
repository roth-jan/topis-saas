'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileUp, Loader2, ArrowLeft, CheckCircle, BarChart3, ClipboardList, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { parseCsvMitProfil } from '@/lib/spaltenzuordnungen';
import { generateAutoLayout } from '@/lib/auto-layout-generator';
import { berechneMinProColli } from '@/lib/prozessrechner';
import { berechneBenchmark } from '@/lib/benchmarking';
import { bewerteKPIs } from '@/lib/ampel-system';
import { REFERENZHALLEN } from '@/lib/data/referenzhallen';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from '@/lib/data/prozessmodell-se';
import { berechneIstSoll } from '@/lib/ist-soll-rechner';
import { KundenCheckResults } from '@/components/check/KundenCheckResults';
import { Fachbegriff } from '@/components/ui/fachbegriff';
import { generateRecordsFromEckdaten, generateDemoRecords } from '@/lib/eckdaten-analyse';
import type { Eckdaten } from '@/lib/eckdaten-analyse';

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

type Phase = 'choose' | 'upload' | 'eckdaten' | 'analyzing' | 'results';
type Datenquelle = 'scandaten' | 'eckdaten' | 'demo';

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
  'Daten einlesen...',
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

  const [phase, setPhase] = useState<Phase>('choose');
  const [datenquelle, setDatenquelle] = useState<Datenquelle>('scandaten');
  const [dragOver, setDragOver] = useState(false);
  const [analyseSchritt, setAnalyseSchritt] = useState(0);
  const [ergebnis, setErgebnis] = useState<AnalyseErgebnis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateiName, setDateiName] = useState<string>('');
  const [dateiInfo, setDateiInfo] = useState<string>('');

  // Eckdaten-Formular
  const [eckTore, setEckTore] = useState('');
  const [eckColli, setEckColli] = useState('');
  const [eckFlaeche, setEckFlaeche] = useState('');
  const [eckFte, setEckFte] = useState('');
  const [eckName, setEckName] = useState('');

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
  const setDatenHerkunft = useProzessmodellStore((s) => s.setDatenHerkunft);

  // ============ Analyse-Pipeline (records → Ergebnis) ============
  const runAnalyseFromRecords = useCallback(async (records: ScandatenRecord[], fileName: string, quelle: Datenquelle) => {
    setPhase('analyzing');
    setDatenquelle(quelle);
    setError(null);
    setDateiName(fileName);

    try {
      // Step 1: Done (records already provided)
      setAnalyseSchritt(0);
      await tick();

      if (records.length === 0) {
        throw new Error('Keine gültigen Datensätze gefunden.');
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

      const totalColli = records.reduce((sum, r) => sum + r.colli, 0);
      const uniqueDays = new Set(records.map((r) => r.scandatum).filter(Boolean));
      const arbeitstage = Math.max(uniqueDays.size, 1);
      const colliProTag = Math.round(totalColli / arbeitstage);

      const parameter: ProzessParameter[] = SE_STANDARD_PARAMETER.map((p) => {
        if (p.id === 'colliProTag') return { ...p, aktuellerWert: colliProTag, quelle: 'scandaten' as const };
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
      setPhase('choose');
    }
  }, []);

  // ============ CSV Upload Pipeline ============
  const runAnalyse = useCallback(async (csvText: string, fileName: string) => {
    setPhase('analyzing');
    setDatenquelle('scandaten');
    setError(null);
    setDateiName(fileName);

    try {
      setAnalyseSchritt(0);
      await tick();
      const { records } = parseCsvMitProfil(csvText);

      if (records.length === 0) {
        throw new Error('Keine gültigen Datensätze gefunden. Bitte prüfen Sie das CSV-Format.');
      }

      // Weiter mit gemeinsamer Pipeline
      await runAnalyseFromRecords(records, fileName, 'scandaten');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler bei der Analyse');
      setPhase('choose');
    }
  }, [runAnalyseFromRecords]);

  // ============ Eckdaten Pipeline ============
  const handleEckdatenSubmit = useCallback(() => {
    const tore = parseInt(eckTore);
    const colli = parseInt(eckColli);
    const flaeche = parseInt(eckFlaeche);
    const fte = parseInt(eckFte);

    if (!tore || !colli || !flaeche || !fte || tore < 2 || colli < 100) {
      setError('Bitte alle Pflichtfelder ausfüllen (mind. 2 Tore, 100 Colli/Tag).');
      return;
    }

    const eckdaten: Eckdaten = {
      tore,
      colliProTag: colli,
      flaecheQm: flaeche,
      fte,
      hallenName: eckName || `Halle (${tore} Tore)`,
      prozessTyp: 'se',
    };

    const records = generateRecordsFromEckdaten(eckdaten);
    const name = eckdaten.hallenName || 'Eckdaten-Eingabe';
    runAnalyseFromRecords(records, name, 'eckdaten');
  }, [eckTore, eckColli, eckFlaeche, eckFte, eckName, runAnalyseFromRecords]);

  // ============ Demo Pipeline ============
  const handleDemo = useCallback(() => {
    const { records } = generateDemoRecords();
    runAnalyseFromRecords(records, 'Demo-Umschlaghalle', 'demo');
  }, [runAnalyseFromRecords]);

  // ============ File Handling ============
  const handleFile = useCallback((file: File) => {
    const name = file.name.toLowerCase();
    const istExcel = name.endsWith('.xlsx') || name.endsWith('.xls');
    const istText = name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.tsv');

    if (!istText && !istExcel) {
      setError('Bitte eine CSV- oder Excel-Datei hochladen (.csv, .txt, .tsv, .xlsx, .xls)');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setError('Fehler beim Lesen der Datei');

    // Excel: erstes Blatt nach CSV (Semikolon) wandeln — danach identische Pipeline
    // wie beim CSV-Upload. xlsx wird dynamisch geladen, damit die Bibliothek nicht
    // im Haupt-Bundle des Funnels landet.
    if (istExcel) {
      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx');
          const wb = XLSX.read(e.target?.result as ArrayBuffer, { type: 'array' });
          const blatt = wb.Sheets[wb.SheetNames[0]];
          if (!blatt) { setError('Die Excel-Datei enthält kein lesbares Tabellenblatt.'); return; }
          const csv = XLSX.utils.sheet_to_csv(blatt, { FS: ';' });
          if (!csv.trim()) { setError('Das erste Tabellenblatt ist leer.'); return; }
          runAnalyse(csv, file.name);
        } catch {
          setError('Die Excel-Datei konnte nicht gelesen werden. Bitte als CSV exportieren.');
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) runAnalyse(text, file.name);
    };
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

    resetState();
    updateHall(1, {
      width: layout.hall.width,
      height: layout.hall.height,
      name: layout.hall.name,
    });
    layout.objects.forEach((obj) => addObjectStore(obj));
    setGaengeStore(layout.gaenge);

    importScandaten(records);
    setAnalyseStore(analyse);
    setTorZuordnungenStore(layout.torZuordnungen);
    setRelationZuordnungenStore(layout.relationZuordnungen);

    const verteilweg = Math.round(layout.hall.width * 0.9 + layout.hall.height * 0.3);
    const param = SE_STANDARD_PARAMETER.map((p) => {
      if (p.id === 'colliProTag') return { ...p, aktuellerWert: ergebnis.colliProTag };
      if (p.id === 'verteilweg') return { ...p, aktuellerWert: verteilweg };
      return { ...p };
    });
    ladeModell(PROZESSMODELL_SE, param);
    // Herkunft für die Kennzahlen-Seite: aus dem Kunden-Check, mit Zeitraum falls vorhanden.
    const z = ergebnis.analyse?.zeitraum;
    setDatenHerkunft({
      projektName: layout.hall.name || 'Kunden-Check',
      datenquelle: datenquelle === 'demo' ? 'vorlage' : datenquelle === 'eckdaten' ? 'manuell' : 'scandaten',
      zeitraum: z ? `${z.von} – ${z.bis}` : undefined,
    });

    router.push('/projekt');
  }, [ergebnis, datenquelle, resetState, updateHall, addObjectStore, setGaengeStore, importScandaten, setAnalyseStore, setTorZuordnungenStore, setRelationZuordnungenStore, ladeModell, setDatenHerkunft, router]);

  // ============ Zurück-Funktion ============
  const handleBackToChoose = useCallback(() => {
    setPhase('choose');
    setErgebnis(null);
    setError(null);
  }, []);

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
        {/* ============ CHOOSE PHASE ============ */}
        {phase === 'choose' && (
          <div className="space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4 py-8">
              <h1 className="text-4xl font-bold tracking-tight">
                Wie produktiv ist <span className="text-primary">Ihre Halle</span>?
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Erhalten Sie in Sekunden eine vollständige Produktivitätsanalyse
                mit Benchmark-Vergleich gegen {REFERENZHALLEN.length} Referenzhallen.
              </p>
            </div>

            {/* 3 Entry Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1: Scandaten */}
              <Card
                role="button"
                tabIndex={0}
                aria-label="Scandaten hochladen — CSV oder Excel"
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setPhase('upload')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPhase('upload'); } }}
              >
                <CardContent className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Scandaten</h3>
                    <p className="text-sm text-muted-foreground mt-1">CSV / Excel hochladen</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Höchste Genauigkeit — echte Heatmap, Stundenprofil, gewichteter Verteilweg
                  </p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {['WMS-Export', 'Scandaten', 'Betriebsdaten'].map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-muted rounded-full text-[10px]">{f}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Eckdaten */}
              <Card
                role="button"
                tabIndex={0}
                aria-label="Eckdaten eingeben — 4 Felder ausfüllen"
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setPhase('eckdaten')}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPhase('eckdaten'); } }}
              >
                <CardContent className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto group-hover:bg-orange-500/20 transition-colors">
                    <ClipboardList className="h-7 w-7 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Eckdaten</h3>
                    <p className="text-sm text-muted-foreground mt-1">4 Felder ausfüllen</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Schneller Überblick — Kennzahlen und Benchmark aus wenigen Angaben
                  </p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {['Tore', 'Colli/Tag', 'Fläche', 'FTE'].map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-muted rounded-full text-[10px]">{f}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Demo */}
              <Card
                role="button"
                tabIndex={0}
                aria-label="Demo ansehen — Beispielanalyse einer Umschlaghalle"
                className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={handleDemo}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDemo(); } }}
              >
                <CardContent className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-colors">
                    <Eye className="h-7 w-7 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Demo ansehen</h3>
                    <p className="text-sm text-muted-foreground mt-1">1 Klick — sofort sehen</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ohne eigene Daten — Beispielanalyse einer Umschlaghalle mit 115 Toren
                  </p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {['115 Tore', '4.000 Colli/Tag', 'Heatmap', 'Ampeln'].map((f) => (
                      <span key={f} className="px-2 py-0.5 bg-muted rounded-full text-[10px]">{f}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ============ UPLOAD PHASE ============ */}
        {phase === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBackToChoose}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
              <h2 className="text-2xl font-bold">Scandaten hochladen</h2>
            </div>

            {/* Upload Zone */}
            <Card
              role="button"
              tabIndex={0}
              aria-label="Datei auswählen oder per Drag & Drop ablegen"
              className={`border-2 border-dashed cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                dragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-muted-foreground/20 hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            >
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${dragOver ? 'bg-primary/20' : 'bg-muted'}`}>
                    <Upload className={`h-8 w-8 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {dragOver ? 'Datei hier ablegen...' : 'CSV- oder Excel-Datei per Drag & Drop ablegen'}
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
              accept=".csv,.txt,.tsv,.xlsx,.xls"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
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
                {['ROTH-Standard', '7 weitere Speditions-WMS-Formate'].map((name) => (
                  <span key={name} className="px-3 py-1 bg-muted rounded-full text-xs">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ ECKDATEN PHASE ============ */}
        {phase === 'eckdaten' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBackToChoose}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
              <h2 className="text-2xl font-bold">Eckdaten eingeben</h2>
            </div>

            <Card>
              <CardContent className="py-8">
                <div className="max-w-lg mx-auto space-y-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Mit 4 Kennzahlen erhalten Sie einen ersten Benchmark-Vergleich Ihrer Halle.
                  </p>

                  {/* Pflichtfelder */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eck-tore">Anzahl Tore *</Label>
                      <Input
                        id="eck-tore"
                        type="number"
                        placeholder="z.B. 42"
                        value={eckTore}
                        onChange={(e) => setEckTore(e.target.value)}
                        min={2}
                        max={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eck-colli"><Fachbegriff id="colli">Colli</Fachbegriff> pro Tag *</Label>
                      <Input
                        id="eck-colli"
                        type="number"
                        placeholder="z.B. 8.000"
                        value={eckColli}
                        onChange={(e) => setEckColli(e.target.value)}
                        min={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eck-flaeche">Hallenfläche (qm) *</Label>
                      <Input
                        id="eck-flaeche"
                        type="number"
                        placeholder="z.B. 5.000"
                        value={eckFlaeche}
                        onChange={(e) => setEckFlaeche(e.target.value)}
                        min={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eck-fte">Mitarbeiter (<Fachbegriff id="fte">FTE</Fachbegriff>) *</Label>
                      <Input
                        id="eck-fte"
                        type="number"
                        placeholder="z.B. 40"
                        value={eckFte}
                        onChange={(e) => setEckFte(e.target.value)}
                        min={1}
                      />
                    </div>
                  </div>

                  {/* Optionale Felder */}
                  <div className="space-y-2">
                    <Label htmlFor="eck-name">Hallenname (optional)</Label>
                    <Input
                      id="eck-name"
                      type="text"
                      placeholder="z.B. Halle 3 Süd"
                      value={eckName}
                      onChange={(e) => setEckName(e.target.value)}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}

                  <Button className="w-full" size="lg" onClick={handleEckdatenSubmit}>
                    Analyse starten
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Die Analyse basiert auf Branchen-Durchschnittswerten. Für eine präzisere Auswertung laden Sie Ihre Scandaten hoch.
                  </p>
                </div>
              </CardContent>
            </Card>
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
              <Button variant="outline" size="sm" className="gap-2" onClick={handleBackToChoose}>
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
              datenquelle={datenquelle}
              onNeueAnalyse={handleBackToChoose}
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
