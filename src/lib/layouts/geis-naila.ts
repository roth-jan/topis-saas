// Geis Naila - Bischoff International GmbH, Naila (IDS-Kooperation)
// Reale Daten aus ROTH-Beratungsprojekt Oktober 2013
// Haupthalle 121×45m + Anbau 45×34m = 6.975 qm, L-Shape
// Unterflurförderkette im Haupthalle
// SE: 60.331 Colli (national + Import), SA: 83.870 Colli

import { TopisObject, OBJECT_COLORS } from '@/types/topis';
import type { ProjektVorlage } from '@/types/projekt';

// Naila-Kennzahlen (Oktober 2013, 22 Arbeitstage)
export const NAILA_KENNZAHLEN = {
  arbeitstage: 22,
  // SE
  se_national_sdg: 22699,
  se_national_colli: 43298,
  se_import_sdg: 3418,
  se_import_colli: 17033,
  se_colli_gesamt: 60331,
  se_colli_tag: 2742, // 60331 / 22
  se_gefaesse: 2201,
  // SA
  sa_nv_kfp_colli: 28102,
  sa_nv_grfu_colli: 16098,
  sa_fv_nat_colli: 70154,
  sa_fv_export_colli: 13716,
  sa_colli_gesamt: 128070,
  // Prozesszeiten
  se_entladung_nat_minColli: 3.44,
  se_entladung_imp_minColli: 3.36,
  se_beladung_kfp_minColli: 0.18,
  se_beladung_grfu_minColli: 3.04,
  sa_entladung_kfp_minColli: 3.21,
  sa_entladung_grfu_minColli: 2.73,
  sa_beladung_fv_minColli: 1.09,
  sa_beladung_export_minColli: 1.77,
  // Verteilwege (gewichtet)
  verteilweg_se_kette_m: 142.2,
  verteilweg_se_anbau_m: 75.4,
  verteilweg_sa_anbau_m: 77.3,
  verteilweg_sa_stapler_kfp_m: 138.6,
  verteilweg_sa_stapler_traeger_m: 112.8,
  verteilweg_grfu_bereitstellung_m: 170.8,
  // Equipment
  stapler_geschwindigkeit: 1.577, // m/s (gemessen)
  ameise_geschwindigkeit: 0.990, // m/s (gemessen)
  kette_geschwindigkeit: 0.403, // m/s (gemessen)
  fuss_geschwindigkeit: 0.7, // m/s
  // Arbeitszeit
  arbeitsmin_pro_stunde: 52.2,
  colli_pro_ma_stunde_se: 22.5,
  fte_gesamt: 87.9,
};

// Wege-Daten: Relation → { wegM, colli } (Top-Relationen SE-Verteilung)
export const NAILA_WEGE_SE: { relation: string; wegM: number; colli: number }[] = [
  // Ketten-Verteilung (Einschleuser → Ausschleuser → Relationsplatz)
  { relation: '9011', wegM: 56.8, colli: 597 },
  { relation: '9012', wegM: 56.8, colli: 419 },
  { relation: '9013', wegM: 56.8, colli: 275 },
  { relation: '9021', wegM: 56.8, colli: 730 },
  { relation: '9041', wegM: 140.0, colli: 470 },
  { relation: '9042', wegM: 140.0, colli: 453 },
  { relation: '9051', wegM: 121.0, colli: 402 },
  { relation: '9052', wegM: 121.0, colli: 429 },
  { relation: '9061', wegM: 134.0, colli: 527 },
  { relation: '9062', wegM: 134.0, colli: 95 },
  { relation: '9071', wegM: 71.8, colli: 798 },
  { relation: '9081', wegM: 122.0, colli: 527 },
  { relation: '9082', wegM: 122.0, colli: 614 },
  { relation: '9091', wegM: 122.0, colli: 515 },
  { relation: '9092', wegM: 122.0, colli: 481 },
  { relation: '9093', wegM: 122.0, colli: 597 },
  { relation: '9101', wegM: 121.0, colli: 488 },
  { relation: '9102', wegM: 121.0, colli: 396 },
  { relation: '9103', wegM: 121.0, colli: 611 },
  { relation: '9121', wegM: 95.8, colli: 655 },
  { relation: '9122', wegM: 95.8, colli: 513 },
  { relation: '9123', wegM: 95.8, colli: 159 },
  { relation: '9124', wegM: 95.8, colli: 434 },
  { relation: '9125', wegM: 95.8, colli: 612 },
  { relation: '9126', wegM: 95.8, colli: 587 },
  { relation: '9131', wegM: 90.9, colli: 510 },
  { relation: '9132', wegM: 90.9, colli: 540 },
  { relation: '9141', wegM: 97.0, colli: 567 },
  { relation: '9142', wegM: 97.0, colli: 477 },
  { relation: '9143', wegM: 97.0, colli: 320 },
  { relation: '9144', wegM: 97.0, colli: 961 },
  { relation: '9145', wegM: 97.0, colli: 525 },
  { relation: '9182', wegM: 125.2, colli: 577 },
  { relation: '9181', wegM: 125.2, colli: 666 },
  { relation: '9191', wegM: 23.1, colli: 256 },
  { relation: '9192', wegM: 23.1, colli: 315 },
  { relation: '9193', wegM: 23.1, colli: 188 },
  { relation: '9201', wegM: 51.3, colli: 706 },
  { relation: '9202', wegM: 51.3, colli: 866 },
  { relation: '9203', wegM: 51.3, colli: 518 },
  { relation: '9204', wegM: 51.3, colli: 449 },
  { relation: '9205', wegM: 51.3, colli: 630 },
  { relation: '9211', wegM: 40.8, colli: 541 },
  { relation: '9212', wegM: 40.8, colli: 482 },
  { relation: '9213', wegM: 40.8, colli: 564 },
  { relation: '9221', wegM: 34.6, colli: 462 },
  { relation: '9222', wegM: 34.6, colli: 739 },
  { relation: '9231', wegM: 90.7, colli: 528 },
  { relation: '9232', wegM: 90.7, colli: 322 },
  { relation: '9241', wegM: 88.0, colli: 404 },
  { relation: '9242', wegM: 88.0, colli: 341 },
  { relation: '9251', wegM: 78.7, colli: 466 },
  { relation: '9261', wegM: 78.0, colli: 609 },
  { relation: '9271', wegM: 72.7, colli: 253 },
  { relation: '9272', wegM: 72.7, colli: 377 },
  { relation: '9273', wegM: 72.7, colli: 577 },
  { relation: '9274', wegM: 72.7, colli: 201 },
  { relation: '9281', wegM: 72.7, colli: 361 },
  { relation: '9282', wegM: 72.7, colli: 452 },
  { relation: '9283', wegM: 72.7, colli: 843 },
  { relation: '011', wegM: 29.3, colli: 8075 },
];

// Layout: L-Shape Halle mit Toren und Relationsplätzen
export function generateGeisNailaObjects(): Omit<TopisObject, 'id'>[] {
  const objects: Omit<TopisObject, 'id'>[] = [];

  // ============ HAUPTHALLE: 121m × 45m ============
  // Tore links (Westseite) — FV-Entladung SE (Tore 1-14, national + Import)
  const anzahlToreWest = 14;
  for (let i = 0; i < anzahlToreWest; i++) {
    objects.push({
      type: 'tor',
      x: 0,
      y: 3 + i * 8,
      width: 1.5,
      height: 3.5,
      name: `Tor ${i + 1}`,
      color: OBJECT_COLORS.tor,
      istEingang: true,
    });
  }

  // Tore rechts (Ostseite) — NV-Beladung SE + NV-Entladung SA (Tore 15-32)
  const anzahlToreOst = 18;
  for (let i = 0; i < anzahlToreOst; i++) {
    objects.push({
      type: 'tor',
      x: 119.5,
      y: 2 + i * 6.2,
      width: 1.5,
      height: 3.5,
      name: `Tor ${15 + i}`,
      color: OBJECT_COLORS.tor,
      istAusgang: i < 9, // Tore 15-23: NV-Beladung (SE-Ausgang)
      istEingang: i >= 9, // Tore 24-32: NV-Entladung (SA-Eingang)
    });
  }

  // ============ ANBAU: 45m × 34m (rechts unten an Haupthalle) ============
  // Tore Anbau Süd — FV-Beladung SA (Tore 33-40)
  const anzahlToreAnbauSued = 8;
  for (let i = 0; i < anzahlToreAnbauSued; i++) {
    objects.push({
      type: 'tor',
      x: 125 + i * 5.5,
      y: 77,
      width: 3.5,
      height: 1.5,
      name: `Tor ${33 + i}`,
      color: OBJECT_COLORS.tor,
      istAusgang: true,
    });
  }

  // ============ UNTERFLURFÖRDERKETTE (zentral in Haupthalle) ============
  objects.push({
    type: 'bereich',
    x: 20,
    y: 20,
    width: 95,
    height: 3,
    name: 'Unterflurförderkette',
    color: '#ef4444',
  });

  // ============ ENTLADEBEREICHE (hinter FV-Toren West) ============
  objects.push({
    type: 'entladebereich',
    x: 3,
    y: 3,
    width: 15,
    height: 35,
    name: 'Entladebereich FV',
    color: OBJECT_COLORS.entladebereich,
  });

  // ============ RELATIONSPLÄTZE SE (Haupthalle, beiderseits der Kette) ============
  // Nordseite der Kette (Relationen 9011-9093)
  const relNord = [
    { name: 'Rel 901', x: 22, y: 5, w: 12, h: 12 },
    { name: 'Rel 906', x: 36, y: 5, w: 12, h: 12 },
    { name: 'Rel 908', x: 50, y: 5, w: 12, h: 12 },
    { name: 'Rel 910', x: 64, y: 5, w: 12, h: 12 },
    { name: 'Rel 912', x: 78, y: 5, w: 12, h: 12 },
    { name: 'Rel 914', x: 92, y: 5, w: 12, h: 12 },
  ];

  // Südseite der Kette (Relationen 9131-9283)
  const relSued = [
    { name: 'Rel 919', x: 22, y: 26, w: 10, h: 8 },
    { name: 'Rel 920', x: 34, y: 26, w: 14, h: 8 },
    { name: 'Rel 921', x: 50, y: 26, w: 10, h: 8 },
    { name: 'Rel 922', x: 62, y: 26, w: 10, h: 8 },
    { name: 'Rel 923', x: 74, y: 26, w: 10, h: 8 },
    { name: 'Rel 925', x: 86, y: 26, w: 10, h: 8 },
    { name: 'Rel 927', x: 98, y: 26, w: 10, h: 8 },
  ];

  [...relNord, ...relSued].forEach((r) => {
    objects.push({
      type: 'stellplatz',
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      name: r.name,
      color: OBJECT_COLORS.stellplatz,
    });
  });

  // ============ RELATIONSPLÄTZE SA (Anbau) ============
  // SA-Relationen im Anbau (manuell + Stapler)
  const relAnbau = [
    { name: 'Rel 10', x: 122, y: 48, w: 8, h: 6 },
    { name: 'Rel 60', x: 132, y: 48, w: 8, h: 6 },
    { name: 'Rel 300', x: 142, y: 48, w: 8, h: 6 },
    { name: 'Rel 490', x: 152, y: 48, w: 8, h: 6 },
    { name: 'Rel 680', x: 122, y: 56, w: 8, h: 6 },
    { name: 'Rel 770', x: 132, y: 56, w: 8, h: 6 },
    { name: 'Rel 990', x: 142, y: 56, w: 8, h: 6 },
    { name: 'Rel 971', x: 152, y: 56, w: 8, h: 6 },
    { name: 'Rel X941', x: 122, y: 64, w: 10, h: 6 },
    { name: 'Rel X973', x: 134, y: 64, w: 10, h: 6 },
    { name: 'Rel X416', x: 146, y: 64, w: 10, h: 6 },
  ];

  relAnbau.forEach((r) => {
    objects.push({
      type: 'stellplatz',
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      name: r.name,
      color: '#60a5fa', // Blauer Ton für SA
    });
  });

  // ============ KUNDENBEREICHE (Spezialgut) ============
  const kunden = [
    { name: 'Rehau', color: '#dc2626', x: 22, y: 37, w: 12, h: 5 },
    { name: 'Ghost', color: '#059669', x: 36, y: 37, w: 12, h: 5 },
    { name: 'Nokian', color: '#d97706', x: 50, y: 37, w: 12, h: 5 },
    { name: 'Hartan', color: '#7c3aed', x: 64, y: 37, w: 12, h: 5 },
    { name: 'TWL', color: '#0284c7', x: 78, y: 37, w: 10, h: 5 },
    { name: 'Müller', color: '#be185d', x: 90, y: 37, w: 10, h: 5 },
    { name: 'Austria', color: '#4f46e5', x: 102, y: 37, w: 10, h: 5 },
  ];

  kunden.forEach((k) => {
    objects.push({
      type: 'bereich',
      x: k.x,
      y: k.y,
      width: k.w,
      height: k.h,
      name: k.name,
      color: k.color,
    });
  });

  // ============ INFRASTRUKTUR ============
  // Büro / Leitstand
  objects.push({
    type: 'buero',
    x: 108,
    y: 3,
    width: 8,
    height: 6,
    name: 'Leitstand',
    color: OBJECT_COLORS.buero,
  });

  // Platz 011 (Sammelplatz neben Entladung)
  objects.push({
    type: 'klaerplatz',
    x: 3,
    y: 38,
    width: 15,
    height: 4,
    name: 'Platz 011',
    color: '#f59e0b',
  });

  // ÜZ-Platz (Überzähligkeiten)
  objects.push({
    type: 'sperrplatz',
    x: 108,
    y: 11,
    width: 8,
    height: 4,
    name: 'ÜZ-Platz',
    color: '#ef4444',
  });

  // Ladestation
  objects.push({
    type: 'ladestation',
    x: 108,
    y: 17,
    width: 4,
    height: 3,
    name: 'Ladestation',
    color: OBJECT_COLORS.ladestation,
  });

  return objects;
}

/**
 * Geis Naila als ProjektVorlage.
 */
export const PROJEKT_NAILA: ProjektVorlage = {
  id: 'geis_naila',
  name: 'Geis (Bischoff)',
  standort: 'Naila',
  jahr: 2013,
  beschreibung: 'L-Shape 121×45m + 45×34m, Unterflurförderkette, Ameise-Verteilung',
  hall: { width: 165, height: 80, name: 'Geis Naila', color: '#1a1a2e' },
  objects: generateGeisNailaObjects(),
  prozessmodell: 'se_standard',
  parameterOverrides: {
    colliProTag: 2742,
    verteilweg: 142.2,
    schnellaeuferGeschwindigkeit: 0.990,
    colliProFahrt: 2.0,
    arbeitsminProStunde: 52.2,
    staplerGeschwindigkeit: 1.577,
  },
  referenz: {
    minProColli: 3.44,
    colliProMAStd: 22.5,
    fte: 87.9,
    quelle: 'Excel-Analyse Oktober 2013 (31 Schritte)',
  },
};

// Generiere Scandaten-CSV für TOPIS-Import
// Format: scandatum;scanzeit;messpunkt;messpunktname;tour;dispogebiet;sendungen;colli;gewicht;ladezeit
export function generateNailaScandatenCSV(): string {
  const header = 'scandatum;scanzeit;messpunkt;messpunktname;tour;dispogebiet;sendungen;colli;gewicht;ladezeit';
  const lines: string[] = [header];

  // 22 Arbeitstage Oktober 2013, verteile Colli auf Tage
  const tage = 22;

  // SE-Relationen (Eingang FV national) — verteile auf Tore 1-14
  NAILA_WEGE_SE.forEach((rel) => {
    const colliProTag = Math.round(rel.colli / tage);
    if (colliProTag === 0) return;

    // Verteile auf Tage
    for (let tag = 1; tag <= tage; tag++) {
      const datum = `2013-10-${String(tag).padStart(2, '0')}`;
      // Zufällige Variation ±20%
      const variation = 0.8 + Math.random() * 0.4;
      const tagesColli = Math.round(colliProTag * variation);
      const tagesSdg = Math.round(tagesColli / 1.9); // Colli/Sdg national = 1.91
      const tagesGewicht = Math.round(tagesColli * 25); // ~25kg/Colli geschätzt
      const torNr = Math.floor(Math.random() * 14) + 1;

      lines.push(
        `${datum};08:${String(Math.floor(Math.random() * 60)).padStart(2, '0')};Tor ${torNr};Tor ${torNr};${rel.relation};SE-Naila;${tagesSdg};${tagesColli};${tagesGewicht};0`
      );
    }
  });

  return lines.join('\n');
}
