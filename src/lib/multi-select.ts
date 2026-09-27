/**
 * Mehrfachauswahl — Verteil-Logik (Michael Laufenburg, Tester-Feedback 27.09.2026).
 *
 * „Es wäre gut wenn man bspw. 20 Tore einfügen könnte und über eine ,alle markieren'
 * Funktion diese dann in den Eigenschaften auf eine gleiche Größe bringen und auch
 * verschieben könnte. — die Abstände zwischen den Toren lassen sich nur mühsam auf
 * Bauplanmaß bringen."
 *
 * Die Funktionen hier rechnen rein eindimensional auf einer Achse: für Tore ist das
 * der Abstand S entlang der Außenwand (Lastenheft 3.1.2), für freie Objekte die
 * x- bzw. y-Koordinate. Damit bleibt die Verteilung testbar, ohne Store und Canvas.
 */

/** Ein Element auf der Verteil-Achse: Position (führende Kante) + Ausdehnung. */
export interface VerteilItem {
  id: number;
  /** Führende Kante auf der Achse (m) — bei Toren der Abstand S zur Wand-Ecke. */
  pos: number;
  /** Ausdehnung entlang der Achse (m) — bei Toren die Torbreite. */
  size: number;
}

/** Neue Positionen je Objekt-ID. Nur tatsächlich veränderte Elemente sind enthalten. */
export type VerteilErgebnis = Map<number, number>;

const EPS = 1e-6;

/** Nach Achsposition sortierte Kopie — die Reihenfolge auf der Wand, nicht die Klickreihenfolge. */
function sortiert(items: VerteilItem[]): VerteilItem[] {
  return [...items].sort((a, b) => a.pos - b.pos);
}

function ergebnis(items: VerteilItem[], neuePos: number[]): VerteilErgebnis {
  const out: VerteilErgebnis = new Map();
  items.forEach((item, i) => {
    const p = neuePos[i];
    if (Math.abs(p - item.pos) > EPS) out.set(item.id, p);
  });
  return out;
}

/**
 * Gleichmäßig verteilen: erstes und letztes Element bleiben stehen, alle dazwischen
 * bekommen gleich große lichte Abstände. Das ist Michaels Notlösung („nach Anzahl der
 * Tore gegangen und gleichmäßig auf die Länge verteilt") — nur eben auf Knopfdruck.
 */
export function verteileGleichmaessig(items: VerteilItem[]): VerteilErgebnis {
  const s = sortiert(items);
  if (s.length < 3) return new Map();

  const first = s[0];
  const last = s[s.length - 1];
  const spanne = last.pos - (first.pos + first.size);
  const belegt = s.slice(1, -1).reduce((sum, i) => sum + i.size, 0);
  const luecke = (spanne - belegt) / (s.length - 1);

  const neuePos: number[] = [first.pos];
  let cursor = first.pos + first.size + luecke;
  for (let i = 1; i < s.length - 1; i++) {
    neuePos.push(cursor);
    cursor += s[i].size + luecke;
  }
  neuePos.push(last.pos);

  return ergebnis(s, neuePos);
}

/**
 * Fester Achsabstand (Mitte zu Mitte) ab dem ersten Element — das Bauplanmaß, mit dem
 * Torreihen bemaßt werden. Das erste Element bleibt als Fixpunkt stehen.
 */
export function verteileMitAchsabstand(items: VerteilItem[], achsabstandM: number): VerteilErgebnis {
  const s = sortiert(items);
  if (s.length < 2 || !(achsabstandM > 0)) return new Map();

  const ersteMitte = s[0].pos + s[0].size / 2;
  const neuePos = s.map((item, i) => ersteMitte + i * achsabstandM - item.size / 2);
  return ergebnis(s, neuePos);
}

/**
 * Fester lichter Abstand (Lücke zwischen den Kanten) ab dem ersten Element.
 * Bei unterschiedlich breiten Objekten das Gegenstück zum Achsmaß.
 */
export function verteileMitLuecke(items: VerteilItem[], lueckeM: number): VerteilErgebnis {
  const s = sortiert(items);
  if (s.length < 2 || !(lueckeM >= 0)) return new Map();

  const neuePos: number[] = [s[0].pos];
  let cursor = s[0].pos + s[0].size + lueckeM;
  for (let i = 1; i < s.length; i++) {
    neuePos.push(cursor);
    cursor += s[i].size + lueckeM;
  }
  return ergebnis(s, neuePos);
}

/**
 * Bündig ausrichten: alle Elemente auf dieselbe Achsposition ziehen.
 * `modus` bestimmt, woran ausgerichtet wird — führende Kante, Mitte oder hintere Kante.
 */
export function richteAus(items: VerteilItem[], modus: 'start' | 'mitte' | 'ende'): VerteilErgebnis {
  if (items.length < 2) return new Map();

  let ziel: number;
  if (modus === 'start') {
    ziel = Math.min(...items.map((i) => i.pos));
    return ergebnis(items, items.map(() => ziel));
  }
  if (modus === 'ende') {
    ziel = Math.max(...items.map((i) => i.pos + i.size));
    return ergebnis(items, items.map((i) => ziel - i.size));
  }
  ziel = items.reduce((sum, i) => sum + i.pos + i.size / 2, 0) / items.length;
  return ergebnis(items, items.map((i) => ziel - i.size / 2));
}

/**
 * Achse, entlang derer eine Auswahl verteilt werden soll: die mit der größeren Spannweite.
 * Eine Torreihe an der Nord-/Südwand spannt in x, eine an der Ost-/Westwand in y.
 */
export function dominanteAchse(
  boxes: { x: number; y: number; width: number; height: number }[],
): 'x' | 'y' {
  if (boxes.length < 2) return 'x';
  const spanX = Math.max(...boxes.map((b) => b.x + b.width)) - Math.min(...boxes.map((b) => b.x));
  const spanY = Math.max(...boxes.map((b) => b.y + b.height)) - Math.min(...boxes.map((b) => b.y));
  return spanX >= spanY ? 'x' : 'y';
}
