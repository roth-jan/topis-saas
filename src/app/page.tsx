import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LayoutGrid, Route, BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky translucent header (Apple) */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary text-primary-foreground font-display" style={{ fontWeight: 800 }}>T</div>
            <span className="font-display text-[15px] tracking-tight" style={{ fontWeight: 700 }}>TOPIS</span>
          </div>
          <nav className="flex items-center gap-1.5">
            <Link href="/check" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Hallen-Check</Link>
            <Button asChild size="sm" className="h-8 gap-1.5 rounded-lg">
              <Link href="/projekt">Editor öffnen <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-20 pb-10 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> ROTH Logistikberatung
        </div>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl" style={{ fontWeight: 700 }}>
          Hallenplanung,<br /><span className="text-primary">intelligent optimiert.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          TOPIS — Operative Planung und interaktive Simulation. Umschlaghallen entwerfen,
          Wege berechnen, Produktivität steigern. Direkt im Browser.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg" className="h-11 gap-2 rounded-xl px-6">
            <Link href="/projekt">Editor starten <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-6">
            <Link href="/check">Hallen-Check</Link>
          </Button>
        </div>
      </section>

      {/* Hero-Visual: gerahmtes Editor-Fenster (Apple-Window) */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex h-9 items-center gap-2 border-b border-border bg-muted/40 px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="mx-auto font-mono text-[11px] text-muted-foreground">TOPIS — Andreas Schmid · Halle 6</span>
          </div>
          <div className="relative bg-[#1b1b1d] p-0" style={{ height: 360 }}>
            <svg viewBox="0 0 1000 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="g" width="26" height="26" patternUnits="userSpaceOnUse">
                  <path d="M26 0H0V26" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="1000" height="360" fill="url(#g)" />
              <rect x="90" y="70" width="820" height="220" rx="4" fill="rgba(255,255,255,.02)" stroke="rgba(255,255,255,.22)" strokeWidth="1.5" />
              {Array.from({ length: 16 }).map((_, i) => (
                <rect key={'n' + i} x={120 + i * 50} y={63} width="30" height="9" rx="2" fill="var(--primary)" />
              ))}
              {[150, 320, 490, 660, 830].map((x) => (
                <rect key={x} x={x} y={120} width="90" height="120" rx="3" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1" />
              ))}
              <path d="M140 66 L140 180 L420 180 L420 280" fill="none" stroke="var(--primary)" strokeWidth="2" strokeDasharray="5 4" />
              <circle cx="140" cy="66" r="4" fill="var(--primary)" />
              <circle cx="420" cy="280" r="4" fill="var(--primary)" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: LayoutGrid, t: 'Hallenplanung', d: 'Tore, Stellplätze, Bereiche und Wände maßstabsgetreu zeichnen.' },
            { icon: Route, t: 'Wegeoptimierung', d: 'A*-Pathfinding über das Gang-Netzwerk, automatische Verteilwege.' },
            { icon: BarChart3, t: 'Kennzahlen', d: 'Prozesszeit, Distanzen, Produktivität — Benchmark gegen Referenzhallen.' },
            { icon: Users, t: 'Zusammenarbeit', d: 'Layouts in der Cloud speichern und gezielt im Team teilen.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-[15px]" style={{ fontWeight: 600 }}>{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] text-primary-foreground font-display" style={{ fontWeight: 800 }}>T</div>
            <span className="font-display text-foreground" style={{ fontWeight: 600 }}>TOPIS</span>
            <span>© 2026 ROTH Logistikberatung</span>
          </div>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-foreground">Impressum</Link>
            <Link href="#" className="hover:text-foreground">Datenschutz</Link>
            <Link href="#" className="hover:text-foreground">Kontakt</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
