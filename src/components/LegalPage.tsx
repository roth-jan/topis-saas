import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { SiteFooter } from '@/components/SiteFooter';

/** Rahmen für Impressum/Datenschutz: gleicher Kopf wie die Startseite, lesbare Textspalte. */
export function LegalPage({ title, stand, children }: { title: string; stand?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="font-display text-[15px] tracking-tight" style={{ fontWeight: 700 }}>TOPIS</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Zur Startseite
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pt-14 pb-20">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rechtliches</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl" style={{ fontWeight: 700 }}>{title}</h1>
        {stand && <p className="mt-2 text-sm text-muted-foreground">Stand: {stand}</p>}
        <div className="legal mt-10 space-y-4 text-[15px] leading-relaxed text-foreground/90
          [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground
          [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline
          [&_strong]:font-semibold [&_strong]:text-foreground">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
