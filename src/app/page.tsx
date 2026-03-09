import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, LayoutGrid, Route, BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground">
              T
            </div>
            <span className="font-semibold text-xl">TOPIS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/projekt" className="text-sm text-muted-foreground hover:text-foreground">
              Editor
            </Link>
            <Button variant="outline" size="sm">Anmelden</Button>
            <Button size="sm">Registrieren</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Logistik-Hallenplanung
          <span className="text-primary"> intelligent optimiert</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          TOPIS ist das Tool für Operative Planung und Interaktive Simulation.
          Planen Sie Ihre Umschlaghallen, optimieren Sie Wege und steigern Sie die Produktivität.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/projekt">
              Editor starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg">
            Demo ansehen
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Funktionen</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <LayoutGrid className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Hallenplanung</CardTitle>
              <CardDescription>
                Erstellen Sie Hallenlayouts mit Toren, Stellplätzen und Bereichen
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Route className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Wegeoptimierung</CardTitle>
              <CardDescription>
                A*-Pathfinding und automatische Gang-Generierung
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Kennzahlen</CardTitle>
              <CardDescription>
                Prozesszeit, Distanzen und Produktivitätsanalyse
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Zusammenarbeit</CardTitle>
              <CardDescription>
                Projekte teilen und gemeinsam optimieren
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Bereit für effizientere Logistik?</h2>
            <p className="text-lg opacity-90 mb-6">
              Starten Sie jetzt mit TOPIS und optimieren Sie Ihre Hallenplanung.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/projekt">
                Kostenlos starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center font-bold text-xs text-primary-foreground">
                T
              </div>
              <span className="font-semibold">TOPIS</span>
              <span className="text-muted-foreground text-sm">© 2026 ROTH Logistikberatung</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">Impressum</Link>
              <Link href="#" className="hover:text-foreground">Datenschutz</Link>
              <Link href="#" className="hover:text-foreground">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
