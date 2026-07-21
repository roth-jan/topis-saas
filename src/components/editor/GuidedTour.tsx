'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_SEEN_KEY = 'topis-tour-seen';

/**
 * Guided Tour für TOPIS.
 * Zeigt beim ersten Besuch automatisch eine Tour durch die wichtigsten Features.
 * Kann jederzeit über den "?" Button in der Toolbar erneut gestartet werden.
 */
export function GuidedTour() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Auto-Start deaktiviert — die alten Tour-Schritte referenzieren Elemente
    // (#tour-aktionen, #tour-wegeberechnung, #tour-betriebsdaten, …), die in der
    // neuen Workflow-Phasen-Toolbar nur in der jeweiligen Phase existieren. Die
    // Tour-Bibliothek setzt dabei ein Vollbild-Overlay, das beim Fehlen des
    // Ziel-Elements alle Klicks blockiert — der User glaubt die Seite hängt.
    // Tour bleibt über den "?"-Button in der Toolbar manuell startbar.
    if (mounted) {
      localStorage.setItem(TOUR_SEEN_KEY, 'true');
    }
  }, [mounted]);

  return null; // Rendert nichts — driver.js arbeitet direkt mit dem DOM
}

export function startTour() {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.6)',
    stagePadding: 8,
    stageRadius: 8,
    popoverClass: 'topis-tour-popover',
    nextBtnText: 'Weiter →',
    prevBtnText: '← Zurück',
    doneBtnText: 'Verstanden!',
    progressText: '{{current}} / {{total}}',
    steps: [
      {
        popover: {
          title: '👋 Willkommen in TOPIS',
          description: 'TOPIS ist Ihr Hallenplanungs- und Analysetool. Diese kurze Tour zeigt Ihnen, wo Sie die wichtigsten Funktionen finden.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      },
      {
        element: 'canvas',
        popover: {
          title: '🏭 Hallenplan',
          description: 'Hier sehen Sie den Grundriss Ihrer Halle mit Toren, Bereichen und Gängen. Sie können zoomen (Strg + Mausrad), verschieben (rechte Maustaste) und Objekte anklicken.',
          side: 'left' as const,
        },
      },
      {
        element: '#tour-aktionen',
        popover: {
          title: '🔧 Aktionen & Berechnungen',
          description: 'Hier finden Sie die wichtigsten Werkzeuge: Entfernungsmatrix, Wegeberechnung und Tor-Kalkulation.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-wegeberechnung',
        popover: {
          title: '📏 Wegeberechnung',
          description: 'Berechnet automatisch alle Wege zwischen Toren und Bereichen. Daraus entsteht der gewichtete Verteilweg — die Basis für die Prozesszeitberechnung.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-torkalkulation',
        popover: {
          title: '🚪 Tor-Kalkulation',
          description: 'Hier geben Sie pro Tor ein: Paletten/Tag, Entladezeit, Zielbereich. TOPIS rechnet daraus den Tagesbedarf in Stunden.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-analyse',
        popover: {
          title: '📊 Analyse-Werkzeuge',
          description: 'Das Herzstück: Betriebsdaten importieren, Prozessmodell berechnen, Benchmarking, IST-SOLL-Vergleich und Torbelegung.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-betriebsdaten',
        popover: {
          title: '📂 Betriebsdaten importieren',
          description: 'Laden Sie Scandaten als CSV hoch (Datum, Messpunkt, Colli, Gewicht). Daraus berechnet TOPIS automatisch Heatmaps, Stundenprofile und den gewichteten Verteilweg.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-prozessmodell',
        popover: {
          title: '⚙️ Prozess-Cockpit (Min/Colli)',
          description: 'DIE KERNBERECHNUNG: Das Cockpit rechnet Ihr Prozessmodell live — jeder Schritt (Entladen, Scannen, Verteilen) mit Zeiten, Anteilen und Häufigkeiten, voll editierbar. Excel importieren oder mit der ROTH-Vorlage starten, monatlich Mengen pflegen, Trend verfolgen.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-benchmark',
        popover: {
          title: '🏆 Benchmarking',
          description: 'Vergleicht Ihre Halle mit 8 Referenzhallen. Zeigt den Rang und wo Optimierungspotenzial liegt.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-istsoll',
        popover: {
          title: '📈 IST-SOLL-Analyse',
          description: 'Vergleicht den tatsächlichen Personaleinsatz (IST) mit dem rechnerischen Bedarf (SOLL) — stundgenau. Zeigt Über- und Unterbesetzung.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-szenarien',
        popover: {
          title: '💾 Szenarien',
          description: 'Speichern Sie verschiedene Layout-Varianten und vergleichen Sie sie. Zum Beispiel: "Halle mit Kette" vs. "Halle ohne Kette".',
          side: 'bottom' as const,
        },
      },
      {
        popover: {
          title: '✅ Fertig!',
          description: 'Sie können diese Tour jederzeit über den ❓-Button in der Toolbar erneut starten. Tipp: Starten Sie mit "Betriebsdaten importieren", um Scandaten zu laden, und öffnen Sie dann das "Prozessmodell" für die Min/Colli-Berechnung.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      },
    ],
  });

  driverObj.drive();
}
