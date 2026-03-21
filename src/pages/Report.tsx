import { useState, useMemo } from 'react';
import logo from '@/assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ArrowLeft, FileDown, AlertTriangle, Pill, Activity, Zap, Droplets, StickyNote, Moon, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { useMigraineStore } from '@/hooks/useMigraineStore';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, PAIN_LABELS, SLEEP_QUALITY_LABELS } from '@/types/migraine';
import type { PainLevel } from '@/types/migraine';

const Section = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-card rounded-2xl p-5 border border-border print:border-foreground/10 print:rounded-lg print:shadow-none ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2 print:text-base print:mb-2">
    {icon}
    {children}
  </h3>
);

const Report = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<3 | 6>(3);
  const { getPeriodsEpisodes } = useMigraineStore();

  const episodes = getPeriodsEpisodes(period);

  // Chart data: crises per month
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; light: number; moderate: number; severe: number; total: number }[] = [];

    for (let i = period - 1; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(startOfMonth(d), 'yyyy-MM');
      const label = format(d, 'MMM/yy', { locale: ptBR });
      const monthEps = episodes.filter(e => e.date.startsWith(key));
      const light = monthEps.filter(e => e.painLevel === 'light').length;
      const moderate = monthEps.filter(e => e.painLevel === 'moderate').length;
      const severe = monthEps.filter(e => e.painLevel === 'severe').length;
      months.push({ key, label, light, moderate, severe, total: light + moderate + severe });
    }
    return months;
  }, [episodes, period]);

  // Sleep chart data
  const sleepChartData = useMemo(() => {
    const now = new Date();
    const months: { label: string; avgQuality: number | null }[] = [];

    for (let i = period - 1; i >= 0; i--) {
      const d = subMonths(now, i);
      const key = format(startOfMonth(d), 'yyyy-MM');
      const label = format(d, 'MMM/yy', { locale: ptBR });
      const monthEps = episodes.filter(e => e.date.startsWith(key) && e.sleep);
      const avg = monthEps.length > 0
        ? monthEps.reduce((sum, e) => sum + e.sleep!.quality, 0) / monthEps.length
        : null;
      months.push({ label, avgQuality: avg ? parseFloat(avg.toFixed(1)) : null });
    }
    return months;
  }, [episodes, period]);

  const stats = useMemo(() => {
    const medications: Map<string, number> = new Map();
    const symptomCounts: Map<string, number> = new Map();
    const triggerCounts: Map<string, number> = new Map();
    let menstrualDays = 0;
    const counts: Record<PainLevel, number> = { light: 0, moderate: 0, severe: 0 };

    // Menstrual pain severity tracking
    const menstrualPainLevels: PainLevel[] = [];
    const nonMenstrualPainLevels: PainLevel[] = [];

    // Sleep tracking
    const sleepEntries: { quality: number; bedtime: string; wakeTime: string }[] = [];

    episodes.forEach(e => {
      counts[e.painLevel]++;
      if (e.isMenstrual) {
        menstrualDays++;
        menstrualPainLevels.push(e.painLevel);
      } else {
        nonMenstrualPainLevels.push(e.painLevel);
      }
      (e.medications || []).forEach(med => {
        if (med) medications.set(med, (medications.get(med) || 0) + 1);
      });
      e.symptoms.forEach(s => symptomCounts.set(s, (symptomCounts.get(s) || 0) + 1));
      (e.triggers || []).forEach(t => triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1));
      if (e.sleep) sleepEntries.push(e.sleep);
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

    // Sleep stats
    const avgSleepQuality = sleepEntries.length > 0
      ? sleepEntries.reduce((sum, e) => sum + e.quality, 0) / sleepEntries.length
      : null;

    // Menstrual correlation analysis
    const painScore = (level: PainLevel) => level === 'severe' ? 3 : level === 'moderate' ? 2 : 1;
    const avgMenstrualPain = menstrualPainLevels.length > 0
      ? menstrualPainLevels.reduce((sum, l) => sum + painScore(l), 0) / menstrualPainLevels.length
      : null;
    const avgNonMenstrualPain = nonMenstrualPainLevels.length > 0
      ? nonMenstrualPainLevels.reduce((sum, l) => sum + painScore(l), 0) / nonMenstrualPainLevels.length
      : null;

    let menstrualCorrelation: 'worse' | 'better' | 'similar' | null = null;
    if (avgMenstrualPain !== null && avgNonMenstrualPain !== null) {
      const diff = avgMenstrualPain - avgNonMenstrualPain;
      menstrualCorrelation = diff > 0.3 ? 'worse' : diff < -0.3 ? 'better' : 'similar';
    }

    // Sleep correlation with crises
    const sleepWithCrisis = episodes.filter(e => e.sleep);
    const badSleepCrises = sleepWithCrisis.filter(e => e.sleep!.quality <= 2).length;
    const goodSleepCrises = sleepWithCrisis.filter(e => e.sleep!.quality >= 4).length;

    // Monthly frequency trend
    const now = new Date();
    const firstHalf = chartData.slice(0, Math.ceil(chartData.length / 2));
    const secondHalf = chartData.slice(Math.ceil(chartData.length / 2));
    const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((s, m) => s + m.total, 0) / firstHalf.length : 0;
    const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((s, m) => s + m.total, 0) / secondHalf.length : 0;
    const trend: 'up' | 'down' | 'stable' = avgSecond > avgFirst + 0.5 ? 'up' : avgSecond < avgFirst - 0.5 ? 'down' : 'stable';

    return {
      counts, total, avg, menstrualDays, topMeds, topSymptoms, topTriggers, episodesWithNotes,
      avgSleepQuality, sleepCount: sleepEntries.length,
      menstrualCorrelation, menstrualPainLevels, nonMenstrualPainLevels,
      badSleepCrises, goodSleepCrises, sleepWithCrisisCount: sleepWithCrisis.length,
      trend, avgFirst, avgSecond,
    };
  }, [episodes, period, chartData]);

  const menstrualPct = stats.total > 0 ? Math.round((stats.menstrualDays / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border print:hidden">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold">Relatório Médico</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-20 print:max-w-none print:px-8 print:py-0" id="report-content">
        {/* Print header */}
        <div className="hidden print:block text-center mb-4 pt-4 border-b-2 border-foreground/20 pb-4">
          <h1 className="font-serif text-2xl font-bold">Relatório Médico — Diário de Enxaqueca</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Período: últimos {period} meses • Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total de registros: {stats.total} episódio{stats.total !== 1 ? 's' : ''} • Média mensal: {stats.avg} crises/mês
          </p>
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

        {/* 1. Overview + Trend */}
        <Section delay={0}>
          <SectionTitle icon={<AlertTriangle className="w-4 h-4 text-pain-moderate" />}>
            Visão Geral — Últimos {period} Meses
          </SectionTitle>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold font-serif">{stats.total}</div>
              <div className="text-[10px] text-muted-foreground">Total</div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xl font-bold font-serif">{stats.avg}</div>
              <div className="text-[10px] text-muted-foreground">Média/mês</div>
            </div>
            <div className="bg-pain-severe-bg rounded-xl p-3">
              <div className="text-2xl font-bold font-serif">{stats.counts.severe}</div>
              <div className="text-[10px] text-muted-foreground">Graves</div>
            </div>
            <div className="bg-muted rounded-xl p-3 flex flex-col items-center justify-center">
              {stats.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-destructive" />
              ) : stats.trend === 'down' ? (
                <TrendingDown className="w-5 h-5 text-green-600" />
              ) : (
                <Minus className="w-5 h-5 text-muted-foreground" />
              )}
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {stats.trend === 'up' ? 'Aumento' : stats.trend === 'down' ? 'Redução' : 'Estável'}
              </div>
            </div>
          </div>

          {/* Pain level breakdown */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(['light', 'moderate', 'severe'] as PainLevel[]).map(level => (
              <div key={level} className={`rounded-lg p-2 text-center ${
                level === 'light' ? 'bg-pain-light-bg' :
                level === 'moderate' ? 'bg-pain-moderate-bg' : 'bg-pain-severe-bg'
              }`}>
                <div className="text-lg font-bold font-serif">{stats.counts[level]}</div>
                <div className="text-[10px]">{PAIN_LABELS[level]}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* 2. Chart: Crises per month */}
        {stats.total > 0 && (
          <Section delay={0.05}>
            <SectionTitle icon={<BarChart3 className="w-4 h-4 text-primary" />}>
              Frequência Mensal de Crises
            </SectionTitle>
            <div className="h-48 print:h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={20} />
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="light" name="Leve" stackId="a" fill="hsl(45, 93%, 58%)" />
                  <Bar dataKey="moderate" name="Moderada" stackId="a" fill="hsl(25, 95%, 55%)" />
                  <Bar dataKey="severe" name="Grave" stackId="a" fill="hsl(0, 72%, 51%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Monthly frequency table for print */}
            <div className="hidden print:block mt-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-foreground/20">
                    <th className="text-left py-1">Mês</th>
                    <th className="text-center py-1">Leve</th>
                    <th className="text-center py-1">Moderada</th>
                    <th className="text-center py-1">Grave</th>
                    <th className="text-center py-1 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map(m => (
                    <tr key={m.key} className="border-b border-foreground/5">
                      <td className="py-1">{m.label}</td>
                      <td className="text-center py-1">{m.light}</td>
                      <td className="text-center py-1">{m.moderate}</td>
                      <td className="text-center py-1">{m.severe}</td>
                      <td className="text-center py-1 font-bold">{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* 3. Top Triggers */}
        {stats.topTriggers.length > 0 && (
          <Section delay={0.1}>
            <SectionTitle icon={<Zap className="w-4 h-4 text-primary" />}>
              Gatilhos Identificados
            </SectionTitle>
            {/* Top 3 highlighted */}
            <div className="space-y-3 mb-3">
              {stats.topTriggers.slice(0, 3).map(({ id, label, count, pct }, i) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary w-6">{i + 1}º</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs font-bold text-primary">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{count}x</span>
                </div>
              ))}
            </div>
            {/* Remaining triggers */}
            {stats.topTriggers.length > 3 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                {stats.topTriggers.slice(3).map(({ id, label, count, pct }) => (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                    {label} <span className="font-bold">{count}x</span> ({pct}%)
                  </span>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* 4. Medications */}
        {stats.topMeds.length > 0 && (
          <Section delay={0.15}>
            <SectionTitle icon={<Pill className="w-4 h-4 text-primary" />}>
              Medicações Utilizadas
            </SectionTitle>
            <div className="space-y-1.5">
              {stats.topMeds.map(([med, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={med} className="flex justify-between items-center bg-muted rounded-lg px-3 py-2">
                    <span className="text-sm">{med}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{pct}% das crises</span>
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{count}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* 5. Symptoms */}
        {stats.topSymptoms.length > 0 && (
          <Section delay={0.2} className="bg-symptom-bg border-symptom/20">
            <SectionTitle icon={<Activity className="w-4 h-4 text-symptom" />}>
              Sintomas Associados
            </SectionTitle>
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
          </Section>
        )}

        {/* 6. Menstrual Correlation — expanded analysis */}
        {stats.menstrualDays > 0 && (
          <Section delay={0.25} className="bg-menstrual-bg border-menstrual/20">
            <SectionTitle icon={<Droplets className="w-4 h-4 text-menstrual" />}>
              Correlação com Ciclo Menstrual
            </SectionTitle>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">{stats.menstrualDays}</span> de {stats.total} crises ({menstrualPct}%) ocorreram durante o período menstrual.
              </p>
              {stats.menstrualCorrelation && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  stats.menstrualCorrelation === 'worse' ? 'bg-destructive/10 text-destructive' :
                  stats.menstrualCorrelation === 'better' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {stats.menstrualCorrelation === 'worse' ? (
                    <><TrendingUp className="w-4 h-4" /> Crises tendem a ser mais intensas durante a menstruação.</>
                  ) : stats.menstrualCorrelation === 'better' ? (
                    <><TrendingDown className="w-4 h-4" /> Crises tendem a ser menos intensas durante a menstruação.</>
                  ) : (
                    <><Minus className="w-4 h-4" /> Intensidade das crises é similar dentro e fora do período menstrual.</>
                  )}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* 7. Sleep Correlation */}
        {stats.sleepCount > 0 && (
          <Section delay={0.28}>
            <SectionTitle icon={<Moon className="w-4 h-4 text-primary" />}>
              Correlação com Sono
            </SectionTitle>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted rounded-lg p-2.5">
                  <div className="text-xl font-bold font-serif text-primary">{stats.avgSleepQuality?.toFixed(1)}</div>
                  <div className="text-[10px] text-muted-foreground">Qualidade média (/5)</div>
                </div>
                <div className="bg-destructive/10 rounded-lg p-2.5">
                  <div className="text-xl font-bold font-serif text-destructive">{stats.badSleepCrises}</div>
                  <div className="text-[10px] text-muted-foreground">Crises c/ sono ruim</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-2.5">
                  <div className="text-xl font-bold font-serif text-green-700 dark:text-green-400">{stats.goodSleepCrises}</div>
                  <div className="text-[10px] text-muted-foreground">Crises c/ sono bom</div>
                </div>
              </div>

              {/* Sleep quality trend chart */}
              {sleepChartData.some(d => d.avgQuality !== null) && (
                <div className="h-32 print:h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sleepChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} width={20} />
                      <Tooltip formatter={(v: number) => [`${v}/5`, 'Qualidade']} />
                      <Line type="monotone" dataKey="avgQuality" name="Qualidade" stroke="hsl(220, 60%, 45%)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {stats.sleepWithCrisisCount > 0 && stats.badSleepCrises > 0 && (
                <p className="text-xs text-muted-foreground">
                  Em {Math.round((stats.badSleepCrises / stats.sleepWithCrisisCount) * 100)}% dos episódios com registro de sono,
                  a qualidade foi avaliada como ruim ou péssima (≤ 2/5).
                </p>
              )}
            </div>
          </Section>
        )}

        {/* 8. Patient Notes — transcribed */}
        {stats.episodesWithNotes.length > 0 && (
          <Section delay={0.3}>
            <SectionTitle icon={<StickyNote className="w-4 h-4 text-muted-foreground" />}>
              Observações do Paciente
            </SectionTitle>
            <div className="space-y-1.5">
              {stats.episodesWithNotes.map(ep => (
                <div key={ep.id} className="flex gap-2 items-baseline bg-muted rounded-lg px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {format(parseISO(ep.date), "dd/MM/yy", { locale: ptBR })}
                  </span>
                  <span className="text-xs text-muted-foreground">—</span>
                  <span className="text-sm italic">"{ep.notes}"</span>
                  <span className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">
                    ({PAIN_LABELS[ep.painLevel]})
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Print footer */}
        <div className="hidden print:block text-center text-[10px] text-muted-foreground border-t border-foreground/20 pt-3 mt-6">
          <p>Relatório gerado automaticamente pelo aplicativo Diário de Enxaqueca</p>
          <p>Este documento é informativo e deve ser analisado em conjunto com avaliação médica.</p>
        </div>

        {/* Export button */}
        <div className="print:hidden">
          <Button onClick={() => window.print()} className="w-full gap-2" size="lg">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Salve como PDF para enviar por WhatsApp ou e-mail ao seu médico
          </p>
        </div>
      </main>
    </div>
  );
};

export default Report;
