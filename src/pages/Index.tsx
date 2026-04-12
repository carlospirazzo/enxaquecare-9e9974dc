import { useState, useCallback } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileBarChart, Sun, Moon, HelpCircle, CalendarDays, Pill, Heart, Moon as MoonIcon, BrainCircuit, Zap, FileText, Bell, Mail, DatabaseBackup, ScrollText, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoIcon from '@/assets/logo-icon.png';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MigraineCalendar } from '@/components/MigraineCalendar';
import { EpisodeForm } from '@/components/EpisodeForm';
import { MonthlySummary } from '@/components/MonthlySummary';
import { SmartNotifications } from '@/components/SmartNotifications';
import { DataMigration } from '@/components/DataMigration';

import { useMigraineStore } from '@/hooks/useMigraineStore';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useSubscription } from '@/hooks/useSubscription';

const instructions = [
  {
    icon: CalendarDays,
    title: 'Registrar um episódio',
    text: 'Toque em qualquer dia do calendário para abrir o formulário. Selecione a intensidade da dor (leve, moderada ou grave) e preencha os detalhes.',
  },
  {
    icon: Pill,
    title: 'Medicações',
    text: 'Adicione um ou mais medicamentos usados no episódio. Use o botão "+ Adicionar medicamento" para incluir vários.',
  },
  {
    icon: Zap,
    title: 'Sintomas e Gatilhos',
    text: 'Selecione os sintomas associados e abra a seção "Gatilhos" para marcar possíveis causas. Você também pode digitar gatilhos personalizados.',
  },
  {
    icon: MoonIcon,
    title: 'Diário de Sono',
    text: 'Expanda "Diário de Sono" para registrar horário de dormir/acordar e avaliar a qualidade do sono de 1 a 5 estrelas.',
  },
  {
    icon: Heart,
    title: 'Bem-estar do dia',
    text: 'Expanda "Bem-estar do dia" para um check-up rápido: qualidade do sono, nível de estresse, hidratação e se pulou refeição.',
  },
  {
    icon: BrainCircuit,
    title: 'Período menstrual',
    text: 'Marque a caixa "Período menstrual" para correlacionar crises com o ciclo. O relatório mostrará se há piora nesses dias.',
  },
  {
    icon: FileText,
    title: 'Relatório médico',
    text: 'Toque no ícone de gráfico no header para ver o relatório completo com frequência de crises, top gatilhos, correlações e gráficos. Exporte em PDF para levar ao médico.',
  },
  {
    icon: Bell,
    title: 'Notificações inteligentes',
    text: 'O app lembrará você de registrar o sono pela manhã e perguntará como está se não registrar crises por 3 dias.',
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { trialDaysLeft, status } = useSubscription();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [migrationOpen, setMigrationOpen] = useState(false);


  const { episodes, addEpisode, removeEpisode, importEpisodes, getEpisode, getMonthEpisodes } = useMigraineStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthEpisodes = getMonthEpisodes(year, month);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setFormOpen(true);
  }, []);

  const existingEpisode = selectedDate
    ? getEpisode(format(selectedDate, 'yyyy-MM-dd'))
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <img src={logoIcon} alt="EnxaqueCare logo" className="w-9 h-9 object-contain" />
          <div className="flex-1">
            <h1 className="font-serif text-xl font-bold leading-tight">EnxaqueCare</h1>
            <p className="text-xs text-muted-foreground">Registre e acompanhe seus episódios</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setHelpOpen(true)} title="Instruções de uso">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMigrationOpen(true)} title="Migrar dados">
            <DatabaseBackup className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = 'mailto:enxaquecare@gmail.com?subject=Suporte - Diário de Enxaqueca'}
            title="Suporte"
          >
            <Mail className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open('https://enxaquecare.com/termosdeuso', '_blank')} title="Termos de uso">
            <ScrollText className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleDark} title={isDark ? 'Modo claro' : 'Modo escuro'}>
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/relatorio')} title="Relatório">
            <FileBarChart className="w-5 h-5" />
          </Button>
        </div>
        {status === 'trial' && trialDaysLeft > 0 && (
          <div className="max-w-lg mx-auto px-4 pb-2">
            <div className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-lg text-center">
              ⏳ Teste gratuito: {trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Smart Notifications */}
        <SmartNotifications episodes={episodes} />

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(d => subMonths(d, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <motion.h2
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-lg font-semibold capitalize"
          >
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </motion.h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(d => addMonths(d, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: 'Leve', className: 'bg-pain-light' },
            { label: 'Moderada', className: 'bg-pain-moderate' },
            { label: 'Grave', className: 'bg-pain-severe' },
            { label: 'Menstruação', className: 'bg-menstrual' },
          ].map(({ label, className }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${className}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <MigraineCalendar
          year={year}
          month={month}
          episodes={monthEpisodes}
          onDayClick={handleDayClick}
        />

        {/* Summary */}
        <MonthlySummary episodes={monthEpisodes} />
      </main>

      {/* Episode Form Dialog */}
      <EpisodeForm
        date={selectedDate}
        existing={existingEpisode}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={addEpisode}
        onDelete={removeEpisode}
      />

      {/* Data Migration Dialog */}
      <DataMigration
        open={migrationOpen}
        onClose={() => setMigrationOpen(false)}
        episodes={episodes}
        onImport={importEpisodes}
      />


      {/* Instructions Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-md max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Instruções de Uso
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 max-h-[65vh]">
            <div className="space-y-4 pr-3">
              {instructions.map(({ icon: Icon, title, text }, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
