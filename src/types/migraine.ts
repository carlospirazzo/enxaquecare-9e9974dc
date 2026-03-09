export type PainLevel = 'light' | 'moderate' | 'severe';

export interface MigraineEpisode {
  id: string;
  date: string; // YYYY-MM-DD
  painLevel: PainLevel;
  medication: string; // empty string = no medication
  isMenstrual: boolean;
  symptoms: string[]; // e.g. ['vertigo', 'nausea', 'vomiting', 'tinnitus', 'aura']
  notes: string;
}

export const COMMON_SYMPTOMS = [
  { id: 'vertigo', label: 'Vertigem' },
  { id: 'nausea', label: 'Enjoo/Náusea' },
  { id: 'vomiting', label: 'Vômito' },
  { id: 'tinnitus', label: 'Zumbido no ouvido' },
  { id: 'aura', label: 'Aura' },
  { id: 'photophobia', label: 'Sensibilidade à luz' },
  { id: 'phonophobia', label: 'Sensibilidade ao som' },
  { id: 'neck_pain', label: 'Dor no pescoço' },
] as const;

export const PAIN_LABELS: Record<PainLevel, string> = {
  light: 'Leve',
  moderate: 'Moderada',
  severe: 'Grave',
};
