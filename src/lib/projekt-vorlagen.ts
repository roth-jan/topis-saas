import type { ProjektVorlage } from '@/types/projekt';
import { PROJEKT_GERSTHOFEN_2026 } from './layouts/schmid-halle6-2026';
import { useTopisStore } from '@/lib/store';
import { useProzessmodellStore } from '@/lib/prozessmodell-store';
import { useBetriebsdatenStore } from '@/lib/betriebsdaten-store';
import { getTemplate, getTemplateParameter } from '@/lib/data/prozessmodell-templates';

/**
 * Registry aller verfügbaren ProjektVorlagen.
 * Neue Halle: leeres Layout via "Neues Projekt" im Datei-Menü.
 * Neue Vorlage: JSON in src/data/layouts/ + Loader in src/lib/layouts/ + hier eintragen.
 */
export const PROJEKT_VORLAGEN: ProjektVorlage[] = [
  PROJEKT_GERSTHOFEN_2026,
];

/**
 * Lädt eine ProjektVorlage komplett:
 * 1. Layout (Halle + Objekte)
 * 2. Prozessmodell (Template + Parameter-Overrides)
 * 3. Berechnung auslösen
 */
export function ladeProjektVorlage(id: string): ProjektVorlage | undefined {
  const vorlage = PROJEKT_VORLAGEN.find(v => v.id === id);
  if (!vorlage) return undefined;

  // 1. Layout laden (Halle + Objekte + Gänge)
  const { resetState, updateHall, addObject, setGaenge, clearSimAuftraege } = useTopisStore.getState();
  resetState();
  // Sim-Aufträge + Scandaten verweisen auf alte Tor-Object-IDs — bei
  // einer neuen Halle haben die nichts mehr zu suchen, sonst klebt es
  // in der Planung-Tabelle wie hardcodierte Daten.
  clearSimAuftraege();
  // Scandaten + Zuordnungen + Analyse aus Betriebsdaten-Store löschen
  const bd = useBetriebsdatenStore.getState();
  bd.importScandatenRecords([]);
  // setAnalyse-Signatur erlaubt kein null; den Store-State direkt setzen
  useBetriebsdatenStore.setState({ analyse: null });
  bd.setTorZuordnungen([]);
  bd.setRelationZuordnungen([]);
  updateHall(1, {
    width: vorlage.hall.width,
    height: vorlage.hall.height,
    name: vorlage.hall.name,
    color: vorlage.hall.color || '#16213e',
  });
  vorlage.objects.forEach(obj => addObject(obj));
  if (vorlage.gaenge && vorlage.gaenge.length > 0) {
    setGaenge(vorlage.gaenge);
  }

  // 2. Prozessmodell laden + Parameter setzen
  const pm = useProzessmodellStore.getState();
  const template = getTemplate(vorlage.prozessmodell);
  if (template) {
    pm.ladeModell(template.modell, getTemplateParameter(vorlage.prozessmodell));
    // Overrides anwenden
    Object.entries(vorlage.parameterOverrides).forEach(([key, value]) => {
      pm.updateParameter(key, value);
    });
  }

  // 3. Berechnen
  pm.berechne();

  return vorlage;
}
