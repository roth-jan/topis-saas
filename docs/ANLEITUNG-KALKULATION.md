# TOPIS Kalkulationsanleitung

## Für Jürgen - basierend auf deinen Anforderungen

---

## 1. Testhalle laden

1. Öffne TOPIS im Browser
2. Klicke auf **Menü → Szenarien → "Papa's Testhalle"**
3. Die Halle wird mit allen Elementen geladen:
   - 10 Tore (links: Eingang, rechts: Ausgang)
   - Bereiche 1-4
   - Hochregallager
   - Kommissionierung, Bleche, Stangen, Kran

---

## 2. Tor-Daten eingeben (dein Punkt 1)

> *"Eingabe Tor: Anzahl Palette, Zeit je Palette"*

1. Klicke auf **"Tor-Kalkulation"** Button in der Toolbar
2. Für jedes Tor eingeben:
   - **Ein/Aus**: Checkbox ob Eingang oder Ausgang
   - **Paletten/Tag**: Wie viele Paletten pro Tag über dieses Tor
   - **Entlade-Zeit**: Sekunden pro Palette beim Entladen (z.B. 30s)
   - **Belade-Zeit**: Sekunden pro Palette beim Beladen (z.B. 25s)
   - **Ziel**: Wohin fährt die Palette? (Bereich, Regal, Stellplatz)

3. Die **Tages-Zusammenfassung** zeigt:
   - Paletten gesamt
   - Fahrten gesamt
   - Entladezeit / Beladezeit / Fahrzeit
   - **GESAMT: X Stunden/Tag**

---

## 3. Wege vergleichen (dein Punkt 7 + 9)

> *"Optimierung: Ist es schneller wenn Weg verändert wird?"*

**So testest du verschiedene Wege:**

1. In der Tor-Kalkulation: Wähle für ein Tor ein **Ziel** (z.B. "Bereich 1")
2. Merke dir die angezeigte **Fahrzeit**
3. Ändere das Ziel auf **"Bereich 3"**
4. Vergleiche die neue Fahrzeit
5. → Du siehst sofort: "Bereich 3 ist X Minuten schneller"

**Beispiel:**
- Tor 1 → Bereich 1: 45 Sekunden
- Tor 1 → Bereich 3: 32 Sekunden
- **Ersparnis: 13 Sekunden pro Palette × 50 Paletten = 10,8 Minuten/Tag**

---

## 4. Hochregal-Zeiten (dein Punkt 4 + 5)

> *"Zusatz Tor 3 nach Hochregal"*
> *"Vorbereitung von Regal - Einlagerung Zeit"*

1. Klicke auf ein **Regal** im Hallenplan
2. Im rechten Panel siehst du:
   - **Ebenen**: Anzahl Regalebenen (z.B. 6)
   - **Höhe/Ebene**: Meter pro Ebene
   - **Einlagerungszeit/Ebene**: Sekunden (z.B. 15s)
   - **Plätze/Ebene**: Palettenplätze

3. **Gesamtkapazität** wird automatisch berechnet
4. Die **Einlagerungszeit** fließt in die Kalkulation ein:
   - Ebene 1: Grundzeit
   - Ebene 6: Grundzeit + (5 × 15s) = +75 Sekunden

---

## 5. Stellplatz-Kapazität (Stapeln)

> *"Auf normalem Palettenstellplatz übereinander stapeln"*

1. Klicke auf einen **Stellplatz**
2. Im Panel eingeben:
   - **Stapelhöhe**: 1-4 (wie viele Paletten übereinander)
   - **Paletten**: Wird automatisch berechnet

**Beispiel:**
- Stellplatz 10m × 5m = 50m²
- Pro Palette ca. 1,2m² Grundfläche
- Stapelhöhe 2 = **83 Paletten** Kapazität

---

## 6. Tages-Berechnung (dein Punkt 3 + 8)

> *"Summe aller Fahrten × Zeit = Stunden/Tag"*

Die **Tor-Kalkulation** addiert automatisch:

```
Für jeden Tor:
  + (Paletten × Entladezeit)     wenn Eingang
  + (Paletten × Beladezeit)      wenn Ausgang
  + (Paletten × Fahrzeit × 2)    Hin + Zurück
────────────────────────────────────────────────
= GESAMT Stunden/Tag
```

**Detail pro Tor** zeigt:
- Paletten
- Zeit (Entlade + Belade + Fahrt)

---

## 7. CSV Export

1. Klicke **"CSV Export"** in der Tor-Kalkulation
2. Datei enthält alle Daten für Excel:
   - Tor, Paletten, Zeiten, Fahrtstrecke
   - Zusammenfassung

---

## 8. Fahrzeugtypen (dein Punkt 2)

> *"Typen: Gabelstapler, Ameise, Geschwindigkeit"*

Die Berechnung nutzt Standard-Fahrzeugdaten:

| Fahrzeug | Geschwindigkeit | Aufnahme | Abgabe |
|----------|-----------------|----------|--------|
| Gabelstapler | 12 km/h | 15s | 12s |
| Ameise | 6 km/h | 20s | 15s |
| Schlepper | 15 km/h | 10s | 10s |
| AGV | 5 km/h | 25s | 25s |
| Handhubwagen | 4 km/h | 30s | 25s |

*Aktuell wird der Gabelstapler als Standard verwendet.*

---

## Schnellstart-Checkliste

- [ ] Testhalle laden (Szenarien → Papa's Testhalle)
- [ ] Tor-Kalkulation öffnen
- [ ] Paletten/Tag pro Tor eingeben
- [ ] Ziele für jeden Tor wählen
- [ ] Gesamtzeit ablesen
- [ ] Alternative Ziele testen → Vergleichen
- [ ] Bei Bedarf: CSV exportieren

---

## Fragen?

Diese Anleitung basiert auf deinen handschriftlichen Notizen vom 30.01.2026.

Wenn etwas fehlt oder anders funktionieren soll - sag Bescheid!
