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

    // Nur beim ersten Besuch automatisch starten
    const seen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) {
      // Kurz warten bis alle Elemente gerendert sind
      const timer = setTimeout(() => {
        startTour();
        localStorage.setItem(TOUR_SEEN_KEY, 'true');
      }, 1500);
      return () => clearTimeout(timer);
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
          description: 'TOPIS ist dein Hallenplanungs- und Analysetool. Diese kurze Tour zeigt dir wo du die wichtigsten Funktionen findest.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      },
      {
        element: 'canvas',
        popover: {
          title: '🏭 Hallenplan',
          description: 'Hier siehst du den Grundriss deiner Halle mit Toren, Bereichen und Gängen. Du kannst zoomen (Mausrad), verschieben (rechte Maustaste) und Objekte anklicken.',
          side: 'left' as const,
        },
      },
      {
        element: '#tour-aktionen',
        popover: {
          title: '🔧 Aktionen & Berechnungen',
          description: 'Hier findest du die wichtigsten Werkzeuge: Entfernungsmatrix, Wegeberechnung und Tor-Kalkulation.',
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
          description: 'Hier gibst du pro Tor ein: Paletten/Tag, Entladezeit, Zielbereich. TOPIS rechnet daraus den Tagesbedarf in Stunden.',
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
          description: 'Lade Scandaten als CSV hoch (Datum, Messpunkt, Colli, Gewicht). Daraus berechnet TOPIS automatisch Heatmaps, Stundenprofile und den gewichteten Verteilweg.',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-prozessmodell',
        popover: {
          title: '⚙️ Prozessmodell (Min/Colli)',
          description: 'DIE KERNBERECHNUNG: Hier siehst du jeden einzelnen Prozessschritt (Entladen, Scannen, Verteilen) mit Zeiten, Anteilen und Häufigkeiten. Das Ergebnis ist die Prozesszeit in Min/Colli. Hier stellst du auch den Fahrzeugmix ein (Schnelläufer/Stapler/Langgabel).',
          side: 'bottom' as const,
        },
      },
      {
        element: '#tour-benchmark',
        popover: {
          title: '🏆 Benchmarking',
          description: 'Vergleicht deine Halle mit 8 Referenzhallen. Zeigt den Rang und wo Optimierungspotenzial liegt.',
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
          description: 'Speichere verschiedene Layout-Varianten und vergleiche sie. Zum Beispiel: "Halle mit Kette" vs. "Halle ohne Kette".',
          side: 'bottom' as const,
        },
      },
      {
        popover: {
          title: '✅ Fertig!',
          description: 'Du kannst diese Tour jederzeit über den ❓-Button in der Toolbar erneut starten. Tipp: Starte mit "Betriebsdaten importieren" um Scandaten zu laden, dann öffne das "Prozessmodell" für die Min/Colli-Berechnung.',
          side: 'bottom' as const,
          align: 'center' as const,
        },
      },
    ],
  });

  driverObj.drive();
}
