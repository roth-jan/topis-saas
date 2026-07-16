import { describe, it, expect } from 'vitest';
import { erzeugeModellAusVorlage, erzeugeLeeresModell } from './prozessmodell-vorlagen';
import { rechneNativesModell, listeMonatsEingaben, neuerMonatAusEingaben, setzeSchrittFeld, setzeKnotenWert, hatWertAenderung } from './prozessmodell-nativ';
import { berechneMinProColli } from './prozessrechner';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from './data/prozessmodell-se';
import { PROZESSMODELL_SA, SA_STANDARD_PARAMETER } from './data/prozessmodell-sa';

const ECK = { monat: '07/2026', colliProMonat: 315000, arbeitstage: 21 }; // 15.000 Colli/Tag

describe('ROTH-Vorlagen → natives Modell (Gate gegen den alten kalibrierten Rechner)', () => {
  it('SE-Vorlage rechnet exakt wie berechneMinProColli (Δ < 1e-9)', () => {
    const alt = berechneMinProColli(PROZESSMODELL_SE, SE_STANDARD_PARAMETER);
    const nativ = erzeugeModellAusVorlage('se', ECK);
    const erg = rechneNativesModell(nativ);
    expect(erg.warnungen).toEqual([]);
    expect(erg.modell.bloecke[0].minProColli).toBeCloseTo(alt.minProColli, 9);
    // Abteilungs-Split identisch
    for (const abt of alt.abteilungen) {
      expect(erg.modell.bloecke[0].proAbteilung[abt.label]).toBeCloseTo(abt.minProColli, 9);
    }
    // MA-Stunden: alt rechnet je TAG, nativ je MONAT → Faktor Arbeitstage
    expect(erg.modell.maStundenProzesse).toBeCloseTo(alt.maStundenBedarf * ECK.arbeitstage, 6);
  });

  it('SA-Vorlage rechnet exakt wie der alte Rechner', () => {
    const alt = berechneMinProColli(PROZESSMODELL_SA, SA_STANDARD_PARAMETER);
    const eck = { ...ECK, colliProMonat: 12000 * 21 };
    const erg = rechneNativesModell(erzeugeModellAusVorlage('sa', eck));
    expect(erg.warnungen).toEqual([]);
    expect(erg.modell.bloecke[0].minProColli).toBeCloseTo(alt.minProColli, 9);
  });

  it('SE+SA kombiniert: zwei Blöcke, zwei Sektionen', () => {
    const erg = rechneNativesModell(erzeugeModellAusVorlage('se_sa', ECK));
    expect(erg.modell.bloecke).toHaveLength(2);
    expect(erg.modell.uebersicht.map((s) => s.titel)).toEqual(['Sammelguteingang', 'Sammelgutausgang']);
  });

  it('Eckdaten wirken: eigener Verteilweg verändert nur den Wege-Anteil', () => {
    const kurz = rechneNativesModell(erzeugeModellAusVorlage('se', { ...ECK, verteilwegM: 50 })).modell;
    const lang = rechneNativesModell(erzeugeModellAusVorlage('se', { ...ECK, verteilwegM: 200 })).modell;
    expect(lang.bloecke[0].minProColli).toBeGreaterThan(kurz.bloecke[0].minProColli);
    expect(lang.bloecke[0].proAbteilung['Scanner']).toBeCloseTo(kurz.bloecke[0].proAbteilung['Scanner'], 9);
  });

  it('Vorlage ist danach frei editierbar (Schritt-Zeit ändern)', () => {
    let m = erzeugeModellAusVorlage('se', ECK);
    const s = m.bloecke[0].schritte.find((x) => x.name.includes('Tor öffnen'))!;
    const vorher = rechneNativesModell(m).modell.bloecke[0].minProColli;
    m = setzeSchrittFeld(m, s.id, 'standardSek', 150);
    expect(rechneNativesModell(m).modell.bloecke[0].minProColli).toBeGreaterThan(vorher);
  });
});

describe('hatWertAenderung — dirty auch ohne Excel-Herkunft (Review-Fund #22)', () => {
  it('erkennt Wertänderung in einem Vorlagen-Modell (Knoten ohne origin)', () => {
    const basis = erzeugeModellAusVorlage('se', ECK);
    expect(hatWertAenderung(basis, basis)).toBe(false);
    const colli = listeMonatsEingaben(basis)[0];
    const geaendert = setzeKnotenWert(basis, colli.knotenIds[0], basis.knoten.find((k) => k.id === colli.knotenIds[0])!.wert! + 1000);
    expect(hatWertAenderung(geaendert, basis)).toBe(true);
  });
});

describe('Leeres Modell', () => {
  it('rechnet ohne Warnungen und ist bearbeitbar', () => {
    let m = erzeugeLeeresModell('07/2026');
    const erg = rechneNativesModell(m);
    expect(erg.warnungen).toEqual([]);
    expect(erg.modell.bloecke[0].minProColli).toBe(0); // noch keine Zeiten
    m = setzeSchrittFeld(m, '_v0', 'standardSek', 60);
    expect(rechneNativesModell(m).modell.bloecke[0].minProColli).toBeCloseTo(1, 9);
  });
});

describe('Monats-Rhythmus (Mengen-Formular)', () => {
  it('listet die monatlichen Eingaben (Mengen, keine Zeitaufnahme-Parameter)', () => {
    const m = erzeugeModellAusVorlage('se', ECK);
    const eingaben = listeMonatsEingaben(m);
    expect(eingaben.map((e) => e.name)).toContain('Colli je Monat');
    expect(eingaben.map((e) => e.name)).not.toContain('ø Verteilweg');
  });

  it('SE+SA: gleichnamige Mengen werden mit Blockname disambiguiert (Review-Fund #13)', () => {
    const m = erzeugeModellAusVorlage('se_sa', ECK);
    const eingaben = listeMonatsEingaben(m);
    const colliFelder = eingaben.filter((e) => e.name.includes('Colli je Monat'));
    expect(colliFelder).toHaveLength(2);
    // Nicht mehr identisch beschriftet:
    expect(new Set(colliFelder.map((e) => e.name)).size).toBe(2);
    expect(colliFelder.some((e) => e.name.startsWith('SE'))).toBe(true);
    expect(colliFelder.some((e) => e.name.startsWith('SA'))).toBe(true);
  });

  it('neuer Monat übernimmt Struktur + Parameter, ersetzt Mengen/Monat/Arbeitstage', () => {
    const juni = erzeugeModellAusVorlage('se', ECK);
    const eingaben = listeMonatsEingaben(juni);
    const juli = neuerMonatAusEingaben(juni, '08/2026', 22, [
      { knotenIds: eingaben[0].knotenIds, wert: 350000 },
    ]);
    expect(juli.monat).toBe('08/2026');
    expect(juli.arbeitstage).toBe(22);
    const ergJuni = rechneNativesModell(juni).modell;
    const ergJuli = rechneNativesModell(juli).modell;
    // Mehr Colli → mehr MA-Stunden; Struktur unverändert
    expect(ergJuli.maStundenProzesse).toBeGreaterThan(ergJuni.maStundenProzesse);
    expect(ergJuli.bloecke[0].schritte).toHaveLength(ergJuni.bloecke[0].schritte.length);
    // Juni-Objekt unangetastet (immutable)
    expect(juni.monat).toBe('07/2026');
  });
});
