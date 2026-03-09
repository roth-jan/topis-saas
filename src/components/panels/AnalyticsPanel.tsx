'use client';

import { useMemo } from 'react';
import { useTopisStore, useActiveHall, useObjects } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  Route,
  Package,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { analyzeProduktivitaet, formatAnalyse } from '@/lib/analytics';

export function AnalyticsPanel() {
  const hall = useActiveHall();
  const objects = useObjects();
  const gaenge = useTopisStore((s) => s.gaenge);
  const ffz = useTopisStore((s) => s.ffz);

  const analyse = useMemo(() => {
    return analyzeProduktivitaet(hall, objects, gaenge, ffz[0]);
  }, [hall, objects, gaenge, ffz]);

  const { kennzahlen, empfehlungen } = useMemo(() => {
    return formatAnalyse(analyse);
  }, [analyse]);

  // Get efficiency color
  const getEffizienzColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Effizienz Score */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Effizienz-Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-2">
              <span className={`text-4xl font-bold ${getEffizienzColor(analyse.effizienzScore)}`}>
                {analyse.effizienzScore.toFixed(0)}
              </span>
              <span className="text-muted-foreground text-sm mb-1">/100</span>
            </div>
            <Progress value={analyse.effizienzScore} className="h-2" />
            {analyse.optimierungspotential > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                {analyse.optimierungspotential.toFixed(0)}% Optimierungspotential
              </p>
            )}
          </CardContent>
        </Card>

        {/* Hallenkennzahlen */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Halle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fläche</span>
              <span>{analyse.hallenFlaeche.toFixed(0)} m²</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nutzfläche</span>
              <span>{analyse.nutzFlaeche.toFixed(0)} m²</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nutzungsfaktor</span>
              <span>{analyse.nutzungsFaktor.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Objektkennzahlen */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Objekte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gesamt</span>
              <Badge variant="secondary">{analyse.objektAnzahl}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stellplätze</span>
              <span>{analyse.stellplatzAnzahl}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tore</span>
              <span>{analyse.torAnzahl}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Regale</span>
              <span>{analyse.regalAnzahl}</span>
            </div>
            {analyse.regalKapazitaet > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Regal-Kapazität</span>
                <span>{analyse.regalKapazitaet} Paletten</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wegekennzahlen */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Wege
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ganglänge</span>
              <span>{analyse.gangLaenge.toFixed(0)} m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gangfläche</span>
              <span>{analyse.gangFlaeche.toFixed(0)} m²</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ganganteil</span>
              <span>{analyse.gangAnteil.toFixed(1)}%</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ø Distanz</span>
              <span className="font-medium">{analyse.durchschnittlicheDistanz.toFixed(1)} m</span>
            </div>
            {analyse.maxDistanz > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max. Distanz</span>
                <span>{analyse.maxDistanz.toFixed(1)} m</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zeitkennzahlen */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Zeit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ø Fahrzeit</span>
              <span>{analyse.durchschnittlicheZeit.toFixed(0)} s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durchsatzzeit</span>
              <span className="font-medium">{analyse.geschaetzteDurchsatzZeit.toFixed(0)} s</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (inkl. Aufnahme + Abgabe)
            </p>
          </CardContent>
        </Card>

        {/* Empfehlungen */}
        {empfehlungen.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Empfehlungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {empfehlungen.map((empfehlung, index) => (
                  <li key={index} className="flex gap-2 text-xs">
                    <CheckCircle className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                    <span>{empfehlung}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
