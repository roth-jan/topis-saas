'use client';

import { useState } from 'react';
import { useTopisStore, useObjects, useSelectedObject, useActiveHall } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TopisObject } from '@/types/topis';
import { Square, LayoutGrid, Box, Slash, ChevronDown, ChevronRight, Settings } from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  tor: <Square className="h-3 w-3" />,
  stellplatz: <LayoutGrid className="h-3 w-3" />,
  bereich: <Box className="h-3 w-3" />,
  hindernis: <Slash className="h-3 w-3" />,
};

const typeColors: Record<string, string> = {
  tor: 'bg-blue-500',
  stellplatz: 'bg-emerald-500',
  bereich: 'bg-purple-500',
  hindernis: 'bg-gray-500',
};

export function ObjectList() {
  const objects = useObjects();
  const selectedObject = useSelectedObject();
  const selectObject = useTopisStore((s) => s.selectObject);
  const hall = useActiveHall();
  const updateHall = useTopisStore((s) => s.updateHall);

  const [filter, setFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filteredObjects = filter === 'all'
    ? objects
    : objects.filter(o => o.type === filter);

  const groupedObjects = filteredObjects.reduce((acc, obj) => {
    if (!acc[obj.type]) acc[obj.type] = [];
    acc[obj.type].push(obj);
    return acc;
  }, {} as Record<string, TopisObject[]>);

  const toggleGroup = (type: string) => {
    setCollapsed(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const stats = {
    tore: objects.filter(o => o.type === 'tor').length,
    stellplaetze: objects.filter(o => o.type === 'stellplatz').length,
    bereiche: objects.filter(o => o.type === 'bereich').length,
    gesamt: objects.length,
  };

  return (
    <Tabs defaultValue="objects" className="h-full flex flex-col">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="objects"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Objekte
        </TabsTrigger>
        <TabsTrigger
          value="hall"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          Halle
        </TabsTrigger>
      </TabsList>

      <TabsContent value="objects" className="flex-1 mt-0 overflow-hidden">
        <div className="p-3 border-b">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3 text-center">
            <div className="p-2 rounded bg-muted">
              <div className="text-lg font-bold">{stats.tore}</div>
              <div className="text-xs text-muted-foreground">Tore</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <div className="text-lg font-bold">{stats.stellplaetze}</div>
              <div className="text-xs text-muted-foreground">Stellpl.</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <div className="text-lg font-bold">{stats.bereiche}</div>
              <div className="text-xs text-muted-foreground">Bereiche</div>
            </div>
            <div className="p-2 rounded bg-muted">
              <div className="text-lg font-bold">{stats.gesamt}</div>
              <div className="text-xs text-muted-foreground">Gesamt</div>
            </div>
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Alle Typen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Typen</SelectItem>
              <SelectItem value="tor">Tore</SelectItem>
              <SelectItem value="stellplatz">Stellplätze</SelectItem>
              <SelectItem value="bereich">Bereiche</SelectItem>
              <SelectItem value="hindernis">Hindernisse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {Object.entries(groupedObjects).map(([type, objs]) => (
              <div key={type} className="mb-2">
                <button
                  onClick={() => toggleGroup(type)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded text-sm font-medium"
                >
                  {collapsed[type] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className={`w-2 h-2 rounded-full ${typeColors[type]}`} />
                  <span className="capitalize">{type}</span>
                  <Badge variant="secondary" className="ml-auto">{objs.length}</Badge>
                </button>

                {!collapsed[type] && (
                  <div className="ml-4 space-y-1">
                    {objs.map(obj => (
                      <button
                        key={obj.id}
                        onClick={() => selectObject(obj)}
                        className={`flex items-center gap-2 w-full p-2 rounded text-sm transition-colors
                          ${selectedObject?.id === obj.id
                            ? 'bg-primary/20 text-primary'
                            : 'hover:bg-muted'
                          }`}
                      >
                        {typeIcons[obj.type]}
                        <span className="truncate flex-1 text-left">{obj.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {obj.width}×{obj.height}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {objects.length === 0 && (
              <div className="text-center text-muted-foreground p-4 text-sm">
                Keine Objekte vorhanden
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="hall" className="flex-1 mt-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Hallen-Konfiguration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hallName">Name</Label>
                  <Input
                    id="hallName"
                    value={hall?.name || ''}
                    onChange={(e) => hall && updateHall(hall.id, { name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="hallWidth">Breite (m)</Label>
                    <Input
                      id="hallWidth"
                      type="number"
                      value={hall?.width || 100}
                      onChange={(e) => hall && updateHall(hall.id, { width: parseFloat(e.target.value) || 100 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hallHeight">Tiefe (m)</Label>
                    <Input
                      id="hallHeight"
                      type="number"
                      value={hall?.height || 50}
                      onChange={(e) => hall && updateHall(hall.id, { height: parseFloat(e.target.value) || 50 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Grundform</Label>
                  <Select
                    value={hall?.shape || 'rect'}
                    onValueChange={(v) => hall && updateHall(hall.id, { shape: v as 'rect' | 'L' | 'T' | 'U' | 'C' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rect">Rechteck</SelectItem>
                      <SelectItem value="L">L-Form</SelectItem>
                      <SelectItem value="T">T-Form</SelectItem>
                      <SelectItem value="U">U-Form</SelectItem>
                      <SelectItem value="C">C-Form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 text-sm text-muted-foreground">
                  Fläche: {((hall?.width || 0) * (hall?.height || 0)).toLocaleString()} m²
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
