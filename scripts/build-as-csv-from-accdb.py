#!/usr/bin/env python3
"""
Pipeline: AS Access-DB Januar 2026 → TOPIS-Betriebsdaten-CSV.
Format: scandatum;scanzeit;messpunkt;messpunktname;tour;dispogebiet;sendungen;colli;gewicht;ladezeit
"""
import subprocess, csv, sys
from datetime import datetime
from collections import defaultdict

DB = '/tmp/as-accdb/as_jan2026.accdb'
OUT = '/Users/clawdette/projects/topis-saas/public/demo-data/as-jan2026-scans.csv'

# MP-Name-Mapping (passend zu unserem Layout)
MP_NAME = {
    '5':  'SE Entladung FV',
    '7':  'SA Verladung FV',
    '4':  'Nat. Ausgang',
    '4a': 'Sonderausgang',
    '2':  'Nat. Eingang',
    '9b': 'NV Eingang',
    '9a': 'Sonderscan',
}

def parse_dt(s):
    """Excel/Access date strings parsen. Format: '01/20/26 00:00:00' (mm/dd/yy)."""
    if not s: return None
    try:
        return datetime.strptime(s.strip(), '%m/%d/%y %H:%M:%S')
    except ValueError:
        return None

# Export aus Access
proc = subprocess.Popen(['mdb-export', DB, 'Scans Jan26'], stdout=subprocess.PIPE, text=True)
reader = csv.DictReader(proc.stdout)

# Zähle pro (Tag, MP, Tour, Dispogebiet, Stellplatz) — eine TOPIS-Zeile = ein Stellplatz-Cluster
# Aber: TOPIS akzeptiert auch einzelne Scan-Zeilen. Aggregieren ist sinnvoller für Heatmap.
# Hier: pro (Tag, Scanzeit-Halbstunde, MP, Tour) aggregieren — ergibt feine Auflösung
aggr = defaultdict(lambda: {'sendungen': set(), 'colli': 0, 'gewicht': 0.0, 'stellplatz': '', 'disp': ''})

n_total = 0
n_skipped = 0
for row in reader:
    n_total += 1
    mp = (row.get('Messpunkt') or '').strip()
    if not mp:
        n_skipped += 1
        continue
    dt_scan = parse_dt(row.get('Scandatum', ''))
    t_scan = parse_dt(row.get('Scanzeit', ''))
    if not dt_scan:
        n_skipped += 1
        continue
    # Datum
    datum = dt_scan.strftime('%Y-%m-%d')
    # Zeit aus Scanzeit (Access speichert mit Datum 1899-12-30) — extrahiere HH:MM
    if t_scan:
        zeit = t_scan.strftime('%H:%M')
    else:
        zeit = '00:00'
    # Halbstunden-Bucket für Aggregation
    h, m = zeit.split(':')
    halbstunde = f"{h}:{'30' if int(m) >= 30 else '00'}"
    tour = (row.get('Tour') or '').strip()
    disp = (row.get('Dispogebiet') or '').strip()
    stellplatz = (row.get('Stellplatz') or '').strip()
    try:
        gewicht = float(row.get('TKG') or 0)
    except ValueError:
        gewicht = 0
    try:
        kolli = int(row.get('Kolli') or 1)
    except ValueError:
        kolli = 1
    auftrag = (row.get('Auftragsnr_eindeutig') or '').strip()

    key = (datum, halbstunde, mp, tour)
    a = aggr[key]
    if auftrag: a['sendungen'].add(auftrag)
    a['colli'] += kolli
    a['gewicht'] += gewicht
    if stellplatz: a['stellplatz'] = stellplatz
    if disp: a['disp'] = disp

print(f"Verarbeitet: {n_total} Scans (übersprungen: {n_skipped})")
print(f"Aggregiert auf {len(aggr)} Zeitfenster")

# CSV schreiben im TOPIS-Format
import os
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f, delimiter=';')
    w.writerow(['scandatum','scanzeit','messpunkt','messpunktname','tour','dispogebiet','sendungen','colli','gewicht','ladezeit'])
    for (datum, zeit, mp, tour), a in sorted(aggr.items()):
        mp_name = MP_NAME.get(mp, f'MP{mp}')
        w.writerow([datum, zeit, f'MP{mp}', mp_name, tour, a['disp'],
                    len(a['sendungen']), a['colli'], round(a['gewicht'], 1), ''])

import os
size = os.path.getsize(OUT) / 1024
print(f"→ {OUT}  ({size:.1f} KB)")
