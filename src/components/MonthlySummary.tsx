import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Pill, Droplets, Activity } from 'lucide-react';
import type { MigraineEpisode, PainLevel } from '@/types/migraine';
import { PAIN_LABELS, COMMON_SYMPTOMS } from '@/types/migraine';

interface MonthlySummaryProps {
  episodes: MigraineEpisode[];
}

const painIcons: Record<PainLevel, string> = {
  light: '🟡',
  moderate: '🟠',
  severe: '🔴',
};

export function MonthlySummary({ episodes }: MonthlySummaryProps) {
  const summary = useMemo(() => {
    const counts: Record<PainLevel, number> = { light: 0, moderate: 0, severe: 0 };
    const medications: Map<string, number> = new Map();
    const symptomCounts: Map<string, number> = new Map();
    let menstrualDays = 0;

    episodes.forEach(e => {
      counts[e.painLevel]++;
      if (e.isMenstrual) menstrualDays++;
      if (e.medication) {
        medications.set(e.medication, (medications.get(e.medication) || 0) + 1);
      }
      e.symptoms.forEach(s => {
        symptomCounts.set(s, (symptomCounts.get(s) || 0) + 1);
      });
    });

    return { counts, medications, symptomCounts, menstrualDays, total: episodes.length };
  }, [episodes]);

  if (summary.total === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border text-center">
        <p className="text-muted-foreground text-sm">Nenhum episódio registrado neste mês.</p>
      </div>
    );
  }

  const highlightSymptoms = ['vertigo', 'nausea', 'vomiting', 'tinnitus', 'aura'];

  return (
    <div className="space-y-4">
      {/* Pain counts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-5 border border-border"
      >
        <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-pain-moderate" />
          Resumo de Crises
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'moderate', 'severe'] as PainLevel[]).map(level => (
            <div
              key={level}
              className={`rounded-xl p-3 text-center ${
                level === 'light' ? 'bg-pain-light-bg' :
                level === 'moderate' ? 'bg-pain-moderate-bg' : 'bg-pain-severe-bg'
              }`}
            >
              <div className="text-2xl font-bold font-serif">{summary.counts[level]}</div>
              <div className="text-xs font-medium mt-1">{painIcons[level]} {PAIN_LABELS[level]}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3 text-center">
          Total: <span className="font-semibold text-foreground">{summary.total}</span> dia{summary.total !== 1 ? 's' : ''} com dor
        </p>
      </motion.div>

      {/* Menstrual */}
      {summary.menstrualDays > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-menstrual-bg rounded-2xl p-4 border border-menstrual/20"
        >
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-menstrual" />
            <span className="text-sm font-medium">
              {summary.menstrualDays} dia{summary.menstrualDays !== 1 ? 's' : ''} em período menstrual
            </span>
          </div>
        </motion.div>
      )}

      {/* Medications */}
      {summary.medications.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-primary" />
            Medicações
          </h3>
          <div className="space-y-2">
            {Array.from(summary.medications.entries()).map(([med, count]) => (
              <div key={med} className="flex justify-between items-center bg-muted rounded-lg px-3 py-2">
                <span className="text-sm">{med}</span>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Highlighted Symptoms */}
      {summary.symptomCounts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-symptom-bg rounded-2xl p-5 border border-symptom/20"
        >
          <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-symptom" />
            Sintomas Associados
          </h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(summary.symptomCounts.entries())
              .sort((a, b) => {
                const aHighlight = highlightSymptoms.includes(a[0]) ? 0 : 1;
                const bHighlight = highlightSymptoms.includes(b[0]) ? 0 : 1;
                return aHighlight - bHighlight || b[1] - a[1];
              })
              .map(([symptomId, count]) => {
                const label = COMMON_SYMPTOMS.find(s => s.id === symptomId)?.label || symptomId;
                const isHighlighted = highlightSymptoms.includes(symptomId);
                return (
                  <span
                    key={symptomId}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                      isHighlighted
                        ? 'bg-symptom/15 text-symptom ring-1 ring-symptom/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {label}
                    <span className="font-bold">{count}x</span>
                  </span>
                );
              })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
