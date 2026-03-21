import { useEffect, useCallback, useState } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';
import type { MigraineEpisode } from '@/types/migraine';

const SLEEP_REMINDER_KEY = 'migraine-sleep-reminder-dismissed';
const INACTIVE_REMINDER_KEY = 'migraine-inactive-reminder-dismissed';
const MED_OVERUSE_KEY = 'migraine-med-overuse-dismissed';
const INACTIVE_DAYS_THRESHOLD = 3;
const MED_OVERUSE_DAYS_THRESHOLD = 15;

interface Notification {
  id: string;
  type: 'sleep' | 'inactive' | 'med_overuse';
  title: string;
  message: string;
}

export function useSmartNotifications(episodes: MigraineEpisode[]) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const active: Notification[] = [];
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = new Date();
    const hour = now.getHours();

    // Sleep reminder: show between 5am-11am if not dismissed today
    if (hour >= 5 && hour < 11) {
      const dismissed = localStorage.getItem(SLEEP_REMINDER_KEY);
      if (dismissed !== today) {
        active.push({
          id: 'sleep',
          type: 'sleep',
          title: '🌙 Diário de Sono',
          message: 'Bom dia! Não esqueça de registrar como foi seu sono esta noite.',
        });
      }
    }

    // Inactivity check: no episode logged in 3+ days
    if (episodes.length > 0) {
      const lastDate = [...episodes].sort((a, b) => b.date.localeCompare(a.date))[0].date;
      const daysSince = differenceInDays(now, parseISO(lastDate));

      if (daysSince >= INACTIVE_DAYS_THRESHOLD) {
        const dismissed = localStorage.getItem(INACTIVE_REMINDER_KEY);
        if (dismissed !== today) {
          active.push({
            id: 'inactive',
            type: 'inactive',
            title: '💬 Como você está?',
            message: `Você não registra uma crise há ${daysSince} dias. Está tudo bem? Se sim, ótimo! 🎉`,
          });
        }
      }
    }

    setNotifications(active);
  }, [episodes]);

  const dismiss = useCallback((id: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (id === 'sleep') localStorage.setItem(SLEEP_REMINDER_KEY, today);
    if (id === 'inactive') localStorage.setItem(INACTIVE_REMINDER_KEY, today);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, dismiss };
}
