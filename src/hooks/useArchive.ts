import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { usePair } from './usePair';

export function useArchive() {
  const { pair } = usePair();

  const archiveQuery = useQuery<any[]>({
    queryKey: ['archive', pair?.id],
    queryFn: async () => {
      if (!pair) return [];
      const { data, error } = await supabase
        .from('monthly_bests')
        .select('*, photos(*, profiles!user_id(display_name, avatar_url))')
        .eq('pair_id', pair.id)
        .eq('is_confirmed', true)
        .order('month', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!pair,
  });

  return {
    archive: archiveQuery.data ?? [],
    isLoading: archiveQuery.isLoading,
  };
}

export function useArchiveMonth(month: string | undefined) {
  const { pair } = usePair();

  return useQuery<any[]>({
    queryKey: ['archive', pair?.id, month],
    queryFn: async () => {
      if (!pair || !month) return [];
      const { data, error } = await supabase
        .from('monthly_bests')
        .select('*, photos(*, profiles!user_id(display_name, avatar_url))')
        .eq('pair_id', pair.id)
        .eq('month', month)
        .eq('is_confirmed', true);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!pair && !!month,
  });
}
