'use client';

import { useState } from 'react';
import { useTopisStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Target, Download, BarChart3, Camera, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProjektSnapshot } from '@/types/topis';
import { calculateTotalGangLength } from '@/lib/gang-generator';
import { calculateRouteDistance } from '@/lib/pathfinding';

export function ProjektVergleichDialog() {
  const halls = useTopisStore((s) => s.halls);
  const activeHallId = useTopisStore((s) => s.activeHallId);
  const objects = useTopisStore((s) => s.objects);
  const paths = useTopisStore((s) => s.paths);
  const pathAreas = useTopisStore((s) => s.pathAreas);
  const gaenge = useTopisStore((s) => s.gaenge);
  const ffz = useTopisStore((s) => s.ffz);
  const conveyors = useTopisStore((s) => s.conveyors);
  const projektVergleich = useTopisStore((s) => s.projektVergleich);
  const saveVorher = useTopisStore((s) => s.saveVorher);
  const saveNachher = useTopisStore((s) => s.saveNachher);
  const loadSnapshot = useTopisStore((s) => s.loadSnapshot);

  const [isOpen, setIsOpen] = useState(false);

  // Calculate metrics
  const calculateMetrics = () => {
    const totalGangLength = calculateTotalGangLength(gaenge);
    const stellplaetze = objects.filter(o => o.type === 'stellplatz');

    // Calculate a sample route distance (if we have at least 2 stellplätze)
    let avgDistance = 0;
    if (stellplaetze.length >= 2 && gaenge.length > 0) {
      const routeResult = calculateRouteDistance(stellplaetze.slice(0, 5), gaenge, ffz[0]);
      avgDistance = routeResult.totalDistance / Math.max(1, stellplaetze.length - 1);
    }

    // Calculate process time estimate (simplified)
    const processTime = avgDistance * 2 + objects.length * 5; // seconds

    return { avgDistance, processTime, gangLength: totalGangLength };
  };

  // Create snapshot from current state
  const createSnapshot = (): ProjektSnapshot => {
    const metrics = calculateMetrics();
    return {
      halls: JSON.parse(JSON.stringify(halls)),
      objects: JSON.parse(JSON.stringify(objects)),
      paths: JSON.parse(JSON.stringify(paths)),
      pathAreas: JSON.parse(JSON.stringify(pathAreas)),
      gaenge: JSON.parse(JSON.stringify(gaenge)),
      ffz: JSON.parse(JSON.stringify(ffz)),
      conveyors: JSON.parse(JSON.stringify(conveyors)),
      avgDistanz: metrics.avgDistance,
      prozesszeit: metrics.processTime,
      timestamp: new Date().toISOString(),
    };
  };

  // Capture canvas screenshot
  const captureScreenshot = (): string => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  // Handle save Vorher
  const handleSaveVorher = () => {
    const snapshot = createSnapshot();
    const screenshot = captureScreenshot();
    saveVorher(snapshot, screenshot);
    toast.success('Vorher-Zustand gespeichert');
  };

  // Handle save Nachher
  const handleSaveNachher = () => {
    const snapshot = createSnapshot();
    const screenshot = captureScreenshot();
    saveNachher(snapshot, screenshot);
    toast.success('Nachher-Zustand gespeichert');
  };

  // Handle load snapshot
  const handleLoadSnapshot = (type: 'vorher' | 'nachher') => {
    if (confirm(`Aktuellen Zustand durch "${type === 'vorher' ? 'Vorher' : 'Nachher'}" ersetzen?`)) {
      loadSnapshot(type);
      toast.success(`${type === 'vorher' ? 'Vorher' : 'Nachher'}-Zustand geladen`);
    }
  };

  // Calculate comparison metrics
  const calculateComparison = () => {
    const vorher = projektVergleich.vorher;
    const nachher = projektVergleich.nachher;

    if (!vorher || !nachher) {
      return { distanzVerbesserung: 0, zeitVerbesserung: 0, produktivitaet: 0 };
    }

    const distanzVerbesserung = vorher.avgDistanz > 0
      ? ((vorher.avgDistanz - nachher.avgDistanz) / vorher.avgDistanz) * 100
      : 0;

    const zeitVerbesserung = vorher.prozesszeit > 0
      ? ((vorher.prozesszeit - nachher.prozesszeit) / vorher.prozesszeit) * 100
      : 0;

    // Productivity improvement is inverse of time improvement
    const produktivitaet = zeitVerbesserung > 0 ? zeitVerbesserung * 0.65 : 0;

    return { distanzVerbesserung, zeitVerbesserung, produktivitaet };
  };

  const comparison = calculateComparison();
  const hasVorher = !!projektVergleich.vorher;
  const hasNachher = !!projektVergleich.nachher;
  const canCompare = hasVorher && hasNachher;

  // Format improvement value
  const formatImprovement = (value: number) => {
    if (value === 0) return '-';
    const sign = value > 0 ? '-' : '+';
    return `${sign}${Math.abs(value).toFixed(0)}%`;
  };

  // Export comparison report
  const exportReport = () => {
    if (!canCompare) {
      toast.error('Speichere erst Vorher und Nachher Zustände');
      return;
    }

    const report = {
      title: 'TOPIS Projekt-Vergleich',
      generatedAt: new Date().toISOString(),
      vorher: {
        timestamp: projektVergleich.vorher?.timestamp,
        objektCount: projektVergleich.vorher?.objects.length,
        gangCount: projektVergleich.vorher?.gaenge.length,
        avgDistanz: projektVergleich.vorher?.avgDistanz.toFixed(1) + 'm',
        prozesszeit: projektVergleich.vorher?.prozesszeit.toFixed(0) + 's',
      },
      nachher: {
        timestamp: projektVergleich.nachher?.timestamp,
        objektCount: projektVergleich.nachher?.objects.length,
        gangCount: projektVergleich.nachher?.gaenge.length,
        avgDistanz: projektVergleich.nachher?.avgDistanz.toFixed(1) + 'm',
        prozesszeit: projektVergleich.nachher?.prozesszeit.toFixed(0) + 's',
      },
      verbesserung: {
        distanz: comparison.distanzVerbesserung.toFixed(1) + '%',
        prozesszeit: comparison.zeitVerbesserung.toFixed(1) + '%',
        produktivitaet: comparison.produktivitaet.toFixed(1) + '%',
      }
    };

    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'topis-vergleich-bericht.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Bericht exportiert');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Target className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Projekt</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Projekt-Vergleich</DialogTitle>
          <DialogDescription>
            Speichere Vorher/Nachher-Zustände und vergleiche die Optimierungen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Vorher */}
          <div className="border rounded-lg p-4 text-center">
            <h4 className="font-medium mb-2">Vorher</h4>
            <div className="aspect-video bg-muted rounded flex items-center justify-center text-muted-foreground overflow-hidden">
              {projektVergleich.vorherScreenshot ? (
                <img
                  src={projektVergleich.vorherScreenshot}
                  alt="Vorher"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">Kein Screenshot</span>
              )}
            </div>
            {hasVorher && (
              <div className="text-xs text-muted-foreground mt-2">
                {projektVergleich.vorher?.objects.length} Objekte |{' '}
                {projektVergleich.vorher?.avgDistanz.toFixed(1)}m avg
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Button className="flex-1" variant="outline" size="sm" onClick={handleSaveVorher}>
                <Camera className="h-4 w-4 mr-1" />
                Speichern
              </Button>
              {hasVorher && (
                <Button variant="ghost" size="sm" onClick={() => handleLoadSnapshot('vorher')}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Nachher */}
          <div className="border rounded-lg p-4 text-center">
            <h4 className="font-medium mb-2">Nachher</h4>
            <div className="aspect-video bg-muted rounded flex items-center justify-center text-muted-foreground overflow-hidden">
              {projektVergleich.nachherScreenshot ? (
                <img
                  src={projektVergleich.nachherScreenshot}
                  alt="Nachher"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm">Kein Screenshot</span>
              )}
            </div>
            {hasNachher && (
              <div className="text-xs text-muted-foreground mt-2">
                {projektVergleich.nachher?.objects.length} Objekte |{' '}
                {projektVergleich.nachher?.avgDistanz.toFixed(1)}m avg
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Button className="flex-1" variant="outline" size="sm" onClick={handleSaveNachher}>
                <Camera className="h-4 w-4 mr-1" />
                Speichern
              </Button>
              {hasNachher && (
                <Button variant="ghost" size="sm" onClick={() => handleLoadSnapshot('nachher')}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Metrics */}
        <div className="bg-muted rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Verbesserung
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${canCompare && comparison.distanzVerbesserung > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                {canCompare ? formatImprovement(comparison.distanzVerbesserung) : '-'}
              </div>
              <div className="text-xs text-muted-foreground">Wegstrecke</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${canCompare && comparison.zeitVerbesserung > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                {canCompare ? formatImprovement(comparison.zeitVerbesserung) : '-'}
              </div>
              <div className="text-xs text-muted-foreground">Prozesszeit</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${canCompare && comparison.produktivitaet > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                {canCompare ? `+${comparison.produktivitaet.toFixed(0)}%` : '-'}
              </div>
              <div className="text-xs text-muted-foreground">Produktivität</div>
            </div>
          </div>
          {!canCompare && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              Speichere Vorher und Nachher um den Vergleich zu sehen
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Schließen
          </Button>
          <Button onClick={exportReport} disabled={!canCompare}>
            <Download className="mr-2 h-4 w-4" />
            Bericht exportieren
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
