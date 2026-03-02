import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';
import { QUERY_KEYS } from '@/src/lib/constants';
import type { Tables } from '@/src/types/database';

export interface ArchiveItem extends Tables<'monthly_bests'> {
  photos: Pick<Tables<'photos'>, 'id' | 'storage_path' | 'caption'> | null;
}

export function useArchive() {
  const { user } = useAuth();

  const archiveQuery = useQuery<ArchiveItem[]>({
    queryKey: QUERY_KEYS.archive(user?.id),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('monthly_bests')
        .select('*, photos(id, storage_path, caption)')
        .eq('user_id', user.id)
        .eq('is_confirmed', true)
        .order('month', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ArchiveItem[];
    },
    enabled: !!user,
  });

  return {
    archive: archiveQuery.data ?? [],
    isLoading: archiveQuery.isLoading,
  };
}
