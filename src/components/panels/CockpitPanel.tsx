'use client';

import { useMemo, useState } from 'react';
import { useTopisStore } from '@/lib/store';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, AlertTriangle, Activity, Clock, Route as RouteIcon, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { findPathBetweenObjects } from '@/lib/pathfinding';

/**
 * Cockpit-Panel — Vaters Idee: aus dem Plan-System ein Tages-Werkzeug machen.
 *
 * Zeigt aggregiert:
 * - Engpass-Tore (Top 5 nach Volumen, rote Markierung)
 * - Stundenaufwand kumuliert aus Min/Colli × Volumen
 * - SE/SA getrennt
 * - Live-Vergleich gespeicherter Varianten (Tag/Woche/Monat)
 *
 * Liest aus dem Betriebsdaten-Store (Heatmap-Daten) + Prozessmodell-Store
 * (Min/Colli) und visualisiert sie als operatives Tages-Cockpit.
 */

interface SavedVariant {
  id: string;
  name: string;
  timestamp: number;
  totalColli: number;
  totalStunden: number;
  topToreVolumen: { name: string; colli: number }[];
}

export function CockpitPanel() {
  const analyse = useBetriebsdatenStore((s) => s.analyse);
  const objects = useTopisStore((s) => s.objects);
  const gaenge = useTopisStore((s) => s.gaenge);
  const ergebnis = useProzessmodellStore((s) => s.ergebnis);
  const parameter = useProzessmodellStore((s) => s.parameter);

  const [variants, setVariants] = useState<SavedVariant[]>([]);
  const [routeStart, setRouteStart] = useState<number | null>(null);
  const [routeEnd, setRouteEnd] = useState<number | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<{ id: string; label: string; distanz: number; sek: number }[]>([]);

  // Auswählbare Punkte: Tore und benannte Bereiche
  const routeOptions = useMemo(() => {
    return objects
      .filter((o) => o.type === 'tor' || (o.type === 'bereich' && o.name))
      .sort((a, b) => {
        const aTor = a.type === 'tor';
        const bTor = b.type === 'tor';
        if (aTor && !bTor) return -1;
        if (!aTor && bTor) return 1;
        return (a.torNummer ?? 999) - (b.torNummer ?? 999);
      });
  }, [objects]);

  // Live-Routenberechnung
  const liveRoute = useMemo(() => {
    if (routeStart === null || routeEnd === null) return null;
    const a = objects.find((o) => o.id === routeStart);
    const b = objects.find((o) => o.id === routeEnd);
    if (!a || !b) return null;
    try {
      const result = findPathBetweenObjects(a, b, gaenge);
      if (!result) return { error: 'Keine Route gefunden (Gänge fehlen?)' };
      // Geschwindigkeit-Annahme: 2.44 m/s (Schnelläufer)
      const SPEED = 2.44;
      const sek = result.distance / SPEED;
      return {
        from: a.name,
        to: b.name,
        distanz: result.distance,
        sek,
        error: null,
      };
    } catch (e) {
      return { error: (e as Error).message };
    }
  }, [routeStart, routeEnd, objects, gaenge]);

  const saveCurrentRoute = () => {
    if (!liveRoute || liveRoute.error || !('distanz' in liveRoute)) return;
    setSavedRoutes((r) => [...r, {
      id: `route-${Date.now()}`,
      label: `${liveRoute.from} → ${liveRoute.to}`,
      distanz: liveRoute.distanz,
      sek: liveRoute.sek,
    }]);
    toast.success(`${liveRoute.from} → ${liveRoute.to}: ${Math.round(liveRoute.distanz)}m`);
  };

  const minProColli = ergebnis?.minProColli ?? 0;
  const arbeitsminProStunde =
    parameter.find((p) => p.id === 'arbeitsminProStunde')?.aktuellerWert ?? 52.9;

  // Aggregation aus den Heatmap-Daten
  const stats = useMemo(() => {
    if (!analyse || analyse.objektMetriken.length === 0) {
      return null;
    }
    const metriken = analyse.objektMetriken;
    const totalColli = metriken.reduce((s, m) => s + m.colli, 0);
    const totalSendungen = metriken.reduce((s, m) => s + m.sendungen, 0);
    // Stunden-Aufwand: Colli × Min/Colli / Min-pro-Std
    const totalStunden = minProColli > 0
      ? (totalColli * minProColli) / arbeitsminProStunde
      : 0;

    // Top-Tore nach Colli
    const sortedByColli = [...metriken].sort((a, b) => b.colli - a.colli);
    const topTore = sortedByColli.slice(0, 5);

    // Engpass-Schwelle: > 80 % vom Top-Volumen = rot
    const maxColli = sortedByColli[0]?.colli ?? 1;
    const engpassSchwelle = maxColli * 0.8;
    const engpassTore = metriken.filter((m) => m.colli > engpassSchwelle);

    // SE/SA-Trennung: per Tor-Name oder MP-Code
    const seKeys = ['MP5', 'MP2', 'MP9b'];
    const saKeys = ['MP7', 'MP4', 'MP4a', 'MP9a'];
    const seColli = metriken
      .filter((m) =>
        seKeys.some(
          (k) =>
            m.objectName.toUpperCase().includes(k) ||
            objects.find((o) => o.id === m.objectId)?.meta?.code === k
        )
      )
      .reduce((s, m) => s + m.colli, 0);
    const saColli = metriken
      .filter((m) =>
        saKeys.some(
          (k) =>
            m.objectName.toUpperCase().includes(k) ||
            objects.find((o) => o.id === m.objectId)?.meta?.code === k
        )
      )
      .reduce((s, m) => s + m.colli, 0);

    return {
      totalColli,
      totalSendungen,
      totalStunden,
      arbeitstage: analyse.arbeitstage,
      topTore,
      engpassTore,
      seColli,
      saColli,
      maxColli,
    };
  }, [analyse, minProColli, arbeitsminProStunde, objects]);

  const saveCurrentAsVariant = () => {
    if (!stats) return;
    const name = `Variante ${variants.length + 1}`;
    setVariants((v) => [
      ...v,
      {
        id: `var-${Date.now()}`,
        name,
        timestamp: Date.now(),
        totalColli: stats.totalColli,
        totalStunden: stats.totalStunden,
        topToreVolumen: stats.topTore.map((t) => ({ name: t.objectName, colli: Math.round(t.colli) })),
      },
    ]);
    toast.success(`${name} gespeichert (${Math.round(stats.totalStunden)} Std/Tag)`);
  };

  if (!stats) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center text-muted-foreground py-8">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Lade Betriebsdaten, um das Cockpit zu aktivieren.</p>
          <p className="text-xs mt-2 text-muted-foreground/70">
            Datei → AS Januar 2026 — echte Scan-Daten laden
          </p>
        </div>
      </div>
    );
  }

  const tagesColli = stats.totalColli / Math.max(stats.arbeitstage, 1);
  const tagesStunden = stats.totalStunden / Math.max(stats.arbeitstage, 1);

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-3">
        {/* Tagesschnitt */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Tagesschnitt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Colli/Tag</div>
                <div className="text-lg font-semibold">
                  {Math.round(tagesColli).toLocaleString('de-DE')}
                </div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">Stunden/Tag</div>
                <div className="text-lg font-semibold">
                  {Math.round(tagesStunden).toLocaleString('de-DE')}
                </div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">SE Colli</div>
                <div className="text-base font-semibold">
                  {Math.round(stats.seColli / stats.arbeitstage).toLocaleString('de-DE')}
                </div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="text-muted-foreground">SA Colli</div>
                <div className="text-base font-semibold">
                  {Math.round(stats.saColli / stats.arbeitstage).toLocaleString('de-DE')}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Gesamt: {stats.totalColli.toLocaleString('de-DE')} Colli über{' '}
              {stats.arbeitstage} Tage
            </div>
          </CardContent>
        </Card>

        {/* Engpass-Tore (rot) */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              Engpass-Tore (Top-Last)
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            {stats.engpassTore.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Spitzenbelastung erkannt.</p>
            ) : (
              <div className="space-y-1.5">
                {stats.engpassTore.slice(0, 8).map((tor) => {
                  const pct = (tor.colli / stats.maxColli) * 100;
                  return (
                    <div key={tor.objectId} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{tor.objectName}</span>
                        <span className="text-red-500 font-semibold">
                          {Math.round(tor.colli).toLocaleString('de-DE')}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-red-500/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stunden-Aufwand */}
        {minProColli > 0 && (
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Personalstunden-Schätzung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 py-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min/Colli (Modell)</span>
                <span className="font-medium">{minProColli.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stunden/Tag (Ø)</span>
                <span className="font-medium">{Math.round(tagesStunden)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stunden/Woche</span>
                <span className="font-medium">{Math.round(tagesStunden * 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stunden/Monat</span>
                <span className="font-medium">{Math.round(stats.totalStunden)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="text-muted-foreground">≈ FTE bei 173 h/Mon</span>
                <span className="font-semibold">
                  {(stats.totalStunden / 173).toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aktuelle als Variante speichern */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={saveCurrentAsVariant}
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          Aktuellen Stand als Variante speichern
        </Button>

        {/* Varianten-Vergleich */}
        {variants.length > 0 && (
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-xs">Varianten-Vergleich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 py-2">
              {variants.map((v, i) => {
                const refStunden = variants[0].totalStunden;
                const delta = v.totalStunden - refStunden;
                const deltaPct = refStunden > 0 ? (delta / refStunden) * 100 : 0;
                return (
                  <div key={v.id} className="text-xs space-y-0.5 border-l-2 border-primary/30 pl-2">
                    <div className="font-medium">{v.name}</div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Stunden/Monat:</span>
                      <span className="font-medium">{Math.round(v.totalStunden)}</span>
                    </div>
                    {i > 0 && (
                      <div className={`flex justify-between ${delta < 0 ? 'text-green-500' : delta > 0 ? 'text-red-500' : ''}`}>
                        <span>Δ vs. Basis:</span>
                        <span className="font-semibold">
                          {delta >= 0 ? '+' : ''}{Math.round(delta)} h ({deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Route-Spiel-Modus */}
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <RouteIcon className="h-3.5 w-3.5" />
              Route durchspielen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 py-2">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Von</label>
              <select
                value={routeStart ?? ''}
                onChange={(e) => setRouteStart(e.target.value ? parseInt(e.target.value) : null)}
                className="flex h-7 w-full rounded border border-input bg-background px-2 text-xs"
              >
                <option value="">— wählen —</option>
                {routeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.type === 'tor' ? `Tor ${o.torNummer ?? o.name}` : o.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground">Nach</label>
              <select
                value={routeEnd ?? ''}
                onChange={(e) => setRouteEnd(e.target.value ? parseInt(e.target.value) : null)}
                className="flex h-7 w-full rounded border border-input bg-background px-2 text-xs"
              >
                <option value="">— wählen —</option>
                {routeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.type === 'tor' ? `Tor ${o.torNummer ?? o.name}` : o.name}
                  </option>
                ))}
              </select>
            </div>

            {liveRoute && (
              <div className="mt-2 p-2 rounded bg-muted text-xs space-y-1">
                {liveRoute.error ? (
                  <span className="text-amber-600">{liveRoute.error}</span>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Strecke</span>
                      <span className="font-semibold">
                        {Math.round((liveRoute as { distanz: number }).distanz)} m
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Zeit (Ø Schnelläufer)</span>
                      <span className="font-semibold">
                        {(liveRoute as { sek: number }).sek.toFixed(1)} s
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={saveCurrentRoute}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Route speichern
                    </Button>
                  </>
                )}
              </div>
            )}

            {savedRoutes.length > 0 && (
              <div className="mt-2 space-y-1 border-t pt-2">
                <div className="text-[10px] text-muted-foreground">Gespeicherte Routen:</div>
                {savedRoutes.map((r, i) => {
                  const ref = savedRoutes[0].distanz;
                  const delta = r.distanz - ref;
                  return (
                    <div key={r.id} className="text-[11px] flex justify-between">
                      <span>{r.label.substring(0, 25)}</span>
                      <span className={i > 0 ? (delta < 0 ? 'text-green-500' : 'text-red-500') : ''}>
                        {Math.round(r.distanz)}m{i > 0 ? ` (${delta >= 0 ? '+' : ''}${Math.round(delta)})` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hinweis-Zeile */}
        <div className="text-[10px] text-muted-foreground italic pt-2 border-t">
          Spiel-Modus: Tore verschieben oder Volumen-Daten aktualisieren →
          dieser Cockpit-Reiter rechnet live nach. Speichern zum Vergleichen.
        </div>
      </div>
    </ScrollArea>
  );
}
