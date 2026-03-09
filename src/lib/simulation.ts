import { FFZ, TopisObject, Gang } from '@/types/topis';
import { findPathBetweenObjects, PathResult } from './pathfinding';

// Simulation vehicle state
export interface SimulationVehicle {
  id: number;
  ffz: FFZ;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  path: { x: number; y: number }[];
  pathIndex: number;
  state: 'idle' | 'moving' | 'loading' | 'unloading';
  loadedPallet: boolean;
  currentTask: SimulationTask | null;
}

// Simulation task
export interface SimulationTask {
  id: number;
  from: TopisObject;
  to: TopisObject;
  priority: number;
}

// Simulation state
export interface SimulationState {
  isRunning: boolean;
  speed: number; // multiplier (1 = real-time)
  time: number; // elapsed simulation time in seconds
  vehicles: SimulationVehicle[];
  tasks: SimulationTask[];
  completedTasks: number;
  totalDistance: number;
}

// Initial simulation state
export const createInitialSimulationState = (): SimulationState => ({
  isRunning: false,
  speed: 1,
  time: 0,
  vehicles: [],
  tasks: [],
  completedTasks: 0,
  totalDistance: 0,
});

// Create a vehicle for simulation
export function createSimulationVehicle(
  id: number,
  ffz: FFZ,
  startX: number,
  startY: number
): SimulationVehicle {
  return {
    id,
    ffz,
    x: startX,
    y: startY,
    targetX: startX,
    targetY: startY,
    path: [],
    pathIndex: 0,
    state: 'idle',
    loadedPallet: false,
    currentTask: null,
  };
}

// Create a task
export function createSimulationTask(
  id: number,
  from: TopisObject,
  to: TopisObject,
  priority: number = 1
): SimulationTask {
  return { id, from, to, priority };
}

// Assign task to vehicle
export function assignTaskToVehicle(
  vehicle: SimulationVehicle,
  task: SimulationTask,
  gaenge: Gang[]
): SimulationVehicle {
  // Find path to pickup location
  const pathResult = findPathBetweenObjects(
    { ...task.from, x: vehicle.x, y: vehicle.y, width: 1, height: 1 } as TopisObject,
    task.from,
    gaenge,
    vehicle.ffz
  );

  if (!pathResult) {
    return vehicle;
  }

  return {
    ...vehicle,
    currentTask: task,
    path: pathResult.path,
    pathIndex: 0,
    state: 'moving',
    targetX: task.from.x + task.from.width / 2,
    targetY: task.from.y + task.from.height / 2,
  };
}

// Update vehicle position in simulation
export function updateVehicle(
  vehicle: SimulationVehicle,
  deltaTime: number, // in seconds
  gaenge: Gang[]
): { vehicle: SimulationVehicle; distanceMoved: number; taskCompleted: boolean } {
  let distanceMoved = 0;
  let taskCompleted = false;

  // If idle, do nothing
  if (vehicle.state === 'idle' || vehicle.path.length === 0) {
    return { vehicle, distanceMoved, taskCompleted };
  }

  // If loading/unloading, wait
  if (vehicle.state === 'loading' || vehicle.state === 'unloading') {
    const waitTime = vehicle.state === 'loading'
      ? vehicle.ffz.aufnahmeZeit
      : vehicle.ffz.abgabeZeit;

    // Simplified: complete after wait time
    if (deltaTime >= waitTime) {
      if (vehicle.state === 'loading') {
        // After loading, go to destination
        if (vehicle.currentTask) {
          const pathResult = findPathBetweenObjects(
            vehicle.currentTask.from,
            vehicle.currentTask.to,
            gaenge,
            vehicle.ffz
          );

          if (pathResult) {
            return {
              vehicle: {
                ...vehicle,
                loadedPallet: true,
                state: 'moving',
                path: pathResult.path,
                pathIndex: 0,
                targetX: vehicle.currentTask.to.x + vehicle.currentTask.to.width / 2,
                targetY: vehicle.currentTask.to.y + vehicle.currentTask.to.height / 2,
              },
              distanceMoved: 0,
              taskCompleted: false,
            };
          }
        }
      } else {
        // After unloading, task complete
        return {
          vehicle: {
            ...vehicle,
            loadedPallet: false,
            state: 'idle',
            currentTask: null,
            path: [],
            pathIndex: 0,
          },
          distanceMoved: 0,
          taskCompleted: true,
        };
      }
    }
    return { vehicle, distanceMoved, taskCompleted };
  }

  // Moving state
  if (vehicle.state === 'moving' && vehicle.pathIndex < vehicle.path.length) {
    const target = vehicle.path[vehicle.pathIndex];
    const dx = target.x - vehicle.x;
    const dy = target.y - vehicle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate speed in m/s
    const speedMs = (vehicle.ffz.geschwindigkeit * 1000) / 3600;
    const moveDistance = speedMs * deltaTime;

    if (distance <= moveDistance) {
      // Reached waypoint
      distanceMoved += distance;
      vehicle = {
        ...vehicle,
        x: target.x,
        y: target.y,
        pathIndex: vehicle.pathIndex + 1,
      };

      // Check if reached end of path
      if (vehicle.pathIndex >= vehicle.path.length) {
        // Reached destination
        if (!vehicle.loadedPallet && vehicle.currentTask) {
          // At pickup location, start loading
          return {
            vehicle: { ...vehicle, state: 'loading' },
            distanceMoved,
            taskCompleted,
          };
        } else if (vehicle.loadedPallet) {
          // At delivery location, start unloading
          return {
            vehicle: { ...vehicle, state: 'unloading' },
            distanceMoved,
            taskCompleted,
          };
        }
      }
    } else {
      // Move towards target
      const ratio = moveDistance / distance;
      vehicle = {
        ...vehicle,
        x: vehicle.x + dx * ratio,
        y: vehicle.y + dy * ratio,
      };
      distanceMoved += moveDistance;
    }
  }

  return { vehicle, distanceMoved, taskCompleted };
}

// Generate random tasks between objects
export function generateRandomTasks(
  objects: TopisObject[],
  count: number
): SimulationTask[] {
  const stellplaetze = objects.filter(o => o.type === 'stellplatz');
  const tore = objects.filter(o => o.type === 'tor');

  if (stellplaetze.length === 0 || tore.length === 0) {
    return [];
  }

  const tasks: SimulationTask[] = [];

  for (let i = 0; i < count; i++) {
    // Random from gate to stellplatz or stellplatz to gate
    const isInbound = Math.random() > 0.5;
    const from = isInbound
      ? tore[Math.floor(Math.random() * tore.length)]
      : stellplaetze[Math.floor(Math.random() * stellplaetze.length)];
    const to = isInbound
      ? stellplaetze[Math.floor(Math.random() * stellplaetze.length)]
      : tore[Math.floor(Math.random() * tore.length)];

    tasks.push(createSimulationTask(i + 1, from, to, 1));
  }

  return tasks;
}

// Calculate simulation statistics
export function calculateSimulationStats(state: SimulationState): {
  avgDistancePerTask: number;
  avgTimePerTask: number;
  throughput: number; // tasks per hour
  utilization: number; // percentage
} {
  const avgDistancePerTask = state.completedTasks > 0
    ? state.totalDistance / state.completedTasks
    : 0;

  const avgTimePerTask = state.completedTasks > 0 && state.time > 0
    ? state.time / state.completedTasks
    : 0;

  const throughput = state.time > 0
    ? (state.completedTasks / state.time) * 3600
    : 0;

  const busyVehicles = state.vehicles.filter(v => v.state !== 'idle').length;
  const utilization = state.vehicles.length > 0
    ? (busyVehicles / state.vehicles.length) * 100
    : 0;

  return { avgDistancePerTask, avgTimePerTask, throughput, utilization };
}
