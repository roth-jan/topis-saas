# TOPIS — Abnahme-Testdrehbuch für ChatGPT (GPT-6 Astra, Agent-Modus) · Stand 20.09.2026

> **An dich, die Test-KI:** Du testest die Web-App TOPIS im Browser. Du hast echte Browser-Steuerung
> (klicken, tippen, Tastatur, JavaScript ausführen). Dieses Dokument gibt dir den Fachhintergrund,
> die exakten Testschritte und die **Sollwerte**. Melde NUR Abweichungen vom Sollwert als Fehler.
>
> **Testumgebung (Test-System, nicht Produktion):** https://roth-jan.github.io/topis-saas/projekt/
> Weitere Seiten: `/topis-saas/cockpit/`, `/topis-saas/check/`, `/topis-saas/dashboard/`.
> Falls beim ersten Aufruf ein Willkommens-Overlay erscheint: „Eigene Halle planen" wählen.
>
> **Wichtigster Trick — der Hallenplan ist ein `<canvas>`, du kannst ihn nicht lesen.**
> Prüfe deshalb den Zustand über die Browser-Konsole / `Execute JavaScript`:
> ```js
> const s = window.__topisStore.getState();
> ({ halle: s.halls.find(h => h.id === s.activeHallId),
>    objekte: s.objects.map(o => ({ id: o.id, typ: o.type, name: o.name, x: o.x, y: o.y, b: o.width, t: o.height, seite: o.side, anker: o.aussenwandRef })),
>    gaenge: s.gaenge.length, wege: s.paths.length, wegflaechen: s.pathAreas.length, ketten: s.kettenWegbereiche.length })
> ```
> Das ist die Wahrheit. Ein Screenshot ist nur die Illustration dazu. Koordinaten sind Meter,
> Ursprung oben links, x nach rechts, y nach unten. Wand-Indizes: 0 = Nord (oben), 1 = Ost, 2 = Süd, 3 = West.

---

## Teil 1 — Fachhintergrund (kontraintuitive Wahrheiten, NICHT als Bug melden)

1. **Min/Colli ist eine intensive Kennzahl (Zeit pro Colli)** — sie hängt NICHT vom Tagesvolumen ab.
   Colli/Tag verdoppeln → Min/Colli bleibt gleich. Korrekt. Was skaliert: MA-Stunden/Tag und FTE.
2. **„Datensätze" ≠ „Colli".** Ein Scan-Datensatz trägt mehrere Colli.
3. **Verteilweg braucht ein zusammenhängendes Gangnetz.** Fehlen echte Wege, sagt TOPIS das offen
   („nur X % mit echtem Weg", Übernehmen gesperrt). Das ist gewollt, keine Luftlinien-Mischung.
4. **Tore sitzen laut Lastenheft AUSSCHLIESSLICH auf Außenwänden.** Ein Tor, das du in die Hallenmitte
   ziehst, springt zurück an die nächste Wand. Das ist korrekt, kein Bug.
5. **Die KI („KI-Bauen") baut nur, was das Lastenheft definiert** (Rechteckhalle, Tore, Stellplätze,
   Bereiche, Mittelgang). Runde Hallen, Rampen, Regale, Kette per Text: bewusst abgelehnt/ignoriert.
6. **L/T/U/C-Grundriss ist Darstellung.** Tore und Wege rechnen weiter mit dem umschließenden
   Rechteck. Ein Tor an der einspringenden Ecke einer L-Halle snappt an die Rechteck-Kante — bekannt.
7. **Drehung (∠-Feld / R-Taste)**: nur 90°-Schritte wirken sichtbar (Breite/Tiefe-Tausch). 45° ist
   im Renderer noch ohne Wirkung — bekannt.

**Kalibrier-Anker:** AS Gersthofen ≈ 2,04 Min/Colli (Modell) · Geis Nürnberg 1,95 · Nörpel Ulm 2,19 ·
Demo-Umschlaghalle ≈ 2,17. Plausibel für SE-Umschlag: 1,9–2,2. < 1,5 oder > 3 bei Standardparametern
ist meldenswert.

---

## Teil 2 — Testfälle mit Sollwert

Reihenfolge einhalten. Vor jedem Block: Menü **Datei → Neues Projekt** (oder Store leeren:
`window.__topisStore.getState().resetState()`), damit Reste nicht stören.

### Block A — KI-Hallenbau (Button „KI-Bauen" / Funkeln-Icon oben rechts, `/projekt`)

**A1 — Cross-Dock gültig.**
> `Halle 150x42, 20 Tore Nord Abstand 6, 20 Tore Süd Abstand 6, ein Stellplatz je Tor 12x3, 2 Bereiche, 6 m Mittelgang`
- **Soll:** Karte „Wird gebaut: 82 von 82". Nach Übernehmen im Store: 40 `tor`, 40 `stellplatz`, 2 `bereich`;
  keine Überlappungswarnung.

**A2 — Kapazität überschritten (muss abgelehnt werden).**
> `Halle 200x100, 50 Tore Nord, 50 Tore Süd, jedes Tor 4 m breit mit 3 m Abstand zum nächsten Tor`
- **Soll:** Fehler „… brauchen ~347 m, die Wand hat aber nur 200 m." Übernehmen gesperrt.

**A3 — Zonen West/Ost (NEU, Fix 20.09.).**
> `Halle 100x60, Wareneingang West, Warenausgang Ost`
- **Soll:** Zwei Bereiche: „Wareneingang" mit **kleinem x** (linke Hallenhälfte), „Warenausgang" mit
  **großem x** (rechte Hälfte). Vorher lagen beide im Osten — das war der Bug.

**A4 — Lokaler Abstand schlägt globale Lücke (NEU, Fix 20.09.).**
> `Halle 100x60, 2 Tore Nord Lücke 1 m, 2 Tore Süd Abstand 10 m`
- **Soll:** Nord-Tore: Mittelpunkte 4,5 m auseinander (3,5 m Tor + 1 m Lücke). Süd-Tore: Mittelpunkte
  **10 m** auseinander. Prüfe über `objekte` im Store (x-Differenz der beiden Süd-Tore = 10).

**A5 — „Nord und Süd" ergibt zwei Reihen.**
> `Halle 120x50, 10 Tore Nord und Süd Abstand 6`
- **Soll:** 20 Tore, 10 mit `seite: "north"`, 10 mit `seite: "south"`.

**A6 — Unbekanntes wird abgelehnt.** Eingabe mit „runde Halle" oder „3 Fahrgänge":
- **Soll:** unter „Nicht übernommen / ignoriert" gelistet. Gewollt.

### Block B — 2D-Editor, Bau-Gefühl (Werkzeuge links, `/projekt`)

Vorbereitung: Menü **Halle** → Hallen-Assistent → 100 × 50 m, 0 Tore (oder per KI: `Halle 100x50`).

**B1 — Tor bleibt an der Wand (Fix 20.09.).** Werkzeug „Tor" wählen, oben an die Nordwand klicken.
Dann Werkzeug „Auswählen", das Tor packen und in die **Hallenmitte** ziehen, loslassen.
- **Soll (Store):** Tor hat `anker.wallIndex` 0..3 und liegt mit einer Kante exakt auf einer Wand
  (`y == 0` bzw. `y + t == 50` bzw. `x == 0` bzw. `x + b == 100`). Es liegt NICHT frei in der Mitte.

**B2 — Ausrichtungslinien + Live-Maß.** Zwei Stellplätze (Werkzeug „Stellplatz") setzen. Den zweiten
langsam neben den ersten ziehen.
- **Soll:** Beim Anziehen erscheinen cyanfarbene Hilfslinien und eine Maß-Pille (z. B. „1,00 m");
  Kanten rasten bündig ein (gleiche `x` bzw. `y` im Store nach dem Loslassen).

**B3 — Serie ziehen (Alt + Ziehen).** Einen Stellplatz mit gehaltener **Alt-Taste** nach rechts ziehen.
- **Soll:** Während des Ziehens Geister-Kopien + Zähler „N×"; nach dem Loslassen N Stellplätze in einer
  Reihe (Store: `stellplatz`-Anzahl = N, Namen „SP 2", „SP 3" …). Keine Kopie fehlt.

**B4 — Bereich per Rechteck aufziehen + Randkappung (Fix 20.09.).** Werkzeug „Bereich" (Taste B):
von (2 m, 2 m) nach **weit rechts außerhalb der Halle** ziehen, loslassen.
- **Soll:** Bereich existiert, und `x + b ≤ 100` sowie `y + t ≤ 50` (liegt vollständig in der Halle).
  Vorher ragte er hinaus.

**B5 — Rotation mit R.** Einen Stellplatz 12 × 3 auswählen, Taste **R**.
- **Soll:** Store: `b` = 3, `t` = 12 (getauscht), `rotation` 90; Mittelpunkt bleibt.

**B6 — Wegpunkt über Zone greifbar (Fix 20.09.).** Einen Bereich aufziehen (20 × 15). Werkzeug „Weg":
zwei Klicks über dem Bereich → Weg mit zwei Punkten. Werkzeug „Auswählen", den Weg anklicken
(er wird markiert), dann einen seiner **Endpunkte** packen und verschieben.
- **Soll:** Der Punkt bewegt sich (Store: `paths[0].waypoints[i]` ändert sich). Es wird NICHT der
  Bereich darunter selektiert/verschoben.

**B7 — Hover-Umriss verschwindet beim Werkzeugwechsel.** Mit „Auswählen" über ein Objekt fahren
(cyan Umriss), dann Taste **B** (Bereich-Werkzeug) drücken, Maus wegbewegen.
- **Soll:** Kein Objekt leuchtet mehr.

### Block C — Lastenheft-Bauumfang

**C1 — L-Grundriss.** Rechtes Panel → Tab „Halle" → Dropdown „Grundform" → **L**.
- **Soll:** Halle wird als L gezeichnet (Screenshot: eine Ecke fehlt). Kein Fehler in der Konsole.

**C2 — Rampe dockt außen an.** Werkzeug-Gruppe „Infrastruktur" → „Rampe", knapp innerhalb der Südwand klicken.
- **Soll (Store):** Rampe liegt **außerhalb** der Halle direkt an der Wand (`y == 50`), `anker.wallIndex == 2`.

**C3 — Regal mit Ebenen.** Werkzeug „Regal" (R ohne Auswahl) setzen, im Panel Ebenen = 4 → „Aus Skalaren generieren".
- **Soll:** Panel zeigt 4 Ebenen-Zeilen; Canvas zeigt Badge „×4".

**C4 — Unterflurförderkette.** Menü **Module → Unterflurförderkette** → Kette anlegen → Werkzeug „Kette":
drei Klicks quer durch die Halle. Im Dialog Fließrichtung umschalten.
- **Soll (Store):** `ketten == 1`, drei `punkte`; Canvas: Linie mit Pfeilen, Pfeile drehen bei Richtungswechsel.

**C5 — Außengelände.** Werkzeug-Gruppe „Außen" → „Straße" außerhalb der Halle setzen.
- **Soll:** Objekt `outdoor_road` im Store; gestrichelte gelbe Fahrbahnmarkierung sichtbar.

**C6 — Halle 90° drehen (Fix 20.09.).** Zustand aus B1–B4 (Tor + Stellplätze + Bereich) plus ein
gezeichneter Gang (Werkzeug „Gang"). Menü **Bearbeiten → Halle um 90° drehen**.
- **Soll:** Halle ist jetzt 50 × 100. **Alle** Objekte, Gänge und Bereiche liegen innerhalb
  (`x + b ≤ 50`, `y + t ≤ 100`). Das Tor hat einen neuen, passenden `anker.wallIndex` und liegt auf
  einer Wand (Nord-Tor wird zum **West**-Tor). Vorher blieben Gänge/Wege an alten Koordinaten.

**C7 — Anker-Abstände nach Hallenverbreiterung.** Tor an der Nordwand bei x ≈ 20; dann Tab „Halle"
→ Breite 100 → 150.
- **Soll (Store):** Tor bleibt bei x ≈ 20; `anker.abstandS ≈ 20` **und** `anker.abstandE ≈ 130`
  (Summe = neue Wandlänge). Vorher blieb abstandE auf dem alten Wert.

### Block D — Cockpit / Kennzahlen (`/cockpit`)

**D1 — Vorlage laden.** Soll: Min/Colli 1,9–2,2.
**D2 — Volumen-Invarianz.** Colli/Tag 3.500 → 7.000: Min/Colli, Produktivität, Rang, Spitze **unverändert**;
MA-Stunden und FTE **verdoppelt**.
**D3 — Verteilweg-Wirkung.** Verteilweg 50 → 250 m: Min/Colli **steigt**.

### Block E — Kunden-Check (`/check`)

**E1 — Demo:** 4 Ampel-KPIs, Radar, Heatmap, Min/Colli 1,9–2,2.
**E2 — Tastatur:** Die 3 Karten + Upload-Zone per Tab erreichbar, Enter/Leertaste löst aus, Fokusring sichtbar.

---

## Teil 3 — Bekannte Grenzen (NICHT melden)

- KI baut keine L/T-Hallen, Rampen, Regale, Kette, frei gewünschte Ganganzahl.
- L/T/U/C: Tore/Wege rechnen mit Bounding-Rechteck; Notch-Maße nicht einstellbar.
- Rotation ≠ 90° ohne sichtbare Wirkung. Kette fließt noch nicht in die Wegeberechnung ein.
- Impressum/Datenschutz verlinken auf `#` (Rechtstext steht aus).
- Kennzahlen-Seite kann Vorlagen-Werte zeigen (Kunden-Check schreibt nicht in die Stores).
- Multi-Halle (mehrere Hallen auf einem Gelände) hat keine UI.
- Format-übertragen, Druck-/Bildschirm-Sichtbarkeit, prozentuale Relationsverteilung: nur im Datenmodell, noch ohne Bedienelement.

---

## Teil 4 — Berichtsformat

Pro Testfall eine Zeile: **ID · Ergebnis (✅/❌) · Soll · Ist · Beleg** (Store-Auszug oder Screenshot).
Unklares als **Hypothese** kennzeichnen. Priorität: P1 = falsche Rechnung / Datenverlust / Absturz,
P2 = Bedienung / Anzeige / A11y. Am Ende: Konsolen-Fehler (`Errors`) gesammelt auflisten, auch wenn
kein Testfall betroffen ist.
