/**
 * Herkunft des Verteilwegs (Tester-Fund 04.10.2026): Die Cockpit-Brücke bot
 * „Aus Ihrem Hallen-Layout berechnet: ø Verteilweg 176 m" an, obwohl der Wert
 * nur aus der Projektvorlage stammte — weil `quelle: 'layout'` hartkodiert in
 * den Vorlagen-Parametern stand. Nur eine echte Wegeberechnung (setVerteilweg)
 * darf den Wert als 'layout' markieren.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { useProzessmodellStore } from './prozessmodell-store';
import { layoutVerteilweg, migriereVerteilwegQuelle } from './verteilweg-quelle';
import { PROZESSMODELL_TEMPLATES, getTemplateParameter } from './data/prozessmodell-templates';
import { ladeProjektVorlage } from './projekt-vorlagen';
import { SE_STANDARD_PARAMETER } from './data/prozessmodell-se';
import { SA_STANDARD_PARAMETER } from './data/prozessmodell-sa';
import { GEIS_NUERNBERG_SE_PARAMETER } from './data/prozessmodell-geis-nuernberg';
import { NOERPEL_ULM_SE_PARAMETER } from './data/prozessmodell-noerpel-ulm';

describe('Vorlagen-Parameter tragen keine Layout-Herkunft', () => {
  it.each([
    ['SE', SE_STANDARD_PARAMETER],
    ['SA', SA_STANDARD_PARAMETER],
    ['Geis', GEIS_NUERNBERG_SE_PARAMETER],
    ['Nörpel', NOERPEL_ULM_SE_PARAMETER],
  ])('%s: verteilweg hat quelle eingabe', (_name, params) => {
    const p = params.find((x) => x.id === 'verteilweg');
    expect(p).toBeDefined();
    expect(p!.quelle).toBe('eingabe');
  });

  it('kein registriertes Template liefert einen Layout-Verteilweg', () => {
    for (const t of PROZESSMODELL_TEMPLATES) {
      expect(layoutVerteilweg(getTemplateParameter(t.modell.id))).toBeNull();
    }
  });
});

describe('Brücken-Bedingung im Store', () => {
  beforeEach(() => useProzessmodellStore.getState().reset());

  it('Startzustand: keine Layout-Herkunft', () => {
    expect(layoutVerteilweg(useProzessmodellStore.getState().parameter)).toBeNull();
  });

  it('Projektvorlage AS Gersthofen 2026 (Override 176 m) → Brücke schweigt', () => {
    expect(ladeProjektVorlage('as_gersthofen_2026')).toBeDefined();
    const params = useProzessmodellStore.getState().parameter;
    expect(params.find((p) => p.id === 'verteilweg')!.aktuellerWert).toBe(176);
    expect(layoutVerteilweg(params)).toBeNull();
  });

  it('updateParameter (Handeingabe) markiert nicht als Layout', () => {
    useProzessmodellStore.getState().updateParameter('verteilweg', 150);
    expect(layoutVerteilweg(useProzessmodellStore.getState().parameter)).toBeNull();
  });

  it('setVerteilweg (echte Wegeberechnung) → Brücke bietet den Wert an', () => {
    ladeProjektVorlage('as_gersthofen_2026');
    useProzessmodellStore.getState().setVerteilweg(142.3);
    expect(layoutVerteilweg(useProzessmodellStore.getState().parameter)).toBe(142.3);
  });

  it('Handeingabe nach echter Berechnung → Layout-Herkunft weg (Hand-Wert ist nicht „aus Layout")', () => {
    useProzessmodellStore.getState().setVerteilweg(142.3);
    useProzessmodellStore.getState().updateParameter('verteilweg', 160);
    const vw = useProzessmodellStore.getState().parameter.find((p) => p.id === 'verteilweg')!;
    expect(vw.aktuellerWert).toBe(160);
    expect(vw.quelle).toBe('eingabe');
    expect(layoutVerteilweg(useProzessmodellStore.getState().parameter)).toBeNull();
  });

  it('updateParameter lässt andere Herkünfte (z.B. scandaten) unangetastet', () => {
    useProzessmodellStore.getState().setColliProTag(4000);
    useProzessmodellStore.getState().updateParameter('colliProTag', 4100);
    expect(useProzessmodellStore.getState().parameter.find((p) => p.id === 'colliProTag')!.quelle).toBe('scandaten');
  });

  it('Vorlage nach echter Berechnung neu laden → Layout-Herkunft wieder weg', () => {
    useProzessmodellStore.getState().setVerteilweg(142.3);
    ladeProjektVorlage('as_gersthofen_2026');
    expect(layoutVerteilweg(useProzessmodellStore.getState().parameter)).toBeNull();
  });
});

describe('Persist-Migration topis-prozessmodell v1 → v2', () => {
  const v1Blob = () => ({
    modell: { id: 'se_standard' },
    parameter: [
      { id: 'colliProTag', aktuellerWert: 3970, quelle: 'scandaten' },
      { id: 'verteilweg', aktuellerWert: 176, standardwert: 138.8, quelle: 'layout' },
    ],
    ergebnis: null,
    ffzMix: [],
    datenHerkunft: { datenquelle: 'vorlage' },
  });

  it('pure Funktion: layout → eingabe, Wert und übrige Parameter bleiben', () => {
    const out = migriereVerteilwegQuelle(v1Blob()) as ReturnType<typeof v1Blob>;
    const vw = out.parameter.find((p) => p.id === 'verteilweg')!;
    expect(vw.quelle).toBe('eingabe');
    expect(vw.aktuellerWert).toBe(176);
    expect(vw.standardwert).toBe(138.8);
    expect(out.parameter.find((p) => p.id === 'colliProTag')!.quelle).toBe('scandaten');
    expect(out.datenHerkunft).toEqual({ datenquelle: 'vorlage' });
  });

  it('robust gegen fehlende/kaputte Daten', () => {
    expect(migriereVerteilwegQuelle(null)).toBeNull();
    expect(migriereVerteilwegQuelle({})).toEqual({});
    expect(migriereVerteilwegQuelle({ parameter: 'x' })).toEqual({ parameter: 'x' });
  });

  it('Store-Config: version 2, migrate greift für v0 und v1', () => {
    const opts = useProzessmodellStore.persist.getOptions();
    expect(opts.version).toBe(2);
    for (const from of [0, 1]) {
      const out = opts.migrate!(v1Blob(), from) as ReturnType<typeof v1Blob>;
      const vw = out.parameter.find((p) => p.id === 'verteilweg')!;
      expect(vw.quelle).toBe('eingabe');
      expect(vw.aktuellerWert).toBe(176);
    }
  });
});
