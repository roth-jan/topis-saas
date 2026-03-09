'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTopisStore, useActiveHall, useObjects } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Truck,
  Clock,
  Route,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  SimulationState,
  SimulationVehicle,
  createInitialSimulationState,
  createSimulationVehicle,
  generateRandomTasks,
  assignTaskToVehicle,
  updateVehicle,
  calculateSimulationStats,
} from '@/lib/simulation';

export function SimulationPanel() {
  const objects = useObjects();
  const gaenge = useTopisStore((s) => s.gaenge);
  const ffz = useTopisStore((s) => s.ffz);

  const [simulation, setSimulation] = useState<SimulationState>(createInitialSimulationState);
  const [selectedFFZ, setSelectedFFZ] = useState<string>('1');
  const [vehicleCount, setVehicleCount] = useState(1);
  const [taskCount, setTaskCount] = useState(10);

  // Initialize simulation
  const initializeSimulation = useCallback(() => {
    const selectedVehicle = ffz.find(f => f.id.toString() === selectedFFZ) || ffz[0];
    const stellplaetze = objects.filter(o => o.type === 'stellplatz');
    const startPosition = stellplaetze.length > 0
      ? { x: stellplaetze[0].x + stellplaetze[0].width / 2, y: stellplaetze[0].y + stellplaetze[0].height / 2 }
      : { x: 10, y: 25 };

    // Create vehicles
    const vehicles: SimulationVehicle[] = [];
    for (let i = 0; i < vehicleCount; i++) {
      vehicles.push(createSimulationVehicle(
        i + 1,
        selectedVehicle,
        startPosition.x + i * 5,
        startPosition.y
      ));
    }

    // Generate tasks
    const tasks = generateRandomTasks(objects, taskCount);

    setSimulation({
      ...createInitialSimulationState(),
      vehicles,
      tasks,
    });

    toast.success(`Simulation initialisiert: ${vehicleCount} Fahrzeug(e), ${tasks.length} Aufträge`);
  }, [ffz, selectedFFZ, objects, vehicleCount, taskCount]);

  // Start simulation
  const startSimulation = () => {
    if (gaenge.length === 0) {
      toast.error('Keine Gänge vorhanden. Generiere zuerst Fahrgänge.');
      return;
    }

    if (simulation.vehicles.length === 0) {
      initializeSimulation();
    }

    setSimulation(prev => ({ ...prev, isRunning: true }));
    toast.info('Simulation gestartet');
  };

  // Pause simulation
  const pauseSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: false }));
  };

  // Stop simulation
  const stopSimulation = () => {
    setSimulation(createInitialSimulationState());
  };

  // Reset simulation
  const resetSimulation = () => {
    initializeSimulation();
  };

  // Simulation loop
  useEffect(() => {
    if (!simulation.isRunning) return;

    const interval = setInterval(() => {
      setSimulation(prev => {
        if (!prev.isRunning) return prev;

        const deltaTime = 0.1 * prev.speed; // 100ms * speed multiplier
        let newTotalDistance = prev.totalDistance;
        let newCompletedTasks = prev.completedTasks;

        // Update vehicles
        const newVehicles = prev.vehicles.map(vehicle => {
          // If idle and tasks available, assign task
          if (vehicle.state === 'idle' && prev.tasks.length > 0) {
            const task = prev.tasks[0];
            const assigned = assignTaskToVehicle(vehicle, task, gaenge);
            return assigned;
          }

          // Update movement
          const result = updateVehicle(vehicle, deltaTime, gaenge);
          newTotalDistance += result.distanceMoved;
          if (result.taskCompleted) {
            newCompletedTasks++;
          }
          return result.vehicle;
        });

        // Remove assigned tasks
        const assignedTaskIds = new Set(newVehicles
          .filter(v => v.currentTask)
          .map(v => v.currentTask!.id));
        const newTasks = prev.tasks.filter(t => !assignedTaskIds.has(t.id));

        return {
          ...prev,
          time: prev.time + deltaTime,
          vehicles: newVehicles,
          tasks: newTasks,
          totalDistance: newTotalDistance,
          completedTasks: newCompletedTasks,
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [simulation.isRunning, gaenge]);

  const stats = calculateSimulationStats(simulation);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Control Panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* FFZ Selection */}
            <div className="space-y-2">
              <Label className="text-xs">Fahrzeugtyp</Label>
              <Select value={selectedFFZ} onValueChange={setSelectedFFZ}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ffz.map(f => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.name} ({f.geschwindigkeit} km/h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Count */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Fahrzeuge</Label>
                <span className="text-xs text-muted-foreground">{vehicleCount}</span>
              </div>
              <Slider
                value={[vehicleCount]}
                onValueChange={([v]) => setVehicleCount(v)}
                min={1}
                max={5}
                step={1}
              />
            </div>

            {/* Task Count */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Aufträge</Label>
                <span className="text-xs text-muted-foreground">{taskCount}</span>
              </div>
              <Slider
                value={[taskCount]}
                onValueChange={([v]) => setTaskCount(v)}
                min={5}
                max={50}
                step={5}
              />
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Geschwindigkeit</Label>
                <span className="text-xs text-muted-foreground">{simulation.speed}x</span>
              </div>
              <Slider
                value={[simulation.speed]}
                onValueChange={([v]) => setSimulation(prev => ({ ...prev, speed: v }))}
                min={0.5}
                max={10}
                step={0.5}
              />
            </div>

            <Separator />

            {/* Control Buttons */}
            <div className="flex gap-2">
              {!simulation.isRunning ? (
                <Button className="flex-1" size="sm" onClick={startSimulation}>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              ) : (
                <Button className="flex-1" size="sm" variant="secondary" onClick={pauseSimulation}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={stopSimulation}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Zeit</span>
              <span>{Math.floor(simulation.time)}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Offene Aufträge</span>
              <Badge variant="secondary">{simulation.tasks.length}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Abgeschlossen</span>
              <Badge variant="default">{simulation.completedTasks}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Statistik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gesamtstrecke</span>
              <span>{simulation.totalDistance.toFixed(0)} m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ø Strecke/Auftrag</span>
              <span>{stats.avgDistancePerTask.toFixed(1)} m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ø Zeit/Auftrag</span>
              <span>{stats.avgTimePerTask.toFixed(0)} s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durchsatz</span>
              <span>{stats.throughput.toFixed(1)}/h</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Auslastung</span>
              <span>{stats.utilization.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles */}
        {simulation.vehicles.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fahrzeuge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {simulation.vehicles.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">#{vehicle.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        vehicle.state === 'idle' ? 'secondary' :
                        vehicle.state === 'moving' ? 'default' : 'outline'
                      }>
                        {vehicle.state === 'idle' ? 'Wartet' :
                         vehicle.state === 'moving' ? 'Fährt' :
                         vehicle.state === 'loading' ? 'Lädt' : 'Entlädt'}
                      </Badge>
                      {vehicle.loadedPallet && (
                        <Badge variant="outline">Beladen</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
