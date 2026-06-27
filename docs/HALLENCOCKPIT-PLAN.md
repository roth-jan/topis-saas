# Hallencockpit — Auswertung Kaiser-Konzept (2020) + Concierge-MVP-Plan

_Stand 2026-06-27. Grundlage: `Konzept_Hallencockpit.pptx` (Daniel Kaiser, 06.01.2020, 99 Folien) + `Konzept_Hallencockpit_Überblick.pptx` + `Beispiele_Cockpit.pptx`, SharePoint `Logistik-Beratung/_Hallencockpit/`. Lokal `/tmp/hallencockpit/`._

## 1. Was Kaiser 2020 entworfen hat

**Vision:** Ein modulares „Data-Warehouse + Apps"-System zur **operativen Steuerung und zum Controlling einer Umschlaghalle**. Kerngedanke: Kundendaten (Scans, Pläne, Personal) mit **ROTH-Benchmarkdaten aus Beratungsprojekten** verknüpfen → **SOLL-Werte ableiten** → IST/SOLL-Steuerung. Ziel: Transparenz, Produktivitätslücken aufdecken, **Reportings + Handlungsempfehlungen** in wählbarem Intervall (täglich/wöchentlich/monatlich), Kunden-Selfservice-Zugriff auf die Daten.

**Problem, das es löst (Folie 3-4):** Hallensteuerung läuft „mehr auf Bauchgefühl als auf Kennzahlen"; KPIs rudimentär, keine SOLL-Werte, nur Monatsaggregat (zu spät), Daten verstreut (Papier, Excel, TMS, Zeiterfassung). Scandaten werden für Controlling nicht genutzt.

**Die 9 Module (Folie 7):**
1. **TOPIS** — Visualisierung/Simulation (= unser Editor, existiert)
2. **Prozess- und Benchmarktool** — Prozesszeiten-DB + ROTH-Benchmark
3. **Tägliches Dashboard** — das Cockpit (KPI-Kacheln)
4. **Kapazitätscontrolling** — Hallengrenzwert
5. **Schichtplanung** (Bedarf vs. Verfügbarkeit)
6. **Produktivitätscontrolling**
7. **Kalkulation Kundentarife**
8. **Steuerung Live-Betrieb** (Schichtsteuerung)
9. **Vertriebschancen**

**Die substantiellen Auswertungen (Folie 44-55) — decken sich mit `/check`:**
- **A — Zeitliche Scanverläufe** je Messpunkt (MP2 NV-Entl., MP4 FV-Verl., MP5 FV-Entl., MP7 NV-Verl., MP9 Hallencheck) in Stundenintervallen → IST-Kurve + **SOLL-MA-Bedarf aus Standardprozess** → Kernzeitfenster, Produktivitätslücken, **optimale Personalzusammensetzung**. → **identisch zum `/check`-Stundenprofil IST/SOLL.**
- **B — Prozessqualität / MA-Auslastung**
- **C — Verladereinteilung/-leistung** (Kriterien: gleichmäßige Abfahrten, Colli/Lademeter, Verteilwege minimieren, Anstell-Restriktionen, SE-Überhang) → = Torbelegung/Verladeplan in `/projekt`.
- **D — NV-Fahrer-Controlling**
- **E — Hallengrenzwert** (Kapazität) → = „wie viel kann die Halle".

**Dashboard-KPIs (Beispiele_Cockpit):** Füllgrad Halle SE/SA (aktuell/Vortag/Ø20T), **Colli/MAh (heute / Ø-5-Tage / Ø-30-Tage / Soll / Abweichung)**, Qualität (beschädigte Sendungen, nicht verladene Termine), Überhang, verspätete FV-Abfahrten, kritische NV-Relationen, Forecast, ToDos.

**Kennzahlen (Folie 38):** Verladerleistung (Colli/Lademeter je Verlader/Tag), Colli je MA-Stunde je Prozess/Bereich, Ø Verladedauer NV, Ø Überhang/Tag.

**Daten-Inputs (Folie 40-43):** Scanndaten (Kern) · Sendungsdaten · Eingangsplan/-liste (SOLL/IST Ankunft) · Ausgangsplan/-liste (SOLL/IST Abfahrt) · Verladereinteilung · **Personal Verfügbar** (Stammdaten inkl. Aushilfen/Zeitarbeit) · **Personal Einsatz** (IST-Stunden inkl. Aushilfen — Basis für Produktivität). Format-Spec: `Tabellenstruktur_Scandaten.xlsx` (liegt im Ordner).

**Zielgruppen + Differenzierung (Folie 31):** (1) ROTH selbst (Projekt-Auswertungen standardisieren). (2) Speditionen in Konzernen/Kooperationen, platzierbar auf GF-/Niederlassungsebene. **„Aktuell gibt es nach unserem Wissensstand keinen Anbieter, der ein Tool zur vollumfänglichen Hallensteuerung bereitstellen kann."** (2026 weiterhin plausibel: generische Digital-Twins ≠ LTL-Hallensteuerung.)

## 2. Abgleich mit dem, was wir heute haben

| Kaiser-Baustein | Stand TOPIS heute |
|---|---|
| Benchmark-DB (Prozesszeiten je Halle) | ✅ Referenzhallen + Min/Colli-Modell |
| Auswertung A (Scanverlauf → SOLL-MA-Bedarf) | ✅ `/check` Stundenprofil IST/SOLL |
| Produktivitätscontrolling (Colli/MAh) | ⚠ teils — `/check` rechnet KPIs, aber **ohne echte Personal-Einsatz-Stunden** (nutzt Schätzung) |
| Tägliches Dashboard + Trend | ⚠ `CockpitPanel` (Editor) als Momentaufnahme; **kein Verlauf/Konto** |
| Benchmark-Rang | ✅ `/check` Benchmark-Radar |
| TOPIS Visualisierung/Simulation | ✅ `/projekt` (Premium) |
| Verladereinteilung (C), Hallengrenzwert (E) | ⚠ teils in `/projekt` |
| Tarifkalkulation, Live-Steuerung, Schichtsteuerung, NV-Fahrer | ❌ nicht gebaut |

**Kernbefund:** Der **Daten-/Produktivitäts-Teil** von Kaisers Vision ist in `/check` zu großen Teilen real. Die teure Geometrie (TOPIS-Sim) und die Live-/Tarif-Module sind separat bzw. später.

## 3. Concierge-MVP — scharfer Scope

**Prinzip:** Vor Self-Service + Billing zuerst **Zahlungsbereitschaft testen.** ROTH sammelt die Daten von 2-3 Pilotkunden selbst und lädt sie hoch; der Kunde bekommt sein Cockpit + Monats-Review. Kein Self-Upload, keine Paywall, kein Stripe im MVP.

**IN Scope (das minimale abo-würdige Cockpit):**
- **Produktivität: Colli/MAh** mit **Trend** (Monat für Monat, Δ vs. Vormonat + Ø) und **SOLL** aus ROTH-Benchmark → der Fachkräftemangel-Nerv (Personal richtig einsetzen, nicht abbauen).
- **Stundenprofil IST/SOLL** (Auswertung A) — Kernzeitfenster + Personalbedarf je Stunde.
- **Benchmark-Rang** über die Zeit — „Ihre Halle vs. 50+ Hallen", mitwachsend.
- **Auslastung/Füllgrad-Trend** (soweit aus Scandaten ableitbar).
- **Ein Monats-Report-PDF** + kurzer ROTH-Kommentar (= Kaisers „Handlungsempfehlungen", im MVP von Hand).

**OUT of Scope (spätere Module):** Tarifkalkulation, Live-/Schichtsteuerung, NV-Fahrer-Controlling, vollautomatische Schichtplanung, Self-Upload-UI, Billing-Automatik, geometrische Sim (bleibt `/projekt`-Premium).

**Daten, die ROTH vom Piloten einsammelt** (Kaiser Folie 40-43, reduziert): Scanndaten (Pflicht) + **Personal-Einsatz-Stunden inkl. Aushilfen** (für echtes Colli/MAh). Optional Ein-/Ausgangspläne für Spitzen. Format nach `Tabellenstruktur_Scandaten.xlsx`.

**Technische MVP-Schritte (klein, Integration statt Neubau):**
1. **Scope/KPI-Set festziehen** (oben) + Verlaufs-Datenmodell in Supabase (`cockpit_halls`, `cockpit_snapshots`).
2. **`/check`-Ergebnis als Snapshot persistierbar** machen (Login via bestehendem `auth.tsx`), intern für ROTH (Concierge).
3. **Trend-/Verlaufs-Ansicht** (Reuse `CockpitPanel`, `StundenChart`, `BenchmarkRadar`): Kennzahl über Monate + Δ/Ø/SOLL.
4. **Personal-Einsatz-Stunden** als zusätzlichen Upload aufnehmen → echtes Colli/MAh statt Schätzung.
5. **Monats-Report-Export (PDF)** + Kommentarfeld.
6. **Kunden-Login-Sicht** (read-only Cockpit) — der Pilot sieht seine Halle.

**Erfolgskriterium des MVP:** Sagt ein Pilot nach 2-3 Monaten „das will ich behalten / dafür zahle ich"? Dann erst Self-Service + Billing (Phase 4/5 des Gesamtplans).

## 4. Offene Entscheidungen für Jan
- **Pilotkunden:** wer? (AS/Beintner ist warm, aber Projekt-Kontext; evtl. besser ein „kalter" Pilot, um die Neukunden-These ohne Projekt zu testen.)
- **Personal-Einsatz-Daten:** kriegen wir die von Piloten verlässlich? (Kaiser betont: inkl. Aushilfen/Zeitarbeit, sonst Produktivität falsch.)
- **Free-Quickcheck-Konsistenz:** Website-Quickcheck (Teaser) → `/check` (Free-Momentaufnahme) → Cockpit-Abo sauber verdrahten.
- **Tabellenstruktur_Scandaten.xlsx** als verbindliches Upload-Format übernehmen?
