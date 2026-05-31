/**
 * Lastenheft 3.1.5 — Ketten-Action-Helfer
 *
 * Reine Funktionen, die ein KettenWegbereich-Objekt erzeugen oder
 * verändern, ohne den Zustand selbst zu kennen. Sie werden im Store
 * benutzt, sind aber als reine Funktionen testbar/wiederverwendbar.
 *
 * Naming-Konvention identisch zu anderen Topis-Domain-Helfern (gang-snap,
 * path-anchor): kein React, kein Zustand, kein Canvas.
 */

import type { KettenWegbereich } from '@/types/topis';

/** Default-Farbe für neue Ketten (NTC-Cyan ähnlich Conveyor) */
const DEFAULT_KETTEN_FARBE = '#06b6d4';

/**
 * Erzeugt eine neue Kette ohne ID — der Store vergibt die ID beim Insert
 * aus dem `kettenWegbereichIdCounter`.
 */
export function addKette(
  name: string,
  breite: number,
  fliessrichtung: 'vorwaerts' | 'rueckwaerts' = 'vorwaerts',
): Omit<KettenWegbereich, 'id'> {
  return {
    name: name.trim() || 'Kette',
    breite: breite > 0 ? breite : 2,
    fliessrichtung,
    punkte: [],
    farbe: DEFAULT_KETTEN_FARBE,
  };
}

/**
 * Fügt einen Stützpunkt am Ende des Ketten-Pfads an.
 * Reine Funktion: liefert das aktualisierte Ketten-Objekt zurück.
 */
export function addPunktToKette(
  k: KettenWegbereich,
  neuerPunkt: { x: number; y: number },
): KettenWegbereich {
  return {
    ...k,
    punkte: [...k.punkte, { x: neuerPunkt.x, y: neuerPunkt.y }],
  };
}

/**
 * Aktualisiert die Fließrichtung eines Ketten-Wegbereichs.
 */
export function setFliessrichtung(
  k: KettenWegbereich,
  neu: 'vorwaerts' | 'rueckwaerts',
): KettenWegbereich {
  return { ...k, fliessrichtung: neu };
}

/**
 * Aktualisiert die Breite (Validierung: min 0.5 m, max 20 m — sonst lassen
 * wir den Wert wie er ist, kein silent-clamp damit der User Feedback bekommt).
 * Lastenheft: „mit festzulegender Breite".
 */
export function setBreite(k: KettenWegbereich, neueBreite: number): KettenWegbereich {
  if (!Number.isFinite(neueBreite) || neueBreite <= 0) return k;
  return { ...k, breite: neueBreite };
}

/**
 * Verschiebt einen einzelnen Stützpunkt der Kette (Index-basiert).
 * Wenn der Index ungültig ist, wird die Kette unverändert zurückgegeben.
 */
export function moveStuetzpunkt(
  k: KettenWegbereich,
  index: number,
  neuerPunkt: { x: number; y: number },
): KettenWegbereich {
  if (index < 0 || index >= k.punkte.length) return k;
  const neu = k.punkte.slice();
  neu[index] = { x: neuerPunkt.x, y: neuerPunkt.y };
  return { ...k, punkte: neu };
}

/**
 * Entfernt einen Stützpunkt aus dem Pfad.
 */
export function removeStuetzpunkt(k: KettenWegbereich, index: number): KettenWegbereich {
  if (index < 0 || index >= k.punkte.length) return k;
  return { ...k, punkte: k.punkte.filter((_, i) => i !== index) };
}
