# TOPIS SaaS - Projekt-Dokumentation

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix UI)
- **State:** Zustand (single store in `src/lib/store.ts`)
- **Canvas:** HTML5 Canvas 2D (kein SVG, kein WebGL)
- **Deployment:** GitHub Pages (Static Export), `output: "export"`, `basePath: "/topis-saas"`
- **Repo:** `roth-jan/topis-saas`, Live: https://roth-jan.github.io/topis-saas/

## Projektstruktur
```
src/
  app/
    (editor)/projekt/page.tsx   # Hauptseite (3-Panel Layout: Links/Canvas/Rechts)
    layout.tsx                   # Root Layout (ThemeProvider, Toaster)
    page.tsx                     # Landing Page
  components/
    canvas/HallCanvas.tsx        # Canvas-Rendering + Hit-Detection + Interaktion
    editor/
      Toolbar.tsx                # Obere Werkzeugleiste
      ObjectList.tsx             # Linkes Panel: Objektliste
      PropertiesPanel.tsx        # Rechtes Panel: Eigenschaften (Objekte, Gänge, PathAreas, Conveyors)
      CommandPalette.tsx         # Cmd+K Suchpalette
    panels/
      GangPanel.tsx              # Gang-Verwaltung
      PathPanel.tsx              # Wege-Verwaltung
      AnalyticsPanel.tsx         # Analyse-Panel
    dialogs/
      ShowcaseDialog.tsx         # Andreas Schmid Showcase Demo
    ui/                          # shadcn/ui Komponenten
  hooks/
    useInitialLayout.ts          # Auto-Load: Andreas Schmid Halle 6 beim Seitenstart
    useKeyboardShortcuts.ts      # Tastaturkürzel
  lib/
    store.ts                     # Zustand Store (TopisStore)
    gang-generator.ts            # Automatische Gang-Generierung
    analytics.ts                 # Produktivitätsanalyse
    showcase.ts                  # Demo-Szenarien
  types/
    topis.ts                     # Alle TypeScript-Typen + Konstanten
```

## Architektur-Entscheidungen

### Canvas-Rendering
- Alles wird auf einem einzigen `<canvas>` gerendert (HallCanvas.tsx)
- SCALE = 10 px/m (definiert in types/topis.ts)
- Koordinatensystem: Welt-Koordinaten in Metern, umgerechnet via `worldToScreen` / `screenToWorld`
- Hit-Detection: Objekte = Punkt-in-Rechteck, Gänge/Conveyors/Paths = Punkt-zu-Liniensegment
- Selection-Highlighting: Cyan-Glow (shadowBlur) um selektiertes Element

### State Management (Zustand)
- Ein globaler Store (`useTopisStore`) mit allen Daten
- Gegenseitiger Ausschluss bei Selektion: `selectObject` cleard `selectedPath`, `selectedGang`, etc.
- Selector Hooks: `useObjects()`, `useSelectedGang()`, etc. für Performance
- Kein Backend/Persistierung - State lebt nur im Browser-Memory

### Element-Typen
| Typ | Array | Selection | Properties Panel |
|-----|-------|-----------|-----------------|
| TopisObject | `objects[]` | `selectedObject` | ObjectProperties |
| Path | `paths[]` | `selectedPath` | PathProperties |
| Gang | `gaenge[]` | `selectedGang` | GangProperties |
| PathArea | `pathAreas[]` | `selectedPathArea` | PathAreaProperties |
| Conveyor | `conveyors[]` | `selectedConveyor` | ConveyorProperties |

**WICHTIG:** Alles was gezeichnet wird, MUSS klickbar/selektierbar sein!

## Andreas Schmid - Halle 6

### Quelldaten (~/Downloads/4_Halle/)
- `Neu Halle 6 IST Stand 01.10.2018.pdf` - Hallengrundriss mit allen Toren/Sektionen
- `Halle_IA 12.02.2019.pdf` - Erweiterung Halle 1A (Tore 100-137)
- `Halle6.docx` - Bild: Halle mit Kette/Förderband und Relationen
- `Messungen_DK.xlsx` - Vor-Ort-Zeitmessungen (Ent-/Beladezeiten)
- `Wege_Halle6.xlsx` - Wegstrecken EZ 1/2/3 zu allen Toren
- `Hallenmodul/Lagerhalle.mdb` - Access-DB mit exakten Koordinaten aller Objekte

### Hallendaten
- **Maße:** 150.80m x ~42m
- **Tore:** 85 (Süd: 1-38, Ost: 39-46, Nord: 47-85)
- **Sektionen Nord:** 8, 7, (BP2, BP1), 6, 5, 4
- **Sektionen Süd:** 1, 1A, 2, (ÜZ SE, Paletten, BP), 3, EX
- **Kette/Band:** Zentral horizontal durch die Halle
- **Entladezonen:** EZ 1 (Tore 19-26), EZ 2 (Tore 65-73), EZ 3 (Tore 78-80)
- **Kundenzonen Süd:** AS, Logistix, Murphy, Strauss, A.Sigl, VT, G.Sigl
- **Kundenzonen Nord:** AS Ü.79, Strauss, VT, Fischer&VT, Fischer, G.Sigl, Huber

### Kennzahlen (aus Messungen)
- Stapler-Geschwindigkeit: ~2.2 m/s
- Ameise-Geschwindigkeit: ~2.2 m/s
- Entladezeit (Standard, Stapler): ~45.7 Sek/Bewegung, 1.37 Colli/Bewegung
- Fahrzeugtypen: Torbreite=3m, Stellplatz=2x2m

## Entwicklung

### Setup
```bash
git clone https://github.com/roth-jan/topis-saas.git
cd topis-saas
npm install
npm run dev    # http://localhost:3000/topis-saas/projekt
```

### Build & Deploy
```bash
npm run build                    # Static Export nach out/
# Deploy auf gh-pages Branch:
# 1. gh-pages Branch auschecken
# 2. out/ Inhalt kopieren + .nojekyll Datei
# 3. Push zu gh-pages
```

### Wichtige Regeln
- `output: "export"` in next.config.ts - kein Server-Side Rendering
- `basePath: "/topis-saas"` - alle Links relativ zum basePath
- Canvas rendert ALLE Elemente - neue Typen brauchen: Rendering + Hit-Detection + Properties Panel
- Bei neuen selektierbaren Elementen: gegenseitigen Ausschluss in ALLEN select*-Actions beachten
