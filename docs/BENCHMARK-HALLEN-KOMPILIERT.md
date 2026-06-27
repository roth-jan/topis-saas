# Benchmark-Hallen — kompiliert aus den ROTH-Projektordnern (SharePoint)

_Stand 2026-06-27. Quelle: 4 parallele Extraktions-Agenten über `General/Logistikberatung/`. Nur echte Zellwerte, nichts geschätzt. Diese Liste ersetzt die teils erfundenen Hallen in `referenzhallen.ts` (Freigabe Jan ausstehend)._

**Vergleichs-Metrik = SE „Entladung Fernverkehr" Min/Colli + SA „Verladung FV/National" Min/Colli** (die ROTH-Standard-Benchmarkkennzahl; identisch in den Projektmodellen, im `Hallenbenchmarking.xlsx` und in der PML-Benchmark-Bibliothek).

## A) Saubere, vergleichbare Hallen (ROTH-Standard SE Entladung FV)

| Halle | SE (Entl. FV) | SA (Verl. FV) | qm | Jahr | Quelle |
|---|---|---|---|---|---|
| Rhenus – Unna | 1,45 | 1,48 | 10460 | — | Hallenbenchmarking/PML-Bench |
| Kunze – Karlsdorf | 1,74 | — | 5520 | — | Hallenbenchmarking |
| Rhenus – Düsseldorf | 1,75 | 1,07 | — | 2021 | Prozessmodell Rhenus |
| TLT – Berlin-Potsdam | 1,91 | — | 8237 | — | PML-Bench / basiswerte |
| Andreas Schmid – Gersthofen | 1,92¹ | 1,28 | 8576 | 2020 | Prozessmodell AS |
| Geis – Nürnberg (TuL) | 1,95 | 1,11 | 4512 | 2018 | Hallenbenchmarking / Modell |
| Geis – Bad Neustadt | 1,96 | 1,16 | 6240 | — | PML-Bench |
| Zufall – Fulda | 1,98 | 1,09 | — | 2020 | Prozessmodell Zufall |
| PML – Kiel | 2,03 | 1,22 | — | 2019 | Prozessmodell PML |
| CargoLine – München | 2,13² | — | — | 2021 | SE-Simulation |
| Wackler | 2,18 | 1,23 | — | 2021 | Prozessmodell Wackler |
| Noerpel – Ulm | 2,19 | 1,36 | 6240 | — | PML-Bench |
| Amm Spedition | 2,30 | 1,15 | — | 2021 | Prozessmodell Amm |
| Zufall – Göttingen | 2,33 | 1,27 | — | 2021 | Prozessmodell Zufall |
| Lagermax – Salzburg | 3,19 | 1,78 | 5560 | — | Hallenbenchmarking |
| Geis – Naila | 3,44 | 1,09 | 6975 | — | Hallenbenchmarking |
| Schröder+Schierenberg – Porta | 1,30³ | 1,31 | 4254 | — | PML-Bench |
| IDS-Hub – Neuenstein | —³ | 1,30 | 8100 | — | PML-Bench |
| System Alliance – Niederaula (Hub) | 1,84⁴ | 0,63⁴ | — | 2020 | Prozessmodell SyA |
| Geis – Satteldorf (Neubau) | — | — | 5280 | — | nur Maße |
| Krage & Gerloff – Schwanebeck | — | — | 4560 | — | nur Maße |

## B) Kühne+Nagel — 13 Standorte (2016/17, SE vergleichbar; SA = anderer Scope, separat)

Bielefeld SE 1,90 · Hagen 1,94 · Hamburg 2,04 · Chemnitz 2,08 · Oldenburg 2,14 · Dortmund 2,19 · Straubing 2,19 · Haiger 2,39 · Mainz 2,44 · Leipzig 2,46 · Bocholt 3,31 · (Compans/Paris 0,89). Freiberg nur SA.
→ **SE-Werte vergleichbar** (1,9–2,5). **SA-Werte (3,3–5,4) NICHT** — K+N zählt im Stückgutausgang einen weiteren Prozessumfang. SA daher nicht in den Vergleich mischen.

## C) Caveats / nicht direkt vergleichbar
- **Hellmann** (Bielefeld/Lehrte/Bremen, 2021): Werte in **Min/Sendung**, nicht Min/Colli, und als Summe über alle Blöcke → andere Einheit/Definition. **Nicht** in den Min/Colli-Vergleich mischen (separat halten oder Entladung-FV-Block neu ableiten).
- **K+N SA** + **System Alliance Hub** (0,63): abweichender Prozessumfang → markieren.
- **Bächle und Hugger** (2024): Min/Colli-Spalte im Modell leer → kein sauberer Wert (nur Colli-Mengen). Nachziehbar bei Bedarf.
- **Glamatronic / Hartmann / IDS-Verpackung**: kein verwertbares SE/SA-Modell (Hartmann-Ordner leer).
- **Anonymer Externer-Benchmark** (~80 SA/SE-Datenpunkte in `Benchmark_K+N.xlsx` „ext. Benchmarking") + Wettbewerber (Sweden/France/Norway) — anonyme Punkte, keine benannten Hallen.

## Zählung
**Benannte Hallen mit echtem SE-Wert: ~28** (Block A ~17 + K+N 11). Plus ~14 im kuratierten `Hallenbenchmarking.xlsx`, plus ~80 anonyme externe Benchmark-Punkte. → „über 50 analysiert" ist sauber belegt; der direkt vergleichbare, benannte Kern liegt bei ~25–30.

## Empfehlung
`referenzhallen.ts` aus **Block A + K+N-SE** neu aufbauen (echte Namen/Orte/Werte), erfundene Hallen (Mannheim/Hamburg-TLT/Augsburg/Osnabrück) raus. Primär-Benchmark = SE Entladung FV Min/Colli; SA als zweite, sauber abgegrenzte Kennzahl. K+N-SA / Hub / Hellmann markiert oder ausgeklammert.

---
¹ AS Modell-Wert 1,917; gemessener IST im Katalog 2,56 (Vintage 2019). ² nur SE-Eingangssimulation, zwei Verkehre gemittelt. ³ Schröder-SE 1,30 auffällig niedrig — vor Einsatz prüfen. ⁴ Zentral-Hub, kein klassisches FV-Stückgut.
