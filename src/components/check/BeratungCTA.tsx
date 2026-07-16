'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';
import type { AmpelBewertung } from '@/lib/ampel-system';

interface BeratungCTAProps {
  bewertung: AmpelBewertung;
  onOpenEditor?: () => void;
  /** Primärer Produkt-Pfad (UX-Council 16.07.): weiter ins Hallencockpit,
   * Eckdaten reisen mit — der Editor ist die Vertiefung, nicht der Einstieg. */
  onOpenCockpit?: () => void;
}

/**
 * Call-to-Action Bereich: Zeigt das Hauptergebnis und den Beratungs-Button.
 */
export function BeratungCTA({ bewertung, onOpenEditor, onOpenCockpit }: BeratungCTAProps) {
  const hasProblems = bewertung.roteAmpeln > 0 || bewertung.gelbeAmpeln > 0;
  const worstKPI = bewertung.kpis.find((k) => k.status === 'rot') || bewertung.kpis.find((k) => k.status === 'gelb');

  return (
    <div className={`rounded-xl border-2 p-6 ${hasProblems ? 'border-red-500/40 bg-red-500/5' : 'border-green-500/40 bg-green-500/5'}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Message */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${hasProblems ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className={`text-lg font-semibold ${hasProblems ? 'text-red-400' : 'text-green-400'}`}>
              {bewertung.headline}
            </span>
          </div>
          {worstKPI && (
            <p className="text-sm text-muted-foreground">
              {worstKPI.potenzialText}
            </p>
          )}
        </div>

        {/* Buttons — Reihenfolge = Priorität: Beratung, dann Cockpit (Produkt),
            Editor nur noch als Vertiefung */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <a href="mailto:info@roth-logistik.de?subject=Hallen-Check%20Beratung&body=Ich%20habe%20den%20TOPIS%20Hallen-Check%20durchgeführt%20und%20möchte%20gerne%20ein%20Beratungsgespräch%20vereinbaren.">
            <Button size="lg" className="gap-2">
              <Phone className="h-4 w-4" />
              Beratungsgespräch vereinbaren
            </Button>
          </a>
          {onOpenCockpit && (
            <Button variant="outline" size="lg" className="gap-2" onClick={onOpenCockpit} title="Ihre Eckdaten reisen mit — im Cockpit pflegen Sie Ihr Prozessmodell monatlich weiter">
              Im Hallencockpit fortsetzen
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {onOpenEditor && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onOpenEditor}>
              Experten-Editor
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
