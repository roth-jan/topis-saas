"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/browser";

/**
 * Fehlerüberwachung für TOPIS — meldet Abstürze bei ECHTEN Nutzern.
 *
 * Die nächtlichen Klicktests und der Produktions-Puls fragen beide *uns*: läuft
 * die Seite, tun die Abläufe noch das Richtige. Was einem Tester um 9:40 Uhr im
 * Browser um die Ohren fliegt, erfahren wir dagegen nur, wenn er es erzählt.
 * Genau diese Lücke schließt das hier.
 *
 * Warum TOPIS zuerst und nicht Mitalo (Entscheidung Jan, Tafel 29.09.2026):
 * In einem TOPIS-Fehler steckt ein Hallenlayout, keine Person. Bei Mitalo wären
 * es Gesundheitsdaten, teils von Minderjährigen — dort wird erst angebunden,
 * wenn der Auftragsverarbeitungsvertrag steht und ein Filter für Personendaten
 * gebaut ist.
 *
 * DREI DINGE SIND BEWUSST AUS:
 *
 *  1. **Session Replay.** Das zeichnet den Bildschirm auf — bei uns also die
 *     Halle des Kunden, an der er gerade plant. Es wird gar nicht erst geladen
 *     (die Integration fehlt), nicht nur auf 0 gestellt.
 *  2. **Performance-Messung** (`tracesSampleRate: 0`). Wir suchen Abstürze,
 *     keine Millisekunden; das spart zusätzlich das kostenlose Kontingent
 *     (5.000 Fehler/Monat) für das auf, wofür es da ist.
 *  3. **Konsolen-Krümel.** Die Integration „Console" schreibt jede
 *     `console.log`-Ausgabe mit — in TOPIS landen dort beim Rechnen auch
 *     Layout-Objekte mit Hallen- und Bereichsnamen. Klick-, Navigations- und
 *     Netzwerk-Spuren bleiben an, die reichen zum Nachvollziehen.
 *
 * (Der Browser sendet von sich aus keine Personendaten; `sendDefaultPii` gibt es
 * in den Browser-Einstellungen gar nicht. IP-Adressen verwirft Sentry zusätzlich
 * serverseitig — in der Organisation am 27.09.2026 so eingestellt.)
 *
 * Dazu kommen die Einstellungen, die in der Sentry-Organisation gesetzt sind
 * (27.09.2026): EU-Region Frankfurt, IP-Adressen verwerfen, Datenfilter an.
 *
 * Ohne `NEXT_PUBLIC_SENTRY_DSN` passiert NICHTS. Damit bleiben Entwicklungs-
 * und GitHub-Pages-Builds still, und die nächtlichen Klicktests melden nicht
 * ihre eigenen, absichtlich erzeugten Fehler nach draußen.
 */
export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;

    Sentry.init({
      dsn,
      // Welcher Stand meldet? Ohne das weiß man beim Fehler nicht, ob er aus dem
      // heutigen Deploy stammt oder aus dem von letzter Woche.
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || undefined,
      environment: "production",
      tracesSampleRate: 0,
      // Alles Standardmäßige behalten AUSSER „Console" (s. o., Punkt 3). In
      // SDK 11 ist das eine eigene Integration — nicht, wie in älteren
      // Fassungen, eine Option von `breadcrumbsIntegration`. Klick-, Navigations-
      // und Netzwerk-Krümel bleiben dadurch erhalten.
      integrations: (standard) => standard.filter((i) => i.name !== "Console"),
    });
  }, []);

  return null;
}
