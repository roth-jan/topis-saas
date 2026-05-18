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
import { MultiInsertDialog } from '@/components/dialogs/MultiInsertDialog';
import { MatrixDialog } from '@/components/dialogs/MatrixDialog';
import { WegeberechnungDialog } from '@/components/dialogs/WegeberechnungDialog';
import { HallenAssistentDialog } from '@/components/dialogs/HallenAssistentDialog';
import { TorKalkulationDialog } from '@/components/dialogs/TorKalkulationDialog';
import { BetriebsdatenImportDialog } from '@/components/dialogs/BetriebsdatenImportDialog';
import { SzenarienDialog } from '@/components/dialogs/SzenarienDialog';
import { ProzessmodellDialog } from '@/components/dialogs/ProzessmodellDialog';
import { ProzessmodellImportDialog } from '@/components/dialogs/ProzessmodellImportDialog';
import { FlaechenbedarfDialog } from '@/components/dialogs/FlaechenbedarfDialog';
import { BenchmarkDialog } from '@/components/dialogs/BenchmarkDialog';
import { IstSollDialog } from '@/components/dialogs/IstSollDialog';
import { TorbelegungDialog } from '@/components/dialogs/TorbelegungDialog';
import { VergleichDialog } from '@/components/dialogs/VergleichDialog';
import { generateReport } from '@/lib/report-generator';
import { useBetriebsdatenStore, type ObjektMetrik } from '@/lib/betriebsdaten-store';
import { parseCsvMitProfil } from '@/lib/spaltenzuordnungen';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { DEMO_SCENARIOS } from '@/lib/showcase';
import { printLayout, exportReport } from '@/lib/export';
import { PROJEKT_VORLAGEN, ladeProjektVorlage } from '@/lib/projekt-vorlagen';
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
  FileText,
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
  { id: 'auftrag', label: 'Auftrag anlegen', shortcut: 'A', icon: <FileText className="h-4 w-4" />, group: 4 },
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
  const seedBeispielAuftraege = useTopisStore((s) => s.seedBeispielAuftraege);
  const clearSimAuftraege = useTopisStore((s) => s.clearSimAuftraege);
  const simAuftraegeCount = useTopisStore((s) => s.simAuftraege.length);
  const showAllSimRoutes = useTopisStore((s) => s.showAllSimRoutes);
  const toggleShowAllSimRoutes = useTopisStore((s) => s.toggleShowAllSimRoutes);
  const focusedTorId = useTopisStore((s) => s.focusedTorId);
  const setFocusedTor = useTopisStore((s) => s.setFocusedTor);
  const objsForFocus = useTopisStore((s) => s.objects);
  const focusedTorName = focusedTorId != null
    ? objsForFocus.find((o) => o.id === focusedTorId)?.name ?? null
    : null;

  // Get active hall
  const activeHall = halls.find(h => h.id === activeHallId) || halls[0];

  // Betriebsdaten + Prozessmodell für Report
  const betriebsAnalyse = useBetriebsdatenStore((s) => s.analyse);
  const importScandatenRecords = useBetriebsdatenStore((s) => s.importScandatenRecords);
  const setAnalyseStore = useBetriebsdatenStore((s) => s.setAnalyse);
  const setHeatmapConfigStore = useBetriebsdatenStore((s) => s.setHeatmapConfig);
  const setTorZuordnungenStore = useBetriebsdatenStore((s) => s.setTorZuordnungen);
  const setRelationZuordnungenStore = useBetriebsdatenStore((s) => s.setRelationZuordnungen);
  const objectsForDemo = useTopisStore((s) => s.objects);

  // Generischer Demo-Daten-Loader für Monats-CSVs aus public/demo-data/
  const handleLoadMonth = async (slug: string, label: string) => {
    try {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/topis-saas';
      const url = `${basePath}/demo-data/${slug}.csv`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error('CSV ist leer');
        return;
      }
      const headers = lines[0].split(';').map((h) => h.trim().toLowerCase());
      const colMp = headers.indexOf('messpunkt');
      const colMpName = headers.indexOf('messpunktname');
      const colDate = headers.indexOf('scandatum');
      const colTime = headers.indexOf('scanzeit');
      const colTour = headers.indexOf('tour');
      const colDispo = headers.indexOf('dispogebiet');
      const colSendungen = headers.indexOf('sendungen');
      const colColli = headers.indexOf('colli');
      const colGewicht = headers.indexOf('gewicht');

      // MP-Custom-Objekte finden
      const mpObjects = objectsForDemo.filter(
        (o) => o.tags?.includes('messpunkt') && o.meta?.code
      );
      if (mpObjects.length === 0) {
        toast.error('Keine Messpunkte im Layout — bitte zuerst AS-Vorlage laden');
        return;
      }

      // Zweistufige Aggregation:
      // 1) pro MP-Code für die Heatmap-Analyse (wie bisher)
      // 2) pro (MP × Relation × Tag × Stunde) als kompakte Records — passt in
      //    localStorage. 219k Rohzeilen würden ~55 MB JSON, das überschreitet
      //    das Browser-Limit (~5-10 MB) → silent-fail in der Persistenz.
      type Bucket = { sendungen: number; colli: number; gewicht: number; count: number };
      const grouped = new Map<string, Bucket>();
      const tage = new Set<string>();
      let totalSendungen = 0, totalColli = 0, totalGewicht = 0;
      const dispoSet = new Set<string>();

      // Bucket-Key: mpCode|dispogebiet|datum|stunde
      type AggKey = string;
      const recordsBuckets = new Map<AggKey, import('@/types/scandaten').ScandatenRecord>();
      let nextRecordId = 1;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(';');
        const mpRaw = parts[colMp]?.trim() || '';
        const mpCode = mpRaw.match(/MP[0-9]+[a-z]*/i)?.[0];
        if (!mpCode) continue;
        const s = parseInt(parts[colSendungen]) || 0;
        const c = parseInt(parts[colColli]) || 0;
        const g = parseFloat(parts[colGewicht]) || 0;
        const d = parts[colDate]?.trim() || '';
        const z = colTime >= 0 ? (parts[colTime]?.trim() || '') : '';
        const tour = colTour >= 0 ? (parts[colTour]?.trim() || '') : '';
        const dispo = colDispo >= 0 ? (parts[colDispo]?.trim() || '') : '';
        if (d) tage.add(d.substring(0, 10));
        if (dispo) dispoSet.add(dispo);
        totalSendungen += s; totalColli += c; totalGewicht += g;

        // MP-Bucket
        const b = grouped.get(mpCode) || { sendungen: 0, colli: 0, gewicht: 0, count: 0 };
        b.sendungen += s; b.colli += c; b.gewicht += g; b.count += 1;
        grouped.set(mpCode, b);

        // Kompakter Record-Bucket pro (MP × Relation × Tag).
        // Stunde wird nicht persistiert — Stunden-Aggregation berechnet der
        // Store separat live aus diesem Aggregat.
        const aggKey = `${mpCode}|${dispo}|${d}`;
        const existing = recordsBuckets.get(aggKey);
        if (existing) {
          existing.colli += c;
          existing.sendungen += s;
          existing.gewicht += g;
        } else {
          recordsBuckets.set(aggKey, {
            id: nextRecordId++,
            scandatum: d,
            scanzeit: '',
            timestamp: 0,
            stellplatz: mpCode,
            messpunkt: parseInt(mpRaw) || 0,
            messpunktName: colMpName >= 0 ? (parts[colMpName]?.trim() || mpCode) : mpCode,
            tour: '',
            dispogebiet: dispo,
            ausgangsrelation: dispo,
            sendungen: s,
            colli: c,
            gewicht: g,
          });
        }
      }
      const records = [...recordsBuckets.values()];

      const arbeitstage = Math.max(tage.size, 1);
      const metriken: ObjektMetrik[] = [];
      grouped.forEach((b, mpKey) => {
        const mpObj = mpObjects.find((o) => o.meta?.code === mpKey);
        if (!mpObj) return;
        metriken.push({
          objectId: mpObj.id,
          objectName: mpObj.name || mpKey,
          sendungen: b.sendungen / arbeitstage,
          colli: b.colli / arbeitstage,
          gewicht: b.gewicht / arbeitstage,
          durchschnittLadezeit: 0,
          auslastung: Math.min(1, b.sendungen / arbeitstage / 200),
          fahrtenProTag: b.count / arbeitstage,
        });
      });

      const sortedTage = [...tage].sort();
      setAnalyseStore({
        zeitraum: { von: sortedTage[0] || '', bis: sortedTage[sortedTage.length - 1] || '' },
        arbeitstage,
        gesamtSendungen: totalSendungen,
        gesamtColli: totalColli,
        gesamtGewicht: totalGewicht,
        objektMetriken: metriken,
      });
      setHeatmapConfigStore({ aktiv: true, modus: 'colli' });

      // Für die Planungs-Seite: Records, Tor-Zuordnung (MP-Code → MP-Objekt),
      // Relation-Zuordnung (dispogebiet → bisher unmapped, Berater kann später drinhängen)
      importScandatenRecords(records);

      const torZuordnungen: import('@/types/scandaten').TorZuordnung[] = [];
      grouped.forEach((_b, mpCode) => {
        const obj = mpObjects.find((o) => o.meta?.code === mpCode);
        if (obj) {
          torZuordnungen.push({
            stellplatzKey: mpCode,
            objectId: obj.id,
            objectName: obj.name || mpCode,
            autoMatched: true,
          });
        }
      });
      setTorZuordnungenStore(torZuordnungen);

      // Bereich-Auto-Match: dispogebiet-Text mit Bereich-Objektnamen (Substring, case-insensitiv)
      const bereiche = objectsForDemo.filter((o) => o.type === 'bereich' && o.name);
      const relationZuordnungen: import('@/types/scandaten').RelationZuordnung[] = [...dispoSet].map((dispo) => {
        const lower = dispo.toLowerCase();
        const match = bereiche.find((b) =>
          (b.name || '').toLowerCase().includes(lower) || lower.includes((b.name || '').toLowerCase())
        );
        return {
          relationKey: dispo,
          objectId: match?.id ?? null,
          objectName: match?.name ?? dispo,
        };
      });
      setRelationZuordnungenStore(relationZuordnungen);

      if (metriken.length === 0) {
        toast.error(`Keine MP-Matches: gefunden ${[...grouped.keys()].join(',')}, im Layout ${mpObjects.map(m => m.meta?.code).join(',')}`);
      } else {
        toast.success(
          `${label}: ${(lines.length - 1).toLocaleString('de-DE')} Zeilen, ${arbeitstage} Tage, ${metriken.length} Messpunkte gemappt`,
          { duration: 5000 }
        );
      }
    } catch (err) {
      toast.error('Demo-Daten konnten nicht geladen werden: ' + (err as Error).message);
    }
  };
  const prozessErgebnis = useProzessmodellStore((s) => s.ergebnis);

  const { theme, setTheme } = useTheme();
  const [showRulers, setShowRulers] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);

  // Workflow-Phasen — gliedert die Toolbar nach Beratungs-Story
  type Phase = 'daten' | 'layout' | 'wege' | 'auswertung' | 'planung' | 'vergleich' | 'cockpit';
  const [phase, setPhase] = useState<Phase>('layout');
  const phases: { id: Phase; label: string; hint: string }[] = [
    { id: 'daten', label: 'Daten', hint: 'Scandaten und Vorlagen laden' },
    { id: 'layout', label: 'Layout', hint: 'Halle aufbauen' },
    { id: 'wege', label: 'Wege', hint: 'Wegberechnung + Distanzmatrix' },
    { id: 'auswertung', label: 'Auswertung', hint: 'Prozessmodell + KPIs' },
    { id: 'planung', label: 'Planung', hint: 'Aufträge zeilenweise editieren, Kosten spielen' },
    { id: 'vergleich', label: 'Vergleich', hint: 'Szenarien gegenüberstellen' },
    { id: 'cockpit', label: 'Dashboard', hint: 'Tages-Werkzeug: Aufträge, Mengen, Kosten' },
  ];

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

  // Report Export
  const handleExportReport = () => {
    if (!betriebsAnalyse) {
      toast.error('Bitte zuerst Betriebsdaten importieren');
      return;
    }
    const canvas = document.querySelector('canvas');
    const canvasDataURL = canvas ? canvas.toDataURL('image/png') : undefined;
    generateReport({
      projektName: activeHall?.name || 'TOPIS Projekt',
      analyse: betriebsAnalyse,
      ergebnis: prozessErgebnis,
      canvasDataURL,
      halleName: activeHall?.name,
    });
    toast.success('PDF-Report generiert');
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
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">

      {/* ============ ROW 1: GLOBAL (Logo + Phasen-Tabs + globale Aktionen) ============ */}
      <div className="h-11 flex items-center px-2 gap-2 min-w-0 border-b border-border/40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-1 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
            T
          </div>
          <span className="font-semibold hidden sm:inline">TOPIS</span>
          <Badge variant="outline" className="text-[10px] hidden md:inline-flex">SaaS</Badge>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Phasen-Tabs */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
          {phases.map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={phase === p.id ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 px-3 text-sm font-medium shrink-0"
                  onClick={() => setPhase(p.id)}
                >
                  {p.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{p.hint}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Globale Aktionen rechts */}
        <a href="/topis-saas/projekt/planung" className="shrink-0 hidden md:inline-block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <FileText className="h-3.5 w-3.5" />
                Planung
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Auftrags-Planungsseite öffnen (Kosten + Wege spielen)</TooltipContent>
          </Tooltip>
        </a>
        <a href="/topis-saas/dashboard" className="shrink-0 hidden md:inline-block">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <BarChart3 className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Dashboard öffnen (Σ-Sicht, KPIs)</TooltipContent>
          </Tooltip>
        </a>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-muted-foreground hidden sm:flex shrink-0"
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Suche…</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded">⌘K</kbd>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { undo(); toast.info('Rückgängig'); }} disabled={!canUndo}>
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Rückgängig <kbd className="ml-1 text-[10px]">⌘Z</kbd></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => { redo(); toast.info('Wiederholt'); }} disabled={!canRedo}>
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Wiederholen <kbd className="ml-1 text-[10px]">⇧⌘Z</kbd></TooltipContent>
        </Tooltip>
        <ThemeToggleSimple />
        {/* Geführte Tour Trigger entfernt — die alten Schritte referenzieren
            Elemente die in der neuen Workflow-Phasen-Toolbar nur in der jeweiligen
            Phase rendern. driver.js-Overlay blockierte sonst alle Klicks. */}
      </div>

      {/* ============ ROW 2: PHASEN-SPEZIFISCH ============ */}
      <div className="h-11 flex items-center px-2 gap-1 overflow-x-auto min-w-0">

        {/* ============ FILE MENU (Daten-Phase) ============ */}
        {(phase === 'daten') && (
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
            <DropdownMenuLabel>Halle laden (Geometrie)</DropdownMenuLabel>
            {PROJEKT_VORLAGEN.map(vorlage => (
              <DropdownMenuItem key={vorlage.id} onClick={() => {
                ladeProjektVorlage(vorlage.id);
                toast.success(`Halle "${vorlage.name} — ${vorlage.standort}" geladen`);
              }}>
                <Warehouse className="mr-2 h-4 w-4" />
                {vorlage.name} — {vorlage.standort}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Volumen-Daten laden (Scans)</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleLoadMonth('as-jan2026-scans', 'Januar 2026')}>
              <Database className="mr-2 h-4 w-4" />
              AS Januar 2026
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLoadMonth('as-feb2026-scans', 'Februar 2026')}>
              <Database className="mr-2 h-4 w-4" />
              AS Februar 2026
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              // Eigene CSV via Dialog
              const btn = document.querySelector('[data-betriebsdaten-trigger]') as HTMLButtonElement;
              if (btn) btn.click();
            }}>
              <Upload className="mr-2 h-4 w-4" />
              Eigene CSV importieren…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              window.location.href = '/topis-saas/check';
            }}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Kunden-Check (Self-Service)…
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
                <DropdownMenuItem onClick={handleExportReport}>
                  <FileText className="mr-2 h-4 w-4" />
                  Als PDF (Report)
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
        )}

        {/* ============ EDIT MENU (Layout-Phase) ============ */}
        {(phase === 'layout') && (
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
        )}

        {/* ============ VIEW MENU (Layout-Phase) ============ */}
        {(phase === 'layout') && (
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
        )}

        {/* ============ OBJECTS MENU (Layout-Phase) ============ */}
        {(phase === 'layout') && (
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
        )}

        {/* ============ SCENARIOS MENU (Daten-Phase) ============ */}
        {(phase === 'daten') && (
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
            <DropdownMenuLabel>Reale Projekte</DropdownMenuLabel>
            {PROJEKT_VORLAGEN.map(vorlage => (
              <DropdownMenuItem key={vorlage.id} onClick={() => {
                ladeProjektVorlage(vorlage.id);
                toast.success(`"${vorlage.name}" geladen`);
              }}>
                <Warehouse className="mr-2 h-4 w-4" />
                {vorlage.name} — {vorlage.standort} ({vorlage.jahr})
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Assistenten</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleGenerateGaenge}>
              <Truck className="mr-2 h-4 w-4" />
              Gang-Generator
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        {(phase === 'layout') && <Separator orientation="vertical" className="h-6 mx-1" />}

        {/* ============ TOOL BUTTONS (Layout-Phase) ============ */}
        {(phase === 'layout') && (
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
        )}

        {(phase === 'layout') && <Separator orientation="vertical" className="h-6 mx-1" />}

        {/* ============ VIEW OPTIONS (Layout-Phase) ============ */}
        {(phase === 'layout') && (
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
        )}

        {/* ============ ZOOM CONTROL (Layout-Phase) ============ */}
        {(phase === 'layout') && (
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
        )}

        {/* ============ LAYOUT — Hilfs-Dialoge ============ */}
        {(phase === 'layout') && (
        <div id="tour-aktionen" className="flex items-center gap-1">
          <MultiInsertDialog />
          <HallenAssistentDialog />
        </div>
        )}

        {/* ============ WEGE — Wegberechnung + Distanzmatrix + Tor-Kalkulation ============ */}
        {(phase === 'wege') && (
        <div id="tour-wege" className="flex items-center gap-1">
          <span id="tour-matrix"><MatrixDialog /></span>
          <span id="tour-wegeberechnung"><WegeberechnungDialog /></span>
          <span id="tour-torkalkulation"><TorKalkulationDialog /></span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={handleGenerateGaenge}
            title="Fahrgänge automatisch generieren"
          >
            <Truck className="h-3.5 w-3.5" />
            Gang-Generator
          </Button>
        </div>
        )}

        {/* ============ AUSWERTUNG ============ */}
        {(phase === 'auswertung') && (
        <div id="tour-analyse" className="flex items-center gap-1">
          <span id="tour-prozessmodell"><ProzessmodellDialog /></span>
          <ProzessmodellImportDialog />
          <span id="tour-flaechenbedarf"><FlaechenbedarfDialog /></span>
          <span id="tour-benchmark"><BenchmarkDialog /></span>
          <span id="tour-istsoll"><IstSollDialog /></span>
          <span id="tour-torbelegung"><TorbelegungDialog /></span>
          {betriebsAnalyse && (
            <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleExportReport}>
              <FileText className="h-3.5 w-3.5" />
              Report
            </Button>
          )}
        </div>
        )}

        {/* ============ PLANUNG ============ */}
        {(phase === 'planung') && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={currentTool === 'auftrag' ? 'default' : 'outline'}
            size="sm"
            className={`gap-1.5 text-xs ${currentTool === 'auftrag' ? 'ring-2 ring-blue-500/50' : ''}`}
            onClick={() => setTool(currentTool === 'auftrag' ? 'select' : 'auftrag')}
          >
            <FileText className="h-4 w-4" />
            {currentTool === 'auftrag' ? 'Auftrag-Modus aktiv ✓' : 'Auftrag anlegen (Klick-Klick-Colli)'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => { seedBeispielAuftraege(); toast.success('10 Beispiel-Aufträge geladen'); }}
            title="Lädt 10 vordefinierte Tor→Tor-Aufträge zum Spielen"
          >
            <Zap className="h-3.5 w-3.5" />
            10 Beispiele laden
          </Button>
          {simAuftraegeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground"
              onClick={() => { clearSimAuftraege(); toast.success('Alle Sim-Aufträge gelöscht'); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              alle {simAuftraegeCount} löschen
            </Button>
          )}
          <Separator orientation="vertical" className="h-6 mx-1" />
          <a href="/topis-saas/projekt/planung">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FileText className="h-4 w-4" />
              Tabelle + Σ-Kosten
            </Button>
          </a>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            variant={showAllSimRoutes ? 'default' : 'outline'}
            size="sm"
            className="gap-1 text-xs"
            onClick={toggleShowAllSimRoutes}
            title="Alle Wege gleichzeitig zeichnen statt nur den fokussierten"
          >
            {showAllSimRoutes ? 'Alle Wege ✓' : 'Alle Wege zeigen'}
          </Button>
          {focusedTorName && !showAllSimRoutes && (
            <span className="text-[11px] bg-amber-500/20 text-amber-600 px-2 py-1 rounded">
              Fokus: {focusedTorName}
              <button onClick={() => setFocusedTor(null)} className="ml-1 underline">×</button>
            </span>
          )}
          <span className="text-[11px] text-muted-foreground ml-1 max-w-sm">
            {currentTool === 'auftrag'
              ? '1. Klick auf Tor (Von) · 2. Klick (Nach) · Colli eingeben'
              : focusedTorName
              ? 'Linien des fokussierten Tors sichtbar — anderes Tor anklicken oder × drücken.'
              : 'Klick auf ein belegtes Tor (roter Ring) zeigt dessen Wege.'}
          </span>
        </div>
        )}

        {/* ============ VERGLEICH ============ */}
        {(phase === 'vergleich') && (
        <div className="flex items-center gap-1">
          <span id="tour-szenarien"><SzenarienDialog /></span>
          <VergleichDialog />
          <ProjektVergleichDialog />
          <SimulationDialog />
          {originalLayout && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Layout-Reset
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
        )}

        {/* ============ DASHBOARD ============ */}
        {(phase === 'cockpit') && (
        <div className="flex items-center gap-2">
          <a href="/topis-saas/dashboard">
            <Button variant="default" size="sm" className="gap-1.5 text-xs">
              <BarChart3 className="h-4 w-4" />
              Dashboard öffnen (Tages-Werkzeug)
            </Button>
          </a>
          <a href="/topis-saas/projekt/planung">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FileText className="h-4 w-4" />
              Auftrags-Planung
            </Button>
          </a>
          <span className="text-[11px] text-muted-foreground ml-1">
            Halle und Volumen-Daten lädst du oben in Phase „Daten"
          </span>
        </div>
        )}

        {/* Spacer + Clear-All immer rechts in Layout-Phase */}
        {(phase === 'layout') && <div className="flex-1" />}

        {/* Clear All - with Alert Dialog (nur Layout-Phase) */}
        {(phase === 'layout') && (
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
        )}

        {/* Datenphase: Betriebsdaten-Dialog-Trigger immer mounten (wird im Datei-Menü via querySelector geklickt) */}
        {(phase === 'daten') && (
          <span id="tour-betriebsdaten"><BetriebsdatenImportDialog /></span>
        )}

      </div>
      </div>
    </TooltipProvider>
  );
}
