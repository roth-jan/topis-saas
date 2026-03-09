'use client';

import { useState } from 'react';
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

export function MultiInsertDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [objectType, setObjectType] = useState<ObjectType>('tor');
  const [count, setCount] = useState(5);
  const [spacing, setSpacing] = useState(5);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [prefix, setPrefix] = useState('');
  const [startNum, setStartNum] = useState(1);

  const addObject = useTopisStore((s) => s.addObject);
  const hall = useTopisStore((s) => s.halls[0]);

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

    for (let i = 0; i < count; i++) {
      let x: number, y: number;

      if (direction === 'horizontal') {
        x = startX + i * spacing;
        y = startY;
      } else {
        x = startX;
        y = startY + i * spacing;
      }

      const name = prefix ? `${prefix}${startNum + i}` : `${defaults.name} ${startNum + i}`;

      addObject({
        type: objectType,
        x,
        y,
        width: defaults.width,
        height: defaults.height,
        name,
      });
    }

    const typeNames: Record<string, string> = {
      tor: 'Tore',
      stellplatz: 'Stellplätze',
      regal: 'Regale',
      leveller: 'Leveller',
      bereich: 'Bereiche',
    };

    toast.success(`${count} ${typeNames[objectType] || 'Objekte'} eingefügt!`);
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

          {/* Start Position */}
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

          {/* Direction */}
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
