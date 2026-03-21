export type PainLevel = 'light' | 'moderate' | 'severe';

export interface SleepDiary {
  bedtime: string;   // HH:mm
  wakeTime: string;  // HH:mm
  quality: number;   // 1-5
}

export interface MigraineEpisode {
  id: string;
  date: string; // YYYY-MM-DD
  painLevel: PainLevel;
  medications: string[]; // array of medication names
  isMenstrual: boolean;
  symptoms: string[]; // e.g. ['vertigo', 'nausea', 'vomiting', 'tinnitus', 'aura']
  triggers: string[];
  notes: string;
  sleep?: SleepDiary;
}

export const SLEEP_QUALITY_LABELS: Record<number, string> = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Ótimo',
};

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

export const COMMON_TRIGGERS = [
  { id: 'bad_sleep', label: 'Sono ruim' },
  { id: 'stress', label: 'Estresse' },
  { id: 'alcohol', label: 'Álcool' },
  { id: 'menstruation', label: 'Menstruação' },
  { id: 'coffee', label: 'Café' },
  { id: 'fasting', label: 'Jejum' },
  { id: 'weather_change', label: 'Mudança de clima' },
  { id: 'bright_light', label: 'Luz forte' },
  { id: 'strong_smell', label: 'Cheiro forte' },
  { id: 'exercise', label: 'Exercício' },
  { id: 'dehydration', label: 'Desidratação' },
  { id: 'loud_noise', label: 'Barulho excessivo' },
  { id: 'cheese', label: 'Queijo' },
  { id: 'chocolate', label: 'Chocolate' },
  { id: 'screen_time', label: 'Tempo de tela' },
  { id: 'travel', label: 'Viagem' },
] as const;

export const PAIN_LABELS: Record<PainLevel, string> = {
  light: 'Leve',
  moderate: 'Moderada',
  severe: 'Grave',
};
