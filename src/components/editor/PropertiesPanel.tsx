'use client';

import { useTopisStore, useSelectedObject, useSelectedGang, useSelectedPathArea, useSelectedConveyor } from '@/lib/store';
import type { TopisObject } from '@/types/topis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, RotateCw, Route, Settings } from 'lucide-react';

// Sub-panel for Gang properties
function GangProperties() {
  const selectedGang = useSelectedGang();
  const updateGang = useTopisStore((s) => s.updateGang);
  const deleteGang = useTopisStore((s) => s.deleteGang);
  const selectGang = useTopisStore((s) => s.selectGang);

  if (!selectedGang) return null;

  const length = selectedGang.points.length >= 2
    ? Math.sqrt(
        (selectedGang.points[1].x - selectedGang.points[0].x) ** 2 +
        (selectedGang.points[1].y - selectedGang.points[0].y) ** 2
      )
    : 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{selectedGang.name}</h3>
            <Badge variant="secondary" className="mt-1">Fahrgang</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { deleteGang(selectedGang.id); selectGang(null); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={selectedGang.name} onChange={(e) => updateGang(selectedGang.id, { name: e.target.value })} />
        </div>
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">Eigenschaften</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Breite (m)</Label>
                <Input type="number" step={0.5} value={selectedGang.breite} onChange={(e) => updateGang(selectedGang.id, { breite: parseFloat(e.target.value) || 1 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Typ</Label>
                <Input value={selectedGang.typ} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Länge: {length.toFixed(1)}m
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

// Sub-panel for PathArea properties
function PathAreaProperties() {
  const selectedPathArea = useSelectedPathArea();
  const updatePathArea = useTopisStore((s) => s.updatePathArea);
  const deletePathArea = useTopisStore((s) => s.deletePathArea);
  const selectPathArea = useTopisStore((s) => s.selectPathArea);

  if (!selectedPathArea) return null;

  const area = (selectedPathArea.width || 0) * (selectedPathArea.height || 0);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{selectedPathArea.name}</h3>
            <Badge variant="secondary" className="mt-1">Wegbereich</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { deletePathArea(selectedPathArea.id); selectPathArea(null); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={selectedPathArea.name} onChange={(e) => updatePathArea(selectedPathArea.id, { name: e.target.value })} />
        </div>
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">Position & Größe</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">X (m)</Label>
                <Input type="number" value={selectedPathArea.x ?? 0} onChange={(e) => updatePathArea(selectedPathArea.id, { x: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Y (m)</Label>
                <Input type="number" value={selectedPathArea.y ?? 0} onChange={(e) => updatePathArea(selectedPathArea.id, { y: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Breite (m)</Label>
                <Input type="number" value={selectedPathArea.width ?? 0} onChange={(e) => updatePathArea(selectedPathArea.id, { width: parseFloat(e.target.value) || 1 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tiefe (m)</Label>
                <Input type="number" value={selectedPathArea.height ?? 0} onChange={(e) => updatePathArea(selectedPathArea.id, { height: parseFloat(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Fläche: {area.toFixed(1)} m²</div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

// Sub-panel for Conveyor properties
function ConveyorProperties() {
  const selectedConveyor = useSelectedConveyor();
  const updateConveyor = useTopisStore((s) => s.updateConveyor);
  const deleteConveyor = useTopisStore((s) => s.deleteConveyor);
  const selectConveyor = useTopisStore((s) => s.selectConveyor);

  if (!selectedConveyor) return null;

  let totalLength = 0;
  for (let i = 0; i < selectedConveyor.points.length - 1; i++) {
    const p1 = selectedConveyor.points[i];
    const p2 = selectedConveyor.points[i + 1];
    totalLength += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{selectedConveyor.name}</h3>
            <Badge variant="secondary" className="mt-1">Förderer</Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { deleteConveyor(selectedConveyor.id); selectConveyor(null); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={selectedConveyor.name} onChange={(e) => updateConveyor(selectedConveyor.id, { name: e.target.value })} />
        </div>
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">Eigenschaften</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Geschwindigkeit (m/s)</Label>
                <Input type="number" step={0.1} value={selectedConveyor.speed} onChange={(e) => updateConveyor(selectedConveyor.id, { speed: parseFloat(e.target.value) || 1 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Kapazität (Pal/h)</Label>
                <Input type="number" value={selectedConveyor.capacity} onChange={(e) => updateConveyor(selectedConveyor.id, { capacity: parseInt(e.target.value) || 100 })} />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Länge: {totalLength.toFixed(1)}m | {selectedConveyor.points.length} Punkte
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

// Sub-panel for Path properties
function PathProperties() {
  const selectedPath = useTopisStore((s) => s.selectedPath);
  const updatePath = useTopisStore((s) => s.updatePath);
  const deletePath = useTopisStore((s) => s.deletePath);
  const selectPath = useTopisStore((s) => s.selectPath);

  if (!selectedPath) return null;

  let totalLength = 0;
  for (let i = 0; i < selectedPath.waypoints.length - 1; i++) {
    const p1 = selectedPath.waypoints[i];
    const p2 = selectedPath.waypoints[i + 1];
    totalLength += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{selectedPath.name}</h3>
            <div className="flex gap-1 mt-1">
              <Badge variant="secondary">Weg</Badge>
              {selectedPath.autoGenerated && (
                <Badge variant="outline" className="text-green-600 border-green-600">Automatisch</Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { deletePath(selectedPath.id); selectPath(null); }}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={selectedPath.name} onChange={(e) => updatePath(selectedPath.id, { name: e.target.value })} />
        </div>
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">Eigenschaften</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Distanz (m)</Label>
                <Input value={(selectedPath.distance ?? totalLength).toFixed(1)} readOnly className="bg-muted" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Zeit (s)</Label>
                <Input value={(selectedPath.time ?? 0).toFixed(1)} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {selectedPath.waypoints.length} Wegpunkte
            </div>
          </CardContent>
        </Card>
        {(selectedPath.startObjectName || selectedPath.endObjectName) && (
          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Verknüpfungen</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedPath.startObjectName && (
                <div><span className="text-muted-foreground">Start:</span> {selectedPath.startObjectName}</div>
              )}
              {selectedPath.endObjectName && (
                <div><span className="text-muted-foreground">Ziel:</span> {selectedPath.endObjectName}</div>
              )}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="py-3"><CardTitle className="text-sm">Darstellung</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Label className="text-xs">Farbe</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedPath.color || '#22c55e'}
                  onChange={(e) => updatePath(selectedPath.id, { color: e.target.value })}
                  className="w-12 h-9 p-1"
                />
                <Input
                  value={selectedPath.color || '#22c55e'}
                  onChange={(e) => updatePath(selectedPath.id, { color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

export function PropertiesPanel() {
  const selectedObject = useSelectedObject();
  const selectedGang = useSelectedGang();
  const selectedPathArea = useSelectedPathArea();
  const selectedConveyor = useSelectedConveyor();
  const updateObject = useTopisStore((s) => s.updateObject);
  const deleteObject = useTopisStore((s) => s.deleteObject);
  const selectObject = useTopisStore((s) => s.selectObject);
  const addObject = useTopisStore((s) => s.addObject);

  const selectedPath = useTopisStore((s) => s.selectedPath);

  // Show gang properties
  if (selectedGang) return <GangProperties />;
  // Show path properties
  if (selectedPath) return <PathProperties />;
  // Show pathArea properties
  if (selectedPathArea) return <PathAreaProperties />;
  // Show conveyor properties
  if (selectedConveyor) return <ConveyorProperties />;

  if (!selectedObject) {
    return (
      <div className="flex flex-col items-center gap-2.5 px-4 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
          <Settings className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Kein Element ausgewählt</p>
        <p className="max-w-[190px] text-xs leading-relaxed text-muted-foreground">Klicke im Plan auf ein Tor, einen Stellplatz oder eine Wand, um die Eigenschaften zu bearbeiten.</p>
      </div>
    );
  }

  const handleChange = (field: string, value: unknown) => {
    updateObject(selectedObject.id, { [field]: value } as Partial<TopisObject>);
  };

  const handleDelete = () => {
    deleteObject(selectedObject.id);
    selectObject(null);
  };

  const handleDuplicate = () => {
    const { id: _id, ...rest } = selectedObject;
    void _id;
    // Bei Toren: Kopie eine Tor-Breite weiter entlang der Wand (Nico 22.05.)
    let dx = 2, dy = 2;
    if (selectedObject.type === 'tor') {
      const side = selectedObject.side;
      if (side === 'north' || side === 'south') { dx = selectedObject.width; dy = 0; }
      else if (side === 'east' || side === 'west') { dx = 0; dy = selectedObject.height; }
    }
    const kopie = addObject({
      ...rest,
      x: selectedObject.x + dx,
      y: selectedObject.y + dy,
      name: selectedObject.name ? `${selectedObject.name} (Kopie)` : 'Kopie',
    });
    selectObject(kopie);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{selectedObject.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {selectedObject.type}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleDuplicate} title="Duplizieren (Cmd+D)">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={selectedObject.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        {/* Position & Größe — kompakter Figma-Inspector (X/Y/B/T-Raster) */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Position & Größe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <NumField letter="X" value={selectedObject.x} onChange={(v) => handleChange('x', v)} />
              <NumField letter="Y" value={selectedObject.y} onChange={(v) => handleChange('y', v)} />
              <NumField letter="B" value={selectedObject.width} onChange={(v) => handleChange('width', v || 1)} />
              <NumField letter="T" value={selectedObject.height} onChange={(v) => handleChange('height', v || 1)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumField letter="∠" value={selectedObject.rotation || 0} onChange={(v) => handleChange('rotation', v)} />
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs"
                onClick={() => handleChange('rotation', ((selectedObject.rotation || 0) + 90) % 360)}
              >
                <RotateCw className="h-3.5 w-3.5" /> 90°
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lastenheft 3.1.1.2 — Verankerung + Einschränkungen + Bezeichnungs-Stil (generisch) */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Verankerung + Bezeichnung (Lastenheft 3.1.1.2)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Verankerung</Label>
              <select
                className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                value={selectedObject.verankert ?? 'verschiebbar'}
                onChange={(e) => handleChange('verankert', e.target.value as 'starr' | 'verschiebbar')}
              >
                <option value="verschiebbar">verschiebbar</option>
                <option value="starr">starr (fest)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Einschränkungen (Positionierung / Zusammenspiel)</Label>
              <Input
                value={selectedObject.einschraenkungen ?? ''}
                onChange={(e) => handleChange('einschraenkungen', e.target.value)}
                placeholder="z.B. nur in Verladezone 1, nicht über Säule"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bezeichnung-Schriftgröße (px)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min={6}
                  max={48}
                  value={selectedObject.bezeichnungStil?.fontSize ?? 12}
                  onChange={(e) => handleChange('bezeichnungStil', {
                    ...(selectedObject.bezeichnungStil ?? {}),
                    fontSize: parseInt(e.target.value) || 12,
                  })}
                  className="w-20"
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedObject.bezeichnungStil?.bold === true}
                    onChange={(e) => handleChange('bezeichnungStil', {
                      ...(selectedObject.bezeichnungStil ?? {}),
                      bold: e.target.checked,
                    })}
                  />
                  Fett
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedObject.bezeichnungStil?.italic === true}
                    onChange={(e) => handleChange('bezeichnungStil', {
                      ...(selectedObject.bezeichnungStil ?? {}),
                      italic: e.target.checked,
                    })}
                  />
                  Kursiv
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type-specific properties */}
        {(selectedObject.type === 'tor' || selectedObject.type === 'bereich' || selectedObject.type === 'stellplatz' || selectedObject.type === 'sperrplatz' || selectedObject.type === 'klaerplatz') && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Wegpunkt (Lastenheft 3.1.4.2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="wegpunktRolle" className="text-xs">Rolle</Label>
                <select
                  id="wegpunktRolle"
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={selectedObject.wegpunktRolle ?? 'beides'}
                  onChange={(e) => handleChange('wegpunktRolle', e.target.value)}
                >
                  <option value="beides">Start &amp; Ende (Default)</option>
                  <option value="start">nur Start</option>
                  <option value="ende">nur Ende</option>
                  <option value="keiner">keiner (vom Wege-Netz ausgeschlossen)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Anker-X (0..1)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={selectedObject.wegpunktOffset?.x ?? 0.5}
                    onChange={(e) => {
                      const x = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
                      const y = selectedObject.wegpunktOffset?.y ?? 0.5;
                      handleChange('wegpunktOffset', { x, y });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Anker-Y (0..1)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0}
                    max={1}
                    value={selectedObject.wegpunktOffset?.y ?? 0.5}
                    onChange={(e) => {
                      const x = selectedObject.wegpunktOffset?.x ?? 0.5;
                      const y = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
                      handleChange('wegpunktOffset', { x, y });
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                0,0 = links-oben · 0,5;0,5 = Mitte (default) · 1,1 = rechts-unten. Beispiel: Nord-Tor mit Anker 0,5;1 startet/endet innen.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tor-Wand-Verankerung (Lastenheft 3.1.2 — Position als Abstand von S/E) */}
        {selectedObject.type === 'tor' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Wand-Verankerung (Lastenheft 3.1.2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedObject.aussenwandRef ? (
                <>
                  <div className="text-xs text-muted-foreground">
                    Verankert an Wand-Index <span className="font-mono">{selectedObject.aussenwandRef.wallIndex}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Abstand S (m)</Label>
                      <Input
                        type="number"
                        step={0.1}
                        min={0}
                        value={selectedObject.aussenwandRef.abstandS.toFixed(2)}
                        onChange={(e) => {
                          const abstandS = parseFloat(e.target.value) || 0;
                          const ref = selectedObject.aussenwandRef!;
                          const totalLength = ref.abstandS + ref.abstandE;
                          handleChange('aussenwandRef', {
                            wallIndex: ref.wallIndex,
                            abstandS,
                            abstandE: Math.max(0, totalLength - abstandS),
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Abstand E (m)</Label>
                      <Input
                        type="number"
                        step={0.1}
                        min={0}
                        value={selectedObject.aussenwandRef.abstandE.toFixed(2)}
                        onChange={(e) => {
                          const abstandE = parseFloat(e.target.value) || 0;
                          const ref = selectedObject.aussenwandRef!;
                          const totalLength = ref.abstandS + ref.abstandE;
                          handleChange('aussenwandRef', {
                            wallIndex: ref.wallIndex,
                            abstandS: Math.max(0, totalLength - abstandE),
                            abstandE,
                          });
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-md bg-amber-100 dark:bg-amber-950 p-2 text-xs text-amber-900 dark:text-amber-200">
                  ⚠ Dieses Tor ist nicht an einer Außenwand verankert. Verschiebe es nahe an eine Wand, um die Verankerung automatisch zu setzen (Lastenheft-Anforderung).
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Tore werden auf Außenwänden positioniert und sind fest mit der Wand verankert (Lastenheft 3.1.2). Position als Abstand zu den Wand-Eckpunkten S (Start) und E (End).
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tor↔Stellplatz/Verlader/Fahrzeug-Relationen (Lastenheft 3.1.2) */}
        {selectedObject.type === 'tor' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Überladebrücke (Lastenheft 3.1.2, optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedObject.ueberladebrueckeAktiv === true}
                  onChange={(e) => handleChange('ueberladebrueckeAktiv', e.target.checked)}
                />
                <span>Überladebrücke vor dem Tor anzeigen</span>
              </label>
              {selectedObject.ueberladebrueckeAktiv && (
                <div className="space-y-1">
                  <Label className="text-xs">Länge (m, einzutragen)</Label>
                  <Input
                    type="number"
                    step={0.1}
                    min={0.5}
                    value={selectedObject.ueberladebrueckeLaenge ?? 3}
                    onChange={(e) => handleChange('ueberladebrueckeLaenge', parseFloat(e.target.value) || 3)}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Zeichnerisches Element ohne Funktion. Breite = Tor-Breite, Position direkt innen vor dem Tor.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedObject.type === 'tor' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Tor-Verknüpfungen (Lastenheft 3.1.2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Bedient Stellplätze (Komma-getrennte IDs/Namen)</Label>
                <Input
                  value={(selectedObject.bedientStellplatzIds ?? []).join(', ')}
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
                    handleChange('bedientStellplatzIds', ids);
                  }}
                  placeholder="z.B. 12, 13, 14"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bedient Verlader (Komma-getrennte IDs)</Label>
                <Input
                  value={(selectedObject.bedientVerladerIds ?? []).join(', ')}
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
                    handleChange('bedientVerladerIds', ids);
                  }}
                  placeholder="z.B. 1, 2"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bedient Fahrzeuge (Komma-getrennte IDs)</Label>
                <Input
                  value={(selectedObject.bedientFahrzeugIds ?? []).join(', ')}
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
                    handleChange('bedientFahrzeugIds', ids);
                  }}
                  placeholder="z.B. 1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lastenheft 3.1.2: 1 Tor = 1..n Verlader/Stellplätze/Fahrzeuge. Persistierte Verknüpfung für Auswertungen (Verladeplan, Cross-Docking).
              </p>
            </CardContent>
          </Card>
        )}

        {selectedObject.type === 'stellplatz' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Stellplatz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="stapelHoehe" className="text-xs">Stapelhöhe</Label>
                  <Input
                    id="stapelHoehe"
                    type="number"
                    min={1}
                    max={4}
                    value={selectedObject.stapelHoehe || 1}
                    onChange={(e) => handleChange('stapelHoehe', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="palettenProStellplatz" className="text-xs">Paletten</Label>
                  <Input
                    id="palettenProStellplatz"
                    type="number"
                    value={selectedObject.palettenProStellplatz || Math.floor((selectedObject.width * selectedObject.height) / 1.2 * (selectedObject.stapelHoehe || 1))}
                    onChange={(e) => handleChange('palettenProStellplatz', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="currentLoad" className="text-xs">Aktuelle Belegung</Label>
                <Input
                  id="currentLoad"
                  type="number"
                  value={selectedObject.currentLoad || 0}
                  onChange={(e) => handleChange('currentLoad', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Kapazität: {selectedObject.palettenProStellplatz || Math.floor((selectedObject.width * selectedObject.height) / 1.2 * (selectedObject.stapelHoehe || 1))} Paletten
                ({selectedObject.stapelHoehe || 1}x gestapelt)
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lastenheft 3.1.3.1 — Kapazität in 3 Einheiten + Füllgrad-Ampel */}
        {(selectedObject.type === 'stellplatz' || selectedObject.type === 'regal') && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Kapazität (Lastenheft 3.1.3.1)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Packstücke</Label>
                  <Input
                    type="number"
                    value={selectedObject.kapazitaetMulti?.packstuecke ?? ''}
                    onChange={(e) => handleChange('kapazitaetMulti', {
                      ...(selectedObject.kapazitaetMulti ?? {}),
                      packstuecke: parseFloat(e.target.value) || 0,
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Lademeter</Label>
                  <Input
                    type="number"
                    step={0.1}
                    value={selectedObject.kapazitaetMulti?.lademeter ?? ''}
                    onChange={(e) => handleChange('kapazitaetMulti', {
                      ...(selectedObject.kapazitaetMulti ?? {}),
                      lademeter: parseFloat(e.target.value) || 0,
                    })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">qm</Label>
                  <Input
                    type="number"
                    step={0.1}
                    value={selectedObject.kapazitaetMulti?.qm ?? ''}
                    onChange={(e) => handleChange('kapazitaetMulti', {
                      ...(selectedObject.kapazitaetMulti ?? {}),
                      qm: parseFloat(e.target.value) || 0,
                    })}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Füllgrad-Ampel</Label>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-xs">grün bis</span>
                  <Input
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={selectedObject.fuellgradFarben?.gruenBis ?? 0.7}
                    onChange={(e) => handleChange('fuellgradFarben', {
                      gruenBis: parseFloat(e.target.value) || 0.7,
                      gelbBis: selectedObject.fuellgradFarben?.gelbBis ?? 0.9,
                    })}
                    className="w-20"
                  />
                  <span className="text-xs">, gelb bis</span>
                  <Input
                    type="number"
                    step={0.05}
                    min={0}
                    max={1}
                    value={selectedObject.fuellgradFarben?.gelbBis ?? 0.9}
                    onChange={(e) => handleChange('fuellgradFarben', {
                      gruenBis: selectedObject.fuellgradFarben?.gruenBis ?? 0.7,
                      gelbBis: parseFloat(e.target.value) || 0.9,
                    })}
                    className="w-20"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Kapazität in 3 Einheiten (Lastenheft 3.1.3.1). Füllgrad = Menge / Kapazität → grün/gelb/rot.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lastenheft 3.1.3.1 — Stellplatz↔Tor umgekehrt + Relationen */}
        {selectedObject.type === 'stellplatz' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Tor-Bedienung + Relationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Wird bedient von Toren (Komma-getrennte IDs)</Label>
                <Input
                  value={(selectedObject.bedientToreVon ?? []).join(', ')}
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map(s => Number(s.trim())).filter(n => Number.isFinite(n) && n > 0);
                    handleChange('bedientToreVon', ids);
                  }}
                  placeholder="z.B. 1, 2"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Anzahl Relationen</Label>
                <div className="text-xs text-muted-foreground">
                  {(selectedObject.relationen ?? []).length} Relation(en) zugeordnet
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Lastenheft 3.1.3.1: 1 Stellplatz = bis zu n Tore + n Relationen mit Mengen. Relations-Verwaltung im RelationZuordnung-Dialog.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lastenheft 3.1.3.1 — Form-Variante (Kreis/Trapez/Polygon) */}
        {(selectedObject.type === 'stellplatz' || selectedObject.type === 'bereich') && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Form (Lastenheft 3.1.3.1)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Form-Variante</Label>
                <select
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                  value={selectedObject.formVariante ?? 'rect'}
                  onChange={(e) => handleChange('formVariante', e.target.value as 'rect' | 'circle' | 'trapez' | 'polygon')}
                >
                  <option value="rect">Rechteck</option>
                  <option value="circle">Kreis</option>
                  <option value="trapez">Trapez</option>
                  <option value="polygon">Freihand-Polygon</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                Lastenheft: meist rechteckig, müssen jedoch auch individuell gestaltbar sein (Winkel ≠ 90°, Rundung).
              </p>
            </CardContent>
          </Card>
        )}

        {selectedObject.type === 'regal' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Regal (3D)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ebenen" className="text-xs">Ebenen</Label>
                  <Input
                    id="ebenen"
                    type="number"
                    min={1}
                    max={10}
                    value={selectedObject.ebenen || 3}
                    onChange={(e) => handleChange('ebenen', parseInt(e.target.value) || 3)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ebenenHoehe" className="text-xs">Höhe/Ebene (m)</Label>
                  <Input
                    id="ebenenHoehe"
                    type="number"
                    step={0.1}
                    value={selectedObject.ebenenHoehe || 1.5}
                    onChange={(e) => handleChange('ebenenHoehe', parseFloat(e.target.value) || 1.5)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="unterkante" className="text-xs">Unterkante (m)</Label>
                  <Input
                    id="unterkante"
                    type="number"
                    step={0.1}
                    value={selectedObject.unterkante || 0.3}
                    onChange={(e) => handleChange('unterkante', parseFloat(e.target.value) || 0.3)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="palettenPlaetzeProEbene" className="text-xs">Plätze/Ebene</Label>
                  <Input
                    id="palettenPlaetzeProEbene"
                    type="number"
                    value={selectedObject.palettenPlaetzeProEbene || Math.floor(selectedObject.width / 1.2)}
                    onChange={(e) => handleChange('palettenPlaetzeProEbene', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="einlagerungszeitSek" className="text-xs">Einlagerungszeit/Ebene (s)</Label>
                <Input
                  id="einlagerungszeitSek"
                  type="number"
                  value={selectedObject.einlagerungszeitSek || 15}
                  onChange={(e) => handleChange('einlagerungszeitSek', parseInt(e.target.value) || 15)}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <div>Gesamthöhe: {((selectedObject.ebenen || 3) * (selectedObject.ebenenHoehe || 1.5) + (selectedObject.unterkante || 0.3)).toFixed(1)}m</div>
                <div>Gesamt: {(selectedObject.palettenPlaetzeProEbene || Math.floor(selectedObject.width / 1.2)) * (selectedObject.ebenen || 3)} Palettenplätze</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lastenheft 3.1.3.2 — Regal-Ebenen als Array (jede Ebene = eigener Stellplatz) */}
        {selectedObject.type === 'regal' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Regal-Ebenen detailliert (Lastenheft 3.1.3.2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs rounded-md border px-2 py-1 hover:bg-accent"
                  onClick={() => {
                    const aktuelle = selectedObject.regalEbenen ?? [];
                    const naechsteId = aktuelle.length > 0 ? Math.max(...aktuelle.map(e => e.id)) + 1 : 1;
                    const neueEbene = {
                      id: naechsteId,
                      name: `Ebene ${naechsteId}`,
                      unterkante: (selectedObject.unterkante ?? 0.3) + (aktuelle.length * (selectedObject.ebenenHoehe ?? 1.5)),
                      hoehe: selectedObject.ebenenHoehe ?? 1.5,
                      palettenplaetze: selectedObject.palettenPlaetzeProEbene ?? Math.floor(selectedObject.width / 1.2),
                    };
                    handleChange('regalEbenen', [...aktuelle, neueEbene]);
                  }}
                >
                  + Ebene
                </button>
                <button
                  type="button"
                  className="text-xs rounded-md border px-2 py-1 hover:bg-accent"
                  onClick={() => {
                    // Auto-generieren aus Skalaren
                    const n = selectedObject.ebenen ?? 3;
                    const uk = selectedObject.unterkante ?? 0.3;
                    const eh = selectedObject.ebenenHoehe ?? 1.5;
                    const pp = selectedObject.palettenPlaetzeProEbene ?? Math.floor(selectedObject.width / 1.2);
                    const generiert = Array.from({ length: n }, (_, i) => ({
                      id: i + 1,
                      name: `Ebene ${i + 1}`,
                      unterkante: uk + i * eh,
                      hoehe: eh,
                      palettenplaetze: pp,
                    }));
                    handleChange('regalEbenen', generiert);
                  }}
                >
                  Aus Skalaren generieren
                </button>
              </div>
              {(selectedObject.regalEbenen ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Noch keine detaillierten Ebenen. Standard-Skalare oben werden verwendet. Klick „Aus Skalaren generieren" um pro Ebene zu konfigurieren.
                </p>
              )}
              {(selectedObject.regalEbenen ?? []).map((ebene, idx) => (
                <div key={ebene.id} className="rounded-md border p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Input
                      value={ebene.name}
                      onChange={(e) => {
                        const aktuelle = selectedObject.regalEbenen ?? [];
                        const updated = aktuelle.map((x, i) => i === idx ? { ...x, name: e.target.value } : x);
                        handleChange('regalEbenen', updated);
                      }}
                      className="text-xs h-7"
                    />
                    <button
                      type="button"
                      className="text-xs text-destructive ml-2"
                      onClick={() => {
                        const aktuelle = selectedObject.regalEbenen ?? [];
                        handleChange('regalEbenen', aktuelle.filter((_, i) => i !== idx));
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Unterkante (m)</Label>
                      <Input
                        type="number"
                        step={0.1}
                        value={ebene.unterkante}
                        onChange={(e) => {
                          const aktuelle = selectedObject.regalEbenen ?? [];
                          const updated = aktuelle.map((x, i) => i === idx ? { ...x, unterkante: parseFloat(e.target.value) || 0 } : x);
                          handleChange('regalEbenen', updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Höhe (m)</Label>
                      <Input
                        type="number"
                        step={0.1}
                        value={ebene.hoehe}
                        onChange={(e) => {
                          const aktuelle = selectedObject.regalEbenen ?? [];
                          const updated = aktuelle.map((x, i) => i === idx ? { ...x, hoehe: parseFloat(e.target.value) || 0 } : x);
                          handleChange('regalEbenen', updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Plätze</Label>
                      <Input
                        type="number"
                        value={ebene.palettenplaetze}
                        onChange={(e) => {
                          const aktuelle = selectedObject.regalEbenen ?? [];
                          const updated = aktuelle.map((x, i) => i === idx ? { ...x, palettenplaetze: parseInt(e.target.value) || 0 } : x);
                          handleChange('regalEbenen', updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Lastenheft 3.1.3.2: 2-n Ebenen, jede Ebene = eigener Stellplatz mit Bezeichnung, Unterkante, Höhe, Palettenplätzen. Pro-Ebene-Bezeichnung wird im Hallenplan angezeigt.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedObject.type === 'bereich' && (
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Bereich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="color" className="text-xs">Farbe</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={selectedObject.color || '#9b59b6'}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={selectedObject.color || '#9b59b6'}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generischer Tags/Meta-Editor — Daniel-Lastenheft "Individualobjekt".
            Verfügbar für ALLE Objekte. Eine KI / ein Berater kann beliebige Felder
            hinzufügen, ohne dass ein neuer ObjectType ins Schema muss. */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Tags & Metadaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="tags" className="text-xs">
                Tags (kommagetrennt, z.B. „messpunkt, scanner, eingang")
              </Label>
              <Input
                id="tags"
                value={(selectedObject.tags || []).join(', ')}
                onChange={(e) => handleChange('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="messpunkt, scanner"
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Form (Visualisierung)
              </Label>
              <select
                value={selectedObject.shape || 'rect'}
                onChange={(e) => handleChange('shape', e.target.value === 'rect' ? undefined : e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="rect">Rechteck (Standard)</option>
                <option value="circle">Kreis (z.B. Scan-Station)</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Metadaten (Key/Value)
              </Label>
              <div className="space-y-1">
                {Object.entries(selectedObject.meta || {}).map(([key, value]) => (
                  <div key={key} className="flex gap-1">
                    <Input
                      value={key}
                      onChange={(e) => {
                        const next = { ...(selectedObject.meta || {}) };
                        delete next[key];
                        next[e.target.value] = value;
                        handleChange('meta', next);
                      }}
                      placeholder="key"
                      className="h-7 flex-1 text-xs"
                    />
                    <Input
                      value={value}
                      onChange={(e) => {
                        handleChange('meta', { ...(selectedObject.meta || {}), [key]: e.target.value });
                      }}
                      placeholder="value"
                      className="h-7 flex-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...(selectedObject.meta || {}) };
                        delete next[key];
                        handleChange('meta', next);
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive px-1"
                      aria-label="Feld entfernen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const meta = { ...(selectedObject.meta || {}) };
                    let newKey = 'feld';
                    let i = 1;
                    while (meta[newKey]) { newKey = `feld${i++}`; }
                    meta[newKey] = '';
                    handleChange('meta', meta);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  + Feld hinzufügen
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Konventionen für Scan-Stationen: <code>code</code> = MP-Nr (z.B. „MP5"),
                <code> rolle</code> = z.B. „Entladung FV". Frei erweiterbar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Color for all types */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Darstellung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Label htmlFor="objColor" className="text-xs">Farbe</Label>
              <div className="flex gap-2">
                <Input
                  id="objColor"
                  type="color"
                  value={selectedObject.color || '#3498db'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input
                  value={selectedObject.color || '#3498db'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

// Kompaktes Zahlenfeld im Figma-Inspector-Stil: Buchstaben-Label + randloses Input.
function NumField({ letter, value, onChange }: { letter: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex h-9 items-center gap-1.5 rounded-lg border bg-muted/30 px-2.5 focus-within:ring-1 focus-within:ring-ring">
      <span className="w-3 shrink-0 text-center font-mono text-[11px] text-muted-foreground">{letter}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border-0 bg-transparent p-0 text-[13px] tabular-nums outline-none"
      />
    </div>
  );
}
