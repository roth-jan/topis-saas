# Lastenheft-Gegencheck v4 — Wort für Wort (Stand 2026-09-20, Branch `editor-2d`)

**Quelle:** Daniel Kaiser v3 (2020), 595 Zeilen + 376 Zeilen „Anforderungen TOPIS graphisch" (`docs/LASTENHEFT.txt`).
**Vorgänger:** v3 vom 31.05.2026 (am selben Tag noch durch den Aufholplan Phasen 1–8 überholt, Commit `806c44eb`; danach Wege-/KI-/Editor-Arbeit bis 04.08.2026, Commits `6aff4bd5` … `68cbb581`).

**Methode v4:** jede Zeile aus v3 gegen den Code auf `editor-2d` geprüft — nicht „Feld existiert im Typ", sondern **drei Stufen**:
- ✅ = Datenmodell **+ UI/Canvas + Logik** verdrahtet
- ⚠ = Datenmodell + teilweise UI (oder: nur Typ/Store-Action, ohne Bedienoberfläche)
- ❌ = fehlt

Spalte „Beleg" nennt die Datei, in der es steht. Nichts in dieser Tabelle ist aus der Doku übernommen — alles per `grep` im Quellcode verifiziert (Session 20.09.2026).

---

## 3.1.1.1 Grundriss, Außenwände

| Anforderung (wörtlich) | Stand | Status | Beleg |
|---|---|---|---|
| Halle aus 1 oder n Gebäuden, Außenwände als Gruppierung | `halls[]` + `setActiveHall` im Store, **keine UI** zum Anlegen/Wechseln | ⚠ | `store.ts:80,355`, kein Aufruf in `components/` |
| Eigene Bezeichnung pro Halle | `hall.name` | ✅ | `types/topis.ts:8` |
| Wand-Eigenschaften: Länge, Tiefe, **Höhe**, **Winkel** | nur Länge/Tiefe (`Wall` = 2 Punkte) | ❌ | `types/topis.ts:16` |
| Variante 1: Grundriss-Vorlage I/T/L-Shape mit Längen-Editor | **L/T/U/C werden gerendert** (`hallOutline`), Dropdown „Grundform" im Halle-Tab; Notch-Maße nicht einstellbar; **Tor-Verankerung + Wege bleiben rechteckbasiert** (`deriveWalls` = Bounding-Rect, bewusst) | ⚠ | `hall-shape.ts`, `HallCanvas.tsx traceHallPath`, `wall-anchor.ts:33` |
| Variante 2: Freihand-Außenwand inkl. Rundungen | nicht implementiert (KI-Baukatalog lehnt „runde Halle" bewusst ab) | ❌ | `docs/KI-BAUKATALOG.md` |
| Mehrere Hallen parallel auf einem Gelände | siehe Zeile 1 — Store ja, UI nein | ⚠ | |
| Wand farbliche Hervorhebung beim Bearbeiten | Hover-Umriss existiert für Objekte (A2), nicht für Wände | ❌ | |
| Kleinste Einheit Zentimeter | Welt in m, Eingabe mit 2 NK (S/E-Abstand `.toFixed(2)`), Canvas rundet Stützpunkte auf 0,1 m | ⚠ | `PropertiesPanel.tsx:545` |
| Koordinaten-Eingabe für Eckpunkte-Verschiebung | X/Y/B/T-Raster im Inspector; **Tore/Rampen zusätzlich als S/E-Abstand** | ⚠ | `PropertiesPanel.tsx` NumField |

## 3.1.1.2 Hallenausstattung (Innenfläche)

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Element-Eigenschaften: Farbe, Abmessungen, **verankert (starr/verschiebbar)**, Wegpunkt, **Einschränkungen**, Kategorie | alle im Panel editierbar; `verankert` fließt in Wand-Anker-Logik; `einschraenkungen` ist Freitext ohne Auswertung | ✅ (Einschränkungen nur dokumentativ) | `PropertiesPanel.tsx:411`, `wall-anchor.ts` |
| **Format Übertragen** (wie MS) | Store-Actions `setFormatClipboard`/`applyFormatTo` vorhanden, **kein Button, kein Shortcut** | ⚠ | `store.ts:177,1043`; 0 Treffer in `components/` |
| Innenwand | ✅ | ✅ | |
| Pfosten/Pfeiler | ✅ | ✅ | |
| Türen Außenwand / Innenwand als eigene Klassen | ein Typ `tuer`; Wege gehen durch Türen (Durchlass in `lineCrossesAnyWall`) | ⚠ | `pathfinding.ts` |
| Treppen | ✅ | ✅ | |
| Objektliste erweiterbar („Baukasten") | `custom` + `tags` + `meta` + `icon` | ✅ | |
| Individuelle Icons | `icon`-Property | ✅ | |
| Position über Koordinaten ODER Abstände zu Außenwänden/Eckpunkten | Koordinaten für alle; Eckpunkt-Abstand nur Tore/Rampen | ⚠ | |

## 3.1.2 Tore

| Anforderung (wörtlich) | Stand | Status | Beleg |
|---|---|---|---|
| **Tore FEST mit Außenwand VERANKERT, nicht frei platzierbar** | `aussenwandRef`; Einfügen snappt an nächste Wand; **Ziehen re-verankert immer** (Distanzlimit 30 m am 20.09. entfernt); Hallenmaß-Änderung zieht Tore mit (`reanchorTore`); Migration alter Tore in `onRehydrateStorage` | ✅ | `store.ts` addObject/updateObject/updateHall, `wall-anchor.ts` |
| Position als „Abstand von Eckpunkten S und E" | Panel zeigt/ändert S- und E-Abstand | ✅ | `PropertiesPanel.tsx:545ff` |
| Bezeichnung max. 100 Zeichen | keine Begrenzung | ⚠ | |
| **„Art: Text, max. 100 Zeichen"** | `torArt` im Typ, **nirgends im UI** | ⚠ | `types/topis.ts`, 0 Treffer in `components/` |
| Mehrfacheinfügen: Wand-Auswahl, Eckpunkt-Abstand, Anzahl, Tor-Abstand, Startwert, Nummern-Schema (1,2,3 / A1 / 1A / A) | MultiInsert **wand-relativ** (Wand + Startabstand), `nummernSchema` vorhanden | ✅ | `MultiInsertDialog.tsx:29,90,148` |
| Default-Werte pro Halle hinterlegbar | `OBJECT_DEFAULTS` global, nicht pro Halle | ❌ | `showcase.ts:32` |
| Eigenschaften einzeln ein-/ausblendbar (Bildschirm vs. Druck) | `bildschirmSichtbar`/`druckSichtbar` + `setAnsichtsModus` im Store, **nicht im UI, nicht im Renderer** | ⚠ | `store.ts:182`; 0 Treffer in `components/`/Canvas |
| Überladebrücke optional, Tor-Breite, Länge, innen vor dem Tor | ✅ + gerendert + Parent-Bindung | ✅ | `HallCanvas.tsx` (3 Stellen) |
| 1 Tor = 1..n Verlader / Stellplätze / Fahrzeuge | Panel-Felder + VerladerDialog | ✅ | `PropertiesPanel.tsx`, `VerladerDialog.tsx` |
| 1 Tor = x Colli | `palettenProTag`, Heatmap aus Scandaten | ⚠ | |
| Wegpunkt-Property (Start/Ende/beides) | ✅ + in Wegeberechnung gefiltert | ✅ | `path-anchor.ts`, `WegeberechnungDialog.tsx` |
| Wegpunkt-Default-Anker innen je Tor-Seite | ✅ | ✅ | `path-anchor.ts:71` |

## 3.1.2.2 Rampen

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Nahverkehrsrampen außen am Grundriss | Typ `rampe`, **dockt beim Einfügen nach außen an nächste Wand** (B7), wandert bei Hallenänderung mit | ✅ | `wall-anchor.ts rampeBoxFromAnchor` |
| Eigenschaften Länge/Tiefe/Höhe/Bezeichnung/S-E-Position | Länge/Tiefe/Name/S-E ja, Höhe nein | ⚠ | |
| Wege oder Stellplätze auf Rampen | nicht modelliert (Rampe ist kein Wegbereich, kein Wege-Start) | ❌ | |
| Rampe = Bestandteil Außengelände | Rampe außen, aber kein Container-Bezug | ⚠ | |

## 3.1.3.1 Stell-/Relationsplatz

| Anforderung (wörtlich) | Stand | Status | Beleg |
|---|---|---|---|
| Stellplatz darf nicht auf starren Objekten liegen | **keine Validierung** beim Platzieren/Ziehen (nur KI-Bau prüft Kollisionen) | ❌ | `store.ts` ohne Kollisionscheck; `nl-layout.ts:342` nur KI |
| Form rechteckig + Kreis, Trapez, individuell, Freihand | `formVariante` rect/circle/trapez/polygon gerendert + im Panel wählbar; **Freihand-Zeichnen fehlt** | ⚠ | `shape-render.ts`, `HallCanvas.tsx` |
| Drehung 1–359° | `rotation` im Panel (∠-Feld) + R-Taste (90°); **Renderer ignoriert Winkel ≠ 90°-Vielfache** (nur B/T-Tausch) | ⚠ | `shape-render.ts:28`, `useKeyboardShortcuts.ts:71` |
| Bezeichnungstext formatierbar | `bezeichnungStil` im Panel editierbar; **Canvas wertet es nicht aus** | ⚠ | 0 Treffer in `HallCanvas.tsx` |
| Wegpunkt-Property | ✅ | ✅ | |
| Wegberechnung: Mittelpunkt oder frei wählbarer Punkt | `wegpunktOffset` (0..1) im Panel; kein Klick-auf-Zeichenfläche-Anker | ⚠ | |
| Eigenschaften ein-/ausblendbar (Bildschirm/Druck) | wie bei Toren — Store ja, UI nein | ⚠ | |
| 1 Stellplatz ↔ n Tore | `bedientToreVon` im Panel | ✅ | `PropertiesPanel.tsx` |
| 1 Stellplatz ↔ n Relationen + Mengen | `relationen[]` (StellplatzRelation) im Panel + HallenRelationsPlan | ✅ | `hallen-relations-plan.ts` |
| Relationen nach Bereichen unterteilt | `bereichGruppe` in StellplatzRelation | ✅ | `types/topis.ts:214` |
| Relation ↔ 1 Verladebereich | `verladebereich` | ✅ | |
| Relation ↔ n Fahrzeuge | `fahrzeugIds` | ✅ | |
| Kapazität in Packstücken / Lademeter / qm | `kapazitaetMulti` im Panel | ✅ | |
| Füllgrad-Ampel = Menge/Kapazität, individuelle Farbverteilung | `fuellgradFarben` (Schwellen) im Panel + Relations-Plan; E2E `cs-1` | ✅ | `HallenRelationsPlanDialog.tsx` |

## 3.1.3.2 Regale

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| 2–n Ebenen, jede Ebene = eigener Stellplatz | `regalEbenen[]` (RegalEbene mit Kapazität + Relationen) + Ebenen-Editor im Panel; E2E `uc-12` | ✅ | `PropertiesPanel.tsx`, `types/topis.ts:217` |
| Pro Ebene: Bezeichnung, Unterkante, Höhe, Plätze | ✅ | ✅ | |
| Ebenen-Bezeichnung auf Hallenplan | **Canvas zeichnet Bays + „×N"-Badge** (B8), nicht die Namen der einzelnen Ebenen | ⚠ | `HallCanvas.tsx` (regalEbenen 1 Treffer) |

## 3.1.3.3 Sonder- und Klärplätze

| Typ | Stand | Status |
|---|---|---|
| Klärplatz, Gefahrgut, Sperrigkeit, Ladestation | ✅ | ✅ |
| Annahmeverweigerung (AV) | eigener Typ `av_platz` in Toolbar | ✅ |
| Überzähligkeit (ÜZ) | `uz_platz` | ✅ |
| Wertverschlag („Käfig") | `wertverschlag` | ✅ |
| Palettenlager | `palettenlager` | ✅ |
| Hallenterminals | `hallenterminal` | ✅ |

## 3.1.3.4 Kommissionier-/Logistikflächen

| Anforderung | Stand | Status |
|---|---|---|
| Eigene Kategorie | `kommissionierflaeche` als Typ in Toolbar | ✅ |

## 3.1.3.6 Individualobjekt — ✅ (`custom` + tags/meta/icon)

## 3.1.4.1 Wegbereiche

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Systemgestützt vollflächig, Abwahl per Rechteck-Mouseover | Negativ-Modus generiert Freiflächen (Toolbar); **Abwählen per Mouseover fehlt** | ⚠ | `wegflaeche-negativ.ts`, `Toolbar.tsx:537` |
| Manuell durch Einzeichnung | ✅ | ✅ | |
| System erkennt belegte Bereiche und klammert sie aus | Negativ-Modus klammert Objekte aus; manuelle Wegfläche nur Warnung | ⚠ | |
| Teilflächen per Koordinaten-Eingabe | nur grafisch | ❌ | |

## 3.1.4.2 Wege

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Manuell mit Wegname nach Abschluss | Name editierbar, kein Pflicht-Dialog | ⚠ | |
| Automatisch, kürzeste Verbindung, nur im Wegbereich, Mitte des Wegs | ✅ Auto-Gang aus pathArea + A* | ✅ | `pathfinding.ts`, `Gang.autoFromPathAreaId` |
| Start/End: Tore/Rampen, Nutzflächen | Tore + Nutzflächen ja; **Rampen/Außenplätze nicht als Start/Ende** | ⚠ | |
| Tür als Wand-Durchlass | ✅ | ✅ | `pathfinding.ts lineCrossesAnyWall` |
| Weglängen je Teilabschnitt oder gesamt | nur gesamt | ❌ | 0 Treffer „Teilabschnitt" |
| Weg aktualisiert bei Verschiebung verknüpfter Elemente | ✅ `scheduleRecomputeForObject` | ✅ | `store.ts` |
| Manuelle Wege nach Auto-Regeln aktualisiert (Stützpunkte) | ✅ | ✅ | `Path.stuetzpunkte` |

## 3.1.4.4 Zeitbedarf

| Anforderung | Stand | Status |
|---|---|---|
| FFZ mit Geschwindigkeiten | ✅ | ✅ |
| Anteil × Weg / Geschwindigkeit = reine Wegzeit | ✅ | ✅ |
| Aufnehmen + Wegzeit + Absetzen = Gesamtzeit | FFZ hat `aufnahmeZeit`/`abgabeZeit`, im Prozessmodell teilweise | ⚠ |
| Detail je FFZ aufklappbar | fehlt im UI | ❌ |

## 3.1.5 Unterflurförderkette (war in v3 komplett ❌)

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Eigener Wegbereich, festzulegende Breite | `KettenWegbereich` + KettenDialog + Store-Actions | ✅ | `KettenDialog.tsx`, `store.ts:199` |
| Kurven und Geraden | Catmull-Rom über Stützpunkte, Klick-Zeichnen mit `kette`-Tool (B9) | ✅ | `HallCanvas.tsx`, `kette-geometry.ts` |
| Überlappung mit Wegbereich erlaubt | keine Sperre → erlaubt | ✅ | |
| **Nutzflächen dürfen nicht im Kettenbereich liegen** | `verbietetNutzflaeche()` existiert, **wird nirgends aufgerufen** | ⚠ | `kette-geometry.ts:250`, 0 Aufrufer |
| Kettenweg mittig, eine Fließrichtung, einstellbar + sichtbar | Fließrichtung im Dialog + Pfeile alle 8 m | ✅ | |
| Beliebige Kettenpunkte als Start/Endpunkt | nicht in Wegeberechnung | ❌ | 0 Treffer „kette" in `pathfinding.ts` |
| Manuelle Wege zu/von Kette, ausgenommen von Auto-Update | nicht modelliert | ❌ | |
| Kettenweg-Berechnung mit Fließrichtung | nicht implementiert | ❌ | |
| Kettenweg erfordert vor-/nachgelagerten Weg | nicht implementiert | ❌ | |

## 3.1.6 Außengelände (war in v3 komplett ❌)

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Außengelände-Objekte schematisch | `outdoor_area`, `outdoor_road`, `parking`, `trailer_spot` in Toolbar „outdoor" (B10) | ✅ | `Toolbar.tsx` |
| Färbung + Bezeichnung | ✅ generisch | ✅ | |
| Sattel-/Wechselbrücken-Plätze | `sattelplatz`, `wechselbrueckenplatz` | ✅ | |
| Fahrwege/Straßen außen | `outdoor_road` mit Fahrbahnmarkierung; **nicht als Wegenetz** (kein Wege-Start/-Ende außen) | ⚠ | |
| Abstrakter `Aussengelaende`-Container | Store-State ohne UI — **bewusst nicht gewired** (outdoor_area deckt das ab) | — | `store.ts:268` |

## 3.1.7 Anzeige

| Anforderung | Stand | Status |
|---|---|---|
| Zoom + Scroll + Skalierung | ✅ | ✅ |
| Eigenschaftenfenster | ✅ | ✅ |
| Wege ein-/ausblendbar; Teilabschnitt vs. gesamt | Wege ein/aus ja; Teilabschnitt nein | ⚠ |
| Nutzflächentyp-spezifisch Bezeichnung ein-/ausblenden | fehlt | ❌ |

## 3.2.1 Mengen (war in v3 komplett ❌)

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Prozess-/Mengenkategorien mit Subprozessen | `Prozesskategorie` + MengenDialog | ✅ | `MengenDialog.tsx`, `mengen-store-actions.ts` |
| Mengen-Detail: Prozess+Relation+Anzahl+Typ (Palette/Halbpalette/Chep/GiBo/…)+Maße+stapelbar | `MengenEintrag` vollständig | ✅ | `types/topis.ts:246` |
| Excel/CSV-Mengen-Import | CSV-Datei-Import im MengenDialog | ✅ | `MengenDialog.tsx:146` |
| Mengen einer Prozesskategorie löschen + neu | Actions vorhanden | ✅ | |

## 3.2.2 Relationszuordnung

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Je Prozess+Relation 1..n Stell-/Regalplatz | `relationen[]` am Stellplatz + an RegalEbene | ✅ | |
| Übersichts-Dialog Prozess/Relation/Stellplatz | RelationZuordnungDialog + HallenRelationsPlan | ✅ | |
| n:m über Prozesse hinweg | Datenmodell erlaubt es | ✅ | |
| Prozentuale Verteilung | `prozentAnteil` im Typ, **kein UI-Feld** | ⚠ | 0 Treffer in `components/` |
| Filter „nicht zugeordnete Relationen" | Textfilter ja, Status-Filter nein | ⚠ | `RelationZuordnungDialog.tsx:67` |
| Abfahrtszeiten je Prozess+Relation | Fahrplan-Import (AS) | ⚠ | |

## 3.2.3 Stellplatzauswertung (war in v3 ❌)

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Hallen-Relations-Plan mit Prozess ein-/ausblenden | ✅ | ✅ | `HallenRelationsPlanDialog.tsx:115` |
| Schriftgröße veränderbar | ✅ | ✅ | `:113` |
| Menge je Stellplatz als Heatmap | im Dialog ✅ (`computeHeatmapBg`); **auf dem Canvas nur Tor-Heatmap** | ⚠ | `:436` |

## 3.2.4 Mittlerer Weg

| Anforderung | Stand | Status |
|---|---|---|
| Bezeichnung + Prozess | ✅ | ✅ |
| Start/End grafisch (Mouseover/Klick) | Checkbox-Liste | ⚠ |
| Auto-Weg pro Kombination + Länge | ✅ (fail-loud, keine Luftlinien, seit 27.07.) | ✅ |
| Manuelle Wege mit ausgeben | ✅ CSV A/M | ✅ |
| CSV-Export Art/Start/Ende/Weg/Länge | ✅ | ✅ |
| Kettenwege gesondert kennzeichnen | Kette nicht in Wegeberechnung | ❌ |
| Wiederholbar mit Auto-Update | Run gespeichert, kein Auto-Re-Run | ⚠ |

## 3.2.5 Bereichseinteilung (war in v3 ❌)

| Anforderung | Stand | Status | Beleg |
|---|---|---|---|
| Tore + Stellplätze zu Bereichen gruppieren | `BereichsEinteilung` + Dialog (Toolbar) | ✅ | `BereichsEinteilungDialog.tsx` |
| Mengen je Prozesskategorie summiert | ✅ | ✅ | `:22,62` |
| Speicherbar + adaptiv | persistiert, berechnet beim Öffnen | ✅ | |
| CSV-Export | ✅ | ✅ | `:35` |

## 3.3 Auswertungen / Export

| Anforderung | Stand | Status |
|---|---|---|
| Hallenplan druckbar | `printLayout` + PNG/SVG | ✅ |
| Verladeplan außen am Tor | TorbelegungDialog (Tabelle), nicht am Tor im Plan | ⚠ |
| Wege-Export CSV mit Filtern (auto/manuell, Gruppe, Start/Ende) | Export ja, Filter nur auto/manuell | ⚠ |
| Statistik: Gesamtfläche, Fahrwege, Nutzflächen je Typ, Regal, Hof | AnalyticsPanel zeigt Nutzfläche/Kennzahlen; kein vollständiger Flächen-Split, **kein CSV** | ⚠ |

## 3.4 Allgemein

| Anforderung | Stand | Status |
|---|---|---|
| Standardwerte pro Element-Typ, pro Halle anpassbar | global | ❌ |
| Hallenspezifischer Systemordner | JSON-Export + Cloud-Layouts (Supabase) | ⚠ |
| CSV-Export aller Daten | Wege, Bereiche, Matrix ja; Objekte/Statistik nein | ⚠ |
| Mehrsprachigkeit nicht erforderlich | ✅ | ✅ |

## Module

| Modul | Stand | Status |
|---|---|---|
| Wege (auto + gewichteter Mittelweg) | ✅ | ✅ |
| Verlader | VerladerDialog + Tor↔Verlader-Verknüpfung | ✅ |
| Kette | Zeichnen/Anzeigen ✅, Rechenlogik ❌ | ⚠ |
| Kapazität + Überhangmanagement | 0 Treffer „Überhang" | ❌ |

---

## Delta v3 → v4 (was seit 31.05. dazugekommen ist)

Von den **35 in v3 gelisteten Lücken** sind:
- **21 geschlossen** (✅): Tor-Wandverankerung, S/E-Position, Nummern-Schemata, Stellplatz↔Tor umgekehrt, Relationen/Verladebereich/Fahrzeuge am Stellplatz, Kapazität 3 Einheiten, Füllgrad-Ampel, Regal-Ebenen-Array, Kommissionierfläche, AV/ÜZ/Wertverschlag/Palettenlager/Terminal, Mengen-Modell, Relationszuordnung n:m, Hallen-Relations-Plan, Bereichseinteilung + CSV, Verlader-Modul, Außengelände-Objekte, Kette zeichnen/anzeigen, Rampen an der Wand, verankert/Einschränkungen-Properties.
- **9 halb** (⚠, meist „Store ja, UI nein" oder „Anzeige ja, Rechnung nein"): Format übertragen, Bildschirm/Druck-Sichtbarkeit, Bezeichnungs-Formatierung, Stellplatz-Formen (kein Freihand), Klick-Anker, prozentuale Verteilung, Mengen-Heatmap auf dem Canvas, Wegbereich-Beschneidung, Kette-Rechenlogik.
- **5 offen** (❌): Stellplatz-auf-starr-Validierung, Teilabschnitts-Weglänge, Defaults pro Halle, Statistik-CSV, Kapazität/Überhang-Modul.

**Grober Konformitätsgrad (gezählt über alle Zeilen oben, ✅ = 1, ⚠ = 0,5):** ca. **68 %** (v3: ~30 %).

## Was jetzt am meisten bringt (Reihenfolge nach Nutzen ÷ Aufwand)

1. **„Store ja, UI nein"-Reste anschließen** — Format-übertragen-Button, `torArt`-Feld, `prozentAnteil`-Feld, Druck/Bildschirm-Umschalter. Kleine UI-Arbeit, hebt ~5 Zeilen von ⚠ auf ✅.
2. **Stellplatz-auf-starr-Validierung** beim Platzieren/Ziehen (Warnung, nicht Sperre) — Lastenheft-Pflicht, Kollisionsfunktion aus `nl-layout.ts:342` wiederverwendbar.
3. **Kette in der Wegeberechnung** (Kettenpunkte als Start/Ende, Fließrichtung, `verbietetNutzflaeche` durchsetzen) — fachlich das größte Loch, weil AS Halle 6 eine Kette hat.
4. **Teilabschnitts-Weglänge** anzeigen (Stützpunkt-zu-Stützpunkt) — reine Anzeige, Daten liegen in `stuetzpunkte`.
5. **Statistik-CSV** (Flächenbilanz je Typ) — Export-Funktion neben `exportMatrixCSV`.
6. **Multi-Halle-UI** und **Notch-Wände für L/T** — größer, erst nach Jans Prio-Entscheid.

## Bekannte, bewusste Grenzen (nicht als Bug melden)

- KI-Textbuilder baut nur Rechteck-Hallen + Tore + Stellplätze + Bereiche + Mittelgang (KI-Baukatalog v1). L/T, Rampen, Regale, Kette per KI: nicht.
- L/T/U/C-Grundriss ist **Darstellung**; Tore/Wege rechnen weiter mit dem umschließenden Rechteck (Entscheidung B6, 04.08.).
- `rotation` ≠ 90°-Vielfache ist im Renderer no-op (Lastenheft-Future).
