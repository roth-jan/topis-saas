'use client';

import { useState, useMemo } from 'react';
import { useTopisStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid3X3, Download, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { exportMatrixCSV } from '@/lib/export';
import { findPathBetweenObjects } from '@/lib/pathfinding';

interface MatrixResult {
  from: string;
  to: string;
  fromId: number;
  toId: number;
  dist: number;
  time: number;
  pathFound: boolean;
}

export function MatrixDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStart, setSelectedStart] = useState<Set<number>>(new Set());
  const [selectedEnd, setSelectedEnd] = useState<Set<number>>(new Set());
  const [usePathfinding, setUsePathfinding] = useState(true);
  const [results, setResults] = useState<MatrixResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const objects = useTopisStore((s) => s.objects);
  const gaenge = useTopisStore((s) => s.gaenge);
  const ffz = useTopisStore((s) => s.ffz);

  // Filter waypoints (Tore and Stellplätze)
  const waypoints = useMemo(() =>
    objects.filter(o => o.type === 'tor' || o.type === 'stellplatz'),
    [objects]
  );

  // Initialize selected when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      const allIds = new Set(waypoints.map(w => w.id));
      setSelectedStart(allIds);
      setSelectedEnd(allIds);
      setResults([]);
    }
    setIsOpen(open);
  };

  const toggleStart = (id: number) => {
    const newSet = new Set(selectedStart);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStart(newSet);
  };

  const toggleEnd = (id: number) => {
    const newSet = new Set(selectedEnd);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedEnd(newSet);
  };

  const selectAllStart = () => setSelectedStart(new Set(waypoints.map(w => w.id)));
  const selectNoneStart = () => setSelectedStart(new Set());
  const selectAllEnd = () => setSelectedEnd(new Set(waypoints.map(w => w.id)));
  const selectNoneEnd = () => setSelectedEnd(new Set());

  const calculateMatrix = () => {
    setIsCalculating(true);
    const newResults: MatrixResult[] = [];
    const currentFFZ = ffz.length > 0 ? ffz[0] : undefined;

    selectedStart.forEach(startId => {
      selectedEnd.forEach(endId => {
        if (startId !== endId) {
          const start = objects.find(o => o.id === startId);
          const end = objects.find(o => o.id === endId);

          if (start && end) {
            let dist: number;
            let time: number;
            let pathFound = true;

            if (usePathfinding && gaenge.length > 0) {
              const result = findPathBetweenObjects(start, end, gaenge, currentFFZ);
              if (result) {
                dist = result.distance;
                time = result.time;
              } else {
                // Fallback to direct distance
                const sx = start.x + start.width / 2;
                const sy = start.y + start.height / 2;
                const ex = end.x + end.width / 2;
                const ey = end.y + end.height / 2;
                dist = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));
                time = dist / 3.33; // ~12 km/h = 3.33 m/s
                pathFound = false;
              }
            } else {
              // Direct distance
              const sx = start.x + start.width / 2;
              const sy = start.y + start.height / 2;
              const ex = end.x + end.width / 2;
              const ey = end.y + end.height / 2;
              dist = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));
              time = dist / 3.33;
            }

            newResults.push({
              from: start.name,
              to: end.name,
              fromId: startId,
              toId: endId,
              dist,
              time,
              pathFound
            });
          }
        }
      });
    });

    setResults(newResults);
    setIsCalculating(false);

    if (newResults.length === 0) {
      toast.info('Keine Verbindungen zum Berechnen');
    } else {
      toast.success(`${newResults.length} Verbindungen berechnet`);
    }
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast.error('Bitte zuerst Matrix berechnen');
      return;
    }
    exportMatrixCSV(results);
    toast.success('Matrix als CSV exportiert');
  };

  // Statistics
  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const distances = results.map(r => r.dist);
    const times = results.map(r => r.time);
    return {
      avgDist: distances.reduce((a, b) => a + b, 0) / distances.length,
      maxDist: Math.max(...distances),
      minDist: Math.min(...distances),
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      withPath: results.filter(r => r.pathFound).length,
      total: results.length
    };
  }, [results]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Grid3X3 className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Matrix</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Distanz-Matrix</DialogTitle>
          <DialogDescription>
            Berechne Distanzen und Zeiten zwischen Toren und Stellplätzen.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Start Points */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium">Startpunkte</Label>
              <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={selectAllStart}>Alle</Button>
                <Button variant="ghost" size="sm" onClick={selectNoneStart}>Keine</Button>
              </div>
            </div>
            <ScrollArea className="h-48 border rounded-md p-2">
              {waypoints.map(wp => (
                <div key={wp.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`start-${wp.id}`}
                    checked={selectedStart.has(wp.id)}
                    onCheckedChange={() => toggleStart(wp.id)}
                  />
                  <label htmlFor={`start-${wp.id}`} className="text-sm cursor-pointer">
                    {wp.name} <span className="text-muted-foreground">({wp.type})</span>
                  </label>
                </div>
              ))}
              {waypoints.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">Keine Tore oder Stellplätze vorhanden</p>
              )}
            </ScrollArea>
          </div>

          {/* End Points */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium">Endpunkte</Label>
              <div className="space-x-2">
                <Button variant="ghost" size="sm" onClick={selectAllEnd}>Alle</Button>
                <Button variant="ghost" size="sm" onClick={selectNoneEnd}>Keine</Button>
              </div>
            </div>
            <ScrollArea className="h-48 border rounded-md p-2">
              {waypoints.map(wp => (
                <div key={wp.id} className="flex items-center space-x-2 py-1">
                  <Checkbox
                    id={`end-${wp.id}`}
                    checked={selectedEnd.has(wp.id)}
                    onCheckedChange={() => toggleEnd(wp.id)}
                  />
                  <label htmlFor={`end-${wp.id}`} className="text-sm cursor-pointer">
                    {wp.name} <span className="text-muted-foreground">({wp.type})</span>
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center space-x-2 py-2">
          <Switch
            id="pathfinding"
            checked={usePathfinding}
            onCheckedChange={setUsePathfinding}
          />
          <Label htmlFor="pathfinding">Pathfinding nutzen (über Gänge)</Label>
        </div>

        {/* Calculate Button */}
        <Button onClick={calculateMatrix} disabled={isCalculating || selectedStart.size === 0 || selectedEnd.size === 0}>
          <Calculator className="h-4 w-4 mr-2" />
          {isCalculating ? 'Berechne...' : 'Matrix berechnen'}
        </Button>

        {/* Results */}
        {results.length > 0 && (
          <>
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-4 gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                <div>
                  <div className="text-muted-foreground">Ø Distanz</div>
                  <div className="font-medium">{stats.avgDist.toFixed(1)} m</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Max Distanz</div>
                  <div className="font-medium">{stats.maxDist.toFixed(1)} m</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Ø Zeit</div>
                  <div className="font-medium">{stats.avgTime.toFixed(1)} s</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Verbindungen</div>
                  <div className="font-medium">{stats.withPath}/{stats.total} mit Weg</div>
                </div>
              </div>
            )}

            {/* Table */}
            <ScrollArea className="h-48 border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Von</th>
                    <th className="p-2 text-left">Nach</th>
                    <th className="p-2 text-right">Meter</th>
                    <th className="p-2 text-right">Sekunden</th>
                    <th className="p-2 text-center">Weg</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{r.from}</td>
                      <td className="p-2">{r.to}</td>
                      <td className="p-2 text-right">{r.dist.toFixed(1)}</td>
                      <td className="p-2 text-right">{r.time.toFixed(1)}</td>
                      <td className="p-2 text-center">{r.pathFound ? '✓' : '⚠️'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Schließen
          </Button>
          <Button onClick={handleExport} disabled={results.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            CSV Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
