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
    check/page.tsx                   # Kunden-Check Self-Service (/check)
    layout.tsx                       # Root Layout (ThemeProvider, Toaster)
    page.tsx                         # Landing Page (+ Hallen-Check CTA)
  components/
    canvas/HallCanvas.tsx            # Canvas-Rendering + Hit-Detection + Heatmap-Overlay
    editor/
      Toolbar.tsx                    # Obere Werkzeugleiste + Menüleiste
      ObjectList.tsx                 # Linkes Panel: Objektliste (gruppiert nach Typ)
      PropertiesPanel.tsx            # Rechtes Panel: Eigenschaften + Analyse
      CommandPalette.tsx             # Cmd+K Suchpalette
    auth/
      AuthScreen.tsx                 # Login/Registrieren/Magic-Link (Apple-Look)
      CloudMenu.tsx                  # Toolbar: Anmelden bzw. User-Menü + Cloud
    panels/
      GangPanel.tsx                  # Gang-Verwaltung
      PathPanel.tsx                  # Wege-Verwaltung
      AnalyticsPanel.tsx             # Analyse-Panel (Kennzahlen)
      SimulationPanel.tsx            # Simulation
    check/
      HallPreview.tsx                # Read-Only Canvas (Auto-Zoom, Heatmap)
      AmpelCard.tsx                  # KPI-Ampelkarte (grün/gelb/rot)
      BeratungCTA.tsx                # Call-to-Action (mailto + Editor-Link)
      KundenCheckResults.tsx         # Ergebnis-Dashboard (assembliert alle Komponenten)
    dialogs/
      BetriebsdatenImportDialog.tsx  # CSV-Import + Heatmap-Steuerung
      SzenarienDialog.tsx            # Layout-Snapshots speichern/laden/vergleichen
      ShowcaseDialog.tsx             # Andreas Schmid Showcase Demo
      MultiInsertDialog.tsx          # Serienanordnung (Tore, Stellplätze)
      HallenAssistentDialog.tsx      # Hallen-Assistent
      MatrixDialog.tsx               # Entfernungsmatrix
      WegeberechnungDialog.tsx       # Auto-Wegeberechnung + gewichteter Verteilweg + Distanzmatrix
      SimulationDialog.tsx           # Simulationsdialog
      TorKalkulationDialog.tsx       # Tor-Kalkulation
      ProjektVergleichDialog.tsx     # Projektvergleich
      TorbelegungDialog.tsx          # Torbelegung + Verladeplan + Fahrplan (3 Tabs)
    ui/                              # shadcn/ui Komponenten
  hooks/
    useKeyboardShortcuts.ts          # Tastaturkürzel
  lib/
    store.ts                         # Zustand Store (TopisStore) + window.__topisStore (E2E)
    supabase.ts                      # Supabase-Client (lazy, guarded)
    auth.tsx                         # AuthProvider + useAuth (Login/Magic-Link/Logout)
    cloud-layouts.ts                 # Cloud-CRUD für Layouts + gezieltes Teilen
    wall-anchor.ts                   # Außenwand-Ableitung + Tor-Verankerung (deriveWalls)
    betriebsdaten-store.ts           # Zustand Store (ScanRecords, Analyse, HeatmapConfig, Szenarien)
    heatmap-utils.ts                 # Heatmap-Farben (getHeatmapColor, getMetrikWert, formatMetrikWert)
    analytics.ts                     # Produktivitätsanalyse
    pathfinding.ts                   # Wegberechnung (A* + Kreuzungs-Graph + computeAllPaths Batch)
    gang-generator.ts                # Automatische Gang-Generierung
    prozessmodell-store.ts           # Zustand Store (Prozessmodell, Parameter, Ergebnis)
    prozessrechner.ts                # Min/Colli-Berechnung (Kernformel + Batch-Faktor)
    benchmarking.ts                  # Vergleich mit Referenzhallen
    flaechenrechner.ts               # Flächenbedarfsrechnung (Colli/qm)
    ist-soll-rechner.ts              # IST-SOLL Produktivitätsanalyse
    verteilweg-rechner.ts            # Gewichteter Verteilweg aus Layout + berechneVerteilwegEffizient
    auto-layout-generator.ts         # Auto-Layout aus CSV (Tore, Bereiche, Gänge)
    eckdaten-analyse.ts              # Eckdaten→Dummy-Records + Demo-Records (AS Gersthofen)
    ampel-system.ts                  # KPI-Ampelbewertung (4 KPIs: Min/Colli, Produktivität, Rang, Spitze)
    simulation.ts                    # Simulations-Engine
    export.ts                        # Export-Funktionen
    showcase.ts                      # Demo-Szenarien
    layouts/schmid-halle6.ts         # Andreas Schmid Halle 6 Vorlage (85 Tore, 19 Sektionen)
    distanzmatrix-rechner.ts         # Verteilweg aus gemessener Distanzmatrix berechnen
    torbelegung-rechner.ts           # Spitzenauslastung, KPIs, Ankunftsverteilung
    data/
      prozessmodell-se.ts            # SE-Prozessmodell (Stückgut-Eingang, 3 Abteilungen)
      prozessmodell-sa.ts            # SA-Prozessmodell (Stückgut-Ausgang, 3 Abteilungen)
      prozessmodell-templates.ts     # Registry aller verfügbaren Modelle
      referenzhallen.ts              # 8 Referenzhallen für Benchmarking
      schmid-distanzmatrix.ts        # Gemessene Distanzen AS Halle 6 (204 EZ→Tor + 158 Leerhubwagen)
      schmid-fahrplan.ts             # Fahrplan AS Halle 6 (131 SE + 59 SA + Torbelegung + Verladebereiche)
  types/
    topis.ts                         # Layout-Typen (TopisObject, Gang, Path, PathArea, Conveyor, Hall, FFZ)
    betriebsdaten.ts                 # LayoutSnapshot
    prozessmodell.ts                 # Prozessmodell-Typen (AbteilungDefinition, Prozessschritt, etc.)
    distanzmatrix.ts                 # Distanzmatrix-Typen (DistanzEintrag, Leerhubwagen, Ergebnis)
    torbelegung.ts                   # Torbelegungs-Typen (Fahrplan, TorbelegungZelle, Verladebereiche)
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
- **Persistierung via `zustand/middleware` persist → localStorage**
  - `topis-layout`: Hallen, Objekte, Pfade, Gänge, FFZ, Conveyors (ohne UI-State wie Zoom, Selection, Undo)
  - `topis-betriebsdaten`: Scandaten, Analyse, Heatmap, Szenarien, Stundenaggregation
  - `topis-prozessmodell`: Modell, Parameter, Ergebnis
  - Überlebt Page Reloads, Tab-Wechsel (iPad Safari), Navigation zwischen /check und /projekt
  - Kein Backend — localStorage only

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
**WICHTIG (Fix 12.07.2026):** Der Batch-Divisor ist `colliProFahrt` (kalibriert, 3.39) — auch im FFZ-Mix-Pfad. Das FFZ-eigene `colliProBewegung` (Entlade-Batch ~1.2-1.4, ein anderer Prozess) greift nur als Fallback, wenn kein `colliProFahrt` gesetzt ist. Vorher teilte der Mix-Pfad fälschlich durch `colliProBewegung` → AS-Demo 3.286 statt 2.165. Regression-Locks in `prozessrechner.test.ts` (Mix ≈ Fallback ±0.05).

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
1. **Prozessmodell-Engine** — ✅ FERTIG. Min/Colli-Berechnung (SE + SA, kalibriert auf 1.917 Min/Colli)
2. **Automatische Wegeberechnung** — ✅ FERTIG. A* über Gang-Netzwerk, Kreuzungs-Graph, Batch (85×39=3315 Pfade)
3. **Gewichteter Verteilweg** — ✅ FERTIG. Colli-gewichtete Durchschnittswege, Pipeline: Scandaten → Verteilweg → Prozessmodell
4. **Benchmarking-Datenbank** — ✅ FERTIG. 8 Referenzhallen
5. **IST-SOLL-Abgleich** — ✅ FERTIG. Stundengenaue Produktivitätsanalyse
6. **Flächenbedarfsrechnung** — ✅ FERTIG. Colli/Tag / colliProQm = qm je Relation
7. **Verladeplan / Torbelegung** — ✅ FERTIG. SE-Heatmap, SA-Verladeplan, Fahrplan-Timeline (131 SE + 59 SA)
8. **Dashboard/Cockpit** — ✅ FERTIG. KPI-Übersicht

### Wegeberechnung (pathfinding.ts + WegeberechnungDialog)
- **Graph:** `buildGangGraph()` baut Graph aus Gang-Endpunkten + Kreuzungsknoten
- **Kreuzungen:** `isPointOnSegment()` findet Kreuzungspunkte, erzeugt Kanten zu BEIDEN Gängen
- **A*:** `findPath()` mit optionalem FFZ (Mindestbreite-Filter)
- **Batch:** `computeAllPaths()` baut Graph 1x, berechnet alle Start×Ende-Kombinationen
- **Path-Objekte:** `pathResultToPath()` konvertiert PathResult → persistenten Path (autoGenerated=true)
- **Store:** `addPaths()` für Batch-Import, `deleteAutoGeneratedPaths()` für Cleanup
- **WegeberechnungDialog:** FFZ-Auswahl, Start/Endpunkt-Checkboxen, Ergebnis-Tabelle, Verteilweg-Berechnung
- **Verteilweg-Pipeline:** Scandaten → `berechneVerteilwegEffizient()` → `setVerteilweg()` → Prozessmodell auto-recalc

### Gemessene Distanzmatrix (distanzmatrix-rechner.ts + WegeberechnungDialog)
- **Datenquelle:** `schmid-distanzmatrix.ts` — 204 Distanzpaare (3 EZ × 68 Tore) + 158 Leerhubwagen-Einträge (82.120 Colli)
- **Berechnung:** `berechneVerteilwegAusDistanzmatrix(dm, standardEZ)` → gewichteter Verteilweg
- **WICHTIG: Verwendet `distanzDoppeltM` (Hin+Rück)**, nicht `distanzM` (Einfachweg), da der SE-Verteilweg als Doppelweg kalibriert ist
- **Matching:** 3-Level: Exakte SE-Relation → Prefix-Match (z.B. "0100"→"01") → SA-Fallback → Ø-Distanz
- **Matching-Rate:** 63.6% (52.196/82.120 Colli) — 33 von 158 Relationen unmatched (nutzen Ø-Fallback)
- **Referenzwert:** 138.8m (Colli-gewichtet aus vollständiger AS-Datenbank, Doppelweg)
- **TOPIS-Ergebnis:** 122.7m (12% unter Referenz, wegen 36.4% ungematchter Relationen → Ø-Fallback drückt Wert)
- **Validierung:** 122.7m Verteilweg → 1.975 Min/Colli (Referenz: 1.917 = nur 3% Abweichung)
- **WegeberechnungDialog:** Bereich "Gemessene Distanzmatrix" mit Dropdown, Berechnung, Vergleich (Berechnet vs. Gemessen + Δ%)
- **Store:** `distanzmatrix`, `distanzmatrixErgebnis` in `betriebsdaten-store.ts`

### Torbelegung/Verladeplan (torbelegung-rechner.ts + TorbelegungDialog)
- **Datenquelle:** `schmid-fahrplan.ts` — 131 SE-Ankünfte + 59 SA-Abfahrten + Torbelegung-Matrix + 8 Verladebereiche
- **TorbelegungDialog:** 3 Tabs (CalendarClock-Icon in Toolbar)
  - **Tab 1 — SE Torbelegung:** Heatmap-Tabelle (Tore × Halbstunden) + Ankunftsverteilung (Balkendiagramm) + KPIs
  - **Tab 2 — SA Verladeplan:** Verladebereiche (B1–B9) mit Relationen + Colli/Tag + SA-Abfahrten sortiert
  - **Tab 3 — Fahrplan:** Zeitstrahl-Visualisierung (blau=SE, orange=SA) + filterbare Tabelle (Alle/SE/SA)
- **Rechner:** `berechneSpitzenauslastung()`, `berechneTorbelegungKPIs()`, `berechneAnkunftsverteilung()`
- **Store:** `fahrplan` in `betriebsdaten-store.ts`

### Kernformeln:
- **Min/Colli** = Σ(Standardzeit × Anteil × Häufigkeit) / 60
- **Wegzeit bei Layout-Schritten** = Verteilweg / Geschwindigkeit / colliProFahrt
- **MA-Stundenbedarf** = Colli/Tag × Min/Colli / arbeitsminProStunde (Parameter, Standard 52.9)
- **Flächenbedarf** = Colli/Tag / colliProQm (Parameter, Standard 1.25)

### Kunden-Check Self-Service (`/check`)
- **Zweck:** Kunden sehen sofort, dass etwas schief läuft → rufen ROTH an
- **Route:** `/check` — Choose → (Upload | Eckdaten | Demo) → Analyzing → Results
- **Kein Store nötig:** Alles lokal im Component-State (records, ergebnis, layout)
- **3 Einstiege, 1 Ergebnis:**
  | Einstieg | Was der Kunde tut | Datenquelle | Banner |
  |----------|-------------------|-------------|--------|
  | **Scandaten** | CSV hochladen (Drag & Drop) | Echte WMS-Daten | keins |
  | **Eckdaten** | 4 Felder ausfüllen (Tore, Colli/Tag, Fläche, FTE) | Generierte Dummy-Records | gelb: "mit Scandaten wird's genauer" |
  | **Demo** | 1 Klick | AS Gersthofen (85 Tore, 15.000 Colli, 5 Tage) | blau: "Demo-Daten" |
- **Eckdaten-Lib:** `src/lib/eckdaten-analyse.ts`
  - `generateRecordsFromEckdaten(eckdaten)` → 1 Tag, Nachtschicht-Profil, Pareto-Verteilung
  - `generateDemoRecords()` → 5 Tage, 85 Tore, Hotspot Tore 10-30, 18 AS-Sektionen
  - Beide erzeugen `ScandatenRecord[]` → gleiche Pipeline wie CSV-Upload
- **Pipeline:** Records → `generateAutoLayout()` → `berechneMinProColli()` → `berechneBenchmark()` → `bewerteKPIs()`
- **Auto-Layout:** Unique Stellplätze → Tore (Süd+Nord), Unique Relationen → Bereiche (Innenraum), 1 Hauptgang + 2 Quergänge
- **Ampel-KPIs (4):**
  | KPI | Grün | Gelb | Rot |
  |-----|------|------|-----|
  | Min/Colli | ≤110% Best | ≤150% | >150% |
  | Colli/MA-h | ≥90% Best | ≥70% | <70% |
  | Rang | Top 3 | 4-6 | 7+ |
  | Spitze/Ø | ≤1.5 | ≤2.0 | >2.0 |
- **"Im Experten-Editor öffnen":** Befüllt alle 3 Stores (Layout + Betriebsdaten + Prozessmodell) und navigiert zu `/projekt`
- **Reuse:** `parseCsvMitProfil`, `berechneMinProColli`, `berechneBenchmark`, `StundenChart`, `BenchmarkRadar`, `getHeatmapColor`
- **CTA:** `mailto:info@roth-logistik.de` mit vorgefülltem Betreff

## ROTH-Excel-Import (Ground Truth, seit 23.04.2026)

Das hart-kodierte SE-Modell in `prozessmodell-se.ts` liefert **2.040 Min/Colli** für AS Gersthofen, nicht die dokumentierten **1.917** (Commit-Message `b77d6861` vom 16.03.2026 hat nie gestimmt). Geis Nürnberg (1.95) und Nörpel Ulm (2.19) sind exakt — Drift nur bei AS, komplett im Entlader (0.956 statt 0.829).

**Lösung:** `src/lib/prozessmodell-excel-import.ts` liest die offizielle ROTH-Excel (Daniel-Kaiser-Pflichtenheft V1.1) direkt und übernimmt die Excel-berechneten `Zeit gewichtet [Min/Colli]`-Werte unverändert. Kein Rückweg über den vereinfachten TOPIS-Rechner → Δ 0.0% garantiert.

- **Parser:** 17 Prozessblöcke (SE/SA/AMAZON-Header in Col A), pro Block: Mengen + Parameter + Schritte mit Abteilung, Hilfsmittel, Anteil, Häufigkeit, Min/Colli
- **Dialog:** Toolbar-Button "ROTH-Excel" (`ProzessmodellImportDialog.tsx`) — Upload → Blockliste → Detail-View mit Abteilungs-Summen + Schritt-Tabelle
- **Validierung:** `src/lib/prozessmodell-excel-import.test.ts` — 7 synthetisch + 2 Integration-Tests gegen lokale AS-Excel (Kundendaten nicht ins Repo committet, `describe.skipIf(!asAvailable)`)
- **Read-only** (Stufe 2 von 4): Parameter-Änderungen erfordern neues Excel + Re-Import. Stufe 3 (Parameter-Editierbarkeit) bedingt Excel-Formel-Replikation in TS — ~1 Tag Arbeit, noch nicht gebaut.

**SharePoint-Quelle:** `Logistik-Beratung/20260306_Prozessmodell_AS_Aktualisiert.xlsx`. Credentials in `~/.openclaw/workspace/sharepoint_credentials.json`.

## Design-System (Apple-Schale + Figma-Inspector, seit 09.06.2026)

Gewählte Richtung nach Mockup-Vergleich (siehe Memory `project_topis_design_direction`): **Apple (macOS/iOS) als Schale + Figma-Anleihe im Inspector**, hell UND dunkel umschaltbar. shadcn/ui bleibt die Basis (themebar, KI-freundlich).

- **Tokens** in `src/app/globals.css` (`@theme inline` + `:root`/`.dark`): neutrale Apple-Palette (Anthrazit/Hellgrau), **ROTH-Rot als Akzent** (`--primary` ~`oklch(0.55 0.19 27)`), Radius `0.75rem`.
- **Schrift:** `--font-sans`/`--font-display` = San-Francisco-Stack (`-apple-system, BlinkMacSystemFont, …` → echtes SF auf Mac, Fallback Inter), `--font-mono` = SF Mono / IBM Plex Mono. Genutzt via `font-display` / `font-mono`-Utilities.
- **Hell/Dunkel:** next-themes (`.dark`-Klasse). Auch das **Canvas** folgt dem Theme (`HallCanvas` liest `useTheme().resolvedTheme` → `isDark`; Hintergrund/Raster/Hallenfläche/Objekt-Konturen umschalten). `isDark` MUSS in der `draw`-useCallback-Dependency-Liste stehen.
- **Muster:** Apple-Unified-Toolbar (translucent/backdrop-blur), Phasen-Nav als Segmented-Control, inset-gruppierte Panels, geführte Empty-States mit Icon. **Inspector** (`PropertiesPanel`): kompaktes Figma-Raster X/Y/B/T über die `NumField`-Komponente.
- **Login** (`src/components/auth/AuthScreen.tsx`) + **Startseite** (`src/app/page.tsx`) im selben Apple-Look.
- Verworfen: frühere Blueprint/Archivo-Richtung. Vor Design-Änderungen: Playwright-Screenshot hell+dunkel (Pflicht, siehe Memory `feedback_webdesign_quality_standard`).

## Tests

### Unit/Integration — Vitest 4.1.4 (`npm test`, `npm run test:watch`)
Config: `vitest.config.ts` mit `resolve.tsconfigPaths: true`. Stand 219 passed | 2 skipped. Kerndateien:
- `prozessrechner.test.ts` — SE-Baseline (2.040 als Regression-Lock + Kommentar zur 1.917-Doku-Drift), FFZ-Mix, MA-Bedarf
- `prozessrechner-kunden.test.ts` — Geis Nürnberg + Nörpel Ulm (beide Δ 0.0%)
- `pathfinding.test.ts` — buildGangGraph + A* + FFZ-Filter + L-förmiger Pfad
- `distanzmatrix-rechner.test.ts` — AS-Matching (122.7m), Exact/Prefix/Fallback, synthetische Minimal-Matrix
- `prozessmodell-excel-import.test.ts` — Block-Erkennung, Multi-Block, Folgezeilen, synthetisches Workbook-Roundtrip, AS-Integration
- `wall-anchor.test.ts` — deriveWalls (Außenwand-Ableitung), Tor-Verankerung

### E2E — Playwright (`npx playwright test tests/e2e`)
- Config `playwright.config.ts`: `baseURL`/`webServer.url` = `http://localhost:3000/topis-saas/projekt/` (Root 404t wegen basePath!). `webServer` startet `npm run dev` automatisch. Live-Tests via `BASE_URL=https://roth-jan.github.io/topis-saas/projekt/`.
- Stand: **31 passed, 2 `test.fixme`** (cs-3 Headless-Download-Capture, uc-10 Canvas-Pixel-Kalibrierung — Features im Code vorhanden, nur E2E-Mechanik offen). Nachgezogen 02.07.2026 nach IA-/UX-Umbau: WelcomeOverlay via `addInitScript` unterdrückt, „Lastenheft"→„Module"/Auswertungs-Phase, obsoleter Root-Spec `tests/topis-saas.spec.ts` durch schlanke Smoke-Suite ersetzt. Bei belegtem Port 3000: `TOPIS_PORT=3100 npx playwright test`.
- Use Cases: `uc-09` Lastenheft-Dropdown, `uc-10` Stellplatz-Formvarianten, `uc-11` Tor-Wandverankerung, `uc-12` Regal-Ebenen, `uc-13` Multi-Insert-Schemata, `uc-14` generische Properties; Customer-Szenarien `cs-1` Füllgrad-Ampel, `cs-2` Verlader-Bedarf, `cs-3` Bereich-CSV.
- **Helper `tests/e2e/helpers/topisPage.ts`** (zentral für neue Tests):
  - `gotoTopis(page)` — navigiert + wartet auf Hydration.
  - `patchLayoutState(page, patcher, arg?)` — seedet State aus dem **Live-Store** (`window.__topisStore`, robust gegen Fresh-Page-Race). `arg` an den Patcher durchreichen statt Closures (sonst ReferenceError beim Serialisieren!).
  - `inputByLabel(page, text)` — Input über `<label>`-Text finden (App verknüpft Label nicht via htmlFor → `getByLabel` greift nicht).
  - `selectObjectByName` / `selectedObjectName` — `selectedObject` wird NICHT persistiert → in der Liste klicken bzw. aus dem Live-Store lesen.
- `window.__topisStore` ist in `store.ts` exponiert (Read-Hook für E2E).

## Performance-Fixes (seit 17.04.2026)

- **`structuredClone()` statt `JSON.parse(JSON.stringify())`** in `store.ts` + `ProjektVergleichDialog.tsx` (28 Vorkommen). Bei großen Layouts 50-200ms Freeze pro Snapshot eliminiert.
- **`HallCanvas.tsx:898` useEffect-Deps** von 26 Einträgen auf `[draw]` reduziert. `draw` ist useCallback mit korrekten Deps → `[draw]` ist minimal und drift-sicher.
- **`src/lib/debounced-storage.ts`** — StateStorage-Adapter für Zustand-persist. 300ms Default-Delay, flush auf `pagehide`. In allen 3 Stores aktiv (`topis-layout`, `topis-betriebsdaten`, `topis-prozessmodell`). Batch-Wegeberechnung (3315 Pfade) schreibt nicht mehr 3315× auf localStorage.

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

## Cloud-Backend & Daten-Migration (seit 08.06.2026)

### Supabase (optional, client-seitig)
- Login (E-Mail/Passwort + Magic Link) + Cloud-Layouts mit gezieltem Teilen.
- Projekt `febebiqrjvazjozyowdt` (eu-central-1). Config in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`). Ohne Config → reiner localStorage-Modus, CloudMenu blendet sich aus.
- Code: `src/lib/{supabase.ts,auth.tsx,cloud-layouts.ts}`, `src/components/auth/*`, `src/components/dialogs/CloudProjekteDialog.tsx`.
- DB: `profiles` (Auto-Trigger), `layouts` (owner + `data` jsonb = die 4 Zustand-Stores als `{state,version}`-Blobs), `layout_shares` (view/edit). RLS aktiv mit SECURITY-DEFINER-Helfern (`is_layout_owner`, `has_layout_access`).

### Daten-Migration — VERBINDLICHE REGEL
Gespeicherte Hallen (localStorage UND Cloud) sind Produktionsdaten. Bei jeder Änderung:
1. **Berechnungs-Änderung** (Pathfinding, Verteilweg, Min/Colli): unkritisch — liest gespeicherte Geometrie, rechnet neu. Keine Migration nötig.
2. **Datenform-Änderung** (Feld umbenennen/entfernen, Objektstruktur ändern, neues Pflichtfeld): in der betroffenen persist-Config `version` erhöhen UND `migrate(persisted, fromVersion)`-Schritt ergänzen (Muster in `store.ts`). Cloud-Layouts speichern `{state,version}` → dieselbe Migration greift beim Laden.
3. **Vor jedem Breaking-Deploy**: `SUPABASE_PAT=sbp_... ./scripts/backup-cloud-layouts.sh` (sichert alle Blobs nach ~/topis-backups/).
4. **Testen**: ein vor der Änderung gespeichertes Layout laden und prüfen, dass nichts verloren geht (headless E2E wie bei der Tor-Migration).

Alle 4 Stores haben `version: 1` als Baseline. Idempotente Sonderfälle (z.B. Tor-Verankerung nachziehen) liegen in `onRehydrateStorage`.
