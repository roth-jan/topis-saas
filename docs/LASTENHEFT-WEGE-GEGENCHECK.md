# Lastenheft-Gegencheck Wege (Stand 2026-05-29, nach pathArea↔Gang-Konsolidierung Schritt 1)

Original-Lastenheft: Daniel Kaiser v3 (2020), Kapitel 3.1.4, 3.2.4, 3.3.2 + Wegpunkt-Property aus 3.1.2/3.1.3.

Spalten: **Anforderung** (zitiert) · **Stand heute** · **Status** · **Hinweis**

---

## 3.1.4.1 Definition Wegbereiche

| Anforderung | Stand heute | Status |
|---|---|---|
| „Wegbereiche können auf zwei Arten eingezeichnet … Definition (Negativ-Auswahl): Nutzer wählt Flächen, die NICHT als Weg dienen sollen, durch rechteckiges Mouseover ab." | nicht implementiert | ❌ |
| „Manuell: Durch Auswahl verschiedener Wegbereiche wird die Gesamt-Wegfläche zusammengesetzt." | Wegfläche-Werkzeug existiert (Rechteck-Drag) | ✅ |
| „In beiden Varianten kann der Wegbereich nachträglich durch Hinzufügen oder Abwählen von Teilflächen verändert werden." | Einzeln editieren ja, „Negativ-Modus" nein | ⚠ |
| „Teilflächen sollen auch durch Eingabe der Koordinaten definierbar sein." | nur grafisch | ❌ |
| „System erkennt automatisch nicht wählbare Bereiche (von anderen Elementen belegt) und bezieht diese nicht mit ein." | wenn pathArea über Bereich gezeichnet wird, gilt sie trotzdem als befahrbar | ❌ |

## 3.1.4.2 Einzeichnung Fahr- und Verteilwege

| Anforderung | Stand heute | Status |
|---|---|---|
| „Wege dürfen nur auf den definierten Wegbereichen eingezeichnet oder hinterlegt werden." | manueller Pfad-Klick respektiert pathArea (FIX-C), A* respektiert pathArea (Konsolidierung heute) | ✅ |
| „Wege dürfen nicht über andere Elemente führen oder durch sie hindurchgehen. Ausnahme: Tür in einer Wand." | `lineCrossesAnyWall` mit Tür-Durchlass | ✅ |
| „Jeder Weg verfügt über Start- und Endpunkt mit beliebig vielen Zwischenpunkten." | Path.waypoints[] | ✅ |
| Start-/Endpunkt-Property an Element („Wegpunkt: Markierung ob Element Start/Ziel sein kann"). Default Mittelpunkt, optional Rand. | derzeit nicht — alle Tore/Bereiche/Stellplätze sind automatisch Anker. Center-Punkt hartcodiert. | ❌ |
| „Manuell: Anklicken Startpunkt, Wegpunkte, Endpunkt … Bei Regelverstoß Hinweis, Weg nicht abgeschlossen." | Hinweis ✅ (pathArea-Toast, Wand-Crossing-Toast), Abschluss-Logik ✅ | ✅ |
| „Automatisch: Auswahl Start+Endpunkt, System zeichnet kürzeste Verbindung, automatische Namensvergabe (Von-Nach)." | bei 2-Anker-Klick im Pfad-Werkzeug auto-routed; WegeberechnungDialog für Massen | ✅ |
| „Bei Verschiebung der verknüpften Elemente muss der Weg aktualisiert werden." | `recomputeAllPaths` 80ms-Debounce für Paths mit startObjectId+endObjectId | ✅ |
| „Manuell gezeichnete Wege werden nach den Regeln der automatischen Wege aktualisiert." | wenn Path startObjectId+endObjectId hat → ja; rein manuelle ohne Anker → nein | ⚠ |
| „Weglängen müssen angezeigt werden, wählbar je Teilabschnitt oder gesamt." | Gesamtdistanz auf Path.distance; Teilabschnitt-Anzeige fehlt | ⚠ |

## 3.2.4 Mittlerer Weg

| Anforderung | Stand heute | Status |
|---|---|---|
| „Nach Aufruf Wegbezeichnung vergeben; einem Prozess zuordnen." | WegeberechnungDialog hat keinen Namen + keine Prozess-Zuordnung pro Run | ❌ |
| „Alle Elemente die Start sein können (Tore, Rampen, Nutzflächen) auswählen — grafisch, mehrere Wege gleichzeitig." | Checkboxen-Liste im Dialog | ✅ |
| „Für alle Start×End-Kombinationen automatischer Weg + Länge." | `computeAllPaths` ✅ | ✅ |
| „Prüfen ob manuell gezeichnete Wege für die Verbindungen vorhanden sind; mit ausgeben." | wird nicht geprüft, automatische überschreiben | ❌ |
| „Ausgabe als CSV-Datei: Art, Start, Ende, Weg, Länge. Auto-Wege zuerst, manuelle danach. Kettenwege gesondert." | kein CSV-Export im Dialog; Path-JSON-Export geht | ❌ |
| „Speicherbar/exportierbar jederzeit." | nur als Path-Layer im JSON | ⚠ |
| „Ausgabe wiederholbar; Wegberechnung aktualisieren wenn sich Lage geändert hat." | recompute schon, aber Mittlerer-Weg-Run als Entität existiert nicht | ⚠ |

## 3.3.2 Wege (Ausgabe-Kapitel)

| Anforderung | Stand heute | Status |
|---|---|---|
| Gezeichnete und berechnete Wege anzeigen | Canvas rendert beides | ✅ |
| Weglänge anzeigen | im PropertiesPanel + im WegeberechnungDialog | ✅ |

## Wegpunkt-Property an Elementen (Kapitel 3.1.2 Tore + 3.1.3.2 Stellplätze)

| Anforderung | Stand heute | Status |
|---|---|---|
| „Wegpunkt: Markierung ob Tor/Stellplatz Start- und/oder Endpunkt eines Wegs sein kann" | nicht modelliert; alle gelten als beides | ❌ |
| „Default Mittelpunkt, kann auf Rand verschoben werden" | hartcodiert Mittelpunkt | ❌ |

## FFZ + Brandschutz + Türen (3.1.1.2)

| Anforderung | Stand heute | Status |
|---|---|---|
| Türen sind Durchlass in Wänden | `lineCrossesAnyWall` mit Tür-Ausnahme | ✅ |
| FFZ-Stammdaten mit Geschwindigkeit, Mindestbreite, Cluster | `FFZ`-Typ + Filter im A* | ✅ |
| FFZ-Filter scheitert silent wenn alle Gänge zu schmal | passiert ohne Hinweis → User glaubt „kein Pfad möglich" | ⚠ Bug |

---

## Zusammenfassung — Status pro Kapitel

| Kapitel | ✅ | ⚠ | ❌ |
|---------|---|---|---|
| 3.1.4.1 Wegbereiche | 1 | 1 | 3 |
| 3.1.4.2 Wege einzeichnen | 5 | 3 | 1 |
| 3.2.4 Mittlerer Weg | 2 | 2 | 3 |
| 3.3.2 Wege | 2 | 0 | 0 |
| Wegpunkt-Property | 0 | 0 | 2 |
| FFZ + Türen | 2 | 1 | 0 |
| **Σ** | **12** | **7** | **9** |

## Was als nächstes wirklich Lastenheft-relevant ist

1. **CSV-Export aus WegeberechnungDialog** (3.2.4.4) — schnelle Sache, hoher Lastenheft-Impact
2. **Manuelle Wege mit-ausgeben** im Mittleren-Weg-Run (3.2.4.3) — gleichzeitig mit CSV
3. **Wegpunkt-Property an Tor/Stellplatz** — Filter „Element ist Start zugelassen" / „Element ist Ende zugelassen". Default Mittelpunkt vs Rand
4. **FFZ-Mindestbreiten-Toast**: warnen wenn FFZ alle Gänge filtert
5. **Negativ-Modus für Wegbereiche** (3.1.4.1 Variante 1) — Halle füllen, dann Bereiche abziehen
6. **Schutz vor pathArea über Bereichen** — wenn User Wegfläche über einem Lager-Bereich zieht, soll das System warnen oder die Fläche automatisch beschneiden

Plus weiterhin offen aus Test-Lauf:
- Verteilweg-Konsistenz (4 Werte über 4 Dialoge)
- Teilabschnitt-Anzeige im Path-PropertiesPanel
- Mittlerer-Weg als Run-Entität (Name + Prozess-Zuordnung)
