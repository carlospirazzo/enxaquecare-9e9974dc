import { useState, useEffect, useCallback } from 'react';
import { subMonths, format } from 'date-fns';
import type { MigraineEpisode } from '@/types/migraine';

const STORAGE_KEY = 'migraine-episodes';

function loadEpisodes(): MigraineEpisode[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const episodes = data ? JSON.parse(data) : [];
    // Migrate old episodes without triggers
    return episodes.map((e: any) => ({ ...e, triggers: e.triggers || [] }));
  } catch {
    return [];
  }
}

function saveEpisodes(episodes: MigraineEpisode[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(episodes));
}

export function useMigraineStore() {
  const [episodes, setEpisodes] = useState<MigraineEpisode[]>(loadEpisodes);

  useEffect(() => {
    saveEpisodes(episodes);
  }, [episodes]);

  const addEpisode = useCallback((episode: MigraineEpisode) => {
    setEpisodes(prev => {
      const filtered = prev.filter(e => e.date !== episode.date);
      return [...filtered, episode];
    });
  }, []);

  const removeEpisode = useCallback((date: string) => {
    setEpisodes(prev => prev.filter(e => e.date !== date));
  }, []);

  const getEpisode = useCallback((date: string) => {
    return episodes.find(e => e.date === date);
  }, [episodes]);

  const getMonthEpisodes = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return episodes.filter(e => e.date.startsWith(prefix));
  }, [episodes]);

  const getPeriodsEpisodes = useCallback((months: number) => {
    const now = new Date();
    const cutoff = format(subMonths(now, months), 'yyyy-MM-dd');
    return episodes.filter(e => e.date >= cutoff).sort((a, b) => a.date.localeCompare(b.date));
  }, [episodes]);

  return { episodes, addEpisode, removeEpisode, getEpisode, getMonthEpisodes, getPeriodsEpisodes };
}
