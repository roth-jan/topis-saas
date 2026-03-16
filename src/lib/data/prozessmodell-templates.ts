import type { ProzessmodellConfig, ProzessParameter } from '@/types/prozessmodell';
import { PROZESSMODELL_SE, SE_STANDARD_PARAMETER } from './prozessmodell-se';
import { PROZESSMODELL_SA, SA_STANDARD_PARAMETER } from './prozessmodell-sa';
import { PROZESSMODELL_GEIS_NUERNBERG, GEIS_NUERNBERG_SE_PARAMETER } from './prozessmodell-geis-nuernberg';
import { PROZESSMODELL_NOERPEL_ULM, NOERPEL_ULM_SE_PARAMETER } from './prozessmodell-noerpel-ulm';

/**
 * Template-Eintrag: Modell + zugehörige Standard-Parameter.
 */
export interface ProzessmodellTemplate {
  modell: ProzessmodellConfig;
  parameter: ProzessParameter[];
}

/**
 * Registry aller verfügbaren Prozessmodell-Templates.
 * Neue Modelle hier registrieren.
 */
export const PROZESSMODELL_TEMPLATES: ProzessmodellTemplate[] = [
  { modell: PROZESSMODELL_SE, parameter: SE_STANDARD_PARAMETER },
  { modell: PROZESSMODELL_SA, parameter: SA_STANDARD_PARAMETER },
  { modell: PROZESSMODELL_GEIS_NUERNBERG, parameter: GEIS_NUERNBERG_SE_PARAMETER },
  { modell: PROZESSMODELL_NOERPEL_ULM, parameter: NOERPEL_ULM_SE_PARAMETER },
];

/**
 * Gibt die Standard-Parameter für ein Template zurück (als Kopie).
 */
export function getTemplateParameter(templateId: string): ProzessParameter[] {
  const template = PROZESSMODELL_TEMPLATES.find((t) => t.modell.id === templateId);
  if (!template) return SE_STANDARD_PARAMETER.map((p) => ({ ...p }));
  return template.parameter.map((p) => ({ ...p }));
}

/**
 * Gibt ein Template anhand der ID zurück.
 */
export function getTemplate(templateId: string): ProzessmodellTemplate | undefined {
  return PROZESSMODELL_TEMPLATES.find((t) => t.modell.id === templateId);
}
