'use client';

import { GLOSSAR, type GlossarId } from '@/lib/glossar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Fachbegriff mit Erklärung on hover/focus.
 *
 * Aus Jans Blindtest 21.07.2026: Fachbegriffe standen unerklärt im UI. Statt
 * die Begriffe zu ersetzen (Berater brauchen sie), bekommen sie eine dezente
 * gepunktete Unterstreichung und eine Erklärung im Tooltip.
 *
 * Bewusst KEIN Icon daneben — bei ~30 Vorkommen je Seite würde das die
 * Oberfläche zumüllen. Die Unterstreichung reicht als Hinweis.
 */
export function Fachbegriff({
  id,
  children,
  className = '',
}: {
  id: GlossarId;
  /** Abweichender Anzeigetext; ohne Angabe wird der Schlüssel gebraucht. */
  children?: React.ReactNode;
  className?: string;
}) {
  const eintrag = GLOSSAR[id];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={`cursor-help underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${className}`}
        >
          {children ?? id}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {'lang' in eintrag && eintrag.lang && (
          <span className="block font-medium">{eintrag.lang}</span>
        )}
        <span className="block text-pretty">{eintrag.kurz}</span>
      </TooltipContent>
    </Tooltip>
  );
}
