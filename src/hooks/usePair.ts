import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/src/types/database';

export function usePair() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const pairQuery = useQuery<Tables<'pairs'> | null>({
    queryKey: ['pair', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('pairs')
        .select('*')
        .eq('status', 'active')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const partnerId =
    pairQuery.data && user
      ? pairQuery.data.user_a_id === user.id
        ? pairQuery.data.user_b_id
        : pairQuery.data.user_a_id
      : null;

  const partnerQuery = useQuery<Tables<'profiles'> | null>({
    queryKey: ['partner', partnerId],
    queryFn: async () => {
      if (!partnerId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!partnerId,
  });

  const generateInviteCode = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('generate_invite_code');
      if (error) throw error;
      return data as unknown as { pair_id: string; invite_code: string; expires_at: string };
    },
  });

  const joinPair = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.rpc('join_pair', { code });
      if (error) throw error;
      return data as unknown as { pair_id: string; partner_id: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pair'] });
    },
  });

  const dissolvePair = useMutation({
    mutationFn: async () => {
      if (!pairQuery.data) throw new Error('ペアがありません');
      const { error } = await supabase
        .from('pairs')
        .update({ status: 'dissolved' })
        .eq('id', pairQuery.data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pair'] });
    },
  });

  return {
    pair: pairQuery.data,
    partner: partnerQuery.data,
    isLoading: pairQuery.isLoading,
    hasPair: !!pairQuery.data,
    generateInviteCode,
    joinPair,
    dissolvePair,
  };
}
