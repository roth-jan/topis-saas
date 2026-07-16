'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Factory, PencilRuler, Upload, ArrowRight } from 'lucide-react';
import { erzeugeModellAusVorlage, erzeugeLeeresModell, type VorlagenTyp } from '@/lib/prozessmodell-vorlagen';
import type { NativesProzessmodell } from '@/lib/prozessmodell-nativ';

/** Aktueller Monat als 'MM/YYYY'. */
export function aktuellerMonat(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

/** 'MM/YYYY' → Folgemonat. */
export function naechsterMonat(monat: string): string {
  const m = /^(\d{1,2})\s*\/\s*(\d{4})$/.exec(monat.trim());
  if (!m) return aktuellerMonat();
  let mm = +m[1] + 1;
  let jj = +m[2];
  if (mm > 12) { mm = 1; jj++; }
  return `${String(mm).padStart(2, '0')}/${jj}`;
}

/** Eckdaten-Vorbelegung (z.B. aus dem /check-Funnel via sessionStorage). */
export interface CockpitVorbelegung {
  colliProMonat?: number;
  arbeitstage?: number;
  quelle?: string;
}

/**
 * Die drei Türen ins Prozessmodell:
 *   1. Excel importieren (Migration — für Kunden MIT bestehendem Modell)
 *   2. ROTH-Vorlage + Eckdaten (für Kunden OHNE Excel: kalibrierte Methodik)
 *   3. Leer starten (Berater/Experten bauen selbst)
 * Kommt der Nutzer aus dem /check, ist Tür 2 vorbefüllt und offen.
 */
export function StartTueren({
  onExcel,
  onModell,
  vorbelegung,
}: {
  onExcel: () => void;
  onModell: (m: NativesProzessmodell) => void;
  vorbelegung?: CockpitVorbelegung | null;
}) {
  const [vorlageOffen, setVorlageOffen] = useState(false);
  // Vorbelegung kommt asynchron (sessionStorage-Effect) → abgeleitet öffnen,
  // damit die Tür auch aufgeht, wenn der Wert nach dem Mount eintrifft.
  const zeigeVorlage = vorlageOffen || Boolean(vorbelegung);

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-4 pt-8">
      <div className="text-center mb-2">
        <h2 className="font-display text-lg font-semibold">Womit möchten Sie starten?</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Das Prozessmodell lebt in TOPIS — voll editierbar, monatlich fortschreibbar, mit Trend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Tuer
          icon={<FileSpreadsheet className="h-7 w-7" />}
          titel="Excel importieren"
          text="Ihr bestehendes Prozessmodell wird einmalig übernommen — auf den Cent nachgerechnet, danach editieren Sie in TOPIS."
          aktion="Excel wählen"
          aktionIcon={<Upload className="h-3.5 w-3.5" />}
          onClick={onExcel}
        />
        <Tuer
          icon={<Factory className="h-7 w-7" />}
          titel="ROTH-Vorlage"
          text="Kein eigenes Modell? Starten Sie mit der kalibrierten ROTH-Methodik (Zeitaufnahmen aus echten Umschlaghallen) und Ihren Eckdaten."
          aktion="Eckdaten eingeben"
          aktionIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => setVorlageOffen((v) => !v)}
          aktiv={zeigeVorlage}
          empfohlen
        />
        <Tuer
          icon={<PencilRuler className="h-7 w-7" />}
          titel="Leer starten"
          text="Für Berater und Experten: eigenes Modell von Grund auf bauen — Blöcke, Schritte, Zeiten, alles von Hand."
          aktion="Leeres Modell"
          aktionIcon={<ArrowRight className="h-3.5 w-3.5" />}
          onClick={() => onModell(erzeugeLeeresModell(aktuellerMonat()))}
        />
      </div>

      {zeigeVorlage && <VorlagenFormular key={vorbelegung ? 'check' : 'manuell'} onModell={onModell} vorbelegung={vorbelegung} />}
    </div>
  );
}

function Tuer({
  icon,
  titel,
  text,
  aktion,
  aktionIcon,
  onClick,
  aktiv = false,
  empfohlen = false,
}: {
  icon: React.ReactNode;
  titel: string;
  text: string;
  aktion: string;
  aktionIcon: React.ReactNode;
  onClick: () => void;
  aktiv?: boolean;
  empfohlen?: boolean;
}) {
  return (
    <div className={`relative rounded-xl border bg-card p-4 flex flex-col gap-2 transition-shadow hover:shadow-md ${aktiv ? 'ring-1 ring-ring border-ring' : ''}`}>
      {empfohlen && (
        <span className="absolute -top-2 right-3 rounded-full bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
          Ohne Excel
        </span>
      )}
      <div className="text-primary">{icon}</div>
      <div className="font-medium text-sm">{titel}</div>
      <p className="text-xs text-muted-foreground flex-1">{text}</p>
      <Button variant={empfohlen ? 'default' : 'outline'} size="sm" className="gap-1 text-xs w-full" onClick={onClick}>
        {aktionIcon}
        {aktion}
      </Button>
    </div>
  );
}

function VorlagenFormular({
  onModell,
  vorbelegung,
}: {
  onModell: (m: NativesProzessmodell) => void;
  vorbelegung?: CockpitVorbelegung | null;
}) {
  const [typ, setTyp] = useState<VorlagenTyp>('se');
  const [monat, setMonat] = useState(aktuellerMonat());
  const [colli, setColli] = useState(String(vorbelegung?.colliProMonat ?? 300000));
  const [arbeitstage, setArbeitstage] = useState(String(vorbelegung?.arbeitstage ?? 21));
  const [verteilweg, setVerteilweg] = useState('');

  const erzeugen = () => {
    const c = parseFloat(colli);
    const at = parseFloat(arbeitstage);
    if (!Number.isFinite(c) || c <= 0 || !Number.isFinite(at) || at <= 0) return;
    const vw = parseFloat(verteilweg);
    onModell(
      erzeugeModellAusVorlage(typ, {
        monat: monat.trim() || aktuellerMonat(),
        colliProMonat: c,
        arbeitstage: at,
        verteilwegM: Number.isFinite(vw) && vw > 0 ? vw : undefined,
      }),
    );
  };

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div className="text-sm font-medium">ROTH-Vorlage: Eckdaten</div>
      {vorbelegung?.quelle === 'check' && (
        <p className="text-[11px] rounded bg-primary/10 text-primary px-2 py-1.5">
          Ihre Eckdaten aus dem Hallen-Check sind übernommen — bitte prüfen und bei Bedarf anpassen.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['se', 'Eingang (SE)'],
            ['sa', 'Ausgang (SA)'],
            ['se_sa', 'Beides'],
          ] as [VorlagenTyp, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTyp(t)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              typ === t ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Feld label="Monat" hinweis="MM/JJJJ">
          <Input value={monat} onChange={(e) => setMonat(e.target.value)} className="h-8 text-xs" placeholder="07/2026" />
        </Feld>
        <Feld label="Colli je Monat" hinweis="Ihre Umschlagmenge">
          <Input type="number" value={colli} onChange={(e) => setColli(e.target.value)} className="h-8 text-xs text-right font-mono" />
        </Feld>
        <Feld label="Arbeitstage" hinweis="im Monat">
          <Input type="number" value={arbeitstage} onChange={(e) => setArbeitstage(e.target.value)} className="h-8 text-xs text-right font-mono" />
        </Feld>
        <Feld label="ø Verteilweg (m)" hinweis="leer = ROTH-Standard">
          <Input type="number" value={verteilweg} onChange={(e) => setVerteilweg(e.target.value)} className="h-8 text-xs text-right font-mono" placeholder="138,8" />
        </Feld>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground">
          Standardzeiten und Anteile stammen aus der ROTH-Zeitaufnahme — danach im Grid frei anpassbar.
        </p>
        <Button size="sm" className="gap-1 text-xs shrink-0" onClick={erzeugen}>
          <ArrowRight className="h-3.5 w-3.5" />
          Modell erzeugen
        </Button>
      </div>
    </div>
  );
}

function Feld({ label, hinweis, children }: { label: string; hinweis: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium">{label}</span>
      {children}
      <span className="text-[10px] text-muted-foreground">{hinweis}</span>
    </label>
  );
}
