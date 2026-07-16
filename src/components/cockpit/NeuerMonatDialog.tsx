'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarPlus, ArrowRight } from 'lucide-react';
import { listeMonatsEingaben, neuerMonatAusEingaben, type NativesProzessmodell } from '@/lib/prozessmodell-nativ';
import { naechsterMonat } from './StartTueren';

/**
 * Der Abo-Kern: neuer Monat OHNE Datei — kurzes Mengen-Formular
 * (wie das Dateneingabe-Blatt der Excel, nur ohne Excel). Struktur und
 * Zeitaufnahme-Parameter bleiben, Mengen + Monat + Arbeitstage sind neu.
 */
export function NeuerMonatDialog({
  modell,
  onNeuerMonat,
}: {
  modell: NativesProzessmodell;
  onNeuerMonat: (m: NativesProzessmodell) => void;
}) {
  const [open, setOpen] = useState(false);
  const eingaben = useMemo(() => listeMonatsEingaben(modell), [modell]);
  const [monat, setMonat] = useState('');
  const [arbeitstage, setArbeitstage] = useState('');
  const [werte, setWerte] = useState<Record<string, string>>({});

  const reset = () => {
    setMonat(naechsterMonat(modell.monat));
    setArbeitstage(String(modell.arbeitstage));
    setWerte({});
  };

  const monatGueltig = /^\d{1,2}\s*\/\s*\d{4}$/.test(monat.trim());
  const atNum = parseFloat(arbeitstage);
  const atGueltig = Number.isFinite(atNum) && atNum > 0 && atNum <= 31;
  const kannAnlegen = monatGueltig && atGueltig;

  const anlegen = () => {
    if (!kannAnlegen) return; // Button ist disabled — dieser Guard ist nur Absicherung
    const at = atNum;
    const neu = eingaben
      .map((e) => {
        const roh = werte[e.key];
        if (roh == null || roh.trim() === '') return null;
        const v = parseFloat(roh);
        return Number.isFinite(v) ? { knotenIds: e.knotenIds, wert: v } : null;
      })
      .filter(Boolean) as { knotenIds: string[]; wert: number }[];
    onNeuerMonat(neuerMonatAusEingaben(modell, monat.trim(), at, neu));
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <CalendarPlus className="h-3.5 w-3.5" />
          Neuer Monat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Neuen Monat anlegen</DialogTitle>
          <DialogDescription>
            Struktur und Zeitaufnahme-Parameter bleiben — Sie tragen nur die neuen Monatsmengen ein.
            Leere Felder übernehmen den Vormonatswert.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium">Monat</span>
              <Input
                value={monat}
                onChange={(e) => setMonat(e.target.value)}
                className={`h-8 text-xs ${monat && !monatGueltig ? 'border-destructive' : ''}`}
                placeholder="07/2026"
              />
              {monat && !monatGueltig && <span className="text-[10px] text-destructive">Format MM/JJJJ</span>}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium">Arbeitstage</span>
              <Input
                type="number"
                value={arbeitstage}
                onChange={(e) => setArbeitstage(e.target.value)}
                className={`h-8 text-xs text-right font-mono ${arbeitstage && !atGueltig ? 'border-destructive' : ''}`}
              />
              {arbeitstage && !atGueltig && <span className="text-[10px] text-destructive">1–31</span>}
            </label>
          </div>
          <div className="rounded border overflow-hidden">
            <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium">
              Monatsmengen ({eingaben.length})
            </div>
            <div className="divide-y">
              {eingaben.map((e) => (
                <label key={e.key} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="flex-1 text-xs truncate" title={e.name}>{e.name}</span>
                  <Input
                    type="number"
                    placeholder={e.wert.toLocaleString('de-DE')}
                    value={werte[e.key] ?? ''}
                    onChange={(ev) => setWerte((w) => ({ ...w, [e.key]: ev.target.value }))}
                    className="h-7 w-32 text-xs text-right font-mono"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex justify-end pt-2">
          <Button size="sm" className="gap-1 text-xs" onClick={anlegen} disabled={!kannAnlegen}>
            <ArrowRight className="h-3.5 w-3.5" />
            Monat anlegen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
