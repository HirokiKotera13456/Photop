import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';
import { usePair } from './usePair';
import { formatMonth } from '@/src/lib/utils';
import type { Tables } from '@/src/types/database';

export function useMonthlyBest() {
  const { user } = useAuth();
  const { pair } = usePair();
  const queryClient = useQueryClient();
  const currentMonth = formatMonth();

  const partnerPhotosQuery = useQuery<any[]>({
    queryKey: ['partner-photos', pair?.id, currentMonth],
    queryFn: async () => {
      if (!user || !pair) return [];
      const { data, error } = await supabase
        .from('photos')
        .select('*, profiles!user_id(display_name, avatar_url)')
        .eq('pair_id', pair.id)
        .eq('month', currentMonth)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!pair,
  });

  const mySelectionQuery = useQuery<Tables<'monthly_bests'> | null>({
    queryKey: ['my-best-selection', pair?.id, currentMonth],
    queryFn: async () => {
      if (!user || !pair) return null;
      const { data, error } = await supabase
        .from('monthly_bests')
        .select('*')
        .eq('pair_id', pair.id)
        .eq('selector_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!pair,
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
    partnerPhotos: partnerPhotosQuery.data ?? [],
    mySelection: mySelectionQuery.data,
    isLoading: partnerPhotosQuery.isLoading,
    selectBest,
  };
}
