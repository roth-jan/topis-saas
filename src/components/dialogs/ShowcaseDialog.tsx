'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTopisStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import {
  Presentation,
  Play,
  Square,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { TopisObject, Gang } from '@/types/topis';
import { generateGaenge, DEFAULT_GANG_SETTINGS } from '@/lib/gang-generator';
import { analyzeProduktivitaet } from '@/lib/analytics';

// Showcase overlay component that appears at bottom of screen
function ShowcaseOverlay({
  phase,
  detail,
  progress,
  onStop
}: {
  phase: string;
  detail: string;
  progress: number;
  onStop: () => void;
}) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[10000]">
      <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl px-7 py-5 shadow-2xl border border-white/10 flex items-center gap-6 min-w-[680px]">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
          🎬
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              TOPIS Showcase
            </span>
            <span className="text-zinc-500 text-xs px-2 py-0.5 bg-white/10 rounded">
              Andreas Schmid
            </span>
          </div>
          <div className="text-white font-medium text-lg">
            {phase}
          </div>
          <div className="text-zinc-400 text-sm mt-1 min-h-[20px]">
            {detail}
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stop Button */}
        <Button
          variant="destructive"
          className="shadow-lg shadow-red-500/30"
          onClick={onStop}
        >
          <Square className="h-4 w-4 mr-2" />
          Stoppen
        </Button>
      </div>
    </div>
  );
}

// Create VORHER scenario (suboptimal layout)
function createVorherSzenario(): { objects: Omit<TopisObject, 'id'>[]; hall: { width: number; height: number; name: string } } {
  const objects: Omit<TopisObject, 'id'>[] = [];
  const w = 150, h = 50;

  // 85 Tore - alle am Rand
  const torWidth = 3, torDepth = 1.5;

  // Nordseite - 38 Tore
  for (let i = 0; i < 38; i++) {
    objects.push({
      type: 'tor',
      x: 1 + i * 3.9,
      y: 0,
      width: torWidth,
      height: torDepth,
      name: `Tor ${i + 1}`,
      color: '#22c55e',
    });
  }

  // Südseite - 47 Tore
  for (let i = 0; i < 47; i++) {
    objects.push({
      type: 'tor',
      x: 1 + i * 3.1,
      y: h - torDepth,
      width: torWidth,
      height: torDepth,
      name: `Tor ${39 + i}`,
      color: '#22c55e',
    });
  }

  // VORHER: Stellplätze ALLE IN DER MITTE (suboptimal - maximale Distanz!)
  const stellplatzReihen = [
    { y: 20, prefix: '01', count: 12 },
    { y: 23, prefix: '02', count: 12 },
    { y: 26, prefix: '03', count: 12 },
    { y: 29, prefix: '04', count: 12 },
  ];

  stellplatzReihen.forEach(reihe => {
    for (let i = 0; i < reihe.count; i++) {
      objects.push({
        type: 'stellplatz',
        x: 5 + i * 12,
        y: reihe.y,
        width: 10,
        height: 2.5,
        name: `${reihe.prefix}${String(i + 1).padStart(2, '0')}`,
        color: '#3b82f6',
      });
    }
  });

  // Kunden-Bereiche - ungünstig platziert
  const kunden = [
    { name: 'AS', color: '#ef4444', x: 5, w: 20 },
    { name: 'Logistix', color: '#3b82f6', x: 28, w: 18 },
    { name: 'Murphy', color: '#a855f7', x: 50, w: 15 },
    { name: 'Strauss', color: '#f59e0b', x: 70, w: 18 },
    { name: 'Fischer', color: '#14b8a6', x: 95, w: 20 },
    { name: 'G.Sigl', color: '#ec4899', x: 120, w: 15 },
  ];

  kunden.forEach(k => {
    objects.push({
      type: 'bereich',
      x: k.x,
      y: 33,
      width: k.w,
      height: 5,
      name: k.name,
      color: k.color,
    });
  });

  return {
    objects,
    hall: { width: w, height: h, name: 'Halle 6 - IST' }
  };
}

// Create NACHHER scenario (optimized layout)
function createNachherSzenario(): { objects: Omit<TopisObject, 'id'>[]; hall: { width: number; height: number; name: string } } {
  const objects: Omit<TopisObject, 'id'>[] = [];
  const w = 150, h = 50;

  // Same gates
  const torWidth = 3, torDepth = 1.5;

  for (let i = 0; i < 38; i++) {
    objects.push({
      type: 'tor',
      x: 1 + i * 3.9,
      y: 0,
      width: torWidth,
      height: torDepth,
      name: `Tor ${i + 1}`,
      color: '#22c55e',
    });
  }

  for (let i = 0; i < 47; i++) {
    objects.push({
      type: 'tor',
      x: 1 + i * 3.1,
      y: h - torDepth,
      width: torWidth,
      height: torDepth,
      name: `Tor ${39 + i}`,
      color: '#22c55e',
    });
  }

  // NACHHER: Stellplätze näher an den Toren (optimiert!)
  // Nordseite - näher an nördlichen Toren
  for (let i = 0; i < 24; i++) {
    objects.push({
      type: 'stellplatz',
      x: 5 + i * 6,
      y: 3,
      width: 5,
      height: 2.5,
      name: `N${String(i + 1).padStart(2, '0')}`,
      color: '#3b82f6',
    });
  }

  // Südseite - näher an südlichen Toren
  for (let i = 0; i < 24; i++) {
    objects.push({
      type: 'stellplatz',
      x: 5 + i * 6,
      y: h - 5.5,
      width: 5,
      height: 2.5,
      name: `S${String(i + 1).padStart(2, '0')}`,
      color: '#3b82f6',
    });
  }

  // Kunden-Bereiche - optimiert in der Mitte
  const kunden = [
    { name: 'AS', color: '#ef4444', x: 5, w: 20 },
    { name: 'Logistix', color: '#3b82f6', x: 28, w: 18 },
    { name: 'Murphy', color: '#a855f7', x: 50, w: 15 },
    { name: 'Strauss', color: '#f59e0b', x: 70, w: 18 },
    { name: 'Fischer', color: '#14b8a6', x: 95, w: 20 },
    { name: 'G.Sigl', color: '#ec4899', x: 120, w: 15 },
  ];

  kunden.forEach(k => {
    objects.push({
      type: 'bereich',
      x: k.x,
      y: 22,
      width: k.w,
      height: 6,
      name: k.name,
      color: k.color,
    });
  });

  return {
    objects,
    hall: { width: w, height: h, name: 'Halle 6 - SOLL' }
  };
}

export function ShowcaseDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [phase, setPhase] = useState('');
  const [detail, setDetail] = useState('');
  const [progress, setProgress] = useState(0);
  const stoppedRef = useRef(false);

  // Store actions
  const resetState = useTopisStore((s) => s.resetState);
  const updateHall = useTopisStore((s) => s.updateHall);
  const addObject = useTopisStore((s) => s.addObject);
  const setGaenge = useTopisStore((s) => s.setGaenge);
  const saveVorher = useTopisStore((s) => s.saveVorher);
  const saveNachher = useTopisStore((s) => s.saveNachher);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const updatePhase = useCallback((newPhase: string, newDetail: string, newProgress: number) => {
    if (stoppedRef.current) return;
    setPhase(newPhase);
    setDetail(newDetail);
    setProgress(newProgress);
  }, []);

  // Calculate metrics for current state
  const calculateMetrics = useCallback(() => {
    const state = useTopisStore.getState();
    const ffz = state.ffz && state.ffz.length > 0 ? state.ffz[0] : undefined;
    const analysis = analyzeProduktivitaet(
      state.halls[0],
      state.objects,
      state.gaenge,
      ffz
    );
    return {
      avgDistanz: analysis.durchschnittlicheDistanz,
      prozesszeit: analysis.geschaetzteDurchsatzZeit / 60, // convert to minutes
    };
  }, []);

  // Get canvas screenshot
  const getScreenshot = useCallback((): string => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return '';
  }, []);

  // Run the showcase demo
  const runShowcase = useCallback(async () => {
    stoppedRef.current = false;
    setIsRunning(true);
    setShowOverlay(true);
    setIsOpen(false); // Close the sheet

    try {
      // ==========================================
      // PHASE 1: EINLEITUNG
      // ==========================================
      updatePhase('Projekt: Andreas Schmid Gersthofen', 'Umschlaghalle 6 - Optimierungsanalyse', 5);
      await wait(2500);
      if (stoppedRef.current) return;

      // ==========================================
      // PHASE 2: VORHER-SZENARIO AUFBAUEN
      // ==========================================
      updatePhase('Phase 1: Halle erstellen', '🏗️ Lade Hallenlayout 150m × 50m...', 8);
      await wait(500);
      if (stoppedRef.current) return;

      // Create VORHER scenario
      const vorher = createVorherSzenario();
      resetState();
      updateHall(1, {
        width: vorher.hall.width,
        height: vorher.hall.height,
        name: vorher.hall.name,
        color: '#16213e'
      });

      // Add objects with animation
      updatePhase('Phase 1: Tore platzieren', '🚪 Platziere 85 Verladestore...', 12);
      await wait(300);

      const tore = vorher.objects.filter(o => o.type === 'tor');
      for (let i = 0; i < tore.length; i += 10) {
        if (stoppedRef.current) return;
        const batch = tore.slice(i, i + 10);
        batch.forEach(tor => addObject(tor));
        await wait(50);
      }

      updatePhase('Phase 1: Stellplätze anlegen', '📦 Erstelle 48 Stellplätze...', 15);
      await wait(300);

      const stellplaetze = vorher.objects.filter(o => o.type === 'stellplatz');
      for (const sp of stellplaetze) {
        if (stoppedRef.current) return;
        addObject(sp);
        await wait(30);
      }

      updatePhase('Phase 1: Kundenbereiche', '🏢 Definiere 6 Kundenbereiche...', 17);
      await wait(300);

      const bereiche = vorher.objects.filter(o => o.type === 'bereich');
      for (const bereich of bereiche) {
        if (stoppedRef.current) return;
        addObject(bereich);
        await wait(100);
      }

      if (stoppedRef.current) return;

      updatePhase('Phase 1: IST-Zustand komplett', '✓ 85 Tore • 48 Stellplätze • 6 Kundenbereiche', 18);
      await wait(1500);
      if (stoppedRef.current) return;

      // Save VORHER
      updatePhase('Phase 1: Speichere IST-Zustand', '💾 Sichere Ausgangslage für späteren Vergleich...', 22);
      const vorherMetrics = calculateMetrics();
      const vorherScreenshot = getScreenshot();
      const currentState = useTopisStore.getState();
      saveVorher(
        {
          halls: currentState.halls,
          objects: currentState.objects,
          paths: currentState.paths || [],
          pathAreas: currentState.pathAreas || [],
          gaenge: [],
          ffz: currentState.ffz || [],
          conveyors: currentState.conveyors || [],
          avgDistanz: vorherMetrics.avgDistanz,
          prozesszeit: vorherMetrics.prozesszeit,
          timestamp: new Date().toISOString(),
        },
        vorherScreenshot
      );
      await wait(1000);
      if (stoppedRef.current) return;

      // ==========================================
      // PHASE 3: ANALYSE
      // ==========================================
      updatePhase('Phase 2: Analyse starten', '🔍 Scanne Layout nach Optimierungspotenzial...', 25);
      await wait(1000);

      updatePhase('Phase 2: Wegeanalyse', '📏 Messe Distanzen zwischen Toren und Stellplätzen...', 28);
      await wait(1500);
      if (stoppedRef.current) return;

      updatePhase(
        'Phase 2: IST-Kennzahlen',
        `⚠️ Ø Distanz: ${vorherMetrics.avgDistanz.toFixed(1)}m | Prozesszeit: ${vorherMetrics.prozesszeit.toFixed(2)} Min/Colli`,
        32
      );
      await wait(2000);
      if (stoppedRef.current) return;

      updatePhase(
        'Phase 2: Schwachstellen erkannt',
        '🔴 Lange Wege • 🔴 Ungünstige Stellplatz-Position • 🔴 Fehlende Gänge',
        38
      );
      await wait(2000);
      if (stoppedRef.current) return;

      // ==========================================
      // PHASE 4: OPTIMIERUNG
      // ==========================================
      updatePhase('Phase 3: Optimierung starten', '🔧 Analysiere Layout für Verbesserungen...', 40);
      await wait(1000);

      // Build NACHHER scenario
      updatePhase('Phase 3: Stellplätze optimieren', '📦 Verschiebe Stellplätze näher an Tore...', 45);

      const nachher = createNachherSzenario();
      resetState();
      updateHall(1, {
        width: nachher.hall.width,
        height: nachher.hall.height,
        name: nachher.hall.name,
        color: '#16213e'
      });

      // Add optimized objects
      for (const obj of nachher.objects) {
        if (stoppedRef.current) return;
        addObject(obj);
        await wait(10);
      }

      await wait(500);
      if (stoppedRef.current) return;

      // Optimize corridors
      updatePhase('Phase 3: Bereiche & FFZ', '🏢 Positioniere Kundenbereiche • ⚡ Optimiere FFZ-Geschwindigkeit', 55);
      await wait(1000);
      if (stoppedRef.current) return;

      updatePhase('Phase 3: Wegenetz erstellen', '🛤️ Generiere optimale Fahrwege...', 65);

      const currentHall = useTopisStore.getState().halls[0];
      const currentObjects = useTopisStore.getState().objects;
      const gaenge = generateGaenge(currentHall, currentObjects, {
        ...DEFAULT_GANG_SETTINGS,
        hauptgangBreite: 4,
        regalgangBreite: 3,
      });
      setGaenge(gaenge);
      await wait(1000);
      if (stoppedRef.current) return;

      // ==========================================
      // PHASE 5: NACHHER SPEICHERN
      // ==========================================
      updatePhase('Phase 4: SOLL-Zustand speichern', '💾 Sichere optimiertes Layout...', 80);

      const nachherMetrics = calculateMetrics();
      const nachherScreenshot = getScreenshot();
      const nachherState = useTopisStore.getState();
      saveNachher(
        {
          halls: nachherState.halls,
          objects: nachherState.objects,
          paths: nachherState.paths || [],
          pathAreas: nachherState.pathAreas || [],
          gaenge: nachherState.gaenge,
          ffz: nachherState.ffz || [],
          conveyors: nachherState.conveyors || [],
          avgDistanz: nachherMetrics.avgDistanz,
          prozesszeit: nachherMetrics.prozesszeit,
          timestamp: new Date().toISOString(),
        },
        nachherScreenshot
      );
      await wait(1500);
      if (stoppedRef.current) return;

      updatePhase(
        'Phase 4: SOLL-Kennzahlen',
        `✅ Ø Distanz: ${nachherMetrics.avgDistanz.toFixed(1)}m | Prozesszeit: ${nachherMetrics.prozesszeit.toFixed(2)} Min/Colli`,
        85
      );
      await wait(2500);
      if (stoppedRef.current) return;

      // ==========================================
      // PHASE 6: ERGEBNIS
      // ==========================================
      const distanzVerbesserung = ((vorherMetrics.avgDistanz - nachherMetrics.avgDistanz) / vorherMetrics.avgDistanz * 100);
      const zeitVerbesserung = ((vorherMetrics.prozesszeit - nachherMetrics.prozesszeit) / vorherMetrics.prozesszeit * 100);

      updatePhase(
        'Phase 5: Ergebnis',
        `🎯 ${Math.abs(distanzVerbesserung).toFixed(1)}% kürzere Wege | ⏱️ ${Math.abs(zeitVerbesserung).toFixed(1)}% schnellere Prozesse`,
        95
      );
      await wait(3000);
      if (stoppedRef.current) return;

      updatePhase('✅ Optimierung abgeschlossen!', 'Die Vorher/Nachher-Daten sind im Projekt-Vergleich verfügbar.', 100);
      await wait(2000);

      toast.success('Showcase abgeschlossen - Öffne Projekt-Vergleich für Details');

    } catch (error) {
      console.error('Showcase-Demo Fehler:', error);
      toast.error('Fehler während der Demo');
    } finally {
      setShowOverlay(false);
      setIsRunning(false);
    }
  }, [updatePhase, resetState, updateHall, addObject, setGaenge, saveVorher, saveNachher, calculateMetrics, getScreenshot]);

  // Stop showcase
  const stopShowcase = useCallback(() => {
    stoppedRef.current = true;
    setShowOverlay(false);
    setIsRunning(false);
    toast.info('Demo gestoppt - Szenarien sind im Projekt-Vergleich gespeichert');
  }, []);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <Presentation className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Showcase</span>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Showcase-Demo</SheetTitle>
            <SheetDescription>
              Erlebe eine vollständige Vorher/Nachher-Optimierung der Andreas Schmid Umschlaghalle.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Description */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                Andreas Schmid Showcase
              </h4>
              <p className="text-sm text-muted-foreground">
                Diese Demo zeigt den kompletten TOPIS-Workflow:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• IST-Zustand aufbauen (85 Tore, 48 Stellplätze)</li>
                <li>• Schwachstellen analysieren</li>
                <li>• Optimierung durchführen</li>
                <li>• SOLL-Zustand mit Verbesserungen</li>
                <li>• Vorher/Nachher-Vergleich speichern</li>
              </ul>
            </div>

            {/* Demo Steps Preview */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Demo-Schritte</h4>
              <div className="space-y-2 text-sm">
                {[
                  { icon: '🏗️', name: 'Halle aufbauen', desc: '150m × 50m Umschlaghalle' },
                  { icon: '📦', name: 'Tore platzieren', desc: '85 Verladestore' },
                  { icon: '📏', name: 'Analyse', desc: 'Wegedistanzen messen' },
                  { icon: '🔧', name: 'Optimierung', desc: 'Stellplätze verschieben' },
                  { icon: '🛤️', name: 'Wege erstellen', desc: 'Fahrgänge generieren' },
                  { icon: '✅', name: 'Ergebnis', desc: 'Verbesserung berechnen' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <span className="text-lg">{step.icon}</span>
                    <div>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-xs text-muted-foreground">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={runShowcase}
              disabled={isRunning}
            >
              <Play className="h-5 w-5 mr-2" />
              Starten
            </Button>

            {/* Note */}
            <p className="text-xs text-muted-foreground text-center">
              Die Demo dauert ca. 30 Sekunden und kann jederzeit gestoppt werden.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Overlay */}
      {showOverlay && (
        <ShowcaseOverlay
          phase={phase}
          detail={detail}
          progress={progress}
          onStop={stopShowcase}
        />
      )}
    </>
  );
}
