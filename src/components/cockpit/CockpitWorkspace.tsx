'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Calculator, Upload, RotateCcw, CloudUpload, FileDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { AppNav } from '@/components/AppNav';
import { ProzessWorkbook } from '@/lib/prozessmodell-excel-engine';
import type { ModellGroesse, ModellSchritt } from '@/lib/prozessmodell-excel-modell';
import { konvertiereExcelZuNativ } from '@/lib/prozessmodell-konverter';
import {
  rechneNativesModell,
  setzeKnotenWert,
  setzeSchrittFeld,
  neuerSchritt,
  loescheSchritt,
  exportDiffs,
  hatStrukturAenderung,
  type NativesProzessmodell,
  type SchrittFeld,
} from '@/lib/prozessmodell-nativ';
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
import { StartTueren, type CockpitVorbelegung } from './StartTueren';
import { NeuerMonatDialog } from './NeuerMonatDialog';
import { VersionenDialog } from './VersionenDialog';

/**
 * Prozessmodell-Cockpit: TOPIS als BESSERE Excel.
 *
 * Das Modell lebt NATIV in TOPIS (Knoten + Blöcke + Schritte, voll editierbar
 * inkl. Schritte anlegen/löschen). Die Excel ist nur ein Importweg — einmal
 * migriert (Gate: 18/18 Δ=0), danach ist TOPIS die Quelle der Wahrheit.
 * Export zurück in die Original-Datei bleibt als Ausstiegs-Sicherheit.
 */
export function CockpitWorkspace() {
  const [nativ, setNativ] = useState<NativesProzessmodell | null>(null);
  const importStandRef = useRef<NativesProzessmodell | null>(null);
  const rawFileRef = useRef<ArrayBuffer | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const { session, configured } = useAuth();
  const [monate, setMonate] = useState<CloudProzessmodellMonat[]>([]);
  const [monateLoading, setMonateLoading] = useState(false);
  const [versionenMonat, setVersionenMonat] = useState<CloudProzessmodellMonat | null>(null);
  const [vorbelegung, setVorbelegung] = useState<CockpitVorbelegung | null>(null);
  const uid = session?.user?.id ?? null;

  // Eckdaten-Übergabe aus dem /check-Funnel (einmalig konsumieren).
  // setState asynchron (Microtask), damit der Effect keinen Kaskaden-Render auslöst.
  useEffect(() => {
    try {
      const roh = sessionStorage.getItem('topis-cockpit-vorbelegung');
      if (roh) {
        sessionStorage.removeItem('topis-cockpit-vorbelegung');
        const parsed = JSON.parse(roh) as CockpitVorbelegung;
        queueMicrotask(() => setVorbelegung(parsed));
      }
    } catch { /* egal — Türen starten dann unbefüllt */ }
  }, []);

  // Live-Rechnung: jede Modell-Änderung rechnet den ganzen Graph neu.
  const ergebnis = useMemo(() => (nativ ? rechneNativesModell(nativ) : null), [nativ]);
  const view = ergebnis?.modell ?? null;
  useEffect(() => {
    if (ergebnis && ergebnis.warnungen.length > 0) {
      console.warn('Prozessmodell-Warnungen:', ergebnis.warnungen);
    }
  }, [ergebnis]);

  const dirty = useMemo(() => {
    if (!nativ || !importStandRef.current) return false;
    return (
      hatStrukturAenderung(nativ, importStandRef.current) ||
      exportDiffs(nativ, importStandRef.current).length > 0
    );
  }, [nativ]);

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

  const uebernehmenAusDatei = (buf: ArrayBuffer, name: string): boolean => {
    const wb = ProzessWorkbook.fromArrayBuffer(buf);
    const { modell, warnungen } = konvertiereExcelZuNativ(wb, name.replace(/\.xlsx$/i, ''));
    if (modell.bloecke.length === 0) {
      toast.error('Keine Prozessblöcke gefunden. Erwartet: Sheet „Prozessmodell" mit SE:/SA:-Blöcken.');
      return false;
    }
    if (warnungen.length > 0) console.warn('Import-Warnungen:', warnungen);
    rawFileRef.current = buf;
    importStandRef.current = structuredClone(modell);
    setNativ(modell);
    setFileName(name);
    return true;
  };

  /** Modell direkt übernehmen (Vorlage, leeres Modell, neuer Monat, Version). */
  const uebernehmenNativ = (m: NativesProzessmodell, alsBasis = true) => {
    rawFileRef.current = null;
    setFileName('');
    if (alsBasis) importStandRef.current = structuredClone(m);
    setNativ(m);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      if (uebernehmenAusDatei(buf, file.name)) {
        toast.success('Excel in natives TOPIS-Modell übernommen — ab jetzt voll editierbar.');
      }
    } catch (err) {
      toast.error('Import fehlgeschlagen: ' + (err as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // --- Editier-Handler (natives Modell) ---
  const editGroesse = (g: ModellGroesse, value: number) => {
    if (!g.nativId) return;
    setNativ((m) => (m ? setzeKnotenWert(m, g.nativId!, value) : m));
  };
  const editSchritt = (s: ModellSchritt, feld: SchrittFeld, wert: string | number | null) => {
    if (!s.nativId) return;
    setNativ((m) => (m ? setzeSchrittFeld(m, s.nativId!, feld, wert) : m));
  };
  const schrittNeu = (blockNativId: string, nachSchrittNativId?: string) => {
    setNativ((m) => (m ? neuerSchritt(m, blockNativId, nachSchrittNativId) : m));
  };
  const schrittWeg = (s: ModellSchritt) => {
    if (!s.nativId) return;
    setNativ((m) => (m ? loescheSchritt(m, s.nativId!) : m));
    toast.success(`Schritt „${s.name}" gelöscht`);
  };

  const resetEdits = () => {
    if (importStandRef.current) setNativ(structuredClone(importStandRef.current));
  };

  /** Excel-Roundtrip: Wert-Änderungen in die Original-Datei zurückschreiben. */
  const exportieren = () => {
    if (!nativ) return;
    if (!rawFileRef.current || !importStandRef.current) {
      toast.error('Keine Original-Excel vorhanden (Modell wurde ohne Datei geladen).');
      return;
    }
    try {
      const diffs = exportDiffs(nativ, importStandRef.current);
      const { datei, ersetzteZellen, nichtGefunden } = exportiereMitOverrides(rawFileRef.current, diffs);
      if (nichtGefunden.length > 0) {
        toast.warning(`${nichtGefunden.length} Zelle(n) konnten nicht zurückgeschrieben werden.`);
      }
      const basis = fileName.replace(/\.xlsx$/i, '') || 'prozessmodell';
      downloadXlsx(datei, ersetzteZellen > 0 ? `${basis}_TOPIS.xlsx` : `${basis}.xlsx`);
      const struktur = hatStrukturAenderung(nativ, importStandRef.current);
      toast.success(
        ersetzteZellen > 0
          ? `Excel exportiert — ${ersetzteZellen} geänderte Werte, Formeln bleiben erhalten.`
          : 'Original-Excel unverändert heruntergeladen.',
      );
      if (struktur) {
        toast.info('Hinweis: Geänderte/neue Prozessschritte leben im TOPIS-Modell — die Excel-Datei enthält nur Wert-Änderungen.');
      }
    } catch (err) {
      toast.error('Export fehlgeschlagen: ' + (err as Error).message);
    }
  };

  const speichernMonat = async () => {
    if (!nativ || !view) return;
    setSaving(true);
    try {
      // Das NATIVE Modell (aktueller Stand inkl. Ihrer Änderungen) ist die
      // gespeicherte Wahrheit; die Original-Datei geht als Beleg mit.
      const saved = await saveProzessmodellMonat(rawFileRef.current, fileName, view, nativ);
      toast.success(`Monat ${saved.monat} gespeichert (TOPIS-Modell${rawFileRef.current ? ' + Original-Datei' : ''})`);
      await refreshMonate();
    } catch (err) {
      toast.error('Speichern fehlgeschlagen: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const ladeMonat = async (m: CloudProzessmodellMonat) => {
    try {
      if (m.modell) {
        // Natives Modell ist die Wahrheit; Datei (falls da) nur für Export nachladen.
        setNativ(m.modell);
        importStandRef.current = structuredClone(m.modell);
        setFileName(m.dateiname || `${m.monat}.xlsx`);
        rawFileRef.current = null;
        if (m.datei_pfad) {
          try {
            rawFileRef.current = await loadProzessmodellDatei(m.datei_pfad);
          } catch {
            /* Export dann eben nicht möglich — Modell rechnet trotzdem */
          }
        }
        toast.success(`Monat ${m.monat} geladen (TOPIS-Modell)`);
      } else {
        // Alt-Zeile ohne natives Modell: Datei laden + konvertieren
        const buf = await loadProzessmodellDatei(m.datei_pfad);
        if (uebernehmenAusDatei(buf, m.dateiname || `${m.monat}.xlsx`)) {
          toast.success(`Monat ${m.monat} aus Datei konvertiert`);
        }
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
      {/* Gemeinsame Kopfleiste (wie Editor) + Cockpit-Aktionszeile */}
      <AppNav
        aktiv="pm-cockpit"
        zeile2={
          <>
            <div className="flex items-center gap-2 min-w-0">
              <Calculator className="h-4 w-4 text-primary shrink-0" />
              <h1 className="font-display font-semibold text-sm truncate">Prozessmodell-Cockpit</h1>
              {view && (
                <Badge variant="secondary" className="font-normal shrink-0">{view.monat || fileName}</Badge>
              )}
              {dirty && <Badge className="font-normal shrink-0">geändert</Badge>}
            </div>
            <div className="ml-auto flex items-center gap-1.5 flex-wrap">
              {view && (
                <>
                  {dirty && (
                    <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={resetEdits}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Zurücksetzen
                    </Button>
                  )}
                  {rawFileRef.current && (
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={exportieren}>
                      <FileDown className="h-3.5 w-3.5" />
                      Excel exportieren
                    </Button>
                  )}
                  {nativ && (
                    <NeuerMonatDialog
                      modell={nativ}
                      onNeuerMonat={(m) => {
                        uebernehmenNativ(m);
                        toast.success(`Monat ${m.monat} angelegt — Mengen prüfen, dann speichern.`);
                      }}
                    />
                  )}
                  {configured && session && (
                    <Button size="sm" className="gap-1 text-xs" onClick={speichernMonat} disabled={saving}>
                      <CloudUpload className="h-3.5 w-3.5" />
                      {saving ? 'Speichert…' : `Monat ${view.monat || '?'} speichern`}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" />
                    Excel
                  </Button>
                </>
              )}
            </div>
          </>
        }
      />

      <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleFile} />

      <main className="mx-auto max-w-[1400px] w-full px-4 py-4 flex-1">
        {!view ? (
          <div className="flex flex-col gap-4">
            <StartTueren
              vorbelegung={vorbelegung}
              onExcel={() => fileRef.current?.click()}
              onModell={(m) => {
                uebernehmenNativ(m);
                toast.success(`Modell „${m.name}" erzeugt — Mengen, Parameter und Schritte sind frei anpassbar.`);
              }}
            />
            <div className="mx-auto w-full max-w-3xl">
              {configured && session && (
                <VerlaufPanel
                  monate={monate}
                  eigeneId={uid}
                  loading={monateLoading}
                  onLoad={ladeMonat}
                  onDelete={loescheMonat}
                  onVersionen={setVersionenMonat}
                />
              )}
              {configured && !session && (
                <p className="text-xs text-muted-foreground text-center">
                  Tipp: Angemeldet können Sie Monate speichern und den Verlauf (Trend) sehen — oben rechts anmelden.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* KPI-Zeile */}
            <div className="flex flex-wrap items-stretch gap-2">
              <Kpi label="MA-Stundenbedarf (Prozesse)" wert={`${view.maStundenProzesse.toLocaleString('de-DE', { maximumFractionDigits: 0 })} h`} sub="je Monat" highlight />
              <Kpi label="Prozessblöcke" wert={String(view.bloecke.length)} sub="im Modell" />
              <Kpi label="Arbeitsminuten je Stunde" wert={view.arbeitsminutenJeStunde.toLocaleString('de-DE', { maximumFractionDigits: 1 })} sub="inkl. Verteilzeit" />
              <Kpi label="Arbeitstage" wert={String(nativ?.arbeitstage ?? '')} sub="im Monat" />
            </div>

            {/* Zwei Spalten: links Übersicht + Verlauf, rechts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4 items-start">
              <div className="flex flex-col gap-4 xl:sticky xl:top-[60px]">
                <UebersichtPanel modell={view} />
                {configured && session && (
                  <VerlaufPanel
                    monate={monate}
                    eigeneId={uid}
                    loading={monateLoading}
                    onLoad={ladeMonat}
                    onDelete={loescheMonat}
                    onVersionen={setVersionenMonat}
                  />
                )}
                {configured && !session && (
                  <p className="text-[11px] text-muted-foreground px-1">
                    Angemeldet können Sie Monate speichern und den Verlauf (Trend) sehen.
                  </p>
                )}
              </div>
              <ProzessGrid
                bloecke={view.bloecke}
                onEdit={editGroesse}
                onSchrittEdit={editSchritt}
                onSchrittNeu={schrittNeu}
                onSchrittLoeschen={schrittWeg}
              />
            </div>
          </div>
        )}
      </main>

      <VersionenDialog
        monat={versionenMonat}
        onClose={() => setVersionenMonat(null)}
        onWiederherstellen={(m, v) => {
          uebernehmenNativ(m);
          setVersionenMonat(null);
          toast.success(
            `Version vom ${new Date(v.created_at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })} geladen — „Monat speichern" macht sie zur aktuellen.`,
          );
        }}
      />
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
