import Link from 'next/link';
import { LogoMark } from '@/components/Logo';
import { ANBIETER } from '@/lib/kontakt';

/** Gemeinsamer Seitenfuß der öffentlichen Seiten (Start, Hallen-Check, Rechtliches). */
export function SiteFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`border-t border-border ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <LogoMark size={24} />
          <span className="font-display text-foreground" style={{ fontWeight: 600 }}>TOPIS</span>
          <span>© 2026 {ANBIETER.name}</span>
        </div>
        <nav className="flex gap-5">
          <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
          <a href={`mailto:${ANBIETER.email}`} className="hover:text-foreground">Kontakt</a>
        </nav>
      </div>
    </footer>
  );
}
