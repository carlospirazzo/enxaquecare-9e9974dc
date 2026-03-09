import { useState, useEffect, useCallback } from 'react';
import type { MigraineEpisode } from '@/types/migraine';

const STORAGE_KEY = 'migraine-episodes';

function loadEpisodes(): MigraineEpisode[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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

  return { episodes, addEpisode, removeEpisode, getEpisode, getMonthEpisodes };
}
