'use client';

import { useState } from 'react';
import { useTopisStore, useTool, useZoom } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Tool } from '@/types/topis';
import { exportToJSON, importFromJSON, downloadFile, openFileDialog, downloadSVG } from '@/lib/export';
import { generateGaenge, DEFAULT_GANG_SETTINGS } from '@/lib/gang-generator';
import { ProjektVergleichDialog } from '@/components/dialogs/ProjektVergleichDialog';
import { ThemeToggleSimple } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';
import { SimulationDialog } from '@/components/dialogs/SimulationDialog';
import { ShowcaseDialog } from '@/components/dialogs/ShowcaseDialog';
import { MultiInsertDialog } from '@/components/dialogs/MultiInsertDialog';
import { MatrixDialog } from '@/components/dialogs/MatrixDialog';
import { HallenAssistentDialog } from '@/components/dialogs/HallenAssistentDialog';
import { TorKalkulationDialog } from '@/components/dialogs/TorKalkulationDialog';
import { BetriebsdatenImportDialog } from '@/components/dialogs/BetriebsdatenImportDialog';
import { SzenarienDialog } from '@/components/dialogs/SzenarienDialog';
import { DEMO_SCENARIOS } from '@/lib/showcase';
import { printLayout, exportReport } from '@/lib/export';
import { loadSchmidLayout } from '@/lib/layouts/schmid-halle6';
import {
  MousePointer2,
  Hand,
  DoorOpen,
  LayoutGrid,
  Layers,
  CircleOff,
  Save,
  Download,
  Upload,
  Undo2,
  Redo2,
  Play,
  Presentation,
  Target,
  Route,
  Grid3X3,
  Magnet,
  Search,
  Truck,
  ChevronDown,
  FileJson,
  Image,
  Printer,
  Settings,
  Warehouse,
  Package,
  Zap,
  Moon,
  Sun,
  Monitor,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  RotateCcw,
  RotateCw,
  Copy,
  Clipboard,
  Scissors,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Columns,
  Plus,
  FolderOpen,
  FilePlus,
  Clock,
  HelpCircle,
  Info,
  Keyboard,
  Menu,
  PanelLeft,
  BarChart3,
  Calculator,
  Ruler,
  Palette,
  ShoppingCart,
  AlertTriangle,
  Ban,
  HelpingHand,
  Building2,
  Coffee,
  Bath,
  Plug,
  Footprints,
  Square,
  RectangleHorizontal,
  Database,
  GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';

// Tool definitions - Main toolbar buttons
const tools: { id: Tool; label: string; shortcut: string; icon: React.ReactNode; group: number }[] = [
  { id: 'select', label: 'Auswahl', shortcut: 'V', icon: <MousePointer2 className="h-4 w-4" />, group: 1 },
  { id: 'pan', label: 'Verschieben', shortcut: 'H', icon: <Hand className="h-4 w-4" />, group: 1 },
  { id: 'tor', label: 'Tor', shortcut: 'T', icon: <DoorOpen className="h-4 w-4" />, group: 2 },
  { id: 'stellplatz', label: 'Stellplatz', shortcut: 'S', icon: <LayoutGrid className="h-4 w-4" />, group: 2 },
  { id: 'regal', label: 'Regal', shortcut: 'R', icon: <RectangleHorizontal className="h-4 w-4" />, group: 2 },
  { id: 'bereich', label: 'Bereich', shortcut: 'B', icon: <Layers className="h-4 w-4" />, group: 2 },
  { id: 'path', label: 'Weg', shortcut: 'P', icon: <Route className="h-4 w-4" />, group: 3 },
  { id: 'gang', label: 'Fahrgang', shortcut: 'G', icon: <Truck className="h-4 w-4" />, group: 3 },
  { id: 'conveyor', label: 'Förderband', shortcut: 'C', icon: <ArrowRight className="h-4 w-4" />, group: 3 },
  { id: 'measure', label: 'Messen', shortcut: 'M', icon: <Ruler className="h-4 w-4" />, group: 3 },
];

// All object types for the dropdown menu
const objectTypes: { id: string; label: string; icon: React.ReactNode; shortcut?: string; category?: string }[] = [
  // Haupt-Objekte
  { id: 'tor', label: 'Tor', icon: <DoorOpen className="h-4 w-4" />, shortcut: 'T', category: 'haupt' },
  { id: 'stellplatz', label: 'Stellplatz', icon: <LayoutGrid className="h-4 w-4" />, shortcut: 'S', category: 'haupt' },
  { id: 'regal', label: 'Regal', icon: <RectangleHorizontal className="h-4 w-4" />, shortcut: 'R', category: 'haupt' },
  { id: 'bereich', label: 'Bereich', icon: <Layers className="h-4 w-4" />, shortcut: 'B', category: 'haupt' },
  { id: 'entladebereich', label: 'Entladebereich', icon: <Package className="h-4 w-4" />, category: 'haupt' },
  // Infrastruktur
  { id: 'rampe', label: 'Rampe', icon: <Square className="h-4 w-4" />, category: 'infra' },
  { id: 'leveller', label: 'Leveller', icon: <Square className="h-4 w-4" />, category: 'infra' },
  { id: 'ladestation', label: 'Ladestation', icon: <Plug className="h-4 w-4" />, category: 'infra' },
  { id: 'treppe', label: 'Treppe', icon: <Footprints className="h-4 w-4" />, category: 'infra' },
  // Bauteile
  { id: 'wand', label: 'Wand', icon: <Square className="h-4 w-4" />, shortcut: 'W', category: 'bau' },
  { id: 'tuer', label: 'Tür', icon: <DoorOpen className="h-4 w-4" />, category: 'bau' },
  { id: 'pfosten', label: 'Pfosten', icon: <Square className="h-4 w-4" />, category: 'bau' },
  { id: 'hindernis', label: 'Hindernis', icon: <CircleOff className="h-4 w-4" />, category: 'bau' },
  // Spezial-Bereiche
  { id: 'gefahrgut', label: 'Gefahrgut', icon: <AlertTriangle className="h-4 w-4" />, category: 'spezial' },
  { id: 'sperrplatz', label: 'Sperrplatz', icon: <Ban className="h-4 w-4" />, category: 'spezial' },
  { id: 'klaerplatz', label: 'Klärplatz', icon: <HelpingHand className="h-4 w-4" />, category: 'spezial' },
  // Sozial
  { id: 'buero', label: 'Büro', icon: <Building2 className="h-4 w-4" />, category: 'sozial' },
  { id: 'sozialraum', label: 'Sozialraum', icon: <Coffee className="h-4 w-4" />, category: 'sozial' },
  { id: 'wc', label: 'WC', icon: <Bath className="h-4 w-4" />, category: 'sozial' },
  // Außenbereich
  { id: 'outdoor_area', label: 'Außenbereich', icon: <Square className="h-4 w-4" />, category: 'outdoor' },
  { id: 'outdoor_road', label: 'Straße', icon: <Square className="h-4 w-4" />, category: 'outdoor' },
  { id: 'trailer_spot', label: 'Wechselbrücke', icon: <Truck className="h-4 w-4" />, category: 'outdoor' },
  { id: 'parking', label: 'Parkplatz', icon: <Square className="h-4 w-4" />, category: 'outdoor' },
  // Benutzerdefiniert
  { id: 'custom', label: 'Benutzerdefiniert', icon: <Square className="h-4 w-4" />, category: 'custom' },
];

export function Toolbar() {
  const currentTool = useTool();
  const setTool = useTopisStore((s) => s.setTool);
  const toggleGrid = useTopisStore((s) => s.toggleGrid);
  const toggleSnap = useTopisStore((s) => s.toggleSnap);
  const showGrid = useTopisStore((s) => s.showGrid);
  const snapToGrid = useTopisStore((s) => s.snapToGrid);
  const zoom = useZoom();
  const setZoom = useTopisStore((s) => s.setZoom);
  const resetState = useTopisStore((s) => s.resetState);
  const loadState = useTopisStore((s) => s.loadState);
  const showGaenge = useTopisStore((s) => s.showGaenge);
  const toggleShowGaenge = useTopisStore((s) => s.toggleShowGaenge);

  // Get state for export
  const halls = useTopisStore((s) => s.halls);
  const activeHallId = useTopisStore((s) => s.activeHallId);
  const objects = useTopisStore((s) => s.objects);
  const paths = useTopisStore((s) => s.paths);
  const pathAreas = useTopisStore((s) => s.pathAreas);
  const gaenge = useTopisStore((s) => s.gaenge);
  const setGaenge = useTopisStore((s) => s.setGaenge);
  const ffz = useTopisStore((s) => s.ffz);
  const conveyors = useTopisStore((s) => s.conveyors);
  const rotateHall90 = useTopisStore((s) => s.rotateHall90);
  const updateHall = useTopisStore((s) => s.updateHall);
  const addObject = useTopisStore((s) => s.addObject);
  const undo = useTopisStore((s) => s.undo);
  const redo = useTopisStore((s) => s.redo);
  const canUndo = useTopisStore((s) => s.undoStack.length > 0);
  const canRedo = useTopisStore((s) => s.redoStack.length > 0);
  const resetToOriginal = useTopisStore((s) => s.resetToOriginal);
  const originalLayout = useTopisStore((s) => s.originalLayout);

  // Get active hall
  const activeHall = halls.find(h => h.id === activeHallId) || halls[0];

  const { theme, setTheme } = useTheme();
  const [showRulers, setShowRulers] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // Export handlers
  const handleExportJSON = () => {
    const state = { halls, activeHallId, objects, paths, pathAreas, gaenge, ffz, conveyors };
    const json = exportToJSON(state, 'TOPIS Projekt');
    downloadFile(json, 'projekt.topis', 'application/json');
    toast.success('Projekt als JSON exportiert');
  };

  const handleExportSVG = () => {
    const state = { halls, objects };
    downloadSVG(state, 'halle.svg');
    toast.success('Als SVG exportiert');
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'halle.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Als PNG exportiert');
    } else {
      toast.error('Canvas nicht gefunden');
    }
  };

  const handleImport = async () => {
    try {
      const content = await openFileDialog('.json,.topis');
      const newState = importFromJSON(content);
      if (newState) {
        loadState(newState);
        toast.success('Projekt erfolgreich importiert');
      } else {
        toast.error('Ungültige Projektdatei');
      }
    } catch (error) {
      toast.error('Fehler beim Import');
    }
  };

  const handleSave = () => {
    const state = { halls, activeHallId, objects, paths, pathAreas, gaenge, ffz, conveyors };
    const json = exportToJSON(state, 'TOPIS Projekt');
    // Store in localStorage
    localStorage.setItem('topis-project', json);
    toast.success('Projekt gespeichert');
  };

  const handleOpen = () => {
    const saved = localStorage.getItem('topis-project');
    if (saved) {
      const newState = importFromJSON(saved);
      if (newState) {
        loadState(newState);
        toast.success('Projekt geladen');
      }
    } else {
      toast.info('Kein gespeichertes Projekt gefunden');
    }
  };

  // Gang-Generator
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

    const neueGaenge = generateGaenge(activeHall, objects, DEFAULT_GANG_SETTINGS);
    setGaenge(neueGaenge);
    toast.success(`${neueGaenge.length} Gänge automatisch generiert`);
  };

  // Szenario laden
  const handleLoadScenario = (scenarioKey: string) => {
    const scenario = DEMO_SCENARIOS[scenarioKey];
    if (!scenario) {
      toast.error('Szenario nicht gefunden');
      return;
    }

    if (objects.length > 0) {
      if (!confirm('Aktuelles Layout durch Szenario ersetzen?')) {
        return;
      }
    }

    // Reset und Hall aktualisieren
    resetState();

    // Hall-Einstellungen anwenden
    if (scenario.hall) {
      updateHall(1, scenario.hall);
    }

    // Objekte hinzufügen
    scenario.objects.forEach(obj => {
      addObject(obj);
    });

    // Gänge hinzufügen
    if (scenario.gaenge.length > 0) {
      setGaenge(scenario.gaenge);
    }

    toast.success(`"${scenario.name}" geladen`);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-2 gap-1 overflow-x-auto min-w-0">

        {/* Logo */}
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
            T
          </div>
          <span className="font-semibold hidden sm:inline">TOPIS</span>
          <Badge variant="outline" className="text-[10px] hidden md:inline-flex">SaaS</Badge>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ FILE MENU ============ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 px-2">
              Datei <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Projekt</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { resetState(); toast.success('Neues Projekt erstellt'); }}>
              <FilePlus className="mr-2 h-4 w-4" />
              Neues Projekt
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpen}>
              <FolderOpen className="mr-2 h-4 w-4" />
              Öffnen (lokal)
              <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" />
              Importieren...
              <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Betriebsdaten</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              // Trigger the BetriebsdatenImportDialog by clicking its trigger
              const btn = document.querySelector('[data-betriebsdaten-trigger]') as HTMLButtonElement;
              if (btn) btn.click();
            }}>
              <Database className="mr-2 h-4 w-4" />
              Betriebsdaten importieren...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Vorlagen</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => { loadSchmidLayout(); toast.success('Andreas Schmid Halle 6 geladen'); }}>
              <Warehouse className="mr-2 h-4 w-4" />
              Andreas Schmid - Halle 6
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Speichern (lokal)
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Speichern unter...
              <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Download className="mr-2 h-4 w-4" />
                Exportieren
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={handleExportPNG}>
                  <Image className="mr-2 h-4 w-4" />
                  Als Bild (PNG)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportSVG}>
                  <Image className="mr-2 h-4 w-4" />
                  Als Vektor (SVG)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Als JSON (.topis)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('PDF-Export kommt bald...')}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Als PDF
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <Upload className="mr-2 h-4 w-4" />
              Importieren...
              <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              const canvas = document.querySelector('canvas');
              if (canvas && activeHall) {
                printLayout(canvas as HTMLCanvasElement, activeHall, objects);
              } else {
                toast.error('Canvas nicht gefunden');
              }
            }}>
              <Printer className="mr-2 h-4 w-4" />
              Drucken...
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ============ EDIT MENU ============ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 px-2">
              Bearbeiten <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem onClick={() => { undo(); toast.info('Rückgängig'); }} disabled={!canUndo}>
              <Undo2 className="mr-2 h-4 w-4" />
              Rückgängig
              <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { redo(); toast.info('Wiederholt'); }} disabled={!canRedo}>
              <Redo2 className="mr-2 h-4 w-4" />
              Wiederholen
              <DropdownMenuShortcut>⇧⌘Z</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Scissors className="mr-2 h-4 w-4" />
              Ausschneiden
              <DropdownMenuShortcut>⌘X</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Kopieren
              <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Clipboard className="mr-2 h-4 w-4" />
              Einfügen
              <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
              <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <MousePointer2 className="mr-2 h-4 w-4" />
              Alles auswählen
              <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              rotateHall90();
              toast.success('Halle um 90° gedreht');
            }}>
              <RotateCw className="mr-2 h-4 w-4" />
              Halle 90° drehen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ============ VIEW MENU ============ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 px-2">
              Ansicht <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Zoom</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setZoom(zoom * 1.25)}>
              <ZoomIn className="mr-2 h-4 w-4" />
              Vergrößern
              <DropdownMenuShortcut>⌘+</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom(zoom / 1.25)}>
              <ZoomOut className="mr-2 h-4 w-4" />
              Verkleinern
              <DropdownMenuShortcut>⌘-</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom(1)}>
              <Maximize2 className="mr-2 h-4 w-4" />
              100%
              <DropdownMenuShortcut>⌘0</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Maximize2 className="mr-2 h-4 w-4" />
              An Fenster anpassen
              <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Anzeigen</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={showGrid} onCheckedChange={toggleGrid}>
              <Grid3X3 className="mr-2 h-4 w-4" />
              Raster
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={snapToGrid} onCheckedChange={toggleSnap}>
              <Magnet className="mr-2 h-4 w-4" />
              Einrasten
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showGaenge} onCheckedChange={toggleShowGaenge}>
              <Truck className="mr-2 h-4 w-4" />
              Fahrgänge
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showRulers} onCheckedChange={setShowRulers}>
              <Ruler className="mr-2 h-4 w-4" />
              Lineale
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showMeasurements} onCheckedChange={setShowMeasurements}>
              <Move className="mr-2 h-4 w-4" />
              Maße anzeigen
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme || 'dark'} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <Sun className="mr-2 h-4 w-4" />
                Hell
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon className="mr-2 h-4 w-4" />
                Dunkel
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ============ OBJECTS MENU ============ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 px-2">
              Objekte <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Hauptobjekte</DropdownMenuLabel>
            {objectTypes.slice(0, 4).map((obj) => (
              <DropdownMenuItem key={obj.id} onClick={() => setTool(obj.id as Tool)}>
                {obj.icon}
                <span className="ml-2">{obj.label}</span>
                {obj.shortcut && <DropdownMenuShortcut>{obj.shortcut}</DropdownMenuShortcut>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Square className="mr-2 h-4 w-4" />
                Gebäudeelemente
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {objectTypes.filter(o => ['rampe', 'leveller', 'pfosten', 'treppe', 'hindernis'].includes(o.id)).map((obj) => (
                  <DropdownMenuItem key={obj.id} onClick={() => setTool(obj.id as Tool)}>
                    {obj.icon}
                    <span className="ml-2">{obj.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Spezialzonen
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {objectTypes.filter(o => ['ladestation', 'gefahrgut', 'sperrplatz', 'klaerplatz'].includes(o.id)).map((obj) => (
                  <DropdownMenuItem key={obj.id} onClick={() => setTool(obj.id as Tool)}>
                    {obj.icon}
                    <span className="ml-2">{obj.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Building2 className="mr-2 h-4 w-4" />
                Räume
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {objectTypes.filter(o => ['buero', 'sozialraum', 'wc'].includes(o.id)).map((obj) => (
                  <DropdownMenuItem key={obj.id} onClick={() => setTool(obj.id as Tool)}>
                    {obj.icon}
                    <span className="ml-2">{obj.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Anordnung</DropdownMenuLabel>
            <DropdownMenuItem>
              <ArrowUp className="mr-2 h-4 w-4" />
              In den Vordergrund
              <DropdownMenuShortcut>⌘↑</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ArrowDown className="mr-2 h-4 w-4" />
              In den Hintergrund
              <DropdownMenuShortcut>⌘↓</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Ausrichten</DropdownMenuLabel>
            <DropdownMenuItem>
              <AlignLeft className="mr-2 h-4 w-4" />
              Links ausrichten
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlignCenter className="mr-2 h-4 w-4" />
              Zentrieren
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlignRight className="mr-2 h-4 w-4" />
              Rechts ausrichten
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Columns className="mr-2 h-4 w-4" />
              Gleichmäßig verteilen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ============ SCENARIOS MENU ============ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 px-2">
              Szenarien <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Vorlagen</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleLoadScenario('papa')}>
              <Calculator className="mr-2 h-4 w-4" />
              Papa&apos;s Testhalle (100×60m)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLoadScenario('standard')}>
              <Warehouse className="mr-2 h-4 w-4" />
              Standard-Halle (100×50m)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLoadScenario('umschlag')}>
              <Package className="mr-2 h-4 w-4" />
              Cross-Docking (150×50m)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLoadScenario('lager')}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Lager mit Regalen (80×60m)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Assistenten</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleGenerateGaenge}>
              <Truck className="mr-2 h-4 w-4" />
              Gang-Generator
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ TOOL BUTTONS ============ */}
        <div className="flex items-center gap-0.5">
          {tools.map((tool, idx) => (
            <span key={tool.id} className="flex items-center">
              {idx > 0 && tools[idx - 1].group !== tool.group && (
                <Separator orientation="vertical" className="h-5 mx-1" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTool(tool.id)}
                  >
                    {tool.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{tool.label}</p>
                  <kbd className="ml-2 px-1.5 py-0.5 text-[10px] bg-muted rounded">{tool.shortcut}</kbd>
                </TooltipContent>
              </Tooltip>
            </span>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ VIEW OPTIONS ============ */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={toggleGrid}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Raster <kbd className="ml-1 text-[10px]">G</kbd></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={snapToGrid ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={toggleSnap}
              >
                <Magnet className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Einrasten</TooltipContent>
          </Tooltip>
        </div>

        {/* ============ ZOOM CONTROL ============ */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-20 text-xs">
              {Math.round(zoom * 100)}%
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Zoom</h4>
              <Slider
                value={[zoom * 100]}
                onValueChange={([v]) => setZoom(v / 100)}
                min={10}
                max={500}
                step={10}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setZoom(0.5)}>50%</Button>
                <Button size="sm" variant="outline" onClick={() => setZoom(1)}>100%</Button>
                <Button size="sm" variant="outline" onClick={() => setZoom(2)}>200%</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        {/* ============ SEARCH ============ */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-muted-foreground hidden sm:flex"
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Suche...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">⌘K</kbd>
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ ACTION BUTTONS ============ */}
        <div className="flex items-center gap-1">
          {/* Multi-Insert Dialog */}
          <MultiInsertDialog />

          {/* Matrix Dialog */}
          <MatrixDialog />

          {/* Hallen-Assistent Dialog */}
          <HallenAssistentDialog />

          {/* Tor-Kalkulation Dialog */}
          <TorKalkulationDialog />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ BETRIEBSDATEN & SZENARIEN ============ */}
        <div className="flex items-center gap-1">
          <BetriebsdatenImportDialog />
          <SzenarienDialog />
          {originalLayout && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Layout zurücksetzen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Das Layout wird auf den ursprünglich importierten Zustand zurückgesetzt.
                    Der aktuelle Zustand wird im Undo-Verlauf gespeichert.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { resetToOriginal(); toast.success('Layout zurückgesetzt'); }}>
                    Zurücksetzen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ SHOWCASE & SIMULATION ============ */}
        <div className="flex items-center gap-1">
          {/* Project Comparison Dialog */}
          <ProjektVergleichDialog />

          {/* Showcase Dialog */}
          <ShowcaseDialog />

          {/* Simulation Dialog */}
          <SimulationDialog />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ THEME TOGGLE ============ */}
        <ThemeToggleSimple />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* ============ HELP / SETTINGS ============ */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Keyboard className="mr-2 h-4 w-4" />
              Tastaturkürzel
              <DropdownMenuShortcut>⌘/</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Info className="mr-2 h-4 w-4" />
              Dokumentation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear All - with Alert Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Alles löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Alle Objekte, Wege und Einstellungen werden gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => { resetState(); toast.success('Alles gelöscht'); }}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </TooltipProvider>
  );
}
