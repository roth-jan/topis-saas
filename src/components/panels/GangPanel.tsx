'use client';

import { useState } from 'react';
import { useTopisStore, useActiveHall, useObjects } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Truck,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Wand2,
  Plus,
  Route,
  Ruler,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateGaenge, GangSettings, DEFAULT_GANG_SETTINGS, calculateTotalGangLength, calculateGangArea } from '@/lib/gang-generator';

export function GangPanel() {
  const hall = useActiveHall();
  const objects = useObjects();
  const gaenge = useTopisStore((s) => s.gaenge);
  const setGaenge = useTopisStore((s) => s.setGaenge);
  const showGaenge = useTopisStore((s) => s.showGaenge);
  const toggleShowGaenge = useTopisStore((s) => s.toggleShowGaenge);

  const [settings, setSettings] = useState<GangSettings>(DEFAULT_GANG_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isListOpen, setIsListOpen] = useState(true);

  const handleGenerateGaenge = () => {
    if (objects.length === 0) {
      toast.warning('Keine Objekte vorhanden. Platziere erst Tore, Regale oder Stellplätze.');
      return;
    }

    if (gaenge.length > 0) {
      if (!confirm(`${gaenge.length} bestehende Gänge durch neue ersetzen?`)) {
        return;
      }
    }

    const neueGaenge = generateGaenge(hall, objects, settings);
    setGaenge(neueGaenge);
    toast.success(`${neueGaenge.length} Gänge automatisch generiert`);
  };

  const handleDeleteGang = (id: number) => {
    setGaenge(gaenge.filter(g => g.id !== id));
    toast.info('Gang gelöscht');
  };

  const handleClearAll = () => {
    if (gaenge.length === 0) return;
    if (confirm('Alle Gänge löschen?')) {
      setGaenge([]);
      toast.info('Alle Gänge gelöscht');
    }
  };

  const totalLength = calculateTotalGangLength(gaenge);
  const totalArea = calculateGangArea(gaenge);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Fahrgänge
          </CardTitle>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={toggleShowGaenge}
                  >
                    {showGaenge ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showGaenge ? 'Gänge ausblenden' : 'Gänge einblenden'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription className="text-xs">
          {gaenge.length} Gänge | {totalLength.toFixed(1)}m Länge | {totalArea.toFixed(1)}m² Fläche
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Auto-Generate Section */}
        <Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 p-2 h-auto">
              {isSettingsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Wand2 className="h-4 w-4" />
              Automatische Generierung
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="hauptgangBreite" className="text-xs">Hauptgang-Breite</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="hauptgangBreite"
                    type="number"
                    value={settings.hauptgangBreite}
                    onChange={(e) => setSettings({ ...settings, hauptgangBreite: parseFloat(e.target.value) || 3.5 })}
                    className="w-16 h-7 text-xs"
                    min={1.5}
                    max={8}
                    step={0.5}
                  />
                  <span className="text-xs text-muted-foreground">m</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="regalgangBreite" className="text-xs">Regalgang-Breite</Label>
                <div className="flex items-center gap-1">
                  <Input
                    id="regalgangBreite"
                    type="number"
                    value={settings.regalgangBreite}
                    onChange={(e) => setSettings({ ...settings, regalgangBreite: parseFloat(e.target.value) || 2.5 })}
                    className="w-16 h-7 text-xs"
                    min={1.5}
                    max={5}
                    step={0.5}
                  />
                  <span className="text-xs text-muted-foreground">m</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="genHauptweg" className="text-xs">Hauptweg generieren</Label>
                <Switch
                  id="genHauptweg"
                  checked={settings.generateHauptweg}
                  onCheckedChange={(checked) => setSettings({ ...settings, generateHauptweg: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="genZufahrten" className="text-xs">Zufahrten generieren</Label>
                <Switch
                  id="genZufahrten"
                  checked={settings.generateZufahrten}
                  onCheckedChange={(checked) => setSettings({ ...settings, generateZufahrten: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="genRegalgaenge" className="text-xs">Regalgänge generieren</Label>
                <Switch
                  id="genRegalgaenge"
                  checked={settings.generateRegalgaenge}
                  onCheckedChange={(checked) => setSettings({ ...settings, generateRegalgaenge: checked })}
                />
              </div>
            </div>

            <Button onClick={handleGenerateGaenge} className="w-full" size="sm">
              <Wand2 className="h-4 w-4 mr-2" />
              Gänge generieren
            </Button>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Gang List */}
        <Collapsible open={isListOpen} onOpenChange={setIsListOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 p-2 h-auto">
              {isListOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Route className="h-4 w-4" />
              Gang-Liste ({gaenge.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {gaenge.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Keine Gänge vorhanden
              </p>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {gaenge.map((gang) => (
                    <div
                      key={gang.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: gang.farbe || '#4ade80' }}
                        />
                        <div>
                          <p className="text-xs font-medium">{gang.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {gang.breite}m breit | {gang.typ}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteGang(gang.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {gaenge.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={handleClearAll}
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
