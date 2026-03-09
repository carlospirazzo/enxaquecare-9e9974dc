import { useState, useCallback } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Brain, FileBarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MigraineCalendar } from '@/components/MigraineCalendar';
import { EpisodeForm } from '@/components/EpisodeForm';
import { MonthlySummary } from '@/components/MonthlySummary';
import { useMigraineStore } from '@/hooks/useMigraineStore';

const Index = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const { addEpisode, removeEpisode, getEpisode, getMonthEpisodes } = useMigraineStore();

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
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-xl font-bold leading-tight">Diário de Enxaqueca</h1>
            <p className="text-xs text-muted-foreground">Registre e acompanhe seus episódios</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/relatorio')} title="Relatório">
            <FileBarChart className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-20">
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
    </div>
  );
};

export default Index;
