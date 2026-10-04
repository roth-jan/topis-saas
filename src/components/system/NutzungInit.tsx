"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { istLadevorgang, protokolliere } from "@/lib/nutzung";
import { useTopisStore } from "@/lib/store";

/**
 * Nutzungsprotokoll — die Ereignisse, die keine einzelne Schaltfläche kennt:
 * Seitenaufrufe und das, was im Hallenplan über den Store passiert (Werkzeug
 * gewählt, Objekte eingefügt, Rückgängig). So muss nicht jede der vielen
 * Einfüge-Wege (Tor-Reihe, Serie, Einzel-Klick, KI) einzeln verdrahtet werden.
 *
 * Was überhaupt gesendet wird und was nie, steht in src/lib/nutzung.ts
 * (nur angemeldet, keine Inhalte, nichts auf dem Gerät).
 */
export function NutzungInit() {
  const pathname = usePathname();

  useEffect(() => {
    protokolliere("seite_geoeffnet");
  }, [pathname]);

  useEffect(() => {
    // Eingefügte Objekte bündeln: Eine Tor-Reihe sind 20 Store-Änderungen
    // in kurzer Folge, gemeldet werden soll EIN Ereignis „20 Tore".
    let buendel: Record<string, number> = {};
    let timer: ReturnType<typeof setTimeout> | null = null;
    const melden = () => {
      timer = null;
      const typen = Object.entries(buendel).sort((a, b) => b[1] - a[1]);
      buendel = {};
      if (typen.length === 0) return;
      const anzahl = typen.reduce((s, [, n]) => s + n, 0);
      protokolliere("objekte_eingefuegt", { typ: typen[0][0], anzahl, typen: typen.length });
    };

    const abmelden = useTopisStore.subscribe((s, vorher) => {
      if (s.currentTool !== vorher.currentTool && s.currentTool !== "select") {
        protokolliere("werkzeug_gewaehlt", { werkzeug: String(s.currentTool) });
      }
      const rueck = s.redoStack.length > vorher.redoStack.length;
      if (rueck) protokolliere("rueckgaengig");
      // Kein „Einfügen": Wiederherstellen aus dem Speicher beim Seitenladen,
      // Rückgängig (holt Gelöschtes zurück), Vorlage/Demo laden.
      const geladen = !useTopisStore.persist.hasHydrated() || rueck || istLadevorgang();
      if (!geladen && s.objects.length > vorher.objects.length) {
        const alt = new Set(vorher.objects.map((o) => o.id));
        for (const o of s.objects) {
          if (!alt.has(o.id)) buendel[o.type] = (buendel[o.type] ?? 0) + 1;
        }
        if (timer) clearTimeout(timer);
        timer = setTimeout(melden, 1500);
      }
    });
    return () => {
      abmelden();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
