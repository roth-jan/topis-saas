import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoMark } from '@/components/Logo';
import { ArrowRight, LayoutGrid, Route, BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky translucent header (Apple) */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} />
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
            <span className="mx-auto font-mono text-[11px] text-muted-foreground">TOPIS — Umschlaghalle · Layout</span>
          </div>
          <div className="relative bg-card" style={{ height: 380 }}>
            <svg viewBox="0 0 1000 380" className="h-full w-full text-foreground" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="g" width="26" height="26" patternUnits="userSpaceOnUse">
                  <path d="M26 0H0V26" fill="none" stroke="currentColor" strokeOpacity={0.06} strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="1000" height="380" fill="url(#g)" />

              {/* Hallen-Umriss */}
              <rect x="90" y="60" width="820" height="220" rx="5" fill="currentColor" fillOpacity={0.02} stroke="currentColor" strokeOpacity={0.22} strokeWidth="2" />

              {/* Tore (Nordwand) */}
              {Array.from({ length: 16 }).map((_, i) => (
                <rect key={'t' + i} x={118 + i * 50} y={53} width="30" height="9" rx="2" fill="var(--primary)" />
              ))}

              {/* Lagerblöcke — 2 Reihen mit Gängen dazwischen, mit Kopfleiste */}
              {[115, 265, 415, 565, 715].flatMap((x, ci) =>
                [95, 205].map((y, ri) => {
                  const accent = (ci + ri) % 3 === 0;
                  return (
                    <g key={`b${ci}-${ri}`}>
                      <rect x={x} y={y} width="120" height="70" rx="3"
                        fill="var(--primary)" fillOpacity={accent ? 0.09 : 0}
                        stroke="var(--primary)" strokeOpacity={accent ? 0.35 : 0} strokeWidth="1" />
                      {!accent && (
                        <rect x={x} y={y} width="120" height="70" rx="3"
                          fill="currentColor" fillOpacity={0.04} stroke="currentColor" strokeOpacity={0.14} strokeWidth="1" />
                      )}
                      <rect x={x} y={y} width="120" height="9" rx="3"
                        fill={accent ? 'var(--primary)' : 'currentColor'} fillOpacity={accent ? 0.28 : 0.1} />
                    </g>
                  );
                })
              )}

              {/* Verteilweg — läuft nur in den Gängen, nie durch einen Block */}
              <path d="M250 62 L250 185 L550 185 L550 205" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
              <circle cx="250" cy="62" r="4.5" fill="var(--primary)" />
              <circle cx="550" cy="205" r="4.5" fill="var(--primary)" />

              {/* Maßangabe (Berater-/Plan-Anmutung) */}
              <line x1="90" y1="312" x2="910" y2="312" stroke="currentColor" strokeOpacity={0.25} strokeWidth="1" />
              <line x1="90" y1="306" x2="90" y2="318" stroke="currentColor" strokeOpacity={0.25} strokeWidth="1" />
              <line x1="910" y1="306" x2="910" y2="318" stroke="currentColor" strokeOpacity={0.25} strokeWidth="1" />
              <text x="500" y="332" textAnchor="middle" fontSize="13" fill="currentColor" fillOpacity={0.5} fontFamily="var(--font-mono)">≈ 150 m · 16 Tore</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Funktionen</p>
          <h2 className="mt-2 font-display text-3xl tracking-tight" style={{ fontWeight: 700 }}>Alles für die operative Hallenplanung</h2>
          <p className="mt-3 text-muted-foreground">Vom Grundriss bis zur Kennzahl — ein durchgängiger Workflow, direkt im Browser.</p>
        </div>
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

      {/* Abschluss-CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="overflow-hidden rounded-3xl border border-border bg-muted/40 px-8 py-14 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl tracking-tight sm:text-4xl" style={{ fontWeight: 700 }}>
            Bereit, Ihre Halle zu optimieren?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Sofort im Editor loslegen — oder in Sekunden prüfen lassen, wie produktiv Ihre Halle heute arbeitet.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-11 gap-2 rounded-xl px-6">
              <Link href="/projekt">Editor starten <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 rounded-xl px-6">
              <Link href="/check">Hallen-Check starten</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="font-display text-foreground" style={{ fontWeight: 600 }}>TOPIS</span>
            <span>© 2026 ROTH Logistikberatung</span>
          </div>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-foreground">Impressum</Link>
            <Link href="#" className="hover:text-foreground">Datenschutz</Link>
            <a href="mailto:info@roth-logistik.de" className="hover:text-foreground">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
