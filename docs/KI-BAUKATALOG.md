# KI-Baukatalog — was die KI bauen DARF (und was nicht)

> Beschluss 26.07.2026 (Jan + Council gpt-4o/Gemini/DeepSeek-R1, einstimmig).
> **Prinzip:** Die KI baut *ausschließlich* Elemente, die im Lastenheft (Daniel Kaiser,
> TOPIS 2.0 Spec V3.0, 04.09.2020) definiert sind. Das Lastenheft = ~90 % dessen, was in
> echten Projekten vorkommt. Alles außerhalb (z. B. runde Halle) kennt die KI NICHT und
> **lehnt es ehrlich ab, statt es zu erfinden.** Input-Flexibilität ≠ Output-Beliebigkeit.
>
> Die KI ist **Parameter-Dolmetscher**, nicht Architekt. Ein deterministischer Blueprint baut
> die Geometrie und garantiert per Konstruktion: keine Überlappung, echte Relationen, Wege,
> plausible Default-Maße. Ungültige Parameter → Blueprint skaliert/warnt fachlich.

## Warum (der gordische Knoten)
Bisher erfand die KI Geometrie frei → jeder Test deckte einen neuen Randfall auf (endlos).
Der Fehler war nicht die KI, sondern das **fehlende Domänenmodell**. Das Lastenheft IST dieses
Modell. Damit wird der Validierungsraum endlich: nur bekannte Elemente, nur gültige Parameter.

---

## Erlaubte Elemente (Lastenheft §1.1)

### Halle / Grundriss (§1.1.1.1)
| Erlaubt | Nicht erlaubt (v1) |
|---|---|
| Rechteck (I-Form) mit Länge × Tiefe | Runde/gebogene Wände |
| L-Form, T-Form (Standardtypen) | Freihand-/Individual-Shape |
| Außenwände als Gruppierung, benennbar | (später Ausbaustufe) |

### Hallenausstattung innen (§1.1.1.2) — „rigid objects"
- **Innenwände** (frei positionierbar, nur im Innenraum)
- **Stützen/Pfeiler**
- **Türen Außenwand / Türen Innenwand** (Wege dürfen durch Türen)
- **Treppen**

### Tore & Rampen (§1.1.2)
- **Tore**: nur auf Außenwänden, fest verankert. Multi-Insert (Anzahl, Abstand, Startwert).
  Nummerierung: `1,2,3` · `A1,A2` · `1A,1B` · `A,B,C`. Optional **Leveller** (Torbreite ×
  Länge) im Innenlayout direkt vor dem Tor.
- **Rampen**: außen, an Außenwand angedockt (Nahverkehrsrampen).
- **Tor-Relationen (Pflicht laut Lastenheft):** 1 Tor ↔ 1..n Verlader · 1..n Stellplätze ·
  1..n Fahrzeuge · x Colli.

### Nutzflächen (§1.1.3)
- **Stell-/Relationsplatz**: rechteckig (Default), Länge × Tiefe explizit, Winkel möglich.
  **Darf nicht auf Wänden/Stützen/Toren liegen.** Relationen: 1 Stellplatz ↔ bis n Tore;
  Relationen → in **Bereiche** unterteilbar; Kapazität (Colli / Lademeter / qm) →
  Füllgrad-Ampel.
- **Regale**: wie Stellplatz, aber 2..n Ebenen.
- **Sonder-/Klärplätze**: Klärstelle · Annahmeverweigerung (AV) · Überzähligkeit (ÜZ) ·
  Gefahrgut · Sperrplatz · Wertverschlag/Käfig · Palettenlager · Ladestation/Hallenterminal.
- **Individualobjekt** (frei definierbar).

> **Bereich = Unterteilung von Relationen**, KEINE „halbe Halle". Ein Bereich fasst Stellplätze/
> Relationen fachlich zusammen; er wird NICHT als riesige Hintergrundfläche über alles gelegt.

### Fahr- & Verteilwege (§1.1.4)
- **Wegbereiche** zuerst definieren, dann **Wege**. Wege verbinden Tore/Rampen ↔ Nutzflächen.
- Start/Ende = Tore/Rampen oder Nutzflächen. Auto-Zeichnung: kürzeste Verbindung, **kreuzt
  keine anderen Elemente** (außer durch Türen). Auto-Benennung „von–nach".
- Zeitbedarf je Weg über FFZ-Geschwindigkeiten + Cluster („SE gebündelt" / „SA gebündelt").

### Unterflurförderkette (§1.1.5)
Spezialweg, feste Breite, EINE Richtung; Nutzflächen dürfen nicht in den Kettenbereich.

### Außengelände (§1.1.6)
Straßen/Wege + Sattel-/Wechselbrücken-Plätze. (v1 optional.)

---

## Garantien des Blueprints (per Konstruktion)
1. **Keine Überlappung.** Objekte werden kollisionsfrei platziert; passt etwas nicht →
   Skalierung auf Maximum + fachliche Warnung, KEIN stiller Verlust, KEIN Schrott.
2. **Explizite Maße werden geehrt** (z. B. „20×15 m Zone" = 20×15 m, nicht halbe Halle).
3. **Echte Relationen** (Tor↔Stellplatz↔Bereich) als Objektverknüpfung, nicht nur Metadaten.
4. **Wege** werden zwischen verknüpften Elementen automatisch erzeugt (Lastenheft §1.1.4.3).
5. **Nur bekannte Elemente.** Unbekanntes (runde Halle, Freihand …) → klare Ablehnung.

---

## Vorschlag v1-Umfang (erste bounded Ausbaustufe)
Fokus Cross-Dock (AS-Typ), weil das die realen Projekte trägt:
1. Halle Rechteck (I) [+ L/T später]
2. Tore Multi-Insert + Nummerierung + **echte Tor↔Stellplatz-Relation**
3. Stellplätze je Tor (Vorfeld) mit explizitem Maß, kollisionsfrei
4. Bereiche als **Relations-Gruppen** (benennbar: Wareneingang/Warenausgang), NICHT als
   Hallenhälften
5. Sonder-/Klärplätze (AV/ÜZ/… — bereits vorhanden)
6. Mittelgang + Quergänge + **Auto-Wege** Tor↔Stellplatz, kreuzungsfrei, Sicherheitsabstand
7. Kollisionsprüfung + fachliche Warnungen

Später (Ausbaustufen): L/T-Form, Innenwände/Stützen/Türen/Treppen, Rampen, Regale mit Ebenen,
Unterflurförderkette, Außengelände, Freihand.

## Für Michael MORGEN (Option C, Council-einstimmig)
Reale AS Halle 6 nicht per KI, sondern als **Vorlage laden** (`as_gersthofen_2026`, bereits
im Code, geometrisch korrekt) → sofort arbeitsfähig. KI-Textbuilder bleibt Schnellstart/Demo,
nicht der Weg für ein reales Projekt.
