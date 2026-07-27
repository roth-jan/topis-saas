# TOPIS — Abnahme-Testdrehbuch (für ChatGPT-Test)

> **Zweck:** Dieses Dokument gibt dir (dem Test-KI) den **Fachhintergrund + die Sollwerte**, die du
> zum sinnvollen Testen von TOPIS brauchst. Ohne diesen Hintergrund meldest du korrektes Verhalten
> als Fehler und echte Fehler gleichrangig — mit ihm prüfst du gegen die Wahrheit.
>
> **So gehst du vor:** Lies Teil 1 (Fachhintergrund) und Teil 3 (bekannte Grenzen) ZUERST. Führe
> dann die Testfälle in Teil 2 aus und vergleiche das Ergebnis mit dem **Sollwert**. Melde nur
> **Abweichungen vom Sollwert** als Fehler. Was in Teil 3 als „noch nicht gebaut" steht, ist KEIN
> Fehler. Testumgebung: https://topis.ntc.software (Editor `/projekt`, Cockpit `/cockpit`,
> Kunden-Check `/check`, Kennzahlen `/dashboard`).

---

## Teil 1 — Fachhintergrund, den du zum Testen brauchst

TOPIS digitalisiert die ROTH-Logistikberatung. Ein paar fachliche Wahrheiten sind
**kontraintuitiv** und dürfen NICHT als Bug gemeldet werden:

1. **Min/Colli ist eine *intensive* Kennzahl (Zeit pro Colli).** Sie hängt NICHT vom Tagesvolumen
   ab. → **Wenn du Colli/Tag von 3.500 auf 7.000 verdoppelst, bleibt Min/Colli gleich. Das ist
   korrekt, kein Fehler.** Ebenso bleiben *Produktivität (Colli/MA-Stunde)*, *Benchmark-Rang* und
   *Spitzenfaktor* unverändert — alles Raten/Verhältnisse, volumenunabhängig.
2. **Was MIT dem Volumen skaliert, ist der *Gesamt-Personalbedarf*:** MA-Stunden/Tag und FTE. Doppeltes
   Volumen → doppelte MA-Stunden. Diese Größe findest du im **Cockpit / Kennzahlen** (Personalstunden,
   FTE-Bedarf), aktuell NICHT auf der Kunden-Check-Ergebnisseite (siehe Teil 3).
3. **„Datensätze" ≠ „Colli".** Ein Scan-Datensatz trägt mehrere Colli. Wenn die Demo „7.494 Datensätze
   über 5 Tage" zeigt, sind das Scans; die Colli-Menge ist höher (~19.300) → ~3.900 Colli/Tag. Das ist
   konsistent, kein Widerspruch.
4. **Der Verteilweg braucht ein zusammenhängendes Gangnetz.** Findet die Wegeberechnung für viele
   Paare keinen echten Weg, ist der Verteilweg **nicht belastbar** — TOPIS sagt das jetzt offen
   (Warnung „nur X % mit echtem Weg", „Übernehmen" gesperrt) und mischt KEINE Luftlinien mehr in den
   Durchschnitt. Eine solche Warnung ist das *gewünschte* Verhalten, kein Fehler.
5. **Die KI baut nur, was das Lastenheft (Daniel Kaiser, TOPIS-2.0-Spec) definiert.** Unbekanntes
   (runde Halle, Freihand-Grundriss) wird bewusst abgelehnt/gemeldet, nicht erfunden.

**Kalibrier-Anker (validierte Referenzwerte — hieran misst sich „plausibel"):**

| Halle | Min/Colli (Soll) | Quelle |
|---|---|---|
| AS Gersthofen (SE, Modell) | **≈ 2,04** (Doku nennt 1,917; Modell-Drift bekannt) | Prozessmodell-Kalibrierung |
| Geis Nürnberg (SE) | **1,95** (Δ 0 %) | Kundenvalidierung |
| Nörpel Ulm (SE) | **2,19** (Δ 0 %) | Kundenvalidierung |
| Demo-Umschlaghalle (Vorlage) | **≈ 2,17** Min/Colli · **≈ 163 MA-Std/Tag** | colliProTag 3.970, Verteilweg 176 m |

Plausibel für eine Umschlaghalle im SE-Prozess: **~1,9 – 2,2 Min/Colli**. Werte darunter (< 1,5)
oder darüber (> 3) bei Standardparametern sind verdächtig und meldenswert.

---

## Teil 2 — Testfälle mit Sollwert

Führe jeden Fall aus, vergleiche mit **Soll**. Abweichung = Fehler (mit Screenshot/Zahl melden).

### A) KI-Hallenbau (`/projekt` → Button „KI-Bauen")

**A1 — Cross-Dock, gültig.** Eingabe:
> `Halle 150x42, 20 Tore Nord Abstand 6, 20 Tore Süd Abstand 6, ein Stellplatz je Tor 12x3, 2 Bereiche, 6 m Mittelgang`
- **Soll:** Vorschau „Wird gebaut: 82 von 82". Übernehmen → **40 Tore, 40 Stellplätze (je 3×12 m,
  vor je einem Tor), 2 Bereiche, Mittelgang 6 m, Gangnetz**. Keine Überlappung.

**A2 — Kapazität überschritten (muss abgelehnt werden).** Eingabe:
> `Halle 200x100, 50 Tore Nord, 50 Tore Süd, jedes Tor 4 m breit mit 3 m Abstand zum nächsten Tor`
- **Soll:** **Fehler** „50 Tore à 4,0 m + 3,0 m Lücke brauchen ~347 m, die Wand hat aber nur 200 m."
  Übernehmen gesperrt, nichts gebaut. (50×4 + 49×3 = 347 m > 200 m — physikalisch unmöglich, korrekt.)

**A3 — Benannte Zonen mit Maß.** Eingabe:
> `Halle 210x58, 40 Tore Nord Abstand 3, 40 Tore Süd Abstand 3, Wareneingang West 20x15, Warenausgang Ost 20x15`
- **Soll:** 2 benannte Bereiche „Wareneingang"/„Warenausgang", **kollisionsfrei** platziert. Passt das
  20×15-Maß nicht neben die Stellplätze, wird es **ehrlich verkleinert + Warnung** angezeigt (kein
  Bereich, der die halbe Halle überdeckt). Vorschau-Zahl = tatsächlich gebaute Zahl.

**A4 — Unbekanntes wird abgelehnt.** Eingabe mit „runde Halle" oder „3 Fahrgänge":
- **Soll:** Diese Elemente stehen unter „Nicht übernommen"/„ignoriert". Das ist gewollt — NICHT als
  fehlende Funktion melden (siehe Teil 3).

### B) Prozessmodell / Cockpit (`/cockpit`)

**B1 — Demo/Vorlage laden.** Soll: Min/Colli plausibel im Bereich **~1,9–2,2**. (Volle Kette Editor-
Vorlage „Demo-Umschlaghalle": ≈ 2,17.)

**B2 — Volumen-Invarianz (WICHTIG, oft falsch gemeldet).** Ändere Colli/Tag 3.500 → 7.000.
- **Soll:** **Min/Colli, Produktivität, Rang, Spitzenfaktor ändern sich NICHT** (korrekt, intensiv).
  **MA-Stunden/Tag und FTE VERDOPPELN sich** (135 → 270 MA-Std bei Standardmodell). Prüfe, dass
  *genau diese* Personalgrößen skalieren — wenn sie es NICHT tun, ist das ein echter Fehler.

**B3 — Verteilweg-Wirkung.** Erhöhe den Verteilweg deutlich (z. B. 50 m → 250 m).
- **Soll:** Min/Colli **steigt** (längerer Weg = mehr Zeit). Bleibt es exakt gleich, ist die
  Layout→Prozessmodell-Kopplung tot = Fehler.

### C) Wegeberechnung (`/projekt` → Wege/Route-Werkzeug, Demo-Halle geladen)

**C1 — Wege der Demo-Halle berechnen.**
- **Soll:** Es werden **echte Wege für den Großteil** der Tor-/Flächen-Paare gefunden (Zielgröße
  Hunderte, nicht einstellig). Falls die hinterlegten Wegflächen nicht passen, rechnet TOPIS **ohne
  Wegflächen-Beschränkung + zeigt eine Warnung**. Die Kennzahl „Mit Pfad X/Y" zeigt die echte Abdeckung.
- **Soll (Belastbarkeit):** Ø Distanz wird **nur aus echten Wegen** gebildet (keine Luftlinien). Bei
  geringer Abdeckung (< 80 %) ist „Ins Prozessmodell übernehmen" **gesperrt** mit Hinweis „nicht
  belastbar". Ein angebotener Ø-Wert trotz fast keiner echten Wege wäre ein Fehler — den gibt es nicht
  mehr.

### D) Kunden-Check (`/check`)

**D1 — Demo ansehen.** Soll: 4 Ampel-KPIs (Min/Colli, Produktivität, Rang, Spitze), Benchmark-Radar,
Heatmap. Werte plausibel (Min/Colli ~1,9–2,2).

**D2 — Tastatur-Bedienung (A11y).** Die 3 Auswahlkarten (Scandaten/Eckdaten/Demo) und die Upload-Zone
sind per **Tab erreichbar** und mit **Enter/Leertaste** auslösbar (Fokus-Ring sichtbar). Soll: ja.

---

## Teil 3 — Bekannte Grenzen (NICHT als Fehler melden)

Diese Punkte sind bewusst (noch) nicht gebaut bzw. bekannt und in Arbeit — bitte NICHT als Bug listen:

- **KI baut nur Lastenheft-Elemente.** Nicht gebaut: L/T-/Freiform-Grundriss, runde Wände, Rampen,
  Regale mit Ebenen, Unterflurförderkette, Außengelände, frei gewünschte Gang-Anzahl. Ablehnung/
  Ignorieren solcher Angaben ist korrekt.
- **Kennzahlen-Seite (`/dashboard`) kann Vorlagen-Werte zeigen.** Der Kunden-Check schreibt (noch)
  nicht in die persistenten Stores; die Kennzahlen-Seite liest die zuletzt geladene Vorlage. Projekt/
  Quelle/Zeitraum-Anzeige + Check-Persistenz sind der nächste Schritt. (Bekannt.)
- **FTE/MA-Stunden fehlen auf der Kunden-Check-Ergebnisseite** — deshalb wirkt ein Check bei 3.500 vs
  7.000 Colli optisch identisch (die volumen-sensitive Größe ist dort nicht dargestellt). In Arbeit.
- **Cockpit ↔ Editor-Verteilweg:** Das native Cockpit-Modell übernimmt einen im Editor berechneten
  Verteilweg nicht automatisch (zwei Modell-Systeme). „Übernehmen" speichert den Wert und sagt das
  ehrlich. Voll-Verdrahtung ist geplant.
- **Impressum/Datenschutz** verlinken auf `#` (Rechtstext steht aus). Bekannt.
- Kleinere UI: `aria-pressed` am Cockpit-Modus, Befehlssuche schließen nach Auswahl, „Sim löschen"-
  Zähler, „SOLL zurücksetzen"-Button — bekannt, in Nacharbeit.

---

## Teil 4 — Wie du berichtest

1. **Nur Abweichung vom Sollwert = Fehler.** Nenne: Testfall-ID, Eingabe, erwartet (Soll), tatsächlich,
   Screenshot/Zahl.
2. **Kennzeichne Unsicheres als Hypothese.** Du liest den DOM, nicht den Bildschirm — wenn ein Wert
   plausibel, aber ungewohnt ist, prüfe erst gegen Teil 1, bevor du „Bug" schreibst.
3. **Was in Teil 3 steht, nicht melden.**
4. **Priorisiere:** P1 = falsche Rechnung / fabrizierter Wert / Absturz. P2 = UI/A11y/Text.

> Kurz: Miss gegen die Sollwerte in Teil 2 und die Fachwahrheiten in Teil 1 — nicht gegen dein
> Bauchgefühl. Dann trennst du echte Logikfehler sauber von korrektem, nur ungewohntem Verhalten.
