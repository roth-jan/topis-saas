# TOPIS SaaS - Projekt-Dokumentation

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix UI)
- **State:** Zustand (2 Stores: `store.ts` Layout + `betriebsdaten-store.ts` Betriebsdaten)
- **Canvas:** HTML5 Canvas 2D (kein SVG, kein WebGL)
- **Deployment:** GitHub Pages (Static Export), `output: "export"`, `basePath: "/topis-saas"`
- **Repo:** `roth-jan/topis-saas`, Live: https://roth-jan.github.io/topis-saas/

## Projektstruktur
```
src/
  app/
    (editor)/projekt/page.tsx       # Hauptseite (3-Panel Layout: Links/Canvas/Rechts)
    layout.tsx                       # Root Layout (ThemeProvider, Toaster)
    page.tsx                         # Landing Page
  components/
    canvas/HallCanvas.tsx            # Canvas-Rendering + Hit-Detection + Heatmap-Overlay
    editor/
      Toolbar.tsx                    # Obere Werkzeugleiste + Menüleiste
      ObjectList.tsx                 # Linkes Panel: Objektliste (gruppiert nach Typ)
      PropertiesPanel.tsx            # Rechtes Panel: Eigenschaften + Analyse
      CommandPalette.tsx             # Cmd+K Suchpalette
    panels/
      GangPanel.tsx                  # Gang-Verwaltung
      PathPanel.tsx                  # Wege-Verwaltung
      AnalyticsPanel.tsx             # Analyse-Panel (Kennzahlen)
      SimulationPanel.tsx            # Simulation
    dialogs/
      BetriebsdatenImportDialog.tsx  # CSV-Import + Heatmap-Steuerung
      SzenarienDialog.tsx            # Layout-Snapshots speichern/laden/vergleichen
      ShowcaseDialog.tsx             # Andreas Schmid Showcase Demo
      MultiInsertDialog.tsx          # Serienanordnung (Tore, Stellplätze)
      HallenAssistentDialog.tsx      # Hallen-Assistent
      MatrixDialog.tsx               # Entfernungsmatrix
      SimulationDialog.tsx           # Simulationsdialog
      TorKalkulationDialog.tsx       # Tor-Kalkulation
      ProjektVergleichDialog.tsx     # Projektvergleich
    ui/                              # shadcn/ui Komponenten
  hooks/
    useKeyboardShortcuts.ts          # Tastaturkürzel
  lib/
    store.ts                         # Zustand Store (TopisStore: objects, paths, gaenge, etc.)
    betriebsdaten-store.ts           # Zustand Store (ScanRecords, Analyse, HeatmapConfig, Szenarien)
    heatmap-utils.ts                 # Heatmap-Farben (getHeatmapColor, getMetrikWert, formatMetrikWert)
    analytics.ts                     # Produktivitätsanalyse
    pathfinding.ts                   # Wegberechnung (A*)
    gang-generator.ts                # Automatische Gang-Generierung
    simulation.ts                    # Simulations-Engine
    export.ts                        # Export-Funktionen
    showcase.ts                      # Demo-Szenarien
    layouts/schmid-halle6.ts         # Andreas Schmid Halle 6 Vorlage (85 Tore, 19 Sektionen)
  types/
    topis.ts                         # Layout-Typen (TopisObject, Gang, Path, PathArea, Conveyor, Hall, FFZ)
    betriebsdaten.ts                 # LayoutSnapshot
```

## Architektur-Entscheidungen

### Canvas-Rendering (HallCanvas.tsx)
- Alles wird auf einem einzigen `<canvas>` gerendert
- SCALE = 10 px/m (definiert in types/topis.ts)
- Koordinatensystem: Welt-Koordinaten in Metern, umgerechnet via `worldToScreen` / `screenToWorld`
- Hit-Detection: Objekte = Punkt-in-Rechteck, Gänge/Conveyors/Paths = Punkt-zu-Liniensegment
- Selection-Highlighting: Cyan-Glow (shadowBlur) um selektiertes Element
- **Heatmap-Overlay:** Farbige Rechtecke auf Tor-Objekten, gezeichnet NACH den normalen Objekten
  - Bezieht Daten aus `useBetriebsdatenStore` (heatmapConfig + analyse)
  - WICHTIG: `heatmapConfig` und `betriebsAnalyse` MÜSSEN in useCallback/useEffect Dependency-Arrays stehen

### State Management (Zustand)
- **Store 1 — `useTopisStore`:** Layout-Daten (objects, paths, gaenge, halls, pathAreas, conveyors)
  - Gegenseitiger Ausschluss bei Selektion: `selectObject` cleard `selectedPath`, `selectedGang`, etc.
  - Selector Hooks: `useObjects()`, `useSelectedGang()`, etc. für Performance
- **Store 2 — `useBetriebsdatenStore`:** Betriebsdaten (scanRecords, analyse, heatmapConfig, szenarien)
  - Selector Hooks: `useHeatmapConfig()`, `useBetriebsAnalyse()`, `useSzenarien()`
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

### Betriebsdaten-System
- **ScanRecord:** Einzelner Scan-Datensatz (Datum, Zeit, Messpunkt, Tour, Sendungen, Colli, Gewicht)
- **ObjektMetrik:** Aggregierte Metriken pro Layout-Objekt (Sendungen/Tag, Auslastung, etc.)
- **BetriebsAnalyse:** Gesamtanalyse (Zeitraum, Arbeitstage, Summen, ObjektMetriken[])
- **HeatmapConfig:** Aktiv, Modus (sendungen|colli|gewicht|auslastung|ladezeit), Farbskala, Intensität
- **Szenario:** Layout-Snapshot mit Name, Beschreibung, Änderungen, optionalem Analyse-Ergebnis
- CSV-Format: Semikolon-getrennt, Header: scandatum;scanzeit;messpunkt;messpunktname;tour;dispogebiet;sendungen;colli;gewicht;ladezeit

## Andreas Schmid - Halle 6

### Quelldaten
- `~/Downloads/4_Halle/` — PDFs, Excel, Access-DB mit Originalkoordinaten
- `/tmp/topis-sharepoint/` — 160 Dateien aus SharePoint (Beratungsmethodik, Projekt 2018-2020 + 2026)

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
- Stapler-Geschwindigkeit: ~2.86 m/s, Schnelläufer: ~2.44 m/s, Langgabel: ~2.24 m/s
- Entladezeit (Standard, Stapler): ~45.7 Sek/Bewegung, 1.37 Colli/Bewegung
- Durchschnittlicher Verteilweg SE: 138.8m (Colli-gewichtet)
- SE-Prozesszeit: 1.917 Min/Colli (Entlader 0.829 + Scanner 0.336 + Verteiler 0.752)

## ROTH Beratungsmethodik (Zielautomatisierung)

### Was TOPIS automatisieren soll (aus SharePoint-Analyse):
1. **Prozessmodell-Engine** — Min/Colli-Berechnung (976 Zeilen Excel → parametrisches Modell)
2. **Automatische Wegeberechnung** — Kürzester Weg mit Wegflächen (Algorithmus beschrieben in Wege_im_TOPIS.docx)
3. **Gewichteter Verteilweg** — Colli-gewichtete Durchschnittswege je Tor/Relation
4. **Benchmarking-Datenbank** — Vergleich mit 15 Referenzhallen (Min/Colli je Prozess)
5. **IST-SOLL-Abgleich** — Stundengenaue Produktivitätsanalyse
6. **Flächenbedarfsrechnung** — Colli/Tag / 1.25 = qm je Relation
7. **Verladeplan / Torbelegung** — Zeitliche Steuerung
8. **Dashboard/Cockpit** — KPI-Übersicht (Colli/MA-Stunde, Min/Colli, FTE-Bedarf)

### Kernformeln:
- **Min/Colli** = Σ(Standardzeit × Anteil × Häufigkeit) / Arbeitsmenge
- **MA-Stundenbedarf** = Menge × Min/Colli / 52.9 (Arbeitsminuten/Stunde)
- **Wegzeit** = (Anteil_FFG × Weg) / Geschwindigkeit_FFG + Zeit_Aufnehmen + Zeit_Absetzen
- **Flächenbedarf** = Colli_pro_Tag / 1.25 Colli/qm

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
- Heatmap-Daten (heatmapConfig, betriebsAnalyse) MÜSSEN in Canvas useCallback/useEffect Deps stehen
