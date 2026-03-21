import { useState, useEffect, useCallback } from 'react';
import { subMonths, format } from 'date-fns';
import type { MigraineEpisode } from '@/types/migraine';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'migraine-episodes';

function toDbRow(episode: MigraineEpisode, userId: string): any {
  return {
    user_id: userId,
    date: episode.date,
    pain_level: episode.painLevel,
    medications: episode.medications as any,
    is_menstrual: episode.isMenstrual,
    symptoms: episode.symptoms as any,
    triggers: episode.triggers as any,
    notes: episode.notes,
    sleep: (episode.sleep ?? null) as any,
    wellbeing: (episode.wellbeing ?? null) as any,
  };
}

function fromDbRow(row: any): MigraineEpisode {
  return {
    id: row.id,
    date: row.date,
    painLevel: row.pain_level,
    medications: row.medications ?? [],
    isMenstrual: row.is_menstrual,
    symptoms: row.symptoms ?? [],
    triggers: row.triggers ?? [],
    notes: row.notes ?? '',
    sleep: row.sleep ?? undefined,
    wellbeing: row.wellbeing ?? undefined,
  };
}

export function useMigraineStore() {
  const { user } = useAuth();
  const [episodes, setEpisodes] = useState<MigraineEpisode[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load episodes from DB
  useEffect(() => {
    if (!user) {
      setEpisodes([]);
      setLoaded(false);
      return;
    }

    const fetchEpisodes = async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading episodes:', error);
        return;
      }

      const dbEpisodes = (data ?? []).map(fromDbRow);

      // Migrate localStorage data if exists and DB is empty
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData && dbEpisodes.length === 0) {
        try {
          const localEpisodes: MigraineEpisode[] = JSON.parse(localData).map((e: any) => ({
            ...e,
            triggers: e.triggers || [],
            medications: e.medications || (e.medication ? [e.medication] : []),
          }));

          if (localEpisodes.length > 0) {
            const rows = localEpisodes.map(ep => toDbRow(ep, user.id));
            const { error: insertError } = await supabase.from('episodes').upsert(rows, { onConflict: 'user_id,date' });
            if (!insertError) {
              localStorage.removeItem(STORAGE_KEY);
              toast({ title: 'Dados migrados!', description: `${localEpisodes.length} episódios foram sincronizados com sua conta.` });
              // Re-fetch after migration
              const { data: refreshed } = await supabase.from('episodes').select('*').eq('user_id', user.id).order('date');
              setEpisodes((refreshed ?? []).map(fromDbRow));
              setLoaded(true);
              return;
            }
          }
        } catch {
          // Ignore parse errors
        }
      }

      setEpisodes(dbEpisodes);
      setLoaded(true);
    };

    fetchEpisodes();
  }, [user]);

  const addEpisode = useCallback(async (episode: MigraineEpisode) => {
    if (!user) return;
    const row = toDbRow(episode, user.id);
    const { data, error } = await supabase
      .from('episodes')
      .upsert(row, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }

    setEpisodes(prev => {
      const filtered = prev.filter(e => e.date !== episode.date);
      return [...filtered, fromDbRow(data)];
    });
  }, [user]);

  const removeEpisode = useCallback(async (date: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('episodes')
      .delete()
      .eq('user_id', user.id)
      .eq('date', date);

    if (error) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
      return;
    }

    setEpisodes(prev => prev.filter(e => e.date !== date));
  }, [user]);

  const importEpisodes = useCallback(async (imported: MigraineEpisode[]) => {
    if (!user) return;
    const migrated = imported.map((e: any) => ({
      ...e,
      triggers: e.triggers || [],
      medications: e.medications || (e.medication ? [e.medication] : []),
    }));

    const rows = migrated.map(ep => toDbRow(ep, user.id));
    const { error } = await supabase.from('episodes').upsert(rows, { onConflict: 'user_id,date' });

    if (error) {
      toast({ title: 'Erro na importação', description: error.message, variant: 'destructive' });
      return;
    }

    // Re-fetch all
    const { data } = await supabase.from('episodes').select('*').eq('user_id', user.id).order('date');
    setEpisodes((data ?? []).map(fromDbRow));
  }, [user]);

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

  return { episodes, addEpisode, removeEpisode, importEpisodes, getEpisode, getMonthEpisodes, getPeriodsEpisodes };
}
