'use client';

import { useTopisStore, useSelectedObject } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Copy, RotateCw } from 'lucide-react';

export function PropertiesPanel() {
  const selectedObject = useSelectedObject();
  const updateObject = useTopisStore((s) => s.updateObject);
  const deleteObject = useTopisStore((s) => s.deleteObject);
  const selectObject = useTopisStore((s) => s.selectObject);

  if (!selectedObject) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Kein Objekt ausgewählt</p>
        <p className="text-xs mt-2">Klicke auf ein Objekt um es zu bearbeiten</p>
      </div>
    );
  }

  const handleChange = (field: string, value: string | number) => {
    updateObject(selectedObject.id, { [field]: value });
  };

  const handleDelete = () => {
    deleteObject(selectedObject.id);
    selectObject(null);
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
            <Button variant="ghost" size="icon">
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

        {/* Position */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="x" className="text-xs">X (m)</Label>
                <Input
                  id="x"
                  type="number"
                  value={selectedObject.x}
                  onChange={(e) => handleChange('x', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="y" className="text-xs">Y (m)</Label>
                <Input
                  id="y"
                  type="number"
                  value={selectedObject.y}
                  onChange={(e) => handleChange('y', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Size */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Größe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="width" className="text-xs">Breite (m)</Label>
                <Input
                  id="width"
                  type="number"
                  value={selectedObject.width}
                  onChange={(e) => handleChange('width', parseFloat(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="height" className="text-xs">Tiefe (m)</Label>
                <Input
                  id="height"
                  type="number"
                  value={selectedObject.height}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="rotation" className="text-xs">Rotation (°)</Label>
                <Input
                  id="rotation"
                  type="number"
                  value={selectedObject.rotation || 0}
                  onChange={(e) => handleChange('rotation', parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="mt-5"
                onClick={() => handleChange('rotation', ((selectedObject.rotation || 0) + 90) % 360)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Type-specific properties */}
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
