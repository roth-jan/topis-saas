'use client';

import { useMemo } from 'react';
import { useTopisStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Route,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  Ruler,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Path } from '@/types/topis';

// Calculate total path length
function calculatePathLength(waypoints: { x: number; y: number }[]): number {
  if (waypoints.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dx = waypoints[i + 1].x - waypoints[i].x;
    const dy = waypoints[i + 1].y - waypoints[i].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

// Calculate time based on speed (m/s)
function calculateTime(distanceM: number, speedKmh: number): number {
  const speedMs = speedKmh * 1000 / 3600; // Convert km/h to m/s
  return distanceM / speedMs;
}

// Format time as mm:ss or seconds
function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
}

export function PathPanel() {
  const paths = useTopisStore((s) => s.paths);
  const selectedPath = useTopisStore((s) => s.selectedPath);
  const selectPath = useTopisStore((s) => s.selectPath);
  const deletePath = useTopisStore((s) => s.deletePath);
  const ffz = useTopisStore((s) => s.ffz);

  const [isListOpen, setIsListOpen] = useState(true);

  // Get default FFZ speed or fallback
  const defaultSpeed = ffz.length > 0 ? ffz[0].geschwindigkeit : 12; // km/h

  // Calculate stats for selected path
  const selectedStats = useMemo(() => {
    if (!selectedPath) return null;
    const length = calculatePathLength(selectedPath.waypoints);
    const time = calculateTime(length, defaultSpeed);
    return { length, time };
  }, [selectedPath, defaultSpeed]);

  // Calculate total stats
  const totalStats = useMemo(() => {
    const totalLength = paths.reduce((sum, p) => sum + calculatePathLength(p.waypoints), 0);
    const totalTime = calculateTime(totalLength, defaultSpeed);
    return { totalLength, totalTime, count: paths.length };
  }, [paths, defaultSpeed]);

  const handleDeletePath = (id: number) => {
    deletePath(id);
    if (selectedPath?.id === id) {
      selectPath(null);
    }
    toast.success('Weg gelöscht');
  };

  const handleSelectPath = (path: Path) => {
    selectPath(path);
  };

  const handleDeleteAll = () => {
    if (paths.length === 0) return;
    if (confirm(`Alle ${paths.length} Wege löschen?`)) {
      paths.forEach(p => deletePath(p.id));
      selectPath(null);
      toast.success('Alle Wege gelöscht');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Route className="h-4 w-4" />
          Gezeichnete Wege
        </CardTitle>
        <CardDescription className="text-xs">
          {totalStats.count} Wege | {totalStats.totalLength.toFixed(1)}m gesamt | {formatTime(totalStats.totalTime)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Selected Path Details */}
        {selectedPath && selectedStats && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{selectedPath.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDeletePath(selectedPath.id)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>

            {/* Linked Objects */}
            {(selectedPath.startObjectName || selectedPath.endObjectName) && (
              <div className="flex items-center gap-1 text-xs bg-background/50 rounded px-2 py-1">
                <span className="text-green-500">●</span>
                <span>{selectedPath.startObjectName || '?'}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-red-500">●</span>
                <span>{selectedPath.endObjectName || '?'}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Ruler className="h-3 w-3 text-muted-foreground" />
                <span>{selectedStats.length.toFixed(1)} m</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{formatTime(selectedStats.time)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span>{selectedPath.waypoints.length} Punkte</span>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground">
              Geschwindigkeit: {defaultSpeed} km/h (FFZ)
            </div>
          </div>
        )}

        {!selectedPath && paths.length > 0 && (
          <div className="text-xs text-muted-foreground text-center py-2 bg-muted/50 rounded">
            Klicke auf einen Weg um Details zu sehen
          </div>
        )}

        <Separator />

        {/* Path List */}
        <Collapsible open={isListOpen} onOpenChange={setIsListOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 p-2 h-auto">
              {isListOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Route className="h-4 w-4" />
              Weg-Liste ({paths.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {paths.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Keine Wege gezeichnet.<br />
                Nutze das Weg-Tool um Wege zu zeichnen.
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {paths.map((path) => {
                    const length = calculatePathLength(path.waypoints);
                    const time = calculateTime(length, defaultSpeed);
                    const isSelected = selectedPath?.id === path.id;

                    return (
                      <div
                        key={path.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer group transition-colors ${
                          isSelected ? 'bg-primary/20 border border-primary/30' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleSelectPath(path)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: path.color || '#f59e0b' }}
                          />
                          <div>
                            <p className="text-xs font-medium">{path.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {length.toFixed(1)}m | {formatTime(time)} | {path.waypoints.length} Punkte
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePath(path.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {paths.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleDeleteAll}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Alle löschen
              </Button>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
