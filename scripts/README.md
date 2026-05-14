# TOPIS Data-Pipeline Scripts

Reproduzierbare Pipelines zur Aktualisierung der Demo-Daten aus SharePoint.

## build-as-csv-from-accdb.py

Liest AS-Scan-Daten aus einer Access-DB (z.B. `01 Basisdaten 01-26 Projekt Fa Roth 2026.accdb`)
und erzeugt eine TOPIS-importierbare CSV im Format
`scandatum;scanzeit;messpunkt;messpunktname;tour;dispogebiet;sendungen;colli;gewicht;ladezeit`.

**Voraussetzungen:** `mdb-tools` (auf macOS via `brew install mdbtools`).

**Verwendung:**
1. Access-DB lokal nach `/tmp/as-accdb/as_<monat>.accdb` ablegen
2. Pfade im Script anpassen
3. `python3 scripts/build-as-csv-from-accdb.py`
4. CSV landet in `public/demo-data/`

Output Januar 2026: 219.517 Scans → 23.108 Halbstunden-Zeitfenster (1,6 MB CSV).

## build-as-csv-from-xlsx.py

Wenn AS für einen Monat die Scans nur als Excel-Export liefert (z.B. `Scans Februar 26.xlsx`,
75 MB), wird daraus dieselbe CSV gebaut. Liest das `Raw`-Sheet (nicht das `Strecken`-Sheet,
das ist eine Auswertung).

**Voraussetzungen:** `openpyxl`.

**Verwendung:**
1. SharePoint-Credentials in `~/.openclaw/workspace/sharepoint_credentials.json`
2. Pfad im Script auf gewünschte Excel-Datei setzen
3. `python3 scripts/build-as-csv-from-xlsx.py`
4. CSV landet in `public/demo-data/`

Output Februar 2026: 234.445 Scans → 10.501 Zeitfenster (750 KB CSV).

## Demo-Workflow für AS

Wenn AS monatlich neue Daten liefert:

1. Script ausführen, neue CSV in `public/demo-data/as-<monat>-scans.csv`
2. Wenn neuer Monat: Toolbar.tsx erweitern um neuen Menüpunkt
   (siehe `handleLoadMonth('as-feb2026-scans', 'Februar 2026')`)
3. Commit + Deploy → Live unter https://roth-jan.github.io/topis-saas/

## Was später automatisiert werden sollte

- Cron-Job auf einem kleinen Server: pullt monatlich SharePoint → konvertiert
  → schreibt CSV → push ins Repo. Erst nötig wenn mehrere Kunden TOPIS nutzen.
- Bis dahin: monatlicher Berater-Touch (5 Min) ist auch der Anlass für den
  Review-Call mit dem Kunden — gehört in den Pilot-Preis rein.
