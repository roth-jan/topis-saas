/**
 * Zentrales Fachbegriff-Glossar.
 *
 * Hintergrund: Jans Blindtest 21.07.2026 — „Fachbegriffe werden sehr früh
 * ungeklärt eingesetzt: A*, Colli, FTE, FFZ, Relationen, Verteilweg, IST/SOLL."
 * Für Logistikberater selbstverständlich, für Entscheider und Gelegenheits-
 * anwender nicht. Erklärungen leben hier an EINER Stelle, damit sie nicht in
 * zwanzig Komponenten auseinanderdriften.
 *
 * Verwendung: <Fachbegriff id="colli" /> aus components/ui/fachbegriff.tsx.
 */

export type GlossarEintrag = {
  /** Ausgeschrieben, falls es eine Abkürzung ist. */
  lang?: string;
  /** Eine Zeile, allgemeinverständlich — kein Fachjargon in der Erklärung selbst. */
  kurz: string;
};

export const GLOSSAR = {
  colli: {
    kurz: 'Einzelnes Packstück — Palette, Kiste oder Paket. Die Zähleinheit im Umschlag.',
  },
  fte: {
    lang: 'Full Time Equivalent (Vollzeitäquivalent)',
    kurz: 'Rechnerische Vollzeitkraft. Zwei Halbtagskräfte ergeben zusammen 1 FTE.',
  },
  ffz: {
    lang: 'Flurförderzeug',
    kurz: 'Fahrzeug für den innerbetrieblichen Transport — Gabelstapler, Hubwagen, Schlepper.',
  },
  verteilweg: {
    kurz: 'Durchschnittliche Strecke, die ein Packstück vom Tor bis zu seinem Platz zurücklegt (hin und zurück).',
  },
  relation: {
    kurz: 'Verbindung zwischen Versand- und Empfangsort — bestimmt, auf welchen Platz eine Sendung gehört.',
  },
  minProColli: {
    lang: 'Minuten je Colli',
    kurz: 'Arbeitszeit, die ein einzelnes Packstück im Umschlag kostet. Die zentrale Produktivitätskennzahl.',
  },
  istSoll: {
    kurz: 'IST = tatsächlich eingesetztes Personal, SOLL = rechnerisch nötiges. Die Lücke zeigt Über- oder Unterbesetzung.',
  },
  wegeberechnung: {
    kurz: 'TOPIS sucht automatisch den kürzesten Weg durch das Gangnetz — wie ein Navigationsgerät für die Halle.',
  },
  se: {
    lang: 'Stückgut-Eingang',
    kurz: 'Wareneingang: entladen, scannen, auf die Plätze verteilen.',
  },
  sa: {
    lang: 'Stückgut-Ausgang',
    kurz: 'Warenausgang: kommissionieren, beladen, verladen.',
  },
  batchFaktor: {
    lang: 'Colli je Fahrt',
    kurz: 'Wie viele Packstücke pro Fahrt mitgenommen werden. Teilt die Wegzeit auf mehrere Stück auf.',
  },
} as const satisfies Record<string, GlossarEintrag>;

export type GlossarId = keyof typeof GLOSSAR;
