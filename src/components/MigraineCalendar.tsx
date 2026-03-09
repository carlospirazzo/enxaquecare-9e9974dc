import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { MigraineEpisode, PainLevel } from '@/types/migraine';

interface MigraineCalendarProps {
  year: number;
  month: number;
  episodes: MigraineEpisode[];
  onDayClick: (date: Date) => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const painBgClass: Record<PainLevel, string> = {
  light: 'bg-pain-light-bg',
  moderate: 'bg-pain-moderate-bg',
  severe: 'bg-pain-severe-bg',
};

const painDotClass: Record<PainLevel, string> = {
  light: 'bg-pain-light',
  moderate: 'bg-pain-moderate',
  severe: 'bg-pain-severe',
};

export function MigraineCalendar({ year, month, episodes, onDayClick }: MigraineCalendarProps) {
  const days = useMemo(() => {
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  }, [year, month]);

  const firstDayOfWeek = getDay(days[0]);

  const episodeMap = useMemo(() => {
    const map = new Map<string, MigraineEpisode>();
    episodes.forEach(e => map.set(e.date, e));
    return map;
  }, [episodes]);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const episode = episodeMap.get(dateStr);
          const today = isToday(day);
          const future = isFuture(day);

          return (
            <motion.button
              key={dateStr}
              whileTap={{ scale: 0.92 }}
              onClick={() => !future && onDayClick(day)}
              disabled={future}
              className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all
                ${future ? 'opacity-30 cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-primary/20'}
                ${today ? 'ring-2 ring-primary/40' : ''}
                ${episode ? painBgClass[episode.painLevel] : 'bg-transparent'}
              `}
            >
              <span className={`font-medium ${episode ? 'text-foreground' : 'text-foreground/70'}`}>
                {day.getDate()}
              </span>
              {episode && (
                <div className="flex gap-0.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${painDotClass[episode.painLevel]}`} />
                  {episode.isMenstrual && (
                    <span className="w-1.5 h-1.5 rounded-full bg-menstrual" />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
