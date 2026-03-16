# TOPIS SaaS - Projekt-Dokumentation

## Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix UI)
- **State:** Zustand (3 Stores: `store.ts` Layout + `betriebsdaten-store.ts` Betriebsdaten + `prozessmodell-store.ts` Prozessmodell)
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
    prozessmodell-store.ts           # Zustand Store (Prozessmodell, Parameter, Ergebnis)
    prozessrechner.ts                # Min/Colli-Berechnung (Kernformel + Batch-Faktor)
    benchmarking.ts                  # Vergleich mit Referenzhallen
    flaechenrechner.ts               # Flächenbedarfsrechnung (Colli/qm)
    ist-soll-rechner.ts              # IST-SOLL Produktivitätsanalyse
    verteilweg-rechner.ts            # Gewichteter Verteilweg aus Layout
    simulation.ts                    # Simulations-Engine
    export.ts                        # Export-Funktionen
    showcase.ts                      # Demo-Szenarien
    layouts/schmid-halle6.ts         # Andreas Schmid Halle 6 Vorlage (85 Tore, 19 Sektionen)
    data/
      prozessmodell-se.ts            # SE-Prozessmodell (Stückgut-Eingang, 3 Abteilungen)
      prozessmodell-sa.ts            # SA-Prozessmodell (Stückgut-Ausgang, 3 Abteilungen)
      prozessmodell-templates.ts     # Registry aller verfügbaren Modelle
      referenzhallen.ts              # 8 Referenzhallen für Benchmarking
  types/
    topis.ts                         # Layout-Typen (TopisObject, Gang, Path, PathArea, Conveyor, Hall, FFZ)
    betriebsdaten.ts                 # LayoutSnapshot
    prozessmodell.ts                 # Prozessmodell-Typen (AbteilungDefinition, Prozessschritt, etc.)
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
- **Store 3 — `useProzessmodellStore`:** Prozessmodell (modell, parameter, ergebnis)
  - Actions: `updateParameter`, `setVerteilweg`, `setColliProTag`, `ladeModell`, `berechne`, `reset`
  - Selector Hooks: `useProzessErgebnis()`, `useProzessParameter()`, `useProzessAbteilungen()`
  - Auto-Berechnung bei Parameter-Änderungen
- Kein Backend/Persistierung - State lebt nur im Browser-Memory

### Prozessmodell-System (Kalibriert auf AS Gersthofen: 1.917 Min/Colli)

**Architektur: Dynamische Abteilungen + Multi-Modell**
- `AbteilungDefinition { id, label, color }` — keine hardcodierten Abteilungs-Enums
- `ProzessmodellConfig.abteilungen[]` definiert Abteilungen pro Modell
- `prozessmodell-templates.ts` — Registry für SE, SA, künftige Modelle
- UI-Komponenten lesen Labels/Farben aus dem Modell, nicht aus globalen Konstanten

**Verfügbare Modelle:**
| Modell | ID | Abteilungen | Beschreibung |
|--------|----|-------------|-------------|
| SE (Stückgut-Eingang) | `se_standard` | Entlader, Scanner, Verteiler | Entladen → Scannen → Verteilen |
| SA (Stückgut-Ausgang) | `sa_standard` | Kommissionierer, Belader, Verlader | Kommissionieren → Beladen → Verladen |

**Kalibrierung SE (Referenz: AS Gersthofen):**
- Belader-Steps entfernt (gehören zu SA)
- Batch-Faktor `colliProFahrt` (3.39): Teilt Verteiler-Wegzeit
- Scanner Step 23: anteil 1.0 (war 0.3)
- Entlader Steps 1/2: haeufigkeit 0.1 (war 0.05)
- Entlader Step 10: anteil 0.25 (war 0.15)
- 2 neue Entlader-Steps: "Gefäß öffnen" + "Rampe andocken"

**Kernformel in `prozessrechner.ts`:**
```
Min/Colli = Σ(zeitSek × anteil × häufigkeit) / 60
wobei: zeitSek = verteilweg / geschwindigkeit / colliProFahrt  (bei wegAusLayout)
```

**Wichtige Parameter (aus Store, nicht hardcodiert):**
- `arbeitsminProStunde` (52.9) — in allen MA-Berechnungen
- `colliProQm` (1.25) — in Flächenbedarfsrechnung
- `colliProFahrt` (3.39 SE / 2.0 SA) — Batch-Faktor für Wegzeit

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
- **Min/Colli** = Σ(Standardzeit × Anteil × Häufigkeit) / 60
- **Wegzeit bei Layout-Schritten** = Verteilweg / Geschwindigkeit / colliProFahrt
- **MA-Stundenbedarf** = Colli/Tag × Min/Colli / arbeitsminProStunde (Parameter, Standard 52.9)
- **Flächenbedarf** = Colli/Tag / colliProQm (Parameter, Standard 1.25)

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
