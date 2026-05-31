# Lastenheft-Gegencheck — vollständig über alle Element-Kapitel (Stand 2026-05-31)

Quelle: Daniel Kaiser v3 (2020). Vorgänger-Doku `LASTENHEFT-WEGE-GEGENCHECK.md` deckte nur 3.1.4 + 3.2.4 ab — viele Tor-/Stellplatz-/Halle-Eigenschaften waren ausgelassen.

Spalten: **Anforderung** · **Stand heute** · **Status** · **Priorität**

---

## 3.1.1 Halle / Grundriss / Außenwände

| Anforderung | Stand | Status | Prio |
|---|---|---|---|
| Halle als Gruppierung von Außenwänden, eigene Bezeichnung | Hall als Top-Object, Outer-Walls leer | ⚠ | mittel |
| Eigenschaften: Länge, Tiefe, **Höhe**, Winkel zur Nachbar-Wand | Höhe + Winkel fehlen | ❌ | mittel |
| Grundriss-Vorlagen I/T/L-Shape mit Längen-Edit | nur Rechteck | ❌ | mittel |
| Freihand-Außenwand-Zeichnung inkl. Rundungen | nicht implementiert | ❌ | groß |
| Mehrere Hallen auf einem Gelände (Multi-Halle) | halls[] da, UI fehlt | ❌ | groß |
| Koordinaten-Eingabe für Objekte (statt nur Drag) | teilweise im PropertiesPanel | ⚠ | klein |
| Mindesteinheit Zentimeter | Welt-Einheit Meter, 1 Nachkomma OK | ⚠ | klein |

## 3.1.1.2 Hallenausstattung (Innenwände, Pfosten, Türen, Treppen)

| Anforderung | Stand | Status | Prio |
|---|---|---|---|
| Innenwand-Objekt (Typ `wand`) | ✅ | ✅ | – |
| Pfosten/Pfeiler (Typ `pfosten`) | ✅ | ✅ | – |
| Türen Außenwand vs. Innenwand differenziert | beides als `tuer`, kein Wand-Bezug | ⚠ | klein |
| Treppen, Rampen, Leveller, Ladestation, Gefahrgut, Sperrplatz, Klärplatz, Büro, WC, Sozialraum | Types existieren | ✅ | – |
| Property „verankert" (starr/verschiebbar) | nicht modelliert | ❌ | klein |
| **„Format Übertragen"** (Eigenschaften kopieren von Objekt zu Objekt) | nicht da | ❌ | mittel |
| Höhen-Property an Innenwand/Pfosten/Wand | nicht modelliert | ❌ | klein |

## 3.1.2 Tore / Rampen — DAS WAR DER BLINDE FLECK

| Anforderung | Stand | Status | Prio |
|---|---|---|---|
| Tor-Position als „Abstand von Eckpunkten (S/E)" einer Wand | nur x/y in Welt-Koords | ❌ | klein |
| **Tor fest mit Außenwand verankert** (nicht frei in Halle platzierbar) | heute frei | ❌ | mittel |
| Mehrfacheinfügen mit Wand-Auswahl, Anzahl, Abstand, Nummerierungs-Schema | Multi-Insert da, aber nicht Wand-bezogen | ⚠ | mittel |
| Default-Werte für Tor-Eigenschaften vom User vorab konfigurierbar | nicht da | ❌ | klein |
| **Überladebrücke**: rechteckig, in Breite des Tores, frei einstellbar **direkt vor dem Tor** | `entladebereich`-Object wird beim Tor-Add erzeugt, **aber nicht an Tor gebunden** | ❌ | **groß** |
| **1 Tor = 1..n Verlader** (Auswertungs-Verknüpfung) | nicht modelliert | ❌ | **groß** |
| **1 Tor = 1..n Stellplätze** (Auswertungs-Verknüpfung) | nur über Pfade implizit | ❌ | **groß** |
| **1 Tor = 1..n Fahrzeuge** (Auswertungs-Verknüpfung) | nicht modelliert | ❌ | **groß** |
| **1 Tor = x Colli** (mengen-Verknüpfung) | `palettenProTag` existiert aber semantisch anders | ⚠ | mittel |
| Wegpunkt-Property (Start/Ende, Mittelpunkt vs. Rand) | ✅ wegpunktRolle + wegpunktOffset | ✅ | – |
| **Wegpunkt-Default je Tor-Seite** (Nord-Tor → Anker innen) | überall 0.5/0.5 default | ❌ | mittel |
| Rampe als eigene Kategorie (Außen-Variante + Innen-Variante) | nur ein Typ | ⚠ | klein |
| Bei Tor-Verschiebung Weg-Update | ✅ recompute | ✅ | – |
| Bei Tor-Löschung verwaiste Pfade | ✅ ⚠-Präfix | ✅ | – |

## 3.1.3 Nutzflächen — Stell-/Relationsplätze

| Anforderung | Stand | Status | Prio |
|---|---|---|---|
| Stellplatz als Objekt | ✅ | ✅ | – |
| Form: rechteckig + Kreis/Trapez/Freihand | nur rect, `shape: 'circle'` möglich aber nicht im Werkzeug | ⚠ | klein |
| Position frei oder per Koordinaten | beides möglich | ✅ | – |
| Drehung 1–359° | rotation-Property da | ⚠ teilweise | klein |
| Stellplatz darf nicht auf Wand/Pfosten/Tür liegen | keine Validierung | ❌ | klein |
| Wegpunkt-Eigenschaft: Start/Ende-Markierung | ✅ wegpunktRolle | ✅ | – |
| Wegberechnung: Mittelpunkt **oder frei wählbarer Punkt** (durch Klick) | wegpunktOffset (0..1), kein „Klick um Punkt zu setzen" | ⚠ | klein |
| **1 Stellplatz = 1..n Tore** als persistierte Verknüpfung | nicht modelliert | ❌ | **groß** |
| **Relationen pro Stellplatz (Menge, Verladebereich, Fahrzeuge)** | nicht modelliert | ❌ | **groß** |
| Bereich-Unterteilung der Relationen | nicht da | ❌ | mittel |
| Kapazität (qm, Anzahl) | `capacity`-Feld, Berechnung in `palettenProStellplatz` | ⚠ | klein |
| Füllgrad-Ampel | nicht visualisiert | ❌ | klein |

## 3.1.3.2 Regale

| Anforderung | Stand | Status | Prio |
|---|---|---|---|
| Regal als Stellplatz-Erweiterung mit 2..n Ebenen | `regal`-Type mit `ebenen`-Property, aber Ebenen-Daten nicht persistent | ⚠ | mittel |
| Pro Ebene: Bezeichnung, Unterkante, Höhe, Palettenplätze | `unterkante`, `ebenenHoehe`, `palettenPlaetzeProEbene` als Skalare, **nicht als Array pro Ebene** | ❌ | mittel |
| Anzeige der Ebenen-Bezeichnung auf Hallenplan | nicht visualisiert | ❌ | klein |

## 3.1.3.3 Sonder-/Klärplätze (Bestandsaufnahme)

| Anforderung | Stand | Status |
|---|---|---|
| Klärplatz (`klaerplatz`) | ✅ |
| Annahmeverweigerung (AV) | als Bereich-Name, kein eigener Type | ⚠ |
| Überzähligkeit (ÜZ) | analog | ⚠ |
| Gefahrgut (`gefahrgut`) | ✅ |
| Sperrigkeit (`sperrplatz`) | ✅ |
| Wertverschlag („Käfig") | kein eigener Type | ❌ |
| Palettenlager | als Bereich darstellbar | ⚠ |
| Ladestation | `ladestation` | ✅ |
| Hallenterminal | kein eigener Type | ❌ |
| Entladezone | als `entladebereich` Type | ✅ |

## 3.1.4 Wege — siehe LASTENHEFT-WEGE-GEGENCHECK.md (bereits sehr weit)

## 3.1.5 Unterflurförderkette — komplett fehlt (eigenes Modul)

## Kapitel 4 — Modul Verlader/Kette/Kapazität (Auswertung) — komplett fehlt

---

## Was wir JETZT anpacken (Jan: „direkt ganz")

1. **Überladebrücke an Tor binden** — `parentObjectId` generisch (auch für andere Eltern-Kind-Beziehungen nutzbar)
2. **Wegpunkt-Default je Tor-Seite** — Nord-Tor → `{0.5, 1}`, Süd → `{0.5, 0}`, West → `{1, 0.5}`, Ost → `{0, 0.5}`
3. **Tor↔Stellplatz/Verlader/Fahrzeug-Relationen** als Datenstruktur (`Tor.bedientStellplatzIds: number[]`, etc.) + minimales PropertiesPanel-UI

## Was als nächste Welle ansteht (nicht jetzt)

- Multi-Halle UI (eigene Diskussion)
- Stellplatz-Relations-Tabelle (Mengen, Verladebereich, Fahrzeuge pro Relation)
- Regal-Ebenen als Array
- Format-Übertragen
- Tor-Wand-Verankerung (Tor folgt Wand)
- Eckpunkt-S/E-basierte Positionierung
- Unterflurförderkette
- Modul Verlader/Kette/Kapazität
