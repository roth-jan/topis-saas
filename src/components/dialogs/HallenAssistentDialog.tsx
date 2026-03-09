'use client';

import { useState } from 'react';
import { useTopisStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wand2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { OBJECT_COLORS } from '@/types/topis';

interface HallConfig {
  name: string;
  width: number;
  height: number;
  totalTore: number;
  toreWest: number;
  toreOst: number;
  toreNord: number;
  toreSued: number;
  autoDistribute: boolean;
  hasAnbau: boolean;
  anbauFlaeche: number;
  anbauTore: number;
  anbauPosition: 'nord' | 'ost' | 'sued' | 'west';
}

const defaultConfig: HallConfig = {
  name: 'Neue Halle',
  width: 100,
  height: 50,
  totalTore: 20,
  toreWest: 5,
  toreOst: 5,
  toreNord: 5,
  toreSued: 5,
  autoDistribute: true,
  hasAnbau: false,
  anbauFlaeche: 500,
  anbauTore: 2,
  anbauPosition: 'ost',
};

export function HallenAssistentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<HallConfig>(defaultConfig);

  const resetState = useTopisStore((s) => s.resetState);
  const updateHall = useTopisStore((s) => s.updateHall);
  const addObject = useTopisStore((s) => s.addObject);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setStep(1);
      setConfig(defaultConfig);
    }
    setIsOpen(open);
  };

  const updateConfig = (updates: Partial<HallConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };

      // Auto-distribute gates if enabled
      if (newConfig.autoDistribute && 'totalTore' in updates) {
        const total = updates.totalTore || prev.totalTore;
        // 80% on long sides, 20% on short sides
        const longSide = Math.floor(total * 0.4);
        const shortSide = Math.floor(total * 0.1);

        if (newConfig.width > newConfig.height) {
          // Width is longer
          newConfig.toreNord = longSide;
          newConfig.toreSued = longSide;
          newConfig.toreWest = shortSide;
          newConfig.toreOst = total - longSide * 2 - shortSide;
        } else {
          // Height is longer
          newConfig.toreWest = longSide;
          newConfig.toreOst = longSide;
          newConfig.toreNord = shortSide;
          newConfig.toreSued = total - longSide * 2 - shortSide;
        }
      }

      return newConfig;
    });
  };

  const applyLayout = () => {
    // Reset current state
    resetState();

    // Update hall
    updateHall(1, {
      name: config.name,
      width: config.width,
      height: config.height,
      color: '#16213e',
    });

    const torWidth = 3.5;
    const torHeight = 1.5;

    // Add gates on each side
    // West side (x = 0)
    if (config.toreWest > 0) {
      const spacing = config.height / (config.toreWest + 1);
      for (let i = 0; i < config.toreWest; i++) {
        addObject({
          type: 'tor',
          x: 0,
          y: spacing * (i + 1) - torWidth / 2,
          width: torHeight,
          height: torWidth,
          name: `W${i + 1}`,
          color: OBJECT_COLORS.tor,
        });
      }
    }

    // Ost side (x = width - torHeight)
    if (config.toreOst > 0) {
      const spacing = config.height / (config.toreOst + 1);
      for (let i = 0; i < config.toreOst; i++) {
        addObject({
          type: 'tor',
          x: config.width - torHeight,
          y: spacing * (i + 1) - torWidth / 2,
          width: torHeight,
          height: torWidth,
          name: `O${i + 1}`,
          color: OBJECT_COLORS.tor,
        });
      }
    }

    // Nord side (y = 0)
    if (config.toreNord > 0) {
      const spacing = config.width / (config.toreNord + 1);
      for (let i = 0; i < config.toreNord; i++) {
        addObject({
          type: 'tor',
          x: spacing * (i + 1) - torWidth / 2,
          y: 0,
          width: torWidth,
          height: torHeight,
          name: `N${i + 1}`,
          color: OBJECT_COLORS.tor,
        });
      }
    }

    // Süd side (y = height - torHeight)
    if (config.toreSued > 0) {
      const spacing = config.width / (config.toreSued + 1);
      for (let i = 0; i < config.toreSued; i++) {
        addObject({
          type: 'tor',
          x: spacing * (i + 1) - torWidth / 2,
          y: config.height - torHeight,
          width: torWidth,
          height: torHeight,
          name: `S${i + 1}`,
          color: OBJECT_COLORS.tor,
        });
      }
    }

    // Add Anbau if configured
    if (config.hasAnbau) {
      const anbauWidth = Math.sqrt(config.anbauFlaeche * (config.width / config.height));
      const anbauHeight = config.anbauFlaeche / anbauWidth;

      let anbauX = 0, anbauY = 0;
      switch (config.anbauPosition) {
        case 'nord':
          anbauX = (config.width - anbauWidth) / 2;
          anbauY = -anbauHeight;
          break;
        case 'sued':
          anbauX = (config.width - anbauWidth) / 2;
          anbauY = config.height;
          break;
        case 'west':
          anbauX = -anbauWidth;
          anbauY = (config.height - anbauHeight) / 2;
          break;
        case 'ost':
          anbauX = config.width;
          anbauY = (config.height - anbauHeight) / 2;
          break;
      }

      addObject({
        type: 'bereich',
        x: anbauX,
        y: anbauY,
        width: anbauWidth,
        height: anbauHeight,
        name: 'Anbau',
        color: '#2d3748',
      });
    }

    const totalGates = config.toreWest + config.toreOst + config.toreNord + config.toreSued;
    toast.success(`Halle "${config.name}" mit ${totalGates} Toren erstellt!`);
    setIsOpen(false);
  };

  const totalTore = config.toreWest + config.toreOst + config.toreNord + config.toreSued;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Wand2 className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Assistent</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Hallen-Assistent</DialogTitle>
          <DialogDescription>
            Schritt {step} von 3: {step === 1 ? 'Grunddaten' : step === 2 ? 'Tore konfigurieren' : 'Zusammenfassung'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s === step
                  ? 'bg-primary text-primary-foreground'
                  : s < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
          ))}
        </div>

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Hallenname</Label>
              <Input
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                placeholder="z.B. Halle 6"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Breite (m)</Label>
                <Input
                  type="number"
                  min={10}
                  max={500}
                  value={config.width}
                  onChange={(e) => updateConfig({ width: parseFloat(e.target.value) || 100 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Länge (m)</Label>
                <Input
                  type="number"
                  min={10}
                  max={500}
                  value={config.height}
                  onChange={(e) => updateConfig({ height: parseFloat(e.target.value) || 50 })}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Fläche: {(config.width * config.height).toLocaleString('de-DE')} m²
            </div>
          </div>
        )}

        {/* Step 2: Gates */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Gesamtanzahl Tore</Label>
              <Input
                type="number"
                min={0}
                max={200}
                value={config.totalTore}
                onChange={(e) => updateConfig({ totalTore: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoDistribute"
                checked={config.autoDistribute}
                onCheckedChange={(checked) => updateConfig({ autoDistribute: !!checked })}
              />
              <Label htmlFor="autoDistribute">Automatisch verteilen (80% lange Seiten)</Label>
            </div>

            {!config.autoDistribute && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm">West</Label>
                  <Input
                    type="number"
                    min={0}
                    value={config.toreWest}
                    onChange={(e) => updateConfig({ toreWest: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Ost</Label>
                  <Input
                    type="number"
                    min={0}
                    value={config.toreOst}
                    onChange={(e) => updateConfig({ toreOst: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Nord</Label>
                  <Input
                    type="number"
                    min={0}
                    value={config.toreNord}
                    onChange={(e) => updateConfig({ toreNord: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Süd</Label>
                  <Input
                    type="number"
                    min={0}
                    value={config.toreSued}
                    onChange={(e) => updateConfig({ toreSued: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Verteilung: W:{config.toreWest} | O:{config.toreOst} | N:{config.toreNord} | S:{config.toreSued} = {totalTore} Tore
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAnbau"
                  checked={config.hasAnbau}
                  onCheckedChange={(checked) => updateConfig({ hasAnbau: !!checked })}
                />
                <Label htmlFor="hasAnbau">Hat Anbau</Label>
              </div>

              {config.hasAnbau && (
                <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm">Anbau-Fläche (m²)</Label>
                    <Input
                      type="number"
                      min={100}
                      value={config.anbauFlaeche}
                      onChange={(e) => updateConfig({ anbauFlaeche: parseFloat(e.target.value) || 500 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Position</Label>
                    <select
                      className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                      value={config.anbauPosition}
                      onChange={(e) => updateConfig({ anbauPosition: e.target.value as HallConfig['anbauPosition'] })}
                    >
                      <option value="nord">Nord</option>
                      <option value="ost">Ost</option>
                      <option value="sued">Süd</option>
                      <option value="west">West</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium">{config.name}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Größe:</div>
                <div>{config.width}m × {config.height}m</div>
                <div className="text-muted-foreground">Fläche:</div>
                <div>{(config.width * config.height).toLocaleString('de-DE')} m²</div>
                <div className="text-muted-foreground">Tore gesamt:</div>
                <div>{totalTore}</div>
                <div className="text-muted-foreground">Verteilung:</div>
                <div>W:{config.toreWest} | O:{config.toreOst} | N:{config.toreNord} | S:{config.toreSued}</div>
                {config.hasAnbau && (
                  <>
                    <div className="text-muted-foreground">Anbau:</div>
                    <div>{config.anbauFlaeche} m² ({config.anbauPosition})</div>
                  </>
                )}
              </div>
            </div>

            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              ⚠️ Das aktuelle Layout wird durch das neue ersetzt.
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Zurück
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Abbrechen
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>
                Weiter
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={applyLayout}>
                <Check className="h-4 w-4 mr-1" />
                Layout erstellen
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
