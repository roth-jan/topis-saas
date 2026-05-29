'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link2, Search, Wand2 } from 'lucide-react';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useTopisStore } from '@/lib/store';
import { toast } from 'sonner';
import type { RelationZuordnung } from '@/types/scandaten';

/**
 * Dialog zum Zuordnen von dispogebiet-Relationen (aus Scandaten) zu Bereich-
 * Objekten im Layout. Ohne diese Zuordnung kann der Weg pro Auftragszeile
 * nicht berechnet werden — die Tabelle zeigt dann nur die fixe Min/Colli-
 * Komponente.
 *
 * Auto-Match-Heuristik: Substring-Treffer auf beiden Seiten (case-insensitiv).
 * Manuelle Korrektur pro Zeile, Filter-Feld oben.
 */
export function RelationZuordnungDialog({ open, onOpenChange }: { open?: boolean; onOpenChange?: (o: boolean) => void } = {}) {
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = open ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;

  const relationZuordnungen = useBetriebsdatenStore((s) => s.relationZuordnungen);
  const setRelationZuordnungen = useBetriebsdatenStore((s) => s.setRelationZuordnungen);
  const objects = useTopisStore((s) => s.objects);
  const analyse = useBetriebsdatenStore((s) => s.analyse);

  const bereiche = useMemo(
    () =>
      objects
        .filter((o) => o.type === 'bereich' && o.name)
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [objects]
  );

  // Volumen pro Relation aus analyse — damit man weiß welche Zuordnungen wichtig sind
  const volumenPerRelation = useMemo(() => {
    const map = new Map<string, number>();
    if (!analyse) return map;
    // Wir haben in analyse.objektMetriken keine Relations-Breakdown.
    // Stattdessen müsste der Store das mitliefern. Für jetzt: Anzahl der
    // Records pro Relation aus scandatenRecords.
    return map;
  }, [analyse]);

  // Lokaler Edit-State während der Dialog offen ist
  const [edits, setEdits] = useState<Map<string, number | null>>(new Map());
  const [filter, setFilter] = useState('');

  // Beim Öffnen edits zurücksetzen
  function handleOpenChange(next: boolean) {
    if (next) setEdits(new Map());
    setOpen(next);
  }

  function setEdit(relationKey: string, objectId: number | null) {
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(relationKey, objectId);
      return next;
    });
  }

  function getCurrentObjectId(zuord: RelationZuordnung): number | null {
    return edits.has(zuord.relationKey) ? edits.get(zuord.relationKey)! : zuord.objectId;
  }

  const [autoMatchResult, setAutoMatchResult] = useState<{ matched: number; total: number } | null>(null);

  function autoMatch() {
    const next = new Map<string, number | null>();
    let matched = 0;
    for (const zuord of relationZuordnungen) {
      const lower = zuord.relationKey.toLowerCase();
      const match = bereiche.find((b) => {
        const bn = (b.name || '').toLowerCase();
        return bn.includes(lower) || lower.includes(bn);
      });
      if (match) {
        next.set(zuord.relationKey, match.id);
        matched += 1;
      }
    }
    setEdits(next);
    setAutoMatchResult({ matched, total: relationZuordnungen.length });
    if (matched === 0) {
      toast.warning(`Auto-Match: 0 Treffer von ${relationZuordnungen.length} Relationen`);
    } else {
      toast.success(`${matched} von ${relationZuordnungen.length} Relationen automatisch gemappt`);
    }
  }

  function save() {
    // Wenn Alex auf Save klickt ohne dass etwas zu speichern wäre, gab es
    // vorher keine Reaktion. Jetzt: explizite Bestätigung dass nichts zu
    // tun war.
    if (edits.size === 0) {
      const mapped = relationZuordnungen.filter((z) => z.objectId != null).length;
      toast.info(
        `Keine Änderungen zu speichern. Aktuell ${mapped} von ${relationZuordnungen.length} Relationen verknüpft.`
      );
      setOpen(false);
      return;
    }
    const updated = relationZuordnungen.map((z) => {
      if (!edits.has(z.relationKey)) return z;
      const newObjectId = edits.get(z.relationKey)!;
      const newObj = newObjectId != null ? bereiche.find((b) => b.id === newObjectId) : null;
      return {
        ...z,
        objectId: newObjectId,
        objectName: newObj?.name ?? z.relationKey,
      };
    });
    setRelationZuordnungen(updated);
    const mapped = updated.filter((z) => z.objectId != null).length;
    toast.success(`Gespeichert — ${mapped} von ${updated.length} Relationen mit Bereich verknüpft`);
    setOpen(false);
  }

  const filtered = relationZuordnungen.filter((z) =>
    !filter.trim() || z.relationKey.toLowerCase().includes(filter.trim().toLowerCase())
  );

  const currentMappedCount = relationZuordnungen.filter((z) => {
    const id = edits.has(z.relationKey) ? edits.get(z.relationKey)! : z.objectId;
    return id != null;
  }).length;

  const dialogContent = (
    <DialogContent className="max-w-3xl w-[min(900px,92vw)] h-[min(80vh,720px)] flex flex-col gap-3 p-4">
      <DialogHeader className="shrink-0">
        <DialogTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Relationen zu Bereichen zuordnen
        </DialogTitle>
        <DialogDescription>
          Verknüpft jede dispogebiet-Relation aus den Scandaten mit einem Bereich im Hallenlayout.
          Erst dann kann der Weg pro Auftragszeile berechnet werden.
          {' '}
          <strong>{currentMappedCount}</strong> von <strong>{relationZuordnungen.length}</strong> aktuell zugeordnet.
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Relation filtern…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 text-sm pl-7"
          />
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={autoMatch}>
          <Wand2 className="h-3.5 w-3.5" />
          Auto-Match (Substring)
        </Button>
      </div>

      {autoMatchResult && (
        <div className={`shrink-0 rounded-md border px-3 py-2 text-xs ${
          autoMatchResult.matched === 0
            ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
        }`}>
          {autoMatchResult.matched === 0 ? (
            <>
              <strong>Keine Substring-Treffer.</strong> {autoMatchResult.total} Relationen ohne automatisches
              Match — Bereich-Namen im Layout passen nicht zu den Dispogebiet-Namen. Manuell pro Zeile
              zuordnen, oder die Bereich-Namen in der Halle anpassen (z.B. „Tour Wuppertal" → so dass
              ein passender Bereich existiert).
            </>
          ) : (
            <>
              <strong>{autoMatchResult.matched} von {autoMatchResult.total}</strong> Relationen automatisch
              vorbelegt — gelb markierte Zeilen unten sind die Änderungen. <strong>Speichern-Klick übernimmt sie</strong>.
            </>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 border rounded-md overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left p-2 font-medium w-2/5">Relation (aus Scandaten)</th>
              <th className="text-left p-2 font-medium">Bereich im Layout</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((z) => {
              const currentId = getCurrentObjectId(z);
              const isEdited = edits.has(z.relationKey);
              const isUnmapped = currentId == null;
              return (
                <tr key={z.relationKey} className={`border-t ${isEdited ? 'bg-amber-500/5' : ''}`}>
                  <td className="p-2 font-medium">{z.relationKey}</td>
                  <td className="p-2">
                    {/* Wenn currentId null → expliziter „nicht zugeordnet"-
                        Placeholder, sonst sah die Zelle leer aus (Alex-
                        Beschwerde 19.05.). */}
                    <Select
                      value={currentId != null ? String(currentId) : '__none__'}
                      onValueChange={(v) => setEdit(z.relationKey, v === '__none__' ? null : Number(v))}
                    >
                      <SelectTrigger
                        className={`h-8 text-xs w-full ${isUnmapped ? 'text-muted-foreground italic' : ''}`}
                      >
                        <SelectValue placeholder="— nicht zugeordnet —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" className="text-xs text-muted-foreground italic">
                          — nicht zugeordnet —
                        </SelectItem>
                        {bereiche.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)} className="text-xs">
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-center text-muted-foreground text-xs">
                  {relationZuordnungen.length === 0
                    ? 'Noch keine Relationen geladen. Zuerst im Editor Volumen-Daten laden.'
                    : 'Keine Treffer für den Filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DialogFooter className="shrink-0 border-t pt-3">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Abbrechen
        </Button>
        <Button size="sm" onClick={save}>
          {edits.size > 0 ? `${edits.size} Änderung${edits.size === 1 ? '' : 'en'} speichern` : 'Speichern'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  // Wenn open prop von außen gesteuert: nur Content rendern
  if (open !== undefined) {
    return <Dialog open={isOpen} onOpenChange={setOpen}>{dialogContent}</Dialog>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          Relationen zuordnen
          <span className="text-[10px] text-muted-foreground ml-1">
            {currentMappedCount}/{relationZuordnungen.length}
          </span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
