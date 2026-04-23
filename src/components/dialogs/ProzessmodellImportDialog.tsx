'use client';

import { useMemo, useRef, useState } from 'react';
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
import { FileSpreadsheet, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  parseProzessmodellWorkbook,
  type ImportedProzess,
} from '@/lib/prozessmodell-excel-import';

/**
 * Dialog zum Import eines ROTH-Methodik-Prozessmodells aus Excel.
 *
 * Zeigt die Blöcke, Abteilungs-Summen und einzelnen Prozessschritte
 * **exakt so wie in der Excel berechnet** (read-only, Δ 0.0%).
 * Keine Umrechnung über den vereinfachten TOPIS-Rechner — so bleibt
 * die ROTH-Kalibrierung unverändert.
 */
export function ProzessmodellImportDialog() {
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState<ImportedProzess[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setBlocks([]);
    setSelectedIdx(null);
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const parsed = parseProzessmodellWorkbook(buf);
      if (parsed.length === 0) {
        toast.error('Keine Prozessmodell-Blöcke gefunden. Erwartet: Sheet "Prozessmodell" mit SE:/SA:-Headern.');
        return;
      }
      setBlocks(parsed);
      setFileName(file.name);
      setSelectedIdx(parsed.length === 1 ? 0 : null);
      toast.success(`${parsed.length} Prozessblöcke aus ${file.name} geladen`);
    } catch (err) {
      toast.error('Import fehlgeschlagen: ' + (err as Error).message);
    }
  };

  const selected = selectedIdx != null ? blocks[selectedIdx] : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          ROTH-Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Prozessmodell aus ROTH-Excel importieren</DialogTitle>
          <DialogDescription>
            Liest Prozessmodell-Datenblätter der Logistikberatung (z.B. <code>Prozessmodell_AS_Aktualisiert.xlsx</code>).
            Zeigt die in der Excel berechneten Werte unverändert — keine Umrechnung.
          </DialogDescription>
        </DialogHeader>

        {blocks.length === 0 && <UploadArea fileRef={fileRef} onFile={handleFile} />}

        {blocks.length > 0 && selected == null && (
          <BlockList
            blocks={blocks}
            fileName={fileName}
            onSelect={setSelectedIdx}
            onReset={reset}
          />
        )}

        {selected && (
          <BlockDetails
            block={selected}
            fileName={fileName}
            multipleBlocks={blocks.length > 1}
            onBack={() => setSelectedIdx(null)}
            onReset={reset}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UploadArea({
  fileRef,
  onFile,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 border-2 border-dashed rounded-lg">
      <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-medium">ROTH-Prozessmodell-Excel auswählen</p>
        <p className="text-xs text-muted-foreground mt-1">
          .xlsx — muss Sheet „Prozessmodell" mit SE/SA-Blöcken enthalten
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={onFile}
      />
      <Button onClick={() => fileRef.current?.click()} size="sm" className="gap-1">
        <Upload className="h-4 w-4" />
        Excel wählen
      </Button>
    </div>
  );
}

function BlockList({
  blocks,
  fileName,
  onSelect,
  onReset,
}: {
  blocks: ImportedProzess[];
  fileName: string;
  onSelect: (idx: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">{fileName}</span> — {blocks.length} Prozessblöcke
        </p>
        <Button variant="outline" size="sm" onClick={onReset}>Andere Datei</Button>
      </div>
      <ScrollArea className="h-[55vh] rounded border">
        <div className="divide-y">
          {blocks.map((b, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-sm">{b.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {b.schritte.length} Schritte · {Object.keys(b.summeProAbteilung).length} Abteilungen
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold tabular-nums">
                  {b.summeMinProColli.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground">Min/Colli</div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function BlockDetails({
  block,
  fileName,
  multipleBlocks,
  onBack,
  onReset,
}: {
  block: ImportedProzess;
  fileName: string;
  multipleBlocks: boolean;
  onBack: () => void;
  onReset: () => void;
}) {
  const abteilungen = useMemo(
    () => Object.entries(block.summeProAbteilung).sort((a, b) => b[1] - a[1]),
    [block],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {multipleBlocks && (
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 h-7">
              <ArrowLeft className="h-3.5 w-3.5" />
              Zur Liste
            </Button>
          )}
          <div>
            <div className="font-medium text-sm">{block.name}</div>
            <div className="text-xs text-muted-foreground">{fileName}</div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>Andere Datei</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <SummaryCard label="Gesamt" value={block.summeMinProColli} unit="Min/Colli" highlight />
        {abteilungen.map(([abt, sum]) => (
          <SummaryCard key={abt} label={abt} value={sum} unit="Min/Colli" />
        ))}
      </div>

      <div>
        <div className="text-xs font-medium text-muted-foreground mb-2">
          Prozessschritte ({block.schritte.length})
        </div>
        <ScrollArea className="h-[45vh] rounded border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="text-left">
                <th className="px-2 py-1.5 font-medium">Nr.</th>
                <th className="px-2 py-1.5 font-medium">Beschreibung</th>
                <th className="px-2 py-1.5 font-medium">Abteilung</th>
                <th className="px-2 py-1.5 font-medium">Hilfsmittel</th>
                <th className="px-2 py-1.5 font-medium text-right">Anteil</th>
                <th className="px-2 py-1.5 font-medium text-right">Häuf./Tag</th>
                <th className="px-2 py-1.5 font-medium text-right">Min/Colli</th>
              </tr>
            </thead>
            <tbody>
              {block.schritte.map((s, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  <td className="px-2 py-1.5 font-mono tabular-nums">{s.nr || ''}</td>
                  <td className="px-2 py-1.5 max-w-[280px] truncate" title={s.beschreibung}>{s.beschreibung}</td>
                  <td className="px-2 py-1.5">
                    <Badge variant="secondary" className="font-normal text-[10px]">
                      {s.abteilung || '—'}
                    </Badge>
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground">{s.hilfsmittel}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                    {s.anteil != null ? s.anteil.toFixed(2) : ''}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                    {s.haeufigkeitJeTag != null ? s.haeufigkeitJeTag.toFixed(1) : ''}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums font-medium">
                    {s.zeitGewichtetMinProColli.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2">
        Werte direkt aus Excel — nicht über den TOPIS-Rechner neu berechnet. Parameteränderungen
        erfordern erneutes Speichern der Quell-Excel und neuen Import.
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 min-w-[110px] ${
        highlight ? 'bg-primary text-primary-foreground' : 'bg-card'
      }`}
    >
      <div className={`text-[10px] uppercase tracking-wide ${highlight ? 'opacity-80' : 'text-muted-foreground'}`}>
        {label}
      </div>
      <div className="font-mono text-base font-semibold tabular-nums">
        {value.toFixed(5)}
      </div>
      <div className={`text-[10px] ${highlight ? 'opacity-80' : 'text-muted-foreground'}`}>
        {unit}
      </div>
    </div>
  );
}
