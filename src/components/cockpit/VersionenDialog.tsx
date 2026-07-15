'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { History, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { listVersionen, type CloudProzessmodellMonat, type ProzessmodellVersion } from '@/lib/cloud-prozessmodelle';
import type { NativesProzessmodell } from '@/lib/prozessmodell-nativ';

/** Versionshistorie eines Monats: wer hat wann welchen Stand gespeichert + Wiederherstellen. */
export function VersionenDialog({
  monat,
  onClose,
  onWiederherstellen,
}: {
  monat: CloudProzessmodellMonat | null;
  onClose: () => void;
  onWiederherstellen: (m: NativesProzessmodell, version: ProzessmodellVersion) => void;
}) {
  // null = lädt gerade; Reset über die monat-Abhängigkeit im Promise-Callback
  const [versionen, setVersionen] = useState<ProzessmodellVersion[] | null>(null);

  useEffect(() => {
    if (!monat) return;
    let aktiv = true;
    listVersionen(monat.id)
      .then((v) => { if (aktiv) setVersionen(v); })
      .catch((err) => {
        toast.error('Versionen konnten nicht geladen werden: ' + (err as Error).message);
        if (aktiv) setVersionen([]);
      });
    return () => {
      aktiv = false;
      setVersionen(null); // Cleanup ist erlaubt: nächster Monat startet wieder im Lade-Zustand
    };
  }, [monat]);
  const loading = monat != null && versionen == null;

  return (
    <Dialog open={monat != null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Versionen — Monat {monat?.monat}
          </DialogTitle>
          <DialogDescription>Jeder Speicherstand wird festgehalten: wer, wann, mit welchen Kennzahlen.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading && <div className="text-xs text-muted-foreground py-2">Lade Versionen…</div>}
          {!loading && (versionen?.length ?? 0) === 0 && (
            <div className="text-xs text-muted-foreground py-2">Noch keine Versionen protokolliert.</div>
          )}
          <div className="divide-y">
            {(versionen ?? []).map((v, i) => (
              <div key={v.id} className="flex items-center gap-2 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">
                    {new Date(v.created_at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                    {i === 0 && <span className="ml-1.5 text-[10px] text-primary">aktuell</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{v.gespeichert_von_email}</div>
                </div>
                <div className="text-right font-mono text-xs tabular-nums whitespace-nowrap">
                  {v.kennzahlen.maStundenProzesse.toLocaleString('de-DE', { maximumFractionDigits: 1 })} h
                </div>
                {v.modell && i > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-1.5 text-[11px]"
                    onClick={() => onWiederherstellen(v.modell!, v)}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Wiederherstellen
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
