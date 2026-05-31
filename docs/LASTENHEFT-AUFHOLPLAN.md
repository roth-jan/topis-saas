# Lastenheft-Aufholplan — Stand 2026-05-31

**Ausgangslage:** Gegencheck hat 35+ Lücken gegenüber Daniel-Kaiser-Lastenheft v3 identifiziert.
Aktuelle Konformität ~30%. Ziel: in mehreren Iterationen ≥80%.

## Phasen-Strategie

### Phase 1 — Datenmodell-Foundation (BLOCKER für alles weitere)
Erweiterungen in `src/types/topis.ts` + Store-Migration:

- `TopisObject.verankert?: 'starr' | 'verschiebbar'` (Lastenheft 3.1.1.2)
- `TopisObject.einschraenkungen?: string` (3.1.1.2)
- `TopisObject.bezeichnungStil?: { fontSize?, bold?, italic? }` (3.1.3.1)
- `TopisObject.druckSichtbar?: Record<string, boolean>` (3.1.7)
- `TopisObject.bildschirmSichtbar?: Record<string, boolean>` (3.1.7)
- `TopisObject.aussenwandRef?: { wallIndex, abstandS, abstandE }` (Tor an Wand, 3.1.2)
- `TopisObject.bedientToreVon?: number[]` (Stellplatz↔Tor umgekehrt, 3.1.3.1)
- `TopisObject.relationen?: StellplatzRelation[]` (3.1.3.1)
- `TopisObject.kapazitaetMulti?: { packstuecke?, lademeter?, qm? }` (3.1.3.1)
- `TopisObject.fuellgradFarben?: { gruen, gelb, rot }` (3.1.3.1)
- `TopisObject.regalEbenen?: RegalEbene[]` (3.1.3.2, Array statt Skalare)
- `TopisObject.nummernSchema?: '1' | 'A1' | '1A' | 'A'` (Mehrfach-Insert, 3.1.2)
- `TopisObject.formVariante?: 'rect' | 'circle' | 'trapez' | 'polygon'` (3.1.3.1)
- `TopisObject.polygonPunkte?: {x,y}[]` (für Trapez/Polygon)

**Neue Typen:**
- `StellplatzRelation { prozess, relation, menge, verladebereich?, fahrzeuge[], prozentAnteil? }`
- `RegalEbene { name, unterkante, hoehe, palettenplaetze, stellplatzProps }`
- `Mengen-Modell` mit `MengenEintrag { prozess, relation, anzahl, typ, abmessungen, stapelbar }`
- `KettenWegbereich` (Unterflurförderkette, 3.1.5)
- `Aussengelaende { gebaeude[], strassen[], sattelPlatz[], wechselBrueckenPlatz[] }`
- `BereichsEinteilung { name, torIds[], stellplatzIds[] }` (3.2.5)

**Neue ObjectTypes:**
- `kommissionierflaeche` (3.1.3.4)
- `wertverschlag` (3.1.3.3)
- `hallenterminal` (3.1.3.3)
- `av_platz`, `uz_platz` (statt nur Bereich)

### Phase 2 — Tor-Wand-Verankerung (kritisch, Tor war frei platzierbar)

1. `aussenwandRef` an jedes neue Tor: beim Insert zur nächsten Wand snappen
2. Bei Wand-Verschiebung: alle daran verankerten Tore mitziehen
3. PropertiesPanel: S/E-Abstand-Eingabe statt nur x/y
4. Validierung: Tor MUSS Außenwand-Kontakt haben

### Phase 3 — Stellplatz-Erweiterung
- Form Kreis/Trapez/Freihand (formVariante + polygonPunkte)
- Validierung "nicht auf starren Objekten"
- bedientToreVon-Liste am Stellplatz
- Relations-Card im PropertiesPanel
- Kapazität in 3 Einheiten
- Füllgrad-Ampel

### Phase 4 — Regal-Ebenen als Array
- regalEbenen[]-Array statt Skalare
- Ebenen-Editor im Panel
- Render: pro Ebene Bezeichnung im Canvas

### Phase 5 — Neue Element-Typen
- Sattel-/Wechselbrücken-Plätze (Außenbereich)
- Wertverschlag, Hallenterminal, AV, ÜZ
- Kommissionier-/Logistikflächen

### Phase 6 — Unterflurförderkette
- Eigener Wegbereich-Subtyp
- Fließrichtung-Property
- Wege zu/von Kette manuell, von Auto-Update ausgenommen
- Render: Pfeile für Fließrichtung

### Phase 7 — Auswertungen
- Hallen-Relations-Plan (neuer Dialog)
- Stellplatz-Mengen-Heatmap
- Bereichseinteilung-Dialog
- CSV-Export für Statistik
- Verladeplan außen am Tor

### Phase 8 — UX-Politur
- Eigenschaften ein-/ausblendbar (Druck vs. Bildschirm)
- Mehrfach-Insert mit Nummern-Schema
- Format-Übertragen (Eigenschaften zwischen Elementen kopieren)
- Bezeichnung formatierbar (Font/Bold)
- Teilabschnitts-Anzeige Weglänge

### Phase 9 — Module
- Verlader-Modul
- Kette-Modul (folgt aus Phase 6)
- Kapazität/Überhang-Modul

## Subagent-Nutzung

- **Subagent „Tests"**: Vitest-Tests für jede Datenmodell-Erweiterung parallel schreiben
- **Subagent „Doku"**: UEBERGABE-Dateien + HANDOFF.md am Ende aktualisieren
- **Subagent „Research"**: Vergleichbare Open-Source-Logistik-Tools nach Pattern durchsuchen

## Reihenfolge / Abhängigkeiten

```
Phase 1 (Datenmodell)
  ├── Phase 2 (Tor-Wand) → unabhängig
  ├── Phase 3 (Stellplatz) → unabhängig
  ├── Phase 4 (Regal) → unabhängig
  ├── Phase 5 (neue Typen) → unabhängig
  └── Phase 6 (Kette) → unabhängig
       ↓ alle parallelisierbar
Phase 7 (Auswertungen) — braucht Phase 1+3
Phase 8 (UX) — kann parallel zu allem laufen
Phase 9 (Module) — am Ende
```

## Realistische Erwartung für diese Session

In einer Session schaffbar: Phase 1 + Phase 2 + Phase 3 (substantiell) + erste Schritte Phase 4-5.
Phase 6-9 brauchen Folge-Sessions.

Jeden Phasen-Abschluss: Build + Test + Commit + Deploy.
