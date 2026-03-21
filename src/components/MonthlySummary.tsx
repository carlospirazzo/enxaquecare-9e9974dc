import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { AlertTriangle, Pill, Droplets, Activity, Zap, StickyNote, Moon } from 'lucide-react';
import type { MigraineEpisode, PainLevel } from '@/types/migraine';
import { PAIN_LABELS, COMMON_SYMPTOMS, COMMON_TRIGGERS, SLEEP_QUALITY_LABELS } from '@/types/migraine';

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
    const triggerCounts: Map<string, number> = new Map();
    let menstrualDays = 0;
    const sleepQualities: number[] = [];
    const sleepEntries: { bedtime: string; wakeTime: string; quality: number }[] = [];

    episodes.forEach(e => {
      counts[e.painLevel]++;
      if (e.isMenstrual) menstrualDays++;
      (e.medications || []).forEach(med => {
        if (med) medications.set(med, (medications.get(med) || 0) + 1);
      });
      e.symptoms.forEach(s => {
        symptomCounts.set(s, (symptomCounts.get(s) || 0) + 1);
      });
      (e.triggers || []).forEach(t => {
        triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1);
      });
      if (e.sleep) {
        sleepQualities.push(e.sleep.quality);
        sleepEntries.push(e.sleep);
      }
    });

    const topTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, count]) => ({
        id,
        label: COMMON_TRIGGERS.find(t => t.id === id)?.label || id,
        count,
        percentage: episodes.length > 0 ? Math.round((count / episodes.length) * 100) : 0,
      }));

    const episodesWithNotes = episodes
      .filter(e => e.notes?.trim())
      .sort((a, b) => a.date.localeCompare(b.date));

    const avgSleepQuality = sleepQualities.length > 0
      ? (sleepQualities.reduce((a, b) => a + b, 0) / sleepQualities.length)
      : null;

    return { counts, medications, symptomCounts, triggerCounts, topTriggers, menstrualDays, total: episodes.length, episodesWithNotes, avgSleepQuality, sleepCount: sleepQualities.length };
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

      {/* Top 3 Triggers */}
      {summary.topTriggers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Top 3 Gatilhos
          </h3>
          <div className="space-y-3">
            {summary.topTriggers.map(({ id, label, count, percentage }, i) => (
              <div key={id} className="flex items-center gap-3">
                <span className="text-lg font-bold font-serif text-muted-foreground w-6">{i + 1}.</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs font-semibold text-primary">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{count}x</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Menstrual */}
      {summary.menstrualDays > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

      {/* Sleep Summary */}
      {summary.avgSleepQuality !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Sono: qualidade média <span className="font-bold text-primary">{summary.avgSleepQuality.toFixed(1)}/5</span>
              {' '}({SLEEP_QUALITY_LABELS[Math.round(summary.avgSleepQuality)]})
              {' '}— {summary.sleepCount} registro{summary.sleepCount !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

      {/* Medications */}
      {summary.medications.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
          transition={{ delay: 0.2 }}
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

      {/* Notes */}
      {summary.episodesWithNotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-5 border border-border"
        >
          <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-muted-foreground" />
            Observações
          </h3>
          <div className="space-y-2">
            {summary.episodesWithNotes.map(ep => (
              <div key={ep.id} className="flex gap-2 items-baseline bg-muted rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  {format(parseISO(ep.date), 'd/MM', { locale: ptBR })}
                </span>
                <span className="text-sm">{ep.notes}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
