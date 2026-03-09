'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { useTopisStore } from '@/lib/store';
import { Tool } from '@/types/topis';
import {
  MousePointer2,
  Hand,
  Square,
  LayoutGrid,
  Box,
  Slash,
  Save,
  Download,
  Upload,
  Undo2,
  Redo2,
  Play,
  Grid3X3,
  Magnet,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  DoorOpen,
  Layers,
  Route,
  Warehouse,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  const setTool = useTopisStore((s) => s.setTool);
  const toggleGrid = useTopisStore((s) => s.toggleGrid);
  const toggleSnap = useTopisStore((s) => s.toggleSnap);
  const setZoom = useTopisStore((s) => s.setZoom);
  const zoom = useTopisStore((s) => s.zoom);
  const resetState = useTopisStore((s) => s.resetState);
  const objects = useTopisStore((s) => s.objects);
  const selectObject = useTopisStore((s) => s.selectObject);

  // Keyboard shortcut to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

  const selectTool = (tool: Tool, name: string) => {
    runCommand(() => {
      setTool(tool);
      toast.success(`Tool: ${name}`);
    });
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Suche nach Befehlen, Objekten..." />
      <CommandList>
        <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

        {/* Tools */}
        <CommandGroup heading="Werkzeuge">
          <CommandItem onSelect={() => selectTool('select', 'Auswahl')}>
            <MousePointer2 className="mr-2 h-4 w-4" />
            Auswahl-Werkzeug
            <CommandShortcut>V</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => selectTool('pan', 'Verschieben')}>
            <Hand className="mr-2 h-4 w-4" />
            Verschieben
            <CommandShortcut>H</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => selectTool('tor', 'Tor')}>
            <DoorOpen className="mr-2 h-4 w-4" />
            Tor hinzufügen
            <CommandShortcut>T</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => selectTool('stellplatz', 'Stellplatz')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Stellplatz hinzufügen
            <CommandShortcut>S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => selectTool('bereich', 'Bereich')}>
            <Layers className="mr-2 h-4 w-4" />
            Bereich hinzufügen
            <CommandShortcut>B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => selectTool('path', 'Weg')}>
            <Route className="mr-2 h-4 w-4" />
            Weg zeichnen
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Actions */}
        <CommandGroup heading="Aktionen">
          <CommandItem onSelect={() => runCommand(() => toast.info('Speichern...'))}>
            <Save className="mr-2 h-4 w-4" />
            Projekt speichern
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => toast.info('Export...'))}>
            <Download className="mr-2 h-4 w-4" />
            Exportieren
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => toast.info('Import...'))}>
            <Upload className="mr-2 h-4 w-4" />
            Importieren
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* View */}
        <CommandGroup heading="Ansicht">
          <CommandItem onSelect={() => runCommand(() => { toggleGrid(); toast.success('Raster umgeschaltet'); })}>
            <Grid3X3 className="mr-2 h-4 w-4" />
            Raster ein/aus
            <CommandShortcut>G</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { toggleSnap(); toast.success('Einrasten umgeschaltet'); })}>
            <Magnet className="mr-2 h-4 w-4" />
            Einrasten ein/aus
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { setZoom(zoom * 1.2); })}>
            <ZoomIn className="mr-2 h-4 w-4" />
            Vergrößern
            <CommandShortcut>+</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { setZoom(zoom / 1.2); })}>
            <ZoomOut className="mr-2 h-4 w-4" />
            Verkleinern
            <CommandShortcut>-</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { setZoom(1); toast.success('Zoom zurückgesetzt'); })}>
            <Maximize2 className="mr-2 h-4 w-4" />
            Zoom zurücksetzen
            <CommandShortcut>0</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Szenarien */}
        <CommandGroup heading="Szenarien">
          <CommandItem onSelect={() => runCommand(() => { resetState(); toast.success('Standard-Halle geladen'); })}>
            <Warehouse className="mr-2 h-4 w-4" />
            Standard-Halle (100x50m)
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => toast.info('Umschlag-Szenario...'))}>
            <Package className="mr-2 h-4 w-4" />
            Umschlag-Szenario
          </CommandItem>
        </CommandGroup>

        {/* Objects Search */}
        {objects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Objekte">
              {objects.slice(0, 10).map((obj) => (
                <CommandItem
                  key={obj.id}
                  onSelect={() => runCommand(() => {
                    selectObject(obj);
                    toast.success(`${obj.name} ausgewählt`);
                  })}
                >
                  <Box className="mr-2 h-4 w-4" />
                  {obj.name}
                  <CommandShortcut>{obj.type}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        {/* Danger Zone */}
        <CommandGroup heading="Gefahrenzone">
          <CommandItem
            onSelect={() => runCommand(() => {
              if (confirm('Alle Objekte löschen?')) {
                resetState();
                toast.success('Alles gelöscht');
              }
            })}
            className="text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Alles löschen
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
