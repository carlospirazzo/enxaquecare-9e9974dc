import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ArrowLeft, FileDown, AlertTriangle, Pill, Activity, Zap, Droplets, StickyNote, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { useMigraineStore } from '@/hooks/useMigraineStore';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, PAIN_LABELS, SLEEP_QUALITY_LABELS } from '@/types/migraine';
import type { PainLevel } from '@/types/migraine';

const Report = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<3 | 6>(3);
  const { getPeriodsEpisodes } = useMigraineStore();

  const episodes = getPeriodsEpisodes(period);

  const chartData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; light: number; moderate: number; severe: number }[] = [];

    for (let i = period - 1; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(startOfMonth(d), 'yyyy-MM');
      const label = format(d, 'MMM/yy', { locale: ptBR });
      const monthEps = episodes.filter(e => e.date.startsWith(key));
      months.push({
        key,
        label,
        light: monthEps.filter(e => e.painLevel === 'light').length,
        moderate: monthEps.filter(e => e.painLevel === 'moderate').length,
        severe: monthEps.filter(e => e.painLevel === 'severe').length,
      });
    }
    return months;
  }, [episodes, period]);

  const stats = useMemo(() => {
    const medications: Map<string, number> = new Map();
    const symptomCounts: Map<string, number> = new Map();
    const triggerCounts: Map<string, number> = new Map();
    let menstrualDays = 0;
    const counts: Record<PainLevel, number> = { light: 0, moderate: 0, severe: 0 };

    episodes.forEach(e => {
      counts[e.painLevel]++;
      if (e.isMenstrual) menstrualDays++;
      if (e.isMenstrual) menstrualDays++;
      (e.medications || []).forEach(med => {
        if (med) medications.set(med, (medications.get(med) || 0) + 1);
      });
      e.symptoms.forEach(s => symptomCounts.set(s, (symptomCounts.get(s) || 0) + 1));
      (e.triggers || []).forEach(t => triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1));
    });

    const total = episodes.length;
    const avg = period > 0 ? (total / period).toFixed(1) : '0';

    const topMeds = Array.from(medications.entries()).sort((a, b) => b[1] - a[1]);
    const topSymptoms = Array.from(symptomCounts.entries()).sort((a, b) => b[1] - a[1]);
    const topTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        id,
        label: COMMON_TRIGGERS.find(t => t.id === id)?.label || id,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }));

    const episodesWithNotes = episodes.filter(e => e.notes?.trim()).sort((a, b) => a.date.localeCompare(b.date));

    const sleepEntries = episodes.filter(e => e.sleep);
    const avgSleepQuality = sleepEntries.length > 0
      ? sleepEntries.reduce((sum, e) => sum + e.sleep!.quality, 0) / sleepEntries.length
      : null;

    return { counts, total, avg, menstrualDays, topMeds, topSymptoms, topTriggers, episodesWithNotes, avgSleepQuality, sleepCount: sleepEntries.length };
  }, [episodes, period]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border print:hidden">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold">Relatório Comparativo</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-20" id="report-content">
        {/* Print header */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="font-serif text-2xl font-bold">Diário de Enxaqueca — Relatório</h1>
          <p className="text-sm text-muted-foreground">Últimos {period} meses • Gerado em {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</p>
        </div>

        {/* Period toggle */}
        <div className="flex gap-2 justify-center print:hidden">
          {([3, 6] as const).map(p => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p} meses
            </Button>
          ))}
        </div>

        {/* Overview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border">
          <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-pain-moderate" />
            Visão Geral
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold font-serif">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total de crises</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold font-serif">{stats.avg}</div>
              <div className="text-xs text-muted-foreground">Média/mês</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold font-serif">{stats.counts.severe}</div>
              <div className="text-xs text-muted-foreground">Crises graves</div>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        {stats.total > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-serif text-lg font-semibold mb-4">Crises por Mês</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={24} />
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="light" name="Leve" stackId="a" fill="hsl(45, 93%, 58%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="moderate" name="Moderada" stackId="a" fill="hsl(25, 95%, 55%)" />
                  <Bar dataKey="severe" name="Grave" stackId="a" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Triggers */}
        {stats.topTriggers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Gatilhos
            </h3>
            <div className="space-y-3">
              {stats.topTriggers.map(({ id, label, count, pct }, i) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs font-semibold text-primary">{pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{count}x</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Medications */}
        {stats.topMeds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              Medicações
            </h3>
            <div className="space-y-2">
              {stats.topMeds.map(([med, count]) => (
                <div key={med} className="flex justify-between items-center bg-muted rounded-lg px-3 py-2">
                  <span className="text-sm">{med}</span>
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{count}x</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Symptoms */}
        {stats.topSymptoms.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-symptom-bg rounded-2xl p-5 border border-symptom/20">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-symptom" />
              Sintomas
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.topSymptoms.map(([symptomId, count]) => {
                const label = COMMON_SYMPTOMS.find(s => s.id === symptomId)?.label || symptomId;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <span key={symptomId} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-symptom/15 text-symptom ring-1 ring-symptom/30">
                    {label}
                    <span className="font-bold">{count}x</span>
                    <span className="text-symptom/60">({pct}%)</span>
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Menstrual correlation */}
        {stats.menstrualDays > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-menstrual-bg rounded-2xl p-4 border border-menstrual/20">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-menstrual" />
              <span className="text-sm font-medium">
                {stats.menstrualDays} de {stats.total} crises ({stats.total > 0 ? Math.round((stats.menstrualDays / stats.total) * 100) : 0}%) ocorreram em período menstrual
              </span>
            </div>
          </motion.div>
        )}

        {/* Notes */}
        {stats.episodesWithNotes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-5 border border-border">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-muted-foreground" />
              Observações
            </h3>
            <div className="space-y-2">
              {stats.episodesWithNotes.map(ep => (
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

        {/* Export button */}
        <div className="print:hidden">
          <Button onClick={() => window.print()} className="w-full gap-2" size="lg">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Report;
