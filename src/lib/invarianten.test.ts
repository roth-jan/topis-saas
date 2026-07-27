// Fachliche Invarianten über die Rechenkette (Check → Wege → Prozessmodell → Kennzahlen).
// Diese Tests kodieren ROTH-Fachwahrheiten, damit „Logik kaputt/fehlt" NICHT durchrutscht —
// unabhängig davon, wie gut ein (LLM-)Tester den Fachhintergrund kennt.
// Beschluss 27.07.2026 (Reaktion auf Testbericht: stille Fallbacks + Volumen-Missverständnis).

import { describe, it, expect } from 'vitest';
import { berechneMinProColli } from './prozessrechner';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from './data/prozessmodell-se';
import { generateDemoRecords } from './eckdaten-analyse';
import type { ProzessParameter } from '@/types/prozessmodell';

const setP = (params: ProzessParameter[], id: string, val: number): ProzessParameter[] =>
  params.map((p) => (p.id === id ? { ...p, aktuellerWert: val } : p));

describe('Invariante — Volumen-Abhängigkeit (intensiv vs. extensiv)', () => {
  // Der Testbericht meldete „Colli/Tag ×2 ändert nichts" als Bug. Das ist FACHLICH KORREKT
  // für intensive Größen (pro Colli) und muss so bleiben — hier als Regression-Lock.
  it('Min/Colli ist volumenunabhängig: Colli/Tag 3500→7000 ändert Min/Colli NICHT', () => {
    const base = berechneMinProColli(PROZESSMODELL_SE, setP(SE_STANDARD_PARAMETER, 'colliProTag', 3500));
    const dbl = berechneMinProColli(PROZESSMODELL_SE, setP(SE_STANDARD_PARAMETER, 'colliProTag', 7000));
    expect(dbl.minProColli).toBeCloseTo(base.minProColli, 6);
  });

  // Die volumen-SENSITIVE Größe (Gesamt-MA-Stundenbedarf) MUSS dagegen exakt linear skalieren.
  // Wenn die irgendwann NICHT mehr skaliert, ist die Personalbedarfs-Rechnung kaputt.
  it('MA-Stundenbedarf ist EXAKT linear in Colli/Tag: f(2×) == 2×f()', () => {
    const base = berechneMinProColli(PROZESSMODELL_SE, setP(SE_STANDARD_PARAMETER, 'colliProTag', 3500));
    const dbl = berechneMinProColli(PROZESSMODELL_SE, setP(SE_STANDARD_PARAMETER, 'colliProTag', 7000));
    expect(base.maStundenBedarf).toBeGreaterThan(0);
    expect(dbl.maStundenBedarf).toBeCloseTo(base.maStundenBedarf * 2, 4);
  });
});

describe('Invariante — Verteilweg-Kopplung ist verdrahtet', () => {
  // Wenn der Verteilweg keinen Effekt auf Min/Colli hätte, wäre die Layout→Prozessmodell-
  // Pipeline tot (genau das „Übernehmen bewirkt nichts"-Symptom auf Formel-Ebene).
  it('längerer Verteilweg → höheres Min/Colli', () => {
    const kurz = berechneMinProColli(PROZESSMODELL_SE, setP(SE_STANDARD_PARAMETER, 'verteilweg', 50));
    const lang = berechneMinProColli(PROZESSMODELL_SE, setP(SE_STANDARD_PARAMETER, 'verteilweg', 250));
    expect(lang.minProColli).toBeGreaterThan(kurz.minProColli);
  });
});

describe('Invariante — Demo-Datenkonsistenz', () => {
  // Der Testbericht meldete „10.350 Datensätze / 5 Tage passen nicht zu ~4.000 Colli/Tag".
  // Datensätze = Scans (mehrere Colli je Scan). Die relevante Invariante: die tatsächlich
  // erzeugte Colli-Menge muss zur beworbenen Colli/Tag-Zahl passen.
  it('Σ Demo-Colli / Arbeitstage ≈ beworbene Colli/Tag (±10 %)', () => {
    const { records, eckdaten } = generateDemoRecords();
    const tage = new Set(records.map((r) => r.scandatum)).size;
    expect(tage).toBeGreaterThan(0);
    const summeColli = records.reduce((a, r) => a + r.colli, 0);
    const colliProTag = summeColli / tage;
    const abweichung = Math.abs(colliProTag - eckdaten.colliProTag) / eckdaten.colliProTag;
    expect(abweichung).toBeLessThan(0.1);
  });

  it('Ein Demo-Record ist ein Scan mit ≥1 Colli (Datensätze ≠ Colli)', () => {
    const { records } = generateDemoRecords();
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((r) => r.colli >= 1)).toBe(true);
    const summeColli = records.reduce((a, r) => a + r.colli, 0);
    // Es gibt mehr Colli als Records (sonst wäre „Datensatz == Colli" und die Verwirrung berechtigt).
    expect(summeColli).toBeGreaterThan(records.length);
  });
});
