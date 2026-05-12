'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { PROZESSMODELL_TEMPLATES, getTemplateParameter } from '@/lib/data/prozessmodell-templates';
import type { ProzessParameter } from '@/types/prozessmodell';
import { Calculator, Settings, List, BarChart3, ChevronDown, ChevronRight, Upload } from 'lucide-react';
import { parseProzessmodellExcel } from '@/lib/prozessmodell-import';
import { toast } from 'sonner';

export function ProzessmodellDialog() {
  const [open, setOpen] = useState(false);
  const modell = useProzessmodellStore((s) => s.modell);
  const parameter = useProzessmodellStore((s) => s.parameter);
  const ergebnis = useProzessmodellStore((s) => s.ergebnis);
  const updateParameter = useProzessmodellStore((s) => s.updateParameter);
  const berechne = useProzessmodellStore((s) => s.berechne);
  const ladeModell = useProzessmodellStore((s) => s.ladeModell);

  const [expandedAbt, setExpandedAbt] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    modell.abteilungen.forEach((a, i) => { init[a.id] = i === 0; });
    return init;
  });

  // Auto-Berechnung bei Dialog-Öffnung
  useEffect(() => {
    if (open) berechne();
  }, [open, berechne]);

  const toggleAbt = (abt: string) => {
    setExpandedAbt((prev) => ({ ...prev, [abt]: !prev[abt] }));
  };

  // Dynamische Kategorien aus Modell-Abteilungen
  const kategorien = useMemo(() => {
    const result: { key: string; label: string }[] = [{ key: 'allgemein', label: 'Allgemein' }];
    modell.abteilungen.forEach((a) => {
      result.push({ key: a.id, label: a.label });
    });
    return result;
  }, [modell.abteilungen]);

  const excelFileRef = useRef<HTMLInputElement>(null);

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { modell: importedModell, parameter: importedParameter } = await parseProzessmodellExcel(file);
      // Wenn keine Parameter aus Excel, Standard-Allgemein-Parameter erzeugen
      const params = importedParameter.length > 0 ? importedParameter : [
        { id: 'arbeitsminProStunde', name: 'Arbeitsminuten/Stunde', einheit: 'min', standardwert: 52.9, aktuellerWert: 52.9, quelle: 'eingabe' as const, kategorie: 'allgemein' },
        { id: 'colliProTag', name: 'Colli/Tag', einheit: 'Colli', standardwert: 15000, aktuellerWert: 15000, quelle: 'eingabe' as const, kategorie: 'allgemein' },
        { id: 'verteilweg', name: 'Gewichteter Verteilweg', einheit: 'm', standardwert: 138.8, aktuellerWert: 138.8, quelle: 'eingabe' as const, kategorie: 'allgemein' },
      ];
      ladeModell(importedModell, params);
      const init: Record<string, boolean> = {};
      importedModell.abteilungen.forEach((a, i) => { init[a.id] = i === 0; });
      setExpandedAbt(init);
      toast.success(`Prozessmodell aus Excel geladen: ${importedModell.schritte.length} Schritte, ${importedModell.abteilungen.length} Abteilungen`);
    } catch (err) {
      toast.error('Fehler beim Import: ' + (err as Error).message);
    }
    if (excelFileRef.current) excelFileRef.current.value = '';
  };

  const handleModellWechsel = (templateId: string) => {
    const template = PROZESSMODELL_TEMPLATES.find((t) => t.modell.id === templateId);
    if (template) {
      ladeModell(template.modell, getTemplateParameter(templateId));
      // Reset expanded state
      const init: Record<string, boolean> = {};
      template.modell.abteilungen.forEach((a, i) => { init[a.id] = i === 0; });
      setExpandedAbt(init);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <Calculator className="h-3.5 w-3.5" />
          Prozessmodell
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {modell.name}
          </DialogTitle>
          <DialogDescription>{modell.beschreibung}</DialogDescription>
        </DialogHeader>

        {/* Modell-Auswahl + Excel Import */}
        <div className="flex items-center gap-2 mb-2">
          {PROZESSMODELL_TEMPLATES.length > 1 && (
            <>
              <Label className="text-xs">Modell:</Label>
              <select
                value={modell.id}
                onChange={(e) => handleModellWechsel(e.target.value)}
                className="h-7 text-xs rounded border bg-background px-2"
              >
                {PROZESSMODELL_TEMPLATES.map((t) => (
                  <option key={t.modell.id} value={t.modell.id}>
                    {t.modell.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <div className="flex-1" />
          <input
            ref={excelFileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => excelFileRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" />
            Aus Excel laden
          </Button>
        </div>

        <Tabs defaultValue="ergebnis" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ergebnis" className="gap-1 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              Ergebnis
            </TabsTrigger>
            <TabsTrigger value="parameter" className="gap-1 text-xs">
              <Settings className="h-3.5 w-3.5" />
              Parameter
            </TabsTrigger>
            <TabsTrigger value="schritte" className="gap-1 text-xs">
              <List className="h-3.5 w-3.5" />
              Schritte
            </TabsTrigger>
          </TabsList>

          {/* ==================== Tab: Ergebnis ==================== */}
          <TabsContent value="ergebnis" className="space-y-4">
            {ergebnis ? (
              <>
                {/* Min/Colli Gesamtkarte */}
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 text-center">
                  <div className="text-4xl font-bold">{ergebnis.minProColli.toFixed(3)}</div>
                  <div className="text-sm text-muted-foreground">Min / Colli (gesamt)</div>
                </div>

                {/* Abteilungs-Karten */}
                <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${ergebnis.abteilungen.length}, 1fr)` }}>
                  {ergebnis.abteilungen.map((abt) => (
                    <div
                      key={abt.abteilung}
                      className="rounded-lg border p-3 text-center"
                      style={{ borderColor: abt.color + '60' }}
                    >
                      <div
                        className="text-2xl font-bold"
                        style={{ color: abt.color }}
                      >
                        {abt.minProColli.toFixed(3)}
                      </div>
                      <div className="text-xs text-muted-foreground">{abt.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round(abt.anteilGesamt * 100)}% | {abt.schritteAnzahl} Schritte
                      </div>
                    </div>
                  ))}
                </div>

                {/* Abteilungs-Balken (visuell) */}
                <div className="space-y-1">
                  <Label className="text-xs">Zeitverteilung nach Abteilung</Label>
                  <div className="flex h-8 rounded overflow-hidden">
                    {ergebnis.abteilungen
                      .filter((a) => a.anteilGesamt > 0)
                      .map((abt) => (
                        <div
                          key={abt.abteilung}
                          className="flex items-center justify-center text-white text-xs font-medium"
                          style={{
                            width: `${Math.max(abt.anteilGesamt * 100, 5)}%`,
                            backgroundColor: abt.color,
                          }}
                          title={`${abt.label}: ${abt.minProColli.toFixed(3)} Min/Cll (${Math.round(abt.anteilGesamt * 100)}%)`}
                        >
                          {abt.anteilGesamt > 0.1 && abt.label.substring(0, 3)}
                        </div>
                      ))}
                  </div>
                </div>

                {/* MA-Bedarf */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-xl font-bold">{ergebnis.colliProTag.toLocaleString('de-DE')}</div>
                    <div className="text-xs text-muted-foreground">Colli / Tag</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-xl font-bold">{Math.round(ergebnis.maStundenBedarf)}</div>
                    <div className="text-xs text-muted-foreground">MA-Stunden / Tag</div>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <div className="text-xl font-bold">{ergebnis.fte.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">FTE</div>
                  </div>
                </div>

                {/* Produktivitäts-KPI */}
                <div className="rounded-lg border bg-muted/50 p-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    Colli / MA-Stunde:{' '}
                    <strong>
                      {ergebnis.maStundenBedarf > 0
                        ? Math.round(ergebnis.colliProTag / ergebnis.maStundenBedarf)
                        : '-'}
                    </strong>
                  </div>
                  <div>
                    Arbeitsmin. / Stunde: <strong>{ergebnis.arbeitsminProStunde}</strong>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Klicke &quot;Berechnen&quot; um die Analyse zu starten.
                <Button className="mt-2 block mx-auto" size="sm" onClick={berechne}>
                  Berechnen
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ==================== Tab: Parameter ==================== */}
          <TabsContent value="parameter" className="space-y-4">
            {kategorien.map(({ key, label }) => {
              const params = parameter.filter((p) => p.kategorie === key);
              if (params.length === 0) return null;
              return (
                <div key={key} className="space-y-2">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </Label>
                  <div className="space-y-1">
                    {params.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm">
                        <span className="flex-1 truncate" title={p.beschreibung}>
                          {p.name}
                        </span>
                        <Input
                          type="number"
                          value={p.aktuellerWert}
                          onChange={(e) => updateParameter(p.id, parseFloat(e.target.value) || 0)}
                          className="w-24 h-7 text-xs text-right"
                          step={p.einheit === '%' ? 1 : 0.1}
                        />
                        <span className="text-xs text-muted-foreground w-12">{p.einheit}</span>
                        {p.quelle !== 'eingabe' && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              p.quelle === 'layout'
                                ? 'bg-blue-500/10 text-blue-500'
                                : p.quelle === 'scandaten'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {p.quelle}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={berechne}>
                <Calculator className="h-3.5 w-3.5 mr-1" />
                Neu berechnen
              </Button>
            </div>
          </TabsContent>

          {/* ==================== Tab: Schritte ==================== */}
          <TabsContent value="schritte" className="space-y-2">
            {modell.abteilungen.map((abtDef) => {
              const schritte = modell.schritte.filter((s) => s.abteilung === abtDef.id);
              const isExpanded = expandedAbt[abtDef.id];
              const gesamtSek = schritte.reduce(
                (sum, s) => sum + s.standardzeitSek * s.anteil * s.haeufigkeit,
                0
              );

              return (
                <div key={abtDef.id} className="border rounded-lg overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-2 bg-muted/50 hover:bg-muted text-sm font-medium"
                    onClick={() => toggleAbt(abtDef.id)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: abtDef.color }}
                      />
                      {abtDef.label} ({schritte.length} Schritte)
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(gesamtSek / 60).toFixed(3)} Min/Cll
                    </span>
                  </button>

                  {isExpanded && (
                    <table className="w-full text-xs">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="text-left p-1.5 pl-3 font-medium">Nr</th>
                          <th className="text-left p-1.5 font-medium">Beschreibung</th>
                          <th className="text-right p-1.5 font-medium">Weg</th>
                          <th className="text-right p-1.5 font-medium">Zeit</th>
                          <th className="text-right p-1.5 font-medium">Anteil</th>
                          <th className="text-right p-1.5 font-medium">Häufig.</th>
                          <th className="text-right p-1.5 pr-3 font-medium">Erg.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schritte.map((s) => {
                          const erg = s.standardzeitSek * s.anteil * s.haeufigkeit;
                          return (
                            <tr key={s.nr} className="border-t hover:bg-muted/20">
                              <td className="p-1.5 pl-3 text-muted-foreground">{s.nr}</td>
                              <td className="p-1.5">
                                {s.beschreibung}
                                {s.wegAusLayout && (
                                  <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-500">
                                    Layout
                                  </span>
                                )}
                              </td>
                              <td className="p-1.5 text-right">
                                {s.wegM > 0 ? `${s.wegM.toFixed(0)}m` : '-'}
                              </td>
                              <td className="p-1.5 text-right">{s.standardzeitSek.toFixed(1)}s</td>
                              <td className="p-1.5 text-right">{(s.anteil * 100).toFixed(0)}%</td>
                              <td className="p-1.5 text-right">{s.haeufigkeit}</td>
                              <td className="p-1.5 pr-3 text-right font-medium">{erg.toFixed(1)}s</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
