'use client';

import { useState, useEffect } from 'react';
import { useTopisStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { OBJECT_DEFAULTS, ObjectType } from '@/types/topis';
import { deriveWalls, torBoxFromAnchor } from '@/lib/wall-anchor';

// Wand-relative Platzierung (Lastenheft 3.1.2: Tore „Wand wählen + Abstand zu
// Eckpunkt S"). wallIndex-Konvention identisch zu deriveWalls: 0 Nord, 1 Ost,
// 2 Süd, 3 West.
const WAND_OPTIONEN = [
  { value: '0', label: 'Nord (oben)' },
  { value: '1', label: 'Ost (rechts)' },
  { value: '2', label: 'Süd (unten)' },
  { value: '3', label: 'West (links)' },
];

// Lastenheft 3.1.2 — Nummerierungs-Schemata für Mehrfach-Insert
type NummernSchema = '1' | 'A1' | '1A' | 'A';

function generateLabel(schema: NummernSchema, prefix: string, startNum: number, i: number, defaultsName: string): string {
  const idx = startNum + i;
  if (schema === '1') {
    return prefix ? `${prefix}${idx}` : `${defaultsName} ${idx}`;
  }
  if (schema === 'A') {
    // A, B, C, ..., Z, AA, AB, ...
    return prefix + numberToAlpha(idx - 1);
  }
  if (schema === 'A1') {
    // A1, A2, A3 — Buchstabe konstant aus prefix (oder A wenn leer), Zahl läuft
    const letter = prefix || 'A';
    return `${letter}${idx}`;
  }
  if (schema === '1A') {
    // 1A, 1B, 1C — Zahl konstant aus prefix (oder 1 wenn leer), Buchstabe läuft
    const num = prefix || '1';
    return `${num}${numberToAlpha(i)}`;
  }
  return `${defaultsName} ${idx}`;
}

function numberToAlpha(n: number): string {
  let s = '';
  let x = n;
  do {
    s = String.fromCharCode(65 + (x % 26)) + s;
    x = Math.floor(x / 26) - 1;
  } while (x >= 0);
  return s;
}

export function MultiInsertDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [objectType, setObjectType] = useState<ObjectType>('tor');
  // Niko-Wunsch 02.06.: Breite/Tiefe vorab für ALLE Objekte setzen, statt jedes
  // Tor einzeln nachzupflegen. Default aus dem Objekttyp, beim Typwechsel neu.
  const [width, setWidth] = useState(OBJECT_DEFAULTS['tor'].width);
  const [height, setHeight] = useState(OBJECT_DEFAULTS['tor'].height);
  const [count, setCount] = useState(5);
  const [spacing, setSpacing] = useState(5);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [prefix, setPrefix] = useState('');
  const [startNum, setStartNum] = useState(1);
  // Lastenheft 3.1.2 — Nummerierungs-Schema
  const [schema, setSchema] = useState<NummernSchema>('1');
  // Wand-relative Platzierung für Tore (Default an): Wand wählen + Startabstand
  // vom Eckpunkt S, statt absoluter X/Y-Koordinaten.
  const [wandModus, setWandModus] = useState(true);
  const [wandIndex, setWandIndex] = useState(0);
  const [startAbstand, setStartAbstand] = useState(5);

  const addObject = useTopisStore((s) => s.addObject);
  const hall = useTopisStore((s) => s.halls[0]);

  // Beim Typwechsel Breite/Tiefe auf die Default-Maße des neuen Typs setzen.
  useEffect(() => {
    const d = OBJECT_DEFAULTS[objectType];
    if (d) { setWidth(d.width); setHeight(d.height); }
  }, [objectType]);

  const handleInsert = () => {
    if (count < 1 || count > 100) {
      toast.error('Anzahl muss zwischen 1 und 100 liegen');
      return;
    }

    const defaults = OBJECT_DEFAULTS[objectType];
    if (!defaults) {
      toast.error('Unbekannter Objekttyp');
      return;
    }

    const w = width > 0 ? width : defaults.width;
    const h = height > 0 ? height : defaults.height;
    const useWand = objectType === 'tor' && wandModus;

    // Wand-relativer Modus: Tore entlang der gewählten Außenwand, beginnend bei
    // `startAbstand` vom Eckpunkt S, im Abstand `spacing`. Jedes Tor wird per
    // aussenwandRef fest verankert (Lastenheft 3.1.2).
    let walls: ReturnType<typeof deriveWalls> = [];
    let wallLength = 0;
    if (useWand) {
      walls = deriveWalls(hall ?? { width: 0, height: 0 });
      const wall = walls[wandIndex];
      if (!wall) {
        toast.error('Keine Halle/Außenwand vorhanden — erst eine Halle anlegen.');
        return;
      }
      wallLength = Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1);
    }

    let platziert = 0;
    let uebersprungen = 0;

    for (let i = 0; i < count; i++) {
      const name = generateLabel(schema, prefix, startNum, i, defaults.name);

      if (useWand) {
        const abstandS = startAbstand + i * spacing;
        if (abstandS > wallLength) {
          uebersprungen++;
          continue; // jenseits der Wandlänge — nicht platzierbar
        }
        const anchor = { wallIndex: wandIndex, abstandS, abstandE: wallLength - abstandS };
        const box = torBoxFromAnchor(anchor, walls, w, h);
        if (!box) {
          uebersprungen++;
          continue;
        }
        addObject({
          type: 'tor',
          x: box.x,
          y: box.y,
          width: w,
          height: h,
          name,
          nummernSchema: schema,
          aussenwandRef: anchor,
          side: box.side ?? undefined,
        });
        platziert++;
      } else {
        const x = direction === 'horizontal' ? startX + i * spacing : startX;
        const y = direction === 'horizontal' ? startY : startY + i * spacing;
        addObject({
          type: objectType,
          x,
          y,
          width: w,
          height: h,
          name,
          nummernSchema: schema,
        });
        platziert++;
      }
    }

    const typeNames: Record<string, string> = {
      tor: 'Tore',
      stellplatz: 'Stellplätze',
      regal: 'Regale',
      leveller: 'Leveller',
      bereich: 'Bereiche',
    };
    const label = typeNames[objectType] || 'Objekte';

    if (platziert === 0) {
      toast.error(`Kein Tor platziert — Startabstand (${startAbstand} m) liegt jenseits der Wandlänge (${wallLength.toFixed(1)} m).`);
      return;
    }
    toast.success(
      uebersprungen > 0
        ? `${platziert} ${label} eingefügt (${uebersprungen} außerhalb der Wand übersprungen).`
        : `${platziert} ${label} eingefügt!`,
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Multi-Insert</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mehrfach-Einfügen</DialogTitle>
          <DialogDescription>
            Füge mehrere Objekte auf einmal ein.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Object Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Typ</Label>
            <Select value={objectType} onValueChange={(v) => setObjectType(v as ObjectType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tor">Tor</SelectItem>
                <SelectItem value="stellplatz">Stellplatz</SelectItem>
                <SelectItem value="regal">Regal</SelectItem>
                <SelectItem value="leveller">Leveller</SelectItem>
                <SelectItem value="bereich">Bereich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Größe — Niko-Wunsch: für alle Objekte vorab */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Breite (m)</Label>
            <Input
              type="number"
              min={0.1}
              step={0.5}
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tiefe (m)</Label>
            <Input
              type="number"
              min={0.1}
              step={0.5}
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>

          {/* Count */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Anzahl</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="col-span-3"
            />
          </div>

          {/* Spacing */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Abstand (m)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={spacing}
              onChange={(e) => setSpacing(parseFloat(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>

          {/* Platzierung — Tore wand-relativ (Lastenheft 3.1.2) */}
          {objectType === 'tor' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Platzierung</Label>
              <Select value={wandModus ? 'wand' : 'frei'} onValueChange={(v) => setWandModus(v === 'wand')}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wand">An Außenwand</SelectItem>
                  <SelectItem value="frei">Frei (X/Y)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {objectType === 'tor' && wandModus ? (
            <>
              {/* Wand-relativ: Wand wählen + Startabstand vom Eckpunkt S */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Wand</Label>
                <Select value={String(wandIndex)} onValueChange={(v) => setWandIndex(parseInt(v))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WAND_OPTIONEN.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Startabstand (m)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={startAbstand}
                  onChange={(e) => setStartAbstand(parseFloat(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
            </>
          ) : (
            <>
              {/* Freie Platzierung über absolute Koordinaten */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Start X (m)</Label>
                <Input
                  type="number"
                  min={0}
                  max={hall?.width || 200}
                  value={startX}
                  onChange={(e) => setStartX(parseFloat(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Start Y (m)</Label>
                <Input
                  type="number"
                  min={0}
                  max={hall?.height || 100}
                  value={startY}
                  onChange={(e) => setStartY(parseFloat(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Richtung</Label>
                <Select value={direction} onValueChange={(v) => setDirection(v as 'horizontal' | 'vertical')}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal →</SelectItem>
                    <SelectItem value="vertical">Vertikal ↓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Naming */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Prefix</Label>
            <Input
              type="text"
              placeholder="z.B. T, SP, R"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start-Nr.</Label>
            <Input
              type="number"
              min={1}
              value={startNum}
              onChange={(e) => setStartNum(parseInt(e.target.value) || 1)}
              className="col-span-3"
            />
          </div>

          {/* Lastenheft 3.1.2 — Nummerierungs-Schema */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Schema</Label>
            <Select value={schema} onValueChange={(v) => setSchema(v as NummernSchema)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1, 2, 3, … (numerisch)</SelectItem>
                <SelectItem value="A1">A1, A2, A3, … (Prefix-Zahl)</SelectItem>
                <SelectItem value="1A">1A, 1B, 1C, … (Zahl-Buchstabe)</SelectItem>
                <SelectItem value="A">A, B, C, …, Z, AA, … (alphabetisch)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleInsert}>
            <Copy className="h-4 w-4 mr-2" />
            {count} Objekte einfügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
