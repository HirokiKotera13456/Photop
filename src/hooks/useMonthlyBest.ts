import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';
import { formatMonth } from '@/src/lib/utils';
import { QUERY_KEYS } from '@/src/lib/constants';
import type { Tables } from '@/src/types/database';

export function useMonthlyBest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const currentMonth = formatMonth();

  const myPhotosQuery = useQuery<Tables<'photos'>[]>({
    queryKey: QUERY_KEYS.monthlyBest.photos(user?.id, currentMonth),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const mySelectionQuery = useQuery<Tables<'monthly_bests'> | null>({
    queryKey: QUERY_KEYS.monthlyBest.selection(user?.id, currentMonth),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('monthly_bests')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const selectBest = useMutation({
    mutationFn: async (photoId: string) => {
      const { data, error } = await supabase.rpc('select_monthly_best', {
        p_photo_id: photoId,
      });
      if (error) throw error;
      return data as unknown as { best_id: string; photo_id: string; month: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-best-selection'] });
    },
  });

  return {
    myPhotos: myPhotosQuery.data ?? [],
    mySelection: mySelectionQuery.data,
    isLoading: myPhotosQuery.isLoading,
    selectBest,
  };
}
