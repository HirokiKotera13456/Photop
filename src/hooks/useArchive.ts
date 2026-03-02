import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';

export function useArchive() {
  const { user } = useAuth();

  const archiveQuery = useQuery<any[]>({
    queryKey: ['archive', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('monthly_bests')
        .select('*, photos(*)')
        .eq('user_id', user.id)
        .eq('is_confirmed', true)
        .order('month', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return {
    archive: archiveQuery.data ?? [],
    isLoading: archiveQuery.isLoading,
  };
}
