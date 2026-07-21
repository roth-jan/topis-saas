'use client';

import Link from 'next/link';
import { LogoMark } from '@/components/Logo';
import { Badge } from '@/components/ui/badge';
import { ThemeToggleSimple } from '@/components/theme-toggle';
import { CloudMenu } from '@/components/auth/CloudMenu';

/**
 * Gemeinsame Kopfleiste für alle Nicht-Editor-Seiten (Cockpit, Kennzahlen …) —
 * gleiche Optik wie die Editor-Toolbar (Logo, Segmented-Tabs, Cloud/Theme
 * rechts), damit TOPIS wie EINE App wirkt statt wie verlinkte Einzelseiten
 * (UX-Council 16.07.: „Zwei-Welten-Fragmentierung").
 * Der Editor selbst behält seine Toolbar — die Phasenleiste dort führt
 * dieselben Ziele (Cockpit, Planung, Kennzahlen).
 */
export function AppNav({
  aktiv,
  zeile2,
}: {
  aktiv: 'editor' | 'pm-cockpit' | 'planung' | 'kennzahlen';
  zeile2?: React.ReactNode;
}) {
  // Nav benennt ZIELE, keine Stufen (Jan 21.07. nach Blindtest): Die Bereiche
  // stehen gleichrangig nebeneinander, jeder ist für sich benutzbar. Bewusst
  // KEINE Ablaufleiste „Analyse → Halle → …" — sie würde suggerieren, man müsse
  // erst zeichnen, um Kennzahlen zu bekommen. Das stimmt nicht: das Prozessmodell
  // läuft ohne jede Halle (Verteilweg-Fallback = ROTH-Standard). Die Halle ist
  // eine von vier Quellen für EIN Feld, kein Pflichtschritt.
  // Namen sagen, was man bekommt — „Cockpit"/„Werkstatt"/„Projekt" sind raus
  // (Blindtest: „Cockpit" weckte Hallen-Erwartung, lieferte Prozessmodell).
  const tabs: { id: typeof aktiv; label: string; href: string; zweck: string }[] = [
    { id: 'pm-cockpit', label: 'Prozessmodell', href: '/cockpit/', zweck: 'Zeiten je Packstück und Personalbedarf berechnen — geht ohne Hallenplan' },
    { id: 'editor', label: 'Hallenplan', href: '/projekt/', zweck: 'Halle zeichnen und Wege messen — macht den Verteilweg exakt' },
    { id: 'planung', label: 'Auftragsplanung', href: '/projekt/planung/', zweck: 'Aufträge auf Tore verteilen und Auslastung prüfen' },
    { id: 'kennzahlen', label: 'Kennzahlen', href: '/dashboard/', zweck: 'Übersicht aller Kennwerte und Vergleich mit Referenzhallen' },
  ];
  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="h-11 flex items-center px-2 gap-2 border-b border-border/40">
        <Link href="/cockpit/" className="flex items-center gap-2 px-1 shrink-0">
          <LogoMark size={28} />
          <span className="hidden xl:inline font-display text-[15px] tracking-tight" style={{ fontWeight: 800 }}>TOPIS</span>
        </Link>
        <div className="flex items-center gap-0.5 rounded-[10px] bg-muted/60 p-0.5">
          {tabs.map((t) => (
            <Link key={t.id} href={t.href} className="shrink-0" title={t.zweck}>
              <span
                className={`inline-flex h-7 items-center px-2.5 xl:px-3.5 text-xs xl:text-[13px] font-display rounded-[7px] transition-all cursor-pointer ${
                  aktiv === t.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ fontWeight: aktiv === t.id ? 600 : 500 }}
              >
                {t.label}
              </span>
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggleSimple />
          <CloudMenu />
        </div>
      </div>
      {zeile2 && <div className="px-3 py-1.5 flex items-center gap-2 flex-wrap">{zeile2}</div>}
    </header>
  );
}
