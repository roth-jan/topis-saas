# Halle-Builder — Hallenplan → TOPIS-Layout

Dieser Workflow überführt einen Hallenplan (Schemazeichnung, Architekten-Plan, Excel-Aufriss) in ein vollständiges TOPIS-Layout-JSON. Geeignet für Multi-Mandanten-Aufbau: ein KI-Modell (Gemini 2.5 Pro, Claude, GPT-4V) liest das Bild + den unten stehenden Prompt und produziert eine valide Layout-Datei.

## Workflow

1. **Bild vorbereiten** — Hallenplan als hochauflösendes PNG (Empfehlung: ≥200 DPI). Wenn das Original ein Excel-Schema ist: über LibreOffice `--convert-to pdf` mit fitToPage-Hack, dann `pdftoppm -r 200`.
2. **Prompt füttern** — Bild + Prompt unten in Gemini/Claude reingeben.
3. **Chain-of-Thought-Check** — KI produziert erst eine Markdown-Analyse-Tabelle. Manuell prüfen: Hallenmaße plausibel? Tor-Zahlen stimmen? Korrekturen anbringen, bevor JSON generiert wird.
4. **JSON validieren** — gegen das TOPIS-Schema (siehe `src/types/topis.ts`).
5. **In TOPIS laden** — Datei → Importieren → ggf. nach manuellem Justieren als Vorlage in `src/data/layouts/` ablegen.

## Der Ideal-Prompt

```
Rolle: Du bist ein Experte für Logistik-Layouts und technischer Analyst
für das System TOPIS.

Aufgabe: Analysiere den beigefügten Hallenplan (Bild) und konvertiere ihn
in ein präzises TOPIS-Layout-JSON.

1. KONTEXT & SKALIERUNG
- Skala: 10 px/m. Welt-Koordinaten in Metern.
- Referenzmaß: Ein Standard-Tor entspricht ca. 3,75 m Breite (oder
  alternatives Maß: {{Referenzwert aus dem Plan}}).
- Ursprung (0,0): obere linke Ecke der Haupthalle.

2. ANALYSE-SCHRITTE (Chain-of-Thought, VOR dem JSON)
Erstelle zuerst eine Markdown-Tabelle mit:
- Hallen-Dimensionen: Gesamtlänge × Breite in Metern (mit Herleitung)
- Objekt-Liste: alle erkannten Tore (Nummern, Wand-Seite), Stellplätze,
  Bereiche, Hindernisse
- Koordinaten-Logik: kurze Herleitung der x/y-Werte für die drei
  größten Segmente

3. JSON-SPEZIFIKATION (TOPIS V1)
Generiere das JSON exakt nach diesem Schema:

{
  "meta": {
    "name": string,
    "kunde": string,
    "standort": string,
    "stand": "YYYY-MM-DD",
    "quelle": string,
    "flaeche_qm": number
  },
  "hall": {
    "width": number,
    "height": number,
    "name": string,
    "color": "#1a1a2e"
  },
  "objects": [
    {
      "type": "tor" | "stellplatz" | "bereich" | "regal" | "hindernis" |
              "rampe" | "leveller" | "pfosten" | "treppe" | "ladestation" |
              "gefahrgut" | "sperrplatz" | "klaerplatz" | "buero" |
              "sozialraum" | "wc" | "wand" | "tuer" | "entladebereich" |
              "outdoor_area" | "outdoor_road" | "trailer_spot" | "parking" |
              "custom",
      "x": number, "y": number,
      "width": number, "height": number,
      "name": string,
      "color"?: string,
      "rotation"?: number,
      "side"?: "north" | "south" | "east" | "west",
      "torNummer"?: number,
      "torTyp"?: "sektionaltor" | "rolltor" | "schnelllauftor",
      "tags"?: string[],
      "meta"?: { [key: string]: string },
      "shape"?: "rect" | "circle",
      "icon"?: string
    }
  ],
  "gaenge": [
    {
      "id": number,
      "name": string,
      "points": [{ "x": number, "y": number }, ...],
      "breite": number,
      "typ": "hauptgang" | "quergang" | "regalgang",
      "farbe": string
    }
  ]
}

4. CONSTRAINTS & REGELN
- Kein Raten: Wenn ein Maß unsicher ist, markiere das Objekt mit
  tags: ["check-measurements"] und gib im meta.note die Annahme an.
- Ausrichtung: side = "north" (obere Wand), "south" (untere), "east"
  (rechte), "west" (linke).
- Tor-Pflichtfelder: torNummer + side. torTyp wenn ableitbar.
- Sektion-Cluster (z.B. "TU AS", "Entladezone"): als tags + meta.sektion
  auf den Tor-Objekten, NICHT als eigene Bereich-Rechtecke (wäre
  überflüssig und führt zu Überlappungen).
- Innen-Bereiche (z.B. "Langgut 6.1", "Pufferplatz SE", "AS 99"):
  als type="bereich" mit eigener Farbe (color), nicht als Tor-Tag.
- Gänge dürfen Bereiche nicht durchqueren — entweder Bereiche kleiner
  oder Gang-Trasse anpassen.
- Messpunkte (z.B. "MP5", "MP2"): type="custom" mit shape="circle",
  icon="crosshair", tags=["messpunkt"], meta={code, rolle}.

5. OUTPUT-REIHENFOLGE
Erst die Markdown-Analyse-Tabelle, dann den JSON-Code-Block.

Wenn ich Korrekturen zur Tabelle anbringe, generiere das JSON neu.
```

## Variablen, die du jedes Mal anpassen musst

Die zwei Stellen in `{{...}}`:
- **Referenzwert**: wenn der Plan andere Maße als 3,75 m als Standardraster nutzt
- **Optional**: Ursprung (falls nicht oben links)

## Lessons aus der ersten Anwendung (Mai 2026, AS Halle 6)

- **Excel-Zellwerte sind nicht zwingend Geometrie.** Die x-Werte in der Tim-/Michael-Excel (123,24 → 33,89 → 168,6) ergeben in Summe keine lineare Tor-Achse. Verlass dich nicht auf die Excel-Zahlen — frag die KI nach räumlicher Plausibilität.
- **Chain-of-Thought-Tabelle abfangen**, bevor das JSON entsteht. Bei AS hätte ich Halle 200×60 angenommen — Gemini hat 215×58 berechnet, und 215×58 ist näher dran (12.470 m² vs. 12.000 m² Angabe im Angebot).
- **„Ausgang"/„Eingang"-Spalten** sind Türen in der Wand, keine Tore. KI muss das aus dem Plan ablesen, nicht aus dem ■-Symbol allein.
- **Sektion-Cluster als Tag**, nicht als überlagernder Bereich-Rechteck. Vermeidet Überlappungs-Bugs.

## Few-Shot-Anker (AS Halle 6 als Goldstandard)

Wenn der zweite Kunde kommt (Geis, Hellmann, ein Cargoline-Partner), füge dem Prompt ein **Beispiel-Paar** hinzu: AS-Hallenplan-Bild + finales AS-Layout-JSON. Steigert die Genauigkeit bei komplexen Hallen erheblich.

Pfade dafür:
- Bild: `~/Downloads/AS-Halle6-2026_SE-Tab.png`
- JSON: `src/data/layouts/schmid-halle6-2026.json`
