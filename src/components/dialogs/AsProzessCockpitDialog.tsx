'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calculator, Upload, ArrowLeft, RotateCcw, TrendingUp, CloudUpload, FolderOpen, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { ProzessWorkbook } from '@/lib/prozessmodell-excel-engine';
import { buildAsModell, type AsProzessModell, type ModellBlock, type ModellGroesse } from '@/lib/prozessmodell-excel-modell';
import { useAuth } from '@/lib/auth';
import {
  saveProzessmodellMonat,
  listProzessmodellMonate,
  loadProzessmodellDatei,
  deleteProzessmodellMonat,
  sortiereMonate,
  gruppiereNachKunde,
  type CloudProzessmodellMonat,
} from '@/lib/cloud-prozessmodelle';

/**
 * Rechnendes, EDITIERBARES Prozessmodell-Cockpit (AS / Beintner).
 *
 * Anders als der read-only ROTH-Excel-Import rechnet dieses Cockpit den kompletten
 * Formelgraph aus den Rohdaten neu (verifizierte Engine, 18 Blöcke Δ = 0, Σ 6375,9 h).
 * Der Kunde ändert eine Menge → das ganze Modell rechnet live neu.
 */
export function AsProzessCockpitDialog() {
  const [open, setOpen] = useState(false);
  const wbRef = useRef<ProzessWorkbook | null>(null);
  const rawFileRef = useRef<ArrayBuffer | null>(null);
  const [modell, setModell] = useState<AsProzessModell | null>(null);
  const [fileName, setFileName] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<'cockpit' | 'bloecke' | 'verlauf'>('cockpit');
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { session, configured } = useAuth();
  const [monate, setMonate] = useState<CloudProzessmodellMonat[]>([]);
  const [monateLoading, setMonateLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const uid = session?.user?.id ?? null;
  // Berater sehen fremde Monate → nach Kunde gruppieren (eigene zuerst).
  const gruppen = useMemo(() => gruppiereNachKunde(monate, uid), [monate, uid]);

  const reset = () => {
    wbRef.current = null;
    rawFileRef.current = null;
    setModell(null);
    setFileName('');
    setSelectedIdx(null);
    setTab('cockpit');
    setDirty(false);
    if (fileRef.current) fileRef.current.value = '';
  };

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
    if (open && session) void refreshMonate();
  }, [open, session, refreshMonate]);

  const uebernehmen = (buf: ArrayBuffer, name: string) => {
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
    setSelectedIdx(null);
    setDirty(false);
    return true;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      if (uebernehmen(buf, file.name)) {
        setTab('cockpit');
        toast.success(`${buildAsModell(wbRef.current!).bloecke.length} Prozessblöcke geladen`);
      }
    } catch (err) {
      toast.error('Import fehlgeschlagen: ' + (err as Error).message);
    }
  };

  const speichernMonat = async () => {
    if (!rawFileRef.current || !modell) return;
    setSaving(true);
    try {
      // Kennzahlen immer aus dem ORIGINAL-Stand der Datei rechnen — so bleiben
      // gespeicherte Datei und gespeicherter Trend-Wert garantiert konsistent,
      // auch wenn gerade Testwerte (Overrides) aktiv sind.
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
        setTab('cockpit');
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

  const selected = selectedIdx != null && modell ? modell.bloecke[selectedIdx] : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <Calculator className="h-3.5 w-3.5" />
          Prozess-Cockpit
        </Button>
      </DialogTrigger>
      {/* WICHTIG: flex-col + overflow-hidden — der Inhalt scrollt INNEN,
          statt auf kleinen Bildschirmen unten aus dem Dialog zu laufen. */}
      <DialogContent className="max-w-5xl max-h-[88vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            Prozessmodell-Cockpit
            {modell && <Badge variant="secondary" className="font-normal">{modell.monat || fileName}</Badge>}
          </DialogTitle>
          <DialogDescription>
            Rechnet das Prozessmodell live aus den Rohdaten — Mengen und Parameter editierbar, alles rechnet neu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">

        {!modell && (
          <div className="flex flex-col gap-3">
            <UploadArea fileRef={fileRef} onFile={handleFile} />
            {configured && session && (
              <VerlaufGruppen
                gruppen={gruppen}
                loading={monateLoading}
                onLoad={ladeMonat}
                onDelete={loescheMonat}
                kompakt
              />
            )}
            {configured && !session && (
              <p className="text-xs text-muted-foreground text-center">
                Tipp: Angemeldet können Sie Monate speichern und den Verlauf (Trend) sehen.
              </p>
            )}
          </div>
        )}

        {modell && (
          <div className="flex flex-col gap-4">
            {/* Kopf-Kennzahlen */}
            <div className="flex flex-wrap items-stretch gap-2">
              <StatCard
                label="MA-Stundenbedarf (Prozesse)"
                value={modell.maStundenProzesse.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                unit="h / Monat"
                highlight
              />
              <StatCard label="Prozessblöcke" value={String(modell.bloecke.length)} unit="Blöcke" />
              <StatCard
                label="Arbeitsminuten / Stunde"
                value={modell.arbeitsminutenJeStunde.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
                unit="inkl. Verteilzeit"
              />
              <div className="ml-auto flex items-center gap-2">
                {dirty && (
                  <Button variant="ghost" size="sm" onClick={resetEdits} className="gap-1 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Änderungen zurücksetzen
                  </Button>
                )}
                {configured && session && (
                  <Button size="sm" onClick={speichernMonat} disabled={saving} className="gap-1 text-xs">
                    <CloudUpload className="h-3.5 w-3.5" />
                    {saving ? 'Speichert…' : `Monat ${modell.monat || '?'} speichern`}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={reset}>Andere Datei</Button>
              </div>
            </div>

            {/* Segmented */}
            <div className="inline-flex rounded-md border bg-muted/40 p-0.5 w-fit">
              <SegBtn active={tab === 'cockpit'} onClick={() => { setTab('cockpit'); setSelectedIdx(null); }}>
                Cockpit (MA-Stunden)
              </SegBtn>
              <SegBtn active={tab === 'bloecke'} onClick={() => setTab('bloecke')}>
                <span className="inline-flex items-center gap-1">
                  <Pencil className="h-3 w-3" />
                  Prozessblöcke bearbeiten
                </span>
              </SegBtn>
              {configured && session && (
                <SegBtn active={tab === 'verlauf'} onClick={() => { setTab('verlauf'); setSelectedIdx(null); }}>
                  Verlauf
                </SegBtn>
              )}
            </div>

            {tab === 'cockpit' && (
              <>
                <CockpitView modell={modell} />
                <button
                  onClick={() => setTab('bloecke')}
                  className="text-xs text-muted-foreground hover:text-foreground rounded border border-dashed px-3 py-2 text-left transition-colors"
                >
                  <Pencil className="h-3 w-3 inline mr-1.5" />
                  Mengen oder Parameter ändern? <span className="underline">Prozessblöcke bearbeiten</span> —
                  Block anklicken, Werte ändern, alles rechnet sofort neu.
                </button>
              </>
            )}

            {tab === 'bloecke' && !selected && (
              <BlockListView bloecke={modell.bloecke} onSelect={(i) => setSelectedIdx(i)} />
            )}

            {tab === 'bloecke' && selected && (
              <BlockDetailView block={selected} onBack={() => setSelectedIdx(null)} onEdit={editGroesse} />
            )}

            {tab === 'verlauf' && (
              <VerlaufGruppen gruppen={gruppen} loading={monateLoading} onLoad={ladeMonat} onDelete={loescheMonat} />
            )}
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

function UploadArea({
  fileRef,
  onFile,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-14 border-2 border-dashed rounded-lg">
      <Calculator className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">AS-Prozessmodell-Excel laden</p>
        <p className="text-xs text-muted-foreground mt-1">
          .xlsx mit Sheets &bdquo;Prozessmodell&ldquo; + &bdquo;Dateneingabe&ldquo; — das Modell rechnet dann live.
        </p>
      </div>
      <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={onFile} />
      <Button onClick={() => fileRef.current?.click()} size="sm" className="gap-1">
        <Upload className="h-4 w-4" />
        Excel wählen
      </Button>
    </div>
  );
}

function CockpitView({ modell }: { modell: AsProzessModell }) {
  return (
    <div className="rounded border overflow-hidden">
      <div className="divide-y">
        {modell.uebersicht.map((sek, si) => (
          <div key={si}>
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2 sticky top-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                {sek.titel}
              </div>
              <div className="font-mono text-sm font-semibold tabular-nums">
                {sek.summeProzesse.toLocaleString('de-DE', { maximumFractionDigits: 1 })} h
              </div>
            </div>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="px-4 py-1.5 font-medium">Prozess</th>
                  <th className="px-2 py-1.5 font-medium text-right">Menge</th>
                  <th className="px-2 py-1.5 font-medium text-right">Min/Colli</th>
                  <th className="px-4 py-1.5 font-medium text-right">MA-Std.</th>
                </tr>
              </thead>
              <tbody>
                {sek.prozesse.map((p, i) => (
                  <tr key={i} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-1.5">{p.name}</td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                      {p.menge.toLocaleString('de-DE', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">{p.minProColli.toFixed(4)}</td>
                    <td className="px-4 py-1.5 text-right font-mono tabular-nums font-medium">
                      {p.maStunden.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockListView({ bloecke, onSelect }: { bloecke: ModellBlock[]; onSelect: (i: number) => void }) {
  const max = Math.max(...bloecke.map((b) => Math.abs(b.minProColli)), 1);
  return (
    <div className="rounded border overflow-hidden">
      <div className="divide-y">
        {bloecke.map((b, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{b.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {b.schritte.length} Schritte · {Object.keys(b.proAbteilung).length} Abteilungen · {b.mengen.length} Mengen
              </div>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
              <div
                className="h-full bg-primary/70"
                style={{ width: `${Math.min(100, (Math.abs(b.minProColli) / max) * 100)}%` }}
              />
            </div>
            <div className="text-right w-24">
              <div className="font-mono text-sm font-semibold tabular-nums">{b.minProColli.toFixed(4)}</div>
              <div className="text-[10px] text-muted-foreground">Min/Colli</div>
            </div>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

const ABT_FARBEN: Record<string, string> = {
  Entlader: 'bg-primary/10 text-primary border-primary/20',
  Scanner: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  Verteiler: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  Belader: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
};

function BlockDetailView({
  block,
  onBack,
  onEdit,
}: {
  block: ModellBlock;
  onBack: () => void;
  onEdit: (g: ModellGroesse, value: number) => void;
}) {
  const abteilungen = useMemo(
    () => Object.entries(block.proAbteilung).sort((a, b) => b[1] - a[1]),
    [block],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 h-7">
          <ArrowLeft className="h-3.5 w-3.5" />
          Blöcke
        </Button>
        <div className="font-medium text-sm truncate">{block.name}</div>
      </div>

      {/* Min/Colli je Abteilung */}
      <div className="flex flex-wrap gap-2">
        <StatCard label="Gesamt" value={block.minProColli.toFixed(4)} unit="Min/Colli" highlight />
        {abteilungen.map(([abt, sum]) => (
          <StatCard key={abt} label={abt} value={sum.toFixed(4)} unit="Min/Colli" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_1fr] gap-3">
        {/* Editierbare Mengen + Parameter */}
        <div className="flex flex-col gap-3">
          <GroessenPanel
            titel="Mengen (monatlich, editierbar)"
            leer="Keine Mengen in diesem Block."
            groessen={block.mengen}
            onEdit={onEdit}
            hoehe="max-h-[24vh]"
          />
          <GroessenPanel
            titel="Parameter (Zeitaufnahme, editierbar)"
            leer="Keine Parameter in diesem Block."
            groessen={block.parameter}
            onEdit={onEdit}
            hoehe="max-h-[24vh]"
          />
        </div>

        {/* Schritte */}
        <div className="rounded border overflow-hidden">
          <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium">Prozessschritte ({block.schritte.length})</div>
          <ScrollArea className="h-[36vh]">
            <table className="w-full text-xs">
              <thead className="bg-background text-muted-foreground sticky top-0">
                <tr className="text-left">
                  <th className="px-2 py-1.5 font-medium">Nr.</th>
                  <th className="px-2 py-1.5 font-medium">Schritt</th>
                  <th className="px-2 py-1.5 font-medium">Abteilung</th>
                  <th className="px-2 py-1.5 font-medium text-right">Anteil</th>
                  <th className="px-2 py-1.5 font-medium text-right">Häuf./Tag</th>
                  <th className="px-2 py-1.5 font-medium text-right">Min/Colli</th>
                </tr>
              </thead>
              <tbody>
                {block.schritte.map((s) => (
                  <tr key={s.row} className="border-t hover:bg-muted/30">
                    <td className="px-2 py-1.5 font-mono tabular-nums text-muted-foreground">{s.nr || ''}</td>
                    <td className="px-2 py-1.5 max-w-[240px] truncate" title={s.name}>{s.name}</td>
                    <td className="px-2 py-1.5">
                      <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] ${ABT_FARBEN[s.abteilung] ?? 'bg-muted text-muted-foreground'}`}>
                        {s.abteilung}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums">{s.anteil.toFixed(2)}</td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                      {s.haeufigkeitJeTag.toFixed(1)}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono tabular-nums font-medium">
                      {s.minProColli.toFixed(5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2">
        Ändern Sie eine Menge (z.B. Colli/Monat) — Min/Colli, Abteilungs-Split und MA-Stundenbedarf
        rechnen sofort neu. Der Formelgraph ist der Ihrer Excel, 1:1.
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-md border px-2.5 py-1.5 min-w-[104px] ${highlight ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
      <div className={`text-[10px] uppercase tracking-wide ${highlight ? 'opacity-80' : 'text-muted-foreground'}`}>
        {label}
      </div>
      <div className="font-mono text-base font-semibold tabular-nums leading-tight">{value}</div>
      <div className={`text-[10px] ${highlight ? 'opacity-80' : 'text-muted-foreground'}`}>{unit}</div>
    </div>
  );
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

/** Editierbare Größen-Liste (Mengen oder Parameter) mit Live-Recompute. */
function GroessenPanel({
  titel,
  leer,
  groessen,
  onEdit,
  hoehe,
}: {
  titel: string;
  leer: string;
  groessen: ModellGroesse[];
  onEdit: (g: ModellGroesse, value: number) => void;
  hoehe: string;
}) {
  return (
    <div className="rounded border overflow-hidden">
      <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium">{titel}</div>
      <ScrollArea className={hoehe}>
        <div className="divide-y">
          {groessen.length === 0 && <div className="px-3 py-3 text-xs text-muted-foreground">{leer}</div>}
          {groessen.map((g) => (
            <div key={g.row} className="px-3 py-1.5 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs truncate" title={g.name}>{g.name}</div>
                {g.abgeleitet && <div className="text-[10px] text-muted-foreground">abgeleitet</div>}
              </div>
              {g.editierbar ? (
                <Input
                  type="number"
                  defaultValue={fmtEdit(g.wert)}
                  key={`${g.row}-${g.wert}`}
                  className="h-7 w-24 text-right font-mono text-xs tabular-nums"
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value);
                    if (Number.isFinite(v) && Math.abs(v - g.wert) > 1e-9) onEdit(g, v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                />
              ) : (
                <div className="w-24 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {fmtEdit(g.wert).toLocaleString('de-DE')}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/** Zahl für Anzeige/Edit: genug Präzision für kleine Parameter (0.002), knapp für große Mengen. */
function fmtEdit(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const abs = Math.abs(n);
  if (abs !== 0 && abs < 10) return Number(n.toPrecision(4));
  return Math.round(n * 100) / 100;
}

/** Verlauf-Bereich: Lade-/Leerzustand + eine Monats-Tabelle je Kunden-Gruppe
 * (Berater sehen mehrere Gruppen, normale Nutzer genau ihre eigene). */
function VerlaufGruppen({
  gruppen,
  loading,
  onLoad,
  onDelete,
  kompakt = false,
}: {
  gruppen: ReturnType<typeof gruppiereNachKunde>;
  loading: boolean;
  onLoad: (m: CloudProzessmodellMonat) => void;
  onDelete: (m: CloudProzessmodellMonat) => void;
  kompakt?: boolean;
}) {
  if (loading) {
    return <div className="text-xs text-muted-foreground px-1 py-2">Lade gespeicherte Monate…</div>;
  }
  if (gruppen.length === 0) {
    return (
      <div className="text-xs text-muted-foreground rounded border border-dashed px-3 py-3 text-center">
        Noch keine Monate gespeichert. Excel laden und oben &bdquo;Monat speichern&ldquo; klicken &mdash;
        ab dem zweiten Monat sehen Sie hier den Trend.
      </div>
    );
  }
  const mehrere = gruppen.length > 1;
  return (
    <div className={mehrere && !kompakt ? 'flex flex-col gap-3 overflow-y-auto max-h-[52vh]' : 'flex flex-col gap-3'}>
      {gruppen.map((g) => (
        <VerlaufListe
          key={g.ownerId}
          monate={g.monate}
          // Fremde Gruppen IMMER mit Kundenname beschriften — auch wenn es die
          // einzige ist (Berater ohne eigene Monate darf nicht denken, es sei seine).
          titel={mehrere || !g.eigene ? g.label : undefined}
          loeschbar={g.eigene}
          onLoad={onLoad}
          onDelete={onDelete}
          kompakt={kompakt || mehrere}
        />
      ))}
    </div>
  );
}

/** Gespeicherte Monate mit Trend (Δ MA-Stunden zum Vormonat) + Laden/Löschen. */
function VerlaufListe({
  monate,
  titel,
  loeschbar,
  onLoad,
  onDelete,
  kompakt = false,
}: {
  monate: CloudProzessmodellMonat[];
  titel?: string;
  loeschbar: boolean;
  onLoad: (m: CloudProzessmodellMonat) => void;
  onDelete: (m: CloudProzessmodellMonat) => void;
  kompakt?: boolean;
}) {
  const sorted = useMemo(() => sortiereMonate(monate), [monate]);
  const max = Math.max(...sorted.map((m) => m.kennzahlen.maStundenProzesse), 1);

  return (
    <div className="rounded border overflow-hidden">
      <div className="bg-muted/50 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5" />
        {titel ?? 'Gespeicherte Monate'} ({sorted.length})
      </div>
      <ScrollArea className={kompakt ? 'max-h-[26vh]' : undefined}>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              <th className="px-3 py-1.5 font-medium">Monat</th>
              <th className="px-2 py-1.5 font-medium text-right">MA-Std. (Prozesse)</th>
              <th className="px-2 py-1.5 font-medium text-right">Δ Vormonat</th>
              <th className="px-2 py-1.5 font-medium hidden sm:table-cell" aria-label="Verhältnis" />
              <th className="px-3 py-1.5 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => {
              const delta = i > 0 ? m.kennzahlen.maStundenProzesse - sorted[i - 1].kennzahlen.maStundenProzesse : null;
              return (
                <tr key={m.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-1.5 font-medium">{m.monat}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {m.kennzahlen.maStundenProzesse.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                    {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta.toLocaleString('de-DE', { maximumFractionDigits: 1 })}`}
                  </td>
                  <td className="px-2 py-1.5 hidden sm:table-cell">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/70"
                        style={{ width: `${Math.min(100, (m.kennzahlen.maStundenProzesse / max) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs" onClick={() => onLoad(m)}>
                      <FolderOpen className="h-3 w-3" />
                      Laden
                    </Button>
                    {loeschbar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(m)}
                        aria-label={`Monat ${m.monat} löschen`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
