import type { Spaltenzuordnung, ScandatenRecord } from '@/types/scandaten';

/**
 * Vorkonfigurierte Spalten-Mappings für bekannte Kunden-Formate.
 * Auto-Erkennung anhand CSV-Header.
 */
export const SPALTEN_PROFILE: Spaltenzuordnung[] = [
  {
    id: 'STANDARD',
    name: 'ROTH Standard (19 Felder)',
    beschreibung: 'Standardformat mit allen 19 Feldern',
    delimiter: ';',
    datumsformat: 'YYYY-MM-DD',
    mapping: {
      scandatum: 'scandatum',
      scanzeit: 'scanzeit',
      stellplatz: 'stellplatz',
      messpunkt: 'messpunkt',
      messpunktname: 'messpunktName',
      tour: 'tour',
      dispogebiet: 'dispogebiet',
      ausgangsrelation: 'ausgangsrelation',
      sendungen: 'sendungen',
      colli: 'colli',
      gewicht: 'gewicht',
      ladezeit: 'ladezeit',
      palette: 'palette',
      volumen: 'volumen',
      lademeter: 'lademeter',
      fahrzeugtyp: 'fahrzeugtyp',
      kundenname: 'kundenname',
    },
  },
  {
    id: 'AS_2019',
    name: 'Speditions-WMS A (2019)',
    beschreibung: 'SE-Scandaten, Stellplatz = Tor-Nr',
    delimiter: ';',
    datumsformat: 'DD.MM.YYYY',
    mapping: {
      datum: 'scandatum',
      zeit: 'scanzeit',
      stellplatz: 'stellplatz',
      tor: 'stellplatz',
      tornummer: 'stellplatz',
      messpunkt: 'messpunkt',
      messpunktname: 'messpunktName',
      messpunkt_name: 'messpunktName',
      tour: 'tour',
      tourkz: 'tour',
      dispogebiet: 'dispogebiet',
      dispo: 'dispogebiet',
      relation: 'ausgangsrelation',
      ausgangsrelation: 'ausgangsrelation',
      ziel: 'ausgangsrelation',
      sendungen: 'sendungen',
      sdg: 'sendungen',
      colli: 'colli',
      cll: 'colli',
      gewicht: 'gewicht',
      gew: 'gewicht',
      kg: 'gewicht',
      ladezeit: 'ladezeit',
    },
  },
  {
    id: 'GEIS',
    name: 'Geis Logistik',
    beschreibung: 'Geis Scandaten-Format',
    delimiter: ';',
    datumsformat: 'DD.MM.YYYY',
    mapping: {
      scandatum: 'scandatum',
      datum: 'scandatum',
      scanzeit: 'scanzeit',
      zeit: 'scanzeit',
      tor: 'stellplatz',
      tornr: 'stellplatz',
      stellplatz: 'stellplatz',
      messpunkt: 'messpunkt',
      bezeichnung: 'messpunktName',
      route: 'tour',
      tour: 'tour',
      gebiet: 'dispogebiet',
      relation: 'ausgangsrelation',
      sendungen: 'sendungen',
      colli: 'colli',
      pakete: 'colli',
      gewicht: 'gewicht',
    },
  },
  {
    id: 'PML_KIEL',
    name: 'PML Kiel',
    beschreibung: 'PML Kiel Scandaten-Format',
    delimiter: ';',
    datumsformat: 'DD.MM.YYYY',
    mapping: {
      datum: 'scandatum',
      uhrzeit: 'scanzeit',
      tor: 'stellplatz',
      tornummer: 'stellplatz',
      linie: 'tour',
      tour: 'tour',
      gebiet: 'dispogebiet',
      relation: 'ausgangsrelation',
      sdg: 'sendungen',
      sendungen: 'sendungen',
      cll: 'colli',
      colli: 'colli',
      gew: 'gewicht',
      gewicht: 'gewicht',
    },
  },
  {
    id: 'IDS_HUB',
    name: 'IDS Hub',
    beschreibung: 'IDS Hub-Scandaten',
    delimiter: ';',
    datumsformat: 'YYYY-MM-DD',
    mapping: {
      date: 'scandatum',
      datum: 'scandatum',
      time: 'scanzeit',
      zeit: 'scanzeit',
      gate: 'stellplatz',
      tor: 'stellplatz',
      depot: 'dispogebiet',
      destination: 'ausgangsrelation',
      relation: 'ausgangsrelation',
      shipments: 'sendungen',
      sendungen: 'sendungen',
      parcels: 'colli',
      colli: 'colli',
      weight: 'gewicht',
      gewicht: 'gewicht',
    },
  },
  {
    id: 'NOERPEL',
    name: 'Noerpel',
    beschreibung: 'Noerpel Scandaten-Format',
    delimiter: ';',
    datumsformat: 'DD.MM.YYYY',
    mapping: {
      datum: 'scandatum',
      zeit: 'scanzeit',
      rampe: 'stellplatz',
      tor: 'stellplatz',
      tournr: 'tour',
      tour: 'tour',
      gebiet: 'dispogebiet',
      empfaenger: 'ausgangsrelation',
      relation: 'ausgangsrelation',
      sdg: 'sendungen',
      sendungen: 'sendungen',
      cll: 'colli',
      colli: 'colli',
      kg: 'gewicht',
      gewicht: 'gewicht',
      ldm: 'lademeter',
    },
  },
  {
    id: 'RHENUS',
    name: 'Rhenus',
    beschreibung: 'Rhenus Scandaten-Format',
    delimiter: ';',
    datumsformat: 'DD.MM.YYYY',
    mapping: {
      scandatum: 'scandatum',
      datum: 'scandatum',
      scanzeit: 'scanzeit',
      zeit: 'scanzeit',
      verladeplatz: 'stellplatz',
      tor: 'stellplatz',
      linie: 'tour',
      tour: 'tour',
      dispo: 'dispogebiet',
      richtung: 'ausgangsrelation',
      relation: 'ausgangsrelation',
      sendungen: 'sendungen',
      colli: 'colli',
      gewicht: 'gewicht',
    },
  },
  {
    id: 'TLT',
    name: 'TLT',
    beschreibung: 'TLT Scandaten-Format',
    delimiter: ';',
    datumsformat: 'DD.MM.YYYY',
    mapping: {
      tag: 'scandatum',
      datum: 'scandatum',
      uhr: 'scanzeit',
      zeit: 'scanzeit',
      platz: 'stellplatz',
      tor: 'stellplatz',
      fahrt: 'tour',
      tour: 'tour',
      zielgebiet: 'dispogebiet',
      ziel: 'ausgangsrelation',
      relation: 'ausgangsrelation',
      sdg: 'sendungen',
      sendungen: 'sendungen',
      stk: 'colli',
      colli: 'colli',
      kg: 'gewicht',
      gewicht: 'gewicht',
    },
  },
];

/**
 * Auto-Erkennung des Spalten-Profils anhand CSV-Header.
 * Zählt wie viele Header-Felder zu jedem Profil passen.
 */
export function erkenneSpaltenprofil(csvHeaders: string[]): Spaltenzuordnung | null {
  const normalizedHeaders = csvHeaders.map((h) => h.trim().toLowerCase());

  let bestMatch: Spaltenzuordnung | null = null;
  let bestScore = 0;

  for (const profil of SPALTEN_PROFILE) {
    const profilKeys = Object.keys(profil.mapping).map((k) => k.toLowerCase());
    const matchCount = normalizedHeaders.filter((h) => profilKeys.includes(h)).length;
    const score = matchCount / normalizedHeaders.length;

    if (score > bestScore && matchCount >= 3) {
      bestScore = score;
      bestMatch = profil;
    }
  }

  return bestMatch;
}

/**
 * Parst eine CSV-Zeile mit dem gegebenen Profil in einen ScandatenRecord.
 */
export function parseZeileMitProfil(
  cols: string[],
  headers: string[],
  profil: Spaltenzuordnung,
  zeilenNr: number
): ScandatenRecord | null {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  const getValue = (standardFeld: keyof ScandatenRecord): string => {
    // Finde den CSV-Header, der auf dieses Standardfeld mappt
    for (const [csvKey, targetFeld] of Object.entries(profil.mapping)) {
      if (targetFeld === standardFeld) {
        const idx = normalizedHeaders.indexOf(csvKey.toLowerCase());
        if (idx >= 0 && idx < cols.length) {
          return cols[idx]?.trim() || '';
        }
      }
    }
    return '';
  };

  const datum = getValue('scandatum');
  const zeit = getValue('scanzeit');
  const stellplatz = getValue('stellplatz');

  // Mindestens Datum und Stellplatz oder Colli sollten vorhanden sein
  const colli = parseFloat(getValue('colli')) || 0;
  const sendungen = parseFloat(getValue('sendungen')) || (colli > 0 ? 1 : 0);

  if (!datum && !stellplatz && colli === 0) return null;

  // Datum normalisieren
  let normalizedDatum = datum;
  if (profil.datumsformat === 'DD.MM.YYYY' && datum.includes('.')) {
    const parts = datum.split('.');
    if (parts.length === 3) {
      normalizedDatum = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  return {
    id: zeilenNr,
    scandatum: normalizedDatum,
    scanzeit: zeit,
    timestamp: new Date(`${normalizedDatum}T${zeit || '00:00:00'}`).getTime() || 0,
    stellplatz,
    messpunkt: parseInt(getValue('messpunkt')) || 0,
    messpunktName: getValue('messpunktName') || '',
    tour: getValue('tour') || '',
    dispogebiet: getValue('dispogebiet') || '',
    ausgangsrelation: getValue('ausgangsrelation') || '',
    sendungen,
    colli,
    gewicht: parseFloat(getValue('gewicht')) || 0,
    ladezeit: parseFloat(getValue('ladezeit')) || undefined,
    palette: parseFloat(getValue('palette')) || undefined,
    volumen: parseFloat(getValue('volumen')) || undefined,
    lademeter: parseFloat(getValue('lademeter')) || undefined,
    fahrzeugtyp: getValue('fahrzeugtyp') || undefined,
    kundenname: getValue('kundenname') || undefined,
  };
}

/**
 * Vollständiger CSV-Import mit Profil-Erkennung.
 */
export function parseCsvMitProfil(
  text: string,
  profil?: Spaltenzuordnung
): { records: ScandatenRecord[]; erkanntesProfil: Spaltenzuordnung | null; headers: string[] } {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { records: [], erkanntesProfil: null, headers: [] };

  // Delimiter erkennen (meistens ; aber manchmal , oder \t)
  const firstLine = lines[0];
  const delimiter = profil?.delimiter ||
    (firstLine.includes('\t') ? '\t' : firstLine.split(';').length > firstLine.split(',').length ? ';' : ',');

  const headers = firstLine.split(delimiter).map((h) => h.trim());
  const erkanntesProfil = profil || erkenneSpaltenprofil(headers);

  if (!erkanntesProfil) {
    return { records: [], erkanntesProfil: null, headers };
  }

  const records: ScandatenRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(delimiter);
    const record = parseZeileMitProfil(cols, headers, erkanntesProfil, i);
    if (record) records.push(record);
  }

  return { records, erkanntesProfil, headers };
}
