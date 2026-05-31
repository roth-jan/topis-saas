# Lastenheft-Gegencheck v3 — Wort für Wort (Stand 2026-05-31)

**Quelle:** Daniel Kaiser v3 (2020), 595 Zeilen + 376 Zeilen "Anforderungen TOPIS graphisch" (Auszug).

**Lese-Methode diesmal:** systematisch durch jede Anforderung, kein Tunnel-Blick auf einzelne Kapitel.
Frühere Audits waren wege-zentrisch und haben **viele Tor-/Stellplatz-/Regal-/Nutzflächen-/Auswertungs-Anforderungen übersehen**.

---

## 3.1.1.1 Grundriss, Außenwände

| Anforderung (wörtlich) | Stand | Status |
|---|---|---|
| Halle aus 1 oder n Gebäuden, Außenwände als Gruppierung | halls[] da, nur eines aktiv, keine Multi-Halle-UI | ❌ |
| **Eigene Bezeichnung pro Halle** (z.B. „Umschlaghalle 1") | hall.name existiert | ✅ |
| Wand-Eigenschaften: Länge, Tiefe, **Höhe**, **Winkel zu angrenzenden Wänden** | nur Länge/Tiefe | ❌ |
| Variante 1: Grundriss-Vorlage I/T/L-Shape mit Längen-Editor | nur Rechteck | ❌ |
| Variante 2: Freihand-Außenwand-Zeichnung inkl. **Rundungen** | nicht implementiert | ❌ |
| **Mehrere Hallen parallel auf einem Gelände** | nicht implementiert | ❌ |
| Wand farbliche Hervorhebung beim Bearbeiten | nicht modelliert | ❌ |
| **Kleinste Einheit Zentimeter** | Welt m, 1 NK | ⚠ |
| Koordinaten-Eingabe für Eckpunkte-Verschiebung | nur Object-Move | ⚠ |

## 3.1.1.2 Hallenausstattung (Innenfläche)

| Anforderung | Stand | Status |
|---|---|---|
| Element-Eigenschaften: Farbe (256), Abmessungen, **„verankert (starr/verschiebbar)"**, **Wegpunkt**, **„Einschränkungen (in Bezug auf Positionierung und Zusammenspiel mit anderen Objekten)"**, Kategorie | verankert+Einschränkungen fehlen | ❌ |
| **Eigenschafts-Übertragung von Element zu Element ("Format Übertragen" wie MS)** | fehlt | ❌ |
| Innenwand | ✅ wand | ✅ |
| Pfosten/Pfeiler | ✅ pfosten | ✅ |
| **Türen auf Außenwänden** (eigene Klasse) | beides als tuer | ⚠ |
| **Türen auf Innenwänden** (eigene Klasse) | beides als tuer | ⚠ |
| Treppen | ✅ | ✅ |
| **„Liste der verfügbaren Objekte muss erweitert werden, mit Eigenschaften aus einer Art Baukasten"** | tags/meta-Pfad für custom | ✅ |
| **Individuelle Icons für Objekte** | icon-Property da | ✅ |
| Position über Koordinaten ODER Entfernungsangaben zu Außenwänden/Eckpunkten | nur xy-Koords im Panel | ❌ |

## 3.1.2 Tore — DETAILLIERT (das war der blinde Fleck)

| Anforderung (wörtlich) | Stand | Status |
|---|---|---|
| **„Tore werden auf den Außenwänden positioniert und sind FEST mit der Außenwand VERANKERT. Bedeutet: Tore können ausschließlich auf Außenwänden positioniert werden, nicht frei in der Zeichnungsfläche ohne Kontakt zur Wand."** | heute beliebig platzierbar | ❌ |
| **Position als „Abstand von Eckpunkten S und E"** | nur x/y | ❌ |
| Bezeichnung/Nummer: Text, **max. 100 Zeichen** | unbegrenzt | ⚠ |
| **„Art: Text, max. 100 Zeichen"** | nicht als eigene Property | ❌ |
| Mehrfacheinfügen mit Wand-Auswahl, Eckpunkt-Abstand, Anzahl, Tor-Abstand, **Startwert der Nummerierung**, Nummerierungs-Schema (1,2,3 / A1,A2 / 1A,1B / A,B,C) | Multi-Insert da, nicht Wand-bezogen, kein Nummern-Schema | ⚠ |
| **Default-Werte hinterlegbar (pro Halle)** | nicht persistiert | ❌ |
| **„Eigenschaften können einzeln ein-/ausgeblendet werden (digitale Arbeitsversion vs. Druckvariante)"** | fehlt | ❌ |
| Überladebrücke optional, ohne Funktion, in Tor-Breite, einzutragender Länge, **direkt innen vor dem Tor** | ✅ NEU 31.05. via ueberladebrueckeAktiv/Laenge | ✅ |
| **1 Tor = 1..n Verlader** | bedientVerladerIds | ✅ |
| **1 Tor = 1..n Stellplätze** | bedientStellplatzIds | ✅ |
| **1 Tor = 1..n Fahrzeuge** | bedientFahrzeugIds | ✅ |
| **1 Tor = x Colli** | palettenProTag existiert, semantisch anders | ⚠ |
| Wegpunkt-Property (Start/Ende/beides) | ✅ wegpunktRolle | ✅ |
| Wegpunkt-Default-Anker je Tor-Seite (innen) | ✅ defaultAnchorOffset | ✅ |

## 3.1.2.2 Rampen — eigenes Kapitel, das ich überlesen habe

| Anforderung | Stand | Status |
|---|---|---|
| Nahverkehrsrampen außen am Hallengrundriss | nicht als eigene Klasse | ❌ |
| Eigenschaften: Länge/Tiefe/Höhe/Bezeichnung/Position (S/E-Abstand) | teilweise via generic | ⚠ |
| **„Auf den Rampen können Wege verlaufen oder es können zusätzlich Stellplätze eingezeichnet werden"** | nicht modelliert | ❌ |
| **„Rampen sind damit ein Bestandteil des Außengeländes, direkt angedockt an die Außenwände"** | gar kein Außengelände | ❌ |

## 3.1.3.1 Stell-/Relationsplatz — DETAILLIERT

| Anforderung (wörtlich) | Stand | Status |
|---|---|---|
| **„Der Stellplatz darf nicht auf starren Objekten wie Wänden, Pfosten oder Türen liegen"** | keine Validierung | ❌ |
| Form: rechteckig + **Kreis, Trapez, individuelle Formen + Freihandzeichnung** | rect + circle, andere nicht | ❌ |
| Drehung 1–359° (Winkel-Property) | rotation existiert, nicht im UI editierbar | ⚠ |
| **„Bezeichnungstext ist formatierbar (z.B. Schriftgröße, Fett)"** | fehlt | ❌ |
| Wegpunkt-Property (Start/Ziel) | ✅ | ✅ |
| **„Wegberechnung: Mittelpunkt (default) oder frei wählbar (dann wird der angeklickte Punkt in der Zeichnungsfläche als Start- oder Zielpunkt genommen)"** | wegpunktOffset 0..1, kein Klick-Anker | ⚠ |
| **„Eigenschaften sind gesamt oder einzeln in der Ansicht ein- und ausblendbar (Bildschirm + Druckmodus)"** | fehlt | ❌ |
| **„1 Stellplatz wird mit bis zu n Toren verknüpft"** | bedientStellplatzIds umgekehrt am Tor; **bedientToreVon am Stellplatz fehlt** | ❌ |
| **„1 Stellplatz können bis zu n Relationen und Mengen zugeordnet werden"** | fehlt komplett | ❌ |
| **„Relationen können nach Bereichen unterteilt werden"** | fehlt | ❌ |
| **„Den Relationen kann 1 Verladebereich zugeordnet werden"** | fehlt | ❌ |
| **„Den Relationen können bis zu n Fahrzeuge zugeordnet werden"** | fehlt | ❌ |
| **„Kapazität in Packstücken / Lademeter / qm"** | capacity-Skalar, nicht 3 Einheiten | ⚠ |
| **„Füllgrad-Ampel = Menge / Kapazität, individuelle Farbverteilung"** | fehlt | ❌ |

## 3.1.3.2 Regale

| Anforderung | Stand | Status |
|---|---|---|
| **„Regale 2-n Ebenen, jede Ebene = eigener Stellplatz mit Stellplatz-Eigenschaften"** | ebenen-Zahl + Skalare statt Array | ❌ |
| Pro Ebene: Bezeichnung, Unterkante, Höhe, Palettenplätze | als Skalare global, nicht pro Ebene | ❌ |
| **„Bezeichnung der Regalebenen auf Hallenplan, unabhängig von Stellplatzbezeichnung"** | fehlt | ❌ |

## 3.1.3.3 Sonder- und Klärplätze

| Typ | Stand | Status |
|---|---|---|
| Klärplatz, Gefahrgut, Sperrigkeit, Ladestation | ✅ als Type | ✅ |
| **Annahmeverweigerung (AV)** | nur als Bereich-Name | ⚠ |
| **Überzähligkeit (ÜZ)** | analog | ⚠ |
| **Wertverschlag („Käfig")** | kein eigener Typ | ❌ |
| **Palettenlager** | nur als Bereich | ⚠ |
| **Hallenterminals** | kein eigener Typ | ❌ |

## 3.1.3.4 Kommissionier- und Logistikflächen — komplett übersehen, neu erkannt

Lastenheft listet das als eigene Kategorie auf — wir haben das nicht modelliert. ❌

## 3.1.3.6 Individualobjekt

| Anforderung | Stand | Status |
|---|---|---|
| Neues, individuelles Hallenelement mit allen Eigenschaften nutzbar | type='custom' + tags/meta/icon-Pfad | ✅ |

## 3.1.4.1 Wegbereiche

| Anforderung | Stand | Status |
|---|---|---|
| **„Systemgestützt, vollflächig: System wählt alle Freiflächen, Nutzer wählt durch rechteckiges Mouseover ab"** | Negativ-Modus generiert, aber kein Mouseover-Abwählen | ⚠ |
| **„Manuell"** durch Einzeichnung | Wegfläche-Werkzeug ✅ | ✅ |
| **„System erkennt automatisch nicht wählbare Bereiche (von anderen Elementen belegt) und bezieht diese nicht mit ein"** | nur Warnung beim Konflikt, keine Auto-Beschneidung | ❌ |
| **„Teilflächen durch Koordinaten-Eingabe definierbar"** | nur grafisch | ❌ |

## 3.1.4.2 Wege

| Anforderung | Stand | Status |
|---|---|---|
| Manuell mit Wegname-Eingabe nach Abschluss | kein Pflicht-Dialog | ⚠ |
| Automatisch, kürzeste Verbindung, ohne Element-Kreuz, nur im Wegbereich, **orientiert an Mitte des Wegs** | ✅ jetzt mit Auto-Gang aus pathArea + Stützpunkt-A* | ✅ |
| Start/End: Tore/Rampen, Nutzflächen | ✅ | ✅ |
| Tür als Wand-Durchlass | ✅ | ✅ |
| **„Weglängen müssen angezeigt werden, wählbar je Teilabschnitt oder gesamt"** | nur Gesamt, **Teilabschnitt fehlt** | ❌ |
| **„Bei Verschiebung der verknüpften Elemente muss der Weg aktualisiert werden"** | ✅ recompute | ✅ |
| **„Manuell gezeichnete Wege werden nach den Regeln der automatischen Wege aktualisiert"** | ✅ stützpunkte | ✅ |

## 3.1.4.4 Berechnung Zeitbedarf (Pflichtenheft-Wege-Modul)

| Anforderung | Stand | Status |
|---|---|---|
| FFZ mit Geschwindigkeiten, Cluster/Bereichen | ✅ FFZ-Modell | ✅ |
| **„Anteil FFG 1 × Weg / Geschwindigkeit FFG 1 + … = reine Wegzeit"** | berechnet via Verteilweg-Formel | ✅ |
| **„Zeit Aufnehmen + reine Wegzeit + Zeit Absetzen = Gesamtzeitbedarf"** | nur teilweise im Prozessmodell | ⚠ |
| **„Detail je FFZ aufklappbar"** | fehlt im UI | ❌ |

## 3.1.5 Unterflurförderkette — komplett fehlt

| Anforderung | Stand | Status |
|---|---|---|
| Eigener Wegbereich, festzulegende Breite | ❌ |
| Kurven und Geraden | ❌ |
| Überlappung mit normalem Wegbereich erlaubt | ❌ |
| **Nutzflächen dürfen nicht im Kettenbereich liegen** | ❌ |
| Kettenweg mittig, **nur eine Fließrichtung**, einstellbar+sichtbar | ❌ |
| Beliebige Punkte entlang der Kette als Start/Endpunkt | ❌ |
| Manuelle Wege zu/von der Kette, **ausgenommen von Auto-Aktualisierung** | ❌ |
| Kettenweg-Berechnung Endpunkt erster Weg → Startpunkt zweiter Weg unter Beachtung Fließrichtung | ❌ |
| Kettenweg erfordert vor- + nachgelagerten Weg | ❌ |

## 3.1.6 Außengelände — komplett fehlt

| Anforderung | Stand |
|---|---|
| Außengelände-Objekte: Gebäude, Wege, Objekte schematisch | ❌ |
| Färbung + Bezeichnung | ❌ |
| **Sattel-/Wechselbrücken-Plätze** (analog Nutzflächen) | ❌ |
| **Fahrwege/Straßen** außen (analog Verteilwege) | ❌ |

## 3.1.7 Anzeige

| Anforderung | Stand | Status |
|---|---|---|
| Zoom + Scroll + Skalierung | ✅ | ✅ |
| Eigenschaftenfenster für gewählte Objekte | ✅ | ✅ |
| Wege ein-/ausblendbar; Weglänge gesamt vs. Teilabschnitt wählbar | nur gesamt | ❌ |
| Nutzflächentyp-spezifisch Bezeichnung ein-/ausblenden | fehlt | ❌ |

## 3.2.1 Mengen — komplett fehlt

| Anforderung | Stand |
|---|---|
| **Prozess- und Mengenkategorien** mit Subprozessen | ❌ |
| Mengen-Detail: Prozess + Relation + Anzahl (2 NK) + Typ (Palette/Halbpalette/Chep/GiBo/Industriepalette/Colli) + Länge×Breite×Höhe + stapelbar | ❌ |
| Excel/CSV-Mengen-Import (Update einzelner Relationen) | ⚠ teilweise via Betriebsdaten |
| Mengen einer Prozesskategorie löschen + neu | ⚠ |

## 3.2.2 Relationszuordnung — komplett fehlt

| Anforderung | Stand |
|---|---|
| Je Prozess+Relation: 1..n Stell-/Regalplatz-Zuordnung | ❌ |
| Übersichts-Dialog: Prozess/Relation/Stellplatz | ⚠ teilweise im RelationZuordnungDialog |
| **n:m**: ein Stellplatz mehreren Relationen, auch über Prozesse hinweg | ❌ |
| **Prozentuale Verteilung wenn Relation auf mehrere Stellplätze** | ❌ |
| **Filter: nicht zugeordnete Relationen** | ❌ |
| **Abfahrtszeiten je Prozess+Relation** | ⚠ Fahrplan-Import |

## 3.2.3 Stellplatzauswertung

| Anforderung | Stand |
|---|---|
| **Hallen-Relations-Plan**: alle Stellplätze mit ihren Relationen, je Prozess ein-/ausblenden | ❌ |
| Schriftgröße veränderbar | ❌ |
| **Menge je Stellplatz als Heatmap/Farbabstufung** | wir haben Heatmap nur auf Toren | ❌ |

## 3.2.4 Mittlerer Weg

| Anforderung | Stand | Status |
|---|---|---|
| Bezeichnung + Prozess-Zuordnung | ✅ MittlererWegRun | ✅ |
| Start/End-Auswahl grafisch (Mouseover/Klick) | nur Checkbox-Liste | ⚠ |
| Auto-Weg pro Kombination + Längen-Ermittlung | ✅ | ✅ |
| **Manuelle Wege auf gleiche Kombi prüfen + mit ausgeben** | ✅ CSV-A/M | ✅ |
| CSV-Export Art/Start/Ende/Weg/Länge | ✅ | ✅ |
| **Kettenwege gesondert kennzeichnen** | fehlt (Kette generell fehlt) | ❌ |
| **Wiederholbar mit auto-update bei Layout-Änderungen** | Run gespeichert, kein auto re-run | ⚠ |

## 3.2.5 Bereichseinteilung

| Anforderung | Stand |
|---|---|
| Tore + Stellplätze zu Bereichen gruppieren | ❌ |
| **„Je zugeordnetem Stellplatz wird die Menge der zugeordneten Relationen je Prozesskategorie summiert"** | ❌ |
| Speicherbar + an Mengen/Relationen-Änderungen adaptiv | ❌ |
| CSV-Export | ❌ |

## 3.3.1 Hallenplan + Verladeplan

| Anforderung | Stand |
|---|---|
| Hallenplan kopier-/druckbar mit aktuellen Anzeige-Optionen | Drucken da | ⚠ |
| **Verladeplan**: Abfahrtszeiten aus Relation → Stellplatz → Tor verteilt, **außen am Tor angezeigt** | ⚠ Torbelegung-Dialog teilweise |

## 3.3.2 Wege-Export

| Anforderung | Stand | Status |
|---|---|---|
| Alle Wege als CSV mit Filtern (auto/manual, Elementgruppe, Start/Endpunkt) | nur Mittlerer-Weg-Export | ⚠ |

## 3.3.3 Statistische Daten

| Anforderung | Stand |
|---|---|
| Gesamtfläche, Fahrwege, Nutzflächen je Typ, Regalflächen, sonst, Hoffläche | nur teilweise Dashboard | ⚠ |
| CSV-Export | nur JSON | ❌ |

## 3.4.1–3.4.3 Allgemein

| Anforderung | Stand |
|---|---|
| **„Standardwerte pro Element-Typ, pro Halle anpassbar"** | OBJECT_DEFAULTS fix global | ❌ |
| Hallenspezifischer Systemordner mit Unterordnern Wege/Elemente | JSON-Export ✅ | ⚠ |
| CSV-Export aller Daten (nicht Excel) | nur teils | ⚠ |
| Mehrsprachigkeit | „nicht erforderlich" | ✅ |

## Module

| Modul | Stand |
|---|---|
| Wege (auto + gewichteter Mittelweg + Stellplatz-Kriterium) | ✅ |
| Verlader | ❌ |
| Kette | ❌ |
| Kapazität + Überhangmanagement | ❌ |

---

## Was bei diesem Lese-Durchgang ZUSÄTZLICH erkannt wurde, was bisher fehlte

1. **Tor fest mit Außenwand verankert** — fundamental, nicht implementiert
2. **Position als „Abstand von Eckpunkt S/E"** — alle Elemente, nicht da
3. **Nummerierungs-Schemata für Mehrfacheinfügen** (A1,A2 / 1A,1B / A,B,C) — fehlt
4. **Eigenschaften ein-/ausblendbar (Bildschirm vs. Druckmodus)**
5. **Stellplatz darf nicht auf starren Objekten liegen** — Validierung fehlt
6. **Stellplatz-Form Kreis/Trapez/Freihand** — fehlt
7. **„Wegberechnung: Klick auf Zeichnungsfläche als Anker"** — kein UI dafür
8. **Bezeichnung formatierbar (Schriftgröße/Fett)** — fehlt
9. **Stellplatz↔Tor-Verknüpfung umgekehrt** (heute nur Tor-Seite) — fehlt am Stellplatz
10. **Relations-Bereich-Untergliederung pro Stellplatz** — fehlt
11. **Verladebereich an Relation** — fehlt
12. **Kapazität in 3 Einheiten** (Packstücke/Lademeter/qm) — nur Skalar
13. **Füllgrad-Ampel** — fehlt
14. **Regal-Ebenen als Array** — bisher Skalare
15. **Kommissionier-/Logistikflächen als eigene Kategorie** — fehlt
16. **AV / ÜZ / Wertverschlag / Palettenlager / Hallenterminal als eigene Typen** — teils fehlend
17. **Default-Werte pro Halle anpassbar** — fehlt
18. **Automatische Wegbereich-Beschneidung an belegten Stellen** — nur Warnung
19. **Teilabschnitts-Anzeige der Weglänge** — fehlt
20. **Mengen-Modell** (Prozess+Subprozess, Palette/Halbpalette/Chep/...) — komplett fehlt
21. **Relationszuordnung mit n:m + prozentuale Verteilung + nicht-zugeordnete-Filter** — fehlt
22. **Hallen-Relations-Plan mit ein-/ausblendbaren Prozessen** — fehlt
23. **Mengen-Heatmap auf Stellplätzen** — wir haben nur auf Toren
24. **Bereichseinteilung als Auswertung** (Tor+Stellplatz-Gruppe) — fehlt
25. **Verladeplan außen am Tor** — teils
26. **Wege-Export mit Filter auto/manuell + Elementgruppe + Start/End** — nur teils
27. **CSV statt JSON für Statistik** — fehlt
28. **Unterflurförderkette komplett** — fehlt
29. **Außengelände komplett** (Sattel-/Wechselbrücken-Plätze, Hof-Fahrwege) — fehlt
30. **Modul Verlader/Kette/Kapazität** — fehlt
31. **„Verankert (starr/verschiebbar)"** als Property — fehlt
32. **„Einschränkungen Positionierung/Zusammenspiel"** — fehlt
33. **„Format Übertragen"** Eigenschaften zwischen Elementen — fehlt
34. **Türen Außenwand vs. Innenwand differenziert** — fehlt
35. **Wand-Höhe + Winkel-Property** — fehlt

## Selbstkritik

Vorheriger Gegencheck war kapitel-eng (3.1.4 + 3.2.4 + 3.3.2 + ein bisschen 3.1.2). Tunnel-Blick.

Dieser Durchgang: 35+ neue Lücken erkannt. Davon viele kleine UX-Details die einzeln wenig kosten, in Summe aber den Lastenheft-Konformitäts-Grad halbieren.

Realistisch belegt: ca. 30 % Lastenheft-Konformität, wenn man nicht nur Wege zählt.
