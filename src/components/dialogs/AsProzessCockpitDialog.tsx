'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
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
import { Calculator, Upload, ArrowLeft, RotateCcw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ProzessWorkbook } from '@/lib/prozessmodell-excel-engine';
import { buildAsModell, type AsProzessModell, type ModellBlock, type ModellGroesse } from '@/lib/prozessmodell-excel-modell';

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
  const [modell, setModell] = useState<AsProzessModell | null>(null);
  const [fileName, setFileName] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [tab, setTab] = useState<'cockpit' | 'bloecke'>('cockpit');
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    wbRef.current = null;
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const wb = ProzessWorkbook.fromArrayBuffer(buf);
      const m = buildAsModell(wb);
      if (m.bloecke.length === 0) {
        toast.error('Keine Prozessblöcke gefunden. Erwartet: Sheet „Prozessmodell" mit SE:/SA:-Blöcken.');
        return;
      }
      wbRef.current = wb;
      setModell(m);
      setFileName(file.name);
      setSelectedIdx(null);
      setDirty(false);
      toast.success(`${m.bloecke.length} Prozessblöcke geladen — ${m.maStundenProzesse.toFixed(0)} MA-h/Monat`);
    } catch (err) {
      toast.error('Import fehlgeschlagen: ' + (err as Error).message);
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
      <DialogContent className="max-w-5xl max-h-[88vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Prozessmodell-Cockpit
            {modell && <Badge variant="secondary" className="font-normal">{modell.monat || fileName}</Badge>}
          </DialogTitle>
          <DialogDescription>
            Rechnet das AS-Prozessmodell live aus den Rohdaten — Mengen editierbar, alles rechnet neu.
            Verifiziert gegen die Referenz (18 Blöcke, MA-Stundenbedarf exakt).
          </DialogDescription>
        </DialogHeader>

        {!modell && <UploadArea fileRef={fileRef} onFile={handleFile} />}

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
                <Button variant="outline" size="sm" onClick={reset}>Andere Datei</Button>
              </div>
            </div>

            {/* Segmented */}
            <div className="inline-flex rounded-md border bg-muted/40 p-0.5 w-fit">
              <SegBtn active={tab === 'cockpit'} onClick={() => { setTab('cockpit'); setSelectedIdx(null); }}>
                Cockpit (MA-Stunden)
              </SegBtn>
              <SegBtn active={tab === 'bloecke'} onClick={() => setTab('bloecke')}>
                Prozessblöcke
              </SegBtn>
            </div>

            {tab === 'cockpit' && <CockpitView modell={modell} />}

            {tab === 'bloecke' && !selected && (
              <BlockListView bloecke={modell.bloecke} onSelect={(i) => setSelectedIdx(i)} />
            )}

            {tab === 'bloecke' && selected && (
              <BlockDetailView block={selected} onBack={() => setSelectedIdx(null)} onEdit={editGroesse} />
            )}
          </div>
        )}
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
    <ScrollArea className="h-[52vh] rounded border">
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
    </ScrollArea>
  );
}

function BlockListView({ bloecke, onSelect }: { bloecke: ModellBlock[]; onSelect: (i: number) => void }) {
  const max = Math.max(...bloecke.map((b) => Math.abs(b.minProColli)), 1);
  return (
    <ScrollArea className="h-[52vh] rounded border">
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
          </button>
        ))}
      </div>
    </ScrollArea>
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
            hoehe="h-[17vh]"
          />
          <GroessenPanel
            titel="Parameter (Zeitaufnahme, editierbar)"
            leer="Keine Parameter in diesem Block."
            groessen={block.parameter}
            onEdit={onEdit}
            hoehe="h-[17vh]"
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
    <div className={`rounded-md border px-3 py-2 min-w-[130px] ${highlight ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
      <div className={`text-[10px] uppercase tracking-wide ${highlight ? 'opacity-80' : 'text-muted-foreground'}`}>
        {label}
      </div>
      <div className="font-mono text-lg font-semibold tabular-nums leading-tight">{value}</div>
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
