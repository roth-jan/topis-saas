'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Calculator, Upload, RotateCcw, CloudUpload, ArrowLeft, FileDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { CloudMenu } from '@/components/auth/CloudMenu';
import { ProzessWorkbook } from '@/lib/prozessmodell-excel-engine';
import { buildAsModell, type AsProzessModell, type ModellGroesse } from '@/lib/prozessmodell-excel-modell';
import { exportiereMitOverrides, downloadXlsx } from '@/lib/prozessmodell-excel-export';
import {
  saveProzessmodellMonat,
  listProzessmodellMonate,
  loadProzessmodellDatei,
  deleteProzessmodellMonat,
  type CloudProzessmodellMonat,
} from '@/lib/cloud-prozessmodelle';
import { ProzessGrid } from './ProzessGrid';
import { UebersichtPanel } from './UebersichtPanel';
import { VerlaufPanel } from './VerlaufPanel';

/**
 * Prozessmodell-Cockpit als VOLLSEITEN-Workspace (kein Modal — Council 15.07.):
 * links Übersicht (MA-Stunden) + Verlauf, rechts das editierbare Grid über
 * alle Blöcke. Excel-Roundtrip: Original laden → Werte ändern → zurück-
 * exportieren (Formeln + Formatierung bleiben erhalten).
 */
export function CockpitWorkspace() {
  const wbRef = useRef<ProzessWorkbook | null>(null);
  const rawFileRef = useRef<ArrayBuffer | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [modell, setModell] = useState<AsProzessModell | null>(null);
  const [fileName, setFileName] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { session, configured } = useAuth();
  const [monate, setMonate] = useState<CloudProzessmodellMonat[]>([]);
  const [monateLoading, setMonateLoading] = useState(false);
  const uid = session?.user?.id ?? null;

  const rebuild = useCallback(() => {
    if (wbRef.current) setModell(buildAsModell(wbRef.current));
  }, []);

  const refreshMonate = useCallback(async () => {
    if (!session) return;
    setMonateLoading(true);
    try {
      setMonate(await listProzessmodellMonate());
    } catch (err) {
      toast.error('Gespeicherte Monate konnten nicht geladen werden: ' + (err as Error).message);
    } finally {
      setMonateLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) void refreshMonate();
    else setMonate([]);
  }, [session, refreshMonate]);

  const uebernehmen = (buf: ArrayBuffer, name: string): boolean => {
    const wb = ProzessWorkbook.fromArrayBuffer(buf);
    const m = buildAsModell(wb);
    if (m.bloecke.length === 0) {
      toast.error('Keine Prozessblöcke gefunden. Erwartet: Sheet „Prozessmodell" mit SE:/SA:-Blöcken.');
      return false;
    }
    wbRef.current = wb;
    rawFileRef.current = buf;
    setModell(m);
    setFileName(name);
    setDirty(false);
    return true;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      if (uebernehmen(buf, file.name)) {
        toast.success(`${buildAsModell(wbRef.current!).bloecke.length} Prozessblöcke geladen`);
      }
    } catch (err) {
      toast.error('Import fehlgeschlagen: ' + (err as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const editGroesse = (g: ModellGroesse, value: number) => {
    if (!wbRef.current || !g.origin) return;
    wbRef.current.setOverride(g.origin.sheet, g.origin.addr, value);
    setDirty(true);
    rebuild();
  };

  const resetEdits = () => {
    if (!wbRef.current) return;
    wbRef.current.clearOverrides();
    setDirty(false);
    rebuild();
  };

  /** Excel-Roundtrip: geänderte Werte in die Original-Datei zurückschreiben. */
  const exportieren = () => {
    if (!rawFileRef.current || !wbRef.current) return;
    try {
      const { datei, ersetzteZellen, nichtGefunden } = exportiereMitOverrides(
        rawFileRef.current,
        wbRef.current.listOverrides(),
      );
      if (nichtGefunden.length > 0) {
        toast.warning(`${nichtGefunden.length} Zelle(n) konnten nicht zurückgeschrieben werden.`);
      }
      const basis = fileName.replace(/\.xlsx$/i, '') || 'prozessmodell';
      downloadXlsx(datei, ersetzteZellen > 0 ? `${basis}_TOPIS.xlsx` : `${basis}.xlsx`);
      toast.success(
        ersetzteZellen > 0
          ? `Excel exportiert — ${ersetzteZellen} geänderte Werte, Formeln und Formatierung bleiben erhalten.`
          : 'Original-Excel unverändert heruntergeladen.',
      );
    } catch (err) {
      toast.error('Export fehlgeschlagen: ' + (err as Error).message);
    }
  };

  const speichernMonat = async () => {
    if (!rawFileRef.current || !modell) return;
    setSaving(true);
    try {
      // Kennzahlen immer aus dem ORIGINAL-Stand der Datei — Datei und
      // Trend-Wert bleiben konsistent, auch wenn Testwerte aktiv sind.
      const frisch = buildAsModell(ProzessWorkbook.fromArrayBuffer(rawFileRef.current));
      const saved = await saveProzessmodellMonat(rawFileRef.current, fileName, frisch);
      toast.success(
        `Monat ${saved.monat} gespeichert` + (dirty ? ' (Original-Stand der Datei, ohne Ihre Testwerte)' : ''),
      );
      await refreshMonate();
    } catch (err) {
      toast.error('Speichern fehlgeschlagen: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const ladeMonat = async (m: CloudProzessmodellMonat) => {
    try {
      const buf = await loadProzessmodellDatei(m.datei_pfad);
      if (uebernehmen(buf, m.dateiname || `${m.monat}.xlsx`)) {
        toast.success(`Monat ${m.monat} geladen`);
      }
    } catch (err) {
      toast.error('Laden fehlgeschlagen: ' + (err as Error).message);
    }
  };

  const loescheMonat = async (m: CloudProzessmodellMonat) => {
    try {
      await deleteProzessmodellMonat(m);
      toast.success(`Monat ${m.monat} gelöscht`);
      await refreshMonate();
    } catch (err) {
      toast.error('Löschen fehlgeschlagen: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Kopfleiste */}
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto max-w-[1400px] px-4 py-2.5 flex items-center gap-3">
          <Link href="/projekt/" className="shrink-0">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Editor
            </Button>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Calculator className="h-4 w-4 text-primary shrink-0" />
            <h1 className="font-display font-semibold text-sm truncate">Prozessmodell-Cockpit</h1>
            {modell && (
              <Badge variant="secondary" className="font-normal shrink-0">{modell.monat || fileName}</Badge>
            )}
            {dirty && <Badge className="font-normal shrink-0">geändert</Badge>}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {modell && (
              <>
                {dirty && (
                  <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={resetEdits}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Zurücksetzen
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={exportieren}>
                  <FileDown className="h-3.5 w-3.5" />
                  Excel exportieren
                </Button>
                {configured && session && (
                  <Button size="sm" className="gap-1 text-xs" onClick={speichernMonat} disabled={saving}>
                    <CloudUpload className="h-3.5 w-3.5" />
                    {saving ? 'Speichert…' : `Monat ${modell.monat || '?'} speichern`}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" />
                  Andere Excel
                </Button>
              </>
            )}
            <CloudMenu />
          </div>
        </div>
      </header>

      <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleFile} />

      <main className="mx-auto max-w-[1400px] w-full px-4 py-4 flex-1">
        {!modell ? (
          <StartBereich
            onWaehlen={() => fileRef.current?.click()}
            angemeldet={Boolean(configured && session)}
            configured={configured}
            monate={monate}
            monateLoading={monateLoading}
            uid={uid}
            onLoad={ladeMonat}
            onDelete={loescheMonat}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* KPI-Zeile */}
            <div className="flex flex-wrap items-stretch gap-2">
              <Kpi label="MA-Stundenbedarf (Prozesse)" wert={`${modell.maStundenProzesse.toLocaleString('de-DE', { maximumFractionDigits: 0 })} h`} sub="je Monat" highlight />
              <Kpi label="Prozessblöcke" wert={String(modell.bloecke.length)} sub="im Modell" />
              <Kpi label="Arbeitsminuten je Stunde" wert={modell.arbeitsminutenJeStunde.toLocaleString('de-DE', { maximumFractionDigits: 1 })} sub="inkl. Verteilzeit" />
            </div>

            {/* Zwei Spalten: links Übersicht + Verlauf, rechts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4 items-start">
              <div className="flex flex-col gap-4 xl:sticky xl:top-[60px]">
                <UebersichtPanel modell={modell} />
                {configured && session && (
                  <VerlaufPanel
                    monate={monate}
                    eigeneId={uid}
                    loading={monateLoading}
                    onLoad={ladeMonat}
                    onDelete={loescheMonat}
                  />
                )}
                {configured && !session && (
                  <p className="text-[11px] text-muted-foreground px-1">
                    Angemeldet können Sie Monate speichern und den Verlauf (Trend) sehen.
                  </p>
                )}
              </div>
              <ProzessGrid bloecke={modell.bloecke} onEdit={editGroesse} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Kpi({ label, wert, sub, highlight = false }: { label: string; wert: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 min-w-[150px] ${highlight ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
      <div className={`text-[10px] uppercase tracking-wide ${highlight ? 'opacity-80' : 'text-muted-foreground'}`}>{label}</div>
      <div className="font-mono text-lg font-semibold tabular-nums leading-tight">{wert}</div>
      <div className={`text-[10px] ${highlight ? 'opacity-80' : 'text-muted-foreground'}`}>{sub}</div>
    </div>
  );
}

function StartBereich({
  onWaehlen,
  angemeldet,
  configured,
  monate,
  monateLoading,
  uid,
  onLoad,
  onDelete,
}: {
  onWaehlen: () => void;
  angemeldet: boolean;
  configured: boolean;
  monate: CloudProzessmodellMonat[];
  monateLoading: boolean;
  uid: string | null;
  onLoad: (m: CloudProzessmodellMonat) => void;
  onDelete: (m: CloudProzessmodellMonat) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-4 pt-8">
      <div className="flex flex-col items-center justify-center gap-4 py-14 border-2 border-dashed rounded-xl bg-card">
        <Calculator className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Prozessmodell-Excel laden</p>
          <p className="text-xs text-muted-foreground mt-1">
            .xlsx mit Sheets &bdquo;Prozessmodell&ldquo; + &bdquo;Dateneingabe&ldquo; &mdash; das Modell rechnet live,
            alle Werte bleiben in Ihrem Browser.
          </p>
        </div>
        <Button onClick={onWaehlen} size="sm" className="gap-1">
          <Upload className="h-4 w-4" />
          Excel wählen
        </Button>
      </div>
      {angemeldet && (
        <VerlaufPanel monate={monate} eigeneId={uid} loading={monateLoading} onLoad={onLoad} onDelete={onDelete} />
      )}
      {configured && !angemeldet && (
        <p className="text-xs text-muted-foreground text-center">
          Tipp: Angemeldet können Sie Monate speichern und den Verlauf (Trend) sehen — oben rechts anmelden.
        </p>
      )}
    </div>
  );
}
