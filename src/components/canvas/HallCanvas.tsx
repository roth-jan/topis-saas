'use client';

import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useTopisStore, useActiveHall, useObjects, useZoom, usePan, useTool } from '@/lib/store';
import { SCALE, TopisObject, ObjectType, OBJECT_COLORS, OBJECT_DEFAULTS, Gang } from '@/types/topis';
import { toast } from 'sonner';

export function HallCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hall = useActiveHall();
  const objects = useObjects();
  const zoom = useZoom();
  const pan = usePan();
  const tool = useTool();
  const gaenge = useTopisStore((s) => s.gaenge);
  const showGaenge = useTopisStore((s) => s.showGaenge);
  const showGrid = useTopisStore((s) => s.showGrid);
  const selectedObject = useTopisStore((s) => s.selectedObject);
  const paths = useTopisStore((s) => s.paths);
  const pathAreas = useTopisStore((s) => s.pathAreas);
  const conveyors = useTopisStore((s) => s.conveyors);
  const addPath = useTopisStore((s) => s.addPath);
  const updatePath = useTopisStore((s) => s.updatePath);
  const deletePath = useTopisStore((s) => s.deletePath);
  const selectPath = useTopisStore((s) => s.selectPath);
  const selectedPath = useTopisStore((s) => s.selectedPath);
  const addPathArea = useTopisStore((s) => s.addPathArea);
  const addConveyor = useTopisStore((s) => s.addConveyor);

  const setZoom = useTopisStore((s) => s.setZoom);
  const setPan = useTopisStore((s) => s.setPan);
  const selectObject = useTopisStore((s) => s.selectObject);
  const updateObject = useTopisStore((s) => s.updateObject);
  const addObject = useTopisStore((s) => s.addObject);
  const addGang = useTopisStore((s) => s.addGang);
  const setTool = useTopisStore((s) => s.setTool);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragObject, setDragObject] = useState<TopisObject | null>(null);

  // Gang drawing state
  const [gangDrawStart, setGangDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [gangMousePos, setGangMousePos] = useState<{ x: number; y: number } | null>(null);

  // Path drawing state
  const [pathDrawing, setPathDrawing] = useState(false);
  const [pathDragStart, setPathDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<{ waypoints: { x: number; y: number; objectId: number | null }[] } | null>(null);
  const [pathMousePos, setPathMousePos] = useState<{ x: number; y: number } | null>(null);

  // PathArea drawing state
  const [pathAreaStart, setPathAreaStart] = useState<{ x: number; y: number } | null>(null);
  const [pathAreaMousePos, setPathAreaMousePos] = useState<{ x: number; y: number } | null>(null);

  // Measure tool state
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{ x: number; y: number } | null>(null);

  // Conveyor drawing state
  const [currentConveyor, setCurrentConveyor] = useState<{ points: { x: number; y: number }[] } | null>(null);
  const [conveyorMousePos, setConveyorMousePos] = useState<{ x: number; y: number } | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    pathId: number;
    waypointIndex?: number; // If clicking on a specific waypoint
  } | null>(null);

  // Selected waypoint index (for highlighting)
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null);

  // Waypoint dragging state
  const [draggingWaypoint, setDraggingWaypoint] = useState<{
    pathId: number;
    waypointIndex: number;
  } | null>(null);

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((x: number, y: number) => ({
    x: x * SCALE * zoom + pan.x,
    y: y * SCALE * zoom + pan.y
  }), [zoom, pan]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((x: number, y: number) => ({
    x: (x - pan.x) / (SCALE * zoom),
    y: (y - pan.y) / (SCALE * zoom)
  }), [zoom, pan]);

  // Find object at position (exact hit)
  const findObjectAt = useCallback((wx: number, wy: number): TopisObject | null => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (wx >= obj.x && wx <= obj.x + obj.width &&
          wy >= obj.y && wy <= obj.y + obj.height) {
        return obj;
      }
    }
    return null;
  }, [objects]);

  // Find nearest object within tolerance (for path endpoint linking)
  const findNearestObject = useCallback((wx: number, wy: number, tolerance: number = 3): TopisObject | null => {
    let nearest: TopisObject | null = null;
    let minDist = tolerance;

    for (const obj of objects) {
      // Check distance to object center
      const centerX = obj.x + obj.width / 2;
      const centerY = obj.y + obj.height / 2;
      const dist = Math.sqrt(Math.pow(wx - centerX, 2) + Math.pow(wy - centerY, 2));

      // Also check if point is inside or very close to object bounds
      const insideOrNear =
        wx >= obj.x - tolerance && wx <= obj.x + obj.width + tolerance &&
        wy >= obj.y - tolerance && wy <= obj.y + obj.height + tolerance;

      if (insideOrNear && dist < minDist) {
        minDist = dist;
        nearest = obj;
      }
    }
    return nearest;
  }, [objects]);

  // Save path with automatic object linking
  const savePathWithLinks = useCallback((waypoints: { x: number; y: number; objectId: number | null }[], color: string = '#f59e0b') => {
    if (waypoints.length < 2) return;

    const firstPoint = waypoints[0];
    const lastPoint = waypoints[waypoints.length - 1];

    // Find objects at start and end
    const startObj = findNearestObject(firstPoint.x, firstPoint.y, 5);
    const endObj = findNearestObject(lastPoint.x, lastPoint.y, 5);

    // Generate name based on linked objects
    let name: string;
    if (startObj && endObj) {
      name = `${startObj.name} → ${endObj.name}`;
    } else if (startObj) {
      name = `${startObj.name} → ...`;
    } else if (endObj) {
      name = `... → ${endObj.name}`;
    } else {
      name = `Weg ${paths.length + 1}`;
    }

    addPath({
      name,
      waypoints,
      color,
      startObjectId: startObj?.id,
      startObjectName: startObj?.name,
      endObjectId: endObj?.id,
      endObjectName: endObj?.name
    });

    // Show detailed toast
    if (startObj || endObj) {
      toast.success(`Weg gespeichert: ${name}`);
    } else {
      toast.success('Weg gespeichert');
    }
  }, [addPath, findNearestObject, paths.length]);

  // Find waypoint at position (returns path and waypoint index)
  const findWaypointAt = useCallback((wx: number, wy: number): { path: typeof paths[0]; waypointIndex: number } | null => {
    const threshold = 2; // 2m click tolerance for waypoints

    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      for (let j = 0; j < path.waypoints.length; j++) {
        const wp = path.waypoints[j];
        const dist = Math.sqrt(Math.pow(wx - wp.x, 2) + Math.pow(wy - wp.y, 2));
        if (dist < threshold) {
          return { path, waypointIndex: j };
        }
      }
    }
    return null;
  }, [paths]);

  // Find path at position (check if click is near any path segment)
  const findPathAt = useCallback((wx: number, wy: number) => {
    const threshold = 1.5; // 1.5m click tolerance

    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      if (path.waypoints.length < 2) continue;

      // Check each segment
      for (let j = 0; j < path.waypoints.length - 1; j++) {
        const p1 = path.waypoints[j];
        const p2 = path.waypoints[j + 1];

        // Calculate distance from point to line segment
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) continue;

        // Project point onto line segment
        const t = Math.max(0, Math.min(1, ((wx - p1.x) * dx + (wy - p1.y) * dy) / lengthSq));
        const projX = p1.x + t * dx;
        const projY = p1.y + t * dy;

        // Distance to projected point
        const dist = Math.sqrt(Math.pow(wx - projX, 2) + Math.pow(wy - projY, 2));

        if (dist < threshold) {
          return path;
        }
      }
    }
    return null;
  }, [paths]);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridPx = 1 * SCALE * zoom;

      for (let x = pan.x % gridPx; x < canvas.width; x += gridPx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = pan.y % gridPx; y < canvas.height; y += gridPx) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw hall
    if (hall) {
      const pos = worldToScreen(0, 0);
      const w = hall.width * SCALE * zoom;
      const h = hall.height * SCALE * zoom;

      // Hall background
      ctx.fillStyle = hall.color || '#16213e';
      ctx.fillRect(pos.x, pos.y, w, h);

      // Hall border
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x, pos.y, w, h);

      // Hall name
      ctx.fillStyle = '#718096';
      ctx.font = `${12 * zoom}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(hall.name, pos.x + w / 2, pos.y - 8);
    }

    // Draw PathAreas (before objects for transparency)
    if (pathAreas.length > 0) {
      pathAreas.forEach(area => {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.2)';
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
        ctx.lineWidth = 2;

        if (area.x !== undefined && area.y !== undefined && area.width !== undefined && area.height !== undefined) {
          // Rectangle format
          const p1 = worldToScreen(area.x, area.y);
          const p2 = worldToScreen(area.x + area.width, area.y + area.height);
          ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
          ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        } else if (area.points && area.points.length >= 3) {
          // Polygon format
          ctx.beginPath();
          const first = worldToScreen(area.points[0].x, area.points[0].y);
          ctx.moveTo(first.x, first.y);
          area.points.slice(1).forEach(p => {
            const sp = worldToScreen(p.x, p.y);
            ctx.lineTo(sp.x, sp.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });
    }

    // Draw PathArea preview
    if (pathAreaStart && pathAreaMousePos) {
      const p1 = worldToScreen(Math.min(pathAreaStart.x, pathAreaMousePos.x), Math.min(pathAreaStart.y, pathAreaMousePos.y));
      const p2 = worldToScreen(Math.max(pathAreaStart.x, pathAreaMousePos.x), Math.max(pathAreaStart.y, pathAreaMousePos.y));
      ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      ctx.fillRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      ctx.setLineDash([]);
    }

    // Draw Gänge
    if (showGaenge && gaenge.length > 0) {
      gaenge.forEach(gang => {
        if (gang.points.length < 2) return;

        const start = worldToScreen(gang.points[0].x, gang.points[0].y);
        const end = worldToScreen(gang.points[1].x, gang.points[1].y);
        const breite = gang.breite * SCALE * zoom;

        ctx.save();
        ctx.strokeStyle = gang.farbe || 'rgba(100, 200, 100, 0.6)';
        ctx.lineWidth = breite;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
      });
    }

    // Draw saved Paths
    paths.forEach(path => {
      if (path.waypoints.length < 2) return;
      const isSelected = selectedPath?.id === path.id;
      ctx.save();

      // Selection highlight (glow effect)
      if (isSelected) {
        ctx.strokeStyle = '#00bcd4';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const first = worldToScreen(path.waypoints[0].x, path.waypoints[0].y);
        ctx.moveTo(first.x, first.y);
        path.waypoints.slice(1).forEach(wp => {
          const p = worldToScreen(wp.x, wp.y);
          ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }

      // Main path line
      ctx.strokeStyle = isSelected ? '#fff' : '#f59e0b';
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const first = worldToScreen(path.waypoints[0].x, path.waypoints[0].y);
      ctx.moveTo(first.x, first.y);
      path.waypoints.slice(1).forEach(wp => {
        const p = worldToScreen(wp.x, wp.y);
        ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      // Draw waypoints
      path.waypoints.forEach((wp, wpIndex) => {
        const p = worldToScreen(wp.x, wp.y);
        const isWaypointSelected = isSelected && selectedWaypointIndex === wpIndex;

        // Waypoint circle
        ctx.fillStyle = isWaypointSelected ? '#ef4444' : (isSelected ? '#00bcd4' : '#f59e0b');
        ctx.beginPath();
        ctx.arc(p.x, p.y, isWaypointSelected ? 8 : (isSelected ? 6 : 4), 0, Math.PI * 2);
        ctx.fill();

        // Border for selected waypoints
        if (isSelected || isWaypointSelected) {
          ctx.strokeStyle = isWaypointSelected ? '#fff' : '#fff';
          ctx.lineWidth = isWaypointSelected ? 3 : 2;
          ctx.stroke();
        }

        // Show waypoint number when path is selected
        if (isSelected) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${wpIndex + 1}`, p.x, p.y);
        }
      });
      ctx.restore();
    });

    // Draw current path being drawn
    if (currentPath && currentPath.waypoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      const first = worldToScreen(currentPath.waypoints[0].x, currentPath.waypoints[0].y);
      ctx.moveTo(first.x, first.y);
      currentPath.waypoints.slice(1).forEach(wp => {
        const p = worldToScreen(wp.x, wp.y);
        ctx.lineTo(p.x, p.y);
      });
      // Draw to mouse position when drawing
      if (pathDrawing && pathMousePos) {
        const mp = worldToScreen(pathMousePos.x, pathMousePos.y);
        ctx.lineTo(mp.x, mp.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw waypoints
      currentPath.waypoints.forEach(wp => {
        const p = worldToScreen(wp.x, wp.y);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Draw preview line for first segment (before currentPath exists)
    if (pathDrawing && pathDragStart && pathMousePos && (!currentPath || currentPath.waypoints.length === 0)) {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.setLineDash([8, 4]);
      const start = worldToScreen(pathDragStart.x, pathDragStart.y);
      const end = worldToScreen(pathMousePos.x, pathMousePos.y);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw start point
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
      ctx.fill();
      // Draw end point preview
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(end.x, end.y, 5, 0, Math.PI * 2);
      ctx.stroke();
      // Show distance
      const dist = Math.sqrt(Math.pow(pathMousePos.x - pathDragStart.x, 2) + Math.pow(pathMousePos.y - pathDragStart.y, 2));
      ctx.fillStyle = '#fff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${dist.toFixed(1)}m`, (start.x + end.x) / 2, (start.y + end.y) / 2 - 10);
      ctx.restore();
    }

    // Draw saved Conveyors
    conveyors.forEach(conveyor => {
      if (conveyor.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = '#06b6d4'; // Cyan for conveyors
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const first = worldToScreen(conveyor.points[0].x, conveyor.points[0].y);
      ctx.moveTo(first.x, first.y);
      conveyor.points.slice(1).forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.lineTo(sp.x, sp.y);
      });
      ctx.stroke();
      // Draw direction arrows
      for (let i = 0; i < conveyor.points.length - 1; i++) {
        const p1 = worldToScreen(conveyor.points[i].x, conveyor.points[i].y);
        const p2 = worldToScreen(conveyor.points[i + 1].x, conveyor.points[i + 1].y);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // Draw endpoints
      conveyor.points.forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    });

    // Draw current conveyor being drawn
    if (currentConveyor && currentConveyor.points.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      const first = worldToScreen(currentConveyor.points[0].x, currentConveyor.points[0].y);
      ctx.moveTo(first.x, first.y);
      currentConveyor.points.slice(1).forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.lineTo(sp.x, sp.y);
      });
      // Draw to mouse position
      if (conveyorMousePos) {
        const mp = worldToScreen(conveyorMousePos.x, conveyorMousePos.y);
        ctx.lineTo(mp.x, mp.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Draw waypoints
      currentConveyor.points.forEach(p => {
        const sp = worldToScreen(p.x, p.y);
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // Draw measure line
    if (measureStart && measureEnd) {
      const s = worldToScreen(measureStart.x, measureStart.y);
      const e = worldToScreen(measureEnd.x, measureEnd.y);
      const dist = Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2));

      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw distance label
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${dist.toFixed(2)} m`, (s.x + e.x) / 2, (s.y + e.y) / 2 - 10);

      // Draw endpoints
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e.x, e.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw objects
    objects.forEach(obj => {
      const pos = worldToScreen(obj.x, obj.y);
      const w = obj.width * SCALE * zoom;
      const h = obj.height * SCALE * zoom;

      ctx.save();

      // Object fill
      const baseColor = obj.color || OBJECT_COLORS[obj.type] || '#666';
      ctx.fillStyle = baseColor;
      ctx.fillRect(pos.x, pos.y, w, h);

      // Object border
      ctx.strokeStyle = selectedObject?.id === obj.id ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = selectedObject?.id === obj.id ? 2 : 1;
      ctx.strokeRect(pos.x, pos.y, w, h);

      // Object label
      if (zoom > 0.5 && obj.name) {
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(9, 11 * zoom)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const label = obj.name.length > 8 ? obj.name.substring(0, 8) + '…' : obj.name;
        ctx.fillText(label, pos.x + w / 2, pos.y + h / 2);
      }

      ctx.restore();
    });

    // Draw selection handles
    if (selectedObject) {
      const pos = worldToScreen(selectedObject.x, selectedObject.y);
      const w = selectedObject.width * SCALE * zoom;
      const h = selectedObject.height * SCALE * zoom;

      ctx.strokeStyle = '#00bcd4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(pos.x - 2, pos.y - 2, w + 4, h + 4);
      ctx.setLineDash([]);

      // Corner handles
      const handleSize = 8;
      ctx.fillStyle = '#00bcd4';
      [[0, 0], [w, 0], [0, h], [w, h]].forEach(([dx, dy]) => {
        ctx.fillRect(pos.x + dx - handleSize / 2, pos.y + dy - handleSize / 2, handleSize, handleSize);
      });
    }

    // Draw gang preview line when drawing
    if (gangDrawStart && gangMousePos) {
      const start = worldToScreen(gangDrawStart.x, gangDrawStart.y);
      const end = worldToScreen(gangMousePos.x, gangMousePos.y);
      const previewWidth = 3 * SCALE * zoom; // Default 3m width

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 200, 100, 0.8)';
      ctx.lineWidth = previewWidth;
      ctx.lineCap = 'round';
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw start point indicator
      ctx.fillStyle = '#64c864';
      ctx.beginPath();
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw end point indicator
      ctx.strokeStyle = '#64c864';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Show distance label
      const dist = Math.sqrt(
        Math.pow(gangMousePos.x - gangDrawStart.x, 2) +
        Math.pow(gangMousePos.y - gangDrawStart.y, 2)
      );
      ctx.fillStyle = '#fff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${dist.toFixed(1)}m`, (start.x + end.x) / 2, (start.y + end.y) / 2 - 15);

      ctx.restore();
    }
  }, [hall, objects, gaenge, showGaenge, showGrid, zoom, pan, selectedObject, selectedPath, selectedWaypointIndex, worldToScreen, gangDrawStart, gangMousePos, paths, pathAreas, currentPath, pathMousePos, pathDrawing, pathDragStart, pathAreaStart, pathAreaMousePos, measureStart, measureEnd, conveyors, currentConveyor, conveyorMousePos]);

  // Initial centering - only once on mount
  const initializedRef = useRef(false);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const handleResize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };

    // Initial setup and centering
    if (!initializedRef.current && hall) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const hallW = hall.width * SCALE * zoom;
      const hallH = hall.height * SCALE * zoom;
      setPan({
        x: (canvas.width - hallW) / 2,
        y: (canvas.height - hallH) / 2
      });
      initializedRef.current = true;
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hall?.id]); // Only re-run when hall changes

  // Redraw on state changes
  useEffect(() => {
    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [hall, objects, gaenge, showGaenge, showGrid, zoom, pan, selectedObject, selectedPath, selectedWaypointIndex, gangDrawStart, gangMousePos, paths, pathAreas, currentPath, pathMousePos, pathDrawing, pathDragStart, pathAreaStart, pathAreaMousePos, measureStart, measureEnd, conveyors, currentConveyor, conveyorMousePos]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Close context menu on any click
    if (contextMenu) {
      setContextMenu(null);
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const world = screenToWorld(x, y);

    if (tool === 'gang') {
      // Gang drawing mode
      if (!gangDrawStart) {
        // First click - set start point
        setGangDrawStart({ x: Math.round(world.x), y: Math.round(world.y) });
        setGangMousePos({ x: Math.round(world.x), y: Math.round(world.y) });
      } else {
        // Second click - create the gang
        const endPoint = { x: Math.round(world.x), y: Math.round(world.y) };
        const dist = Math.sqrt(
          Math.pow(endPoint.x - gangDrawStart.x, 2) +
          Math.pow(endPoint.y - gangDrawStart.y, 2)
        );

        if (dist > 1) {
          // Only create gang if distance is significant
          const newGang: Gang = {
            id: Date.now(),
            name: `Gang ${gaenge.length + 1}`,
            points: [gangDrawStart, endPoint],
            breite: 3, // Default 3m width
            typ: 'quergang',
            farbe: 'rgba(100, 200, 100, 0.6)'
          };
          addGang(newGang);
          toast.success(`Gang erstellt (${dist.toFixed(1)}m)`);
        }

        // Reset drawing state
        setGangDrawStart(null);
        setGangMousePos(null);
      }
      return;
    }

    // Path drawing - SimCity/Anno style: click-drag-release for each segment
    if (tool === 'path') {
      const snapPos = { x: Math.round(world.x), y: Math.round(world.y) };
      setPathDrawing(true);
      setPathMousePos(snapPos);

      // Case 1: No current path - start fresh
      if (!currentPath || currentPath.waypoints.length === 0) {
        setPathDragStart(snapPos);
        return;
      }

      // Case 2: Current path exists - check if continuing from last point
      const lastPoint = currentPath.waypoints[currentPath.waypoints.length - 1];
      const distToLast = Math.sqrt(
        Math.pow(snapPos.x - lastPoint.x, 2) + Math.pow(snapPos.y - lastPoint.y, 2)
      );

      if (distToLast < 3) {
        // Continue from last point
        setPathDragStart({ x: lastPoint.x, y: lastPoint.y });
      } else {
        // Clicking elsewhere - save current path if valid, start new
        if (currentPath.waypoints.length >= 2) {
          savePathWithLinks(currentPath.waypoints);
        }
        setCurrentPath(null);
        setPathDragStart(snapPos);
      }
      return;
    }

    // PathArea drawing - drag to create rectangle
    if (tool === 'pathArea') {
      const snapPos = { x: Math.round(world.x), y: Math.round(world.y) };
      setPathAreaStart(snapPos);
      setPathAreaMousePos(snapPos);
      return;
    }

    // Measure tool
    if (tool === 'measure') {
      const snapPos = { x: Math.round(world.x * 10) / 10, y: Math.round(world.y * 10) / 10 };
      if (!measureStart) {
        setMeasureStart(snapPos);
        setMeasureEnd(snapPos);
      } else {
        // Reset for new measurement
        setMeasureStart(snapPos);
        setMeasureEnd(snapPos);
      }
      return;
    }

    // Conveyor drawing - click to add points
    if (tool === 'conveyor') {
      const snapPos = { x: Math.round(world.x), y: Math.round(world.y) };
      if (!currentConveyor) {
        // Start new conveyor
        setCurrentConveyor({ points: [snapPos] });
      } else {
        // Add point to current conveyor
        setCurrentConveyor({
          points: [...currentConveyor.points, snapPos]
        });
      }
      setConveyorMousePos(snapPos);
      return;
    }

    if (tool === 'select') {
      // First check for objects
      const obj = findObjectAt(world.x, world.y);
      if (obj) {
        selectObject(obj);
        selectPath(null);
        setSelectedWaypointIndex(null);
        setDragObject(obj);
        setDragStart({ x: world.x - obj.x, y: world.y - obj.y });
        setIsDragging(true);
        return;
      }

      // Check for waypoints first (more specific) - enable dragging
      const waypointHit = findWaypointAt(world.x, world.y);
      if (waypointHit) {
        selectPath(waypointHit.path);
        setSelectedWaypointIndex(waypointHit.waypointIndex);
        selectObject(null);
        // Start dragging this waypoint
        setDraggingWaypoint({
          pathId: waypointHit.path.id,
          waypointIndex: waypointHit.waypointIndex
        });
        setIsDragging(true);
        return;
      }

      // Then check for path segments
      const path = findPathAt(world.x, world.y);
      if (path) {
        selectPath(path);
        setSelectedWaypointIndex(null);
        selectObject(null);
        return;
      }

      // Nothing found - deselect all
      selectObject(null);
      selectPath(null);
      setSelectedWaypointIndex(null);
      return;
    } else if (tool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (tool in OBJECT_DEFAULTS) {
      // Add new object using defaults - centered on click position
      const objectType = tool as ObjectType;
      const defaults = OBJECT_DEFAULTS[objectType];
      const count = objects.filter(o => o.type === objectType).length + 1;

      let objX = Math.round(world.x - defaults.width / 2);
      let objY = Math.round(world.y - defaults.height / 2);
      let objWidth = defaults.width;
      let objHeight = defaults.height;
      let torSide: 'north' | 'south' | 'east' | 'west' | undefined;

      // Special handling for Tor: must be at hall edge
      if (objectType === 'tor' && hall) {
        // Find nearest wall
        const distNorth = objY;
        const distSouth = Math.abs(hall.height - objY - objHeight);
        const distWest = objX;
        const distEast = Math.abs(hall.width - objX - objWidth);

        const minDist = Math.min(distNorth, distSouth, distWest, distEast);

        // Snap to nearest wall
        if (minDist === distNorth) {
          objY = 0;
          objWidth = defaults.width;
          objHeight = defaults.height;
          torSide = 'north';
        } else if (minDist === distSouth) {
          objY = hall.height - defaults.height;
          objWidth = defaults.width;
          objHeight = defaults.height;
          torSide = 'south';
        } else if (minDist === distWest) {
          objX = 0;
          objWidth = defaults.height; // Swap for vertical orientation
          objHeight = defaults.width;
          torSide = 'west';
        } else {
          objX = hall.width - defaults.height;
          objWidth = defaults.height; // Swap for vertical orientation
          objHeight = defaults.width;
          torSide = 'east';
        }

        // Re-center along the wall based on click position
        if (torSide === 'north' || torSide === 'south') {
          objX = Math.max(0, Math.min(hall.width - objWidth, Math.round(world.x - objWidth / 2)));
        } else {
          objY = Math.max(0, Math.min(hall.height - objHeight, Math.round(world.y - objHeight / 2)));
        }
      } else if (hall) {
        // For non-Tor objects: clamp to hall boundaries
        objX = Math.max(0, Math.min(hall.width - objWidth, objX));
        objY = Math.max(0, Math.min(hall.height - objHeight, objY));
      }

      const newObj = addObject({
        type: objectType,
        x: objX,
        y: objY,
        width: objWidth,
        height: objHeight,
        name: `${defaults.name} ${count}`,
        side: torSide
      });

      // For Tor: automatically create Entladebereich behind it
      if (objectType === 'tor' && hall && torSide) {
        const entladeDefaults = OBJECT_DEFAULTS['entladebereich'];
        let entladeX = 0, entladeY = 0;
        const entladeWidth = entladeDefaults.width;
        const entladeHeight = entladeDefaults.height;

        // Position Entladebereich inside the hall, behind the Tor
        switch (torSide) {
          case 'north':
            entladeX = objX + (objWidth - entladeWidth) / 2;
            entladeY = objHeight; // Just below the tor
            break;
          case 'south':
            entladeX = objX + (objWidth - entladeWidth) / 2;
            entladeY = hall.height - objHeight - entladeHeight;
            break;
          case 'west':
            entladeX = objWidth; // Just right of the tor
            entladeY = objY + (objHeight - entladeHeight) / 2;
            break;
          case 'east':
            entladeX = hall.width - objWidth - entladeWidth;
            entladeY = objY + (objHeight - entladeHeight) / 2;
            break;
        }

        // Ensure Entladebereich stays within hall bounds
        entladeX = Math.max(0, Math.min(hall.width - entladeWidth, entladeX));
        entladeY = Math.max(0, Math.min(hall.height - entladeHeight, entladeY));

        addObject({
          type: 'entladebereich',
          x: entladeX,
          y: entladeY,
          width: entladeWidth,
          height: entladeHeight,
          name: `Entlade ${count}`
        });

        toast.success(`Tor mit Entladebereich erstellt (${torSide})`);
      }

      // Select the new object and switch to select tool for immediate editing
      selectObject(newObj);
      setTool('select');
      return;
    }

    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const world = screenToWorld(x, y);

    // Update gang preview position
    if (tool === 'gang' && gangDrawStart) {
      setGangMousePos({ x: Math.round(world.x), y: Math.round(world.y) });
      return;
    }

    // Update path preview position
    if (tool === 'path' && pathDrawing) {
      setPathMousePos({ x: Math.round(world.x), y: Math.round(world.y) });
      return;
    }

    // Update pathArea preview position
    if (tool === 'pathArea' && pathAreaStart) {
      setPathAreaMousePos({ x: Math.round(world.x), y: Math.round(world.y) });
      return;
    }

    // Update measure end position
    if (tool === 'measure' && measureStart) {
      setMeasureEnd({ x: Math.round(world.x * 10) / 10, y: Math.round(world.y * 10) / 10 });
      return;
    }

    // Update conveyor preview position
    if (tool === 'conveyor' && currentConveyor) {
      setConveyorMousePos({ x: Math.round(world.x), y: Math.round(world.y) });
      return;
    }

    if (!isDragging) return;

    if (tool === 'pan') {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (tool === 'select' && draggingWaypoint) {
      // Dragging a waypoint - update path in real-time
      const path = paths.find(p => p.id === draggingWaypoint.pathId);
      if (path) {
        const newWaypoints = [...path.waypoints];
        newWaypoints[draggingWaypoint.waypointIndex] = {
          ...newWaypoints[draggingWaypoint.waypointIndex],
          x: Math.round(world.x),
          y: Math.round(world.y)
        };
        updatePath(draggingWaypoint.pathId, { waypoints: newWaypoints });
      }
    } else if (tool === 'select' && dragObject) {
      let newX = Math.round(world.x - dragStart.x);
      let newY = Math.round(world.y - dragStart.y);

      // Clamp position within hall bounds
      if (hall) {
        newX = Math.max(0, Math.min(hall.width - dragObject.width, newX));
        newY = Math.max(0, Math.min(hall.height - dragObject.height, newY));
      }

      updateObject(dragObject.id, { x: newX, y: newY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const world = screenToWorld(x, y);

      // Path drawing - SimCity style: add segment on mouse up
      if (tool === 'path' && pathDrawing && pathDragStart) {
        const endPoint = { x: Math.round(world.x), y: Math.round(world.y), objectId: null };
        const dist = Math.sqrt(
          Math.pow(endPoint.x - pathDragStart.x, 2) +
          Math.pow(endPoint.y - pathDragStart.y, 2)
        );

        // Only add segment if we moved more than 1m
        if (dist > 1) {
          const startPoint = { x: pathDragStart.x, y: pathDragStart.y, objectId: null };

          if (currentPath && currentPath.waypoints.length > 0) {
            // Check if start point is already the last point in path
            const lastPoint = currentPath.waypoints[currentPath.waypoints.length - 1];
            const isConnected = lastPoint.x === pathDragStart.x && lastPoint.y === pathDragStart.y;

            if (isConnected) {
              // Just add end point (continuing path)
              setCurrentPath({
                waypoints: [...currentPath.waypoints, endPoint]
              });
            } else {
              // Add both points (shouldn't happen normally)
              setCurrentPath({
                waypoints: [...currentPath.waypoints, startPoint, endPoint]
              });
            }
          } else {
            // First segment - create new path with both points
            setCurrentPath({
              waypoints: [startPoint, endPoint]
            });
          }
          toast.success(`Segment: ${dist.toFixed(1)}m`);
        }
        setPathDrawing(false);
        setPathDragStart(null);
        return;
      }

      // PathArea - create area on mouse up
      if (tool === 'pathArea' && pathAreaStart && pathAreaMousePos) {
        const x1 = Math.min(pathAreaStart.x, pathAreaMousePos.x);
        const y1 = Math.min(pathAreaStart.y, pathAreaMousePos.y);
        const x2 = Math.max(pathAreaStart.x, pathAreaMousePos.x);
        const y2 = Math.max(pathAreaStart.y, pathAreaMousePos.y);
        const width = x2 - x1;
        const height = y2 - y1;

        if (width > 1 && height > 1) {
          addPathArea({
            name: `Wegbereich ${pathAreas.length + 1}`,
            x: x1,
            y: y1,
            width: width,
            height: height,
            color: 'rgba(100, 150, 255, 0.2)'
          });
          toast.success(`Wegbereich erstellt (${width.toFixed(0)}m × ${height.toFixed(0)}m)`);
        }
        setPathAreaStart(null);
        setPathAreaMousePos(null);
        return;
      }
    }

    // Stop waypoint dragging
    if (draggingWaypoint) {
      // Update object links after moving waypoint
      const path = paths.find(p => p.id === draggingWaypoint.pathId);
      if (path && path.waypoints.length >= 2) {
        const firstPoint = path.waypoints[0];
        const lastPoint = path.waypoints[path.waypoints.length - 1];
        const startObj = findNearestObject(firstPoint.x, firstPoint.y, 5);
        const endObj = findNearestObject(lastPoint.x, lastPoint.y, 5);

        let name = path.name;
        if (startObj && endObj) {
          name = `${startObj.name} → ${endObj.name}`;
        } else if (startObj) {
          name = `${startObj.name} → ...`;
        } else if (endObj) {
          name = `... → ${endObj.name}`;
        }

        updatePath(draggingWaypoint.pathId, {
          name,
          startObjectId: startObj?.id,
          startObjectName: startObj?.name,
          endObjectId: endObj?.id,
          endObjectName: endObj?.name
        });
      }
      setDraggingWaypoint(null);
      toast.success('Wegpunkt verschoben');
    }

    setIsDragging(false);
    setDragObject(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    // Pinch-to-zoom (ctrlKey is set for trackpad pinch gestures)
    if (e.ctrlKey || e.metaKey) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Zoom towards mouse position
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      const newZoom = Math.max(0.1, Math.min(5, zoom * delta));

      // Adjust pan to zoom towards mouse position
      const zoomRatio = newZoom / zoom;
      const newPanX = mouseX - (mouseX - pan.x) * zoomRatio;
      const newPanY = mouseY - (mouseY - pan.y) * zoomRatio;

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    } else {
      // Two-finger scroll → Pan
      setPan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY
      });
    }
  };

  // Handle keyboard events for drawing cancellation and deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gangDrawStart) {
          setGangDrawStart(null);
          setGangMousePos(null);
          toast.info('Gang-Zeichnen abgebrochen');
        }
        if (currentPath) {
          setCurrentPath(null);
          setPathDrawing(false);
          setPathDragStart(null);
          setPathMousePos(null);
          toast.info('Weg-Zeichnen abgebrochen');
        }
        if (pathAreaStart) {
          setPathAreaStart(null);
          setPathAreaMousePos(null);
          toast.info('Wegbereich abgebrochen');
        }
        if (measureStart) {
          setMeasureStart(null);
          setMeasureEnd(null);
          toast.info('Messung abgebrochen');
        }
        if (currentConveyor) {
          setCurrentConveyor(null);
          setConveyorMousePos(null);
          toast.info('Förderband-Zeichnen abgebrochen');
        }
        // Deselect path and close context menu on Escape
        if (selectedPath) {
          selectPath(null);
        }
        if (contextMenu) {
          setContextMenu(null);
        }
      }

      // Delete selected path with Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPath) {
        // Don't delete if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        deletePath(selectedPath.id);
        selectPath(null);
        toast.success('Weg gelöscht');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gangDrawStart, currentPath, pathAreaStart, measureStart, currentConveyor, selectedPath, deletePath, selectPath, contextMenu]);

  // Reset drawing states when tool changes
  useEffect(() => {
    if (tool !== 'gang') {
      setGangDrawStart(null);
      setGangMousePos(null);
    }
    if (tool !== 'path') {
      // Save current path if exists
      if (currentPath && currentPath.waypoints.length >= 2) {
        savePathWithLinks(currentPath.waypoints);
      }
      setCurrentPath(null);
      setPathDrawing(false);
      setPathDragStart(null);
      setPathMousePos(null);
    }
    if (tool !== 'pathArea') {
      setPathAreaStart(null);
      setPathAreaMousePos(null);
    }
    if (tool !== 'measure') {
      setMeasureStart(null);
      setMeasureEnd(null);
    }
    if (tool !== 'conveyor') {
      // Save current conveyor if exists
      if (currentConveyor && currentConveyor.points.length >= 2) {
        addConveyor({
          name: `Förderband ${conveyors.length + 1}`,
          points: currentConveyor.points,
          speed: 1, // 1 m/s default
          capacity: 100 // 100 pallets/hour default
        });
        toast.success('Förderband gespeichert');
      }
      setCurrentConveyor(null);
      setConveyorMousePos(null);
    }
  }, [tool]);

  // Double-click to finish path or conveyor
  const handleDoubleClick = () => {
    if (tool === 'path' && currentPath && currentPath.waypoints.length >= 2) {
      savePathWithLinks(currentPath.waypoints);
      setCurrentPath(null);
      setPathDrawing(false);
      setPathDragStart(null);
      setPathMousePos(null);
    }
    if (tool === 'conveyor' && currentConveyor && currentConveyor.points.length >= 2) {
      addConveyor({
        name: `Förderband ${conveyors.length + 1}`,
        points: currentConveyor.points,
        speed: 1,
        capacity: 100
      });
      setCurrentConveyor(null);
      setConveyorMousePos(null);
      toast.success('Förderband gespeichert');
    }
  };

  // Cursor based on tool
  const getCursor = () => {
    if (isDragging && tool === 'pan') return 'grabbing';
    if (tool === 'pan') return 'grab';
    if (tool === 'select') return dragObject ? 'move' : 'default';
    if (tool === 'gang') return gangDrawStart ? 'crosshair' : 'crosshair';
    return 'crosshair';
  };

  // Right-click to cancel drawing
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    // If drawing, cancel drawing
    if (gangDrawStart || currentPath || pathAreaStart || measureStart || currentConveyor) {
      if (gangDrawStart) {
        setGangDrawStart(null);
        setGangMousePos(null);
      }
      if (currentPath) {
        setCurrentPath(null);
        setPathDrawing(false);
        setPathDragStart(null);
        setPathMousePos(null);
      }
      if (pathAreaStart) {
        setPathAreaStart(null);
        setPathAreaMousePos(null);
      }
      if (measureStart) {
        setMeasureStart(null);
        setMeasureEnd(null);
      }
      if (currentConveyor) {
        setCurrentConveyor(null);
        setConveyorMousePos(null);
      }
      toast.info('Zeichnen abgebrochen');
      return;
    }

    // Check if right-clicking on a waypoint or path
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const world = screenToWorld(x, y);

    // First check for waypoints (more specific)
    const waypointHit = findWaypointAt(world.x, world.y);
    if (waypointHit) {
      selectPath(waypointHit.path);
      setSelectedWaypointIndex(waypointHit.waypointIndex);
      selectObject(null);
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        pathId: waypointHit.path.id,
        waypointIndex: waypointHit.waypointIndex
      });
      return;
    }

    // Then check for path segments
    const clickedPath = findPathAt(world.x, world.y);
    if (clickedPath) {
      selectPath(clickedPath);
      setSelectedWaypointIndex(null);
      selectObject(null);
      setContextMenu({ x: e.clientX, y: e.clientY, pathId: clickedPath.id });
    } else {
      setContextMenu(null);
      setSelectedWaypointIndex(null);
    }
  };

  // Close context menu when clicking elsewhere
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Handle context menu delete path
  const handleContextMenuDeletePath = () => {
    if (contextMenu) {
      deletePath(contextMenu.pathId);
      selectPath(null);
      setSelectedWaypointIndex(null);
      setContextMenu(null);
      toast.success('Weg gelöscht');
    }
  };

  // Handle context menu delete waypoint
  const handleContextMenuDeleteWaypoint = () => {
    if (contextMenu && contextMenu.waypointIndex !== undefined && selectedPath) {
      const newWaypoints = [...selectedPath.waypoints];
      newWaypoints.splice(contextMenu.waypointIndex, 1);

      if (newWaypoints.length < 2) {
        // If less than 2 points remain, delete the entire path
        deletePath(contextMenu.pathId);
        selectPath(null);
        toast.success('Weg gelöscht (zu wenige Punkte)');
      } else {
        // Update path with remaining waypoints using updatePath
        // Recalculate object links
        const firstPoint = newWaypoints[0];
        const lastPoint = newWaypoints[newWaypoints.length - 1];
        const startObj = findNearestObject(firstPoint.x, firstPoint.y, 5);
        const endObj = findNearestObject(lastPoint.x, lastPoint.y, 5);

        let name = selectedPath.name;
        if (startObj && endObj) {
          name = `${startObj.name} → ${endObj.name}`;
        } else if (startObj) {
          name = `${startObj.name} → ...`;
        } else if (endObj) {
          name = `... → ${endObj.name}`;
        }

        updatePath(contextMenu.pathId, {
          waypoints: newWaypoints,
          name,
          startObjectId: startObj?.id,
          startObjectName: startObj?.name,
          endObjectId: endObj?.id,
          endObjectName: endObj?.name
        });
        toast.success('Wegpunkt gelöscht');
      }
      setSelectedWaypointIndex(null);
      setContextMenu(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-black overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      />
      {/* Tool instructions */}
      {tool === 'path' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {currentPath && currentPath.waypoints.length >= 2 ? (
            <span>Vom Endpunkt weiterziehen | <kbd className="px-1 bg-muted rounded">Doppelklick</kbd> Speichern | <kbd className="px-1 bg-muted rounded">Rechtsklick</kbd> Fertig</span>
          ) : (
            <span>Klicken & Ziehen für Weg-Segment (wie SimCity)</span>
          )}
        </div>
      )}
      {tool === 'pathArea' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          <span>Klicken und ziehen um einen Wegbereich zu definieren</span>
        </div>
      )}
      {tool === 'measure' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {measureStart && measureEnd ? (
            <span>Distanz: <strong>{Math.sqrt(Math.pow(measureEnd.x - measureStart.x, 2) + Math.pow(measureEnd.y - measureStart.y, 2)).toFixed(2)} m</strong> | Klicken für neue Messung</span>
          ) : (
            <span>Klicken für Startpunkt, dann ziehen zum Messen</span>
          )}
        </div>
      )}
      {tool === 'gang' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {gangDrawStart ? (
            <span>Klicken Sie für den Endpunkt | <kbd className="px-1 bg-muted rounded">ESC</kbd> oder Rechtsklick zum Abbrechen</span>
          ) : (
            <span>Klicken Sie für den Startpunkt des Gangs</span>
          )}
        </div>
      )}
      {tool === 'conveyor' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          {currentConveyor && currentConveyor.points.length > 0 ? (
            <span>Klicken für weiteren Punkt | <kbd className="px-1 bg-muted rounded">Doppelklick</kbd> zum Speichern | <kbd className="px-1 bg-muted rounded">ESC</kbd> Abbrechen</span>
          ) : (
            <span>Klicken um das Förderband zu zeichnen</span>
          )}
        </div>
      )}
      {tool === 'select' && selectedPath && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
          <span>Wegpunkte anklicken & ziehen zum Verschieben | <kbd className="px-1 bg-muted rounded">Rechtsklick</kbd> Menü | <kbd className="px-1 bg-muted rounded">Entf</kbd> Löschen</span>
        </div>
      )}

      {/* Context Menu for Paths */}
      {contextMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseContextMenu}
          />
          {/* Menu */}
          <div
            className="fixed z-50 bg-popover border rounded-lg shadow-lg py-1 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="px-3 py-1.5 text-xs text-muted-foreground border-b">
              {contextMenu.waypointIndex !== undefined
                ? `${selectedPath?.name} - Punkt ${contextMenu.waypointIndex + 1}`
                : selectedPath?.name || 'Weg'}
            </div>

            {/* Waypoint-specific options */}
            {contextMenu.waypointIndex !== undefined && (
              <>
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
                  onClick={() => {
                    if (selectedPath && contextMenu.waypointIndex !== undefined) {
                      const wp = selectedPath.waypoints[contextMenu.waypointIndex];
                      toast.info(`Punkt ${contextMenu.waypointIndex + 1}: X=${wp.x.toFixed(1)}m, Y=${wp.y.toFixed(1)}m`);
                    }
                    setContextMenu(null);
                  }}
                >
                  📍 Punkt-Position
                </button>
                <div className="px-3 py-1.5 text-xs text-muted-foreground italic">
                  Tipp: Punkt anklicken & ziehen zum Verschieben
                </div>
                <button
                  className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
                  onClick={handleContextMenuDeleteWaypoint}
                >
                  ❌ Punkt löschen
                </button>
                <div className="border-t my-1" />
              </>
            )}

            {/* Path options */}
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"
              onClick={() => {
                if (selectedPath) {
                  const length = selectedPath.waypoints.reduce((sum, wp, i, arr) => {
                    if (i === 0) return 0;
                    const prev = arr[i - 1];
                    return sum + Math.sqrt(Math.pow(wp.x - prev.x, 2) + Math.pow(wp.y - prev.y, 2));
                  }, 0);
                  toast.info(`Länge: ${length.toFixed(1)}m | Punkte: ${selectedPath.waypoints.length}`);
                }
                setContextMenu(null);
              }}
            >
              📏 Weg-Details
            </button>
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2"
              onClick={handleContextMenuDeletePath}
            >
              🗑️ Gesamten Weg löschen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
