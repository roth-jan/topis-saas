'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Mail } from 'lucide-react';
import type { AmpelBewertung } from '@/lib/ampel-system';
import { mailtoLink } from '@/lib/kontakt';

interface BeratungCTAProps {
  bewertung: AmpelBewertung;
  onOpenEditor?: () => void;
  /** Weiter ins Hallencockpit (Eckdaten reisen mit) — der Editor ist die Vertiefung. */
  onOpenCockpit?: () => void;
}

/** Abschluss des Ergebnisses: Hauptaussage in einem Satz + die nächsten Schritte. */
export function BeratungCTA({ bewertung, onOpenEditor, onOpenCockpit }: BeratungCTAProps) {
  const betreff = 'Hallen-Check: Gespräch zu meinen Ergebnissen';
  const text = `Guten Tag,\n\nich habe den TOPIS Hallen-Check durchgeführt (${bewertung.headline}) und möchte die Ergebnisse gern mit Ihnen besprechen.\n\nViele Grüße`;
  return (
    <div className="rounded-xl border bg-muted/60 p-6 md:p-8">
      <h3 className="max-w-2xl text-xl font-semibold tracking-tight md:text-2xl">{bewertung.headline}</h3>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{bewertung.unterzeile}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild size="lg" className="gap-2">
          <a href={mailtoLink(betreff, text)}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Gespräch anfragen
          </a>
        </Button>
        {onOpenCockpit && (
          <Button variant="outline" size="lg" className="gap-2" onClick={onOpenCockpit}>
            Im Hallencockpit weiterrechnen
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        {onOpenEditor && (
          <Button variant="ghost" size="lg" className="text-muted-foreground" onClick={onOpenEditor}>
            Hallenplan im Editor öffnen
          </Button>
        )}
      </div>
    </div>
  );
}
