import { Hall, TopisObject, Gang, FFZ, Path } from '@/types/topis';
import { calculateTotalGangLength, calculateGangArea } from './gang-generator';
import { findPathBetweenObjects, buildGangGraph, calculateRouteDistance } from './pathfinding';

// Analysis result interface
export interface ProduktivitaetsAnalyse {
  // Hall metrics
  hallenFlaeche: number; // m²
  nutzFlaeche: number; // m² (excluding corridors)
  nutzungsFaktor: number; // percentage

  // Object metrics
  objektAnzahl: number;
  stellplatzAnzahl: number;
  torAnzahl: number;
  regalAnzahl: number;
  regalKapazitaet: number; // estimated pallet positions

  // Corridor metrics
  gangLaenge: number; // m
  gangFlaeche: number; // m²
  gangAnteil: number; // percentage of hall

  // Distance metrics
  durchschnittlicheDistanz: number; // m
  maxDistanz: number; // m
  minDistanz: number; // m

  // Time metrics
  durchschnittlicheZeit: number; // seconds
  geschaetzteDurchsatzZeit: number; // seconds for one cycle

  // Efficiency metrics
  effizienzScore: number; // 0-100
  optimierungspotential: number; // percentage
}

// Default FFZ for calculations
const DEFAULT_FFZ: FFZ = {
  id: 0,
  name: 'Standard-Stapler',
  type: 'gabelstapler',
  mindestBreite: 3.5,
  geschwindigkeit: 12, // km/h
  aufnahmeZeit: 15, // seconds
  abgabeZeit: 12, // seconds
  maxHubhoehe: 6,
  tragkraft: 2500,
};

/**
 * Calculate productivity analysis for the current layout
 */
export function analyzeProduktivitaet(
  hall: Hall,
  objects: TopisObject[],
  gaenge: Gang[],
  ffz: FFZ = DEFAULT_FFZ
): ProduktivitaetsAnalyse {
  // Hall metrics
  const hallenFlaeche = hall.width * hall.height;
  const gangFlaeche = calculateGangArea(gaenge);
  const gangLaenge = calculateTotalGangLength(gaenge);

  // Object metrics
  const objektAnzahl = objects.length;
  const stellplaetze = objects.filter(o => o.type === 'stellplatz');
  const tore = objects.filter(o => o.type === 'tor');
  const regale = objects.filter(o => o.type === 'regal');

  const stellplatzAnzahl = stellplaetze.length;
  const torAnzahl = tore.length;
  const regalAnzahl = regale.length;

  // Regal capacity - mit neuen Feldern (Lastenheft + Papa)
  const regalKapazitaet = regale.reduce((sum, regal) => {
    const ebenen = regal.ebenen || 3;
    // Nutze palettenPlaetzeProEbene wenn definiert, sonst berechne
    const palettesPerLevel = regal.palettenPlaetzeProEbene || Math.floor(regal.width / 1.2);
    return sum + palettesPerLevel * ebenen;
  }, 0);

  // Stellplatz capacity - mit Stapelhöhe (Papa's Anforderung)
  const stellplatzKapazitaet = stellplaetze.reduce((sum, sp) => {
    const stapelHoehe = sp.stapelHoehe || 1;
    // Nutze palettenProStellplatz wenn definiert, sonst berechne
    const paletten = sp.palettenProStellplatz || Math.floor((sp.width * sp.height) / 1.2 * stapelHoehe);
    return sum + paletten;
  }, 0);

  // Object area
  const objektFlaeche = objects.reduce((sum, obj) => sum + obj.width * obj.height, 0);

  // Calculate usable area
  const nutzFlaeche = hallenFlaeche - gangFlaeche;
  const nutzungsFaktor = (nutzFlaeche / hallenFlaeche) * 100;
  const gangAnteil = (gangFlaeche / hallenFlaeche) * 100;

  // Distance calculations between all stellplätze
  let distances: number[] = [];
  let times: number[] = [];

  if (stellplaetze.length >= 2 && gaenge.length > 0) {
    // Calculate distances between pairs of stellplätze
    for (let i = 0; i < Math.min(stellplaetze.length, 10); i++) {
      for (let j = i + 1; j < Math.min(stellplaetze.length, 10); j++) {
        const result = findPathBetweenObjects(stellplaetze[i], stellplaetze[j], gaenge, ffz);
        if (result) {
          distances.push(result.distance);
          times.push(result.time);
        }
      }
    }

    // Also calculate gate to stellplatz distances
    if (tore.length > 0) {
      for (const tor of tore.slice(0, 3)) {
        for (const stellplatz of stellplaetze.slice(0, 5)) {
          const result = findPathBetweenObjects(tor, stellplatz, gaenge, ffz);
          if (result) {
            distances.push(result.distance);
            times.push(result.time);
          }
        }
      }
    }
  }

  // Calculate distance metrics
  const durchschnittlicheDistanz = distances.length > 0
    ? distances.reduce((a, b) => a + b, 0) / distances.length
    : 0;
  const maxDistanz = distances.length > 0 ? Math.max(...distances) : 0;
  const minDistanz = distances.length > 0 ? Math.min(...distances) : 0;

  // Calculate time metrics
  const durchschnittlicheZeit = times.length > 0
    ? times.reduce((a, b) => a + b, 0) / times.length
    : 0;

  // Estimate cycle time (gate -> stellplatz -> gate)
  const geschaetzteDurchsatzZeit = (durchschnittlicheZeit * 2) + ffz.aufnahmeZeit + ffz.abgabeZeit;

  // Calculate efficiency score (0-100)
  const effizienzScore = calculateEffizienzScore({
    durchschnittlicheDistanz,
    hallenFlaeche,
    gangAnteil,
    stellplatzAnzahl,
    torAnzahl,
  });

  // Calculate optimization potential
  const optimalDistanz = Math.sqrt(hallenFlaeche) * 0.3; // theoretical optimal
  const optimierungspotential = durchschnittlicheDistanz > optimalDistanz
    ? ((durchschnittlicheDistanz - optimalDistanz) / durchschnittlicheDistanz) * 100
    : 0;

  return {
    hallenFlaeche,
    nutzFlaeche,
    nutzungsFaktor,
    objektAnzahl,
    stellplatzAnzahl,
    torAnzahl,
    regalAnzahl,
    regalKapazitaet,
    gangLaenge,
    gangFlaeche,
    gangAnteil,
    durchschnittlicheDistanz,
    maxDistanz,
    minDistanz,
    durchschnittlicheZeit,
    geschaetzteDurchsatzZeit,
    effizienzScore,
    optimierungspotential,
  };
}

/**
 * Calculate efficiency score based on various metrics
 */
function calculateEffizienzScore(params: {
  durchschnittlicheDistanz: number;
  hallenFlaeche: number;
  gangAnteil: number;
  stellplatzAnzahl: number;
  torAnzahl: number;
}): number {
  const { durchschnittlicheDistanz, hallenFlaeche, gangAnteil, stellplatzAnzahl, torAnzahl } = params;

  let score = 100;

  // Penalize for high average distance relative to hall size
  const optimalDistanz = Math.sqrt(hallenFlaeche) * 0.3;
  if (durchschnittlicheDistanz > optimalDistanz) {
    score -= Math.min(30, ((durchschnittlicheDistanz / optimalDistanz) - 1) * 20);
  }

  // Penalize for too much or too little corridor area (optimal 15-25%)
  if (gangAnteil < 10) {
    score -= (10 - gangAnteil) * 2;
  } else if (gangAnteil > 30) {
    score -= (gangAnteil - 30) * 1.5;
  }

  // Bonus for good stellplatz-to-tor ratio
  if (torAnzahl > 0 && stellplatzAnzahl > 0) {
    const ratio = stellplatzAnzahl / torAnzahl;
    if (ratio >= 5 && ratio <= 15) {
      score += 5;
    }
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate recommendations based on analysis
 */
export function generateEmpfehlungen(analyse: ProduktivitaetsAnalyse): string[] {
  const empfehlungen: string[] = [];

  // Distance recommendations
  if (analyse.durchschnittlicheDistanz > 50) {
    empfehlungen.push('Die durchschnittliche Wegstrecke ist hoch. Erwägen Sie eine Neuanordnung der Stellplätze.');
  }

  // Corridor recommendations
  if (analyse.gangAnteil < 15) {
    empfehlungen.push('Der Ganganteil ist niedrig. Stellen Sie sicher, dass alle Bereiche erreichbar sind.');
  } else if (analyse.gangAnteil > 30) {
    empfehlungen.push('Der Ganganteil ist hoch. Prüfen Sie ob Gänge zusammengelegt werden können.');
  }

  // Gate recommendations
  if (analyse.torAnzahl < 2) {
    empfehlungen.push('Wenige Tore können zu Engpässen führen. Erwägen Sie zusätzliche Tore.');
  }

  // Stellplatz recommendations
  if (analyse.stellplatzAnzahl === 0) {
    empfehlungen.push('Keine Stellplätze definiert. Fügen Sie Stellplätze für eine genauere Analyse hinzu.');
  }

  // Efficiency recommendations
  if (analyse.effizienzScore < 60) {
    empfehlungen.push('Die Gesamt-Effizienz ist verbesserungswürdig. Nutzen Sie den Gang-Generator für optimierte Wege.');
  }

  // Optimization potential
  if (analyse.optimierungspotential > 20) {
    empfehlungen.push(`Es besteht ca. ${analyse.optimierungspotential.toFixed(0)}% Optimierungspotential bei den Wegstrecken.`);
  }

  // Regal recommendations
  if (analyse.regalAnzahl > 0 && analyse.regalKapazitaet === 0) {
    empfehlungen.push('Definieren Sie Regal-Ebenen für eine genauere Kapazitätsberechnung.');
  }

  return empfehlungen;
}

/**
 * Format analysis for display
 */
export function formatAnalyse(analyse: ProduktivitaetsAnalyse): {
  kennzahlen: { label: string; wert: string; einheit: string }[];
  empfehlungen: string[];
} {
  const kennzahlen = [
    { label: 'Hallenfläche', wert: analyse.hallenFlaeche.toFixed(0), einheit: 'm²' },
    { label: 'Nutzfläche', wert: analyse.nutzFlaeche.toFixed(0), einheit: 'm²' },
    { label: 'Nutzungsfaktor', wert: analyse.nutzungsFaktor.toFixed(1), einheit: '%' },
    { label: 'Objekte', wert: analyse.objektAnzahl.toString(), einheit: '' },
    { label: 'Stellplätze', wert: analyse.stellplatzAnzahl.toString(), einheit: '' },
    { label: 'Tore', wert: analyse.torAnzahl.toString(), einheit: '' },
    { label: 'Regale', wert: analyse.regalAnzahl.toString(), einheit: '' },
    { label: 'Regal-Kapazität', wert: analyse.regalKapazitaet.toString(), einheit: 'Paletten' },
    { label: 'Ganglänge', wert: analyse.gangLaenge.toFixed(0), einheit: 'm' },
    { label: 'Gangfläche', wert: analyse.gangFlaeche.toFixed(0), einheit: 'm²' },
    { label: 'Ganganteil', wert: analyse.gangAnteil.toFixed(1), einheit: '%' },
    { label: 'Ø Distanz', wert: analyse.durchschnittlicheDistanz.toFixed(1), einheit: 'm' },
    { label: 'Max. Distanz', wert: analyse.maxDistanz.toFixed(1), einheit: 'm' },
    { label: 'Ø Fahrzeit', wert: analyse.durchschnittlicheZeit.toFixed(0), einheit: 's' },
    { label: 'Durchsatzzeit', wert: analyse.geschaetzteDurchsatzZeit.toFixed(0), einheit: 's' },
    { label: 'Effizienz-Score', wert: analyse.effizienzScore.toFixed(0), einheit: '/100' },
  ];

  return {
    kennzahlen,
    empfehlungen: generateEmpfehlungen(analyse),
  };
}
